import { describe, it, expect } from 'vitest';
import { calcularContraste } from './contraste';
import { cores, obterRotacao, obterJitter, ROTACOES, JITTER } from './tokens';

describe('cores', () => {
  it('vermelhoPunk como texto sobre brancoPapel atinge 4.5:1', () => {
    expect(calcularContraste(cores.vermelhoPunk, cores.brancoPapel)).toBeGreaterThanOrEqual(4.5);
  });

  it('pretoTinta como texto sobre amareloFita atinge 4.5:1', () => {
    expect(calcularContraste(cores.pretoTinta, cores.amareloFita)).toBeGreaterThanOrEqual(4.5);
  });

  it('brancoPapel como texto sobre pretoTinta atinge 4.5:1', () => {
    expect(calcularContraste(cores.brancoPapel, cores.pretoTinta)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('obterRotacao', () => {
  it('e deterministica: mesma entrada sempre retorna o mesmo valor', () => {
    expect(obterRotacao(3)).toBe(obterRotacao(3));
  });

  it('faz wraparound pelo tamanho da tabela', () => {
    expect(obterRotacao(0)).toBe(obterRotacao(ROTACOES.length));
  });

  it('nunca excede a faixa de +-6 graus', () => {
    for (let i = 0; i < ROTACOES.length; i += 1) {
      expect(Math.abs(obterRotacao(i))).toBeLessThanOrEqual(6);
    }
  });
});

describe('obterJitter', () => {
  it('e deterministica: mesma entrada sempre retorna o mesmo valor', () => {
    expect(obterJitter(2)).toEqual(obterJitter(2));
  });

  it('faz wraparound pelo tamanho da tabela', () => {
    expect(obterJitter(0)).toEqual(obterJitter(JITTER.length));
  });
});
