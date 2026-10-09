import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";

const desktop = Boolean(window.__TAURI_INTERNALS__);
const state = { onboardingStep: 0, accountVerified: false, challengeId: "", frames: [], previewTimer: 0, rules: [] };

function setStatus(element, message, error = false) {
  element.textContent = message;
  element.classList.toggle("error", error);
}

function currentSettings() {
  return window.LumpaApp?.getSettings?.() || window.__LUMPA_BOOTSTRAP__?.documents?.settings || {};
}

async function persistSettingsPatch(patch) {
  const settings = { ...currentSettings(), ...patch };
  window.LumpaApp?.saveSettingsPatch?.(patch);
  await invoke("storage_write_document", { kind: "settings", value: settings });
  window.__LUMPA_BOOTSTRAP__ ||= { documents: {} };
  window.__LUMPA_BOOTSTRAP__.documents.settings = settings;
  return settings;
}

function escapeAttribute(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function buildToolbar() {
  const toolbar = document.createElement("div");
  toolbar.className = "lumpa1-toolbar collapsed";
  toolbar.setAttribute("aria-label", "Lumpa 1.0 工具");
  toolbar.innerHTML = `
    <button type="button" class="lumpa1-toolbar-toggle" id="lumpa1ToolbarToggle" title="展开/收起高级工具" aria-label="工具菜单">
      <span class="icon">⚙️</span>
      <span class="label">工具</span>
    </button>
    <div class="lumpa1-toolbar-content">
      <button type="button" data-tool="privacy">隐私与备份</button>
      <button type="button" data-tool="timeline">动作时间轴</button>
      <button type="button" data-tool="onboarding">连接设置</button>
    </div>
  `;

  toolbar.addEventListener("click", (event) => {
    const toggleBtn = event.target.closest("#lumpa1ToolbarToggle");
    if (toggleBtn) {
      toolbar.classList.toggle("collapsed");
      return;
    }

    const tool = event.target.closest("[data-tool]")?.dataset.tool;
    if (tool) {
      toolbar.classList.add("collapsed");
      if (tool === "privacy") openPrivacy();
      if (tool === "timeline") openTimeline();
      if (tool === "onboarding") openOnboarding(false);
    }
  });

  document.addEventListener("click", (event) => {
    if (!toolbar.contains(event.target)) {
      toolbar.classList.add("collapsed");
    }
  });

  document.body.append(toolbar);
}

const onboarding = document.createElement("div");
onboarding.className = "lumpa1-modal hidden";
onboarding.hidden = true; onboarding.setAttribute("hidden", ""); onboarding.classList.add("hidden");
onboarding.setAttribute("hidden", "");
onboarding.id = "lumpa1Onboarding";
onboarding.innerHTML = `
  <section class="lumpa1-dialog" role="dialog" aria-modal="true" aria-labelledby="lumpa1OnboardingTitle">
    <h2 id="lumpa1OnboardingTitle">欢迎使用 Lumpa 1.0</h2>
    <p class="lumpa1-muted">数据默认只保存在本机。模型网络请求由 Rust 安全层发送，浏览器界面不能直接联网。</p>
    <div class="lumpa1-progress"><span></span></div>
    <section class="lumpa1-step" data-step="0">
      <h3>隐私选择</h3>
      <label class="lumpa1-card"><input id="lumpaPrivacyAccepted" type="checkbox" /> 我已了解聊天、记忆、宠物素材和统计保存在本机，可在隐私中心导出或删除。</label>
      <label class="lumpa1-card" style="display:block;margin-top:10px"><input id="lumpaUsageOptIn" type="checkbox" /> 启用本地使用统计（默认关闭；不自动上传）</label>
    </section>
    <section class="lumpa1-step" data-step="1" hidden>
      <h3>选择模型模式</h3>
      <div class="lumpa1-choice">
        <label><input type="radio" name="lumpaProviderMode" value="lumpa_account" checked /> <strong>Lumpa 账号</strong><p class="lumpa1-muted">邮箱验证码登录，使用每日免费额度。</p></label>
        <label><input type="radio" name="lumpaProviderMode" value="byok" /> <strong>自带 Key</strong><p class="lumpa1-muted">Key 保存在 Stronghold 加密库中，主密钥由 Windows 凭据管理器保护；模型请求不经过 Lumpa 网关。</p></label>
      </div>
    </section>
    <section class="lumpa1-step" data-step="2" hidden>
      <div id="lumpaAccountFields">
        <h3>邮箱账号登录</h3>
        <div class="lumpa1-grid">
          <label class="lumpa1-field"><span>邮箱</span><input id="lumpaLoginEmail" type="email" autocomplete="email" /></label>
          <label class="lumpa1-field"><span>邀请码（未开放注册时填写）</span><input id="lumpaInviteCode" type="text" maxlength="128" autocomplete="off" /></label>
          <div class="lumpa1-field"><span>&nbsp;</span><button class="lumpa1-button" id="lumpaSendCode" type="button">发送验证码</button></div>
          <label class="lumpa1-field"><span>6 位验证码</span><input id="lumpaLoginCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" /></label>
          <div class="lumpa1-field"><span>&nbsp;</span><button class="lumpa1-button" id="lumpaVerifyCode" type="button">验证并登录</button></div>
        </div>
      </div>
      <div id="lumpaByokFields" hidden>
        <h3>自带 Key 配置</h3>
        <div class="lumpa1-grid">
          <label class="lumpa1-field full"><span>HTTPS API Base</span><input id="lumpaByokBase" value="https://api.openai.com/v1" /></label>
          <label class="lumpa1-field full"><span>API Key</span><input id="lumpaByokKey" type="password" autocomplete="off" /></label>
          <label class="lumpa1-field"><span>聊天模型</span><input id="lumpaByokChatModel" value="gpt-5.4-mini" /></label>
          <label class="lumpa1-field"><span>语音模型</span><input id="lumpaByokSpeechModel" value="gpt-4o-mini-tts" /></label>
          <label class="lumpa1-field"><span>图片模型</span><input id="lumpaByokImageModel" value="gpt-image-2" /></label>
          <label class="lumpa1-field"><span>视频模型</span><input id="lumpaByokVideoModel" value="grok-imagine-video" /></label>
        </div>
        <button class="lumpa1-button" id="lumpaTestProvider" type="button">保存并测试聊天连通性</button>
      </div>
      <p class="lumpa1-status" id="lumpaProviderStatus"></p>
    </section>
    <section class="lumpa1-step" data-step="3" hidden>
      <h3>迁移与备份</h3>
      <div class="lumpa1-card" id="lumpaMigrationSummary"></div>
      <label class="lumpa1-card" style="display:block;margin-top:10px"><input id="lumpaBackupReminder" type="checkbox" checked /> 完成后提醒我创建口令加密备份</label>
      <p class="lumpa1-muted">备份不包含 API Key、登录令牌或系统凭据。旧版迁移回滚文件保留 30 天。</p>
    </section>
    <p class="lumpa1-status" id="lumpaOnboardingStatus"></p>
    <div class="lumpa1-actions">
      <button class="lumpa1-button" id="lumpaOnboardingClose" type="button">稍后</button>
      <button class="lumpa1-button" id="lumpaOnboardingBack" type="button">上一步</button>
      <button class="lumpa1-button primary" id="lumpaOnboardingNext" type="button">下一步</button>
    </div>
  </section>`;
document.body.append(onboarding);

const onboardingSteps = [...onboarding.querySelectorAll(".lumpa1-step")];
const onboardingStatus = onboarding.querySelector("#lumpaOnboardingStatus");
const providerStatus = onboarding.querySelector("#lumpaProviderStatus");

function selectedProviderMode() {
  return onboarding.querySelector('input[name="lumpaProviderMode"]:checked')?.value || "lumpa_account";
}

function updateProviderFields() {
  const account = selectedProviderMode() === "lumpa_account";
  onboarding.querySelector("#lumpaAccountFields").hidden = !account;
  onboarding.querySelector("#lumpaByokFields").hidden = account;
}

function renderMigrationSummary() {
  const report = window.__LUMPA_MIGRATION_REPORT__ || window.__LUMPA_BOOTSTRAP__?.migration;
  const error = window.__LUMPA_MIGRATION_ERROR__ || window.__LUMPA_BOOTSTRAP_ERROR__;
  const element = onboarding.querySelector("#lumpaMigrationSummary");
  if (error) element.textContent = `迁移未完成：${error}。旧数据仍保留，可关闭向导后重试或导出诊断。`;
  else if (report) element.textContent = `迁移完成：${report.pets || 0} 个宠物、${report.actions || 0} 个动作、${report.chats || 0} 条聊天、${report.memories || 0} 条记忆、${report.assets || 0} 个素材。`;
  else element.textContent = "未发现需要迁移的旧版数据。SQLite 数据库已准备好。";
}

function renderOnboardingStep() {
  onboardingSteps.forEach((step, index) => { step.hidden = index !== state.onboardingStep; });
  onboarding.querySelector(".lumpa1-progress span").style.width = `${((state.onboardingStep + 1) / onboardingSteps.length) * 100}%`;
  onboarding.querySelector("#lumpaOnboardingBack").disabled = state.onboardingStep === 0;
  onboarding.querySelector("#lumpaOnboardingNext").textContent = state.onboardingStep === onboardingSteps.length - 1 ? "完成" : "下一步";
  if (state.onboardingStep === 2) updateProviderFields();
  if (state.onboardingStep === 3) renderMigrationSummary();
}

async function openOnboarding(required = false) {
  onboarding.hidden = false;
  onboarding.removeAttribute("hidden");
  onboarding.classList.remove("hidden");
  onboarding.dataset.required = required ? "true" : "false";
  state.onboardingStep = 0;
  setStatus(onboardingStatus, "");
  const session = desktop ? await invoke("gateway_session_status").catch(() => null) : null;
  state.accountVerified = Boolean(session);
  renderOnboardingStep();
}

onboarding.addEventListener("click", (event) => {
  if (event.target === onboarding) {
    onboarding.hidden = true; onboarding.setAttribute("hidden", ""); onboarding.classList.add("hidden");
    persistSettingsPatch({ onboardingCompleted: true });
  }
});
onboarding.querySelectorAll('input[name="lumpaProviderMode"]').forEach((input) => input.addEventListener("change", updateProviderFields));
onboarding.querySelector("#lumpaOnboardingClose").addEventListener("click", () => {
  onboarding.hidden = true; onboarding.setAttribute("hidden", ""); onboarding.classList.add("hidden");
  persistSettingsPatch({ onboardingCompleted: true });
});
onboarding.querySelector("#lumpaOnboardingBack").addEventListener("click", () => { state.onboardingStep = Math.max(0, state.onboardingStep - 1); renderOnboardingStep(); });

onboarding.querySelector("#lumpaSendCode").addEventListener("click", async () => {
  try {
    setStatus(providerStatus, "正在发送验证码…");
    const result = await invoke("gateway_send_code", { email: onboarding.querySelector("#lumpaLoginEmail").value, inviteCode: onboarding.querySelector("#lumpaInviteCode").value });
    state.challengeId = result.challengeId;
    setStatus(providerStatus, `验证码已发送，${result.retryAfterSeconds || 60} 秒后可重发。`);
  } catch (error) { setStatus(providerStatus, String(error), true); }
});

onboarding.querySelector("#lumpaVerifyCode").addEventListener("click", async () => {
  try {
    if (!state.challengeId) throw new Error("请先发送验证码。");
    setStatus(providerStatus, "正在验证…");
    const session = await invoke("gateway_verify_code", { challengeId: state.challengeId, code: onboarding.querySelector("#lumpaLoginCode").value, deviceName: `Windows Lumpa ${navigator.platform || "Desktop"}` });
    await invoke("save_provider_profile", { profile: { id: "lumpa-account", name: "Lumpa 账号", mode: "lumpa_account", apiBase: "", chatModel: "gpt-5.4-mini", speechModel: "gpt-4o-mini-tts", imageModel: "gpt-image-2", videoModel: "grok-imagine-video" }, apiKey: null });
    window.__LUMPA_PROVIDER_MODE__ = "lumpa_account";
    window.__LUMPA_PROVIDER_IDS__ = { chat: "lumpa-account", tts: "lumpa-account", media: "lumpa-account" };
    state.accountVerified = true;
    setStatus(providerStatus, `已登录 ${session.emailMasked || "Lumpa 账号"}。`);
  } catch (error) { setStatus(providerStatus, String(error), true); }
});

async function saveByokProfile(test = false) {
  const apiBase = onboarding.querySelector("#lumpaByokBase").value.trim();
  const apiKey = onboarding.querySelector("#lumpaByokKey").value.trim();
  const profile = {
    id: "user-primary", name: "我的模型供应商", mode: "bring_your_own_key", apiBase,
    chatModel: onboarding.querySelector("#lumpaByokChatModel").value.trim(), speechModel: onboarding.querySelector("#lumpaByokSpeechModel").value.trim(),
    imageModel: onboarding.querySelector("#lumpaByokImageModel").value.trim(), videoModel: onboarding.querySelector("#lumpaByokVideoModel").value.trim(),
  };
  if (!apiKey) throw new Error("请填写自己的 API Key。");
  await invoke("save_provider_profile", { profile, apiKey });
  window.__LUMPA_PROVIDER_MODE__ = "byok";
  window.__LUMPA_PROVIDER_IDS__ = { chat: profile.id, tts: profile.id, media: profile.id };
  if (test) {
    const settings = currentSettings();
    await persistSettingsPatch({ permissions: { ...(settings.permissions || {}), chatNetwork: true } });
    const result = await invoke("model_chat", { payload: { providerId: profile.id, messages: [{ role: "user", content: "只回复：连接成功" }], temperature: 0, maxTokens: 20 } });
    setStatus(providerStatus, `连接正常：${result.reply}`);
  } else setStatus(providerStatus, "供应商配置已安全保存。");
  onboarding.querySelector("#lumpaByokKey").value = "";
}

onboarding.querySelector("#lumpaTestProvider").addEventListener("click", async () => {
  try { setStatus(providerStatus, "正在测试…"); await saveByokProfile(true); }
  catch (error) { setStatus(providerStatus, String(error), true); }
});

onboarding.querySelector("#lumpaOnboardingNext").addEventListener("click", async () => {
  try {
    setStatus(onboardingStatus, "");
    if (state.onboardingStep === 0 && !onboarding.querySelector("#lumpaPrivacyAccepted").checked) throw new Error("请先确认本地数据和隐私说明。");
    if (state.onboardingStep === 2) {
      if (selectedProviderMode() === "lumpa_account" && !state.accountVerified) throw new Error("请先完成邮箱登录。");
      if (selectedProviderMode() === "byok" && window.__LUMPA_PROVIDER_IDS__?.chat !== "user-primary") await saveByokProfile(false);
    }
    if (state.onboardingStep < onboardingSteps.length - 1) { state.onboardingStep += 1; renderOnboardingStep(); return; }
    const settings = currentSettings();
    const usageStats = onboarding.querySelector("#lumpaUsageOptIn").checked;
    await persistSettingsPatch({ onboardingCompleted: true, providerMode: selectedProviderMode(), permissions: { ...(settings.permissions || {}), usageStats } });
    onboarding.hidden = true; onboarding.setAttribute("hidden", ""); onboarding.classList.add("hidden");
    if (onboarding.querySelector("#lumpaBackupReminder").checked) openPrivacy();
  } catch (error) { setStatus(onboardingStatus, String(error), true); }
});

const privacy = document.createElement("div");
privacy.className = "lumpa1-modal hidden";
privacy.hidden = true; privacy.setAttribute("hidden", ""); privacy.classList.add("hidden");
privacy.setAttribute("hidden", "");
privacy.id = "lumpaPrivacyCenter";
privacy.innerHTML = `
  <section class="lumpa1-dialog wide" role="dialog" aria-modal="true" aria-labelledby="lumpaPrivacyTitle">
    <h2 id="lumpaPrivacyTitle">隐私、备份与监督规则</h2>
    <p class="lumpa1-muted">所有导出均由你手动触发，诊断默认不上传。加密备份永不包含 Key、令牌和系统凭据。</p>
    <div class="lumpa1-actions" style="justify-content:flex-start"><button class="lumpa1-button" id="lumpaDiagnosticsPreview" type="button">预览脱敏诊断</button><button class="lumpa1-button" id="lumpaDiagnosticsExport" type="button">手动导出诊断包</button></div>
    <pre class="lumpa1-card lumpa1-muted" id="lumpaDiagnosticsExcerpt" hidden style="white-space:pre-wrap;max-height:220px;overflow:auto"></pre>
    <div class="lumpa1-summary" id="lumpaPrivacySummary"></div>
    <h3>Lumpa 账号与设备</h3>
    <div class="lumpa1-actions" style="justify-content:flex-start"><button class="lumpa1-button" id="lumpaAccountRefresh" type="button">查看账号与设备</button><button class="lumpa1-button" id="lumpaAccountLogout" type="button">退出当前设备</button><button class="lumpa1-button danger" id="lumpaAccountDelete" type="button">永久注销账号</button></div>
    <div class="lumpa1-card lumpa1-muted" id="lumpaAccountSummary">当前未读取账号信息。</div>
    <h3>分类删除</h3><div class="lumpa1-category-list" id="lumpaCategoryList"></div>
    <h3>口令加密备份</h3>
    <div class="lumpa1-grid">
      <label class="lumpa1-field"><span>备份口令（至少 10 字符）</span><input id="lumpaBackupPassphrase" type="password" autocomplete="new-password" /></label>
      <div class="lumpa1-actions"><button class="lumpa1-button primary" id="lumpaBackupCreate" type="button">创建 .lumpa-backup</button><button class="lumpa1-button" id="lumpaBackupRestore" type="button">恢复备份</button></div>
    </div>
    <h3>宠物包</h3>
    <div class="lumpa1-actions" style="justify-content:flex-start"><button class="lumpa1-button" id="lumpaPetExport" type="button">导出当前宠物</button><button class="lumpa1-button" id="lumpaPetImport" type="button">导入 .lumpa-pet</button></div>
    <h3>月度使用统计</h3>
    <div class="lumpa1-grid">
      <label class="lumpa1-field"><span>月份</span><input id="lumpaUsageMonth" type="month" /></label>
      <div class="lumpa1-actions"><button class="lumpa1-button" id="lumpaUsageMonthView" type="button">查看月汇总</button><button class="lumpa1-button" id="lumpaUsageCsv" type="button">导出 CSV</button></div>
    </div>
    <div class="lumpa1-card lumpa1-muted" id="lumpaMonthSummary">选择月份查看统计。</div>
    <h3>多条监督规则</h3>
    <div id="lumpaRuleList"></div>
    <div class="lumpa1-actions" style="justify-content:flex-start"><button class="lumpa1-button" id="lumpaRuleAdd" type="button">新增规则</button><button class="lumpa1-button primary" id="lumpaRuleSave" type="button">保存规则</button></div>
    <p class="lumpa1-status" id="lumpaPrivacyStatus"></p>
    <div class="lumpa1-actions"><button class="lumpa1-button" id="lumpaPrivacyClose" type="button">关闭</button></div>
  </section>`;
document.body.append(privacy);
const privacyStatus = privacy.querySelector("#lumpaPrivacyStatus");
const monthParts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit" }).formatToParts(new Date());
privacy.querySelector("#lumpaUsageMonth").value = `${monthParts.find((part) => part.type === "year")?.value}-${monthParts.find((part) => part.type === "month")?.value}`;
const categories = [["chat", "聊天记录"], ["memory", "记忆"], ["usage", "使用统计"], ["rules", "监督规则"], ["pets", "宠物与动作"], ["settings", "应用设置"], ["logs", "本地日志"], ["rollback_backups", "迁移回滚备份"]];

function newRule() {
  return { id: `rule-${crypto.randomUUID()}`, name: "新监督规则", enabled: true, dailyLimitMinutes: 60, scheduleStart: "09:00", scheduleEnd: "18:00", cooldownMinutes: 30, recoveryMinutes: 15, appPattern: "", notify: true };
}

function renderRules() {
  privacy.querySelector("#lumpaRuleList").innerHTML = state.rules.map((rule, index) => `
    <div class="lumpa1-rule" data-rule-index="${index}">
      <label class="lumpa1-field"><span>名称</span><input data-field="name" value="${escapeAttribute(rule.name)}" /></label>
      <label class="lumpa1-field"><span>日限额/分钟</span><input data-field="dailyLimitMinutes" type="number" min="0" max="1440" value="${Number(rule.dailyLimitMinutes || 0)}" /></label>
      <label class="lumpa1-field"><span>开始</span><input data-field="scheduleStart" type="time" value="${escapeAttribute(rule.scheduleStart || "")}" /></label>
      <label class="lumpa1-field"><span>结束</span><input data-field="scheduleEnd" type="time" value="${escapeAttribute(rule.scheduleEnd || "")}" /></label>
      <label class="lumpa1-field"><span>冷却/分钟</span><input data-field="cooldownMinutes" type="number" min="0" max="1440" value="${Number(rule.cooldownMinutes || 0)}" /></label>
      <label class="lumpa1-field"><span>恢复/分钟</span><input data-field="recoveryMinutes" type="number" min="0" max="1440" value="${Number(rule.recoveryMinutes || 0)}" /></label>
      <button class="lumpa1-button danger" type="button" data-remove-rule="${index}">删除</button>
      <label class="lumpa1-field"><span>应用匹配（可空）</span><input data-field="appPattern" value="${escapeAttribute(rule.appPattern || "")}" /></label>
      <label><input data-field="enabled" type="checkbox" ${rule.enabled ? "checked" : ""} /> 启用</label>
      <label><input data-field="notify" type="checkbox" ${rule.notify ? "checked" : ""} /> 系统通知</label>
    </div>`).join("");
}

async function refreshPrivacy() {
  const summary = await invoke("privacy_summary");
  privacy.querySelector("#lumpaPrivacySummary").innerHTML = Object.entries({ 宠物: summary.pets, 动作: summary.actions, 聊天: summary.chats, 记忆: summary.memories, 统计天数: summary.usageDays, 规则: summary.usageRules, 素材: summary.assets, 日志: summary.logFiles, 回滚备份: summary.rollbackBackups })
    .map(([label, count]) => `<div><strong>${Number(count || 0)}</strong><span>${label}</span></div>`).join("");
  privacy.querySelector("#lumpaCategoryList").innerHTML = categories.map(([key, label]) => `<div class="lumpa1-category"><span>${label}</span><button class="lumpa1-button danger" type="button" data-delete-category="${key}">删除</button></div>`).join("");
  state.rules = await invoke("load_usage_rules");
  renderRules();
}

async function openPrivacy() {
  privacy.hidden = false;
  privacy.removeAttribute("hidden");
  privacy.classList.remove("hidden");
  try { await refreshPrivacy(); setStatus(privacyStatus, ""); }
  catch (error) { setStatus(privacyStatus, String(error), true); }
}

privacy.querySelector("#lumpaPrivacyClose").addEventListener("click", () => { privacy.hidden = true; privacy.setAttribute("hidden", ""); privacy.classList.add("hidden"); });
privacy.querySelector("#lumpaAccountRefresh").addEventListener("click", async () => {
  try {
    const account = await invoke("gateway_account_info");
    const sessions = Array.isArray(account.sessions) ? account.sessions : [];
    privacy.querySelector("#lumpaAccountSummary").innerHTML = `<strong>${escapeAttribute(account.emailMasked || "Lumpa 账号")}</strong><p>当前有效设备：${sessions.length}</p>${sessions.map((item) => `<div class="lumpa1-category"><span>${escapeAttribute(item.device_name || item.deviceName || "设备")}</span><button class="lumpa1-button danger" type="button" data-revoke-device="${escapeAttribute(item.device_id || item.deviceId || "")}">撤销</button></div>`).join("")}`;
  } catch (error) { setStatus(privacyStatus, String(error), true); }
});
privacy.querySelector("#lumpaAccountSummary").addEventListener("click", async (event) => {
  const deviceId = event.target.closest("[data-revoke-device]")?.dataset.revokeDevice;
  if (!deviceId || !window.confirm("确认撤销该设备会话？")) return;
  try { await invoke("gateway_revoke_device", { deviceId }); privacy.querySelector("#lumpaAccountRefresh").click(); }
  catch (error) { setStatus(privacyStatus, String(error), true); }
});
privacy.querySelector("#lumpaAccountLogout").addEventListener("click", async () => {
  try { await invoke("gateway_logout"); state.accountVerified = false; privacy.querySelector("#lumpaAccountSummary").textContent = "已退出当前设备。"; }
  catch (error) { setStatus(privacyStatus, String(error), true); }
});
privacy.querySelector("#lumpaAccountDelete").addEventListener("click", async () => {
  if (!window.confirm("永久注销会删除网关账号、设备会话和额度流水，且无法撤销。确认继续？")) return;
  const confirmation = window.prompt("请输入 DELETE 确认永久注销账号：", "");
  if (confirmation !== "DELETE") return;
  try { await invoke("gateway_delete_account", { confirmation }); state.accountVerified = false; privacy.querySelector("#lumpaAccountSummary").textContent = "账号已永久注销。"; }
  catch (error) { setStatus(privacyStatus, String(error), true); }
});
privacy.querySelector("#lumpaDiagnosticsPreview").addEventListener("click", async () => {
  try {
    const preview = await invoke("diagnostics_preview");
    const excerpt = privacy.querySelector("#lumpaDiagnosticsExcerpt");
    excerpt.hidden = false;
    excerpt.textContent = `${preview.redactionNotice}\n\n文件：${preview.files.join("、") || "暂无日志"}\n\n${preview.excerpt || "暂无诊断内容"}`;
  } catch (error) { setStatus(privacyStatus, String(error), true); }
});
privacy.querySelector("#lumpaDiagnosticsExport").addEventListener("click", async () => {
  try {
    const preview = await invoke("diagnostics_preview");
    if (!window.confirm(`${preview.redactionNotice}\n确认导出当前预览对应的诊断包？`)) return;
    const destination = await save({ defaultPath: `lumpa-diagnostics-${new Date().toISOString().slice(0, 10)}.zip`, filters: [{ name: "Diagnostic ZIP", extensions: ["zip"] }] });
    if (!destination) return;
    await invoke("diagnostics_export", { destination });
    setStatus(privacyStatus, "脱敏诊断包已导出，未自动上传。");
  } catch (error) { setStatus(privacyStatus, String(error), true); }
});
privacy.querySelector("#lumpaCategoryList").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-category]");
  if (!button) return;
  const [key, label] = categories.find(([item]) => item === button.dataset.deleteCategory) || [];
  if (!key || !window.confirm(`确定永久删除${label}？此操作不能撤销。`)) return;
  try { await invoke("privacy_delete_category", { category: key }); await refreshPrivacy(); setStatus(privacyStatus, `${label}已删除。`); }
  catch (error) { setStatus(privacyStatus, String(error), true); }
});

