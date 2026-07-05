import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PapelRasgado } from './PapelRasgado';

describe('PapelRasgado', () => {
  it('renderiza um svg de borda rasgada inline', () => {
    const { container } = render(<PapelRasgado />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('e decorativo, com aria-hidden true', () => {
    const { container } = render(<PapelRasgado />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
