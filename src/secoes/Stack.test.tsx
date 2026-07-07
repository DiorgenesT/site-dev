import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Stack } from './Stack';

function criarRefSecao() {
  return createRef<HTMLElement>();
}

describe('Stack', () => {
  it('renderiza a lista de tecnologias como mural de adesivos', () => {
    render(<Stack refSecao={criarRefSecao()} />);

    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('FastAPI')).toBeInTheDocument();
    expect(screen.getByText('LangChain')).toBeInTheDocument();
    expect(screen.getByText('RAG')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });
});
