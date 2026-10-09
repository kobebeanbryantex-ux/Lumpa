import { beforeEach, describe, expect, it, vi } from "vitest";

async function loadInterface(options = {}) {
  vi.resetModules();
  document.body.innerHTML = "";
  window.__LUMPA_BOOTSTRAP__ = { documents: { settings: { permissions: {} } } };
  window.__LUMPA_BOOTSTRAP_ERROR__ = options.migrationError || "";
  window.__LUMPA_PROVIDER_IDS__ = options.providerIds || {};
  window.LumpaApp = {
    getSettings: () => ({ permissions: {} }),
    saveSettingsPatch: vi.fn(),
    saveTimelineAction: vi.fn(),
    getActivePet: () => ({ id: "pet-test" }),
  };
  await import("./lumpa1.js");
}

beforeEach(() => {
  delete window.__TAURI_INTERNALS__;
});

describe("Lumpa 1.0 desktop interface", () => {
  it("opens the first-run wizard and switches between account and BYOK forms", async () => {
    await loadInterface();
    document.querySelector('[data-tool="onboarding"]').click();
    const modal = document.querySelector("#lumpa1Onboarding");
    expect(modal.hidden).toBe(false);
    modal.querySelector("#lumpaPrivacyAccepted").checked = true;
    modal.querySelector("#lumpaOnboardingNext").click();
    expect(modal.querySelector('[data-step="1"]').hidden).toBe(false);
    const byok = modal.querySelector('input[value="byok"]');
    byok.checked = true;
    byok.dispatchEvent(new Event("change", { bubbles: true }));
    modal.querySelector("#lumpaOnboardingNext").click();
    expect(modal.querySelector("#lumpaAccountFields").hidden).toBe(true);
    expect(modal.querySelector("#lumpaByokFields").hidden).toBe(false);
  });

  it("shows migration recovery text without discarding the wizard", async () => {
    await loadInterface({ migrationError: "旧版动作数据损坏", providerIds: { chat: "user-primary" } });
    document.querySelector('[data-tool="onboarding"]').click();
    const modal = document.querySelector("#lumpa1Onboarding");
    modal.querySelector("#lumpaPrivacyAccepted").checked = true;
    modal.querySelector("#lumpaOnboardingNext").click();
    const byok = modal.querySelector('input[value="byok"]');
    byok.checked = true;
    byok.dispatchEvent(new Event("change", { bubbles: true }));
    modal.querySelector("#lumpaOnboardingNext").click();
    modal.querySelector("#lumpaOnboardingNext").click();
    expect(modal.querySelector("#lumpaMigrationSummary").textContent).toMatch(/旧数据仍保留/);
    expect(modal.hidden).toBe(false);
  });

  it("opens privacy controls, adds multiple rules, and exposes timeline validation", async () => {
    await loadInterface();
    document.querySelector('[data-tool="privacy"]').click();
    const privacy = document.querySelector("#lumpaPrivacyCenter");
    expect(privacy.hidden).toBe(false);
    privacy.querySelector("#lumpaRuleAdd").click();
    privacy.querySelector("#lumpaRuleAdd").click();
    expect(privacy.querySelectorAll("[data-rule-index]")).toHaveLength(2);

    document.querySelector('[data-tool="timeline"]').click();
    const timeline = document.querySelector("#lumpaTimelineEditor");
    expect(timeline.hidden).toBe(false);
    timeline.querySelector("#lumpaActionSave").click();
    expect(timeline.querySelector("#lumpaTimelineStatus").textContent).toMatch(/至少需要一帧/);
  });
});
