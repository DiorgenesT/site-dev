# Fase 1, Engine da Cobra de Scroll, Design

**Goal:** Construir a engine pura da Cobra de Scroll (`src/cobra/`, sem React) com testes unitarios completos, depois integra-la a React via canvas, Lenis e GSAP, incluindo uma pagina playground dev-only para calibrar velocidade, espessura do traco e taxa de quantizacao.

**Nao muda:** o conceito da Cobra de Scroll continua exatamente como descrito no `CLAUDE.md` da raiz (confirmado com o usuario durante o brainstorming: um rabisco de marcador grosso que acompanha o scroll numa trajetoria entre secoes e se enrola virando o botao de CTA ao chegar no destino, movimento com cara de stop motion). O contrato tecnico inegociavel de 8 pontos do `CLAUDE.md` vale integralmente para esta fase.

**Escopo:** um unico spec e um unico plano, executado task por task (issue + branch + PR + review por task), no mesmo padrao ja usado na Fase 0.

---

## 1. Arquitetura: `src/cobra/` (engine pura, sem React)

```
src/cobra/
  tipos.ts        — tipos compartilhados (Ponto, Waypoint, EstadoCobra, TabelaTraco, etc.)
  trajetoria.ts   — Catmull-Rom + parametrizacao por comprimento de arco + amostragem(progresso) -> Ponto
  motor.ts        — buffer circular (Float32Array), quantizacao stop motion, tabela de offsets do traco multi-passada
  docking.ts      — fator de docking (zona de proximidade, scrub, reversivel) + pose interpolada
```

Fluxo de dados: `trajetoria.ts` pre-computa a curva a partir dos waypoints (uma vez, no mount/resize) e expoe `amostrar(progresso: number): Ponto`. `motor.ts` mantem o estado (buffer circular de posicoes da cabeca) e, a cada tick quantizado, empurra a nova posicao amostrada da trajetoria. `docking.ts` calcula, a partir do progresso dentro da zona do CTA, o quanto a cobra deve estar "enrolada" (0 a 1), sem saber nada sobre GSAP Flip - isso e responsabilidade da camada React.

Nenhum desses modulos importa React, canvas ou GSAP - sao so funcoes e tipos puros, 100% testaveis com Vitest sem jsdom. Regra ja existente no CLAUDE.md: `cobra/` nunca importa React (garantir via regra de lint `no-restricted-imports` se necessario, decisao de implementacao).

---

## 2. Decisoes de dados e algoritmos

**Waypoints:** cada secao expoe um elemento ancora real no DOM (ref lida via `getBoundingClientRect` no mount e em resize debounced de 150ms, nunca dentro do loop de animacao). A camada React converte esses elementos em `Ponto[]` (coordenadas de documento) e passa para `trajetoria.ts` - a engine pura nunca ve o DOM, so numeros.

**Amostragem por comprimento de arco (velocidade constante):** no boot da trajetoria, `trajetoria.ts` gera uma tabela fixa de 200 amostras de comprimento acumulado ao longo da curva Catmull-Rom (resolucao fixada em 200, suficiente para suavidade visual sem custo relevante, recalculada so no boot/resize). `amostrar(progresso)` faz busca nessa tabela (com interpolacao linear entre as duas amostras mais proximas) para achar o ponto cujo comprimento de arco percorrido corresponde a `progresso * comprimentoTotal`. Isso garante velocidade visual constante ao longo de todo o percurso, independente do espacamento real entre waypoints.

**Buffer circular do corpo:** `Float32Array` de tamanho fixo, 12 posicoes (x,y = 24 numeros), representando ~1 segundo de rastro a 12 passos/s. A cada passo quantizado, a posicao mais antiga e sobrescrita (indice circular via modulo), sem alocacao nova durante o loop.

**Quantizacao stop motion:** um acumulador de tempo decide quando "avancar um passo" (a cada ~83ms, 12x/s), independente da taxa do rAF (que roda continuo via ticker do GSAP). Entre passos, a posicao visual fica congelada no ultimo valor quantizado - e isso que da a cara de stop motion sobre um render continuo.

**Tabela de offsets do traco multi-passada:** gerada uma unica vez no boot (funcao pura, deterministica, sem `Math.random`), com exatamente 3 "passadas" fixas por segmento do corpo, cada uma com seu proprio deslocamento (x, y) e espessura pre-calculados. Estilo escolhido no brainstorming visual: traco multi-passada (rabisco nervoso, tres passadas levemente desalinhadas sobrepostas), mesmo principio das tabelas de rotacao/jitter dos tokens da Fase 0 (nunca ruido calculado por frame).

---

## 3. Docking (zona de proximidade, scrub, reversivel)

`docking.ts` expoe uma funcao pura `fatorDocking(progresso: number, inicioZona: number): number` que retorna 0 antes da zona, sobe suavemente (curva de easing smoothstep, `3x^2 - 2x^3`) conforme o progresso avanca dentro da zona, e chega a 1 exatamente no waypoint final (progresso = 1). O tamanho da zona (`inicioZona`) e fixado em 0.92 (os ultimos 8% do percurso ate o waypoint de destino) como constante de codigo, nao exposto como controle no playground desta fase (o playground calibra velocidade, espessura do traco e taxa de quantizacao, nao o tamanho da zona de docking). Por ser uma funcao pura do progresso atual (sem estado de "ja animou"), a reversao e automatica: se o scroll volta, o fator cai junto, sem logica extra de "desfazer".

