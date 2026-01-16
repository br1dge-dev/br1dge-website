/**
 * Ambient Soundscape - Interstellar Style
 * 
 * Ziel: Weite, Leere, Tiefgang - wie der Weltraum
 * Mehrschichtig aber subtil. Kein Brummen.
 */
import * as Tone from 'tone';
import { EffectChain } from './EffectChain';

class AmbientSoundscapeClass {
  // === LAYERS ===
  
  // 1. Sub-Bass - A1, spürbar
  private subOsc: Tone.Oscillator | null = null;
  private subGain: Tone.Gain | null = null;
  
  // 2. Main Pad - G2, D3, G3
  private padSynth: Tone.PolySynth | null = null;
  private padGain: Tone.Gain | null = null;
  
  // 3. Harmonic Layer - Fifths für Weite
  private harmonicSynth: Tone.PolySynth | null = null;
  private harmonicGain: Tone.Gain | null = null;
  
  // 4. Filter für langsame Bewegung
  private padFilter: Tone.Filter | null = null;
  
  // 5. Subtiler Chorus
  private chorus: Tone.Chorus | null = null;
  
  // === INVERTED MODE LAYERS (separate from normal) ===
  private invertedPulse: Tone.Oscillator | null = null;
  private invertedPulseGain: Tone.Gain | null = null;
  private invertedDrone: Tone.PolySynth | null = null;
  private invertedDroneGain: Tone.Gain | null = null;
  private invertedLFO: Tone.LFO | null = null;
  private invertedFilter: Tone.Filter | null = null;
  
  // State
  private _active = false;
  private intensity = 0.5;
  private invertedMode = false;
  
  initialized = false;
  
  get active(): boolean {
    return this._active;
  }
  
