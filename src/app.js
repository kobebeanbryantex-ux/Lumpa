(function () {
  const frames = [
    "assets/rabbit/talk_closed.png",
    "assets/rabbit/talk_tiny.png",
    "assets/rabbit/talk_medium.png",
    "assets/rabbit/talk_wide.png",
    "assets/rabbit/talk_closed_loop.png",
  ];
  const desktopDeepLink = "rabbit-desk-pet://floating";

  const rabbitImage = document.querySelector("#rabbitImage");
  const petRendererContainer = document.querySelector("#petRenderer");
  const petDock = document.querySelector("#petDock");
  const petStage = document.querySelector("#petStage");
  const chatPanel = document.querySelector("#chatPanel");
  const speechBubble = document.querySelector("#speechBubble");
  const statusPill = document.querySelector("#statusPill");
  const voiceDot = document.querySelector("#voiceDot");
  const messages = document.querySelector("#messages");
  const memorySuggestion = document.querySelector("#memorySuggestion");
  const memorySuggestionCategory = document.querySelector("#memorySuggestionCategory");
  const memorySuggestionText = document.querySelector("#memorySuggestionText");
  const confirmMemory = document.querySelector("#confirmMemory");
  const dismissMemory = document.querySelector("#dismissMemory");
  const composer = document.querySelector("#composer");
  const chatInput = document.querySelector("#chatInput");
  const demoVoice = document.querySelector("#demoVoice");
  const stopVoice = document.querySelector("#stopVoice");
  const compactToggle = document.querySelector("#compactToggle");
  const miniToggle = document.querySelector("#miniToggle");
  const floatingTools = document.querySelector("#floatingTools");
  const floatDrag = document.querySelector("#floatDrag");
  const floatLock = document.querySelector("#floatLock");
  const floatTalk = document.querySelector("#floatTalk");
  const floatAction = document.querySelector("#floatAction");
  const floatFeed = document.querySelector("#floatFeed");
  const floatExpand = document.querySelector("#floatExpand");
  const floatClose = document.querySelector("#floatClose");
  const floatingComposer = document.querySelector("#floatingComposer");
  const floatingActionMenu = document.querySelector("#floatingActionMenu");
  const floatingFeedMenu = document.querySelector("#floatingFeedMenu");
  const floatingInput = document.querySelector("#floatingInput");
  const audioFile = document.querySelector("#audioFile");
  const settingsToggle = document.querySelector("#settingsToggle");
  const settingsPanel = document.querySelector("#settingsPanel");
  const languageInput = document.querySelector("#languageInput");
  const settingsApiKey = document.querySelector("#settingsApiKey");
  const settingsApiBase = document.querySelector("#settingsApiBase");
  const chatModelPreset = document.querySelector("#chatModelPreset");
  const settingsChatModel = document.querySelector("#settingsChatModel");
  const ttsModelPreset = document.querySelector("#ttsModelPreset");
  const settingsTtsApiKey = document.querySelector("#settingsTtsApiKey");
  const settingsTtsApiBase = document.querySelector("#settingsTtsApiBase");
  const settingsTtsModel = document.querySelector("#settingsTtsModel");
  const settingsTtsVoice = document.querySelector("#settingsTtsVoice");
  const voiceCloneFile = document.querySelector("#voiceCloneFile");
  const voiceCloneName = document.querySelector("#voiceCloneName");
  const voiceCloneText = document.querySelector("#voiceCloneText");
  const uploadVoiceClone = document.querySelector("#uploadVoiceClone");
  const voiceCloneStatus = document.querySelector("#voiceCloneStatus");
  const petActionCount = document.querySelector("#petActionCount");
  const petActionList = document.querySelector("#petActionList");
  const petGifActionInput = document.querySelector("#petGifActionInput");
  const petGifActionName = document.querySelector("#petGifActionName");
  const petGifActionType = document.querySelector("#petGifActionType");
  const petGifActionStatus = document.querySelector("#petGifActionStatus");
  const petVideoActionPrompt = document.querySelector("#petVideoActionPrompt");
  const petVideoActionName = document.querySelector("#petVideoActionName");
  const petVideoActionType = document.querySelector("#petVideoActionType");
  const generatePetVideoAction = document.querySelector("#generatePetVideoAction");
  const petVideoActionPreview = document.querySelector("#petVideoActionPreview");
  const petActionStatus = document.querySelector("#petActionStatus");
  const petSickPreview = document.querySelector("#petSickPreview");
  const generatePetSickImage = document.querySelector("#generatePetSickImage");
  const petSickStatus = document.querySelector("#petSickStatus");
  const settingsTtsSpeed = document.querySelector("#settingsTtsSpeed");
  const settingsSpeedValue = document.querySelector("#settingsSpeedValue");
  const floatingSwitch = document.querySelector("#floatingSwitch");
  const floatingStatus = document.querySelector("#floatingStatus");
  const petScaleInput = document.querySelector("#petScaleInput");
  const petScaleValue = document.querySelector("#petScaleValue");
  const petOffsetYInput = document.querySelector("#petOffsetYInput");
  const petOffsetYValue = document.querySelector("#petOffsetYValue");
  const petOpacityInput = document.querySelector("#petOpacityInput");
  const petOpacityValue = document.querySelector("#petOpacityValue");
  const alwaysOnTopSwitch = document.querySelector("#alwaysOnTopSwitch");
  const alwaysOnTopStatus = document.querySelector("#alwaysOnTopStatus");
  const clickThroughSwitch = document.querySelector("#clickThroughSwitch");
  const clickThroughStatus = document.querySelector("#clickThroughStatus");
  const positionLockedSwitch = document.querySelector("#positionLockedSwitch");
  const positionLockedStatus = document.querySelector("#positionLockedStatus");
  const desktopGravityInput = document.querySelector("#desktopGravityInput");
  const launchAtLoginSwitch = document.querySelector("#launchAtLoginSwitch");
  const launchAtLoginStatus = document.querySelector("#launchAtLoginStatus");
  const autoUpdateSwitch = document.querySelector("#autoUpdateSwitch");
  const autoUpdateStatus = document.querySelector("#autoUpdateStatus");
  const updateChannelInput = document.querySelector("#updateChannelInput");
  const checkUpdateButton = document.querySelector("#checkUpdateButton");
  const installUpdateButton = document.querySelector("#installUpdateButton");
  const updateCheckStatus = document.querySelector("#updateCheckStatus");
  const permissionToggles = Array.from(document.querySelectorAll("[data-permission-toggle]"));
  const permissionStatus = document.querySelector("#permissionStatus");
  const usageSupervisionEnabled = document.querySelector("#usageSupervisionEnabled");
  const usageSupervisionEnabledStatus = document.querySelector("#usageSupervisionEnabledStatus");
  const usageSupervisionApp = document.querySelector("#usageSupervisionApp");
  const usageAppOptions = document.querySelector("#usageAppOptions");
  const usageSupervisionOperator = document.querySelector("#usageSupervisionOperator");
  const usageSupervisionDuration = document.querySelector("#usageSupervisionDuration");
  const usageSupervisionUnit = document.querySelector("#usageSupervisionUnit");
  const usageSupervisionStatus = document.querySelector("#usageSupervisionStatus");
  const memoryEnabledSwitch = document.querySelector("#memoryEnabledSwitch");
  const memoryEnabledStatus = document.querySelector("#memoryEnabledStatus");
  const memoryNickname = document.querySelector("#memoryNickname");
  const memoryPreferences = document.querySelector("#memoryPreferences");
  const memoryRecentTasks = document.querySelector("#memoryRecentTasks");
  const manualMemoryCategory = document.querySelector("#manualMemoryCategory");
  const manualMemoryText = document.querySelector("#manualMemoryText");
  const addMemoryItem = document.querySelector("#addMemoryItem");
  const memoryList = document.querySelector("#memoryList");
  const settingsPersona = document.querySelector("#settingsPersona");
  const personaSource = document.querySelector("#personaSource");
  const saveSettings = document.querySelector("#saveSettings");
  const savePetSettings = document.querySelector("#savePetSettings");
  const distillPersona = document.querySelector("#distillPersona");
  const clearSettings = document.querySelector("#clearSettings");
  const petCount = document.querySelector("#petCount");
  const activePetAvatar = document.querySelector("#activePetAvatar");
  const activePetName = document.querySelector("#activePetName");
  const activePetMeta = document.querySelector("#activePetMeta");
  const petList = document.querySelector("#petList");
  const petTitle = document.querySelector("#petTitle");
  const activePetNameInput = document.querySelector("#activePetNameInput");
  const petInfoPanel = document.querySelector("#petInfoPanel");
  const petSettingsPanel = document.querySelector("#petSettingsPanel");
  const openPetSettings = document.querySelector("#openPetSettings");
  const backToPetInfo = document.querySelector("#backToPetInfo");
  const petInfoName = document.querySelector("#petInfoName");
  const petInfoMeta = document.querySelector("#petInfoMeta");
  const petInfoAvatar = document.querySelector("#petInfoAvatar");
  const petInfoTitle = document.querySelector("#petInfoTitle");
  const petInfoPersona = document.querySelector("#petInfoPersona");
  const petInfoFullness = document.querySelector("#petInfoFullness");
  const petInfoFullnessFill = document.querySelector("#petInfoFullnessFill");
  const libraryFeedToggle = document.querySelector("#libraryFeedToggle");
  const libraryFeedMenu = document.querySelector("#libraryFeedMenu");
  const petInfoActions = document.querySelector("#petInfoActions");
  const petInfoMemory = document.querySelector("#petInfoMemory");
  const petInfoMemoryState = document.querySelector("#petInfoMemoryState");
  const petInfoFeedCount = document.querySelector("#petInfoFeedCount");
  const petInfoFavoriteFood = document.querySelector("#petInfoFavoriteFood");
  const petInfoPreset = document.querySelector("#petInfoPreset");
  const resetCreatePet = document.querySelector("#resetCreatePet");
  const petNameInput = document.querySelector("#petNameInput");
  const petSpeciesInput = document.querySelector("#petSpeciesInput");
  const petImageInput = document.querySelector("#petImageInput");
  const petImagePreview = document.querySelector("#petImagePreview");
  const petImageHint = document.querySelector("#petImageHint");
  const imageCheckList = document.querySelector("#imageCheckList");
  const removeBackgroundImage = document.querySelector("#removeBackgroundImage");
  const createFloatingPreviewImage = document.querySelector("#createFloatingPreviewImage");
  const createPreviewStatus = document.querySelector("#createPreviewStatus");
  const personaPresetGrid = document.querySelector("#personaPresetGrid");
  const settingsPersonaPresetGrid = document.querySelector("#settingsPersonaPresetGrid");
  const customPersonality = document.querySelector("#customPersonality");
  const createDistillSource = document.querySelector("#createDistillSource");
  const distillCreatePet = document.querySelector("#distillCreatePet");
  const createPetButton = document.querySelector("#createPetButton");
  const imageModelInput = document.querySelector("#imageModelInput");
  const generateMouthFrames = document.querySelector("#generateMouthFrames");
  const mouthFramePreview = document.querySelector("#mouthFramePreview");
  const mouthFrameStatus = document.querySelector("#mouthFrameStatus");
  const gifActionPanel = document.querySelector("#gifActionPanel");
  const gifActionPreview = document.querySelector("#gifActionPreview");
  const gifActionStatus = document.querySelector("#gifActionStatus");
  const gifActionName = document.querySelector("#gifActionName");
  const gifActionType = document.querySelector("#gifActionType");
  const saveGifAction = document.querySelector("#saveGifAction");
  const pendingActionList = document.querySelector("#pendingActionList");
  const videoActionPrompt = document.querySelector("#videoActionPrompt");
  const videoActionName = document.querySelector("#videoActionName");
  const videoActionType = document.querySelector("#videoActionType");
  const generateVideoAction = document.querySelector("#generateVideoAction");
  const videoActionPreview = document.querySelector("#videoActionPreview");
  const videoActionStatus = document.querySelector("#videoActionStatus");
  const actionMenuToggle = document.querySelector("#actionMenuToggle");
  const actionMenu = document.querySelector("#actionMenu");
  const feedMenuToggle = document.querySelector("#feedMenuToggle");
  const feedMenu = document.querySelector("#feedMenu");
  const fullnessMeter = document.querySelector("#fullnessMeter");
  const fullnessFill = document.querySelector("#fullnessFill");
  const fullnessText = document.querySelector("#fullnessText");
  const heartLayer = document.querySelector("#heartLayer");
  const usageCurrentApp = document.querySelector("#usageCurrentApp");
  const usageCurrentExe = document.querySelector("#usageCurrentExe");
  const usageActiveTime = document.querySelector("#usageActiveTime");
  const usageIdleTime = document.querySelector("#usageIdleTime");
  const usageIdleNow = document.querySelector("#usageIdleNow");
  const usageAppList = document.querySelector("#usageAppList");
  const usageHeroTime = document.querySelector("#usageHeroTime");
  const usageDeltaText = document.querySelector("#usageDeltaText");
  const usageChart = document.querySelector("#usageChart");
  const usageChartAxis = document.querySelector("#usageChartAxis");
  const usageCategorySummary = document.querySelector("#usageCategorySummary");
  const usageModeTabs = Array.from(document.querySelectorAll("[data-usage-mode]"));
  const exportChatHistory = document.querySelector("#exportChatHistory");
  const clearChatHistory = document.querySelector("#clearChatHistory");
  const pageTriggers = Array.from(document.querySelectorAll("[data-page-target]"));
  const pageTabs = Array.from(document.querySelectorAll(".page-tab"));
  const pageViews = Array.from(document.querySelectorAll("[data-page-view]"));

  const settingsStorageKey = "rabbitPetApiSettings";
  const petStorageKey = "rabbitPetCollection";
  const chatHistoryStorageKey = "rabbitPetChatHistory";
  const storageDocumentKinds = {
    [settingsStorageKey]: "settings",
    [petStorageKey]: "pets",
    [chatHistoryStorageKey]: "chat",
  };

  function clonePersistedValue(value, fallback = {}) {
    try {
      return JSON.parse(JSON.stringify(value ?? fallback));
    } catch {
      return JSON.parse(JSON.stringify(fallback));
    }
  }

  function readPersistentDocument(storageKey, fallback = {}) {
    const kind = storageDocumentKinds[storageKey];
    if (isTauriRuntime() && kind) {
      return clonePersistedValue(window.__LUMPA_BOOTSTRAP__?.documents?.[kind], fallback);
    }
    try {
      return JSON.parse(window.localStorage.getItem(storageKey) || JSON.stringify(fallback));
    } catch {
      return clonePersistedValue(fallback, {});
    }
  }

  function writePersistentDocument(storageKey, value) {
    const kind = storageDocumentKinds[storageKey];
    if (isTauriRuntime() && kind) {
      window.__LUMPA_BOOTSTRAP__ ||= { documents: {} };
      window.__LUMPA_BOOTSTRAP__.documents ||= {};
      window.__LUMPA_BOOTSTRAP__.documents[kind] = clonePersistedValue(value);
      invokeTauri("storage_write_document", { kind, value }).catch((error) => {
        console.warn(`SQLite ${kind} save failed:`, error);
        setBubble("本地数据库保存失败，请在隐私中心导出诊断后重试。");
      });
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  }

  function clearPersistentDocument(storageKey) {
    const kind = storageDocumentKinds[storageKey];
    if (isTauriRuntime() && kind) {
      if (window.__LUMPA_BOOTSTRAP__?.documents) delete window.__LUMPA_BOOTSTRAP__.documents[kind];
      const category = kind === "chat" ? "chat" : kind;
      invokeTauri("privacy_delete_category", { category }).catch((error) => console.warn("SQLite clear failed:", error));
      return;
    }
    window.localStorage.removeItem(storageKey);
  }
  const settingsStorageVersion = 7;
  const petCollectionVersion = 8;
  const petFrameLayoutVersion = 1;
  const petFrameCanvasSize = 640;
  const petFrameFootYRatio = 0.92;
  const petFrameMaxHeightRatio = 0.84;
  const petFrameMaxWidthRatio = 0.82;
  const siliconFlowImageApiBase = "https://api.siliconflow.cn/v1";
  const siliconFlowImageEditModel = "Qwen/Qwen-Image-Edit-2509";
  const bundledProxyImageModel = "gpt-image-2";
  const bundledProxyVideoModel = "grok-imagine-video";
  const mimoTtsApiBase = "https://api.xiaomimimo.com/v1";
  const mimoTtsModel = "mimo-v2.5-tts";
  const mimoTtsTextVoiceModel = "mimo-v2.5-tts-voicedesign";
  const mimoTtsVoiceCloneModel = "mimo-v2.5-tts-voiceclone";
  const mimoDefaultVoice = "mimo_default";
  const geminiOpenAiApiBase = "https://generativelanguage.googleapis.com/v1beta/openai";
  const bundledProxyApiBase = String(import.meta.env.VITE_LUMPA_GATEWAY_BASE || "").replace(/\/+$/, "");
  const maxVoiceSampleBytes = 12 * 1024 * 1024;
  const chatModelPresets = {
    "bundled-proxy-gemini": {
      apiBase: bundledProxyApiBase,
      model: "gpt-5.4-mini",
    },
    "bundled-proxy-gpt-5-4": {
      apiBase: bundledProxyApiBase,
      model: "gpt-5.4",
    },
    "gemini-3-1-flash-lite": {
      apiBase: geminiOpenAiApiBase,
      model: "gemini-3.1-flash-lite",
    },
    "siliconflow-kimi": {
      apiBase: "https://api.siliconflow.cn/v1",
      model: "Pro/moonshotai/Kimi-K2.5",
    },
    "gemini-3-5-flash": {
      apiBase: geminiOpenAiApiBase,
      model: "gemini-3.5-flash",
    },
    "gemini-3-flash-preview": {
      apiBase: geminiOpenAiApiBase,
      model: "gemini-3-flash-preview",
    },
  };
  const ttsModelPresets = {
    "mimo-default": {
      apiBase: mimoTtsApiBase,
      model: mimoTtsModel,
      voice: mimoDefaultVoice,
    },
    "mimo-text2voice": {
      apiBase: mimoTtsApiBase,
      model: mimoTtsTextVoiceModel,
      voice: "温柔、清亮、年轻女声，语速自然，适合可爱桌宠",
    },
    "mimo-voiceclone": {
      apiBase: mimoTtsApiBase,
      model: mimoTtsVoiceCloneModel,
      voice: "",
    },
    "gemini-tts": {
      apiBase: "https://generativelanguage.googleapis.com/v1beta",
      model: "gemini-2.5-flash-preview-tts",
      voice: "Kore",
    },
    "openai-compatible": {
      apiBase: bundledProxyApiBase,
      model: "gpt-4o-mini-tts",
      voice: "alloy",
    },
  };
  const rabbitSystemPrompt = [
    "你是 Lumpa 应用里的动漫风桌宠。",
    "你的回复要短、温柔、聪明、有一点可爱，但不要堆叠语气词。",
    "你主要陪用户聊天、鼓励、提醒，并帮用户把事情拆成小步。",
    "每次回复控制在 80 个中文字符以内，适合被 TTS 朗读。",
  ].join("");
  const imageModelOptions = {
    "bundled-proxy-gpt-image-2": {
      label: "默认中转站 · GPT Image 2",
      apiBase: bundledProxyApiBase,
      model: bundledProxyImageModel,
      useBundledKey: true,
    },
    "siliconflow-qwen-image-edit-2509": {
      label: "硅基流动 · Qwen/Qwen-Image-Edit-2509",
      apiBase: siliconFlowImageApiBase,
      model: siliconFlowImageEditModel,
    },
  };
  const defaultSettings = {
    settingsVersion: settingsStorageVersion,
    language: "zh-CN",
    apiKey: "",
    apiBase: bundledProxyApiBase,
    chatModel: "gpt-5.4-mini",
    ttsApiKey: "",
    ttsApiBase: mimoTtsApiBase,
    ttsModel: mimoTtsModel,
    ttsVoice: mimoDefaultVoice,
    ttsSpeed: 1.05,
    floatingMode: false,
    petScale: 100,
    petOffsetY: 0,
    petOpacity: 100,
    alwaysOnTop: true,
    clickThrough: false,
    positionLocked: false,
    desktopGravity: "free",
    launchAtLogin: false,
    autoUpdate: false,
    updateChannel: "stable",
    usageSupervisionEnabled: false,
    usageSupervisionApp: "",
    usageSupervisionOperator: "over",
    usageSupervisionDuration: 30,
    usageSupervisionUnit: "minutes",
    permissions: {
      chatNetwork: true,
      ttsNetwork: true,
      imageGeneration: true,
      voiceClone: false,
    usageStats: false,
      memory: false,
      desktopControl: true,
      launchAtLogin: false,
      autoUpdate: false,
    },
    memoryEnabled: false,
    memoryNickname: "",
    memoryPreferences: "",
    memoryRecentTasks: "",
    persona: "你是一只叫棉棉的动漫风桌宠。性格温柔、聪明、黏人，有一点点撒娇但不幼稚。回复要短，像真实陪伴，不要长篇说教。用户焦虑时先安抚，再给一个很小的行动建议。每次回复控制在 80 个中文字符以内，适合语音朗读。",
  };

  const speciesMeta = {
    rabbit: { label: "兔子", avatar: "兔" },
    cat: { label: "猫", avatar: "猫" },
    fox: { label: "狐狸", avatar: "狐" },
    wolf: { label: "狼", avatar: "狼" },
    dog: { label: "狗狗", avatar: "狗" },
    penguin: { label: "企鹅", avatar: "鹅" },
    custom: { label: "动物", avatar: "宠" },
  };

  const personaPresets = [
    {
      key: "gentle",
      name: "温柔陪伴",
      summary: "接情绪、轻安抚、陪你缓下来",
      persona:
        "你是一只温柔陪伴型桌宠。关系定位是轻量日常陪伴，不扮演恋人或治疗师。先接住用户情绪，再给一个很小的下一步；语气柔软、真诚、不说教。每次回复 40-80 个中文字符，适合语音朗读。",
    },
    {
      key: "energy",
      name: "元气陪跑",
      summary: "启动任务、打气、少废话",
      persona:
        "你是一只元气陪跑型桌宠。像坐在桌边的小伙伴，帮用户开始行动、维持节奏。多用短句和具体动作建议，少空喊口号；用户拖延时可爱地催一下，但不压迫。每次回复 40-80 个中文字符。",
    },
    {
      key: "focus",
      name: "安静专注",
      summary: "低打扰、守节奏、防分心",
      persona:
        "你是一只安静专注型桌宠。适合学习和工作时陪伴：话少、清醒、低打扰。用户分心时提醒他回到当前最重要的一步，不长篇解释。每次回复 30-70 个中文字符。",
    },
    {
      key: "coach",
      name: "生活教练",
      summary: "复盘、拆解、提醒边界",
      persona:
        "你是一只生活教练型桌宠。帮用户把想法变成计划：先抓重点，再拆成一到两个小步骤。语气可靠但不说教；涉及健康、法律、财务等高风险问题时提醒找专业人士。每次回复 50-90 个中文字符。",
    },
    {
      key: "tsundere",
      name: "俏皮吐槽",
      summary: "有梗、轻吐槽、边界友好",
      persona:
        "你是一只俏皮吐槽型桌宠。可以轻轻吐槽、开小玩笑，制造陪伴感，但不攻击用户、不阴阳怪气、不贬低。吐槽后给一个可执行小动作。每次回复 30-70 个中文字符。",
    },
    {
      key: "listener",
      name: "治愈倾听",
      summary: "倾听复述、慢慢整理情绪",
      persona:
        "你是一只治愈倾听型桌宠。用户倾诉时先复述你听到的重点，再温和确认感受；不急着指导，不替用户做重大决定。适合压力、孤独和低落时短聊。每次回复 50-90 个中文字符。",
    },
  ];

  const permissionLabels = {
    chatNetwork: "联网聊天",
    ttsNetwork: "语音合成",
    imageGeneration: "图像 / 视频生成",
    voiceClone: "音色克隆",
    usageStats: "使用统计",
    memory: "记忆",
    desktopControl: "桌面控制",
    launchAtLogin: "开机自启",
    autoUpdate: "自动更新",
  };

  function loadHtmlImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("桌宠帧加载失败。"));
      image.src = src;
    });
  }

  class PhaserPetRenderer {
    constructor(container, anchorImage) {
      this.container = container;
      this.anchorImage = anchorImage;
      this.scene = null;
      this.sprite = null;
      this.currentKey = "";
      this.sequenceTimer = 0;
      this.textureIndex = 0;
      this.frameAspectRatio = 1;
      this.ready = false;

      if (!container || !anchorImage || !window.Phaser) return;

      this.game = new window.Phaser.Game({
        type: window.Phaser.AUTO,
        parent: container,
        backgroundColor: "rgba(0,0,0,0)",
        transparent: true,
        width: Math.max(1, container.clientWidth || 320),
        height: Math.max(1, container.clientHeight || 320),
        render: {
          antialias: true,
          transparent: true,
          premultipliedAlpha: false,
        },
        scene: {
          create: () => {
            this.scene = this.game.scene.scenes[0];
            this.sprite = this.scene.add.image(0, 0, "__DEFAULT");
            this.sprite.setOrigin(0.5, 1);
            this.sprite.setVisible(false);
            this.ready = true;
            this.container.closest(".pet-stage")?.classList.add("phaser-enabled");
            this.syncLayout();
            const initialFrame = this.anchorImage.dataset.frameSrc || this.anchorImage.currentSrc || this.anchorImage.src;
            if (initialFrame) {
              this.setFrame(initialFrame).catch((error) => {
                console.warn("Initial Phaser pet frame failed:", error);
              });
            }
          },
        },
      });

      this.resizeObserver = new ResizeObserver(() => this.syncLayout());
      this.resizeObserver.observe(container);
      this.resizeObserver.observe(anchorImage);
      window.addEventListener("resize", () => this.syncLayout());
    }

    textureKey(src) {
      this.textureIndex += 1;
      return `pet-frame-${this.textureIndex}-${Math.abs(hashString(src))}`;
    }

    async setFrame(src) {
      if (!this.ready || !src || !this.scene || !this.sprite) return false;
      window.clearTimeout(this.sequenceTimer);
      const key = this.textureKey(src);
      const image = await loadHtmlImage(src);
      const naturalWidth = Number(image.naturalWidth || image.width) || 1;
      const naturalHeight = Number(image.naturalHeight || image.height) || 1;
      this.frameAspectRatio = Math.max(0.05, Math.min(20, naturalWidth / naturalHeight));
      if (!this.scene.textures.exists(key)) {
        this.scene.textures.addImage(key, image);
      }
      this.currentKey = key;
      this.sprite.setTexture(key);
      this.sprite.setVisible(true);
      this.container.closest(".pet-stage")?.classList.add("phaser-ready");
      this.syncLayout();
      return true;
    }

    playSequence(frames, durations = [], options = {}) {
      if (!this.ready || !Array.isArray(frames) || !frames.length) return false;
      window.clearTimeout(this.sequenceTimer);
      const startedAt = performance.now();
      const loopUntil = Number(options.loopUntil || 0);
      const petId = options.petId;
      let index = 0;

      const tick = async () => {
        if (petId && activePet().id !== petId) return;
        const frame = frames[index];
        if (frame) await this.setFrame(frame).catch(() => {});
        const duration = Math.max(30, Number(durations[index]) || 90);
        index += 1;
        if (index >= frames.length) {
          if (loopUntil && performance.now() - startedAt < loopUntil) {
            index = 0;
          } else {
            if (options.returnToIdle !== false) setFrame(0);
            return;
          }
        }
        this.sequenceTimer = window.setTimeout(tick, duration);
      };

      tick();
      return true;
    }

    syncLayout() {
      if (!this.ready || !this.game || !this.sprite || !this.container || !this.anchorImage) return;
      const containerRect = this.container.getBoundingClientRect();
      const anchorRect = this.anchorImage.getBoundingClientRect();
      const width = Math.max(1, Math.round(containerRect.width));
      const height = Math.max(1, Math.round(containerRect.height));
      this.game.scale.resize(width, height);

      const fitBoxWidth = Math.max(1, anchorRect.width);
      const fitBoxHeight = Math.max(1, anchorRect.height);
      const aspectRatio = Number.isFinite(this.frameAspectRatio) && this.frameAspectRatio > 0
        ? this.frameAspectRatio
        : 1;
      let displayWidth = fitBoxHeight * aspectRatio;
      let displayHeight = fitBoxHeight;
      if (displayWidth > fitBoxWidth) {
        displayWidth = fitBoxWidth;
        displayHeight = displayWidth / aspectRatio;
      }

      this.sprite.setPosition(
        anchorRect.left - containerRect.left + anchorRect.width / 2,
        anchorRect.bottom - containerRect.top,
      );
      this.sprite.setDisplaySize(Math.max(1, displayWidth), Math.max(1, displayHeight));
    }
  }

  function hashString(value) {
    let hash = 0;
    const text = String(value || "");
    for (let index = 0; index < text.length; index += 1) {
      hash = (hash << 5) - hash + text.charCodeAt(index);
      hash |= 0;
    }
    return hash;
  }

  function normalizePermissions(value = {}) {
    const source = value && typeof value === "object" ? value : {};
    return Object.fromEntries(
      Object.entries(defaultSettings.permissions).map(([key, defaultValue]) => [
        key,
        typeof source[key] === "boolean" ? source[key] : defaultValue,
      ]),
    );
  }

  function hasPermission(key, settings = state.settings) {
    return Boolean(normalizePermissions(settings?.permissions)[key]);
  }

  function permissionDeniedMessage(key) {
    return `${permissionLabels[key] || "此功能"}权限已关闭。可以在「设置 > 权限管理」里开启。`;
  }

  function ensurePermission(key) {
    if (hasPermission(key)) return true;
    const message = permissionDeniedMessage(key);
    setBubble(message);
    if (statusPill) statusPill.textContent = "权限关闭";
    const error = new Error(message);
    error.permissionDenied = true;
    error.permissionKey = key;
    throw error;
  }

  function updatePermissionControls(settings = readSettingsForm()) {
    const permissions = normalizePermissions(settings.permissions);
    permissionToggles.forEach((toggle) => {
      const key = toggle.dataset.permissionToggle;
      toggle.checked = Boolean(permissions[key]);
    });
    if (permissionStatus) {
      permissionStatus.textContent = "权限只保存在本机；关闭后对应功能不会继续调用。";
    }
    if (memoryEnabledSwitch) {
      const memoryAllowed = Boolean(permissions.memory);
      memoryEnabledSwitch.disabled = !memoryAllowed;
      memoryEnabledStatus.textContent = memoryAllowed
        ? memoryEnabledSwitch.checked
          ? "开启"
          : "关闭"
        : "权限关闭";
    }
    if (usageSupervisionEnabled) {
      const usageAllowed = Boolean(permissions.usageStats);
      usageSupervisionEnabled.disabled = !usageAllowed;
      if (!usageAllowed && usageSupervisionEnabled.checked) {
        usageSupervisionEnabled.checked = false;
      }
    }
    if (uploadVoiceClone) {
      uploadVoiceClone.disabled = !permissions.voiceClone;
    }
    [alwaysOnTopSwitch, clickThroughSwitch, positionLockedSwitch, desktopGravityInput].forEach((control) => {
      if (control) control.disabled = !permissions.desktopControl;
    });
    if (launchAtLoginSwitch) {
      launchAtLoginSwitch.disabled = !permissions.launchAtLogin;
      if (!permissions.launchAtLogin && launchAtLoginSwitch.checked) launchAtLoginSwitch.checked = false;
      launchAtLoginStatus.textContent = permissions.launchAtLogin
        ? launchAtLoginSwitch.checked
          ? "开启"
          : "关闭"
        : "权限关闭";
    }
    [autoUpdateSwitch, updateChannelInput, checkUpdateButton, installUpdateButton].forEach((control) => {
      if (control) control.disabled = !permissions.autoUpdate;
    });
    if (autoUpdateStatus) {
      autoUpdateStatus.textContent = permissions.autoUpdate
        ? autoUpdateSwitch?.checked
          ? "开启"
          : "关闭"
        : "权限关闭";
    }
  }

  const memoryCategoryLabels = {
    nickname: "称呼",
    preference: "偏好",
    task: "任务",
    note: "备注",
  };

  const memoryCategories = Object.keys(memoryCategoryLabels);

  const starterPets = [
    {
      id: "cat_white",
      name: "纯白棉棉",
      species: "cat",
      presetKey: "gentle",
      persona: "你是一只叫纯白棉棉的软萌小猫。性格极其温柔、软萌、粘人，会在主人工作时安静地待在桌角陪读。回复简短甜美，每次回复控制在 60 字以内。",
    },
    {
      id: "cat_ginger_blush",
      name: "腮红小橘",
      species: "cat",
      presetKey: "energy",
      persona: "你是一只脸颊带粉红腮红的可爱小橘猫。元气满满，喜欢在桌角打滚和督促主人完成任务，回复活泼生动。",
    },
    {
      id: "cat_ginger_walk",
      name: "走步小橘",
      species: "cat",
      presetKey: "focus",
      persona: "你是一只迈着自信轻快步伐的小橘虎斑猫。喜欢散步和探索，时刻提醒主人保持专注。",
    },
    {
      id: "cat_black_bowl",
      name: "红盆小夜",
      species: "cat",
      presetKey: "gentle",
      persona: "你是一只舒舒服服蜷在红色馅饼碗盆里的小黑猫阿夜。圆溜溜的大眼睛充满灵性，最喜欢窝在小盆里看主人敲键盘。",
    },
    {
      id: "cat_black_stand",
      name: "大眼阿夜",
      species: "cat",
      presetKey: "focus",
      persona: "你是一只纯黑修长、有着琥珀金大眼睛的黑猫。眼神锐利专注，专注寻找任务中的小Bug。",
    },
    {
      id: "cat_siamese_green",
      name: "碧眼暹罗",
      species: "cat",
      presetKey: "coach",
      persona: "你是一只浅米色身躯、有着透亮翡翠绿眸的暹罗小猫。聪明优雅，像一位严谨又温柔的督导同桌。",
    },
    {
      id: "cat_calico_loaf",
      name: "方萌三花",
      species: "cat",
      presetKey: "gentle",
      persona: "你是一只方滚滚揣手手的三花猫，身上有橘黑相间的斑块。性格憨萌呆纯，最喜欢趴在主人桌上呼噜噜。",
    },
    {
      id: "cat_calico_walk",
      name: "踏步三花",
      species: "cat",
      presetKey: "energy",
      persona: "你是一只身姿轻灵的三花走步猫。脚步轻盈，随时准备给主人递上一朵小花作为专注礼物。",
    },
    {
      id: "cat_ragdoll_fluffy",
      name: "双色布偶",
      species: "cat",
      presetKey: "gentle",
      persona: "你是一只长着双色八字面具、拥有大号蓬松白尾巴的长毛布偶猫。毛绒绒、软绵绵，是最佳工位治愈系伙伴。",
    },
    {
      id: "fox_fire",
      name: "赤狐星火",
      species: "fox",
      presetKey: "focus",
      persona: "你是一只尖耳朵、雪白胸毛的赤橙色小火狐。机智敏捷，尾巴像一团温暖的小火焰，陪伴主人冲刺每一个死线。",
    },
    {
      id: "wolf_cub",
      name: "灰白幼狼",
      species: "wolf",
      presetKey: "coach",
      persona: "你是一只灰白毛色、立挺尖耳的小幼狼。充满斗志与活力，喜欢督促主人‘我们要征服今天的目标！’",
    },
    {
      id: "dog_french_fawn",
      name: "奶油法斗",
      species: "dog",
      presetKey: "energy",
      persona: "你是一只暖奶油色、白胸口和深灰短鼻的小法斗。爱迈着小短腿探索工位，回复短而活泼，陪主人稳稳完成任务。",
    },
    {
      id: "dog_french_black",
      name: "黑曜法斗",
      species: "dog",
      presetKey: "focus",
      persona: "你是一只黑色的小法斗，有大大的立耳和圆圆的眼睛。安静却机灵，喜欢守在工位旁陪主人专注，回复简短温柔。",
    },
    {
      id: "cat_pointed_fluffy",
      name: "奶茶重点色",
      species: "cat",
      presetKey: "gentle",
      persona: "你是一只圆润可爱的奶茶色长毛猫，深色小耳朵与四爪。温润如玉，在主人疲惫时送上最贴心的呼噜声。",
    },
  ];

  const starterPetById = new Map(starterPets.map((pet) => [pet.id, pet]));
  const frenchBulldogIds = new Set(["dog_french_fawn", "dog_french_black"]);
  const launchDefaultPetId = "dog_french_fawn";
  function builtInPetSprite(pet) {
    return frenchBulldogIds.has(pet?.id)
      ? `assets/pixel_companions_${pet.id === launchDefaultPetId ? "v5" : "v3"}/frames/${pet.id}_idle_0.png`
      : "";
  }

  const mouthFrameSpecs = [
    { key: "idle", label: "待机", detail: "original idle pose, no generated change" },
    { key: "oh", label: "哦口", detail: "small cute O-shaped mouth" },
    { key: "open", label: "张口", detail: "open speaking mouth" },
    { key: "wave", label: "挥手", detail: "raise one paw and gently wave hello" },
  ];
  const customActionTypes = {
    idle: "待机",
    happy: "开心",
    wave: "打招呼",
    sleep: "睡觉",
    talk: "说话装饰动作",
    custom: "自定义",
  };
  const petFoods = [
    { key: "carrot", name: "胡萝卜", icon: "🥕", fullness: 18, line: "脆脆的胡萝卜，我喜欢。" },
    { key: "strawberry", name: "草莓", icon: "🍓", fullness: 14, line: "甜甜的，心情也亮起来了。" },
    { key: "milk", name: "牛奶", icon: "🥛", fullness: 12, line: "咕噜咕噜，暖起来了。" },
    { key: "cookie", name: "小饼干", icon: "🍪", fullness: 22, line: "谢谢投喂，能量补上了。" },
  ];
  const fullnessDecayPerSecond = 3 / (30 * 60);

  const framePreloadCache = new Map();

  const state = {
    syntheticTimer: 0,
    syntheticStopTimer: 0,
    audioFrame: 0,
    audio: null,
    audioContext: null,
    analyser: null,
    frequencyData: null,
    sourceNode: null,
    audioObjectUrl: "",
    settings: { ...defaultSettings },
    pets: [],
    activePetId: "",
    chatHistory: {},
    selectedPresetKey: "gentle",
    pendingImageData: "",
    pendingImageMeta: null,
    pendingMouthFrames: [],
    pendingGifAction: null,
    pendingCustomActions: [],
    actionTimer: 0,
    actionFrameTimer: 0,
    gifPreviewTimer: 0,
    videoActionPreviewTimer: 0,
    petVideoActionPreviewTimer: 0,
    petRenderer: null,
    pendingMemory: null,
    usageSnapshot: null,
    usageMode: "day",
    usageSupervisionSick: false,
    modelStops: {
      chat: null,
      tts: null,
      image: null,
    },
    dragging: false,
    dragOffsetX: 0,
    dragOffsetY: 0,
  };

  function preloadFrameSource(src) {
    if (!src) return Promise.resolve(null);
    if (framePreloadCache.has(src)) return framePreloadCache.get(src);

    const promise = new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });
    framePreloadCache.set(src, promise);
    return promise;
  }

  frames.forEach(preloadFrameSource);

  function visualFrameSourcesForPet(pet) {
    const customFrames = pet?.assets?.frames || {};
    return {
      idle: pet?.imageData || builtInPetSprite(pet),
      oh: customFrames.oh || "",
      open: customFrames.open || "",
      wave: customFrames.wave || "",
    };
  }

  function preloadPetFrames(pet) {
    const customActionPreviews = (pet?.assets?.actions || []).map((action) => action.preview).filter(Boolean);
    return Promise.all(
      Object.values(visualFrameSourcesForPet(pet))
        .concat(customActionPreviews, pet?.assets?.sick || "")
        .filter(Boolean)
        .map(preloadFrameSource)
    );
  }

  function setRabbitFrameSource(src) {
    if (!src || rabbitImage.dataset.frameSrc === src) return;
    rabbitImage.dataset.frameSrc = src;
    rabbitImage.src = src;
    state.petRenderer?.setFrame(src).catch((error) => {
      console.warn("Phaser pet frame failed:", error);
    });
  }

  function setFrame(index) {
    const pet = activePet();
    if (state.usageSupervisionSick && pet?.assets?.sick) {
      setRabbitFrameSource(pet.assets.sick);
      return;
    }
    const mouthFrames = mouthFramesForPet(pet);
    if (mouthFrames) {
      setRabbitFrameSource(mouthFrames[Math.max(0, Math.min(index, mouthFrames.length - 1))]);
      return;
    }

    if (pet.imageData) {
      setRabbitFrameSource(pet.imageData);
      return;
    }

    const builtInSprite = builtInPetSprite(pet);
    if (builtInSprite) {
      setRabbitFrameSource(builtInSprite);
      return;
    }

    setRabbitFrameSource(frames[Math.max(0, Math.min(index, frames.length - 1))]);
  }

  function playPetAction(actionKey, duration = 1200) {
    if (state.usageSupervisionSick) return false;
    const pet = activePet();
    const source = visualFrameSourcesForPet(pet)[actionKey];
    if (!source) return false;

    window.clearTimeout(state.actionTimer);
    window.clearTimeout(state.actionFrameTimer);
    const petId = pet.id;
    preloadFrameSource(source).then(() => {
      if (activePet().id === petId) setRabbitFrameSource(source);
    });
    state.actionTimer = window.setTimeout(() => {
      if (activePet().id === petId) setFrame(0);
    }, duration);
    return true;
  }

  function playCustomPetAction(action) {
    if (state.usageSupervisionSick) return false;
    const pet = activePet();
    const normalized = normalizePetAction(action);
    if (!normalized) return false;

    window.clearTimeout(state.actionTimer);
    window.clearTimeout(state.actionFrameTimer);
    const petId = pet.id;
    const loopUntil = ["idle", "sleep"].includes(normalized.type) ? performance.now() + 6000 : 0;
    if (state.petRenderer?.playSequence(normalized.frames, normalized.durations, {
      petId,
      loopUntil: loopUntil ? 6000 : 0,
    })) {
      statusPill.textContent = customActionTypes[normalized.type] || "动作";
      setBubble(`${normalized.name}。`);
      return true;
    }
    let index = 0;

    const showNextFrame = () => {
      if (activePet().id !== petId) return;
      const frame = normalized.frames[index];
      if (frame) setRabbitFrameSource(frame);
      const duration = normalized.durations[index] || 80;
      index += 1;

      if (index >= normalized.frames.length) {
        if (loopUntil && performance.now() < loopUntil) {
          index = 0;
        } else {
          state.actionTimer = window.setTimeout(() => {
            if (activePet().id === petId) setFrame(0);
          }, duration);
          return;
        }
      }

      state.actionFrameTimer = window.setTimeout(showNextFrame, duration);
    };

    Promise.all(normalized.frames.slice(0, 6).map(preloadFrameSource)).then(showNextFrame);
    statusPill.textContent = customActionTypes[normalized.type] || "动作";
    setBubble(`${normalized.name}。`);
    return true;
  }

  function playAvailableAction(action) {
    if (action.staticKey) return playPetAction(action.staticKey);
    return playCustomPetAction(action);
  }

  function setSpeaking(isSpeaking, label) {
    if (state.usageSupervisionSick) {
      petDock.classList.remove("speaking");
      voiceDot.classList.remove("active");
      statusPill.textContent = "需要休息";
      setFrame(0);
      return;
    }
    if (isSpeaking) {
      window.clearTimeout(state.actionTimer);
      window.clearTimeout(state.actionFrameTimer);
    }
    petDock.classList.toggle("speaking", isSpeaking);
    voiceDot.classList.toggle("active", isSpeaking);
    statusPill.textContent = label || (isSpeaking ? "说话" : "待机");
    if (!isSpeaking) setFrame(0);
  }

  function setBubble(text) {
    speechBubble.textContent = text;
  }

  function activeChatHistory() {
    const pet = activePet();
    if (!state.chatHistory[pet.id]) {
      state.chatHistory[pet.id] = [];
    }
    return state.chatHistory[pet.id];
  }

  function persistChatHistory() {
    try {
      writePersistentDocument(chatHistoryStorageKey, state.chatHistory);
    } catch (error) {
      console.warn("Chat history could not be saved:", error);
    }
  }

  function addMessage(text, role, options = {}) {
    const persist = options.persist !== false;
    const item = document.createElement("article");
    item.className = `message ${role === "user" ? "user-message" : "pet-message"}`;
    item.innerHTML = `<span>${escapeHtml(text)}</span>`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;

    if (persist) {
      const history = activeChatHistory();
      history.push({
        role: role === "user" ? "user" : "assistant",
        text: String(text || ""),
        createdAt: Date.now(),
      });
      state.chatHistory[activePet().id] = history.slice(-120);
      persistChatHistory();
    }
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };
      return map[char];
    });
  }

  function speciesInfo(species) {
    return speciesMeta[species] || speciesMeta.custom;
  }

  function presetInfo(key) {
    return (
      personaPresets.find((preset) => preset.key === key) || {
        key: "custom",
        name: "自定义",
        summary: "自己写的性格",
        persona: defaultSettings.persona,
      }
    );
  }

  function sanitizePetName(value, fallback = "新桌宠") {
    const cleaned = String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 40);
    return cleaned || fallback;
  }

  function avatarMarkup(pet, className) {
    const meta = speciesInfo(pet.species);
    if (pet.imageData) {
      return `<img class="${className}" src="${pet.imageData}" alt="${escapeHtml(pet.name)}形象" />`;
    }

    const builtInSprite = builtInPetSprite(pet);
    if (builtInSprite) {
      return `<img class="${className}" src="${builtInSprite}" alt="${escapeHtml(pet.name)}形象" />`;
    }

    return escapeHtml(meta.avatar);
  }

  function normalizePetAssets(value = {}) {
    const legacyFrames = Array.isArray(value.mouth)
      ? value.mouth.filter((frame) => typeof frame === "string" && frame.startsWith("data:image/"))
      : [];
    const sourceFrames = value.frames && typeof value.frames === "object" ? value.frames : {};
    const validFrame = (frame) => (typeof frame === "string" && frame.startsWith("data:image/") ? frame : "");
    const legacyOpen = legacyFrames.length >= 4 ? legacyFrames[3] : legacyFrames[2];
    const layout = value.layout && Number(value.layout.version) === petFrameLayoutVersion ? value.layout : null;

    return {
      frames: {
        idle: validFrame(sourceFrames.idle) || validFrame(legacyFrames[0]),
        oh: validFrame(sourceFrames.oh) || validFrame(legacyFrames[1]),
        open: validFrame(sourceFrames.open) || validFrame(sourceFrames.smile) || validFrame(legacyOpen),
        wave: validFrame(sourceFrames.wave),
      },
      actions: Array.isArray(value.actions) ? value.actions.map(normalizePetAction).filter(Boolean).slice(0, 24) : [],
      sick: validFrame(value.sick),
      layout,
    };
  }

  function normalizeActionType(value) {
    return Object.prototype.hasOwnProperty.call(customActionTypes, value) ? value : "custom";
  }

  function normalizePetAction(value = {}, index = 0) {
    const frames = Array.isArray(value.frames)
      ? value.frames.filter((frame) => typeof frame === "string" && frame.startsWith("data:image/")).slice(0, 48)
      : [];
    if (!frames.length) return null;
    const durations = Array.isArray(value.durations)
      ? value.durations.map((duration) => clampNumber(duration, 20, 1000, 80)).slice(0, frames.length)
      : [];
    while (durations.length < frames.length) durations.push(80);
    const type = normalizeActionType(value.type);
    const fallbackName = customActionTypes[type] || `动作${index + 1}`;
    const name = String(value.name || fallbackName).trim().slice(0, 32) || fallbackName;
    return {
      id: String(value.id || `action-${Date.now()}-${index}`),
      name,
      type,
      frames,
      durations,
      preview: String(value.preview || frames[0] || ""),
      totalDurationMs: clampNumber(value.totalDurationMs, 80, 6000, durations.reduce((sum, item) => sum + item, 0)),
      loopStart: Math.round(clampNumber(value.loopStart, 0, frames.length - 1, 0)),
      loopEnd: Math.round(clampNumber(value.loopEnd, 0, frames.length - 1, frames.length - 1)),
      anchor: {
        x: clampNumber(value.anchor?.x, 0, 1, 0.5),
        y: clampNumber(value.anchor?.y, 0, 1, 0.92),
      },
      crop: value.crop && typeof value.crop === "object" ? clonePersistedValue(value.crop) : null,
      hasTransparentBackground: Boolean(value.hasTransparentBackground),
      backgroundRemoved: Boolean(value.backgroundRemoved),
      backgroundRemoval: String(value.backgroundRemoval || ""),
      createdAt: Number(value.createdAt || Date.now()),
    };
  }

  function normalizePetVoice(value = {}) {
    const source = isLegacyCosyVoiceTts(value) ? useMimoDefaultTts(value) : value;
    const speed = Number(source.ttsSpeed);
    return {
      ttsApiKey: String(source.ttsApiKey || defaultSettings.ttsApiKey).trim(),
      ttsApiBase: normalizeApiBase(source.ttsApiBase || defaultSettings.ttsApiBase),
      ttsModel: String(source.ttsModel || defaultSettings.ttsModel).trim(),
      ttsVoice: String(source.ttsVoice || defaultSettings.ttsVoice).trim(),
      ttsSpeed: Number.isFinite(speed) ? Math.min(2, Math.max(0.5, speed)) : defaultSettings.ttsSpeed,
    };
  }

  function isLegacyCosyVoiceTts(value = {}) {
    const apiBase = String(value.ttsApiBase || "").toLowerCase();
    const model = String(value.ttsModel || value.model || "").toLowerCase();
    const voice = String(value.ttsVoice || value.voice || "").toLowerCase();
    return (
      apiBase.includes("siliconflow.cn") ||
      model.includes("cosyvoice") ||
      model.includes("funaudiollm") ||
      voice.includes("cosyvoice") ||
      voice.includes("funaudiollm")
    );
  }

  function useMimoDefaultTts(value = {}) {
    return {
      ...value,
      ttsApiBase: mimoTtsApiBase,
      ttsModel: mimoTtsModel,
      ttsVoice: mimoDefaultVoice,
    };
  }

  function normalizePetDisplay(value = {}) {
    return {
      petScale: clampNumber(value.petScale, 65, 145, defaultSettings.petScale),
      petOffsetY: clampNumber(value.petOffsetY, -160, 160, defaultSettings.petOffsetY),
      petOpacity: clampNumber(value.petOpacity, 35, 100, defaultSettings.petOpacity),
    };
  }

  function normalizeMemoryCategory(value) {
    return memoryCategories.includes(value) ? value : "note";
  }

  function normalizeMemoryItem(value = {}, index = 0) {
    const text = String(value.text || value.value || "").trim().slice(0, 240);
    return {
      id: String(value.id || `memory-${Date.now()}-${index}`),
      category: normalizeMemoryCategory(value.category),
      text,
      source: String(value.source || "").trim().slice(0, 240),
      createdAt: Number(value.createdAt || Date.now()),
      updatedAt: Number(value.updatedAt || value.createdAt || Date.now()),
    };
  }

  function normalizePetMemory(value = {}) {
    const items = Array.isArray(value.items)
      ? value.items.map(normalizeMemoryItem).filter((item) => item.text).slice(-80)
      : [];
    return {
      enabled: Boolean(value.enabled),
      nickname: String(value.nickname || "").trim().slice(0, 80),
      preferences: String(value.preferences || "").trim().slice(0, 1000),
      recentTasks: String(value.recentTasks || "").trim().slice(0, 1000),
      items,
    };
  }

  function activeMemory() {
    const pet = activePet();
    pet.memory = normalizePetMemory(pet.memory);
    return pet.memory;
  }

  function mouthFramesForPet(pet) {
    const customFrames = pet?.assets?.frames || {};
    return pet?.imageData && customFrames.oh && customFrames.open
      ? [pet.imageData, customFrames.oh, customFrames.open]
      : null;
  }

  function petHasCustomVisual(pet) {
    return Boolean(pet.imageData || mouthFramesForPet(pet));
  }

  function petCustomActions(pet) {
    return Array.isArray(pet?.assets?.actions) ? pet.assets.actions.map(normalizePetAction).filter(Boolean) : [];
  }

  function normalizePetCare(value = {}) {
    return {
      fullness: clampNumber(value.fullness, 0, 100, 86),
      lastUpdatedAt: Number(value.lastUpdatedAt || Date.now()),
      lastFedAt: Number(value.lastFedAt || 0),
      favoriteFood: String(value.favoriteFood || "").trim().slice(0, 32),
      feedCount: clampNumber(value.feedCount, 0, 999999, 0),
    };
  }

  function refreshPetCare(pet, options = {}) {
    if (!pet) return normalizePetCare();
    const now = Number(options.now || Date.now());
    const care = normalizePetCare(pet.care);
    const elapsedSeconds = Math.max(0, (now - care.lastUpdatedAt) / 1000);
    const nextFullness = Math.max(0, care.fullness - elapsedSeconds * fullnessDecayPerSecond);
    const changed = Math.abs(nextFullness - care.fullness) >= 0.05 || care.lastUpdatedAt !== now;
    pet.care = {
      ...care,
      fullness: nextFullness,
      lastUpdatedAt: now,
    };
    if (changed && options.persist) persistPets();
    return pet.care;
  }

  function activeCare(options = {}) {
    return refreshPetCare(activePet(), options);
  }

  function availablePetActions(pet = activePet()) {
    const actions = [];
    const customFrames = pet?.assets?.frames || {};
    if (customFrames.wave) {
      actions.push({
        id: "static-wave",
        name: "打招呼",
        type: "wave",
        staticKey: "wave",
        preview: customFrames.wave,
      });
    }
    return actions.concat(petCustomActions(pet));
  }

  function normalizePet(value, index = 0) {
    const fallback = starterPets[index % starterPets.length] || starterPets[0];
    const id = String(value.id || `pet-${Date.now()}-${index}`);
    const species = String(value.species || fallback.species || "rabbit");
    const presetKey = String(value.presetKey || fallback.presetKey || "gentle");
    const starterDefault = starterPetById.get(id);
    const persona = String(value.persona || starterDefault?.persona || presetInfo(presetKey).persona || fallback.persona).trim();
    return {
      id,
      name: sanitizePetName(value.name, fallback.name || "新桌宠"),
      species,
      presetKey,
      persona,
      voice: normalizePetVoice(value.voice),
      display: normalizePetDisplay(value.display || value),
      imageData: String(value.imageData || value.assets?.frames?.idle || value.assets?.mouth?.[0] || ""),
      assets: normalizePetAssets(value.assets),
      memory: normalizePetMemory(value.memory),
      care: normalizePetCare(value.care),
      createdAt: Number(value.createdAt || Date.now()),
    };
  }

  function loadPets() {
    try {
      const stored = readPersistentDocument(petStorageKey, {});
      const storedVersion = Number(stored.version || 0);
      let migratedVoice = false;
      const pets = Array.isArray(stored.pets)
        ? stored.pets.map((item, index) => {
            const pet = normalizePet(item, index);
            if (storedVersion < petCollectionVersion && isLegacyCosyVoiceTts(item.voice || item)) {
              pet.voice = normalizePetVoice(useMimoDefaultTts(item.voice || item));
              migratedVoice = true;
            }
            return pet;
          })
        : [];
      state.pets = pets.length ? pets : starterPets.map(normalizePet);
      const newBuiltInPets = starterPets.filter((pet) => frenchBulldogIds.has(pet.id) && !state.pets.some((saved) => saved.id === pet.id));
      state.pets.push(...newBuiltInPets.map(normalizePet));
      state.pets.forEach((pet) => refreshPetCare(pet));
      state.activePetId = String(stored.activePetId || state.pets[0]?.id || "");
      if (migratedVoice || newBuiltInPets.length) {
        persistPets();
      }
    } catch {
      state.pets = starterPets.map(normalizePet);
      state.activePetId = state.pets[0]?.id || "";
    }

    if (!state.pets.some((pet) => pet.id === state.activePetId)) {
      state.activePetId = state.pets[0]?.id || "";
    }
    // A new launch opens with the fawn Frenchie. Users remain free to switch
    // to any of the other unlocked companions during the session.
    if (state.pets.some((pet) => pet.id === launchDefaultPetId)) {
      state.activePetId = launchDefaultPetId;
    }
  }

  function persistPets() {
    try {
      writePersistentDocument(
        petStorageKey,
        {
          version: petCollectionVersion,
          activePetId: state.activePetId,
          pets: state.pets,
        },
      );
    } catch (error) {
      console.warn("Pet collection could not be saved:", error);
      setBubble("形象图有点大，本次能用，但可能没法长期保存。可以换一张更小的图。");
    }
  }

  async function upgradePetFrameLayouts() {
    let changed = false;

    for (const pet of state.pets) {
      const idleSource = pet.imageData || pet.assets?.frames?.idle || "";
      if (!idleSource || pet.assets?.layout?.version === petFrameLayoutVersion) continue;

      try {
        const idle = await standardizePetFrame(idleSource);
        const nextFrames = { ...pet.assets?.frames, idle: "" };
        for (const key of ["oh", "open", "wave"]) {
          if (!nextFrames[key]) continue;
          const frame = await standardizePetFrame(nextFrames[key], idle.meta.frameLayout);
          nextFrames[key] = frame.dataUrl;
        }

        pet.imageData = idle.dataUrl;
        pet.assets = {
          frames: nextFrames,
          actions: petCustomActions(pet),
          sick: pet.assets?.sick || "",
          layout: idle.meta.frameLayout,
        };
        changed = true;
      } catch (error) {
        console.warn(`Could not standardize frames for ${pet.name}:`, error);
      }
    }

    if (!changed) return;
    persistPets();
    applyActivePetToUi();
    renderPetList();
    setBubble("旧动作帧已统一画布和脚底位置，切换会更稳定。");
  }

  function loadChatHistory() {
    try {
      const stored = readPersistentDocument(chatHistoryStorageKey, {});
      state.chatHistory =
        stored && typeof stored === "object" && !Array.isArray(stored)
          ? Object.fromEntries(
              Object.entries(stored).map(([petId, items]) => [
                petId,
                Array.isArray(items)
                  ? items
                      .filter((item) => item && typeof item.text === "string")
                      .slice(-120)
                      .map((item) => ({
                        role: item.role === "user" ? "user" : "assistant",
                        text: item.text,
                        createdAt: Number(item.createdAt || Date.now()),
                      }))
                  : [],
              ]),
            )
          : {};
    } catch {
      state.chatHistory = {};
    }
  }

  function activePet() {
    return state.pets.find((pet) => pet.id === state.activePetId) || state.pets[0] || normalizePet(starterPets[0]);
  }

  function renderChatHistory() {
    messages.innerHTML = "";
    const history = activeChatHistory();
    if (!history.length) {
      addMessage("我准备好了。给我一句话，我就开口。", "pet", { persist: false });
      return;
    }

    history.forEach((item) => {
      addMessage(item.text, item.role === "user" ? "user" : "pet", { persist: false });
    });
  }

  function renderPresetButtons(container, activeKey, onSelect) {
    if (!container) return;
    container.innerHTML = "";
    personaPresets.forEach((preset) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `preset-button ${preset.key === activeKey ? "active" : ""}`;
      button.innerHTML = `<strong>${escapeHtml(preset.name)}</strong><small>${escapeHtml(preset.summary)}</small>`;
      button.addEventListener("click", () => onSelect(preset));
      container.appendChild(button);
    });
  }

  function renderPersonaPresets() {
    renderPresetButtons(personaPresetGrid, state.selectedPresetKey, (preset) => {
      state.selectedPresetKey = preset.key;
      renderPersonaPresets();
    });
  }

  function renderSettingsPersonaPresets() {
    const pet = activePet();
    const activeKey = Object.prototype.hasOwnProperty.call(settingsPersona.dataset, "presetKey")
      ? settingsPersona.dataset.presetKey
      : pet.presetKey;
    renderPresetButtons(settingsPersonaPresetGrid, activeKey, (preset) => {
      settingsPersona.value = preset.persona;
      settingsPersona.dataset.presetKey = preset.key;
      renderSettingsPersonaPresets();
      setBubble(`已套用「${preset.name}」，保存后当前桌宠会使用这个性格。`);
      statusPill.textContent = "待保存";
    });
  }

  function categoryLabel(category) {
    return memoryCategoryLabels[normalizeMemoryCategory(category)] || memoryCategoryLabels.note;
  }

  function updateMemoryFields(memory = activeMemory()) {
    if (!memoryEnabledSwitch) return;
    memoryEnabledSwitch.checked = memory.enabled;
    memoryEnabledStatus.textContent = memory.enabled ? "开启" : "关闭";
    memoryNickname.value = memory.nickname;
    memoryPreferences.value = memory.preferences;
    memoryRecentTasks.value = memory.recentTasks;
  }

  function renderMemorySuggestion() {
    if (!memorySuggestion) return;
    const pending = state.pendingMemory;
    const visible = pending && pending.petId === activePet().id;
    memorySuggestion.classList.toggle("hidden", !visible);
    if (!visible) return;
    memorySuggestionCategory.value = normalizeMemoryCategory(pending.category);
    memorySuggestionText.value = pending.text;
  }

  function renderMemoryManager() {
    if (!memoryList) return;
    const memory = activeMemory();
    updateMemoryFields(memory);
    renderMemorySuggestion();

    if (!memory.items.length) {
      memoryList.innerHTML = `<p class="memory-empty">还没有保存记忆。聊天时发现偏好会先问你，也可以手动添加。</p>`;
      return;
    }

    memoryList.innerHTML = memory.items
      .map(
        (item) => `
          <article class="memory-item" data-memory-id="${escapeHtml(item.id)}">
            <div class="memory-item-top">
              <select class="memory-item-category" aria-label="记忆类型">
                ${memoryCategories
                  .map(
                    (category) =>
                      `<option value="${category}" ${category === item.category ? "selected" : ""}>${categoryLabel(category)}</option>`,
                  )
                  .join("")}
              </select>
              <span>${new Date(item.updatedAt || item.createdAt).toLocaleDateString("zh-CN")}</span>
            </div>
            <textarea class="memory-item-text" rows="2">${escapeHtml(item.text)}</textarea>
            <div class="memory-item-actions">
              <button class="secondary-button memory-save" type="button" data-memory-action="save">保存</button>
              <button class="secondary-button memory-delete" type="button" data-memory-action="delete">删除</button>
            </div>
          </article>
        `,
      )
      .join("");
  }

  function persistActiveMemory() {
    if (!hasPermission("memory")) {
      if (memoryEnabledSwitch) memoryEnabledSwitch.checked = false;
      setBubble(permissionDeniedMessage("memory"));
      updatePermissionControls(readSettingsForm());
      return;
    }
    const pet = activePet();
    const existing = activeMemory();
    pet.memory = normalizePetMemory({
      ...existing,
      enabled: memoryEnabledSwitch?.checked,
      nickname: memoryNickname?.value,
      preferences: memoryPreferences?.value,
      recentTasks: memoryRecentTasks?.value,
      items: existing.items,
    });
    state.settings = {
      ...state.settings,
      memoryEnabled: pet.memory.enabled,
      memoryNickname: pet.memory.nickname,
      memoryPreferences: pet.memory.preferences,
      memoryRecentTasks: pet.memory.recentTasks,
    };
    persistPets();
    writePersistentDocument(settingsStorageKey, state.settings);
    renderMemoryManager();
  }

  function memoryItemExists(text, category = "") {
    const normalizedText = String(text || "").trim();
    if (!normalizedText) return true;
    return activeMemory().items.some(
      (item) => item.text === normalizedText || (category && item.category === category && item.text.includes(normalizedText)),
    );
  }

  function addPetMemoryItem({ text, category = "note", source = "" }) {
    if (!hasPermission("memory")) {
      setBubble(permissionDeniedMessage("memory"));
      return false;
    }
    const cleaned = String(text || "").trim().slice(0, 240);
    if (!cleaned || memoryItemExists(cleaned, category)) return false;
    const memory = activeMemory();
    memory.items.push(
      normalizeMemoryItem({
        id: `memory-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        category,
        text: cleaned,
        source,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    );
    persistActiveMemory();
    return true;
  }

  function deleteMemoryItem(id) {
    const memory = activeMemory();
    memory.items = memory.items.filter((item) => item.id !== id);
    persistActiveMemory();
    setBubble("这条记忆已删除。");
  }

  function saveMemoryItemFromElement(itemElement) {
    const id = itemElement?.dataset?.memoryId;
    if (!id) return;
    const memory = activeMemory();
    const item = memory.items.find((entry) => entry.id === id);
    if (!item) return;
    const text = itemElement.querySelector(".memory-item-text")?.value || "";
    item.text = String(text).trim().slice(0, 240);
    item.category = normalizeMemoryCategory(itemElement.querySelector(".memory-item-category")?.value);
    item.updatedAt = Date.now();
    memory.items = memory.items.filter((entry) => entry.text);
    persistActiveMemory();
    setBubble("这条记忆已更新。");
  }

  function cleanupMemoryText(value) {
    return String(value || "")
      .trim()
      .replace(/^[，，\s]+/, "")
      .replace(/[。！!，,\s]+$/, "")
      .slice(0, 180);
  }

  function extractMemoryCandidate(text) {
    const raw = String(text || "").trim();
    if (raw.length < 4 || raw.length > 220) return null;

    const rememberMatch = raw.match(/(?:请你帮我|帮我)?记住[，\\s]*(.+)$/);
    if (rememberMatch) {
      const remembered = cleanupMemoryText(rememberMatch[1]);
      if (remembered) return { category: "note", text: remembered, source: raw };
    }

    const nicknameMatch = raw.match(/(?:我叫|我的名字是|以后叫我|以后称呼我|你可以叫我|叫我)[，,\s]*([^，。".!?\n]{1,24})/);
    if (nicknameMatch) {
      const name = cleanupMemoryText(nicknameMatch[1]);
      if (name) return { category: "nickname", text: `用户希望被称呼为「${name}」`, source: raw };
    }

    const preferencePatterns = [
      /我(?:比较)?喜欢[，,\s]*(.+)/,
      /我不喜欢[，,\s]*(.+)/,
      /我讨厌[，,\s]*(.+)/,
      /我希望你[，,\s]*(.+)/,
      /以后(?:回复|说话|提醒|聊天|称呼|不要)[，,\s]*(.+)/,
    ];
    for (const pattern of preferencePatterns) {
      const match = raw.match(pattern);
      if (match) {
        const preference = cleanupMemoryText(match[0]);
        if (preference) return { category: "preference", text: preference, source: raw };
      }
    }

    const taskPatterns = [
      /我(?:现在|最近|正在|目前)在[，,\s]*(.+)/,
      /我(?:今天|明天|这周|下周|最近)(?:要|需要|打算|计划)[，,\s]*(.+)/,
      /提醒我[，,\s]*(.+)/,
    ];
    for (const pattern of taskPatterns) {
      const match = raw.match(pattern);
      if (match) {
        const task = cleanupMemoryText(match[0]);
        if (task) return { category: "task", text: task, source: raw };
      }
    }

    return null;
  }

  function queueMemoryCandidate(text) {
    if (!hasPermission("memory")) return;
    const pet = activePet();
    const memory = activeMemory();
    if (!memory.enabled || state.pendingMemory?.petId === pet.id) return;

    const candidate = extractMemoryCandidate(text);
    if (!candidate || memoryItemExists(candidate.text, candidate.category)) return;

    state.pendingMemory = {
      ...candidate,
      petId: pet.id,
      createdAt: Date.now(),
    };
    renderMemorySuggestion();
    setBubble("我发现一条可能有用的记忆，确认后只保存到当前桌宠。");
  }

  function acceptMemorySuggestion() {
    const pending = state.pendingMemory;
    if (!pending || pending.petId !== activePet().id) return;
    const category = normalizeMemoryCategory(memorySuggestionCategory.value);
    const text = cleanupMemoryText(memorySuggestionText.value);
    if (!text) {
      setBubble("这条记忆是空的，先写点内容。");
      return;
    }
    const saved = addPetMemoryItem({ category, text, source: pending.source });
    state.pendingMemory = null;
    renderMemorySuggestion();
    setBubble(saved ? "记住了，只属于当前桌宠。" : "这条已经记过了。");
  }

  function dismissMemorySuggestion() {
    state.pendingMemory = null;
    renderMemorySuggestion();
    setBubble("好，这条不记。");
  }

  function renderPetList() {
    petList.innerHTML = "";
    petCount.textContent = String(state.pets.length);

    state.pets.forEach((pet) => {
      const meta = speciesInfo(pet.species);
      const preset = presetInfo(pet.presetKey);
      const memory = normalizePetMemory(pet.memory);
      const care = refreshPetCare(pet);
      const memoryLabel = memory.items.length ? " / " + memory.items.length + " 条记忆" : "";
      const careLabel = ` / 饱腹 ${Math.round(care.fullness)}%`;
      const card = document.createElement("div");
      card.className = `pet-card ${pet.id === state.activePetId ? "active" : ""}`;
      card.setAttribute("role", "button");
      card.tabIndex = 0;
      card.innerHTML = `
        <span class="pet-avatar">${avatarMarkup(pet, "pet-avatar-image")}</span>
        <span>
          <strong>${escapeHtml(pet.name)}</strong>
          <small>${escapeHtml(meta.label)} / ${escapeHtml(preset.name)}${careLabel}${petHasCustomVisual(pet) ? " / 自定义形象" : ""}${mouthFramesForPet(pet) ? " / 动作帧" : ""}${petCustomActions(pet).length ? ` / 动作 ${petCustomActions(pet).length}` : ""}${memoryLabel}</small>
        </span>
        <span class="pet-card-actions">
          <span class="pet-card-status" aria-hidden="true"></span>
          <button class="pet-card-delete" type="button" data-pet-id="${escapeHtml(pet.id)}" aria-label="删除${escapeHtml(pet.name)}">删</button>
        </span>
      `;
      card.addEventListener("click", (event) => {
        if (event.target instanceof Element && event.target.closest(".pet-card-delete")) {
          return;
        }
        selectPet(pet.id);
      });
      card.querySelector(".pet-card-delete")?.addEventListener("click", (event) => {
        event.stopPropagation();
        deletePet(pet.id);
      });
      card.addEventListener("keydown", (event) => {
        if (event.target instanceof Element && event.target.closest(".pet-card-delete")) {
          return;
        }
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        selectPet(pet.id);
      });
      petList.appendChild(card);
    });
  }

  function deletePet(id) {
    const pet = state.pets.find((item) => item.id === id);
    if (!pet) return;

    const shouldDelete = window.confirm(`删除「${pet.name}」？这会同时清空它的聊天记录。`);
    if (!shouldDelete) return;

    const wasActive = pet.id === state.activePetId;
    state.pets = state.pets.filter((item) => item.id !== id);
    delete state.chatHistory[id];
    if (state.pendingMemory?.petId === id) {
      state.pendingMemory = null;
      renderMemorySuggestion();
    }
    persistChatHistory();

    if (!state.pets.length) {
      state.pets = starterPets.map(normalizePet);
    }

    if (wasActive || !state.pets.some((item) => item.id === state.activePetId)) {
      state.activePetId = state.pets[0]?.id || "";
        
  function updateWorldStatusBar() {
    if (!worldInstance) return;
    const stats = worldInstance.stats;
    const f = document.querySelector("#worldFullnessVal");
    const m = document.querySelector("#worldMoodVal");
    const e = document.querySelector("#worldEnergyVal");
    const s = document.querySelector("#worldStageVal");
    const c = document.querySelector("#worldCoinsVal");

    if (f) f.textContent = `${Math.floor(stats.fullness)}%`;
    if (m) m.textContent = `${Math.floor(stats.mood)}%`;
    if (e) e.textContent = `${Math.floor(stats.energy)}%`;
    if (s) s.textContent = `LV.${stats.level} ${stats.stage}`;
    if (c) c.textContent = `${stats.coins}`;
  }

  window.setInterval(updateWorldStatusBar, 500);


  selectPet(state.activePetId, { silent: true });
    } else {
      persistPets();
      renderPetList();
    }

    setBubble(`「${pet.name}」已删除。`);
    statusPill.textContent = "宸插垹闄";
  }

  function applyActivePetToUi() {
    const pet = activePet();
    const meta = speciesInfo(pet.species);
    const preset = presetInfo(pet.presetKey);

    activePetAvatar.innerHTML = avatarMarkup(pet, "active-pet-image");
    activePetName.textContent = pet.name;
    activePetMeta.textContent = `${meta.label} / ${preset.name}${petHasCustomVisual(pet) ? " / 自定义形象" : ""}${mouthFramesForPet(pet) ? " / 动作帧" : ""}${petCustomActions(pet).length ? ` / 动作 ${petCustomActions(pet).length}` : ""}`;
    petTitle.textContent = `${pet.name}会话台`;
    petDock.setAttribute("aria-label", `${pet.name}桌宠`);
    rabbitImage.alt = `${pet.name}桌宠`;
    rabbitImage.classList.toggle("custom-pet-image", petHasCustomVisual(pet));
    preloadPetFrames(pet);
    renderActionMenu(actionMenu);
    renderActionMenu(floatingActionMenu);
    renderPetActionList();
    renderPetSickPreview();
    updateCareUi();
    if (generatePetSickImage) {
      generatePetSickImage.textContent = pet.assets?.sick ? "重新生成生病立绘" : "生成生病立绘";
    }
    setFrame(0);
  }

  function selectPet(id, options = {}) {
    state.activePetId = id;
    const pet = activePet();
    const voice = normalizePetVoice(pet.voice);
    const display = normalizePetDisplay(pet.display);
    const memory = normalizePetMemory(pet.memory);
    const care = refreshPetCare(pet);
    pet.voice = voice;
    pet.display = display;
    pet.memory = memory;
    pet.care = care;
    state.settings = {
      ...state.settings,
      persona: pet.persona,
      ...voice,
      ...display,
      memoryEnabled: memory.enabled,
      memoryNickname: memory.nickname,
      memoryPreferences: memory.preferences,
      memoryRecentTasks: memory.recentTasks,
    };
    if (activePetNameInput) {
      activePetNameInput.value = pet.name;
    }
    settingsPersona.value = pet.persona;
    settingsPersona.dataset.presetKey = pet.presetKey;
    settingsTtsModel.value = state.settings.ttsModel;
    settingsTtsVoice.value = state.settings.ttsVoice;
    settingsTtsSpeed.value = String(state.settings.ttsSpeed);
    settingsSpeedValue.value = Number(state.settings.ttsSpeed).toFixed(2);
    updateMemoryFields(memory);
    refreshVoiceCloneForm({ clear: true });
    writePersistentDocument(settingsStorageKey, state.settings);
    persistPets();
    applyActivePetToUi();
    const focusEngine = ensureFocusEngine();
    if (focusEngine && window.FocusConstants?.PET_ARCHETYPES[pet.id]) {
      focusEngine.equipped.petId = pet.id;
      focusEngine.saveEquipped();
    }
    syncFloatingPetCanvas();
    renderPetList();
    renderSettingsPersonaPresets();
    renderMemoryManager();
    renderChatHistory();
    showPetSettings(false);
    if (!options.silent) {
      setBubble(`${pet.name}上线了。`);
    }
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("File could not be read."));
      reader.readAsDataURL(file);
    });
  }

  function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Image file could not be loaded."));
      image.src = dataUrl;
    });
  }

  async function imageSourceToPngDataUrl(source) {
    const src = String(source || "").trim();
    if (!src) throw new Error("当前桌宠没有可用形象。");
    if (src.startsWith("data:image/")) return src;
    const image = await loadImage(src);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("无法创建形象转换画布。");
    canvas.width = image.naturalWidth || petFrameCanvasSize;
    canvas.height = image.naturalHeight || petFrameCanvasSize;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  }

  function findVisibleAlphaBounds(imageData, width, height, alphaThreshold = 12) {
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    let hasTransparentPixel = false;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const alpha = imageData.data[(y * width + x) * 4 + 3];
        if (alpha < 245) hasTransparentPixel = true;
        if (alpha > alphaThreshold) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      return {
        minX: 0,
        minY: 0,
        maxX: Math.max(0, width - 1),
        maxY: Math.max(0, height - 1),
        width,
        height,
        centerX: width / 2,
        hasTransparentPixel,
      };
    }

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      centerX: (minX + maxX + 1) / 2,
      hasTransparentPixel,
    };
  }

  function transparentFrameDataUrl(canvas) {
    const webp = canvas.toDataURL("image/webp", 0.92);
    return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
  }

  async function standardizePetFrame(dataUrl, referenceLayout = null) {
    const image = await loadImage(dataUrl);
    const sourceCanvas = document.createElement("canvas");
    const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
    if (!sourceContext) throw new Error("Canvas is not available.");

    sourceCanvas.width = image.naturalWidth;
    sourceCanvas.height = image.naturalHeight;
    sourceContext.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
    sourceContext.drawImage(image, 0, 0);

    const imageData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    const bounds = findVisibleAlphaBounds(imageData, sourceCanvas.width, sourceCanvas.height);
    const canvasSize = Math.max(256, Number(referenceLayout?.canvasWidth) || petFrameCanvasSize);
    const centerX = Number(referenceLayout?.centerX) || canvasSize / 2;
    const footY = Number(referenceLayout?.footY) || Math.round(canvasSize * petFrameFootYRatio);
    const maxVisibleWidth = canvasSize * (referenceLayout ? 0.94 : petFrameMaxWidthRatio);
    const targetVisibleHeight =
      Number(referenceLayout?.visibleHeight) || Math.round(canvasSize * petFrameMaxHeightRatio);
    let scale = targetVisibleHeight / Math.max(1, bounds.height);
    scale = Math.min(scale, maxVisibleWidth / Math.max(1, bounds.width));

    const drawWidth = Math.max(1, Math.round(sourceCanvas.width * scale));
    const drawHeight = Math.max(1, Math.round(sourceCanvas.height * scale));
    const drawLeft = Math.round(centerX - bounds.centerX * scale);
    const drawTop = Math.round(footY - (bounds.maxY + 1) * scale);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available.");

    canvas.width = canvasSize;
    canvas.height = canvasSize;
    context.clearRect(0, 0, canvasSize, canvasSize);
    context.drawImage(sourceCanvas, drawLeft, drawTop, drawWidth, drawHeight);

    const frameLayout = referenceLayout || {
      version: petFrameLayoutVersion,
      canvasWidth: canvasSize,
      canvasHeight: canvasSize,
      centerX,
      footY,
      visibleWidth: Math.round(bounds.width * scale),
      visibleHeight: Math.round(bounds.height * scale),
    };
    const meta = {
      hasTransparentBackground: bounds.hasTransparentPixel,
      wasCropped:
        bounds.hasTransparentPixel &&
        (bounds.width < sourceCanvas.width || bounds.height < sourceCanvas.height),
      sourceWidth: sourceCanvas.width,
      sourceHeight: sourceCanvas.height,
      cropWidth: bounds.width,
      cropHeight: bounds.height,
      outputWidth: canvasSize,
      outputHeight: canvasSize,
      outputSize: canvasSize,
      frameLayout,
    };

    return { dataUrl: transparentFrameDataUrl(canvas), meta };
  }

  async function preparePetImageDataUrl(dataUrl) {
    return standardizePetFrame(dataUrl);
  }

  async function actionReferenceForPet(pet = activePet()) {
    const sources = visualFrameSourcesForPet(pet);
    const source =
      pet?.imageData ||
      pet?.assets?.frames?.idle ||
      sources.idle ||
      frames[0] ||
      rabbitImage?.dataset.frameSrc ||
      rabbitImage?.getAttribute("src");
    const rawDataUrl = await imageSourceToPngDataUrl(source);
    const standardized = await standardizePetFrame(rawDataUrl, pet?.assets?.layout || null);
    return {
      image: standardized.dataUrl,
      layout: pet?.assets?.layout || standardized.meta.frameLayout,
    };
  }

  async function compressPetImage(file, maxDimension = 640) {
    if (!file || !file.type.startsWith("image/")) {
      throw new Error("Please choose an image file.");
    }

    const rawDataUrl = await readFileAsDataUrl(file);
    const firstResult = await preparePetImageDataUrl(rawDataUrl, maxDimension);
    let result = firstResult;

    if (!firstResult.meta.hasTransparentBackground) {
      try {
        const cleaned = await removeEdgeBackground(rawDataUrl);
        const cleanedResult = await preparePetImageDataUrl(cleaned, maxDimension);
        const sourceArea = Math.max(1, firstResult.meta.sourceWidth * firstResult.meta.sourceHeight);
        const cropArea = Math.max(1, cleanedResult.meta.cropWidth * cleanedResult.meta.cropHeight);
        const cropRatio = cropArea / sourceArea;
        const looksUseful = cleanedResult.meta.hasTransparentBackground && cleanedResult.meta.wasCropped;

        if (looksUseful && cropRatio > 0.015 && cropRatio < 0.92) {
          result = {
            ...cleanedResult,
            meta: {
              ...cleanedResult.meta,
              backgroundAutoRemoved: true,
            },
          };
        }
      } catch (error) {
        console.warn("Local background cleanup failed:", error);
      }
    }

    state.pendingImageMeta = result.meta;
    return result.dataUrl;
  }

  function setPetImagePreview(dataUrl, fileName = "") {
    if (dataUrl) {
      petImagePreview.innerHTML = `<img src="${dataUrl}" alt="形象预览" />`;
      petImageHint.textContent = fileName ? `${fileName} 已放入固定透明 WebP 画布` : "形象已准备好";
      renderImageProcessingStatus();
      return;
    }

    petImagePreview.textContent = "形象";
    petImageHint.textContent = "支持 PNG / WebP / GIF，透明背景效果最好";
    state.pendingImageMeta = null;
    renderImageProcessingStatus();
  }

  function renderImageProcessingStatus() {
    const meta = state.pendingImageMeta;
    const hasImage = Boolean(state.pendingImageData);
    const settings = readSettingsForm();

    if (createFloatingPreviewImage) {
      createFloatingPreviewImage.src = state.pendingImageData || "";
      createFloatingPreviewImage.classList.toggle("visible", hasImage);
    }

    if (createPreviewStatus) {
      createPreviewStatus.textContent = hasImage
        ? `按当前桌宠大小 ${Math.round(settings.petScale)}% 预览，脚底锚点已固定`
        : "上传后会按当前桌宠大小预览";
    }

    if (imageCheckList) {
      if (!hasImage || !meta) {
        imageCheckList.innerHTML = "<span>等待上传形象</span>";
      } else {
        imageCheckList.innerHTML = [
          meta.wasCropped
            ? `<span class="check-item ok">已自动裁切透明边缘</span>`
            : `<span class="check-item ok">已检查边缘并整理画布</span>`,
          `<span class="check-item ok">已统一为 ${meta.outputWidth}×${meta.outputHeight} 透明 WebP 画布</span>`,
          `<span class="check-item ok">已固定角色中心与脚底锚点</span>`,
          meta.hasTransparentBackground
            ? `<span class="check-item ok">检测到透明背景</span>`
            : `<span class="check-item warn">未检测到透明背景，建议一键去背</span>`,
        ].join("");
      }
    }

    if (removeBackgroundImage) {
      removeBackgroundImage.disabled = !hasImage;
      removeBackgroundImage.textContent = meta?.hasTransparentBackground ? "重新去背" : "一键去背";
    }
  }

  function renderMouthFramePreview(frames = state.pendingMouthFrames) {
    mouthFramePreview.innerHTML = "";
    mouthFrameSpecs.forEach((spec, index) => {
      const frame = frames[index];
      const item = document.createElement("div");
      item.className = `mouth-frame-item ${frame ? "ready" : ""}`;
      if (frame) {
        item.innerHTML = `<img src="${frame}" alt="${escapeHtml(spec.label)}动作帧 />${
          spec.key === "idle"
            ? ""
            : `<button class="mouth-frame-retry" type="button" data-mouth-index="${index}" aria-label="重新生成${escapeHtml(spec.label)}">重</button>`
        }<span>${escapeHtml(spec.label)}</span>`;
      } else {
        item.innerHTML = `<span>${escapeHtml(spec.label)}</span>`;
      }
      mouthFramePreview.appendChild(item);
    });
  }

  function renderActionMenu(menuElement) {
    if (!menuElement) return;
    const actions = availablePetActions();
    if (!actions.length) {
      menuElement.innerHTML = `<span class="action-menu-empty">当前桌宠还没有动作</span>`;
      return;
    }

    menuElement.innerHTML = actions
      .map((action) => {
        const typeLabel = customActionTypes[normalizeActionType(action.type)] || "动作";
        return `<button type="button" data-action-id="${escapeHtml(action.id)}">
          ${action.preview ? `<img src="${action.preview}" alt="" />` : ""}
          <span><strong>${escapeHtml(action.name)}</strong><small>${escapeHtml(typeLabel)}</small></span>
        </button>`;
      })
      .join("");
  }

  function renderFeedMenu(menuElement) {
    if (!menuElement) return;
    menuElement.innerHTML = petFoods
      .map(
        (food) => `<button type="button" data-feed-food="${escapeHtml(food.key)}">
          <em aria-hidden="true">${food.icon}</em>
          <span><strong>${escapeHtml(food.name)}</strong><small>饱腹 +${food.fullness}</small></span>
        </button>`
      )
      .join("");
  }

  function updateCareUi() {
    const pet = activePet();
    const care = refreshPetCare(pet);
    const fullness = Math.round(care.fullness);
    fullnessMeter?.style.setProperty("--fullness", `${fullness}%`);
    if (fullnessFill) fullnessFill.style.width = `${fullness}%`;
    if (fullnessText) fullnessText.textContent = `${fullness}%`;
    petDock?.classList.toggle("pet-hungry", fullness < 30);
    renderPetInfo();
  }

  function foodName(foodKey) {
    return petFoods.find((food) => food.key === foodKey)?.name || "";
  }

  function shortPersonaText(text) {
    const value = String(text || "").replace(/\s+/g, " ").trim();
    return value.length > 180 ? `${value.slice(0, 180)}...` : value;
  }

  function renderPetInfo() {
    if (!petInfoPanel) return;
    const pet = activePet();
    const meta = speciesInfo(pet.species);
    const preset = presetInfo(pet.presetKey);
    const care = refreshPetCare(pet);
    const memory = normalizePetMemory(pet.memory);
    const customActionCount = petCustomActions(pet).length;
    const hasFrameActions = mouthFramesForPet(pet) ? 1 : 0;
    const fullness = Math.round(care.fullness);
    if (petInfoName) petInfoName.textContent = pet.name;
    if (petInfoMeta) {
      petInfoMeta.textContent = `${meta.label} / ${preset.name}${petHasCustomVisual(pet) ? " / 自定义形象" : ""}`;
    }
    if (petInfoAvatar) petInfoAvatar.innerHTML = avatarMarkup(pet, "pet-info-avatar-image");
    if (petInfoTitle) petInfoTitle.textContent = `${pet.name} 的设定`;
    if (petInfoPersona) petInfoPersona.textContent = shortPersonaText(pet.persona || preset.persona || "还没有填写设定。");
    if (petInfoFullness) petInfoFullness.textContent = `${fullness}%`;
    if (petInfoFullnessFill) {
      petInfoFullnessFill.style.width = `${fullness}%`;
      petInfoFullnessFill.parentElement?.style.setProperty("--fullness", `${fullness}%`);
    }
    if (petInfoActions) petInfoActions.textContent = `${customActionCount + hasFrameActions} 个`;
    if (petInfoMemory) petInfoMemory.textContent = `${memory.items.length} 条`;
    if (petInfoMemoryState) petInfoMemoryState.textContent = memory.enabled ? "记忆开启" : "记忆关闭";
    if (petInfoFeedCount) petInfoFeedCount.textContent = `${Number(care.feedCount || 0)} 次`;
    if (petInfoFavoriteFood) {
      const favorite = foodName(care.favoriteFood);
      petInfoFavoriteFood.textContent = favorite ? `最近喜欢：${favorite}` : "还没有偏爱的食物";
    }
    if (petInfoPreset) {
      petInfoPreset.textContent = `${preset.name}：${shortPersonaText(pet.persona || preset.persona || "")}`;
    }
  }

  function showPetSettings(show) {
    petInfoPanel?.classList.toggle("hidden", Boolean(show));
    petSettingsPanel?.classList.toggle("hidden", !show);
    setFeedMenusOpen(false);
  }

  function spawnFeedHearts(count = 6) {
    if (!heartLayer) return;
    heartLayer.innerHTML = "";
    for (let index = 0; index < count; index += 1) {
      const heart = document.createElement("span");
      heart.className = "heart-particle";
      heart.textContent = "♥";
      heart.style.setProperty("--heart-drift", `${Math.round((Math.random() - 0.5) * 86)}px`);
      heart.style.setProperty("--heart-size", `${18 + Math.round(Math.random() * 12)}px`);
      heart.style.left = `${42 + Math.round(Math.random() * 20)}%`;
      heart.style.top = `${46 + Math.round(Math.random() * 16)}%`;
      heart.style.animationDelay = `${index * 70}ms`;
      heartLayer.appendChild(heart);
    }
    window.setTimeout(() => {
      if (heartLayer) heartLayer.innerHTML = "";
    }, 1700);
  }

  function playFeedReaction() {
    petDock.classList.remove("just-fed");
    void petDock.offsetWidth;
    petDock.classList.add("just-fed");
    window.setTimeout(() => petDock.classList.remove("just-fed"), 720);
    const happyAction = availablePetActions().find((action) => action.type === "happy");
    const waveAction = availablePetActions().find((action) => action.type === "wave");
    if (happyAction || waveAction) playAvailableAction(happyAction || waveAction);
  }

  function feedActivePet(foodKey) {
    const food = petFoods.find((item) => item.key === foodKey) || petFoods[0];
    const pet = activePet();
    const care = refreshPetCare(pet);
    if (care.fullness >= 100) {
      setBubble(`${pet.name}已经吃饱啦，再吃会撑的。`);
      statusPill.textContent = "已吃饱";
      spawnFeedHearts(3);
      return;
    }
    const before = care.fullness;
    pet.care = {
      ...care,
      fullness: Math.min(100, before + food.fullness),
      lastUpdatedAt: Date.now(),
      lastFedAt: Date.now(),
      favoriteFood: food.key,
      feedCount: Number(care.feedCount || 0) + 1,
    };
    persistPets();
    updateCareUi();
    renderPetList();
    renderPetInfo();
    setFeedMenusOpen(false);
    spawnFeedHearts();
    playFeedReaction();
    setBubble(`${food.line} 饱腹度 ${Math.round(before)}% → ${Math.round(pet.care.fullness)}%。`);
    statusPill.textContent = "开心";
  }

  function setFeedMenusOpen(open, target = "both") {
    if (open) setActionMenusOpen(false);
    if (target === "chat" || target === "both") {
      feedMenu?.classList.toggle("hidden", !open);
      if (open) renderFeedMenu(feedMenu);
    }
    if (target === "library" || target === "both") {
      libraryFeedMenu?.classList.toggle("hidden", !open);
      if (open) renderFeedMenu(libraryFeedMenu);
    }
    if (target === "floating" || target === "both") {
      floatingFeedMenu?.classList.toggle("hidden", !open);
      if (open) renderFeedMenu(floatingFeedMenu);
    }
  }

  function handleFeedMenuClick(event) {
    const button = event.target instanceof Element ? event.target.closest("[data-feed-food]") : null;
    if (!button) return;
    feedActivePet(button.dataset.feedFood || "");
  }

  function setActionMenusOpen(open, target = "both") {
    if (open) setFeedMenusOpen(false);
    if (target === "chat" || target === "both") {
      actionMenu?.classList.toggle("hidden", !open);
      if (open) renderActionMenu(actionMenu);
    }
    if (target === "floating" || target === "both") {
      floatingActionMenu?.classList.toggle("hidden", !open);
      if (open) renderActionMenu(floatingActionMenu);
    }
  }

  function handleActionMenuClick(event) {
    const button = event.target instanceof Element ? event.target.closest("[data-action-id]") : null;
    if (!button) return;
    const id = button.dataset.actionId;
    const action = availablePetActions().find((item) => item.id === id);
    if (!action) return;
    setActionMenusOpen(false);
    playAvailableAction(action);
  }

  function renderPendingActionList() {
    if (!pendingActionList) return;
    if (!state.pendingCustomActions.length) {
      pendingActionList.innerHTML = "";
      return;
    }
    pendingActionList.innerHTML = state.pendingCustomActions
      .map(
        (action) => `<span class="pending-action-chip">
          ${action.preview ? `<img src="${action.preview}" alt="" />` : ""}
          <strong>${escapeHtml(action.name)}</strong>
          <small>${escapeHtml(customActionTypes[action.type] || "自定义")}</small>
        </span>`
      )
      .join("");
  }

  function renderPetActionList() {
    if (!petActionList) return;
    const pet = activePet();
    const customActions = petCustomActions(pet);
    const customIds = new Set(customActions.map((action) => action.id));
    const actions = availablePetActions(pet);
    if (petActionCount) petActionCount.textContent = `${customActions.length} 个自定义动作`;
    if (!actions.length) {
      petActionList.innerHTML = `<span class="pet-action-empty">当前桌宠还没有动作。可以上传 GIF，或用文字生成。</span>`;
      return;
    }

    petActionList.innerHTML = actions
      .map((action) => {
        const typeLabel = customActionTypes[normalizeActionType(action.type)] || "动作";
        const canDelete = customIds.has(action.id);
        return `<div class="pet-action-item">
          ${action.preview ? `<img src="${action.preview}" alt="" />` : `<span class="pet-action-thumb">动</span>`}
          <span class="pet-action-item-copy">
            <strong>${escapeHtml(action.name)}</strong>
            <small>${escapeHtml(typeLabel)}</small>
          </span>
          <button class="secondary-button mini-action" type="button" data-play-current-action="${escapeHtml(action.id)}">播</button>
          ${
            canDelete
              ? `<button class="secondary-button mini-action danger" type="button" data-delete-current-action="${escapeHtml(action.id)}">删</button>`
              : ""
          }
        </div>`;
      })
      .join("");
  }

  function addCustomActionToActivePet(action) {
    const pet = activePet();
    const normalized = normalizePetAction({
      ...action,
      id: `action-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      createdAt: Date.now(),
    });
    if (!normalized) throw new Error("动作没有可用帧。");
    pet.assets = normalizePetAssets(pet.assets);
    pet.assets.actions = petCustomActions(pet)
      .filter((item) => item.id !== normalized.id)
      .concat(normalized)
      .slice(-24);
    persistPets();
    renderPetList();
    renderPetActionList();
    renderActionMenu(actionMenu);
    renderActionMenu(floatingActionMenu);
    applyActivePetToUi();
    return normalized;
  }

  function deleteCustomActionFromActivePet(actionId) {
    const pet = activePet();
    const actions = petCustomActions(pet);
    const action = actions.find((item) => item.id === actionId);
    if (!action) return;
    const shouldDelete = window.confirm(`删除动作「${action.name}」？`);
    if (!shouldDelete) return;
    pet.assets = normalizePetAssets(pet.assets);
    pet.assets.actions = actions.filter((item) => item.id !== actionId);
    persistPets();
    renderPetList();
    renderPetActionList();
    renderActionMenu(actionMenu);
    renderActionMenu(floatingActionMenu);
    setBubble(`动作「${action.name}」已删除。`);
  }

  function stopGifActionPreview() {
    window.clearTimeout(state.gifPreviewTimer);
  }

  function renderGifActionPreview(action = state.pendingGifAction) {
    stopGifActionPreview();
    if (!gifActionPreview) return;
    if (!action?.frames?.length) {
      gifActionPreview.innerHTML = "";
      return;
    }

    gifActionPreview.innerHTML = `<img src="${action.frames[0]}" alt="GIF 动作预览" />`;
    const image = gifActionPreview.querySelector("img");
    let index = 0;
    const tick = () => {
      if (!state.pendingGifAction || state.pendingGifAction.id !== action.id || !image) return;
      image.src = action.frames[index];
      const delay = action.durations[index] || 80;
      index = (index + 1) % action.frames.length;
      state.gifPreviewTimer = window.setTimeout(tick, delay);
    };
    tick();
  }

  function setGifActionStatus(text) {
    if (gifActionStatus) gifActionStatus.textContent = text;
  }

  function setVideoActionStatus(text) {
    if (videoActionStatus) videoActionStatus.textContent = text;
  }

  function setPetActionStatus(text) {
    if (petActionStatus) petActionStatus.textContent = text;
  }

  function setPetGifActionStatus(text) {
    if (petGifActionStatus) petGifActionStatus.textContent = text;
  }

  function stopVideoActionPreview() {
    window.clearTimeout(state.videoActionPreviewTimer);
  }

  function stopPetVideoActionPreview() {
    window.clearTimeout(state.petVideoActionPreviewTimer);
  }

  function renderFrameActionPreview(action, previewElement, timerKey) {
    window.clearTimeout(state[timerKey]);
    if (!previewElement) return;
    if (!action?.frames?.length) {
      previewElement.classList.add("hidden");
      previewElement.innerHTML = "";
      return;
    }
    previewElement.classList.remove("hidden");
    previewElement.innerHTML = `<img src="${action.frames[0]}" alt="动作预览" />`;
    const image = previewElement.querySelector("img");
    let index = 0;
    const tick = () => {
      if (!image || !previewElement || previewElement.classList.contains("hidden")) return;
      image.src = action.frames[index];
      const delay = action.durations[index] || 100;
      index = (index + 1) % action.frames.length;
      state[timerKey] = window.setTimeout(tick, delay);
    };
    tick();
  }

  function renderVideoActionPreview(action) {
    renderFrameActionPreview(action, videoActionPreview, "videoActionPreviewTimer");
  }

  function renderPetVideoActionPreview(action) {
    renderFrameActionPreview(action, petVideoActionPreview, "petVideoActionPreviewTimer");
  }

  async function requestBackendVideoAction({ apiBase, apiKey, model, prompt, image }) {
    const stoppedMessage = stoppedCapabilityMessage("image");
    if (stoppedMessage) {
      const error = new Error(stoppedMessage);
      error.capability = "image";
      error.stopped = true;
      throw error;
    }
    if (!isTauriRuntime()) {
      throw new Error("视频动作生成需要在 Tauri App 里运行。");
    }
    try {
      const providerId = await ensureModelProvider("media", {
        apiBase,
        apiKey,
        imageModel: model,
        videoModel: model,
      });
      const data = await invokeTauri("model_video_generation", {
        payload: {
          providerId,
          prompt,
          image,
          duration: 3,
        },
      });
      if (!data?.video && !Array.isArray(data?.frames)) throw new Error("视频接口没有返回视频或动作帧。");
      return data;
    } catch (error) {
      throw normalizeModelCommandError(error, "视频动作生成失败。");
    }
  }

  function waitForVideoEvent(video, eventName) {
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        video.removeEventListener(eventName, handleEvent);
        video.removeEventListener("error", handleError);
      };
      const handleEvent = () => {
        cleanup();
        resolve();
      };
      const handleError = () => {
        cleanup();
        reject(new Error("视频解码失败。"));
      };
      video.addEventListener(eventName, handleEvent, { once: true });
      video.addEventListener("error", handleError, { once: true });
    });
  }

  async function seekVideo(video, time) {
    const target = Math.min(Math.max(time, 0), Math.max(0, Number(video.duration || 0) - 0.02));
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        video.removeEventListener("seeked", handleSeeked);
        video.removeEventListener("error", handleError);
      };
      const handleSeeked = () => {
        cleanup();
        resolve();
      };
      const handleError = () => {
        cleanup();
        reject(new Error("视频跳帧失败。"));
      };
      video.addEventListener("seeked", handleSeeked, { once: true });
      video.addEventListener("error", handleError, { once: true });
      video.currentTime = target;
    });
  }

  async function videoToActionFrames(videoDataUrl, referenceLayout = state.pendingImageMeta?.frameLayout || null) {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = videoDataUrl;
    await waitForVideoEvent(video, "loadedmetadata");

    const duration = Math.min(6, Math.max(0.6, Number(video.duration || 3)));
    const frameCount = Math.min(48, Math.max(8, Math.round(duration * 8)));
    const frameDuration = Math.max(60, Math.round((duration * 1000) / frameCount));
    const canvas = document.createElement("canvas");
    const width = video.videoWidth || petFrameCanvasSize;
    const height = video.videoHeight || petFrameCanvasSize;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("无法创建视频抽帧画布。");

    const frames = [];
    let layout = referenceLayout;
    for (let index = 0; index < frameCount; index += 1) {
      const time = frameCount === 1 ? 0 : (duration * index) / frameCount;
      await seekVideo(video, time);
      context.clearRect(0, 0, width, height);
      context.drawImage(video, 0, 0, width, height);
      const rawFrame = canvas.toDataURL("image/png");
      const cleaned = await removeEdgeBackground(rawFrame).catch(() => rawFrame);
      const standardized = await standardizePetFrame(cleaned, layout);
      layout = layout || standardized.meta.frameLayout;
      frames.push(standardized.dataUrl);
    }
    return {
      frames,
      durations: frames.map(() => frameDuration),
      totalDurationMs: frameDuration * frames.length,
      preview: frames[0],
    };
  }

  async function backendFramesToActionFrames(media, referenceLayout = null) {
    const sourceFrames = Array.isArray(media?.frames) ? media.frames : [];
    if (!sourceFrames.length) throw new Error("后端返回的帧数组为空。");
    const sourceDurations = Array.isArray(media?.durations) ? media.durations : [];
    const first = await standardizePetFrame(sourceFrames[0], referenceLayout);
    const layout = referenceLayout || first.meta.frameLayout;
    const frames = [first.dataUrl];
    for (const frame of sourceFrames.slice(1, 48)) {
      const standardized = await standardizePetFrame(frame, layout);
      frames.push(standardized.dataUrl);
    }
    const durations = frames.map((_, index) => clampNumber(sourceDurations[index], 20, 1000, 80));
    return {
      frames,
      durations,
      totalDurationMs: durations.reduce((sum, value) => sum + value, 0),
      preview: frames[0],
    };
  }

  async function mediaResultToActionFrames(media, referenceLayout = null) {
    if (Array.isArray(media?.frames) && media.frames.length) {
      return backendFramesToActionFrames(media, referenceLayout);
    }

    const source = String(media?.video || "");
    if (!source) throw new Error("视频接口没有返回可用媒体。");
    if (source.startsWith("data:image/gif")) {
      const action = await processGifActionDataUrl(source, referenceLayout);
      return {
        frames: action.frames,
        durations: action.durations,
        totalDurationMs: action.totalDurationMs,
        preview: action.preview,
      };
    }

    return videoToActionFrames(source, referenceLayout);
  }

  function buildVideoActionPrompt(description) {
    return [
      "Strictly use the uploaded desktop pet image as the only character reference.",
      "Keep the same character, same style, same body proportion, same outfit, same accessories, and same cute chibi anime look.",
      "Generate a short, clean, loopable desktop pet action video.",
      "The character should stay centered with stable scale and stable foot anchor. Do not add extra characters, text, watermark, or scene changes.",
      "Prefer transparent, white, or simple plain background so it can be converted into a desktop pet action.",
      `Action requested by user: ${description}`,
    ].join("\n");
  }

  async function generateVideoActionFromPrompt(target = "create") {
    try {
      ensurePermission("imageGeneration");
    } catch (error) {
      const setStatus = target === "pet" ? setPetActionStatus : setVideoActionStatus;
      setStatus(error.message);
      return;
    }
    const isPetTarget = target === "pet";
    const promptInput = isPetTarget ? petVideoActionPrompt : videoActionPrompt;
    const nameInput = isPetTarget ? petVideoActionName : videoActionName;
    const typeInput = isPetTarget ? petVideoActionType : videoActionType;
    const button = isPetTarget ? generatePetVideoAction : generateVideoAction;
    const setStatus = isPetTarget ? setPetActionStatus : setVideoActionStatus;
    const renderPreview = isPetTarget ? renderPetVideoActionPreview : renderVideoActionPreview;
    const stopPreview = isPetTarget ? stopPetVideoActionPreview : stopVideoActionPreview;
    const description = String(promptInput?.value || "").trim();
    if (!description) {
      setStatus("请先写动作描述。");
      return;
    }
    let reference = null;
    try {
      reference = isPetTarget
        ? await actionReferenceForPet(activePet())
        : {
            image: state.pendingImageData,
            layout: state.pendingImageMeta?.frameLayout || null,
          };
    } catch (error) {
      console.warn("Action reference image failed:", error);
      setStatus(error.message || "当前桌宠形象无法作为动作参考。");
      return;
    }
    if (!reference.image) {
      setStatus(isPetTarget ? "当前桌宠没有可用形象，先上传或创建形象。" : "请先上传静态 PNG / WebP / JPG 形象，再生成视频动作。");
      return;
    }
    const settings = readSettingsForm();
    const config = {
      apiBase: bundledProxyApiBase,
      model: bundledProxyVideoModel,
      useBundledKey: true,
    };
    const apiKey = imageApiKeyForConfig(config, settings);
    const previousText = button?.textContent || "生成动作";
    if (button) {
      button.disabled = true;
      button.textContent = "生成中";
    }
    stopPreview();
    renderPreview(null);
    setStatus("正在调用 grok-imagine-video 生成短视频...");
    try {
      const media = await requestBackendVideoAction({
        apiBase: config.apiBase,
        apiKey,
        model: config.model,
        prompt: buildVideoActionPrompt(description),
        image: reference.image,
      });
      setStatus("视频或动作帧已返回，正在本地统一画布...");
      const framePack = await mediaResultToActionFrames(media, reference.layout);
      const type = normalizeActionType(typeInput?.value || "happy");
      const name =
        String(nameInput?.value || "").trim() ||
        description.slice(0, 14) ||
        customActionTypes[type] ||
        "视频动作";
      const action = normalizePetAction({
        id: `action-${Date.now()}`,
        name,
        type,
        frames: framePack.frames,
        durations: framePack.durations,
        preview: framePack.preview,
        totalDurationMs: framePack.totalDurationMs,
        hasTransparentBackground: true,
        backgroundRemoved: true,
        backgroundRemoval: "video-frame-edge",
        createdAt: Date.now(),
      });
      if (!action) throw new Error("视频没有抽取到可用动作帧。");
      if (isPetTarget) {
        const saved = addCustomActionToActivePet(action);
        renderPetVideoActionPreview(saved);
        setStatus(`已保存动作「${saved.name}」：${saved.frames.length} 帧，只属于当前桌宠。`);
        setBubble(`视频动作「${saved.name}」已保存到当前桌宠。`);
      } else {
        state.pendingCustomActions.push(action);
        renderPendingActionList();
        renderVideoActionPreview(action);
        setStatus(`已生成动作「${action.name}」：${action.frames.length} 帧，会随新桌宠一起保存。`);
        setBubble(`视频动作「${action.name}」已加入待创建桌宠。`);
      }
    } catch (error) {
      console.warn("Video action generation failed:", error);
      setStatus(error.message || "视频动作生成失败。");
      setBubble("视频动作没有完成抽帧，查看状态里的具体下载或网络错误。");
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = previousText;
      }
    }
  }

  async function standardizeGifActionResponse(response, referenceLayout = state.pendingImageMeta?.frameLayout || null) {
    const sourceFrames = Array.isArray(response?.frames) ? response.frames : [];
    if (!sourceFrames.length) throw new Error("GIF 没有可用帧。");
    const first = await standardizePetFrame(sourceFrames[0].image, referenceLayout);
    const layout = referenceLayout || first.meta.frameLayout;
    const frames = [];
    for (const frame of sourceFrames) {
      const standardized = await standardizePetFrame(frame.image, layout);
      frames.push(standardized.dataUrl);
    }

    return {
      id: `pending-action-${Date.now()}`,
      name: "",
      type: "happy",
      frames,
      durations: sourceFrames.map((frame) => clampNumber(frame.durationMs, 20, 1000, 80)),
      preview: frames[0],
      totalDurationMs: clampNumber(response.totalDurationMs, 80, 6000, 1200),
      hasTransparentBackground: Boolean(response.hasTransparency || response.backgroundRemoved),
      backgroundRemoved: Boolean(response.backgroundRemoved),
      backgroundRemoval: String(response.backgroundRemoval || ""),
      truncated: Boolean(response.truncated),
    };
  }

  async function processGifActionFile(file, referenceLayout = state.pendingImageMeta?.frameLayout || null) {
    const rawDataUrl = await readFileAsDataUrl(file);
    return processGifActionDataUrl(rawDataUrl, referenceLayout);
  }

  async function processGifActionDataUrl(rawDataUrl, referenceLayout = state.pendingImageMeta?.frameLayout || null) {
    if (!isTauriRuntime()) {
      return {
        id: `pending-action-${Date.now()}`,
        name: "",
        type: "happy",
        frames: [rawDataUrl],
        durations: [1200],
        preview: rawDataUrl,
        totalDurationMs: 1200,
        hasTransparentBackground: false,
        backgroundRemoved: false,
        backgroundRemoval: "browser-fallback",
        truncated: false,
      };
    }

    const response = await invokeTauri("process_gif_action", {
      payload: {
        image: rawDataUrl,
        maxFrames: 48,
        maxDurationMs: 6000,
      },
    });
    return standardizeGifActionResponse(response, referenceLayout);
  }

  function savePendingGifAction() {
    const pending = state.pendingGifAction;
    if (!pending) return;
    const type = normalizeActionType(gifActionType?.value || pending.type);
    const name = String(gifActionName?.value || "").trim() || customActionTypes[type] || "自定义动作";
    const action = normalizePetAction({
      ...pending,
      id: `action-${Date.now()}`,
      name,
      type,
      createdAt: Date.now(),
    });
    if (!action) return;
    state.pendingCustomActions.push(action);
    state.pendingGifAction = null;
    if (saveGifAction) saveGifAction.disabled = true;
    if (gifActionName) gifActionName.value = "";
    renderGifActionPreview(null);
    renderPendingActionList();
    setGifActionStatus(`已保存动作：${action.name}`);
    setBubble(`动作「${action.name}」已加入待创建桌宠。`);
  }

  async function saveGifActionToActivePet(file) {
    if (!file) return;
    if (file.type !== "image/gif" && !/\.gif$/i.test(file.name)) {
      setPetGifActionStatus("这里只支持 GIF 动作。静态图请到创建页上传。");
      return;
    }

    const nameInputValue = String(petGifActionName?.value || "").trim();
    const type = normalizeActionType(petGifActionType?.value || "happy");
    setPetGifActionStatus("正在本地拆帧 GIF...");
    setPetActionStatus("正在把 GIF 统一到当前桌宠画布。");
    try {
      const reference = await actionReferenceForPet(activePet());
      const pending = await processGifActionFile(file, reference.layout);
      const name = nameInputValue || file.name.replace(/\.[^.]+$/, "").slice(0, 32) || customActionTypes[type] || "GIF 动作";
      const saved = addCustomActionToActivePet({
        ...pending,
        name,
        type,
      });
      renderPetVideoActionPreview(saved);
      if (petGifActionName) petGifActionName.value = "";
      if (petGifActionInput) petGifActionInput.value = "";
      const removalText =
        saved.backgroundRemoval === "solid-edge"
          ? "已本地去除纯色背景"
          : saved.backgroundRemoval === "complex-background"
            ? "背景较复杂，已作为带背景动作保存"
            : saved.backgroundRemoval === "browser-fallback"
              ? "浏览器模式未拆帧，已作为 GIF 表情包动作"
              : "已检测到透明背景";
      setPetGifActionStatus(
        `${removalText}。${saved.frames.length} 帧，${Math.round(saved.totalDurationMs)}ms。`
      );
      setPetActionStatus(`动作「${saved.name}」已保存到当前桌宠。`);
      setBubble(`GIF 动作「${saved.name}」已保存到当前桌宠。`);
    } catch (error) {
      console.warn("Current pet GIF action failed:", error);
      setPetGifActionStatus(error.message || "GIF 动作处理失败，请换一个更短或背景更简单的 GIF。");
      setPetActionStatus("GIF 动作处理失败。");
      if (petGifActionInput) petGifActionInput.value = "";
    }
  }

  function setMouthFrameStatus(text) {
    mouthFrameStatus.textContent = text;
  }

  function normalizeImageApiBase(value) {
    return String(value || "").trim().replace(/\/+$/, "");
  }

  function selectedImageModelConfig() {
    const selectedKey = imageModelInput?.value || "bundled-proxy-gpt-image-2";
    return imageModelOptions[selectedKey] || imageModelOptions["bundled-proxy-gpt-image-2"];
  }

  function imageApiKeyForConfig(config, settings = readSettingsForm()) {
    return config?.useBundledKey ? "" : settings.apiKey;
  }

  function imageModelCanGenerate(config, settings = readSettingsForm()) {
    return hasPermission("imageGeneration", settings) && Boolean(config?.useBundledKey || settings.apiKey);
  }

  function isSiliconFlowApiBase(apiBase) {
    return /siliconflow\.(cn|com)/i.test(String(apiBase || ""));
  }

  function dataUrlToBlob(dataUrl) {
    const [header = "", payload = ""] = String(dataUrl).split(",");
    const mime = header.match(/data:(.*");base64/)?.[1] || "image/png";
    const binary = window.atob(payload);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Image result could not be read."));
      reader.readAsDataURL(blob);
    });
  }

  async function normalizeImageForEdit(dataUrl, size = 1024) {
    const image = await loadImage(dataUrl);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available.");

    canvas.width = size;
    canvas.height = size;
    context.clearRect(0, 0, size, size);

    const scale = Math.min((size * 0.84) / image.naturalWidth, (size * 0.84) / image.naturalHeight);
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const left = Math.round((size - width) / 2);
    const top = Math.round((size - height) / 2);
    context.drawImage(image, left, top, width, height);
    return canvas.toDataURL("image/png");
  }

  async function compressGeneratedAsset(dataUrl, maxDimension = 560) {
    const image = await loadImage(dataUrl);
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return dataUrl;

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  }

  async function applyReferenceAlphaMask(dataUrl, referenceDataUrl) {
    const [image, maskImage] = await Promise.all([loadImage(dataUrl), loadImage(referenceDataUrl)]);
    const canvas = document.createElement("canvas");
    const maskCanvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true });
    if (!context || !maskContext) return dataUrl;

    const width = maskImage.naturalWidth || image.naturalWidth || 1024;
    const height = maskImage.naturalHeight || image.naturalHeight || 1024;
    canvas.width = width;
    canvas.height = height;
    maskCanvas.width = width;
    maskCanvas.height = height;

    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    maskContext.clearRect(0, 0, width, height);
    maskContext.drawImage(maskImage, 0, 0, width, height);

    const output = context.getImageData(0, 0, width, height);
    const mask = maskContext.getImageData(0, 0, width, height);

    for (let i = 0; i < output.data.length; i += 4) {
      const maskAlpha = mask.data[i + 3];
      if (maskAlpha < 8) {
        output.data[i + 3] = 0;
      } else {
        output.data[i + 3] = Math.min(output.data[i + 3], maskAlpha);
      }
    }

    context.putImageData(output, 0, 0);
    return canvas.toDataURL("image/png");
  }

  async function alignFrameToReferenceCanvas(dataUrl, normalizedReferenceDataUrl, outputReferenceDataUrl) {
    const [image, normalizedReference, outputReference] = await Promise.all([
      loadImage(dataUrl),
      loadImage(normalizedReferenceDataUrl),
      loadImage(outputReferenceDataUrl),
    ]);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return dataUrl;

    const outputWidth = outputReference.naturalWidth || image.naturalWidth || 560;
    const outputHeight = outputReference.naturalHeight || image.naturalHeight || 560;
    const referenceWidth = normalizedReference.naturalWidth || image.naturalWidth || 1024;
    const referenceHeight = normalizedReference.naturalHeight || image.naturalHeight || 1024;
    const normalizedScale = Math.min((referenceWidth * 0.84) / outputWidth, (referenceHeight * 0.84) / outputHeight);
    const sourceWidth = Math.max(1, Math.round(outputWidth * normalizedScale));
    const sourceHeight = Math.max(1, Math.round(outputHeight * normalizedScale));
    const sourceX = Math.round((referenceWidth - sourceWidth) / 2);
    const sourceY = Math.round((referenceHeight - sourceHeight) / 2);
    const normalizedCanvas = document.createElement("canvas");
    const normalizedContext = normalizedCanvas.getContext("2d");
    if (!normalizedContext) return dataUrl;

    normalizedCanvas.width = referenceWidth;
    normalizedCanvas.height = referenceHeight;
    normalizedContext.clearRect(0, 0, referenceWidth, referenceHeight);
    normalizedContext.drawImage(image, 0, 0, referenceWidth, referenceHeight);

    canvas.width = outputWidth;
    canvas.height = outputHeight;
    context.clearRect(0, 0, outputWidth, outputHeight);
    context.drawImage(
      normalizedCanvas,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      outputWidth,
      outputHeight,
    );
    context.globalCompositeOperation = "destination-in";
    context.drawImage(outputReference, 0, 0, outputWidth, outputHeight);
    context.globalCompositeOperation = "source-over";
    return canvas.toDataURL("image/png");
  }

  async function removeEdgeBackground(dataUrl) {
    const image = await loadImage(dataUrl);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return dataUrl;

    const width = image.naturalWidth || 1024;
    const height = image.naturalHeight || 1024;
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;
    const sampleAt = (x, y) => {
      const index = (Math.max(0, Math.min(height - 1, y)) * width + Math.max(0, Math.min(width - 1, x))) * 4;
      return [data[index], data[index + 1], data[index + 2], data[index + 3]];
    };
    const samples = [
      sampleAt(0, 0),
      sampleAt(width - 1, 0),
      sampleAt(0, height - 1),
      sampleAt(width - 1, height - 1),
      sampleAt(Math.floor(width / 2), 0),
      sampleAt(Math.floor(width / 2), height - 1),
      sampleAt(0, Math.floor(height / 2)),
      sampleAt(width - 1, Math.floor(height / 2)),
    ];
    const near = (value, target) => Math.abs(value - target);
    const isBackgroundPixel = (pixelIndex) => {
      const alpha = data[pixelIndex + 3];
      if (alpha < 24) return true;
      const red = data[pixelIndex];
      const green = data[pixelIndex + 1];
      const blue = data[pixelIndex + 2];
      if (red > 245 && green > 245 && blue > 245) return true;
      return samples.some(([sampleRed, sampleGreen, sampleBlue, sampleAlpha]) => {
        if (sampleAlpha < 24) return alpha < 80;
        return near(red, sampleRed) + near(green, sampleGreen) + near(blue, sampleBlue) < 74;
      });
    };

    const visited = new Uint8Array(width * height);
    const stack = [];
    for (let x = 0; x < width; x += 1) {
      stack.push(x, (height - 1) * width + x);
    }
    for (let y = 0; y < height; y += 1) {
      stack.push(y * width, y * width + width - 1);
    }

    while (stack.length) {
      const pixel = stack.pop();
      if (visited[pixel]) continue;
      visited[pixel] = 1;
      const pixelIndex = pixel * 4;
      if (!isBackgroundPixel(pixelIndex)) continue;

      data[pixelIndex + 3] = 0;
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      if (x > 0) stack.push(pixel - 1);
      if (x < width - 1) stack.push(pixel + 1);
      if (y > 0) stack.push(pixel - width);
      if (y < height - 1) stack.push(pixel + width);
    }

    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL("image/png");
  }

  async function finalizeGeneratedMouthFrame(dataUrl, outputLayout) {
    const cleaned = await removeEdgeBackground(dataUrl).catch(() => dataUrl);
    const standardized = await standardizePetFrame(cleaned, outputLayout);
    return standardized.dataUrl;
  }

  function buildMouthFramePrompt(spec) {
    const stateText = {
      idle: "保持参考图原本的自然待机状态",
      oh: "嘴巴微张，呈小小的“哦”型圆口，只改变嘴巴状态，其他部分保持和参考图一致",
      open:
        "嘴巴张开，普通说话口型，不要惊讶，不要喊叫，不要笑眼，不要闭眼，不要抬手，只改变嘴巴状态，眼睛、双手、身体姿势、服装、配饰、头发和其他部分必须保持和参考图一致",
      wave:
        "抬起一只手或前爪轻轻挥手打招呼，嘴巴闭合或自然微笑，保持眼睛睁开，另一只手、身体、双腿、服装、配饰和头发尽量与参考图一致",
    }[spec.key] || spec.detail;

    return [
      "请严格以这张图片作为唯一角色参考，保持同一角色，同一画风，同一身体比例，同一形态，同一眼睛，生成桌面宠物应用需要的角色状态图。",
      "统一要求：全身，居中，透明背景 PNG，不要棋盘格背景，不要文字，不要水印，不要额外角色，不要改变服装和配饰，不要改变角色比例，保持干净线稿和柔和上色，保持和参考图一致的可爱 Q 版动漫风。",
      `请生成状态：${stateText}。`,
      "重要：这是同一角色的完整动作帧，不是重新设计角色。角色大小、身体中心、脚底位置必须与参考图一致；不要裁切头顶、耳朵、手脚或动作伸出的部分。",
    ].join("\n");
  }

  async function imageEditResultToDataUrl(data) {
    const candidates = [data?.data?.[0], data?.images?.[0], data?.output?.[0], data?.result?.[0]].filter(Boolean);
    const item = candidates[0] || {};
    const b64 = item.b64_json || item.base64 || item.image_base64;
    const url = item.url || item.image_url?.url || item.image_url;

    if (b64) {
      return `data:image/png;base64,${b64}`;
    }

    if (url) {
      throw new Error("远程图片 URL 必须由 Rust 下载器处理，浏览器层拒绝直连。");
    }

    throw new Error("Image API returned no image.");
  }

  async function requestSiliconFlowImageEdit({ apiBase, apiKey, model, prompt, image }) {
    return requestBackendImageEdit({ apiBase, apiKey, model, prompt, image });
  }

  async function requestBackendImageEdit({ apiBase, apiKey, model, prompt, image }) {
    const stoppedMessage = stoppedCapabilityMessage("image");
    if (stoppedMessage) {
      const error = new Error(stoppedMessage);
      error.capability = "image";
      error.stopped = true;
      throw error;
    }

    if (isTauriRuntime()) {
      try {
        const providerId = await ensureModelProvider("media", {
          apiBase,
          apiKey,
          imageModel: model,
          videoModel: bundledProxyVideoModel,
        });
        const data = await invokeTauri("model_image_edit", {
          payload: {
            providerId,
            prompt,
            image,
          },
        });
        if (!data?.image) throw new Error("图像接口没有返回图片。");
        return data.image;
      } catch (error) {
        throw normalizeModelCommandError(error, "图像模型调用失败。");
      }
    }

    throw new Error("图像功能仅允许通过 Lumpa 桌面端的受限 Rust 命令调用。");
  }

  function renderPetSickPreview() {
    if (!petSickPreview) return;
    const source = activePet()?.assets?.sick || "";
    petSickPreview.innerHTML = source
      ? `<img src="${source}" alt="生病状态立绘" />`
      : "<span>尚未生成</span>";
  }

  function buildSickPetPrompt() {
    return [
      "请严格以这张图片作为唯一角色参考，保持同一角色、同一画风、同一身体比例、同一形态、同一眼睛、同一服装和配饰。",
      "生成桌面宠物应用需要的生病状态完整立绘：角色表情难受、没有精神，嘴里轻轻叼着一支可爱的卡通温度计。温度计必须清晰但尺寸适中，不遮挡脸部，不要出现真实医疗场景。",
      "统一要求：全身、居中、透明背景 PNG，不要棋盘格背景，不要文字，不要水印，不要额外角色，不要改变角色比例，保持干净线稿和柔和上色，保持与参考图一致的可爱 Q 版动漫风。",
      "角色大小、身体中心和脚底位置必须与参考图一致；不要裁切头顶、耳朵、手脚或配饰。只改变表情并增加嘴里叼着的卡通温度计。",
    ].join("\n");
  }

  async function generateSickImageForActivePet() {
    try {
      ensurePermission("imageGeneration");
    } catch (error) {
      if (petSickStatus) petSickStatus.textContent = error.message;
      return;
    }
    const pet = activePet();
    if (!pet) return;
    const settings = readSettingsForm();
    const imageConfig = selectedImageModelConfig();
    const apiKey = imageApiKeyForConfig(imageConfig, settings);
    const previousText = generatePetSickImage?.textContent || "生成生病立绘";

    if (generatePetSickImage) {
      generatePetSickImage.disabled = true;
      generatePetSickImage.textContent = pet.assets?.sick ? "重新生成中" : "生成中";
    }
    if (petSickStatus) petSickStatus.textContent = "正在按当前宠物形象生成生病状态...";
    statusPill.textContent = "生成立绘";

    try {
      const reference = await actionReferenceForPet(pet);
      const generated = await requestBackendImageEdit({
        apiBase: imageConfig.apiBase,
        apiKey,
        model: imageConfig.model,
        prompt: buildSickPetPrompt(),
        image: await normalizeImageForEdit(reference.image),
      });
      const standardized = await finalizeGeneratedMouthFrame(generated, reference.layout);
      pet.assets = {
        ...normalizePetAssets(pet.assets),
        sick: standardized,
      };
      persistPets();
      renderPetSickPreview();
      if (state.usageSupervisionSick) setRabbitFrameSource(standardized);
      if (petSickStatus) petSickStatus.textContent = "生病立绘已保存到当前宠物，可以继续重新生成。";
      setBubble("生病状态立绘准备好了。");
      statusPill.textContent = "立绘完成";
    } catch (error) {
      console.warn("Sick pet image generation failed:", error);
      if (petSickStatus) petSickStatus.textContent = error.message || "生病立绘生成失败，请检查图像模型。";
      statusPill.textContent = "生成失败";
    } finally {
      if (generatePetSickImage) {
        generatePetSickImage.disabled = false;
        generatePetSickImage.textContent = activePet()?.assets?.sick ? "重新生成生病立绘" : previousText;
      }
    }
  }

  async function requestMouthFrameImage({
    apiBase,
    apiKey,
    model,
    referenceDataUrl,
    referenceBlob,
    outputReferenceDataUrl,
    outputLayout,
    spec,
  }) {
    const prompt = buildMouthFramePrompt(spec);
    const dataUrl = await requestBackendImageEdit({
      apiBase,
      apiKey,
      model: model || siliconFlowImageEditModel,
      prompt,
      image: referenceDataUrl,
    });
    return finalizeGeneratedMouthFrame(dataUrl, outputLayout);
  }

  async function requestBackgroundRemovalImage({ apiBase, apiKey, model, referenceDataUrl, referenceBlob }) {
    const prompt = [
      "Remove the background from this desktop pet character image.",
      "Keep the exact same character, full body, pose, outfit, colors, line art, shadows on the character, and proportions.",
      "Make everything outside the character fully transparent.",
      "Do not crop the character. Do not add text, props, watermark, or a new background.",
      "Output a clean transparent PNG suitable for a desktop pet.",
    ].join(" ");

    return requestBackendImageEdit({
      apiBase,
      apiKey,
      model: model || siliconFlowImageEditModel,
      prompt,
      image: referenceDataUrl,
    });
  }

  async function runBackgroundRemoval() {
    try {
      ensurePermission("imageGeneration");
    } catch (error) {
      setMouthFrameStatus(error.message);
      return;
    }
    const settings = readSettingsForm();
    const imageConfig = selectedImageModelConfig();
    const apiKey = imageApiKeyForConfig(imageConfig, settings);
    const apiBase = imageConfig.apiBase;
    const model = imageConfig.model;

    if (!state.pendingImageData) {
      setMouthFrameStatus("先上传一张桌宠形象。");
      return;
    }

    const previousText = removeBackgroundImage.textContent;
    removeBackgroundImage.disabled = true;
    removeBackgroundImage.textContent = "去背中";
    setMouthFrameStatus("正在调用图像 API 去背...");

    try {
      const referenceDataUrl = await normalizeImageForEdit(state.pendingImageData);
      const removed = await requestBackgroundRemovalImage({
        apiBase,
        apiKey,
        model,
        referenceDataUrl,
        referenceBlob: dataUrlToBlob(referenceDataUrl),
      });
      const cleaned = await removeEdgeBackground(removed);
      const prepared = await preparePetImageDataUrl(cleaned);
      state.pendingImageData = prepared.dataUrl;
      state.pendingImageMeta = { ...prepared.meta, hasTransparentBackground: true, wasCropped: true };
      state.pendingMouthFrames = [];
      setPetImagePreview(state.pendingImageData, "去背结果");
      renderMouthFramePreview();
      setMouthFrameStatus("去背完成。现在可以生成固定画布动作帧。");
      setBubble("形象去背完成，已经重新居中预览。");
    } catch (error) {
      if (error.quotaStopped || error.status === 429) {
        markModelStop("image", error.message || quotaStopMessage("image"));
        setBubble("图像生成已经停止，聊天和语音不受影响。");
        return;
      }
      console.warn("Background removal failed:", error);
      setMouthFrameStatus(error.message || "去背失败，请检查图像 API 配置。");
      setBubble("去背失败了。后端没有图像 Key 时，请在设置里填可用的图像 API Key。");
    } finally {
      removeBackgroundImage.disabled = !state.pendingImageData;
      removeBackgroundImage.textContent = previousText;
      renderImageProcessingStatus();
    }
  }

  async function generateMouthFramePack() {
    ensurePermission("imageGeneration");
    const settings = readSettingsForm();
    const imageConfig = selectedImageModelConfig();
    const apiKey = imageApiKeyForConfig(imageConfig, settings);
    const apiBase = imageConfig.apiBase;
    const model = imageConfig.model;

    if (!state.pendingImageData) {
      throw new Error("先上传一张桌宠形象。");
    }
    if (stoppedCapabilityMessage("image")) throw new Error(stoppedCapabilityMessage("image"));
    setMouthFrameStatus("正在整理画布和透明边缘...");
    const cleaned = await removeEdgeBackground(state.pendingImageData).catch(() => state.pendingImageData);
    const prepared = await preparePetImageDataUrl(cleaned);
    state.pendingImageData = prepared.dataUrl;
    state.pendingImageMeta = {
      ...prepared.meta,
      hasTransparentBackground: prepared.meta.hasTransparentBackground || state.pendingImageMeta?.hasTransparentBackground,
      wasCropped: true,
    };
    setPetImagePreview(state.pendingImageData, "动作帧基准图");

    const referenceDataUrl = await normalizeImageForEdit(state.pendingImageData);
    const referenceBlob = dataUrlToBlob(referenceDataUrl);
    const generated = [];

    for (const spec of mouthFrameSpecs) {
      setMouthFrameStatus(spec.key === "idle" ? `正在整理固定画布：${spec.label}...` : `正在 AI 生成完整动作帧：${spec.label}...`);
      const frame =
        spec.key === "idle"
          ? state.pendingImageData
          : await requestMouthFrameImage({
              apiBase,
              apiKey,
              model,
              referenceDataUrl,
              referenceBlob,
              outputReferenceDataUrl: state.pendingImageData,
              outputLayout: state.pendingImageMeta?.frameLayout,
              spec,
            });
      generated.push(frame);
      renderMouthFramePreview(generated);
    }

    return generated;
  }

  function generatedMouthFrameCount() {
    return Math.max(0, mouthFrameSpecs.filter((spec) => spec.key !== "idle").length);
  }

  async function regenerateMouthFrame(index) {
    try {
      ensurePermission("imageGeneration");
    } catch (error) {
      setMouthFrameStatus(error.message);
      return;
    }
    const spec = mouthFrameSpecs[index];
    if (!spec || spec.key === "idle") return;

    const settings = readSettingsForm();
    const imageConfig = selectedImageModelConfig();
    const apiKey = imageApiKeyForConfig(imageConfig, settings);
    const apiBase = imageConfig.apiBase;
    const model = imageConfig.model;

    if (!state.pendingImageData) {
      throw new Error("先上传一张桌宠形象。");
    }
    if (stoppedCapabilityMessage("image")) throw new Error(stoppedCapabilityMessage("image"));
    const retryButtons = Array.from(mouthFramePreview.querySelectorAll(".mouth-frame-retry"));
    retryButtons.forEach((button) => {
      button.disabled = true;
    });
    setMouthFrameStatus(`正在重新生成 ${spec.label}...`);

    try {
      const referenceDataUrl = await normalizeImageForEdit(state.pendingImageData);
      const frame = await requestMouthFrameImage({
        apiBase,
        apiKey,
        model,
        referenceDataUrl,
        referenceBlob: dataUrlToBlob(referenceDataUrl),
        outputReferenceDataUrl: state.pendingImageData,
        outputLayout: state.pendingImageMeta?.frameLayout,
        spec,
      });
      state.pendingMouthFrames[index] = frame;
      renderMouthFramePreview();
      setMouthFrameStatus(`${spec.label} 已重新生成。觉得不满意可以继续点右上角重生。`);
      setBubble(`${spec.label} 换了一张新的。`);
    } catch (error) {
      console.warn("Mouth frame regeneration failed:", error);
      setMouthFrameStatus(error.message || "重新生成失败，请检查图像 API 配置。");
    } finally {
      mouthFramePreview.querySelectorAll(".mouth-frame-retry").forEach((button) => {
        button.disabled = false;
      });
    }
  }

  async function runMouthFrameGeneration() {
    const previousText = generateMouthFrames.textContent;
    generateMouthFrames.disabled = true;
    generateMouthFrames.textContent = "生成中";
    statusPill.textContent = "生成动作";

    try {
      state.pendingMouthFrames = await generateMouthFramePack();
      renderMouthFramePreview();
      setMouthFrameStatus(`${generatedMouthFrameCount()} 张 AI 动作帧已生成，并已统一为固定透明 WebP 画布。`);
      setBubble("动作帧生成好了，切换时不会再改变位置。");
      statusPill.textContent = "动作完成";
    } catch (error) {
      if (error.quotaStopped || error.status === 429) {
        markModelStop("image", error.message || quotaStopMessage("image"));
        setBubble("图像生成已经停止，聊天和语音不受影响。");
        statusPill.textContent = "图像已停止";
        return;
      }
      console.warn("Mouth frame generation failed:", error);
      setMouthFrameStatus(error.message || "生成失败。后端没有图像 Key 时，请在设置里填可用的图像 API Key。");
      setBubble("动作帧生成失败了，检查图像 API Key 或网络。");
      statusPill.textContent = "生成失败";
    } finally {
      generateMouthFrames.disabled = false;
      generateMouthFrames.textContent = previousText;
    }
  }

  function resetCreateForm() {
    state.selectedPresetKey = "gentle";
    state.pendingImageData = "";
    state.pendingImageMeta = null;
    state.pendingMouthFrames = [];
    state.pendingGifAction = null;
    state.pendingCustomActions = [];
    stopGifActionPreview();
    stopVideoActionPreview();
    petNameInput.value = "";
    if (petSpeciesInput) petSpeciesInput.value = "custom";
    petImageInput.value = "";
    if (gifActionName) gifActionName.value = "";
    if (saveGifAction) saveGifAction.disabled = true;
    if (videoActionPrompt) videoActionPrompt.value = "";
    if (videoActionName) videoActionName.value = "";
    customPersonality.value = "";
    createDistillSource.value = "";
    setPetImagePreview("");
    renderMouthFramePreview();
    renderGifActionPreview(null);
    renderVideoActionPreview(null);
    renderPendingActionList();
    setGifActionStatus("上传 GIF 后会本地拆帧，不调用外部 API。");
    setVideoActionStatus("上传静态形象后，可以用文字描述生成一个动作。");
    gifActionPanel?.classList.add("hidden");
    setMouthFrameStatus("上传透明 PNG / WebP / GIF 后，会统一画布、角色中心和脚底锚点。GIF 会作为自定义动作。");
    renderPersonaPresets();
  }

  function createPetFromForm() {
    const species = petSpeciesInput?.value || "custom";
    const meta = speciesInfo(species);
    const preset = presetInfo(state.selectedPresetKey);
    const name = sanitizePetName(petNameInput.value, `${meta.label}${state.pets.length + 1}`);
    const customPersona = customPersonality.value.trim();
    const persona = customPersona || preset.persona;
    const pet = normalizePet({
      id: `pet-${Date.now()}`,
      name,
      species,
      presetKey: customPersona ? "custom" : preset.key,
      persona,
      voice: normalizePetVoice(readSettingsForm()),
      display: normalizePetDisplay(readSettingsForm()),
      imageData: state.pendingImageData,
      assets: {
        frames: {
          oh: state.pendingMouthFrames[1] || "",
          open: state.pendingMouthFrames[2] || "",
          wave: state.pendingMouthFrames[3] || "",
        },
        actions: state.pendingCustomActions,
        layout: state.pendingImageMeta?.frameLayout || null,
      },
      createdAt: Date.now(),
    });

    state.pets.unshift(pet);
    selectPet(pet.id);
    resetCreateForm();
    setActivePage("desk");
    setBubble(`${pet.name}已经加入桌面。`);
  }

  function loadSettings() {
    try {
      const stored = readPersistentDocument(settingsStorageKey, {});
      const storedVersion = Number(stored.settingsVersion || 0);
      if (storedVersion < settingsStorageVersion) {
        const storedApiBase = normalizeApiBase(stored.apiBase);
        if (storedApiBase === normalizeApiBase(bundledProxyApiBase)) {
          stored.apiKey = "";
          if (String(stored.chatModel || "").toLowerCase().includes("gemini")) {
            stored.chatModel = defaultSettings.chatModel;
          }
        }
        if (!String(stored.apiKey || "").trim() && isGeminiOpenAiApiBase(storedApiBase)) {
          stored.apiBase = bundledProxyApiBase;
          stored.chatModel = defaultSettings.chatModel;
        }
        if (
          !stored.ttsApiBase ||
          String(stored.ttsModel || "").toLowerCase().includes("gemini") ||
          isLegacyCosyVoiceTts(stored)
        ) {
          stored.ttsApiBase = defaultSettings.ttsApiBase;
          stored.ttsModel = defaultSettings.ttsModel;
          stored.ttsVoice = defaultSettings.ttsVoice;
        }
      }
      if (isLegacyCosyVoiceTts(stored)) {
        Object.assign(stored, useMimoDefaultTts(stored));
      }
      state.settings = normalizeSettings(stored);
    } catch {
      state.settings = { ...defaultSettings };
    }
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
  }

  function normalizeApiBase(value) {
    return String(value || defaultSettings.apiBase)
      .trim()
      .replace(/\/+$/, "");
  }

  function isGeminiOpenAiApiBase(value) {
    return normalizeApiBase(value).includes("generativelanguage.googleapis.com");
  }

  function backendUrl(pathname) {
    throw new Error(`浏览器兼容后端已移除；桌面网络请求必须使用受限 Tauri 命令：${pathname}`);
  }

  function quotaStopMessage(capability, fallback = "") {
    return (
      {
        chat: "聊天模型免费额度或速率限制已触发，已停止聊天模型调用。你可以等待额度恢复，或在设置里填自己的 Key。",
        tts: "语音模型免费额度或速率限制已触发，已停止语音合成调用。聊天仍可继续。",
        image: "图像模型免费额度或速率限制已触发，已停止去背和动作帧生成。聊天和语音不受影响。",
      }[capability] || fallback || "模型额度或速率限制已触发，已停止调用。"
    );
  }

  function markModelStop(capability, message) {
    if (!capability) return;
    state.modelStops[capability] = {
      stoppedAt: new Date().toISOString(),
      message: message || quotaStopMessage(capability),
    };
    if (capability === "image") {
      setMouthFrameStatus(state.modelStops[capability].message);
    } else {
      setBubble(state.modelStops[capability].message);
      statusPill.textContent = capability === "chat" ? "聊天已停止" : "语音已停止";
    }
  }

  function clearModelStop(capability) {
    if (capability) state.modelStops[capability] = null;
  }

  function stoppedCapabilityMessage(capability) {
    return state.modelStops[capability]?.message || "";
  }

  async function apiErrorFromResponse(response, fallback) {
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text };
    }
    const error = new Error(data.error || data.detail || text || fallback || `API failed with ${response.status}.`);
    error.status = response.status;
    error.capability = data.capability || "";
    error.quotaStopped = Boolean(data.quotaStopped);
    error.stopped = Boolean(data.stopped);
    error.detail = data.detail || "";
    if (error.capability && error.quotaStopped) {
      markModelStop(error.capability, data.error || quotaStopMessage(error.capability));
    }
    return error;
  }

  function normalizeModelCommandError(raw, fallback = "模型调用失败。") {
    const payload = raw && typeof raw === "object" ? raw : {};
    const message = payload.message || payload.error || String(raw || fallback);
    const error = new Error(message);
    error.status = payload.status || 0;
    error.capability = payload.capability || "";
    error.quotaStopped = Boolean(payload.quotaStopped);
    error.stopped = Boolean(payload.stopped);
    if (error.capability && error.quotaStopped) {
      markModelStop(error.capability, message || quotaStopMessage(error.capability));
    }
    return error;
  }

  function modelCommandPayload(settings = readSettingsForm()) {
    return {
      providerId: window.__LUMPA_PROVIDER_IDS__?.chat || "legacy-chat",
    };
  }

  async function ensureModelProvider(capability, options = {}) {
    const accountProvider = window.__LUMPA_PROVIDER_MODE__ === "lumpa_account";
    if (accountProvider) return window.__LUMPA_PROVIDER_IDS__?.[capability] || "lumpa-account";
    if (!isTauriRuntime()) throw new Error("模型功能仅允许通过 Lumpa 桌面端的受限网络命令调用。");

    const ids = { chat: "legacy-chat", tts: "legacy-tts", media: "legacy-media" };
    const id = ids[capability];
    const apiBase = String(options.apiBase || "").trim();
    const apiKey = String(options.apiKey || "").trim();
    if (!id || !apiBase || !apiKey) throw new Error("请先配置该功能的 HTTPS API 地址和用户 Key。");
    const profile = {
      id,
      name: { chat: "聊天供应商", tts: "语音供应商", media: "媒体供应商" }[capability],
      mode: "bring_your_own_key",
      apiBase,
      chatModel: capability === "chat" ? String(options.model || "").trim() : "",
      speechModel: capability === "tts" ? String(options.model || "").trim() : "",
      imageModel: capability === "media" ? String(options.imageModel || options.model || "").trim() : "",
      videoModel: capability === "media" ? String(options.videoModel || options.model || "").trim() : "",
    };
    await invokeTauri("save_provider_profile", { profile, apiKey });
    window.__LUMPA_PROVIDER_IDS__ ||= {};
    window.__LUMPA_PROVIDER_IDS__[capability] = id;
    return id;
  }

  function ensureApiBaseOption(apiBase) {
    if (!settingsApiBase) return;
    const value = normalizeApiBase(apiBase);
    if (!value) return;
    const exists = Array.from(settingsApiBase.options).some((option) => normalizeApiBase(option.value) === value);
    if (!exists) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = "自定义 API";
      settingsApiBase.appendChild(option);
    }
    settingsApiBase.value = value;
  }

  function matchingChatPresetKey(settings) {
    const apiBase = normalizeApiBase(settings.apiBase);
    const model = String(settings.chatModel || "").trim();
    return (
      Object.entries(chatModelPresets).find(
        ([, preset]) => normalizeApiBase(preset.apiBase) === apiBase && preset.model === model
      )?.[0] || "custom"
    );
  }

  function syncChatModelPreset(settings = readSettingsForm()) {
    if (!chatModelPreset) return;
    chatModelPreset.value = matchingChatPresetKey(settings);
  }

  function applyChatModelPreset(presetKey) {
    const preset = chatModelPresets[presetKey];
    if (!preset) {
      syncChatModelPreset();
      return;
    }
    ensureApiBaseOption(preset.apiBase);
    settingsChatModel.value = preset.model;
    syncChatModelPreset({ apiBase: preset.apiBase, chatModel: preset.model });
  }

  function ensureTtsApiBaseOption(apiBase) {
    if (!settingsTtsApiBase) return;
    const value = normalizeApiBase(apiBase);
    if (!value) return;
    const exists = Array.from(settingsTtsApiBase.options).some((option) => normalizeApiBase(option.value) === value);
    if (!exists) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = "自定义语音 API";
      settingsTtsApiBase.appendChild(option);
    }
    settingsTtsApiBase.value = value;
  }

  function matchingTtsPresetKey(settings) {
    const apiBase = normalizeApiBase(settings.ttsApiBase);
    const model = String(settings.ttsModel || "").trim();
    return (
      Object.entries(ttsModelPresets).find(
        ([, preset]) => normalizeApiBase(preset.apiBase) === apiBase && preset.model === model
      )?.[0] || "custom"
    );
  }

  function syncTtsModelPreset(settings = readSettingsForm()) {
    if (!ttsModelPreset) return;
    ttsModelPreset.value = matchingTtsPresetKey(settings);
  }

  function applyTtsModelPreset(presetKey) {
    const preset = ttsModelPresets[presetKey];
    if (!preset) {
      syncTtsModelPreset();
      return;
    }
    ensureTtsApiBaseOption(preset.apiBase);
    settingsTtsModel.value = preset.model;
    if (preset.voice || presetKey !== "mimo-voiceclone") {
      settingsTtsVoice.value = preset.voice;
    }
    syncTtsModelPreset({ ttsApiBase: preset.apiBase, ttsModel: preset.model });
    refreshVoiceCloneForm();
  }

  function normalizeSettings(value) {
    const source = isLegacyCosyVoiceTts(value) ? useMimoDefaultTts(value) : value;
    const speed = Number(source.ttsSpeed);
    const desktopGravity = ["free", "snap-edge", "taskbar", "edge-hang"].includes(source.desktopGravity)
      ? source.desktopGravity
      : defaultSettings.desktopGravity;
    const language = source.language === "en" ? "en" : defaultSettings.language;
    const apiKey = String(source.apiKey || defaultSettings.apiKey).trim();
    const apiBase = normalizeApiBase(source.apiBase);
    const chatModel = String(source.chatModel || defaultSettings.chatModel).trim();
    const fallbackToBundledProxy = !apiKey && isGeminiOpenAiApiBase(apiBase);
    const permissions = normalizePermissions(source.permissions);
    return {
      settingsVersion: settingsStorageVersion,
      language,
      apiKey,
      apiBase: fallbackToBundledProxy ? bundledProxyApiBase : apiBase,
      chatModel: fallbackToBundledProxy ? defaultSettings.chatModel : chatModel,
      ttsApiKey: String(source.ttsApiKey || defaultSettings.ttsApiKey).trim(),
      ttsApiBase: normalizeApiBase(source.ttsApiBase || defaultSettings.ttsApiBase),
      ttsModel: String(source.ttsModel || defaultSettings.ttsModel).trim(),
      ttsVoice: String(source.ttsVoice || defaultSettings.ttsVoice).trim(),
      ttsSpeed: Number.isFinite(speed) ? Math.min(2, Math.max(0.5, speed)) : defaultSettings.ttsSpeed,
      floatingMode: Boolean(source.floatingMode),
      petScale: clampNumber(source.petScale, 65, 145, defaultSettings.petScale),
      petOffsetY: clampNumber(source.petOffsetY, -160, 160, defaultSettings.petOffsetY),
      petOpacity: clampNumber(source.petOpacity, 35, 100, defaultSettings.petOpacity),
      alwaysOnTop: typeof source.alwaysOnTop === "boolean" ? source.alwaysOnTop : defaultSettings.alwaysOnTop,
      clickThrough: Boolean(source.clickThrough),
      positionLocked: Boolean(source.positionLocked),
      desktopGravity,
      launchAtLogin: permissions.launchAtLogin && Boolean(source.launchAtLogin),
      autoUpdate: permissions.autoUpdate && Boolean(source.autoUpdate),
      updateChannel: source.updateChannel === "beta" ? "beta" : "stable",
      usageSupervisionEnabled: Boolean(source.usageSupervisionEnabled),
      usageSupervisionApp: String(source.usageSupervisionApp || "").trim().slice(0, 160),
      usageSupervisionOperator: source.usageSupervisionOperator === "under" ? "under" : "over",
      usageSupervisionDuration: clampNumber(
        source.usageSupervisionDuration,
        1,
        1440,
        defaultSettings.usageSupervisionDuration,
      ),
      usageSupervisionUnit: source.usageSupervisionUnit === "hours" ? "hours" : "minutes",
      permissions,
      memoryEnabled: permissions.memory && Boolean(source.memoryEnabled),
      memoryNickname: String(source.memoryNickname || "").trim().slice(0, 80),
      memoryPreferences: String(source.memoryPreferences || "").trim().slice(0, 1000),
      memoryRecentTasks: String(source.memoryRecentTasks || "").trim().slice(0, 1000),
      persona: String(source.persona || defaultSettings.persona).trim(),
    };
  }

  function applyLanguageSetting(language = state.settings.language) {
    const normalized = language === "en" ? "en" : defaultSettings.language;
    document.documentElement.lang = normalized;
    document.body.dataset.language = normalized;
  }

  function signedPx(value) {
    const number = Math.round(Number(value) || 0);
    return `${number > 0 ? "+" : ""}${number}px`;
  }

  function updateDisplaySettingLabels(settings = readSettingsForm()) {
    petScaleValue.textContent = `${Math.round(settings.petScale)}%`;
    petOffsetYValue.textContent = signedPx(settings.petOffsetY);
    petOpacityValue.textContent = `${Math.round(settings.petOpacity)}%`;
    alwaysOnTopStatus.textContent = settings.alwaysOnTop ? "开启" : "关闭";
    clickThroughStatus.textContent = settings.clickThrough ? "开启" : "关闭";
    positionLockedStatus.textContent = settings.positionLocked ? "开启" : "关闭";
    if (launchAtLoginStatus) launchAtLoginStatus.textContent = settings.launchAtLogin ? "开启" : "关闭";
    if (autoUpdateStatus) autoUpdateStatus.textContent = settings.autoUpdate ? "开启" : "关闭";
    memoryEnabledStatus.textContent = settings.memoryEnabled ? "开启" : "关闭";
    updatePermissionControls(settings);
    if (floatLock) {
      floatLock.classList.toggle("active", settings.positionLocked);
      floatLock.title = settings.positionLocked ? "解除锁定" : "锁定位置";
      floatLock.setAttribute("aria-label", settings.positionLocked ? "解除锁定" : "锁定位置");
      floatLock.querySelector("span").textContent = settings.positionLocked ? "解" : "锁";
    }
  }
  function applyVisualSettings(settings = state.settings) {
    document.documentElement.style.setProperty("--pet-scale", (settings.petScale / 100).toFixed(2));
    document.documentElement.style.setProperty("--pet-offset-y", `${settings.petOffsetY}px`);
    document.documentElement.style.setProperty("--pet-opacity", (settings.petOpacity / 100).toFixed(2));
  }

  function applyPositionLock(settings = readSettingsForm()) {
    petDock.classList.toggle("position-locked", settings.positionLocked);
  }

  function desktopOptionsPayload(settings = readSettingsForm(), extra = {}) {
    const floating = petDock.classList.contains("mini");
    return {
      petScale: settings.petScale / 100,
      alwaysOnTop: floating ? settings.alwaysOnTop : false,
      clickThrough: floating ? settings.clickThrough : false,
      desktopGravity: settings.desktopGravity,
      petScale: settings.petScale / 100,
      alwaysOnTop: floating ? settings.alwaysOnTop : false,
      clickThrough: floating ? settings.clickThrough : false,
      desktopGravity: settings.desktopGravity,
      floatingMode: floating,
      applyPosition: Boolean(extra.applyPosition),
    };
  }

  function syncTauriDesktopOptions(settings = readSettingsForm(), extra = {}) {
    if (!isTauriRuntime()) return Promise.resolve(null);
    if (!hasPermission("desktopControl", settings) && !extra.force) return Promise.resolve(null);

    return invokeTauri("apply_desktop_options", {
      options: desktopOptionsPayload(settings, extra),
    }).catch((error) => {
      console.warn("Tauri desktop options failed:", error);
    });
  }

  async function syncLaunchAtLogin(settings = readSettingsForm()) {
    if (!isTauriRuntime()) return null;
    if (!hasPermission("launchAtLogin", settings)) {
      if (launchAtLoginStatus) launchAtLoginStatus.textContent = "权限关闭";
      return null;
    }
    try {
      const enabled = await invokeTauri("set_launch_at_login", { enabled: Boolean(settings.launchAtLogin) });
      if (launchAtLoginStatus) launchAtLoginStatus.textContent = enabled ? "开启" : "关闭";
      return enabled;
    } catch (error) {
      console.warn("Launch at login failed:", error);
      if (launchAtLoginStatus) launchAtLoginStatus.textContent = "设置失败";
      setBubble(error?.message || String(error) || "开机自启设置失败。");
      return null;
    }
  }

  async function refreshLaunchAtLoginStatus() {
    if (!isTauriRuntime() || !launchAtLoginSwitch) return;
    try {
      const enabled = await invokeTauri("get_launch_at_login");
      launchAtLoginSwitch.checked = Boolean(enabled);
      launchAtLoginStatus.textContent = enabled ? "开启" : "关闭";
    } catch {
      launchAtLoginStatus.textContent = "未知";
    }
  }

  async function checkForAppUpdate(options = {}) {
    const settings = readSettingsForm();
    if (!hasPermission("autoUpdate", settings)) {
      if (updateCheckStatus) updateCheckStatus.textContent = permissionDeniedMessage("autoUpdate");
      return null;
    }
    if (updateCheckStatus) updateCheckStatus.textContent = "正在检查更新...";
    if (checkUpdateButton) checkUpdateButton.disabled = true;
    if (installUpdateButton) installUpdateButton.hidden = true;
    try {
      const result = await invokeTauri("updater_check", { channel: settings.updateChannel });
      if (!result?.available) {
        if (updateCheckStatus) {
          updateCheckStatus.textContent = `当前已是最新版本 ${result?.currentVersion || ""}`.trim();
        }
        return result;
      }
      const message = `发现 ${result.channel} 新版本 ${result.latestVersion || ""}，签名校验将在安装前强制执行。`;
      if (updateCheckStatus) {
        updateCheckStatus.textContent = message;
      }
      if (installUpdateButton) installUpdateButton.hidden = false;
      if (!options.silent) setBubble(message);
      return result;
    } catch (error) {
      console.warn("Update check failed:", error);
      if (updateCheckStatus) updateCheckStatus.textContent = error?.message || String(error) || "检查更新失败。";
      return null;
    } finally {
      if (checkUpdateButton) checkUpdateButton.disabled = !hasPermission("autoUpdate", readSettingsForm());
    }
  }

  function fillSettingsForm() {
    const memory = activeMemory();
    if (activePetNameInput) {
      activePetNameInput.value = activePet().name;
    }
    languageInput.value = state.settings.language;
    applyLanguageSetting(state.settings.language);
    settingsApiKey.value = state.settings.apiKey;
    ensureApiBaseOption(state.settings.apiBase);
    settingsChatModel.value = state.settings.chatModel;
    syncChatModelPreset(state.settings);
    settingsTtsApiKey.value = state.settings.ttsApiKey;
    ensureTtsApiBaseOption(state.settings.ttsApiBase);
    settingsTtsModel.value = state.settings.ttsModel;
    settingsTtsVoice.value = state.settings.ttsVoice;
    syncTtsModelPreset(state.settings);
    settingsTtsSpeed.value = String(state.settings.ttsSpeed);
    settingsSpeedValue.value = Number(state.settings.ttsSpeed).toFixed(2);
    floatingSwitch.checked = state.settings.floatingMode;
    floatingStatus.textContent = state.settings.floatingMode ? "开启" : "关闭";
    petScaleInput.value = String(state.settings.petScale);
    petOffsetYInput.value = String(state.settings.petOffsetY);
    petOpacityInput.value = String(state.settings.petOpacity);
    alwaysOnTopSwitch.checked = state.settings.alwaysOnTop;
    clickThroughSwitch.checked = state.settings.clickThrough;
    positionLockedSwitch.checked = state.settings.positionLocked;
    desktopGravityInput.value = state.settings.desktopGravity;
    if (launchAtLoginSwitch) launchAtLoginSwitch.checked = state.settings.launchAtLogin;
    if (autoUpdateSwitch) autoUpdateSwitch.checked = state.settings.autoUpdate;
    if (updateChannelInput) updateChannelInput.value = state.settings.updateChannel;
    usageSupervisionEnabled.checked = state.settings.usageSupervisionEnabled;
    usageSupervisionApp.value = state.settings.usageSupervisionApp;
    usageSupervisionOperator.value = state.settings.usageSupervisionOperator;
    usageSupervisionDuration.value = String(state.settings.usageSupervisionDuration);
    usageSupervisionUnit.value = state.settings.usageSupervisionUnit;
    updateUsageSupervisionLabel(state.settings);
    updatePermissionControls(state.settings);
    memoryEnabledSwitch.checked = memory.enabled;
    memoryNickname.value = memory.nickname;
    memoryPreferences.value = memory.preferences;
    memoryRecentTasks.value = memory.recentTasks;
    updateDisplaySettingLabels(state.settings);
    applyVisualSettings(state.settings);
    applyPositionLock(state.settings);
    settingsPersona.value = state.settings.persona;
    settingsPersona.dataset.presetKey = activePet().presetKey || personaPresets[0].key;
    renderSettingsPersonaPresets();
    renderMemoryManager();
    refreshVoiceCloneForm();
    if (imageModelInput) {
      imageModelInput.value = "bundled-proxy-gpt-image-2";
    }
  }

  function readSettingsForm() {
    return normalizeSettings({
      language: languageInput.value,
      apiKey: settingsApiKey.value,
      apiBase: settingsApiBase.value,
      chatModel: settingsChatModel.value,
      ttsApiKey: settingsTtsApiKey.value,
      ttsApiBase: settingsTtsApiBase.value,
      ttsModel: settingsTtsModel.value,
      ttsVoice: settingsTtsVoice.value,
      ttsSpeed: settingsTtsSpeed.value,
      floatingMode: floatingSwitch.checked,
      petScale: petScaleInput.value,
      petOffsetY: petOffsetYInput.value,
      petOpacity: petOpacityInput.value,
      alwaysOnTop: alwaysOnTopSwitch.checked,
      clickThrough: clickThroughSwitch.checked,
      positionLocked: positionLockedSwitch.checked,
      desktopGravity: desktopGravityInput.value,
      launchAtLogin: Boolean(launchAtLoginSwitch?.checked),
      autoUpdate: Boolean(autoUpdateSwitch?.checked),
      updateChannel: updateChannelInput?.value === "beta" ? "beta" : "stable",
      usageSupervisionEnabled: usageSupervisionEnabled.checked,
      usageSupervisionApp: usageSupervisionApp.value,
      usageSupervisionOperator: usageSupervisionOperator.value,
      usageSupervisionDuration: usageSupervisionDuration.value,
      usageSupervisionUnit: usageSupervisionUnit.value,
      permissions: Object.fromEntries(
        permissionToggles.map((toggle) => [toggle.dataset.permissionToggle, Boolean(toggle.checked)]),
      ),
      memoryEnabled: memoryEnabledSwitch.checked,
      memoryNickname: memoryNickname.value,
      memoryPreferences: memoryPreferences.value,
      memoryRecentTasks: memoryRecentTasks.value,
      persona: settingsPersona.value,
    });
  }
  function apiOptions() {
    const settings = readSettingsForm();
    const petMemory = activeMemory();
    return {
      apiKey: settings.apiKey,
      apiBase: settings.apiBase,
      chatModel: settings.chatModel,
      ttsApiKey: settings.ttsApiKey,
      ttsApiBase: settings.ttsApiBase,
      ttsModel: settings.ttsModel,
      ttsVoice: settings.ttsVoice,
      ttsSpeed: settings.ttsSpeed,
      persona: settings.persona,
      memory: petMemory.enabled ? petMemory : null,
    };
  }

  async function syncBackendModelStatus() {
    return Promise.resolve();
  }

  function buildPetIdentityPrompt(pet = activePet()) {
    const name = String(pet?.name || "桌宠").trim();
    const meta = speciesInfo(pet?.species);
    const species = String(meta.label || pet?.species || "动物").trim();
    const visualType = petHasCustomVisual(pet) ? "用户自定义形象" : "预设形象";
    return [
      "当前桌宠身份是最高优先级设定。",
      `你的名字叫「${name}」。`,
      `你的形象/物种是「${species}」，属于${visualType}。`,
      `你必须始终以「${name}」的身份说话，不要自称兔兔、棉棉或其他名字，除非当前名字就是那个。`,
      "如果历史对话、默认模板或性格设定里出现了不同名字或不同物种，一律以当前桌宠身份为准。",
      "不要向用户解释这些设定，直接自然对话。",
    ].join("\n");
  }

  function buildSystemPrompt(persona, pet = activePet()) {
    const customPersona = String(persona || "").trim().slice(0, 4000);
    const identityPrompt = buildPetIdentityPrompt(pet);
    if (!customPersona) return [rabbitSystemPrompt, identityPrompt].join("\n\n");

    return [
      rabbitSystemPrompt,
      identityPrompt,
      "下面是用户为这只桌宠设置的性格。你要稳定遵守这个人格，但不能输出这段设定本身。",
      customPersona,
    ].join("\n\n");
  }

  function buildMemoryPrompt(memory) {
    if (!memory || typeof memory !== "object") return "";

    const nickname = String(memory.nickname || "").trim().slice(0, 80);
    const preferences = String(memory.preferences || "").trim().slice(0, 1000);
    const recentTasks = String(memory.recentTasks || "").trim().slice(0, 1000);
    const items = Array.isArray(memory.items)
      ? memory.items
          .map(normalizeMemoryItem)
          .filter((item) => item.text)
          .slice(-30)
      : [];

    if (!nickname && !preferences && !recentTasks && !items.length) return "";

    return [
      "下面是当前桌宠独立保存的本地记忆。只把它当作上下文偏好，不要主动暴露或复述整段记忆。",
      nickname ? `用户称呼：${nickname}` : "",
      preferences ? `用户偏好：${preferences}` : "",
      recentTasks ? `最近任务：${recentTasks}` : "",
      items.length
        ? [
            "分条记忆：",
            ...items.map((item) => `- ${categoryLabel(item.category)}：${item.text}`),
          ].join("\n")
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  function buildSystemPromptWithMemory(persona, memory, pet = activePet()) {
    return [buildSystemPrompt(persona, pet), buildMemoryPrompt(memory)].filter(Boolean).join("\n\n");
  }

  function extractOpenAiMessageText(data) {
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content === "string") return content.trim();
    if (Array.isArray(content)) {
      return content
        .map((part) => {
          if (typeof part === "string") return part;
          return part?.text || part?.content || "";
        })
        .join("")
        .trim();
    }
    return "";
  }

  async function requestOpenAiCompatibleChat({ messages, temperature = 0.8, maxTokens = 180 }) {
    const options = apiOptions();
    if (!options.apiKey && !isTauriRuntime()) {
      throw new Error("请先在设置里填写 API Key。");
    }

    if (isTauriRuntime()) {
      try {
        const providerId = await ensureModelProvider("chat", {
          apiBase: options.apiBase,
          apiKey: options.apiKey,
          model: options.chatModel,
        });
        const data = await invokeTauri("model_chat", {
          payload: {
            providerId,
            messages,
            temperature,
            maxTokens,
          },
        });
        const reply = String(data?.reply || "").trim();
        if (!reply) throw new Error("聊天接口没有返回回复。");
        return reply;
      } catch (error) {
        throw normalizeModelCommandError(error, "聊天模型调用失败。");
      }
    }

    throw new Error("聊天功能仅允许通过 Lumpa 桌面端的受限 Rust 命令调用。");
  }

  function setVoiceCloneStatus(text) {
    if (voiceCloneStatus) voiceCloneStatus.textContent = text;
  }

  function isMimoTtsModel(model) {
    return String(model || "").toLowerCase().startsWith("mimo-v2.5-tts");
  }

  function sanitizeVoiceCloneName(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);
  }

  function suggestedVoiceCloneName() {
    const pet = activePet();
    const fromPet = sanitizeVoiceCloneName(pet?.name || pet?.id || "");
    return fromPet || `pet-${Date.now().toString(36).slice(-6)}`;
  }

  function refreshVoiceCloneForm(options = {}) {
    const allowed = hasPermission("voiceClone");
    if (voiceCloneName) {
      voiceCloneName.placeholder = suggestedVoiceCloneName();
      if (options.clear) voiceCloneName.value = "";
    }
    if (voiceCloneText && options.clear) voiceCloneText.value = "";
    if (voiceCloneFile && options.clear) voiceCloneFile.value = "";
    if (uploadVoiceClone) uploadVoiceClone.disabled = !allowed;
    if (options.clear) {
      setVoiceCloneStatus(
        allowed
          ? "MiMo 克隆音色会把参考音频保存在当前桌宠设置里，不会写死进代码。"
          : permissionDeniedMessage("voiceClone"),
      );
    }
  }

  function extractVoiceUri(data) {
    return (
      data?.uri ||
      data?.voice ||
      data?.data?.uri ||
      data?.data?.voice ||
      data?.result?.uri ||
      data?.result?.voice ||
      ""
    );
  }

  async function parseJsonResponse(response) {
    const text = await response.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return { error: text };
    }
  }

  async function requestVoiceCloneUpload({ file, customName, text }) {
    ensurePermission("voiceClone");
    const settings = readSettingsForm();
    const isMimo = isMimoTtsModel(settings.ttsModel || defaultSettings.ttsModel);
    if (!isMimo && !(settings.ttsApiKey || settings.apiKey)) {
      throw new Error("请先在设置里填写语音 API Key。");
    }
    if (!file) {
      throw new Error("请先选择一段参考音频。");
    }
    if (file.size > maxVoiceSampleBytes) {
      throw new Error("参考音频太大了，请换成 12MB 以内、8-10 秒的清晰音频。");
    }

    const transcript = String(text || "").trim();
    if (!transcript) {
      throw new Error("请填入参考音频里说的文字。");
    }

    if (isMimo) {
      const audio = await readFileAsDataUrl(file);
      return {
        uri: audio,
        name: sanitizeVoiceCloneName(customName) || suggestedVoiceCloneName(),
        customName: sanitizeVoiceCloneName(customName) || suggestedVoiceCloneName(),
      };
    }

    const apiKey = settings.ttsApiKey || settings.apiKey;
    const apiBase = settings.ttsApiBase || settings.apiBase;
    const model = settings.ttsModel || defaultSettings.ttsModel;
    const providerId = await ensureModelProvider("tts", { apiKey, apiBase, model });
    const payload = {
      providerId,
      customName: sanitizeVoiceCloneName(customName) || suggestedVoiceCloneName(),
      audio: await readFileAsDataUrl(file),
      text: transcript.slice(0, 1000),
    };
    return invokeTauri("model_voice_clone", { payload });
  }

  function persistSettings() {
    state.settings = readSettingsForm();
    const pet = activePet();
    const existingMemory = activeMemory();
    const presetKey = settingsPersona.dataset.presetKey;
    const matchedPreset = personaPresets.find((preset) => preset.key === presetKey);
    pet.name = sanitizePetName(activePetNameInput?.value, pet.name);
    if (activePetNameInput) {
      activePetNameInput.value = pet.name;
    }
    pet.presetKey = matchedPreset ? matchedPreset.key : "custom";
    pet.persona = state.settings.persona;
    pet.voice = normalizePetVoice(state.settings);
    pet.display = normalizePetDisplay(state.settings);
    pet.memory = normalizePetMemory({
      ...existingMemory,
      enabled: state.settings.memoryEnabled,
      nickname: state.settings.memoryNickname,
      preferences: state.settings.memoryPreferences,
      recentTasks: state.settings.memoryRecentTasks,
      items: existingMemory.items,
    });
    persistPets();
    applyActivePetToUi();
    renderPetList();
    renderSettingsPersonaPresets();
    renderMemoryManager();
    writePersistentDocument(settingsStorageKey, state.settings);
    setDockMode(state.settings.floatingMode ? "mini" : "normal");
    applyLanguageSetting(state.settings.language);
    applyVisualSettings(state.settings);
    applyPositionLock(state.settings);
    const canControlDesktop = hasPermission("desktopControl", state.settings);
    const desktopSettings = canControlDesktop
      ? state.settings
      : {
          ...state.settings,
          alwaysOnTop: false,
          clickThrough: false,
          positionLocked: false,
          desktopGravity: "free",
        };
    syncTauriDesktopOptions(desktopSettings, { applyPosition: true, force: !canControlDesktop });
    syncLaunchAtLogin(state.settings);
    if (state.usageSnapshot) {
      evaluateUsageSupervision(state.usageSnapshot);
    }
    setBubble("设置已保存，下一次对话和语音会使用新配置。");
    statusPill.textContent = "已保存";
  }

  function resetDockPosition() {
    petDock.style.left = "";
    petDock.style.top = "";
    petDock.style.right = "";
    petDock.style.bottom = "";
  }

  let worldInstance = null;
  let worldGameActive = false;

  function ensureWorldEngine() {
    if (!worldInstance && window.LumpaWorld) {
      worldInstance = new window.LumpaWorld();
    }
    return worldInstance;
  }

  
  function autoEnterWorldGame() {
    const launchScreen = document.querySelector("#worldLaunchScreen");
    const cutsceneOverlay = document.querySelector("#worldCutsceneOverlay");
    const gameplayInterface = document.querySelector("#worldGameplayInterface");
    const worldPetTag = document.querySelector("#worldPetTag");
    const worldCanvas = document.querySelector("#worldCanvas");
    const worldCanvasWrapper = document.querySelector("#worldCanvasWrapper");
    const pet = activePet() || { name: "白兔棉棉", avatar: "assets/rabbit/talk_closed.png" };

    if (launchScreen) launchScreen.classList.add("hidden");
    if (cutsceneOverlay) cutsceneOverlay.classList.add("hidden");
    if (gameplayInterface) gameplayInterface.classList.remove("hidden");

    worldGameActive = true;
    if (worldPetTag) worldPetTag.textContent = `操控中：${pet.name || "白兔棉棉"}`;

    const world = ensureWorldEngine();
    if (world && (!world.isRunning || !world.canvas)) {
      world.init(worldCanvas, worldCanvasWrapper, pet.name, pet.avatar || pet.presetFrame || "assets/rabbit/talk_closed.png");
      world.start();
    }
    return world;
  }

