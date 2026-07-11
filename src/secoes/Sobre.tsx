import { useRef } from 'react';
import { FitaAdesiva } from '../componentes/FitaAdesiva';
import { Adesivo } from '../componentes/Adesivo';
import { useAnimacaoColagem } from '../hooks/useAnimacaoColagem';

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
            className="relative w-56 sm:w-64 aspect-[3/4] overflow-hidden shadow-lg"
            data-colagem
          >
            <img
              src="/image/foto-preta-branca.webp"
              alt="Foto de Diorgenes George, ilustrada em preto e branco no estilo do site"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
