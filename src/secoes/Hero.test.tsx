import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Hero } from './Hero';

function criarRefSecao() {
  return createRef<HTMLElement>();
}

function criarRefBotao() {
  return createRef<HTMLButtonElement>();
}

describe('Hero', () => {
  it('renderiza a identidade, a tag e o CTA real, sempre visivel e focavel', () => {
    render(<Hero refSecao={criarRefSecao()} refBotao={criarRefBotao()} />);

    expect(screen.getByLabelText('DG')).toBeInTheDocument();
    expect(screen.getByText('Python & AI Engineer')).toBeInTheDocument();

    const botao = screen.getByRole('button', { name: 'Ver projetos' });
    expect(botao).toBeInTheDocument();
    expect(botao).not.toHaveClass('opacity-0');
  });
});