A camada React usa esse fator para dirigir o GSAP Flip entre o canvas (cobra) e o botao real de CTA: em `fatorDocking = 0` a cobra esta solta desenhando o rastro normal; em `fatorDocking = 1` o Flip esta completo e o botao real assume 100% de opacidade/posicao. Entre 0 e 1, o Flip e "scrubado" pelo proprio valor do fator (nao uma timeline de duracao fixa), preservando o principio de 1:1 com o scroll que ja vale para o resto da trajetoria.

---

## 4. Integracao React (canvas, Lenis, GSAP, playground)

**Camada de movimento:** um singleton lazy (`src/lib/movimento.ts`) cria um unico Lenis conectado ao `ScrollTrigger` dentro do `gsap.ticker` - carregado sob demanda (chunk lazy) so quando a cobra realmente monta, nunca no bundle inicial. Cumpre os pontos 3 e 4 do contrato tecnico do CLAUDE.md (trajetoria pre-computada, rAF unico).

**Componente canvas:** um unico `<canvas>` `position: fixed` cobrindo a viewport, `pointer-events: none`, `aria-hidden="true"` - monta a engine (`trajetoria` + `motor` + `docking`), registra o tick no `gsap.ticker`, desenha o corpo (buffer circular) usando a tabela de offsets multi-passada, aplica `prefers-reduced-motion` (desliga tudo, mostra fallback estatico funcional) e pausa por `IntersectionObserver`/`visibilitychange`.

**Escopo real vs. playground nesta fase:** como as secoes reais (Hero, Contato etc.) so existem na Fase 2, a Fase 1 integra a cobra usando 2 elementos-ancora minimos ja presentes dentro do proprio `App.tsx` da fundacao (um "inicio" e um "fim" de demonstracao) - o suficiente para provar trajetoria + docking de ponta a ponta contra DOM real. A calibragem fina de verdade acontece na pagina playground, com waypoints ficticios e sliders.

**Playground:** rota dev-only (`import.meta.env.DEV`), ativada por um fragmento de URL tipo `#playground`, renderizada condicionalmente a partir do `main.tsx` (sem adicionar biblioteca de rota, que estaria fora da stack fechada). Controles minimos: velocidade (duracao do scroll simulado), espessura base do traco, taxa de quantizacao (passos/s).

---

## 5. Estrategia de testes

Toda a logica pura de `src/cobra/` e testavel sem jsdom (funcoes puras, sem DOM/canvas):

- **`trajetoria.ts`**: curva Catmull-Rom construida a partir de waypoints fixos conhecidos; `amostrar(0)` retorna o primeiro waypoint, `amostrar(1)` o ultimo; velocidade entre amostras aproximadamente constante (comprimento de arco); tabela de comprimento acumulado monotonica.
- **`motor.ts`**: buffer circular testado por insercoes sequenciais (sobrescrita correta no wraparound, sem alocacao observavel); quantizacao testada simulando avanco de tempo (so avanca passo a cada ~83ms); tabela de offsets testada por determinismo (mesma chamada, mesmo resultado, nunca `Math.random`).
- **`docking.ts`**: fator testado nos limites (0 antes da zona, 1 no fim), monotonicidade dentro da zona, simetria da reversao (voltar produz os mesmos valores intermediarios que ir).

A camada React (hook + componente canvas + playground) fica fora do escopo de teste unitario pesado (e integracao com GSAP/canvas real) - verificacao ali e via `/auditar-performance` e verificacao visual manual, como na Fase 0.

---

## Decisoes tomadas durante o brainstorming (registro)

1. Escopo: uma fase, um plano (nao dividir em 1a/1b).
2. Cobra de Scroll confirmada como feature central, conceito do CLAUDE.md mantido sem alteracao.
3. Waypoints: elemento DOM real por secao, lido via `getBoundingClientRect`.
4. Amostragem: parametrizacao por comprimento de arco (velocidade constante), nao por indice de segmento.
5. Buffer circular: 12 posicoes (mesmo numero da taxa de quantizacao, ~1s de rastro).
6. Traco do marcador: multi-passada (2-3 passadas desalinhadas), escolhido via mockup visual.
7. Docking: zona de proximidade com scrub reversivel, nao gatilho binario de duracao fixa.
8. Playground: rota dev-only com sliders para os 3 parametros, sem lib de rota adicional.

## Fora de escopo desta fase (fica para depois)

- Secoes reais do site (Hero, Sobre, Stack, Projetos, LabIA, Contato) - Fase 2.
- Pagina 404 com minigame reaproveitando `src/cobra/` - Fase 3.
- Auditoria de performance completa da cobra em producao (orcamento Lighthouse) - roda ao fechar a fase, mas a calibracao fina real de UX acontece quando as secoes existirem.
