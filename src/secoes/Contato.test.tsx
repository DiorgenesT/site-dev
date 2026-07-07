import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Contato } from './Contato';

function criarRefSecao() {
  return createRef<HTMLElement>();
}

function criarRefBotao() {
  return createRef<HTMLAnchorElement>();
}

describe('Contato', () => {
  it('renderiza o CTA real do WhatsApp, sempre visivel e focavel', () => {
    render(<Contato refSecao={criarRefSecao()} refBotao={criarRefBotao()} />);

    const link = screen.getByRole('link', { name: 'Fale comigo' });
    expect(link).toBeInTheDocument();
    expect(link).not.toHaveClass('opacity-0');
    expect(link).toHaveAttribute('href', expect.stringContaining('wa.me/5531991519864'));
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
