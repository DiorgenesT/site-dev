import { useRef } from 'react';
import type { ReactNode } from 'react';
import { FitaAdesiva } from '../componentes/FitaAdesiva';
import { PapelRasgado } from '../componentes/PapelRasgado';
import { IconeGitHub } from '../componentes/IconesRedesSociais';
import { obterRotacao } from '../estilos/tokens';
import { useAnimacaoColagem } from '../hooks/useAnimacaoColagem';

interface Projeto {
  nome: string;
  descricao: string;
  stack: readonly string[];
  link?: string;
  linkNoticia?: string;
  linkRepo?: string;
}

const PROJETOS_BETA: readonly Projeto[] = [
  {
    nome: 'Fundação Beta',
    descricao:
      'Site institucional do centro de inovação e tecnologia da Prefeitura de Betim: portfólio de projetos, linha do tempo estratégica e canal de contato com a gestão pública.',
    stack: ['React', 'TypeScript', 'Next.js', 'GSAP', 'Tailwind CSS'],
    link: 'https://fundacaobeta.com.br/',
    linkNoticia:
      'https://www.betim.mg.gov.br/portal/noticias/0/3/14108/com-foco-em-tecnologia-inovacao-e-eficiencia-prefeitura-de-betim-lanca-oficialmente-a-fundacao-beta',
  },
  {
    nome: 'UPA Agora',
    descricao:
      'Plataforma para acompanhamento em tempo real da situação assistencial das Unidades de Pronto Atendimento de Betim: monitora o fluxo de atendimento, o tempo médio de espera e a classificação de risco de cada especialidade.',
    stack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    link: 'https://fundacaobeta.com.br/upaagora',
    linkNoticia:
      'https://www.betim.mg.gov.br/portal/noticias/0/3/15019/betim-lanca-upa-agora-e-integra-servicos-publicos-em-plataforma-digital-com-atendimento-em-tempo-real',
  },
  {
    nome: 'IEGM Betim',
    descricao:
      'Dashboard do Índice de Efetividade da Gestão Municipal, com indicadores públicos de gestão da Prefeitura de Betim.',
    stack: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    link: 'https://iegm.betim.digital/',
  },
  {
    nome: 'Portal do Servidor',
    descricao:
      'Reúne contracheque digital, protocolo eletrônico do RH, agenda oficial e ouvidoria para o funcionalismo municipal de Betim.',
    stack: [
      'Next.js 16.0.3',
      'React',
      'TypeScript',
      'Tailwind',
      'Embla Carousel',
      'Lucide React',
    ],
    link: 'https://servidor.betim.digital/',
    linkNoticia:
      'https://www.betim.mg.gov.br/portal/noticias/0/3/15351/portal-do-servidor-ja-esta-disponivel-e-reune-servicos-e-informacoes-do-funcionalismo-municipal/',
  },
  {
    nome: 'ODS Betim',
    descricao:
      'Painel de transparência dos Objetivos de Desenvolvimento Sustentável: 167 séries históricas, alinhado à Agenda 2030 da ONU.',
    stack: ['React', 'TypeScript', 'Tailwind CSS'],
    link: 'https://ods.betim.digital/',
    linkNoticia:
      'https://www.betim.mg.gov.br/portal/noticias/0/3/15189/prefeitura-de-betim-realiza-a-1-conferencia-municipal-dos-objetivos-de-desenvolvimento-sustentavel-ods-pela-beta-e-amplia-participacao-da-comunidade-nas-decisoes-sobre-o-pais',
  },
] as const;

const PROJETOS_PESSOAIS: readonly Projeto[] = [
  {
    nome: 'Tudo Em Dia',
    descricao: 'SaaS de finanças pessoais com assistente de IA por voz, no ar em produção.',
    stack: ['Next.js', 'TypeScript'],
    link: 'https://tatudoemdia.com.br/',
    linkRepo: 'https://github.com/DiorgenesT/controle-financeiro',
  },
  {
    nome: 'Sistema de Ponto',
    descricao:
      'Ponto eletrônico com reconhecimento facial e banco de horas, conforme Portaria 671/2021 e LGPD.',
    stack: ['Python'],
    linkRepo: 'https://github.com/DiorgenesT/sistema-de-ponto',
  },
  {
    nome: 'Controle de Ponto',
    descricao:
      'Sistema sob demanda para cliente real, substituindo planilha manual por autenticação JWT/bcrypt e geração de folha de ponto em PDF.',
    stack: ['TypeScript'],
    linkRepo: 'https://github.com/DiorgenesT/controle-de-ponto',
  },
  {
    nome: 'ingestao-async',
    descricao:
      'API assíncrona de ingestão de dados públicos: fila Postgres, worker em background e dashboard React.',
    stack: ['Python', 'FastAPI', 'React'],
    linkRepo: 'https://github.com/DiorgenesT/ingestao-async',
  },
] as const;

