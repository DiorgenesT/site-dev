import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FitaAdesiva } from './FitaAdesiva';

describe('FitaAdesiva', () => {
  it('renderiza o conteudo filho', () => {
    render(<FitaAdesiva indice={1}>Backend</FitaAdesiva>);
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('usa cor de fundo amarelo fita com texto preto (par de contraste validado)', () => {
    render(<FitaAdesiva indice={1}>Backend</FitaAdesiva>);
    const elemento = screen.getByText('Backend').closest('div');
    expect(elemento?.className).toContain('bg-amarelo-fita');
    expect(elemento?.className).toContain('text-preto-tinta');
  });
});
