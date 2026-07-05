import type { Ponto } from './tipos';

export const RESOLUCAO_COMPRIMENTO_ARCO = 200;

function obterPontoOuFalhar(pontos: readonly Ponto[], indice: number): Ponto {
  const ponto = pontos[indice];
  if (ponto === undefined) {
    throw new Error(`indice de waypoint fora da faixa: ${indice}`);
  }
  return ponto;
}

function catmullRom1D(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

function pontoNoSegmento(waypoints: readonly Ponto[], segmento: number, t: number): Ponto {
  const total = waypoints.length;
  const i0 = Math.max(segmento - 1, 0);
  const i1 = segmento;
  const i2 = Math.min(segmento + 1, total - 1);
  const i3 = Math.min(segmento + 2, total - 1);

  const p0 = obterPontoOuFalhar(waypoints, i0);
  const p1 = obterPontoOuFalhar(waypoints, i1);
  const p2 = obterPontoOuFalhar(waypoints, i2);
  const p3 = obterPontoOuFalhar(waypoints, i3);

  return {
    x: catmullRom1D(p0.x, p1.x, p2.x, p3.x, t),
    y: catmullRom1D(p0.y, p1.y, p2.y, p3.y, t),
  };
}

export function amostrarCurvaUniforme(waypoints: readonly Ponto[], resolucao: number): Ponto[] {
  if (waypoints.length < 2) {
    throw new Error('amostrarCurvaUniforme precisa de ao menos 2 waypoints');
  }

  const numSegmentos = waypoints.length - 1;
  const amostras: Ponto[] = [];

  for (let i = 0; i < resolucao; i += 1) {
    const progresso = resolucao === 1 ? 0 : i / (resolucao - 1);
    const posicaoGlobal = progresso * numSegmentos;
    const segmento = Math.min(Math.floor(posicaoGlobal), numSegmentos - 1);
    const t = posicaoGlobal - segmento;
    amostras.push(pontoNoSegmento(waypoints, segmento, t));
  }

  return amostras;
}
