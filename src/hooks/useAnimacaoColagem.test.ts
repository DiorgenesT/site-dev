import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createRef } from 'react';
import { useAnimacaoColagem } from './useAnimacaoColagem';

describe('useAnimacaoColagem', () => {
  it('nao lanca erro quando o container ainda nao foi montado', () => {
    const ref = createRef<HTMLDivElement>();
    expect(() => {
      const { unmount } = renderHook(() => useAnimacaoColagem(ref));
      unmount();
    }).not.toThrow();
  });

  it('nao lanca erro sob prefers-reduced-motion (padrao do ambiente de teste) mesmo com elementos marcados', () => {
    const container = document.createElement('div');
    const item = document.createElement('span');
    item.setAttribute('data-colagem', '');
    container.appendChild(item);
    const ref = createRef<HTMLDivElement>();
    Object.defineProperty(ref, 'current', { value: container, writable: true });

    expect(() => {
      const { unmount } = renderHook(() => useAnimacaoColagem(ref));
      unmount();
    }).not.toThrow();
  });
});
