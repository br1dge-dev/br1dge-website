/**
 * Tone.js Audio System Types
 * Type definitions for the immersive space audio engine
 */

/** Musical scale configuration for consistent harmony */
export interface ScaleConfig {
  root: string; // e.g., "G2"
  mode: 'minor' | 'major' | 'dorian' | 'phrygian';
  octaveRange: [number, number]; // e.g., [2, 6]
}

/** Ambient soundscape parameters */
export interface SoundscapeParams {
  baseFreq: number;
  driftAmount: number; // LFO depth for subtle movement
  density: number; // 0-1, how many voices
  brightness: number; // 0-1, filter cutoff factor
  reverbMix: number; // 0-1, wet/dry
}

/** SFX event types that trigger sounds */
export type SFXEventType =
  | 'collect' // Particle absorbed
  | 'capture' // Red/colored particle caught
  | 'discharge' // Energy released to logo
  | 'levelUp' // Level increase
  | 'maxStack' // 6 red particles stacked
  | 'modalEnter' // Modal opens
  | 'modalClose' // Modal closes
  | 'chamberCapture' // Chamber absorbs particle
  | 'bridgeSpawn' // Mini-bridge created
  | 'collectionComplete'; // 5 particles collected

/** Parameters for SFX playback */
export interface SFXParams {
  pitch?: number; // Pitch offset/index
  level?: number; // Intensity level
  count?: number; // For sequential sounds
  velocity?: number; // 0-1, how hard/loud
}

/** Audio system state for external monitoring */
export interface ToneAudioState {
  initialized: boolean;
  muted: boolean;
  soundscapeActive: boolean;
  masterVolume: number;
  currentBPM: number;
}

/** Effect chain configuration */
export interface EffectChainConfig {
  reverb: {
    decay: number;
    wet: number;
    preDelay: number;
  };
  delay: {
    time: string; // e.g., "8n"
    feedback: number;
    wet: number;
  };
  chorus: {
    frequency: number;
    depth: number;
    wet: number;
  };
  filter: {
    frequency: number;
    type: BiquadFilterType;
    Q: number;
  };
}

/** Synth voice configuration */
export interface VoiceConfig {
  oscillator: {
    type: OscillatorType | 'fatsawtooth' | 'fattriangle' | 'fatsine' | 'fmsine' | 'amsine';
    spread?: number;
    count?: number;
  };
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  filterEnvelope?: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    baseFrequency: number;
    octaves: number;
  };
}
