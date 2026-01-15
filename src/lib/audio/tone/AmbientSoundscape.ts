/**
 * AmbientSoundscape - Cinematic Space Epic
 * 
 * Inspiration: Interstellar "No Time For Caution", Mass Effect galaxy map,
 * Blade Runner 2049, Daft Punk TRON Legacy
 * 
 * Ziel: Gänsehaut, Sehnsucht nach den Sternen, epische Weite
 */
import * as Tone from 'tone';
import { EffectChain } from './EffectChain';

class AmbientSoundscapeClass {
  // === LAYERS ===
  
  // 1. Sub-Fundament - tiefes Brummen, spürbar
  private subOsc: Tone.Oscillator | null = null;
  private subGain: Tone.Gain | null = null;
  
  // 2. Main Drone - rotating instruments
  private droneSynths: Tone.PolySynth[] = [];
  private droneGains: Tone.Gain[] = [];
  private droneFilter: Tone.Filter | null = null;
  private currentDroneIndex = 0;
  
  // 3. String Pad - emotionale Streicher-Fläche
  private stringSynth: Tone.PolySynth | null = null;
  private stringGain: Tone.Gain | null = null;
  private stringChorus: Tone.Chorus | null = null;
  
  // 4. Brass/Horn Layer - epische Bläser
  private brassSynth: Tone.PolySynth | null = null;
  private brassGain: Tone.Gain | null = null;
  
  // 5. Celestial Shimmer - hohe Glitzer
  private shimmerSynth: Tone.PolySynth | null = null;
  private shimmerGain: Tone.Gain | null = null;
  private shimmerDelay: Tone.PingPongDelay | null = null;
  
  // Chord progression timer
  private chordLoop: number | null = null;
  private currentChordIndex = 0;
  
  // Inverted/Underwater mode - driving pulse
  private pulseSynth: Tone.MembraneSynth | null = null;
  private pulseGain: Tone.Gain | null = null;
  private pulseLoop: Tone.Loop | null = null;
  private invertedMode = false;
  
  // State
  private _active = false;
  private intensity = 0.5;
  private gameLevel = 1;
  
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
    
    // === 1. SUB BASS - Tiefes Fundament ===
    this.subOsc = new Tone.Oscillator({
      frequency: 55, // A1
      type: 'sine',
    });
    this.subGain = new Tone.Gain(0);
    this.subOsc.connect(this.subGain);
    this.subGain.connect(mainInput);
    
    // === 2. ROTATING DRONES - Multiple instruments ===
    this.droneFilter = new Tone.Filter({
      frequency: 900,
      type: 'lowpass',
      rolloff: -12,
    });
    this.droneFilter.connect(mainInput);
    this.droneFilter.connect(reverbSend);
    
