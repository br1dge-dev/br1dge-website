/**
 * Minimalist Ambient Soundscape
 * 
 * Ziel: Ruhig, anschmiegsam, harmonisch - ein warmer Teppich
 * der die Game-Audio-Effekte unterstützt, nicht überlagert.
 */
import * as Tone from 'tone';
import { EffectChain } from './EffectChain';

class AmbientSoundscapeClass {
  // === LAYERS ===
  
  // 1. Sub-Bass - spürbar, nicht hörbar
  private subOsc: Tone.Oscillator | null = null;
  private subGain: Tone.Gain | null = null;
  
  // 2. Warm Pad - einer reicht
  private padSynth: Tone.PolySynth | null = null;
  private padGain: Tone.Gain | null = null;
  
  // 3. Breite durch Chorus
  private chorus: Tone.Chorus | null = null;
  
  // State
  private _active = false;
  
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
    
    // Sub-Bass - A1, leise
    this.subOsc = new Tone.Oscillator({
      frequency: 55,
      type: 'sine',
    });
    this.subGain = new Tone.Gain(0);
    this.subOsc.connect(this.subGain);
    this.subGain.connect(mainInput);
    
    // Warm Pad - einer reicht
    this.chorus = new Tone.Chorus({
      frequency: 0.15,
      depth: 0.3,
      wet: 0.25,
    }).start();
    
    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 3,
        decay: 1,
        sustain: 0.6,
        release: 4,
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
   * Start the ambient soundscape - warm, slow fade in
   */
  start(): void {
    if (!this.initialized || this._active) return;
    this._active = true;
    
    const now = Tone.now();
    
    // Sub starten
    this.subOsc?.start(now);
    this.subGain?.gain.linearRampTo(0.08, 4);
    
    // Pad mit sanftem Akkord
    this.padSynth?.triggerAttack(['G2', 'D3', 'G3', 'B3'], now);
    this.padGain?.gain.linearRampTo(0.15, 6);
    
    // Transport starten wenn nötig
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.bpm.value = 60;
      Tone.Transport.start();
    }
  }
  
  /**
   * Stop everything - slow fade out
   */
  stop(): void {
    if (!this.initialized || !this._active) return;
    this._active = false;
    
    const fadeTime = 8;
    
    this.subGain?.gain.linearRampTo(0, fadeTime);
    this.padGain?.gain.linearRampTo(0, fadeTime);
    
    setTimeout(() => {
      this.subOsc?.stop();
      this.padSynth?.releaseAll();
    }, fadeTime * 1000);
  }
  
  /**
   * Set intensity - subtle changes only
   */
  setIntensity(value: number): void {
    this.intensity = Math.max(0.3, Math.min(1, value));
    
    if (!this.initialized || !this._active) return;
    
    // Sehr subtile Anpassungen
    const padLevel = 0.12 + (this.intensity - 0.5) * 0.06;
    const subLevel = 0.06 + (this.intensity - 0.5) * 0.02;
    
    this.padGain?.gain.linearRampTo(padLevel, 2);
    this.subGain?.gain.linearRampTo(subLevel, 2);
  }
  
  setGameLevel(level: number): void {
    this.setIntensity(0.4 + (level / 10) * 0.4);
  }
  
  /**
   * Inverted mode - muffled, anxious feel
   */
  setInvertedMode(active: boolean): void {
    if (!this.initialized) return;
    
    this.invertedMode = active;
    
    if (active) {
      // Sub bass lauter, Pad leiser
      this.subGain?.gain.linearRampTo(0.12, 0.5);
      this.padGain?.gain.linearRampTo(0.05, 0.5);
    } else {
      // Zurück zu normal
      this.setIntensity(this.intensity);
    }
  }
  
  private invertedMode = false;
  private intensity = 0.5;
  
  /**
   * Momentary swell for big moments
   */
  swell(duration = 2): void {
    if (!this.initialized || !this._active) return;
    if (this.invertedMode) return;
    
    const original = this.padGain?.gain.value ?? 0.15;
    
    // Crescendo
    this.padGain?.gain.linearRampTo(original * 1.5, duration * 0.3);
    
    // Zurück
    setTimeout(() => {
      this.padGain?.gain.linearRampTo(original, duration * 0.5);
    }, duration * 300);
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
