import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

interface TickerMock {
  add: Mock;
  remove: Mock;
  lagSmoothing: Mock;
}

interface LenisInstanceMock {
  on: Mock;
  raf: Mock;
  destroy: Mock;
}

// Mocka o pacote lenis: o construtor retorna sempre um objeto com on/raf/destroy
// espionaveis, sem nenhum acesso real a DOM/scroll/rAF.
vi.mock('lenis', () => ({
  default: vi.fn(function LenisMock(): LenisInstanceMock {
    return { on: vi.fn(), raf: vi.fn(), destroy: vi.fn() };
  }),
}));

// Mocka ./gsap por inteiro: carregarGsap sempre devolve o mesmo objeto ticker
// espionavel (estavel entre chamadas dentro do mesmo teste), e ScrollTrigger.update
// e um vi.fn() qualquer, sem tocar no gsap real.
vi.mock('./gsap', () => {
  const ticker: TickerMock = { add: vi.fn(), remove: vi.fn(), lagSmoothing: vi.fn() };
  const scrollTrigger = { update: vi.fn() };
  return {
    carregarGsap: vi.fn(() => ({ ticker })),
    ScrollTrigger: scrollTrigger,
  };
});

function mockarMatchMedia(reduzido: boolean): Mock {
  // jsdom nao implementa matchMedia; nao ha o que espionar com vi.spyOn,
  // entao definimos a propriedade diretamente a cada teste.
  const matchMediaMock = vi.fn().mockReturnValue({ matches: reduzido });
  window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;
  return matchMediaMock;
}

async function importarModuloMovimento() {
  const lenisModulo = await import('lenis');
  const gsapModulo = await import('./gsap');
  const movimentoModulo = await import('./movimento');

  const LenisMock = lenisModulo.default as unknown as Mock;
  const ticker = (gsapModulo.carregarGsap() as unknown as { ticker: TickerMock }).ticker;

  return { LenisMock, ticker, ...movimentoModulo };
}

describe('movimento (singleton lenis + gsap ticker)', () => {
  beforeEach(() => {
    // Cada teste comeca com o estado modulo-escopo (lenis, consumidores,
    // tickerRegistrado) totalmente limpo, sem depender da ordem dos testes.
    // vi.resetModules() forca a reavaliacao de movimento.ts/gsap.ts; como os
    // modulos mockados (lenis, ./gsap) nao sao recriados por resetModules,
    // vi.clearAllMocks() zera o historico de chamadas deles entre os testes
    // sem descartar as implementacoes definidas nos factories de vi.mock.
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('iniciarMovimento/pararMovimento 2x/2x cria e destroi o Lenis exatamente uma vez', async () => {
    mockarMatchMedia(false);
    const { LenisMock, ticker, iniciarMovimento, pararMovimento } = await importarModuloMovimento();

    iniciarMovimento();
    iniciarMovimento();

    expect(LenisMock).toHaveBeenCalledTimes(1);
    expect(ticker.add).toHaveBeenCalledTimes(1);

    const instancia = LenisMock.mock.results[0]?.value as LenisInstanceMock;

    pararMovimento();
    expect(instancia.destroy).not.toHaveBeenCalled();
    expect(ticker.remove).not.toHaveBeenCalled();

    pararMovimento();
    expect(instancia.destroy).toHaveBeenCalledTimes(1);
    expect(ticker.remove).toHaveBeenCalledTimes(1);

    // Nao deve criar uma segunda instancia ao final do ciclo.
    expect(LenisMock).toHaveBeenCalledTimes(1);
  });

  it('uma chamada extra de pararMovimento (mais paradas que inicios) nao lanca erro nem deixa o contador negativo', async () => {
    mockarMatchMedia(false);
    const { LenisMock, ticker, iniciarMovimento, pararMovimento } = await importarModuloMovimento();

    // Paradas "de sobra" antes de qualquer inicio: nao deve lancar, nem tocar
    // no lenis/ticker (lenis ainda e null neste ponto).
    expect(() => {
      pararMovimento();
      pararMovimento();
    }).not.toThrow();

    expect(LenisMock).not.toHaveBeenCalled();
    expect(ticker.remove).not.toHaveBeenCalled();

    // Se o contador tivesse ficado negativo, um unico par inicio/parada nao
    // fecharia o ciclo (destroy so dispara quando consumidores volta a 0).
    iniciarMovimento();
    pararMovimento();

    const instancia = LenisMock.mock.results[0]?.value as LenisInstanceMock;
    expect(LenisMock).toHaveBeenCalledTimes(1);
    expect(instancia.destroy).toHaveBeenCalledTimes(1);
    expect(ticker.remove).toHaveBeenCalledTimes(1);
  });

  it('com prefers-reduced-motion, consumidores incrementa mas lenis fica null e sem side effects reais', async () => {
    const matchMediaMock = mockarMatchMedia(true);
    const { LenisMock, ticker, iniciarMovimento, pararMovimento } = await importarModuloMovimento();

    iniciarMovimento();

    // Caminho de reduced-motion: nao cria o Lenis nem toca no ticker do gsap.
    expect(LenisMock).not.toHaveBeenCalled();
    expect(ticker.add).not.toHaveBeenCalled();

    // Agora sem reduced-motion: este e o "segundo consumidor" de verdade.
    matchMediaMock.mockReturnValue({ matches: false });
    iniciarMovimento();

    expect(LenisMock).toHaveBeenCalledTimes(1);
    expect(ticker.add).toHaveBeenCalledTimes(1);
    const instancia = LenisMock.mock.results[0]?.value as LenisInstanceMock;

    // Uma unica parada nao e suficiente: prova que a chamada em reduced-motion
    // realmente incrementou consumidores (senao o destroy dispararia aqui).
    pararMovimento();
    expect(instancia.destroy).not.toHaveBeenCalled();
    expect(ticker.remove).not.toHaveBeenCalled();

    pararMovimento();
    expect(instancia.destroy).toHaveBeenCalledTimes(1);
    expect(ticker.remove).toHaveBeenCalledTimes(1);
  });
});
