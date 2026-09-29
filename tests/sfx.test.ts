import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function engine(path = 'src/lib/audio/tone/SFXEngine.ts') {
  let ramps = 0, releases = 0, timerId = 0;
  const timers = new Map<number, () => void>();
  const signal = { linearRampTo() { ramps++; } };
  const node = { gain: signal, frequency: signal, triggerAttack() {}, triggerRelease() { releases++; }, start() {}, stop() {}, dispose() {} };
  const context = vm.createContext({ exports: {}, require: () => ({}), setTimeout(fn: () => void) { timers.set(++timerId, fn); return timerId; }, clearTimeout(id: number) { timers.delete(id); } });
  vm.runInContext(ts.transpile(readFileSync(path, 'utf8'), { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }), context);
  const sfx = vm.runInContext('exports.SFXEngine', context);
  Object.assign(sfx, { initialized: true, crackleNoise: node, crackleGain: node, crackleLFO: node, attractSynth: node, attractGain: node, attractFilter: node, attractVibrato: node });
  return { sfx, timers, ramps: () => ramps, releases: () => releases };
}

test('continuous sound updates are bounded independently of refresh rate', () => {
  const { sfx, timers, ramps } = engine();
  for (let i = 0; i < 144 * 60; i++) { sfx.setChamberCrackling(5); sfx.setBridgeAttraction(1); }
  assert.equal(ramps(), 5);
  for (let i = 0; i < 144; i++) { sfx.setChamberCrackling(0); sfx.setBridgeAttraction(0); }
  assert.equal(timers.size, 2);
  assert.equal(ramps(), 7);
});

test('reactivating during a fade cancels stale stops without retriggering', () => {
  const { sfx, timers, releases } = engine();
  sfx.setChamberCrackling(2); sfx.setBridgeAttraction(.6);
  sfx.setChamberCrackling(0); sfx.setBridgeAttraction(0);
  assert.equal(timers.size, 2);
  sfx.setChamberCrackling(3); sfx.setBridgeAttraction(.8);
  assert.equal(timers.size, 0);
  assert.equal(releases(), 0);
  sfx.setChamberCrackling(0); sfx.setBridgeAttraction(0);
  for (const callback of timers.values()) callback();
  assert.equal(releases(), 2);
});

test('disposing cancels delayed sound work and permits fresh initialization', () => {
  const { sfx, timers, ramps } = engine();
  sfx.setBridgeAttraction(1); sfx.setBridgeAttraction(0); sfx.dispose();
  assert.equal(timers.size, 0);
  sfx.initialized = true; const before = ramps(); sfx.setBridgeAttraction(1);
  assert.equal(ramps() - before, 3);
});

if (process.env.SFX_BASELINE) {
  for (const path of [process.env.SFX_BASELINE, 'src/lib/audio/tone/SFXEngine.ts']) {
    const e = engine(path);
    for (let i = 0; i < 144 * 60; i++) { e.sfx.setChamberCrackling(5); e.sfx.setBridgeAttraction(1); }
    for (let i = 0; i < 144; i++) { e.sfx.setChamberCrackling(0); e.sfx.setBridgeAttraction(0); }
    console.log(path, { ramps: e.ramps(), pendingStops: e.timers.size });
  }
}
