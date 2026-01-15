// Type declarations for @strudel/web
declare module '@strudel/web' {
  export function initStrudel(): Promise<void>;
  export function hush(): void;
  
  interface Pattern {
    play(): void;
    scale(scale: string): Pattern;
    s(sound: string): Pattern;
    lpf(freq: number): Pattern;
    gain(value: number): Pattern;
    delay(value: number): Pattern;
    decay(value: number): Pattern;
    sustain(value: number): Pattern;
    pan(value: any): Pattern;
    fm(value: number): Pattern;
    fmwave(wave: string): Pattern;
    detune(value: any): Pattern;
    o(octave: number): Pattern;
    add(pattern: Pattern | string): Pattern;
    trans(semitones: number): Pattern;
    mask(value: number | Pattern): Pattern;
  }
  
  export function note(pattern: string): Pattern;
  export function n(pattern: string): Pattern;
  export function s(pattern: string): Pattern;
  export function stack(...patterns: Pattern[]): Pattern;
}
