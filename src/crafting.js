/**
 * Lumpa 2.0 工作台手工合成与烹饪引擎 (Crafting & Cooking System)
 */

import { inventory, ITEM_REGISTRY } from "./inventory.js";
import { lumpaAudio } from "./audio.js";

export const CRAFTING_RECIPES = [
  {
    id: "soup",
    name: "浓郁胡萝卜汤",
    output: "soup",
    outputCount: 1,
    icon: "🍲",
    desc: "热腾腾的治愈暖汤，大幅提升饱食与心情",
    ingredients: [
      { itemId: "carrot", count: 2 }
    ]
  },
  {
    id: "cake",
    name: "草莓奶油蛋糕",
    output: "cake",
    outputCount: 1,
    icon: "🍰",
    desc: "甜美多层蛋糕，双倍满分心情与饱食",
    ingredients: [
      { itemId: "strawberry", count: 3 }
    ]
  },
  {
    id: "flower_basket",
    name: "编织花篮",
    output: "flower_basket",
    outputCount: 1,
    icon: "🧺",
    desc: "精美的手工鲜花篮，布置房间增加美观",
    ingredients: [
      { itemId: "flower", count: 5 }
    ]
  },
  {
    id: "toy_ball",
    name: "弹弹玩具球",
    output: "toy_ball",
    outputCount: 1,
    icon: "⚽",
    desc: "桌宠爱不释手的治愈弹弹球",
    ingredients: [
      { itemId: "stick", count: 3 },
      { itemId: "cloth", count: 1 }
    ]
  },
  {
    id: "fertilizer",
    name: "超级肥料",
    output: "fertilizer",
    outputCount: 1,
    icon: "🧪",
    desc: "加速农作物生长 1 天",
    ingredients: [
      { itemId: "berry", count: 2 }
    ]
  },
  {
    id: "lantern",
    name: "萤光夜灯笼",
    output: "lantern",
    outputCount: 1,
    icon: "🏮",
    desc: "夜晚散发柔和暖光的木灯笼",
    ingredients: [
      { itemId: "stick", count: 2 },
      { itemId: "firefly", count: 3 }
    ]
  },
  {
    id: "scarf",
    name: "保暖小围巾",
    output: "scarf",
    outputCount: 1,
    icon: "🧣",
    desc: "雪天帮桌宠保暖的小围巾",
    ingredients: [
      { itemId: "cloth", count: 3 }
    ]
  },
  {
    id: "elixir",
    name: "全能复苏药水",
    output: "elixir",
    outputCount: 1,
    icon: "🧪",
    desc: "瞬间补满桌宠饱食度、心情值与精力值",
    ingredients: [
      { itemId: "mushroom", count: 2 },
      { itemId: "magic_grass", count: 1 }
    ]
  }
];

export class CraftingEngine {
  canCraft(recipe) {
    for (const ing of recipe.ingredients) {
      if (inventory.getItemCount(ing.itemId) < ing.count) {
        return false;
      }
    }
    return true;
  }

  craft(recipe) {
    if (!this.canCraft(recipe)) return false;

    // 扣除材料
    for (const ing of recipe.ingredients) {
      inventory.removeItem(ing.itemId, ing.count);
    }

    // 获得产物
    inventory.addItem(recipe.output, recipe.outputCount);
    lumpaAudio.playSfx("harvest");
    return true;
  }
}

export const craftingEngine = new CraftingEngine();
