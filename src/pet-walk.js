import { getPetActionFrameImage } from "./focus.js";

const footRows = new WeakMap();
let sampleCanvas;
const refined = new Set(["dog_french_fawn", "dog_corgi_golden"]);

export function makeWalkCycle() {
  return { phase: 0, until: 0, facing: 1 };
}

export function stepWalk(walk, distance, dx, now) {
  if (distance < 0.15) return;
  if (now >= walk.until) walk.phase = 0;
  if (Math.abs(dx) >= 0.3) walk.facing = dx > 0 ? 1 : -1;
  walk.phase = (walk.phase + Math.min(distance, 28)) % 64;
  walk.until = now + 125;
}

export function warmWalk(pet) {
  for (let frame = 0; frame < 4; frame++) getPetActionFrameImage(pet, "idle", frame);
  for (let frame = 0; frame < (refined.has(pet) ? 8 : 4); frame++) getPetActionFrameImage(pet, "walk", frame);
}

function footRow(image) {
  if (footRows.has(image)) return footRows.get(image);
  sampleCanvas ||= document.createElement("canvas");
  const width = sampleCanvas.width = image.naturalWidth;
  const height = sampleCanvas.height = image.naturalHeight;
  const ctx = sampleCanvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0);
  const { data } = ctx.getImageData(0, 0, width, height);
  let foot = height;
  for (let y = height - 1; y >= 0; y--) {
    let solid = 0;
    for (let x = 0; x < width; x++) if (data[(y * width + x) * 4 + 3] >= 128) solid++;
    if (solid >= 3) { foot = y + 1; break; }
  }
  footRows.set(image, foot / height);
  return foot / height;
}

export function drawWalkingPet(ctx, pet, x, floor, size, walk, moving, idleFrame = 0) {
  const count = refined.has(pet) ? 8 : 4;
  const idle = getPetActionFrameImage(pet, "idle", idleFrame);
  let image = moving ? getPetActionFrameImage(pet, "walk", Math.floor(walk.phase * count / 64)) : idle;
  if (!image.complete || !image.naturalWidth) image = idle;
  if (!image.complete || !image.naturalWidth) return false;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(x), Math.round(floor));
  ctx.scale(walk.facing, 1);
  ctx.drawImage(image, Math.round(-size / 2), Math.round(-size * footRow(image)), size, size);
  ctx.restore();
  return true;
}
