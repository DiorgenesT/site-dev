import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Carimbo } from './Carimbo';

describe('Carimbo', () => {
  it('renderiza o texto do carimbo', () => {
    render(<Carimbo indice={4}>04.07.2026</Carimbo>);
    expect(screen.getByText('04.07.2026')).toBeInTheDocument();
  });

  it('usa cor vermelho punk como texto (par de contraste validado)', () => {
    render(<Carimbo indice={4}>04.07.2026</Carimbo>);
    expect(screen.getByText('04.07.2026').className).toContain('text-vermelho-punk');
  });
});
