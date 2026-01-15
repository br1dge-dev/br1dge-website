/**
 * Audio System - Web Audio API wrapper
 * Complete implementation with all SFX and background music
 */
import { MASTER_VOLUME, G_MINOR_PENTA, G_MINOR_TRIAD, GM7_CHORD, CHAMBER_FREQS, BRIDGE_CHORD, COMPLETE_NOTES } from './constants';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

class AudioSystemClass {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  initialized = false;
  muted = false;
  
  bgMusic: AudioBuffer | null = null;
  bgMusicGain: GainNode | null = null;
  bgMusicSource: AudioBufferSourceNode | null = null;
  bgMusicStarted = false;

  init(): void {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);
      this.compressor.connect(this.ctx.destination);
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(MASTER_VOLUME, this.ctx.currentTime);
      this.masterGain.connect(this.compressor);
      
      this.initialized = true;
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
    if (!this.initialized || !this.masterGain || !this.ctx) return false;
    this.muted = !this.muted;
    const target = this.muted ? 0 : MASTER_VOLUME;
    this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.1);
    return this.muted;
  }

  playCollect(pitch = 0): void {
    if (!this.initialized || this.muted || !this.ctx || !this.masterGain) return;
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

  playCapture(): void {
    if (!this.initialized || this.muted || !this.ctx || !this.masterGain) return;
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

  playDischarge(level = 1): void {
    if (!this.initialized || this.muted || !this.ctx || !this.masterGain) return;
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

  playLevelUp(level = 1): void {
    if (!this.initialized || this.muted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const detunes = [-8, 0, 8];
    
    G_MINOR_TRIAD.forEach((freq) => {
      detunes.forEach(detune => {
        const osc = this.ctx!.createOscillator();
        const filter = this.ctx!.createBiquadFilter();
        const gain = this.ctx!.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(detune, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.linearRampToValueAtTime(2500, now + 0.25);
        filter.frequency.exponentialRampToValueAtTime(600, now + 0.9);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.045, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        osc.start(now);
        osc.stop(now + 1.05);
      });
    });
  }

  playMaxStack(): void {
    if (!this.initialized || this.muted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const detunes = [-10, 0, 10];
    
    GM7_CHORD.forEach((freq) => {
      detunes.forEach(detune => {
        const osc = this.ctx!.createOscillator();
        const filter = this.ctx!.createBiquadFilter();
        const gain = this.ctx!.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(detune, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, now);
        filter.frequency.linearRampToValueAtTime(3000, now + 0.4);
        filter.frequency.setValueAtTime(3000, now + 1.0);
        filter.frequency.exponentialRampToValueAtTime(400, now + 1.8);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.035, now + 0.3);
        gain.gain.setValueAtTime(0.035, now + 1.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
        osc.start(now);
        osc.stop(now + 2.1);
      });
    });
  }

  playModalEnter(): void {
    if (!this.initialized || this.muted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    [587, 1174].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      const vol = i === 0 ? 0.1 : 0.03;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.85);
    });
  }

  playModalClose(): void {
    if (!this.initialized || this.muted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(392, now);
    osc.frequency.exponentialRampToValueAtTime(370, now + 0.4);
    osc.connect(gain);
    gain.connect(this.masterGain);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  playChamberCapture(count = 1): void {
    if (!this.initialized || this.muted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const freq = CHAMBER_FREQS[Math.min(count - 1, CHAMBER_FREQS.length - 1)];
    
    [-15, 0, 15].forEach((detune, i) => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune, now);
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(400, now);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);
      const delay = i * 0.02;
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.06, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);
      osc.start(now + delay);
      osc.stop(now + delay + 0.3);
    });
  }

  playBridgeSpawn(): void {
    if (!this.initialized || this.muted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    // Rumble
    const rumble = this.ctx.createOscillator();
    const rumbleGain = this.ctx.createGain();
    rumble.type = 'sine';
    rumble.frequency.setValueAtTime(60, now);
    rumble.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    rumble.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);
    rumbleGain.gain.setValueAtTime(0.15, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    rumble.start(now);
    rumble.stop(now + 0.5);
    
    // Ascending chime
    BRIDGE_CHORD.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.1 + i * 0.06);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      gain.gain.setValueAtTime(0, now + 0.1 + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.1 + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1 + i * 0.06 + 0.6);
      osc.start(now + 0.1 + i * 0.06);
      osc.stop(now + 0.1 + i * 0.06 + 0.7);
    });
  }

  playCollectionComplete(): void {
    if (!this.initialized || this.muted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    COMPLETE_NOTES.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.35);
    });
  }

  async loadBgMusic(): Promise<void> {
    if (this.bgMusic || !this.initialized || !this.ctx) return;
    try {
      const response = await fetch('/bg-music.mp3');
      const arrayBuffer = await response.arrayBuffer();
      this.bgMusic = await this.ctx.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.warn('Failed to load background music:', e);
    }
  }

  async startBgMusic(): Promise<void> {
    if (!this.initialized || this.muted || this.bgMusicStarted || !this.ctx || !this.masterGain) return;
    if (!this.bgMusic) {
      await this.loadBgMusic();
      if (!this.bgMusic) return;
    }
    this.bgMusicStarted = true;
    
    const source = this.ctx.createBufferSource();
    this.bgMusicGain = this.ctx.createGain();
    source.buffer = this.bgMusic;
    source.loop = true;
    source.connect(this.bgMusicGain);
    this.bgMusicGain.connect(this.masterGain);
    this.bgMusicGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.bgMusicGain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 2);
    source.start(0);
    this.bgMusicSource = source;
  }

  stopBgMusic(): void {
    if (!this.bgMusicStarted || !this.bgMusicSource || !this.ctx || !this.bgMusicGain) return;
    const now = this.ctx.currentTime;
    this.bgMusicGain.gain.linearRampToValueAtTime(0, now + 1);
    const source = this.bgMusicSource;
    setTimeout(() => {
      try { source.stop(); } catch(e) {}
      this.bgMusicStarted = false;
    }, 1100);
  }
}

export const AudioSystem = new AudioSystemClass();
