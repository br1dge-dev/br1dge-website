/**
 * Audio System Types
 */

export interface AudioSystemState {
  ctx: AudioContext | null;
  masterGain: GainNode | null;
  compressor: DynamicsCompressorNode | null;
  initialized: boolean;
  muted: boolean;
  bgMusic: AudioBuffer | null;
  bgMusicGain: GainNode | null;
  bgMusicSource: AudioBufferSourceNode | null;
  bgMusicStarted: boolean;
}
