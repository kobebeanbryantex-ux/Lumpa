import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync,mkdtempSync,writeFileSync } from "node:fs";
import { resolve,join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
const exe=resolve(process.argv[2]||"src-tauri/target/release/rabbit-desk-pet.exe");
mkdirSync("artifacts",{recursive:true});
const dir=mkdtempSync(resolve("artifacts/native-park-qa-"));
const channels=[];let social,pet;
const app=spawn(exe,[],{windowsHide:false,stdio:"ignore",env:{...process.env,WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS:"--remote-debugging-port=9229 --remote-debugging-address=127.0.0.1",WEBVIEW2_USER_DATA_FOLDER:join(dir,"webview")}});
let chrome;
async function until(test,why,limit=200){for(let n=0;n<limit;n++){if(await test())return;await sleep(100);}throw new Error(why);}
async function get(url){try{const r=await fetch(url);return r.ok&&await r.json();}catch{return null;}}
async function attach(endpoint){
 const ws=new WebSocket(endpoint);channels.push(ws);const pending=new Map();let seq=0;
 const logs=[];
 ws.addEventListener("message",event=>{const packet=JSON.parse(event.data);if(packet.method==='Runtime.consoleAPICalled')logs.push(packet.params.args.map(arg=>arg.description||arg.value).join(' '));if(packet.method==='Runtime.exceptionThrown')logs.push(packet.params.exceptionDetails.exception?.description);const reply=pending.get(packet.id);if(!reply)return;pending.delete(packet.id);packet.error?reply.reject(new Error(packet.error.message)):reply.resolve(packet.result);});
 await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true});});
 const cmd=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Native debugger timed out: '+method));},30000);pending.set(id,{resolve:value=>{clearTimeout(timer);resolve(value);},reject:error=>{clearTimeout(timer);reject(error);}});ws.send(JSON.stringify({id,method,params}));});
 const js=async expression=>{const r=await cmd("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||expression);return r.result.value;};
 await cmd('Runtime.enable');
 return {cmd,js,logs};
}
async function target(fragment){const pages=await get("http://127.0.0.1:9229/json/list");return pages?.find(page=>page.url.includes(fragment));}
async function click(page,label){assert(await page.js(`(()=>{const button=[...document.querySelectorAll('button')].find(node=>node.textContent.trim()===${JSON.stringify(label)}&&!node.disabled&&!node.closest('[hidden]'));if(!button)return false;button.click();return true;})()`),`Missing button ${label}`);}
const invoke=(page,name,args={})=>page.js(`window.__TAURI_INTERNALS__.invoke(${JSON.stringify(name)},${JSON.stringify(args)})`);
const geometry=page=>invoke(page,"social_window_geometry");
try {
 await until(()=>target("friends.html"),"The native desktop park did not open automatically.");
 social=await attach((await target("friends.html")).webSocketDebuggerUrl);
 await until(()=>social.js("document.querySelector('#connection')?.textContent.includes('已联机')"),'Automatic native LAN startup failed.',400);
 if(process.env.LUMPA_QA_DISABLE_MAIN_TIMERS==='1') {
   const pages=await get('http://127.0.0.1:9229/json/list');const mainTarget=pages.find(page=>/tauri\.localhost\/(?:index\.html)?$/.test(page.url));
   if(mainTarget){const main=await attach(mainTarget.webSocketDebuggerUrl);await main.js('for(let timer=1;timer<10000;timer++)clearInterval(timer)');}
 }
 await until(()=>social.js("Boolean(document.querySelector('.mine'))&&document.body.classList.contains('native-pet-ready')"),"Native pet did not dock.");
 await until(()=>target("free-pet.html"),"The independent pet window is missing.");
 pet=await attach((await target("free-pet.html")).webSocketDebuggerUrl);
 await until(()=>pet.js("typeof document.querySelector('button').onpointerdown==='function'&&[...document.querySelector('canvas').getContext('2d').getImageData(0,0,144,144).data].some((v,i)=>i%4===3&&v>128)"),"The independent pet renderer did not become interactive.");
 if(process.env.LUMPA_QA_SETTLE_MS) await sleep(Number(process.env.LUMPA_QA_SETTLE_MS));
 const corner=await geometry(social);const area=corner.workArea;
 assert(Math.abs(corner.position.x+corner.size.width-(area.x+area.width))<=12*corner.scale,"The scene is not aligned to the right edge.");
 assert(Math.abs(corner.position.y+corner.size.height-(area.y+area.height))<=12*corner.scale,"The scene is not aligned to the bottom edge.");
 assert(corner.size.width/corner.scale<=561,"The compact scene is still too wide.");
 // Regression: the original focus page must remain reachable while the
 // independent scene is alive, including cross-window pet changes.
 await invoke(social,'show_main_window');
 await until(()=>target('index.html'),'The original main window did not open.');
 const main=await attach((await target('index.html')).webSocketDebuggerUrl);
 await until(()=>main.js("Boolean(window.LumpaApp)"),'Main UI did not finish loading.',300);
 await main.js("document.querySelector('[data-page-target=focus]').click()");
 await until(()=>main.js("document.body.dataset.page==='focus'&&document.querySelector('[data-page-view=focus]').classList.contains('active')&&document.querySelectorAll('#petArchetypeGrid .pet-archetype-card').length>10"),'The original focus page is still intercepted.');
 const focusShot=await main.cmd('Page.captureScreenshot',{format:'png'});
 writeFileSync(join(dir,'original-focus-page.png'),Buffer.from(focusShot.data,'base64'));
 for(const id of ['dog_corgi_golden','dog_french_fawn']) {
   await main.js(`document.querySelector('#petArchetypeGrid img[src*="${id}_idle"]').closest('.pet-archetype-card').click()`);
   await until(()=>pet.js(`localStorage.getItem('lumpa.freePet.pet')===${JSON.stringify(id)}`),'A main-window pet change did not reach the desktop pet.');
   await until(()=>social.js("document.body.classList.contains('native-pet-ready')"),'Changed pet did not report a drawn frame.');
 }
 // Regression: returning from a park clears any applied background and
 // actually restores the compact window, not only the label on its button.
 for(let attempt=0;attempt<3;attempt++) {
   await social.js("document.querySelector('#view-switch').click()");
   await until(async()=>{const g=await geometry(social);return g.size.height/g.scale>300;},'Park did not expand.');
   await social.js("window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))");
   await until(async()=>{const g=await geometry(social);return g.size.height/g.scale<=168;},'Park did not collapse.');
   await social.js("document.querySelector('#desktop-close').click()");
   await until(async()=>!(await geometry(social)).visible&&!(await geometry(pet)).visible,'Closing the park left a visible scene or pet.');
   await sleep(250);
   assert.equal((await geometry(pet)).visible,false,'A late docking callback resurrected the closed pet.');
   await main.js("document.querySelector('#socialLaunch').click()");
   await until(async()=>{const g=await geometry(pet);return g.visible&&await social.js("document.body.classList.contains('native-pet-ready')");},'Reopening the park lost its pet.');
 }
 await social.js("document.querySelector('#room-toggle').click()");
 await click(social,'应用背景到桌面');
 await until(()=>social.js("document.body.classList.contains('park-full')&&document.querySelector('#view-switch').textContent==='收回桌边'"),'Applied desktop background did not expose its return control.');
 await social.js("document.querySelector('#view-switch').click()");
 await until(async()=>!await social.js("document.body.classList.contains('park-full')")&&(await geometry(social)).size.height/(await geometry(social)).scale<=168,'Returning from an applied background left the window expanded.');
 await social.cmd('Page.reload');
 await until(()=>social.js("Boolean(document.querySelector('.mine'))&&document.body.classList.contains('native-pet-ready')&&document.querySelector('#connection').textContent.includes('已联机')"),'Reloading the scene left the pet blank or not online.');
 await until(()=>pet.js("typeof document.querySelector('button').onpointerdown==='function'"),'Pet lost its drag handler after reopening.');
 await invoke(main,'close_window');
 const original=await geometry(pet);
 const pixelRatio=await pet.js("devicePixelRatio");console.log('Native pet geometry',JSON.stringify({original,pixelRatio,inner:await pet.js('[innerWidth,innerHeight]')}));
 const before=await pet.js("document.querySelector('canvas').toDataURL()");
 await pet.js("window.qaEvents=[];for(const type of ['pointerdown','pointermove','pointerup'])window.addEventListener(type,event=>{if(window.qaEvents.length<80)window.qaEvents.push({time:Date.now(),type:event.type,x:event.clientX,y:event.clientY,screenX:event.screenX,screenY:event.screenY,button:event.button,target:event.target.tagName,url:location.href})})");
 await pet.js("window.qaSamples=[];const originalInvoke=window.__TAURI_INTERNALS__.invoke;window.__TAURI_INTERNALS__.invoke=async function(command,args,options){try{const value=await originalInvoke.call(this,command,args,options);if(['desktop_drag_sample','park_pet_position'].includes(command)&&window.qaSamples.length<200)window.qaSamples.push({command,value});return value;}catch(error){window.qaSamples.push({command,error:String(error)});throw error;}};");
 await social.js("window.qaMotion=[];window.addEventListener('storage',event=>{if(event.key==='lumpa.freePet.position'&&window.qaMotion.length<100)window.qaMotion.push(JSON.parse(event.newValue));})");
 const [buttonX,buttonY]=await pet.js("(()=>{const c=document.querySelector('canvas'),r=c.getBoundingClientRect(),data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let best=[72,104],score=Infinity;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const d=(x-72)**2+(y-104)**2;if(data[(y*c.width+x)*4+3]>220&&d<score){best=[x,y];score=d;}}return[r.x+(best[0]+.5)*r.width/c.width,r.y+(best[1]+.5)*r.height/c.height];})()");
 const fromX=Math.round(original.position.x+buttonX*pixelRatio),fromY=Math.round(original.position.y+buttonY*pixelRatio);
 const toX=Math.round(area.x+area.width*.47),toY=Math.round(area.y+area.height*.4);
 const input=spawn("powershell.exe",["-NoProfile","-ExecutionPolicy","Bypass","-File",resolve("scripts/qa-native-input.ps1"),"-ExpectedPid",String(app.pid),"-FromX",String(fromX),"-FromY",String(fromY),"-ToX",String(toX),"-ToY",String(toY)],{windowsHide:true,stdio:["ignore","inherit","inherit"]});
 await new Promise((resolve,reject)=>{input.once('error',reject);input.once('exit',code=>code===0?resolve():reject(new Error('Native input failed: '+code)));});
 await until(async()=>{const position=await geometry(pet);return position.position.y<corner.position.y-100*corner.scale;},"The native pet did not move outside the scene after the mouse drag.",150);
 const motion=await social.js("window.qaMotion");
 const animated=motion.some(sample=>sample.walking);
 const moved=await geometry(pet);
 writeFileSync(join(dir,"drag-debug.json"),JSON.stringify({corner,original,moved,inputExit:input.exitCode,events:await pet.js("window.qaEvents"),logs:pet.logs,motion,free:await social.js("localStorage.getItem('lumpa.freePet.free')"),position:await social.js("localStorage.getItem('lumpa.freePet.position')")},null,2));
 assert(moved.position.y<corner.position.y-100*corner.scale,"The pet was still confined to the scene window.");
 assert(Math.abs(moved.position.x-original.position.x)>150,"The actual native pet did not follow the mouse.");
 assert(animated,"The native drag did not animate the pet.");
 await pet.js("document.querySelector('button').dispatchEvent(new MouseEvent('dblclick'))");
 await until(()=>social.js("localStorage.getItem('lumpa.freePet.free')==='0'"),"Double-click did not return the pet home.");
 await sleep(500);
 for(let repeat=0;repeat<2;repeat++) {
   await until(async()=>{
     const position=await geometry(pet),parent=await geometry(social);
     return position.visible&&position.position.y>=parent.position.y&&await social.js("localStorage.getItem('lumpa.freePet.free')==='0'");
   },'Pet did not redock between repeated physical drags.');
   const position=await geometry(pet);
   const nextX=Math.round(area.width*(repeat ? .65 : .30)),nextY=Math.round(area.height*(repeat ? .5 : .3));
   const repeatInput=spawn('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',resolve('scripts/qa-native-input.ps1'),'-ExpectedPid',String(app.pid),'-FromX',String(Math.round(position.position.x+buttonX*pixelRatio)),'-FromY',String(Math.round(position.position.y+buttonY*pixelRatio)),'-ToX',String(nextX),'-ToY',String(nextY)],{windowsHide:true,stdio:['ignore','inherit','inherit']});
   await new Promise((resolve,reject)=>{repeatInput.once('error',reject);repeatInput.once('exit',code=>code===0?resolve():reject(new Error('Repeated native drag failed: '+code)));});
   await until(async()=>Math.abs((await geometry(pet)).position.y-position.position.y)>100,'A later drag was stuck.');
   await pet.js("document.querySelector('button').dispatchEvent(new MouseEvent('dblclick'))");
 }
 await social.js("document.querySelector('#room-toggle').click()");await click(social,"连接好友");
 await social.js("document.querySelector('#nickname').value='原生主机'");
 await click(social,"开启局域网房主");
 await until(()=>social.js("document.querySelector('#connection').textContent.includes('已联机')"),"The bundled LAN service did not start.",400);
 const info=await invoke(social,"start_lan_host");
 const hosts=await invoke(social,"discover_lan_hosts");assert(hosts.some(host=>new URL(host.url).port===String(info.port)),"LAN discovery did not find the bundled host.");
 assert(hosts.some(host=>host.users?.some(user=>user.name==='原生主机')),'Native discovery did not return online user profiles.');
 const address=info.addresses.find(url=>/^http:\/\/(?:192\.168\.|10\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(url));
 assert(address,"No private LAN IPv4 address is available for this PC.");
 assert.equal((await fetch(address+"/friends.html")).status,200,"The host is not accessible on its LAN address.");
 chrome=spawn("C:/Program Files/Google/Chrome/Application/chrome.exe",["--headless","--disable-gpu","--remote-debugging-port=9230",`--user-data-dir=${join(dir,"guest")}`,address+"/friends.html"],{windowsHide:true,stdio:"ignore"});
 await until(async()=>Boolean((await get("http://127.0.0.1:9230/json/list"))?.find(p=>p.url.includes("friends.html"))),"The LAN guest browser did not open.");
 const guestTarget=(await get("http://127.0.0.1:9230/json/list")).find(p=>p.url.includes("friends.html"));
 const guest=await attach(guestTarget.webSocketDebuggerUrl);
 await until(()=>guest.js("Boolean(document.querySelector('.mine'))"),"The LAN guest UI did not load.");
 await guest.js("document.querySelector('#room-toggle').click()");await click(guest,"连接好友");
 await guest.js("document.querySelector('#nickname').value='局域网访客';document.querySelector('#starter-pet').value='dog_corgi_golden';document.querySelector('#connect-form').requestSubmit()");
 await until(()=>guest.js("document.querySelector('#room-title').textContent.includes('局域网访客')"),"The LAN guest did not authenticate.");
 for(const page of [social,guest])await page.js("document.querySelector('#room-toggle').click()");
 const code=await guest.js("document.querySelector('#friend-code').value");
 await social.js(`document.querySelector('.friend-code-form input').value=${JSON.stringify(code)};document.querySelector('.friend-code-form').requestSubmit()`);
 await until(()=>guest.js("document.querySelector('#panel-content').innerText.includes('好友申请')"),"LAN friend request did not arrive.");
 await click(guest,"接受");await until(()=>social.js("[...document.querySelectorAll('#panel-content button')].some(button=>button.textContent.trim()==='邀请到桌面'&&!button.disabled&&!button.closest('[hidden]'))"),"LAN friendship did not synchronize.");
 await click(social,"邀请到桌面");await until(()=>guest.js("document.querySelector('#panel-content').innerText.includes('接受桌面邀请')"),"LAN desktop invitation missing.");await click(guest,"接受桌面邀请");
 await until(()=>social.js("document.querySelectorAll('.avatar').length===2&&!document.body.classList.contains('park-full')&&document.querySelector('#panel').hidden"),"LAN visitor did not appear directly on the desktop.");
 const final=await geometry(social);assert(final.size.height/final.scale<=168,"Accepting a desktop invite left the park expanded.");
 await guest.js("window.dispatchEvent(new StorageEvent('storage',{key:'lumpa.freePet.free',newValue:'1'}));window.dispatchEvent(new StorageEvent('storage',{key:'lumpa.freePet.position',newValue:JSON.stringify({x:.25,y:.5,walking:true,facing:-1})}));");
 await until(()=>target('free-pet.html?guest='),"The remote screen-position pet window did not appear.");
 const peer=await attach((await target('free-pet.html?guest=')).webSocketDebuggerUrl);
 await until(()=>peer.js("typeof document.querySelector('button')?.onclick==='function'"),"Peer pet did not become interactive.");
 const peerPosition=await geometry(peer);assert(peerPosition.position.y<final.position.y-100,"The invited pet was clipped inside the scene.");
 await peer.js("document.querySelector('button').click()");
 await until(()=>social.js("document.querySelector('#panel-title').textContent==='局域网访客'"),"Clicking the independent friend pet did not open interaction.");
 await social.js("document.querySelector('#panel-close').click()");
 await guest.js("window.dispatchEvent(new StorageEvent('storage',{key:'lumpa.freePet.active',newValue:'0'}))");
 await until(async()=>!await target('free-pet.html?guest='),"The returned guest pet window was not cleaned up.");
 await until(async()=>{
   const ownTarget=await target('free-pet.html');if(!ownTarget)return false;
   const own=await attach(ownTarget.webSocketDebuggerUrl);const position=await geometry(own);const parent=await geometry(social);
   const expected=await social.js("(()=>{const r=document.querySelector('.mine canvas').getBoundingClientRect();return [r.x+r.width/2-42,r.y+r.height*119/128-81.1]})()");
   return Math.abs(position.position.x-(parent.position.x+expected[0]*parent.scale))<4&&Math.abs(position.position.y-(parent.position.y+expected[1]*parent.scale))<4;
 },"The own pet disappeared or did not redock after return and menu resize.");
 await social.js("document.querySelector('#toast').hidden=true");
 await sleep(150);
 execFileSync("powershell.exe",["-NoProfile","-ExecutionPolicy","Bypass","-File",resolve("scripts/qa-native-input.ps1"),"-Screenshot",join(dir,"native-corner.png"),"-X",String(final.position.x),"-Y",String(final.position.y),"-Width",String(final.size.width),"-Height",String(final.size.height)],{windowsHide:true});
 const report={geometry:corner,movedPet:moved,actualDragAnimated:animated,physicalDrags:3,automaticLAN:true,nativeOnlineProfiles:true,lanAddress:address,discovered:hosts,friendCode:code,desktopVisitor:true,independentGuest:peerPosition,originalFocusPage:true,mainPetSwitch:true,closeReopenCycles:3,reloadedPet:true,appliedBackgroundReturn:true};
 writeFileSync(join(dir,"verification.json"),JSON.stringify(report,null,2));
 console.log("Verified native right/bottom alignment, real mouse full-screen drag and walking, double-click return, bundled LAN host, discovery, LAN-address guest, friend code and desktop invitation.");
 console.log(dir);
} catch(error) {
 let sample;try{sample={text:await social.js('document.body.innerText'),buttons:await social.js("[...document.querySelectorAll('button')].map(button=>({text:button.textContent.trim(),disabled:button.disabled,hidden:Boolean(button.closest('[hidden]'))}))"),geometry:await geometry(pet),events:await pet.js('window.qaEvents'),samples:await pet.js('window.qaSamples'),free:await social.js("localStorage.getItem('lumpa.freePet.free')"),position:await social.js("localStorage.getItem('lumpa.freePet.position')"),motion:await social.js('window.qaMotion'),petLogs:pet.logs};}catch{}
 writeFileSync(join(dir,'failure.json'),JSON.stringify({error:String(error),logs:social?.logs,sample},null,2));
 console.error('Native regression evidence: '+dir);
 throw error;
} finally {
 if(social) {try{await invoke(social,"stop_lan_host");}catch{}}
 for(const channel of channels)channel.close();
 if(chrome)chrome.kill();
 if(app.pid) {try{execFileSync("taskkill.exe",["/PID",String(app.pid),"/T","/F"],{windowsHide:true,stdio:"ignore"});}catch{}}
}
