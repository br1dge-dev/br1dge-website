// Type declarations for @strudel/web
declare module '@strudel/web' {
  export function initStrudel(): Promise<void>;
  export function hush(): void;
  
  interface Pattern {
    play(): void;
    scale(scale: string): Pattern;
    s(sound: string): Pattern;
    lpf(freq: number | Signal): Pattern;
    gain(value: number): Pattern;
    delay(value: number): Pattern;
    decay(value: number): Pattern;
    sustain(value: number): Pattern;
    pan(value: number | Signal): Pattern;
    fm(value: number): Pattern;
    fmwave(wave: string): Pattern;
    detune(value: number | Signal): Pattern;
    o(octave: number): Pattern;
    add(pattern: Pattern | string): Pattern;
    trans(semitones: number): Pattern;
    mask(value: number | Pattern): Pattern;
    duck(pattern: string): Pattern;
    duckdepth(value: number): Pattern;
    duckattack(value: number): Pattern;
  }
  
  interface Signal {
    range(min: number, max: number): Signal;
    slow(factor: number): Signal;
  }
  
  export const sine: Signal;
  export const rand: Signal;
  
  export function note(pattern: string): Pattern;
  export function n(pattern: string): Pattern;
  export function s(pattern: string): Pattern;
  export function stack(...patterns: Pattern[]): Pattern;
}
