import { useRef } from 'react';
import { Adesivo } from '../componentes/Adesivo';
import { FitaAdesiva } from '../componentes/FitaAdesiva';
import { useAnimacaoColagem } from '../hooks/useAnimacaoColagem';

const TECNOLOGIAS = [
  'Python',
  'FastAPI',
  'LangChain',
  'LangGraph',
  'RAG',
  'ChromaDB',
  'Pinecone',
  'OpenAI API',
  'Claude API',
  'Docker',
  'PostgreSQL',
  'React',
  'TypeScript',
] as const;

export function Stack() {
  const refSecao = useRef<HTMLElement>(null);
  useAnimacaoColagem(refSecao);

  return (
    <section
      ref={refSecao}
      id="stack"
      className="flex flex-col items-center gap-8 px-8 py-16 md:py-24"
    >
      <h2 data-colagem>
        <FitaAdesiva indice={4}>Stack</FitaAdesiva>
      </h2>
      <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
        {TECNOLOGIAS.map((tecnologia, indice) => (
          <span key={tecnologia} data-colagem>
            <Adesivo indice={indice}>{tecnologia}</Adesivo>
          </span>
        ))}
      </div>
    </section>
  );
}
