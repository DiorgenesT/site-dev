import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Contato } from './Contato';

describe('Contato', () => {
  it('renderiza o CTA real do WhatsApp, sempre visivel e focavel', () => {
    render(<Contato />);

    const link = screen.getByRole('link', { name: 'WhatsApp' });
    expect(link).toBeInTheDocument();
    expect(link).not.toHaveClass('opacity-0');
    expect(link).toHaveAttribute('href', expect.stringContaining('wa.me/5531991519864'));
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renderiza os links das redes sociais com nome acessivel', () => {
    render(<Contato />);

    expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
      'href',
      'https://www.instagram.com/diorgenestavares/',
    );
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/diorgenesgeorge/',
    );
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/DiorgenesT',
    );
  });
});
