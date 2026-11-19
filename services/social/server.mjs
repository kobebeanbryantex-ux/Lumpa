import { createServer } from "node:http";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { WebSocketServer } from "ws";
import { gameRules, playMove, createGameBoard } from "../../src/social-games.js";
import { createSocket } from "node:dgram";
import { networkInterfaces, hostname } from "node:os";
import { defaultDesign, normalizeDesign, parkMediaLimit, parkMediaTypes } from "../../src/park-layout.js";
import { broadcastAddresses, privateIPv4, publicLanUsers } from "./lan-discovery.mjs";

const host = process.env.LUMPA_SOCIAL_HOST || "127.0.0.1";
const port = Number(process.env.LUMPA_SOCIAL_PORT || 4180);
const dir = resolve(process.env.LUMPA_SOCIAL_DATA || ".social-data");
const dist = resolve("dist");
const publicTest = process.env.LUMPA_SOCIAL_PUBLIC_TEST === "1";
const lan = process.env.LUMPA_SOCIAL_LAN === "1";
const lanName = (process.env.LUMPA_SOCIAL_NAME || hostname()).slice(0, 48);
if (publicTest && !process.env.LUMPA_SOCIAL_DATA) throw new Error("Public test mode needs a dedicated data directory.");
const maxFileBytes = 10 * 1024 * 1024;
const validPet = /^([a-z][a-z0-9_]{1,55})$/;
const ttl = 7 * 24 * 3600 * 1000;
const files = resolve(dir, "files");
const backgrounds = resolve(dir, "backgrounds");
mkdirSync(files, { recursive: true });
mkdirSync(backgrounds, { recursive: true });
const statePath = resolve(dir, "state.json");
const state = existsSync(statePath) ? JSON.parse(readFileSync(statePath, "utf8")) : {
  users: {}, sessions: {}, rooms: {}, requests: {}, threads: {}, attachments: {},
};
state.serverId ||= randomUUID();
const clients = new Map();
const invites = new Map();
const desktopInvites = new Map();
const games = new Map();
const bucket = new Map();
const parkUploads = new Set();
function hasPet(pet) {
  return typeof pet === "string" && validPet.test(pet) &&
    ["v3", "v9"].some(version => existsSync(resolve(dist, `assets/pixel_companions_${version}/frames`, pet + "_idle_0.png")));
}
const keyFor = (value) => createHash("sha256").update(value).digest("hex");
const token = () => randomBytes(24).toString("base64url");
const keyPattern = /^[A-Za-z0-9_-]{32}$/;
const inviteAlphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
function friendCode(id) {
  const digest = createHash("sha256").update("lumpa-friend:" + id).digest();
  return Array.from(digest.subarray(0, 10), byte => inviteAlphabet[byte & 31]).join("").match(/.{1,5}/g).join("-");
}
function roomCode(invite) {
  const digest = createHash("sha256").update("lumpa-room:" + invite).digest();
  return Array.from(digest.subarray(0, 12), byte => inviteAlphabet[byte & 31]).join("").match(/.{4}/g).join("-");
}
const clean = (value, limit) => typeof value === "string" ? value.trim().slice(0, limit) : "";
const lookup = (row, key) => typeof key === "string" && Object.hasOwn(row, key) ? row[key] : null;
const save = () => {
  writeFileSync(statePath + ".tmp", JSON.stringify(state));
  renameSync(statePath + ".tmp", statePath);
};
const originList = new Set([
  "http://tauri.localhost", "https://tauri.localhost", "tauri://localhost",
  "http://127.0.0.1:4173", "http://localhost:4173",
  ...(process.env.LUMPA_SOCIAL_ORIGINS || "").split(",").map(value => value.trim()).filter(Boolean),
]);
function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin || originList.has(origin)) return true;
  try {
    return new URL(origin).host === req.headers.host && /^https?:\/\//.test(origin);
  } catch { return false; }
}
function send(client, type, payload = {}) {
  if (client?.socket.readyState === 1 && client.socket.bufferedAmount < 512 * 1024) {
    client.socket.send(JSON.stringify({ type, ...payload }));
  }
}
const userById = (id) => lookup(state.users, id);
function profile(id) {
  const user = userById(id);
  return user && { id, name: user.name, pet: user.pet, device: user.device || null, online: clients.has(id), code: friendCode(id) };
}
const friend = (a, b) => userById(a)?.friends.includes(b);
const canVisit = (room, id) => Boolean(room && (room.members.includes(id) || friend(id, room.owner)));
const threadKey = (a, b) => [a, b].sort().join(":");
const peers = (room) => [...clients.values()].filter(client => client.room === room);
const avatar = (client) => ({ ...profile(client.id), x: client.x, y: client.y || 0, space: client.space || "scene", facing: client.facing, walking: client.walking });
function snapshots(room) {
  if (!room) return;
  const members = peers(room);
  const avatars = members.map(avatar);
  const park = state.rooms[room];
  for (const member of members) send(member, "room.presence", { room, avatars, owner: park.owner, design: park.design || defaultDesign() });
}
function overview(client) {
  const { id } = client;
  const user = userById(id);
  send(client, "overview", {
    self: profile(id),
    nearby: lan ? publicLanUsers(clients, profile) : [],
    pets: user.pets,
    friends: user.friends.map(who => {
      const info = profile(who);
      const room = clients.get(who)?.room;
      return info && { ...info, room: canVisit(state.rooms[room], id) ? room : null };
    }).filter(Boolean),
    requests: Object.values(state.requests).filter(row => row.to === id).map(row => profile(row.from)).filter(Boolean),
    rooms: Object.values(state.rooms).filter(row => canVisit(row, id)).map(row => ({
      id: row.id, title: row.title, owner: row.owner, ownerName: profile(row.owner)?.name,
      invite: row.members.includes(id) ? row.invite : null,
      code: row.members.includes(id) ? roomCode(row.invite) : null,
      count: peers(row.id).length,
    })),
  });
}
function updateOverviews() {
  for (const client of clients.values()) overview(client);
}
function homeFor(id, initialDesign) {
  let home = Object.values(state.rooms).find(row => row.owner === id && row.home);
  if (!home) {
    home = { id: randomUUID(), title: `${userById(id).name}的桌面`, owner: id, invite: token(), members: [id], home: true,
      design: normalizeDesign(initialDesign) };
    state.rooms[home.id] = home;
    save();
  }
  return home;
}
function join(client, room) {
  if (client.room === room) { snapshots(room); return; }
  if (peers(room).length >= 24) throw new Error("这间房已经满了。");
  const last = client.room;
  client.room = room;
  const occupied=peers(room).filter(peer=>peer!==client).map(peer=>peer.x);
  const preferred=userById(client.id).positions?.[room];
  const positions=[preferred,.5,.78,.35,.18,.92,.64,.06].filter(Number.isFinite);
  client.x=positions.find(x=>occupied.every(other=>Math.abs(other-x)>=.12)) ?? (.06+(occupied.length%20)*.046);
  client.y = 0;
  client.space = "scene";
  client.walking = false;
  snapshots(last);
  snapshots(room);
  updateOverviews();
}
function appendMessage(from, to, kind, data) {
  const key = threadKey(from, to);
  const message = { id: randomUUID(), from, to, kind, time: Date.now(), ...data };
  state.threads[key] = [...(state.threads[key] || []).slice(-99), message];
  save();
  send(clients.get(from), "dm", { message });
  send(clients.get(to), "dm", { message });
}
function requireFriend(client, who) {
  if (!friend(client.id, who)) throw new Error("互相加为好友后才可以使用此功能。");
}
function getGame(client, id) {
  const game = games.get(id);
  if (!game?.players.includes(client.id)) throw new Error("对局已经结束或不存在。");
  return game;
}
function sendGame(game) {
  for (const player of game.players) send(clients.get(player), "game.state", { game });
}
function handle(client, msg) {
  const user = userById(client.id);
  const id = client.id;
  const who = clean(msg.to, 64);
  switch (msg.type) {
    case "profile.name": {
      const name = clean(msg.name, 24);
      if (!name) throw new Error("请填写昵称。");
      user.name = name;
      save();
      snapshots(client.room);
      updateOverviews();
      break;
    }
    case "room.create": {
      const title = clean(msg.title, 36);
      if (!title || Object.values(state.rooms).filter(row => row.owner === id).length >= 20) throw new Error("请填写房间名。每人最多创建 20 间。");
      const room = { id: randomUUID(), title, owner: id, invite: token(), members: [id] };
      state.rooms[room.id] = room;
      save();
      join(client, room.id);
      return;
    }
    case "room.join": {
      const invite = clean(msg.invite, 64);
      const code = clean(msg.code, 24).replace(/[\s-]/g, "").toUpperCase();
      if (invite || code) {
        const now = Date.now();
        if (now - (client.lastJoinAttempt || 0) < 400) throw new Error("等一下再试。");
        client.lastJoinAttempt = now;
      }
      let room;
      if (invite) room = keyPattern.test(invite) && Object.values(state.rooms).find(row => row.invite === invite);
      else if (code) room = /^[23456789A-HJ-NP-Z]{12}$/.test(code) && Object.values(state.rooms).find(row => roomCode(row.invite).replaceAll("-", "") === code);
      else room = lookup(state.rooms, msg.room);
      if (!room || (!invite && !code && !canVisit(room, id))) throw new Error("找不到房间。请确认房间码和好友使用的联机入口。");
      if ((invite || code) && !room.members.includes(id)) {
        if (room.members.length >= 200 || peers(room.id).length >= 24) throw new Error("这间房已经满了。");
        room.members.push(id);
        save();
      }
      join(client, room.id);
      return;
    }
    case "room.design": {
      const room = lookup(state.rooms, msg.room);
      if (!room || room.owner !== id || client.room !== room.id) throw new Error("只有当前乐园的主人能修改装修。");
      if (!Array.isArray(msg.design?.items)) throw new Error("装修布局无效。");
      const old = room.design?.media;
      const staged = room.stagedMedia;
      const requested = msg.design?.media?.id;
      const media = !requested ? null : requested === staged?.id ? staged : requested === old?.id ? old : undefined;
      if (media === undefined) throw new Error("找不到这份背景，请重新上传。");
      room.design = normalizeDesign(msg.design, media);
      if (staged?.id === media?.id) delete room.stagedMedia;
      save();
      if (old && old.id !== media?.id) rmSync(resolve(backgrounds, old.id), { force: true });
      for (const member of peers(room.id)) send(member, "room.design", { room: room.id, design: room.design });
      return;
    }
    case "room.move": {
      const now = Date.now();
      if (!client.room || msg.room !== client.room || !Number.isFinite(msg.x)) return;
      if (msg.walking && now - client.lastMove < 36) return;
      client.lastMove = now;
      client.x = Math.min(0.96, Math.max(0.04, msg.x));
      client.y = Number.isFinite(msg.y) ? Math.min(.82, Math.max(0, msg.y)) : 0;
      client.space = msg.space === "screen" ? "screen" : "scene";
      if (client.space === "screen") client.y = Number.isFinite(msg.y) ? Math.min(1, Math.max(0,msg.y)) : 0;
      client.facing = msg.facing === -1 ? -1 : 1;
      client.walking = msg.walking === true;
      userById(client.id).positions ||= {};
      userById(client.id).positions[client.room] = client.x;
      if (!client.walking) save();
      for (const peer of peers(client.room)) {
        if (peer !== client) send(peer, "room.move", { room: client.room, avatar: avatar(client) });
      }
      return;
    }
    case "profile.pet": {
      if (!hasPet(msg.pet)) throw new Error("当前版本找不到这只宠物。");
      user.pet = msg.pet;
      save();
      overview(client);
      snapshots(client.room);
      return;
    }
    case "friend.request": {
      const code = clean(msg.code, 30).replace(/[\s-]/g, "").toUpperCase();
      const target = code ? Object.keys(state.users).find(key => friendCode(key).replaceAll("-", "") === code) : who;
      if (!target || !userById(target)) throw new Error("找不到这个好友码，请确认双方已连接同一个局域网房主。");
      if (target === id) throw new Error("这是你自己的好友码。");
      if (friend(id, target)) throw new Error("你们已经是好友了。");
      if (user.friends.length >= 100 || userById(target).friends.length >= 100) throw new Error("好友数量已达上限。");
      if ([...Object.values(state.requests)].filter(row => row.from === id || row.to === target).length >= 100) throw new Error("待处理的申请过多。");
      state.requests[id + ":" + target] = { from: id, to: target };
      save();
      overview(clients.get(target) || client);
      send(client, "notice", { text: "已发出好友申请。" });
      return;
    }
    case "desktop.invite": {
      requireFriend(client, who);
      const other = clients.get(who);
      if (!other) throw new Error("好友当前离线。");
      if ([...desktopInvites.values()].some(item => item.from === id && item.to === who)) throw new Error("已发出桌面邀请，等待好友接受。");
      const home = homeFor(id);
      const invite = { id: randomUUID(), from: id, to: who, room: home.id, name: user.name, expires: Date.now() + 60000 };
      desktopInvites.set(invite.id, invite);
      join(client, home.id);
      send(client, "room.presentation", { room: home.id, mode: "desk" });
      send(other, "desktop.invite", { invite });
      send(client, "notice", { text: "桌面邀请已发出，好友接受后会来到你的桌面。" });
      return;
    }
    case "desktop.reply": {
      const invite = desktopInvites.get(msg.invite);
      if (!invite || invite.to !== id || invite.expires < Date.now()) throw new Error("桌面邀请已过期。");
      desktopInvites.delete(invite.id);
      const host = clients.get(invite.from);
      if (!msg.accept) { send(host, "notice", { text: "好友婉拒了桌面邀请。" }); return; }
      if (!host || host.room !== invite.room || !friend(id, invite.from)) throw new Error("好友已离开桌面，请重新邀请。");
      const home = state.rooms[invite.room];
      if (!home.members.includes(id)) home.members.push(id);
      save();
      join(client, home.id);
      send(client, "room.presentation", { room: home.id, mode: "desk" });
      send(host, "notice", { text: `${user.name}来到了你的桌面。` });
      return;
    }
    case "friend.reply": {
      if (!lookup(state.requests, who + ":" + id)) return;
      const other = userById(who);
      if (msg.accept && (user.friends.length >= 100 || other.friends.length >= 100)) throw new Error("好友数量已达上限。");
      delete state.requests[who + ":" + id];
      if (msg.accept && !friend(id, who)) {
        user.friends.push(who);
        other.friends.push(id);
        delete state.requests[id + ":" + who];
      }
      save();
      updateOverviews();
      return;
    }
    case "dm.history":
      requireFriend(client, who);
      send(client, "dm.history", { who, messages: state.threads[threadKey(id, who)] || [] });
      return;
    case "dm.text": {
      requireFriend(client, who);
      const text = clean(msg.text, 1000);
      if (text) appendMessage(id, who, "text", { text });
      return;
    }
    case "dm.pet":
      requireFriend(client, who);
      appendMessage(id, who, "pet", { pet: user.pet });
      return;
    case "dm.pet.accept": {
      requireFriend(client, who);
      const gift = state.threads[threadKey(id, who)]?.find(row => row.id === msg.message && row.kind === "pet" && row.to === id);
      if (!gift || !validPet.test(gift.pet)) throw new Error("找不到这份宠物礼物。");
      if (!user.pets.includes(gift.pet)) user.pets.push(gift.pet);
      save();
      overview(client);
      send(client, "notice", { text: "宠物已加入你的联机宠物列表。" });
      return;
    }
    case "game.invite": {
      const other = clients.get(who);
      if (!other || who === id || (!friend(id, who) && (!client.room || other.room !== client.room))) throw new Error("请选择在线的好友或同房成员。");
      if (!Object.hasOwn(gameRules, msg.game)) throw new Error("游戏不存在。");
      if ([...invites.values()].some(item => item.from === id && item.to === who)) throw new Error("已经发过邀请，等待对方回复。");
      if ([...invites.values()].filter(item => item.from === id || item.to === who).length >= 12) throw new Error("稍后再发新的邀请。");
      const invite = { id: randomUUID(), from: id, to: who, kind: msg.game, expires: Date.now() + 60000 };
      invites.set(invite.id, invite);
      send(other, "game.invite", { invite, name: user.name });
      send(client, "notice", { text: "已发出对战邀请。" });
      return;
    }
    case "game.reply": {
      const invite = invites.get(msg.invite);
      if (invite?.to !== id || invite.expires < Date.now()) throw new Error("邀请已过期，请重新发起。");
      invites.delete(invite.id);
      const other = clients.get(invite.from);
      if (!msg.accept) { send(other, "notice", { text: "好友婉拒了对战邀请。" }); return; }
      if (!other) throw new Error("对方已离线。");
      if ([...games.values()].some(game => !game.result && game.players.some(player => player === id || player === invite.from))) {
        throw new Error("有人还在对局中。");
      }
      const game = { id: randomUUID(), kind: invite.kind, players: [invite.from, id], names: [profile(invite.from).name, user.name],
        board: createGameBoard(invite.kind), turn: 0, result: null, updated: Date.now(), last: -1 };
      games.set(game.id, game);
      sendGame(game);
      return;
    }
    case "game.move": {
      const game = getGame(client, msg.game);
      if (!playMove(game, id, game.kind === "xiangqi" ? msg.move : msg.cell)) throw new Error("这步不符合规则，或现在还没轮到你。");
      game.updated = Date.now();
      sendGame(game);
      return;
    }
    case "game.leave": {
      const game = getGame(client, msg.game);
      if (game.result) return;
      game.result = { winner: game.players.find(player => player !== id), reason: "left" };
      game.updated = Date.now();
      sendGame(game);
      return;
    }
    default: throw new Error("无法识别这个操作。");
  }
}

