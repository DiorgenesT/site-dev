# Fase 2, Secoes Reais do Site, Design

**Goal:** Substituir o placeholder de `App.tsx` (herdado das Fases 0 e 1) pelas 6 secoes reais do portfolio (Hero, Sobre, Stack, Projetos, LabIA, Contato), com conteudo real do usuario, e estender a engine da Cobra de Scroll para percorrer a pagina inteira com N waypoints reais, incluindo o mecanismo de "desmonte" no Hero (simetrico ao docking ja existente no Contato).

**Nao muda:** o conceito da Cobra de Scroll, o contrato tecnico inegociavel de 8 pontos, a stack fechada e as convencoes gerais - tudo do `CLAUDE.md` da raiz vale integralmente. A Fase 1 (engine pura em `src/cobra/`, hook `useCobra`, componente `CamadaCobra`) fica como base, estendida onde necessario (ver secao 3).

**Escopo:** um unico spec e um unico plano, executado task por task (issue + branch + PR + review por task), mesmo padrao das Fases 0 e 1.

---

## 1. Conteudo por secao

Conteudo real do usuario (Diorgenes George, "DG"), confirmado durante o brainstorming:

**Hero:** identidade curta "DG" (componente `NotaDeResgate`, mesma escolha ja validada na pagina de manutencao), tag "Python & AI Engineer", e um botao real de CTA "Ver projetos" que rola ate a secao Projetos.

**Sobre:** texto corrido com a trajetoria profissional - de gerente (Expresso Truck, Monumental Assistencia 24hrs) a desenvolvedor Python/IA, incluindo a automacao com LLMs que reduziu -35% no tempo de atendimento na Monumental, ate a posicao atual (Analista Senior/Dev, Fundacao Beta - Prefeitura de Betim, nov/2025-presente). Formacao: Pos-Graduacao em Sistemas com Python (UniCesumar), Bacharelado em Ciencia da Computacao (Cruzeiro do Sul).

**Stack:** lista de tecnologias como "mural de adesivos" (ver secao 2): Python, FastAPI, LangChain, LangGraph, RAG, ChromaDB/Pinecone, OpenAI/Claude API, Docker, PostgreSQL, React, TypeScript.

**Projetos:** 4 projetos reais, em ordem de destaque (do GitHub publico `DiorgenesT`, verificado durante o brainstorming):
1. **Tudo Em Dia** (`controle-financeiro`) - SaaS de financas pessoais, no ar em producao (tatudoemdia.com.br), com assistente de IA por voz integrado. Next.js 16, TypeScript.
2. **Sistema de Ponto** - ponto eletronico com reconhecimento facial, banco de horas, conforme Portaria 671/2021 do MTE e LGPD.
3. **Controle de Ponto** - sistema sob demanda para cliente real (Alexandre Motos), substituindo planilha XLSX manual por solucao com autenticacao JWT/bcrypt e geracao de folha de ponto em PDF.
4. **ingestao-async** - API assincrona de ingestao de dados publicos (FastAPI + fila Postgres + worker + dashboard React), arquitetura pensada para datasets grandes sem bloquear a API.

O repositorio `Site-Monumental` (site institucional simples) fica de fora, por decisao explicita do usuario.

**LabIA:** secao separada de Projetos, sem link de codigo publico (o trabalho de IA do dia a dia - LangChain, LangGraph, RAG - e institucional/privado). Formato de case study em texto + diagrama simples, cobrindo a automacao real da Monumental Assistencia (LLMs, dashboards, -35% no atendimento) como historia central.

**Contato:** CTA real "Fale comigo", abrindo WhatsApp (`+55 31 99151-9864`) com mensagem pre-preenchida via link `https://wa.me/...`.

---

## 2. Ritmo visual: estrutura por secao

Decisao do brainstorming (validada via mockups no companheiro visual): manter a mesma paleta e tipografia em todas as secoes, mas variar a estrutura de composicao secao a secao - como paginas de um fanzine real, cada uma "cortada" diferente, em vez de um template repetido 6 vezes.

