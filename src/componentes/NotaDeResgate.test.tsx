import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotaDeResgate } from './NotaDeResgate';

describe('NotaDeResgate', () => {
  it('renderiza cada letra da palavra em um recorte proprio', () => {
    render(<NotaDeResgate texto="DG" />);
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('G')).toBeInTheDocument();
  });

  it('mantem o texto completo acessivel para leitor de tela via aria-label', () => {
    render(<NotaDeResgate texto="DG" />);
    expect(screen.getByLabelText('DG')).toBeInTheDocument();
  });

  it('expoe o wrapper com role img e as letras como decorativas', () => {
    render(<NotaDeResgate texto="DG" />);
    const wrapper = screen.getByRole('img', { name: 'DG' });
    expect(wrapper).toBeInTheDocument();
    expect(screen.getByText('D')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('G')).toHaveAttribute('aria-hidden', 'true');
  });

  it('aplica a mesma transformacao para o mesmo indice em renders diferentes', () => {
    const { unmount } = render(<NotaDeResgate texto="DG" />);
    const transformUm = screen.getByText('D').style.transform;
    unmount();
    render(<NotaDeResgate texto="D" />);
    const transformDois = screen.getByText('D').style.transform;
    expect(transformUm).toBe(transformDois);
  });

  it('nao aplica estilo de recorte a espacos em branco', () => {
    render(<NotaDeResgate texto="D G" />);
    const espaco = document.querySelector('[aria-hidden="true"].w-2');
    expect(espaco).toBeInTheDocument();
    expect(espaco).not.toHaveClass('bg-preto-tinta');
  });
});
