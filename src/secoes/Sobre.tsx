import { useRef } from 'react';
import { FitaAdesiva } from '../componentes/FitaAdesiva';
import { Adesivo } from '../componentes/Adesivo';
import { PapelRasgado } from '../componentes/PapelRasgado';
import { useAnimacaoColagem } from '../hooks/useAnimacaoColagem';
import { obterRotacao } from '../estilos/tokens';

const ROTACAO_FITA_FOTO = -18;

export function Sobre() {
  const refConteudo = useRef<HTMLDivElement>(null);
  useAnimacaoColagem(refConteudo);

  return (
    <section id="sobre" className="py-16 md:py-24 px-8">
      <div
        ref={refConteudo}
        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
      >
        <div className="text-lg leading-[1.75]">
          <h2 className="mb-6" data-colagem>
            <FitaAdesiva indice={2}>Sobre</FitaAdesiva>
          </h2>
          <p>
            Comecei na linha de frente do atendimento, na Expresso Truck e na Monumental
            Assistência 24hrs. Foi lá que virei{' '}
            <Adesivo indice={8}>desenvolvedor Python</Adesivo>: automatizei operações com LLMs e
            dashboards, cortando 35% do tempo de atendimento. Hoje sou{' '}
            <Adesivo indice={5}>Analista Sênior</Adesivo> e{' '}
            <Adesivo indice={8}>Desenvolvedor de Software</Adesivo> na Fundação Beta, o centro de
            inovação e transformação digital da Prefeitura de Betim.
          </p>
          <p className="mt-4">
            <Adesivo indice={2}>Pós-Graduação</Adesivo> em Sistemas com Python (UniCesumar) e{' '}
            <Adesivo indice={9}>Bacharelado</Adesivo> em Ciência da Computação (Cruzeiro do Sul).
          </p>
        </div>
        <div className="flex justify-center">
          <div
            data-colagem
            className="relative w-56 sm:w-64"
            style={{ transform: `rotate(${obterRotacao(4)}deg)` }}
          >
            <PapelRasgado className="w-full h-3 text-branco-papel" />
            <span
              aria-hidden="true"
              data-testid="sobre-fita-canto"
              className="absolute -top-2 -left-5 z-10 block w-28 h-5 bg-amarelo-fita opacity-90"
              style={{ transform: `rotate(${ROTACAO_FITA_FOTO}deg)` }}
            />
            <div className="relative aspect-[3/4] overflow-hidden shadow-lg">
              <img
                src="/image/foto-sobre.webp"
                alt="Foto de Diorgenes George, trabalhando em um notebook"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <PapelRasgado className="w-full h-3 text-branco-papel rotate-180" />
          </div>
        </div>
      </div>
    </section>
  );
}
