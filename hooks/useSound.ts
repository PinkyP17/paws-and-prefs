// src/hooks/useSound.ts

type SoundType = "like" | "pass" | "swipe" | "undo";

// Module-level singleton — one AudioContext shared across all hook calls,
// persists for the entire page lifetime so nodes are never GC'd mid-playback.
let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!sharedCtx) {
      sharedCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
    return sharedCtx;
  } catch {
    return null;
  }
}

function playLike(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sine";
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
  osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.28, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.25);
}

function playPass(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sine";
  osc.frequency.setValueAtTime(280, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

function playSwipe(ctx: AudioContext, isLike: boolean) {
  const bufferSize = ctx.sampleRate * 0.12;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = isLike ? 1800 : 1200;
  filter.Q.value = 0.8;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(ctx.currentTime);
}

function playUndo(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sine";
  osc.frequency.setValueAtTime(330, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(495, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.18);
}

export function useSound() {
  const play = (type: SoundType, isLike?: boolean) => {
    try {
      const ctx = getCtx();
      if (!ctx) return;

      // Resume if browser suspended due to autoplay policy
      if (ctx.state === "suspended") ctx.resume();

      switch (type) {
        case "like":
          playLike(ctx);
          break;
        case "pass":
          playPass(ctx);
          break;
        case "swipe":
          playSwipe(ctx, !!isLike);
          break;
        case "undo":
          playUndo(ctx);
          break;
      }
    } catch {
      // Non-critical — fail silently
    }
  };

  return { play };
}
