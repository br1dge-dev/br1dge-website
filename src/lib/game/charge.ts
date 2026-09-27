/** Energy tuning only: movement timing and other gameplay rules stay independent. */
export const CHARGE = {
  energyPerStar: 0.01,
  superStarMultiplier: 4,
  attractionRadius: 300,
  attractionStrength: 0.3,
  closeAttractionStrength: 0.14,
  captureRadius: 28,
  startingParticles: 32,
} as const;
