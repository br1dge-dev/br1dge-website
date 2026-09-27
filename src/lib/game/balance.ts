/** Preserve random enemy variety while limiting sudden difficulty spikes early on. */
export function spiralSpeedModifier(level: number, postCredits: boolean, roll: number): number {
  const rolledSpeed = roll < 0.5 ? 2 : roll < 0.75 ? 4 : roll < 0.875 ? 8 : 1;
  const cap = postCredits ? 8 : level < 3 ? 2 : level < 6 ? 3 : 4;
  return Math.min(rolledSpeed, cap);
}
