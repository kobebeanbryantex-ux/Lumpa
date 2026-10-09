/**
 * Lumpa companion interoperability protocol.
 *
 * Hardware transports (BLE/USB/serial) are adapters only. They send command.*
 * envelopes into FocusEngine.applyExternalCommand and forward state.* envelopes
 * emitted through `lumpa:companion-event`. Business and audio logic stay here.
 */

export const COMPANION_PROTOCOL_VERSION = 1;

export const COMPANION_COMMANDS = Object.freeze({
  SELECT_DURATION: "command.timer.select",
  START_TIMER: "command.timer.start",
  CANCEL_TIMER: "command.timer.cancel",
  SET_MUTED: "command.audio.mute",
});

export const COMPANION_EVENTS = Object.freeze({
  DURATION_SELECTED: "state.timer.duration-selected",
  TIMER_STARTED: "state.timer.started",
  TIMER_COMPLETED: "state.timer.completed",
  TIMER_INTERRUPTED: "state.timer.interrupted",
  TODO_COMPLETED: "state.todo.completed",
  REWARD_GRANTED: "state.reward.granted",
  PET_GREW: "state.pet.grew",
  PET_EQUIPPED: "state.pet.equipped",
  AUDIO_MUTED: "state.audio.muted",
});

let envelopeSequence = 0;

export function createCompanionEnvelope(type, payload = {}, options = {}) {
  envelopeSequence += 1;
  return {
    protocol: "lumpa-companion",
    version: COMPANION_PROTOCOL_VERSION,
    id: options.id || `software-${Date.now()}-${envelopeSequence}`,
    direction: type.startsWith("command.") ? "command" : "state",
    source: options.source || "software",
    type,
    timestamp: options.timestamp || Date.now(),
    payload: payload && typeof payload === "object" ? payload : {},
  };
}

export function validateCompanionCommand(envelope) {
  if (!envelope || typeof envelope !== "object") return { ok: false, reason: "invalid-envelope" };
  if (envelope.protocol !== "lumpa-companion") return { ok: false, reason: "invalid-protocol" };
  if (envelope.version !== COMPANION_PROTOCOL_VERSION) return { ok: false, reason: "unsupported-version" };
  if (envelope.direction !== "command" || !String(envelope.type || "").startsWith("command.")) {
    return { ok: false, reason: "not-a-command" };
  }
  if (!Object.values(COMPANION_COMMANDS).includes(envelope.type)) return { ok: false, reason: "unknown-command" };
  if (!envelope.id || typeof envelope.id !== "string") return { ok: false, reason: "missing-id" };
  return { ok: true };
}
