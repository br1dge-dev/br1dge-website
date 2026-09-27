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

/** A light visual connection; no extra cursor force or simulation particles. */
export function drawDischargeLink(ctx: CanvasRenderingContext2D, options: {
  coreX: number; coreY: number; cursorX: number; cursorY: number;
  coreRadius: number; time: number; color: string;
}): void {
  const { coreX, coreY, cursorX, cursorY, coreRadius, time, color } = options;
  const dx = cursorX - coreX, dy = cursorY - coreY;
  const distance = Math.hypot(dx, dy);
  const pulse = .5 + .5 * Math.sin(time / 450);
  ctx.save();
  ctx.strokeStyle = ctx.fillStyle = color;
  ctx.lineWidth = 1;
  // A restrained receiving halo remains visible when the cursor reaches the core.
  ctx.globalAlpha = .10 + pulse * .06;
  ctx.beginPath();
  ctx.arc(coreX, coreY, coreRadius + 12 + pulse * 2, 0, Math.PI * 2);
  ctx.stroke();
  if (distance > 28) {
    const bend = Math.min(26, distance * .07) * Math.sin(time / 1600);
    const mx = (coreX + cursorX) / 2 - dy / distance * bend;
    const my = (coreY + cursorY) / 2 + dx / distance * bend;
    ctx.globalAlpha = .12 + pulse * .04;
    ctx.beginPath();
    ctx.moveTo(coreX, coreY);
    ctx.quadraticCurveTo(mx, my, cursorX, cursorY);
    ctx.stroke();
    // Four small lights travel from the charged cursor toward the receiving bridge.
    for (let i = 0; i < 4; i++) {
      const t = 1 - ((time / 1800 + i / 4) % 1);
      const u = 1 - t;
      ctx.globalAlpha = .36 * Math.sin(Math.PI * t);
      ctx.beginPath();
      ctx.arc(u * u * coreX + 2 * u * t * mx + t * t * cursorX,
        u * u * coreY + 2 * u * t * my + t * t * cursorY, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
