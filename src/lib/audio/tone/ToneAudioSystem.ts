/**
 * ToneAudioSystem - Main audio controller
 * Orchestrates the ambient soundscape and SFX engine
 * Provides the same API as the original AudioSystem for drop-in replacement
 */
import * as Tone from 'tone';
import { EffectChain } from './EffectChain';
import { AmbientSoundscape } from './AmbientSoundscape';
import { SFXEngine } from './SFXEngine';
import type { ToneAudioState } from './types';

class ToneAudioSystemClass {
  initialized = false;
  muted = false;
  
  // Track soundscape state - exposed as bgMusicStarted for API compatibility
  private soundscapeStartedInternal = false;
  
  // API compatibility properties (read-only getters)
  get bgMusicStarted(): boolean {
    return this.soundscapeStartedInternal;
  }
  
  // bgMusic is always "loaded" since we use synthesizers
  get bgMusic(): boolean {
    return this.initialized;
  }
  
  /**
   * Unlock audio on iOS/Safari by playing a silent buffer
   * This is the most reliable way to unlock audio on mobile
   */
  private async unlockAudio(): Promise<void> {
    console.log('unlockAudio: attempting to unlock, context state:', Tone.context.state);
    
    // Helper: wrap any promise with a timeout
    const withTimeout = <T>(promise: Promise<T>, ms: number, name: string): Promise<T | null> => {
      return Promise.race([
        promise,
        new Promise<null>((resolve) => {
          setTimeout(() => {
            console.warn(`unlockAudio: ${name} timed out after ${ms}ms`);
            resolve(null);
          }, ms);
        })
      ]);
    };
    
    // Method 1: Tone.start() with timeout
    try {
      console.log('unlockAudio: calling Tone.start()...');
      await withTimeout(Tone.start(), 2000, 'Tone.start()');
      console.log('unlockAudio: after Tone.start(), context state:', Tone.context.state);
    } catch (e) {
      console.warn('unlockAudio: Tone.start() failed:', e);
    }
    
    // Method 2: If still suspended, try Tone.context.resume with timeout
    if (Tone.context.state === 'suspended') {
      console.log('unlockAudio: context still suspended, trying Tone.context.resume()');
      try {
        await withTimeout(Tone.context.resume(), 2000, 'Tone.context.resume()');
        console.log('unlockAudio: after Tone.context.resume(), state:', Tone.context.state);
      } catch (e) {
        console.warn('unlockAudio: Tone.context.resume() failed:', e);
      }
    }
    
    // Method 3: Try raw AudioContext resume with timeout
    if (Tone.context.state !== 'running') {
      console.log('unlockAudio: trying rawContext.resume()');
      try {
        const rawContext = Tone.context.rawContext as AudioContext;
        await withTimeout(rawContext.resume(), 2000, 'rawContext.resume()');
        console.log('unlockAudio: after rawContext.resume(), rawState:', rawContext.state);
      } catch (e) {
        console.warn('unlockAudio: rawContext.resume() failed:', e);
      }
    }
    
    // Method 4: Play a silent buffer to force unlock (iOS workaround)
    // Do this regardless of state - it's the most reliable iOS unlock method
    console.log('unlockAudio: playing silent buffer (iOS unlock)');
    try {
      const rawContext = Tone.context.rawContext as AudioContext;
      const silentBuffer = rawContext.createBuffer(1, 1, 22050);
      const source = rawContext.createBufferSource();
      source.buffer = silentBuffer;
      source.connect(rawContext.destination);
      source.start(0);
      await new Promise(resolve => setTimeout(resolve, 50));
      console.log('unlockAudio: after silent buffer, rawState:', rawContext.state);
    } catch (e) {
      console.warn('unlockAudio: silent buffer failed:', e);
    }
    
    console.log('unlockAudio: FINAL context state:', Tone.context.state);
  }
  
