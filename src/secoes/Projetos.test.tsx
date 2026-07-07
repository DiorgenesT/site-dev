import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Projetos } from './Projetos';

function criarRefSecao() {
  return createRef<HTMLElement>();
}

describe('Projetos', () => {
  it('renderiza os 4 projetos reais, o Tudo Em Dia com link externo', () => {
    render(<Projetos refSecao={criarRefSecao()} />);

    expect(screen.getByText('Tudo Em Dia')).toBeInTheDocument();
    expect(screen.getByText('Sistema de Ponto')).toBeInTheDocument();
    expect(screen.getByText('Controle de Ponto')).toBeInTheDocument();
    expect(screen.getByText('ingestao-async')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'Ver projeto' });
    expect(link).toHaveAttribute('href', 'https://tatudoemdia.com.br/');
  });
});