  async init(): Promise<void> {
    if (this.initialized) return;
    
    const mainInput = EffectChain.getMainInput();
    const reverbSend = EffectChain.getReverbSend();
    const delaySend = EffectChain.getDelaySend();
    
    if (!mainInput || !reverbSend || !delaySend) {
      console.warn('EffectChain not initialized');
      return;
    }
    
    // === SUB BASS ===
    this.subOsc = new Tone.Oscillator({
      frequency: 55,  // A1
      type: 'sine',
    });
    this.subGain = new Tone.Gain(0);
    this.subOsc.connect(this.subGain);
    this.subGain.connect(mainInput);
    
    // === FILTER für Bewegung ===
    this.padFilter = new Tone.Filter({
      frequency: 800,
      type: 'lowpass',
      rolloff: -12,
      Q: 0.5,
    });
    this.padFilter.connect(mainInput);
    this.padFilter.connect(reverbSend);
    this.padFilter.connect(delaySend);
    
    // === CHORUS für Breite ===
    this.chorus = new Tone.Chorus({
      frequency: 0.1,
      depth: 0.3,
      wet: 0.25,
    }).start();
    this.chorus.connect(this.padFilter);
    
    // === MAIN PAD ===
    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 3,
        decay: 2,
        sustain: 0.4,
        release: 5,
      },
    });
    this.padGain = new Tone.Gain(0);
    this.padSynth.connect(this.padGain);
    this.padGain.connect(this.chorus);
    
    // === HARMONIC LAYER ===
    this.harmonicSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 4,
        decay: 3,
        sustain: 0.3,
        release: 6,
      },
    });
    this.harmonicGain = new Tone.Gain(0);
    this.harmonicSynth.connect(this.harmonicGain);
    this.harmonicGain.connect(this.padFilter);
    
    // === INVERTED MODE: Aggressive pulsing drone ===
    // Filter for inverted sounds
    this.invertedFilter = new Tone.Filter({
      frequency: 600,
      type: 'lowpass',
      rolloff: -24,
      Q: 4,  // Resonant, aggressive
    });
    this.invertedFilter.connect(mainInput);
    this.invertedFilter.connect(reverbSend);
    
    // Deep pulsing sub - heartbeat of the inverted world
    this.invertedPulse = new Tone.Oscillator({
      frequency: 36.7,  // D1 - very deep
      type: 'sawtooth',  // Aggressive
    });
    this.invertedPulseGain = new Tone.Gain(0);
    this.invertedPulse.connect(this.invertedPulseGain);
    this.invertedPulseGain.connect(this.invertedFilter);
    
    // LFO for pulsing - creates the heartbeat rhythm
    this.invertedLFO = new Tone.LFO({
      frequency: 1.2,  // ~72 BPM heartbeat
      min: 0,
      max: 0.25,
      type: 'sine',
    });
    
    // Dissonant drone - tritone (devil's interval) + minor 2nd
    this.invertedDrone = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.5,
        decay: 0.3,
        sustain: 0.8,
        release: 2,
      },
    });
    this.invertedDroneGain = new Tone.Gain(0);
    this.invertedDrone.connect(this.invertedDroneGain);
    this.invertedDroneGain.connect(this.invertedFilter);
    
    this.initialized = true;
  }
  
  /**
   * Start ambient
   */
  start(): void {
    if (!this.initialized || this._active) return;
    this._active = true;
    
    const now = Tone.now();
    
    // Sub starten
    this.subOsc?.start(now);
    this.subGain?.gain.linearRampTo(0.08, 4);
    
    // Main Pad
    this.padSynth?.triggerAttack(['G2', 'D3', 'G3'], now);
    this.padGain?.gain.linearRampTo(0.1, 5);
    
    // Harmonic Layer (leiser)
    this.harmonicSynth?.triggerAttack(['D4', 'A4', 'D5'], now);
    this.harmonicGain?.gain.linearRampTo(0.05, 6);
    
    // Filter öffnen
    this.padFilter?.frequency.linearRampTo(1200, 8);
    
    // Transport
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.bpm.value = 50;
      Tone.Transport.start();
    }
  }
  
  /**
   * Stop
   */
  stop(): void {
    if (!this.initialized || !this._active) return;
    this._active = false;
    
    const fadeTime = 8;
    
    this.subGain?.gain.linearRampTo(0, fadeTime);
    this.padGain?.gain.linearRampTo(0, fadeTime);
    this.harmonicGain?.gain.linearRampTo(0, fadeTime);
    
    setTimeout(() => {
      this.subOsc?.stop();
      this.padSynth?.releaseAll();
      this.harmonicSynth?.releaseAll();
    }, fadeTime * 1000);
  }
  
  /**
   * Intensity
   */
  setIntensity(value: number): void {
    this.intensity = Math.max(0.3, Math.min(1, value));
    
    if (!this.initialized || !this._active || this.invertedMode) return;
    
    const padLevel = 0.08 + (this.intensity - 0.5) * 0.06;
    const harmLevel = 0.04 + (this.intensity - 0.5) * 0.03;
    const subLevel = 0.06 + (this.intensity - 0.5) * 0.02;
    
    this.padGain?.gain.linearRampTo(padLevel, 3);
    this.harmonicGain?.gain.linearRampTo(harmLevel, 3);
    this.subGain?.gain.linearRampTo(subLevel, 3);
  }
  
  setGameLevel(level: number): void {
    this.setIntensity(0.35 + (level / 10) * 0.45);
  }
  
  /**
   * Inverted mode - AGGRESSIVE transformation
   * The world turns inside out: dissonant, pulsing, threatening
   * Like being pulled into a black hole
   */
  setInvertedMode(active: boolean): void {
    if (!this.initialized) return;
    
    this.invertedMode = active;
    const now = Tone.now();
    
    if (active) {
      // === KILL NORMAL AMBIENT ===
      this.subGain?.gain.linearRampTo(0, 0.5);
      this.padGain?.gain.linearRampTo(0, 0.5);
      this.harmonicGain?.gain.linearRampTo(0, 0.5);
      this.padFilter?.frequency.linearRampTo(200, 0.3);
      
      // === UNLEASH THE BEAST ===
      // Start pulsing sub
      this.invertedPulse?.start(now);
      this.invertedLFO?.start(now);
      this.invertedLFO?.connect(this.invertedPulseGain!.gain);
      
      // Dissonant tritone drone (D2 + Ab2 = tritone, + Eb2 = minor 2nd cluster)
      this.invertedDrone?.triggerAttack(['D2', 'Ab2', 'Eb3'], now + 0.1);
      this.invertedDroneGain?.gain.linearRampTo(0.12, 0.8);
      
      // Open filter with resonance sweep
      this.invertedFilter?.frequency.linearRampTo(300, 0.2);
      this.invertedFilter?.frequency.linearRampTo(800, 2);
      
      // Increase LFO speed over time (heartbeat getting faster)
      this.invertedLFO?.frequency.linearRampTo(1.8, 5);
      
    } else {
      // === RETURN TO NORMAL ===
      // Fade out inverted layers
      this.invertedPulseGain?.gain.linearRampTo(0, 1.5);
      this.invertedDroneGain?.gain.linearRampTo(0, 1.5);
      this.invertedFilter?.frequency.linearRampTo(200, 1);
      
      // Stop after fade
      setTimeout(() => {
        this.invertedLFO?.stop();
        this.invertedLFO?.disconnect();
        this.invertedPulse?.stop();
        this.invertedDrone?.releaseAll();
        if (this.invertedLFO) this.invertedLFO.frequency.value = 1.2;  // Reset
      }, 1600);
      
      // Bring back normal ambient
      setTimeout(() => {
        this.setIntensity(this.intensity);
        this.padFilter?.frequency.linearRampTo(1200, 2);
      }, 800);
    }
  }
  
  /**
   * Swell
   */
  swell(duration = 3): void {
    if (!this.initialized || !this._active) return;
    if (this.invertedMode) return;
    
    const original = this.padGain?.gain.value ?? 0.1;
    const originalHarm = this.harmonicGain?.gain.value ?? 0.05;
    
    this.padGain?.gain.linearRampTo(original * 1.8, duration * 0.4);
    this.harmonicGain?.gain.linearRampTo(originalHarm * 2, duration * 0.4);
    this.padFilter?.frequency.linearRampTo(1800, duration * 0.4);
    
    setTimeout(() => {
      this.padGain?.gain.linearRampTo(original, duration * 0.6);
      this.harmonicGain?.gain.linearRampTo(originalHarm, duration * 0.6);
      this.padFilter?.frequency.linearRampTo(1200, duration * 0.6);
    }, duration * 400);
  }
  
  dispose(): void {
    this.stop();
    
    this.subOsc?.dispose();
    this.subGain?.dispose();
    this.padSynth?.dispose();
    this.padGain?.dispose();
    this.harmonicSynth?.dispose();
    this.harmonicGain?.dispose();
    this.padFilter?.dispose();
    this.chorus?.dispose();
    
    // Inverted mode cleanup
    this.invertedPulse?.dispose();
    this.invertedPulseGain?.dispose();
    this.invertedDrone?.dispose();
    this.invertedDroneGain?.dispose();
    this.invertedLFO?.dispose();
    this.invertedFilter?.dispose();
    
    this.initialized = false;
    this._active = false;
  }
}

export const AmbientSoundscape = new AmbientSoundscapeClass();
