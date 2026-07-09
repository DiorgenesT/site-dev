import type { RefObject } from 'react';

interface LabIAProps {
  refSecao: RefObject<HTMLElement>;
}

export function LabIA({ refSecao }: LabIAProps) {
  return (
    <section
      ref={refSecao}
      id="labia"
      className="min-h-screen flex flex-col md:flex-row items-center gap-8 p-8"
    >
      <div className="flex-1 text-lg leading-relaxed">
        <h2 className="text-2xl font-stencil mb-4">LabIA</h2>
        <p>
          Na Monumental Assistencia 24hrs, automatizei operacoes de atendimento usando LLMs
          (LangChain, LangGraph, RAG) e dashboards, reduzindo em 35% o tempo de atendimento. Esse
          trabalho e institucional e nao tem codigo publico, mas o fluxo geral segue o padrao ao
          lado.
        </p>
      </div>
      <div className="flex-1 border-2 border-dashed border-preto-tinta p-6 text-sm text-center">
        Entrada do atendimento, RAG sobre base de conhecimento, LLM gera resposta, dashboard de
        acompanhamento
      </div>
    </section>
  );
}
