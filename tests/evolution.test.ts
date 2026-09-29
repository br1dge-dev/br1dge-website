import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GravityField, contactDamage, hazardSize, ringRadius, chargePull, chapterFor, musicFor, type FieldInput, type Hazard } from '../src/lib/game/evolution.ts';
const input: FieldInput = { now: 0, width: 1280, height: 720, cursorX: 900, cursorY: 450, energy: 0, level: 4, afterglow: false, tutorial: false, completing: false };
const hazard = (x = 300, y = 360): Hazard => ({ x, y, vx: 0, vy: 0, born: -2000, phase: 0, grazed: false, trail: [] });

test('charge attracts hazards more strongly without changing cursor input', () => {
  assert.equal(chargePull(0), 0); assert.equal(chargePull(1), 1);
  function simulate(energy: number) {
    const field = new GravityField(); field.reset(0); field.safeReturns = 1; field.hazards = [hazard(640, 100)];
    for (let now = 0; now <= 1000; now += 16) field.update({ ...input, energy, now });
    return field.hazards[0];
  }
  assert.ok(simulate(1).x > simulate(0).x + 20);
});

test('three separate impacts end a run, with a recovery window and no level penalty', () => {
  const field = new GravityField(); field.reset(0);
  field.hazards = [hazard(640, 360), hazard(640, 360)];
  const first = field.update(input);
  assert.equal(first.hit, true); assert.equal(field.integrity, 2); assert.equal(field.hazards.length, 0);
  field.hazards = [hazard(640, 360)];
  assert.equal(field.update({ ...input, now: 1000 }).hit, false);
  for (const now of [4000, 8000]) {
    field.hazards = [hazard(640, 360)]; field.update({ ...input, now });
  }
  assert.equal(field.integrity, 0);
  assert.equal(field.update({ ...input, now: 9000 }).died, true);
  assert.equal(input.level, 4);
});

test('warning time is harmless and contact damage has a recovery window', () => {
  const field = new GravityField(); field.reset(0); field.hazards = [{ ...hazard(900, 450), born: 0 }];
  assert.equal(field.update(input).grazed, false);
  assert.equal(field.update({ ...input, energy: 1, now: 1700 }).grazed, true);
  assert.equal(field.update({ ...input, energy: 1, now: 2500 }).grazed, false);
  assert.equal(field.update({ ...input, energy: 1, now: 4000 }).grazed, true);
  assert.equal(field.integrity, 3);
});

test('release pushes nearby threats out and coincident positions stay finite', () => {
  const field = new GravityField(); field.reset(0); field.hazards = [hazard(750, 360)];
  field.release(1, 640, 360); assert.ok(field.hazards[0].vx > 0);
  field.hazards = [hazard(900, 450)];
  field.update(input); field.update({ ...input, now: 16, energy: 1 });
  assert.ok(Number.isFinite(field.hazards[0].vx));
});

test('tutorial and completion do not introduce new dangers', () => {
  for (const flag of ['tutorial', 'completing']) {
    const field = new GravityField(); field.reset(0);
    field.update({ ...input, now: 60000, [flag]: true });
    assert.equal(field.hazards.length, 0);
  }
});

test('afterglow changes both rule and music instead of staying on the final track', () => {
  assert.equal(chapterFor(10, false).id, 'breakthrough');
  assert.equal(chapterFor(10, true).id, 'echo');
  assert.equal(chapterFor(14, true).id, 'tides');
  assert.equal(chapterFor(17, true).id, 'binary');
  assert.equal(chapterFor(20, true).id, 'harmony');
  assert.equal(new Set([musicFor(10, true), musicFor(14, true), musicFor(17, true)]).size, 3);
});