interface FaixaBrancaProps {
  indice: number;
  className?: string;
  children: ReactNode;
}

function FaixaBranca({ indice, className = '', children }: FaixaBrancaProps) {
  return (
    <span
      className={`inline-block bg-branco-papel px-3 py-1 font-bold shadow-md ${className}`}
      style={{ transform: `rotate(${obterRotacao(indice)}deg)` }}
    >
      {children}
    </span>
  );
}

interface BlocoProjetosProps {
  titulo: string;
  projetos: readonly Projeto[];
  indiceBase: number;
  indiceCarimbo: number;
}

function BlocoProjetos({ titulo, projetos, indiceBase, indiceCarimbo }: BlocoProjetosProps) {
  return (
    <div className="w-full max-w-4xl">
      <h3 className="mb-8 flex justify-center" data-colagem>
        <FaixaBranca indice={indiceCarimbo} className="text-sm uppercase tracking-widest">
          {titulo}
        </FaixaBranca>
      </h3>
      <div className="grid gap-8 sm:grid-cols-2">
        {projetos.map((projeto, indice) => {
          const indiceGlobal = indiceBase + indice;
          return (
            <article
              key={projeto.nome}
              data-colagem
              className="relative border-2 border-preto-tinta bg-branco-papel p-4 shadow-[6px_6px_0_0_var(--color-preto-tinta)]"
              style={{ transform: `rotate(${obterRotacao(indiceGlobal)}deg)` }}
            >
              <div className="pointer-events-none absolute inset-x-2 -top-2 rotate-180 text-preto-tinta">
                <PapelRasgado className="h-3 w-full" />
              </div>
              <h4 className="text-lg">
                <FaixaBranca indice={indiceGlobal}>{projeto.nome}</FaixaBranca>
              </h4>
              <p className="mt-3 text-sm">{projeto.descricao}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                {projeto.stack.map((tecnologia) => (
                  <span
                    key={tecnologia}
                    className="inline-block bg-amarelo-fita px-3 py-1 font-bold text-preto-tinta opacity-90"
                  >
                    {tecnologia}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {projeto.link ? (
                  <a
                    href={projeto.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border-2 border-vermelho-punk px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-vermelho-punk"
                    style={{ transform: `rotate(${obterRotacao(indiceGlobal + 8)}deg)` }}
                  >
                    Ver projeto
                  </a>
                ) : null}
                {projeto.linkNoticia ? (
                  <a
                    href={projeto.linkNoticia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border-2 border-preto-tinta px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-preto-tinta"
                    style={{ transform: `rotate(${obterRotacao(indiceGlobal + 8)}deg)` }}
                  >
                    Na mídia
                  </a>
                ) : null}
                {projeto.linkRepo ? (
                  <a
                    href={projeto.linkRepo}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Repositório de ${projeto.nome} no GitHub`}
                    className="inline-block text-preto-tinta transition-colors hover:text-vermelho-punk"
                  >
                    <IconeGitHub className="h-5 w-5" />
                  </a>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function Projetos() {
  const refSecao = useRef<HTMLElement>(null);
  useAnimacaoColagem(refSecao);

  return (
    <section
      ref={refSecao}
      id="projetos"
      className="flex flex-col items-center gap-12 px-8 py-16 md:py-24"
    >
      <h2 data-colagem>
        <FitaAdesiva indice={4}>Projetos</FitaAdesiva>
      </h2>
      <BlocoProjetos
        titulo="Fundação Beta / Prefeitura de Betim"
        projetos={PROJETOS_BETA}
        indiceBase={0}
        indiceCarimbo={6}
      />
      <BlocoProjetos
        titulo="Projetos pessoais"
        projetos={PROJETOS_PESSOAIS}
        indiceBase={PROJETOS_BETA.length}
        indiceCarimbo={11}
      />
    </section>
  );
}
