/**
 * Game state types and interfaces
 */

export const GAME_PHASE_TUTORIAL = 0;
export const GAME_PHASE_COLORED = 1;
export const GAME_PHASE_COMPLETE = 2;

export type GamePhase = 0 | 1 | 2;

export interface GameConstants {
  MAX_ENERGY: number;
  ENERGY_THRESHOLD: number;
  CHAMBER_THRESHOLD: number;
  CHAMBER_RADIUS: number;
  MAX_RED_STACK: number;
  IDLE_TIMEOUT: number;
}

export const GAME_CONSTANTS: GameConstants = {
  MAX_ENERGY: 1.0,
  ENERGY_THRESHOLD: 1.0,
  CHAMBER_THRESHOLD: 5,
  CHAMBER_RADIUS: 12,
  MAX_RED_STACK: 6,
  IDLE_TIMEOUT: 3000,
};

// Chamber colors sequence
export const CHAMBER_COLORS = ['#ff8800', '#8B4513', '#228B22'] as const;

// URLs for colored bridges
export const COLOR_URLS: Record<string, string> = {
  '#ff8800': 'https://sword.br1dge.xyz',
  '#8B4513': 'https://wordofchoice.br1dge.xyz',
  '#228B22': 'https://br1dge.xyz/projects',
};
