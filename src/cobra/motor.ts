import type { Ponto } from './tipos';

export const TAMANHO_BUFFER_CORPO = 12;

export interface BufferCircular {
  readonly tamanho: number;
  readonly x: Float32Array;
  readonly y: Float32Array;
  indiceMaisRecente: number;
  quantidadeEscrita: number;
}

export function criarBufferCircular(tamanho: number): BufferCircular {
  return {
    tamanho,
    x: new Float32Array(tamanho),
    y: new Float32Array(tamanho),
    indiceMaisRecente: -1,
    quantidadeEscrita: 0,
  };
}

export function inserirPosicao(buffer: BufferCircular, ponto: Ponto): void {
  buffer.indiceMaisRecente = (buffer.indiceMaisRecente + 1) % buffer.tamanho;
  buffer.x[buffer.indiceMaisRecente] = ponto.x;
  buffer.y[buffer.indiceMaisRecente] = ponto.y;
  buffer.quantidadeEscrita = Math.min(buffer.quantidadeEscrita + 1, buffer.tamanho);
}

export function obterPosicao(buffer: BufferCircular, deslocamento: number): Ponto {
  const indice =
    (((buffer.indiceMaisRecente - deslocamento) % buffer.tamanho) + buffer.tamanho) %
    buffer.tamanho;
  const x = buffer.x[indice];
  const y = buffer.y[indice];
  if (x === undefined || y === undefined) {
    throw new Error(`indice de buffer fora da faixa: ${indice}`);
  }
  return { x, y };
}
