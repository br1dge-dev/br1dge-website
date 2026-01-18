/**
 * ToneAudioSystem - Main audio controller
 * Orchestrates the ambient soundscape and SFX engine
 * Provides the same API as the original AudioSystem for drop-in replacement
 */
import * as Tone from 'tone';
import { EffectChain } from './EffectChain';
import { MusicLoopSystem } from './MusicLoopSystem';
import { SFXEngine } from './SFXEngine';
import type { ToneAudioState } from './types';

class ToneAudioSystemClass {
  initialized = false;
  muted = false;
  private unlocking = false;  // Prevent concurrent unlock attempts
  
  // Track loop state - exposed as bgMusicStarted for API compatibility
  private loopStartedInternal = false;

  // API compatibility properties (read-only getters)
  get bgMusicStarted(): boolean {
    return this.loopStartedInternal;
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
    // Prevent concurrent unlock attempts (causes polyphony issues)
    if (this.unlocking) return;
    this.unlocking = true;
    
    // Helper: wrap any promise with a timeout
    const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T | null> => {
      return Promise.race([
        promise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))
      ]);
    };
    
    // Method 1: Tone.start() with timeout
    try {
      await withTimeout(Tone.start(), 2000);
    } catch (e) { /* ignore */ }
    
    // Method 2: If still suspended, try Tone.context.resume with timeout
    if (Tone.context.state === 'suspended') {
      try {
        await withTimeout(Tone.context.resume(), 2000);
      } catch (e) { /* ignore */ }
    }
    
    // Method 3: Try raw AudioContext resume with timeout
    if (Tone.context.state !== 'running') {
      try {
        const rawContext = Tone.context.rawContext as AudioContext;
        await withTimeout(rawContext.resume(), 2000);
      } catch (e) { /* ignore */ }
    }
    
    // Method 4: Play a silent buffer to force unlock (iOS workaround)
    try {
      const rawContext = Tone.context.rawContext as AudioContext;
      const silentBuffer = rawContext.createBuffer(1, 1, 22050);
      const source = rawContext.createBufferSource();
      source.buffer = silentBuffer;
      source.connect(rawContext.destination);
      source.start(0);
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (e) { /* ignore */ }
    
    this.unlocking = false;
  }
  
  /**
   * Initialize the entire audio system
   * Must be called after user interaction (click/touch)
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    
    // Helper: wrap any promise with a timeout
    const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T | null> => {
      return Promise.race([
        promise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))
      ]);
    };
    
    try {
      // Unlock audio first using multiple methods
      await this.unlockAudio();
      
      // Initialize components with timeouts
      await withTimeout(EffectChain.init(), 5000);
      await withTimeout(MusicLoopSystem.init(), 5000);
      await withTimeout(SFXEngine.init(), 5000);
      
      this.initialized = true;
    } catch (e) {
      console.error('ToneAudioSystem.init() failed:', e);
    }
  }
  
  /**
   * Resume audio context (required by browsers)
   * Call this on every user interaction to ensure audio is unlocked
   */
  async resume(): Promise<void> {
    try {
      await this.unlockAudio();
    } catch (e) { /* ignore */ }
  }
  
  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    this.muted = !this.muted;
    EffectChain.setMuted(this.muted);
    
    if (this.muted) {
      // Stop loops when muted
      MusicLoopSystem.stop();
    } else if (this.loopStartedInternal) {
      // Resume loops if it was playing
      MusicLoopSystem.start();
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
      soundscapeActive: MusicLoopSystem.active,
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
    if (!this.initialized || this.muted) return;
    SFXEngine.playCollect({ pitch });
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

   /**
    * Play thanks sound - positive, short, punchy confirmation
    * Played when user enables sound via speaker icon or sound-hint
    */
   playThanks(): void {
     if (!this.initialized || this.muted) return;
     SFXEngine.playThanks();
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
    * You died - melancholic dark chord
    */
   playYouDied(): void {
     if (!this.initialized || this.muted) return;
     SFXEngine.playYouDied();
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
    * Start loop-based music (replaces bg-music.mp3)
    * Call this after tutorial phase ends
    */
   async startBgMusic(): Promise<void> {
     if (!this.initialized || this.muted || this.loopStartedInternal) return;

     this.loopStartedInternal = true;
     await MusicLoopSystem.start();
   }

  /**
   * Stop loop-based music
   */
  stopBgMusic(): void {
    if (!this.loopStartedInternal) return;

    MusicLoopSystem.stop();
    this.loopStartedInternal = false;
  }

  /**
   * Update music based on game level
   * Controls which tracks are active based on upgradeLevel
   */
  setGameLevel(level: number): void {
    MusicLoopSystem.setLevel(level);
  }

  /**
   * Set music intensity (no-op for loop system, kept for API compatibility)
   */
  setIntensity(value: number): void {
    // MusicLoopSystem doesn't have intensity - tracks are level-based
  }

  /**
   * Trigger a momentary swell in the music
   */
  triggerSwell(duration = 2): void {
    // Music loops don't have swells, but we keep this for API compatibility
  }

  /**
   * Inverted/Underwater mode - muffled with driving pulse
   * Call when red particle captured, disable on discharge
   */
  setInvertedMode(active: boolean): void {
    if (!this.initialized || this.muted) return;

    // Apply underwater filter to entire mix
    EffectChain.setUnderwaterMode(active);

    // Note: MusicLoopSystem doesn't have inverted mode
    // The EffectChain underwater filter handles the audio processing
  }

  /**
   * Cleanup all audio resources
   */
  dispose(): void {
    SFXEngine.dispose();
    MusicLoopSystem.dispose();
    EffectChain.dispose();
    this.initialized = false;
    this.loopStartedInternal = false;
  }
}

// Export singleton instance
export const ToneAudioSystem = new ToneAudioSystemClass();

// Also export as default for flexibility
export default ToneAudioSystem;