| Secao | Estrutura | Nota |
|---|---|---|
| Hero | Centralizado | Mesma linha da pagina de manutencao (ja validada pelo usuario): tudo empilhado e centralizado, sem colagem assimetrica. |
| Sobre | Split editorial | Texto corrido de um lado, elemento grafico (carimbo) do outro. |
| Stack | Mural de adesivos | Grid solto de tags/adesivos (componente `Adesivo` ja existente, com rotacao/jitter deterministicos por indice), sem alinhamento rigido de grid. |
| Projetos | Cards | Um card por projeto, cada um com leve rotacao propria (tokens deterministicos), nome, descricao curta, stack usada e link (quando publico). |
| LabIA | Split editorial (variante) | Mesma logica estrutural da Sobre, mas com composicao diferente (texto + diagrama, nao texto + carimbo) para nao repetir o padrao visual. |
| Contato | Centralizado | Mesma linha do Hero: direto, sem ruido visual, foco total no CTA final. |

---

## 3. Mudancas na engine da Cobra de Scroll

A Fase 1 fechou com uma engine que suporta apenas 2 ancoras fixas (`refInicio`, `refFim`) e docking unidirecional (cobra vira botao real so no fim da jornada). A Fase 2 precisa de duas extensoes:

### 3.1 N waypoints (uma ancora por secao)

`trajetoria.ts` (Catmull-Rom + amostragem por comprimento de arco) ja suporta N waypoints - nenhuma mudanca necessaria ali. A mudanca e na API do hook `useCobra`: em vez de `{ refInicio, refFim, refJornada }`, passa a aceitar um array ordenado de refs, uma por secao (`refsSecoes: RefObject<HTMLElement>[]`), convertido em `Ponto[]` do mesmo jeito que hoje (`elementoParaPonto`, lido no mount e no resize debounced de 150ms - nenhuma mudanca no ponto 3 do contrato tecnico). `refJornada` continua sendo o elemento que envolve a jornada inteira, usado pelo `IntersectionObserver` (ponto 8 do contrato).

### 3.2 Desmonte simetrico no Hero (nova mecanica)

Hoje `docking.ts` expoe `fatorDocking(progresso, inicioZona)`, que vale 0 antes da zona de docking e sobe ate 1 no fim da jornada - so cobre o "enrolar" no destino. A Fase 2 precisa do inverso no inicio: um fator de "desmonte" que comeca em 1 (cobra ainda no formato de adesivo, sobre o botao do Hero) e desce ate 0 conforme o usuario rola para alem da zona inicial (a partir dai a cobra "solta" do botao e passa a desenhar o rastro normal ao longo da trajetoria).

Implementacao: generalizar `docking.ts` para expor uma funcao simetrica reutilizavel (mesma curva de easing smoothstep, mesmo principio de zona fixa por constante de codigo) aplicada duas vezes - uma vez invertida no inicio (`fatorDesmonte`), uma vez normal no fim (`fatorDocking`, sem mudanca de comportamento). Ambas continuam sendo funcoes puras do progresso atual, sem estado de "ja animou" - reversibilidade automatica ao rolar pra tras.

### 3.3 Correcao de acessibilidade: botoes reais desacoplados da opacidade da cobra

Decisao do brainstorming que resolve a divida tecnica registrada no fechamento da Fase 1 (CTA nascia com `opacity-0`, focavel mas invisivel por teclado ate o docking - ver memoria do projeto): **os botoes reais (Hero e Contato) nunca tem a propria opacidade amarrada a `fatorDocking`/`fatorDesmonte`. Eles existem sempre normais, visiveis, com estilo final e focaveis, desde o primeiro render.** So a camada canvas (cobra, puramente decorativa, `aria-hidden`) anima via esses fatores, convergindo visualmente sobre a posicao/tamanho do botao (GSAP Flip) e entao desaparecendo (no destino) ou aparecendo (na origem) por cima dele. Isso satisfaz o ponto 2 do contrato tecnico ("botoes reais sempre existem no DOM e sao focaveis... acessibilidade nunca depende da cobra") sem excecao, em vez de precisar de correcao pontual depois.

Isso muda o uso do GSAP Flip em `CamadaCobra.tsx`: o Flip continua fazendo a transicao de forma/posicao do desenho da cobra ate a caixa delimitadora do botao real, mas o crossfade de opacidade agora e so entre "canvas visivel" e "canvas invisivel" - o botao real do DOM nunca participa dessa animacao de opacidade.

---

## 4. Arquitetura de arquivos

```
src/secoes/
  Hero.tsx       — DG + tag + CTA real "Ver projetos" (ancora de origem da cobra)
  Sobre.tsx      — texto corrido + carimbo
  Stack.tsx      — mural de adesivos (reusa componente Adesivo existente)
  Projetos.tsx   — cards dos 4 projetos (conteudo local ao arquivo, sem novo modulo de dados - YAGNI para 4 itens fixos)
  LabIA.tsx      — case study em texto + diagrama simples
  Contato.tsx    — CTA real "Fale comigo" (ancora de destino da cobra, link wa.me)
```

