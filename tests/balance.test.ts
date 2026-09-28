import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spiralSpeedModifier } from '../src/lib/game/balance.ts';

test('even the fastest roll respects the early, middle and late game caps', () => {
  assert.equal(spiralSpeedModifier(0, false, .8), 2);
  assert.equal(spiralSpeedModifier(2, false, .8), 2);
  assert.equal(spiralSpeedModifier(3, false, .8), 3);
  assert.equal(spiralSpeedModifier(6, false, .8), 4);
});
test('post-credits retains fast enemies, while slow rolls remain slow', () => {
  assert.equal(spiralSpeedModifier(10, true, .8), 8);
  assert.equal(spiralSpeedModifier(20, true, .9), 1);
  assert.equal(spiralSpeedModifier(0, false, .9), 1);
});
