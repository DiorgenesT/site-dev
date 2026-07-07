import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { RefObject } from 'react';
import { useCobra } from './useCobra';

function criarRef(): RefObject<HTMLElement | null> {
  return { current: document.createElement('div') };
}

describe('useCobra', () => {
  it('desliga a cobra por completo sob prefers-reduced-motion (fallback estatico funcional)', () => {
    // O stub global de matchMedia em src/testes/configurar.ts retorna matches:true
    // por padrao, simulando reduced-motion sempre ligado no ambiente de teste.
    // Com a correcao de acessibilidade da Fase 2 (spec, secao 3.3), os botoes
    // reais nao dependem mais de fatorDocking/fatorDesmonte para ficarem
    // visiveis - a garantia do fallback agora e so cobraAtiva=false (o desenho
    // da cobra nunca liga), nao mais um valor magico de fator.
    const refsSecoes = [criarRef(), criarRef(), criarRef()];
    const refJornada = criarRef();

    const { result } = renderHook(() => useCobra({ refsSecoes, refJornada }));

    expect(result.current.cobraAtiva).toBe(false);
    expect(result.current.fatorDocking).toBe(0);
    expect(result.current.fatorDesmonte).toBe(0);
  });
});
