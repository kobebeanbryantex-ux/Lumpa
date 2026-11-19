export const furnitureCatalog = Object.freeze({
  plant: "盆栽", lantern: "落地灯", sofa: "双人沙发", "side-table": "茶几",
  bookcase: "书柜", rug: "地毯", mailbox: "信箱",
  desk: "伴读书桌",
});
export const floorOptions = Object.freeze({ oak: "暖橡木", walnut: "深胡桃", stone: "青灰石", plum: "烟紫木" });
export const tintOptions = Object.freeze({ original: "原色", sage: "鼠尾草绿", rose: "暖玫瑰", blue: "湖蓝", amber: "琥珀" });
export const backdropOptions = Object.freeze({ lake: "暮色湖畔", dusk: "山野夜色", peach: "蜜桃余晖" });
export const parkMediaTypes = Object.freeze({
  "image/png": "image", "image/jpeg": "image", "image/gif": "image", "image/webp": "image",
  "video/mp4": "video", "video/webm": "video",
});
export const parkMediaLimit = 25 * 1024 * 1024;
export const maxFurniture = 14;

export function defaultDesign() {
  return { floor: "oak", backdrop: "lake", media: null, items: [
    { id: "plant", kind: "plant", x: 0.06, scale: 1, tint: "original" },
    { id: "lantern", kind: "lantern", x: 0.105, scale: 1, tint: "original" },
    { id: "sofa", kind: "sofa", x: 0.28, scale: 1, tint: "original" },
    { id: "desk", kind: "desk", x: 0.65, scale: 1, tint: "original" },
    { id: "door", kind: "door", x: 0.957, scale: 1, tint: "original" },
  ] };
}

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export function normalizeDesign(design, media = null) {
  if (!design || !Array.isArray(design.items)) return defaultDesign();
  const ids = new Set();
  const items = [];
  for (const item of design.items.slice(0, maxFurniture)) {
    if (!item || typeof item.id !== "string" || !/^[a-z0-9_-]{1,48}$/.test(item.id) || ids.has(item.id)) continue;
    const isDoor = item.id === "door" && item.kind === "door";
    if (!isDoor && (item.id === "door" || !Object.hasOwn(furnitureCatalog, item.kind))) continue;
    ids.add(item.id);
    items.push({ id: item.id, kind: item.kind,
      x: clamp(Number.isFinite(item.x) ? item.x : 0.5, 0.035, 0.965),
      scale: clamp(Number.isFinite(item.scale) ? item.scale : 1, 0.55, 1.4),
      tint: Object.hasOwn(tintOptions, item.tint) ? item.tint : "original" });
  }
  if (!ids.has("door")) {
    if (items.length >= maxFurniture) items.pop();
    items.push(defaultDesign().items.at(-1));
  }
  return {
    items, media,
    floor: Object.hasOwn(floorOptions, design.floor) ? design.floor : "oak",
    backdrop: Object.hasOwn(backdropOptions, design.backdrop) ? design.backdrop : "lake",
  };
}
