import { describe, it, expect } from 'vitest';
import { fatorDocking, INICIO_ZONA_DOCKING } from './docking';

describe('fatorDocking', () => {
  it('INICIO_ZONA_DOCKING e 0.92', () => {
    expect(INICIO_ZONA_DOCKING).toBeCloseTo(0.92, 5);
  });

  it('e 0 antes do inicio da zona', () => {
    expect(fatorDocking(0, 0.92)).toBe(0);
    expect(fatorDocking(0.5, 0.92)).toBe(0);
    expect(fatorDocking(0.92, 0.92)).toBe(0);
  });

  it('e 1 exatamente no fim do progresso', () => {
    expect(fatorDocking(1, 0.92)).toBeCloseTo(1, 5);
  });

  it('e monotonico crescente dentro da zona', () => {
    let anterior = -Infinity;
    for (let progresso = 0.92; progresso <= 1; progresso += 0.01) {
      const fator = fatorDocking(progresso, 0.92);
      expect(fator).toBeGreaterThanOrEqual(anterior);
      anterior = fator;
    }
  });

  it('nunca ultrapassa o intervalo [0, 1]', () => {
    for (let progresso = 0; progresso <= 1; progresso += 0.05) {
      const fator = fatorDocking(progresso, 0.92);
      expect(fator).toBeGreaterThanOrEqual(0);
      expect(fator).toBeLessThanOrEqual(1);
    }
  });

  it('e simetrico: o mesmo progresso sempre produz o mesmo fator (reversivel por construcao)', () => {
    const ida = fatorDocking(0.95, 0.92);
    const volta = fatorDocking(0.95, 0.92);
    expect(ida).toBe(volta);
  });
});
