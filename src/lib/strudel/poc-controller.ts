/**
 * Strudel PoC Controller
 * Tests basic Strudel functionality for br1dge integration
 * 
 * GOAL: App controls Strudel music dynamically based on game events
 */

// @ts-nocheck - Strudel types are incomplete
import { initStrudel } from '@strudel/web';

let initialized = false;
let repl: any = null;

// Track code - adapted for @strudel/web
// Using note names with octaves for lead, scale + note names for bass
export const TRACK_CODE = `
$: n("<0 4 0 9 7>*16".add("<7 _ _ 6 5 _ _ 6>*2"))
  .scale("g:minor")
  .s("sawtooth")
  .lpf(sine.range(200, 2000).slow(8))
  .delay(.6)
  .pan(rand)
  .fm(.8)
  .gain(0.4)

$: n("<7 _ _ 6 5 _ <5 3> <6 4>>*2")
  .scale("g:minor")
  .s("sawtooth")
  .lpf(sine.range(400, 2000).slow(8))
  .gain(0.3)

$: s("hh*8").gain(0.4)

$: s("bd:2!4").gain(0.5)
`;

// State for future dynamic control
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
    // initStrudel returns the repl context with evaluate function
    repl = await initStrudel();
    console.log('Strudel initialized, REPL methods:', Object.keys(repl));
    
    // Load default samples - wrap in try/catch as it may return undefined
    try {
      await repl.evaluate(`await samples('github:tidalcycles/dirt-samples')`);
      console.log('Samples loaded');
    } catch (e) {
      console.log('Sample load note:', e);
    }
    
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

export async function playFullTrack(): Promise<void> {
  if (!initialized || !repl) throw new Error('Not initialized');
  
  try {
    // Use the repl.evaluate() function - this is how the REPL runs code!
    console.log('Evaluating track code via repl.evaluate()...');
    await repl.evaluate(TRACK_CODE);
    console.log('Track started!');
  } catch (err) {
    console.error('Play error:', err);
    throw err;
  }
}

export async function stop(): Promise<void> {
  if (!initialized || !repl) return;
  try {
    await repl.evaluate('hush()');
    console.log('Stopped');
  } catch (err) {
    console.error('Stop error:', err);
  }
}

export function setIntensity(value: number): void {
  state.intensity = Math.max(0, Math.min(1, value));
  // TODO: Update running pattern parameters
}

export async function triggerSfx(): Promise<void> {
  if (!initialized || !repl) throw new Error('Not initialized');
  
  try {
    // One-shot sound in G minor (matching the track)
    await repl.evaluate(`note("g4").s("sine").decay(0.2).sustain(0).gain(0.4).play()`);
  } catch (err) {
    console.error('SFX error:', err);
  }
}

// Get the track code for display
export function getTrackCode(): string {
  return TRACK_CODE.trim();
}
