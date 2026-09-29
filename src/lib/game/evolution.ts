/** Optional expansion for /evolution. The accepted playtest keeps its original rules. */
export const CHAPTERS = [
  { id: 'awakening', name: 'Awakening', from: 0, to: 2, music: 1, color: '#c8d8dc' },
  { id: 'resonance', name: 'Resonance', from: 2, to: 4, music: 3, color: '#bddedb' },
  { id: 'tension', name: 'Tension', from: 4, to: 7, music: 5, color: '#d8c7ae' },
  { id: 'connection', name: 'Connection', from: 7, to: 10, music: 8, color: '#cadbc4' },
  { id: 'breakthrough', name: 'Breakthrough', from: 10, to: 11, music: 10, color: '#ffffff' },
  { id: 'echo', name: 'Afterglow · Echo', from: 10, to: 14, music: 5, color: '#c6d2e2' },
  { id: 'tides', name: 'Afterglow · Tides', from: 14, to: 17, music: 3, color: '#c1dcd8' },
  { id: 'binary', name: 'Afterglow · Twin pull', from: 17, to: 20, music: 8, color: '#dac6b6' },
  { id: 'harmony', name: 'Equilibrium', from: 20, to: 21, music: 10, color: '#ffffff' },
] as const;
export function chapterFor(level: number, afterglow: boolean) {
  if (afterglow) return CHAPTERS[level >= 20 ? 8 : level >= 17 ? 7 : level >= 14 ? 6 : 5];
  return CHAPTERS[level >= 10 ? 4 : level >= 7 ? 3 : level >= 4 ? 2 : level >= 2 ? 1 : 0];
}
export function musicFor(level: number, afterglow: boolean) {
  return level === 0 ? 0 : chapterFor(level, afterglow).music;
}
export function chargePull(energy: number): number {
  return Math.max(0, Math.min(1, energy)) ** 2;
}
export interface FieldInput {
  now: number; width: number; height: number; cursorX: number; cursorY: number;
  ringRadius?: number; ready?: boolean; energy: number; level: number; afterglow: boolean; tutorial: boolean; completing: boolean;
}
export interface Hazard {
  x: number; y: number; vx: number; vy: number; born: number; phase: number;
  approached?: boolean; escaped?: boolean;
  grazed: boolean; trail: { x: number; y: number }[];
}
export function hazardSize(phase: number): number {
  return 3.8 + (Math.sin(phase * 12.9898) * .5 + .5) * 3.4;
}
export function ringRadius(energy: number, unlocked = 5, powered = false): number {
  if (powered) return 53;
  const rings = Math.min(unlocked, Math.ceil(Math.max(0, energy) * 5));
  return rings ? 5 + energy * 18 + 5 + (rings - 1) * 5 + 2 : 5;
}
export function contactDamage(level: number, size: number): number {
  return Math.min(4, 1 + Math.floor(Math.max(0, level) / 7) + (size >= 6 ? 1 : 0));
}
function segmentDistance(ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay;
  const length = dx * dx + dy * dy;
  const t = length ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / length)) : 0;
  return Math.hypot(ax + t * dx, ay + t * dy);
}

