import { FocusEngine } from "./focus.js";

const canvas = document.querySelector("#preview-stage");
const status = document.querySelector("#status");
const frenchBulldogIds = new Set(["dog_french_fawn", "dog_french_black"]);
const engine = new FocusEngine({ allUnlocked: true });

// 预览不改动主应用的已选宠物、场景或声音设置。
engine.setFurnitureScene = (scene) => {
  engine.currentFurnitureScene = scene;
  engine.onDesk = false;
  engine.onCatTree = false;
  engine.isClimbing = false;
  engine.isClimbingCatTree = false;
  engine.isJumpingDown = false;
  engine.isJumpingDownTree = false;
  engine.isGroundJumping = false;
  engine.isStretching = false;
  engine.isDangling = false;
  engine.petY = 0;
  engine.walkOffset = 0;
};
engine.catAudio.isMuted = true;
engine.autoLifeEnabled = false;
engine.equipped.petId = "dog_french_fawn";
engine.catAudio.setPet("dog_french_fawn");
engine.setFurnitureScene("desk");
engine.bindStageCanvas(canvas);

let playbackTimers = [];
function stopPreviewPlayback() {
  playbackTimers.forEach(window.clearTimeout);
  playbackTimers = [];
  engine.isDangling = false;
  engine.isGroundJumping = false;
  engine.isStretching = false;
  engine.isClimbing = false;
  engine.isClimbingCatTree = false;
  engine.isJumpingDown = false;
  engine.isJumpingDownTree = false;
  engine.petY = engine.onDesk ? engine.getDeskSurfaceOffset() : engine.onCatTree ? engine.getCatTreeSurfaceOffset() : 0;
}

function later(delay, action) {
  playbackTimers.push(window.setTimeout(action, delay));
}

function select(group, id) {
  document.querySelectorAll(`[data-${group}]`).forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset[group] === id));
  });
}

document.querySelectorAll("[data-pet]").forEach((button) => button.addEventListener("click", () => {
  stopPreviewPlayback();
  engine.equipped.petId = button.dataset.pet;
  engine.catAudio.setPet(button.dataset.pet);
  engine.setFurnitureScene(engine.currentFurnitureScene);
  engine.setAction("idle", 0);
  select("pet", button.dataset.pet);
  status.textContent = `已切换为 ${button.textContent}。`;
}));

document.querySelectorAll("[data-scene]").forEach((button) => button.addEventListener("click", () => {
  stopPreviewPlayback();
  engine.setFurnitureScene(button.dataset.scene);
  select("scene", button.dataset.scene);
  status.textContent = `已切换到${button.textContent}。`;
}));

const actions = {
  flow: () => {
    if (engine.equipped.petId !== "dog_french_fawn") return;
    engine.startDangle();
    later(1300, () => engine.endDangle());
    later(2300, () => engine.setAction("sniff", 1600));
    later(4200, () => engine.setAction("rest", 600));
    later(5100, () => engine.setAction("bow", 1600));
    later(7100, () => engine.setAction("sit", 2400));
    later(9900, () => engine.setAction("wag", 1700));
    later(12100, () => engine.setAction("curious", 1700));
    later(14200, () => engine.setAction("yawn", 1700));
    later(16300, () => engine.setAction("rest", 0));
  },
  run: () => {
    if (engine.equipped.petId !== "dog_french_fawn") return;
    engine.startDangle();
    later(2300, () => engine.endDangle());
  },
  sniff: () => engine.equipped.petId === "dog_french_fawn" && engine.setAction("sniff", 2300),
  bow: () => engine.equipped.petId === "dog_french_fawn" && engine.setAction("bow", 2300),
  greet: () => engine.equipped.petId === "dog_french_fawn" && engine.setAction("greet", 2300),
  sit: () => engine.equipped.petId === "dog_french_fawn" && engine.setAction("sit", 3200),
  wag: () => engine.equipped.petId === "dog_french_fawn" && engine.setAction("wag", 2300),
  curious: () => engine.equipped.petId === "dog_french_fawn" && engine.setAction("curious", 2300),
  yawn: () => engine.equipped.petId === "dog_french_fawn" && engine.setAction("yawn", 1900),
  walk: () => engine.triggerWalkRoam(),
  jump: () => engine.triggerGroundJump(true),
  roll: () => engine.triggerRollPlay(),
  stretch: () => engine.triggerCatStretch(),
  climb: () => engine.currentFurnitureScene === "cattree"
    ? engine.triggerClimbCatTree(true)
    : engine.triggerClimbDesk(true),
  down: () => engine.onCatTree
    ? engine.triggerJumpDownCatTree(true)
    : engine.triggerJumpDown(true),
};

document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => {
  stopPreviewPlayback();
  actions[button.dataset.action]?.();
  status.textContent = `正在播放：${button.textContent}。`;
}));

const params = new URLSearchParams(location.search);
const selectedPet = params.get("pet");
const selectedScene = params.get("scene");
const selectedAction = params.get("action");
const snapshot = params.get("snapshot");
if (frenchBulldogIds.has(selectedPet)) {
  document.querySelector(`[data-pet="${selectedPet}"]`)?.click();
}
if (["desk", "cattree", "clean"].includes(selectedScene)) {
  document.querySelector(`[data-scene="${selectedScene}"]`)?.click();
}
if (Object.hasOwn(actions, selectedAction)) {
  window.setTimeout(() => document.querySelector(`[data-action="${selectedAction}"]`)?.click(), 450);
}
if (snapshot === "desk" && engine.currentFurnitureScene === "desk") {
  engine.onDesk = true;
  engine.petY = engine.getDeskSurfaceOffset();
  status.textContent = "桌面落点检查：脚掌应贴住桌面。";
}
if (snapshot === "cattree" && engine.currentFurnitureScene === "cattree") {
  engine.onCatTree = true;
  engine.walkOffset = -75;
  engine.petY = engine.getCatTreeSurfaceOffset();
  status.textContent = "猫爬架落点检查：脚掌应贴住顶层平台。";
}
