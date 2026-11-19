// Read physical cursor/button state so transparent-window moves and lost
// WebView pointer capture cannot leave a drag stuck or cut it short.
export function createNativePetDrag({ invoke, onMove, onClick, onError, delay = 20 }) {
  let active;
  async function sample(state) {
    try {
      const point = await invoke("desktop_drag_sample", { anchor: state.anchor || null });
      if (active !== state) return;
      const [x, y, cursorX, cursorY, pressed] = point;
      state.anchor ||= [x, y, cursorX, cursorY];
      const dx = cursorX - (state.cursorX ?? cursorX);
      const dy = cursorY - (state.cursorY ?? cursorY);
      state.cursorX = cursorX;
      state.cursorY = cursorY;
      const moved = Math.hypot(cursorX - state.anchor[2], cursorY - state.anchor[3]) > 3;
      state.moved ||= moved;
      if (state.moved) await onMove({ dx, dy, walking: pressed });
      if (active !== state) return;
      if (!pressed) {
        active = undefined;
        if (!state.moved) onClick();
        return;
      }
      state.timer = setTimeout(() => sample(state), delay);
    } catch (error) {
      if (active === state) { active = undefined; onError(error); }
    }
  }
  return {
    start() {
      if (active) return;
      const state = active = { moved: false };
      sample(state);
    },
    cancel() { clearTimeout(active?.timer); active = undefined; },
  };
}
