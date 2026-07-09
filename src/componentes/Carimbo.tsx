import type { ReactNode } from 'react';
import { obterRotacao } from '../estilos/tokens';

interface CarimboProps {
  indice: number;
  children: ReactNode;
}

export function Carimbo({ indice, children }: CarimboProps) {
  const rotacao = obterRotacao(indice);

  return (
    <span
      className="inline-block border-2 border-vermelho-punk text-vermelho-punk uppercase tracking-widest px-2 py-0.5"
      style={{ transform: `rotate(${rotacao}deg)` }}
    >
      {children}
    </span>
  );
}