privacy.querySelector("#lumpaBackupCreate").addEventListener("click", async () => {
  try {
    const passphrase = privacy.querySelector("#lumpaBackupPassphrase").value;
    const destination = await save({ defaultPath: `lumpa-${new Date().toISOString().slice(0, 10)}.lumpa-backup`, filters: [{ name: "Lumpa Backup", extensions: ["lumpa-backup"] }] });
    if (!destination) return;
    await invoke("create_encrypted_backup", { destination, passphrase });
    privacy.querySelector("#lumpaBackupPassphrase").value = "";
    setStatus(privacyStatus, "加密备份已创建。");
  } catch (error) { setStatus(privacyStatus, String(error), true); }
});

privacy.querySelector("#lumpaBackupRestore").addEventListener("click", async () => {
  try {
    const passphrase = privacy.querySelector("#lumpaBackupPassphrase").value;
    const source = await open({ multiple: false, filters: [{ name: "Lumpa Backup", extensions: ["lumpa-backup"] }] });
    if (!source || !window.confirm("恢复会替换当前同类数据。继续吗？")) return;
    await invoke("restore_encrypted_backup", { source, passphrase });
    privacy.querySelector("#lumpaBackupPassphrase").value = "";
    setStatus(privacyStatus, "备份已恢复，重启 Lumpa 后完整生效。");
    await refreshPrivacy();
  } catch (error) { setStatus(privacyStatus, String(error), true); }
});

