import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Projetos } from './Projetos';

describe('Projetos', () => {
  it('renderiza os 4 projetos reais, o Tudo Em Dia com link externo', () => {
    render(<Projetos />);

    expect(screen.getByText('Tudo Em Dia')).toBeInTheDocument();
    expect(screen.getByText('Sistema de Ponto')).toBeInTheDocument();
    expect(screen.getByText('Controle de Ponto')).toBeInTheDocument();
    expect(screen.getByText('ingestao-async')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'Ver projeto' });
    expect(link).toHaveAttribute('href', 'https://tatudoemdia.com.br/');
  });
});
