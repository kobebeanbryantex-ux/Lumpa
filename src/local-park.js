import { defaultDesign } from "./park-layout.js";

const key = "lumpa.personalParks.v1";
export function loadPersonalParks() {
  try {
    const stored = JSON.parse(localStorage.getItem(key));
    if (stored?.parks?.length) return stored;
  } catch {}
  return { active: "local-home", parks: [{ id: "local-home", title: "我的伴读乐园", design: defaultDesign(), x: .55, y: 0 }] };
}
export function savePersonalParks(parks) { localStorage.setItem(key, JSON.stringify(parks)); }
async function database() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("lumpa.personalParkMedia", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("media");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function personalMedia(action, id, file) {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("media", action === "get" ? "readonly" : "readwrite");
      const store = tx.objectStore("media");
      const request = action === "get" ? store.get(id) : action === "put" ? store.put(file, id) : store.delete(id);
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error("保存失败"));
    });
  } finally { db.close(); }
}
