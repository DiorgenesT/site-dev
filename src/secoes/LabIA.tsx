export function LabIA() {
  return (
    <section id="labia" className="min-h-screen flex flex-col md:flex-row items-center gap-8 p-8">
      <div className="flex-1 text-lg leading-relaxed">
        <h2 className="text-2xl mb-4">LabIA</h2>
        <p>
          Na Monumental Assistência 24hrs, automatizei operações de atendimento usando LLMs
          (LangChain, LangGraph, RAG) e dashboards, reduzindo em 35% o tempo de atendimento. Esse
          trabalho é institucional e não tem código público, mas o fluxo geral segue o padrão ao
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
