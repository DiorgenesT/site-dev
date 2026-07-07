import type { RefObject } from 'react';
import { obterRotacao } from '../estilos/tokens';

interface ProjetosProps {
  refSecao: RefObject<HTMLElement>;
}

interface Projeto {
  nome: string;
  descricao: string;
  stack: string;
  link?: string;
}

const PROJETOS: readonly Projeto[] = [
  {
    nome: 'Tudo Em Dia',
    descricao: 'SaaS de financas pessoais com assistente de IA por voz, no ar em producao.',
    stack: 'Next.js, TypeScript',
    link: 'https://tatudoemdia.com.br/',
  },
  {
    nome: 'Sistema de Ponto',
    descricao:
      'Ponto eletronico com reconhecimento facial e banco de horas, conforme Portaria 671/2021 e LGPD.',
    stack: 'Python',
  },
  {
    nome: 'Controle de Ponto',
    descricao:
      'Sistema sob demanda para cliente real, substituindo planilha manual por autenticacao JWT/bcrypt e geracao de folha de ponto em PDF.',
    stack: 'TypeScript',
  },
  {
    nome: 'ingestao-async',
    descricao:
      'API assincrona de ingestao de dados publicos: fila Postgres, worker em background e dashboard React.',
    stack: 'Python, FastAPI, React',
  },
];

export function Projetos({ refSecao }: ProjetosProps) {
  return (
    <section
      ref={refSecao}
      id="projetos"
      className="min-h-screen flex flex-col items-center justify-center gap-8 p-8"
    >
      <h2 className="text-2xl font-bold">Projetos</h2>
      <div className="grid gap-6 sm:grid-cols-2 max-w-4xl">
        {PROJETOS.map((projeto, indice) => (
          <article
            key={projeto.nome}
            className="border-2 border-preto-tinta bg-branco-papel p-4"
            style={{ transform: `rotate(${obterRotacao(indice)}deg)` }}
          >
            <h3 className="font-bold text-lg">{projeto.nome}</h3>
            <p className="mt-2 text-sm">{projeto.descricao}</p>
            <p className="mt-2 text-xs uppercase tracking-wide">{projeto.stack}</p>
            {projeto.link ? (
              <a
                href={projeto.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block underline"
              >
                Ver projeto
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
