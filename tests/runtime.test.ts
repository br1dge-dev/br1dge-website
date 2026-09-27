import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { availableDischarge, drawDischargeLink } from '../src/lib/game/discharge.ts';
import { CHARGE } from '../src/lib/game/charge.ts';
import { GameClock } from '../src/lib/game/clock.ts';
import { spiralSpeedModifier } from '../src/lib/game/balance.ts';
import * as constants from '../src/lib/game/types.ts';

// Execute the real runtime with inert platform services; no production test hooks.
function game() {
  class Element {
    style: Record<string, string> = {};
    textContent = '';
    hidden = false;
    attributes = new Map<string, string>();
    classList = { add() {}, toggle() {} };
    addEventListener() {}
    setAttribute(name: string, value: string) { this.attributes.set(name, value); }
    getAttribute(name: string) { return this.attributes.get(name); }
    remove() {}
    querySelector() { return new Element(); }
    querySelectorAll() { return []; }
  }
  const context2d = new Proxy({}, { get: (_, key) => key === 'measureText' ? () => ({ width: 10 }) :
    key === 'createRadialGradient' || key === 'createLinearGradient' ? () => ({ addColorStop() {} }) : () => {} });
  const canvas = Object.assign(new Element(), { getContext: () => context2d });
  const elements = new Map<string, Element>([['canvas', canvas]]);
  const getElement = (id: string) => {
    if (!elements.has(id)) elements.set(id, new Element());
    return elements.get(id);
  };
  const audioState = {
    muted: false, initialized: false, ready: false, initCalls: 0, resumeCalls: 0,
    async init() { this.initCalls++; this.initialized = true; },
    async resume() { this.resumeCalls++; this.ready = true; },
    toggleMute() { this.muted = !this.muted; return this.muted; },
  };
  const audio = new Proxy(audioState, {
    get(target, key) { return key in target ? target[key as keyof typeof target] : () => {}; },
  });
  const context = vm.createContext({
    audioStub: audioState,
    console, Date, Math: Object.create(Math), Element, exports: {},
    window: { innerWidth: 1280, innerHeight: 720, addEventListener() {} },
    navigator: { maxTouchPoints: 0 },
    document: { hidden: false, getElementById: getElement, addEventListener() {}, body: new Element() },
    requestAnimationFrame() {}, setTimeout() {},
    require(path: string) {
      if (path.endsWith('/discharge')) return { availableDischarge, drawDischargeLink };
      if (path.endsWith('/charge')) return { CHARGE };
      if (path.endsWith('/clock')) return { GameClock };
      if (path.endsWith('/balance')) return { spiralSpeedModifier };
      if (path.endsWith('/types')) return constants;
      if (path.endsWith('/color')) return { hexToRgba: () => '#fff', colorToHue: () => 0, desaturate: (color: string) => color };
      if (path.endsWith('/tone')) return { ToneAudioSystem: audio };
      if (path.endsWith('/HapticManager')) return { HapticManager: new Proxy({}, { get: () => () => {} }) };
      throw new Error(`Unexpected import: ${path}`);
    },
  });
  const source = readFileSync(new URL('../src/lib/game/runtime.ts', import.meta.url), 'utf8');
  vm.runInContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, context);
  return (code: string) => vm.runInContext(code, context);
}

test('restart after endgame restores tutorial and cancels stale completion callbacks', () => {
  const run = game();
  run(`postCreditsMode = true; gamePhase = 4; tutorialSubPhase = 2;
    currentColorPhase = 3; isInverted = true; canvas.style.filter = 'invert(1)';
    spiralEnemy.active = true; youDiedActive = true;
    clock.schedule(() => { gameCompleted = true; }, 10);
    resetRun(); clock.advance(0, () => {}); clock.advance(100, () => {});`);
  assert.equal(run('gamePhase'), 0);
  assert.equal(run('tutorialSubPhase'), 0);
  assert.equal(run('getCurrentRings()'), 2);
  assert.equal(run('postCreditsMode || gameCompleted || youDiedActive || spiralEnemy.active || isInverted'), false);
  assert.equal(run('canvas.style.filter'), '');
});

test('death checkpoint restores colored phase and gives a full spawn grace period', () => {
  const run = game();
  run('postCreditsMode = true; currentColorPhase = 3; resetFromYouDied();');
  assert.equal(run('upgradeLevel'), 2);
  assert.equal(run('gamePhase'), 1);
  assert.equal(run('chamberActive'), true);
  assert.equal(run('ringsMax'), 3);
  assert.equal(run('postCreditsMode'), false);
  assert.equal(run('lastSpiralSpawnTime'), run('clock.now'));
});

test('enemy at the exact cursor position is defeated without invalid coordinates', () => {
  const run = game();
  run(`gamePhase = 1; spiralEnemy.active = true;
    spiralEnemy.x = cursorX = 200; spiralEnemy.y = cursorY = 200;
    updateAndDrawSpiralEnemy();`);
  assert.equal(run('spiralEnemy.active'), false);
  assert.equal(run('Number.isFinite(spiralEnemy.x) && Number.isFinite(spiralEnemy.y)'), true);
});