privacy.querySelector("#lumpaPetExport").addEventListener("click", async () => {
  try {
    const pet = window.LumpaApp?.getActivePet?.();
    if (!pet?.id) throw new Error("当前没有可导出的宠物。");
    const destination = await save({ defaultPath: `${String(pet.name || "pet").replace(/[\\/:*?"<>|]/g, "_")}.lumpa-pet`, filters: [{ name: "Lumpa Pet", extensions: ["lumpa-pet"] }] });
    if (!destination) return;
    await invoke("export_pet_package", { petId: pet.id, destination });
    setStatus(privacyStatus, "宠物包已导出。");
  } catch (error) { setStatus(privacyStatus, String(error), true); }
});

privacy.querySelector("#lumpaPetImport").addEventListener("click", async () => {
  try {
    const source = await open({ multiple: false, filters: [{ name: "Lumpa Pet", extensions: ["lumpa-pet"] }] });
    if (!source) return;
    try { await invoke("import_pet_package", { source, replaceExisting: false }); }
    catch (error) {
      if (!String(error).includes("ID 已存在") || !window.confirm("宠物 ID 已存在，是否替换？")) throw error;
      await invoke("import_pet_package", { source, replaceExisting: true });
    }
    setStatus(privacyStatus, "宠物包已导入，重启后显示。");
    await refreshPrivacy();
  } catch (error) { setStatus(privacyStatus, String(error), true); }
});

