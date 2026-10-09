import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { FocusEngine, PET_ARCHETYPES, PIXEL_COMPANION_IDS, PIXEL_V3_FRAME_COUNTS, FAWN_FRENCHIE_FRAME_COUNTS, getPetActionFrameImage, PIXEL_V4_TRANSITION_FRAME_COUNTS, PIXEL_ACCESSORY_ASSETS, ACCESSORY_ACTION_POSES, ACCESSORIES_ENABLED, WARDROBE_ITEMS, GIFT_REGISTRY, UNLOCK_RECIPES, TRASH_REGISTRY, CatAudioSynthesizer, PET_AUDIO_CANDIDATES } from "./focus.js";

describe("Focus Companion Engine", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  });

  afterEach(() => vi.restoreAllMocks());

  it("should preserve the original companion archetype registry", () => {
    const expected = [
      "cat_white",
      "cat_ginger_blush",
      "cat_ginger_walk",
      "cat_black_bowl",
      "cat_black_stand",
      "cat_siamese_green",
      "cat_calico_loaf",
      "cat_calico_walk",
      "cat_ragdoll_fluffy",
      "fox_fire",
      "wolf_cub",
      "cat_pointed_fluffy"
    ];

    expected.forEach(id => {
      expect(PET_ARCHETYPES[id], `Missing archetype: ${id}`).toBeDefined();
      expect(PET_ARCHETYPES[id].name).toBeTruthy();
      expect(PET_ARCHETYPES[id].baseColor).toBeTruthy();
    });

    expect(PET_ARCHETYPES.cat_white.unlocked).toBe(true);
    expect(PET_ARCHETYPES.cat_ginger_blush.unlocked).toBe(false);
  });

  it("keeps legacy accessory assets parked while exposing gifts", () => {
    expect(ACCESSORIES_ENABLED).toBe(false);
    expect(Object.keys(WARDROBE_ITEMS).length).toBeGreaterThanOrEqual(12);
    expect(Object.keys(PIXEL_ACCESSORY_ASSETS).sort()).toEqual(Object.keys(WARDROBE_ITEMS).sort());
    Object.values(PIXEL_ACCESSORY_ASSETS).forEach(asset => {
      expect(asset.src).toMatch(/^assets\/pixel_accessories_v1\/.+-source\.png$/);
      expect(asset.width).toBeGreaterThan(20);
    });
    expect(ACCESSORY_ACTION_POSES.idle).toBeDefined();
    expect(ACCESSORY_ACTION_POSES.roll).toBeUndefined();
    expect(ACCESSORY_ACTION_POSES.sleep).toBeUndefined();
    expect(Object.keys(GIFT_REGISTRY).length).toBe(10);
    expect(TRASH_REGISTRY.length).toBeGreaterThanOrEqual(3);
  });

  it("uses a named external sound pool for cats, foxes and wolf cubs", () => {
    const cat = new CatAudioSynthesizer("cat_white");
    const fox = new CatAudioSynthesizer("fox_fire");
    const wolf = new CatAudioSynthesizer("wolf_cub");

    expect(PET_AUDIO_CANDIDATES.cat.gentle).toContain("meow_gentle_01");
    expect(cat.getAudioCandidates("gentle")).toEqual(expect.arrayContaining(["meow_gentle_01", "meow_gentle_02"]));
    expect(fox.getAudioCandidates("curious")).toEqual(expect.arrayContaining(["fox_curious_01", "meow_curious_01"]));
    expect(wolf.getAudioCandidates("alert")).toEqual(expect.arrayContaining(["wolf_alert_01", "meow_alert_01"]));
  });

  it("keeps French bulldog audio distinct from cat meows", () => {
    const dog = new CatAudioSynthesizer("dog_french_fawn");
    expect(dog.getAudioCandidates("gentle")).toEqual(expect.arrayContaining(["dog_gentle_01", "dog_gentle_02"]));
    expect(dog.getAudioCandidates("gentle")).not.toContain("meow_gentle_01");
  });

  it("hides every anchored accessory while wearables are paused", () => {
    const engine = new FocusEngine();
    engine.equipped = {
      petId: "cat_white",
      head: "bear_beanie",
      face: "round_glasses",
      neck: "plaid_bowtie",
      skin: "skin_barista",
    };

    expect(engine.drawAnchoredPixelAccessories({}, 170, "cat_white", "idle")).toEqual([]);
    expect(engine.drawAnchoredPixelAccessories({}, 170, "cat_white", "roll")).toEqual([]);
    expect(engine.getEquippedAccessoryIds()).toEqual([]);
  });

  it("provides a dedicated pixel animation pack for every companion model", () => {
    expect(Object.keys(PET_ARCHETYPES)).toHaveLength(20);
    expect([...PIXEL_COMPANION_IDS].sort()).toEqual(
      Object.keys(PET_ARCHETYPES).sort(),
    );
    expect(PIXEL_V3_FRAME_COUNTS.idle).toBe(4);
    expect(PIXEL_V3_FRAME_COUNTS.walk).toBe(4);
    expect(PIXEL_V3_FRAME_COUNTS.jump).toBe(2);
    expect(PIXEL_V3_FRAME_COUNTS.roll).toBe(1);
    expect(PIXEL_V4_TRANSITION_FRAME_COUNTS.pounce).toBe(4);
    expect(PIXEL_V4_TRANSITION_FRAME_COUNTS.jump).toBe(3);
    expect(PIXEL_V4_TRANSITION_FRAME_COUNTS.walk_start).toBe(2);
    for (const id of ["dog_french_fawn", "dog_french_black"]) {
      expect(PET_ARCHETYPES[id].species).toBe("dog");
      expect(UNLOCK_RECIPES[id]).toBeDefined();
      for (const [action, count] of Object.entries(PIXEL_V3_FRAME_COUNTS)) {
        for (let frame = 0; frame < count; frame++) {
          const path = resolve(process.cwd(), "public", "assets", "pixel_companions_v3", "frames", `${id}_${action}_${frame}.png`);
          expect(existsSync(path), `${id} ${action} ${frame}`).toBe(true);
        }
      }
      for (const [action, count] of Object.entries(PIXEL_V4_TRANSITION_FRAME_COUNTS)) {
        for (let frame = 0; frame < count; frame++) {
          const path = resolve(process.cwd(), "public", "assets", "pixel_companions_v4", "frames", `${id}_${action}_${frame}.png`);
          expect(existsSync(path), `${id} transition ${action} ${frame}`).toBe(true);
        }
      }
    }
  });

  it("keeps all models open while routing only the fawn Frenchie to refined frames", () => {
    const engine = new FocusEngine({ allUnlocked: true, initialPetId: "dog_french_fawn" });
    expect(engine.equipped.petId).toBe("dog_french_fawn");
    for (const id of PIXEL_COMPANION_IDS) expect(engine.unlockedItems[id]).toBe(true);
    for (const [action, count] of Object.entries(FAWN_FRENCHIE_FRAME_COUNTS)) {
      for (let frame = 0; frame < count; frame++) {
        const version = ["sit", "wag", "curious", "yawn"].includes(action) ? "v8" : action === "walk" || action === "run" ? "v6" : ["sniff", "bow", "rest"].includes(action) ? "v7" : "v5";
        expect(existsSync(resolve(process.cwd(), "public", "assets", `pixel_companions_${version}`, "frames", `dog_french_fawn_${action}_${frame}.png`))).toBe(true);
        expect(getPetActionFrameImage("dog_french_fawn", action, frame).src).toContain(`pixel_companions_${version}/frames/dog_french_fawn_${action}_${frame}.png`);
      }
    }
    expect(getPetActionFrameImage("dog_french_fawn", "run", 1).src).toContain("pixel_companions_v6/frames/dog_french_fawn_run_1.png");
    expect(getPetActionFrameImage("dog_french_black", "run", 1).src).toContain("pixel_companions_v3/frames/dog_french_black_walk_1.png");
    for (let frame = 0; frame < 4; frame++) {
      expect(existsSync(resolve(process.cwd(), "public", "assets", "pixel_companions_v7", "frames", `dog_french_fawn_settle_${frame}.png`))).toBe(true);
    }
  });

  it("animates the fawn Frenchie in a real run cycle while dragged", () => {
    const engine = new FocusEngine({ allUnlocked: true });
    engine.equipped.petId = "dog_french_fawn";
    engine.startDangle();
    expect(engine.isDangling).toBe(true);
    expect(engine.currentAction).toBe("run");
    engine.updateAction();
    expect(engine.actionFrame).toBeGreaterThanOrEqual(0);
    expect(engine.actionFrame).toBeLessThan(8);
    engine.endDangle();
    expect(engine.isDangling).toBe(false);
    expect(engine.currentAction).toBe("rest");
    expect(engine.visualTransition.clip).toBe("settle");
  });

  it("starts the Frenchie's walk cycle after anticipation instead of a random wall-clock phase", () => {
    const clock = vi.spyOn(Date, "now").mockReturnValue(10000);
    const engine = new FocusEngine({ allUnlocked: true, initialPetId: "dog_french_fawn" });
    engine.autoLifeEnabled = false;
    engine.walkTarget = 40;
    engine.setAction("walk", 2000);
    clock.mockReturnValue(10100);
    engine.updateAction();
    expect(engine.actionFrame).toBe(0);
    expect(engine.walkOffset).toBe(0);
    clock.mockReturnValue(10325);
    engine.updateAction();
    expect(engine.actionFrame).toBe(1);
    expect(engine.walkOffset).toBeGreaterThan(0);
    expect(engine.walkOffset).toBeLessThan(0.95);
  });

  it("recovers from the actual sniff frame and gives the next pose its full duration", () => {
    const engine = new FocusEngine({ allUnlocked: true, initialPetId: "dog_french_fawn" });
    engine.setAction("sniff", 1200);
    engine.actionFrame = 2;
    engine.setAction("idle", 900);
    expect(engine.currentAction).toBe("rest");
    expect(engine.visualTransition.clip).toBe("sniff_end");
    expect(engine.visualTransition.frameSequence).toEqual([2, 1, 0]);
    expect(engine.actionDuration).toBe(1170);
  });

  it("lets dragging override an in-progress Frenchie jump without restarting it on release", () => {
    const engine = new FocusEngine({ allUnlocked: true, initialPetId: "dog_french_fawn" });
    engine.isGroundJumping = true;
    engine.petY = -20;
    engine.startDangle();
    expect(engine.isGroundJumping).toBe(false);
    expect(engine.petY).toBe(0);
    engine.endDangle();
    expect(engine.currentAction).toBe("rest");
  });

  it("holds the seated pose and reverses all sit frames before standing", () => {
    const clock = vi.spyOn(Date, "now").mockReturnValue(10000);
    const engine = new FocusEngine({ allUnlocked: true, initialPetId: "dog_french_fawn" });
    engine.autoLifeEnabled = false;
    engine.setAction("sit", 3200);
    clock.mockReturnValue(10900);
    engine.updateAction();
    expect(engine.actionFrame).toBe(3);
    clock.mockReturnValue(11900);
    engine.updateAction();
    expect(engine.actionFrame).toBe(3);
    expect(engine.petY).toBe(0);
    engine.setAction("wag", 2000);
    expect(engine.visualTransition.clip).toBe("sit_end");
    expect(engine.visualTransition.frameSequence).toEqual([3, 2, 1, 0]);
    expect(engine.actionDuration).toBe(2360);
  });

  it.each(["wag", "curious", "yawn"])("plays %s without moving the support position", (action) => {
    const clock = vi.spyOn(Date, "now").mockReturnValue(10000);
    const engine = new FocusEngine({ allUnlocked: true, initialPetId: "dog_french_fawn" });
    engine.autoLifeEnabled = false;
    engine.onDesk = true;
    engine.petY = engine.getDeskSurfaceOffset();
    const support = engine.petY;
    engine.setAction(action, 2400);
    clock.mockReturnValue(10700);
    engine.updateAction();
    expect(engine.actionFrame).toBeGreaterThan(0);
    expect(engine.actionFrame).toBeLessThan(4);
    expect(engine.petY).toBe(support);
    expect(engine.walkOffset).toBe(0);
  });

  it("keeps the running Frenchie's shadow on its current support surface", () => {
    const engine = new FocusEngine({ allUnlocked: true, initialPetId: "dog_french_fawn" });
    engine.onDesk = true;
    engine.petY = engine.getDeskSurfaceOffset();
    engine.isDangling = true;
    const context = { save: vi.fn(), restore: vi.fn(), fillRect: vi.fn() };
    engine.drawPetContactShadow(context, 100, 200, "desk");
    expect(context.fillRect.mock.calls[0][1]).toBe(200 + engine.getDeskSurfaceOffset() - 2);
  });

  it("should correctly handle duration setting and idle state", () => {
    const engine = new FocusEngine();
    expect(engine.state).toBe("idle");
    engine.setDuration(45);
    expect(engine.targetDuration).toBe(45 * 60);
    expect(engine.remainingSeconds).toBe(45 * 60);
  });

  it("should handle equipment and afford checks", () => {
    const engine = new FocusEngine();
    expect(engine.equip("pet", "cat_white")).toBe(true);
    expect(engine.equipped.petId).toBe("cat_white");

    const canAffordExpensive = engine.canAfford({ star_stone: 99 });
    expect(canAffordExpensive).toBe(false);
  });

  it("should handle cut-screen app switching triggers", () => {
    const engine = new FocusEngine();
    let triggeredSubtitle = null;
    let triggeredMood = null;

    engine.onSubtitleTrigger = (text, mood) => {
      triggeredSubtitle = text;
      triggeredMood = mood;
    };

    // Switching to game during focus triggers alert meow & subtitle
    engine.state = "focusing";
    engine.handleAppSwitch("Steam", "game");
    expect(triggeredSubtitle).toBeTruthy();
    expect(triggeredMood).toBe("alert");

    // When NOT focusing, switching apps stays completely silent
    engine.state = "idle";
    triggeredSubtitle = null;
    triggeredMood = null;
    engine.handleAppSwitch("Chrome", "other");
    expect(triggeredSubtitle).toBeNull();
    expect(triggeredMood).toBeNull();

    // Reset switch timer to simulate subsequent switch during focus
    engine.state = "focusing";
    engine.lastSwitchTime = 0;
    engine.handleAppSwitch("Visual Studio Code", "tool");
    expect(triggeredMood).toBe("purr");
  });

  it("should handle game kinematics: climbing desk, cat stretch and auto-life", () => {
    const engine = new FocusEngine();
    expect(engine.onDesk).toBe(false);
    expect(engine.petY).toBe(0);

    // 1. Trigger climb desk
    engine.triggerClimbDesk();
    expect(engine.isClimbing).toBe(true);

    // Simulate updateAction steps during climb
    while (engine.isClimbing) {
      engine.updateAction();
    }
    expect(engine.onDesk).toBe(true);
    expect(engine.petY).toBe(engine.getDeskSurfaceOffset());

    // 2. Trigger cat stretch while on desk
    engine.triggerCatStretch();
    expect(engine.isStretching).toBe(true);
    expect(engine.currentAction).toBe("stretch");

    while (engine.isStretching) {
      engine.updateAction();
    }
    expect(engine.isStretching).toBe(false);

    // 3. Trigger jump down
    engine.triggerJumpDown();
    expect(engine.isJumpingDown).toBe(true);

    while (engine.isJumpingDown) {
      engine.updateAction();
    }
    expect(engine.onDesk).toBe(false);
    expect(engine.petY).toBe(0);

    // 4. Toggle auto life
    expect(engine.autoLifeEnabled).toBe(true);
    const toggled = engine.toggleAutoLife();
    expect(toggled).toBe(false);
    expect(engine.autoLifeEnabled).toBe(false);

    // 5. Test rich stop-motion action triggers: look, wash, pounce, roll
    engine.triggerLookAround();
    expect(engine.currentAction).toBe("look");

    engine.triggerWashFace();
    expect(engine.currentAction).toBe("wash");

    engine.triggerPounceWiggle();
    expect(engine.currentAction).toBe("pounce");

    engine.triggerRollPlay();
    expect(engine.currentAction).toBe("roll");

    // 6. Test walk translation physics (cat actually moves walkOffset!)
    const initialOffset = engine.walkOffset;
    engine.triggerWalkRoam();
    expect(engine.currentAction).toBe("walk");
    expect(engine.walkTarget).not.toBe(initialOffset);

    // Run 10 frames of updateAction
    for (let i = 0; i < 10; i++) {
      engine.updateAction();
    }
    // Verify that the cat actually moved!
    expect(engine.walkOffset).not.toBe(initialOffset);
  });

  it.each(["dog_french_fawn", "dog_french_black"])("uses the shared furniture physics for %s", (petId) => {
    const engine = new FocusEngine({ allUnlocked: true });
    expect(engine.equip("pet", petId)).toBe(true);
    expect(engine.getPetFootInset(petId)).toBe(engine.getPetFootInset("cat_white"));

    engine.triggerClimbDesk(true);
    for (let i = 0; i < 80 && engine.isClimbing; i++) engine.updateAction();
    expect(engine.onDesk).toBe(true);
    expect(engine.petY).toBe(engine.getDeskSurfaceOffset());
    engine.triggerJumpDown(true);
    for (let i = 0; i < 80 && engine.isJumpingDown; i++) engine.updateAction();
    expect(engine.onDesk).toBe(false);
    expect(engine.petY).toBe(0);

    engine.triggerClimbCatTree(true);
    for (let i = 0; i < 80 && engine.isClimbingCatTree; i++) engine.updateAction();
    expect(engine.onCatTree).toBe(true);
    expect(engine.petY).toBe(engine.getCatTreeSurfaceOffset());
    engine.triggerJumpDownCatTree(true);
    for (let i = 0; i < 80 && engine.isJumpingDownTree; i++) engine.updateAction();
    expect(engine.onCatTree).toBe(false);
    expect(engine.petY).toBe(0);
  });

  it("rewards a completed todo immediately without growing the pet", () => {
    const engine = new FocusEngine();
    const todo = engine.addTodo("写完今日总结");
    const growthBefore = engine.getPetGrowthInfo().completedPomodoros;
    const giftsBefore = engine.stats.giftsCollected;

    const firstCompletion = engine.toggleTodo(todo.id, true);
    expect(firstCompletion.gift).toBeDefined();
    expect(engine.stats.giftsCollected).toBe(giftsBefore + 1);
    expect(engine.getPetGrowthInfo().completedPomodoros).toBe(growthBefore);

    engine.toggleTodo(todo.id, false);
    const repeatedCompletion = engine.toggleTodo(todo.id, true);
    expect(repeatedCompletion.gift).toBeNull();
    expect(engine.stats.giftsCollected).toBe(giftsBefore + 1);
  });

  it("grows the pet but gives no gift when only the timer completes", () => {
    const engine = new FocusEngine();
    const giftsBefore = engine.stats.giftsCollected;
    let settlement = null;
    engine.onCompleted = result => { settlement = result; };

    engine.completeFocus();

    expect(settlement.timeCompleted).toBe(true);
    expect(settlement.completedTodoCount).toBe(0);
    expect(settlement.rewardsEarned).toHaveLength(0);
    expect(settlement.growth.completedPomodoros).toBe(1);
    expect(engine.stats.giftsCollected).toBe(giftsBefore);
  });

  it("settles both growth and reward when task and timer both complete", () => {
    const engine = new FocusEngine();
    const todo = engine.addTodo("完成交互稿");
    let settlement = null;
    engine.onCompleted = result => { settlement = result; };

    engine.startFocus();
    const taskResult = engine.toggleTodo(todo.id, true);
    engine.completeFocus();

    expect(taskResult.gift).toBeDefined();
    expect(settlement.completedTodoCount).toBe(1);
    expect(settlement.rewardsEarned).toHaveLength(1);
    expect(settlement.growth.completedPomodoros).toBe(1);
  });

  it("advances from a small pet to an adult through completed pomodoros", () => {
    const engine = new FocusEngine();
    expect(engine.getPetGrowthInfo().stage).toBe("幼崽");
    expect(engine.getPetGrowthInfo().scale).toBeLessThan(1);
    for (let i = 0; i < 15; i += 1) engine.growCurrentPet();
    expect(engine.getPetGrowthInfo().stage).toBe("成年");
    expect(engine.getPetGrowthInfo().scale).toBe(1);
  });

  it("persists a trash collectible and triggers a pet reaction when focus is interrupted", () => {
    const engine = new FocusEngine();
    let interrupted = null;
    engine.onInterrupted = trash => { interrupted = trash; };

    engine.startFocus();
    engine.abandonFocus();

    expect(engine.state).toBe("interrupted");
    expect(interrupted).toBeDefined();
    expect(interrupted.count).toBe(1);
    expect(interrupted.total).toBe(1);
    expect(engine.currentAction).toBe("look");
    expect(JSON.parse(localStorage.getItem("lumpaTrashBackpackV1"))[interrupted.id]).toBe(1);
  });

  it("uses gifts to unlock and equip a complete pet model", () => {
    const engine = new FocusEngine();
    const recipe = UNLOCK_RECIPES.cat_ginger_blush;
    engine.giftBackpack = { acorn: recipe.acorn, daisy: recipe.daisy };

    expect(engine.unlockedItems.cat_ginger_blush).toBeFalsy();
    const result = engine.purchaseItem("cat_ginger_blush", true);

    expect(result.success).toBe(true);
    expect(result.alreadyOwned).toBe(false);
    expect(engine.unlockedItems.cat_ginger_blush).toBe(true);
    expect(engine.equipped.petId).toBe("cat_ginger_blush");
    expect(engine.giftBackpack.acorn).toBe(0);
    expect(engine.giftBackpack.daisy).toBe(0);
  });

  it("rejects wearable purchases while preserving old save compatibility", () => {
    localStorage.setItem("lumpaFocusEquipped", JSON.stringify({
      petId: "cat_white",
      head: "straw_hat",
      skin: "skin_detective",
    }));
    const engine = new FocusEngine();
    const result = engine.purchaseItem("skin_detective", false);

    expect(result.success).toBe(false);
    expect(result.reason).toBe("accessories-disabled");
    expect(engine.equipped.head).toBeNull();
    expect(engine.equipped.skin).toBe("default");
    expect(engine.equip("head", "straw_hat")).toBe(false);

    engine.equip("pet", "cat_white");
    const preserved = JSON.parse(localStorage.getItem("lumpaFocusEquipped"));
    expect(preserved.head).toBe("straw_hat");
    expect(preserved.skin).toBe("skin_detective");
  });

  it("keeps the internal all-unlocked mode limited to complete pet models", () => {
    const engine = new FocusEngine({ allUnlocked: true });

    expect(engine.unlockedItems.cat_black_bowl).toBe(true);
    expect(engine.unlockedItems.cat_siamese_kitten).toBe(true);
    expect(engine.unlockedItems.dog_french_fawn).toBe(true);
    expect(engine.unlockedItems.dog_french_black).toBe(true);
    expect(engine.unlockedItems.straw_hat).toBeFalsy();
    expect(engine.unlockedItems.skin_detective).toBeFalsy();
    expect(localStorage.getItem("lumpaFocusUnlockedV1")).toBeNull();
  });

  it("does not unlock a pet when gifts are insufficient", () => {
    const engine = new FocusEngine();
    const result = engine.purchaseItem("cat_black_bowl", true);

    expect(result.success).toBe(false);
    expect(result.reason).toBe("insufficient-gifts");
    expect(engine.unlockedItems.cat_black_bowl).toBeFalsy();
  });
});
