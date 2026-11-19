import { networkInterfaces } from "node:os";

export function privateIPv4(address) {
  const parts = String(address).split(".").map(Number);
  return parts.length === 4 && parts.every(n => Number.isInteger(n) && n >= 0 && n < 256) &&
    (parts[0] === 10 || parts[0] === 127 || parts[0] === 192 && parts[1] === 168 || parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31);
}
export function broadcastAddresses(interfaces = networkInterfaces()) {
  const result = new Set();
  for (const adapter of Object.values(interfaces).flat()) {
    if (!adapter || adapter.internal || adapter.family !== "IPv4" || !privateIPv4(adapter.address)) continue;
    const ip = adapter.address.split(".").map(Number), mask = adapter.netmask.split(".").map(Number);
    if (mask.length === 4 && mask.some(n => n !== 255)) result.add(ip.map((n, i) => n | (~mask[i] & 255)).join("."));
  }
  return [...result];
}
export function publicLanUsers(clients, profile) {
  return [...clients.values()].slice(0, 24).map(client => {
    const user = profile(client.id);
    return { id: user.id, name: user.name, pet: user.pet, device: user.device || null };
  });
}
