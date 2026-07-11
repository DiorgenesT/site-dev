import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';
import { obterRotacao } from '../estilos/tokens';

describe('Hero', () => {
  it('renderiza a identidade, a tag e o CTA real, sempre visivel e focavel', () => {
    render(<Hero />);

    expect(screen.getByLabelText('DG')).toBeInTheDocument();
    expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();

    const botao = screen.getByRole('button', { name: 'Ver projetos' });
    expect(botao).toBeInTheDocument();
    expect(botao).not.toHaveClass('opacity-0');
  });

  it('nao usa mais o sistema de colagem por scroll (nenhum data-colagem)', () => {
    const { container } = render(<Hero />);

    expect(container.querySelectorAll('[data-colagem]')).toHaveLength(0);
  });

  it('anima a entrada do DG em camadas, com a maior intensidade e sem atraso', () => {
    render(<Hero />);

    const wrapper = screen.getByLabelText('DG').closest<HTMLElement>('.entrada-camada');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.style.getPropertyValue('--entrada-escala')).toBe('2.4');
    expect(wrapper?.style.getPropertyValue('--entrada-rotacao')).toBe('26deg');
    expect(wrapper?.style.getPropertyValue('--entrada-y')).toBe('-36px');
    expect(wrapper?.style.getPropertyValue('--entrada-blur')).toBe('8px');
    expect(wrapper?.style.getPropertyValue('--entrada-duracao')).toBe('0.65s');
    expect(wrapper?.style.getPropertyValue('--entrada-atraso')).toBe('0s');
  });

  it('atrasa a entrada do subtitulo e da descricao em sequencia', () => {
    render(<Hero />);

    const subtitulo = screen
      .getByText('Full Stack Developer')
      .closest<HTMLElement>('.entrada-camada');
    const descricao = screen
      .getByText('Engenharia de software aplicada à IA')
      .closest<HTMLElement>('.entrada-camada');

    expect(subtitulo?.style.getPropertyValue('--entrada-atraso')).toBe('0.14s');
    expect(descricao?.style.getPropertyValue('--entrada-atraso')).toBe('0.26s');
  });

  it('atrasa a entrada do CTA e preserva a rotacao de repouso do token no botao interno', () => {
    render(<Hero />);

    const botao = screen.getByRole('button', { name: 'Ver projetos' });
    const wrapper = botao.closest<HTMLElement>('.entrada-camada');

    expect(wrapper).not.toBeNull();
    expect(wrapper?.style.getPropertyValue('--entrada-atraso')).toBe('0.38s');
    expect(botao).not.toHaveClass('entrada-camada');
    expect(botao.getAttribute('style')).toContain(`rotate(${obterRotacao(4)}deg)`);
  });
});
