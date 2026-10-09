/**
 * Lumpa 2.0 农场 3x3 菜地种植、水井打水、野外采集与 24分钟昼夜天气引擎
 */

import { inventory, ITEM_REGISTRY } from "./inventory.js";
import { lumpaAudio } from "./audio.js";

export class FarmingEngine {
  constructor() {
    // 3x3 农场菜地状态 (位于地图 x: 416, y: 240)
    this.plots = [];
    this.initPlots();

    // 水井状态 (x: 360, y: 220)
    this.well = { x: 360, y: 220, w: 48, h: 48, waterLeft: 10 };

    // 24 分钟完整昼夜系统 (1 秒 real-time = 1 分钟游戏时间)
    this.inGameMinutes = 8 * 60; // 初始 08:00 AM
    this.timeOfDay = "day"; // morning, forenoon, noon, afternoon, sunset, night
    this.sunAngle = 0; // 0 to Math.PI

    // 天气系统 (sunny, rainy, snowy)
    this.weather = "sunny";
    this.weatherTimer = 0;

    // 地图可采集物品 (野果、香菇、花朵、树枝)
    this.wildItems = [];
    this.spawnWildItems();
  }

  initPlots() {
    this.plots = [];
    const startX = 432;
    const startY = 240;
    const tileSize = 36;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        this.plots.push({
          id: r * 3 + c,
          x: startX + c * tileSize,
          y: startY + r * tileSize,
          w: 32,
          h: 32,
          state: "empty", // empty, dug, planted, watered, mature
          cropId: null,
          growthDays: 0,
          maxGrowthDays: 2,
          wateredToday: false
        });
      }
    }
  }

  // 每日刷新野外采集物
  spawnWildItems() {
    this.wildItems = [];
    const possibleTypes = ["berry", "mushroom", "flower", "stick"];
    const count = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
      const type = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
      this.wildItems.push({
        id: `wild_${Date.now()}_${i}`,
        type,
        x: 64 + Math.random() * 320,
        y: 180 + Math.random() * 200,
        icon: ITEM_REGISTRY[type] ? ITEM_REGISTRY[type].icon : "🌿"
      });
    }
  }

  // 1 秒 tick 更新 1 分钟
  updateTime(deltaSec = 1) {
    this.inGameMinutes = (this.inGameMinutes + deltaSec) % (24 * 60);

    const hours = Math.floor(this.inGameMinutes / 60);
    // 计算太阳/月亮角度 (-0.5PI 到 1.5PI)
    this.sunAngle = ((this.inGameMinutes - 6 * 60) / (12 * 60)) * Math.PI;

    if (hours >= 6 && hours < 8) this.timeOfDay = "morning";
    else if (hours >= 8 && hours < 12) this.timeOfDay = "forenoon";
    else if (hours >= 12 && hours < 14) this.timeOfDay = "noon";
    else if (hours >= 14 && hours < 17) this.timeOfDay = "afternoon";
    else if (hours >= 17 && hours < 19) this.timeOfDay = "sunset";
    else this.timeOfDay = "night";

    // 随机天气切换 (每 15 分钟)
    this.weatherTimer += deltaSec;
    if (this.weatherTimer > 900) {
      this.weatherTimer = 0;
      const r = Math.random();
      if (r < 0.2) this.weather = "rainy";
      else if (r < 0.35) this.weather = "snowy";
      else this.weather = "sunny";
    }
  }

  // 格式化输出游戏时间 (如 "08:30 AM")
  getFormattedTime() {
    const hours = Math.floor(this.inGameMinutes / 60);
    const mins = Math.floor(this.inGameMinutes % 60);
    const hh = String(hours).padStart(2, "0");
    const mm = String(mins).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  // 点击耕作菜地
  interactPlot(plot, currentTool, selectedItemId) {
    if (currentTool === "shovel" || currentTool === "tool_shovel") {
      if (plot.state === "empty") {
        plot.state = "dug";
        lumpaAudio.playSfx("dig");
        return "🌱 已使用小铁铲松土开垦！";
      }
    } else if (plot.state === "dug" && selectedItemId && selectedItemId.startsWith("seed_")) {
      const seedData = ITEM_REGISTRY[selectedItemId];
      if (seedData && inventory.removeItem(selectedItemId, 1)) {
        plot.state = "planted";
        plot.cropId = seedData.cropId;
        plot.growthDays = 0;
        const cropDays = { carrot: 2, strawberry: 3, pumpkin: 4, flower: 2, magic_grass: 5 };
        plot.maxGrowthDays = cropDays[seedData.cropId] || 2;
        lumpaAudio.playSfx("pop");
        return `🌰 成功播下 ${seedData.name}！`;
      }
    } else if (currentTool === "watercan" || currentTool === "tool_watercan") {
      if (plot.state === "planted") {
        plot.state = "watered";
        plot.wateredToday = true;
        plot.growthDays = Math.min(plot.maxGrowthDays, plot.growthDays + 1);
        if (plot.growthDays >= plot.maxGrowthDays) {
          plot.state = "mature";
        }
        lumpaAudio.playSfx("water");
        return "🚿 已给农作物浇水！";
      }
    } else if (plot.state === "mature") {
      const cropId = plot.cropId || "carrot";
      inventory.addItem(cropId, 1);
      plot.state = "empty";
      plot.cropId = null;
      plot.growthDays = 0;
      lumpaAudio.playSfx("harvest");
      return `🎉 成功收获了 ${ITEM_REGISTRY[cropId].name}！`;
    }
    return null;
  }
}

export const farmingEngine = new FarmingEngine();
