/**
 * SFXEngine - Cinematic sound effects inspired by Interstellar
 * 
 * Design principles:
 * - Musical SFX that complement the ambient soundscape
 * - Rich harmonics through layering
 * - Satisfying feedback without being harsh
 * - Everything in the same reverb space for cohesion
 */
import * as Tone from 'tone';
import { NOTES, SYNTHS, VOLUME } from './constants';
import { EffectChain } from './EffectChain';
import { AmbientSoundscape } from './AmbientSoundscape';
import type { SFXParams } from './types';

class SFXEngineClass {
  // Main melodic synth
  private melodicSynth: Tone.PolySynth | null = null;
  private melodicGain: Tone.Gain | null = null;
  
  // Sub layer for weight
  private subSynth: Tone.MonoSynth | null = null;
  private subGain: Tone.Gain | null = null;
  
  // High harmonic layer
  private harmonicSynth: Tone.PolySynth | null = null;
  private harmonicGain: Tone.Gain | null = null;
  
  // Noise for texture
  private noiseSynth: Tone.NoiseSynth | null = null;
  private noiseFilter: Tone.Filter | null = null;
  private noiseGain: Tone.Gain | null = null;
  
  // Chamber crackling - electric gravitational hum
  private crackleNoise: Tone.NoiseSynth | null = null;
  private crackleFilter: Tone.Filter | null = null;
  private crackleLFO: Tone.LFO | null = null;
  private crackleGain: Tone.Gain | null = null;
  private crackleActive = false;
  
  // Bridge attraction - sweet tempting vibrato
  private attractSynth: Tone.Synth | null = null;
  private attractVibrato: Tone.Vibrato | null = null;
  private attractFilter: Tone.Filter | null = null;
  private attractGain: Tone.Gain | null = null;
  private attractActive = false;
  
  initialized = false;
  
