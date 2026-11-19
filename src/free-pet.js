import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { drawWalkingPet, makeWalkCycle, stepWalk, warmWalk } from "./pet-walk.js";
import { createNativePetDrag } from "./native-pet-drag.js";
import "./free-pet.css";
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const buffer = document.createElement("canvas");
buffer.width = buffer.height = 144;
const drawContext = buffer.getContext("2d");
const button = document.getElementById("free-pet");
const guestId = new URLSearchParams(location.search).get("guest");
function readGuest() {
  try { return JSON.parse(localStorage.getItem("lumpa.guest." + guestId) || "null"); } catch { return null; }
}
let guest = guestId ? readGuest() : null;
let pet = guest?.pet || localStorage.getItem("lumpa.freePet.pet") || "dog_french_fawn";
const walk = makeWalkCycle();
let last, reportedPet, reporting, clickTimer;
function preparePet() {
  const selected = pet;
  Promise.allSettled(warmWalk(pet).map(image => image.decode())).then(() => {
    if (pet === selected) { last = undefined; paint(performance.now()); }
  });
}
function syncPet() {
  const next = guestId ? readGuest()?.pet : localStorage.getItem("lumpa.freePet.pet");
  if (next && next !== pet) { pet = next; last = reportedPet = undefined; preparePet(); }
}
const drag = createNativePetDrag({
  invoke,
  async onMove({ dx, dy, walking }) {
    localStorage.setItem("lumpa.freePet.free", "1");
    localStorage.setItem("lumpa.freePet.active", "1");
    stepWalk(walk, Math.hypot(dx, dy) / devicePixelRatio, dx / devicePixelRatio, performance.now());
    const position = await invoke("park_pet_position");
    localStorage.setItem("lumpa.freePet.position", JSON.stringify({ ...position, walking, facing: walk.facing }));
  },
  onClick() {
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => localStorage.setItem("lumpa.freePet.action", "select:" + Date.now()), 260);
  },
  onError(error) { console.error(error); },
});
button.onpointerdown = event => {
  if (event.button !== 0 || guestId) return;
  event.preventDefault();
  clearTimeout(clickTimer);
  drag.start();
};
button.onclick = () => {
  if (guestId) localStorage.setItem("lumpa.freePet.action", `person:${guestId}:${Date.now()}`);
};
button.ondblclick = () => {
  if (guestId) return;
  clearTimeout(clickTimer);
  drag.cancel();
  localStorage.setItem("lumpa.freePet.action", "return:" + Date.now());
  localStorage.setItem("lumpa.freePet.active", "0");
};
window.addEventListener("pagehide", () => drag.cancel());
window.addEventListener("storage", event => {
  syncPet();
  if (guestId && event.key === "lumpa.guest." + guestId && event.newValue) {
    const next = readGuest();
    if (!next) return;
    if (next.walking && guest) stepWalk(walk, Math.hypot((next.x - guest.x) * screen.width, (next.y - guest.y) * screen.height), (next.x - guest.x) * screen.width, performance.now());
    walk.facing = next.facing === -1 ? -1 : 1;
    guest = next;
  }
});
if (!guestId) listen("lumpa-pet-refresh", () => {
  syncPet();
  last = reportedPet = undefined;
  // A hidden WebView may suspend RAF. Draw on the wake-up event itself.
  paint(performance.now());
}).catch(console.error);
function paint(now) {
  syncPet();
  const moving = now < walk.until;
  const idleFrame = Math.floor(now / 360) % 4;
  const key = `${pet}:${moving ? Math.floor(walk.phase) : `idle-${idleFrame}`}:${walk.facing}`;
  if (key !== last) {
    drawContext.clearRect(0, 0, 144, 144);
    if (drawWalkingPet(drawContext, pet, 72, 139, 138, walk, moving, idleFrame)) {
      ctx.clearRect(0, 0, 144, 144);
      ctx.drawImage(buffer, 0, 0);
      last = key;
      if (!guestId && reportedPet !== pet && !reporting) {
        const drawnPet = pet;
        reporting = true;
        invoke("park_pet_ready", { pet: drawnPet }).then(() => { reportedPet = drawnPet; }).catch(console.error).finally(() => { reporting = false; });
      }
    }
  }
}
function render(now) { paint(now); requestAnimationFrame(render); }
preparePet();
requestAnimationFrame(render);
