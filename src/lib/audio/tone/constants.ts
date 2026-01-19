/**
 * br1dge Audio Constants - Well-Being Sound Design
 * 
 * Design Philosophy:
 * - Warm, harmonious sounds in G-minor
 * - Soft attacks, natural decays
 * - Cohesive sonic identity matching the game's aesthetic
 */

import * as Tone from 'tone';

// G-minor scale (natural)
export const G_MINOR = ['G2', 'A2', 'Bb2', 'C3', 'D3', 'Eb3', 'F3', 'G3', 'A3', 'Bb3', 'C4', 'D4', 'Eb4', 'F4', 'G4'];
export const G_MINOR_LOW = ['G1', 'A1', 'Bb1', 'C2', 'D2', 'Eb2', 'F2', 'G2'];
export const G_MINOR_HIGH = ['G3', 'A3', 'Bb3', 'C4', 'D4', 'Eb4', 'F4', 'G4', 'A4', 'Bb4', 'C5'];

// Pentatonic for happier moments
export const G_MINOR_PENT = ['G2', 'Bb2', 'C3', 'D3', 'F3', 'G3', 'Bb3', 'C4', 'D4', 'F4'];

// Chord tones
export const CHORD_IM = ['G2', 'Bb2', 'D3', 'G3'];
export const CHORD_VM = ['D2', 'A2', 'D3', 'A3'];
export const CHORD_IVM = ['C2', 'Eb2', 'G2', 'C3'];

// Note collections
export const NOTES = {
  collectScale: ['G2', 'Bb2', 'C3', 'D3', 'F3', 'G3'],
  levelUpChord: ['G2', 'D3', 'G3', 'Bb3', 'D4'],
  maxStackChord: ['G1', 'D2', 'G2', 'Bb2', 'D3', 'G3'],
  chamberScale: ['G3', 'D4', 'G4', 'D5'],
  bridgeChord: ['G2', 'D3', 'G3', 'Bb3'],
  completeArpeggio: ['G2', 'D3', 'G3'],
  redHeartScale: ['D3', 'G3', 'Bb3', 'D4'],
  spiralSpawnNotes: ['G1', 'Bb1', 'D2', 'F2'],
  spiralDamageNotes: ['F2', 'Bb2', 'D3'],
  spiralDefeatNotes: ['G2', 'D3', 'G3'],
  celestial: ['G4', 'D5', 'G5'],
};

// Synth presets - warm, harmonious sounds
export const SYNTHS = {
  melodic: {
    oscillator: { type: 'triangle' as const, spread: 10 },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.8 },
  },
  subBass: {
    oscillator: { type: 'sine' as const },
    envelope: { attack: 0.08, decay: 0.3, sustain: 0.6, release: 1 },
  },
  harmonic: {
    oscillator: { type: 'sine' as const, spread: 30 },
    envelope: { attack: 0.1, decay: 0.5, sustain: 0.3, release: 1.5 },
  },
  pad: {
    oscillator: { type: 'fatsine' as const, spread: 30, count: 3 },
    envelope: { attack: 0.4, decay: 0.8, sustain: 0.5, release: 2 },
  },
};

// Effect configurations
export const EFFECTS = {
  reverb: {
    decay: 3,
    wet: 0.35,
    preDelay: 0.03,
  },
  delay: {
    delayTime: '8n.',
    feedback: 0.3,
    wet: 0.25,
  },
  filter: {
    frequency: 2500,
    type: 'lowpass',
    Q: 0.8,
  },
};

// Volume levels
export const VOLUME = {
  master: -6,
  sfx: -12,
  ambient: -18,
  ui: -24,
};

// Timing
export const TIMING = {
  attack: 0.05,
  decay: 0.3,
  sustain: 0.4,
  release: 0.8,
};

// Helper functions
export function getNote(index: number, octaveOffset: number = 0): string {
  const idx = Math.abs(index) % G_MINOR.length;
  const oct = Math.floor(Math.abs(index) / G_MINOR.length) + octaveOffset;
  const note = G_MINOR[idx];
  const noteName = note.slice(0, -1);
  const noteOctave = parseInt(note.slice(-1)) + oct;
  return `${noteName}${noteOctave}`;
}

export function getChordTone(chord: 'IM' | 'VM' | 'IVM', index: number): string {
  const chords: Record<string, string[]> = {
    'IM': CHORD_IM,
    'VM': CHORD_VM,
    'IVM': CHORD_IVM
  };
  return chords[chord][index % chords[chord].length];
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function noteToMidi(note: string): number {
  const notes: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8,
    'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
  };
  const match = note.match(/([A-G]#?)(-?\d)/);
  if (!match) return 60;
  return notes[match[1]] + 12 * (parseInt(match[2]) + 1);
}

export function noteToFreq(note: string): number {
  return midiToFreq(noteToMidi(note));
}
