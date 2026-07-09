import type { ReactNode } from 'react';
import { obterRotacao } from '../estilos/tokens';

interface FitaAdesivaProps {
  indice: number;
  children: ReactNode;
}

export function FitaAdesiva({ indice, children }: FitaAdesivaProps) {
  const rotacao = obterRotacao(indice);

  return (
    <div
      className="inline-block bg-amarelo-fita text-preto-tinta px-4 py-1 font-manuscrita opacity-90"
      style={{ transform: `rotate(${rotacao}deg)` }}
    >
      {children}
    </div>
  );
}
