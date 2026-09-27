import { test } from 'node:test';
import assert from 'node:assert/strict';
import { availableDischarge, drawDischargeLink, type DischargeState } from '../src/lib/game/discharge.ts';
const state: DischargeState = {
  blocked: false, tutorial: false, tutorialSubPhase: 0, ready: true,
  energy: .6, requiredEnergy: .6, chamberCount: 5, chamberThreshold: 5,
  ringsEmitted: true, inverted: false, redStack: 0, colorsComplete: false,
  level: 0, levelCap: 10, energyThreshold: .2,
};
test('colored release needs every requirement, not only the old readiness flag', () => {
  assert.equal(availableDischarge(state), 'color');
  for (const missing of [{energy:.59}, {chamberCount:4}, {ringsEmitted:false}, {ready:false}, {blocked:true}]) {
    assert.equal(availableDischarge({...state, ...missing}), null);
  }
});
test('tutorial and post-color releases use their own requirements', () => {
  assert.equal(availableDischarge({...state,tutorial:true,chamberCount:0}), 'tutorial');
  assert.equal(availableDischarge({...state,tutorial:true,tutorialSubPhase:2}), null);
  assert.equal(availableDischarge({...state,colorsComplete:true,chamberCount:0,energy:.2}), 'level');
  assert.equal(availableDischarge({...state,colorsComplete:true,chamberCount:0,energy:.19}), null);
  assert.equal(availableDischarge({...state,inverted:true,redStack:1,energy:0}), 'level');
  assert.equal(availableDischarge({...state,inverted:true,redStack:1,level:10}), null);
});
test('cue remains finite when cursor and core overlap', () => {
  let saves=0, restores=0;
  const ctx = new Proxy({}, {get: (_,name) => (...args: unknown[]) => {
    if (name === 'save') saves++;
    if (name === 'restore') restores++;
    for (const arg of args) if (typeof arg === 'number') assert.ok(Number.isFinite(arg));
  }}) as CanvasRenderingContext2D;
  for (const cursorX of [100, 101, 350]) {
    drawDischargeLink(ctx,{coreX:100,coreY:100,cursorX,cursorY:100,coreRadius:40,time:1234,color:'#fff'});
  }
  assert.equal(saves, restores);
});
