const key = "lumpa.sharedFocusSession.v1";
export function attachSharedFocus(engine) {
  if (engine.sharedFocus) return engine.sharedFocus;
  const listeners = new Set();
  const originalStart = engine.startFocus.bind(engine);
  const originalAbandon = engine.abandonFocus.bind(engine);
  let working = false;
  const read = () => {
    try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
  };
  function refresh() {
    const session = read();
    engine.state = session?.state || "idle";
    if (session?.state === "focusing") engine.targetDuration = session.duration;
    engine.startTime = session?.start || 0;
    engine.remainingSeconds = session?.state === "focusing" ? Math.max(0, Math.ceil((session.end - Date.now()) / 1000)) : session?.remaining ?? engine.targetDuration;
    engine.ensureTodayTodos();
    engine.todos = engine.loadTodos();
    engine.stats = engine.loadStats();
    engine.giftBackpack = engine.loadGiftBackpack();
    engine.trashBackpack = engine.loadTrashBackpack();
    engine.petGrowth = engine.loadPetGrowth();
    engine.updateDisplayTimer();
    listeners.forEach(listener => listener(session));
    return session;
  }
  async function exclusive(action) {
    if (!navigator.locks) throw new Error("当前浏览器需要更新才能同步专注计时。");
    return navigator.locks.request("lumpa.sharedFocus.v1", async () => {
      refresh();
      const result = await action();
      refresh();
      return result;
    });
  }
  engine.startFocus = () => {
    const duration = engine.targetDuration;
    return exclusive(() => {
      if (read()?.state === "focusing") return;
      engine.targetDuration = duration;
      originalStart();
      clearInterval(engine.timerInterval);
      engine.timerInterval = null;
      localStorage.setItem(key, JSON.stringify({ id: crypto.randomUUID(), state: "focusing", pet: engine.equipped.petId,
        start: engine.startTime, end: engine.startTime + engine.targetDuration * 1000, duration: engine.targetDuration }));
    });
  };
  engine.abandonFocus = () => exclusive(() => {
    const session = read();
    if (session?.state !== "focusing") return;
    originalAbandon();
    localStorage.setItem(key, JSON.stringify({ ...session, state: engine.state, remaining: engine.remainingSeconds }));
  });
  const controller = {
    refresh, read, subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    changeTodo(action) { return exclusive(() => action(engine)); },
    start(minutes, pet) {
      return exclusive(() => {
        if (read()?.state === "focusing") return;
        engine.targetDuration = Math.min(120, Math.max(1, Number(minutes) || 25)) * 60;
        engine.equipped.petId = pet;
        originalStart();
        clearInterval(engine.timerInterval);
        engine.timerInterval = null;
        localStorage.setItem(key, JSON.stringify({ id: crypto.randomUUID(), state: "focusing", pet,
          start: engine.startTime, end: engine.startTime + engine.targetDuration * 1000, duration: engine.targetDuration }));
      });
    },
  };
  engine.sharedFocus = controller;
  const timer = setInterval(async () => {
    const session = refresh();
    if (working || session?.state !== "focusing" || session.end > Date.now()) return;
    working = true;
    try {
      await exclusive(() => {
        const current = read();
        if (current?.state !== "focusing" || current.end > Date.now()) return;
        const equipped = engine.equipped.petId;
        engine.equipped.petId = current.pet;
        engine.completeFocus();
        engine.equipped.petId = equipped;
        localStorage.setItem(key, JSON.stringify({ ...current, state: "reward", remaining: 0 }));
      });
    } finally { working = false; }
  }, 500);
  window.addEventListener("storage", refresh);
  window.addEventListener("pagehide", () => clearInterval(timer), { once: true });
  refresh();
  return controller;
}
