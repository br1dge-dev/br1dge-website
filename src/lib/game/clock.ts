/** Pause-aware timers; gameplay and rendering run on every animation frame. */
export class GameClock {
  now: number;
  private previous: number | undefined;
  private timers = new Map<number, { at: number; callback: () => void }>();
  private nextTimer = 0;
  paused = false;

  constructor(start = Date.now()) {
    this.now = start;
  }

  setPaused(paused: boolean): void {
    if (this.paused === paused) return;
    this.paused = paused;
    this.previous = undefined;
  }

  schedule(callback: () => void, delay = 0): number {
    const id = ++this.nextTimer;
    this.timers.set(id, { at: this.now + delay, callback });
    return id;
  }

  clearTimers(): void {
    this.timers.clear();
  }

  advance(timestamp: number, update: () => void): void {
    if (this.paused) return;
    // Preserve the original per-display-frame movement and cursor response.
    // Only timers use elapsed time; never skip frames or redraw catch-up steps.
    if (this.previous !== undefined) {
      this.now += Math.max(0, timestamp - this.previous);
    }
    this.previous = timestamp;
    for (const [id, timer] of this.timers) {
      if (timer.at <= this.now && this.timers.delete(id)) timer.callback();
      if (this.paused) break;
    }
    if (!this.paused) update();
  }
}
