import { describe, it, expect } from 'vitest';
import { carregarGsap, ScrollTrigger } from './gsap';

describe('carregarGsap', () => {
  it('retorna a instancia do gsap com o ScrollTrigger utilizavel', () => {
    const gsap = carregarGsap();
    expect(typeof gsap.to).toBe('function');
    expect(typeof ScrollTrigger.create).toBe('function');
  });

  it('e idempotente ao chamar mais de uma vez', () => {
    const primeira = carregarGsap();
    const segunda = carregarGsap();
    expect(primeira).toBe(segunda);
  });
});
