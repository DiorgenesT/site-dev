import type { RefObject } from 'react';
import { Adesivo } from '../componentes/Adesivo';

interface StackProps {
  refSecao: RefObject<HTMLElement>;
}

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

export function Stack({ refSecao }: StackProps) {
  return (
    <section
      ref={refSecao}
      id="stack"
      className="min-h-screen flex flex-col items-center justify-center gap-8 p-8"
    >
      <h2 className="text-2xl font-stencil">Stack</h2>
      <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
        {TECNOLOGIAS.map((tecnologia, indice) => (
          <Adesivo key={tecnologia} indice={indice}>
            {tecnologia}
          </Adesivo>
        ))}
      </div>
    </section>
  );
}
