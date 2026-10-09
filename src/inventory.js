/**
 * Lumpa 2.0 像素沙盒背包 (24-Slot Inventory) 与 动态行情商店管理器
 */

export const ITEM_REGISTRY = {
  // --- 种子 ---
  seed_carrot: { id: "seed_carrot", name: "胡萝卜种子", category: "seeds", icon: "🌰", price: 3, desc: "好吃的胡萝卜种子，2天成熟", cropId: "carrot" },
  seed_strawberry: { id: "seed_strawberry", name: "草莓种子", category: "seeds", icon: "🍓", price: 8, desc: "甜美草莓种子，3天成熟", cropId: "strawberry" },
  seed_pumpkin: { id: "seed_pumpkin", name: "南瓜种子", category: "seeds", icon: "🎃", price: 15, desc: "金黄南瓜种子，4天成熟", cropId: "pumpkin" },
  seed_flower: { id: "seed_flower", name: "三色花种子", category: "seeds", icon: "🌸", price: 4, desc: "漂亮的装饰花种子，2天成熟", cropId: "flower" },
  seed_magic: { id: "seed_magic", name: "魔法草种子", category: "seeds", icon: "🌟", price: 25, desc: "稀有的魔法草种子，5天成熟", cropId: "magic_grass" },

  // --- 作物与食物 ---
  carrot: { id: "carrot", name: "胡萝卜", category: "food", icon: "🥕", price: 5, fullness: 25, mood: 15, desc: "宠物最爱的脆甜胡萝卜" },
  strawberry: { id: "strawberry", name: "草莓", category: "food", icon: "🍓", price: 15, fullness: 20, mood: 25, desc: "新鲜多汁的红草莓" },
  pumpkin: { id: "pumpkin", name: "南瓜", category: "food", icon: "🎃", price: 30, fullness: 40, mood: 20, desc: "沉甸甸的黄金大南瓜" },
  flower: { id: "flower", name: "治愈三色花", category: "decor", icon: "🌸", price: 8, mood: 20, desc: "摘下来可布置房间的花朵" },
  magic_grass: { id: "magic_grass", name: "魔法草", category: "materials", icon: "🌿", price: 50, desc: "散发幽光的珍稀植物" },
  berry: { id: "berry", name: "野果", category: "food", icon: "🫐", price: 4, fullness: 15, mood: 10, desc: "野外采集的小浆果" },
  mushroom: { id: "mushroom", name: "香菇", category: "food", icon: "🍄", price: 6, fullness: 18, mood: 12, desc: "森林树荫下的鲜蘑菇" },

  // --- 烹饪与合成产物 ---
  soup: { id: "soup", name: "浓郁胡萝卜汤", category: "food", icon: "🍲", price: 20, fullness: 60, mood: 30, desc: "热腾腾的治愈暖汤" },
  cake: { id: "cake", name: "草莓奶油蛋糕", category: "food", icon: "🍰", price: 45, fullness: 50, mood: 50, desc: "超甜美的多层奶油蛋糕" },
  flower_basket: { id: "flower_basket", name: "编织花篮", category: "decor", icon: "🧺", price: 35, mood: 40, desc: "精美的手工鲜花篮" },
  toy_ball: { id: "toy_ball", name: "弹弹玩具球", category: "decor", icon: "⚽", price: 18, mood: 30, desc: "桌宠爱不释手的玩具" },
  fertilizer: { id: "fertilizer", name: "超级肥料", category: "materials", icon: "🧪", price: 12, desc: "加速作物生长 1 天" },
  lantern: { id: "lantern", name: "萤光夜灯笼", category: "decor", icon: "🏮", price: 40, desc: "夜晚散发柔和暖光的木灯笼" },
  scarf: { id: "scarf", name: "保暖小围巾", category: "materials", icon: "🧣", price: 30, desc: "雪天帮桌宠保暖的小围巾" },
  elixir: { id: "elixir", name: "全能复苏药水", category: "materials", icon: "🧪", price: 80, desc: "瞬间补满饱食、心情与精力" },

  // --- 基础材料与工具 ---
  stick: { id: "stick", name: "木树枝", category: "materials", icon: "🪵", price: 2, desc: "地上捡到的坚硬树枝" },
  cloth: { id: "cloth", name: "柔软棉布", category: "materials", icon: "🧵", price: 5, desc: "织造物品的基础布料" },
  firefly: { id: "firefly", name: "夜发光萤火虫", category: "materials", icon: "𪲲", price: 8, desc: "夜晚捕捉的发光昆虫" },

  tool_shovel: { id: "tool_shovel", name: "小铁铲", category: "tools", icon: "🪵", price: 0, desc: "用于在菜地上松土开垦" },
  tool_watercan: { id: "tool_watercan", name: "浇水壶", category: "tools", icon: "🚿", price: 0, desc: "给菜地里的农作物浇水" },
  tool_net: { id: "tool_net", name: "捕虫网", category: "tools", icon: "🕸️", price: 0, desc: "捕捉蝴蝶与萤火虫" },
  tool_basket: { id: "tool_basket", name: "采集篮", category: "tools", icon: "🧺", price: 0, desc: "收获作物与采摘野果" }
};

export class InventoryManager {
  constructor() {
    this.slots = new Array(24).fill(null); // 4x6 共 24 格
    this.selectedSlotIndex = 0;
    this.selectedTool = "hand"; // hand, shovel, watercan, net, basket
    this.initDefaultItems();
  }

  initDefaultItems() {
    // 初始赠送工具与种子
    this.addItem("seed_carrot", 5);
    this.addItem("seed_strawberry", 2);
    this.addItem("stick", 3);
  }

  addItem(itemId, count = 1) {
    const itemData = ITEM_REGISTRY[itemId];
    if (!itemData) return false;

    // 1. 查找是否已有可堆叠格子
    for (let i = 0; i < this.slots.length; i++) {
      if (this.slots[i] && this.slots[i].id === itemId) {
        this.slots[i].count += count;
        return true;
      }
    }

    // 2. 查找空格子
    for (let i = 0; i < this.slots.length; i++) {
      if (!this.slots[i]) {
        this.slots[i] = { id: itemId, count };
        return true;
      }
    }

    return false; // 背包已满
  }

  removeItem(itemId, count = 1) {
    for (let i = 0; i < this.slots.length; i++) {
      if (this.slots[i] && this.slots[i].id === itemId) {
        if (this.slots[i].count > count) {
          this.slots[i].count -= count;
        } else {
          this.slots[i] = null;
        }
        return true;
      }
    }
    return false;
  }

  getItemCount(itemId) {
    let total = 0;
    for (const slot of this.slots) {
      if (slot && slot.id === itemId) {
        total += slot.count;
      }
    }
    return total;
  }
}

export const inventory = new InventoryManager();
