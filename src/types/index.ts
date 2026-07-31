export interface Memory {
  id: string;
  date: string;
  title: string;
  image?: string;
  text: string;
  tags?: string[];
}

export interface ReverseMemory {
  year: string;
  text: string;
}

export type PageState = 'preloading' | 'opening' | 'entry' | 'preface' | 'timeline' | 'reverse';

export interface RaindropObj {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
  width: number;
}

export interface MistParticle {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speedX: number;
  speedY: number;
}

export interface LightPoint {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  phase: number;
  speed: number;
}

export interface RippleObj {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}
