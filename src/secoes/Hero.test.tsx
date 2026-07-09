import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';

describe('Hero', () => {
  it('renderiza a identidade, a tag e o CTA real, sempre visivel e focavel', () => {
    render(<Hero />);

    expect(screen.getByLabelText('DG')).toBeInTheDocument();
    expect(screen.getByText('Python & AI Engineer')).toBeInTheDocument();

    const botao = screen.getByRole('button', { name: 'Ver projetos' });
    expect(botao).toBeInTheDocument();
    expect(botao).not.toHaveClass('opacity-0');
  });
});
