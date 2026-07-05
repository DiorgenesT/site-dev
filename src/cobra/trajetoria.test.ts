import { describe, it, expect } from 'vitest';
import { amostrarCurvaUniforme, RESOLUCAO_COMPRIMENTO_ARCO } from './trajetoria';
import type { Ponto } from './tipos';

describe('amostrarCurvaUniforme', () => {
  it('retorna exatamente RESOLUCAO_COMPRIMENTO_ARCO pontos', () => {
    const waypoints: Ponto[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const amostras = amostrarCurvaUniforme(waypoints, RESOLUCAO_COMPRIMENTO_ARCO);
    expect(amostras).toHaveLength(RESOLUCAO_COMPRIMENTO_ARCO);
  });

  it('a primeira amostra coincide com o primeiro waypoint', () => {
    const waypoints: Ponto[] = [
      { x: 5, y: 3 },
      { x: 20, y: 8 },
      { x: 35, y: 2 },
    ];
    const amostras = amostrarCurvaUniforme(waypoints, 50);
    expect(amostras[0]?.x).toBeCloseTo(5, 5);
    expect(amostras[0]?.y).toBeCloseTo(3, 5);
  });

  it('a ultima amostra coincide com o ultimo waypoint', () => {
    const waypoints: Ponto[] = [
      { x: 5, y: 3 },
      { x: 20, y: 8 },
      { x: 35, y: 2 },
    ];
    const amostras = amostrarCurvaUniforme(waypoints, 50);
    const ultima = amostras[amostras.length - 1];
    expect(ultima?.x).toBeCloseTo(35, 5);
    expect(ultima?.y).toBeCloseTo(2, 5);
  });

  it('para 2 waypoints colineares no eixo x, todos os pontos ficam com y proximo de 0 e x cresce monotonicamente', () => {
    const waypoints: Ponto[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ];
    const amostras = amostrarCurvaUniforme(waypoints, 20);
    for (const ponto of amostras) {
      expect(ponto.y).toBeCloseTo(0, 5);
    }
    for (let i = 1; i < amostras.length; i += 1) {
      const anterior = amostras[i - 1];
      const atual = amostras[i];
      expect(atual?.x).toBeGreaterThanOrEqual(anterior?.x ?? 0);
    }
  });

  it('lanca erro com menos de 2 waypoints', () => {
    expect(() => amostrarCurvaUniforme([{ x: 0, y: 0 }], 10)).toThrow();
  });
});
