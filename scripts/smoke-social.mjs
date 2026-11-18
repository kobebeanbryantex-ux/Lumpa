import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const chromePath = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
assert(existsSync(chromePath), "Set CHROME_PATH to a Chromium browser.");
mkdirSync("artifacts", { recursive: true });
const dir = mkdtempSync(resolve("artifacts/social-qa-"));
const externalTrial = process.env.LUMPA_SOCIAL_TEST_URL;
const origin = externalTrial ? new URL(externalTrial).origin : "http://127.0.0.1:4181";
const debuggerUrl = "http://127.0.0.1:9227";
const gamesOnly = process.argv.includes("--games-only");
const offlineOnly = process.argv.includes("--offline-only");
if (externalTrial && (!gamesOnly || !/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(origin))) {
  throw new Error("Use --games-only with an HTTPS Cloudflare trial URL.");
}
const service = externalTrial ? null : spawn(process.execPath, ["services/social/server.mjs"], {
  env: { ...process.env, LUMPA_SOCIAL_PORT: "4181", LUMPA_SOCIAL_DATA: join(dir, "server"), LUMPA_SOCIAL_PUBLIC_TEST: gamesOnly ? "1" : "0" },
  windowsHide: true,
  stdio: "inherit",
});
const chrome = spawn(chromePath, ["--headless", "--disable-gpu", "--remote-debugging-port=9227",
  `--user-data-dir=${join(dir, "chrome")}`, "about:blank"], { windowsHide: true, stdio: "ignore" });
const connections = [];
const diagnostics = [];

