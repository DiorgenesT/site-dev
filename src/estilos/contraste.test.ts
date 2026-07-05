import { describe, it, expect } from 'vitest';
import { calcularContraste } from './contraste';

describe('calcularContraste', () => {
  it('retorna 21 para preto contra branco puro', () => {
    expect(calcularContraste('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('retorna 1 quando as duas cores sao identicas', () => {
    expect(calcularContraste('#c81d25', '#c81d25')).toBeCloseTo(1, 5);
  });

  it('e simetrico em relacao a ordem dos argumentos', () => {
    const a = calcularContraste('#0a0a0a', '#f2ede4');
    const b = calcularContraste('#f2ede4', '#0a0a0a');
    expect(a).toBeCloseTo(b, 10);
  });
});
