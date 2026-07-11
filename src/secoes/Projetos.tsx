import { useRef } from 'react';
import { FitaAdesiva } from '../componentes/FitaAdesiva';
import { Adesivo } from '../componentes/Adesivo';
import { obterRotacao } from '../estilos/tokens';
import { useAnimacaoColagem } from '../hooks/useAnimacaoColagem';

interface Projeto {
  nome: string;
  descricao: string;
  stack: string;
  link?: string;
}

const PROJETOS: readonly Projeto[] = [
  {
    nome: 'Tudo Em Dia',
    descricao: 'SaaS de finanças pessoais com assistente de IA por voz, no ar em produção.',
    stack: 'Next.js, TypeScript',
    link: 'https://tatudoemdia.com.br/',
  },
  {
    nome: 'Sistema de Ponto',
    descricao:
      'Ponto eletrônico com reconhecimento facial e banco de horas, conforme Portaria 671/2021 e LGPD.',
    stack: 'Python',
  },
  {
    nome: 'Controle de Ponto',
    descricao:
      'Sistema sob demanda para cliente real, substituindo planilha manual por autenticação JWT/bcrypt e geração de folha de ponto em PDF.',
    stack: 'TypeScript',
  },
  {
    nome: 'ingestao-async',
    descricao:
      'API assíncrona de ingestão de dados públicos: fila Postgres, worker em background e dashboard React.',
    stack: 'Python, FastAPI, React',
  },
];

export function Projetos() {
  const refSecao = useRef<HTMLElement>(null);
  useAnimacaoColagem(refSecao);

  return (
    <section
      ref={refSecao}
      id="projetos"
      className="flex flex-col items-center gap-8 px-8 py-16 md:py-24"
    >
      <h2 data-colagem>
        <FitaAdesiva indice={4}>Projetos</FitaAdesiva>
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 max-w-4xl">
        {PROJETOS.map((projeto, indice) => (
          <article
            key={projeto.nome}
            data-colagem
            className="border-2 border-preto-tinta bg-branco-papel p-4"
            style={{ transform: `rotate(${obterRotacao(indice)}deg)` }}
          >
            <h3 className="text-lg">
              <Adesivo indice={indice}>{projeto.nome}</Adesivo>
            </h3>
            <p className="mt-3 text-sm">{projeto.descricao}</p>
            <div className="mt-3 text-xs">
              <FitaAdesiva indice={indice + 4}>{projeto.stack}</FitaAdesiva>
            </div>
            {projeto.link ? (
              <a
                href={projeto.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block border-2 border-vermelho-punk px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-vermelho-punk"
                style={{ transform: `rotate(${obterRotacao(indice + 8)}deg)` }}
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