`App.tsx` passa a compor as 6 secoes em ordem, cada uma com uma ref propria repassada a `useCobra` (substituindo o placeholder atual da Fase 0/1). `CamadaCobra` e `useCobra` sao ajustados conforme a secao 3, mas continuam vivendo em `src/componentes/` e `src/hooks/` respectivamente - nao mudam de lugar.

Cada secao e um componente React comum (nao precisa de logica pura testavel como `src/cobra/` - mesma decisao ja tomada na Fase 1 para a camada de integracao). Testes cobrem renderizacao do conteudo esperado (texto, links, CTAs), no mesmo padrao ja usado para os componentes da Fase 0.

---

## 5. Estrategia de testes

- **`src/cobra/docking.ts`**: testes novos para a funcao de desmonte simetrica (valores nos limites, monotonicidade, reversibilidade) - mesmo rigor ja aplicado a `fatorDocking` na Fase 1.
- **`src/hooks/useCobra.ts`**: ajuste dos testes/verificacao existentes para a nova API de N refs (fora do rigor de TDD unitario, como ja decidido na Fase 1 para a camada de integracao React).
- **`src/secoes/*.tsx`**: teste de renderizacao por secao (Testing Library), garantindo que o conteudo textual e os CTAs reais aparecem e sao focaveis/acessiveis desde o primeiro render (cobre diretamente a correcao da secao 3.3).
- **Gate final da fase:** typecheck/lint/format/testes/build limpos, os 8 pontos do contrato tecnico revalidados (incluindo os 2 nichos novos: N waypoints e desmonte simetrico), Lighthouse mobile real (Performance >=95, Acessibilidade 100, LCP <2.0s, CLS <0.05), review final de branch via subagente no modelo mais capaz - mesmo processo ja usado no fechamento da Fase 1.

---

## Decisoes tomadas durante o brainstorming (registro)

1. Escopo: uma fase, um plano (nao dividir em 2a/2b nem em 6 specs por secao).
2. Conteudo real (nao placeholder): perfil profissional confirmado pelo usuario a partir de memoria salva de sessao anterior; projetos reais extraidos do GitHub publico `DiorgenesT` (API, nao a pagina web que carregou com erros).
3. Projetos: 4 de 5 candidatos, ordem de destaque definida pelo usuario; `Site-Monumental` fora.
4. LabIA: case study em texto/diagrama, sem link de codigo (trabalho institucional/privado).
5. Cobra: trajeto pela pagina inteira, um waypoint por secao (nao um trajeto curto Hero-Contato so).
6. CTA final (Contato): abre WhatsApp, nao email nem formulario proprio.
7. Hero: layout centralizado (validado via mockup colorido, comparado a 2 alternativas descartadas: colagem assimetrica e split editorial) com "DG" curto, nao nome completo.
8. Hero CTA: elemento real com texto proprio "Ver projetos" (rejeitada a ideia inicial de um adesivo so decorativo com texto instrucional tipo "role pra ver a cobra", por nao fazer sentido como copy).
9. Ritmo visual: variar estrutura por secao (nao manter tudo centralizado), validado via storyboard das 6 secoes.
10. Acessibilidade: fix arquitetural definido nesta spec (secao 3.3), resolvendo a divida tecnica da Fase 1 como parte do design, nao como remendo posterior.

## Fora de escopo desta fase (fica para depois)

- Pagina 404 com minigame reaproveitando `src/cobra/` - Fase 3.
- Dominio customizado `diorgenes.dev` conectado ao Cloudflare Pages (ainda publicado em `site-dev-5um.pages.dev` com pagina de manutencao) - troca de DNS/deploy final, feita quando o site real estiver pronto para producao.
- Conteudo real trazido do LinkedIn (o fetch direto foi bloqueado por anti-scraping; o perfil usado veio de memoria de sessao anterior e foi confirmado como atual pelo usuario, mas nao houve extracao automatica do LinkedIn).
- Kill/recriacao da timeline do GSAP Flip em resize e tratamento de delta grande no quantizador (divida tecnica registrada no fechamento da Fase 1, nao bloqueante, pode ser tratada nesta fase ou na proxima conforme prioridade).