privacy.querySelector("#lumpaUsageMonthView").addEventListener("click", async () => {
  try {
    const month = privacy.querySelector("#lumpaUsageMonth").value;
    const snapshot = await invoke("usage_month_snapshot", { month });
    const active = snapshot.days.reduce((sum, day) => sum + Number(day.activeSeconds || 0), 0);
    const idle = snapshot.days.reduce((sum, day) => sum + Number(day.idleSeconds || 0), 0);
    const top = snapshot.apps.slice(0, 5).map((app) => `${app.appName} ${Math.round(app.activeSeconds / 60)} 分钟`).join("、") || "无应用记录";
    privacy.querySelector("#lumpaMonthSummary").textContent = `${month}：活跃 ${Math.round(active / 60)} 分钟，空闲 ${Math.round(idle / 60)} 分钟，共 ${snapshot.days.length} 天。主要应用：${top}。`;
  } catch (error) { setStatus(privacyStatus, String(error), true); }
});

privacy.querySelector("#lumpaUsageCsv").addEventListener("click", async () => {
  try {
    const month = privacy.querySelector("#lumpaUsageMonth").value;
    const destination = await save({ defaultPath: `lumpa-usage-${month}.csv`, filters: [{ name: "CSV", extensions: ["csv"] }] });
    if (!destination) return;
    await invoke("usage_export_csv", { month, destination });
    setStatus(privacyStatus, "月度使用统计 CSV 已导出。");
  } catch (error) { setStatus(privacyStatus, String(error), true); }
});

