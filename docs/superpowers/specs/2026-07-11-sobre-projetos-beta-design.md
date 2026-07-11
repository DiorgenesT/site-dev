# Texto do Sobre e projetos da Fundacao Beta

Data: 2026-07-11

## Contexto

Duas melhorias de conteudo pedidas pelo usuario:

1. O texto da secao Sobre podia ficar mais fluido e direto, mantendo os mesmos fatos.
2. A secao Projetos so mostra 4 projetos pessoais/freelance. O usuario desenvolveu, no seu trabalho atual na Fundacao Beta (centro de inovacao e tecnologia da Prefeitura de Betim), varios sistemas reais em producao, com repositorio privado mas acessiveis publicamente pela URL: o site institucional da propria Fundacao Beta, UPA Agora, IEGM Betim, Portal do Servidor e ODS Betim. Fundação Beta, UPA Agora e Portal do Servidor tem cobertura de imprensa (noticias no portal oficial da Prefeitura) que podem ser referenciadas como prova social.

Decisoes tomadas em brainstorming: repositorio privado nao e um bloqueio (a secao ja usa um campo `link` pra URL do produto, nao pro repositorio); nenhum dos 5 sistemas exige login pra acessar (a suposicao inicial do usuario de que o Portal do Servidor precisava de login estava errada); linkar noticias oficiais da prefeitura de um site pessoal e uma pratica segura e comum (seria equivalente a uma mencao de imprensa em um portfolio, sem reivindicar afiliacao oficial nem usar marca/logo).

## Escopo

**Dentro do escopo:**
- Reescrever o paragrafo de `src/secoes/Sobre.tsx` (mesma estrutura, mesmos fatos, prosa mais direta).
- Adicionar 5 novos projetos a `src/secoes/Projetos.tsx`, agrupados separadamente dos 4 projetos pessoais existentes.
- Estender o tipo `Projeto` com um campo opcional `linkNoticia` pra Fundação Beta, UPA Agora e Portal do Servidor.
- Extrair a renderizacao do grid de projetos pra um componente local `BlocoProjetos`, reaproveitado pelos dois blocos (evita duplicar o JSX do card).

**Fora do escopo:**
- Qualquer mudanca em `useAnimacaoColagem`, `lib/gsap.ts` ou no Hero.
- Adicionar logo/marca oficial da Prefeitura de Betim ou da Fundacao Beta (so texto e link, sem reproducao de identidade visual de terceiros).

## Design

### Sobre.tsx

Novo texto (aprovado pelo usuario), mantendo os mesmos trechos destacados via `Adesivo` (desenvolvedor Python, Analista Senior, Desenvolvedor de Software, Pos-Graduacao, Bacharelado):

> Comecei na linha de frente do atendimento, na Expresso Truck e na Monumental Assistencia 24hrs. Foi la que virei **desenvolvedor Python**: automatizei operacoes com LLMs e dashboards, cortando 35% do tempo de atendimento. Hoje sou **Analista Senior** e **Desenvolvedor de Software** na Fundacao Beta, o centro de inovacao e transformacao digital da Prefeitura de Betim.
>
> **Pos-Graduacao** em Sistemas com Python (UniCesumar) e **Bacharelado** em Ciencia da Computacao (Cruzeiro do Sul).

So o texto muda. Estrutura do componente (grid com a foto, `data-colagem`, `useAnimacaoColagem`) fica identica.

### Projetos.tsx

**Tipo `Projeto` ganha um campo opcional:**

```ts
interface Projeto {
  nome: string;
  descricao: string;
  stack: string;
  link?: string;
  linkNoticia?: string;
}
```

**Duas listas separadas** (em vez de uma so `PROJETOS`):

```ts
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
```

**Componente local `BlocoProjetos`**, reaproveitado pelos dois blocos:

```tsx
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
```

Nota de acessibilidade: o card interno passa de `h3` pra `h4`, porque agora existe um `h3` novo (o subtitulo do bloco) entre o `h2` da secao e os titulos dos cards. Mantem a hierarquia h2 -> h3 -> h4 sem pular nivel, como exige o `CLAUDE.md`.

**`Projetos()` passa a renderizar os dois blocos em sequencia:**

```tsx
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

`indiceBase` continua a sequencia de `obterRotacao` entre os dois blocos (o bloco pessoal comeca em `indiceBase = 5`), entao as rotacoes nunca se repetem entre os 9 cards.

### Testes

**`Sobre.test.tsx`**: nenhuma mudanca necessaria. As asserções (`/Expresso Truck/`, `/Fundação Beta/`, `/UniCesumar/`) continuam validas com o novo texto.

**`Projetos.test.tsx`**: precisa mudar, porque `screen.getByRole('link', { name: 'Ver projeto' })` (singular) vai quebrar assim que existir mais de um link com esse nome (agora serao 6: 5 da Beta + Tudo Em Dia). Nova versao:

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

### Performance e acessibilidade

- Zero JS novo, zero dependencia nova: so texto, dados estaticos e um componente de renderizacao.
- Contraste: os links usam as mesmas cores ja validadas (`vermelho-punk` e `preto-tinta` sobre `branco-papel`), sem cor nova.
- Links externos mantêm `target="_blank" rel="noopener noreferrer"`, igual ao padrao ja usado nos links existentes.

## Fora de escopo / proximos passos possiveis

- Nenhuma imagem, logo ou marca da Prefeitura de Betim ou da Fundacao Beta e usada, so texto e link, pra evitar qualquer questao de uso de identidade visual de terceiros sem autorizacao.
- Se no futuro algum desses sistemas passar a exigir login pra acesso publico, revisar se o link continua fazendo sentido como "Ver projeto".