function budget(req, action, limit, interval) {
  const key = (req.socket.remoteAddress || "unknown") + ":" + action;
  const now = Date.now();
  let entry = bucket.get(key);
  if (!entry || entry.until <= now) entry = { count: 0, until: now + interval };
  entry.count++;
  bucket.set(key, entry);
  return entry.count <= limit;
}
function auth(value) {
  if (typeof value !== "string" || !keyPattern.test(value)) return null;
  const id = keyFor(value);
  return lookup(state.sessions, id);
}
function authenticate(req, client, msg) {
  let session = msg.session;
  let id = auth(session);
  if (!id) {
    if (!budget(req, "signup", 30, 3600000) || Object.keys(state.users).length >= 5000) throw new Error("注册暂时达到上限。");
    const name = clean(msg.name, 24);
    if (!name) throw new Error("先填一个昵称。");
    const pet = hasPet(msg.pet) ? msg.pet : "dog_french_fawn";
    session = token();
    id = randomUUID();
    state.sessions[keyFor(session)] = id;
    state.users[id] = { name, pet, pets: [pet], friends: [] };
    save();
  }
  if (!id || !userById(id)) throw new Error("登录会话无效。");
  if (clean(msg.name, 24)) userById(id).name = clean(msg.name, 24);
  // Device IDs deduplicate public LAN cards; they never authenticate a user.
  if (lan && /^[a-z0-9-]{8,64}$/i.test(msg.device || "")) {
    userById(id).device = msg.device;
    save();
  }
  const previous = clients.get(id);
  client.id = id;
  client.room = previous?.room || null;
  client.x = previous?.x || 0.15;
  client.facing = previous?.facing || 1;
  client.walking = false;
  clients.set(id, client);
  previous?.socket.close(4001, "Opened in another window");
  send(client, "ready", { session, id, home: msg.home ? homeFor(id, msg.homeDesign).id : null });
  snapshots(client.room);
  updateOverviews();
  for (const game of games.values()) if (!game.result && game.players.includes(id)) sendGame(game);
}