  /**
   * Initialize the entire audio system
   * Must be called after user interaction (click/touch)
   */
  async init(): Promise<void> {
    if (this.initialized) {
      console.log('ToneAudioSystem.init(): already initialized');
      return;
    }
    
    // Helper: wrap any promise with a timeout
    const withTimeout = <T>(promise: Promise<T>, ms: number, name: string): Promise<T | null> => {
      return Promise.race([
        promise,
        new Promise<null>((resolve) => {
          setTimeout(() => {
            console.warn(`ToneAudioSystem.init(): ${name} timed out after ${ms}ms`);
            resolve(null);
          }, ms);
        })
      ]);
    };
    
    try {
      console.log('ToneAudioSystem.init() starting...');
      
      // CRITICAL: Unlock audio first using multiple methods
      await this.unlockAudio();
      
      // Verify context is running
      if (Tone.context.state !== 'running') {
        console.warn('ToneAudioSystem.init(): context not running after unlock:', Tone.context.state);
        // Continue anyway - some browsers report 'suspended' but still work
      }
      
      // Initialize effect chain with timeout
      console.log('ToneAudioSystem.init(): initializing EffectChain...');
      await withTimeout(EffectChain.init(), 5000, 'EffectChain.init()');
      console.log('ToneAudioSystem.init(): EffectChain done');
      
      // Initialize soundscape with timeout
      console.log('ToneAudioSystem.init(): initializing AmbientSoundscape...');
      await withTimeout(AmbientSoundscape.init(), 5000, 'AmbientSoundscape.init()');
      console.log('ToneAudioSystem.init(): AmbientSoundscape done');
      
      // Initialize SFX engine with timeout
      console.log('ToneAudioSystem.init(): initializing SFXEngine...');
      await withTimeout(SFXEngine.init(), 5000, 'SFXEngine.init()');
      console.log('ToneAudioSystem.init(): SFXEngine done');
      
      this.initialized = true;
      console.log('ToneAudioSystem FULLY INITIALIZED, context state:', Tone.context.state);
    } catch (e) {
      console.error('ToneAudioSystem.init() FAILED:', e);
    }
  }
  
  /**
   * Resume audio context (required by browsers)
   * Call this on every user interaction to ensure audio is unlocked
   */
  async resume(): Promise<void> {
    console.log('ToneAudioSystem.resume() called, context state:', Tone.context.state);
    try {
      await this.unlockAudio();
    } catch (e) {
      console.warn('ToneAudioSystem.resume() failed:', e);
    }
  }
  
  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    this.muted = !this.muted;
    EffectChain.setMuted(this.muted);
    
    if (this.muted) {
      // Stop soundscape when muted
      AmbientSoundscape.stop();
    } else if (this.soundscapeStartedInternal) {
      // Resume soundscape if it was playing
      AmbientSoundscape.start();
    }
    