test('bounded elapsed-time physics behaves consistently across display refresh rates', () => {
  const simulate = (hz: number) => {
    const field = new GravityField(); field.reset(0); field.hazards = [hazard(400, 100)];
    for (let i = 0; i <= hz * 2; i++) field.update({ ...input, now: i * 1000 / hz, energy: .7 });
    return field.hazards[0];
  };
  const a = simulate(60), b = simulate(144);
  assert.ok(Math.hypot(a.x - b.x, a.y - b.y) < 2);
});

test('resizing preserves a threat position relative to the bridge', () => {
  const field = new GravityField(); field.reset(0); field.hazards = [hazard(1000, 500)];
  field.update(input);
  field.update({ ...input, width: 640, height: 360 });
  assert.equal(field.hazards[0].x, 500);
  assert.equal(field.hazards[0].y, 250);
  assert.equal(field.integrity, 3);
});


test('an escaped chase rewards once, while a grazing contact earns no reward', () => {
  const field = new GravityField(); field.reset(0);
  field.hazards = [{ ...hazard(650, 100), approached: true, vx: -30 }];
  assert.ok(field.update(input).reward);
  assert.equal(field.update(input).reward, undefined);
  field.hazards = [{ ...hazard(650, 100), approached: true, grazed: true, vx: -30 }];
  assert.equal(field.update(input).reward, undefined);
});

test('multiple threats unlock only after a chase and a successful return', () => {
  const field = new GravityField(); field.reset(0); field.update(input);
  field.hazards = [hazard(100, 100)]; field.nextSpawn = 0;
  field.release(1, 640, 360); field.update({ ...input, now: 10 });
  assert.equal(field.hazards.length, 1);
  field.encountered = true; field.release(11, 640, 360);
  field.update({ ...input, now: 20 });
  assert.equal(field.hazards.length, 2);
});


test('heart pickup grants eight seconds, increases enemy supply and rewards only once', () => {
  const field = new GravityField(); field.reset(0); field.update(input);
  field.heart = { x: input.cursorX, y: input.cursorY, born: 0 };
  field.hazards = [hazard(100, 100)];
  field.update({ ...input, now: 100 });
  assert.equal(field.heart, null);
  assert.equal(field.powerActive(8099), true);
  assert.equal(field.powerActive(8100), false);
  assert.equal(field.hazards.length, 2);
  assert.equal(field.takePowerReward(500), 2);
  assert.equal(field.takePowerReward(500), 1);
  field.reset(600);
  assert.equal(field.powerActive(600), false);
});

test('contact cancels power and missed hearts disappear without activation', () => {
  const field = new GravityField(); field.reset(0); field.powerUntil = 8000;
  field.hazards = [hazard(input.cursorX, input.cursorY)];
  assert.equal(field.update({ ...input, energy: 1 }).grazed, true);
  assert.equal(field.takePowerReward(1), 1);
  field.hazards = []; field.heart = { x: 10, y: 10, born: 0 };
  field.update({ ...input, now: 11000 });
  assert.equal(field.heart, null);
  assert.equal(field.powerActive(11000), false);
});


test('outer ring collision scales damage with level and actual enemy size', () => {
  assert.equal(contactDamage(1, 4), 1);
  assert.equal(contactDamage(1, 7), 2);
  assert.equal(contactDamage(14, 7), 4);
  const field = new GravityField(); field.reset(0);
  field.hazards = [hazard(input.cursorX + ringRadius(1) + 2, input.cursorY)];
  const result = field.update({ ...input, energy: 1, level: 7 });
  assert.equal(result.grazed, true);
  assert.equal(result.damage, contactDamage(7, hazardSize(0)));
  assert.equal(result.died, false);
});

test('crossing a threat between frames still hits and zero remaining rings is lethal', () => {
  for (const energy of [0, .2, .1]) {
    const field = new GravityField(); field.reset(0);
    field.update({ ...input, cursorX: 700, cursorY: 100, energy });
    field.hazards = [hazard(800, 100)];
    const result = field.update({ ...input, cursorX: 900, cursorY: 100, energy, now: 33 });
    assert.equal(result.grazed, true);
    assert.equal(result.died, true);
  }
});
