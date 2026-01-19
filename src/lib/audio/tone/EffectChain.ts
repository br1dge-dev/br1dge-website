/**
 * EffectChain - Cohesive audio effects for br1dge
 * Warm reverb + subtle delay for well-being aesthetic
 */
import * as Tone from 'tone';
import { EFFECTS } from './constants';

class EffectChainClass {
  private masterChannel: Tone.Channel | null = null;
  private masterLimiter: Tone.Limiter | null = null;
  private reverb: Tone.Reverb | null = null;
  private delay: Tone.FeedbackDelay | null = null;
  private warmFilter: Tone.Filter | null = null;
  private reverbSend: Tone.Channel | null = null;
  private delaySend: Tone.Channel | null = null;
  private compressor: Tone.Compressor | null = null;
  initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    // Master limiter
    this.masterLimiter = new Tone.Limiter(-1);
    this.masterLimiter.toDestination();

    // Gentle compression
    this.compressor = new Tone.Compressor({
      threshold: -12,
      ratio: 4,
      attack: 0.05,
      release: 0.3,
      knee: 8,
    });
    this.compressor.connect(this.masterLimiter);

    // Master channel
    this.masterChannel = new Tone.Channel({ volume: -6, pan: 0 });
    this.masterChannel.connect(this.compressor);

    // Warm reverb
    this.reverb = new Tone.Reverb({
      decay: EFFECTS.reverb.decay,
      wet: EFFECTS.reverb.wet,
      preDelay: EFFECTS.reverb.preDelay,
    });
    await this.reverb.generate();

    // Reverb send
    this.reverbSend = new Tone.Channel({ volume: -6 });
    this.reverbSend.connect(this.reverb);
    this.reverb.connect(this.masterChannel);

    // Delay
    this.delay = new Tone.FeedbackDelay({
      delayTime: EFFECTS.delay.delayTime,
      feedback: EFFECTS.delay.feedback,
      wet: EFFECTS.delay.wet,
    });

    // Delay send
    this.delaySend = new Tone.Channel({ volume: -9 });
    this.delaySend.connect(this.delay);
    this.delay.connect(this.masterChannel);

    // Warm filter
    this.warmFilter = new Tone.Filter({
      frequency: EFFECTS.filter.frequency,
      type: 'lowpass',
      Q: EFFECTS.filter.Q,
    });
    this.warmFilter.connect(this.masterChannel);

    this.initialized = true;
  }

  getMainInput(): Tone.Filter | null {
    return this.warmFilter;
  }

  getReverbSend(): Tone.Channel | null {
    return this.reverbSend;
  }

  getDelaySend(): Tone.Channel | null {
    return this.delaySend;
  }

  getMasterChannel(): Tone.Channel | null {
    return this.masterChannel;
  }

  setMasterVolume(db: number): void {
    if (this.masterChannel) {
      this.masterChannel.volume.rampTo(db, 0.5);
    }
  }

  setMuted(muted: boolean): void {
    if (this.masterChannel) {
      this.masterChannel.mute = muted;
    }
  }

  setReverbMix(amount: number): void {
    if (this.reverbSend) {
      const db = amount <= 0.01 ? -60 : -6 + (amount - 1) * 12;
      this.reverbSend.volume.rampTo(db, 1);
    }
  }

  setDelayMix(amount: number): void {
    if (this.delaySend) {
      const db = amount <= 0.01 ? -60 : -9 + (amount - 1) * 12;
      this.delaySend.volume.rampTo(db, 1);
    }
  }

  setFilterFrequency(freq: number): void {
    if (this.warmFilter) {
      const safeFreq = Math.max(20, Math.min(20000, freq));
      this.warmFilter.frequency.rampTo(safeFreq, 0.5);
    }
  }

  setUnderwaterMode(active: boolean): void {
    if (this.warmFilter) {
      const targetFreq = active ? 300 : 2500;
      this.warmFilter.frequency.linearRampTo(targetFreq, 0.8);
    }
  }

  dispose(): void {
    this.masterChannel?.dispose();
    this.masterLimiter?.dispose();
    this.reverb?.dispose();
    this.delay?.dispose();
    this.warmFilter?.dispose();
    this.reverbSend?.dispose();
    this.delaySend?.dispose();
    this.compressor?.dispose();
    this.initialized = false;
  }
}

export const EffectChain = new EffectChainClass();
