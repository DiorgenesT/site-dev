import type { CSSProperties } from 'react';
import { NotaDeResgate } from '../componentes/NotaDeResgate';
import { FitaAdesiva } from '../componentes/FitaAdesiva';
import { Adesivo } from '../componentes/Adesivo';
import { obterRotacao } from '../estilos/tokens';

type EntradaCamadaVars = CSSProperties & Record<`--entrada-${string}`, string | number>;

function aoClicarVerProjetos(): void {
  const alvo = document.getElementById('projetos');
  if (!alvo) {
    return;
  }
  const prefereReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  alvo.scrollIntoView({ behavior: prefereReduzido ? 'auto' : 'smooth' });
}

const entradaDg: EntradaCamadaVars = {
  '--entrada-escala': 2.4,
  '--entrada-rotacao': '26deg',
  '--entrada-y': '-36px',
  '--entrada-blur': '8px',
  '--entrada-duracao': '0.65s',
  '--entrada-atraso': '0s',
};

const entradaSubtitulo: EntradaCamadaVars = {
  '--entrada-escala': 1.8,
  '--entrada-rotacao': '18deg',
  '--entrada-y': '-24px',
  '--entrada-blur': '5px',
  '--entrada-duracao': '0.55s',
  '--entrada-atraso': '0.14s',
};

const entradaDescricao: EntradaCamadaVars = {
  '--entrada-escala': 1.6,
  '--entrada-rotacao': '14deg',
  '--entrada-y': '-20px',
  '--entrada-blur': '4px',
  '--entrada-duracao': '0.5s',
  '--entrada-atraso': '0.26s',
};

const entradaCta: EntradaCamadaVars = {
  '--entrada-escala': 1.5,
  '--entrada-rotacao': '12deg',
  '--entrada-y': '-16px',
  '--entrada-blur': '3px',
  '--entrada-duracao': '0.5s',
  '--entrada-atraso': '0.38s',
};

export function Hero() {
  return (
    <section id="hero" className="flex flex-col items-center gap-6 px-8 py-24 md:py-32 text-center">
      <div className="entrada-camada text-5xl md:text-7xl" style={entradaDg}>
        <NotaDeResgate texto="DG" />
      </div>
      <div className="entrada-camada text-xl md:text-2xl" style={entradaSubtitulo}>
        <FitaAdesiva indice={1}>Full Stack Developer</FitaAdesiva>
      </div>
      <div className="entrada-camada text-lg md:text-xl max-w-md" style={entradaDescricao}>
        <Adesivo indice={0}>Engenharia de software aplicada à IA</Adesivo>
      </div>
      <div className="entrada-camada" style={entradaCta}>
        <button
          type="button"
          onClick={aoClicarVerProjetos}
          className="inline-block border-2 border-vermelho-punk text-vermelho-punk uppercase tracking-widest px-2 py-0.5 font-bold"
          style={{ transform: `rotate(${obterRotacao(4)}deg)` }}
        >
          Ver projetos
        </button>
      </div>
    </section>
  );
}
