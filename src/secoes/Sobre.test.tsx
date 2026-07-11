import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sobre } from './Sobre';
import { obterRotacao } from '../estilos/tokens';

describe('Sobre', () => {
  it('renderiza a trajetoria profissional e a formacao', () => {
    render(<Sobre />);

    expect(screen.getByText(/Expresso Truck/)).toBeInTheDocument();
    expect(screen.getByText(/Fundação Beta/)).toBeInTheDocument();
    expect(screen.getByText(/UniCesumar/)).toBeInTheDocument();
  });

  it('usa a foto real, nitida, com alt descritivo', () => {
    render(<Sobre />);

    const foto = screen.getByAltText('Foto de Diorgenes George, trabalhando em um notebook');
    expect(foto).toBeInTheDocument();
    expect(foto).toHaveAttribute('src', '/image/foto-sobre.webp');
  });

  it('emoldura a foto com PapelRasgado no topo e na base', () => {
    const { container } = render(<Sobre />);

    const rasgos = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(rasgos).toHaveLength(2);
  });

  it('mostra a fita decorativa do canto, puramente decorativa', () => {
    render(<Sobre />);

    const fita = screen.getByTestId('sobre-fita-canto');
    expect(fita).toHaveAttribute('aria-hidden', 'true');
  });

  it('o quadro da foto participa da colagem por scroll com rotacao fixa de token', () => {
    render(<Sobre />);

    const foto = screen.getByAltText('Foto de Diorgenes George, trabalhando em um notebook');
    const quadro = foto.closest('[data-colagem]');
    expect(quadro).not.toBeNull();
    expect(quadro?.getAttribute('style')).toContain(`rotate(${obterRotacao(4)}deg)`);
  });
});
