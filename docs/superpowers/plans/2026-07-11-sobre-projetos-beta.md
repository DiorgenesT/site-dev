# Texto do Sobre e projetos da Fundacao Beta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Melhorar a prosa da secao Sobre e adicionar 5 projetos reais da Fundacao Beta/Prefeitura de Betim a secao Projetos, agrupados separadamente dos 4 projetos pessoais existentes.

**Architecture:** `Sobre.tsx` so troca o texto (estrutura identica). `Projetos.tsx` passa a ter duas listas de dados (`PROJETOS_BETA`, `PROJETOS_PESSOAIS`) renderizadas por um componente local `BlocoProjetos`, evitando duplicar o JSX do card entre os dois blocos. O tipo `Projeto` ganha um campo opcional `linkNoticia`.

**Tech Stack:** React 18 + TypeScript strict, Vitest + Testing Library. Sem dependencia nova.

Referencia: spec completa em `docs/superpowers/specs/2026-07-11-sobre-projetos-beta-design.md`.

---

### Task 1: Reescrever o texto do Sobre

**Files:**
- Modify: `src/secoes/Sobre.tsx`

- [ ] **Step 1: Confirmar que o teste existente continua valido antes de mudar nada**

Run: `npx vitest run src/secoes/Sobre.test.tsx`
Expected: PASS (1 teste). O teste so verifica `/Expresso Truck/`, `/Fundação Beta/` e `/UniCesumar/`, que continuam presentes no novo texto.

- [ ] **Step 2: Trocar os dois paragrafos de `Sobre.tsx`**

Abrir `src/secoes/Sobre.tsx`. Substituir o bloco dos dois `<p>` (o que comeca em `Comecei gerenciando atendimento...` e o que comeca em `Pós-Graduação em Sistemas...`) por:

```tsx
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
```

Nao mexer em mais nada no arquivo (o `h2`, a foto e o `useAnimacaoColagem` ficam identicos).

- [ ] **Step 3: Rodar o teste do Sobre de novo**

Run: `npx vitest run src/secoes/Sobre.test.tsx`
Expected: PASS (1 teste), sem nenhuma mudanca no arquivo de teste.

- [ ] **Step 4: Commit**

Nao commitar ainda. Esse projeto exige teste local aprovado pelo usuario antes de qualquer commit. O commit dessa task acontece junto com a Task 3 (Step 6), depois da aprovacao.

---

### Task 2: Reestruturar Projetos.tsx em dois blocos

**Files:**
- Modify: `src/secoes/Projetos.tsx`
- Modify: `src/secoes/Projetos.test.tsx`

- [ ] **Step 1: Escrever os novos testes (TDD, vao falhar contra o `Projetos.tsx` atual)**

Substituir o conteudo de `src/secoes/Projetos.test.tsx` por:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Projetos } from './Projetos';

