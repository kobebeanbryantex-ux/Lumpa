/**
 * Lumpa 2.0 像素小世界 - 2D 俯视角 RPG 沙盒全功能引擎
 */

export class LumpaWorld {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.container = null;
    this.animId = null;
    this.isRunning = false;

    // 虚拟离屏 Buffer Canvas (320x180 像素离屏渲染)
    this.bufferCanvas = document.createElement("canvas");
    this.bufferCanvas.width = 320;
    this.bufferCanvas.height = 180;
    this.bufferCtx = this.bufferCanvas.getContext("2d");
    this.bufferCtx.imageSmoothingEnabled = false;

    // 地图与场景配置 (640x400)
    this.TILE_SIZE = 16;
    this.COLS = 40;
    this.ROWS = 25;
    this.WORLD_WIDTH = this.COLS * this.TILE_SIZE;  // 640px
    this.WORLD_HEIGHT = this.ROWS * this.TILE_SIZE; // 400px

    this.currentMapIndex = 0;
    this.collectedCoinsCount = 0;
    this.frameCount = 0;
    this.petName = "白兔棉棉";

    // 绑定函数引用
    this.loop = this.loop.bind(this);
    this.resize = this.resize.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    // 音频控制
    this.audioCtx = null;
    this.bgmMuted = false;

    // 角色物理数据
    this.player = {
      x: 48,
      y: 32,
      vx: 0,
      vy: 0,
      width: 12,
      height: 12,
      accel: 0.35,
      friction: 0.88,
      maxSpeed: 2.2,
      direction: "down"
    };

    this.keys = { up: false, down: false, left: false, right: false };
    this.camera = { x: 0, y: 0, width: 320, height: 180 };
    this.particles = [];

