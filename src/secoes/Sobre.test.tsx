import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sobre } from './Sobre';

describe('Sobre', () => {
  it('renderiza a trajetoria profissional e a formacao', () => {
    render(<Sobre />);

    expect(screen.getByText(/Expresso Truck/)).toBeInTheDocument();
    expect(screen.getByText(/Fundação Beta/)).toBeInTheDocument();
    expect(screen.getByText(/UniCesumar/)).toBeInTheDocument();
  });
});