const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".png": "image/png", ".webp": "image/webp",
  ".svg": "image/svg+xml", ".json": "application/json", ".ico": "image/x-icon", ".mp3": "audio/mpeg",
  ".wav": "audio/wav", ".woff2": "font/woff2", ".ogg": "audio/ogg", ".jpg": "image/jpeg" };
function failure(res, status, error) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ error }));
}
function matchesMedia(bytes, mime) {
  switch (mime) {
    case "image/png": return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    case "image/jpeg": return bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
    case "image/gif": return /^GIF8[79]a$/.test(bytes.toString("ascii", 0, 6));
    case "image/webp": return bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
    case "video/mp4": return bytes.toString("ascii", 4, 8) === "ftyp";
    case "video/webm": return bytes.subarray(0, 4).equals(Buffer.from([26, 69, 223, 163]));
    default: return false;
  }
}
async function parkMediaRoute(req, res, url) {
  const id = auth(req.headers.authorization?.replace(/^Bearer /, ""));
  if (!id) return failure(res, 401, "请重新连接后再试。");
  const match = url.pathname.match(/^\/social\/park-media\/([a-f0-9-]{36})(?:\/([a-f0-9-]{36}))?$/);
  const room = match && lookup(state.rooms, match[1]);
  if (!canVisit(room, id)) return failure(res, 404, "这份乐园背景无法访问。");
  if (req.method === "GET" && match[2]) {
    const media = room.design?.media;
    if (!media || media.id !== match[2]) return failure(res, 404, "背景已被替换。");
    const path = resolve(backgrounds, media.id);
    if (!existsSync(path)) return failure(res, 404, "背景文件暂不可用。");
    res.writeHead(200, { "Content-Type": media.mime, "Content-Length": media.size, "Cache-Control": "private, no-store" });
    const stream = createReadStream(path);
    stream.on("error", () => res.destroy());
    res.on("close", () => stream.destroy());
    stream.pipe(res);
    return;
  }
  if (req.method !== "POST" || match[2]) return failure(res, 405, "不支持的背景操作。");
  if (room.owner !== id || clients.get(id)?.room !== room.id) return failure(res, 403, "只有乐园主人能上传背景。");
  if (parkUploads.has(room.id) || parkUploads.size >= 4 || !budget(req, "park-media", 20, 3600000)) return failure(res, 429, "背景正在上传，请稍后重试。");
  const mime = req.headers["content-type"];
  const size = Number(req.headers["content-length"]);
  if (!Object.hasOwn(parkMediaTypes, mime) || !Number.isInteger(size) || size < 8 || size > parkMediaLimit) {
    return failure(res, 413, "请选择 25 MB 以内的 PNG、JPEG、GIF、WebP、MP4 或 WebM。");
  }
  parkUploads.add(room.id);
  try {
    const bytes = Buffer.allocUnsafe(size);
    let received = 0;
    for await (const chunk of req) {
      if (received + chunk.length > size) return failure(res, 413, "上传文件尺寸不符。");
      received += chunk.copy(bytes, received);
    }
    if (received !== size || !matchesMedia(bytes, mime)) return failure(res, 415, "文件内容和背景格式不符。");
    if (clients.get(id)?.room !== room.id) return failure(res, 409, "请返回你的乐园后重试。");
    const media = { id: randomUUID(), mime, size };
    const previous = room.stagedMedia;
    writeFileSync(resolve(backgrounds, media.id), bytes, { flag: "wx" });
    room.stagedMedia = { ...media, expires: Date.now() + 3600000 };
    save();
    if (previous) rmSync(resolve(backgrounds, previous.id), { force: true });
    res.writeHead(201, { "Content-Type": "application/json" }).end(JSON.stringify(media));
  } finally {
    parkUploads.delete(room.id);
  }
}
async function fileRoute(req, res, url) {
  const id = auth(req.headers.authorization?.replace(/^Bearer /, ""));
  if (!id) return failure(res, 401, "请重新连接后再试。");
  if (req.method === "POST" && url.pathname === "/social/files") {
    const to = url.searchParams.get("to");
    if (!friend(id, to)) return failure(res, 403, "只能向已添加的好友发送文件。");
    if (!budget(req, "upload", 30, 3600000) || Object.keys(state.attachments).length >= 2000) return failure(res, 429, "文件暂存已达到上限。");
    const name = clean(url.searchParams.get("name"), 180).replace(/[\u0000-\u001f<>:"/\\|?*]/g, "_");
    const size = Number(req.headers["content-length"]);
    if (!name || !Number.isInteger(size) || size < 1 || size > maxFileBytes) return failure(res, 413, "文件须在 1 字节至 10 MB 内。");
    const chunks = [];
    let count = 0;
    for await (const chunk of req) {
      count += chunk.length;
      if (count > size || count > maxFileBytes) return failure(res, 413, "文件尺寸不符。");
      chunks.push(chunk);
    }
    if (count !== size) return failure(res, 400, "上传未完成。");
    const fileId = randomUUID();
    writeFileSync(resolve(files, fileId), Buffer.concat(chunks), { flag: "wx" });
    const expires = Date.now() + ttl;
    state.attachments[fileId] = { from: id, to, name, size, expires };
    appendMessage(id, to, "file", { fileId, name, size, expires });
    res.writeHead(201).end();
    return;
  }
  const fileId = url.pathname.match(/^\/social\/files\/([a-f0-9-]{36})$/)?.[1];
  const entry = lookup(state.attachments, fileId);
  if (req.method !== "GET" || !entry || ![entry.to, entry.from].includes(id) || entry.expires < Date.now()) {
    return failure(res, 404, "文件已过期或无法访问。");
  }
  const path = resolve(files, fileId);
  if (!existsSync(path)) return failure(res, 404, "文件已过期或无法访问。");
  res.writeHead(200, { "Content-Type": "application/octet-stream", "Content-Disposition": "attachment",
    "Content-Length": entry.size, "Cache-Control": "no-store" });
  createReadStream(path).pipe(res);
}

const server = createServer({ requestTimeout: 30000, headersTimeout: 10000 }, async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/social/health") return res.writeHead(200).end("ok");
    const isParkMedia = url.pathname.startsWith("/social/park-media/");
    if (isParkMedia || url.pathname.startsWith("/social/files")) {
      if (!originAllowed(req)) return failure(res, 403, "来源未获允许。");
      if (req.headers.origin) res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
      res.setHeader("Vary", "Origin");
      if (req.method === "OPTIONS") {
        return res.writeHead(204, { "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "authorization, content-type" }).end();
      }
      return await (isParkMedia ? parkMediaRoute(req, res, url) : fileRoute(req, res, url));
    }
    if (!["GET", "HEAD"].includes(req.method)) return failure(res, 405, "不支持的请求。");
    const page = url.pathname === "/" ? "friends.html" : decodeURIComponent(url.pathname.slice(1));
    if (publicTest && page !== "friends.html" &&
        !/^assets\/(?:pixel_companions_v[3-9]\/frames\/[a-z0-9_]+\.png|social\/[a-z0-9_-]+\.png|(?:friends|focus|shared-focus|pet-walk|index|core|event|modulepreload-polyfill)-[A-Za-z0-9_-]+\.(?:css|js))$/.test(page)) {
      return failure(res, 404, "这个地址仅提供好友小屋试玩。");
    }
    if (page === "friends.html") res.setHeader("Cache-Control", "no-cache");
    const path = resolve(dist, page);
    if (!path.startsWith(dist + sep) || !existsSync(path) || !statSync(path).isFile()) return failure(res, 404, "页面不存在，请先构建网页。");
    res.setHeader("Content-Security-Policy", "default-src 'self'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'; connect-src 'self' ws: wss:; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self' 'unsafe-inline'");
    res.writeHead(200, { "Content-Type": types[extname(path)] || "application/octet-stream" });
    if (req.method === "HEAD") return res.end();
    createReadStream(path).pipe(res);
  } catch (error) {
    if (!res.headersSent) failure(res, 400, "请求未完成。");
    else res.destroy();
    if (error.code && error.code !== "ECONNRESET") console.error(error);
  }
});

const wss = new WebSocketServer({ noServer: true, maxPayload: 8192, perMessageDeflate: false });
server.on("upgrade", (req, socket, head) => {
  if (req.url !== "/social/ws" || !originAllowed(req) || wss.clients.size >= 500 || !budget(req, "socket", 120, 60000)) {
    socket.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, ws => wss.emit("connection", ws, req));
});
wss.on("connection", (socket, req) => {
  const client = { socket, alive: true, lastMove: 0, messages: 0, window: Date.now() };
  const deadline = setTimeout(() => socket.close(1008, "Hello required"), 7500);
  socket.on("error", () => {});
  socket.on("pong", () => { client.alive = true; });
  socket.lumpa = client;
  socket.on("message", (buffer, binary) => {
    if (binary || clients.get(client.id)?.socket && clients.get(client.id).socket !== socket) return;
    try {
      const now = Date.now();
      if (now - client.window > 1000) { client.window = now; client.messages = 0; }
      if (++client.messages > 45) return;
      const msg = JSON.parse(buffer.toString());
      if (!client.id) {
        if (msg?.type !== "hello") throw new Error("请先连接。");
        authenticate(req, client, msg);
        clearTimeout(deadline);
      } else if (msg && typeof msg.type === "string") handle(client, msg);
    } catch (error) { send(client, "error", { text: error instanceof SyntaxError ? "消息格式无效。" : String(error.message).slice(0, 150) }); }
  });
  socket.on("close", () => {
    clearTimeout(deadline);
    if (!client.id || clients.get(client.id) !== client) return;
    clients.delete(client.id);
    snapshots(client.room);
    updateOverviews();
  });
});
setInterval(() => {
  const now = Date.now();
  for (const ws of wss.clients) {
    if (!ws.lumpa.alive) { ws.terminate(); continue; }
    ws.lumpa.alive = false;
    ws.ping();
  }
  for (const [key, entry] of bucket) if (entry.until < now) bucket.delete(key);
  for (const [key, invite] of invites) if (invite.expires < now) invites.delete(key);
  for (const [key, invite] of desktopInvites) if (invite.expires < now) desktopInvites.delete(key);
  let cleaned = false;
  for (const [key, entry] of Object.entries(state.attachments)) {
    if (entry.expires >= now) continue;
    rmSync(resolve(files, key), { force: true });
    delete state.attachments[key];
    cleaned = true;
  }
  for (const room of Object.values(state.rooms)) {
    if (room.stagedMedia?.expires >= now || !room.stagedMedia) continue;
    rmSync(resolve(backgrounds, room.stagedMedia.id), { force: true });
    delete room.stagedMedia;
    cleaned = true;
  }
  if (cleaned) save();
  for (const [key, game] of games) {
    if (now - game.updated < (game.result ? 600000 : 3600000)) continue;
    if (!game.result) { game.result = { winner: null, reason: "expired" }; sendGame(game); }
    games.delete(key);
  }
}, 25000).unref();
server.listen(port, host, () => {
  const actualPort = server.address().port;
  const addresses = Object.values(networkInterfaces()).flat().filter(item => item.family === "IPv4" && !item.internal).map(item => `http://${item.address}:${actualPort}`);
  const info = { port: actualPort, name: lanName, addresses, broadcasts: broadcastAddresses(), serverId: state.serverId,
    version: JSON.parse(readFileSync("package.json", "utf8")).version };
  console.log(`Lumpa Social · http://${host}:${actualPort}/friends.html`);
  if (lan && process.env.LUMPA_SOCIAL_READY_FILE) writeFileSync(process.env.LUMPA_SOCIAL_READY_FILE, JSON.stringify(info));
  if (lan) {
    const discovery = createSocket({ type: "udp4", reuseAddr: true });
    discovery.on("error", error => console.warn("LAN discovery:", error.message));
    discovery.on("message", (packet, peer) => {
      try {
        const request = JSON.parse(packet.toString());
        if (packet.length <= 512 && privateIPv4(peer.address) && request.type === "lumpa-discover" &&
            typeof request.nonce === "string" && /^[a-z0-9]{16,64}$/i.test(request.nonce) &&
            budget({ socket: { remoteAddress: peer.address } }, "discovery", 12, 3000)) {
          discovery.send(JSON.stringify({ type: "lumpa-host", protocol: 2, nonce: request.nonce, port: actualPort,
            name: lanName, serverId: state.serverId, version: info.version, users: publicLanUsers(clients, profile) }), peer.port, peer.address);
        }
      } catch {}
    });
    discovery.bind(Number(process.env.LUMPA_SOCIAL_DISCOVERY_PORT || 4189), "0.0.0.0");
  }
  process.send?.({ type: "ready", port: actualPort, publicTest });
});