async function until(fn, why) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await fn()) return;
    await sleep(100);
  }
  throw new Error(why);
}
async function get(url) {
  try {
    const response = await fetch(url);
    return response.ok && response;
  } catch { return false; }
}
function session(url) {
  const ws = new WebSocket(url);
  connections.push(ws);
  const pending = new Map();
  let number = 0;
  ws.addEventListener("message", event => {
    const packet = JSON.parse(event.data);
    if (packet.method === "Runtime.exceptionThrown") diagnostics.push(packet.params.exceptionDetails.exception?.description || packet.params.exceptionDetails.text);
    if (packet.method === "Network.responseReceived" && packet.params.response.status >= 400) diagnostics.push(`${packet.params.response.status} ${packet.params.response.url}`);
    if (!pending.has(packet.id)) return;
    const { done, reject } = pending.get(packet.id);
    pending.delete(packet.id);
    if (packet.error) reject(new Error(packet.error.message));
    else done(packet.result);
  });
  return new Promise((done, reject) => {
    ws.addEventListener("error", reject, { once: true });
    ws.addEventListener("open", () => done((method, params, sessionId) => new Promise((resolveReply, rejectReply) => {
      const id = ++number;
      pending.set(id, { done: resolveReply, reject: rejectReply });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    })), { once: true });
  });
}
async function run() {
  await until(() => get(origin + "/friends.html"), "Social service did not serve the built room.");
  if (gamesOnly) assert.equal((await fetch(origin + "/index.html")).status, 404, "The isolated test service must only serve the browser guest experience.");
  await until(() => get(debuggerUrl + "/json/version"), "Chromium debugger did not start.");
  const version = await (await fetch(debuggerUrl + "/json/version")).json();
  const browser = await session(version.webSocketDebuggerUrl);
  async function open(url, width, context, desktop = false) {
    const browserContextId = context || (await browser("Target.createBrowserContext")).browserContextId;
    const { targetId } = await browser("Target.createTarget", { url: "about:blank", browserContextId });
    const { sessionId } = await browser("Target.attachToTarget", { targetId, flatten: true });
    const cmd = (method, params) => browser(method, params, sessionId);
    await cmd("Page.enable");
    await cmd("Runtime.enable");
    await cmd("Network.enable");
    if (desktop) await cmd("Page.addScriptToEvaluateOnNewDocument", { source: "window.__TAURI_INTERNALS__={invoke:async(command,args)=>{(window.nativeCalls||=[]).push({command,args});}}" });
    await cmd("Emulation.setDeviceMetricsOverride", { width, height: 760, deviceScaleFactor: 1, mobile: false });
    await cmd("Page.navigate", { url });
    const js = async (expression) => {
      const result = await cmd("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || expression);
      return result.result.value;
    };
    await until(() => js("Boolean(document.querySelector('#starter-pet')?.options.length)"), "Room JavaScript did not load.");
    return { cmd, js, browserContextId };
  }
  const has = (page, value) => page.js(`document.body.innerText.includes(${JSON.stringify(value)})`);
  async function click(page, value) {
    const clicked = await page.js(`(() => {
      const target = [...document.querySelectorAll('button')].find(node =>
        node.textContent.trim() === ${JSON.stringify(value)} && !node.disabled && !node.closest('[hidden], [inert]'));
      if (!target) return false;
      target.click();
      return true;
    })()`);
    assert(clicked, `Button unavailable: ${value}`);
  }
  async function challenge(sender, receiver, title) {
    await sender.js("document.querySelector('.avatar:not(.mine)').click()");
    await sender.js(`[...document.querySelectorAll('#panel-content .list-row')].find(row=>row.textContent.includes(${JSON.stringify(title)})).querySelector('button').click()`);
    await until(() => has(receiver, "接受邀请"), `${title} challenge did not arrive.`);
  }
  async function move(page, cell) {
    const target = `document.querySelectorAll('.square')[${cell}]`;
    await until(() => page.js(`Boolean(${target} && !${target}.disabled)`), "Board turn did not sync.");
    await page.js(`${target}.click()`);
  }
  async function assertWinner(winner, loser, length) {
    await until(() => has(winner, "你赢了！"), "Winning move did not finish the game.");
    await until(() => has(loser, "好友赢了这一局。"), "The other player did not receive the result.");
    for (const page of [winner, loser]) {
      assert.equal(await page.js("document.querySelectorAll('.square').length"), length);
      assert.equal(await page.js("document.querySelectorAll('.square:enabled').length"), 0, "Ended boards must be locked.");
    }
  }
  const a = await open(origin + "/friends.html", 1280);
  if (offlineOnly) {
    await until(() => a.js("document.querySelectorAll('.mine').length === 1 && document.querySelector('#welcome').hidden"), "Offline personal park did not open automatically.");
    await a.cmd("Network.enable");
    await a.cmd("Network.setBlockedURLs", { urls: ["*://*/social/ws", "*://*/social/files*"] });
    await a.js("document.querySelector('#park-edit').click()");
    await a.js(`(() => {const floor=[...document.querySelectorAll('.park-field')].find(row=>row.innerText.startsWith('地板')).querySelector('select');floor.value='walnut';floor.dispatchEvent(new Event('change'));})()`);
    await click(a, "保存布置");
    assert(await a.js("document.querySelector('#terrace').dataset.floor === 'walnut'"));
    await a.cmd("Page.reload");
    await until(() => a.js("document.querySelector('#terrace')?.dataset.floor==='walnut' && document.querySelectorAll('.mine').length===1"), "Offline layout did not survive reload.");
    await a.js("document.querySelector('#my-pet').click()");
    assert(await a.js("document.querySelectorAll('.pet-card').length === document.querySelector('#starter-pet').options.length"));
    await a.js("document.querySelector('[data-pet=dog_corgi_golden]').click()");
    await a.js("document.querySelector('#focus-toggle').click()");
    await a.js("document.querySelector('input[aria-label=添加待办]').value='完成离线测试'; document.querySelector('input[aria-label=添加待办]').form.requestSubmit()");
    await until(() => has(a, "完成离线测试"), "Offline todo failed.");
    await a.js("document.querySelector('.park-todo input').click()");
    await until(() => has(a, "收到礼物"), "Offline reward failed.");
    await click(a, "开始专注");
    await until(() => has(a, "提前结束"), "Offline focus timer failed.");
    const focusKey = "lumpa.sharedFocusSession.v1";
    const snapshot = JSON.parse(await a.js(`localStorage.getItem('${focusKey}')`));
    assert.equal(snapshot.pet, "dog_corgi_golden");
    assert.equal(snapshot.state, "focusing");
    const shared = await open(origin + "/friends.html", 880, a.browserContextId);
    await until(() => shared.js("document.querySelector('#focus-mini')?.textContent.includes('专注中')"), "The second window did not share the timer.");
    await a.cmd("Page.reload");
    await until(() => a.js("document.querySelector('#focus-mini')?.textContent.includes('专注中')"), "Focus timer did not recover after reload.");
    await a.js("document.querySelector('#focus-toggle').click()");
    await click(a, "提前结束");
    await until(() => has(a, "开始专注"), "Abandon did not recover focus controls.");
    const before = JSON.parse(await a.js("localStorage.getItem('lumpaFocusStatsV1')")).completedSessions;
    await click(a, "开始专注");
    await until(() => a.js(`JSON.parse(localStorage.getItem('${focusKey}')).state==='focusing'`), "The second focus session did not start.");
    await a.js(`(() => {const key='${focusKey}';const state=JSON.parse(localStorage.getItem(key));state.end=Date.now()-1;localStorage.setItem(key,JSON.stringify(state));})()`);
    await until(() => a.js(`JSON.parse(localStorage.getItem('${focusKey}')).state==='reward'`), "The shared timer did not settle.");
    await sleep(1100);
    assert.equal(JSON.parse(await a.js("localStorage.getItem('lumpaFocusStatsV1')")).completedSessions, before + 1, "Multiple windows granted the same focus reward twice.");
    await a.cmd("Page.reload");
    await until(() => a.js("Boolean(document.querySelector('.mine'))"), "Park did not reload.");
    await sleep(600);
    assert.equal(JSON.parse(await a.js("localStorage.getItem('lumpaFocusStatsV1')")).completedSessions, before + 1, "Reload granted a settled reward again.");
    await a.cmd("Page.bringToFront");
    await until(() => a.js("[...document.querySelector('.mine canvas').getContext('2d').getImageData(0,0,128,128).data].some((v,i)=>i%4===3&&v>128)"), "The selected pet was invisible.");
    const initialShot = await a.cmd("Page.captureScreenshot", { format:"png" });
    writeFileSync(join(dir,"offline-home.png"),Buffer.from(initialShot.data,"base64"));
    const [x, y] = await a.js("(() => {const r=document.querySelector('.mine canvas').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2];})()");
    await a.cmd("Input.dispatchMouseEvent", { type:"mousePressed", x,y,button:"left",buttons:1,clickCount:1 });
    await a.cmd("Input.dispatchMouseEvent", { type:"mouseMoved",x:x+80,y:y-240,button:"left",buttons:1 });
    await a.cmd("Input.dispatchMouseEvent", { type:"mouseReleased",x:x+80,y:y-240,button:"left",buttons:0,clickCount:1 });
    assert(await a.js("parseFloat(document.querySelector('.mine').style.bottom)>180"), "The pet was confined to the floor.");
    const screenshot = await a.cmd("Page.captureScreenshot", { format:"png" });
    writeFileSync(join(dir,"offline-park.png"),Buffer.from(screenshot.data,"base64"));
    const desktop = await open(origin + "/friends.html", 560, null, true);
    await desktop.cmd("Emulation.setDefaultBackgroundColorOverride", {color:{r:0,g:0,b:0,a:0}});
    await desktop.cmd("Emulation.setDeviceMetricsOverride", {width:560,height:167,deviceScaleFactor:1,mobile:false});
    await until(() => desktop.js("Boolean(document.querySelector('.mine canvas')) && [...document.querySelector('.mine canvas').getContext('2d').getImageData(0,0,128,128).data].some((v,i)=>i%4===3&&v>128)"), "Desktop pet failed to render.");
    const compactShot = await desktop.cmd("Page.captureScreenshot", {format:"png",omitBackground:true});
    writeFileSync(join(dir,"desktop-corner.png"),Buffer.from(compactShot.data,"base64"));
    const [px, py] = await desktop.js("(() => {const r=document.querySelector('.mine canvas').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2];})()");
    await desktop.cmd("Input.dispatchMouseEvent", {type:"mousePressed",x:px,y:py,button:"left",buttons:1,clickCount:1});
    // Native window creation is checked in Rust; this browser preview verifies the hand-off request.
    await desktop.cmd("Input.dispatchMouseEvent", {type:"mouseMoved",x:px,y:py-50,button:"left",buttons:1});
    await desktop.cmd("Input.dispatchMouseEvent", {type:"mouseReleased",x:px,y:py-50,button:"left",buttons:0,clickCount:1});
    await until(() => desktop.js("window.nativeCalls?.some(call=>call.command==='open_park_pet')"), "Dragging upward did not detach the desktop pet.");
    console.log("Verified offline layout, visible pets, shared timer with one settlement, reload recovery, full-page drag, and the desktop detach request.");
    console.log(join(dir,"offline-park.png"));
    return;
  }
  await a.js("document.querySelector('#room-toggle').click()");
  await click(a, "连接好友");
  await a.js("document.querySelector('#nickname').value='松子'; document.querySelector('#starter-pet').value='dog_french_fawn'; document.querySelector('#connect-form').requestSubmit()");
  await until(() => has(a,"已联机"),"Host did not connect.");
  await until(() => a.js("document.querySelector('#room-title').textContent.includes('的桌面')"),"Host personal online desktop was not created.");
  await a.js("document.querySelector('#room-toggle').click()");
  await until(() => has(a, "建房"), "Host room creation form missing.");
  await a.js("document.querySelector('#panel-content input').value='晚风码头'; document.querySelector('#panel-content form').requestSubmit()");
  await until(() => has(a, "晚风码头"), "Host failed to create a room.");
  await click(a, "邀请好友");
  const invite = await a.js("document.querySelector('#invite-link').value");
  const roomCode = await a.js("document.querySelector('#invite-code').value");
  assert.match(roomCode, /^[23456789A-HJ-NP-Z]{4}(?:-[23456789A-HJ-NP-Z]{4}){2}$/);
  await a.js("document.querySelector('#panel-close').click()");
  const b = await open(gamesOnly ? origin + "/friends.html" : invite, 880);
  if (gamesOnly) { await b.js("document.querySelector('#room-toggle').click()"); await click(b, "连接好友"); }
  await b.js("document.querySelector('#nickname').value='白露'; document.querySelector('#starter-pet').value='dog_corgi_golden'; document.querySelector('#connect-form').requestSubmit()");
  if (gamesOnly) {
    await until(()=>has(b,"已联机"),"Guest did not connect.");
    await until(()=>b.js("document.querySelector('#room-title').textContent.includes('的桌面')"),"Guest desktop missing.");
    await b.js("document.querySelector('#room-toggle').click()");
    await until(() => b.js("Boolean(document.querySelector('.join-code-form input'))"), "Room code form is missing.");
    await b.js(`document.querySelector('.join-code-form input').value=${JSON.stringify(roomCode.toLowerCase())}; document.querySelector('.join-code-form').requestSubmit()`);
  }
  await until(() => has(a, "2 位伙伴"), "Guest did not join via browser invite.");
  await until(() => b.js("document.querySelectorAll('.avatar').length === 2"), "Guest did not receive room members.");
  async function playBothGames() {
    await challenge(a, b, "井字棋");
    await click(b, "婉拒");
    await until(() => has(a, "好友婉拒了对战邀请。"), "Declined challenge did not notify the sender.");
    await challenge(a, b, "井字棋");
    await click(b, "接受邀请");
    await until(() => b.js("document.querySelectorAll('.square').length === 9"), "Guest did not open the tic-tac-toe board.");
    assert.equal(await b.js("document.querySelectorAll('.square:enabled').length"), 0, "The invited player must wait for the first move.");
    await move(a, 0);
    await until(() => b.js("document.querySelector('.square').dataset.stone === '1'"), "The guest did not see the first move.");
    await a.js("document.querySelector('#panel-close').click(); document.querySelector('#room-toggle').click()");
    await click(a, "继续对局");
    assert.equal(await a.js("document.querySelector('.square').dataset.stone"), "1", "Resuming must keep the current board.");
    for (const [page, cell] of [[b, 3], [a, 1], [b, 4], [a, 2]]) await move(page, cell);
    await assertWinner(a, b, 9);
    for (const page of [a, b]) await page.js("document.querySelector('#panel-close').click()");
    await challenge(a, b, "五子棋");
    await click(b, "接受邀请");
    for (let column = 0; column < 5; column++) {
      await move(a, 112 + column);
      if (column < 4) await move(b, 127 + column);
    }
    await assertWinner(a, b, 225);
    for (const page of [a,b]) await page.js("document.querySelector('#panel-close').click()");
    await challenge(a,b,"象棋");
    await click(b,"接受邀请");
    await until(()=>b.js("document.querySelectorAll('.chess-square').length===90"),"Xiangqi board did not sync.");
    await a.js(`document.querySelector('[data-cell="54"]').click();document.querySelector('[data-cell="45"]').click()`);
    await until(()=>b.js(`document.querySelector('[data-cell="45"] .red')?.textContent==='兵'`),"Red pawn did not synchronize.");
    await b.js(`document.querySelector('[data-cell="27"]').click();document.querySelector('[data-cell="36"]').click()`);
    await until(()=>a.js(`document.querySelector('[data-cell="36"] .black')?.textContent==='卒'`),"Black pawn did not synchronize.");
    const shot=await a.cmd("Page.captureScreenshot",{format:"png"});writeFileSync(join(dir,"xiangqi.png"),Buffer.from(shot.data,"base64"));
    await click(b,"认输并结束");
    await until(()=>has(a,"你赢了！"),"Xiangqi resignation did not settle.");
    console.log("Verified invitations, turn order, synchronized moves, resume, win results and Xiangqi.");
  }
  if (gamesOnly) {
    await playBothGames();
    const duplicate = await open(origin + "/friends.html", 700);
    const sessionKey = `lumpa.social.${origin}.session`;
    const existing = await a.js(`localStorage.getItem(${JSON.stringify(sessionKey)})`);
    await duplicate.js(`localStorage.setItem(${JSON.stringify(sessionKey)}, ${JSON.stringify(existing)}); localStorage.setItem('lumpa.social.name','松子');`);
    await duplicate.cmd("Page.reload");
    await until(() => duplicate.js("Boolean(document.querySelector('.mine'))"), "Duplicate personal park did not load.");
    await duplicate.js("document.querySelector('#room-toggle').click()");
    await click(duplicate, "连接好友");
    await duplicate.js("document.querySelector('#connect-form').requestSubmit()");
    await until(() => has(a, "联机身份已在另一窗口使用"), "The replaced session was not detected.");
    assert(await a.js("document.querySelector('#welcome').hidden && !document.querySelector('#room-view').hidden && document.querySelector('#panel').hidden"),
      "A replaced session must return to the offline personal park.");
    await until(() => duplicate.js("document.querySelectorAll('.avatar').length === 2"), "The opened session lost the room.");
    console.log("Verified room code and replaced-window cleanup.");
    return;
  }
  assert.equal(await b.js("document.querySelector('#park-edit').hidden"), true, "Guests must not see the owner's edit controls.");
  await a.js("document.querySelector('#park-edit').click()");
  await a.js(`(() => {
    const floor = [...document.querySelectorAll('.park-field')].find(node=>node.innerText.startsWith("地板")).querySelector('select');
    floor.value = 'walnut'; floor.dispatchEvent(new Event('change'));
    document.querySelector('[aria-label="选择要添加的家具"]').value = 'bookcase';
    [...document.querySelectorAll('button')].find(node=>node.textContent === '添加家具').click();
    const gif = Uint8Array.from('47494638396101000100800000ff00000000ff21ff0b4e45545343415045322e30030100000021f904000a0000002c000000000100010000020244010021f904000a0000002c00000000010001000002024c01003b'.match(/../g), byte => parseInt(byte,16));
    const picker = document.querySelector('#panel-content input[type=file]');
    const file = new DataTransfer(); file.items.add(new File([gif], 'dusk.gif', {type:'image/gif'}));
    picker.files = file.files; picker.dispatchEvent(new Event('change'));
  })()`);
  const [pieceX, pieceY] = await a.js("(() => { const r=document.querySelector('.furniture-piece.bookcase').getBoundingClientRect(); return [r.x+r.width/2,r.y+r.height/2]; })()");
  await a.cmd("Input.dispatchMouseEvent", { type: "mousePressed", x: pieceX, y: pieceY, button: "left", buttons: 1, clickCount: 1 });
  await a.cmd("Input.dispatchMouseEvent", { type: "mouseMoved", x: pieceX - 122, y: pieceY, button: "left", buttons: 1 });
  await a.cmd("Input.dispatchMouseEvent", { type: "mouseReleased", x: pieceX - 122, y: pieceY, button: "left", buttons: 0, clickCount: 1 });
  await until(() => a.js("parseFloat(document.querySelector('.furniture-piece.bookcase').style.left) < 48"), "Furniture did not move when dragged.");
  await click(a, "保存布置");
  await until(() => b.js("document.querySelector('#terrace').dataset.floor==='walnut' && parseFloat(document.querySelector('.furniture-piece.bookcase')?.style.left)<48"), "Guest did not receive the saved floor and furniture.");
  await until(() => b.js("document.querySelector('#park-backdrop img')?.naturalWidth===1"), "Guest did not render the uploaded GIF.");
  await b.js("document.querySelector('#view-switch').click()");
  assert.equal(await b.js("getComputedStyle(document.querySelector('#park-backdrop')).display"), "none");
  await b.js("document.querySelector('#room-toggle').click()");
  await click(b, "应用背景到桌面");
  await until(() => b.js("document.body.classList.contains('desk-view') && document.querySelector('#park-backdrop img')?.naturalWidth===1"), "Desktop preview did not apply the selected park background.");
  await b.js("document.querySelector('#room-toggle').click()");
  await click(b, "关闭桌面背景");
  await b.js("document.querySelector('#view-switch').click()");
  await a.js("document.querySelector('#park-edit').click()");
  await a.js(`(async () => {
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#15423e'; ctx.fillRect(0,0,64,48);
    const blob = await new Promise(done => canvas.toBlob(done,'image/png'));
    const picker = document.querySelector('#panel-content input[type=file]');
    const transfer = new DataTransfer(); transfer.items.add(new File([blob],'park.png',{type:'image/png'}));
    picker.files = transfer.files; picker.dispatchEvent(new Event('change'));
  })()`);
  await click(a, "保存布置");
  await until(() => b.js("document.querySelector('#park-backdrop img')?.naturalWidth===64"), "The visitor could not load the uploaded PNG.");
  await a.js("document.querySelector('#park-edit').click()");
  await a.js(`(async () => {
    const canvas = document.createElement('canvas'); canvas.width = 48; canvas.height = 48;
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(20);
    const recorder = new MediaRecorder(stream, {mimeType:'video/webm'});
    const chunks = [];
    recorder.ondataavailable = event => chunks.push(event.data);
    const finished = new Promise(done => recorder.onstop=done);
    recorder.start();
    const clock = setInterval(() => { ctx.fillStyle='#143833'; ctx.fillRect(0,0,48,48); ctx.fillStyle='#ee9944'; ctx.fillRect(Date.now()%48,12,8,8); },40);
    await new Promise(done => setTimeout(done,380)); clearInterval(clock);
    recorder.stop(); await finished; stream.getTracks().forEach(track=>track.stop());
    const picker = document.querySelector('#panel-content input[type=file]');
    const transfer = new DataTransfer(); transfer.items.add(new File(chunks,'park.webm',{type:'video/webm'}));
    picker.files = transfer.files; picker.dispatchEvent(new Event('change'));
  })()`);
  await click(a, "保存布置");
  await until(() => b.js("(() => {const video = document.querySelector('#park-backdrop video');return video?.videoWidth === 48 && video.currentTime > 0 && video.loop && video.muted;})()"), "The guest background was not playing as a muted looping video.");
  await a.js(`(() => {document.querySelector('#park-edit').click();
    const backdrop = [...document.querySelectorAll('.park-field')].find(node=>node.innerText.startsWith("自带背景")).querySelector('select');
    backdrop.value='peach'; backdrop.dispatchEvent(new Event('change'));})()`);
  await click(a, "保存布置");
  await until(() => b.js("document.querySelector('#park-backdrop').dataset.backdrop==='peach' && !document.querySelector('#park-backdrop video')"), "Resetting the backdrop did not sync.");
  const [x, y] = await a.js("(() => { const r = document.querySelector('.mine canvas').getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2] })()");
  const before = await a.js("document.querySelector('.mine canvas').toDataURL()");
  await a.cmd("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", buttons: 1, clickCount: 1 });
  for (let i = 1; i <= 10; i++) {
    await a.cmd("Input.dispatchMouseEvent", { type: "mouseMoved", x: x + i * 29, y, button: "left", buttons: 1 });
    await sleep(34);
  }
  const during = await a.js("document.querySelector('.mine canvas').toDataURL()");
  assert.notEqual(during, before, "Dragging must change the displayed pose.");
  await a.cmd("Input.dispatchMouseEvent", { type: "mouseReleased", x: x + 290, y, button: "left", buttons: 0, clickCount: 1 });
  const left = await a.js("parseFloat(document.querySelector('.mine').style.left)");
  assert(left > 35, "Host did not actually walk across the room.");
  await until(() => b.js(`Math.abs(parseFloat(document.querySelector('.avatar:not(.mine)').style.left)-${left}) < 0.2`), "Guest did not converge to the same relative position.");
  await until(() => a.js(`document.querySelector('.mine canvas').toDataURL()===${JSON.stringify(before)}`), "The pet did not settle to its idle frame.");
  const screenshot = await a.cmd("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(dir, "room.png"), Buffer.from(screenshot.data, "base64"));
  await a.js("document.querySelector('#room-toggle').click()");
  await b.js("document.querySelector('#room-toggle').click()");
  const friendCode=await b.js("document.querySelector('#friend-code').value");
  assert.match(friendCode,/^[23456789A-HJ-NP-Z]{5}-[23456789A-HJ-NP-Z]{5}$/);
  await a.js(`document.querySelector('.friend-code-form input').value=${JSON.stringify(friendCode)};document.querySelector('.friend-code-form').requestSubmit()`);
  await until(() => has(b, "好友申请"), "Friend request did not arrive.");
  await click(b, "接受");
  await until(() => has(b, "互动"), "Friendship not accepted.");
  await click(b, "互动");
  await click(b, "打开私聊");
  await b.js("document.querySelector('#panel-content input').value='一起下棋吧'; document.querySelector('#panel-content form').requestSubmit()");
  await click(a,"互动");
  await click(a, "打开私聊");
  await until(() => has(a, "一起下棋吧"), "Private message did not arrive.");
  await a.js("(() => { const input = document.querySelector('input[type=file]'); const files = new DataTransfer(); files.items.add(new File(['works'], 'hello.txt')); input.files=files.files; input.dispatchEvent(new Event('change')); })()");
  await until(() => has(b, "hello.txt"), "File did not arrive in private chat.");
  const key = await b.js(`localStorage.getItem('lumpa.social.${origin}.session')`);
  const stored = JSON.parse((await import("node:fs")).readFileSync(join(dir, "server", "state.json"), "utf8"));
  const fileId = Object.keys(stored.attachments)[0];
  const fileUrl = origin + "/social/files/" + fileId;
  assert.equal(await (await fetch(fileUrl, { headers: { authorization: "Bearer " + key } })).text(), "works");
  assert.equal((await fetch(fileUrl)).status, 401);
  await click(a, "送出当前宠物");
  await until(() => has(b, "收下宠物"), "Pet gift did not arrive.");
  await click(b, "收下宠物");
  await until(() => has(b, "宠物已加入"), "Pet gift did not enter the collection.");
  await b.js("document.querySelector('#my-pet').click()");
  const choices = await b.js("document.querySelectorAll('.pet-card').length === document.querySelector('#starter-pet').options.length");
  assert(choices, "The room must expose the full pet catalog.");
  await until(() => b.js("[...document.querySelectorAll('.pet-card img')].every(img => img.complete && img.naturalWidth > 0)"), "A selectable pet is missing its preview.");
  assert(await b.js("document.querySelector('[data-pet=dog_french_fawn]').textContent.includes('已收入收藏')"));
  await a.js("document.querySelector('#room-toggle').click(); document.querySelector('#panel-content input').value='清晨书房'; document.querySelector('#panel-content form').requestSubmit()");
  await until(() => has(a, "清晨书房"), "Could not switch to a new room.");
  await until(() => has(b, "1 位伙伴"), "Old room presence was not removed.");
  await a.js("document.querySelector('#room-toggle').click()");
  await a.js("[...document.querySelectorAll('#panel-content .list-row')].find(row=>row.textContent.includes('晚风码头')).querySelector('button').click()");
  await until(() => has(b, "2 位伙伴"), "Could not return to a previously joined room.");
  console.log("Verified guest invite, park editing and permissions, GIF and looping video, desktop backdrop preference, pet catalog, synchronized walk and idle, friends, private chat, authenticated file, pet gift and room switching.");
  console.log(join(dir, "room.png"));
  await a.js("document.querySelector('#room-toggle').click()");
  await b.cmd("Page.reload");
  await until(()=>a.js("[...document.querySelectorAll('.list-row')].some(row=>row.textContent.includes('白露')&&row.textContent.includes('离线'))"),"Friend offline status did not update.");
  await until(()=>b.js("Boolean(document.querySelector('.mine'))"),"Guest did not reload.");
  await b.js("document.querySelector('#room-toggle').click()");await click(b,"连接好友");
  await b.js("document.querySelector('#connect-form').requestSubmit()");
  await until(()=>a.js("[...document.querySelectorAll('.list-row')].some(row=>row.textContent.includes('白露')&&row.textContent.includes('● 在线'))"),"Friend online status did not update.");
  await click(a,"邀请到桌面");
  await until(()=>has(b,"接受桌面邀请"),"Desktop invitation did not arrive.");
  await click(b,"接受桌面邀请");
  for(const page of [a,b]) await until(()=>page.js("document.querySelectorAll('.avatar').length===2&&document.body.classList.contains('desk-view')&&!document.body.classList.contains('park-full')"),"Accepted desktop invite opened the park instead of the desktop.");
  await b.js("document.querySelector('.door').click()");
  assert(await has(b,"进门串门"));
  await b.js("[...document.querySelectorAll('#panel-content .list-row')].find(row=>row.textContent.includes('晚风码头')).querySelector('button').click()");
  await until(()=>b.js("document.body.classList.contains('park-full')"),"The door did not open the visited park.");
  await a.js("document.querySelector('#room-toggle').click()");await click(a,"邀请到桌面");await until(()=>has(b,"接受桌面邀请"),"Second desktop invite missing.");await click(b,"接受桌面邀请");
  await until(()=>a.js("document.querySelectorAll('.avatar').length===2"),"Guest did not return to the desktop.");
  console.log("Verified friend codes, offline/online presence, direct desktop invitation, and door-based park visits.");
  await playBothGames();
}
try {
  await run();
} catch (error) {
  console.error([...new Set(diagnostics)].slice(0, 20));
  throw error;
} finally {
  for (const ws of connections) ws.close();
  chrome.kill();
  service?.kill();
}
