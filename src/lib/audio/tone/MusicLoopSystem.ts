/**
 * MusicLoopSystem - Parallel MP3 Loop Player
 *
 * All 4 files play simultaneously from the start.
 * Only the active track has volume 1, others are muted.
 * This eliminates latency when switching tracks.
 */

import * as Tone from 'tone';

interface LoopTrack {
  name: string;
  filename: string;
  buffer: AudioBuffer | null;
  source: AudioBufferSourceNode | null;
  gain: GainNode | null;
}

type TrackName = 'base' | 'hihat' | 'saw' | 'bass';

const LOOP_FILES: Record<TrackName, string> = {
  base: '/audio/loops/ws-audio-1-base-v6.mp3',
  hihat: '/audio/loops/ws-audio-2-hihat-v6.mp3',
  saw: '/audio/loops/ws-audio-3-saw-v6.mp3',
  bass: '/audio/loops/ws-audio-4-bass-v6.mp3',
};

const LEVEL_TRACK: Record<number, TrackName> = {
  0: 'base',  // muted via getTrackForLevel returning null
  1: 'base', 2: 'base',
  3: 'hihat', 4: 'hihat',
  5: 'saw', 6: 'saw', 7: 'saw',
  8: 'bass', 9: 'bass', 10: 'bass', 11: 'bass', 12: 'bass', 13: 'bass', 14: 'bass',
  15: 'bass', 16: 'bass', 17: 'bass', 18: 'bass', 19: 'bass', 20: 'bass',
};

function getTrackForLevel(level: number): TrackName | null {
  // Level 0 is tutorial - no music
  if (level === 0) return null;
  return LEVEL_TRACK[level] || 'bass';
}

const LOOP_DURATION = 16; // seconds
const CROSSFADE_DURATION = 0.3; // seconds - quick, direct transitions

class MusicLoopSystemClass {
  private tracks: Map<TrackName, LoopTrack> = new Map();
  private audioContext: AudioContext | null = null;
  private mainGain: GainNode | null = null;
  private _initialized = false;
  private _started = false;
  private currentLevel = 0;
  private currentTrack: TrackName = 'base';
  private startTime = 0;

  get initialized(): boolean {
    return this._initialized;
  }

  get active(): boolean {
    return this._started;
  }

  /**
   * Initialize - load all buffers
   */
  async init(): Promise<void> {
    try {
      if (this._initialized) return;

      const context = Tone.getContext();
      if (!context) return;

      const rawContext = context.rawContext as AudioContext;
      if (!rawContext) return;

      this.audioContext = rawContext;

      // Create main gain
      this.mainGain = rawContext.createGain();
      this.mainGain.gain.value = Tone.dbToGain(-6);
      this.mainGain.connect(rawContext.destination);

      // Create track objects
      for (const [name, filename] of Object.entries(LOOP_FILES)) {
        const trackName = name as TrackName;
        const gain = rawContext.createGain();
        gain.gain.value = 0;
        this.tracks.set(trackName, {
          name: trackName,
          filename,
          buffer: null,
          source: null,
          gain,
        });
      }

      // Load all buffers
      const loadPromises = Array.from(this.tracks.values()).map(async (track) => {
        try {
          const response = await fetch(track.filename);
          if (!response.ok) return;
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await rawContext.decodeAudioData(arrayBuffer);
          track.buffer = audioBuffer;
          console.log(`MusicLoopSystem: Loaded ${track.name}`);
        } catch {
          console.warn(`MusicLoopSystem: Failed to load ${track.filename}`);
        }
      });

      await Promise.all(loadPromises);

      // Connect gains
      for (const track of this.tracks.values()) {
        if (track.gain && this.mainGain) {
          track.gain.connect(this.mainGain);
        }
      }

      this._initialized = true;
      console.log('MusicLoopSystem: Ready');

    } catch (error) {
      console.warn('MusicLoopSystem: Init failed:', error);
    }
  }

