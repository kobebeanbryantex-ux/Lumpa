import "./social.css";
import { FocusEngine, getPetActionFrameImage, PET_ARCHETYPES } from "./focus.js";
import { drawWalkingPet, makeWalkCycle, stepWalk, warmWalk } from "./pet-walk.js";
import { gameRules } from "./social-games.js";
import { xiangqiNames, xiangqiDestinations } from "./xiangqi.js";
import { defaultDesign, parkMediaTypes } from "./park-layout.js";
import { mountParkEditor, placeFurniture, renderParkFurniture } from "./park-view.js";
import { loadPersonalParks, personalMedia, savePersonalParks } from "./local-park.js";
import { attachSharedFocus } from "./shared-focus.js";

const $ = (id) => document.getElementById(id);
const desktop = Boolean(window.__TAURI_INTERNALS__);
const params = new URLSearchParams(location.search);
const clientStorage = localStorage;
const configuredService = import.meta.env.VITE_LUMPA_SOCIAL_URL;
const defaultService = configuredService || (import.meta.env.DEV ? "http://127.0.0.1:4173" : "http://127.0.0.1:4180");
const storeKey = "lumpa.social.server";
const savedName = clientStorage.getItem("lumpa.social.name") || "";
const avatars = new Map();
const savedService = clientStorage.getItem(storeKey);
let service = desktop && savedService && !(configuredService && isLocalService(savedService)) ? savedService : desktop ? defaultService : location.origin;
let inviteCode = params.get("invite");
let socket, retry, connectTimer, toastTimer, page = "", person = "", me, room, drag, game, gameInvite;
let online = false;
let overview = { friends: [], requests: [], rooms: [], pets: [] };
let messages = [];
let lastSent = 0;
let unread = new Set();
let owner;
let design = defaultDesign();
let draft;
let view = desktop ? "desk" : "park";
let backdropKey, backdropUrl, backdropRequest;
let expandedDesktop;
const personal = loadPersonalParks();
let detached = false;
let nativePetReady = false, dockQueued = false, dockInFlight = false, closing = false;
let dockTimer;
let desktopInvite, xiangqiFrom = -1, requestedPresentation, lanInfo;
let guestsQueued = false;
const companion = new FocusEngine({ allUnlocked: true, initialPetId: initialPet() });
const focusSession = attachSharedFocus(companion);

if (desktop) {
  document.documentElement.classList.add("desktop-shell");
  document.body.classList.add("desktop");
  $("desktop-close").hidden = false;
  $("server-settings").hidden = false;
  $("server-url").value = service;
}
$("nickname").value = savedName;
for (const [id, pet] of Object.entries(PET_ARCHETYPES)) {
  const option = document.createElement("option");
  option.value = id;
  option.textContent = pet.name;
  $("starter-pet").append(option);
}
$("starter-pet").value = initialPet();
function isLocalService(address) {
  try { return ["localhost", "127.0.0.1", "[::1]"].includes(new URL(address).hostname); }
  catch { return false; }
}
function updateWelcome() {
  $("welcome-description").textContent = inviteCode ? "好友邀请你来串门。填个昵称就可以进房。"
    : isLocalService(service) ? "当前为本机试玩，同一台电脑可以用浏览器和桌面端对战。"
      : "开一间小屋，用房间码邀请好友坐坐。";
}
updateWelcome();

