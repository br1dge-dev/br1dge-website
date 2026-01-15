/**
 * SFX generators - Additional sound effects
 */
import { G_MINOR_TRIAD, GM7_CHORD, CHAMBER_FREQS, BRIDGE_CHORD, COMPLETE_NOTES } from './constants';

export function createLevelUpSFX(
  ctx: AudioContext,
  masterGain: GainNode,
  level: number
): void {
  const now = ctx.currentTime;
  const detunes = [-8, 0, 8];
  
  G_MINOR_TRIAD.forEach((freq) => {
    detunes.forEach(detune => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune, now);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.linearRampToValueAtTime(2500, now + 0.25);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.9);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      
      osc.start(now);
      osc.stop(now + 1.05);
    });
  });
}

export function createMaxStackSFX(ctx: AudioContext, masterGain: GainNode): void {
  const now = ctx.currentTime;
  const detunes = [-10, 0, 10];
  
  GM7_CHORD.forEach((freq) => {
    detunes.forEach(detune => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      
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
      gain.connect(masterGain);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.3);
      gain.gain.setValueAtTime(0.035, now + 1.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
      
      osc.start(now);
      osc.stop(now + 2.1);
    });
  });
}

export function createChamberCaptureSFX(
  ctx: AudioContext,
  masterGain: GainNode,
  count: number
): void {
  const now = ctx.currentTime;
  const freq = CHAMBER_FREQS[Math.min(count - 1, CHAMBER_FREQS.length - 1)];
  
  [-15, 0, 15].forEach((detune, i) => {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.detune.setValueAtTime(detune, now);
    
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(400, now);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    
    const delay = i * 0.02;
    gain.gain.setValueAtTime(0, now + delay);
    gain.gain.linearRampToValueAtTime(0.06, now + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);
    
    osc.start(now + delay);
    osc.stop(now + delay + 0.3);
  });
}

export function createBridgeSpawnSFX(ctx: AudioContext, masterGain: GainNode): void {
  const now = ctx.currentTime;
  
  // Low rumble
  const rumble = ctx.createOscillator();
  const rumbleGain = ctx.createGain();
  rumble.type = 'sine';
  rumble.frequency.setValueAtTime(60, now);
  rumble.frequency.exponentialRampToValueAtTime(30, now + 0.3);
  rumble.connect(rumbleGain);
  rumbleGain.connect(masterGain);
  rumbleGain.gain.setValueAtTime(0.15, now);
  rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  rumble.start(now);
  rumble.stop(now + 0.5);
  
  // Ascending chime
  BRIDGE_CHORD.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + 0.1 + i * 0.06);
    osc.connect(gain);
    gain.connect(masterGain);
    gain.gain.setValueAtTime(0, now + 0.1 + i * 0.06);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.1 + i * 0.06 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1 + i * 0.06 + 0.6);
    osc.start(now + 0.1 + i * 0.06);
    osc.stop(now + 0.1 + i * 0.06 + 0.7);
  });
}

export function createCollectionCompleteSFX(ctx: AudioContext, masterGain: GainNode): void {
  const now = ctx.currentTime;
  
  COMPLETE_NOTES.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.08);
    osc.connect(gain);
    gain.connect(masterGain);
    gain.gain.setValueAtTime(0, now + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.12, now + i * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.35);
  });
}
