/**
 * Lumpa 2.0 像素音效与空间声学引擎 (Web Audio API Synthesizer & Sound Effects)
 * 纯算法生成无损像素音效与治愈 BGM，100% 零外部资源依赖
 */

export class LumpaAudio {
  constructor() {
    this.ctx = null;
    this.bgmOsc = null;
    this.isMuted = false;
    this.currentBgm = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  // 播放标准 8-bit / 16-bit 像素音效
  playSfx(type) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === "click") {
        osc.type = "square";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "pop") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === "eat") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(330, now + 0.04);
        osc.frequency.setValueAtTime(440, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === "pet") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "water") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "dig") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "harvest") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn("Audio play error:", e);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

export const lumpaAudio = new LumpaAudio();
