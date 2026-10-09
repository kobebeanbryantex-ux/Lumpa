import Phaser from "phaser";
import { LumpaWorld } from "./world.js";
import { FocusEngine } from "./focus.js";

// app.js uses Phaser as a browser global so that the renderer can gracefully
// fall back to the image element if the canvas renderer cannot initialize.
// Importing it here makes Vite emit the dependency with the production build
// instead of leaving a broken reference to src/vendor/phaser.min.js in dist.
window.Phaser = Phaser;
window.LumpaWorld = LumpaWorld;
window.FocusEngine = FocusEngine;

const LEGACY_KEYS = {
  rabbitPetApiSettings: "settings",
  rabbitPetCollection: "pets",
  rabbitPetChatHistory: "chat",
};

function isDesktopRuntime() {
  return Boolean(window.__TAURI_INTERNALS__);
}

function readLegacyDocuments() {
  const documents = {};
  let fromVersion = 0;
  for (const [storageKey, kind] of Object.entries(LEGACY_KEYS)) {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) continue;
    if (raw.length > 128 * 1024 * 1024) {
      throw new Error(`${storageKey} 超过 128 MB 迁移输入限制。`);
    }
    const value = JSON.parse(raw);
    documents[kind] = value;
    fromVersion = Math.max(fromVersion, Number(value?.settingsVersion || value?.version || 0));
  }
  return { fromVersion, documents };
}

async function registerLegacyProviders(invoke, settings = {}) {
  const mode = "bring_your_own_key";
  const profiles = [
    {
      id: "legacy-chat",
      key: String(settings.apiKey || "").trim(),
      profile: {
        id: "legacy-chat",
        name: "旧版聊天配置",
        mode,
        apiBase: String(settings.apiBase || "").trim(),
        chatModel: String(settings.chatModel || "gpt-5.4-mini").trim(),
        speechModel: "",
        imageModel: "",
        videoModel: "",
      },
    },
    {
      id: "legacy-tts",
      key: String(settings.ttsApiKey || settings.apiKey || "").trim(),
      profile: {
        id: "legacy-tts",
        name: "旧版语音配置",
        mode,
        apiBase: String(settings.ttsApiBase || settings.apiBase || "").trim(),
        chatModel: "",
        speechModel: String(settings.ttsModel || "mimo-v2.5-tts").trim(),
        imageModel: "",
        videoModel: "",
      },
    },
  ];
  for (const item of profiles) {
    if (!item.key || !item.profile.apiBase) continue;
    await invoke("save_provider_profile", { profile: item.profile, apiKey: item.key });
  }
  window.__LUMPA_PROVIDER_IDS__ = {
    chat: "legacy-chat",
    tts: "legacy-tts",
    media: "legacy-chat",
  };
}

async function bootstrapDesktop() {
  const { invoke } = await import("@tauri-apps/api/core");
  let bootstrap = await invoke("storage_bootstrap");
  if (!Object.keys(bootstrap.documents || {}).length) {
    const legacy = readLegacyDocuments();
    if (Object.keys(legacy.documents).length) {
      try {
        window.__LUMPA_MIGRATION_REPORT__ = await invoke("migrate_legacy_data", { payload: legacy });
        for (const storageKey of Object.keys(LEGACY_KEYS)) window.localStorage.removeItem(storageKey);
        bootstrap = await invoke("storage_bootstrap");
      } catch (error) {
        window.__LUMPA_MIGRATION_ERROR__ = String(error?.message || error);
      }
    }
  }
  window.__LUMPA_BOOTSTRAP__ = bootstrap;
  await registerLegacyProviders(invoke, bootstrap.documents?.settings || {});
}

window.addEventListener("error", (event) => {
  console.error("Global JS Error:", event.error || event.message);
});
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled Promise Rejection:", event.reason);
});

if (isDesktopRuntime()) {
  try {
    await bootstrapDesktop();
  } catch (error) {
    window.__LUMPA_BOOTSTRAP_ERROR__ = String(error?.message || error);
  }
}

try {
  await import("./app.js");
} catch (error) {
  console.error("app.js load error:", error);
}

try {
  await import("./lumpa1.js");
} catch (error) {
  console.error("lumpa1.js load error:", error);
}
