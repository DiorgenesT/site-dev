import type { CSSProperties, ReactNode } from 'react';
import { obterRotacao } from '../estilos/tokens';

interface AdesivoProps {
  indice: number;
  children: ReactNode;
}

export function Adesivo({ indice, children }: AdesivoProps) {
  const rotacao = obterRotacao(indice);

  const estilo = {
    '--rotacao': `${rotacao}deg`,
    transform: 'rotate(var(--rotacao))',
  } as CSSProperties;

  return (
    <span className="inline-block bg-branco-papel px-3 py-1 shadow-md" style={estilo}>
      {children}
    </span>
  );
}
