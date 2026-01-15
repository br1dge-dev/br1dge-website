/**
 * Strudel PoC Controller
 * Tests basic Strudel functionality for br1dge integration
 */

import { initStrudel, note, n, s, hush } from '@strudel/web';

let initialized = false;

// Track code for visualization
export const TRACK_CODE = {
  lead: `n("<0 4 0 9 7>*16".add("<7 _ _ 6 5 _ _ 6>*2"))
  .scale("g:minor").trans(-12)
  .o(3).s("sawtooth")
  .lpf(sine.range(200, 2000).slow(8))
  .delay(.6).pan(rand)
  .fm(.8).fmwave('white')`,
  
  bass: `n("<7 _ _ 6 5 _ <5 3> <6 4>>*2")
  .scale("g:minor").trans(-24)
  .detune(rand)
  .o(4).s("supersaw")
  .lpf(sine.range(400, 2000).slow(8))`,
  
  hihat: `s("hh*8").gain(0.5)`,
  
  kick: `s("bd:2!4")
  .duck("3:4:5:6")
  .duckdepth(.8)
  .duckattack(.16)`
};

// State
export const state = {
  intensity: 0.5,
  leadEnabled: true,
  bassEnabled: true,
  hihatEnabled: true,
  kickEnabled: true
};

export async function init(): Promise<boolean> {
  if (initialized) return true;
  
  try {
    await initStrudel();
    initialized = true;
    return true;
  } catch (err) {
    console.error('Strudel init error:', err);
    throw err;
  }
}

export function isReady(): boolean {
  return initialized;
}

export function playFullTrack(): void {
  if (!initialized) throw new Error('Not initialized');
  
  // Layer 1: Lead melody (sawtooth) - using note() directly with octave in note name
  note("<g3 c4 g3 f4 d4>*16")
    .s("sawtooth")
    .lpf(1200)
    .delay(0.6)
    .gain(0.4)
    .play();
  
  // Layer 2: Bass (supersaw) - lower octave
  note("<d2 c2 bb1 g1>*2")
    .s("supersaw")
    .lpf(800)
    .gain(0.3)
    .play();
  
  // Layer 3: Hi-hats
  s("hh*8")
    .gain(0.3)
    .play();
  
  // Layer 4: Kick
  s("bd:2!4")
    .gain(0.5)
    .play();
}

export function stop(): void {
  if (!initialized) return;
  hush();
}

export function setIntensity(value: number): void {
  state.intensity = Math.max(0, Math.min(1, value));
}

export function triggerSfx(): void {
  if (!initialized) throw new Error('Not initialized');
  
  // One-shot in G minor
  note("g4")
    .s("triangle")
    .decay(0.3)
    .sustain(0)
    .gain(0.5)
    .play();
}

// Get all track code as string for visualization
export function getTrackCodeString(): string {
  return Object.entries(TRACK_CODE)
    .map(([name, code]) => `// ${name}\n${code}`)
    .join('\n\n');
}
