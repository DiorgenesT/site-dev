import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { IconeWhatsApp, IconeInstagram, IconeLinkedIn, IconeGitHub } from './IconesRedesSociais';

describe('IconesRedesSociais', () => {
  it.each([
    ['WhatsApp', IconeWhatsApp],
    ['Instagram', IconeInstagram],
    ['LinkedIn', IconeLinkedIn],
    ['GitHub', IconeGitHub],
  ])('%s renderiza um svg decorativo com aria-hidden true', (_nome, Icone) => {
    const { container } = render(<Icone />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
