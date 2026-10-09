import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import bundledPetModelUrl from '../assets/models/pet_cat.glb?url';

// 18 个伴读角色共用同一套骨架，但保留各自的毛色、花纹、眼睛、体型与
// 行为气质。这样换角色时只切换外观与动作编排，不再回退成静态像素贴图。
export const PET_SKELETON_VARIANTS = Object.freeze({
  cat_white:            { body: 0xfff8ed, accent: 0xa69aa0, eyes: 0x493b42, nose: 0xe89591, scale: [0.90, 0.90, 0.90], signature: 'sit' },
  cat_ginger_blush:     { body: 0xfff2dc, accent: 0xe58d48, eyes: 0x5a3928, nose: 0xee8c8f, scale: [0.92, 0.90, 0.90], signature: 'sit' },
  cat_ginger_walk:      { body: 0xffe7c4, accent: 0xd87932, eyes: 0x513421, nose: 0xe98b82, scale: [0.93, 0.88, 0.90], signature: 'walk' },
  cat_black_bowl:       { body: 0x25242a, accent: 0x4c3940, eyes: 0xffc857, nose: 0xc77683, scale: [0.96, 0.82, 0.94], signature: 'sleep' },
  cat_black_stand:      { body: 0x202126, accent: 0x343842, eyes: 0xf3b64b, nose: 0xb87382, scale: [0.86, 0.98, 0.86], signature: 'run' },
  cat_siamese_green:    { body: 0xeadfc9, accent: 0x594842, eyes: 0x51c8a3, nose: 0xb77f82, scale: [0.90, 0.91, 0.88], signature: 'sit' },
  cat_calico_loaf:      { body: 0xfff3df, accent: 0xa95d35, eyes: 0x557b50, nose: 0xd98e88, scale: [0.98, 0.82, 0.96], signature: 'sit' },
  cat_calico_walk:      { body: 0xfff0dc, accent: 0x493a38, eyes: 0x6e9a58, nose: 0xd98e88, scale: [0.94, 0.90, 0.91], signature: 'walk' },
  cat_ragdoll_fluffy:   { body: 0xf2eadf, accent: 0x6e554c, eyes: 0x66b9e8, nose: 0xc98586, scale: [1.04, 0.91, 1.02], signature: 'sleep' },
  fox_fire:             { body: 0xf3b064, accent: 0x5d4034, eyes: 0x4f382c, nose: 0x332b2a, scale: [0.88, 1.00, 0.88], signature: 'run' },
  wolf_cub:             { body: 0xb8c0c7, accent: 0x616b75, eyes: 0x7ac6d8, nose: 0x34383e, scale: [0.90, 0.98, 0.90], signature: 'run' },
  cat_pointed_fluffy:   { body: 0xe9d8bd, accent: 0x665047, eyes: 0x63b8d8, nose: 0xb97e7e, scale: [1.00, 0.84, 0.98], signature: 'sleep' },
  cat_ginger_smile:     { body: 0xffe2b7, accent: 0xd47332, eyes: 0x55402d, nose: 0xeb9188, scale: [0.96, 0.88, 0.94], signature: 'sit' },
  cat_chubby_loaf:      { body: 0xd8c0a3, accent: 0x8d715c, eyes: 0x5c4836, nose: 0xc98883, scale: [1.08, 0.82, 1.05], signature: 'sleep' },
  cat_siamese_slender:  { body: 0xe8d7bc, accent: 0x4b3836, eyes: 0x70c9df, nose: 0xb97b80, scale: [0.82, 1.04, 0.84], signature: 'walk' },
  cat_tabby_brown:      { body: 0xe7d3b5, accent: 0x795a43, eyes: 0x83a851, nose: 0xc98781, scale: [0.94, 0.91, 0.92], signature: 'stretch' },
  cat_white_emerald:    { body: 0xfffbf1, accent: 0xd9d6cf, eyes: 0x39b884, nose: 0xde9290, scale: [0.84, 1.03, 0.84], signature: 'walk' },
  cat_siamese_kitten:   { body: 0xeadcc7, accent: 0x6b514a, eyes: 0x74c9e8, nose: 0xd08b8e, scale: [0.84, 0.82, 0.86], signature: 'jump' }
});

const SKELETON_ACTION_ALIASES = Object.freeze({
  focusing: 'sit',
  loaf: 'sit',
  lie_desk: 'sleep',
  look: 'idle',
  wash: 'sit',
  play: 'run',
  roll: 'sit',
  pounce: 'jump',
  dangle: 'jump',
  land: 'idle',
  blink: 'idle',
  tilt: 'idle',
  yawn: 'sleep',
  love: 'sit',
  shake: 'idle',
  hiss: 'jump',
  eat: 'sit',
  drink: 'sit',
  deepsleep: 'sleep',
  wake: 'stretch',
  feedfish: 'sit',
  feedwater: 'sit'
});