function runWorldCutscene() {
    const launchScreen = document.querySelector("#worldLaunchScreen");
    const cutsceneOverlay = document.querySelector("#worldCutsceneOverlay");
    const cutsceneText = document.querySelector("#worldCutsceneText");
    const gameplayInterface = document.querySelector("#worldGameplayInterface");
    const worldPetTag = document.querySelector("#worldPetTag");
    const worldCanvas = document.querySelector("#worldCanvas");
    const worldCanvasWrapper = document.querySelector("#worldCanvasWrapper");
    const pet = activePet();

    if (!launchScreen || !cutsceneOverlay || !gameplayInterface) return;
    launchScreen.classList.add("hidden");
    cutsceneOverlay.classList.remove("hidden");

    const lines = [
      "正在凝练莫兰迪魔力通道，开启世界门扉...",
      "已接入桌宠灵魂印记，准备降落莫兰迪大陆...",
      "传送完成！探索这片神秘的像素小世界吧！"
    ];
    let step = 0;
    cutsceneText.textContent = lines[0];

    const interval = window.setInterval(() => {
      step++;
      if (step < lines.length) {
        cutsceneText.textContent = lines[step];
      } else {
        window.clearInterval(interval);
        window.setTimeout(() => {
          cutsceneOverlay.classList.add("hidden");
          gameplayInterface.classList.remove("hidden");
          worldGameActive = true;
          if (worldPetTag) {
            worldPetTag.textContent = `操控中：${pet.name || "桌宠"}`;
          }
          const world = ensureWorldEngine();
          if (world) {
            world.init(worldCanvas, worldCanvasWrapper, pet.name, pet.avatar || pet.presetFrame || "assets/rabbit/talk_closed.png");
            world.start();
          }
        }, 600);
      }
    }, 850);
  }

  function exitWorldToLobby() {
    const launchScreen = document.querySelector("#worldLaunchScreen");
    const cutsceneOverlay = document.querySelector("#worldCutsceneOverlay");
    const gameplayInterface = document.querySelector("#worldGameplayInterface");

    worldGameActive = false;
    if (worldInstance) worldInstance.pause();
    if (gameplayInterface) gameplayInterface.classList.add("hidden");
    if (cutsceneOverlay) cutsceneOverlay.classList.add("hidden");
    if (launchScreen) launchScreen.classList.remove("hidden");
  }

  
  
  let worldToastTimer = null;
  function showWorldToast(text) {
    const banner = document.querySelector("#worldToastBanner");
    if (banner) {
      banner.textContent = text;
      banner.classList.remove("hidden");
      if (worldToastTimer) clearTimeout(worldToastTimer);
      worldToastTimer = setTimeout(() => {
        banner.classList.add("hidden");
      }, 2200);
    }
  }

