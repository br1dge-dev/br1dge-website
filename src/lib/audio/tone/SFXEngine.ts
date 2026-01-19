/**
 * SFXEngine - Well-being sound effects for br1dge
 * Warm, harmonious sounds matching the game's aesthetic
 */
import * as Tone from 'tone';
import { NOTES, SYNTHS, VOLUME } from './constants';
import { EffectChain } from './EffectChain';
import { MusicLoopSystem } from './MusicLoopSystem';
import type { SFXParams } from './types';

class SFXEngineClass {
  private melodicSynth: Tone.PolySynth | null = null;
  private melodicGain: Tone.Gain | null = null;
  private subSynth: Tone.MonoSynth | null = null;
  private subGain: Tone.Gain | null = null;
  private harmonicSynth: Tone.PolySynth | null = null;
  private harmonicGain: Tone.Gain | null = null;
  private noiseSynth: Tone.NoiseSynth | null = null;
  private noiseFilter: Tone.Filter | null = null;
  private noiseGain: Tone.Gain | null = null;
  private crackleNoise: Tone.NoiseSynth | null = null;
  private crackleFilter: Tone.Filter | null = null;
  private crackleLFO: Tone.LFO | null = null;
  private crackleGain: Tone.Gain | null = null;
  private crackleActive = false;
  private attractSynth: Tone.Synth | null = null;
  private attractVibrato: Tone.Vibrato | null = null;
  private attractFilter: Tone.Filter | null = null;
  private attractGain: Tone.Gain | null = null;
  private attractActive = false;
  private spiralSuctionActive = false;

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

    // Melodic synth - warm triangle
    this.melodicSynth = new Tone.PolySynth(Tone.Synth, SYNTHS.melodic);
    this.melodicGain = new Tone.Gain(Tone.dbToGain(VOLUME.sfx));
    this.melodicSynth.connect(this.melodicGain);
    this.melodicGain.connect(mainInput);
    this.melodicGain.connect(reverbSend);

    // Sub synth - deep but gentle
    this.subSynth = new Tone.MonoSynth(SYNTHS.subBass);
    this.subGain = new Tone.Gain(Tone.dbToGain(VOLUME.sfx - 6));
    this.subSynth.connect(this.subGain);
    this.subGain.connect(mainInput);
    this.subGain.connect(reverbSend);

    // Harmonic synth - soft overtones
    this.harmonicSynth = new Tone.PolySynth(Tone.Synth, SYNTHS.harmonic);
    this.harmonicGain = new Tone.Gain(Tone.dbToGain(VOLUME.sfx - 12));
    this.harmonicSynth.connect(this.harmonicGain);
    this.harmonicGain.connect(mainInput);
    this.harmonicGain.connect(reverbSend);
    this.harmonicGain.connect(delaySend);

