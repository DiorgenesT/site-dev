import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renderiza a identidade do Hero', () => {
    render(<App />);
    expect(screen.getByLabelText('DG')).toBeInTheDocument();
    expect(screen.getByText('Python & AI Engineer')).toBeInTheDocument();
  });

  it('renderiza o CTA real do Hero', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Ver projetos' })).toBeInTheDocument();
  });

  it('renderiza o CTA real do Contato', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: 'Fale comigo' })).toBeInTheDocument();
  });

  it('renderiza as 6 secoes na ordem esperada', () => {
    render(<App />);
    const secoes = document.querySelectorAll('section');
    const ids = Array.from(secoes).map((secao) => secao.id);
    expect(ids).toEqual(['hero', 'sobre', 'stack', 'projetos', 'labia', 'contato']);
  });
});
