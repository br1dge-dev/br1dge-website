/**
 * Tone.js Audio Constants
 * Cinematic Interstellar-inspired space ambient soundscape
 * 
 * Hans Zimmer's Interstellar uses:
 * - Massive organ-like pads with long sustain
 * - Deep sub-bass drones
 * - Wide stereo field with modulation
 * - Tension through dissonance and resolution
 * - Minimalist melodic motifs
 */

// Root key: G minor - dark, emotional, cinematic
export const SCALE = {
  root: 'G',
  // G natural minor / Aeolian
  notes: ['G', 'A', 'Bb', 'C', 'D', 'Eb', 'F'],
  // Pentatonic for melodic elements
  pentatonic: ['G', 'Bb', 'C', 'D', 'F'],
};

// Cinematic note collections - G Minor (G, A, Bb, C, D, Eb, F)
export const NOTES = {
  // Organ-like bass foundation
  subBass: ['G0', 'G1'],

  // Main drone notes - perfect 5ths for power
  droneFifths: ['G1', 'D2', 'G2', 'D3'],

  // Pad voicings - open, cinematic
  padOpen: ['G2', 'D3', 'G3', 'D4', 'G4'],

  // Tension pads - add the minor 3rd for emotion
  padTension: ['G2', 'Bb2', 'D3', 'F3', 'G3'],

  // Resolution pads - pure power chord
  padResolution: ['G2', 'D3', 'G3', 'D4'],

  // High celestial layer
  celestial: ['G5', 'D6', 'G6', 'D7'],

  // SFX - Collect sounds (ascending G minor pentatonic)
  collectScale: ['G4', 'Bb4', 'C5', 'D5', 'F5', 'G5'],

  // Level up - triumphant open voicing in G minor
  levelUpChord: ['G3', 'D4', 'G4', 'Bb4', 'D5', 'G5'],

  // Max stack - massive cinematic chord in G minor
  maxStackChord: ['G2', 'D3', 'Bb3', 'F3', 'D4', 'G4', 'D5'],

  // Chamber capture - crystalline G minor
  chamberScale: ['G5', 'D6', 'G6', 'D7', 'G7'],

  // Bridge spawn - heroic motif in G minor
  bridgeChord: ['G3', 'D4', 'G4', 'Bb4', 'D5'],

  // Collection complete - resolution in G minor
  completeArpeggio: ['G4', 'Bb4', 'D5', 'G5'],

  // Red heart capture - ethereal high G minor
  redHeartScale: ['D6', 'G6', 'Bb6', 'D7', 'G7'],

  // Spiral spawn - ominous G minor
  spiralSpawnNotes: ['G2', 'Bb2', 'D3', 'F3'],

  // Spiral damage - tension
  spiralDamageNotes: ['F3', 'Bb3', 'D4', 'F4'],

  // Spiral defeat - release
  spiralDefeatNotes: ['G3', 'D4', 'G4'],
};

// Volume levels (dB) - Cinematic dynamic range
export const VOLUME = {
  master: -3,      // Loud but headroom for peaks
  subBass: -12,    // Felt, not overwhelming
  drone: -9,       // Foundation
  pad: -12,        // Harmonic bed
  celestial: -24,  // Subtle shimmer
  sfx: -9,         // Clear and present
};

// Timing - Slow, breathing, cinematic
export const TIMING = {
  // Very long envelopes for organ-like swells
  droneAttack: 8,
  droneRelease: 12,
  padAttack: 4,
  padRelease: 8,
  celestialAttack: 2,
  celestialRelease: 6,
};

// Effect presets - Massive, cathedral-like
export const EFFECTS = {
  // Cathedral reverb
  cathedralReverb: {
    decay: 12,      // Very long tail
    wet: 0.6,
    preDelay: 0.08,
  },
  
  // Cosmic delay - dotted rhythms for movement
  cosmicDelay: {
    delayTime: '4n.',  // Dotted quarter
    feedback: 0.35,
    wet: 0.25,
  },
  
  // Slow chorus for width and movement
  widthChorus: {
    frequency: 0.1,   // Very slow
    depth: 0.5,
    wet: 0.4,
  },
  
  // Warm filter - remove harshness
  warmFilter: {
    frequency: 3000,
    type: 'lowpass' as BiquadFilterType,
    Q: 0.7,
  },
};

// Synth presets - Organ-like, cinematic
export const SYNTHS = {
  // Sub bass - pure sine for weight
  subBass: {
    oscillator: { type: 'sine' as const },
    envelope: {
      attack: 4,
      decay: 0,
      sustain: 1,
      release: 8,
    },
  },
  
  // Main drone - layered for richness
  drone: {
    oscillator: { type: 'sine' as const },
    envelope: {
      attack: 8,
      decay: 2,
      sustain: 0.9,
      release: 12,
    },
  },
  
  // Pad - organ-like with harmonics
  pad: {
    oscillator: {
      type: 'fatsine' as const,
      spread: 20,
      count: 3,
    },
    envelope: {
      attack: 4,
      decay: 2,
      sustain: 0.7,
      release: 8,
    },
  },
  
  // Celestial - pure, ethereal
  celestial: {
    oscillator: { type: 'sine' as const },
    envelope: {
      attack: 2,
      decay: 1,
      sustain: 0.4,
      release: 6,
    },
  },
  
  // SFX - Clean, musical
  sfx: {
    oscillator: { type: 'sine' as const },
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.2,
      release: 0.8,
    },
  },
};

// LFO rates for organic movement
export const LFO = {
  glacial: 0.02,      // Hz - barely perceptible drift
  breathing: 0.08,    // Hz - like slow breathing
  pulse: 0.25,        // Hz - subtle pulse
};