    // Noise for texture
    this.noiseFilter = new Tone.Filter({ frequency: 1000, type: 'bandpass', Q: 2 });
    this.noiseSynth = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0, release: 0.3 },
    });
    this.noiseGain = new Tone.Gain(Tone.dbToGain(VOLUME.sfx - 18));
    this.noiseSynth.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(mainInput);
    this.noiseGain.connect(reverbSend);

    // Chamber crackling
    this.crackleFilter = new Tone.Filter({ frequency: 800, type: 'bandpass', Q: 8 });
    this.crackleNoise = new Tone.NoiseSynth({
      noise: { type: 'brown' },
      envelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 },
    });
    this.crackleLFO = new Tone.LFO({ frequency: 12, min: 200, max: 1200, type: 'sawtooth' });
    this.crackleLFO.connect(this.crackleFilter.frequency);
    this.crackleGain = new Tone.Gain(0);
    this.crackleNoise.connect(this.crackleFilter);
    this.crackleFilter.connect(this.crackleGain);
    this.crackleGain.connect(mainInput);
    this.crackleGain.connect(reverbSend);

    // Bridge attraction
    this.attractVibrato = new Tone.Vibrato({ frequency: 0.5, depth: 0.15, type: 'sine' });
    this.attractFilter = new Tone.Filter({ frequency: 150, type: 'lowpass', Q: 2 });
    this.attractSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 1.5, decay: 0, sustain: 1, release: 2 },
    });
    this.attractGain = new Tone.Gain(0);
    this.attractSynth.connect(this.attractVibrato);
    this.attractVibrato.connect(this.attractFilter);
    this.attractFilter.connect(this.attractGain);
    this.attractGain.connect(mainInput);
    this.attractGain.connect(reverbSend);

    this.initialized = true;
  }

  // Collect - soft, pleasant
  playCollect(params: SFXParams = {}): void {
    if (!this.initialized || !this.melodicSynth) return;
    if (Tone.context.state !== 'running') return;

    try {
      const now = Tone.now() + 0.05;
      const baseVelocity = params.velocity ?? 0.2;
      const comboBoost = 1 + Math.min(10, Math.floor((Date.now() - this.lastCollectTime) < 300 ? this.collectCombo + 1 : 0) * 0.05);
      const velocity = Math.min(0.4, baseVelocity * comboBoost);

      const noteIndex = Math.min(Math.floor(Math.random() * 3), NOTES.collectScale.length - 1);
      const note = NOTES.collectScale[noteIndex];

      this.melodicSynth.triggerAttackRelease(note, '32n', now, velocity * 0.6);
    } catch (e) {
      // Silently ignore
    }
  }

  // Super star - magical but warm
  playSuperStarCollect(): void {
    if (!this.initialized || !this.melodicSynth) return;
    if (Tone.context.state !== 'running') return;

    try {
      const now = Tone.now() + 0.05;
      this.melodicSynth.triggerAttackRelease('G4', '8n', now, 0.22);
      this.melodicSynth.triggerAttackRelease('D4', '8n', now + 0.02, 0.18);

      if (this.harmonicSynth) {
        this.harmonicSynth.triggerAttackRelease('G5', '4n', now + 0.05, 0.1);
      }
    } catch (e) {
      // Silently ignore
    }
  }

  // Thanks - positive, soft
  playThanks(): void {
    if (!this.initialized || !this.melodicSynth) return;
    if (Tone.context.state !== 'running') return;

    try {
      const now = Tone.now() + 0.05;
      this.melodicSynth.triggerAttackRelease('G4', '16n', now, 0.35);
      this.melodicSynth.triggerAttackRelease('Bb4', '16n', now + 0.03, 0.28);
    } catch (e) {
      // Silently ignore
    }
  }

  // Reject - soft, not jarring
  playRejectDischarge(): void {
    if (!this.initialized) return;
    if (Tone.context.state !== 'running') return;

    try {
      const now = Tone.now() + 0.05;
      this.melodicSynth?.triggerAttackRelease('G3', '16n', now, 0.25);
    } catch (e) {
      // Silently ignore
    }
  }

  // Capture - satisfying but warm
  playCapture(params: SFXParams = {}): void {
    if (!this.initialized) return;
    if (Tone.context.state !== 'running') return;

    try {
      const now = Tone.now() + 0.05;
      const velocity = params.velocity ?? 0.8;
      this.melodicSynth?.triggerAttackRelease(['G3', 'D4'], '4n', now, velocity * 0.5);
    } catch (e) {
      // Silently ignore
    }
  }

  // Red heart - magical mid-range
  playRedHeartCapture(): void {
    if (!this.initialized) return;
    if (Tone.context.state !== 'running') return;

    try {
      const now = Tone.now() + 0.05;
      this.melodicSynth?.triggerAttackRelease(['G3', 'Bb3', 'D4'], '4n', now, 0.5);

      if (this.harmonicSynth) {
        this.harmonicSynth.triggerAttackRelease('D4', '4n', now + 0.08, 0.35);
        this.harmonicSynth.triggerAttackRelease('G5', '2n', now + 0.15, 0.25);
      }
    } catch (e) {
      // Silently ignore
    }
  }

  // Discharge - powerful but controlled
  playDischarge(params: SFXParams = {}): void {
    if (!this.initialized) return;
    if (Tone.context.state !== 'running') return;

    try {
      const now = Tone.now() + 0.1;
      const level = params.level ?? 1;
      const velocity = 0.6 + (level / 10) * 0.4;

      const notes = ['G2', 'D3', 'G3'].slice(0, 2 + Math.floor(level / 3));
      this.melodicSynth?.triggerAttackRelease(notes, '2n', now, velocity * 0.6);
      this.harmonicSynth?.triggerAttackRelease(['G4', 'D5'], '1n', now + 0.08, velocity * 0.3);
    } catch (e) {
      // Silently ignore
    }
  }

  // Level up - ascending, positive
  playLevelUp(params: SFXParams = {}): void {
    if (!this.initialized || !this.melodicSynth) return;
    if (Tone.context.state !== 'running') return;

    try {
      const now = Tone.now() + 0.1;
      const level = params.level ?? 1;
      const velocity = 0.5 + (level / 10) * 0.3;

      let timeOffset = 0;
      NOTES.levelUpChord.slice(0, 3 + Math.floor(level / 3)).forEach((note) => {
        this.melodicSynth?.triggerAttackRelease(note, '1n', now + timeOffset, velocity);
        timeOffset += 0.08;
      });

      this.harmonicSynth?.triggerAttackRelease(['G4', 'D5'], '1n', now + timeOffset + 0.1, velocity * 0.4);
      MusicLoopSystem.setLevel(level);
    } catch (e) {
      // Silently ignore, but still set level
      try { MusicLoopSystem.setLevel(params.level ?? 1); } catch {}
    }
  }

  // Max stack - epic but warm
  playMaxStack(): void {
    if (!this.initialized) return;
    if (Tone.context.state !== 'running') return;

    try {
      const now = Tone.now() + 0.1;

      let timeOffset = 0;
      NOTES.maxStackChord.forEach((note) => {
        if (this.melodicSynth) {
          this.melodicSynth.triggerAttackRelease(note, '1m', now + timeOffset, 0.7);
          timeOffset += 0.06;
        }
      });

      NOTES.celestial.forEach((note) => {
        if (this.harmonicSynth) {
          this.harmonicSynth.triggerAttackRelease(note, '2n', now + timeOffset, 0.4);
          timeOffset += 0.15;
        }
      });
    } catch (e) {
      // Silently ignore
    }
  }

  // Modal enter - gentle
  playModalEnter(): void {
    if (!this.initialized || !this.melodicSynth) return;
    if (Tone.context.state !== 'running') return;

    try {
      const now = Tone.now() + 0.05;
      this.melodicSynth?.triggerAttackRelease('G4', '4n', now, 0.4);
      this.melodicSynth?.triggerAttackRelease('D4', '4n', now + 0.08, 0.3);
      this.harmonicSynth?.triggerAttackRelease('G5', '2n', now + 0.12, 0.2);
    } catch (e) {
      // Silently ignore
    }
  }

  // Modal close - resolving
  playModalClose(): void {
    if (!this.initialized || !this.melodicSynth) return;
    if (Tone.context.state !== 'running') return;

    try {
      const now = Tone.now() + 0.05;
      this.melodicSynth.triggerAttackRelease('G3', '8n', now, 0.3);
      this.melodicSynth.triggerAttackRelease('D3', '8n', now + 0.1, 0.25);
    } catch (e) {
      // Silently ignore
    }
  }

  // Chamber capture - resonant
  playChamberCapture(params: SFXParams = {}): void {
    if (!this.initialized || !this.melodicSynth) return;
    if (Tone.context.state !== 'running') return;

    try {
      const count = params.count ?? 1;
      const note = NOTES.chamberScale[Math.min(count - 1, NOTES.chamberScale.length - 1)];
      const velocity = 0.35 + (count / 5) * 0.25;
      this.melodicSynth.triggerAttackRelease(note, '8n', Tone.now() + 0.05, velocity);
    } catch (e) {
      // Silently ignore
    }
  }

  // Bridge spawn - heroic
  playBridgeSpawn(): void {
    if (!this.initialized) return;
    if (Tone.context.state !== 'running') return;

    try {
      const now = Tone.now() + 0.1;

      NOTES.bridgeChord.forEach((note, i) => {
        this.melodicSynth?.triggerAttackRelease(note, '4n', now + i * 0.08, 0.6);
      });

      this.harmonicSynth?.triggerAttackRelease(['G4', 'D5'], '2n', now + 0.3, 0.35);
    } catch (e) {
      // Silently ignore
    }
  }

  // Collection complete - satisfying resolution
  playCollectionComplete(): void {
    if (!this.initialized || !this.melodicSynth) return;
    if (Tone.context.state !== 'running') return;

    try {
      const now = Tone.now() + 0.05;
      NOTES.completeArpeggio.forEach((note, i) => {
        this.melodicSynth?.triggerAttackRelease(note, '4n', now + i * 0.12, 0.6);
      });
      this.harmonicSynth?.triggerAttackRelease('G5', '2n', now + 0.4, 0.3);
    } catch (e) {
      // Silently ignore
    }
  }

  // Spiral spawn - ominous but not scary
  playSpiralSpawn(): void {
    if (!this.initialized) return;
    if (Tone.context.state !== 'running') return;

    try {
      const now = Tone.now() + 0.1;

      this.melodicSynth?.triggerAttackRelease(['G2', 'A2'], '4n', now, 0.3);

      if (this.harmonicSynth) {
        this.harmonicSynth.triggerAttackRelease('F3', '8n', now + 0.08, 0.25);
        this.harmonicSynth.triggerAttackRelease('Eb3', '8n', now + 0.2, 0.2);
      }
    } catch (e) {
      // Silently ignore
    }
  }

  // Spiral defeat - release
  playSpiralDefeat(): void {
    if (!this.initialized) return;
    if (Tone.context.state !== 'running') return;

    try {
      const now = Tone.now() + 0.1;

      if (this.noiseFilter && this.noiseSynth) {
        this.noiseFilter.frequency.setValueAtTime(400, now);
        this.noiseFilter.frequency.exponentialRampTo(2000, 0.3);
        this.noiseFilter.frequency.exponentialRampTo(100, 0.5);
        this.noiseSynth.triggerAttackRelease('4n', now);
      }

      this.melodicSynth?.triggerAttackRelease(['G3', 'D4'], '4n', now + 0.05, 0.4);
      this.harmonicSynth?.triggerAttackRelease('G4', '2n', now + 0.12, 0.25);
    } catch (e) {
      // Silently ignore
    }
  }

  // Spiral damage - tension without harshness
  playSpiralDamage(): void {
    if (!this.initialized) return;
    // Skip if audio context is not running (prevents timing errors after stop/start)
    if (Tone.context.state !== 'running') return;
    
    try {
      // Use a safe time offset to prevent scheduling conflicts
      const now = Tone.now() + 0.1;

      // Only use melodic synth (PolySynth) - avoid MonoSynth timing issues
      this.melodicSynth?.triggerAttackRelease(['G2', 'Bb2', 'F2'], '8n', now, 0.7);

      if (this.noiseFilter && this.noiseSynth) {
        this.noiseFilter.frequency.setValueAtTime(2000, now + 0.02);
        this.noiseFilter.frequency.exponentialRampTo(50, 0.5);
        this.noiseSynth.triggerAttackRelease('8n', now + 0.02);
      }

      if (this.harmonicSynth) {
        this.harmonicSynth.triggerAttackRelease('G1', '8n', now + 0.05, 0.35);
      }
    } catch (e) {
      // Silently ignore - audio glitches shouldn't crash the game
    }
  }

  // You died - melancholic
  playYouDied(): void {
    if (!this.initialized || !this.melodicSynth) return;
    
    // Stop music first - this is the important part
    try { MusicLoopSystem.stop(); } catch {}
    
    // Skip sound if audio context is not running
    if (Tone.context.state !== 'running') return;
    
    try {
      const now = Tone.now() + 0.1;

      this.melodicSynth.triggerAttackRelease('G3', '2n', now, 0.5);
      this.melodicSynth.triggerAttackRelease('Eb4', '2n', now + 0.1, 0.45);
      this.melodicSynth.triggerAttackRelease('C4', '2n', now + 0.2, 0.4);
      this.melodicSynth.triggerAttackRelease('G4', '2n', now + 0.3, 0.35);

      if (this.harmonicSynth) {
        this.harmonicSynth.triggerAttackRelease('G4', '1n', now + 0.4, 0.2);
      }
    } catch (e) {
      // Silently ignore - audio glitches shouldn't crash the game
    }
  }

  // State tracking
  private collectCombo = 0;
  private lastCollectTime = 0;

  // Chamber crackling
  setChamberCrackling(count: number): void {
    if (!this.initialized) return;

    if (count <= 0) {
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

    const intensity = Math.min(1, count / 5);
    const volume = 0.02 + intensity * 0.04;
    const lfoFreq = 6 + intensity * 12;

    if (!this.crackleActive) {
      this.crackleActive = true;
      this.crackleLFO?.start();
      this.crackleNoise?.triggerAttack();
    }

    this.crackleGain?.gain.linearRampTo(volume, 0.3);
    if (this.crackleLFO) {
      this.crackleLFO.frequency.linearRampTo(lfoFreq, 0.3);
    }
  }

  // Bridge attraction
  setBridgeAttraction(strength: number): void {
    if (!this.initialized) return;

    if (strength <= 0) {
      if (this.attractActive) {
        this.attractGain?.gain.linearRampTo(0.0001, 1.5);
        setTimeout(() => {
          this.attractSynth?.triggerRelease();
          this.attractActive = false;
        }, 1500);
      }
      return;
    }

    const volume = 0.015 + strength * 0.025;
    const vibratoSpeed = 0.3 + strength * 0.3;
    const filterFreq = 80 + strength * 100;

    if (!this.attractActive) {
      this.attractActive = true;
      this.attractSynth?.triggerAttack('G1');
    }

    this.attractGain?.gain.linearRampTo(volume, 0.8);
    if (this.attractVibrato) {
      this.attractVibrato.frequency.linearRampTo(vibratoSpeed, 0.5);
    }
    if (this.attractFilter) {
      this.attractFilter.frequency.linearRampTo(filterFreq, 0.5);
    }
  }

  // Spiral suction - continuous dark sound
  setSpiralSuction(intensity: number): void {
    if (!this.initialized) return;

    if (intensity <= 0) {
      if (this.spiralSuctionActive) {
        this.crackleGain?.gain.linearRampTo(0.0001, 0.3);
        this.spiralSuctionActive = false;
      }
      return;
    }

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

  // Volume control
  setVolume(db: number): void {
    const gain = Tone.dbToGain(db);
    this.melodicGain?.gain.rampTo(gain, 0.2);
    this.subGain?.gain.rampTo(gain * 0.5, 0.2);
    this.harmonicGain?.gain.rampTo(gain * 0.25, 0.2);
    this.noiseGain?.gain.rampTo(gain * 0.1, 0.2);
  }

  dispose(): void {
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
