import { NotaDeResgate } from '../componentes/NotaDeResgate';
import { FitaAdesiva } from '../componentes/FitaAdesiva';
import { Adesivo } from '../componentes/Adesivo';

function aoClicarVerProjetos(): void {
  const alvo = document.getElementById('projetos');
  if (!alvo) {
    return;
  }
  const prefereReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  alvo.scrollIntoView({ behavior: prefereReduzido ? 'auto' : 'smooth' });
}

export function Hero() {
  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center text-center gap-6 p-8"
    >
      <div className="text-5xl md:text-7xl">
        <NotaDeResgate texto="DG" />
      </div>
      <div className="text-xl md:text-2xl">
        <FitaAdesiva indice={1}>Python & AI Engineer</FitaAdesiva>
      </div>
      <div className="text-lg md:text-xl max-w-md">
        <Adesivo indice={0}>Sem clichê de portfólio dev</Adesivo>
      </div>
      <button
        type="button"
        onClick={aoClicarVerProjetos}
        className="border-2 border-vermelho-punk text-vermelho-punk px-6 py-3 uppercase tracking-widest"
      >
        Ver projetos
      </button>
    </section>
  );
}