    // Drone 0: Fat Triangle (Warm, full)
    const drone0 = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fattriangle', spread: 25, count: 3 },
      envelope: { attack: 3, decay: 1, sustain: 0.85, release: 4 },
    });
    const gain0 = new Tone.Gain(0);
    drone0.connect(gain0);
    gain0.connect(this.droneFilter);
    this.droneSynths.push(drone0);
    this.droneGains.push(gain0);
    
    // Drone 1: FM Synth (Complex, evolving)
    const drone1 = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 1.5,
      modulationIndex: 2.5,
      envelope: { attack: 4, decay: 2, sustain: 0.8, release: 5 },
      modulationEnvelope: { attack: 3, decay: 1, sustain: 0.7, release: 4 },
    });
    const gain1 = new Tone.Gain(0);
    drone1.connect(gain1);
    gain1.connect(this.droneFilter);
    this.droneSynths.push(drone1);
    this.droneGains.push(gain1);
    
    // Drone 2: Fat Sawtooth (Rich, brassy)
    const drone2 = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fatsawtooth', spread: 15, count: 3 },
      envelope: { attack: 3.5, decay: 1, sustain: 0.75, release: 4 },
    });
    const gain2 = new Tone.Gain(0);
    drone2.connect(gain2);
    gain2.connect(this.droneFilter);
    this.droneSynths.push(drone2);
    this.droneGains.push(gain2);
    
    // === 3. STRINGS - Emotionale Streicher ===
    this.stringChorus = new Tone.Chorus({
      frequency: 0.3,
      depth: 0.8,
      wet: 0.5,
    }).start();
    
    this.stringSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { 
        type: 'fatsawtooth',
        spread: 30,
        count: 3,
      },
      envelope: {
        attack: 2.5,
        decay: 1,
        sustain: 0.7,
        release: 3,
      },
    });
    
    this.stringGain = new Tone.Gain(0);
    this.stringSynth.connect(this.stringChorus);
    this.stringChorus.connect(this.stringGain);
    this.stringGain.connect(mainInput);
    this.stringGain.connect(reverbSend);
    
    // === 4. BRASS - Epische Bläser/Hörner ===
    this.brassSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { 
        type: 'sawtooth',
      },
      envelope: {
        attack: 1.5,
        decay: 0.5,
        sustain: 0.6,
        release: 2,
      },
    });
    
    this.brassGain = new Tone.Gain(0);
    this.brassSynth.connect(this.brassGain);
    this.brassGain.connect(mainInput);
    this.brassGain.connect(reverbSend);
    
    // === 5. SHIMMER - Celestial Glitzer ===
    this.shimmerDelay = new Tone.PingPongDelay({
      delayTime: '8n',
      feedback: 0.4,
      wet: 0.6,
    });
    
    this.shimmerSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.5,
        decay: 1,
        sustain: 0.2,
        release: 3,
      },
    });
    
    this.shimmerGain = new Tone.Gain(0);
    this.shimmerSynth.connect(this.shimmerDelay);
    this.shimmerDelay.connect(this.shimmerGain);
    this.shimmerGain.connect(mainInput);
    this.shimmerGain.connect(reverbSend);
    
    // === 6. PULSE - Inverted mode heartbeat ===
    this.pulseSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      envelope: {
        attack: 0.005,
        decay: 0.15,
        sustain: 0,
        release: 0.3,
      },
    });
    
    this.pulseGain = new Tone.Gain(0);
    this.pulseSynth.connect(this.pulseGain);
    this.pulseGain.connect(mainInput);
    
    // Heartbeat loop - fast, intense, anxious
    this.pulseLoop = new Tone.Loop((time) => {
      if (this.invertedMode && this.pulseSynth) {
        // LUB (punch)
        this.pulseSynth.triggerAttackRelease('G1', '16n', time, 0.85);
        // DUB (harder, driving)
        this.pulseSynth.triggerAttackRelease('D2', '16n', time + 0.09, 1.0);
      }
    }, '4n'); // Quarter note = faster heartbeat, ~140 BPM anxious feel
    
    this.initialized = true;
  }
  
  // Cinematic chord progression - emotional journey
  private readonly CHORD_PROGRESSION = [
    // Am - Sehnsucht
    { bass: 'A1', organ: ['A2', 'E3', 'A3'], strings: ['A3', 'C4', 'E4', 'A4'], brass: ['E4', 'A4'], shimmer: ['A5', 'E6'] },
    // F - Hoffnung
    { bass: 'F1', organ: ['F2', 'C3', 'F3'], strings: ['F3', 'A3', 'C4', 'F4'], brass: ['C4', 'F4'], shimmer: ['F5', 'C6'] },
    // C - Weite
    { bass: 'C2', organ: ['C2', 'G2', 'C3'], strings: ['C3', 'E3', 'G3', 'C4'], brass: ['G3', 'C4'], shimmer: ['C5', 'G5'] },
    // G - Aufbruch
    { bass: 'G1', organ: ['G2', 'D3', 'G3'], strings: ['G3', 'B3', 'D4', 'G4'], brass: ['D4', 'G4'], shimmer: ['G5', 'D6'] },
  ];
  
  /**
   * Start the cinematic soundscape
   */
  start(): void {
    if (!this.initialized || this._active) return;
    this._active = true;
    
    const now = Tone.now();
    
    // Start sub oscillator
    this.subOsc?.start(now);
    this.subGain?.gain.linearRampTo(0.25, 4);
    
    // Fade in first drone
    this.currentDroneIndex = 0;
    this.droneGains[0]?.gain.linearRampTo(0.15, 6);
    
    // Fade in other layers gradually
    this.stringGain?.gain.linearRampTo(0.12, 8);
    this.brassGain?.gain.linearRampTo(0.06, 10);
    this.shimmerGain?.gain.linearRampTo(0.08, 12);
    
    // Start with first chord
    this.playChord(0);
    
    // Start chord progression loop
    this.startChordProgression();
    
    // Start transport
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.bpm.value = 60;
      Tone.Transport.start();
    }
  }
  
  /**
   * Play a chord from the progression
   */
  private playChord(index: number): void {
    if (!this._active) return;
    
    const chord = this.CHORD_PROGRESSION[index];
    const now = Tone.now();
    
    // Update sub bass
    if (this.subOsc) {
      this.subOsc.frequency.linearRampTo(Tone.Frequency(chord.bass).toFrequency(), 2);
    }
    
    // Rotate drone instrument on each chord change
    const prevDroneIndex = this.currentDroneIndex;
    this.currentDroneIndex = (this.currentDroneIndex + 1) % this.droneSynths.length;
    
    // Crossfade between drones
    const prevDrone = this.droneSynths[prevDroneIndex];
    const prevGain = this.droneGains[prevDroneIndex];
    const newDrone = this.droneSynths[this.currentDroneIndex];
    const newGain = this.droneGains[this.currentDroneIndex];
    
    // Fade out old drone
    prevGain?.gain.linearRampTo(0.0001, 3);
    setTimeout(() => prevDrone?.releaseAll(), 3000);
    
    // Fade in new drone with chord
    newDrone?.triggerAttack(chord.organ, now + 0.5);
    newGain?.gain.linearRampTo(0.15, 3);
    
    // Crossfade strings
    this.stringSynth?.releaseAll(now);
    this.stringSynth?.triggerAttack(chord.strings, now + 0.3);
    
    // Brass enters subtly
    if (this.intensity > 0.4) {
      this.brassSynth?.releaseAll(now);
      this.brassSynth?.triggerAttack(chord.brass, now + 1);
    }
    
    // Shimmer sparkles
    setTimeout(() => {
      if (this._active && this.shimmerSynth) {
        chord.shimmer.forEach((note, i) => {
          this.shimmerSynth?.triggerAttackRelease(note, '2n', Tone.now() + i * 0.5, 0.3);
        });
      }
    }, 2000);
  }
  
  /**
   * Chord progression loop - slow, cinematic timing
   */
  private startChordProgression(): void {
    const advanceChord = () => {
      if (!this._active) return;
      
      this.currentChordIndex = (this.currentChordIndex + 1) % this.CHORD_PROGRESSION.length;
      this.playChord(this.currentChordIndex);
      
      // Next chord in 12-16 seconds (cinematic pacing)
      const nextTime = 12000 + Math.random() * 4000;
      this.chordLoop = window.setTimeout(advanceChord, nextTime);
    };
    
    // First progression after 14 seconds
    this.chordLoop = window.setTimeout(advanceChord, 14000);
  }
  
  /**
   * Stop the soundscape
   */
  stop(): void {
    if (!this.initialized || !this._active) return;
    this._active = false;
    
    const fadeTime = 6;
    
    // Clear chord loop
    if (this.chordLoop) {
      clearTimeout(this.chordLoop);
      this.chordLoop = null;
    }
    
    // Stop pulse if running
    this.pulseLoop?.stop();
    this.pulseGain?.gain.linearRampTo(0.0001, 0.5);
    this.invertedMode = false;
    
    // Fade out all layers
    this.subGain?.gain.linearRampTo(0.0001, fadeTime);
    this.droneGains.forEach(g => g?.gain.linearRampTo(0.0001, fadeTime));
    this.stringGain?.gain.linearRampTo(0.0001, fadeTime);
    this.brassGain?.gain.linearRampTo(0.0001, fadeTime);
    this.shimmerGain?.gain.linearRampTo(0.0001, fadeTime);
    
    // Stop/release after fade
    setTimeout(() => {
      this.subOsc?.stop();
      this.droneSynths.forEach(s => s?.releaseAll());
      this.stringSynth?.releaseAll();
      this.brassSynth?.releaseAll();
      this.shimmerSynth?.releaseAll();
    }, fadeTime * 1000);
  }
  
  /**
   * Inverted/Underwater mode - muffled sound with intense heartbeat
   */
  setInvertedMode(active: boolean): void {
    if (!this.initialized || !this._active) return;
    
    this.invertedMode = active;
    
    if (active) {
      // Start intense heartbeat - loud and driving!
      this.pulseGain?.gain.linearRampTo(0.55, 0.2);
      this.pulseLoop?.start();
      
      // Dampen melodic layers - underwater feel
      this.droneGains.forEach(g => g?.gain.linearRampTo(0.02, 0.8));
      this.stringGain?.gain.linearRampTo(0.015, 0.8);
      this.brassGain?.gain.linearRampTo(0.0001, 0.3);
      this.shimmerGain?.gain.linearRampTo(0.0001, 0.3);
      
      // Sub bass pumps hard with heartbeat
      this.subGain?.gain.linearRampTo(0.5, 0.2);
    } else {
      // Fade out heartbeat
      this.pulseGain?.gain.linearRampTo(0.0001, 1.5);
      setTimeout(() => {
        this.pulseLoop?.stop();
      }, 1500);
      
      // Restore normal levels based on current intensity
      this.setIntensity(this.intensity);
    }
  }
  
  /**
   * Set intensity (0-1) - affects epic-ness
   */
  setIntensity(value: number): void {
    this.intensity = Math.max(0.1, Math.min(1, value));
    
    if (!this.initialized || !this._active) return;
    
    // Scale all layers based on intensity
    const subLevel = 0.15 + this.intensity * 0.2;
    const organLevel = 0.1 + this.intensity * 0.15;
    const stringLevel = 0.08 + this.intensity * 0.15;
    const brassLevel = this.intensity > 0.4 ? 0.03 + (this.intensity - 0.4) * 0.15 : 0.001;
    const shimmerLevel = 0.05 + this.intensity * 0.1;
    
    this.subGain?.gain.linearRampTo(subLevel, 2);
    // Only adjust active drone
    this.droneGains[this.currentDroneIndex]?.gain.linearRampTo(organLevel, 2);
    this.stringGain?.gain.linearRampTo(stringLevel, 2);
    this.brassGain?.gain.linearRampTo(brassLevel, 2);
    this.shimmerGain?.gain.linearRampTo(shimmerLevel, 2);
    
    // Open filter with intensity
    const filterFreq = 500 + this.intensity * 2000;
    this.droneFilter?.frequency.linearRampTo(filterFreq, 2);
  }
  
  /**
   * Set game level (1-10)
   */
  setGameLevel(level: number): void {
    this.gameLevel = Math.max(1, Math.min(10, level));
    
    // Map level to intensity
    const targetIntensity = 0.3 + (this.gameLevel / 10) * 0.6;
    this.setIntensity(targetIntensity);
  }
  
