import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

async function music() {
  const timers: Array<() => void> = [];
  const sources: Array<{ stopped: boolean; stop(): void }> = [];
  const gains: Array<{ value: number; target: number }> = [];
  const rawContext = {
    currentTime: 10, destination: {},
    createGain() {
      const gain = { value: 0, target: 0, cancelScheduledValues() {}, setValueAtTime(v: number) { this.value = v; }, linearRampToValueAtTime(v: number) { this.target = v; } };
      gains.push(gain); return { gain, connect() {}, disconnect() {} };
    },
    async decodeAudioData() { return {}; },
    createBufferSource() {
      const source = { stopped: false, connect() {}, disconnect() {}, start() {}, stop() { this.stopped = true; } };
      sources.push(source); return source;
    },
  };
  const context = vm.createContext({ exports: {}, console: {log() {}},
    require: () => ({getContext: () => ({rawContext}), dbToGain: () => 1}),
    fetch: async () => ({ok: true, arrayBuffer: async () => new ArrayBuffer(0)}),
    setTimeout(fn: () => void) { timers.push(fn); },
  });
  vm.runInContext(ts.transpile(readFileSync('src/lib/audio/tone/MusicLoopSystem.ts', 'utf8'), { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }), context);
  const loops = vm.runInContext('exports.MusicLoopSystem', context);
  await loops.init(); loops.setLevel(1); await loops.start();
  return { loops, timers, sources, gains };
}

test('returning from silent tutorial to same track restores volume', async () => {
  const {loops, gains} = await music();
  loops.setLevel(0); assert.equal(gains[1].target, 0);
  loops.setLevel(1); assert.equal(gains[1].target, 1);
});

test('delayed stop cannot kill replacement music sources', async () => {
  const {loops, sources, timers, gains} = await music();
  loops.stop(); await loops.start();
  for (const timer of timers) timer();
  assert.equal(sources.slice(0, 4).every(source => source.stopped), true);
  assert.equal(sources.slice(4).some(source => source.stopped), false);
  assert.equal(gains[1].target, 1);
});
