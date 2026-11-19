import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createSocket} from 'node:dgram';
import {randomBytes} from 'node:crypto';
import {mkdirSync,mkdtempSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
mkdirSync('artifacts',{recursive:true});
const dir=mkdtempSync(resolve('artifacts/lan-users-qa-'));
const nodes=[],channels=[];
let chrome;
const pages=[];
const errors=[];
async function until(fn,why){for(let n=0;n<200;n++){if(await fn())return;await sleep(80);}throw new Error(why);}
const hosts=[{url:'http://127.0.0.1:4204',port:4204,udp:4209},{url:'http://127.0.0.1:4205',port:4205,udp:4210}];
async function discover(host){
 const socket=createSocket('udp4'),nonce=randomBytes(12).toString('hex');
 return new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{socket.close();reject(new Error('UDP discovery timeout'));},1500);
  socket.once('error',error=>{clearTimeout(timer);socket.close();reject(error);});
  socket.on('message',bytes=>{const reply=JSON.parse(bytes);if(reply.nonce!==nonce)return;clearTimeout(timer);socket.close();resolve({...reply,url:host.url});});
  socket.bind(0,'127.0.0.1',()=>socket.send(JSON.stringify({type:'lumpa-discover',nonce}),host.udp,'127.0.0.1'));
 });
}
async function get(url){try{const r=await fetch(url);return r.ok&&(r.headers.get("content-type")?.includes("application/json")?await r.json():await r.text());}catch{return null;}}
async function rpc(url){
 const ws=new WebSocket(url);channels.push(ws);const pending=new Map();let seq=0;const listeners=new Map();
 ws.onmessage=event=>{const message=JSON.parse(event.data);if(message.id){const call=pending.get(message.id);if(call){pending.delete(message.id);message.error?call.reject(new Error(message.error.message)):call.resolve(message.result);}}else listeners.get(message.method)?.(message.params);};
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const js=async expression=>{const result=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||expression);return result.result.value;};
 return {call,js,listeners};
}
async function click(page,label){assert(await page.js(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)}&&!b.disabled&&!b.closest('[hidden]'));if(!b)return false;b.click();return true;})()`),'Missing '+label);}
try {
 for(const host of hosts){
  const process=spawn(globalThis.process.execPath,['services/social/server.mjs'],{windowsHide:true,stdio:'ignore',env:{...globalThis.process.env,LUMPA_SOCIAL_LAN:'1',LUMPA_SOCIAL_ORIGINS:hosts.map(item=>item.url).join(','),LUMPA_SOCIAL_PORT:String(host.port),LUMPA_SOCIAL_DISCOVERY_PORT:String(host.udp),LUMPA_SOCIAL_DATA:join(dir,'server-'+host.port)}});nodes.push(process);
  await until(()=>get(host.url+'/social/health'),'Server failed');
 }
 chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless','--disable-gpu','--remote-debugging-port=9240','--remote-allow-origins=*',`--user-data-dir=${join(dir,'chrome')}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
 await until(()=>get('http://127.0.0.1:9240/json/version'),'Browser failed');
 const browser=await rpc((await get('http://127.0.0.1:9240/json/version')).webSocketDebuggerUrl);
 for(let i=0;i<2;i++){
  const {browserContextId}=await browser.call('Target.createBrowserContext');
  const {targetId}=await browser.call('Target.createTarget',{url:'about:blank',browserContextId});
  let target;await until(async()=>{target=(await get('http://127.0.0.1:9240/json/list')).find(t=>t.id===targetId);return target;},'Target missing');
  const page=await rpc(target.webSocketDebuggerUrl);pages.push(page);
  await page.call('Runtime.enable');await page.call('Page.enable');await page.call('Runtime.addBinding',{name:'lanBridge'});
  page.listeners.set('Runtime.exceptionThrown',event=>errors.push(event.exceptionDetails.exception?.description||event.exceptionDetails.text));
  page.listeners.set('Runtime.bindingCalled',async event=>{
   const request=JSON.parse(event.payload);let result;
   try {
    if(request.command==='start_lan_host')result={...hosts[i],addresses:[hosts[i].url]};
    else if(request.command==='discover_lan_hosts')result=await Promise.all(hosts.map(discover));
    else result=null;
    await page.js(`window.lanReplies[${request.id}]?.resolve(${JSON.stringify(result)});delete window.lanReplies[${request.id}]`);
   } catch(error){await page.js(`window.lanReplies[${request.id}]?.reject(${JSON.stringify(String(error))})`);}
  });
  await page.call('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('lumpa.social.name',${JSON.stringify(i?'白露':'晚风')});window.lanReplies={};let requestId=0;window.__TAURI_INTERNALS__={invoke:(command,args)=>new Promise((resolve,reject)=>{const id=++requestId;window.lanReplies[id]={resolve,reject};window.lanBridge(JSON.stringify({id,command,args}));}),transformCallback:()=>1,unregisterCallback:()=>{}};`});
  await page.call('Emulation.setDeviceMetricsOverride',{width:940,height:700,deviceScaleFactor:1,mobile:false});
  await page.call('Page.navigate',{url:hosts[i].url+'/friends.html'});
  await until(()=>page.js("document.querySelector('#connection')?.textContent.includes('已联机')"),'Automatic LAN login failed');
 }
 const [a,b]=pages;
 for(const page of pages){await page.js("document.querySelector('#room-toggle').click()");await click(page,'刷新附近');}
 await until(()=>a.js("document.querySelector('.nearby-users').textContent.includes('白露')"),'Independent LAN user not discovered');
 assert.equal(await a.js("[...document.querySelectorAll('.nearby-person')].filter(node=>node.textContent.includes('晚风')).length"),0,'Self leaked into nearby users');
 const packet=await discover(hosts[1]);assert(packet.users.some(user=>user.name==='白露'));
 assert(packet.users.every(user=>!('session'in user)&&!('invite'in user)),'UDP packet exposed a secret');
 await a.js("[...document.querySelectorAll('.nearby-person')].find(node=>node.textContent.includes('白露')).querySelector('button').click()");
 await until(()=>b.js("document.querySelector('#panel-content').textContent.includes('好友申请')"),'Cross-host click-to-add failed');
 await click(b,'接受');
 await until(()=>a.js("[...document.querySelectorAll('.nearby-person')].some(node=>node.textContent.includes('白露')&&node.textContent.includes('邀请到桌面'))"),'Friend acceptance did not update nearby action');
 await a.js("[...document.querySelectorAll('.nearby-person')].find(node=>node.textContent.includes('白露')).querySelector('button').click()");
 await until(()=>b.js("document.querySelector('#panel-content').textContent.includes('接受桌面邀请')"),'Desktop invitation not delivered');await click(b,'接受桌面邀请');
 await until(()=>a.js("document.querySelectorAll('.avatar').length===2"),'Desktop visitor missing');
 for(const kind of ['gomoku','xiangqi','tic']){
  await a.js("document.querySelector('.avatar:not(.mine)').click()");
  if(kind==='gomoku'){
   await a.js("document.querySelector('#view-switch').click()");
   await a.js("document.querySelector('#toast').hidden=true");
   const screenshot=await a.call('Page.captureScreenshot',{format:'png'});writeFileSync(join(dir,'game-picker.png'),Buffer.from(screenshot.data,'base64'));
   await a.call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
   assert(await a.js("(()=>{const grid=document.querySelector('.game-picker-grid'),panel=document.querySelector('#panel');return grid.scrollWidth<=grid.clientWidth+1&&panel.getBoundingClientRect().left>=0&&panel.scrollWidth<=panel.clientWidth+1;})()"),'Narrow game picker overflowed');
   await a.call('Emulation.setDeviceMetricsOverride',{width:940,height:700,deviceScaleFactor:1,mobile:false});
  }
  await a.js(`document.querySelector('[data-game-kind=${kind}]').click()`);
  await until(()=>b.js("document.querySelector('#panel-content').textContent.includes('接受邀请')"),'Game card invitation failed: '+kind);await click(b,'接受邀请');
  await until(()=>a.js("Boolean(document.querySelector('.board'))"),'Game did not open: '+kind);
  await click(a,'认输并结束');await until(()=>b.js("!document.querySelector('.resign')"),'Resignation failed');
 }
 await a.js("document.querySelector('.avatar:not(.mine)').click()");
 assert(await a.js("document.querySelector('.recent-games').textContent.includes('井字棋')"),'Recent games missing');
 await a.js("document.querySelector('#room-toggle').click()");
 await click(a,'关闭局域网发现');
 await a.call('Page.reload');
 await until(()=>a.js("Boolean(document.querySelector('.mine'))"),'Disabled-discovery reload did not restore the offline pet');
 await sleep(700);
 assert(await a.js("document.querySelector('#connection').textContent.includes('离线乐园')"),'Disabled discovery silently reconnected after reload');
 assert.deepEqual(errors,[],'Unexpected UI exceptions');
 writeFileSync(join(dir,'verification.json'),JSON.stringify({automaticLogin:true,independentServers:true,udpProfiles:true,noManualAddress:true,clickToAdd:true,desktopInvite:true,threeGameCards:true,narrowLayout:true,disabledPreferencePersists:true},null,2));
 console.log('Verified automatic LAN login, real UDP online profiles, two independent services, click-to-add without an address, desktop invitation, three working game cards and narrow layout.');console.log(dir);
} catch(error) {
 const evidence=[];
 for(const page of pages) {try{evidence.push(await page.js("({text:document.body.innerText,service:localStorage.getItem('lumpa.social.server')})"));}catch{}}
 writeFileSync(join(dir,'failure.json'),JSON.stringify({error:String(error),evidence},null,2));
 console.error('LAN evidence: '+dir);throw error;
} finally {for(const socket of channels)socket.close();if(chrome)chrome.kill();for(const child of nodes)child.kill();}
