import { invoke } from "@tauri-apps/api/core";
import { drawWalkingPet, makeWalkCycle, stepWalk, warmWalk } from "./pet-walk.js";
import "./free-pet.css";
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const button = document.getElementById("free-pet");
const guestId = new URLSearchParams(location.search).get("guest");
let guest = guestId ? JSON.parse(localStorage.getItem("lumpa.guest."+guestId)||"null") : null;
let pet = guest?.pet || localStorage.getItem("lumpa.freePet.pet") || "dog_french_fawn";
const walk = makeWalkCycle();
let drag, pendingPosition, movingWindow = false;
let last;
let clickTimer;
warmWalk(pet);
async function flushPosition() {
  if(movingWindow || !pendingPosition) return;
  movingWindow=true;
  try {
    while(pendingPosition) {
      const update=pendingPosition;pendingPosition=null;
      const monitor=await invoke("move_park_pet",{position:update.position});
      localStorage.setItem("lumpa.freePet.position",JSON.stringify({...monitor,walking:update.walking,facing:walk.facing}));
    }
  } catch(error) {console.error(error);}
  finally {movingWindow=false;}
}
function queuePosition(state,walking) {
  if(!state.anchor || !state.moved) return;
  pendingPosition={position:[state.anchor.position.x+(state.x-state.startX)*state.anchor.scale,state.anchor.position.y+(state.y-state.startY)*state.anchor.scale],walking};
  flushPosition();
}
button.onpointerdown=async event=>{
  if(event.button!==0||guestId||drag)return;
  const state=drag={id:event.pointerId,startX:event.screenX,startY:event.screenY,x:event.screenX,y:event.screenY,moved:false,down:true};
  button.setPointerCapture(event.pointerId);
  try {state.anchor=await invoke("social_window_geometry");queuePosition(state,state.down);}
  catch(error){console.error(error);}
};
button.onpointermove=event=>{
  if(!drag||event.pointerId!==drag.id)return;
  const dx=event.screenX-drag.x,dy=event.screenY-drag.y;
  drag.x=event.screenX;drag.y=event.screenY;
  if(Math.hypot(drag.x-drag.startX,drag.y-drag.startY)>3) {
    drag.moved=true;localStorage.setItem("lumpa.freePet.free","1");
    stepWalk(walk,Math.hypot(dx,dy),dx,performance.now());
    queuePosition(drag,true);
  }
};
function endDrag(event) {
  if(!drag||event.pointerId!==drag.id)return;
  const state=drag;drag=null;state.down=false;
  if(state.moved) queuePosition(state,false);
  else {clearTimeout(clickTimer);clickTimer=setTimeout(()=>localStorage.setItem("lumpa.freePet.action","select:"+Date.now()),260);}
}
button.onpointerup=endDrag;
button.onpointercancel=endDrag;
button.onlostpointercapture=endDrag;
button.onclick = () => { if (guestId) localStorage.setItem("lumpa.freePet.action",`person:${guestId}:${Date.now()}`); };
button.ondblclick = async () => {
  if (guestId) return;
  clearTimeout(clickTimer);
  localStorage.setItem("lumpa.freePet.active", "0");
};
window.addEventListener("storage", event => {
  if (!guestId && event.key === "lumpa.freePet.pet" && event.newValue) { pet = event.newValue; warmWalk(pet); }
  if (guestId && event.key === "lumpa.guest."+guestId && event.newValue) {
    const next=JSON.parse(event.newValue);
    if(next.pet!==pet){pet=next.pet;warmWalk(pet);}
    if(next.walking&&guest) stepWalk(walk,Math.hypot((next.x-guest.x)*screen.width,(next.y-guest.y)*screen.height),(next.x-guest.x)*screen.width,performance.now());
    walk.facing=next.facing===-1?-1:1;
    guest=next;
  }
});
function render(now) {
  const moving = now < walk.until;
  const idleFrame = Math.floor(now / 360) % 4;
  const key = `${pet}:${moving ? Math.floor(walk.phase) : `idle-${idleFrame}`}:${walk.facing}`;
  if (key !== last) {
    ctx.clearRect(0, 0, 144, 144);
    if (drawWalkingPet(ctx, pet, 72, 139, 138, walk, moving, idleFrame)) last = key;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
