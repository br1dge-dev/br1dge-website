/**
 * EffectChain - Cinematic audio effects for immersive space sound
 * Creates a cathedral-like acoustic space inspired by Hans Zimmer's Interstellar
 */
import * as Tone from 'tone';
import { EFFECTS } from './constants';

class EffectChainClass {
  // Master channel
  private masterChannel: Tone.Channel | null = null;
  private masterLimiter: Tone.Limiter | null = null;
  
  // Shared effect sends
  private reverb: Tone.Reverb | null = null;
  private delay: Tone.FeedbackDelay | null = null;
  private chorus: Tone.Chorus | null = null;
  private warmFilter: Tone.Filter | null = null;
  
  // Effect send channels
  private reverbSend: Tone.Channel | null = null;
  private delaySend: Tone.Channel | null = null;
  
  // Compressor for cinematic dynamics
  private compressor: Tone.Compressor | null = null;
  
  // Stereo widener
  private widener: Tone.StereoWidener | null = null;
  
  initialized = false;
  
  async init(): Promise<void> {
    if (this.initialized) return;
    
    // Create master limiter (last in chain)
    this.masterLimiter = new Tone.Limiter(-0.5);
    this.masterLimiter.toDestination();
    
    // Stereo widener for cinematic spread
    this.widener = new Tone.StereoWidener(0.7);
    this.widener.connect(this.masterLimiter);
    
    // Gentle compression for cohesion (not squashing)
    this.compressor = new Tone.Compressor({
      threshold: -18,
      ratio: 3,
      attack: 0.1,
      release: 0.4,
      knee: 10,
    });
    this.compressor.connect(this.widener);
    
    // Master channel
    this.masterChannel = new Tone.Channel({
      volume: -3,
      pan: 0,
    });
    this.masterChannel.connect(this.compressor);
    
    // Cathedral reverb - very long decay
    this.reverb = new Tone.Reverb({
      decay: EFFECTS.cathedralReverb.decay,
      wet: 1,
      preDelay: EFFECTS.cathedralReverb.preDelay,
    });
    await this.reverb.generate();
    
    // Reverb send channel
    this.reverbSend = new Tone.Channel({ volume: -3 });
    this.reverbSend.connect(this.reverb);
    this.reverb.connect(this.masterChannel);
    
    // Cosmic delay
    this.delay = new Tone.FeedbackDelay({
      delayTime: EFFECTS.cosmicDelay.delayTime,
      feedback: EFFECTS.cosmicDelay.feedback,
      wet: 1,
    });
    
    // Delay send channel
    this.delaySend = new Tone.Channel({ volume: -6 });
    this.delaySend.connect(this.delay);
    this.delay.connect(this.masterChannel);
    
    // Slow chorus for movement and width
    this.chorus = new Tone.Chorus({
      frequency: EFFECTS.widthChorus.frequency,
      depth: EFFECTS.widthChorus.depth,
      wet: EFFECTS.widthChorus.wet,
    });
    this.chorus.start();
    this.chorus.connect(this.masterChannel);
    
    // Warm filter - remove harshness, keep it smooth
    this.warmFilter = new Tone.Filter({
      frequency: EFFECTS.warmFilter.frequency,
      type: EFFECTS.warmFilter.type,
      Q: EFFECTS.warmFilter.Q,
    });
    this.warmFilter.connect(this.chorus);
    
    this.initialized = true;
  }
  
  /**
   * Get the main input for dry signals
   */
  getMainInput(): Tone.Filter | null {
    return this.warmFilter;
  }
  
  /**
   * Get reverb send
   */
  getReverbSend(): Tone.Channel | null {
    return this.reverbSend;
  }
  
  /**
   * Get delay send
   */
  getDelaySend(): Tone.Channel | null {
    return this.delaySend;
  }
  
  /**
   * Get master channel for direct connection
   */
  getMasterChannel(): Tone.Channel | null {
    return this.masterChannel;
  }
  
  /**
   * Set master volume in dB
   */
  setMasterVolume(db: number): void {
    if (this.masterChannel) {
      this.masterChannel.volume.rampTo(db, 0.5);
    }
  }
  
  /**
   * Mute/unmute all audio
   */
  setMuted(muted: boolean): void {
    if (this.masterChannel) {
      this.masterChannel.mute = muted;
    }
  }
  
  /**
   * Set reverb mix (0-1)
   */
  setReverbMix(amount: number): void {
    if (this.reverbSend) {
      const db = amount <= 0.01 ? -60 : -3 + (amount - 1) * 12;
      this.reverbSend.volume.rampTo(db, 1);
    }
  }
  
  /**
   * Set delay mix (0-1)
   */
  setDelayMix(amount: number): void {
    if (this.delaySend) {
      const db = amount <= 0.01 ? -60 : -6 + (amount - 1) * 12;
      this.delaySend.volume.rampTo(db, 1);
    }
  }
  
  /**
   * Set filter cutoff
   */
  setFilterFrequency(freq: number): void {
    if (this.warmFilter) {
      // Ensure minimum frequency to avoid Tone.js errors
      const safeFreq = Math.max(20, Math.min(20000, freq));
      this.warmFilter.frequency.rampTo(safeFreq, 0.5);
    }
  }
  
  /**
   * Underwater/Inverted mode - heavy lowpass, muffled sound
   */
  setUnderwaterMode(active: boolean): void {
    if (this.warmFilter) {
      const targetFreq = active ? 350 : 3000; // Dramatic lowpass when underwater
      this.warmFilter.frequency.linearRampTo(targetFreq, 0.8);
    }
  }
  
  /**
   * Dispose all effects
   */
  dispose(): void {
    this.masterChannel?.dispose();
    this.masterLimiter?.dispose();
    this.reverb?.dispose();
    this.delay?.dispose();
    this.chorus?.dispose();
    this.warmFilter?.dispose();
    this.reverbSend?.dispose();
    this.delaySend?.dispose();
    this.compressor?.dispose();
    this.widener?.dispose();
    this.initialized = false;
  }
}

export const EffectChain = new EffectChainClass();
