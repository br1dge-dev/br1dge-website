import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameClock } from '../src/lib/game/clock.ts';

for (const hz of [30, 60, 120, 144]) {
  test(`every animation frame at ${hz} Hz updates immediately`, () => {
    const clock = new GameClock(0);
    let steps = 0;
    for (let frame = 0; frame <= hz; frame++) clock.advance(frame * 1000 / hz, () => steps++);
    assert.equal(steps, hz + 1);
    assert.ok(Math.abs(clock.now - 1000) < 1e-6);
  });
}
test('pausing freezes time and timers without catching up on resume', () => {
  const clock = new GameClock(0);
  let fired = false;
  clock.schedule(() => { fired = true; }, 50);
  clock.advance(0, () => {});
  clock.advance(20, () => {});
  const before = clock.now;
  clock.setPaused(true);
  clock.advance(10000, () => assert.fail('paused update'));
  assert.equal(clock.now, before);
  assert.equal(fired, false);
  clock.setPaused(false);
  clock.advance(11000, () => {});
  assert.equal(clock.now, before);
  clock.advance(11050, () => {});
  assert.equal(fired, true);
});
test('reset cancels pending transitions and a stall never causes catch-up redraws', () => {
  const clock = new GameClock(0);
  clock.schedule(() => assert.fail('stale transition'), 10);
  clock.clearTimers();
  let steps = 0;
  clock.advance(0, () => steps++);
  clock.advance(10000, () => steps++);
  assert.equal(steps, 2);
  assert.equal(clock.now, 10000);
});
test('a timer can pause the game without running another gameplay step', () => {
  const clock = new GameClock(0);
  clock.schedule(() => clock.setPaused(true), 10);
  clock.advance(0, () => {});
  clock.advance(100, () => assert.fail('gameplay behind modal'));
  assert.equal(clock.paused, true);
});

test('cursor retains the original 25% response on every 120 Hz frame', () => {
  const clock = new GameClock(0);
  let cursor = 0;
  clock.advance(0, () => { cursor += (100 - cursor) * .25; });
  assert.equal(cursor, 25);
  clock.advance(1000 / 120, () => { cursor += (100 - cursor) * .25; });
  assert.equal(cursor, 43.75);
  clock.advance(2000 / 120, () => { cursor += (100 - cursor) * .25; });
  assert.equal(cursor, 57.8125);
});