privacy.querySelector("#lumpaRuleAdd").addEventListener("click", () => { state.rules.push(newRule()); renderRules(); });
privacy.querySelector("#lumpaRuleList").addEventListener("click", (event) => {
  const value = event.target.closest("[data-remove-rule]")?.dataset.removeRule;
  if (value === undefined) return;
  const index = Number(value);
  if (Number.isInteger(index)) { state.rules.splice(index, 1); renderRules(); }
});
privacy.querySelector("#lumpaRuleSave").addEventListener("click", async () => {
  try {
    state.rules = [...privacy.querySelectorAll("[data-rule-index]")].map((row, index) => {
      const existing = state.rules[index] || newRule();
      const get = (field) => row.querySelector(`[data-field="${field}"]`);
      return { ...existing, name: get("name").value.trim(), dailyLimitMinutes: Number(get("dailyLimitMinutes").value), scheduleStart: get("scheduleStart").value || null, scheduleEnd: get("scheduleEnd").value || null, cooldownMinutes: Number(get("cooldownMinutes").value), recoveryMinutes: Number(get("recoveryMinutes").value), appPattern: get("appPattern").value.trim() || null, enabled: get("enabled").checked, notify: get("notify").checked };
    });
    await invoke("save_usage_rules", { rules: state.rules });
    setStatus(privacyStatus, "监督规则已保存。");
  } catch (error) { setStatus(privacyStatus, String(error), true); }
});

