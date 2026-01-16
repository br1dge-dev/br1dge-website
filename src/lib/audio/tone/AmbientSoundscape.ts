/**
 * Minimalist Ambient Soundscape - Interstellar Style
 * 
 * Ziel: Weite, Leere, Tiefgang - wie der Weltraum
 * Sanft, aber präsent. Nicht bissig.
 */
import * as Tone from 'tone';
import { EffectChain } from './EffectChain';

class AmbientSoundscapeClass {
  // === LAYERS ===
  
  // 1. Sub-Bass - A1, tief, spürbar
  private subOsc: Tone.Oscillator | null = null;
  private subGain: Tone.Gain | null = null;
  
  // 2. Deep Pad - G2 mit langem Schwanz
  private padSynth: Tone.PolySynth | null = null;
  private padGain: Tone.Gain | null = null;
  
  // 3. Very subtle Chorus für Weite
  private chorus: Tone.Chorus | null = null;
  
  // State
  private _active = false;
  private intensity = 0.5;
  
  initialized = false;
  
  get active(): boolean {
    return this._active;
  }
  
  async init(): Promise<void> {
    if (this.initialized) return;
    
    const mainInput = EffectChain.getMainInput();
    const reverbSend = EffectChain.getReverbSend();
    
    if (!mainInput || !reverbSend) {
      console.warn('EffectChain not initialized');
      return;
    }
    
    // Sub-Bass - A1, leise, resonant
    this.subOsc = new Tone.Oscillator({
      frequency: 55,
      type: 'sine',
    });
    this.subGain = new Tone.Gain(0);
    this.subOsc.connect(this.subGain);
    this.subGain.connect(mainInput);
    
    // Deep Pad - tiefer, langsam
    this.chorus = new Tone.Chorus({
      frequency: 0.08,  // Sehr langsam
      depth: 0.2,       // Subtil
      wet: 0.2,
    }).start();
    
    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 4,      // Sehr langsam
        decay: 2,
        sustain: 0.5,
        release: 6,     // Langer Ausklang
      },
    });
    
    this.padGain = new Tone.Gain(0);
    this.padSynth.connect(this.chorus);
    this.chorus.connect(this.padGain);
    this.padGain.connect(mainInput);
    this.padGain.connect(reverbSend);
    
    this.initialized = true;
  }
  
  /**
   * Start ambient - very slow fade in
   */
  start(): void {
    if (!this.initialized || this._active) return;
    this._active = true;
    
    const now = Tone.now();
    
    // Sub starten
    this.subOsc?.start(now);
    this.subGain?.gain.linearRampTo(0.06, 5);  // Leiser
    
    // Pad mit tiefem Akkord
    this.padSynth?.triggerAttack(['G2', 'D3', 'G3'], now);
    this.padGain?.gain.linearRampTo(0.08, 8);  // Sehr leise
    
    // Transport - langsam
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.bpm.value = 45;  // Sehr langsam
      Tone.Transport.start();
    }
  }
  
  /**
   * Stop - slow fade out
   */
  stop(): void {
    if (!this.initialized || !this._active) return;
    this._active = false;
    
    const fadeTime = 10;
    
    this.subGain?.gain.linearRampTo(0, fadeTime);
    this.padGain?.gain.linearRampTo(0, fadeTime);
    
    setTimeout(() => {
      this.subOsc?.stop();
      this.padSynth?.releaseAll();
    }, fadeTime * 1000);
  }
  
  /**
   * Set intensity - very subtle
   */
  setIntensity(value: number): void {
    this.intensity = Math.max(0.3, Math.min(1, value));
    
    if (!this.initialized || !this._active) return;
    
    // Minimale Änderungen
    const padLevel = 0.06 + (this.intensity - 0.5) * 0.04;
    const subLevel = 0.04 + (this.intensity - 0.5) * 0.02;
    
    this.padGain?.gain.linearRampTo(padLevel, 3);
    this.subGain?.gain.linearRampTo(subLevel, 3);
  }
  
  setGameLevel(level: number): void {
    this.setIntensity(0.35 + (level / 10) * 0.4);
  }
  
  /**
   * Inverted mode - gedämpft, treibend
   */
  setInvertedMode(active: boolean): void {
    if (!this.initialized) return;
    
    this.invertedMode = active;
    
    if (active) {
      this.subGain?.gain.linearRampTo(0.1, 0.5);
      this.padGain?.gain.linearRampTo(0.03, 0.5);
    } else {
      this.setIntensity(this.intensity);
    }
  }
  
  private invertedMode = false;
  
  /**
   * Swell - sanftes Ansteigen
   */
  swell(duration = 3): void {
    if (!this.initialized || !this._active) return;
    if (this.invertedMode) return;
    
    const original = this.padGain?.gain.value ?? 0.08;
    
    this.padGain?.gain.linearRampTo(original * 1.8, duration * 0.4);
    
    setTimeout(() => {
      this.padGain?.gain.linearRampTo(original, duration * 0.6);
    }, duration * 400);
  }
  
  dispose(): void {
    this.stop();
    
    this.subOsc?.dispose();
    this.subGain?.dispose();
    this.padSynth?.dispose();
    this.padGain?.dispose();
    this.chorus?.dispose();
    
    this.initialized = false;
    this._active = false;
  }
}

export const AmbientSoundscape = new AmbientSoundscapeClass();
