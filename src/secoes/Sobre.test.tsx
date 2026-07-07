import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Sobre } from './Sobre';

function criarRefSecao() {
  return createRef<HTMLElement>();
}

describe('Sobre', () => {
  it('renderiza a trajetoria profissional e a formacao', () => {
    render(<Sobre refSecao={criarRefSecao()} />);

    expect(screen.getByText(/Expresso Truck/)).toBeInTheDocument();
    expect(screen.getByText(/Fundacao Beta/)).toBeInTheDocument();
    expect(screen.getByText(/UniCesumar/)).toBeInTheDocument();
  });
});
