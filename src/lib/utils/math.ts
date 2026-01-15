/**
 * Math utilities for the br1dge interactive experience
 */

/**
 * Calculate Euclidean distance between two points
 */
export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Clamp a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Linear interpolation between two values
 */
export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

/**
 * Normalize a value from one range to another
 */
export const normalize = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number = 0,
  outMax: number = 1
): number => {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
};

/**
 * Generate a random number between min and max
 */
export const randomRange = (min: number, max: number): number =>
  min + Math.random() * (max - min);

/**
 * Generate a random integer between min and max (inclusive)
 */
export const randomInt = (min: number, max: number): number =>
  Math.floor(randomRange(min, max + 1));

/**
 * Calculate angle between two points in radians
 */
export const angleBetween = (x1: number, y1: number, x2: number, y2: number): number =>
  Math.atan2(y2 - y1, x2 - x1);

/**
 * Box-Muller transform for Gaussian (normal) distribution
 * Returns a value with mean 0 and standard deviation 1
 */
export const gaussian = (): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};
