/**
 * Haptic feedback manager using Vibration API
 * Syncs with AudioSystem muted state
 */
import { AudioSystem } from '../audio/AudioSystem';

export const HapticManager = {
  supported: typeof navigator !== 'undefined' && 'vibrate' in navigator,

  vibrate(pattern: number | number[]): void {
    if (this.supported && !AudioSystem.muted) {
      navigator.vibrate(pattern);
    }
  },

  // Predefined patterns
  collect(): void { this.vibrate(15); },
  capture(): void { this.vibrate(50); },
  discharge(): void { this.vibrate(100); },
  levelUp(): void { this.vibrate([25, 50, 25]); },
  maxStack(): void { this.vibrate([40, 80, 40, 80, 40]); },
  modalEnter(): void { this.vibrate(60); }
};
