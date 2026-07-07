import { describe, it, expect } from 'vitest';
import { fatorDocking, INICIO_ZONA_DOCKING, fatorDesmonte, FIM_ZONA_DESMONTE } from './docking';

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

describe('fatorDesmonte', () => {
  it('FIM_ZONA_DESMONTE e 0.08', () => {
    expect(FIM_ZONA_DESMONTE).toBeCloseTo(0.08, 5);
  });

  it('e 1 no inicio do progresso (cobra ainda colada na origem)', () => {
    expect(fatorDesmonte(0, 0.08)).toBeCloseTo(1, 5);
  });

  it('e 0 no fim da zona e depois dela (cobra ja solta)', () => {
    expect(fatorDesmonte(0.08, 0.08)).toBe(0);
    expect(fatorDesmonte(0.5, 0.08)).toBe(0);
    expect(fatorDesmonte(1, 0.08)).toBe(0);
  });

  it('e monotonico decrescente dentro da zona', () => {
    let anterior = Infinity;
    for (let progresso = 0; progresso <= 0.08; progresso += 0.005) {
      const fator = fatorDesmonte(progresso, 0.08);
      expect(fator).toBeLessThanOrEqual(anterior);
      anterior = fator;
    }
  });

  it('nunca ultrapassa o intervalo [0, 1]', () => {
    for (let progresso = 0; progresso <= 1; progresso += 0.05) {
      const fator = fatorDesmonte(progresso, 0.08);
      expect(fator).toBeGreaterThanOrEqual(0);
      expect(fator).toBeLessThanOrEqual(1);
    }
  });

  it('e reversivel: o mesmo progresso sempre produz o mesmo fator', () => {
    const ida = fatorDesmonte(0.04, 0.08);
    const volta = fatorDesmonte(0.04, 0.08);
    expect(ida).toBe(volta);
  });
});