const timeline = document.createElement("div");
timeline.className = "lumpa1-modal hidden";
timeline.hidden = true; timeline.setAttribute("hidden", ""); timeline.classList.add("hidden");
timeline.setAttribute("hidden", "");
timeline.id = "lumpaTimelineEditor";
timeline.innerHTML = `
  <section class="lumpa1-dialog wide" role="dialog" aria-modal="true" aria-labelledby="lumpaTimelineTitle">
    <h2 id="lumpaTimelineTitle">帧时间轴动作编辑器</h2>
    <p class="lumpa1-muted">最多 48 帧。保存前会缩放到 1024 像素内、检查透明背景并生成预览帧。</p>
    <div class="lumpa1-timeline-layout">
      <div>
        <div class="lumpa1-grid">
          <label class="lumpa1-field"><span>动作名称</span><input id="lumpaActionName" value="自定义动作" maxlength="32" /></label>
          <label class="lumpa1-field"><span>添加帧</span><input id="lumpaFrameFiles" type="file" accept="image/png,image/webp,image/jpeg" multiple /></label>
          <label class="lumpa1-field"><span>循环起始帧</span><input id="lumpaLoopStart" type="number" min="1" value="1" /></label>
          <label class="lumpa1-field"><span>循环结束帧</span><input id="lumpaLoopEnd" type="number" min="1" value="1" /></label>
          <label class="lumpa1-field"><span>脚底锚点 X（0-1）</span><input id="lumpaAnchorX" type="number" min="0" max="1" step="0.01" value="0.5" /></label>
          <label class="lumpa1-field"><span>脚底锚点 Y（0-1）</span><input id="lumpaAnchorY" type="number" min="0" max="1" step="0.01" value="0.92" /></label>
          <label class="lumpa1-field"><span>裁剪缩放</span><input id="lumpaCropScale" type="range" min="0.5" max="1.5" step="0.01" value="1" /></label>
          <label class="lumpa1-field"><span>动作类型</span><select id="lumpaActionType"><option value="custom">自定义</option><option value="idle">待机循环</option><option value="happy">开心</option><option value="wave">打招呼</option><option value="sleep">睡觉循环</option><option value="talk">说话装饰</option></select></label>
        </div>
        <div class="lumpa1-frame-list" id="lumpaFrameList"></div>
      </div>
      <div>
        <div class="lumpa1-preview"><img id="lumpaTimelinePreview" alt="动作预览" /></div>
        <p class="lumpa1-status" id="lumpaTimelineStatus"></p>
        <div class="lumpa1-actions"><button class="lumpa1-button" id="lumpaPreviewToggle" type="button">播放预览</button><button class="lumpa1-button primary" id="lumpaActionSave" type="button">保存到当前宠物</button></div>
      </div>
    </div>
    <div class="lumpa1-actions"><button class="lumpa1-button" id="lumpaTimelineClose" type="button">关闭</button></div>
  </section>`;