/**
   * Momentary swell - for big moments (skipped in inverted mode)
   */
  swell(duration = 3): void {
    if (!this.initialized || !this._active) return;
    
    // Skip swell during inverted mode to avoid filter conflicts
    if (this.invertedMode) return;
    
    const originalIntensity = this.intensity;
    
    // Big crescendo
    this.setIntensity(Math.min(1, this.intensity + 0.4));
    
    // Brass swell
    if (this.brassSynth && this.brassGain) {
      const chord = this.CHORD_PROGRESSION[this.currentChordIndex];
      this.brassGain.gain.linearRampTo(0.15, duration * 0.3);
      this.brassSynth.triggerAttack(chord.brass, Tone.now());
    }
    
    // Filter sweep
    this.droneFilter?.frequency.linearRampTo(3000, duration * 0.4);
    
    // Return to original
    setTimeout(() => {
      this.setIntensity(originalIntensity);
      this.droneFilter?.frequency.linearRampTo(500 + originalIntensity * 2000, duration * 0.5);
    }, duration * 1000);
  }
  
  /**
   * Dispose
   */
  dispose(): void {
    this.stop();
    
    if (this.chordLoop) {
      clearTimeout(this.chordLoop);
    }
    
    this.subOsc?.dispose();
    this.subGain?.dispose();
    this.droneSynths.forEach(s => s?.dispose());
    this.droneGains.forEach(g => g?.dispose());
    this.droneFilter?.dispose();
    this.stringSynth?.dispose();
    this.stringGain?.dispose();
    this.stringChorus?.dispose();
    this.brassSynth?.dispose();
    this.brassGain?.dispose();
    this.shimmerSynth?.dispose();
    this.shimmerGain?.dispose();
    this.shimmerDelay?.dispose();
    this.pulseSynth?.dispose();
    this.pulseGain?.dispose();
    this.pulseLoop?.dispose();
    
    this.initialized = false;
    this._active = false;
  }
}

export const AmbientSoundscape = new AmbientSoundscapeClass();
