import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Adesivo } from './Adesivo';

describe('Adesivo', () => {
  it('renderiza o conteudo filho', () => {
    render(<Adesivo indice={0}>Ola</Adesivo>);
    expect(screen.getByText('Ola')).toBeInTheDocument();
  });

  it('aplica uma rotacao deterministica via style, nunca aleatoria', () => {
    render(<Adesivo indice={2}>Teste</Adesivo>);
    const elemento = screen.getByText('Teste');
    expect(elemento.style.getPropertyValue('--rotacao')).not.toBe('');
  });

  it('renderiza a mesma rotacao para o mesmo indice em renders diferentes', () => {
    const { unmount } = render(<Adesivo indice={5}>A</Adesivo>);
    const rotacaoUm = screen.getByText('A').style.getPropertyValue('--rotacao');
    unmount();
    render(<Adesivo indice={5}>B</Adesivo>);
    const rotacaoDois = screen.getByText('B').style.getPropertyValue('--rotacao');
    expect(rotacaoUm).toBe(rotacaoDois);
  });
});
