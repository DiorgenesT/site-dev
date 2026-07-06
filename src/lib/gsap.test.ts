import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

// Mocka o pacote gsap e os plugins para nao registrar nada de verdade;
// so precisamos observar quantas vezes registerPlugin e chamado.
vi.mock('gsap', () => ({
  gsap: { registerPlugin: vi.fn() },
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: { nome: 'ScrollTrigger-mock' },
}));

vi.mock('gsap/Flip', () => ({
  Flip: { nome: 'Flip-mock' },
}));

describe('carregarGsap', () => {
  beforeEach(() => {
    // vi.resetModules() reavalia gsap.ts do zero, limpando a flag modulo-escopo
    // `pluginsRegistrados`. O modulo mockado `gsap` em si nao e recriado por
    // resetModules, entao vi.clearAllMocks() zera o historico de chamadas do
    // vi.fn() de registerPlugin entre os testes.
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('chamado duas vezes registra os plugins do gsap apenas uma vez', async () => {
    const { gsap } = await import('gsap');
    const { carregarGsap } = await import('./gsap');

    carregarGsap();
    carregarGsap();

    expect(gsap.registerPlugin as Mock).toHaveBeenCalledTimes(1);
  });

  it('retorna a mesma instancia do gsap em chamadas subsequentes', async () => {
    const { gsap } = await import('gsap');
    const { carregarGsap } = await import('./gsap');

    const primeira = carregarGsap();
    const segunda = carregarGsap();

    expect(primeira).toBe(gsap);
    expect(segunda).toBe(gsap);
  });
});
