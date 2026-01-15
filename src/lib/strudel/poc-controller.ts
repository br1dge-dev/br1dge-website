/**
 * Strudel PoC Controller
 * Tests basic Strudel functionality for br1dge integration
 */

// @ts-nocheck - Strudel types are incomplete
import { initStrudel } from '@strudel/web';

let initialized = false;
let repl: any = null;

// Track code for visualization
export const TRACK_CODE = {
  lead: `note("<g3 c4 g3 f4 d4>*16")
  .s("sawtooth").lpf(1200)
  .delay(0.6).gain(0.4)`,
  
  bass: `note("<d2 c2 bb1 g1>*2")
  .s("supersaw").lpf(800).gain(0.3)`,
  
  hihat: `s("hh*8").gain(0.3)`,
  
  kick: `s("bd:2!4").gain(0.5)`
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
    // initStrudel returns the repl/context we need
    repl = await initStrudel();
    initialized = true;
    console.log('Strudel initialized, repl:', repl);
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
  
  // Try using the evaluate function from the repl
  const code = `
    stack(
      note("<g3 c4 g3 f4 d4>*8").s("sawtooth").lpf(1200).gain(0.3),
      note("<d2 c2 bb1 g1>*2").s("square").lpf(600).gain(0.2),
      s("hh*8").gain(0.2),
      s("bd*4").gain(0.4)
    )
  `;
  
  try {
    // The initStrudel makes functions globally available
    // We can use eval to run Strudel code
    const result = eval(code);
    console.log('Eval result:', result);
    
    // If result is a pattern, try to play it
    if (result && typeof result.play === 'function') {
      result.play();
      console.log('Called play()');
    }
  } catch (err) {
    console.error('Play error:', err);
    throw err;
  }
}

export function stop(): void {
  if (!initialized) return;
  try {
    // hush should be globally available after initStrudel
    if (typeof (window as any).hush === 'function') {
      (window as any).hush();
    } else if (typeof (globalThis as any).hush === 'function') {
      (globalThis as any).hush();
    } else {
      // Try eval
      eval('hush()');
    }
  } catch (err) {
    console.error('Stop error:', err);
  }
}

export function setIntensity(value: number): void {
  state.intensity = Math.max(0, Math.min(1, value));
}

export function triggerSfx(): void {
  if (!initialized) throw new Error('Not initialized');
  
  try {
    eval(`note("g4").s("triangle").decay(0.3).sustain(0).gain(0.5).play()`);
  } catch (err) {
    console.error('SFX error:', err);
  }
}

export function getTrackCodeString(): string {
  return Object.entries(TRACK_CODE)
    .map(([name, code]) => `// ${name}\n${code}`)
    .join('\n\n');
}