export class GravityField {
  integrity = 3;
  hazards: Hazard[] = [];
  lastHit = -Infinity;
  lastGraze = -Infinity;
  lastRelease = -Infinity;
  nextSpawn = 0;
  releases = 0;
  encountered = false;
  safeReturns = 0;
  lastReject = -Infinity;
  lastEscape = -Infinity;
  powerUntil = -Infinity;
  nextHeart = 0;
  heart: { x: number; y: number; born: number } | null = null;
  powerActive(now: number) { return now < this.powerUntil; }
  takePowerReward(now: number) {
    const reward = this.powerActive(now) ? 2 : 1;
    this.powerUntil = -Infinity;
    return reward;
  }
  private previousCursor: { x: number; y: number } | null = null;
  private activeChapter = '';
  private feedback: { x: number; y: number; tx: number; ty: number; at: number; kind: 'loss' | 'escape' }[] = [];
  private previous: number | undefined;
  private history: { x: number; y: number; at: number }[] = [];
  private sequence = 0;
  private width = 0;
  private height = 0;
  reset(now: number) {
    this.integrity = 3;
    this.powerUntil = -Infinity;
    this.nextHeart = now + 12000;
    this.heart = null;
    this.hazards = [];
    this.previous = undefined;
    this.previousCursor = null;
    this.history = [];
    this.lastHit = this.lastGraze = this.lastRelease = -Infinity;
    this.nextSpawn = now + 7000;
    this.sequence = 0;
    this.releases = this.safeReturns = 0;
    this.encountered = false;
    this.lastReject = this.lastEscape = -Infinity;
    this.activeChapter = '';
    this.feedback = [];
  }
  tide(now: number, active: boolean): number {
    return active ? .65 + .55 * (.5 + .5 * Math.sin(now / 2600)) : 1;
  }
  well(width: number, height: number, now: number) {
    const r = Math.min(width, height) * .3;
    return { x: width / 2 + Math.cos(now / 18000) * r, y: height / 2 + Math.sin(now / 18000) * r * .7 };
  }
  release(now: number, x: number, y: number) {
    this.lastRelease = now;
    this.releases++;
    if (this.encountered) this.safeReturns++;
    for (const h of this.hazards) {
      const d = Math.max(1, Math.hypot(h.x - x, h.y - y));
      if (d < 260) {
        const kick = 120 * (1 - d / 300);
        h.vx += (h.x - x) / d * kick;
        h.vy += (h.y - y) / d * kick;
      }
    }
  }
  update(s: FieldInput): { hit: boolean; grazed: boolean; died: boolean; damage?: number; reward?: { x: number; y: number } } {
    const result: { hit: boolean; grazed: boolean; died: boolean; damage?: number; reward?: { x: number; y: number } } = { hit: false, grazed: false, died: this.integrity <= 0 };
    const dt = this.previous === undefined ? 0 : Math.min(.1, Math.max(0, (s.now - this.previous) / 1000));
    this.previous = s.now;
    if (this.width && this.height && (s.width !== this.width || s.height !== this.height)) {
      const sx = s.width / this.width, sy = s.height / this.height;
      if (this.previousCursor) this.previousCursor = { x: s.cursorX, y: s.cursorY };
      if (this.heart) { this.heart.x *= sx; this.heart.y *= sy; }
      for (const h of this.hazards) {
        h.x *= sx; h.y *= sy;
        h.trail = h.trail.map(p => ({ x: p.x * sx, y: p.y * sy }));
      }
      this.history = this.history.map(p => ({ ...p, x: p.x * sx, y: p.y * sy }));
    }
    this.width = s.width; this.height = s.height;
    const previousCursor = this.previousCursor ?? { x: s.cursorX, y: s.cursorY };
    this.previousCursor = { x: s.cursorX, y: s.cursorY };
    const cx = s.width / 2, cy = s.height / 2;
    this.history.push({ x: s.cursorX, y: s.cursorY, at: s.now });
    while (this.history.length > 1 && (this.history[1].at < s.now - 650 || this.history.length > 180)) this.history.shift();
    if (s.tutorial || s.completing || result.died) {
      this.nextSpawn = s.now + 5000;
      return result;
    }
    // Hearts arrive only after the three project colours have been learned.
    if (s.level >= 3 && !this.powerActive(s.now)) {
      if (!this.heart && s.now >= this.nextHeart) {
        const angle = s.now / 7000;
        const radius = Math.min(s.width, s.height) * .32;
        this.heart = { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, born: s.now };
      }
      if (this.heart && s.now - this.heart.born > 10000) {
        this.heart = null; this.nextHeart = s.now + 10000;
      }
      if (this.heart && Math.hypot(s.cursorX - this.heart.x, s.cursorY - this.heart.y) < 22) {
        this.heart = null; this.powerUntil = s.now + 8000;
        this.nextHeart = s.now + 24000;
        this.nextSpawn = s.now;
      }
    }
    const powered = this.powerActive(s.now);
    const chapter = chapterFor(s.level, s.afterglow);
    if (this.activeChapter !== chapter.id) {
      if (this.activeChapter) this.hazards = [];
      this.activeChapter = chapter.id;
      this.nextSpawn = Math.max(this.nextSpawn, s.now + 5000);
    }
    // Complexity follows demonstrated play: first feel the chase, then return safely.
    const maxHazards = (this.safeReturns === 0 ? 1 : s.afterglow ? 3 : s.level >= 4 ? 2 : 1) + (powered ? 2 : 0);
    if (s.now >= this.nextSpawn && this.hazards.length < maxHazards) {
      // Golden-angle spacing avoids sudden clusters at a single edge.
      const angle = ++this.sequence * 2.399963;
      const margin = 46;
      const rx = Math.max(50, s.width / 2 - margin), ry = Math.max(50, s.height / 2 - margin);
      const scale = 1 / Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle)));
      const x = cx + Math.cos(angle) * rx * scale, y = cy + Math.sin(angle) * ry * scale;
      this.hazards.push({ x, y, vx: 0, vy: 0, born: s.now, phase: angle, grazed: false, trail: [] });
      this.nextSpawn = s.now + (powered ? 2200 : s.afterglow ? 6000 : Math.max(6500, 11500 - s.level * 500));
    }
    const target = chapter.id === 'echo' ? this.history[0] : { x: s.cursorX, y: s.cursorY };
    const tide = this.tide(s.now, chapter.id === 'tides');
    const secondary = this.well(s.width, s.height, s.now);
    const speed = this.safeReturns === 0 ? 43 : Math.min(100, 43 + s.level * 2.5);
    const worldScale = Math.max(.55, Math.min(1, Math.min(s.width, s.height) / 720));
    for (const h of this.hazards) {
      if (s.now - h.born < 1600) continue; // Visible arrival warning; no collision yet.
      const previousX = h.x, previousY = h.y;
      const dc = Math.max(1, Math.hypot(cx - h.x, cy - h.y));
      const dp = Math.max(1, Math.hypot(target.x - h.x, target.y - h.y));
      const attraction = chargePull(s.energy) * 145 * (powered ? 1.8 : 1) * tide * Math.min(1, 340 / dp);
      let ax = (cx - h.x) / dc * 22 + (target.x - h.x) / dp * attraction;
      let ay = (cy - h.y) / dc * 22 + (target.y - h.y) / dp * attraction;
      if (chapter.id === 'binary') {
        const dw = Math.max(24, Math.hypot(secondary.x - h.x, secondary.y - h.y));
        const strength = Math.min(90, 13000 / dw);
        ax += (secondary.x - h.x) / dw * strength;
        ay += (secondary.y - h.y) / dw * strength;
      }
      h.vx = (h.vx + ax * dt * worldScale) * Math.exp(-dt * .3);
      h.vy = (h.vy + ay * dt * worldScale) * Math.exp(-dt * .3);
      const magnitude = Math.max(1, Math.hypot(h.vx, h.vy));
      const cap = speed * worldScale;
      if (magnitude > cap) { h.vx *= cap / magnitude; h.vy *= cap / magnitude; }
      h.x += h.vx * dt; h.y += h.vy * dt;
      h.trail.push({ x: h.x, y: h.y });
      if (h.trail.length > 18) h.trail.shift();
      const playerDistance = Math.hypot(s.cursorX - h.x, s.cursorY - h.y);
      if (playerDistance < 150 && s.energy >= .3) { h.approached = true; this.encountered = true; }
      if (h.approached && !h.escaped && !h.grazed && playerDistance > 170
          && h.vx * (s.cursorX - h.x) + h.vy * (s.cursorY - h.y) < 0) {
        h.escaped = true;
        this.lastEscape = s.now;
        result.reward = { x: h.x, y: h.y };
        this.feedback.push({ x: h.x, y: h.y, tx: s.cursorX, ty: s.cursorY, at: s.now, kind: 'escape' });
      }
      const contactRadius = (s.ringRadius ?? ringRadius(s.energy, 5, powered)) + hazardSize(h.phase) * 1.25;
      const sweptDistance = segmentDistance(previousX - previousCursor.x, previousY - previousCursor.y,
        h.x - s.cursorX, h.y - s.cursorY);
      if (sweptDistance <= contactRadius && s.now - this.lastGraze > 1800) {
        h.grazed = true;
        this.powerUntil = -Infinity;
        this.lastGraze = s.now;
        result.grazed = true;
        result.damage = contactDamage(s.level, hazardSize(h.phase));
        if (s.energy - result.damage / 5 <= 1e-9) {
          this.integrity = 0;
          result.died = true;
        }
        this.feedback.push({ x: s.cursorX, y: s.cursorY, tx: h.x, ty: h.y, at: s.now, kind: 'loss' });
      }
      if (result.died) break;
      const coreRadius = Math.min(s.width, s.height) * .068;
      if (Math.hypot(h.x - cx, h.y - cy) < coreRadius && s.now - this.lastHit >= 3500) {
        this.powerUntil = -Infinity;
        this.integrity = Math.max(0, this.integrity - 1);
        this.lastHit = s.now;
        this.hazards = []; // A short recovery window prevents cascading damage.
        this.nextSpawn = s.now + 6000;
        result.hit = true;
        result.died = this.integrity === 0;
        break;
      }
    }
    this.feedback = this.feedback.filter(f => s.now - f.at < 1000);
    this.hazards = this.hazards.filter(h => s.now - h.born < 45000 && h.x > -150 && h.y > -150 && h.x < s.width + 150 && h.y < s.height + 150);
    return result;
  }
  draw(ctx: CanvasRenderingContext2D, s: FieldInput) {
    const chapter = chapterFor(s.level, s.afterglow);
    ctx.save();
    if (this.heart) {
      const { x, y, born } = this.heart;
      const age = s.now - born;
      const fade = Math.min(1, age / 700, (10000 - age) / 900);
      ctx.save(); ctx.translate(x, y);
      const pulse = 1 + .07 * Math.sin(s.now / 230);
      ctx.scale(pulse, pulse);
      ctx.globalAlpha = Math.max(0, fade);
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 23);
      glow.addColorStop(0, 'rgba(255,218,84,.24)'); glow.addColorStop(1, 'rgba(255,218,84,0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, 23, 0, Math.PI * 2); ctx.fill();
      // A single lightning stroke reads as energy, distinct from the red hazards.
      ctx.strokeStyle = '#ffe478'; ctx.lineWidth = 2;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(3, -10); ctx.lineTo(-5, 1);
      ctx.lineTo(4, 1); ctx.lineTo(-3, 10); ctx.stroke();
      ctx.restore();
    }
    if (chapter.id === 'binary') {
      const p = this.well(s.width, s.height, s.now);
      for (let i = 0; i < 16; i++) {
        const angle = i * 2.4 + s.now / (1800 + i * 40);
        const r = 8 + i * 1.4;
        ctx.fillStyle = `rgba(204,191,178,${.12 + i / 100})`;
        ctx.beginPath(); ctx.arc(p.x + Math.cos(angle) * r, p.y + Math.sin(angle) * r * .6, .8, 0, Math.PI * 2); ctx.fill();
      }
    }
    for (const h of this.hazards) {
      const arrival = Math.min(1, Math.max(0, (s.now - h.born) / 1600));
      // Stable individual size, with the old connected-bubble motion in a small red silhouette.
      const size = hazardSize(h.phase);
      const time = s.now / 1000;
      const pulse = 1 + Math.sin(time * 4.3 + h.phase) * .12;
      const radius = size * (.82 + arrival * .18) * pulse;
      const halo = radius * 2.5;
      const glow = ctx.createRadialGradient(h.x, h.y, radius * .7, h.x, h.y, halo);
      glow.addColorStop(0, 'rgba(255,45,65,.22)');
      glow.addColorStop(1, 'rgba(255,35,55,0)');
      ctx.globalAlpha = .5 + arrival * .5;
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(h.x, h.y, halo, 0, Math.PI * 2); ctx.fill();
      // Arrival gently gathers into a point; no extra emblem or ornament.
      if (arrival < 1) {
        ctx.strokeStyle = '#ff4055'; ctx.globalAlpha = (1 - arrival) * .25;
        ctx.lineWidth = .6;
        ctx.beginPath(); ctx.arc(h.x, h.y, radius + 12 * (1 - arrival), 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = .5 + arrival * .5;
      ctx.fillStyle = '#ff4055';
      ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(time * .45 + h.phase);
      // Overlapping lobes breathe independently but remain one connected, soft mass.
      ctx.beginPath();
      ctx.arc(0, 0, radius * .56, 0, Math.PI * 2);
      for (let i = 0; i < 3; i++) {
        const angle = i * Math.PI * 2 / 3;
        const offset = radius * (.42 + .08 * Math.sin(time * 2.7 + h.phase + i));
        const lobe = radius * (.59 + .15 * Math.sin(time * 4 + h.phase + i * 2));
        const x = Math.cos(angle) * offset, y = Math.sin(angle) * offset;
        ctx.moveTo(x + lobe, y); ctx.arc(x, y, lobe, 0, Math.PI * 2);
      }
      ctx.fill(); ctx.restore();
    }
    for (const f of this.feedback) {
      const age = (s.now - f.at) / 900;
      if (age > 1) continue;
      if (f.kind === 'escape') {
        ctx.strokeStyle = '#c4ffe1'; ctx.globalAlpha = (1 - age) * .6; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(f.x, f.y, 12 + age * 40, 0, Math.PI * 2); ctx.stroke();
      } else {
        for (let i = 0; i < 9; i++) {
          const t = Math.max(0, Math.min(1, age * 1.4 - i * .04));
          ctx.fillStyle = i % 2 ? '#fff4dd' : '#ff7c49'; ctx.globalAlpha = Math.sin(Math.PI * t);
          ctx.beginPath(); ctx.arc(f.x + (f.tx - f.x) * t + Math.sin(t * 8 + i) * 9,
            f.y + (f.ty - f.y) * t + Math.cos(t * 7 + i) * 9, 1.7, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    ctx.restore();
  }
}

function archPoint(t: number, r: number) {
  if (t < .25) return { x: -r * .58, y: r * (.95 - t * 3.2) };
  if (t > .75) return { x: r * .58, y: r * (.15 + (t - .75) * 3.2) };
  const angle = Math.PI + (t - .25) * Math.PI * 2;
  return { x: Math.cos(angle) * r * .58, y: r * .15 + Math.sin(angle) * r * .58 };
}
export function drawEvolvingBridge(ctx: CanvasRenderingContext2D, s: FieldInput, field: GravityField) {
  const chapter = chapterFor(s.level, s.afterglow);
  const r = Math.min(s.width, s.height) * (.085 + Math.min(20, s.level) * .0045);
  const progress = Math.min(1, s.level / 10);
  const release = Math.max(0, 1 - (s.now - field.lastRelease) / 1700);
  const recoil = Math.max(0, 1 - (s.now - field.lastReject) / 480);
  const invitation = s.ready ? .5 + .5 * Math.sin(s.now / 320) : 0;
  const breathe = 1 + invitation * .018 - Math.sin(recoil * Math.PI) * .055 + Math.sin(s.now / 2100) * .006 + release * .035;
  ctx.save(); ctx.translate(s.width / 2, s.height / 2); ctx.scale(breathe, breathe);
  ctx.lineCap = 'round';
  if (s.level > 0) {
    ctx.font = `200 ${Math.max(12, Math.min(s.width, s.height) * .024)}px "SF Pro Display", "Helvetica Neue", system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = chapter.color; ctx.globalAlpha = .65 + release * .3;
    ctx.fillText(romanLevel(s.level), 0, -r * .85 - 10);
  }
  // Repeated fine contours accumulate into a stable structure, never digits.
  const layers = Math.min(4, Math.floor(s.level / 2));
  for (let layer = layers; layer >= 0; layer--) {
    const offset = layer * (5 + Math.sin(s.now / 1400 + layer) * (chapter.id === 'tension' ? 2 : .6));
    ctx.strokeStyle = layer === 0 ? '#f1f3ef' : chapter.color;
    ctx.lineWidth = layer === 0 ? Math.max(4, r * .10) : .75;
    ctx.globalAlpha = layer === 0 ? .82 + progress * .16 : .18 + release * .12;
    ctx.beginPath();
    let pen = false;
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const damaged = (field.integrity < 3 && Math.abs(t - .17) < .035)
        || (field.integrity < 2 && Math.abs(t - .83) < .035);
      if (damaged) { pen = false; continue; }
      const p = archPoint(t, r + offset);
      if (!pen) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      pen = true;
    }
    ctx.stroke();
  }
  // Quiet constellation points reveal the bridge's assembled structure.
  if (s.level >= 2) {
    const nodes = Math.min(5, Math.floor(s.level / 2));
    for (let i = 0; i < nodes; i++) {
      const t = .12 + i * .19;
      const p = archPoint(t, r + 19);
      ctx.fillStyle = chapter.color; ctx.globalAlpha = .38 + release * .3;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = .08; ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (s.afterglow) {
    const tide = field.tide(s.now, chapter.id === 'tides');
    ctx.strokeStyle = chapter.color; ctx.lineWidth = .6;
    ctx.globalAlpha = .12;
    ctx.beginPath();
    ctx.ellipse(0, r * .23, r * (1.25 + .12 * tide), r * .4, -.35, .15, Math.PI * 1.85); ctx.stroke();
    if (chapter.id === 'binary') {
      ctx.globalAlpha = .09;
      ctx.beginPath(); ctx.ellipse(0, r * .23, r * 1.5, r * .4, .35, .1, Math.PI * 1.9); ctx.stroke();
    }
  }
  // A moving charge traces the arch; after connection, quiet filaments span its feet.
  for (let i = 0; i < 12 + Math.floor(progress * 16); i++) {
    const t = (i / 28 + s.now / 9500) % 1;
    const p = archPoint(t, r + 4 + Math.sin(i + s.now / 1200) * 2);
    ctx.globalAlpha = (.10 + .22 * progress + release * .3 + invitation * .25) * Math.sin(Math.PI * t);
    ctx.fillStyle = chapter.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, .8, 0, Math.PI * 2); ctx.fill();
  }
  if (s.level >= 4) {
    for (let j = 0; j < 3; j++) {
      ctx.globalAlpha = .035 + progress * .04 + release * .12;
      ctx.strokeStyle = chapter.color; ctx.lineWidth = .65;
      ctx.beginPath(); ctx.moveTo(-r * .58, r * .93);
      ctx.bezierCurveTo(-r * .2, r * (1.05 + .08 * Math.sin(s.now / 1600 + j)), r * .2, r * (.65 + j * .13), r * .58, r * .93); ctx.stroke();
    }
  }
  if (release > 0) {
    ctx.globalAlpha = release * .2; ctx.strokeStyle = chapter.color; ctx.lineWidth = .8;
    ctx.beginPath(); ctx.arc(0, r * .2, r * (1.1 + (1 - release) * 2.5), 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

/** Settlement animates independently while the gameplay clock remains frozen. */
export function drawSettlement(ctx: CanvasRenderingContext2D, width: number, height: number, elapsed: number, lost: boolean) {
  const r = Math.min(width, height) * .1;
  const t = Math.min(1, elapsed / 1600);
  ctx.save(); ctx.translate(width / 2, height / 2);
  ctx.fillStyle = '#e8f4ec'; ctx.strokeStyle = '#e8f4ec';
  if (lost) {
    for (let i = 0; i < 44; i++) {
      const p = archPoint(i / 43, r);
      ctx.globalAlpha = (1 - t) * .75;
      ctx.beginPath(); ctx.arc(p.x * (1 - t) + Math.sin(i * 2.4) * t * (1 - t) * 70,
        p.y * (1 - t) + Math.cos(i * 2.4) * t * (1 - t) * 70, 1.7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = .5 + .35 * t; ctx.beginPath();
    ctx.arc(0, 0, 3 + t * (1 + Math.sin(elapsed / 500)), 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.globalAlpha = .95; ctx.lineWidth = Math.max(4, r * .10); ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const p = archPoint(i / 80, r); if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.lineWidth = .8; ctx.globalAlpha = .25 + Math.sin(elapsed / 900) * .07;
    ctx.beginPath(); ctx.moveTo(-r * .58, r * .95); ctx.quadraticCurveTo(0, r * (1.02 + .04 * Math.sin(elapsed / 1100)), r * .58, r * .95); ctx.stroke();
    ctx.globalAlpha = (1 - t) * .25; ctx.beginPath(); ctx.arc(0, r * .2, r * (1 + t * 4), 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = .08 + .10 * (.5 + .5 * Math.sin(elapsed / 650)); ctx.lineWidth = .7;
  ctx.beginPath(); ctx.arc(0, lost ? 0 : r * .2, lost ? 20 + Math.sin(elapsed / 650) * 3 : r * 1.25, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}


interface ProjectSatellite {
  x: number; y: number; color: string; birthTime: number; orbitAngle: number; hitRadius: number;
}

/** Settled, time-based ellipses keep the project links arranged around the core. */
export function drawProjectOrbits(ctx: CanvasRenderingContext2D, projects: ProjectSatellite[],
  width: number, height: number, now: number, pointerX: number, pointerY: number): number {
  const extent = Math.min(width, height);
  const tilt = -.32;
  let hovered = -1;
  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const age = Math.max(0, now - project.birthTime);
    const settle = 1 - (1 - Math.min(1, age / 1800)) ** 3;
    const rx = extent * (.23 + i * .075), ry = rx * .72;
    const angle = project.orbitAngle + age / (18000 + i * 6500);
    const x = Math.cos(angle) * rx, y = Math.sin(angle) * ry;
    project.x = width / 2 + (x * Math.cos(tilt) - y * Math.sin(tilt)) * settle;
    project.y = height / 2 + (x * Math.sin(tilt) + y * Math.cos(tilt)) * settle;
    project.hitRadius = 22;
    const active = Math.hypot(pointerX - project.x, pointerY - project.y) < project.hitRadius;
    if (active) hovered = i;
    // A faint continuous pencil line, with just a little colour from its satellite.
    ctx.save(); ctx.translate(width / 2, height / 2);
    ctx.strokeStyle = project.color; ctx.lineWidth = .6;
    ctx.globalAlpha = settle * (active ? .22 : .11);
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, tilt, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.translate(project.x, project.y);
    const size = Math.max(7, Math.min(10, extent * .018)) * (active ? 1.12 : 1);
    ctx.strokeStyle = project.color; ctx.lineWidth = 2;
    ctx.globalAlpha = Math.min(1, age / 500) * (active ? 1 : .92);
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-size * .65, size * .7);
    ctx.lineTo(-size * .65, 0);
    ctx.arc(0, 0, size * .65, Math.PI, Math.PI * 2);
    ctx.lineTo(size * .65, size * .7); ctx.stroke();
    ctx.restore();
  }
  return hovered;
}


export function romanLevel(level: number): string {
  const tens = Math.floor(Math.max(0, Math.min(20, level)) / 10);
  return 'X'.repeat(tens) + ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][Math.max(0, Math.min(20, Math.floor(level))) % 10];
}

export function drawPowerRing(ctx: CanvasRenderingContext2D, s: FieldInput, field: GravityField) {
  if (!field.powerActive(s.now)) return;
  const remaining = Math.min(1, (field.powerUntil - s.now) / 8000);
  const pulse = 1 + Math.sin(s.now / 150) * .025;
  ctx.save(); ctx.translate(s.cursorX, s.cursorY); ctx.scale(pulse, pulse);
  const glow = ctx.createRadialGradient(0, 0, 15, 0, 0, 60);
  glow.addColorStop(0, 'rgba(255,208,65,.14)');
  glow.addColorStop(.7, 'rgba(255,208,65,.08)');
  glow.addColorStop(1, 'rgba(255,208,65,0)');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2); ctx.fill();
  // Replace the normal white cursor, preserving its five charge steps in gold.
  for (let i = 0; i < 5; i++) {
    const radius = 18 + i * 5;
    const charge = Math.max(0, Math.min(1, s.energy * 5 - i));
    ctx.strokeStyle = '#ffda55'; ctx.lineWidth = 3; ctx.globalAlpha = .22;
    ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
    if (charge > 0) {
      ctx.beginPath(); ctx.arc(0, 0, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * charge); ctx.stroke();
    }
  }
  // Two revolving brackets change the silhouette even without colour perception.
  const spin = s.now / 550;
  ctx.strokeStyle = '#fff0a8'; ctx.globalAlpha = .95; ctx.lineWidth = 2.5;
  for (let i = 0; i < 2; i++) {
    const start = spin + i * Math.PI;
    ctx.beginPath(); ctx.arc(0, 0, 45, start, start + Math.PI * .6); ctx.stroke();
  }
  ctx.strokeStyle = '#ffda55'; ctx.globalAlpha = .8; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, 51, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * remaining); ctx.stroke();
  ctx.strokeStyle = '#fff4c0'; ctx.globalAlpha = 1; ctx.lineWidth = 2;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(2, -7); ctx.lineTo(-4, 1); ctx.lineTo(3, 1); ctx.lineTo(-2, 7); ctx.stroke();
  ctx.restore();
}