  async init(): Promise<void> {
    if (this.initialized) return;
    
    const mainInput = EffectChain.getMainInput();
    const reverbSend = EffectChain.getReverbSend();
    const delaySend = EffectChain.getDelaySend();
    
    if (!mainInput || !reverbSend || !delaySend) {
      console.warn('EffectChain not initialized');
      return;
    }
    
    // === MELODIC SYNTH ===
    this.melodicSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.02,
        decay: 0.3,
        sustain: 0.3,
        release: 1.2,
      },
    });
    
    this.melodicGain = new Tone.Gain(Tone.dbToGain(VOLUME.sfx));
    this.melodicSynth.connect(this.melodicGain);
    this.melodicGain.connect(mainInput);
    this.melodicGain.connect(reverbSend);
    
    // === SUB SYNTH for weight ===
    this.subSynth = new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.05,
        decay: 0.4,
        sustain: 0.2,
        release: 1,
      },
    });
    
    this.subGain = new Tone.Gain(Tone.dbToGain(VOLUME.sfx - 6));
    this.subSynth.connect(this.subGain);
    this.subGain.connect(mainInput);
    this.subGain.connect(reverbSend);
    
    // === HARMONIC SYNTH for shimmer ===
    this.harmonicSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.1,
        decay: 0.5,
        sustain: 0.2,
        release: 2,
      },
    });
    
    this.harmonicGain = new Tone.Gain(Tone.dbToGain(VOLUME.sfx - 12));
    this.harmonicSynth.connect(this.harmonicGain);
    this.harmonicGain.connect(mainInput);
    this.harmonicGain.connect(reverbSend);
    this.harmonicGain.connect(delaySend);
    
    // === NOISE for impacts ===
    this.noiseFilter = new Tone.Filter({
      frequency: 1000,
      type: 'bandpass',
      Q: 2,
    });
    
    this.noiseSynth = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: {
        attack: 0.02,
        decay: 0.2,
        sustain: 0,
        release: 0.3,
      },
    });
    
    this.noiseGain = new Tone.Gain(Tone.dbToGain(VOLUME.sfx - 18));
    this.noiseSynth.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(mainInput);
    this.noiseGain.connect(reverbSend);
    
    // === CHAMBER CRACKLING - Electric gravitational hum ===
    this.crackleFilter = new Tone.Filter({
      frequency: 800,
      type: 'bandpass',
      Q: 8,
    });
    
    this.crackleNoise = new Tone.NoiseSynth({
      noise: { type: 'brown' },
      envelope: {
        attack: 0.5,
        decay: 0,
        sustain: 1,
        release: 0.5,
      },
    });
    
    // LFO for crackling/pulsing effect
    this.crackleLFO = new Tone.LFO({
      frequency: 12, // Fast crackling
      min: 200,
      max: 1200,
      type: 'sawtooth',
    });
    this.crackleLFO.connect(this.crackleFilter.frequency);
    
    this.crackleGain = new Tone.Gain(0);
    this.crackleNoise.connect(this.crackleFilter);
    this.crackleFilter.connect(this.crackleGain);
    this.crackleGain.connect(mainInput);
    this.crackleGain.connect(reverbSend);
    
    // === BRIDGE ATTRACTION - Deep tectonic rumble ===
    this.attractVibrato = new Tone.Vibrato({
      frequency: 0.5,   // Very slow wobble
      depth: 0.15,
      type: 'sine',
    });
    
    this.attractFilter = new Tone.Filter({
      frequency: 150,   // Very low, subby
      type: 'lowpass',
      Q: 2,
    });
    
    this.attractSynth = new Tone.Synth({
      oscillator: { type: 'sine' },  // Pure sub
      envelope: {
        attack: 1.5,    // Slow swell
        decay: 0,
        sustain: 1,
        release: 2,
      },
    });
    
    this.attractGain = new Tone.Gain(0);
    this.attractSynth.connect(this.attractVibrato);
    this.attractVibrato.connect(this.attractFilter);
    this.attractFilter.connect(this.attractGain);
    this.attractGain.connect(mainInput);
    this.attractGain.connect(reverbSend);
    
    this.initialized = true;
  }
  
  // Track rapid collecting for combo effect
  private collectCombo = 0;
  private lastCollectTime = 0;
  
  /**
   * Collect - Subtle, ambient star collection - like distant wind chimes
   * Quieter and more atmospheric to not overwhelm during rapid collection
   */
  playCollect(params: SFXParams = {}): void {
    if (!this.initialized || !this.melodicSynth) return;
    
    const now = Tone.now();
    const currentTime = Date.now();
    
    // Combo tracking - resets after 300ms gap
    if (currentTime - this.lastCollectTime < 300) {
      this.collectCombo = Math.min(10, this.collectCombo + 1);
    } else {
      this.collectCombo = 0;
    }
    this.lastCollectTime = currentTime;
    
    const pitch = params.pitch ?? 0;
    // Much quieter base velocity for ambient feel
    const baseVelocity = params.velocity ?? 0.25;
    
    // Gentler combo boost - subtle crescendo
    const comboBoost = 1 + this.collectCombo * 0.05;
    const velocity = Math.min(0.5, baseVelocity * comboBoost);
    
    // Note selection - higher pitch with combo
    const noteIndex = Math.min(pitch + Math.floor(this.collectCombo / 3), NOTES.collectScale.length - 1);
    const note = NOTES.collectScale[noteIndex];
    
    // Soft melodic ping - like a single raindrop
    this.melodicSynth.triggerAttackRelease(note, '32n', now, velocity * 0.6);
    
    // Very subtle sub only on higher combos
    if (this.subSynth && this.collectCombo >= 5) {
      this.subSynth.triggerAttackRelease('G2', '32n', now, velocity * 0.15);
    }
    
    // Delicate shimmer on high combo (reward!)
    if (this.harmonicSynth && this.collectCombo >= 6) {
      const upperNote = note.replace(/\d/, (m) => String(Math.min(7, Number(m) + 1)));
      this.harmonicSynth.triggerAttackRelease(upperNote, '32n', now + 0.01, velocity * 0.2);
    }
  }
  
  /**
   * Super Star Collect - Celestial stardust chime, like catching a shooting star
   * Inspired by orchestral celesta/glockenspiel with string harmonics
   */
  playSuperStarCollect(): void {
    if (!this.initialized || !this.melodicSynth) return;
    
    const now = Tone.now();
    
    // Perfect fifth interval - the most pleasing harmonic relationship
    // Like a tiny music box or distant wind chimes
    this.melodicSynth.triggerAttackRelease('G5', '8n', now, 0.28);
    this.melodicSynth.triggerAttackRelease('D5', '8n', now + 0.015, 0.22);
    
    // Ethereal octave shimmer - like string harmonics
    if (this.harmonicSynth) {
      this.harmonicSynth.triggerAttackRelease('G6', '4n', now + 0.04, 0.12);
    }
  }
  
  /**
   * Rejected Discharge - Soft, muted denial when requirements not met
   * Like a gentle "not yet" - warm but clearly indicating incompleteness
   * Inspired by muted brass or distant timpani
   */
  playRejectDischarge(): void {
    if (!this.initialized) return;
    
    const now = Tone.now();
    
    // Low muted thud - like a soft door closing, not harsh
    if (this.subSynth) {
      try { this.subSynth.triggerRelease(now); } catch (e) { /* ignore */ }
      this.subSynth.triggerAttackRelease('D2', '8n', now, 0.35);
    }
    
    // Muted melodic hint - minor second for gentle tension
    this.melodicSynth?.triggerAttackRelease('G3', '16n', now + 0.02, 0.2);
    
    // Soft filtered noise - like a whispered "shh"
    if (this.noiseFilter && this.noiseSynth) {
      this.noiseFilter.frequency.setValueAtTime(300, now);
      this.noiseFilter.frequency.rampTo(100, 0.15);
      this.noiseSynth.triggerAttackRelease('32n', now + 0.01);
    }
  }
  
  /**
   * Capture - Deep, impactful, satisfying
   */
  playCapture(params: SFXParams = {}): void {
    if (!this.initialized) return;
    
    const now = Tone.now();
    const velocity = params.velocity ?? 0.8;
    
    // Deep sub impact - safely retrigger MonoSynth
    if (this.subSynth) {
      try { this.subSynth.triggerRelease(now); } catch (e) { /* ignore */ }
      this.subSynth.triggerAttackRelease('G2', '4n', now + 0.01, velocity);
    }
    
    // Harmonic layer
    this.melodicSynth?.triggerAttackRelease(['G3', 'D4'], '4n', now + 0.03, velocity * 0.5);
    
    // Noise texture
    if (this.noiseFilter && this.noiseSynth) {
      try {
        this.noiseFilter.frequency.setValueAtTime(800, now + 0.01);
        this.noiseFilter.frequency.rampTo(200, 0.3);
        this.noiseSynth.triggerAttackRelease('8n', now + 0.02);
      } catch (e) { /* ignore */ }
    }
    
    // Trigger ambient swell
    AmbientSoundscape.swell(1.5);
  }
  
  /**
   * Red Heart Capture - Magical, powerful but warm
   * Like catching a falling star - special, not scary
   */
  playRedHeartCapture(): void {
    if (!this.initialized) return;
    
    const now = Tone.now();
    
    // Warm sub impact - like a deep bell
    // Use slightly future time to avoid timing conflicts
    if (this.subSynth) {
      try { this.subSynth.triggerRelease(now); } catch (e) { /* ignore */ }
      this.subSynth.triggerAttackRelease('D2', '4n', now + 0.05, 0.7);
    }
    
    // Magical chord - major with added 9th (D, F#, A, E) = dreamy, hopeful
    this.melodicSynth?.triggerAttackRelease(['D3', 'F#3', 'A3'], '4n', now + 0.08, 0.5);
    
    // Shimmering high harmonics - like stardust
    if (this.harmonicSynth) {
      this.harmonicSynth.triggerAttackRelease('D5', '4n', now + 0.12, 0.35);
      this.harmonicSynth.triggerAttackRelease('A5', '2n', now + 0.18, 0.25);
      this.harmonicSynth.triggerAttackRelease('E6', '2n', now + 0.25, 0.15);
    }
    
    // Soft whoosh - like wind, not harsh
    if (this.noiseFilter && this.noiseSynth) {
      this.noiseFilter.frequency.setValueAtTime(1200, now + 0.1);
      this.noiseFilter.frequency.exponentialRampTo(300, 0.5);
      this.noiseSynth.triggerAttackRelease('16n', now + 0.1);
    }
  }
  
  /**
   * Discharge - Powerful, cinematic release
   */
  playDischarge(params: SFXParams = {}): void {
    if (!this.initialized) return;
    
    const now = Tone.now();
    const level = params.level ?? 1;
    const velocity = 0.6 + (level / 10) * 0.4;
    
    // Deep foundation - safely retrigger MonoSynth
    if (this.subSynth) {
      try { this.subSynth.triggerRelease(now); } catch (e) { /* ignore */ }
      this.subSynth.triggerAttackRelease('G1', '2n', now + 0.01, velocity);
    }
    
    // Rising power chord
    const notes = NOTES.droneFifths.slice(0, 2 + Math.floor(level / 3));
    this.melodicSynth?.triggerAttackRelease(notes, '2n', now + 0.05, velocity * 0.6);
    
    // High shimmer release
    this.harmonicSynth?.triggerAttackRelease(['G5', 'D6'], '1n', now + 0.1, velocity * 0.3);
    
    // Noise sweep
    if (this.noiseFilter && this.noiseSynth) {
      this.noiseFilter.frequency.setValueAtTime(100, now);
      this.noiseFilter.frequency.exponentialRampTo(3000, 0.3);
      this.noiseFilter.frequency.exponentialRampTo(200, 0.8);
      this.noiseSynth.triggerAttackRelease('4n', now);
    }
    
    // Big ambient swell
    AmbientSoundscape.swell(2.5);
  }
  
  /**
   * Level Up - Triumphant, ascending
   */
  playLevelUp(params: SFXParams = {}): void {
    if (!this.initialized || !this.melodicSynth) return;

    const now = Tone.now();
    const level = params.level ?? 1;
    const velocity = 0.5 + (level / 10) * 0.3;

    // Use strictly increasing time offsets to avoid Tone.js timing error
    let timeOffset = 0;

    // Ascending chord tones
    NOTES.levelUpChord.slice(0, 3 + Math.floor(level / 3)).forEach((note) => {
      this.melodicSynth?.triggerAttackRelease(note, '1n', now + timeOffset, velocity);
      timeOffset += 0.08; // Slightly smaller gap for tighter chord
    });

    // Sub foundation - unique time after chord
    this.subSynth?.triggerAttackRelease('G2', '1n', now + timeOffset, velocity * 0.8);
    timeOffset += 0.15;

    // Shimmer - unique time after sub
    this.harmonicSynth?.triggerAttackRelease(['G5', 'D6'], '1n', now + timeOffset, velocity * 0.4);

    // Update ambient
    AmbientSoundscape.setGameLevel(level);
  }
  
  /**
   * Max Stack - Epic, triumphant climax
   */
  playMaxStack(): void {
    if (!this.initialized) return;
    
    const now = Tone.now();
    
    // Use strictly increasing time offsets to avoid MonoSynth timing conflicts
    let timeOffset = 0.01;  // Start slightly in the future
    
    // Massive chord - sicher mit if checks
    NOTES.maxStackChord.forEach((note) => {
      if (this.melodicSynth) {
        this.melodicSynth.triggerAttackRelease(note, '1m', now + timeOffset, 0.7);
        timeOffset += 0.06;
      }
    });
    
    // Deep sub - needs unique time, stop any previous note first
    if (this.subSynth) {
      try {
        this.subSynth.triggerRelease(now);  // Release any playing note
      } catch (e) {
        // Ignore if nothing playing
      }
      this.subSynth.triggerAttackRelease('G1', '1m', now + timeOffset, 0.9);
      timeOffset += 0.1;
    }
    
    // High shimmer cascade
    NOTES.celestial.forEach((note) => {
      if (this.harmonicSynth) {
        this.harmonicSynth.triggerAttackRelease(note, '2n', now + timeOffset, 0.4);
        timeOffset += 0.15;
      }
    });
    
    // Noise impact - sicher
    if (this.noiseFilter && this.noiseSynth) {
      try {
        this.noiseFilter.frequency.setValueAtTime(200, now + 0.01);
        this.noiseFilter.frequency.exponentialRampTo(4000, 0.5);
        this.noiseFilter.frequency.rampTo(500, 2);
        this.noiseSynth.triggerAttackRelease('2n', now + 0.02);
      } catch (e) {
        // Ignore filter errors
      }
    }
    
    // Epic swell - nur wenn Ambient aktiv (nicht inverted)
    AmbientSoundscape.swell(4);
    AmbientSoundscape.setGameLevel(10);
  }
  
  /**
   * Modal Enter - Gentle, inviting
   */
  playModalEnter(): void {
    if (!this.initialized) return;
    
    const now = Tone.now();
    
    // Soft high notes
    this.melodicSynth?.triggerAttackRelease('D5', '4n', now, 0.4);
    this.melodicSynth?.triggerAttackRelease('G5', '4n', now + 0.08, 0.3);
    
    // Subtle harmonic
    this.harmonicSynth?.triggerAttackRelease('D6', '2n', now + 0.1, 0.2);
  }
  
  /**
   * Modal Close - Soft, resolving
   */
  playModalClose(): void {
    if (!this.initialized || !this.melodicSynth) return;
    
    const now = Tone.now();
    
    // Descending resolution
    this.melodicSynth.triggerAttackRelease('D5', '8n', now, 0.3);
    this.melodicSynth.triggerAttackRelease('G4', '8n', now + 0.1, 0.25);
  }
  
  /**
   * Chamber Capture - Crystalline, building
   */
  playChamberCapture(params: SFXParams = {}): void {
    if (!this.initialized || !this.melodicSynth) return;
    
    const count = params.count ?? 1;
    const note = NOTES.chamberScale[Math.min(count - 1, NOTES.chamberScale.length - 1)];
    const velocity = 0.35 + (count / 5) * 0.25;
    
    // Main tone
    this.melodicSynth.triggerAttackRelease(note, '8n', Tone.now(), velocity);
    
    // Harmonic on higher counts
    if (count >= 3 && this.harmonicSynth) {
      const upperNote = note.replace(/\d/, (m) => String(Math.min(7, Number(m) + 1)));
      this.harmonicSynth.triggerAttackRelease(upperNote, '8n', Tone.now() + 0.03, velocity * 0.4);
    }
  }
  
  /**
   * Bridge Spawn - Heroic, impactful
   */
  playBridgeSpawn(): void {
    if (!this.initialized) return;
    
    const now = Tone.now();
    
    // Sub impact - safely retrigger MonoSynth
    if (this.subSynth) {
      try { this.subSynth.triggerRelease(now); } catch (e) { /* ignore */ }
      this.subSynth.triggerAttackRelease('G2', '4n', now + 0.01, 0.8);
    }
    
    // Heroic chord
    NOTES.bridgeChord.forEach((note, i) => {
      this.melodicSynth?.triggerAttackRelease(note, '4n', now + 0.15 + i * 0.08, 0.6);
    });
    
    // Shimmer
    this.harmonicSynth?.triggerAttackRelease(['G5', 'D6'], '2n', now + 0.4, 0.35);
    
    // Noise texture
    if (this.noiseFilter && this.noiseSynth) {
      this.noiseFilter.frequency.setValueAtTime(200, now);
      this.noiseFilter.frequency.rampTo(1500, 0.3);
      this.noiseSynth.triggerAttackRelease('8n', now);
    }
    
    AmbientSoundscape.swell(2);
  }
  
  /**
   * Collection Complete - Satisfying resolution
   */
  playCollectionComplete(): void {
    if (!this.initialized || !this.melodicSynth) return;
    
    const now = Tone.now();
    
    // Ascending arpeggio
    NOTES.completeArpeggio.forEach((note, i) => {
      this.melodicSynth?.triggerAttackRelease(note, '4n', now + i * 0.12, 0.6);
    });
    
    // Final shimmer
    this.harmonicSynth?.triggerAttackRelease('G6', '2n', now + 0.4, 0.3);
  }
  
  // ============================================
  // SPIRAL ENEMY SOUNDS
  // ============================================
  
  /**
   * Spiral Spawn - Ominous, dark arrival
   */
  playSpiralSpawn(): void {
    if (!this.initialized) return;
    
    const now = Tone.now();
    
    // Deep ominous rumble
    if (this.subSynth) {
      try { this.subSynth.triggerRelease(now); } catch (e) { /* ignore */ }
      this.subSynth.triggerAttackRelease('D1', '2n', now + 0.05, 0.5);
    }
    
    // Dissonant minor 2nd - unsettling
    this.melodicSynth?.triggerAttackRelease(['D2', 'Eb2'], '4n', now + 0.1, 0.3);
    
    // Dark descending tone
    if (this.harmonicSynth) {
      this.harmonicSynth.triggerAttackRelease('D4', '8n', now + 0.15, 0.25);
      this.harmonicSynth.triggerAttackRelease('C4', '8n', now + 0.3, 0.2);
    }
  }
  
  /**
   * Spiral Defeat - Satisfying destruction when cursor hits it
   */
  playSpiralDefeat(): void {
    if (!this.initialized) return;
    
    const now = Tone.now();
    
    // Release burst
    if (this.noiseFilter && this.noiseSynth) {
      this.noiseFilter.frequency.setValueAtTime(400, now + 0.05);
      this.noiseFilter.frequency.exponentialRampTo(2000, 0.3);
      this.noiseFilter.frequency.exponentialRampTo(100, 0.5);
      this.noiseSynth.triggerAttackRelease('4n', now + 0.05);
    }
    
    // Rising resolution chord
    this.melodicSynth?.triggerAttackRelease(['G3', 'D4'], '4n', now + 0.1, 0.4);
    this.harmonicSynth?.triggerAttackRelease('G5', '2n', now + 0.2, 0.25);
  }
  
  /**
   * Spiral Damage - When spiral hits logo, destructive impact
   */
  playSpiralDamage(): void {
    if (!this.initialized) return;
    
    const now = Tone.now();
    
    // Heavy impact
    if (this.subSynth) {
      try { this.subSynth.triggerRelease(now); } catch (e) { /* ignore */ }
      this.subSynth.triggerAttackRelease('A1', '4n', now + 0.05, 0.8);
    }
    
    // Harsh dissonant crash
    this.melodicSynth?.triggerAttackRelease(['A2', 'Bb2', 'E3'], '8n', now + 0.08, 0.6);
    
    // Noise impact
    if (this.noiseFilter && this.noiseSynth) {
      this.noiseFilter.frequency.setValueAtTime(1500, now + 0.05);
      this.noiseFilter.frequency.exponentialRampTo(80, 0.4);
      this.noiseSynth.triggerAttackRelease('8n', now + 0.05);
    }
  }
  
  // Spiral suction state
  private spiralSuctionActive = false;
  
  /**
   * Spiral Suction - Continuous dark sucking sound
   * @param intensity 0-1 (0 to stop)
   */
  setSpiralSuction(intensity: number): void {
    if (!this.initialized) return;
    
    if (intensity <= 0) {
      if (this.spiralSuctionActive) {
        this.crackleGain?.gain.linearRampTo(0.0001, 0.3);
        this.spiralSuctionActive = false;
      }
      return;
    }
    
    // Use crackle system for suction (repurpose when not chamber crackling)
    const volume = 0.02 + intensity * 0.04;
    
    if (!this.spiralSuctionActive && !this.crackleActive) {
      this.spiralSuctionActive = true;
      this.crackleLFO?.frequency.setValueAtTime(3, Tone.now());
      this.crackleLFO?.start();
      this.crackleNoise?.triggerAttack();
    }
    
    if (this.spiralSuctionActive) {
      this.crackleGain?.gain.linearRampTo(volume, 0.2);
      this.crackleLFO?.frequency.linearRampTo(3 + intensity * 5, 0.2);
    }
  }
  
  // ============================================
  // CONTINUOUS EFFECTS
  // ============================================
  
  /**
   * Chamber Crackling - Electric gravitational hum from caught particles
   * Call with count = number of particles in chamber (0 to stop)
   */
  setChamberCrackling(count: number): void {
    if (!this.initialized) return;
    
    if (count <= 0) {
      // Stop crackling
      if (this.crackleActive) {
        this.crackleGain?.gain.linearRampTo(0.0001, 0.5);
        setTimeout(() => {
          this.crackleNoise?.triggerRelease();
          this.crackleLFO?.stop();
          this.crackleActive = false;
        }, 500);
      }
      return;
    }
    
    // Intensity based on particle count (1-5)
    const intensity = Math.min(1, count / 5);
    const volume = 0.03 + intensity * 0.06; // Subtle but present
    const lfoFreq = 8 + intensity * 15; // Faster crackling with more particles
    
    if (!this.crackleActive) {
      // Start crackling
      this.crackleActive = true;
      this.crackleLFO?.start();
      this.crackleNoise?.triggerAttack();
    }
    
    // Update intensity
    this.crackleGain?.gain.linearRampTo(volume, 0.3);
    if (this.crackleLFO) {
      this.crackleLFO.frequency.linearRampTo(lfoFreq, 0.3);
    }
    if (this.crackleFilter) {
      // Higher Q with more particles = more resonant
      this.crackleFilter.Q.linearRampTo(4 + intensity * 8, 0.3);
    }
  }
  
  /**
   * Bridge Attraction - Sweet tempting sound when bridge is attracting
   * Call with strength 0-1 (0 to stop)
   */
  setBridgeAttraction(strength: number): void {
    if (!this.initialized) return;
    
    if (strength <= 0) {
      // Fade out rumble
      if (this.attractActive) {
        this.attractGain?.gain.linearRampTo(0.0001, 1.5);
        setTimeout(() => {
          this.attractSynth?.triggerRelease();
          this.attractActive = false;
        }, 1500);
      }
      return;
    }
    
    // Deep tectonic rumble - quiet, background
    const volume = 0.02 + strength * 0.04; // Very quiet
    const vibratoSpeed = 0.3 + strength * 0.4;
    const filterFreq = 80 + strength * 100;
    
    if (!this.attractActive) {
      this.attractActive = true;
      this.attractSynth?.triggerAttack('G1'); // Deep G
    }
    
    this.attractGain?.gain.linearRampTo(volume, 0.8);
    if (this.attractVibrato) {
      this.attractVibrato.frequency.linearRampTo(vibratoSpeed, 0.5);
    }
    if (this.attractFilter) {
      this.attractFilter.frequency.linearRampTo(filterFreq, 0.5);
    }
  }
  
  /**
   * Set SFX volume
   */
  setVolume(db: number): void {
    const gain = Tone.dbToGain(db);
    this.melodicGain?.gain.rampTo(gain, 0.2);
    this.subGain?.gain.rampTo(gain * 0.5, 0.2);
    this.harmonicGain?.gain.rampTo(gain * 0.25, 0.2);
    this.noiseGain?.gain.rampTo(gain * 0.1, 0.2);
  }
  
  /**
   * Dispose
   */
  dispose(): void {
    // Stop continuous effects
    this.setChamberCrackling(0);
    this.setBridgeAttraction(0);
    
    this.melodicSynth?.dispose();
    this.melodicGain?.dispose();
    this.subSynth?.dispose();
    this.subGain?.dispose();
    this.harmonicSynth?.dispose();
    this.harmonicGain?.dispose();
    this.noiseSynth?.dispose();
    this.noiseFilter?.dispose();
    this.noiseGain?.dispose();
    this.crackleNoise?.dispose();
    this.crackleFilter?.dispose();
    this.crackleLFO?.dispose();
    this.crackleGain?.dispose();
    this.attractSynth?.dispose();
    this.attractVibrato?.dispose();
    this.attractFilter?.dispose();
    this.attractGain?.dispose();
    this.initialized = false;
  }
}

export const SFXEngine = new SFXEngineClass();
