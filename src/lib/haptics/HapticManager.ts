/**
 * Haptic feedback manager using Vibration API
 */

export const HapticManager = {
  supported: typeof navigator !== 'undefined' && 'vibrate' in navigator,
  enabled: true,

  vibrate(pattern: number | number[]): void {
    if (this.supported && this.enabled) {
      navigator.vibrate(pattern);
    }
  },

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  },

  // Predefined patterns
  collect(): void { this.vibrate(15); },
  capture(): void { this.vibrate(50); },
  discharge(): void { this.vibrate(100); },
  levelUp(): void { this.vibrate([25, 50, 25]); },
  maxStack(): void { this.vibrate([40, 80, 40, 80, 40]); },
  modalEnter(): void { this.vibrate(60); }
};
