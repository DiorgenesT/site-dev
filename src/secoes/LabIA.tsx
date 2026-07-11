import { useRef } from 'react';
import { FitaAdesiva } from '../componentes/FitaAdesiva';
import { Adesivo } from '../componentes/Adesivo';
import { useAnimacaoColagem } from '../hooks/useAnimacaoColagem';

const ETAPAS = [
  'Entrada do atendimento',
  'RAG na base de conhecimento',
  'LLM gera resposta',
  'Dashboard de acompanhamento',
] as const;

export function LabIA() {
  const refSecao = useRef<HTMLElement>(null);
  useAnimacaoColagem(refSecao);

  return (
    <section ref={refSecao} id="labia" className="px-8 py-16 md:py-24">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 text-lg leading-relaxed">
          <h2 className="mb-4" data-colagem>
            <FitaAdesiva indice={3}>LabIA</FitaAdesiva>
          </h2>
          <p>
            Na Monumental Assistência 24hrs, automatizei operações de atendimento usando LLMs
            (LangChain, LangGraph, RAG) e dashboards, reduzindo em 35% o tempo de atendimento. Esse
            trabalho é institucional e não tem código público, mas o fluxo geral segue o padrão ao
            lado.
          </p>
        </div>
        <div className="flex-1 border-2 border-dashed border-preto-tinta p-6">
          <ol className="flex flex-col items-center gap-2">
            {ETAPAS.map((etapa, indice) => (
              <li key={etapa} className="flex flex-col items-center gap-2" data-colagem>
                <Adesivo indice={indice}>{etapa}</Adesivo>
                {indice < ETAPAS.length - 1 ? (
                  <span aria-hidden="true" className="text-xl font-bold text-vermelho-punk">
                    ↓
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
