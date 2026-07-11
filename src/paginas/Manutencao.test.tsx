import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Manutencao from './Manutencao';

describe('Manutencao', () => {
  it('renderiza a identidade e a mensagem de site em producao', () => {
    render(<Manutencao />);
    expect(screen.getByLabelText('DG')).toBeInTheDocument();
    expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
    expect(screen.getByText('Site em construção, páginas novas em breve')).toBeInTheDocument();
    expect(screen.getByText('EM BREVE')).toBeInTheDocument();
  });
});
