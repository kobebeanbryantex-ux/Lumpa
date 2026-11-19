export function normalizeLanAddress(value) {
  const text = String(value || "").trim();
  const input = /^https?:\/\//i.test(text) ? text : "http://" + text;
  const url = new URL(input);
  const parts = url.hostname.split(".").map(Number);
  const privateIP = parts.length === 4 && parts.every(n => Number.isInteger(n) && n >= 0 && n <= 255) &&
    (parts[0] === 10 || parts[0] === 127 || parts[0] === 192 && parts[1] === 168 || parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31);
  if (url.username || url.password || !(url.protocol === "https:" || url.protocol === "http:" && (privateIP || url.hostname === "localhost"))) {
    throw new Error("请输入局域网地址或 HTTPS 地址。");
  }
  if (url.protocol === "http:" && !url.port && !/^https?:\/\/[^/]+:\d+(?:\/|$)/i.test(input)) url.port = "4185";
  return url.origin;
}

export function collectLanUsers(hosts, selfDevice, service, selfId) {
  const users = new Map();
  for (const host of hosts) {
    let url;
    try { url = normalizeLanAddress(host.url); } catch { continue; }
    for (const user of (Array.isArray(host.users) ? host.users : []).slice(0, 24)) {
      if (!user || !/^[a-z0-9-]{8,64}$/i.test(user.id || "") || typeof user.name !== "string" ||
          !/^[a-z][a-z0-9_]{1,55}$/.test(user.pet || "")) continue;
      if (selfDevice && user.device === selfDevice || url === service && user.id === selfId) continue;
      const device = /^[a-z0-9-]{8,64}$/i.test(user.device || "") ? user.device : null;
      const key = device || `${host.serverId || url}:${user.id}`;
      if (!users.has(key) || url === service) users.set(key, { id: user.id, name: user.name.slice(0, 24), pet: user.pet, device, url });
    }
  }
  return [...users.values()].sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
}
