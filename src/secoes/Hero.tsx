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

const entradaMarcaEdicao: EntradaCamadaVars = {
  '--entrada-escala': 1.4,
  '--entrada-rotacao': '10deg',
  '--entrada-y': '-12px',
  '--entrada-blur': '3px',
  '--entrada-duracao': '0.45s',
  '--entrada-atraso': '0.5s',
};

const entradaSeloData: EntradaCamadaVars = {
  '--entrada-escala': 1.4,
  '--entrada-rotacao': '-10deg',
  '--entrada-y': '-12px',
  '--entrada-blur': '3px',
  '--entrada-duracao': '0.45s',
  '--entrada-atraso': '0.58s',
};

const entradaFitaCanto: EntradaCamadaVars = {
  '--entrada-escala': 1.3,
  '--entrada-rotacao': '-8deg',
  '--entrada-y': '10px',
  '--entrada-blur': '2px',
  '--entrada-duracao': '0.4s',
  '--entrada-atraso': '0.66s',
};

const entradaLombada: EntradaCamadaVars = {
  '--entrada-escala': 1.3,
  '--entrada-rotacao': '8deg',
  '--entrada-y': '8px',
  '--entrada-blur': '2px',
  '--entrada-duracao': '0.4s',
  '--entrada-atraso': '0.74s',
};

const ROTACAO_MARCA_EDICAO = -3;
const ROTACAO_SELO_DATA = 2.5;
const ROTACAO_FITA_CANTO = -42;

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex flex-col items-center gap-6 px-8 py-24 md:py-32 text-center"
    >
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

      <div
        aria-hidden="true"
        className="hidden lg:block absolute top-8 left-8 entrada-camada"
        style={entradaMarcaEdicao}
      >
        <span
          className="block text-xs uppercase tracking-widest text-preto-tinta/60 font-bold"
          style={{ transform: `rotate(${ROTACAO_MARCA_EDICAO}deg)` }}
        >
          Edição Nº 01
        </span>
      </div>

      <div
        aria-hidden="true"
        className="hidden lg:block absolute top-8 right-8 entrada-camada"
        style={entradaSeloData}
      >
        <span
          className="block border border-preto-tinta/20 text-xs uppercase tracking-widest px-2 py-1 font-bold"
          style={{ transform: `rotate(${ROTACAO_SELO_DATA}deg)` }}
        >
          Betim, 2026
        </span>
      </div>

      <div
        aria-hidden="true"
        className="hidden lg:block absolute -left-6 bottom-10 entrada-camada"
        style={entradaFitaCanto}
      >
        <span
          data-testid="hero-fita-canto"
          className="block w-28 h-5 bg-amarelo-fita opacity-90"
          style={{ transform: `rotate(${ROTACAO_FITA_CANTO}deg)` }}
        />
      </div>

      <div
        aria-hidden="true"
        className="hidden lg:block absolute right-6 top-1/2 -translate-y-1/2"
      >
        <div className="entrada-camada" style={entradaLombada}>
          <span
            className="block text-xs uppercase tracking-widest font-bold whitespace-nowrap"
            style={{ transform: 'rotate(90deg)' }}
          >
            diorgenesgeorge.dev
          </span>
        </div>
      </div>
    </section>
  );
}
