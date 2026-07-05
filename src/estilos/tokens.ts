export const cores = {
  pretoTinta: '#0a0a0a',
  brancoPapel: '#f2ede4',
  vermelhoPunk: '#c81d25',
  amareloFita: '#e8b923',
} as const;

export const tipografia = {
  maquinaEscrever: '"Special Elite", "Courier New", monospace',
  recorteRevista: '"Anton", "Arial Narrow", sans-serif',
  manuscrita: '"Caveat", "Segoe Print", cursive',
} as const;

// Tabela fixa, gerada uma vez e congelada. Nunca calcular rotacao com Math.random em render.
export const ROTACOES = [-3, 2.5, -1.5, 4, -2.5, 1, 3.5, -4, 0.5, 2, -5, 5.5] as const;

export function obterRotacao(indice: number): number {
  const posicao = ((indice % ROTACOES.length) + ROTACOES.length) % ROTACOES.length;
  const valor = ROTACOES[posicao];
  // posicao esta sempre no intervalo [0, length) pelo modulo acima; guarda so satisfaz o type checker.
  if (valor === undefined) {
    throw new Error(`indice de rotacao fora da faixa: ${posicao}`);
  }
  return valor;
}

export interface Jitter {
  x: number;
  y: number;
}

// Tabela fixa de deslocamentos em pixels, mesmo principio das rotacoes.
export const JITTER: readonly Jitter[] = [
  { x: -2, y: 1 },
  { x: 3, y: -2 },
  { x: -1, y: 3 },
  { x: 2, y: 2 },
  { x: -3, y: -1 },
  { x: 1, y: -3 },
  { x: 4, y: 0 },
  { x: -4, y: 2 },
] as const;

export function obterJitter(indice: number): Jitter {
  const posicao = ((indice % JITTER.length) + JITTER.length) % JITTER.length;
  const valor = JITTER[posicao];
  // posicao esta sempre no intervalo [0, length) pelo modulo acima; guarda so satisfaz o type checker.
  if (valor === undefined) {
    throw new Error(`indice de jitter fora da faixa: ${posicao}`);
  }
  return valor;
}
