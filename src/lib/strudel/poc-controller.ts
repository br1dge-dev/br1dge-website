/**
 * Strudel PoC Controller
 * Tests basic Strudel functionality for br1dge integration
 */

// Import at module level - Vite will bundle this
import { initStrudel, note, s, hush } from '@strudel/web';

let initialized = false;

// State that patterns will read
export const state = {
  intensity: 0.5,
  leadEnabled: true,
  bassEnabled: false,
  hihatEnabled: false,
  kickEnabled: false
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

export function playPattern(): void {
  if (!initialized) throw new Error('Not initialized');
  
  // Simple test pattern - your track melody
  note("<0 4 0 9 7>*16")
    .scale("g:minor")
    .s("sawtooth")
    .lpf(200 + state.intensity * 1800)
    .gain(state.intensity * 0.5)
    .delay(0.6)
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
  
  // One-shot test
  note("g4")
    .s("triangle")
    .decay(0.3)
    .sustain(0)
    .gain(0.5)
    .play();
}