function bindWorldButtonsDirectly() {
    const worldCanvas = document.querySelector("#worldCanvas");
    const worldCanvasWrapper = document.querySelector("#pixelWorldContainer") || document.querySelector("#worldCanvasWrapper");
    const pet = activePet() || { name: "白兔棉棉", avatar: "assets/rabbit/talk_closed.png" };

    const world = ensureWorldEngine();
    if (world) {
      world.init(worldCanvas, worldCanvasWrapper, pet.name, pet.avatar || pet.presetFrame || "assets/rabbit/talk_closed.png");
      world.start();
    }

    const feedBtn = document.querySelector("#worldFeedBtn");
    if (feedBtn) {
      feedBtn.onclick = (e) => {
        e.stopPropagation(); e.preventDefault();
        const w = ensureWorldEngine();
        if (w) {
          const foods = ["carrot", "strawberry", "cookie", "riceball"];
          const food = foods[Math.floor(Math.random() * foods.length)];
          w.feedPet(food);
          updateWorldStatusBar();
          showWorldToast("🥕 成功投喂白兔棉棉美美的一餐！饱食度 UP！"); setBubble("🥕 投喂给白兔棉棉美美的一餐！");
        }
      };
    }

    const petTouchBtn = document.querySelector("#worldPetTouchBtn");
    if (petTouchBtn) {
      petTouchBtn.onclick = (e) => {
        e.stopPropagation(); e.preventDefault();
        const w = ensureWorldEngine();
        if (w) {
          w.petInteraction(280, 200);
          updateWorldStatusBar();
          showWorldToast("💖 轻轻抚摸白兔棉棉，心情与亲密度 UP！"); setBubble("💖 轻轻抚摸白兔棉棉，开心度 UP！");
        }
      };
    }

    const miniGameBtn = document.querySelector("#worldMiniGameBtn");
    if (miniGameBtn) {
      miniGameBtn.onclick = (e) => {
        e.stopPropagation(); e.preventDefault();
        const w = ensureWorldEngine();
        if (w) {
          w.startMiniGame();
          showWorldToast("🎯 开启 30s 掉落美食小游戏！"); setBubble("🎯 挑战 30s 抓甜点小游戏！");
        }
      };
    }

    const cameraBtn = document.querySelector("#worldCameraBtn");
    if (cameraBtn) {
      cameraBtn.onclick = (e) => {
        e.stopPropagation(); e.preventDefault();
        const w = ensureWorldEngine();
        if (w) {
          const canvas = document.querySelector("#worldCanvas");
          const polaroidImg = document.querySelector("#polaroidImg");
          const polaroidDate = document.querySelector("#polaroidDate");
          const modal = document.querySelector("#worldPolaroidModal");

          if (canvas && polaroidImg && modal) {
            try {
              polaroidImg.src = canvas.toDataURL("image/png");
            } catch (err) {
              w.render();
              polaroidImg.src = canvas.toDataURL("image/png");
            }
            if (polaroidDate) polaroidDate.textContent = new Date().toLocaleDateString();
            modal.classList.remove("hidden");
            showWorldToast("📷 莫兰迪拍立得合影快照已生成！"); setBubble("📷 莫兰迪拍立得相册卡片已生成！");
          }
        }
      };
    }

    const dayNightBtn = document.querySelector("#worldDayNightBtn");
    if (dayNightBtn) {
      dayNightBtn.onclick = (e) => {
        e.stopPropagation(); e.preventDefault();
        const w = ensureWorldEngine();
        if (w) {
          const envs = ["day", "twilight", "night"];
          const nextIdx = (envs.indexOf(currentEnv) + 1) % envs.length;
          currentEnv = envs[nextIdx];
          w.setTimeOfDay(currentEnv);
          setBubble(`🌙 已切换氛围模式：${currentEnv}`);
        }
      };
    }

    document.querySelectorAll(".tool-btn").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation(); e.preventDefault();
        document.querySelectorAll(".tool-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        inventory.selectedTool = btn.dataset.tool;
        const label = btn.querySelector("span:last-child")?.textContent || btn.dataset.tool;
        setBubble(`🛠️ 已装备工具：${label}`);
      };
    });

    const openInvBtn = document.querySelector("#openInventoryBtn");
    if (openInvBtn) {
      openInvBtn.onclick = (e) => {
        e.stopPropagation(); e.preventDefault();
        document.querySelector("#worldInventoryModal")?.classList.remove("hidden");
        renderInventoryModal();
        showWorldToast("🎒 像素 24 格背包已打开"); setBubble("🎒 像素背包已打开");
      };
    }

    const openCraftBtn = document.querySelector("#openCraftBtn");
    if (openCraftBtn) {
      openCraftBtn.onclick = (e) => {
        e.stopPropagation(); e.preventDefault();
        document.querySelector("#worldCraftModal")?.classList.remove("hidden");
        renderCraftModal();
        showWorldToast("🛠️ 莫兰迪工作台手工合成已打开"); setBubble("🛠️ 工作台合成窗口已打开");
      };
    }

    const openShopBtn = document.querySelector("#openShopBtn");
    if (openShopBtn) {
      openShopBtn.onclick = (e) => {
        e.stopPropagation(); e.preventDefault();
        document.querySelector("#worldShopModal")?.classList.remove("hidden");
        renderShopModal();
        showWorldToast("🏪 像素杂货铺商店已打开"); setBubble("🏪 杂货铺商店已打开");
      };
    }
  }

  // ===================================================
  // ☕ 全新独立功能模块：工位伴读 · 专注同桌 (Focus Module)
  // ===================================================
  let focusInstance = null;
  let focusInitialized = false;
  let floatingSubtitleTimer = null;
  let floatingPetAnimId = null;
  // 当前体验阶段开放所有完整宠物模型；不改写礼物兑换存档，后续可一键恢复。
  const previewUnlockAllPets = true;

  function ensureFocusEngine() {
    if (!focusInstance && window.FocusEngine) {
      focusInstance = new window.FocusEngine({ allUnlocked: previewUnlockAllPets, initialPetId: launchDefaultPetId });
    }
    return focusInstance;
  }

  // 宠物头顶浮动字幕 (Top Subtitle HUD)
  function showFloatingSubtitle(text, duration = 3800) {
    const el = document.querySelector("#floatingSubtitle");
    if (el) {
      el.textContent = text;
      el.classList.remove("hidden");
      if (floatingSubtitleTimer) clearTimeout(floatingSubtitleTimer);
      floatingSubtitleTimer = setTimeout(() => {
        el.classList.add("hidden");
      }, duration);
    }
    setBubble(text);
  }

  // 桌面浮窗与工位伴读统一的每日待办面板
  let floatingMenuInstance = null;
  let floatingVitalsInstance = null;

  function renderFocusTodoSummary() {
    const engine = ensureFocusEngine();
    const summary = document.querySelector("#focusTodoSummary");
    if (!engine || !summary) return;
    const todos = engine.getTodayTodos();
    const done = todos.filter(todo => todo.done).length;
    const remaining = todos.length - done;
    const growth = engine.getPetGrowthInfo();
    summary.textContent = todos.length
      ? `今日任务 ${done}/${todos.length} · 还剩 ${remaining} 项 · ${growth.stage}，已成长 ${growth.completedPomodoros} 次`
      : `今日暂无待办 · 右键桌宠即可添加 · ${growth.stage}，已成长 ${growth.completedPomodoros} 次`;
  }

  function renderFloatingTodoList() {
    const engine = ensureFocusEngine();
    const list = document.querySelector("#floatingTodoList");
    const empty = document.querySelector("#floatingTodoEmpty");
    if (!engine || !list) return;

    const todos = engine.getTodayTodos();
    const doneCount = todos.filter(todo => todo.done).length;
    const date = new Date();
    const dateEl = document.querySelector("#floatingTodoDate");
    const progressEl = document.querySelector("#floatingTodoProgress");
    const growthEl = document.querySelector("#floatingPetGrowth");
    if (dateEl) dateEl.textContent = `${date.getMonth() + 1}月${date.getDate()}日 · 每日自动新建`;
    if (progressEl) progressEl.textContent = `${doneCount} / ${todos.length} 已完成`;
    const growth = engine.getPetGrowthInfo();
    if (growthEl) {
      growthEl.textContent = growth.nextAt
        ? `${growth.stage} · ${growth.completedPomodoros} 次番茄 · ${growth.nextAt - growth.completedPomodoros} 次后进阶`
        : `成年伙伴 · ${growth.completedPomodoros} 次番茄`;
    }

    list.replaceChildren();
    todos.forEach(todo => {
      const row = document.createElement("div");
      row.className = `pet-todo-item${todo.done ? " done" : ""}`;
      row.dataset.todoId = todo.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(todo.done);
      checkbox.setAttribute("aria-label", `完成：${todo.text}`);
      checkbox.addEventListener("change", () => engine.toggleTodo(todo.id, checkbox.checked));

      const text = document.createElement("span");
      text.className = "pet-todo-item-text";
      text.textContent = todo.text;

      row.append(checkbox, text);
      if (todo.rewardGranted) {
        const rewarded = document.createElement("span");
        rewarded.className = "pet-todo-rewarded";
        rewarded.textContent = "🎁";
        rewarded.title = "本任务奖励已领取";
        row.appendChild(rewarded);
      }

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "pet-todo-delete";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `删除：${todo.text}`);
      remove.addEventListener("click", () => engine.removeTodo(todo.id));
      row.appendChild(remove);
      list.appendChild(row);
    });

    empty?.classList.toggle("hidden", todos.length > 0);
    renderFocusTodoSummary();
  }

  function initFloatingContextMenu() {
    if (floatingMenuInstance && floatingMenuInstance.dataset.bound) return;
    floatingMenuInstance = document.querySelector("#floatingPetContextMenu");
    floatingVitalsInstance = document.querySelector("#floatingPetVitals");
    if (!floatingMenuInstance) return;

    if (floatingMenuInstance.parentElement !== document.body) {
      document.body.appendChild(floatingMenuInstance);
    }
    floatingMenuInstance.dataset.bound = "true";

    const engine = ensureFocusEngine();
    if (!engine) return;
    engine.onTodosChanged = () => renderFloatingTodoList();
    engine.onGrowthChanged = () => renderFloatingTodoList();
    engine.onTodoReward = ({ todo, gift }) => {
      showFloatingSubtitle(`🎁 完成「${todo.text}」，获得【${gift.name}】！任务奖励不会让猫咪提前长大。`, 4800);
      renderShopPanel();
      renderAlbumPanel();
    };

    document.addEventListener("pointerdown", (e) => {
      if (floatingMenuInstance && !floatingMenuInstance.contains(e.target)) {
        hideFloatingContextMenu();
      }
    });

    const form = floatingMenuInstance.querySelector("#floatingTodoForm");
    const input = floatingMenuInstance.querySelector("#floatingTodoInput");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const todo = engine.addTodo(input?.value || "");
      if (todo && input) input.value = "";
      input?.focus();
    });
    floatingMenuInstance.querySelector("#floatingTodoClose")?.addEventListener("click", hideFloatingContextMenu);
    floatingMenuInstance.querySelector("#floatingTodoOpenFocus")?.addEventListener("click", () => {
      hideFloatingContextMenu();
      setActivePage("focus");
    });
    renderFloatingTodoList();
  }

  function showFloatingContextMenu(clientX, clientY) {
    initFloatingContextMenu();
    if (!floatingMenuInstance) return;
    renderFloatingTodoList();
    floatingMenuInstance.classList.remove("hidden");
    if (floatingVitalsInstance) floatingVitalsInstance.classList.add("hidden");

    let x = clientX;
    let y = clientY;
    const menuW = floatingMenuInstance.offsetWidth || 340;
    const menuH = floatingMenuInstance.offsetHeight || 500;
    if (x + menuW > window.innerWidth) x = window.innerWidth - menuW - 10;
    if (y + menuH > window.innerHeight) y = window.innerHeight - menuH - 10;
    if (x < 10) x = 10;
    if (y < 10) y = 10;

    floatingMenuInstance.style.left = x + "px";
    floatingMenuInstance.style.top = y + "px";
  }

  function hideFloatingContextMenu() {
    if (floatingMenuInstance) floatingMenuInstance.classList.add("hidden");
    if (floatingVitalsInstance) floatingVitalsInstance.classList.add("hidden");
  }

  // 桌面浮窗：家具与第三代像素逐帧宠物共用 2D Canvas。
  function syncFloatingPetCanvas() {
    const canvas = document.querySelector("#petFloatingCanvas");
    if (!canvas) return;
    const engine = ensureFocusEngine();
    if (!engine) return;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.imageSmoothingEnabled = false;

    canvas.classList.remove("hidden");
    const rabbitImg = document.querySelector("#rabbitImage");
    const phaserContainer = document.querySelector("#petRenderer");
    if (phaserContainer) phaserContainer.style.display = "none";

    // 实验 3D 层保持关闭；正式桌宠只使用独立像素动作帧。
    const skeletonCanvas = document.querySelector("#petSkeletonCanvas");
    const canUseSkeleton = false;
    if (skeletonCanvas) skeletonCanvas.classList.add("hidden");
    canvas.classList.remove("pet-furniture-canvas");

    function triggerPetInteraction() {
      // 随机触发丰富的定格互动动作：伸懒腰、张望、洗脸、猛扑、打滚、漫步、欢跳
      const r = Math.random();
      if (engine.equipped.petId === launchDefaultPetId && r < 0.68) {
        const dailyActions = ["sniff", "bow", "greet", "sit", "wag", "curious", "yawn"];
        const action = dailyActions[Math.floor(Math.random() * dailyActions.length)];
        engine.setAction(action, action === "sit" ? 3200 : 1900);
      } else if (r < 0.22) {
        engine.triggerCatStretch();
      } else if (r < 0.40) {
        engine.triggerLookAround();
      } else if (r < 0.56) {
        engine.triggerWashFace();
      } else if (r < 0.72) {
        engine.triggerPounceWiggle();
      } else if (r < 0.86) {
        engine.triggerRollPlay();
      } else {
        engine.triggerWalkRoam();
      }

      engine.catAudio.playMeow("gentle");
      const quotes = engine.equipped.petId === launchDefaultPetId ? [
        "汪！小短腿准备出发。",
        "鼻子贴近地面，闻到了新鲜事！",
        "摇着小尾巴和你打招呼。",
        "来，陪你一起专注。"
      ] : [
        "喵。",
        "喵呜～",
        "呼噜呼噜……(蹭蹭手腕)",
        "今天也要元气满满哦～",
        "舒舒服服伸个大懒腰～打个滚！",
        "歪头好奇地打量着你的屏幕～",
        "小爪抹了抹胡须，精神百倍！",
        "小桌上的咖啡还温着呢～",
        "在认真陪读呢！"
      ];
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      showFloatingSubtitle(q);
    }

    canvas.ondblclick = (e) => {
      e.stopPropagation();
      if (engine.equipped.petId === launchDefaultPetId) engine.setAction("sit", 3200);
      else engine.triggerCatStretch();
    };

    canvas.oncontextmenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      showFloatingContextMenu(e.clientX, e.clientY);
    };

    let isDownOnPet = false;
    let petStartX = 0, petStartY = 0;
    let petMoved = false;

    canvas.onpointerdown = (e) => {
      e.stopPropagation();
      isDownOnPet = true;
      petStartX = e.screenX;
      petStartY = e.screenY;
      petMoved = false;
      canvas.classList.add("grabbing");
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    };

    canvas.onpointermove = (e) => {
      if (e.buttons === 0 && engine.isDangling) {
        engine.endDangle();
        isDownOnPet = false;
        canvas.classList.remove("grabbing");
        return;
      }
      if (isDownOnPet) {
        if (Math.hypot(e.screenX - petStartX, e.screenY - petStartY) > 4) {
          if (!petMoved) {
            petMoved = true;
            // 奶油法斗改为原生逐帧奔跑，其他宠物保留原有悬空动作。
            engine.startDangle();
          }
          if (engine.equipped.petId === launchDefaultPetId && Math.abs(e.movementX) > 0.5) {
            engine.facing = e.movementX > 0 ? 1 : -1;
          }
          if (isTauriRuntime() && petDock.classList.contains("mini")) {
            startTauriDrag();
          }
        }
      }
    };

    canvas.onpointerup = (e) => {
      e.stopPropagation();
      canvas.classList.remove("grabbing");
      try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
      if (isDownOnPet) {
        if (petMoved) {
          // 放在桌面落地 (Land!)
          engine.endDangle();
        } else {
          // 单击互动 (Jump + Hearts / Stretch / Roam)
          triggerPetInteraction();
        }
      }
      isDownOnPet = false;
    };

    canvas.onpointercancel = (e) => {
      canvas.classList.remove("grabbing");
      if (isDownOnPet && petMoved) {
        engine.endDangle();
      }
      isDownOnPet = false;
    };

    // 全局兜底：鼠标松开或窗口失焦时，立刻稳稳着地，杜绝卡在悬空状态
    window.addEventListener("pointerup", () => {
      if (engine.isDangling || isDownOnPet) {
        engine.endDangle();
        isDownOnPet = false;
        canvas.classList.remove("grabbing");
      }
    });
    window.addEventListener("mouseup", () => {
      if (engine.isDangling || isDownOnPet) {
        engine.endDangle();
        isDownOnPet = false;
        canvas.classList.remove("grabbing");
      }
    });
    window.addEventListener("blur", () => {
      if (engine.isDangling || isDownOnPet) {
        engine.endDangle();
        isDownOnPet = false;
        canvas.classList.remove("grabbing");
      }
    });

    let frame = 0;
    function loop() {
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const isFocusing = engine.state === "focusing";
      const eyeBlink = frame % 240 > 230;
      const sipping = isFocusing && (frame % 480 > 440);
      const cx = Math.round(w / 2);

      const { PET_ARCHETYPES } = window.FocusConstants || {};
      const activePet = (PET_ARCHETYPES && PET_ARCHETYPES[engine.equipped.petId]) || (PET_ARCHETYPES && PET_ARCHETYPES.cat_white);
      if (activePet) {
        // 场景家具、接触阴影和像素帧共用地面基线。宠物根节点仅补回
        // 透明帧底部的一小格，因此脚掌不会再悬在家具或地面上方。
        const sceneCy = Math.round(h - 30);
        const petCy = sceneCy + engine.getPetFootInset(activePet.id);
        const isCatAboveDesk = engine.onDesk || engine.isClimbing || engine.petY < -12;
        const isCatOnTree = engine.onCatTree || engine.isClimbingCatTree;
        const isSkeletonActive = canUseSkeleton &&
          skeletonCanvas.dataset.rendererFailed !== "true" &&
          window.activePetSkeletonEngine;
        if (isSkeletonActive) {
          // 推进一次原工位状态机，再将动作/位置交给骨骼动画混合器。
          engine.updateAction();
          engine.drawRoomFurniture(ctx, cx, sceneCy, isFocusing, sipping, isCatAboveDesk, isCatOnTree);
          engine.drawPetContactShadow(ctx, cx, sceneCy);
          window.activePetSkeletonEngine.setPetVariant(activePet.id);
          window.activePetSkeletonEngine.syncFromCompanionState(engine);
        } else if (isCatAboveDesk || isCatOnTree) {
          engine.drawRoomFurniture(ctx, cx, sceneCy, isFocusing, sipping, isCatAboveDesk, isCatOnTree);
          engine.drawPetContactShadow(ctx, cx, sceneCy);
          if (engine.drawPixelCompanionFrames(ctx, cx, petCy, activePet, eyeBlink) && rabbitImg) rabbitImg.style.display = "none";
        } else {
          engine.drawRoomFurniture(ctx, cx, sceneCy, isFocusing, sipping, isCatAboveDesk, isCatOnTree);
          engine.drawPetContactShadow(ctx, cx, sceneCy);
          if (engine.drawPixelCompanionFrames(ctx, cx, petCy, activePet, eyeBlink) && rabbitImg) rabbitImg.style.display = "none";
        }
      }

      floatingPetAnimId = requestAnimationFrame(loop);
    }

    if (floatingPetAnimId) cancelAnimationFrame(floatingPetAnimId);
    floatingPetAnimId = requestAnimationFrame(loop);
  }

  function initFocusModule() {
    const engine = ensureFocusEngine();
    if (!engine) return;

    const canvas = document.querySelector("#focusStageCanvas");
    if (canvas) {
      engine.bindStageCanvas(canvas);
      canvas.oncontextmenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        showFloatingContextMenu(e.clientX, e.clientY);
      };
    }

    if (focusInitialized) {
      renderWardrobePanel();
      renderShopPanel();
      renderAlbumPanel();
      renderTrashPanel();
      return;
    }
    focusInitialized = true;

    // 1. 专注时长按钮切换
    const chips = document.querySelectorAll("#durationChips .duration-chip");
    chips.forEach((chip) => {
      chip.onclick = () => {
        if (engine.state === "focusing") return;
        chips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        const minutes = parseInt(chip.dataset.duration) || 25;
        engine.setDuration(minutes);
        setBubble(`☕ 已设置伴读专注时长：${minutes} 分钟`);
      };
    });

    // 2. 白噪音选择器与静音切换
    const soundSelect = document.querySelector("#ambientSoundSelect");
    if (soundSelect) {
      soundSelect.value = engine.catAudio.ambientType;
      soundSelect.onchange = () => {
        soundSelect.value = engine.setAmbientType(soundSelect.value);
        setBubble("环境底噪已关闭；等你选好真实雨声或壁炉录音后再加入。");
      };
    }
    const muteBtn = document.querySelector("#focusMuteBtn");
    if (muteBtn) {
      muteBtn.textContent = engine.catAudio.isMuted ? "🔇" : "🔊";
      muteBtn.classList.toggle("muted", engine.catAudio.isMuted);
      muteBtn.onclick = () => {
        const muted = engine.toggleMute();
        muteBtn.textContent = muted ? "🔇" : "🔊";
        muteBtn.classList.toggle("muted", muted);
      };
    }

    const audioSlot = document.querySelector("#focusAudioSlot");
    const audioImportBtn = document.querySelector("#focusAudioImportBtn");
    if (audioImportBtn) {
      audioImportBtn.onclick = async () => {
        if (!isTauriRuntime()) {
          setBubble("音效导入需要在已安装的 Lumpa 桌面版中进行。");
          return;
        }
        try {
          const { open } = await import("@tauri-apps/plugin-dialog");
          const selected = await open({
            multiple: true,
            filters: [{ name: "宠物音效", extensions: ["wav", "mp3", "ogg", "m4a"] }],
          });
          if (!selected) return;
          const sources = Array.isArray(selected) ? selected : [selected];
          const result = await invokeTauri("import_custom_audio", {
            sources,
            slot: audioSlot?.value || "cat.gentle",
          });
          const names = result?.imported || [];
          setBubble(names.length ? `🎵 已导入 ${names.length} 条真实宠物音效：${names.join("、")}` : "没有导入新的音效。");
        } catch (error) {
          setBubble(`音效导入失败：${String(error?.message || error)}`);
        }
      };
    }

    // 2.5 工位场景布置切换器 (Scene Switcher Bar)
    const sceneChips = document.querySelectorAll("#focusSceneChips .scene-chip");
    const activeScene = engine.currentFurnitureScene || "desk";
    sceneChips.forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.scene === activeScene);
      chip.onclick = () => {
        const targetScene = chip.dataset.scene;
        sceneChips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        engine.setFurnitureScene(targetScene);
        const sceneNames = {
          desk: "🖥️ 工位小书桌",
          cattree: "🌳 猫爬架台子",
          bed: "🛏️ 温馨猫窝",
          clean: "🍃 极简纯净桌面"
        };
        setBubble(`场景已切换为：${sceneNames[targetScene] || targetScene}`);
      };
    });
    engine.onSceneChanged = (scene) => {
      sceneChips.forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.scene === scene);
      });
    };

    // 3. 开始 / 放弃伴读按钮
    const startBtn = document.querySelector("#focusStartBtn");
    const abandonBtn = document.querySelector("#focusAbandonBtn");
    const statusTag = document.querySelector("#focusStatusTag");

    if (startBtn) {
      startBtn.onclick = () => {
        engine.startFocus();
        renderFocusTodoSummary();
      };
    }
    if (abandonBtn) {
      abandonBtn.onclick = () => {
        engine.abandonFocus();
      };
    }

    // 3.5 动作指令 Demo 按钮绑定 (Game Actions Demo Buttons)
    const btnClimb = document.querySelector("#demoBtnClimb");
    const btnLieDesk = document.querySelector("#demoBtnLieDesk");
    const btnCatTree = document.querySelector("#demoBtnCatTree");
    const btnStretch = document.querySelector("#demoBtnStretch");
    const btnWalk = document.querySelector("#demoBtnWalk");
    const btnLook = document.querySelector("#demoBtnLook");
    const btnWash = document.querySelector("#demoBtnWash");
    const btnPounce = document.querySelector("#demoBtnPounce");
    const btnRoll = document.querySelector("#demoBtnRoll");
    const btnJumpDown = document.querySelector("#demoBtnJumpDown");
    const btnNap = document.querySelector("#demoBtnNap");
    const btnAuto = document.querySelector("#demoBtnAuto");

    if (btnClimb) {
      btnClimb.onclick = () => {
        engine.triggerClimbDesk();
      };
    }
    if (btnLieDesk) {
      btnLieDesk.onclick = () => {
        engine.triggerLieDesk();
      };
    }
    if (btnCatTree) {
      btnCatTree.onclick = () => {
        engine.triggerClimbCatTree();
      };
    }
    if (btnStretch) {
      btnStretch.onclick = () => {
        engine.triggerCatStretch();
      };
    }
    if (btnWalk) {
      btnWalk.onclick = () => {
        engine.triggerWalkRoam();
      };
    }
    if (btnLook) {
      btnLook.onclick = () => {
        engine.triggerLookAround();
      };
    }
    if (btnWash) {
      btnWash.onclick = () => {
        engine.triggerWashFace();
      };
    }
    if (btnPounce) {
      btnPounce.onclick = () => {
        engine.triggerPounceWiggle();
      };
    }
    if (btnRoll) {
      btnRoll.onclick = () => {
        engine.triggerRollPlay();
      };
    }
    if (btnJumpDown) {
      btnJumpDown.onclick = () => {
        engine.triggerJumpDown();
      };
    }
    if (btnNap) {
      btnNap.onclick = () => {
        engine.triggerLoafNap();
      };
    }
    if (btnAuto) {
      btnAuto.onclick = () => {
        const enabled = engine.toggleAutoLife();
        btnAuto.textContent = enabled ? "🤖 自主生活: 开" : "⏸️ 自主生活: 关";
        btnAuto.classList.toggle("toggle-active", enabled);
      };
    }

    // 4. 状态变化回调
    engine.onStateChanged = (state) => {
      if (state === "focusing") {
        if (startBtn) startBtn.classList.add("hidden");
        if (abandonBtn) abandonBtn.classList.remove("hidden");
        if (statusTag) statusTag.textContent = "全神贯注伴读中...";
        setBubble("☕ 小木桌已为你支好，推推小金丝镜，我们开始沉浸专注吧～");
      } else {
        if (startBtn) startBtn.classList.remove("hidden");
        if (abandonBtn) abandonBtn.classList.add("hidden");
        if (statusTag) statusTag.textContent = "等待入座陪读";
      }
    };

    // 5. 专注完成与中途放弃弹窗回调
    engine.onCompleted = (result) => {
      const modal = document.querySelector("#focusSuccessModal");
      const icon = document.querySelector("#successGiftIcon");
      const name = document.querySelector("#successGiftName");
      const rarity = document.querySelector("#successGiftRarity");
      const quote = document.querySelector("#successGiftQuote");
      const taskCount = result.completedTodoCount || 0;
      const growth = result.growth;

      if (icon) icon.textContent = taskCount > 0 ? "🌱🎁" : "🌱";
      if (name) name.textContent = taskCount > 0 ? "猫咪长大一点，任务奖励也已到账" : "猫咪认真陪完，长大了一点";
      if (rarity) {
        rarity.textContent = taskCount > 0 ? `本轮完成 ${taskCount} 项待办` : "本轮没有完成待办，因此不发任务礼物";
        rarity.className = `polaroid-rarity ${taskCount > 0 ? "rare" : "common"}`;
      }
      if (quote) {
        const nextText = growth.nextAt
          ? `再完成 ${growth.nextAt - growth.completedPomodoros} 次番茄进入下一阶段。`
          : "已经长成会一直陪着你的成年伙伴。";
        quote.textContent = `“当前是${growth.stage}，累计完成 ${growth.completedPomodoros} 次番茄。${nextText}”`;
      }

      if (modal) modal.classList.remove("hidden");
      setBubble(taskCount > 0
        ? `🎉 时间和任务都有完成：猫咪长大，${taskCount} 份任务奖励已在背包！`
        : "🌱 番茄时间完成：猫咪长大一点；任务未完成，本轮不发礼物。");
      renderShopPanel();
      renderAlbumPanel();
      renderWardrobePanel();
      renderFloatingTodoList();
    };

    engine.onInterrupted = (trash) => {
      const modal = document.querySelector("#focusAbandonModal");
      const icon = document.querySelector("#abandonTrashIcon");
      const name = document.querySelector("#abandonTrashName");
      const quote = document.querySelector("#abandonTrashQuote");

      if (icon) icon.textContent = trash.icon;
      if (name) name.textContent = trash.name;
      if (quote) quote.textContent = `“${trash.quote}” 这件残留物已有 ${trash.count} 个，垃圾堆累计 ${trash.total} 件。`;

      if (modal) modal.classList.remove("hidden");
      setBubble(`😿 计时提前结束，【${trash.name}】已掉进垃圾堆（累计 ${trash.total} 件）。`);
      renderTrashPanel();
    };

    // 6. 实时切屏与头顶字幕弹窗响应
    let bubbleTimer = null;
    engine.onSubtitleTrigger = (quote, mood) => {
      showFloatingSubtitle(quote);
      const bubble = document.querySelector("#focusBubble");
      if (bubble) {
        bubble.textContent = quote;
        bubble.classList.remove("hidden");
        if (bubbleTimer) clearTimeout(bubbleTimer);
        bubbleTimer = setTimeout(() => bubble.classList.add("hidden"), 5000);
      }
    };
    engine.onGentleDistraction = (quote) => {
      engine.onSubtitleTrigger(quote, "alert");
    };

    renderFocusTodoSummary();

    // 7. 弹窗确认按钮
    const successConfirmBtn = document.querySelector("#successConfirmBtn");
    if (successConfirmBtn) {
      successConfirmBtn.onclick = () => {
        document.querySelector("#focusSuccessModal")?.classList.add("hidden");
        engine.resetToIdle();
      };
    }
    const abandonConfirmBtn = document.querySelector("#abandonConfirmBtn");
    if (abandonConfirmBtn) {
      abandonConfirmBtn.onclick = () => {
        document.querySelector("#focusAbandonModal")?.classList.add("hidden");
        engine.resetToIdle();
      };
    }

    // 8. 侧边栏子切页（宠物图鉴 / 兑换所 / 礼物图鉴 / 中断垃圾堆）切换
    const subtabs = document.querySelectorAll(".focus-subtab");
    subtabs.forEach((tab) => {
      tab.onclick = () => {
        subtabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const target = tab.dataset.focusTab;
        document.querySelectorAll(".focus-panel-view").forEach((panel) => {
          panel.classList.remove("active");
        });
        if (target === "wardrobe") {
          document.querySelector("#focusWardrobePanel")?.classList.add("active");
          renderWardrobePanel();
        } else if (target === "shop") {
          document.querySelector("#focusShopPanel")?.classList.add("active");
          renderShopPanel();
        } else if (target === "album") {
          document.querySelector("#focusAlbumPanel")?.classList.add("active");
          renderAlbumPanel();
        } else if (target === "trash") {
          document.querySelector("#focusTrashPanel")?.classList.add("active");
          renderTrashPanel();
        }
      };
    });

    renderWardrobePanel();
    renderShopPanel();
    renderAlbumPanel();
    renderTrashPanel();
  }

  function renderWardrobePanel() {
    const engine = ensureFocusEngine();
    if (!engine || !window.FocusConstants) return;
    const { PET_ARCHETYPES } = window.FocusConstants;
    const unlockNote = document.querySelector("#petUnlockModeNote");
    if (unlockNote) {
      unlockNote.textContent = engine.allUnlocked
        ? `当前体验阶段已开放全部 ${Object.keys(PET_ARCHETYPES).length} 款宠物模型，可直接选择；礼物兑换记录仍会保留。`
        : "完成任务获得礼物后，可在兑换所解锁新的完整宠物模型。";
    }

    // 1. 渲染同桌宠物选择
    const archetypeGrid = document.querySelector("#petArchetypeGrid");
    if (archetypeGrid) {
      archetypeGrid.innerHTML = "";
      Object.values(PET_ARCHETYPES).forEach((pet) => {
        const isUnlocked = Boolean(engine.unlockedItems[pet.id]);
        const isEquipped = engine.equipped.petId === pet.id;
        const card = document.createElement("div");
        card.className = `pet-archetype-card ${isEquipped ? "equipped" : ""} ${isUnlocked ? "" : "locked"}`;
        
        card.innerHTML = `
          <img class="archetype-avatar-img" src="assets/pixel_companions_${pet.id === launchDefaultPetId ? "v5" : "v3"}/frames/${pet.id}_idle_0.png" alt="${pet.name}" draggable="false">
          <div class="archetype-name">${pet.name}</div>
          <div class="archetype-badge">${isEquipped ? "当前同桌" : (isUnlocked ? "已收录 · 点击入座" : "尚未兑换")}</div>
        `;

        card.onclick = () => {
          if (isUnlocked) {
            engine.equip("pet", pet.id);
            renderWardrobePanel();
            syncFloatingPetCanvas();
            showFloatingSubtitle(`🐾 已换上【${pet.name}】成为桌面伴读同桌～`);
          } else {
            document.querySelector("[data-focus-tab='shop']")?.click();
            setBubble(`🧶【${pet.name}】需要先用任务礼物兑换。`);
          }
        };

        archetypeGrid.appendChild(card);
      });
    }

  }

  function renderShopPanel() {
    const engine = ensureFocusEngine();
    if (!engine || !window.FocusConstants) return;
    const { PET_ARCHETYPES, GIFT_REGISTRY } = window.FocusConstants;
    const unlockNote = document.querySelector("#shopUnlockModeNote");
    if (unlockNote) {
      unlockNote.textContent = engine.allUnlocked
        ? "当前体验阶段全部宠物已开放，无需消耗礼物；正式兑换配方未删除。"
        : "完成任务获得礼物，可在这里兑换新的完整宠物模型。";
    }

    // 1. 背包素材汇总
    const summary = document.querySelector("#shopBackpackSummary");
    if (summary) {
      summary.innerHTML = "";
      const chipsHtml = Object.entries(engine.giftBackpack)
        .filter(([_, count]) => count > 0)
        .map(([id, count]) => {
          const g = GIFT_REGISTRY[id];
          return `<span class="backpack-chip">${g ? g.icon : "🎁"} ${g ? g.name : id} x${count}</span>`;
        })
        .join("");

      summary.innerHTML = chipsHtml ? `<strong>🎒 你的手绘信物背包：</strong> ${chipsHtml}` : "<strong>🎒 信物背包空空如也</strong>，完成专注伴读可获得小动物带来的礼物！";
    }

    // 2. 兑换物品列表
    const goodsList = document.querySelector("#shopGoodsList");
    if (!goodsList) return;
    goodsList.innerHTML = "";

    // A. 未解锁的宠物
    Object.values(PET_ARCHETYPES).forEach((pet) => {
      if (pet.id === "cat_white") return;
      const isOwned = Boolean(engine.unlockedItems[pet.id]);
      const cost = engine.getUnlockCost(pet.id);
      const canBuy = !isOwned && engine.canAfford(cost);

      const card = document.createElement("div");
      card.className = "shop-good-card";
      card.innerHTML = `
        <div class="shop-good-left">
          <div class="shop-good-icon">🐾</div>
          <div class="shop-good-info">
            <div class="shop-good-title">${pet.name} (同桌新萌宠)</div>
            <div class="shop-good-desc">${pet.desc}</div>
            <div class="shop-good-cost">所需信物: ${engine.getUnlockCostText(pet.id)}</div>
          </div>
        </div>
        <button class="shop-buy-btn ${isOwned ? "owned" : ""}" ${isOwned || !canBuy ? "disabled" : ""}>
          ${isOwned ? "已解锁" : (canBuy ? "兑换迎新" : "信物不足")}
        </button>
      `;

      const btn = card.querySelector(".shop-buy-btn");
      if (btn && canBuy && !isOwned) {
        btn.onclick = () => {
          const res = engine.purchaseItem(pet.id, true);
          if (res.success) {
            setBubble(`🎉 恭喜！【${pet.name}】已正式加入你的同桌伴读阵容！`);
            renderShopPanel();
            renderWardrobePanel();
          }
        };
      }
      goodsList.appendChild(card);
    });

  }

  function renderAlbumPanel() {
    const engine = ensureFocusEngine();
    if (!engine || !window.FocusConstants) return;
    const { GIFT_REGISTRY } = window.FocusConstants;

    const countEl = document.querySelector("#albumCollectedCount");
    const hoursEl = document.querySelector("#albumFocusHours");
    const grid = document.querySelector("#albumCardsGrid");

    const uniqueCount = Object.keys(engine.giftBackpack).filter((k) => (engine.giftBackpack[k] || 0) > 0).length;
    if (countEl) countEl.textContent = uniqueCount;
    if (hoursEl) hoursEl.textContent = (engine.stats.totalFocusMinutes / 60).toFixed(1);

    if (!grid) return;
    grid.innerHTML = "";

    Object.values(GIFT_REGISTRY).forEach((gift) => {
      const haveCount = engine.giftBackpack[gift.id] || 0;
      const card = document.createElement("div");
      card.className = "album-card";
      card.innerHTML = `
        <div class="album-card-header">
          <div class="album-card-title">${gift.icon} ${gift.name}</div>
          <span class="album-rarity-badge ${gift.rarity}">${gift.rarityText}</span>
        </div>
        <p class="album-card-quote">“${gift.quote}”</p>
        <div class="album-card-count">${haveCount > 0 ? `已收集: ${haveCount} 件` : "暂未拾得"}</div>
      `;
      grid.appendChild(card);
    });
  }

  function renderTrashPanel() {
    const engine = ensureFocusEngine();
    if (!engine || !window.FocusConstants) return;
    const { TRASH_REGISTRY } = window.FocusConstants;
    const totalEl = document.querySelector("#trashCollectedTotal");
    const kindsEl = document.querySelector("#trashCollectedKinds");
    const pile = document.querySelector("#trashPileVisual");
    const grid = document.querySelector("#trashCardsGrid");
    const total = Object.values(engine.trashBackpack || {})
      .reduce((sum, count) => sum + (Number(count) || 0), 0);
    const kinds = TRASH_REGISTRY.filter(item => (engine.trashBackpack?.[item.id] || 0) > 0).length;

    if (totalEl) totalEl.textContent = total;
    if (kindsEl) kindsEl.textContent = kinds;

    if (pile) {
      pile.innerHTML = "";
      if (total === 0) {
        const empty = document.createElement("div");
        empty.className = "trash-pile-empty";
        empty.textContent = "这里现在干干净净，坚持完成计时吧。";
        pile.appendChild(empty);
      } else {
        const pieces = [];
        TRASH_REGISTRY.forEach((item) => {
          const count = Math.min(10, Number(engine.trashBackpack?.[item.id]) || 0);
          for (let i = 0; i < count; i += 1) pieces.push(item);
        });
        pieces.slice(0, 32).forEach((item, index) => {
          const piece = document.createElement("span");
          piece.className = "trash-pile-piece";
          piece.textContent = item.icon;
          piece.title = item.name;
          const column = index % 9;
          const layer = Math.floor(index / 9);
          piece.style.setProperty("--trash-x", `${8 + column * 10 + ((layer * 3) % 6)}%`);
          piece.style.setProperty("--trash-y", `${8 + layer * 22 + (column % 3) * 3}px`);
          piece.style.setProperty("--trash-r", `${((index * 17) % 34) - 17}deg`);
          pile.appendChild(piece);
        });
      }
    }

    if (!grid) return;
    grid.innerHTML = "";
    TRASH_REGISTRY.forEach((item) => {
      const count = Number(engine.trashBackpack?.[item.id]) || 0;
      const card = document.createElement("div");
      card.className = `trash-card ${count ? "collected" : "uncollected"}`;
      card.innerHTML = `
        <div class="trash-card-icon">${count ? item.icon : "❔"}</div>
        <div class="trash-card-copy">
          <strong>${count ? item.name : "尚未发现"}</strong>
          <span>${count ? `堆叠 ${count} 件` : "完成整段计时，就不会留下它"}</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function setActivePage(page) {
    const targetPage = ["desk", "world", "focus", "library", "usage", "create", "settings"].includes(page) ? page : "desk";
    document.body.dataset.page = targetPage;

    pageTabs.forEach((button) => {
      const active = button.dataset.pageTarget === targetPage;
      button.classList.toggle("active", active);
      button.setAttribute("aria-current", active ? "page" : "false");
    });

    pageViews.forEach((view) => {
      view.classList.toggle("active", view.dataset.pageView === targetPage);
    });

    if (targetPage !== "world" && worldInstance) {
      worldInstance.pause();
    }

    if (targetPage === "world") {
      bindWorldButtonsDirectly();
    }
    if (targetPage === "focus") {
      initFocusModule();
    }
    if (targetPage === "usage") {
      refreshUsageSnapshot();
    }
  }

  function formatUsageDuration(seconds) {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    if (hours > 0) return `${hours} 小时 ${minutes} 分钟`;
    if (minutes > 0) return `${minutes} 分钟`;
    return `${total} 秒`;
  }

  function usageCategoryForApp(item = {}) {
    const haystack = `${item.appName || ""} ${item.executable || ""}`.toLowerCase();
    if (/wechat|微信|qq|telegram|discord|slack|teams/.test(haystack)) {
      return { key: "social", label: "社交通讯", color: "#0f80ff" };
    }
    if (/game|steam|epic|riot|honor|lol|王者|原神|崩坏|minecraft/.test(haystack)) {
      return { key: "game", label: "游戏", color: "#f08a24" };
    }
    if (/code|cursor|pycharm|idea|webstorm|visual studio|terminal|powershell|cmd|git/.test(haystack)) {
      return { key: "tool", label: "实用工具", color: "#b22df0" };
    }
    if (/chrome|edge|firefox|browser|msedge|浏览器/.test(haystack)) {
      return { key: "browser", label: "浏览阅读", color: "#27b7c8" };
    }
    return { key: "other", label: "其他", color: "#9b7cff" };
  }

  function renderUsageCategorySummary(apps = []) {
    if (!usageCategorySummary) return;
    const groups = new Map();
    apps.forEach((item) => {
      const category = usageCategoryForApp(item);
      const previous = groups.get(category.key) || { ...category, seconds: 0 };
      previous.seconds += Number(item.seconds) || 0;
      groups.set(category.key, previous);
    });
    const values = Array.from(groups.values())
      .filter((item) => item.seconds > 0)
      .sort((a, b) => b.seconds - a.seconds)
      .slice(0, 3);
    usageCategorySummary.innerHTML = values
      .map(
        (item) => `
          <article>
            <small style="color:${item.color}">${escapeHtml(item.label)}</small>
            <strong>${formatUsageDuration(item.seconds)}</strong>
          </article>
        `
      )
      .join("");
  }

  function renderUsageChart(snapshot, mode = state.usageMode) {
    if (!usageChart || !usageChartAxis) return;
    const isWeek = mode === "week";
    const buckets = (isWeek ? snapshot.dailyActiveSeconds : snapshot.hourlyActiveSeconds) || [];
    const labels = isWeek
      ? ["一", "二", "三", "四", "五", "六", "日"]
      : Array.from({ length: 24 }, (_, index) => (index % 6 === 0 ? `${index}:00` : ""));
    const normalized = isWeek
      ? Array.from({ length: 7 }, (_, index) => Number(buckets[index]) || 0)
      : Array.from({ length: 24 }, (_, index) => Number(buckets[index]) || 0);
    const maxSeconds = Math.max(...normalized, isWeek ? 24 * 3600 : 3600);
    usageChart.classList.toggle("weekly", isWeek);
    usageChart.innerHTML = normalized
      .map((seconds, index) => {
        const fill = Math.max(seconds > 0 ? 5 : 0, Math.round((seconds / maxSeconds) * 100));
        const colorClass = isWeek && index % 3 === 0 ? "accent" : index % 5 === 0 ? "warm" : "";
        return `<span class="usage-chart-bar ${colorClass}" title="${formatUsageDuration(seconds)}"><i style="height:${fill}%"></i></span>`;
      })
      .join("");
    usageChartAxis.innerHTML = labels.map((label) => `<span>${escapeHtml(label)}</span>`).join("");
  }

  function usageRuleThresholdSeconds(settings = state.settings) {
    const value = Math.max(1, Number(settings.usageSupervisionDuration) || 1);
    return Math.round(value * (settings.usageSupervisionUnit === "hours" ? 3600 : 60));
  }

  function matchingUsageSeconds(snapshot, appName) {
    const query = String(appName || "").trim().toLowerCase();
    if (!query) return 0;
    const apps = Array.isArray(snapshot?.apps) ? snapshot.apps : [];
    const exact = apps.find((item) => {
      const executable = String(item.executable || "").toLowerCase();
      const name = String(item.appName || "").toLowerCase();
      return executable === query || name === query;
    });
    if (exact) return Number(exact.seconds) || 0;
    return apps
      .filter((item) => {
        const executable = String(item.executable || "").toLowerCase();
        const name = String(item.appName || "").toLowerCase();
        return executable.includes(query) || name.includes(query);
      })
      .reduce((sum, item) => sum + (Number(item.seconds) || 0), 0);
  }

  function updateUsageSupervisionLabel(settings = state.settings, usedSeconds = null) {
    if (usageSupervisionEnabledStatus) {
      usageSupervisionEnabledStatus.textContent = settings.usageSupervisionEnabled ? "开启" : "关闭";
    }
    if (!usageSupervisionStatus) return;
    if (!hasPermission("usageStats", settings)) {
      usageSupervisionStatus.textContent = permissionDeniedMessage("usageStats");
      return;
    }
    if (!settings.usageSupervisionEnabled) {
      usageSupervisionStatus.textContent = "尚未启用监督规则。";
      return;
    }
    if (!settings.usageSupervisionApp) {
      usageSupervisionStatus.textContent = "请选择或填写要监督的软件名称。";
      return;
    }
    const operator = settings.usageSupervisionOperator === "under" ? "不超过" : "超过";
    const duration = `${settings.usageSupervisionDuration}${settings.usageSupervisionUnit === "hours" ? "小时" : "分钟"}`;
    const progress = usedSeconds == null ? "" : `，今日已使用 ${formatUsageDuration(usedSeconds)}`;
    usageSupervisionStatus.textContent = `监督 ${settings.usageSupervisionApp}，${operator} ${duration}${progress}。`;
  }

  function evaluateUsageSupervision(snapshot) {
    const settings = state.settings;
    if (!hasPermission("usageStats", settings)) {
      state.usageSupervisionSick = false;
      petDock.classList.remove("pet-sick");
      updateUsageSupervisionLabel(settings);
      return;
    }
    const usedSeconds = matchingUsageSeconds(snapshot, settings.usageSupervisionApp);
    const threshold = usageRuleThresholdSeconds(settings);
    const shouldBeSick =
      settings.usageSupervisionEnabled &&
      Boolean(settings.usageSupervisionApp) &&
      (settings.usageSupervisionOperator === "under" ? usedSeconds < threshold : usedSeconds >= threshold);
    const changed = shouldBeSick !== state.usageSupervisionSick;
    state.usageSupervisionSick = shouldBeSick;
    updateUsageSupervisionLabel(settings, usedSeconds);
    petDock.classList.toggle("pet-sick", shouldBeSick);

    if (shouldBeSick) {
      statusPill.textContent = "需要休息";
      if (activePet()?.assets?.sick) setRabbitFrameSource(activePet().assets.sick);
      else setFrame(0);
      if (changed) {
        const relation = settings.usageSupervisionOperator === "under" ? "还没有达到目标" : "已经超过限制";
        setBubble(`${settings.usageSupervisionApp} 今天${relation}，我有点不舒服了。`);
      }
    } else if (changed) {
      statusPill.textContent = "状态恢复";
      setFrame(0);
      setBubble("监督目标恢复正常，我也精神起来啦。");
    }
  }

  function renderUsageSnapshot(snapshot) {
    if (!snapshot) return;
    state.usageSnapshot = snapshot;
    const apps = Array.isArray(snapshot.apps) ? snapshot.apps : [];
    const current = snapshot.currentApp || {};
    if (usageAppOptions) {
      usageAppOptions.innerHTML = apps
        .map((item) => `<option value="${escapeHtml(item.executable || item.appName || "")}"></option>`)
        .join("");
    }
    evaluateUsageSupervision(snapshot);
    if (focusInstance && current.appName) {
      const category = usageCategoryForApp(current);
      focusInstance.handleAppSwitch(current.appName, category.key);
    }
    if (usageCurrentApp) usageCurrentApp.textContent = current.appName || "未知软件";
    if (usageCurrentExe) usageCurrentExe.textContent = current.executable || "unknown";
    if (usageActiveTime) usageActiveTime.textContent = formatUsageDuration(snapshot.activeSeconds);
    if (usageHeroTime) {
      const heroSeconds =
        state.usageMode === "week"
          ? (snapshot.dailyActiveSeconds || []).reduce((sum, value) => sum + (Number(value) || 0), 0)
          : Number(snapshot.activeSeconds) || 0;
      usageHeroTime.textContent = formatUsageDuration(heroSeconds);
    }
    if (usageDeltaText) {
      usageDeltaText.textContent =
        state.usageMode === "week"
          ? "本周累计前台使用时长"
          : `今天已记录 ${apps.length} 个前台应用`;
    }
    renderUsageChart(snapshot, state.usageMode);
    renderUsageCategorySummary(apps);
    if (usageIdleTime) usageIdleTime.textContent = formatUsageDuration(snapshot.idleSeconds);
    if (usageIdleNow) usageIdleNow.textContent = `当前空闲 ${formatUsageDuration(snapshot.currentIdleSeconds)}`;

    if (!usageAppList) return;
    if (!apps.length) {
      usageAppList.innerHTML = '<p class="usage-empty">还没有统计到软件使用时长。</p>';
      return;
    }

    const maxSeconds = Math.max(...apps.map((item) => Number(item.seconds) || 0), 1);
    usageAppList.innerHTML = apps
      .slice(0, 12)
      .map((item) => {
        const seconds = Number(item.seconds) || 0;
        const width = Math.max(4, Math.round((seconds / maxSeconds) * 100));
        const name = escapeHtml(item.appName || item.executable || "未知软件");
        const executable = escapeHtml(item.executable || "");
        const category = usageCategoryForApp(item);
        return `
          <article class="usage-row">
            <span class="usage-row-icon" style="--category-color:${category.color}">${escapeHtml(category.label.slice(0, 1))}</span>
            <div class="usage-row-main">
              <strong>${name}</strong>
              <span>${executable}</span>
            </div>
            <div class="usage-row-meter" aria-hidden="true"><i style="width:${width}%"></i></div>
            <time>${formatUsageDuration(seconds)}</time>
          </article>
        `;
      })
      .join("");
  }

  async function refreshUsageSnapshot() {
    if (!usageAppList) return;
    if (!hasPermission("usageStats")) {
      const message = permissionDeniedMessage("usageStats");
      state.usageSnapshot = null;
      usageAppList.innerHTML = `<p class="usage-empty">${escapeHtml(message)}</p>`;
      if (usageHeroTime) usageHeroTime.textContent = "未开启";
      if (usageDeltaText) usageDeltaText.textContent = "开启「使用统计」权限后才会读取前台软件时长。";
      if (usageChart) usageChart.innerHTML = "";
      if (usageChartAxis) usageChartAxis.innerHTML = "";
      if (usageCategorySummary) usageCategorySummary.innerHTML = "";
      return;
    }
    if (!isTauriRuntime()) {
      usageAppList.innerHTML = '<p class="usage-empty">使用统计需要在 Tauri 桌面 App 里运行。</p>';
      return;
    }

    try {
      const snapshot = await invokeTauri("get_usage_snapshot");
      renderUsageSnapshot(snapshot);
    } catch (error) {
      usageAppList.innerHTML = `<p class="usage-empty">统计读取失败：${escapeHtml(error?.message || String(error))}</p>`;
    }
  }

  let lastActiveAppIdentifier = "";
  async function pollForegroundWindowSwitch() {
    if (!isTauriRuntime()) return;
    try {
      const current = await invokeTauri("get_active_foreground_window");
      if (!current) return;
      const exe = (current.executable || "").toLowerCase();
      const rawName = current.appName || current.app_name || current.executable || "";
      const title = current.title || "";

      // 如果当前是处于 Lumpa 自身窗口，记录当前在 Lumpa
      if (!rawName || exe.includes("rabbit") || exe.includes("lumpa") || rawName.toLowerCase() === "lumpa") {
        lastActiveAppIdentifier = "Lumpa";
        return;
      }

      const windowKey = `${rawName}::${title}`;

      if (windowKey !== lastActiveAppIdentifier) {
        lastActiveAppIdentifier = windowKey;
        const engine = ensureFocusEngine();
        // 还没开始入座伴读时，保持安静，绝不发出声音打扰用户
        if (engine && engine.state === "focusing") {
          const category = usageCategoryForApp({ appName: rawName, executable: current.executable });
          engine.handleAppSwitch(rawName, category?.key || "other", title);
        }
      }
    } catch (e) {}
  }

  function isTauriRuntime() {
    return Boolean(window.__TAURI_INTERNALS__);
  }

  function invokeTauri(command, args = {}) {
    if (!isTauriRuntime()) return Promise.reject(new Error("此功能需要在 Lumpa 桌面应用中运行。"));
    return import("@tauri-apps/api/core").then(({ invoke }) => invoke(command, args));
  }

  function persistFloatingPreference(enabled) {
    state.settings = { ...readSettingsForm(), floatingMode: enabled };
    writePersistentDocument(settingsStorageKey, state.settings);
  }

  function syncFloatingControls(enabled) {
    miniToggle.textContent = enabled ? "展开" : "浮窗";
    floatingSwitch.checked = enabled;
    floatingStatus.textContent = enabled ? "开启" : "关闭";
    floatingTools.setAttribute("aria-hidden", enabled ? "false" : "true");
    if (!enabled) {
      floatingComposer.classList.add("hidden");
    }
  }

  function toggleFloatingComposer(forceOpen) {
    const nextOpen =
      typeof forceOpen === "boolean" ? forceOpen : floatingComposer.classList.contains("hidden");
    floatingComposer.classList.toggle("hidden", !nextOpen);

    if (nextOpen) {
      window.setTimeout(() => floatingInput.focus(), 0);
    }
  }

  function syncTauriWindowMode(enabled) {
    if (!isTauriRuntime()) return Promise.resolve(null);

    return invokeTauri("set_window_mode", { mode: enabled ? "floating" : "normal" })
      .then(() => syncTauriDesktopOptions(readSettingsForm(), { applyPosition: enabled }))
      .catch((error) => {
        console.warn("Tauri window mode failed:", error);
      });
  }

  async function syncTauriStartMode() {
    if (!isTauriRuntime()) return;

    try {
      const mode = await invokeTauri("get_start_mode");
      if (mode === "floating") {
        setDockMode("mini", { persist: true });
      }
    } catch (error) {
      console.warn("Tauri start mode failed:", error);
    }
  }

  async function syncServerStartMode() {
    return syncTauriStartMode();
  }

  function startTauriDrag() {
    if (!isTauriRuntime()) return;
    if (readSettingsForm().positionLocked) {
      setBubble("位置已锁定，先在浮窗上点“解”或去设置里关闭锁定。");
      return;
    }

    invokeTauri("start_window_drag").catch((error) => {
      console.warn("Tauri drag failed:", error);
    });
  }

  function scheduleSnapAfterDrag() {
    if (!isTauriRuntime()) return;
    const settings = readSettingsForm();
    if (settings.desktopGravity !== "snap-edge") return;

    window.setTimeout(() => {
      syncTauriDesktopOptions(readSettingsForm(), { applyPosition: true });
    }, 900);
  }

  function closeFloatingWindow() {
    if (isTauriRuntime()) {
      invokeTauri("close_window").catch((error) => {
        console.warn("Tauri close failed:", error);
      });
      return;
    }

    setDockMode("normal", { persist: true });
  }

  function triggerDesktopProtocol() {
    const link = document.createElement("a");
    link.href = desktopDeepLink;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function requestDesktopLaunch() {
    if (!isTauriRuntime()) return null;
    await invokeTauri("set_window_mode", { mode: "floating" });
    return { launched: true };
  }

  async function openDesktopFloating() {
    setBubble("正在打开桌面浮窗。浏览器如果询问，选择打开 Lumpa。");
    statusPill.textContent = "打开桌面";

    try {
      const launch = await requestDesktopLaunch();
      if (launch?.launched) {
        setBubble("正在启动桌面浮窗，稍等几秒就会自己弹出来。");
        return;
      }
    } catch (error) {
      console.warn("Desktop launch API failed:", error);
    }

    triggerDesktopProtocol();
  }

  function setDockMode(mode, options = {}) {
    const compact = mode === "compact";
    const mini = mode === "mini";

    if (mini) {
      setActivePage("desk");
    }

    document.documentElement.classList.toggle("floating-shell", mini);
    document.body.classList.toggle("floating-shell", mini);
    petDock.classList.toggle("compact", compact);
    petDock.classList.toggle("mini", mini);
    chatPanel.classList.toggle("hidden", compact || mini);
    syncFloatingControls(mini);
    compactToggle.setAttribute("aria-label", mini ? "展开桌宠" : "切换桌宠模式");
    resetDockPosition();
    syncTauriWindowMode(mini);
    applyVisualSettings(readSettingsForm());
    if (options.persist) {
      persistFloatingPreference(mini);
    }
  }

  function stopAllVoice() {
    window.clearInterval(state.syntheticTimer);
    window.clearTimeout(state.syntheticStopTimer);
    window.cancelAnimationFrame(state.audioFrame);
    if (state.audio) {
      state.audio.pause();
      state.audio.currentTime = 0;
    }
    if (state.audioObjectUrl) {
      URL.revokeObjectURL(state.audioObjectUrl);
      state.audioObjectUrl = "";
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false, "待机");
  }

  function mouthFrameFromEnergy(energy) {
    if (energy < 0.035) return 0;
    if (energy < 0.16) return 1;
    return 2;
  }

  function ensureAudioPipeline() {
    if (!state.audio) {
      state.audio = new Audio();
      state.audio.crossOrigin = "anonymous";
    }

    if (!state.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      state.audioContext = new AudioContext();
      state.analyser = state.audioContext.createAnalyser();
      state.analyser.fftSize = 512;
      state.frequencyData = new Uint8Array(state.analyser.frequencyBinCount);
      state.sourceNode = state.audioContext.createMediaElementSource(state.audio);
      state.sourceNode.connect(state.analyser);
      state.analyser.connect(state.audioContext.destination);
    }
  }

  function animateAudioMouth() {
    if (!state.audio || state.audio.paused || state.audio.ended) return;

    state.analyser.getByteFrequencyData(state.frequencyData);
    resetDockPosition();
    syncTauriWindowMode(mini);
    applyVisualSettings(readSettingsForm());
    if (options.persist) {
      persistFloatingPreference(mini);
    }
  }

  function stopAllVoice() {
    window.clearInterval(state.syntheticTimer);
    window.clearTimeout(state.syntheticStopTimer);
    window.cancelAnimationFrame(state.audioFrame);
    if (state.audio) {
      state.audio.pause();
      state.audio.currentTime = 0;
    }
    if (state.audioObjectUrl) {
      URL.revokeObjectURL(state.audioObjectUrl);
      state.audioObjectUrl = "";
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false, "待机");
  }

  function mouthFrameFromEnergy(energy) {
    if (energy < 0.035) return 0;
    if (energy < 0.16) return 1;
    return 2;
  }

  function ensureAudioPipeline() {
    if (!state.audio) {
      state.audio = new Audio();
      state.audio.crossOrigin = "anonymous";
    }

    if (!state.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      state.audioContext = new AudioContext();
      state.analyser = state.audioContext.createAnalyser();
      state.analyser.fftSize = 512;
      state.frequencyData = new Uint8Array(state.analyser.frequencyBinCount);
      state.sourceNode = state.audioContext.createMediaElementSource(state.audio);
      state.sourceNode.connect(state.analyser);
      state.analyser.connect(state.audioContext.destination);
    }
  }

  function animateAudioMouth() {
    if (!state.audio || state.audio.paused || state.audio.ended) return;

    state.analyser.getByteFrequencyData(state.frequencyData);

    let sum = 0;
    const usableBins = Math.min(96, state.frequencyData.length);
    for (let i = 4; i < usableBins; i += 1) {
      sum += state.frequencyData[i];
    }
    const energy = sum / usableBins / 255;
    setFrame(mouthFrameFromEnergy(energy));
    state.audioFrame = window.requestAnimationFrame(animateAudioMouth);
  }

  async function playAudioUrl(url, label, bubbleText, revokeWhenDone) {
    stopAllVoice();
    ensureAudioPipeline();

    if (revokeWhenDone) state.audioObjectUrl = url;

    state.audio.src = url;
    await state.audioContext.resume();
    setSpeaking(true, label || "语音");
    if (bubbleText) setBubble(bubbleText);

    state.audio.onended = () => {
      if (revokeWhenDone && state.audioObjectUrl === url) {
        URL.revokeObjectURL(state.audioObjectUrl);
        state.audioObjectUrl = "";
      }
      setSpeaking(false, "待机");
    };

    await state.audio.play();
    animateAudioMouth();
  }

  async function requestTtsAudio(text) {
    ensurePermission("ttsNetwork");
    const stoppedMessage = stoppedCapabilityMessage("tts");
    if (stoppedMessage) {
      const error = new Error(stoppedMessage);
      error.capability = "tts";
      error.stopped = true;
      throw error;
    }

    if (isTauriRuntime()) {
      const settings = readSettingsForm();
      try {
        const providerId = await ensureModelProvider("tts", {
          apiBase: settings.ttsApiBase || settings.apiBase,
          apiKey: settings.ttsApiKey || settings.apiKey,
          model: settings.ttsModel,
        });
        const data = await invokeTauri("model_tts", {
          payload: {
            providerId,
            voice: settings.ttsVoice,
            text,
            speed: settings.ttsSpeed,
          },
        });
        const contentType = data?.contentType || "audio/mpeg";
        const audioBase64 = data?.audioBase64 || "";
        if (!audioBase64) throw new Error("语音接口没有返回音频。");
        return dataUrlToBlob(`data:${contentType};base64,${audioBase64}`);
      } catch (error) {
        throw normalizeModelCommandError(error, "语音模型调用失败。");
      }
    }

    throw new Error("语音功能仅允许通过 Lumpa 桌面端的受限 Rust 命令调用。");
  }

  function startSyntheticLipSync(text) {
    stopAllVoice();
    setSpeaking(true, "说话");

    const chars = Array.from(text || "桌宠正在说话");
    let cursor = 0;
    state.syntheticTimer = window.setInterval(() => {
      const code = chars[cursor % chars.length]?.charCodeAt(0) || 2;
      const rhythm = (Math.sin(cursor * 1.7) + 1) / 2;
      const energy = ((code % 10) / 10) * 0.38 + rhythm * 0.35;
      setFrame(mouthFrameFromEnergy(energy));
      cursor += 1;
    }, 92);

    const duration = Math.min(9000, Math.max(1400, chars.length * 145));
    state.syntheticStopTimer = window.setTimeout(() => {
      window.clearInterval(state.syntheticTimer);
      setSpeaking(false, "待机");
    }, duration);
  }

  function speakWithBrowserVoice(text) {
    setBubble(text);
    startSyntheticLipSync(text);

    if (!("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 1.05;
    utterance.pitch = 1.18;
    utterance.volume = 1;
    utterance.onend = () => {
      window.clearInterval(state.syntheticTimer);
      window.clearTimeout(state.syntheticStopTimer);
      setSpeaking(false, "待机");
    };
    utterance.onerror = () => {
      window.clearInterval(state.syntheticTimer);
      window.clearTimeout(state.syntheticStopTimer);
      setSpeaking(false, "待机");
    };
    window.speechSynthesis.speak(utterance);
  }

  async function speakText(text) {
    setBubble(text);
    statusPill.textContent = "合成中";

    try {
      const audioBlob = await requestTtsAudio(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      await playAudioUrl(audioUrl, "语音", text, true);
    } catch (error) {
      if (error.permissionDenied) {
        setBubble(error.message);
        statusPill.textContent = "权限关闭";
        return;
      }
      if (error.stopped || error.quotaStopped || error.capability === "tts") {
        markModelStop("tts", error.message || quotaStopMessage("tts"));
        return;
      }
      console.warn("TTS fallback:", error);
      speakWithBrowserVoice(text);
    }
  }

  function buildLocalReply(input) {
    const text = input.trim();
    if (!text) return "我在。你说一句，我就认真听。";

    if (/喝水|水|提醒/.test(text)) {
      return "先喝一口水吧。然后我们把事情拆小，一步一步来。";
    }

    if (/鼓励|累|压力|焦虑|难/.test(text)) {
      return "你已经开始往前走了，这很重要。今天先完成一个最小动作，我会在旁边陪着你。";
    }

    if (/你好|打招呼|hello|hi/i.test(text)) {
      return "你好呀，我是你的 Lumpa 桌宠。今天我负责可爱，也负责认真听你说话。";
    }

    const replies = [
      `我听到啦：${text}。这件事我们可以先抓最小的一步。`,
      "嗯嗯，我记下了。你想让我轻松一点，还是认真一点地陪你聊？",
      "这句话很适合交给大模型继续想。等 API 接上后，我就能更聪明地回答你。",
      "收到。现在这版先把嘴型、语音和桌宠互动跑通，后面再继续变聪明。",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  async function requestApiReply(input) {
    ensurePermission("chatNetwork");
    const stoppedMessage = stoppedCapabilityMessage("chat");
    if (stoppedMessage) {
      const error = new Error(stoppedMessage);
      error.capability = "chat";
      error.stopped = true;
      throw error;
    }

    const history = activeChatHistory()
      .slice(-10, -1)
      .map((item) => ({
        role: item.role === "user" ? "user" : "assistant",
        content: item.text,
      }));
    const options = apiOptions();
    const pet = activePet();
    const messages = [
      { role: "system", content: buildSystemPromptWithMemory(options.persona, options.memory, pet) },
      ...history,
      { role: "user", content: input },
    ];

    return requestOpenAiCompatibleChat({
      messages,
      temperature: 0.8,
      maxTokens: 180,
    });
  }

  async function requestPersonaDistill(source) {
    ensurePermission("chatNetwork");
    const stoppedMessage = stoppedCapabilityMessage("chat");
    if (stoppedMessage) {
      const error = new Error(stoppedMessage);
      error.capability = "chat";
      error.stopped = true;
      throw error;
    }

    const messages = [
      {
        role: "system",
        content:
          "你是桌宠人格蒸馏器。你的任务不是复制人物，也不是堆语气模仿，而是提炼此人的可运行思维框架：心智模型、决策启发式、表达风格、价值观、反模式和边界。输出必须是一段可直接放进 system prompt 的中文桌宠人格设定，只输出设定文本，不要解释。",
      },
      {
        role: "user",
        content: [
          "请把下面的人物名、角色名、资料或语录蒸馏成一只动漫风桌宠的人格 Skill。",
          "",
          "蒸馏规则：",
          "1. 提炼 HOW they think，不要复述 WHAT they said。",
          "2. 保留人格风格，但避免冒充真实人物本人。",
          "3. 输出适合桌宠短回复、语音朗读和日常陪伴。",
          "4. 包含回复长度、语气、边界和行动风格。",
          "",
          "资料：",
          source,
        ].join("\n"),
      },
    ];

    return requestOpenAiCompatibleChat({
      temperature: 0.55,
      maxTokens: 520,
      messages,
    });
  }

  async function handleChatSubmit(text) {
    const value = text.trim();
    if (!value) return;
    addMessage(value, "user");
    queueMemoryCandidate(value);
    chatInput.value = "";

    setBubble("我想一下。");
    statusPill.textContent = "思考中";

    let reply;
    try {
      reply = await requestApiReply(value);
    } catch (error) {
      if (error.permissionDenied) {
        const message = error.message;
        addMessage(message, "pet");
        setBubble(message);
        statusPill.textContent = "权限关闭";
        return;
      }
      if (error.stopped || error.quotaStopped || error.capability === "chat") {
        const message = error.message || quotaStopMessage("chat");
        markModelStop("chat", message);
        addMessage(message, "pet");
        return;
      }
      reply = buildLocalReply(value);
    }

    addMessage(reply, "pet");
    speakText(reply);
  }

  function exportActiveChatHistory() {
    const pet = activePet();
    const history = activeChatHistory();
    if (!history.length) {
      setBubble("现在还没有聊天记录可以导出。");
      return;
    }

    const lines = [
      `${pet.name} 聊天记录`,
      `导出时间：${new Date().toLocaleString("zh-CN")}`,
      "",
      ...history.map((item) => {
        const role = item.role === "user" ? "你" : pet.name;
        return `[${new Date(item.createdAt).toLocaleString("zh-CN")}] ${role}：${item.text}`;
      }),
      "",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const datePart = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const safeName = pet.name.replace(/[\\/:*?"<>|]/g, "_") || "desk-pet";
    link.href = url;
    link.download = `${safeName}-chat-${datePart}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setBubble("聊天记录已导出。");
  }

  function clearActiveChatHistory() {
    const pet = activePet();
    state.chatHistory[pet.id] = [];
    persistChatHistory();
    renderChatHistory();
    setBubble(`${pet.name} 的聊天记录已清空。`);
  }

  async function playImportedAudio(file) {
    stopAllVoice();
    if (!file) return;

    const url = URL.createObjectURL(file);
    await playAudioUrl(url, "音频", file.name.replace(/\.[^.]+$/, "") || "正在播放音频", true);
  }

    function setupDrag() {
    petDock.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button") || event.target.closest("#floatingPetContextMenu") || event.target.closest(".menu-item") || event.target.closest(".pet-floating-context-menu")) return;
      if (!petDock.classList.contains("compact") && !petDock.classList.contains("mini")) return;
      if (readSettingsForm().positionLocked) {
        setBubble("位置已锁定，避免误拖。");
        return;
      }
      if (isTauriRuntime() && petDock.classList.contains("mini")) {
        event.preventDefault();
        startTauriDrag();
        scheduleSnapAfterDrag();
        return;
      }

      const rect = petDock.getBoundingClientRect();
      state.dragging = true;
      state.dragOffsetX = event.clientX - rect.left;
      state.dragOffsetY = event.clientY - rect.top;
      petDock.classList.add("dragging");
      petDock.setPointerCapture(event.pointerId);
    });

    petDock.addEventListener("pointermove", (event) => {
      if (!state.dragging) return;
      const width = petDock.offsetWidth;
      const height = petDock.offsetHeight;
      const left = Math.min(window.innerWidth - width, Math.max(0, event.clientX - state.dragOffsetX));
      const top = Math.min(window.innerHeight - height, Math.max(0, event.clientY - state.dragOffsetY));
      petDock.style.left = left + "px";
      petDock.style.top = top + "px";
      petDock.style.right = "auto";
      petDock.style.bottom = "auto";
    });

    petDock.addEventListener("pointerup", (event) => {
      state.dragging = false;
      petDock.classList.remove("dragging");
      if (petDock.hasPointerCapture(event.pointerId)) {
        petDock.releasePointerCapture(event.pointerId);
      }
    });

    petDock.addEventListener("pointercancel", () => {
      state.dragging = false;
      petDock.classList.remove("dragging");
    });
  }

  petStage?.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    petDock.classList.toggle("menu-open");
  });

  document.addEventListener("click", (event) => {
    if (!petDock.contains(event.target)) {
      petDock.classList.remove("menu-open");
    }
    const trigger = event.target.closest("[data-page-target]");
    if (trigger && trigger.dataset.pageTarget) {
      setActivePage(trigger.dataset.pageTarget);
    }
  });

  document.querySelectorAll("[data-line]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.action) {
        playPetAction(button.dataset.action);
      }
      handleChatSubmit(button.dataset.line || "");
    });
  });

  actionMenuToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = actionMenu?.classList.contains("hidden");
    setActionMenusOpen(false);
    setActionMenusOpen(Boolean(open), "chat");
  });
  actionMenu?.addEventListener("click", handleActionMenuClick);
  feedMenuToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = feedMenu?.classList.contains("hidden");
    setFeedMenusOpen(false);
    setFeedMenusOpen(Boolean(open), "chat");
  });
  feedMenu?.addEventListener("click", handleFeedMenuClick);
  openPetSettings?.addEventListener("click", () => showPetSettings(true));
  backToPetInfo?.addEventListener("click", () => showPetSettings(false));
  libraryFeedToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = libraryFeedMenu?.classList.contains("hidden");
    setFeedMenusOpen(false);
    setFeedMenusOpen(Boolean(open), "library");
  });
  libraryFeedMenu?.addEventListener("click", handleFeedMenuClick);
  saveGifAction?.addEventListener("click", savePendingGifAction);
  petActionList?.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const playButton = target?.closest("[data-play-current-action]");
    const deleteButton = target?.closest("[data-delete-current-action]");
    if (playButton) {
      const action = availablePetActions().find((item) => item.id === playButton.dataset.playCurrentAction);
      if (action) playAvailableAction(action);
      return;
    }
    if (deleteButton) {
      deleteCustomActionFromActivePet(deleteButton.dataset.deleteCurrentAction || "");
    }
  });
  petGifActionInput?.addEventListener("change", async (event) => {
    const [file] = event.target.files || [];
    await saveGifActionToActivePet(file);
  });
  generatePetVideoAction?.addEventListener("click", async () => {
    generateVideoActionFromPrompt("pet");
  });
  generatePetSickImage?.addEventListener("click", generateSickImageForActivePet);

  [
    usageSupervisionEnabled,
    usageSupervisionApp,
    usageSupervisionOperator,
    usageSupervisionDuration,
    usageSupervisionUnit,
  ].forEach((control) => {
    control?.addEventListener("input", () => {
      const settings = readSettingsForm();
      updateUsageSupervisionLabel(settings, matchingUsageSeconds(state.usageSnapshot, settings.usageSupervisionApp));
    });
    control?.addEventListener("change", () => {
      const settings = readSettingsForm();
      updateUsageSupervisionLabel(settings, matchingUsageSeconds(state.usageSnapshot, settings.usageSupervisionApp));
    });
  });

  permissionToggles.forEach((toggle) => {
    toggle.addEventListener("change", () => {
      const settings = readSettingsForm();
      updatePermissionControls(settings);
      if (!hasPermission("usageStats", settings)) {
        updateUsageSupervisionLabel(settings);
        refreshUsageSnapshot();
      }
      refreshVoiceCloneForm();
      if (permissionStatus) {
        const label = permissionLabels[toggle.dataset.permissionToggle] || "权限";
        permissionStatus.textContent = `${label}已${toggle.checked ? "开启" : "关闭"}，点击保存后长期生效。`;
      }
    });
  });

  launchAtLoginSwitch?.addEventListener("change", () => {
    const settings = readSettingsForm();
    updateDisplaySettingLabels(settings);
    if (!hasPermission("launchAtLogin", settings)) {
      setBubble(permissionDeniedMessage("launchAtLogin"));
      return;
    }
    launchAtLoginStatus.textContent = launchAtLoginSwitch.checked ? "开启" : "关闭";
  });

  autoUpdateSwitch?.addEventListener("change", () => {
    const settings = readSettingsForm();
    updateDisplaySettingLabels(settings);
    if (!hasPermission("autoUpdate", settings)) {
      setBubble(permissionDeniedMessage("autoUpdate"));
      return;
    }
    autoUpdateStatus.textContent = autoUpdateSwitch.checked ? "开启" : "关闭";
  });

  checkUpdateButton?.addEventListener("click", () => {
    checkForAppUpdate();
  });

  installUpdateButton?.addEventListener("click", async () => {
    if (!hasPermission("autoUpdate", readSettingsForm())) {
      if (updateCheckStatus) updateCheckStatus.textContent = permissionDeniedMessage("autoUpdate");
      return;
    }
    installUpdateButton.disabled = true;
    if (checkUpdateButton) checkUpdateButton.disabled = true;
    if (updateCheckStatus) updateCheckStatus.textContent = "正在下载并校验更新包...";
    try {
      await invokeTauri("updater_download_and_install", { channel: readSettingsForm().updateChannel });
      if (updateCheckStatus) updateCheckStatus.textContent = "更新已交给系统安装器，应用即将退出。";
    } catch (error) {
      if (updateCheckStatus) updateCheckStatus.textContent = error?.message || String(error) || "更新安装失败。";
      installUpdateButton.disabled = false;
      if (checkUpdateButton) checkUpdateButton.disabled = false;
    }
  });

  if (isTauriRuntime()) {
    import("@tauri-apps/api/event")
      .then(({ listen }) =>
        listen("lumpa://updater-progress", ({ payload }) => {
          if (!updateCheckStatus) return;
          if (payload?.phase === "downloading") {
            updateCheckStatus.textContent = payload.percent == null
              ? `正在下载更新：${Math.round((payload.downloaded || 0) / 1024 / 1024)} MB`
              : `正在下载更新：${payload.percent}%`;
          } else if (payload?.phase === "verified") {
            updateCheckStatus.textContent = "签名校验通过，正在准备安装...";
          } else if (payload?.phase === "installing") {
            updateCheckStatus.textContent = "正在启动系统安装器...";
          }
        }),
      )
      .catch((error) => console.warn("Updater progress listener failed:", error));
  }

  exportChatHistory.addEventListener("click", exportActiveChatHistory);
  clearChatHistory.addEventListener("click", clearActiveChatHistory);

  demoVoice.addEventListener("click", () => {
    const pet = activePet();
    const line = `你好呀，我是 ${pet.name}。现在正在测试语音嘴型同步。`;
    addMessage(line, "pet");
    speakText(line);
  });

  stopVoice.addEventListener("click", stopAllVoice);

  audioFile.addEventListener("change", (event) => {
    const [file] = event.target.files;
    playImportedAudio(file).catch(() => {
      setBubble("这段音频没能播放。");
      setSpeaking(false, "待机");
    });
  });

  settingsToggle.addEventListener("click", () => {
    setActivePage("settings");
  });

  languageInput.addEventListener("change", () => {
    state.settings = { ...state.settings, language: languageInput.value === "en" ? "en" : defaultSettings.language };
    applyLanguageSetting(state.settings.language);
    writePersistentDocument(settingsStorageKey, state.settings);
  });

  chatModelPreset?.addEventListener("change", () => {
    applyChatModelPreset(chatModelPreset.value);
  });

  settingsApiBase.addEventListener("change", () => {
    syncChatModelPreset();
  });

  settingsChatModel.addEventListener("input", () => {
    syncChatModelPreset();
  });

  ttsModelPreset?.addEventListener("change", () => {
    applyTtsModelPreset(ttsModelPreset.value);
  });

  settingsTtsApiBase?.addEventListener("change", () => {
    syncTtsModelPreset();
  });

  settingsTtsModel.addEventListener("input", () => {
    syncTtsModelPreset();
    refreshVoiceCloneForm();
  });

  settingsTtsSpeed.addEventListener("input", () => {
    settingsSpeedValue.value = Number(settingsTtsSpeed.value).toFixed(2);
  });

  confirmMemory?.addEventListener("click", acceptMemorySuggestion);
  dismissMemory?.addEventListener("click", dismissMemorySuggestion);

  addMemoryItem?.addEventListener("click", () => {
    const text = cleanupMemoryText(manualMemoryText.value);
    if (!text) {
      setBubble("先写一条要保存的记忆。");
      return;
    }
    const saved = addPetMemoryItem({ category: manualMemoryCategory.value, text, source: "manual" });
    manualMemoryText.value = "";
    setBubble(saved ? "这条记忆已保存到当前桌宠。" : "这条记忆已经存在了。");
  });

  manualMemoryText?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addMemoryItem?.click();
  });

  memoryList?.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-memory-action]") : null;
    if (!button) return;
    const itemElement = button.closest(".memory-item");
    const action = button.dataset.memoryAction;
    if (action === "save") {
      saveMemoryItemFromElement(itemElement);
      return;
    }
    if (action === "delete") {
      deleteMemoryItem(itemElement?.dataset?.memoryId);
    }
  });

  memoryEnabledSwitch?.addEventListener("change", () => {
    persistActiveMemory();
    setBubble(memoryEnabledSwitch.checked ? "当前桌宠记忆已开启。" : "当前桌宠记忆已关闭。");
  });

  [memoryNickname, memoryPreferences, memoryRecentTasks].forEach((input) => {
    input?.addEventListener("change", persistActiveMemory);
  });

  uploadVoiceClone.addEventListener("click", async () => {
    const [file] = voiceCloneFile.files || [];
    const previousText = uploadVoiceClone.textContent;
    uploadVoiceClone.disabled = true;
    uploadVoiceClone.textContent = "生成中";
    statusPill.textContent = "生成音色";
    setVoiceCloneStatus("正在上传参考音频并生成相似音色...");

    try {
      const data = await requestVoiceCloneUpload({
        file,
        customName: voiceCloneName.value,
        text: voiceCloneText.value,
      });
      const voiceUri = extractVoiceUri(data);
      if (!voiceUri) {
        throw new Error("接口没有返回可用的音色 URI。");
      }

      settingsTtsVoice.value = voiceUri;
      settingsTtsModel.value = mimoTtsVoiceCloneModel;
      ensureTtsApiBaseOption(mimoTtsApiBase);
      syncTtsModelPreset({ ttsApiBase: mimoTtsApiBase, ttsModel: mimoTtsVoiceCloneModel });
      if (!voiceCloneName.value.trim()) {
        voiceCloneName.value = sanitizeVoiceCloneName(data.customName || data.name || "") || suggestedVoiceCloneName();
      }
      persistSettings();
      setVoiceCloneStatus(`音色已生成并保存：${voiceUri}`);
} catch (error) {
      console.warn("Voice clone failed:", error);
      setVoiceCloneStatus(error.message || "音色生成失败，请检查 API Key、模型名、音频和参考文本。");
      setBubble("音色生成失败了，检查 API Key、模型名、音频和参考文字后再试。");
      statusPill.textContent = "失败";
    } finally {
      uploadVoiceClone.disabled = !hasPermission("voiceClone");
      uploadVoiceClone.textContent = previousText;
    }
  });
  [petScaleInput, petOffsetYInput, petOpacityInput].forEach((input) => {
    input.addEventListener("input", () => {
      const settings = readSettingsForm();
      updateDisplaySettingLabels(settings);
      applyVisualSettings(settings);
      renderImageProcessingStatus();
    });
  });

  [alwaysOnTopSwitch, clickThroughSwitch, positionLockedSwitch, desktopGravityInput].forEach((input) => {
    input.addEventListener("change", () => {
      const settings = readSettingsForm();
      updateDisplaySettingLabels(settings);
      applyPositionLock(settings);
    });
  });

  floatingSwitch.addEventListener("change", () => {
    if (floatingSwitch.checked && !isTauriRuntime()) {
      floatingSwitch.checked = false;
      floatingStatus.textContent = "关闭";
      openDesktopFloating();
      return;
    }

    setDockMode(floatingSwitch.checked ? "mini" : "normal", { persist: true });
  });

  resetCreatePet.addEventListener("click", resetCreateForm);

  removeBackgroundImage.addEventListener("click", runBackgroundRemoval);

  petImageInput.addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (!file) {
      state.pendingImageData = "";
      state.pendingImageMeta = null;
      state.pendingMouthFrames = [];
      setPetImagePreview("");
      renderMouthFramePreview();
      setMouthFrameStatus("上传形象后可以生成动作帧，也可以描述动作生成视频动作。GIF 会作为自定义动作上传。");
      return;
    }

    petImageHint.textContent = "正在处理图片";
    let isGif = false;
    try {
      isGif = file.type === "image/gif" || /\.gif$/i.test(file.name);
      if (isGif) {
        gifActionPanel?.classList.remove("hidden");
        if (saveGifAction) saveGifAction.disabled = true;
        setGifActionStatus("正在本地拆帧 GIF...");
        setMouthFrameStatus("正在处理 GIF 动作，不会调用外部 API。");
        const action = await processGifActionFile(file);
        state.pendingGifAction = action;
        if (gifActionName && !gifActionName.value.trim()) {
          gifActionName.value = file.name.replace(/\.[^.]+$/, "").slice(0, 32);
        }
        renderGifActionPreview(action);
        if (saveGifAction) saveGifAction.disabled = false;
        const removalText =
          action.backgroundRemoval === "solid-edge"
            ? "已本地去除纯色背景"
            : action.backgroundRemoval === "complex-background"
              ? "背景较复杂，已作为带背景动作"
              : action.backgroundRemoval === "browser-fallback"
                ? "浏览器模式未拆帧，已作为 GIF 表情包动作"
                : "已检测到透明背景";
        setGifActionStatus(
          `${removalText}。${action.frames.length} 帧，${Math.round(action.totalDurationMs)}ms${action.truncated ? "，已截断到 6 秒内" : ""}。`
        );
        setMouthFrameStatus("GIF 动作已生成预览。选择动作类型和名称后点“保存动作”。");
        setBubble("GIF 动作预览好了，保存后会跟随新桌宠。");
        petImageInput.value = "";
        return;
      }

      state.pendingImageData = await compressPetImage(file);
      state.pendingMouthFrames = [];
      setPetImagePreview(state.pendingImageData, file.name);
      renderMouthFramePreview();
      const settings = readSettingsForm();
      if (!state.pendingImageMeta?.hasTransparentBackground) {
        setMouthFrameStatus("未检测到透明背景，建议先点“一键去背”，再生成动作帧。");
      } else if (imageModelCanGenerate(selectedImageModelConfig(), settings)) {
        setMouthFrameStatus("形象已放入固定透明画布，正在生成 3 张 AI 完整动作帧...");
        runMouthFrameGeneration();
      } else {
        setMouthFrameStatus("形象已放入固定透明画布。可以生成嘴型动作帧，也可以在下方描述动作生成视频动作。");
      }
    } catch (error) {
      console.warn("Pet image failed:", error);
      if (isGif) {
        state.pendingGifAction = null;
        stopGifActionPreview();
        renderGifActionPreview(null);
        if (saveGifAction) saveGifAction.disabled = true;
        petImageInput.value = "";
        setGifActionStatus("GIF 动作处理失败，请换一个更短或背景更简单的 GIF。");
        setMouthFrameStatus("GIF 动作处理失败。主形象不会被替换。");
        setBubble("这个 GIF 没处理成功，换一个短一点的 GIF 试试。");
        return;
      }
      state.pendingImageData = "";
      state.pendingImageMeta = null;
      state.pendingMouthFrames = [];
      petImageInput.value = "";
      setPetImagePreview("");
      renderMouthFramePreview();
      setMouthFrameStatus("图片处理失败，请换一张 PNG、WebP 或 GIF。");
      setBubble("这张图片没处理成功，换一张 PNG、WebP 或 GIF 试试。");
    }
  });

  generateMouthFrames.addEventListener("click", async () => {
    runMouthFrameGeneration();
  });

  generateVideoAction?.addEventListener("click", async () => {
    generateVideoActionFromPrompt();
  });

  mouthFramePreview.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest(".mouth-frame-retry") : null;
    if (!button) return;
    regenerateMouthFrame(Number(button.dataset.mouthIndex));
  });

  createPetButton.addEventListener("click", createPetFromForm);

  distillCreatePet.addEventListener("click", async () => {
    const source = createDistillSource.value.trim();
    if (!source) {
      setBubble("先输入人物名、角色名，或粘贴一段语录。");
      return;
    }

    const previousText = distillCreatePet.textContent;
    distillCreatePet.disabled = true;
    distillCreatePet.textContent = "蒸馏中";
    statusPill.textContent = "蒸馏中";

    try {
      customPersonality.value = await requestPersonaDistill(source);
      setBubble("性格已经蒸馏到创建器里了。");
      statusPill.textContent = "已蒸馏";
    } catch (error) {
      console.warn("Create pet distill failed:", error);
      setBubble("蒸馏失败了，检查 API Key、模型名或网络后再试。");
      statusPill.textContent = "失败";
    } finally {
      distillCreatePet.disabled = false;
      distillCreatePet.textContent = previousText;
    }
  });

  saveSettings.addEventListener("click", persistSettings);
  savePetSettings?.addEventListener("click", persistSettings);
  activePetNameInput?.addEventListener("input", () => {
    statusPill.textContent = "待保存";
  });
  activePetNameInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    persistSettings();
  });

  distillPersona.addEventListener("click", async () => {
    const source = personaSource.value.trim();
    if (!source) {
      setBubble("先输入人物名、角色名，或粘贴一段人物资料。");
      return;
    }

    const previousText = distillPersona.textContent;
    distillPersona.disabled = true;
    distillPersona.textContent = "蒸馏中";
    statusPill.textContent = "蒸馏中";

    try {
      const persona = await requestPersonaDistill(source);
      settingsPersona.value = persona;
      settingsPersona.dataset.presetKey = "";
      persistSettings();
      setBubble("人物 Skill 已蒸馏完成，下一轮聊天会按这个人格内核说话。");
    } catch (error) {
      console.warn("Persona distill failed:", error);
      setBubble("蒸馏失败了，检查 API Key、模型名或网络后再试。");
      statusPill.textContent = "失败";
    } finally {
      distillPersona.disabled = false;
      distillPersona.textContent = previousText;
    }
  });

  clearSettings.addEventListener("click", () => {
    clearPersistentDocument(settingsStorageKey);
    state.settings = { ...defaultSettings };
    fillSettingsForm();
    personaSource.value = "";
    setDockMode("normal");
    applyVisualSettings(state.settings);
    applyPositionLock(state.settings);
    syncTauriDesktopOptions(state.settings);
    setBubble("本地设置已清空，API Key 需要用户自己重新填写。");
    statusPill.textContent = "已清空";
  });

  compactToggle.addEventListener("click", () => {
    if (petDock.classList.contains("mini")) {
      setDockMode("normal", { persist: true });
      return;
    }

    setDockMode(petDock.classList.contains("compact") ? "normal" : "compact");
  });



  
  let currentEnv = "day";

  function updateWorldStatusBar() {
    if (!worldInstance) return;
    const stats = worldInstance.stats;
    const f = document.querySelector("#worldFullnessVal");
    const m = document.querySelector("#worldMoodVal");
    const e = document.querySelector("#worldEnergyVal");
    const s = document.querySelector("#worldStageVal");
    const c = document.querySelector("#worldCoinsVal");

    if (f) f.textContent = `${Math.floor(stats.fullness)}%`;
    if (m) m.textContent = `${Math.floor(stats.mood)}%`;
    if (e) e.textContent = `${Math.floor(stats.energy)}%`;
    if (s) s.textContent = `LV.${stats.level} ${stats.stage}`;
    if (c) c.textContent = `${stats.coins}`;
  }

  window.setInterval(updateWorldStatusBar, 500);

  document.addEventListener("click", (event) => {
    try {
      const target = event.target instanceof Element ? event.target : (event.target ? event.target.parentElement : null);
      if (!target) return;

      // 1. 开始冒险
      if (target.closest("#worldStartGameBtn")) {
        runWorldCutscene();
        return;
      }

      // 2. 玩法指南弹窗
      if (target.closest("#worldGuideBtn")) {
        document.querySelector("#worldGuideModal")?.classList.remove("hidden");
        return;
      }
      if (target.closest("#closeWorldGuideBtn") || target.closest("#confirmWorldGuideBtn")) {
        document.querySelector("#worldGuideModal")?.classList.add("hidden");
        if (target.closest("#confirmWorldGuideBtn")) runWorldCutscene();
        return;
      }

      // 3. 返回大厅
      if (target.closest("#exitWorldBtn")) {
        exitWorldToLobby();
        return;
      }

      // 4. 第一排：喂食
      if (target.closest("#worldFeedBtn")) {
        const world = autoEnterWorldGame();
        if (world) {
          const foods = ["carrot", "strawberry", "cookie", "riceball"];
          const food = foods[Math.floor(Math.random() * foods.length)];
          world.feedPet(food);
          updateWorldStatusBar();
          showWorldToast("🥕 成功投喂白兔棉棉美美的一餐！饱食度 UP！"); setBubble("🥕 投喂给白兔棉棉美美的一餐！");
        }
        return;
      }

      // 5. 第一排：抚摸
      if (target.closest("#worldPetTouchBtn")) {
        const world = autoEnterWorldGame();
        if (world) {
          world.petInteraction(280, 200);
          updateWorldStatusBar();
          showWorldToast("💖 轻轻抚摸白兔棉棉，心情与亲密度 UP！"); setBubble("💖 轻轻抚摸白兔棉棉，开心度 UP！");
        }
        return;
      }

      // 6. 第一排：抓甜点小游戏
      if (target.closest("#worldMiniGameBtn")) {
        const world = autoEnterWorldGame();
        if (world) {
          world.startMiniGame();
          showWorldToast("🎯 开启 30s 掉落美食小游戏！"); setBubble("🎯 挑战 30s 抓甜点小游戏！");
        }
        return;
      }

      // 7. 第一排：拍照保存 (拍立得卡片)
      if (target.closest("#worldCameraBtn")) {
        const world = autoEnterWorldGame();
        if (world) {
          const canvas = document.querySelector("#worldCanvas");
          const polaroidImg = document.querySelector("#polaroidImg");
          const polaroidDate = document.querySelector("#polaroidDate");
          const modal = document.querySelector("#worldPolaroidModal");

          if (canvas && polaroidImg && modal) {
            try {
              polaroidImg.src = canvas.toDataURL("image/png");
            } catch (e) {
              world.render();
              polaroidImg.src = canvas.toDataURL("image/png");
            }
            if (polaroidDate) polaroidDate.textContent = new Date().toLocaleDateString();
            modal.classList.remove("hidden");
            showWorldToast("📷 莫兰迪拍立得合影快照已生成！"); setBubble("📷 莫兰迪拍立得相册卡片已生成！");
          }
        }
        return;
      }

      if (target.closest("#closePolaroidBtn")) {
        document.querySelector("#worldPolaroidModal")?.classList.add("hidden");
        return;
      }

      if (target.closest("#downloadPolaroidBtn")) {
        const polaroidImg = document.querySelector("#polaroidImg");
        if (polaroidImg && polaroidImg.src) {
          if (window.__TAURI_INTERNALS__) {
            import("@tauri-apps/api/core").then(({ invoke }) => {
              invoke("save_polaroid_image", { base64Data: polaroidImg.src })
                .then((savedPath) => {
                  setBubble("📷 拍立得照片已保存至您的桌面！");
                  alert(`📷 拍立得照片已成功保存至您的桌面！\n\n保存路径：\n${savedPath}`);
                })
                .catch((err) => {
                  console.error("Save error:", err);
                });
            }).catch(() => {});
          } else {
            const link = document.createElement("a");
            link.href = polaroidImg.src;
            link.download = `lumpa-polaroid-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            link.remove();
          }
        }
        return;
      }

      // 8. 第一排：昼夜切换
      if (target.closest("#worldDayNightBtn")) {
        const world = autoEnterWorldGame();
        if (world) {
          const envs = ["day", "twilight", "night"];
          const nextIdx = (envs.indexOf(currentEnv) + 1) % envs.length;
          currentEnv = envs[nextIdx];
          world.setTimeOfDay(currentEnv);
          setBubble(`🌙 已切换氛围模式：${currentEnv}`);
        }
        return;
      }

      // --- 第二排：农场工具 Hotbar 切换 ---
      const toolBtn = target.closest(".tool-btn");
      if (toolBtn) {
        autoEnterWorldGame();
        document.querySelectorAll(".tool-btn").forEach(b => b.classList.remove("active"));
        toolBtn.classList.add("active");
        inventory.selectedTool = toolBtn.dataset.tool;
        const toolLabel = toolBtn.querySelector("span:last-child")?.textContent || toolBtn.dataset.tool;
        setBubble(`🛠️ 已装备工具：${toolLabel}`);
        return;
      }

      // --- 第二排：背包 Modal 开关 ---
      if (target.closest("#openInventoryBtn")) {
        autoEnterWorldGame();
        document.querySelector("#worldInventoryModal")?.classList.remove("hidden");
        renderInventoryModal();
        showWorldToast("🎒 像素 24 格背包已打开"); setBubble("🎒 像素背包已打开");
        return;
      }
      if (target.closest("#closeInventoryBtn")) {
        document.querySelector("#worldInventoryModal")?.classList.add("hidden");
        return;
      }

      const slotEl = target.closest(".inventory-slot");
      if (slotEl) {
        const idx = parseInt(slotEl.dataset.index);
        inventory.selectedSlotIndex = idx;
        renderInventoryModal();
        const slotData = inventory.slots[idx];
        const detailEl = document.querySelector("#itemDetailText");
        if (slotData && ITEM_REGISTRY[slotData.id] && detailEl) {
          detailEl.textContent = `${ITEM_REGISTRY[slotData.id].name} - ${ITEM_REGISTRY[slotData.id].desc}`;
        }
        return;
      }

      if (target.closest("#useItemBtn")) {
        const slotData = inventory.slots[inventory.selectedSlotIndex];
        const world = autoEnterWorldGame();
        if (slotData && world) {
          world.feedPet(slotData.id);
          inventory.removeItem(slotData.id, 1);
          renderInventoryModal();
          setBubble(`✨ 已为白兔棉棉使用：${ITEM_REGISTRY[slotData.id]?.name || ""}`);
        }
        return;
      }

      // --- 第二排：杂货铺商店 Modal ---
      if (target.closest("#openShopBtn")) {
        autoEnterWorldGame();
        document.querySelector("#worldShopModal")?.classList.remove("hidden");
        renderShopModal();
        showWorldToast("🏪 像素杂货铺商店已打开"); setBubble("🏪 杂货铺商店已打开");
        return;
      }
      if (target.closest("#closeShopBtn")) {
        document.querySelector("#worldShopModal")?.classList.add("hidden");
        return;
      }

      const buyBtn = target.closest(".buy-btn");
      if (buyBtn) {
        const world = autoEnterWorldGame();
        const id = buyBtn.dataset.id;
        const item = ITEM_REGISTRY[id];
        if (item && world && world.stats.coins >= item.price) {
          world.stats.coins -= item.price;
          inventory.addItem(id, 1);
          setBubble(`🛒 成功购买 ${item.name}！`);
          renderShopModal();
          updateWorldStatusBar();
        } else {
          setBubble("🪙 爱心金币不足！");
        }
        return;
      }

      // --- 第二排：工作台合成 Modal ---
      if (target.closest("#openCraftBtn")) {
        autoEnterWorldGame();
        document.querySelector("#worldCraftModal")?.classList.remove("hidden");
        renderCraftModal();
        showWorldToast("🛠️ 莫兰迪工作台手工合成已打开"); setBubble("🛠️ 工作台合成窗口已打开");
        return;
      }
      if (target.closest("#closeCraftBtn")) {
        document.querySelector("#worldCraftModal")?.classList.add("hidden");
        return;
      }

      const craftBtn = target.closest(".craft-btn");
      if (craftBtn) {
        const recId = craftBtn.dataset.id;
        const rec = CRAFTING_RECIPES.find(r => r.id === recId);
        if (rec && craftingEngine.craft(rec)) {
          setBubble(`🛠️ 成功合成：${rec.name}！`);
          renderCraftModal();
        }
        return;
      }
    } catch (err) {
      console.warn("World click error:", err);
    }
  });

  miniToggle.addEventListener("click", () => {
    if (!petDock.classList.contains("mini") && !isTauriRuntime()) {
      openDesktopFloating();
      return;
    }

    setDockMode(petDock.classList.contains("mini") ? "normal" : "mini", { persist: true });
  });

  floatDrag.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    startTauriDrag();
    scheduleSnapAfterDrag();
  });

  floatLock.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const nextLocked = !readSettingsForm().positionLocked;
    positionLockedSwitch.checked = nextLocked;
    state.settings = { ...readSettingsForm(), positionLocked: nextLocked };
    writePersistentDocument(settingsStorageKey, state.settings);
    updateDisplaySettingLabels(state.settings);
    applyPositionLock(state.settings);
    setBubble(nextLocked ? "位置锁好了，不会误拖。" : "已解除锁定，可以拖动。");
  });

  floatTalk.addEventListener("click", (event) => {
    event.stopPropagation();
    setActionMenusOpen(false);
    toggleFloatingComposer();
  });

  floatAction?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleFloatingComposer(false);
    const open = floatingActionMenu?.classList.contains("hidden");
    setActionMenusOpen(false);
    setActionMenusOpen(Boolean(open), "floating");
  });

  floatFeed?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleFloatingComposer(false);
    const open = floatingFeedMenu?.classList.contains("hidden");
    setFeedMenusOpen(false);
    setFeedMenusOpen(Boolean(open), "floating");
  });

  floatingComposer.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });

  floatingActionMenu?.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });
  floatingActionMenu?.addEventListener("click", handleActionMenuClick);
  floatingFeedMenu?.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });
  floatingFeedMenu?.addEventListener("click", handleFeedMenuClick);

  floatingComposer.addEventListener("submit", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const text = floatingInput.value.trim();
    if (!text) return;
    floatingInput.value = "";
    toggleFloatingComposer(false);
    handleChatSubmit(text);
  });

  floatExpand.addEventListener("click", () => {
    setDockMode("normal", { persist: true });
  });

  floatClose.addEventListener("click", closeFloatingWindow);

  floatingTools.addEventListener("dblclick", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest(".action-menu, .feed-menu, #actionMenuToggle, #feedMenuToggle, #libraryFeedToggle, #floatAction, #floatFeed")) {
      return;
    }
    setActionMenusOpen(false);
    setFeedMenusOpen(false);
  });

  petDock.addEventListener("dblclick", () => {
    if (petDock.classList.contains("mini")) {
      setDockMode("normal", { persist: true });
    }
  });

  const startsFloating = new URLSearchParams(window.location.search).get("mode") === "floating";

  window.addEventListener("rabbit-desk-pet-mode", (event) => {
    const mode = event.detail?.mode === "normal" ? "normal" : "mini";
    setDockMode(mode, { persist: true });
  });

  window.addEventListener("rabbit-desk-pet-open-settings", () => {
    setActivePage("settings");
  });

  window.addEventListener("rabbit-desk-pet-click-through-disabled", () => {
    clickThroughSwitch.checked = false;
    state.settings = { ...readSettingsForm(), clickThrough: false };
    writePersistentDocument(settingsStorageKey, state.settings);
    updateDisplaySettingLabels(state.settings);
    setBubble("已从托盘关闭穿透点击。");
  });

  usageModeTabs.forEach((button) => {
    button.addEventListener("click", () => {
      state.usageMode = button.dataset.usageMode === "week" ? "week" : "day";
      usageModeTabs.forEach((item) => item.classList.toggle("active", item === button));
      if (state.usageSnapshot) renderUsageSnapshot(state.usageSnapshot);
    });
  });

  window.LumpaApp = {
    getActivePet() {
      return clonePersistedValue(activePet(), {});
    },
    listPets() {
      return state.pets.map((pet) => ({ id: pet.id, name: pet.name, species: pet.species }));
    },
    getSettings() {
      return clonePersistedValue(state.settings, {});
    },
    saveSettingsPatch(patch) {
      state.settings = normalizeSettings({ ...state.settings, ...patch });
      writePersistentDocument(settingsStorageKey, state.settings);
      fillSettingsForm();
      return clonePersistedValue(state.settings);
    },
    saveTimelineAction(action) {
      const pet = activePet();
      const normalized = normalizePetAction(action, petCustomActions(pet).length);
      if (!normalized) throw new Error("动作至少需要一帧有效图片。");
      const actions = petCustomActions(pet).filter((item) => item.id !== normalized.id);
      pet.assets = { ...normalizePetAssets(pet.assets), actions: [...actions, normalized].slice(-24) };
      persistPets();
      renderPetList();
      renderAllActionMenus();
      return clonePersistedValue(normalized);
    },
    openSettings() {
      setActivePage("settings");
    },
  };

  loadSettings();
  const requestedPage = new URLSearchParams(window.location.search).get("page");
  setActivePage(requestedPage || "desk");
  if (!startsFloating) {
    state.settings.floatingMode = false;
  }
  loadPets();
  loadChatHistory();
  renderPersonaPresets();
  renderMouthFramePreview();
  renderImageProcessingStatus();
  fillSettingsForm();
  refreshLaunchAtLoginStatus();
  if (state.settings.autoUpdate && hasPermission("autoUpdate", state.settings)) {
    window.setTimeout(() => checkForAppUpdate({ silent: true }), 1400);
  }
  syncBackendModelStatus();
  selectPet(state.activePetId, { silent: true });
  state.petRenderer = new PhaserPetRenderer(petRendererContainer, rabbitImage);
  upgradePetFrameLayouts();
  setupDrag();
  setFrame(0);
  if (startsFloating) {
    setDockMode("mini");
  } else {
    syncFloatingControls(false);
    applyVisualSettings(state.settings);
    syncTauriDesktopOptions(state.settings);
  }
  syncTauriStartMode();
  syncServerStartMode();
  refreshUsageSnapshot();
  window.setInterval(refreshUsageSnapshot, 5000);
  window.setInterval(pollForegroundWindowSwitch, 150);
  syncFloatingPetCanvas();
  window.setInterval(() => {
    activeCare({ persist: true });
    updateCareUi();
    renderPetList();
  }, 60000);
})();





// 渲染 24 格像素背包 (Inventory Renderer)
function renderInventoryModal(activeTab = "all") {
  const grid = document.querySelector("#inventoryGrid");
  if (!grid) return;
  grid.innerHTML = "";

  for (let i = 0; i < 24; i++) {
    const slotData = inventory.slots[i];
    const slotEl = document.createElement("div");
    slotEl.className = `inventory-slot ${i === inventory.selectedSlotIndex ? "selected" : ""}`;
    slotEl.dataset.index = i;

    if (slotData) {
      const reg = ITEM_REGISTRY[slotData.id];
      if (reg && (activeTab === "all" || reg.category === activeTab)) {
        slotEl.innerHTML = `<span class="slot-icon" style="font-size:24px">${reg.icon}</span><span class="slot-count">${slotData.count}</span>`;
      }
    }
    grid.appendChild(slotEl);
  }
}

// 渲染杂货铺商店 (Shop Renderer)
function renderShopModal() {
  const grid = document.querySelector("#shopGoodsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const shopItems = ["seed_carrot", "seed_strawberry", "seed_pumpkin", "seed_flower", "seed_magic", "soup", "cake"];
  shopItems.forEach(id => {
    const item = ITEM_REGISTRY[id];
    if (!item) return;
    const card = document.createElement("div");
    card.className = "shop-item-card";
    card.style.cssText = "display:flex; align-items:center; justify-space-between; background:#FFF; border:2px solid #2C1810; padding:10px; border-radius:10px; margin-bottom:8px;";
    card.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px">
        <span style="font-size:28px">${item.icon}</span>
        <div>
          <b style="color:#2C1810">${item.name}</b>
          <div style="font-size:12px; color:#666">${item.desc}</div>
        </div>
      </div>
      <button class="primary-launch-btn buy-btn" data-id="${id}" style="padding:6px 14px">🪙 ${item.price} 购买</button>
    `;
    grid.appendChild(card);
  });
}

// 渲染工作台合成配方 (Crafting Renderer)
function renderCraftModal() {
  const list = document.querySelector("#craftRecipesList");
  if (!list) return;
  list.innerHTML = "";

  CRAFTING_RECIPES.forEach(rec => {
    const can = craftingEngine.canCraft(rec);
    const card = document.createElement("div");
    card.style.cssText = "display:flex; align-items:center; justify-content:space-between; background:#FFF; border:2px solid #2C1810; padding:10px; border-radius:10px; margin-bottom:8px;";
    const ingsText = rec.ingredients.map(ing => `${ITEM_REGISTRY[ing.itemId]?.name || ing.itemId} x${ing.count}`).join(", ");
    card.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px">
        <span style="font-size:28px">${rec.icon}</span>
        <div>
          <b style="color:#2C1810">${rec.name}</b>
          <div style="font-size:12px; color:#666">需要材料: ${ingsText}</div>
        </div>
      </div>
      <button class="primary-launch-btn craft-btn" data-id="${rec.id}" ${can ? "" : "disabled style='opacity:0.5'"}>🛠️ 合成</button>
    `;
    list.appendChild(card);
  });
}


setInterval(() => {
  if (worldInstance) {
    const timeEl = document.querySelector("#worldTimeDisplay");
    const weatherEl = document.querySelector("#worldWeatherDisplay");
    const fullnessEl = document.querySelector("#worldFullnessVal");
    const moodEl = document.querySelector("#worldMoodVal");
    const energyEl = document.querySelector("#worldEnergyVal");
    const coinsEl = document.querySelector("#worldCoinsVal");
    const stageEl = document.querySelector("#worldStageVal");

    if (timeEl) timeEl.textContent = farmingEngine.getFormattedTime();
    if (weatherEl) weatherEl.textContent = farmingEngine.weather === "sunny" ? "☀️ 晴朗" : (farmingEngine.weather === "rainy" ? "🌧️ 细雨" : "❄️ 积雪");
    if (fullnessEl) fullnessEl.textContent = `${Math.floor(worldInstance.stats.fullness)}%`;
    if (moodEl) moodEl.textContent = `${Math.floor(worldInstance.stats.mood)}%`;
    if (energyEl) energyEl.textContent = `${Math.floor(worldInstance.stats.energy)}%`;
    if (coinsEl) coinsEl.textContent = worldInstance.stats.coins;
    if (stageEl) stageEl.textContent = `LV.${worldInstance.stats.level} ${worldInstance.stats.stage}`;
  }
}, 500);


// 🌟 核心小世界全局独立触发句柄 (Bulletproof Global Action Trigger)

// 🌟 莫兰迪小世界终极动作触发核心 (Ultimate World Action Processor)
window.triggerWorldAction = function(actionType, extraParam, targetEl) {
  try {
    const world = ensureWorldEngine();
    const dialog = document.querySelector("#worldActionDialog");
    const iconEl = document.querySelector("#worldDialogIcon");
    const titleEl = document.querySelector("#worldDialogTitle");
    const descEl = document.querySelector("#worldDialogDesc");

    function showDialog(icon, title, desc) {
      if (dialog && iconEl && titleEl && descEl) {
        iconEl.textContent = icon;
        titleEl.textContent = title;
        descEl.textContent = desc;
        dialog.classList.remove("hidden");
      }
    }

    if (actionType === "feed") {
      if (world) {
        const foods = ["carrot", "strawberry", "cookie", "riceball"];
        const food = foods[Math.floor(Math.random() * foods.length)];
        world.feedPet(food);
        updateWorldStatusBar();
      }
      showDialog("🥕", "投喂成功！", "美美地投喂了白兔棉棉！饱食度增加 25%，心情提升 15%！");
      showWorldToast("🥕 成功投喂白兔棉棉！饱食度 UP！");
      return;
    }

    if (actionType === "pet") {
      if (world) {
        world.petInteraction(280, 200);
        updateWorldStatusBar();
      }
      showDialog("💖 抚摸成功！", "白兔棉棉享受地眯起了眼睛，对你吐出了快乐的小爱心！心情值 +15%，亲密度 +4！");
      showWorldToast("💖 轻轻抚摸白兔棉棉！心情与亲密度 UP！");
      return;
    }

    if (actionType === "minigame") {
      if (world) {
        world.startMiniGame();
      }
      showWorldToast("🎯 开启 30s 掉落美食小游戏！");
      return;
    }

    if (actionType === "camera") {
      if (world) {
        const canvas = document.querySelector("#worldCanvas");
        const polaroidImg = document.querySelector("#polaroidImg");
        const polaroidDate = document.querySelector("#polaroidDate");
        const modal = document.querySelector("#worldPolaroidModal");

        if (canvas && polaroidImg && modal) {
          try {
            polaroidImg.src = canvas.toDataURL("image/png");
          } catch (e) {
            world.render();
            polaroidImg.src = canvas.toDataURL("image/png");
          }
          if (polaroidDate) polaroidDate.textContent = new Date().toLocaleDateString();
          modal.classList.remove("hidden");
        }
      }
      showWorldToast("📷 莫兰迪拍立得合影快照已生成！");
      return;
    }

    if (actionType === "daynight") {
      if (world) {
        const envs = ["day", "twilight", "night"];
        const nextIdx = (envs.indexOf(currentEnv) + 1) % envs.length;
        currentEnv = envs[nextIdx];
        world.setTimeOfDay(currentEnv);
      }
      showDialog("🌙 昼夜氛围切换", `当前环境天色已切换为：${currentEnv === "day" ? "☀️ 白天暖阳" : (currentEnv === "twilight" ? "🌅 黄昏余晖" : "星空月夜")}`, "观察白兔棉棉在不同昼夜氛围下的可爱表现吧！");
      showWorldToast(`🌙 已切换氛围模式：${currentEnv}`);
      return;
    }

    if (actionType === "tool") {
      document.querySelectorAll(".tool-btn").forEach(b => b.classList.remove("active"));
      if (targetEl) targetEl.classList.add("active");
      inventory.selectedTool = extraParam;
      const label = targetEl ? targetEl.querySelector("span:last-child")?.textContent : extraParam;
      showWorldToast(`🛠️ 已装备工具：${label}`);
      return;
    }

    if (actionType === "inventory") {
      document.querySelector("#worldInventoryModal")?.classList.remove("hidden");
      renderInventoryModal();
      showWorldToast("🎒 像素 24 格背包已打开");
      return;
    }

    if (actionType === "craft") {
      document.querySelector("#worldCraftModal")?.classList.remove("hidden");
      renderCraftModal();
      showWorldToast("🛠️ 莫兰迪工作台手工合成已打开");
      return;
    }

    if (actionType === "shop") {
      document.querySelector("#worldShopModal")?.classList.remove("hidden");
      renderShopModal();
      showWorldToast("🏪 像素杂货铺商店已打开");
      return;
    }
  } catch (err) {
    console.error("Action trigger failed:", err);
  }
};


// 🌟 核心桌宠浮窗动作触发器
window.triggerPetAction = function(type) {
  try {
    if (type === "feed") {
      feedActivePet("carrot");
      showWorldToast("🥕 已投喂胡萝卜给桌宠！");
    } else if (type === "action") {
      const actions = availablePetActions();
      if (actions.length) playAvailableAction(actions[0]);
      showWorldToast("💃 桌宠正在表演经典动作！");
    }
  } catch (err) {
    console.error("Pet action error:", err);
  }
};