document.body.append(timeline);
const timelineStatus = timeline.querySelector("#lumpaTimelineStatus");

async function optimizeFrame(file) {
  if (file.size > 12 * 1024 * 1024) throw new Error(`${file.name} 超过 12 MB。`);
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  if (width * height > 16 * 1024 * 1024) { bitmap.close(); throw new Error(`${file.name} 像素数量过大。`); }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.clearRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const pixels = context.getImageData(0, 0, width, height).data;
  let transparent = false;
  const step = Math.max(4, Math.floor(pixels.length / 16000 / 4) * 4);
  for (let index = 3; index < pixels.length; index += step) {
    if (pixels[index] < 250) { transparent = true; break; }
  }
  return { src: canvas.toDataURL("image/png", 0.92), duration: 80, transparent, width, height };
}

function renderFrames() {
  timeline.querySelector("#lumpaFrameList").innerHTML = state.frames.map((frame, index) => `
    <div class="lumpa1-frame-row" data-frame-index="${index}">
      <img src="${frame.src}" alt="第 ${index + 1} 帧" />
      <span>第 ${index + 1} 帧 · ${frame.width}×${frame.height}${frame.transparent ? " · 透明" : " · 不透明"}</span>
      <label class="lumpa1-field"><span>毫秒</span><input data-duration type="number" min="20" max="1000" value="${frame.duration}" /></label>
      <div class="lumpa1-frame-controls"><button type="button" data-move="up">↑</button><button type="button" data-move="down">↓</button><button type="button" data-move="delete">×</button></div>
    </div>`).join("");
  const max = Math.max(1, state.frames.length);
  timeline.querySelector("#lumpaLoopStart").max = max;
  timeline.querySelector("#lumpaLoopEnd").max = max;
  timeline.querySelector("#lumpaLoopEnd").value = Math.min(max, Number(timeline.querySelector("#lumpaLoopEnd").value) || max);
  if (state.frames[0]) timeline.querySelector("#lumpaTimelinePreview").src = state.frames[0].src;
  setStatus(timelineStatus, `${state.frames.length} 帧；${state.frames.filter((frame) => frame.transparent).length} 帧检测到透明像素。`);
}

