export type DischargeKind = 'tutorial' | 'color' | 'level';
export interface DischargeState {
  blocked: boolean;
  tutorial: boolean;
  tutorialSubPhase: number;
  ready: boolean;
  energy: number;
  requiredEnergy: number;
  chamberCount: number;
  chamberThreshold: number;
  ringsEmitted: boolean;
  inverted: boolean;
  redStack: number;
  colorsComplete: boolean;
  level: number;
  levelCap: number;
  energyThreshold: number;
}

/** Shared by the visual cue and the actual release action. */
export function availableDischarge(s: DischargeState): DischargeKind | null {
  if (s.blocked) return null;
  if (s.tutorial) {
    return s.tutorialSubPhase < 2 && s.ready && s.energy >= s.requiredEnergy ? 'tutorial' : null;
  }
  if (!s.inverted) {
    const full = s.chamberCount >= s.chamberThreshold && s.energy >= s.requiredEnergy;
    if (!s.colorsComplete && s.ready && full && s.ringsEmitted) return 'color';
    if (s.chamberCount > 0 && !full) return null;
  }
  if (s.level >= s.levelCap) return null;
  if (s.inverted ? s.redStack > 0 : s.colorsComplete && s.energy >= s.energyThreshold) return 'level';
  return null;
}

interface LinkMote {
  phase: number;
  x: number;
  y: number;
}
interface LinkMotion {
  time: number;
  cursorX: number;
  cursorY: number;
  lagX: number;
  lagY: number;
  attachment: number;
  motes: LinkMote[];
}
const linkMotion = new WeakMap<CanvasRenderingContext2D, LinkMotion>();

/** Visual-only charge drift. Its inertia never applies force to the player. */
export function drawDischargeLink(ctx: CanvasRenderingContext2D, options: {
  coreX: number; coreY: number; cursorX: number; cursorY: number;
  coreRadius: number; time: number; color: string;
}): void {
  const { coreX, coreY, cursorX, cursorY, coreRadius, time, color } = options;
  const dx = cursorX - coreX, dy = cursorY - coreY;
  const distance = Math.hypot(dx, dy);
  const radius = Math.max(1, coreRadius);
  // The receiving point follows the arch slowly, like a charge clinging to it.
  const attachment = Math.max(-.96, Math.min(.96, dx / Math.max(radius, distance) * 1.1));
  let motion = linkMotion.get(ctx);
  const reset = !motion || time < motion.time || time - motion.time > 150;
  if (!motion || reset) {
    motion = {
      time, cursorX, cursorY, lagX: 0, lagY: 0, attachment,
      motes: Array.from({ length: 36 }, (_, i) => ({ phase: (i * .61803398875) % 1, x: cursorX, y: cursorY })),
    };
    linkMotion.set(ctx, motion);
  }
  const dt = Math.min(.05, Math.max(0, (time - motion.time) / 1000));
  const follow = 1 - Math.exp(-dt * 5);
  motion.lagX += (Math.max(-65, Math.min(65, (motion.cursorX - cursorX) / Math.max(dt, .001) * .08)) - motion.lagX) * follow;
  motion.lagY += (Math.max(-65, Math.min(65, (motion.cursorY - cursorY) / Math.max(dt, .001) * .08)) - motion.lagY) * follow;
  motion.attachment += (attachment - motion.attachment) * (1 - Math.exp(-dt * 2.2));
  const endX = coreX + motion.attachment * radius * .75;
  const endY = coreY + radius * (.35 - Math.sqrt(1 - motion.attachment ** 2) * .85);
  const spanX = endX - cursorX, spanY = endY - cursorY;
  const span = Math.max(1, Math.hypot(spanX, spanY));
  const nx = -spanY / span, ny = spanX / span;
  const seconds = time / 1000;
  const amplitude = Math.min(13, span * .045);
  // Keep close-range charge soft instead of building up a bright knot.
  const visibility = Math.min(1, distance / (radius * 1.5));
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < motion.motes.length; i++) {
    const mote = motion.motes[i];
    const previous = mote.phase;
    mote.phase = (mote.phase + dt / (1.9 + (i % 7) * .13)) % 1;
    const p = mote.phase;
    // Ease into the symbol, leaving a short-lived, softly moving charge there.
    const t = 1 - (1 - p) ** 2;
    const envelope = Math.sin(Math.PI * t);
    const wave = Math.sin(t * 8 - seconds * 1.8 + i * 2.4)
      + .4 * Math.sin(t * 17 + seconds * 2.1 + i);
    const drift = envelope * amplitude * wave;
    const cling = t ** 8 * Math.sin(seconds * 2 + i * 2.4) * 2;
    const x = cursorX + spanX * t + nx * (drift + cling) + motion.lagX * envelope;
    const y = cursorY + spanY * t + ny * (drift + cling) + motion.lagY * envelope;
    const ease = 1 - Math.exp(-dt * (9 + t * 12));
    if (reset || p < previous) {
      mote.x = x;
      mote.y = y;
    } else {
      mote.x += (x - mote.x) * ease;
      mote.y += (y - mote.y) * ease;
    }
    const alpha = Math.sin(Math.PI * p) * (.20 + .06 * Math.sin(seconds * 2.3 + i)) * visibility;
    const size = .65 + (i % 4) * .16;
    ctx.globalAlpha = alpha * .15;
    ctx.beginPath();
    ctx.arc(mote.x, mote.y, size * 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(mote.x, mote.y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  motion.time = time;
  motion.cursorX = cursorX;
  motion.cursorY = cursorY;
}