describe('Projetos', () => {
  it('renderiza os 4 projetos pessoais, com Tudo Em Dia linkando pro produto real', () => {
    render(<Projetos />);

    expect(screen.getByText('Tudo Em Dia')).toBeInTheDocument();
    expect(screen.getByText('Sistema de Ponto')).toBeInTheDocument();
    expect(screen.getByText('Controle de Ponto')).toBeInTheDocument();
    expect(screen.getByText('ingestao-async')).toBeInTheDocument();

    const linksProjeto = screen.getAllByRole('link', { name: 'Ver projeto' });
    const linkTudoEmDia = linksProjeto.find(
      (link) => link.getAttribute('href') === 'https://tatudoemdia.com.br/',
    );
    expect(linkTudoEmDia).toBeDefined();
  });

  it('renderiza os 5 projetos da Fundacao Beta, com noticia em Fundacao Beta, UPA Agora, Portal do Servidor e ODS', () => {
    render(<Projetos />);

    expect(screen.getByText('Fundação Beta')).toBeInTheDocument();
    expect(screen.getByText('UPA Agora')).toBeInTheDocument();
    expect(screen.getByText('IEGM Betim')).toBeInTheDocument();
    expect(screen.getByText('Portal do Servidor')).toBeInTheDocument();
    expect(screen.getByText('ODS Betim')).toBeInTheDocument();

    const linksNoticia = screen.getAllByRole('link', { name: 'Na mídia' });
    expect(linksNoticia).toHaveLength(4);
  });

  it('agrupa os projetos em dois blocos com subtitulo', () => {
    render(<Projetos />);

    expect(screen.getByText('Fundação Beta / Prefeitura de Betim')).toBeInTheDocument();
    expect(screen.getByText('Projetos pessoais')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar os testes e confirmar que falham**

Run: `npx vitest run src/secoes/Projetos.test.tsx`
Expected: FAIL nos 3 testes (o `Projetos.tsx` atual so tem 4 projetos pessoais, sem blocos nem `linkNoticia`; `getByText('Fundação Beta')`, `getByText('UPA Agora')` etc nao existem ainda).

- [ ] **Step 3: Reescrever `Projetos.tsx` por completo**

Substituir o conteudo de `src/secoes/Projetos.tsx` por:

```tsx
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
  linkNoticia?: string;
}

const PROJETOS_BETA: readonly Projeto[] = [
  {
    nome: 'Fundação Beta',
    descricao:
      'Site institucional do centro de inovação e tecnologia da Prefeitura de Betim: portfólio de projetos, linha do tempo estratégica e canal de contato com a gestão pública.',
    stack: 'React, TypeScript, Next.js, GSAP, Tailwind CSS',
    link: 'https://fundacaobeta.com.br/',
    linkNoticia:
      'https://www.betim.mg.gov.br/portal/noticias/0/3/14108/com-foco-em-tecnologia-inovacao-e-eficiencia-prefeitura-de-betim-lanca-oficialmente-a-fundacao-beta',
  },
  {
    nome: 'UPA Agora',
    descricao:
      'Plataforma para acompanhamento em tempo real da situação assistencial das Unidades de Pronto Atendimento de Betim: monitora o fluxo de atendimento, o tempo médio de espera e a classificação de risco de cada especialidade.',
    stack: 'React, TypeScript, Next.js, Tailwind CSS',
    link: 'https://fundacaobeta.com.br/upaagora',
    linkNoticia:
      'https://www.betim.mg.gov.br/portal/noticias/0/3/15019/betim-lanca-upa-agora-e-integra-servicos-publicos-em-plataforma-digital-com-atendimento-em-tempo-real',
  },
  {
    nome: 'IEGM Betim',
    descricao:
      'Dashboard do Índice de Efetividade da Gestão Municipal, com indicadores públicos de gestão da Prefeitura de Betim.',
    stack: 'React, TypeScript, Next.js, Tailwind CSS',
    link: 'https://iegm.betim.digital/',
  },
  {
    nome: 'Portal do Servidor',
    descricao:
      'Reúne contracheque digital, protocolo eletrônico do RH, agenda oficial e ouvidoria para o funcionalismo municipal de Betim.',
    stack: 'Next.js 16.0.3, React, TypeScript, Tailwind, Embla Carousel, Lucide React',
    link: 'https://servidor.betim.digital/',
    linkNoticia:
      'https://www.betim.mg.gov.br/portal/noticias/0/3/15351/portal-do-servidor-ja-esta-disponivel-e-reune-servicos-e-informacoes-do-funcionalismo-municipal/',
  },
  {
    nome: 'ODS Betim',
    descricao:
      'Painel de transparência dos Objetivos de Desenvolvimento Sustentável: 167 séries históricas, alinhado à Agenda 2030 da ONU.',
    stack: 'React, TypeScript, Tailwind CSS',
    link: 'https://ods.betim.digital/',
    linkNoticia:
      'https://www.betim.mg.gov.br/portal/noticias/0/3/15189/prefeitura-de-betim-realiza-a-1-conferencia-municipal-dos-objetivos-de-desenvolvimento-sustentavel-ods-pela-beta-e-amplia-participacao-da-comunidade-nas-decisoes-sobre-o-pais',
  },
] as const;

const PROJETOS_PESSOAIS: readonly Projeto[] = [
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
] as const;

interface BlocoProjetosProps {
  titulo: string;
  projetos: readonly Projeto[];
  indiceBase: number;
}

function BlocoProjetos({ titulo, projetos, indiceBase }: BlocoProjetosProps) {
  return (
    <div className="w-full max-w-4xl">
      <h3
        className="mb-4 text-sm font-bold uppercase tracking-widest text-vermelho-punk"
        data-colagem
      >
        {titulo}
      </h3>
      <div className="grid gap-6 sm:grid-cols-2">
        {projetos.map((projeto, indice) => {
          const indiceGlobal = indiceBase + indice;
          return (
            <article
              key={projeto.nome}
              data-colagem
              className="border-2 border-preto-tinta bg-branco-papel p-4"
              style={{ transform: `rotate(${obterRotacao(indiceGlobal)}deg)` }}
            >
              <h4 className="text-lg">
                <Adesivo indice={indiceGlobal}>{projeto.nome}</Adesivo>
              </h4>
              <p className="mt-3 text-sm">{projeto.descricao}</p>
              <div className="mt-3 text-xs">
                <FitaAdesiva indice={indiceGlobal + 4}>{projeto.stack}</FitaAdesiva>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
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
                    style={{ transform: `rotate(${obterRotacao(indiceGlobal + 12)}deg)` }}
                  >
                    Na mídia
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
      />
      <BlocoProjetos
        titulo="Projetos pessoais"
        projetos={PROJETOS_PESSOAIS}
        indiceBase={PROJETOS_BETA.length}
      />
    </section>
  );
}
```

- [ ] **Step 4: Rodar os testes do Projetos e confirmar que passam**

Run: `npx vitest run src/secoes/Projetos.test.tsx`
Expected: PASS (3 testes).

- [ ] **Step 5: Rodar a suite completa**

Run: `npx vitest run`
Expected: PASS em todos os arquivos, incluindo `Sobre.test.tsx` (Task 1) e `App.test.tsx` (que so verifica presenca de secoes e CTAs, nao os projetos individuais, entao nao deveria quebrar; conferir mesmo assim).

- [ ] **Step 6: Commit**

Nao commitar ainda. Segue pra Task 3.

---

### Task 3: Verificacao final e commit

**Files:** nenhum arquivo novo, so validacao.

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: sem erros.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros (confirma que `linkNoticia?: string` e `BlocoProjetosProps` tipam certo).

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build limpo. Essa mudanca so adiciona texto/dados estaticos, sem JS novo, entao o bundle inicial nao deve crescer de forma perceptivel.

- [ ] **Step 4: Teste visual manual**

Rodar `npm run dev`, abrir a pagina no navegador, confirmar visualmente:
- O texto do Sobre esta fluido e sem erro de digitacao.
- A secao Projetos mostra os dois subtitulos ("Fundação Beta / Prefeitura de Betim" e "Projetos pessoais") com os 5 e os 4 cards respectivamente.
- Fundação Beta, UPA Agora, Portal do Servidor e ODS tem dois botoes ("Ver projeto" e "Na mídia"); so IEGM tem so "Ver projeto"; entre os pessoais, so Tudo Em Dia tem link.
- Todos os links abrem na URL certa (checar href no devtools ou passando o mouse).

- [ ] **Step 5: Aguardar aprovacao do usuario apos o teste local**

Regra do projeto: so commitar depois que o usuario confirmar que testou localmente e aprovou. Nao rodar o Step 6 antes disso.

- [ ] **Step 6: Commits (so apos aprovacao)**

Dois commits atomicos, um por area:

```bash
git add src/secoes/Sobre.tsx
git commit -m "fix: melhorar a prosa da secao Sobre"

git add src/secoes/Projetos.tsx src/secoes/Projetos.test.tsx
git commit -m "feat: adicionar projetos reais da Fundacao Beta na secao Projetos

Agrupa os 5 sistemas em producao desenvolvidos na Fundacao Beta/
Prefeitura de Betim (site institucional, UPA Agora, IEGM, Portal do
Servidor, ODS) separados dos 4 projetos pessoais existentes, cada um
com link real e, quando existe, link de noticia oficial."
```

---

## Fora de escopo (nao fazer neste plano)

- Nenhuma mudanca em `useAnimacaoColagem.ts`, `lib/gsap.ts` ou no Hero.
- Nenhuma imagem, logo ou marca oficial da Prefeitura de Betim/Fundacao Beta.