    return this.muted;
  }
  
  /**
   * Get current state
   */
  getState(): ToneAudioState {
    return {
      initialized: this.initialized,
      muted: this.muted,
      soundscapeActive: AmbientSoundscape.active,
      masterVolume: -6,
      currentBPM: Tone.Transport.bpm.value,
    };
  }
  
  // ============================================
  // SFX Methods - Same API as original AudioSystem
  // ============================================
  
  /**
   * Play particle collection sound
   */
  playCollect(pitch = 0): void {
    console.log('playCollect called, initialized:', this.initialized, 'muted:', this.muted);
    if (!this.initialized || this.muted) return;
    SFXEngine.playCollect({ pitch });
  }
  
  /**
   * Play a simple test beep directly to output (debugging)
   */
  async playTestBeep(): Promise<void> {
    console.log('playTestBeep called, context state:', Tone.context.state);
    try {
      // Create a simple oscillator directly connected to destination
      const osc = new Tone.Oscillator(440, 'sine').toDestination();
      osc.volume.value = -6;
      osc.start();
      osc.stop('+0.2');
      console.log('playTestBeep: beep started');
    } catch (e) {
      console.error('playTestBeep failed:', e);
    }
  }
  
  /**
   * Play super star collection sound (bright, shimmering)
   */
  playSuperStarCollect(): void {
    if (!this.initialized || this.muted) return;
    SFXEngine.playSuperStarCollect();
  }
  
  /**
   * Play rejected discharge sound (soft denial)
   */
  playRejectDischarge(): void {
    if (!this.initialized || this.muted) return;
    SFXEngine.playRejectDischarge();
  }
  
  /**
   * Play capture sound (red/colored particle)
   */
  playCapture(): void {
    if (!this.initialized || this.muted) return;
    SFXEngine.playCapture();
  }
  
  /**
   * Play discharge sound
   */
  playDischarge(level = 1): void {
    if (!this.initialized || this.muted) return;
    SFXEngine.playDischarge({ level });
  }
  
  /**
   * Play level up sound
   */
  playLevelUp(level = 1): void {
    if (!this.initialized || this.muted) return;
    SFXEngine.playLevelUp({ level });
  }
  
  /**
   * Play max stack sound (6 red particles)
   */
  playMaxStack(): void {
    if (!this.initialized || this.muted) return;
    SFXEngine.playMaxStack();
  }
  
  /**
   * Play modal enter sound
   */
  playModalEnter(): void {
    if (!this.initialized || this.muted) return;
    SFXEngine.playModalEnter();
  }
  
  /**
   * Play modal close sound
   */
  playModalClose(): void {
    if (!this.initialized || this.muted) return;
    SFXEngine.playModalClose();
  }
  
  /**
   * Play chamber capture sound
   */
  playChamberCapture(count = 1): void {
    if (!this.initialized || this.muted) return;
    SFXEngine.playChamberCapture({ count });
  }
  
  /**
   * Play bridge spawn sound
   */
  playBridgeSpawn(): void {
    if (!this.initialized || this.muted) return;
    SFXEngine.playBridgeSpawn();
  }
  
  /**
   * Play collection complete sound
   */
  playCollectionComplete(): void {
    if (!this.initialized || this.muted) return;
    SFXEngine.playCollectionComplete();
  }
  
  /**
   * Play red heart capture - special ethereal sound for inverted mode
   */
  playRedHeartCapture(): void {
    if (!this.initialized || this.muted) return;
    SFXEngine.playRedHeartCapture();
  }
  
  // ============================================
  // Spiral Enemy Sounds
  // ============================================
  
  /**
   * Spiral spawn sound - ominous arrival
   */
  playSpiralSpawn(): void {
    if (!this.initialized || this.muted) return;
    SFXEngine.playSpiralSpawn();
  }
  
  /**
   * Spiral defeat sound - when cursor destroys it
   */
  playSpiralDefeat(): void {
    if (!this.initialized || this.muted) return;
    SFXEngine.playSpiralDefeat();
  }
  
  /**
   * Spiral damage sound - when it hits the logo
   */
  playSpiralDamage(): void {
    if (!this.initialized || this.muted) return;
    SFXEngine.playSpiralDamage();
  }
  
  /**
   * Spiral suction - continuous dark sucking sound
   * @param intensity 0-1 (0 to stop)
   */
  setSpiralSuction(intensity: number): void {
    if (!this.initialized || this.muted) {
      SFXEngine.setSpiralSuction(0);
      return;
    }
    SFXEngine.setSpiralSuction(intensity);
  }
  
  // ============================================
  // Continuous Effects
  // ============================================
  
  /**
   * Chamber crackling - electric hum from caught particles
   * @param count Number of particles in chamber (0 to stop)
   */
  setChamberCrackling(count: number): void {
    if (!this.initialized || this.muted) {
      SFXEngine.setChamberCrackling(0);
      return;
    }
    SFXEngine.setChamberCrackling(count);
  }
  
  /**
   * Bridge attraction sound - sweet tempting vibrato
   * @param strength 0-1 attraction strength (0 to stop)
   */
  setBridgeAttraction(strength: number): void {
    if (!this.initialized || this.muted) {
      SFXEngine.setBridgeAttraction(0);
      return;
    }
    SFXEngine.setBridgeAttraction(strength);
  }
  
  // ============================================
  // Background Music / Soundscape Methods
  // ============================================
  
  /**
   * Start ambient soundscape (replaces bg-music.mp3)
   * Call this on first meaningful interaction (like first discharge)
   */
  async startBgMusic(): Promise<void> {
    if (!this.initialized || this.muted || this.soundscapeStartedInternal) return;
    
    this.soundscapeStartedInternal = true;
    AmbientSoundscape.start();
  }
  
  /**
   * Stop ambient soundscape
   */
  stopBgMusic(): void {
    if (!this.soundscapeStartedInternal) return;
    
    AmbientSoundscape.stop();
    this.soundscapeStartedInternal = false;
  }
  
  /**
   * Update soundscape intensity based on game progress
   */
  setIntensity(value: number): void {
    AmbientSoundscape.setIntensity(value);
  }
  
  /**
   * Update soundscape based on game level
   */
  setGameLevel(level: number): void {
    AmbientSoundscape.setGameLevel(level);
  }
  
  /**
   * Trigger a momentary swell in the soundscape
   */
  triggerSwell(duration = 2): void {
    AmbientSoundscape.swell(duration);
  }
  
  /**
   * Inverted/Underwater mode - muffled with driving pulse
   * Call when red particle captured, disable on discharge
   */
  setInvertedMode(active: boolean): void {
    if (!this.initialized || this.muted) return;
    
    // Apply underwater filter to entire mix
    EffectChain.setUnderwaterMode(active);
    
    // Switch ambient to pulse mode
    AmbientSoundscape.setInvertedMode(active);
  }
  
  /**
   * Cleanup all audio resources
   */
  dispose(): void {
    SFXEngine.dispose();
    AmbientSoundscape.dispose();
    EffectChain.dispose();
    this.initialized = false;
    this.soundscapeStartedInternal = false;
  }
}

// Export singleton instance
export const ToneAudioSystem = new ToneAudioSystemClass();

// Also export as default for flexibility
export default ToneAudioSystem;
