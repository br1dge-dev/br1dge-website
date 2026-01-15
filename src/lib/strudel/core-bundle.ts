// Strudel Core - bundled via Vite
// This file will be properly bundled with resolve aliases

// Import from bundled strudel packages
import { init as strudelInit, note, n, s, silence, play as strudelPlay } from '@strudel/core';
import { getAudioContext, webaudioOutput, playPattern } from '@strudel/webaudio';
import { transpile } from '@strudel/transpiler';

let audioCtx: AudioContext | null = null;
let isPlaying = false;

export async function init() {
  if (!audioCtx) {
    audioCtx = getAudioContext();
  }
  await audioCtx.resume();
  return { audioCtx, ready: true };
}

export async function playTrack() {
  if (!audioCtx) await init();
  
  const code = `$: n("<0 4 0 9 7>*16".add("<7 _ _ 6 5 _ _ 6>*2")).scale("g:minor").trans(-12)
  .o(3).s("sawtooth").lpf(sine.range(200, 2000).slow(8))
  .delay(.6).pan(rand)
  .fm(.8).fmwave('white')

$: n("<7 _ _ 6 5 _  <5 3> <6 4>>*2").scale("g:minor").trans(-24)
  .detune(rand)
  .o(4).s("supersaw").lpf(sine.range(400, 2000).slow(8))

$: s("hh*8").gain(0.5)

$: s("bd:2!4")
  .duck("3:4:5:6")
  .duckdepth(.8)
  .duckattack(.16)`;
  
  try {
    const patterns = transpile(code);
    await webaudioOutput(patterns, audioCtx!.currentTime);
    isPlaying = true;
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function stop() {
  if (audioCtx) {
    audioCtx.suspend();
    audioCtx.resume();
    isPlaying = false;
  }
}

export function isReady() {
  return audioCtx !== null;
}

export function getStatus() {
  return {
    ready: audioCtx !== null,
    playing: isPlaying
  };
}
