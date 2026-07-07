import type { RefObject } from 'react';
import { NotaDeResgate } from '../componentes/NotaDeResgate';
import { FitaAdesiva } from '../componentes/FitaAdesiva';
import { rolarAte } from '../lib/movimento';

interface HeroProps {
  refSecao: RefObject<HTMLElement>;
  refBotao: RefObject<HTMLButtonElement>;
}

export function Hero({ refSecao, refBotao }: HeroProps) {
  function aoClicarVerProjetos(): void {
    const alvo = document.getElementById('projetos');
    if (alvo) {
      rolarAte(alvo);
    }
  }

  return (
    <section
      ref={refSecao}
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center text-center gap-6 p-8"
    >
      <NotaDeResgate texto="DG" />
      <FitaAdesiva indice={1}>Python & AI Engineer</FitaAdesiva>
      <button
        ref={refBotao}
        type="button"
        onClick={aoClicarVerProjetos}
        className="bg-vermelho-punk text-branco-papel px-6 py-3 font-bold uppercase tracking-widest"
      >
        Ver projetos
      </button>
    </section>
  );
}