function el(tag, value, className) {
  const node = document.createElement(tag);
  if (value != null) node.textContent = value;
  if (className) node.className = className;
  return node;
}
function button(label, action, className = "quiet") {
  const node = el("button", label, className);
  node.type = "button";
  node.addEventListener("click", action);
  return node;
}
function status(label, active = false) {
  $("connection").lastElementChild.textContent = label;
  $("connection").classList.toggle("online", active);
}
function connectFeedback(text, connecting = false) {
  const submit = $("connect-form").querySelector("button[type=submit]");
  submit.disabled = connecting;
  submit.textContent = connecting ? "正在连接…" : "进入小屋";
  $("connect-feedback").textContent = text;
}
function toast(text) {
  $("toast").textContent = text;
  $("toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $("toast").hidden = true; }, 4400);
}
async function native(command, args = {}) {
  if (!desktop) return;
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke(command, args);
}
function resizeDesktop() {
  if (!desktop) return;
  const expanded = Boolean(page || !room || showsBackdrop());
  if (expandedDesktop === expanded) return;
  expandedDesktop = expanded;
  native("set_social_window_expanded", { expanded }).then(queueDockPet).catch(error => {
    if (expandedDesktop === expanded) expandedDesktop = undefined;
    console.warn(error);
  });
}
function queueDockPet() {
  if (!desktop || detached || closing) return;
  dockQueued = true;
  clearTimeout(dockTimer);
  dockTimer=setTimeout(()=>{if(!dockInFlight)dockPet().catch(error=>toast(String(error)));},45);
}
function syncGuestWindows() {
  if (!desktop || guestsQueued || closing) return;
  guestsQueued = true;
  setTimeout(async () => {
    try {
      const guests = [...avatars.values()].filter(item=>item.data.id!==me&&item.data.space==="screen").map(item=>item.data);
      for (const guest of guests) localStorage.setItem("lumpa.guest."+guest.id,JSON.stringify(guest));
      await native("sync_park_guests",{guests});
    } catch(error) {console.warn(error);}
    finally {guestsQueued=false;}
  },35);
}
async function dockPet() {
  if (detached || dockInFlight || !room || closing) return;
  dockInFlight = true;
  dockQueued = false;
  try {
    const geometry=await native("social_window_geometry");
    if(geometry&&(Math.abs(geometry.size.width/devicePixelRatio-innerWidth)>1||Math.abs(geometry.size.height/devicePixelRatio-innerHeight)>1)) {dockQueued=true;return;}
    const item = avatars.get(me);
    if (!item || detached) return;
    const rect = item.node.querySelector("canvas").getBoundingClientRect();
    if (!rect.width) return;
    localStorage.setItem("lumpa.freePet.pet", item.pet);
    if (!nativePetReady) localStorage.setItem("lumpa.freePet.free", "0");
    await native("open_park_pet", { position: [rect.x + rect.width / 2 - 42, rect.y + rect.height * 119 / 128 - 81.1] });
    nativePetReady = true;
    document.body.classList.add("native-pet-ready");
  } finally { dockInFlight = false; if(dockQueued)queueDockPet(); }
}
window.addEventListener("resize", queueDockPet);
function privateService(address) {
  try {
    const url = new URL(address);
    const parts = url.hostname.split(".").map(Number);
    const lan = parts.length === 4 && parts.every(n => Number.isInteger(n) && n >= 0 && n <= 255) &&
      (parts[0] === 10 || parts[0] === 127 || parts[0] === 192 && parts[1] === 168 || parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31);
    return !url.username && !url.password && (url.protocol === "https:" || url.protocol === "http:" && (lan || url.hostname === "localhost"));
  } catch { return false; }
}
function joinService(address) {
  if (!privateService(address)) throw new Error("请输入局域网地址，例如 192.168.1.8:4185，或 HTTPS 服务地址。");
  service = new URL(address).origin;
  $("server-url").value = service;
  clientStorage.setItem(storeKey, service);
  const name = $("nickname").value.trim() || savedName || "Lumpa玩家";
  clientStorage.setItem("lumpa.social.name", name);
  connect(name);
}
function stateKey(suffix) { return `lumpa.social.${service}.${suffix}`; }
function desktopBackground() {
  return Boolean(room && clientStorage.getItem(stateKey(`desk-background.${room}`)) === "1");
}
function showsBackdrop() { return view === "park" || desktopBackground() || page === "design"; }
function setView(next) {
  view = next;
  updateParkDisplay();
  resizeDesktop();
}
function toggleDesktopBackground() {
  clientStorage.setItem(stateKey(`desk-background.${room}`), desktopBackground() ? "0" : "1");
  setView("desk");
  closePanel();
}
function updateParkDisplay() {
  const full = showsBackdrop();
  document.body.classList.toggle("park-full", full);
  document.body.classList.toggle("desk-view", view === "desk");
  document.body.classList.toggle("panel-open", Boolean(page));
  $("view-switch").textContent = view === "park" ? (desktop ? "收回桌边" : "桌面预览") : "打开乐园";
  $("park-edit").hidden = !room || owner !== me;
  $("share").hidden = !overview.rooms.find(row => row.id === room)?.invite;
  const current = draft?.design || design;
  renderParkFurniture($("park-furniture"), current, draft, () => openPanel("visits"));
  renderBackdrop(current, full);
  queueDockPet();
}
async function renderBackdrop(current, full) {
  const layer = $("park-backdrop");
  layer.dataset.backdrop = current.backdrop;
  const file = draft?.file;
  const media = current.media;
  const key = !full ? "hidden" : file || (media ? `${room}/${media.id}` : null);
  if (key === backdropKey) return;
  backdropKey = key;
  backdropRequest?.abort();
  if (backdropUrl) URL.revokeObjectURL(backdropUrl);
  backdropUrl = null;
  layer.replaceChildren();
  if (!full || (!file && !media)) return;
  const controller = backdropRequest = new AbortController();
  try {
    const blob = file || (media?.local ? await personalMedia("get", media.id)
      : await (await fileRequest(`/social/park-media/${room}/${media.id}`, { signal: controller.signal })).blob());
    if (!blob) throw new Error("背景暂不可用");
    if (controller.signal.aborted) return;
    backdropUrl = URL.createObjectURL(blob);
    const video = parkMediaTypes[file?.type || media?.mime] === "video";
    const element = el(video ? "video" : "img");
    if (video) {
      element.muted = true;
      element.defaultMuted = true;
      element.loop = true;
      element.playsInline = true;
      element.autoplay = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    } else element.alt = "";
    element.addEventListener("error", () => {
      if (controller.signal.aborted) return;
      if (draft?.file === file && file) draft.file = null;
      element.remove();
      toast("这份媒体无法播放，请更换文件或编码。");
    }, { once: true });
    element.src = backdropUrl;
    layer.append(element);
  } catch (error) {
    if (!controller.signal.aborted) toast("背景暂时无法加载，已显示默认风景。");
  }
}
function startDesign() {
  if (owner !== me) return;
  draft = { design: structuredClone(design), room, selected: design.items[0]?.id, file: null, saving: false };
  openPanel("design");
}
async function saveDesign(submit) {
  const edit = draft;
  if (!edit || edit.room !== room || edit.saving) return;
  edit.saving = submit.disabled = true;
  $("panel-content").inert = true;
  $("park-furniture").inert = true;
  const savedDesign = structuredClone(edit.design);
  try {
    if (edit.file) {
      if (isPersonalRoom()) {
        const id = crypto.randomUUID();
        await personalMedia("put", id, edit.file);
        savedDesign.media = { id, mime: edit.file.type, local: true };
      } else {
        const response = await fileRequest(`/social/park-media/${edit.room}`, { method: "POST",
          body: edit.file, headers: { "Content-Type": edit.file.type } });
        savedDesign.media = await response.json();
      }
    }
    if (edit !== draft || edit.room !== room) return;
    if (!transmit("room.design", { room: edit.room, design: savedDesign })) throw new Error("保存失败，请重新连接后再试。");
  } catch (error) {
    edit.saving = submit.disabled = false;
    if (draft === edit) { renderPanel(); toast(error.message); }
  }
}
function transmit(type, fields = {}) {
  if (type === "room.join" && personal.parks.some(park => park.id === fields.room)) { enterPersonal(fields.room); return true; }
  if (!online) {
    if (type === "profile.pet") {
      companion.equipped.petId = fields.pet;
      companion.saveEquipped();
      localStorage.setItem("lumpa.social.preferredPet", fields.pet);
      enterPersonal();
      return true;
    }
    if (type === "room.design" && isPersonalRoom()) {
      const park = personal.parks.find(park => park.id === room);
      const previous = park.design.media;
      park.design = fields.design;
      savePersonalParks(personal);
      design = park.design;
      closePanel();
      if (previous?.local && previous.id !== design.media?.id) personalMedia("delete", previous.id).catch(console.warn);
      toast("布置已保存在这台设备。");
      return true;
    }
    if (type === "room.create") {
      const park = { id: "local-" + crypto.randomUUID(), title: fields.title.trim().slice(0, 36), design: defaultDesign(), x: .55, y: 0 };
      personal.parks.push(park);
      savePersonalParks(personal);
      enterPersonal(park.id);
      return true;
    }
  }
  if (!online || socket?.readyState !== 1) { toast("联机已断开，正在尝试重连。"); return false; }
  socket.send(JSON.stringify({ type, ...fields }));
  return true;
}
function isPersonalRoom() { return personal.parks.some(park => park.id === room); }
function enterPersonal(id = personal.active) {
  if (online) {
    const previous = socket;
    socket = null;
    previous?.close();
  }
  online = false;
  clearTimeout(retry);
  clearTimeout(connectTimer);
  const park = personal.parks.find(item => item.id === id) || personal.parks[0];
  personal.active = park.id;
  savePersonalParks(personal);
  me = owner = "local-self";
  room = park.id;
  design = park.design;
  draft = drag = undefined;
  avatars.forEach(item => item.node.remove());
  avatars.clear();
  const pet = PET_ARCHETYPES[companion.equipped.petId] ? companion.equipped.petId : "dog_french_fawn";
  const self = { id: me, name: clientStorage.getItem("lumpa.social.name") || "我", pet, x: park.x ?? .55, y: desktop ? 0 : park.y || 0, facing: 1, walking: false };
  overview = { self, pets: Object.keys(PET_ARCHETYPES), friends: [], requests: [], rooms: personal.parks.map(item => ({ ...item, owner: me, count: 1 })) };
  upsertAvatar(self);
  syncGuestWindows();
  $("welcome").hidden = true;
  $("room-view").hidden = false;
  $("room-toggle").hidden = false;
  $("room-toggle").textContent = "乐园与好友";
  status("离线乐园");
  updateRoomTitle();
  updateParkDisplay();
  resizeDesktop();
}
function initialPet() {
  try {
    return clientStorage.getItem("lumpa.social.preferredPet") ||
      JSON.parse(clientStorage.getItem("lumpaFocusEquipped") || "{}").petId || "dog_french_fawn";
  } catch { return "dog_french_fawn"; }
}
function connect(name) {
  clearTimeout(retry);
  clearTimeout(connectTimer);
  const old = socket;
  socket = null;
  old?.close();
  online = false;
  let connection;
  try {
    const endpoint = new URL("/social/ws", service);
    endpoint.protocol = endpoint.protocol === "https:" ? "wss:" : "ws:";
    connection = socket = new WebSocket(endpoint);
  } catch {
    status("无法连接");
    connectFeedback("无法使用当前联机入口。请在联机设置里检查地址。");
    return;
  }
  const session = clientStorage.getItem(stateKey("session"));
  status("连接中");
  connectFeedback("正在建立联机连接…", true);
  connectTimer = setTimeout(() => {
    if (socket === connection && !online) connection.close(4000, "Connection timed out");
  }, 8500);
  connection.addEventListener("open", () => connection.send(JSON.stringify({ type: "hello", name, session, home: true, pet: $("starter-pet").value })));
  connection.addEventListener("message", event => {
    if (connection !== socket) return;
    const packet = JSON.parse(event.data);
    if (packet.type === "ready") {
      clearTimeout(connectTimer);
      clientStorage.setItem(stateKey("session"), packet.session);
      me = packet.id;
      online = true;
      status("已联机", true);
      connectFeedback("");
      $("welcome").hidden = true;
      $("room-toggle").hidden = false;
      closePanel();
      avatars.forEach(item => item.node.remove());
      avatars.clear();
      room = undefined;
      if (inviteCode) transmit("room.join", { invite: inviteCode });
      else if (clientStorage.getItem(stateKey("room"))) transmit("room.join", { room: clientStorage.getItem(stateKey("room")) });
      else if (packet.home) transmit("room.join", { room: packet.home });
      else openPanel("rooms");
    } else handlePacket(packet);
  });
  connection.addEventListener("close", event => {
    if (connection !== socket) return;
    clearTimeout(connectTimer);
    const wasOnline = online;
    online = false;
    drag = null;
    closePanel();
    enterPersonal();
    if (event.code === 4001) {
      connectFeedback("这份身份已在另一窗口使用。单机双人测试请用浏览器无痕窗口。");
      toast("联机身份已在另一窗口使用，已回到离线乐园。");
    } else if (wasOnline) {
      connectFeedback("连接已断开，正在重连…");
      retry = setTimeout(() => connect(name), 1800);
    } else {
      connectFeedback(isLocalService(service) ? "本机试玩服务没连上，启动服务后再试。"
        : "联机服务暂时连不上，请检查网络后重试。");
    }
    resizeDesktop();
  });
}
$("connect-form").addEventListener("submit", event => {
  event.preventDefault();
  const name = $("nickname").value.trim();
  if (!name) return;
  if (desktop) {
    try {
      const url = new URL($("server-url").value);
      if (!privateService(url.href)) throw new Error();
      service = url.origin;
      clientStorage.setItem(storeKey, service);
      updateWelcome();
    } catch { connectFeedback("请填写局域网或 HTTPS 联机地址。"); return; }
  }
  clientStorage.setItem("lumpa.social.name", name);
  connect(name);
});

function handlePacket(packet) {
  switch (packet.type) {
    case "overview":
      overview = packet;
      companion.equipped.petId = packet.self.pet;
      companion.saveEquipped();
      $("room-toggle").textContent = overview.requests.length || unread.size ?
        `房间与好友 · ${overview.requests.length + unread.size}` : "房间与好友";
      updateRoomTitle();
      $("share").hidden = !overview.rooms.find(row => row.id === room)?.invite;
      if (["rooms", "pets", "person"].includes(page)) renderPanel();
      break;
    case "room.presence":
      if (room !== packet.room) {
        avatars.forEach(item => item.node.remove());
        avatars.clear();
        drag = null;
        draft = null;
        if (page === "design") closePanel();
        view = requestedPresentation || (desktop ? "desk" : "park");
        requestedPresentation = null;
      }
      room = packet.room;
      owner = packet.owner;
      design = packet.design || defaultDesign();
      clientStorage.setItem(stateKey("room"), room);
      if (inviteCode) {
        inviteCode = null;
        if (!desktop) history.replaceState(null, "", "/friends.html");
      }
      for (const row of packet.avatars) upsertAvatar(row);
      for (const [id, item] of avatars) if (!packet.avatars.some(row => row.id === id)) {
        item.node.remove();
        avatars.delete(id);
      }
      syncGuestWindows();
      $("room-view").hidden = false;
      updateRoomTitle();
      updateParkDisplay();
      resizeDesktop();
      queueDockPet();
      break;
    case "room.presentation":
      if (room === packet.room) { setView(packet.mode === "park" ? "park" : "desk"); closePanel(); }
      break;
    case "desktop.invite":
      desktopInvite = packet.invite;
      openPanel("desktop-invite");
      break;
    case "room.design":
      if (room !== packet.room) break;
      design = packet.design;
      if (draft?.saving) {
        closePanel();
        toast("布置已保存，同房伙伴已同步。");
      } else updateParkDisplay();
      break;
    case "room.move":
      if (room === packet.room) upsertAvatar(packet.avatar);
      break;
    case "dm.history":
      if (page === "chat" && person === packet.who) {
        const byId = new Map([...packet.messages, ...messages].map(message => [message.id, message]));
        messages = [...byId.values()].sort((a, b) => a.time - b.time);
        renderMessages();
      }
      break;
    case "dm": {
      if (packet.message.kind === "file" || packet.message.kind === "pet") showDelivery(packet.message);
      const partner = packet.message.from === me ? packet.message.to : packet.message.from;
      if (page === "chat" && person === partner) {
        if (!messages.some(row => row.id === packet.message.id)) messages.push(packet.message);
        renderMessages();
      } else if (packet.message.from !== me) {
        unread.add(partner);
        $("room-toggle").textContent = `房间与好友 · ${overview.requests.length + unread.size}`;
        toast(`${findPerson(partner)?.name || "好友"} 发来了新消息`);
        if (page === "rooms") renderPanel();
      }
      break;
    }
    case "game.invite":
      gameInvite = { ...packet.invite, name: packet.name };
      if (page === "design") toast(`${packet.name} 发来了对战邀请。`);
      else openPanel("challenge");
      break;
    case "game.state": {
      const shouldOpen = !game || game.id !== packet.game.id || packet.game.result;
      game = packet.game;
      if (shouldOpen) openPanel("game");
      else if (page === "game") renderPanel();
      break;
    }
    case "error":
      if (!online) {
        clearTimeout(connectTimer);
        connectFeedback(packet.text);
        const failed = socket;
        socket = null;
        failed?.close();
        status("离线乐园");
        break;
      }
      if (page === "design" && draft?.saving) { draft.saving = false; renderPanel(); }
      if (online && !room) {
        inviteCode = null;
        clientStorage.removeItem(stateKey("room"));
        openPanel("rooms");
      }
      toast(packet.text);
      break;
    case "notice": toast(packet.text); break;
  }
}

function updateRoomTitle() {
  $("room-title").textContent = overview.rooms.find(row => row.id === room)?.title || "好友小屋";
  $("room-population").textContent = `${avatars.size} 位伙伴在这里`;
}
function showDelivery(message) {
  const from = avatars.get(message.from);
  const to = avatars.get(message.to);
  if (!from || !to || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const parcel = el("span", message.kind === "file" ? "✉" : "♥", "parcel");
  parcel.setAttribute("aria-hidden", "true");
  $("pets").append(parcel);
  const flight = parcel.animate([
    { left: `${from.x * 100}%`, transform: "translate(-50%, 0)", opacity: 0 },
    { left: `${(from.x + to.x) * 50}%`, transform: "translate(-50%, -29px)", opacity: 1 },
    { left: `${to.x * 100}%`, transform: "translate(-50%, 0)", opacity: 0 },
  ], { duration: 680, easing: "ease-in-out" });
  flight.onfinish = () => parcel.remove();
}
function findPerson(id) { return overview.friends.find(row => row.id === id) || avatars.get(id)?.data; }
function upsertAvatar(data) {
  let item = avatars.get(data.id);
  if (!item) {
    const self = data.id === me;
    const node = el("button", null, self ? "avatar mine" : "avatar");
    node.type = "button";
    const name = el("span", data.name, "name-tag");
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const shadow = el("span", null, "paw-shadow");
    node.append(name, shadow, canvas);
    $("pets").append(node);
    item = { data, x: data.x, y: data.y || 0, node, name, ctx: canvas.getContext("2d"), walk: makeWalkCycle(), last: "" };
    avatars.set(data.id, item);
    if (self) bindDrag(item);
    node.addEventListener("click", () => {
      if (performance.now() < (item.suppressClick || 0)) return;
      if (self) openPanel("pets");
      else openPanel("person", data.id);
    });
  }
  if (item.pet !== data.pet) {
    item.pet = data.pet;
    item.last = "";
    warmWalk(item.pet);
  }
  item.data = data;
  if (data.id !== me) syncGuestWindows();
  if (data.id !== me) item.y = data.y || 0;
  if (data.id === me && detached) localStorage.setItem("lumpa.freePet.pet", data.pet);
  item.name.textContent = data.id === me ? `${data.name} · 我` : data.name;
  item.node.setAttribute("aria-label", data.id === me ? "我的宠物，可拖动或用方向键移动" : data.name);
}
function publish(item, walking) {
  const now = performance.now();
  if (walking && now - lastSent < 55) return;
  lastSent = now;
  item.publishedWalking = walking && online;
  if (online) transmit("room.move", { room, x: item.x, y: item.y || 0, space: detached ? "screen" : "scene", walking, facing: item.walk.facing });
  else if (!walking && isPersonalRoom() && !detached) {
    const park = personal.parks.find(park => park.id === room);
    park.x = item.x;
    park.y = item.y || 0;
    savePersonalParks(personal);
  }
}
function bindDrag(item) {
  const { node } = item;
  node.addEventListener("pointerdown", event => {
    if (event.button !== 0 || drag) return;
    drag = { id: event.pointerId, start: event.clientX, startY: event.clientY, x: item.x, y: item.y || 0, moved: false };
    node.setPointerCapture(event.pointerId);
  });
  node.addEventListener("pointermove", event => {
    if (drag?.id !== event.pointerId) return;
    const dx = event.clientX - drag.start;
    const dy = event.clientY - drag.startY;
    const width = $("pets").clientWidth;
    if ((!drag.moved && Math.hypot(dx, dy) < 4) || !width) return;
    drag.moved = true;
    if (desktop && (Math.abs(dy) > 24 || item.y > .01 || event.clientX < 72 || event.clientX > innerWidth - 72)) {
      drag = null;
      item.suppressClick = performance.now() + 400;
      node.releasePointerCapture(event.pointerId);
      detachPet(item);
      return;
    }
    const previousY = item.y;
    item.y = Math.max(0, Math.min(.82, drag.y - dy / window.innerHeight));
    const next = Math.max(0.04, Math.min(0.96, drag.x + dx / width));
    const moved = (next - item.x) * width;
    const movedY = (item.y - previousY) * window.innerHeight;
    stepWalk(item.walk, Math.hypot(moved, movedY), moved, performance.now());
    item.x = next;
    item.data.x = next;
    if (Math.hypot(moved, movedY) >= 0.15) publish(item, true);
  });
  const stop = (event) => {
    if (drag?.id !== event.pointerId) return;
    if (drag.moved) {
      item.suppressClick = performance.now() + 260;
      publish(item, false);
    }
    drag = null;
  };
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"]) node.addEventListener(event, stop);
  node.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const delta = event.key === "ArrowLeft" ? -0.023 : 0.023;
    item.x = item.data.x = Math.max(0.04, Math.min(0.96, item.x + delta));
    stepWalk(item.walk, 10, delta * 100, performance.now());
    publish(item, true);
    clearTimeout(item.stopTimer);
    item.stopTimer = setTimeout(() => { if (avatars.get(me) === item) publish(item, false); }, 140);
    queueDockPet();
  });
}
let lastFrame = performance.now();
function animate(now) {
  const blend = 1 - Math.exp(-Math.min(now - lastFrame, 100) / 58);
  lastFrame = now;
  const width = $("pets").clientWidth;
  for (const item of avatars.values()) {
    const { data, walk } = item;
    if (data.id !== me && width) {
      const next = item.x + (data.x - item.x) * blend;
      const distance = (next - item.x) * width;
      if (data.walking || Math.abs(distance) > 1.0) stepWalk(walk, Math.abs(distance), distance, now);
      if (!data.walking && Math.abs(data.x - next) < 0.0008) {
        item.x = data.x;
        walk.facing = data.facing;
      } else item.x = next;
    }
    if (data.id === me && now >= walk.until && item.publishedWalking) publish(item, false);
    const moving = now < walk.until;
    item.node.hidden = data.id === me && detached || desktop && data.id !== me && data.space === "screen";
    item.node.style.left = `${item.x * 100}%`;
    item.node.style.bottom = item.y > 0 ? `${item.y * window.innerHeight - 5}px` : "-5px";
    const idleFrame = Math.floor(now / 360) % 4;
    const key = `${item.pet}:${walk.facing}:${moving ? Math.floor(walk.phase / 8) : `idle-${idleFrame}`}`;
    if (item.last === key) continue;
    item.ctx.clearRect(0, 0, 128, 128);
    if (drawWalkingPet(item.ctx, item.pet, 64, 119, 120, walk, moving, idleFrame)) item.last = key;
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

function openPanel(next, target = "") {
  if (next !== "design") draft = null;
  page = next;
  person = target;
  $("panel").hidden = false;
  renderPanel();
  updateParkDisplay();
  resizeDesktop();
}
function closePanel() {
  draft = null;
  page = "";
  if ($("panel-content").contains($("welcome"))) document.querySelector(".neighborhood").append($("welcome"));
  $("welcome").hidden = true;
  $("panel").hidden = true;
  $("panel-content").inert = false;
  $("park-furniture").inert = false;
  updateParkDisplay();
  resizeDesktop();
}
function openChat(id) {
  messages = [];
  unread.delete(id);
  $("room-toggle").textContent = unread.size || overview.requests.length ?
    `房间与好友 · ${unread.size + overview.requests.length}` : "房间与好友";
  openPanel("chat", id);
  transmit("dm.history", { to: id });
}
function row(label, description, action) {
  const line = el("div", null, "list-row");
  const text = el("div");
  text.append(el("strong", label), el("small", description));
  line.append(text, action);
  return line;
}
function renderRooms(root) {
  if(lanInfo) {
    root.append(el("h3","局域网房主已开启"));
    for(const address of lanInfo.addresses.filter(privateService)) {
      const input=el("input");input.readOnly=true;input.value=address.replace(/^http:\/\//,"");
      const line=el("div",null,"inline-form");line.append(input,copyAction(input,"复制局域网地址","局域网地址已复制。"));root.append(line);
    }
    root.append(button("关闭局域网房主",async()=>{await native("stop_lan_host");lanInfo=null;clientStorage.setItem("lumpa.lan.hostEnabled","0");toast("局域网房主已关闭。");}));
  }
  const offline = el("div", null, "actions park-quick");
  offline.append(button("我的离线乐园", () => { enterPersonal(); closePanel(); }));
  if (!online) offline.append(button("连接好友", () => openPanel("connect")));
  if (detached) offline.append(button("叫宠物回家", returnPet));
  if (desktop) offline.append(button("打开主界面", () => native("show_main_window")));
  root.append(offline);
  if (game && !game.result) root.append(button("继续对局", () => openPanel("game"), "primary"));
  if (gameInvite?.expires > Date.now()) root.append(button("查看对战邀请", () => openPanel("challenge")));
  if (room) {
    const quick = el("div", null, "actions park-quick");
    quick.append(button(view === "park" ? "收回桌边" : "打开乐园", () => {
      setView(view === "park" ? "desk" : "park");
      closePanel();
    }), button("换宠物", () => openPanel("pets")),
    button("工位伴读", () => openPanel("focus")),
    button(desktopBackground() ? "关闭桌面背景" : "应用背景到桌面", toggleDesktopBackground));
    if (overview.rooms.find(row => row.id === room)?.code) {
      quick.append(button("邀请好友", () => openPanel("share"), "primary"));
    }
    if (owner === me) quick.append(button("布置乐园", startDesign, "primary"));
    root.append(quick);
  }
  const form = el("form", null, "inline-form");
  const title = el("input");
  title.required = true;
  title.maxLength = 36;
  title.placeholder = "为你的新乐园取名";
  title.setAttribute("aria-label", title.placeholder);
  const create = el("button", "建房", "primary");
  create.type = "submit";
  form.append(title, create);
  form.onsubmit = event => {
    event.preventDefault();
    if (title.value.trim() && transmit("room.create", { title: title.value })) closePanel();
  };
  root.append(form);
  const join = el("form", null, "inline-form join-code-form");
  const code = el("input");
  code.required = true;
  code.maxLength = 24;
  code.placeholder = "输入好友发来的房间码";
  code.setAttribute("aria-label", "房间码");
  code.autocomplete = "off";
  const enter = el("button", "加入", "quiet");
  enter.type = "submit";
  join.append(code, enter);
  join.onsubmit = event => {
    event.preventDefault();
    const normalized = code.value.replace(/[\s-]/g, "").toUpperCase();
    if (!/^[23456789A-HJ-NP-Z]{12}$/.test(normalized)) { toast("请输入 12 位房间码。"); return; }
    if (transmit("room.join", { code: normalized })) closePanel();
  };
  if (online) root.append(join);
  for (const [heading, parks] of [
    ["我的乐园", overview.rooms.filter(item => item.owner === me)],
    ["好友与受邀乐园", overview.rooms.filter(item => item.owner !== me)],
  ]) {
    if (!parks.length) continue;
    root.append(el("h3", heading));
    for (const item of parks) root.append(row(item.title, `${item.owner === me ? "" : (item.ownerName || "好友") + " · "}${item.count} 位在线`,
      button(item.id === room ? "当前房间" : "串门", () => {
        if (item.id !== room) transmit("room.join", { room: item.id });
        closePanel();
      })));
  }
  root.append(button("进门串门", () => openPanel("visits")), el("h3", "好友"));
  if (online && overview.self?.code) {
    const ownCode = el("input"); ownCode.readOnly = true; ownCode.value = overview.self.code; ownCode.id = "friend-code";
    ownCode.setAttribute("aria-label", "我的好友码");
    const codeLine = el("div", null, "inline-form"); codeLine.append(ownCode, copyAction(ownCode, "复制好友码", "好友码已复制。"));
    const add = el("form", null, "inline-form friend-code-form");
    const value = el("input"); value.placeholder = "输入好友码添加好友"; value.required = true; value.maxLength = 24;
    value.setAttribute("aria-label", "好友码");
    const submit = el("button", "添加好友", "primary"); submit.type = "submit";
    add.append(value, submit);
    add.onsubmit = event => { event.preventDefault(); if (transmit("friend.request", {code:value.value})) value.value = ""; };
    root.append(el("p", "我的好友码 · 双方连接同一个局域网房主后添加", "muted"), codeLine, add);
  }
  if (!overview.requests.length && !overview.friends.length) root.append(el("p", online ? "用好友码添加朋友，也可以点击同桌宠物加好友。" : "开启局域网或连接房主后，可以添加好友并邀请到桌面。", "muted"));
  for (const contact of overview.requests) {
    const actions = el("div", null, "actions");
    actions.append(button("接受", () => transmit("friend.reply", { to: contact.id, accept: true }), "primary"),
      button("忽略", () => transmit("friend.reply", { to: contact.id, accept: false })));
    root.append(row(contact.name, "好友申请", actions));
  }
  for (const contact of overview.friends) {
    const actions = el("div", null, "actions");
    if (contact.online) actions.append(button("邀请到桌面", () => transmit("desktop.invite", {to:contact.id}), "primary"));
    actions.append(button("互动", () => openPanel("person", contact.id)));
    root.append(row(contact.name, unread.has(contact.id) ? "有新消息" : contact.online ? "● 在线" : "离线", actions));
  }
}
function renderVisits(root) {
  root.append(el("p", "进门查看自己与好友的小屋。桌面邀请可直接同桌陪伴，串门则打开对方的完整乐园。", "muted"));
  for (const park of personal.parks) root.append(row(park.title, "保存在这台电脑", button("进入我的乐园", () => { enterPersonal(park.id); setView("park"); closePanel(); })));
  if (!online) root.append(button("连接局域网好友", () => openPanel("connect"), "primary"));
  for (const park of overview.rooms.filter(park => !personal.parks.some(local => local.id === park.id))) {
    root.append(row(park.title, `${park.ownerName || "好友"} · ${park.count} 位在线`, button("进入乐园", () => {
      if (park.id === room) setView("park");
      else { requestedPresentation = "park"; transmit("room.join", {room:park.id}); }
      closePanel();
    })));
  }
}
function renderConnection(root) {
  root.append($("welcome")); $("welcome").hidden = false;
  if (!desktop) return;
  const area=el("section",null,"lan-connect");
  area.append(el("h3","免费局域网试玩"), el("p","两台电脑连接同一个 Wi-Fi 或有线局域网。一人开启房主，另一人搜索后加入，无需购买服务器。","muted"));
  const actions=el("div",null,"actions");
  actions.append(button("开启局域网房主",async event=>{
    const target=event.currentTarget; target.disabled=true; target.textContent="正在启动…";
    try {
      lanInfo=await native("start_lan_host");
      clientStorage.setItem("lumpa.lan.hostEnabled","1");
      joinService(lanInfo.url);
      toast("局域网房主已开启。好友选择搜索局域网房主即可加入。");
    } catch(error) {toast(String(error)); target.disabled=false; target.textContent="开启局域网房主";}
  },"primary"));
  const found=el("div",null,"lan-hosts");
  actions.append(button("搜索局域网房主",async event=>{
    const target=event.currentTarget; target.disabled=true; target.textContent="正在搜索…"; found.replaceChildren();
    try {
      const hosts=await native("discover_lan_hosts");
      for(const host of hosts) found.append(row(host.name || "局域网房主",host.url,button("加入",()=>{try{joinService(host.url);}catch(error){toast(error.message);}},"primary")));
      if(!hosts.length) found.append(el("p","没有发现房主：确认房主已开启、双方在同一局域网，并允许 Windows 防火墙的专用网络访问。也可以输入下方局域网地址。","muted"));
    } catch(error){toast(String(error));}
    finally{target.disabled=false;target.textContent="搜索局域网房主";}
  }));
  const manual=el("form",null,"inline-form lan-address-form"); const address=el("input"); address.placeholder="房主地址，如 192.168.1.8:4185"; address.setAttribute("aria-label","局域网房主地址");
  const enter=el("button","加入房主","quiet"); enter.type="submit"; manual.append(address,enter);
  manual.onsubmit=event=>{event.preventDefault();try{joinService(/^https?:\/\//.test(address.value)?address.value:"http://"+address.value.trim());}catch(error){toast(error.message);}};
  area.append(actions,found,manual); root.prepend(area);
}
function renderPerson(root) {
  const contact = findPerson(person);
  if (!contact) { root.append(el("p", "对方已离开房间。", "muted")); return; }
  const connected = overview.friends.some(row => row.id === person);
  const actions = el("div", null, "person-actions");
  if (connected) {
    actions.append(button("打开私聊", () => openChat(contact.id), "primary"));
    if (contact.online) actions.append(button("邀请到我的桌面", () => transmit("desktop.invite", {to:contact.id}), "primary"));
    const visit = overview.rooms.find(item => item.id === contact.room);
    if (visit && visit.id !== room) actions.append(button("去串门", () => { requestedPresentation="park"; transmit("room.join", { room: visit.id }); closePanel(); }));
  } else actions.append(button("加为好友", () => transmit("friend.request", { to: contact.id }), "primary"));
  root.append(el("p", contact.online ? "在线" : "离线", "muted"), actions);
  if (contact.online) {
    root.append(el("h3", "发起对战"));
    for (const [id, rule] of Object.entries(gameRules)) root.append(row(rule.name, "双人对弈",
      button("邀请", () => transmit("game.invite", { to: contact.id, game: id }))));
  }
}

function renderChat(root) {
  const history = el("div", null, "message-list");
  history.id = "chat-messages";
  history.setAttribute("aria-live", "polite");
  const form = el("form", null, "inline-form");
  const input = el("input");
  input.placeholder = "发一条私信";
  input.setAttribute("aria-label", input.placeholder);
  input.maxLength = 1000;
  const send = el("button", "发送", "primary");
  send.type = "submit";
  form.append(input, send);
  form.onsubmit = event => {
    event.preventDefault();
    if (input.value.trim() && transmit("dm.text", { to: person, text: input.value })) input.value = "";
  };
  const tools = el("div", null, "actions chat-tools");
  const file = el("input");
  file.type = "file";
  file.hidden = true;
  file.onchange = () => upload(file.files[0], person);
  tools.append(file, button("传文件", () => file.click()), button("送出当前宠物", () => {
    if (transmit("dm.pet", { to: person })) toast("已送出当前宠物的副本。");
  }));
  root.append(history, form, tools);
  renderMessages();
}
function renderMessages() {
  const history = $("chat-messages");
  if (!history) return;
  const bubbles = messages.map(message => {
    const sent = message.from === me;
    const box = el("article", null, sent ? "message sent" : "message");
    box.append(el("small", sent ? "我" : findPerson(person)?.name || "好友"));
    if (message.kind === "text") box.append(el("p", message.text));
    if (message.kind === "file") {
      box.append(el("p", `✉ ${message.name} · ${Math.ceil(message.size / 1024)} KB`),
        message.expires < Date.now() ? el("small", "文件已过期") : button("下载文件", () => download(message)));
    }
    if (message.kind === "pet") {
      box.append(el("p", `宠物礼物 · ${PET_ARCHETYPES[message.pet]?.name || message.pet}`));
      if (!sent) box.append(button("收下宠物", event => {
        if (transmit("dm.pet.accept", { to: message.from, message: message.id })) event.currentTarget.disabled = true;
      }));
    }
    return box;
  });
  history.replaceChildren(...(bubbles.length ? bubbles : [el("p", "给好友打个招呼吧。", "muted")]));
  history.scrollTop = history.scrollHeight;
}
function renderFocus(root) {
  root.append(el("p", "时间完成让宠物成长，完成待办获得礼物。", "muted"));
  const timer = el("output", "", "park-focus-clock");
  timer.id = "park-focus-clock";
  timer.setAttribute("aria-live", "off");
  const form = el("div", null, "inline-form");
  const minutes = el("input");
  Object.assign(minutes, { type: "number", min: 1, max: 120, value: 25 });
  minutes.setAttribute("aria-label", "专注分钟");
  const running = focusSession.read()?.state === "focusing";
  minutes.disabled = running;
  form.append(minutes, button(running ? "提前结束" : "开始专注", async () => {
    try {
      if (running) await companion.abandonFocus();
      else await focusSession.start(minutes.value, overview.self.pet);
      renderPanel();
    } catch (error) { toast(error.message); }
  }, "primary"));
  root.append(timer, form, el("h3", "今日待办"));
  const add = el("form", null, "inline-form");
  const text = el("input");
  text.maxLength = 100;
  text.placeholder = "写下一件要完成的事";
  text.setAttribute("aria-label", "添加待办");
  const submit = el("button", "添加", "quiet");
  submit.type = "submit";
  add.append(text, submit);
  add.onsubmit = async event => {
    event.preventDefault();
    if (!text.value.trim()) return;
    await focusSession.changeTodo(engine => engine.addTodo(text.value));
    renderPanel();
  };
  root.append(add);
  for (const todo of companion.getTodayTodos()) {
    const label = el("label", null, "park-todo");
    const check = el("input");
    check.type = "checkbox";
    check.checked = todo.done;
    check.onchange = async () => {
      const result = await focusSession.changeTodo(engine => engine.toggleTodo(todo.id, check.checked));
      if (result?.gift) toast("收到礼物 · " + result.gift.name);
      renderPanel();
    };
    label.append(check, el("span", todo.text));
    root.append(label);
  }
  const pet = overview.self?.pet || initialPet();
  const growth = companion.getPetGrowthInfo(pet);
  root.append(el("p", `${growth.stage} · 已完成 ${growth.completedPomodoros} 次专注 · 收到 ${companion.stats.giftsCollected} 份礼物`, "muted"));
  root.append(el("small", "提前结束会保留原有的残留物记录。礼物与收集物可在主窗口查看。", "muted"));
  updateFocusClock();
}
function updateFocusClock() {
  const time = Math.max(0, companion.remainingSeconds);
  const text = `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`;
  if ($("park-focus-clock")) $("park-focus-clock").textContent = text;
  $("focus-mini").textContent = companion.state === "focusing" ? `专注中 · ${text}` : "工位伴读";
}
let previousFocusState;
focusSession.subscribe(session => {
  updateFocusClock();
  if (session?.state !== previousFocusState) {
    previousFocusState = session?.state;
    if (page === "focus") renderPanel();
    if (session?.state === "reward") toast("专注完成，宠物又长大一点。");
  }
});
function returnPet() {
  detached = false;
  nativePetReady = false;
  document.body.classList.remove("native-pet-ready");
  localStorage.setItem("lumpa.freePet.free", "0");
  localStorage.setItem("lumpa.freePet.active", "0");
  native("return_park_pet").then(queueDockPet).catch(error => toast(String(error)));
  const item = avatars.get(me);
  if (item) { item.y = item.data.y = 0; publish(item, false); }
}
async function detachPet(item) {
  if (detached) return;
  detached = true;
  localStorage.setItem("lumpa.freePet.pet", item.pet);
  localStorage.setItem("lumpa.freePet.active", "1");
  try { await native("open_park_pet"); }
  catch (error) { detached = false; localStorage.setItem("lumpa.freePet.active", "0"); toast(String(error)); }
}
window.addEventListener("storage", event => {
  if (event.key === "lumpa.freePet.free" && event.newValue === "1") detached = true;
  if (event.key === "lumpa.freePet.action" && event.newValue?.startsWith("select:")) openPanel("pets");
  if (event.key === "lumpa.freePet.action" && event.newValue?.startsWith("person:")) openPanel("person", event.newValue.split(":")[1]);
  if (event.key === "lumpa.freePet.active" && event.newValue === "0") returnPet();
  if (event.key === "lumpa.freePet.position" && detached) {
    try {
      const sample = JSON.parse(event.newValue);
      const item = avatars.get(me);
      if (!item) return;
      item.x = Math.min(.96, Math.max(.04, sample.x));
      item.y = sample.y;
      item.walk.facing = sample.facing;
      publish(item, sample.walking);
    } catch {}
  }
});
async function fileRequest(path, options) {
  const session = clientStorage.getItem(stateKey("session"));
  const response = await fetch(new URL(path, service), { ...options, headers: { ...options?.headers, Authorization: `Bearer ${session}` } });
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.error || "文件操作失败。");
  }
  return response;
}
function copyAction(field, label, feedback, style = "quiet") {
  return button(label, async () => {
    try { await navigator.clipboard.writeText(field.value); toast(feedback); }
    catch { field.focus(); field.select(); toast("已选中，按 Ctrl+C 复制。"); }
  }, style);
}
async function upload(file, to) {
  if (!file) return;
  if (file.size < 1 || file.size > 10 * 1024 * 1024) { toast("每个文件须在 1 字节至 10 MB 内。"); return; }
  const query = new URLSearchParams({ to, name: file.name });
  toast("宠物正在送文件…");
  try {
    await fileRequest(`/social/files?${query}`, { method: "POST", body: file });
    toast("文件已送到好友的聊天里。");
  } catch (error) { toast(error.message); }
}
async function download(message) {
  try {
    const response = await fileRequest(`/social/files/${message.fileId}`);
    const url = URL.createObjectURL(await response.blob());
    const link = el("a");
    link.href = url;
    link.download = message.name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  } catch (error) { toast(error.message); }
}

function renderGame(root) {
  const rule = gameRules[game.kind];
  const player = game.players.indexOf(me);
  const myTurn = game.turn === player;
  const result = game.result;
  const hint = result ? result.winner === me ? "你赢了！" : result.winner ? "好友赢了这一局。" :
    result.reason === "draw" ? "这一局平手。" : "对局已结束。" : myTurn ? "轮到你落子" : `等待 ${game.names[game.turn]} 落子`;
  root.append(el("p", `${game.names[0]}  ·  ${game.names[1]}  /  ${hint}`, "game-status"));
  if (game.kind === "xiangqi") {
    root.append(el("p", `${player === 0 ? "你执红，红先行" : "你执黑"}${game.check && !result ? " · 将军" : ""}`, "muted"));
    const board=el("div",null,"board xiangqi");
    const destinations=new Set(xiangqiDestinations(game.board,xiangqiFrom,player===0?1:-1));
    game.board.forEach((piece,index)=>{
      const own=Math.sign(piece)===(player===0?1:-1);
      const square=button("",()=>{
        if(own){xiangqiFrom=index;renderPanel();}
        else if(destinations.has(index)){transmit("game.move",{game:game.id,move:{from:xiangqiFrom,to:index}});xiangqiFrom=-1;}
      },"square chess-square");
      square.dataset.cell=String(index);
      square.classList.toggle("selected",index===xiangqiFrom);
      square.classList.toggle("legal",destinations.has(index));
      square.classList.toggle("last",index===game.last);
      square.disabled=!myTurn||Boolean(result)||(!own&&!destinations.has(index));
      square.setAttribute("aria-label",`第 ${Math.floor(index/9)+1} 行，第 ${index%9+1} 列 ${piece?xiangqiNames[piece]:"空位"}`);
      if(piece){const disc=el("span",xiangqiNames[piece],"chess-piece "+(piece>0?"red":"black"));square.append(disc);}
      board.append(square);
    });
    const river=el("span","楚 河　　　　 汉 界","chess-river");river.setAttribute("aria-hidden","true");board.append(river);
    root.append(board);
    if(!result) root.append(button("认输并结束",()=>transmit("game.leave",{game:game.id}),"quiet resign"));
    return;
  }
  const board = el("div", null, `board ${game.kind}`);
  board.style.setProperty("--grid", rule.size);
  game.board.forEach((value, index) => {
    const square = button("", () => transmit("game.move", { game: game.id, cell: index }), "square");
    square.dataset.stone = String(value);
    square.classList.toggle("last", index === game.last);
    square.setAttribute("aria-label", `第 ${Math.floor(index / rule.size) + 1} 行，第 ${index % rule.size + 1} 列`);
    square.disabled = Boolean(value || !myTurn || result);
    board.append(square);
  });
  root.append(board);
  if (!result) root.append(button("认输并结束", () => transmit("game.leave", { game: game.id }), "quiet resign"));
}
function renderPanel() {
  const root = $("panel-content");
  if (root.contains($("welcome"))) {
    document.querySelector(".neighborhood").append($("welcome"));
    $("welcome").hidden = true;
  }
  root.inert = Boolean(page === "design" && draft?.saving);
  $("park-furniture").inert = root.inert;
  root.replaceChildren();
  $("panel").classList.toggle("game-panel", page === "game");
  const titles = { rooms: "乐园与好友", visits: "进门串门", "desktop-invite":"好友邀你到桌面", connect: "邀请朋友来陪伴", focus: "工位伴读", pets: "选择宠物", design: "布置我的乐园", person: findPerson(person)?.name || "好友互动",
    chat: `和 ${findPerson(person)?.name || "好友"} 私聊`, challenge: "收到对战邀请",
    game: game ? gameRules[game.kind].name : "对战", share: "邀请好友来串门" };
  $("panel-title").textContent = titles[page] || "";
  switch (page) {
    case "connect": renderConnection(root); break;
    case "visits": renderVisits(root); break;
    case "desktop-invite":
      if (desktopInvite) {
        const invite=desktopInvite;
        root.append(el("p",`${invite.name}邀请你的宠物来桌面陪伴。接受后直接显示桌面场景。`));
        root.append(button("接受桌面邀请",()=>{requestedPresentation="desk";transmit("desktop.reply",{invite:invite.id,accept:true});desktopInvite=null;closePanel();},"primary"),
          button("暂时不去",()=>{transmit("desktop.reply",{invite:invite.id,accept:false});desktopInvite=null;closePanel();}));
      }
      break;
    case "focus": renderFocus(root); break;
    case "rooms": renderRooms(root); break;
    case "person": renderPerson(root); break;
    case "chat": renderChat(root); break;
    case "pets": {
      const catalog = el("div", null, "pet-catalog");
      for (const [id, pet] of Object.entries(PET_ARCHETYPES)) {
        const active = id === overview.self?.pet;
        const card = button("", () => { if (transmit("profile.pet", { pet: id })) closePanel(); }, "pet-card");
        card.dataset.pet = id;
        card.disabled = active;
        const preview = el("img");
        preview.alt = "";
        preview.src = getPetActionFrameImage(id, "idle", 0).src;
        card.append(preview, el("strong", pet.name),
          el("small", active ? "正在陪伴" : overview.pets.includes(id) ? "已收入收藏" : "带去串门"));
        catalog.append(card);
      }
      root.append(catalog);
      break;
    }
    case "design":
      if (draft) mountParkEditor(root, draft, {
        preview: updateParkDisplay, notify: toast, save: saveDesign,
        place: item => placeFurniture($("park-furniture"), item),
      });
      break;
    case "challenge": {
      const challenge = gameInvite;
      if (!challenge) break;
      root.append(el("p", `${challenge.name} 想和你玩${gameRules[challenge.kind].name}。`));
      const actions = el("div", null, "actions");
      actions.append(button("接受邀请", () => {
        transmit("game.reply", { invite: challenge.id, accept: true });
        gameInvite = null;
        closePanel();
      }, "primary"), button("婉拒", () => {
        transmit("game.reply", { invite: challenge.id, accept: false });
        gameInvite = null;
        closePanel();
      }));
      root.append(actions);
      break;
    }
    case "game": if (game) renderGame(root); break;
    case "share": {
      const active = overview.rooms.find(row => row.id === room);
      if (!active?.invite) break;
      const url = new URL("/friends.html", service);
      url.searchParams.set("invite", active.invite);
      const local = isLocalService(service);
      if (active.code) {
        const code = el("input", null, "invite-code");
        code.id = "invite-code";
        code.value = active.code;
        code.readOnly = true;
        code.setAttribute("aria-label", "此房间的房间码");
        code.addEventListener("focus", () => code.select());
        const line = el("div", null, "inline-form");
        line.append(code, copyAction(code, "复制房间码", "房间码已复制。", "primary"));
        root.append(el("p", local ? "本机试玩码只能在连接了同一服务的窗口使用。"
          : "把房间码发给好友，在「房间与好友」里输入即可加入。", "muted"), line);
      }
      const linkSection = el("details");
      linkSection.open = !local;
      linkSection.append(el("summary", local ? "本机浏览器试玩链接" : "好友没有安装桌宠？"));
      const link = el("input");
      link.id = "invite-link";
      link.value = url.href;
      link.readOnly = true;
      link.setAttribute("aria-label", "房间邀请链接");
      link.addEventListener("focus", () => link.select());
      linkSection.append(el("p", local ? "这个链接只供同一台电脑用无痕窗口测试。"
        : "把这个链接发给好友，打开浏览器就能加入。", "muted"), link,
      copyAction(link, local ? "复制本机测试链接" : "复制网页邀请", "已复制邀请链接。"));
      root.append(linkSection);
      break;
    }
  }
}
$("room-toggle").onclick = () => openPanel("rooms");
$("focus-toggle").onclick = $("focus-mini").onclick = () => openPanel("focus");
$("share").onclick = () => openPanel("share");
$("my-pet").onclick = () => openPanel("pets");
$("park-edit").onclick = startDesign;
$("view-switch").onclick = () => setView(view === "park" ? "desk" : "park");
$("panel-close").onclick = closePanel;
$("desktop-close").onclick = () => {
  closing = true;
  localStorage.setItem("lumpa.freePet.active", "0");
  native("close_social_window").catch(error => toast(String(error)));
};
window.addEventListener("keydown", event => { if (event.key === "Escape" && page) closePanel(); });
window.addEventListener("pagehide", () => {
  clearTimeout(retry);
  clearTimeout(connectTimer);
  const connection = socket;
  socket = null;
  connection?.close();
});
enterPersonal();
if (inviteCode) openPanel("connect");
if (inviteCode && savedName && clientStorage.getItem(stateKey("session"))) connect(savedName);
else if (desktop && savedName && clientStorage.getItem("lumpa.lan.hostEnabled") === "1") {
  native("start_lan_host").then(info=>{lanInfo=info;joinService(info.url);}).catch(error=>toast(String(error)));
} else if (desktop && savedName && clientStorage.getItem(stateKey("session"))) connect(savedName);
updateParkDisplay();
resizeDesktop();