test('a new run starts with a bounded supply of collectable particles', () => {
  const run = game();
  assert.ok(run('ambientParticles.length') >= CHARGE.startingParticles);
  assert.ok(run('ambientParticles.length') <= run('getScaledParticleParams().maxParticles'));
});

test('20 ordinary stars fill a ring equally in tutorial and later phases', () => {
  for (const phase of [0, 1]) {
    const run = game();
    run(`gamePhase = ${phase}; cursorEnergy = 0; isIdle = false;
      logoReadyForDischarge = false; ambientParticles.length = 0;
      Math.random = () => .99;
      for (let i = 0; i < 20; i++) {
        ambientParticles.push({x:cursorX, y:cursorY, vx:0, vy:0,
          size:1, alpha:1, twinkle:0, absorbed:false, isSuperStar:false});
        drawAmbientParticles();
      }`);
    assert.ok(Math.abs(run('cursorEnergy') - .2) < 1e-8);
  }
});

test('40 ordinary stars unlock the first tutorial release and energy never overflows', () => {
  const run = game();
  run(`ambientParticles.length = 0; cursorEnergy = 0; isIdle = false;
    Math.random = () => .99;
    for (let i = 0; i < 40; i++) {
      ambientParticles.push({x:cursorX, y:cursorY, vx:0, vy:0,
        size:1, alpha:1, twinkle:0, absorbed:false, isSuperStar:false});
      drawAmbientParticles();
    }
    checkTutorialProgression();`);
  assert.equal(run('logoReadyForDischarge'), true);
  run(`gamePhase = 1; cursorEnergy = .99;
    ambientParticles.push({x:cursorX, y:cursorY, vx:0, vy:0,
      size:1, alpha:1, twinkle:0, absorbed:false, isSuperStar:true});
    drawAmbientParticles();`);
  assert.equal(run('cursorEnergy'), 1);
});

test('ordinary activation hides the hint only after audio becomes ready', async () => {
  const run = game();
  assert.equal(run('soundHint.hidden'), false);
  await run('initAudioOnInteraction()');
  assert.equal(run('soundHint.hidden'), true);
  assert.equal(run('audioStub.muted'), false);
  assert.equal(run('soundToggleBtn.getAttribute("aria-label")'), 'Mute sound');
});

test('blocked audio retains the hint and retries on the next interaction', async () => {
  const run = game();
  run('audioStub.resume = async () => { audioStub.resumeCalls++; };');
  assert.equal(await run('initAudioOnInteraction()'), false);
  assert.equal(run('soundHint.hidden'), false);
  run('audioStub.resume = async () => { audioStub.resumeCalls++; audioStub.ready = true; };');
  assert.equal(await run('initAudioOnInteraction()'), true);
  assert.equal(run('soundHint.hidden'), true);
});

test('overlapping gestures share activation and respect an explicit mute', async () => {
  const run = game();
  await run('Promise.all([initAudioOnInteraction(), initAudioOnInteraction(), initAudioOnInteraction()])');
  assert.equal(run('audioStub.initCalls'), 1);
  assert.equal(run('audioStub.resumeCalls'), 1);
  await run('toggleSound()');
  assert.equal(run('audioStub.muted'), true);
  await run('initAudioOnInteraction()');
  assert.equal(run('audioStub.muted'), true);
  assert.equal(run('soundToggleBtn.getAttribute("aria-label")'), 'Enable sound');
  await run('toggleSound()');
  assert.equal(run('audioStub.muted'), false);
});

test('the first speaker-button click enables sound instead of immediately muting', async () => {
  const run = game();
  await run('toggleSound()');
  assert.equal(run('audioStub.ready'), true);
  assert.equal(run('audioStub.muted'), false);
  assert.equal(run('soundHint.hidden'), true);
});

test('capture listeners leave audio-control touches to the control itself', async () => {
  const run = game();
  await run(`initAudioOnInteraction({target: Object.assign(new Element(), {
    closest: () => soundToggleBtn
  })})`);
  assert.equal(run('audioStub.initCalls'), 0);
  await run('toggleSound()');
  assert.equal(run('audioStub.ready && !audioStub.muted'), true);
});

test('tutorial readiness expires after energy loss and can be earned again', () => {
  const run = game();
  run('cursorEnergy = .4; checkTutorialProgression();');
  assert.equal(run('getAvailableDischarge()'), 'tutorial');
  run('cursorEnergy = .3; checkTutorialProgression();');
  assert.equal(run('logoReadyForDischarge'), false);
  assert.equal(run('getAvailableDischarge()'), null);
  run('cursorEnergy = .4; checkTutorialProgression();');
  assert.equal(run('getAvailableDischarge()'), 'tutorial');
});
