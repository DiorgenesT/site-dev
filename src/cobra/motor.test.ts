import { describe, it, expect } from 'vitest';
import {
  criarBufferCircular,
  inserirPosicao,
  obterPosicao,
  TAMANHO_BUFFER_CORPO,
  criarQuantizador,
  avancarQuantizador,
  PASSOS_POR_SEGUNDO,
} from './motor';

describe('buffer circular', () => {
  it('TAMANHO_BUFFER_CORPO e 12', () => {
    expect(TAMANHO_BUFFER_CORPO).toBe(12);
  });

  it('obterPosicao(0) retorna a posicao mais recente inserida', () => {
    const buffer = criarBufferCircular(4);
    inserirPosicao(buffer, { x: 1, y: 1 });
    inserirPosicao(buffer, { x: 2, y: 2 });
    const maisRecente = obterPosicao(buffer, 0);
    expect(maisRecente).toEqual({ x: 2, y: 2 });
  });

  it('obterPosicao(1) retorna a posicao anterior a mais recente', () => {
    const buffer = criarBufferCircular(4);
    inserirPosicao(buffer, { x: 1, y: 1 });
    inserirPosicao(buffer, { x: 2, y: 2 });
    const anterior = obterPosicao(buffer, 1);
    expect(anterior).toEqual({ x: 1, y: 1 });
  });

  it('faz wraparound corretamente ao exceder o tamanho do buffer', () => {
    const buffer = criarBufferCircular(3);
    inserirPosicao(buffer, { x: 1, y: 1 });
    inserirPosicao(buffer, { x: 2, y: 2 });
    inserirPosicao(buffer, { x: 3, y: 3 });
    inserirPosicao(buffer, { x: 4, y: 4 });
    // buffer de tamanho 3, a posicao {1,1} foi sobrescrita
    expect(obterPosicao(buffer, 0)).toEqual({ x: 4, y: 4 });
    expect(obterPosicao(buffer, 1)).toEqual({ x: 3, y: 3 });
    expect(obterPosicao(buffer, 2)).toEqual({ x: 2, y: 2 });
  });

  it('quantidadeEscrita cresce ate o tamanho maximo e para', () => {
    const buffer = criarBufferCircular(2);
    expect(buffer.quantidadeEscrita).toBe(0);
    inserirPosicao(buffer, { x: 1, y: 1 });
    expect(buffer.quantidadeEscrita).toBe(1);
    inserirPosicao(buffer, { x: 2, y: 2 });
    expect(buffer.quantidadeEscrita).toBe(2);
    inserirPosicao(buffer, { x: 3, y: 3 });
    expect(buffer.quantidadeEscrita).toBe(2);
  });
});

describe('quantizador stop motion', () => {
  it('PASSOS_POR_SEGUNDO e 12', () => {
    expect(PASSOS_POR_SEGUNDO).toBe(12);
  });

  it('intervaloMs e aproximadamente 83.33ms para 12 passos por segundo', () => {
    const quantizador = criarQuantizador(12);
    expect(quantizador.intervaloMs).toBeCloseTo(1000 / 12, 5);
  });

  it('nao avanca antes de acumular o intervalo completo', () => {
    const quantizador = criarQuantizador(12);
    expect(avancarQuantizador(quantizador, 16)).toBe(false);
    expect(avancarQuantizador(quantizador, 16)).toBe(false);
  });

  it('avanca exatamente quando o tempo acumulado atinge o intervalo', () => {
    const quantizador = criarQuantizador(12); // intervalo ~83.33ms
    avancarQuantizador(quantizador, 80);
    expect(avancarQuantizador(quantizador, 4)).toBe(true);
  });

  it('preserva o resto do tempo acumulado apos avancar (nao perde precisao)', () => {
    const quantizador = criarQuantizador(10); // intervalo exato de 100ms
    avancarQuantizador(quantizador, 120);
    expect(quantizador.tempoAcumulado).toBeCloseTo(20, 5);
  });
});
