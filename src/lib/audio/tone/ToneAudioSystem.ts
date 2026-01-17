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
    
    // Method 1: Tone.start()
    await Tone.start();
    console.log('unlockAudio: after Tone.start(), context state:', Tone.context.state);
    
    // Method 2: If still suspended, try to resume the raw context
    if (Tone.context.state === 'suspended') {
      console.log('unlockAudio: context still suspended, trying raw resume');
      await Tone.context.resume();
      console.log('unlockAudio: after raw resume, context state:', Tone.context.state);
    }
    
    // Method 3: Play a silent buffer to force unlock (iOS workaround)
    if (Tone.context.state !== 'running') {
      console.log('unlockAudio: playing silent buffer as last resort');
      try {
        // Access the raw AudioContext
        const rawContext = Tone.context.rawContext as AudioContext;
        const silentBuffer = rawContext.createBuffer(1, 1, 22050);
        const source = rawContext.createBufferSource();
        source.buffer = silentBuffer;
        source.connect(rawContext.destination);
        source.start(0);
        // Wait a tiny bit for the buffer to play
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log('unlockAudio: after silent buffer, context state:', Tone.context.state);
      } catch (e) {
        console.warn('unlockAudio: silent buffer failed:', e);
      }
    }
  }
  
  /**
   * Initialize the entire audio system
   * Must be called after user interaction (click/touch)
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('ToneAudioSystem.init() starting...');
      
      // CRITICAL: Unlock audio first using multiple methods
      await this.unlockAudio();
      
      // Verify context is running
      if (Tone.context.state !== 'running') {
        console.warn('ToneAudioSystem.init(): context not running after unlock attempt:', Tone.context.state);
      }
      
      // Initialize effect chain
      await EffectChain.init();
      
      // Initialize soundscape
      await AmbientSoundscape.init();
      
      // Initialize SFX engine
      await SFXEngine.init();
      
      this.initialized = true;
      console.log('ToneAudioSystem initialized successfully, context state:', Tone.context.state);
    } catch (e) {
      console.warn('Failed to initialize ToneAudioSystem:', e);
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
