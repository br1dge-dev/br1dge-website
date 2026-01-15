// Type declarations for Strudel packages
declare module '@strudel/core' {
  export function init(): Promise<any>;
  export function note(pattern: string): any;
  export function n(pattern: string): any;
  export function s(pattern: string): any;
  export const silence: any;
  export function play(patterns: any, time: number): Promise<any>;
}

declare module '@strudel/webaudio' {
  export function getAudioContext(): AudioContext;
  export function webaudioOutput(patterns: any, time: number): Promise<any>;
  export function playPattern(pattern: any, time: number): Promise<any>;
}

declare module '@strudel/transpiler' {
  export function transpile(code: string): any;
}
