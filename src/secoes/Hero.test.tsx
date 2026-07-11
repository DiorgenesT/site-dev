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

  it('a secao vira container relativo pra ancorar a moldura decorativa', () => {
    const { container } = render(<Hero />);
    const secao = container.querySelector('#hero');
    expect(secao?.className).toContain('relative');
  });

  it('mostra a marca de edicao e o selo de data/local, decorativos e so visiveis em telas largas', () => {
    render(<Hero />);

    const marcaEdicao = screen.getByText('Edição Nº 01');
    expect(marcaEdicao.closest('[aria-hidden="true"]')).toHaveClass('hidden', 'lg:block');

    const selo = screen.getByText('Betim, 2026');
    expect(selo.closest('[aria-hidden="true"]')).toHaveClass('hidden', 'lg:block');
  });

  it('mostra a lombada de texto vertical, decorativa e so visivel em telas largas', () => {
    render(<Hero />);

    const lombada = screen.getByText('diorgenesgeorge.dev');
    expect(lombada.closest('[aria-hidden="true"]')).toHaveClass('hidden', 'lg:block');
    expect(lombada.getAttribute('style')).toContain('rotate(90deg)');
  });

  it('a tira de fita do canto e puramente decorativa e so visivel em telas largas', () => {
    render(<Hero />);

    const fita = screen.getByTestId('hero-fita-canto');
    expect(fita.closest('[aria-hidden="true"]')).toHaveClass('hidden', 'lg:block');
  });

  it('anima a moldura decorativa depois que o conteudo principal ja assentou', () => {
    render(<Hero />);

    const marcaEdicao = screen.getByText('Edição Nº 01').closest<HTMLElement>('.entrada-camada');
    const selo = screen.getByText('Betim, 2026').closest<HTMLElement>('.entrada-camada');
    const fita = screen.getByTestId('hero-fita-canto').closest<HTMLElement>('.entrada-camada');
    const lombada = screen.getByText('diorgenesgeorge.dev').closest<HTMLElement>('.entrada-camada');

    expect(marcaEdicao?.style.getPropertyValue('--entrada-atraso')).toBe('0.5s');
    expect(selo?.style.getPropertyValue('--entrada-atraso')).toBe('0.58s');
    expect(fita?.style.getPropertyValue('--entrada-atraso')).toBe('0.66s');
    expect(lombada?.style.getPropertyValue('--entrada-atraso')).toBe('0.74s');
  });

  it('a marca de edicao e o selo mantem rotacao de repouso fixa, separada da animacao de entrada', () => {
    render(<Hero />);

    expect(screen.getByText('Edição Nº 01').getAttribute('style')).toContain('rotate(-3deg)');
    expect(screen.getByText('Betim, 2026').getAttribute('style')).toContain('rotate(2.5deg)');
  });
});
