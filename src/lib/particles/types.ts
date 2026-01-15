/**
 * Particle system types
 */

export interface BaseParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Particle extends BaseParticle {
  life: number;
  hue?: number;
}

export interface AmbientParticle extends BaseParticle {
  size: number;
  alpha: number;
  twinkle: number;
  absorbed: boolean;
}

export interface ColoredParticle extends BaseParticle {
  color: string;
  size: number;
  phase: number;
  turnTimer: number;
  alpha: number;
  captured?: boolean;
}

export interface RedParticle extends BaseParticle {
  active: boolean;
  phase: number;
  turnTimer: number;
}

export interface ChamberParticle extends BaseParticle {
  color: string;
  size: number;
  isRed: boolean;
}

export interface Ripple {
  x: number;
  y: number;
  size: number;
  alpha: number;
  hue?: number;
}

export interface FloatingBridge extends BaseParticle {
  color: string;
  url: string | null;
  size: number;
  rotation: number;
  rotationSpeed: number;
  phase: number;
  orbitAngle: number;
  orbitSpeed: number;
  alpha: number;
  birthTime: number;
  hitRadius: number;
}

export interface LogoOutline {
  alpha: number;
  radius: number;
  hue: number;
}