function stopPreview() {
  window.clearTimeout(state.previewTimer);
  state.previewTimer = 0;
  timeline.querySelector("#lumpaPreviewToggle").textContent = "播放预览";
}

function startPreview() {
  if (!state.frames.length) { setStatus(timelineStatus, "请先添加动作帧。", true); return; }
  stopPreview();
  let index = 0;
  const loopStart = Math.max(0, Number(timeline.querySelector("#lumpaLoopStart").value || 1) - 1);
  const loopEnd = Math.min(state.frames.length - 1, Number(timeline.querySelector("#lumpaLoopEnd").value || state.frames.length) - 1);
  const tick = () => {
    const frame = state.frames[index];
    timeline.querySelector("#lumpaTimelinePreview").src = frame.src;
    timeline.querySelector("#lumpaTimelinePreview").style.transform = `scale(${timeline.querySelector("#lumpaCropScale").value})`;
    index = index >= loopEnd ? loopStart : index + 1;
    state.previewTimer = window.setTimeout(tick, frame.duration);
  };
  timeline.querySelector("#lumpaPreviewToggle").textContent = "停止预览";
  tick();
}

function openTimeline() {
  timeline.hidden = false;
  state.frames = [];
  renderFrames();
}

timeline.querySelector("#lumpaTimelineClose").addEventListener("click", () => { stopPreview(); timeline.hidden = true; timeline.setAttribute("hidden", ""); timeline.classList.add("hidden"); });
timeline.querySelector("#lumpaFrameFiles").addEventListener("change", async (event) => {
  try {
    const files = [...event.target.files].slice(0, 48 - state.frames.length);
    for (const file of files) state.frames.push(await optimizeFrame(file));
    renderFrames();
  } catch (error) { setStatus(timelineStatus, String(error), true); }
  event.target.value = "";
});
timeline.querySelector("#lumpaFrameList").addEventListener("input", (event) => {
  const row = event.target.closest("[data-frame-index]");
  if (row && event.target.matches("[data-duration]")) state.frames[Number(row.dataset.frameIndex)].duration = Math.max(20, Math.min(1000, Number(event.target.value) || 80));
});
timeline.querySelector("#lumpaFrameList").addEventListener("click", (event) => {
  const row = event.target.closest("[data-frame-index]");
  const move = event.target.closest("[data-move]")?.dataset.move;
  if (!row || !move) return;
  const index = Number(row.dataset.frameIndex);
  if (move === "delete") state.frames.splice(index, 1);
  if (move === "up" && index > 0) [state.frames[index - 1], state.frames[index]] = [state.frames[index], state.frames[index - 1]];
  if (move === "down" && index < state.frames.length - 1) [state.frames[index + 1], state.frames[index]] = [state.frames[index], state.frames[index + 1]];
  renderFrames();
});
timeline.querySelector("#lumpaPreviewToggle").addEventListener("click", () => { if (state.previewTimer) stopPreview(); else startPreview(); });
timeline.querySelector("#lumpaActionSave").addEventListener("click", () => {
  try {
    if (!state.frames.length) throw new Error("动作至少需要一帧。");
    const loopStart = Math.max(0, Math.min(state.frames.length - 1, Number(timeline.querySelector("#lumpaLoopStart").value || 1) - 1));
    const loopEnd = Math.max(loopStart, Math.min(state.frames.length - 1, Number(timeline.querySelector("#lumpaLoopEnd").value || state.frames.length) - 1));
    const action = {
      id: `timeline-${crypto.randomUUID()}`, name: timeline.querySelector("#lumpaActionName").value.trim() || "自定义动作", type: timeline.querySelector("#lumpaActionType").value,
      frames: state.frames.map((frame) => frame.src), durations: state.frames.map((frame) => frame.duration), preview: state.frames[0].src,
      totalDurationMs: state.frames.reduce((sum, frame) => sum + frame.duration, 0), loopStart, loopEnd,
      anchor: { x: Number(timeline.querySelector("#lumpaAnchorX").value), y: Number(timeline.querySelector("#lumpaAnchorY").value) },
      crop: { scale: Number(timeline.querySelector("#lumpaCropScale").value), x: 0, y: 0 },
      hasTransparentBackground: state.frames.every((frame) => frame.transparent), backgroundRemoved: false, backgroundRemoval: "timeline-editor", createdAt: Date.now(),
    };
    window.LumpaApp?.saveTimelineAction?.(action);
    setStatus(timelineStatus, "动作已保存到当前宠物，并生成了预览帧。");
  } catch (error) { setStatus(timelineStatus, String(error), true); }
});

buildToolbar();
// Onboarding is accessible on-demand via toolbar/settings button