    this.initMapsAndEntities();
  }

  // =============================================================
  // 🗺️ 地图、实体、金币与树木初始化
  // =============================================================
  initMapsAndEntities() {
    // ----------------- 地图 1：晴空阳关森林 -----------------
    this.map1 = [];
    for (let r = 0; r < this.ROWS; r++) {
      const row = [];
      for (let c = 0; c < this.COLS; c++) {
        if (r === 0 || r === this.ROWS - 1 || c === 0 || c === this.COLS - 1) row.push(1);
        else if ((r === 13 || r === 14) && !(c >= 18 && c <= 21)) row.push(4);
        else if ((r === 13 || r === 14) && (c >= 18 && c <= 21)) row.push(2);
        else if ((r === 3 && c >= 2 && c <= 37) || (c === 19 && r >= 3 && r <= 22) || (r === 21 && c >= 2 && c <= 37)) row.push(3);
        else if ((r === 7 && c >= 5 && c <= 15) || (r === 7 && c >= 23 && c <= 33) || (r === 17 && c >= 6 && c <= 15) || (r === 17 && c >= 24 && c <= 34)) row.push(1);
        else row.push(0);
      }
      this.map1.push(row);
    }

    this.trees1 = [];
    const treeCoords1 = [
      { c: 2, r: 1, t: "broadleaf" },  { c: 5, r: 1, t: "pine" },       { c: 8, r: 1, t: "broadleaf" },
      { c: 25, r: 1, t: "pine" },      { c: 29, r: 1, t: "broadleaf" }, { c: 34, r: 1, t: "pine" },
      { c: 2, r: 6, t: "pine" },       { c: 16, r: 6, t: "broadleaf" }, { c: 22, r: 6, t: "pine" }, { c: 36, r: 6, t: "broadleaf" },
      { c: 2, r: 10, t: "broadleaf" }, { c: 12, r: 10, t: "pine" },     { c: 27, r: 10, t: "broadleaf" },{ c: 37, r: 10, t: "pine" },
      { c: 2, r: 16, t: "pine" },      { c: 16, r: 16, t: "broadleaf" },{ c: 23, r: 16, t: "pine" }, { c: 37, r: 16, t: "broadleaf" },
      { c: 2, r: 20, t: "broadleaf" }, { c: 7, r: 22, t: "pine" },      { c: 14, r: 22, t: "broadleaf" },{ c: 24, r: 22, t: "pine" },
      { c: 31, r: 22, t: "broadleaf" }
    ];
    treeCoords1.forEach(tc => {
      this.trees1.push({
        x: tc.c * this.TILE_SIZE, y: tc.r * this.TILE_SIZE, type: tc.t,
        trunkX: tc.c * this.TILE_SIZE + 4, trunkY: tc.r * this.TILE_SIZE + 18, trunkW: 8, trunkH: 8
      });
    });

    this.props1 = [];
    this.sunSpots1 = [];
    for (let r = 1; r < this.ROWS - 1; r++) {
      for (let c = 1; c < this.COLS - 1; c++) {
        if (this.map1[r][c] === 0 || this.map1[r][c] === 3) {
          const rand = Math.random();
          const px = c * this.TILE_SIZE + Math.floor(Math.random() * 8);
          const py = r * this.TILE_SIZE + Math.floor(Math.random() * 8);
          if (rand < 0.12) this.props1.push({ type: "flower_white", x: px, y: py });
          else if (rand < 0.22) this.props1.push({ type: "flower_yellow", x: px, y: py });
          else if (rand < 0.32) this.props1.push({ type: "stone", x: px, y: py });
          else if (rand < 0.50) this.props1.push({ type: "grass_clump", x: px, y: py });
          if (rand > 0.86) this.sunSpots1.push({ x: c * this.TILE_SIZE + 8, y: r * this.TILE_SIZE + 8, radius: 14 + Math.random() * 8 });
        }
      }
    }
    this.portal1 = { x: 36 * this.TILE_SIZE, y: 22 * this.TILE_SIZE, targetMap: 1, targetX: 48, targetY: 32 };


    // ----------------- 地图 2：幽静紫月深林 -----------------
    this.map2 = [];
    for (let r = 0; r < this.ROWS; r++) {
      const row = [];
      for (let c = 0; c < this.COLS; c++) {
        if (r === 0 || r === this.ROWS - 1 || c === 0 || c === this.COLS - 1) row.push(1);
        else if ((c === 10 || c === 30) && (r >= 5 && r <= 19)) row.push(1);
        else if (r === 12 && (c >= 11 && c <= 29)) row.push(3);
        else row.push(0);
      }
      this.map2.push(row);
    }

    this.trees2 = [];
    const treeCoords2 = [
      { c: 3, r: 2, t: "shadow_oak" },  { c: 7, r: 3, t: "violet_pine" }, { c: 14, r: 2, t: "shadow_oak" },
      { c: 24, r: 2, t: "violet_pine" },{ c: 33, r: 3, t: "shadow_oak" }, { c: 36, r: 2, t: "violet_pine" },
      { c: 3, r: 8, t: "violet_pine" }, { c: 17, r: 7, t: "shadow_oak" }, { c: 23, r: 8, t: "violet_pine" }, { c: 36, r: 9, t: "shadow_oak" },
      { c: 4, r: 15, t: "shadow_oak" }, { c: 15, r: 16, t: "violet_pine" },{ c: 25, r: 15, t: "shadow_oak" }, { c: 35, r: 16, t: "violet_pine" },
      { c: 3, r: 21, t: "violet_pine" },{ c: 18, r: 21, t: "shadow_oak" }, { c: 33, r: 21, t: "violet_pine" }
    ];
    treeCoords2.forEach(tc => {
      this.trees2.push({
        x: tc.c * this.TILE_SIZE, y: tc.r * this.TILE_SIZE, type: tc.t,
        trunkX: tc.c * this.TILE_SIZE + 4, trunkY: tc.r * this.TILE_SIZE + 18, trunkW: 8, trunkH: 8
      });
    });

    this.props2 = [];
    this.moonSpots = [];
    for (let r = 1; r < this.ROWS - 1; r++) {
      for (let c = 1; c < this.COLS - 1; c++) {
        if (this.map2[r][c] === 0 || this.map2[r][c] === 3) {
          const rand = Math.random();
          const px = c * this.TILE_SIZE + Math.floor(Math.random() * 8);
          const py = r * this.TILE_SIZE + Math.floor(Math.random() * 8);
          if (rand < 0.15) this.props2.push({ type: "flower_magenta", x: px, y: py });
          else if (rand < 0.30) this.props2.push({ type: "shroom_cyan", x: px, y: py });
          else if (rand < 0.42) this.props2.push({ type: "stone_moss", x: px, y: py });
          if (rand > 0.85) this.moonSpots.push({ x: c * this.TILE_SIZE + 8, y: r * this.TILE_SIZE + 8, radius: 16 + Math.random() * 8 });
        }
      }
    }
    this.portal2 = { x: 3 * this.TILE_SIZE, y: 3 * this.TILE_SIZE, targetMap: 0, targetX: 560, targetY: 340 };

    // ----------------- 20 个金币散布 -----------------
    this.coins = [];
    const coinSpawns1 = [
      { c: 4, r: 3 }, { c: 12, r: 5 }, { c: 22, r: 3 }, { c: 32, r: 5 },
      { c: 8, r: 15 }, { c: 19, r: 11 }, { c: 28, r: 15 }, { c: 35, r: 18 },
      { c: 10, r: 21 }, { c: 25, r: 21 }
    ];
    const coinSpawns2 = [
      { c: 5, r: 5 }, { c: 15, r: 4 }, { c: 25, r: 5 }, { c: 35, r: 4 },
      { c: 8, r: 11 }, { c: 20, r: 12 }, { c: 32, r: 11 }, { c: 6, r: 18 },
      { c: 20, r: 18 }, { c: 34, r: 19 }
    ];

    let coinId = 0;
    coinSpawns1.forEach(cs => {
      this.coins.push({ id: coinId++, mapIndex: 0, x: cs.c * this.TILE_SIZE + 4, y: cs.r * this.TILE_SIZE + 4, collected: false });
    });
    coinSpawns2.forEach(cs => {
      this.coins.push({ id: coinId++, mapIndex: 1, x: cs.c * this.TILE_SIZE + 4, y: cs.r * this.TILE_SIZE + 4, collected: false });
    });
  }

  // =============================================================
  // 🔊 8-Bit Web Audio API 音效与音乐合成器
  // =============================================================
  initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  playCoinSound() {
    if (this.bgmMuted) return;
    this.initAudio();
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(1318.51, now);
      osc.frequency.setValueAtTime(1975.53, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  playVictorySound() {
    if (this.bgmMuted) return;
    this.initAudio();
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const now = this.audioCtx.currentTime + idx * 0.12;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      });
    } catch (e) {}
  }

  playBGMStep() {
    if (!this.isRunning || this.bgmMuted || !this.audioCtx || this.audioCtx.state !== "running") return;
    try {
      const dayNotes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
      const nightNotes = [220.00, 261.63, 329.63, 440.00, 329.63, 261.63];
      const notes = this.currentMapIndex === 0 ? dayNotes : nightNotes;
      const freq = notes[this.frameCount % notes.length];

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = this.currentMapIndex === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  toggleBGM() {
    this.initAudio();
    this.bgmMuted = !this.bgmMuted;
    const btn = document.getElementById("worldBgmBtn");
    if (btn) btn.innerText = this.bgmMuted ? "🔇 BGM: 静音" : "🎵 BGM: 开启";
  }

  // =============================================================
  // 🎮 引擎初始化 (Engine Init)
  // =============================================================
  init(canvas, container, petName, petImageSrc) {
    this.canvas = canvas || document.getElementById("worldCanvas");
    this.container = container || document.getElementById("worldCanvasWrapper");
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;

    if (petName) this.petName = petName;
    const petTag = document.getElementById("worldPetTag");
    if (petTag) petTag.innerText = `操控中：${this.petName}`;

    this.resize();
    window.addEventListener("resize", this.resize);
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);

    // 音频唤醒
    const bgmBtn = document.getElementById("worldBgmBtn");
    if (bgmBtn) bgmBtn.onclick = () => this.toggleBGM();

    const restartBtn = document.getElementById("worldRestartBtn");
    if (restartBtn) restartBtn.onclick = () => this.restartGame();
  }

  start() {
    this.isRunning = true;
    if (!this.animId) {
      this.loop();
    }
  }

  pause() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  resize() {
    if (!this.container || !this.canvas) return;
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = Math.floor(rect.width) || 960;
    this.canvas.height = Math.floor(rect.height) || 540;
    if (this.ctx) this.ctx.imageSmoothingEnabled = false;
  }

  // =============================================================
  // 🕹️ 物理与碰撞逻辑
  // =============================================================
  handleKeyDown(e) {
    if (!this.isRunning) return;
    this.initAudio();
    const k = e.key.toLowerCase();
    if (k === "w" || k === "arrowup") { this.keys.up = true; e.preventDefault(); }
    if (k === "s" || k === "arrowdown") { this.keys.down = true; e.preventDefault(); }
    if (k === "a" || k === "arrowleft") { this.keys.left = true; e.preventDefault(); }
    if (k === "d" || k === "arrowright") { this.keys.right = true; e.preventDefault(); }
  }

  handleKeyUp(e) {
    const k = e.key.toLowerCase();
    if (k === "w" || k === "arrowup") this.keys.up = false;
    if (k === "s" || k === "arrowdown") this.keys.down = false;
    if (k === "a" || k === "arrowleft") this.keys.left = false;
    if (k === "d" || k === "arrowright") this.keys.right = false;
  }

  isWalkable(checkX, checkY) {
    const currentMap = this.currentMapIndex === 0 ? this.map1 : this.map2;
    const currentTrees = this.currentMapIndex === 0 ? this.trees1 : this.trees2;

    const margin = 1;
    const corners = [
      { x: checkX + margin, y: checkY + margin },
      { x: checkX + this.player.width - margin, y: checkY + margin },
      { x: checkX + margin, y: checkY + this.player.height - margin },
      { x: checkX + this.player.width - margin, y: checkY + this.player.height - margin }
    ];

    for (const pt of corners) {
      if (pt.x < this.TILE_SIZE || pt.x >= this.WORLD_WIDTH - this.TILE_SIZE) return false;
      if (pt.y < this.TILE_SIZE || pt.y >= this.WORLD_HEIGHT - this.TILE_SIZE) return false;

      const col = Math.floor(pt.x / this.TILE_SIZE);
      const row = Math.floor(pt.y / this.TILE_SIZE);
      if (row < 0 || row >= this.ROWS || col < 0 || col >= this.COLS) return false;
      if (currentMap[row][col] === 1) return false;
    }

    for (const t of currentTrees) {
      if (
        checkX < t.trunkX + t.trunkW &&
        checkX + this.player.width > t.trunkX &&
        checkY < t.trunkY + t.trunkH &&
        checkY + this.player.height > t.trunkY
      ) {
        return false;
      }
    }
    return true;
  }

  checkCoinPickups() {
    for (const coin of this.coins) {
      if (coin.mapIndex === this.currentMapIndex && !coin.collected) {
        const dist = Math.hypot(
          (this.player.x + this.player.width / 2) - (coin.x + 4),
          (this.player.y + this.player.height / 2) - (coin.y + 4)
        );

        if (dist < 10) {
          coin.collected = true;
          this.collectedCoinsCount++;
          this.playCoinSound();

          const counter = document.getElementById("worldCoinCount");
          if (counter) counter.innerText = this.collectedCoinsCount;

          if (this.collectedCoinsCount >= 20) {
            this.playVictorySound();
            const overlay = document.getElementById("worldVictoryOverlay");
            if (overlay) overlay.style.display = "flex";
          }
        }
      }
    }
  }

  checkPortalTeleport() {
    const activePortal = this.currentMapIndex === 0 ? this.portal1 : this.portal2;
    const dist = Math.hypot(
      (this.player.x + this.player.width / 2) - (activePortal.x + 8),
      (this.player.y + this.player.height / 2) - (activePortal.y + 8)
    );

    if (dist < 14) {
      this.currentMapIndex = activePortal.targetMap;
      this.player.x = activePortal.targetX;
      this.player.y = activePortal.targetY;
      this.player.vx = 0;
      this.player.vy = 0;

      const tag = document.getElementById("worldMapNameTag");
      if (tag) tag.innerText = this.currentMapIndex === 0 ? "📍 晴空阳关森林" : "🔮 幽静紫月深林";
    }
  }

  updatePhysics() {
    if (this.keys.up) { this.player.vy -= this.player.accel; this.player.direction = "up"; }
    if (this.keys.down) { this.player.vy += this.player.accel; this.player.direction = "down"; }
    if (this.keys.left) { this.player.vx -= this.player.accel; this.player.direction = "left"; }
    if (this.keys.right) { this.player.vx += this.player.accel; this.player.direction = "right"; }

    this.player.vx *= this.player.friction;
    this.player.vy *= this.player.friction;

    const speed = Math.hypot(this.player.vx, this.player.vy);
    if (speed > this.player.maxSpeed) {
      this.player.vx = (this.player.vx / speed) * this.player.maxSpeed;
      this.player.vy = (this.player.vy / speed) * this.player.maxSpeed;
    }

    if (Math.abs(this.player.vx) < 0.01) this.player.vx = 0;
    if (Math.abs(this.player.vy) < 0.01) this.player.vy = 0;

    if (this.player.vx !== 0) {
      const nextX = this.player.x + this.player.vx;
      if (this.isWalkable(nextX, this.player.y)) this.player.x = nextX;
      else this.player.vx = 0;
    }

    if (this.player.vy !== 0) {
      const nextY = this.player.y + this.player.vy;
      if (this.isWalkable(this.player.x, nextY)) this.player.y = nextY;
      else this.player.vy = 0;
    }

    this.checkCoinPickups();
    this.checkPortalTeleport();
  }

  updateCamera() {
    const targetX = this.player.x + this.player.width / 2 - this.camera.width / 2;
    const targetY = this.player.y + this.player.height / 2 - this.camera.height / 2;
    this.camera.x += (targetX - this.camera.x) * 0.15;
    this.camera.y += (targetY - this.camera.y) * 0.15;
    this.camera.x = Math.max(0, Math.min(this.WORLD_WIDTH - this.camera.width, this.camera.x));
    this.camera.y = Math.max(0, Math.min(this.WORLD_HEIGHT - this.camera.height, this.camera.y));
  }

  restartGame() {
    this.collectedCoinsCount = 0;
    this.coins.forEach(c => c.collected = false);
    this.currentMapIndex = 0;
    this.player.x = 48;
    this.player.y = 32;
    this.player.vx = 0;
    this.player.vy = 0;

    const counter = document.getElementById("worldCoinCount");
    if (counter) counter.innerText = "0";
    const overlay = document.getElementById("worldVictoryOverlay");
    if (overlay) overlay.style.display = "none";
    const tag = document.getElementById("worldMapNameTag");
    if (tag) tag.innerText = "📍 晴空阳关森林";
  }

  // =============================================================
  // 🖥️ 迷你小地图渲染
  // =============================================================
  drawMinimap() {
    const miniCanvas = document.getElementById("worldMinimapCanvas");
    if (!miniCanvas) return;
    const mCtx = miniCanvas.getContext("2d");
    mCtx.imageSmoothingEnabled = false;
    mCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);

    const activeMap = this.currentMapIndex === 0 ? this.map1 : this.map2;
    const activeTrees = this.currentMapIndex === 0 ? this.trees1 : this.trees2;
    const activePortal = this.currentMapIndex === 0 ? this.portal1 : this.portal2;

    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        const type = activeMap[r][c];
        const mx = c * 2;
        const my = r * 2;

        if (this.currentMapIndex === 0) {
          if (type === 0) mCtx.fillStyle = "#4CAF50";
          else if (type === 1) mCtx.fillStyle = "#37474F";
          else if (type === 2 || type === 3) mCtx.fillStyle = "#B0BEC5";
          else if (type === 4) mCtx.fillStyle = "#0288D1";
        } else {
          if (type === 0) mCtx.fillStyle = "#2E4A3E";
          else if (type === 1) mCtx.fillStyle = "#1A237E";
          else if (type === 3) mCtx.fillStyle = "#8E24AA";
        }
        mCtx.fillRect(mx, my, 2, 2);
      }
    }

    mCtx.fillStyle = "#FFD54F";
    for (const coin of this.coins) {
      if (coin.mapIndex === this.currentMapIndex && !coin.collected) {
        const mx = Math.floor((coin.x / this.WORLD_WIDTH) * miniCanvas.width);
        const my = Math.floor((coin.y / this.WORLD_HEIGHT) * miniCanvas.height);
        mCtx.fillRect(mx, my, 2, 2);
      }
    }

    mCtx.fillStyle = this.currentMapIndex === 0 ? "#1B5E20" : "#BA68C8";
    for (const t of activeTrees) {
      const mx = Math.floor((t.x / this.WORLD_WIDTH) * miniCanvas.width);
      const my = Math.floor((t.y / this.WORLD_HEIGHT) * miniCanvas.height);
      mCtx.fillRect(mx, my, 2, 2);
    }

    const pMx = Math.floor((activePortal.x / this.WORLD_WIDTH) * miniCanvas.width);
    const pMy = Math.floor((activePortal.y / this.WORLD_HEIGHT) * miniCanvas.height);
    mCtx.fillStyle = this.frameCount % 10 < 5 ? "#E040FB" : "#00E5FF";
    mCtx.fillRect(pMx, pMy, 3, 3);

    const playerMx = Math.floor((this.player.x / this.WORLD_WIDTH) * miniCanvas.width);
    const playerMy = Math.floor((this.player.y / this.WORLD_HEIGHT) * miniCanvas.height);

    const pulseRadius = 2 + (Math.sin(this.frameCount * 0.2) + 1);
    mCtx.fillStyle = "rgba(255, 23, 68, 0.4)";
    mCtx.beginPath();
    mCtx.arc(playerMx + 1, playerMy + 1, pulseRadius, 0, Math.PI * 2);
    mCtx.fill();

    mCtx.fillStyle = "#FF1744";
    mCtx.fillRect(playerMx, playerMy, 3, 3);
    mCtx.fillStyle = "#FFFFFF";
    mCtx.fillRect(playerMx + 1, playerMy + 1, 1, 1);
  }

  // =============================================================
  // 🎨 主游戏画面美术渲染
  // =============================================================
  drawAdventurer(renderX, renderY, isMoving) {
    this.bufferCtx.fillStyle = "#3E2723";
    this.bufferCtx.fillRect(renderX - 4, renderY + 2, 4, 8);
    this.bufferCtx.fillStyle = "#D7CCC8";
    this.bufferCtx.fillRect(renderX - 3, renderY + 5, 2, 2);

    this.bufferCtx.fillStyle = "#FBC02D";
    this.bufferCtx.fillRect(renderX + 1, renderY - 2, 10, 2);
    this.bufferCtx.fillStyle = "#E65100";
    this.bufferCtx.fillRect(renderX, renderY, 12, 1);

    this.bufferCtx.fillStyle = "#FF6F00";
    this.bufferCtx.fillRect(renderX, renderY + 1, this.player.width, this.player.height - 1);
    this.bufferCtx.strokeStyle = "#2C1810";
    this.bufferCtx.lineWidth = 1;
    this.bufferCtx.strokeRect(renderX, renderY + 1, this.player.width, this.player.height - 1);

    this.bufferCtx.fillStyle = "#5D4037";
    this.bufferCtx.fillRect(renderX, renderY + 1, this.player.width, 3);
    this.bufferCtx.fillRect(renderX - 1, renderY + 3, 2, 5);
    this.bufferCtx.fillRect(renderX + this.player.width - 1, renderY + 3, 2, 5);
    this.bufferCtx.fillStyle = "#8D6E63";
    this.bufferCtx.fillRect(renderX + 2, renderY + 1, this.player.width - 4, 1);

    const legStep = isMoving && Math.sin(this.frameCount * 0.35) > 0;
    const leftShoeY = renderY + this.player.height - (legStep ? 3 : 2);
    const rightShoeY = renderY + this.player.height - (legStep ? 2 : 3);

    this.bufferCtx.fillStyle = "#212121";
    this.bufferCtx.fillRect(renderX + 1, leftShoeY, 4, 2);
    this.bufferCtx.fillRect(renderX + this.player.width - 5, rightShoeY, 4, 2);

    this.bufferCtx.fillStyle = "#FFE0B2";
    this.bufferCtx.fillRect(renderX + 2, renderY + 3, 8, 5);
    this.bufferCtx.fillStyle = "#FF8A80";
    this.bufferCtx.fillRect(renderX + 1, renderY + 6, 2, 2);
    this.bufferCtx.fillRect(renderX + 9, renderY + 6, 2, 2);

    this.bufferCtx.fillStyle = "#FFFFFF";
    if (this.player.direction === "down") {
      this.bufferCtx.fillRect(renderX + 2, renderY + 4, 3, 3);
      this.bufferCtx.fillRect(renderX + 7, renderY + 4, 3, 3);
      this.bufferCtx.fillStyle = "#1B1B1B";
      this.bufferCtx.fillRect(renderX + 3, renderY + 5, 2, 2);
      this.bufferCtx.fillRect(renderX + 8, renderY + 5, 2, 2);
    } else if (this.player.direction === "up") {
      this.bufferCtx.fillStyle = "#5D4037";
      this.bufferCtx.fillRect(renderX, renderY + 3, this.player.width, 7);
    } else if (this.player.direction === "left") {
      this.bufferCtx.fillRect(renderX + 1, renderY + 4, 4, 3);
      this.bufferCtx.fillStyle = "#1B1B1B";
      this.bufferCtx.fillRect(renderX + 1, renderY + 5, 2, 2);
    } else if (this.player.direction === "right") {
      this.bufferCtx.fillRect(renderX + 7, renderY + 4, 4, 3);
      this.bufferCtx.fillStyle = "#1B1B1B";
      this.bufferCtx.fillRect(renderX + 9, renderY + 5, 2, 2);
    }
  }

  drawCoin(coin, camX, camY) {
    const rx = coin.x - camX;
    const ry = coin.y - camY;
    if (rx < -16 || rx > 320 || ry < -16 || ry > 180) return;

    const coinFloatY = Math.round(Math.sin(this.frameCount * 0.15 + coin.id) * 2);
    const renderY = ry + coinFloatY;
    const isShine = this.frameCount % 12 < 6;

    this.bufferCtx.fillStyle = "rgba(0, 0, 0, 0.25)";
    this.bufferCtx.fillRect(rx + 1, ry + 8, 6, 2);

    this.bufferCtx.fillStyle = isShine ? "#FFD54F" : "#FFC107";
    this.bufferCtx.fillRect(rx + 1, renderY, 6, 7);
    this.bufferCtx.fillStyle = "#FFA000";
    this.bufferCtx.strokeRect(rx + 1, renderY, 6, 7);
    this.bufferCtx.fillStyle = "#FFF9C4";
    this.bufferCtx.fillRect(rx + 2, renderY + 1, 2, 2);
  }

  drawTree(t, camX, camY) {
    const rx = t.x - camX;
    const ry = t.y - camY;
    if (rx < -32 || rx > 320 || ry < -40 || ry > 180) return;

    if (t.type === "pine") {
      this.bufferCtx.fillStyle = "#4E342E"; this.bufferCtx.fillRect(rx + 9, ry + 16, 6, 12);
      this.bufferCtx.fillStyle = "#1B5E20"; this.bufferCtx.fillRect(rx - 3, ry + 16, 30, 6);
      this.bufferCtx.fillStyle = "#2E7D32"; this.bufferCtx.fillRect(rx, ry + 10, 24, 7);
      this.bufferCtx.fillStyle = "#43A047"; this.bufferCtx.fillRect(rx + 3, ry + 4, 18, 7);
      this.bufferCtx.fillStyle = "#81C784"; this.bufferCtx.fillRect(rx + 7, ry - 3, 10, 8);
    } else if (t.type === "broadleaf") {
      this.bufferCtx.fillStyle = "#5D4037"; this.bufferCtx.fillRect(rx + 9, ry + 14, 6, 14);
      this.bufferCtx.fillStyle = "#1B5E20"; this.bufferCtx.fillRect(rx - 2, ry + 4, 28, 16);
      this.bufferCtx.fillStyle = "#2E7D32"; this.bufferCtx.fillRect(rx + 1, ry + 2, 22, 16);
      this.bufferCtx.fillStyle = "#43A047"; this.bufferCtx.fillRect(rx + 4, ry, 16, 14);
      this.bufferCtx.fillStyle = "#A5D6A7"; this.bufferCtx.fillRect(rx + 6, ry + 1, 6, 3); this.bufferCtx.fillRect(rx + 14, ry + 3, 4, 3);
    } else if (t.type === "violet_pine") {
      this.bufferCtx.fillStyle = "#311B92"; this.bufferCtx.fillRect(rx + 9, ry + 16, 6, 12);
      this.bufferCtx.fillStyle = "#4A148C"; this.bufferCtx.fillRect(rx - 3, ry + 16, 30, 6);
      this.bufferCtx.fillStyle = "#6A1B9A"; this.bufferCtx.fillRect(rx, ry + 10, 24, 7);
      this.bufferCtx.fillStyle = "#8E24AA"; this.bufferCtx.fillRect(rx + 3, ry + 4, 18, 7);
      this.bufferCtx.fillStyle = "#BA68C8"; this.bufferCtx.fillRect(rx + 7, ry - 3, 10, 8);
    } else if (t.type === "shadow_oak") {
      this.bufferCtx.fillStyle = "#1A237E"; this.bufferCtx.fillRect(rx + 9, ry + 14, 6, 14);
      this.bufferCtx.fillStyle = "#283593"; this.bufferCtx.fillRect(rx - 2, ry + 4, 28, 16);
      this.bufferCtx.fillStyle = "#37474F"; this.bufferCtx.fillRect(rx + 1, ry + 2, 22, 16);
      this.bufferCtx.fillStyle = "#00838F"; this.bufferCtx.fillRect(rx + 4, ry, 16, 14);
      this.bufferCtx.fillStyle = "#80DEEA"; this.bufferCtx.fillRect(rx + 6, ry + 1, 6, 3); this.bufferCtx.fillRect(rx + 14, ry + 3, 4, 3);
    }
  }

  drawPortal(portal, camX, camY) {
    const rx = portal.x - camX;
    const ry = portal.y - camY;
    if (rx < -32 || rx > 320 || ry < -32 || ry > 180) return;

    const pulse = Math.sin(this.frameCount * 0.1) * 2;
    const radius = 10 + pulse;

    const pGrad = this.bufferCtx.createRadialGradient(rx + 8, ry + 8, 2, rx + 8, ry + 8, radius);
    pGrad.addColorStop(0, "rgba(224, 64, 251, 0.85)");
    pGrad.addColorStop(0.6, "rgba(156, 39, 176, 0.5)");
    pGrad.addColorStop(1, "rgba(103, 58, 183, 0)");

    this.bufferCtx.fillStyle = pGrad;
    this.bufferCtx.beginPath();
    this.bufferCtx.arc(rx + 8, ry + 8, radius, 0, Math.PI * 2);
    this.bufferCtx.fill();

    this.bufferCtx.strokeStyle = "#E040FB";
    this.bufferCtx.lineWidth = 1;
    this.bufferCtx.strokeRect(rx + 2, ry + 2, 12, 12);
    this.bufferCtx.fillStyle = this.frameCount % 2 === 0 ? "#80DEEA" : "#EA80FC";
    this.bufferCtx.fillRect(rx + 4 + (this.frameCount % 8), ry + 10 - (this.frameCount % 10), 2, 2);
  }

  drawBuffer() {
    this.bufferCtx.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);

    const camX = Math.round(this.camera.x);
    const camY = Math.round(this.camera.y);

    const activeMap = this.currentMapIndex === 0 ? this.map1 : this.map2;
    const activeTrees = this.currentMapIndex === 0 ? this.trees1 : this.trees2;
    const activeProps = this.currentMapIndex === 0 ? this.props1 : this.props2;
    const activeSpots = this.currentMapIndex === 0 ? this.sunSpots1 : this.moonSpots;
    const activePortal = this.currentMapIndex === 0 ? this.portal1 : this.portal2;

    const startCol = Math.max(0, Math.floor(camX / this.TILE_SIZE));
    const endCol = Math.min(this.COLS - 1, Math.ceil((camX + 320) / this.TILE_SIZE));
    const startRow = Math.max(0, Math.floor(camY / this.TILE_SIZE));
    const endRow = Math.min(this.ROWS - 1, Math.ceil((camY + 180) / this.TILE_SIZE));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const type = activeMap[r][c];
        const rx = c * this.TILE_SIZE - camX;
        const ry = r * this.TILE_SIZE - camY;

        if (this.currentMapIndex === 0) {
          if (type === 0) {
            const isEven = (r + c) % 2 === 0;
            this.bufferCtx.fillStyle = isEven ? "#7CB342" : "#8BC34A";
            this.bufferCtx.fillRect(rx, ry, this.TILE_SIZE, this.TILE_SIZE);
            this.bufferCtx.fillStyle = "#AED581"; this.bufferCtx.fillRect(rx + 2, ry + 4, 2, 2);
          } else if (type === 1) {
            this.bufferCtx.fillStyle = "#8D6E63"; this.bufferCtx.fillRect(rx, ry, this.TILE_SIZE, 4);
            this.bufferCtx.fillStyle = "#5D4037"; this.bufferCtx.fillRect(rx, ry + 4, this.TILE_SIZE, 12);
            this.bufferCtx.fillStyle = "rgba(0, 0, 0, 0.4)"; this.bufferCtx.fillRect(rx + 15, ry, 1, this.TILE_SIZE);
          } else if (type === 2) {
            this.bufferCtx.fillStyle = "#78909C"; this.bufferCtx.fillRect(rx, ry, this.TILE_SIZE, this.TILE_SIZE);
          } else if (type === 3) {
            this.bufferCtx.fillStyle = (r + c) % 2 === 0 ? "#D7CCC8" : "#C8B7A6";
            this.bufferCtx.fillRect(rx, ry, this.TILE_SIZE, this.TILE_SIZE);
          } else if (type === 4) {
            this.bufferCtx.fillStyle = "#4FC3F7"; this.bufferCtx.fillRect(rx, ry, this.TILE_SIZE, this.TILE_SIZE);
            this.bufferCtx.fillStyle = "rgba(255, 255, 255, 0.75)";
            const wave = Math.floor((this.frameCount * 0.15 + c * 2) % 12);
            this.bufferCtx.fillRect(rx + (wave % 10), ry + 3, 4, 1);
          }
        } else {
          if (type === 0) {
            const isEven = (r + c) % 2 === 0;
            this.bufferCtx.fillStyle = isEven ? "#2E4A3E" : "#233B31";
            this.bufferCtx.fillRect(rx, ry, this.TILE_SIZE, this.TILE_SIZE);
            this.bufferCtx.fillStyle = "#00E5FF"; this.bufferCtx.fillRect(rx + 3, ry + 5, 1, 1);
          } else if (type === 1) {
            this.bufferCtx.fillStyle = "#37474F"; this.bufferCtx.fillRect(rx, ry, this.TILE_SIZE, 4);
            this.bufferCtx.fillStyle = "#263238"; this.bufferCtx.fillRect(rx, ry + 4, this.TILE_SIZE, 12);
            this.bufferCtx.fillStyle = "#00E5FF"; this.bufferCtx.fillRect(rx + 8, ry + 6, 1, 4);
          } else if (type === 3) {
            this.bufferCtx.fillStyle = (r + c) % 2 === 0 ? "#4A148C" : "#311B92";
            this.bufferCtx.fillRect(rx, ry, this.TILE_SIZE, this.TILE_SIZE);
            this.bufferCtx.fillStyle = "#EA80FC"; this.bufferCtx.fillRect(rx + 4, ry + 4, 2, 2);
          }
        }
      }
    }

    for (const p of activeProps) {
      const rx = p.x - camX;
      const ry = p.y - camY;
      if (rx < -16 || rx > 320 || ry < -16 || ry > 180) continue;

      if (p.type === "flower_white") {
        this.bufferCtx.fillStyle = "#FFFFFF"; this.bufferCtx.fillRect(rx, ry + 1, 3, 3);
        this.bufferCtx.fillStyle = "#FFD54F"; this.bufferCtx.fillRect(rx + 1, ry + 2, 1, 1);
      } else if (p.type === "flower_yellow") {
        this.bufferCtx.fillStyle = "#FFEE58"; this.bufferCtx.fillRect(rx, ry + 1, 3, 3);
      } else if (p.type === "flower_magenta") {
        this.bufferCtx.fillStyle = "#E040FB"; this.bufferCtx.fillRect(rx, ry + 1, 3, 3);
        this.bufferCtx.fillStyle = "#00E5FF"; this.bufferCtx.fillRect(rx + 1, ry + 2, 1, 1);
      } else if (p.type === "shroom_cyan") {
        this.bufferCtx.fillStyle = "#00E5FF"; this.bufferCtx.fillRect(rx, ry, 3, 2);
        this.bufferCtx.fillStyle = "#FFFFFF"; this.bufferCtx.fillRect(rx + 1, ry + 2, 1, 2);
      } else if (p.type === "stone" || p.type === "stone_moss") {
        this.bufferCtx.fillStyle = p.type === "stone_moss" ? "#455A64" : "#B0BEC5";
        this.bufferCtx.fillRect(rx, ry, 4, 3);
      }
    }

    for (const coin of this.coins) {
      if (coin.mapIndex === this.currentMapIndex && !coin.collected) {
        this.drawCoin(coin, camX, camY);
      }
    }

    this.drawPortal(activePortal, camX, camY);

    const sunAlpha = 0.20 + Math.sin(this.frameCount * 0.06) * 0.06;
    for (const s of activeSpots) {
      const rx = s.x - camX;
      const ry = s.y - camY;
      if (rx < -20 || rx > 340 || ry < -20 || ry > 200) continue;

      const sGrad = this.bufferCtx.createRadialGradient(rx, ry, 1, rx, ry, s.radius);
      if (this.currentMapIndex === 0) {
        sGrad.addColorStop(0, `rgba(255, 253, 210, ${sunAlpha})`);
        sGrad.addColorStop(1, "rgba(255, 253, 210, 0)");
      } else {
        sGrad.addColorStop(0, `rgba(224, 64, 251, ${sunAlpha})`);
        sGrad.addColorStop(1, "rgba(224, 64, 251, 0)");
      }
      this.bufferCtx.fillStyle = sGrad;
      this.bufferCtx.beginPath();
      this.bufferCtx.arc(rx, ry, s.radius, 0, Math.PI * 2);
      this.bufferCtx.fill();
    }

    for (const t of activeTrees) {
      const rx = t.x - camX;
      const ry = t.y - camY;
      if (rx < -32 || rx > 320 || ry < -32 || ry > 180) continue;

      const shadowGrad = this.bufferCtx.createRadialGradient(rx + 12, ry + 25, 2, rx + 12, ry + 25, 18);
      shadowGrad.addColorStop(0, "rgba(10, 25, 15, 0.35)");
      shadowGrad.addColorStop(1, "rgba(10, 25, 15, 0)");
      this.bufferCtx.fillStyle = shadowGrad;
      this.bufferCtx.beginPath();
      this.bufferCtx.ellipse(rx + 12, ry + 25, 18, 7, 0, 0, Math.PI * 2);
      this.bufferCtx.fill();
    }

    if (Math.abs(this.player.vx) > 0.1 || Math.abs(this.player.vy) > 0.1 || this.frameCount % 3 === 0) {
      this.particles.push({
        x: this.player.x + 5 + (Math.random() * 4 - 2),
        y: this.player.y + 11 + Math.random() * 2,
        vx: -this.player.vx * 0.2 + (Math.random() - 0.5) * 0.3,
        vy: 0.4 + Math.random() * 0.3 - this.player.vy * 0.2,
        life: 12,
        color: this.currentMapIndex === 0 ? "#FF6F00" : "#E040FB"
      });
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx; p.y += p.vy; p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (const p of this.particles) {
      const rx = Math.round(p.x - camX);
      const ry = Math.round(p.y - camY);
      this.bufferCtx.fillStyle = p.color;
      this.bufferCtx.fillRect(rx, ry, 2, 2);
    }

    const renderEntities = [];
    const isMoving = Math.abs(this.player.vx) > 0.1 || Math.abs(this.player.vy) > 0.1;
    const floatOffsetY = isMoving
      ? Math.round(Math.sin(this.frameCount * 0.25) * 1.0)
      : Math.round(Math.sin(this.frameCount * 0.10) * 1.5);

    const renderPlayerX = Math.round(this.player.x - camX);
    const renderPlayerY = Math.round(this.player.y - camY) + floatOffsetY;

    renderEntities.push({
      type: "player",
      y: this.player.y + this.player.height,
      draw: () => this.drawAdventurer(renderPlayerX, renderPlayerY, isMoving)
    });

    for (const t of activeTrees) {
      renderEntities.push({
        type: "tree",
        y: t.y + 24,
        draw: () => this.drawTree(t, camX, camY)
      });
    }

    renderEntities.sort((a, b) => a.y - b.y);
    renderEntities.forEach(ent => ent.draw());

    const envGrad = this.bufferCtx.createRadialGradient(160, 90, 30, 160, 90, 200);
    if (this.currentMapIndex === 0) {
      envGrad.addColorStop(0, "rgba(255, 253, 231, 0.14)");
      envGrad.addColorStop(1, "rgba(20, 40, 22, 0.20)");
    } else {
      envGrad.addColorStop(0, "rgba(224, 64, 251, 0.15)");
      envGrad.addColorStop(1, "rgba(15, 10, 30, 0.35)");
    }

    this.bufferCtx.fillStyle = envGrad;
    this.bufferCtx.fillRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
  }

  renderDisplay() {
    if (!this.canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(
      this.bufferCanvas,
      0, 0, this.bufferCanvas.width, this.bufferCanvas.height,
      0, 0, this.canvas.width, this.canvas.height
    );
  }

  loop() {
    if (!this.isRunning) return;
    this.frameCount++;
    this.updatePhysics();
    this.updateCamera();
    this.drawBuffer();
    this.drawMinimap();
    this.renderDisplay();
    this.playBGMStep();
    this.animId = requestAnimationFrame(this.loop);
  }
}

if (typeof window !== "undefined") {
  window.LumpaWorld = LumpaWorld;
}
