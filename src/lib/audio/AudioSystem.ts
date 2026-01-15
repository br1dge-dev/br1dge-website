/**
 * Audio System - Web Audio API wrapper
 */
import { MASTER_VOLUME, BG_MUSIC_VOLUME, G_MINOR_PENTA } from './constants';

// Extend Window for webkit prefix
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

class AudioSystemClass {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private _initialized = false;
  private _muted = false;
  
  // Background music
  private bgMusic: AudioBuffer | null = null;
  private bgMusicGain: GainNode | null = null;
  private bgMusicSource: AudioBufferSourceNode | null = null;
  bgMusicStarted = false;

  get initialized(): boolean { return this._initialized; }
  get muted(): boolean { return this._muted; }

  init(): void {
    if (this._initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Compressor for dynamic range control
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);
      this.compressor.connect(this.ctx.destination);
      
      // Master gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(MASTER_VOLUME, this.ctx.currentTime);
      this.masterGain.connect(this.compressor);
      
      this._initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  async resume(): Promise<void> {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  toggleMute(): boolean {
    if (!this._initialized || !this.masterGain || !this.ctx) return false;
    this._muted = !this._muted;
    const target = this._muted ? 0 : MASTER_VOLUME;
    this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.1);
    return this._muted;
  }

  // Energy collect - soft triangle blip
  playCollect(pitch = 0): void {
    if (!this._initialized || this._muted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const baseFreq = G_MINOR_PENTA[Math.min(pitch, G_MINOR_PENTA.length - 1)];
    
    [-8, 8].forEach(detune => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.detune.setValueAtTime(detune, now);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.12);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      
      osc.start(now);
      osc.stop(now + 0.18);
    });
  }

  // Red particle capture - bass thump
  playCapture(): void {
    if (!this._initialized || this._muted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(98, now);
    osc1.frequency.exponentialRampToValueAtTime(49, now + 0.2);
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(98, now);
    osc2.frequency.exponentialRampToValueAtTime(49, now + 0.2);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  // Discharge - filtered drop
  playDischarge(level = 1): void {
    if (!this._initialized || this._muted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    [-10, 0, 10].forEach(detune => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(98 + level * 2, now);
      osc.frequency.exponentialRampToValueAtTime(49, now + 0.3);
      osc.detune.setValueAtTime(detune, now);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600 + level * 50, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.35);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      
      osc.start(now);
      osc.stop(now + 0.45);
    });
  }

  // Continue in next file for size reasons...
}

export const AudioSystem = new AudioSystemClass();
