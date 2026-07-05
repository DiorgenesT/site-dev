import { describe, it, expect } from 'vitest';
import {
  amostrarCurvaUniforme,
  RESOLUCAO_COMPRIMENTO_ARCO,
  construirTrajetoria,
} from './trajetoria';
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

describe('construirTrajetoria', () => {
  it('amostrar(0) retorna o primeiro waypoint', () => {
    const trajetoria = construirTrajetoria([
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 0 },
    ]);
    const ponto = trajetoria.amostrar(0);
    expect(ponto.x).toBeCloseTo(0, 1);
    expect(ponto.y).toBeCloseTo(0, 1);
  });

  it('amostrar(1) retorna o ultimo waypoint', () => {
    const trajetoria = construirTrajetoria([
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 0 },
    ]);
    const ponto = trajetoria.amostrar(1);
    expect(ponto.x).toBeCloseTo(100, 1);
    expect(ponto.y).toBeCloseTo(0, 1);
  });

  it('parametriza por comprimento de arco, nao por indice de segmento (velocidade constante)', () => {
    // 3 waypoints colineares no eixo x, MUITO desigualmente espacados:
    // primeiro segmento tem comprimento 1, segundo tem comprimento 99.
    // Se fosse por indice de segmento, amostrar(0.5) cairia perto de x=1 (fim do primeiro segmento).
    // Por comprimento de arco, amostrar(0.5) deve cair perto do meio do comprimento TOTAL (100/2=50).
    // A margem [40,60] (em vez de um valor mais exato) absorve o overshoot conhecido do
    // Catmull-Rom uniforme para waypoints tao desiguais (a curva "ultrapassa" x=0 no primeiro
    // segmento antes de seguir, o que desloca o meio real do arco para ~43 em vez de 50).
    // Nao apertar esse assert sem entender esse comportamento herdado da amostragem (Task 2).
    const trajetoria = construirTrajetoria([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 100, y: 0 },
    ]);
    const meio = trajetoria.amostrar(0.5);
    expect(meio.x).toBeGreaterThan(40);
    expect(meio.x).toBeLessThan(60);
  });

  it('e monotonica em x para waypoints colineares crescentes', () => {
    const trajetoria = construirTrajetoria([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ]);
    let anteriorX = -Infinity;
    for (let i = 0; i <= 10; i += 1) {
      const ponto = trajetoria.amostrar(i / 10);
      expect(ponto.x).toBeGreaterThanOrEqual(anteriorX);
      anteriorX = ponto.x;
    }
  });
});