export function resolveSkeletonAction(actionName) {
  const normalized = String(actionName || 'idle').toLowerCase();
  return SKELETON_ACTION_ALIASES[normalized] || normalized;
}

/**
 * PetSkeletonEngine
 * 工业级三维/2.5D骨骼动画运行时引擎
 * 特性：
 * 1. 100% 背景纯透明穿透渲染（与桌面及工位伴读无缝融合）
 * 2. 60FPS 连续数学级骨骼插值与动作平滑混合（AnimationMixer CrossFade）
 * 3. 鼠标视线实时注视追踪（Mouse LookAt）
 * 4. 落地与跳跃动力学
 */
export class PetSkeletonEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = {
      // 使用模块 URL 让 Vite/Tauri 把二进制骨骼模型真正写入安装包。
      modelUrl: options.modelUrl || bundledPetModelUrl,
      autoRoam: options.autoRoam !== false,
      enableLookAt: options.enableLookAt !== false,
      petId: options.petId || 'cat_white',
      ...options
    };

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.mixer = null;
    this.actions = {};
    this.currentActionName = 'idle';
    this.currentAction = null;
    this.model = null;
    this.petId = this.options.petId;
    this.variant = PET_SKELETON_VARIANTS[this.petId] || PET_SKELETON_VARIANTS.cat_white;
    this.headBone = null;
    this.neckBone = null;

    // 视线追踪状态
    this.mouseTarget = { x: 0, y: 0 };
    this.currentLookAt = { x: 0, y: 0 };

    // 漫步巡游物理状态
    this.posX = 0;
    this.targetX = 0;
    this.speed = 0.015;
    this.facing = 1; // 1: 向右, -1: 向左
    this.targetFacing = 1;
    this.targetModelX = 0;
    this.targetModelY = 0;
    this.isManualAction = false;
    this.manualLockTimer = null;

    // 时钟
    this.clock = new THREE.Clock();
    this.isRunning = false;
    this.animationFrameId = null;

    this.init();
  }

  init() {
    if (!this.canvas) return;

    const width = this.canvas.clientWidth || 320;
    const height = this.canvas.clientHeight || 300;

    // 1. 场景
    this.scene = new THREE.Scene();

    // 2. 摄像机
    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
    this.camera.position.set(0, 0.85, 3.2);
    this.camera.lookAt(0, 0.45, 0);

    // 3. 渲染器 (纯透明穿透)
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 4. 灯光系统 (日系治愈微暖高质感打光)
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 1.4);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(2, 4, 3);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xb3e5fc, 1.1);
    rimLight.position.set(-2, 2.5, -2.5);
    this.scene.add(rimLight);

    const softFill = new THREE.DirectionalLight(0xffe0b2, 0.8);
    softFill.position.set(0, -1, 2);
    this.scene.add(softFill);

    // 地面柔和接触阴影盘
    const shadowGeo = new THREE.PlaneGeometry(1.2, 0.7);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sctx = shadowCanvas.getContext('2d');
    const grad = sctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0,0,0,0.35)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.15)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.01;
    this.scene.add(this.shadowMesh);

    // 5. 事件绑定
    this.setupEvents();

    // 6. 加载模型
    this.loadModel(this.options.modelUrl);

    // 7. 开启渲染循环
    this.isRunning = true;
    this.animate = this.animate.bind(this);
    this.animate();
  }

  setupEvents() {
    // 监听鼠标在窗口移动以实现注视追踪
    this.onMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // 归一化到 -1 ~ 1
      const nx = (e.clientX - cx) / (window.innerWidth / 2);
      const ny = -(e.clientY - cy) / (window.innerHeight / 2);
      this.mouseTarget.x = THREE.MathUtils.clamp(nx, -1, 1);
      this.mouseTarget.y = THREE.MathUtils.clamp(ny, -1, 1);
    };
    window.addEventListener('mousemove', this.onMouseMove, { passive: true });

    // 窗口尺寸调整
    this.onResize = () => {
      if (!this.canvas || !this.renderer || !this.camera) return;
      const width = this.canvas.clientWidth || 320;
      const height = this.canvas.clientHeight || 300;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height, false);
    };
    window.addEventListener('resize', this.onResize);
  }

  loadModel(url) {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        this.model = gltf.scene;
        this.model.position.set(0, 0, 0);
        this.model.scale.set(0.9, 0.9, 0.9);

        // 默认稍微偏向镜头（正面微偏角）
        this.model.rotation.y = Math.PI / 2; // 面向右侧

        this.scene.add(this.model);

        // 查找关键骨骼
        this.model.traverse((child) => {
          if (child.isMesh && child.material) {
            // 材质必须按实例克隆，否则换宠物时会污染 glTF 缓存中的原材质。
            child.material = Array.isArray(child.material)
              ? child.material.map((material) => material.clone())
              : child.material.clone();
          }
          if (child.isBone) {
            if (child.name === 'Head') this.headBone = child;
            if (child.name === 'Neck') this.neckBone = child;
          }
        });

        this.setPetVariant(this.petId);

        // 动画混合器初始化
        this.mixer = new THREE.AnimationMixer(this.model);

        // 注册所有动画切片
        gltf.animations.forEach((clip) => {
          const name = clip.name.toLowerCase();
          const action = this.mixer.clipAction(clip);
          this.actions[name] = action;
        });

        // 自动播放 Idle
        this.playAction('idle', 0.2);

        // 启动自然漫步巡游节律
        if (this.options.autoRoam) {
          this.startAutoRoamRoutine();
        }

        if (typeof this.options.onLoaded === 'function') {
          this.options.onLoaded(this);
        }
      },
      undefined,
      (err) => {
        console.warn('[PetSkeletonEngine] Failed to load 3D pet model:', err);
        if (typeof this.options.onError === 'function') {
          this.options.onError(err);
        }
      }
    );
  }

  setPetVariant(petId) {
    const resolvedPetId = PET_SKELETON_VARIANTS[petId] ? petId : 'cat_white';
    if (this.model && this.appliedPetId === resolvedPetId) return;
    this.petId = resolvedPetId;
    this.variant = PET_SKELETON_VARIANTS[this.petId];
    if (!this.model) return;

    const { body, accent, eyes, nose, scale } = this.variant;
    this.model.scale.set(scale[0], scale[1], scale[2]);
    this.model.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        const name = String(material.name || '').toLowerCase();
        if (!material.color) return;
        if (name.includes('furwhite')) material.color.setHex(body);
        else if (name.includes('furorange')) material.color.setHex(accent);
        else if (name.includes('eye')) material.color.setHex(eyes);
        else if (name.includes('nose')) material.color.setHex(nose);
        material.needsUpdate = true;
      });
    });
    this.appliedPetId = this.petId;
  }

  /**
   * 让骨骼宠物跟随原有工位状态机的位置和动作。原状态机继续负责桌面、
   * 猫爬架和自主行为，三维引擎只负责连续骨骼变形与动作混合。
   */
  syncFromCompanionState(state = {}) {
    const action = resolveSkeletonAction(state.currentAction);
    const isOneShot = ['jump', 'stretch'].includes(action);
    if (action !== this.currentActionName || !this.currentAction?.isRunning()) {
      this.playAction(action, 0.24, !isOneShot);
    }

    const walkOffset = Number(state.walkOffset || 0);
    const petY = Number(state.petY || 0);
    this.targetModelX = THREE.MathUtils.clamp(walkOffset / 125, -0.92, 0.92);
    this.targetModelY = THREE.MathUtils.clamp(-petY / 72, -0.08, 0.92);
    this.targetFacing = Number(state.facing || 1) >= 0 ? 1 : -1;
  }

  /**
   * 动作无缝过渡切换核心 (CrossFade)
   * @param {string} name 动作名: idle | walk | run | jump | sit | sleep | stretch
   * @param {number} duration 过渡时间(秒)
   * @param {boolean} loop 是否循环播放
   */
  playAction(name, duration = 0.28, loop = true) {
    const targetKey = resolveSkeletonAction(name);
    const targetAction = this.actions[targetKey];
    if (!targetAction) {
      // 容错匹配别名
      const aliasMap = {
        'walkroam': 'walk',
        'runfast': 'run',
        'cushionjump': 'jump',
        'stretchbed': 'stretch',
        'loaf': 'sit',
        'blink': 'idle',
        'tilt': 'idle'
      };
      if (aliasMap[targetKey] && this.actions[aliasMap[targetKey]]) {
        return this.playAction(aliasMap[targetKey], duration, loop);
      }
      return;
    }

    if (this.currentActionName === targetKey && targetAction.isRunning()) {
      return;
    }

    const prevAction = this.currentAction;
    this.currentAction = targetAction;
    this.currentActionName = targetKey;

    targetAction.reset();
    targetAction.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
    targetAction.clampWhenFinished = !loop;

    if (prevAction) {
      targetAction.time = 0.0;
      targetAction.enabled = true;
      targetAction.crossFadeFrom(prevAction, duration, true);
      targetAction.play();
    } else {
      targetAction.play();
    }

    // 单次动作播放完毕后，平滑回切到 idle
    if (!loop) {
      const onFinished = (e) => {
        if (e.action === targetAction) {
          this.mixer.removeEventListener('finished', onFinished);
          if (!this.isManualAction) {
            this.playAction('idle', 0.35, true);
          }
        }
      };
      this.mixer.addEventListener('finished', onFinished);
    }
  }

  /**
   * 触发用户手动交互锁 (避免自主巡游瞬间打断)
   */
  lockManualAction(actionName, durationMs = 2800) {
    this.isManualAction = true;
    if (this.manualLockTimer) clearTimeout(this.manualLockTimer);

    const isLoopAction = ['walk', 'run', 'sleep', 'sit'].includes(actionName.toLowerCase());
    this.playAction(actionName, 0.25, isLoopAction);

    this.manualLockTimer = setTimeout(() => {
      this.isManualAction = false;
      this.playAction('idle', 0.35, true);
    }, durationMs);
  }

  /**
   * 自主巡游固定生活节律 (漫步 -> 停步张望 -> 伸懒腰 -> 揣手小憩)
   */
  startAutoRoamRoutine() {
    const routine = () => {
      if (this.isManualAction) {
        setTimeout(routine, 1500);
        return;
      }

      const roll = Math.random();
      if (roll < 0.35) {
        // 漫步
        this.targetFacing = Math.random() > 0.5 ? 1 : -1;
        this.playAction('walk', 0.3, true);
        setTimeout(() => {
          if (!this.isManualAction) this.playAction('idle', 0.3, true);
        }, 3000 + Math.random() * 2000);
      } else if (roll < 0.55) {
        // 轻巧小跑
        this.targetFacing = Math.random() > 0.5 ? 1 : -1;
        this.playAction('run', 0.25, true);
        setTimeout(() => {
          if (!this.isManualAction) this.playAction('idle', 0.3, true);
        }, 2200 + Math.random() * 1500);
      } else if (roll < 0.70) {
        // 伸懒腰
        this.playAction('stretch', 0.3, false);
      } else if (roll < 0.85) {
        // 坐下小憩
        this.playAction('sit', 0.35, true);
        setTimeout(() => {
          if (!this.isManualAction) this.playAction('idle', 0.35, true);
        }, 3500 + Math.random() * 2500);
      } else {
        // 轻跃
        this.playAction('jump', 0.2, false);
      }

      // 4~7 秒触发下一个节律
      setTimeout(routine, 4000 + Math.random() * 3000);
    };

    setTimeout(routine, 2500);
  }

  animate() {
    if (!this.isRunning) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    // 1. 更新动画骨骼混合器
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // 2. 身体转向与平滑插值 (转向插值，消除纸片瞬翻)
    if (this.model) {
      // facing 1 为向右（Math.PI / 2），-1 为向左（-Math.PI / 2）
      const targetRotY = this.targetFacing === 1 ? Math.PI / 2 : -Math.PI / 2;
      this.model.rotation.y = THREE.MathUtils.lerp(this.model.rotation.y, targetRotY, 0.12);
      this.model.position.x = THREE.MathUtils.lerp(this.model.position.x, this.targetModelX, 0.14);
      this.model.position.y = THREE.MathUtils.lerp(this.model.position.y, this.targetModelY, 0.16);

      // 阴影跟随
      if (this.shadowMesh) {
        this.shadowMesh.position.x = this.model.position.x;
        this.shadowMesh.position.z = this.model.position.z;
      }
    }

    // 3. 头部视线实时注视 (Mouse LookAt)
    if (this.headBone && this.options.enableLookAt && this.currentActionName !== 'sleep') {
      // 平滑逼近鼠标
      this.currentLookAt.x = THREE.MathUtils.lerp(this.currentLookAt.x, this.mouseTarget.x, 0.08);
      this.currentLookAt.y = THREE.MathUtils.lerp(this.currentLookAt.y, this.mouseTarget.y, 0.08);

      // 头颈骨骼旋转偏角 (左右最大 32度，上下最大 20度)
      const yaw = this.currentLookAt.x * THREE.MathUtils.degToRad(32);
      const pitch = this.currentLookAt.y * THREE.MathUtils.degToRad(20);

      // 在动画姿态之上叠加注视偏转
      this.headBone.rotation.y += yaw * 0.4;
      this.headBone.rotation.x -= pitch * 0.3;
    }

    // 4. 渲染一帧
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  destroy() {
    this.isRunning = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.manualLockTimer) clearTimeout(this.manualLockTimer);

    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);

    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.scene) {
      this.scene.clear();
    }
  }
}
