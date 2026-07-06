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

export const PASSOS_POR_SEGUNDO = 12;

export interface Quantizador {
  readonly intervaloMs: number;
  tempoAcumulado: number;
}

export function criarQuantizador(passosPorSegundo: number): Quantizador {
  return { intervaloMs: 1000 / passosPorSegundo, tempoAcumulado: 0 };
}

export function avancarQuantizador(quantizador: Quantizador, deltaMs: number): boolean {
  quantizador.tempoAcumulado += deltaMs;
  if (quantizador.tempoAcumulado >= quantizador.intervaloMs) {
    quantizador.tempoAcumulado -= quantizador.intervaloMs;
    return true;
  }
  return false;
}

export interface PassadaTraco {
  readonly deslocamentoX: number;
  readonly deslocamentoY: number;
  readonly espessura: number;
}

// Tabela fixa gerada uma unica vez, 3 passadas deterministas (nunca Math.random),
// estilo "rabisco nervoso": tres passadas levemente desalinhadas sobrepostas.
export const PASSADAS_TRACO: readonly PassadaTraco[] = [
  { deslocamentoX: 0, deslocamentoY: 0, espessura: 6 },
  { deslocamentoX: 1.5, deslocamentoY: -1, espessura: 4 },
  { deslocamentoX: -1, deslocamentoY: 1.2, espessura: 3 },
] as const;
