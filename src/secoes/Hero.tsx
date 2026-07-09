import type { RefObject } from 'react';
import { NotaDeResgate } from '../componentes/NotaDeResgate';
import { FitaAdesiva } from '../componentes/FitaAdesiva';

interface HeroProps {
  refSecao: RefObject<HTMLElement>;
  refBotao: RefObject<HTMLButtonElement>;
}

export function Hero({ refSecao, refBotao }: HeroProps) {
  // Import dinamico: rolarAte arrasta GSAP/Lenis (lib/movimento). Um import
  // estatico aqui forcaria esse peso pro mesmo chunk de App.tsx, violando o
  // contrato de chunk lazy apos first paint (o clique so acontece depois).
  async function aoClicarVerProjetos(): Promise<void> {
    const alvo = document.getElementById('projetos');
    if (!alvo) {
      return;
    }
    const { rolarAte } = await import('../lib/movimento');
    rolarAte(alvo);
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
        onClick={() => void aoClicarVerProjetos()}
        className="bg-vermelho-punk text-branco-papel px-6 py-3 font-stencil uppercase tracking-widest"
      >
        Ver projetos
      </button>
    </section>
  );
}
