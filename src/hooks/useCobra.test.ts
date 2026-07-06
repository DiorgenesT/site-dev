import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { RefObject } from 'react';
import { useCobra } from './useCobra';

function criarRef(): RefObject<HTMLElement | null> {
  return { current: document.createElement('div') };
}

describe('useCobra', () => {
  it('nasce com fatorDocking=1 sob prefers-reduced-motion (fallback estatico funcional)', () => {
    // O stub global de matchMedia em src/testes/configurar.ts retorna matches:true
    // por padrao, simulando reduced-motion sempre ligado no ambiente de teste.
    // Isso reproduz exatamente o bug corrigido: sem essa asserção, fatorDocking
    // ficaria preso em 0 e o CamadaCobra deixaria o botao real de CTA invisivel.
    const refInicio = criarRef();
    const refFim = criarRef();
    const refJornada = criarRef();

    const { result } = renderHook(() => useCobra({ refInicio, refFim, refJornada }));

    expect(result.current.fatorDocking).toBe(1);
  });
});
