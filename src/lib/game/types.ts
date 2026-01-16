/**
 * Game state types and interfaces
 */

// Game phases
export const GAME_PHASE_TUTORIAL = 0;
export const GAME_PHASE_COLORED = 1;
export const GAME_PHASE_COMPLETE = 4;

export type GamePhase = 0 | 1 | 4;

// Energy constants
export const MAX_ENERGY = 1.0;
export const ENERGY_THRESHOLD = 0.2;

// Chamber system
export const CHAMBER_THRESHOLD = 8;  // Braucht mehr Partikel zum Füllen
export const CHAMBER_RADIUS = 12;
export const MAX_RED_STACK = 10;  // Mehr Herzen für Max-Stack

// Tutorial phases
export const TUTORIAL_RINGS_PHASE0 = 2;
export const TUTORIAL_RINGS_PHASE1 = 3;
export const TUTORIAL_RINGS_PHASE2 = 4;
export const TUTORIAL_TWITCH_INTENSITY = 0.5;
export const TUTORIAL_VIBRATE_INTENSITY = 1.5;

// Rings per colored phase
export const RINGS_PER_PHASE = [3, 4, 5] as const;

// Idle timeout (1.5s ohne Bewegung = idle)
export const IDLE_TIMEOUT = 1500;

// Chamber colors sequence: Orange -> Sand -> Neongreen
export const CHAMBER_COLORS_SEQUENCE = [
  '#ff6b35',  // 1. Orange (Coral Flame)
  '#d4a574',  // 2. Hellbraun/Sand (Desert Gold)
  '#39ff14'   // 3. Neongrün (Electric Lime)
] as const;

export const CHAMBER_COLORS = [...CHAMBER_COLORS_SEQUENCE, '#ff2222'] as const;

// URLs for colored bridges
export const COLOR_URLS: Record<string, string> = {
  '#39ff14': 'https://sword-gamma.vercel.app/',
  '#ff6b35': 'https://birth.br1dge.xyz/',
  '#d4a574': 'https://wocl.br1dge.xyz/'
};