   /**
    * Start all loops simultaneously
    */
   async start(): Promise<void> {
     if (!this._initialized || !this.audioContext) return;
     if (this._started) return;

     const now = this.audioContext.currentTime;
     const startTime = now + 0.05;
     this.startTime = startTime;

     // Start ALL tracks at the same time
     for (const [name, track] of this.tracks) {
       if (!track.buffer || !track.gain) continue;

       const source = this.audioContext.createBufferSource();
       source.buffer = track.buffer;
       source.loop = true;
       source.loopStart = 0;
       source.loopEnd = LOOP_DURATION;
       source.connect(track.gain);
       source.start(startTime);

        track.source = source;
     }

      // Check if setLevel() was already called and stored a target track
      // If so, use that track directly
      if (this.currentTrack && this.currentLevel >= 1) {
        const targetTrack = getTrackForLevel(this.currentLevel);
        if (targetTrack) {
          this.setTrackVolume(targetTrack, 1);
          console.log(`MusicLoopSystem: Started with ${targetTrack} (level ${this.currentLevel})`);
        }
      } else {
        console.log(`MusicLoopSystem: Started muted (level ${this.currentLevel})`);
      }

      this._started = true;
    }

   /**
    * Stop all loops
    */
  stop(): void {
    if (!this._started) return;

    for (const track of this.tracks.values()) {
      if (track.source && track.gain) {
        const now = this.audioContext!.currentTime;
        track.gain.gain.linearRampToValueAtTime(0, now + 0.5);

        setTimeout(() => {
          try {
            track.source?.stop();
            track.source?.disconnect();
          } catch {}
          track.source = null;
        }, 600);
      }
    }

    this._started = false;
    console.log('MusicLoopSystem: Stopped');
  }

  /**
   * Set level - switch active track or mute if level 0 (tutorial)
   * Level 1-2: base, Level 3-4: hihat, Level 5-7: saw, Level 8+: bass
   */
  setLevel(level: number): void {
    if (!this._initialized) return;

    this.currentLevel = level;
    const targetTrack = getTrackForLevel(level);

    if (!this._started) {
      // Store the target track for when we start
      this.currentTrack = targetTrack || 'base';
      console.log(`MusicLoopSystem: Pre-start level ${level} -> track ${this.currentTrack}`);
      return;
    }

    // If no track (level 0 only), mute everything
    if (!targetTrack) {
      console.log(`MusicLoopSystem: Level ${level} -> muted`);
      // Mute current track
      if (this.currentTrack) {
        this.setTrackVolume(this.currentTrack, 0);
      }
      return;
    }

    if (targetTrack === this.currentTrack) return;

    console.log(`MusicLoopSystem: Level ${level} -> ${targetTrack}`);

    // Immediate switch - fade out old, fade in new
    if (this.currentTrack) {
      this.setTrackVolume(this.currentTrack, 0);
    }
    this.setTrackVolume(targetTrack, 1);

    this.currentTrack = targetTrack;
  }

  /**
   * Set volume for a specific track
   */
  private setTrackVolume(trackName: TrackName, volume: number): void {
    const track = this.tracks.get(trackName);
    if (!track || !track.gain) return;

    const now = this.audioContext?.currentTime || 0;

    track.gain.gain.cancelScheduledValues(now);
    track.gain.gain.setValueAtTime(track.gain.gain.value, now);
    track.gain.gain.linearRampToValueAtTime(volume, now + 0.1);
  }

  /**
   * Set master volume
   */
  setVolume(db: number): void {
    if (this.mainGain) {
      this.mainGain.gain.setValueAtTime(Tone.dbToGain(db), this.audioContext?.currentTime || 0);
    }
  }

  /**
   * Dispose
   */
  dispose(): void {
    this.stop();

    for (const track of this.tracks.values()) {
      track.gain?.disconnect();
      track.gain = null;
      track.buffer = null;
    }

    this.mainGain?.disconnect();
    this.mainGain = null;

    this.tracks.clear();
    this._initialized = false;
    this._started = false;

    console.log('MusicLoopSystem: Disposed');
  }
}

export const MusicLoopSystem = new MusicLoopSystemClass();
