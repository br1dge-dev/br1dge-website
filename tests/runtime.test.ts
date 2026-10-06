import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { availableDischarge, drawDischargeLink } from '../src/lib/game/discharge.ts';
import { CHARGE } from '../src/lib/game/charge.ts';
import { GameClock } from '../src/lib/game/clock.ts';
import * as evolutionModule from '../src/lib/game/evolution.ts';
import { spiralSpeedModifier } from '../src/lib/game/balance.ts';
import * as constants from '../src/lib/game/types.ts';

// Execute the real runtime with inert platform services; no production test hooks.
function game(sourceFile = 'runtime.ts', expansion = false) {
  class Element {
    style: Record<string, string> = {};
    textContent = '';
    hidden = false;
    attributes = new Map<string, string>();
    classList = { add() {}, toggle() {} };
    addEventListener() {}
    setAttribute(name: string, value: string) { this.attributes.set(name, value); }
    getAttribute(name: string) { return this.attributes.get(name); }
    closest() { return null; }
    remove() {}
    appendChild(child: Element & { id?: string }) { if (child.id) elements.set(child.id, child); }
    querySelector() { return new Element(); }
    querySelectorAll() { return []; }
  }
  const context2d = new Proxy({}, { get: (_, key) => key === 'measureText' ? () => ({ width: 10 }) :
    key === 'createRadialGradient' || key === 'createLinearGradient' ? () => ({ addColorStop() {} }) : () => {} });
  const canvas = Object.assign(new Element(), { getContext: () => context2d });
  if (expansion) canvas.setAttribute('data-evolution', 'true');
  const elements = new Map<string, Element>([['canvas', canvas]]);
  const getElement = (id: string) => {
    if (!elements.has(id)) elements.set(id, new Element());
    return elements.get(id);
  };
  const audioState = {
    musicLevel: 0, musicStarts: 0,
    setGameLevel(level: number) { this.musicLevel = level; },
    startBgMusic() { this.musicStarts++; },
    muted: false, initialized: false, ready: false, initCalls: 0, resumeCalls: 0,
    async init() { this.initCalls++; this.initialized = true; },
    async resume() { this.resumeCalls++; this.ready = true; },
    toggleMute() { this.muted = !this.muted; return this.muted; },
  };
  const audio = new Proxy(audioState, {
    get(target, key) { return key in target ? target[key as keyof typeof target] : () => {}; },
  });
  const uiTimers: Array<() => void> = [];
  const listeners: Record<string, Array<(e: unknown) => void>> = {};
  const context = vm.createContext({
    uiTimers, listeners,
    audioStub: audioState,
    console, Date, URLSearchParams, Math: Object.create(Math), Element, exports: {},
    window: { innerWidth: 1280, innerHeight: 720, addEventListener() {} },
    navigator: { maxTouchPoints: 0 },
    document: { hidden: false, getElementById: getElement, createElement: () => new Element(),
      addEventListener(name: string, callback: (e: unknown) => void) { (listeners[name] ??= []).push(callback); }, body: new Element() },
    requestAnimationFrame() {}, setTimeout(callback: () => void) { uiTimers.push(callback); },
    require(path: string) {
      if (path.endsWith('/discharge')) return { availableDischarge, drawDischargeLink };
      if (path.endsWith('/charge')) return { CHARGE };
      if (path.endsWith('/evolution')) return evolutionModule;
      if (path.endsWith('/clock')) return { GameClock };
      if (path.endsWith('/balance')) return { spiralSpeedModifier };
      if (path.endsWith('/types')) return constants;
      if (path.endsWith('/color')) return { hexToRgba: () => '#fff', colorToHue: () => 0, desaturate: (color: string) => color };
      if (path.endsWith('/tone')) return { ToneAudioSystem: audio };
      if (path.endsWith('/HapticManager')) return { HapticManager: new Proxy({}, { get: () => () => {} }) };
      throw new Error(`Unexpected import: ${path}`);
    },
  });
  const source = readFileSync(new URL('../src/lib/game/' + sourceFile, import.meta.url), 'utf8');
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

for (const source of ['runtime.ts', 'accepted-preview.js']) {
  for (const modal of ['showModal', 'showSuperSuccessModal']) {
    test(`${source}: ${modal} freezes gameplay and timers through fade-out, but keeps music enabled`, () => {
      const run = game(source);
      run(`clock.advance(0, () => {});
        clock.schedule(() => { cursorEnergy = .123; }, 500);
        ${modal}();`);
      assert.equal(run('clock.paused'), true);
      assert.equal(run('audioStub.muted'), false);
      const snapshot = run('JSON.stringify([clock.now, cursorEnergy, cursorX, cursorY, mouseX, mouseY, spiralEnemy, ambientParticles, particles])');
      run(`clock.advance(60000, render);
        for (const name of ['mousemove', 'touchstart', 'touchmove', 'touchend', 'click']) {
          for (const listener of listeners[name] ?? []) {
            if (listener === initAudioOnInteraction) continue;
            listener({clientX:900, clientY:500, touches:[{clientX:900,clientY:500}], changedTouches:[], preventDefault(){}});
          }
        }`);
      assert.equal(run('JSON.stringify([clock.now, cursorEnergy, cursorX, cursorY, mouseX, mouseY, spiralEnemy, ambientParticles, particles])'), snapshot);
      run('closeModal(document.createElement("div")); clock.advance(61000, render);');
      assert.equal(run('clock.paused'), true);
      run('uiTimers.shift()(); clock.advance(62000, () => {});');
      assert.equal(run('clock.paused'), false);
      assert.equal(run('audioStub.muted'), false);
      assert.notEqual(run('cursorEnergy'), .123);
      run('clock.advance(62499, () => {});');
      assert.notEqual(run('cursorEnergy'), .123);
      run('clock.advance(62500, () => {});');
      assert.equal(run('cursorEnergy'), .123);
    });
  }
}


test('expansion is opt-in: the accepted playtest keeps its existing rules', () => {
  const run = game('accepted-preview.js');
  assert.equal(run('evolution'), null);
  assert.equal(run('clock.paused'), false);
});

test('expansion starts directly and chapter restart resets hazards, timers and damage', () => {
  const run = game('accepted-preview.js', true);
  assert.equal(run('clock.paused || modalShown'), false);
  run(`beginEvolution('binary'); evolution.integrity = 1;
    clock.schedule(() => { upgradeLevel = 20; }, 1);
    beginEvolution('resonance'); clock.advance(0, () => {}); clock.advance(20, () => {});`);
  assert.equal(run('upgradeLevel'), 2);
  assert.equal(run('evolution.integrity'), 3);
  assert.equal(run('postCreditsMode || youDiedActive || clock.paused'), false);
});

test('expansion requires full charge, progresses to success and freezes the field with music unmuted', () => {
  const run = game('accepted-preview.js', true);
  run(`beginEvolution('connection'); upgradeLevel = 9; cursorEnergy = .99;`);
  assert.equal(run('getAvailableDischarge()'), null);
  run('cursorEnergy = 1;');
  assert.equal(run('getAvailableDischarge()'), 'level');
  run(`for (const listener of listeners.click) {
    if (listener !== initAudioOnInteraction) listener({clientX:centerX, clientY:centerY});
  }
  clock.advance(0, () => {}); clock.advance(4100, () => {});`);
  assert.equal(run('upgradeLevel'), 10);
  assert.equal(run('modalShown && clock.paused'), true);
  assert.equal(run('audioStub.muted'), false);
  const before = run('JSON.stringify(evolution.hazards)');
  run('clock.advance(100000, render);');
  assert.equal(run('JSON.stringify(evolution.hazards)'), before);
  run(`beginEvolution('echo');`);
  assert.equal(run('postCreditsMode && !clock.paused'), true);
  assert.equal(run('upgradeLevel'), 10);
});

test('expansion failure clears pending success and retry skips only the tutorial', () => {
  const run = game('accepted-preview.js', true);
  run(`beginEvolution('tension'); evolution.integrity = 0;
    clock.schedule(() => { showEvolutionEnding(false); }, 50);
    showEvolutionFailure(); clock.advance(10000, render);`);
  assert.equal(run('youDiedActive && clock.paused'), true);
  run(`beginEvolution('awakening', true); clock.advance(0, () => {}); clock.advance(100, () => {});`);
  assert.equal(run('gamePhase'), constants.GAME_PHASE_COLORED);
  assert.equal(run('currentColorPhase'), 0);
  assert.equal(run('evolution.integrity'), 3);
  assert.equal(run('modalShown || youDiedActive || postCreditsMode'), false);
});

test('expansion reaches the success card and keeps it paused', () => {
  const run = game('accepted-preview.js', true);
  run(`beginEvolution('binary'); upgradeLevel = 19; cursorEnergy = 1;
    for (const listener of listeners.click) {
      if (listener !== initAudioOnInteraction) listener({clientX:centerX, clientY:centerY});
    }
    clock.advance(0, () => {}); clock.advance(4100, () => {});`);
  assert.equal(run('upgradeLevel'), 20);
  assert.equal(run('evolutionRest.kind'), 'final');
  assert.equal(run('document.getElementById("evolution-reentry").hidden'), true);
  assert.equal(run('modalShown && clock.paused'), true);
  assert.equal(run('audioStub.muted'), false);
});


test('settlement animates without advancing gameplay and ignores immediate reentry', () => {
  const run = game('accepted-preview.js', true);
  run("showEvolutionEnding(false); drawEvolutionRest(100); continueEvolution();");
  assert.equal(run('evolutionRest.kind'), 'success');
  const before = run('clock.now');
  run('drawEvolutionRest(2200);');
  assert.equal(run('clock.now'), before);
  run('continueEvolution();');
  assert.equal(run('evolutionRest'), null);
  assert.equal(run('postCreditsMode && !clock.paused'), true);
});


test('power never skips progression levels and both finales remain reachable', () => {
  for (const [chapter, level, expected] of [['tension', 5, 6], ['connection', 9, 10], ['binary', 19, 20]]) {
    const run = game('accepted-preview.js', true);
    run(`beginEvolution('${chapter}'); upgradeLevel = ${level}; cursorEnergy = 1; evolution.powerUntil = clock.now + 8000;
      for (const listener of listeners.click) {
        if (listener !== initAudioOnInteraction) listener({clientX:centerX, clientY:centerY});
      }`);
    assert.equal(run('upgradeLevel'), expected);
    assert.equal(run('evolution.powerActive(clock.now)'), true);
    if (expected === 10 || expected === 20) {
      run('clock.advance(0, () => {}); clock.advance(4100, () => {});');
      assert.equal(run('modalShown && clock.paused'), true);
    }
  }
});

test('overdrive duration freezes during a manual pause', () => {
  const run = game('accepted-preview.js', true);
  run("beginEvolution('tension'); evolution.powerUntil = clock.now + 8000; toggleEvolutionPause(); clock.advance(100000, render);");
  assert.equal(run('evolution.powerUntil - clock.now'), 8000);
  run('toggleEvolutionPause(); clock.advance(100001, () => {}); clock.advance(108002, () => {});');
  assert.equal(run('evolution.powerActive(clock.now)'), false);
});


test('evolution cursor, bursts and ripples retain their speed at 20–120 Hz', () => {
  const results = [20, 30, 60, 120].map(hz => {
    const run = game('accepted-preview.js', true);
    run(`beginEvolution('connection');
      Math.random = () => .999; ambientParticles.length = 0;
      cursorX = 100; cursorY = 100; mouseX = 500; mouseY = 100; cursorEnergy = 0;
      particles.push({x:20,y:20,vx:4,vy:0,life:1,hue:0});
      ripples.push({x:640,y:360,size:10,alpha:1});
      previousMotionTime = clock.now;
      clock.advance(0, render);
      for (let i=1;i<=${hz}/10;i++) clock.advance(i*1000/${hz}, render);`);
    return JSON.parse(run('JSON.stringify({cursor:cursorX,burstX:particles[0].x,life:particles[0].life,ripple:ripples[0].size,alpha:ripples[0].alpha})'));
  });
  for (const result of results) {
    assert.ok(Math.abs(result.cursor - (500 - 400 * .75 ** 6)) < .01);
    assert.ok(Math.abs(result.life - .88) < .0001);
    assert.ok(Math.abs(result.ripple - 82) < .01);
    assert.ok(Math.abs(result.burstX - results[0].burstX) < .01);
  }
});

test('evolution particle supply does not slow down on a low-refresh display', () => {
  const supplies = [20, 30, 60, 120].map(hz => {
    const run = game('accepted-preview.js', true);
    run(`beginEvolution('connection'); ambientParticles.length=0;
      // Balanced deterministic sequence makes the spawn probability comparison repeatable.
      let randomSeed = 13; Math.random = () => ((randomSeed = (randomSeed * 16807) % 2147483647) / 2147483647);
      let supplied = 0; spawnAmbientParticle = () => { supplied++; };
      for (let i=0;i<${hz}*60;i++) { motionStep = 60/${hz}; drawAmbientParticles(); }`);
    return run('supplied');
  });
  assert.ok(Math.max(...supplies) / Math.min(...supplies) < 1.12);
});


test('ring depletion opens the death screen, freezes the run and retry restores it', () => {
  const run = game('accepted-preview.js', true);
  run(`beginEvolution('connection'); cursorEnergy = .2;
    evolution.hazards = [{x:cursorX,y:cursorY,vx:0,vy:0,born:clock.now-2000,phase:0,grazed:false,trail:[]}]; render();`);
  assert.equal(run('evolutionRest.kind'), 'loss');
  assert.equal(run('cursorEnergy'), 0);
  assert.equal(run('clock.paused'), true);
  assert.equal(run('document.getElementById("evolution-death").hidden'), false);
  assert.equal(run('document.getElementById("evolution-reentry").hidden'), true);
  run('evolutionRest.elapsed=2000; continueEvolution();');
  assert.equal(run('clock.paused || youDiedActive'), false);
  assert.equal(run('document.getElementById("evolution-death").hidden'), true);
});


test('retry restores audible base music while respecting explicit mute', async () => {
  for (const muted of [false, true]) {
    const run = game('accepted-preview.js', true);
    run(`audioStub.ready = true; audioStub.muted = ${muted}; showEvolutionFailure(); evolutionRest.elapsed = 1500; continueEvolution();`);
    await Promise.resolve();
    assert.equal(run('audioStub.musicLevel'), 1);
    assert.equal(run('audioStub.musicStarts > 0'), !muted);
    assert.equal(run('modalShown || youDiedActive'), false);
  }
});

test('overcharge keeps collecting past a full ring and resets on release', () => {
  const run = game('accepted-preview.js', true);
  run(`beginEvolution('tension'); cursorEnergy = 1;
    ambientParticles.length = 0; spawnAmbientParticle();
    Object.assign(ambientParticles[0], {x:cursorX, y:cursorY, vx:0, vy:0, absorbed:false});
    drawAmbientParticles();`);
  assert.ok(run('cursorEnergy') > 1);
  run(`cursorEnergy = 3; for (const listener of listeners.click) {
    if (listener !== initAudioOnInteraction) listener({clientX:centerX, clientY:centerY});
  }`);
  assert.equal(run('upgradeLevel'), 5);
  assert.equal(run('cursorEnergy'), 0);
});

test('debug crosses chapters and clamps levels without stale endings', () => {
  const run = game('accepted-preview.js', true);
  run('debugLevel(9)');
  assert.equal(run('upgradeLevel'), 10);
  assert.equal(run('postCreditsMode'), false);
  assert.equal(run('evolutionRest.kind'), 'success');
  assert.equal(run('modalShown && clock.paused'), true);
  run('debugLevel(-1)');
  assert.equal(run('upgradeLevel'), 9);
  assert.equal(run('postCreditsMode'), false);
  run('debugLevel(50)');
  assert.equal(run('upgradeLevel'), 20);
  run('debugLevel(-50)');
  assert.equal(run('upgradeLevel'), 1);
  assert.equal(run('gameCompleted || modalShown'), false);
});

test('mobile resize preserves valid dimensions and repaints paused bridge', () => {
  const run = game('accepted-preview.js', true);
  run(`toggleEvolutionPause(); window.innerWidth = 390; window.innerHeight = 844; resize(); repaintEvolution();`);
  assert.equal(run('W'), 390);
  assert.equal(run('H'), 844);
  assert.equal(run('evolutionPaused && clock.paused'), true);
  run('window.innerWidth = 0; window.innerHeight = 0; resize();');
  assert.equal(run('W'), 390);
  assert.equal(run('H'), 844);
});


test('both evolution milestones render original card contents and continue correctly', () => {
  const run = game('accepted-preview.js', true);
  run('showEvolutionEnding(false)');
  assert.match(run('document.getElementById("level10-modal").innerHTML'), /Congratulations/);
  assert.match(run('document.getElementById("level10-modal").innerHTML'), /Switch Angel/);
  run('closeModal(document.getElementById("level10-modal"))');
  assert.equal(run('upgradeLevel'), 10);
  assert.equal(run('postCreditsMode && !modalShown && !clock.paused'), true);
  run('showEvolutionEnding(true)');
  assert.match(run('document.getElementById("super-success-modal").innerHTML'), /Labskaus/);
  assert.equal(run('clock.paused'), true);
  run('closeModal(document.getElementById("super-success-modal"))');
  assert.equal(run('upgradeLevel'), 1);
  assert.equal(run('postCreditsMode || modalShown || clock.paused'), false);
});

test('first debug interaction starts the correct music after audio unlock', async () => {
  const run = game('accepted-preview.js', true);
  await run('debugLevel(6)');
  assert.equal(run('audioStub.ready'), true);
  assert.equal(run('audioStub.musicLevel'), 8);
  assert.ok(run('audioStub.musicStarts') > 0);
  await run('debugLevel(3)');
  assert.equal(run('audioStub.musicLevel'), 10);
  assert.equal(run('evolutionRest.kind'), 'success');
  run('audioStub.muted = true; audioStub.musicStarts = 0');
  await run('debugLevel(10)');
  assert.equal(run('evolutionRest.kind'), 'final');
  assert.equal(run('audioStub.musicStarts'), 0);
});


test('evolution begins on I while preserving the learn-by-playing opening', () => {
  const run = game('accepted-preview.js', true);
  assert.equal(run('upgradeLevel'),1);
  assert.equal(run('tutorialSubPhase'),0);
  assert.equal(run('gamePhase'),constants.GAME_PHASE_TUTORIAL);
  assert.equal(run('coloredBridgePhaseComplete'),false);
  run('debugLevel(-100)');
  assert.equal(run('upgradeLevel'),1);
});

test('opening charges faster while later progression stays single-step', () => {
  const run = game('accepted-preview.js', true);
  const collect = () => run(`cursorEnergy = 0; isIdle = false;
    ambientParticles.length = 0; spawnAmbientParticle();
    Object.assign(ambientParticles[0], {x:cursorX,y:cursorY,vx:0,vy:0,absorbed:false,isSuperStar:false});
    drawAmbientParticles(); cursorEnergy;`);
  assert.equal(collect(), .012);
  run("beginEvolution('awakening', true)");
  assert.equal(collect(), .01);
  run("beginEvolution('tension')");
  assert.equal(collect(), .008);
  run('evolution.powerUntil = clock.now + 12000');
  assert.equal(collect(), .012);
});
