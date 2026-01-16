/**
 * Color utilities for the br1dge interactive experience
 */

/**
 * Convert hex color to rgba string
 */
export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Convert hex color to HSL hue value (0-360)
 */
export const colorToHue = (hex: string): number => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;

  if (max !== min) {
    const d = max - min;
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return Math.round(h * 360);
};

/**
 * Create an HSLA color string
 */
export const hsla = (h: number, s: number, l: number, a: number): string =>
  `hsla(${h}, ${s}%, ${l}%, ${a})`;

/**
 * Create an RGBA color string
 */
export const rgba = (r: number, g: number, b: number, a: number): string =>
  `rgba(${r}, ${g}, ${b}, ${a})`;

/**
 * Desaturate a hex color by a percentage (0-1)
 * 0 = original color, 1 = fully grayscale
 */
export const desaturate = (hex: string, amount: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
  const newR = Math.round(r + (gray - r) * amount);
  const newG = Math.round(g + (gray - g) * amount);
  const newB = Math.round(b + (gray - b) * amount);
  
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};
