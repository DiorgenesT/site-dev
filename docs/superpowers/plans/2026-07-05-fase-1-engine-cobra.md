# Fase 1, Engine da Cobra de Scroll, Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a engine pura da Cobra de Scroll (`src/cobra/`, sem React, com testes completos) e integra-la a React via canvas 2D, Lenis e GSAP (ScrollTrigger + Flip), incluindo uma pagina playground dev-only para calibrar velocidade, espessura do traco e taxa de quantizacao.

**Architecture:** Quatro modulos puros em `src/cobra/` (`tipos.ts`, `trajetoria.ts`, `motor.ts`, `docking.ts`), nenhum importando React, testados isoladamente com Vitest sem jsdom. Uma camada de integracao (`src/lib/gsap.ts`, `src/lib/movimento.ts`, `src/hooks/useCobra.ts`, `src/componentes/CamadaCobra.tsx`) conecta a engine a um unico canvas fixed na tela, dirigido por um unico `requestAnimationFrame` via `gsap.ticker`, com Lenis conectado ao ScrollTrigger. Uma pagina `src/paginas/Playground.tsx`, acessivel so em dev via `#playground`, expoe sliders para calibragem.

**Tech Stack:** GSAP 3.15.0 (core, ScrollTrigger, Flip) e Lenis 1.3.25, adicionados a stack ja existente (Vite, React 18.3.1, TypeScript strict, Tailwind v4, Vitest).

**Spec de referencia:** `docs/superpowers/specs/2026-07-05-fase-1-engine-cobra-design.md` (leia antes de comecar, todas as decisoes de design ja foram tomadas e aprovadas la). Contrato tecnico inegociavel da Cobra de Scroll: `CLAUDE.md` na raiz do repositorio (8 pontos).

**Fluxo de git obrigatorio, para cada Task abaixo (identico a Fase 0):**
1. Criar issue no GitHub em DiorgenesT/site-dev descrevendo a task.
2. Criar branch a partir de main (`feature/<numero>-<slug>` ou `chore/<numero>-<slug>`).
3. Implementar, rodar typecheck, lint, format e testes localmente.
4. So commitar apos o usuario confirmar que testou localmente.
5. Commitar, enviar (push), abrir PR para main.
6. Apos a confirmacao do usuario, o agente mergeia o PR diretamente (regra vigente desde 2026-07-05, documentada no CLAUDE.md).

**Nota operacional critica (repetida da Fase 0, ja causou um incidente real):** NUNCA rodar um scaffold, wizard de instalacao ou qualquer comando que possa perguntar "diretorio nao vazio, remover e continuar" na raiz do projeto. `npm install <pacote>` (com ou sem `-D`) e seguro e nao aciona esse tipo de prompt. Todas as instalacoes desta fase (`npm install gsap lenis`) sao seguras nesse sentido.

**Nota operacional:** o `gh` CLI precisa de `GODEBUG=netdns=cgo` antes de qualquer comando neste ambiente (WSL), senao falha com erro de conexao.

**Nota sobre incerteza de API do GSAP Flip:** a Task 10 usa `Flip.from(...)` de um jeito "scrubado" (progress() controlado manualmente pelo fator de docking, nao uma animacao de duracao fixa). Essa e a leitura mais plausivel da API do GSAP 3.15 para esse padrao, mas o autor deste plano nao tem acesso a documentacao live do GSAP no momento de escrever isto. **Quem implementar a Task 10 deve, antes de codar, inspecionar `node_modules/gsap/types/flip.d.ts` (apos `npm install`) para confirmar a assinatura exata de `Flip.getState`, `Flip.from` e do metodo de progresso do tween retornado, ajustando o codigo se a assinatura real divergir do que esta escrito abaixo.** Isso nao e um placeholder (o codigo abaixo e uma implementacao completa e a melhor hipotese), e uma instrucao de verificacao adicional dado o risco real de a API diferir.

---

## File Structure

```
site-dev/
  package.json (modificado: + gsap, lenis)
  eslint.config.js (modificado: regra no-restricted-imports para src/cobra/)
  src/
    cobra/
      tipos.ts
      trajetoria.ts
      trajetoria.test.ts
      motor.ts
      motor.test.ts
      docking.ts
      docking.test.ts
    lib/
      gsap.ts
      movimento.ts
    hooks/
      useCobra.ts
    componentes/
      CamadaCobra.tsx
    paginas/
      Playground.tsx
    testes/
      configurar.ts (modificado: stubs de ResizeObserver/IntersectionObserver/matchMedia)
    main.tsx (modificado: roteamento condicional dev-only para o playground)
    App.tsx (modificado: 2 ancoras reais + CamadaCobra)
    App.test.tsx (modificado se necessario)
```

Responsabilidade de cada modulo novo:
- `src/cobra/tipos.ts`: tipo `Ponto` compartilhado por toda a engine.
- `src/cobra/trajetoria.ts`: constroi uma curva Catmull-Rom a partir de waypoints e expoe amostragem por progresso (0..1) parametrizada por comprimento de arco (velocidade constante).
- `src/cobra/motor.ts`: buffer circular do corpo da cobra, quantizador stop motion, e a tabela fixa de passadas do traco multi-passada.
- `src/cobra/docking.ts`: fator de docking (0..1) puramente a partir do progresso do scroll, reversivel por construcao.
- `src/lib/gsap.ts`: carregamento lazy do GSAP core + ScrollTrigger + Flip (registrado uma unica vez).
- `src/lib/movimento.ts`: singleton lazy de Lenis conectado ao ScrollTrigger via `gsap.ticker`, com contagem de referencias.
- `src/hooks/useCobra.ts`: orquestra a engine com o DOM real (waypoints, ScrollTrigger, ResizeObserver, IntersectionObserver, visibilitychange, reduced-motion) e devolve o estado de renderizacao (buffer, fator de docking).
- `src/componentes/CamadaCobra.tsx`: o unico canvas fixed, desenha o corpo da cobra a partir do buffer, e dirige o crossfade de docking via GSAP Flip.
- `src/paginas/Playground.tsx`: pagina isolada dev-only para calibrar velocidade, espessura do traco e taxa de quantizacao com waypoints ficticios.

---

## Task 1: Instalar GSAP e Lenis

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 1: Instalar as dependencias (producao, nao dev)**

Run: `npm install gsap@3.15.0 lenis@1.3.25`

Nota: sao `dependencies`, nao `devDependencies` - fazem parte do bundle de producao (carregados lazy, mas sao codigo real da aplicacao).

- [ ] **Step 2: Confirmar que os tipos vem embutidos nos pacotes**

Run: `ls node_modules/gsap/types/ node_modules/lenis/dist/lenis.d.ts`
Expected: ambos existem, nao e necessario instalar `@types/gsap` ou `@types/lenis` (nenhum dos dois existe no DefinitelyTyped, os pacotes ja trazem seus proprios tipos).

- [ ] **Step 3: Rodar typecheck para confirmar que nada quebrou**

Run: `npx tsc -b`
Expected: sem erros (as novas dependencias ainda nao sao importadas em lugar nenhum, so a instalacao em si nao deve quebrar nada).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: instalar GSAP e Lenis"
```

---

## Task 2: cobra/tipos.ts e Catmull-Rom (curva densa)

**Files:**
- Create: `src/cobra/tipos.ts`, `src/cobra/trajetoria.ts`, `src/cobra/trajetoria.test.ts`
- Modify: `eslint.config.js`

- [ ] **Step 1: Adicionar regra de lint proibindo React em src/cobra/**

Editar `eslint.config.js`, adicionar um bloco de configuracao adicional (a regra do CLAUDE.md: "a pasta cobra/ nunca importa React"):

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.strict],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
    },
  },
  {
    files: ['src/cobra/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['react', 'react-dom', 'react/*', 'react-dom/*'] }],
    },
  },
  prettier,
);
```

- [ ] **Step 2: Criar tipos.ts**

```typescript
export interface Ponto {
  x: number;
  y: number;
}
```

- [ ] **Step 3: Escrever o teste da curva Catmull-Rom primeiro**

```typescript
import { describe, it, expect } from 'vitest';
import { amostrarCurvaUniforme, RESOLUCAO_COMPRIMENTO_ARCO } from './trajetoria';
import type { Ponto } from './tipos';

describe('amostrarCurvaUniforme', () => {
  it('retorna exatamente RESOLUCAO_COMPRIMENTO_ARCO pontos', () => {
    const waypoints: Ponto[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const amostras = amostrarCurvaUniforme(waypoints, RESOLUCAO_COMPRIMENTO_ARCO);
    expect(amostras).toHaveLength(RESOLUCAO_COMPRIMENTO_ARCO);
  });

  it('a primeira amostra coincide com o primeiro waypoint', () => {
    const waypoints: Ponto[] = [
      { x: 5, y: 3 },
      { x: 20, y: 8 },
      { x: 35, y: 2 },
    ];
    const amostras = amostrarCurvaUniforme(waypoints, 50);
    expect(amostras[0]?.x).toBeCloseTo(5, 5);
    expect(amostras[0]?.y).toBeCloseTo(3, 5);
  });

  it('a ultima amostra coincide com o ultimo waypoint', () => {
    const waypoints: Ponto[] = [
      { x: 5, y: 3 },
      { x: 20, y: 8 },
      { x: 35, y: 2 },
    ];
    const amostras = amostrarCurvaUniforme(waypoints, 50);
    const ultima = amostras[amostras.length - 1];
    expect(ultima?.x).toBeCloseTo(35, 5);
    expect(ultima?.y).toBeCloseTo(2, 5);
  });

  it('para 2 waypoints colineares no eixo x, todos os pontos ficam com y proximo de 0 e x cresce monotonicamente', () => {
    const waypoints: Ponto[] = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ];
    const amostras = amostrarCurvaUniforme(waypoints, 20);
    for (const ponto of amostras) {
      expect(ponto.y).toBeCloseTo(0, 5);
    }
    for (let i = 1; i < amostras.length; i += 1) {
      const anterior = amostras[i - 1];
      const atual = amostras[i];
      expect(atual?.x).toBeGreaterThanOrEqual(anterior?.x ?? 0);
    }
  });

  it('lanca erro com menos de 2 waypoints', () => {
    expect(() => amostrarCurvaUniforme([{ x: 0, y: 0 }], 10)).toThrow();
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npx vitest run src/cobra/trajetoria.test.ts`
Expected: FAIL, `Cannot find module './trajetoria'`.

- [ ] **Step 3: Implementar a curva Catmull-Rom em trajetoria.ts**

```typescript
import type { Ponto } from './tipos';

export const RESOLUCAO_COMPRIMENTO_ARCO = 200;

function obterPontoOuFalhar(pontos: readonly Ponto[], indice: number): Ponto {
  const ponto = pontos[indice];
  if (ponto === undefined) {
    throw new Error(`indice de waypoint fora da faixa: ${indice}`);
  }
  return ponto;
}

function catmullRom1D(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

function pontoNoSegmento(waypoints: readonly Ponto[], segmento: number, t: number): Ponto {
  const total = waypoints.length;
  const i0 = Math.max(segmento - 1, 0);
  const i1 = segmento;
  const i2 = Math.min(segmento + 1, total - 1);
  const i3 = Math.min(segmento + 2, total - 1);

  const p0 = obterPontoOuFalhar(waypoints, i0);
  const p1 = obterPontoOuFalhar(waypoints, i1);
  const p2 = obterPontoOuFalhar(waypoints, i2);
  const p3 = obterPontoOuFalhar(waypoints, i3);

  return {
    x: catmullRom1D(p0.x, p1.x, p2.x, p3.x, t),
    y: catmullRom1D(p0.y, p1.y, p2.y, p3.y, t),
  };
}

export function amostrarCurvaUniforme(waypoints: readonly Ponto[], resolucao: number): Ponto[] {
  if (waypoints.length < 2) {
    throw new Error('amostrarCurvaUniforme precisa de ao menos 2 waypoints');
  }

  const numSegmentos = waypoints.length - 1;
  const amostras: Ponto[] = [];

  for (let i = 0; i < resolucao; i += 1) {
    const progresso = resolucao === 1 ? 0 : i / (resolucao - 1);
    const posicaoGlobal = progresso * numSegmentos;
    const segmento = Math.min(Math.floor(posicaoGlobal), numSegmentos - 1);
    const t = posicaoGlobal - segmento;
    amostras.push(pontoNoSegmento(waypoints, segmento, t));
  }

  return amostras;
}
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npx vitest run src/cobra/trajetoria.test.ts`
Expected: PASS, 5 testes.

- [ ] **Step 5: Rodar lint para confirmar a regra nova**

Run: `npm run lint`
Expected: sem erros (o arquivo novo nao importa React, entao a regra `no-restricted-imports` nao dispara).

- [ ] **Step 6: Commit**

```bash
git add eslint.config.js src/cobra/tipos.ts src/cobra/trajetoria.ts src/cobra/trajetoria.test.ts
git commit -m "feat: adicionar curva Catmull-Rom da trajetoria da cobra"
```

---

## Task 3: trajetoria.ts, amostragem por comprimento de arco

**Files:**
- Modify: `src/cobra/trajetoria.ts`, `src/cobra/trajetoria.test.ts`

- [ ] **Step 1: Adicionar os testes de amostragem por progresso**

Adicionar ao final de `src/cobra/trajetoria.test.ts` (mantendo os testes existentes do Task 2):

```typescript
import { construirTrajetoria } from './trajetoria';

describe('construirTrajetoria', () => {
  it('amostrar(0) retorna o primeiro waypoint', () => {
    const trajetoria = construirTrajetoria([
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 0 },
    ]);
    const ponto = trajetoria.amostrar(0);
    expect(ponto.x).toBeCloseTo(0, 1);
    expect(ponto.y).toBeCloseTo(0, 1);
  });

  it('amostrar(1) retorna o ultimo waypoint', () => {
    const trajetoria = construirTrajetoria([
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 0 },
    ]);
    const ponto = trajetoria.amostrar(1);
    expect(ponto.x).toBeCloseTo(100, 1);
    expect(ponto.y).toBeCloseTo(0, 1);
  });

  it('parametriza por comprimento de arco, nao por indice de segmento (velocidade constante)', () => {
    // 3 waypoints colineares no eixo x, MUITO desigualmente espacados:
    // primeiro segmento tem comprimento 1, segundo tem comprimento 99.
    // Se fosse por indice de segmento, amostrar(0.5) cairia perto de x=1 (fim do primeiro segmento).
    // Por comprimento de arco, amostrar(0.5) deve cair perto do meio do comprimento TOTAL (100/2=50).
    const trajetoria = construirTrajetoria([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 100, y: 0 },
    ]);
    const meio = trajetoria.amostrar(0.5);
    expect(meio.x).toBeGreaterThan(40);
    expect(meio.x).toBeLessThan(60);
  });

  it('e monotonica em x para waypoints colineares crescentes', () => {
    const trajetoria = construirTrajetoria([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ]);
    let anteriorX = -Infinity;
    for (let i = 0; i <= 10; i += 1) {
      const ponto = trajetoria.amostrar(i / 10);
      expect(ponto.x).toBeGreaterThanOrEqual(anteriorX);
      anteriorX = ponto.x;
    }
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npx vitest run src/cobra/trajetoria.test.ts`
Expected: FAIL, `Cannot find export 'construirTrajetoria'`.

- [ ] **Step 3: Implementar construirTrajetoria, adicionando ao final de trajetoria.ts**

```typescript
export interface Trajetoria {
  amostrar(progresso: number): Ponto;
}

function distancia(a: Ponto, b: Ponto): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function construirTrajetoria(waypoints: readonly Ponto[]): Trajetoria {
  const amostras = amostrarCurvaUniforme(waypoints, RESOLUCAO_COMPRIMENTO_ARCO);

  const comprimentosAcumulados: number[] = [0];
  for (let i = 1; i < amostras.length; i += 1) {
    const anterior = obterPontoOuFalhar(amostras, i - 1);
    const atual = obterPontoOuFalhar(amostras, i);
    const comprimentoAnterior = comprimentosAcumulados[i - 1] ?? 0;
    comprimentosAcumulados.push(comprimentoAnterior + distancia(anterior, atual));
  }

  const comprimentoTotal = comprimentosAcumulados[comprimentosAcumulados.length - 1] ?? 0;

  function amostrar(progresso: number): Ponto {
    if (comprimentoTotal === 0) {
      return obterPontoOuFalhar(amostras, 0);
    }

    const progressoLimitado = Math.min(Math.max(progresso, 0), 1);
    const alvo = progressoLimitado * comprimentoTotal;

    let indice = 0;
    while (
      indice < comprimentosAcumulados.length - 1 &&
      (comprimentosAcumulados[indice + 1] ?? 0) < alvo
    ) {
      indice += 1;
    }

    const indiceSeguinte = Math.min(indice + 1, amostras.length - 1);
    const comprimentoInicio = comprimentosAcumulados[indice] ?? 0;
    const comprimentoFim = comprimentosAcumulados[indiceSeguinte] ?? comprimentoInicio;
    const fracao =
      comprimentoFim === comprimentoInicio
        ? 0
        : (alvo - comprimentoInicio) / (comprimentoFim - comprimentoInicio);

    const pontoInicio = obterPontoOuFalhar(amostras, indice);
    const pontoFim = obterPontoOuFalhar(amostras, indiceSeguinte);

    return {
      x: pontoInicio.x + (pontoFim.x - pontoInicio.x) * fracao,
      y: pontoInicio.y + (pontoFim.y - pontoInicio.y) * fracao,
    };
  }

  return { amostrar };
}
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npx vitest run src/cobra/trajetoria.test.ts`
Expected: PASS, 9 testes (5 do Task 2 + 4 novos).

- [ ] **Step 5: Rodar typecheck, lint e format**

Run: `npx tsc -b && npm run lint && npm run format:check`
Expected: tudo verde (rodar `npm run format` antes se format:check acusar).

- [ ] **Step 6: Commit**

```bash
git add src/cobra/trajetoria.ts src/cobra/trajetoria.test.ts
git commit -m "feat: adicionar amostragem por comprimento de arco na trajetoria"
```

---

## Task 4: motor.ts, buffer circular

**Files:**
- Create: `src/cobra/motor.ts`, `src/cobra/motor.test.ts`

- [ ] **Step 1: Escrever o teste do buffer circular primeiro**

```typescript
import { describe, it, expect } from 'vitest';
import { criarBufferCircular, inserirPosicao, obterPosicao, TAMANHO_BUFFER_CORPO } from './motor';

describe('buffer circular', () => {
  it('TAMANHO_BUFFER_CORPO e 12', () => {
    expect(TAMANHO_BUFFER_CORPO).toBe(12);
  });

  it('obterPosicao(0) retorna a posicao mais recente inserida', () => {
    const buffer = criarBufferCircular(4);
    inserirPosicao(buffer, { x: 1, y: 1 });
    inserirPosicao(buffer, { x: 2, y: 2 });
    const maisRecente = obterPosicao(buffer, 0);
    expect(maisRecente).toEqual({ x: 2, y: 2 });
  });

  it('obterPosicao(1) retorna a posicao anterior a mais recente', () => {
    const buffer = criarBufferCircular(4);
    inserirPosicao(buffer, { x: 1, y: 1 });
    inserirPosicao(buffer, { x: 2, y: 2 });
    const anterior = obterPosicao(buffer, 1);
    expect(anterior).toEqual({ x: 1, y: 1 });
  });

  it('faz wraparound corretamente ao exceder o tamanho do buffer', () => {
    const buffer = criarBufferCircular(3);
    inserirPosicao(buffer, { x: 1, y: 1 });
    inserirPosicao(buffer, { x: 2, y: 2 });
    inserirPosicao(buffer, { x: 3, y: 3 });
    inserirPosicao(buffer, { x: 4, y: 4 });
    // buffer de tamanho 3, a posicao {1,1} foi sobrescrita
    expect(obterPosicao(buffer, 0)).toEqual({ x: 4, y: 4 });
    expect(obterPosicao(buffer, 1)).toEqual({ x: 3, y: 3 });
    expect(obterPosicao(buffer, 2)).toEqual({ x: 2, y: 2 });
  });

  it('quantidadeEscrita cresce ate o tamanho maximo e para', () => {
    const buffer = criarBufferCircular(2);
    expect(buffer.quantidadeEscrita).toBe(0);
    inserirPosicao(buffer, { x: 1, y: 1 });
    expect(buffer.quantidadeEscrita).toBe(1);
    inserirPosicao(buffer, { x: 2, y: 2 });
    expect(buffer.quantidadeEscrita).toBe(2);
    inserirPosicao(buffer, { x: 3, y: 3 });
    expect(buffer.quantidadeEscrita).toBe(2);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npx vitest run src/cobra/motor.test.ts`
Expected: FAIL, `Cannot find module './motor'`.

- [ ] **Step 3: Implementar o buffer circular em motor.ts**

```typescript
import type { Ponto } from './tipos';

export const TAMANHO_BUFFER_CORPO = 12;

export interface BufferCircular {
  readonly tamanho: number;
  readonly x: Float32Array;
  readonly y: Float32Array;
  indiceMaisRecente: number;
  quantidadeEscrita: number;
}

export function criarBufferCircular(tamanho: number): BufferCircular {
  return {
    tamanho,
    x: new Float32Array(tamanho),
    y: new Float32Array(tamanho),
    indiceMaisRecente: -1,
    quantidadeEscrita: 0,
  };
}

export function inserirPosicao(buffer: BufferCircular, ponto: Ponto): void {
  buffer.indiceMaisRecente = (buffer.indiceMaisRecente + 1) % buffer.tamanho;
  buffer.x[buffer.indiceMaisRecente] = ponto.x;
  buffer.y[buffer.indiceMaisRecente] = ponto.y;
  buffer.quantidadeEscrita = Math.min(buffer.quantidadeEscrita + 1, buffer.tamanho);
}

export function obterPosicao(buffer: BufferCircular, deslocamento: number): Ponto {
  const indice =
    ((buffer.indiceMaisRecente - deslocamento) % buffer.tamanho + buffer.tamanho) % buffer.tamanho;
  const x = buffer.x[indice];
  const y = buffer.y[indice];
  if (x === undefined || y === undefined) {
    throw new Error(`indice de buffer fora da faixa: ${indice}`);
  }
  return { x, y };
}
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npx vitest run src/cobra/motor.test.ts`
Expected: PASS, 5 testes.

- [ ] **Step 5: Commit**

```bash
git add src/cobra/motor.ts src/cobra/motor.test.ts
git commit -m "feat: adicionar buffer circular do corpo da cobra"
```

---

## Task 5: motor.ts, quantizador stop motion

**Files:**
- Modify: `src/cobra/motor.ts`, `src/cobra/motor.test.ts`

- [ ] **Step 1: Adicionar os testes do quantizador**

Adicionar ao final de `src/cobra/motor.test.ts`:

```typescript
import { criarQuantizador, avancarQuantizador, PASSOS_POR_SEGUNDO } from './motor';

describe('quantizador stop motion', () => {
  it('PASSOS_POR_SEGUNDO e 12', () => {
    expect(PASSOS_POR_SEGUNDO).toBe(12);
  });

  it('intervaloMs e aproximadamente 83.33ms para 12 passos por segundo', () => {
    const quantizador = criarQuantizador(12);
    expect(quantizador.intervaloMs).toBeCloseTo(1000 / 12, 5);
  });

  it('nao avanca antes de acumular o intervalo completo', () => {
    const quantizador = criarQuantizador(12);
    expect(avancarQuantizador(quantizador, 16)).toBe(false);
    expect(avancarQuantizador(quantizador, 16)).toBe(false);
  });

  it('avanca exatamente quando o tempo acumulado atinge o intervalo', () => {
    const quantizador = criarQuantizador(12); // intervalo ~83.33ms
    avancarQuantizador(quantizador, 80);
    expect(avancarQuantizador(quantizador, 4)).toBe(true);
  });

  it('preserva o resto do tempo acumulado apos avancar (nao perde precisao)', () => {
    const quantizador = criarQuantizador(10); // intervalo exato de 100ms
    avancarQuantizador(quantizador, 120);
    expect(quantizador.tempoAcumulado).toBeCloseTo(20, 5);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npx vitest run src/cobra/motor.test.ts`
Expected: FAIL, `Cannot find export 'criarQuantizador'`.

- [ ] **Step 3: Implementar o quantizador, adicionando ao final de motor.ts**

```typescript
export const PASSOS_POR_SEGUNDO = 12;

export interface Quantizador {
  readonly intervaloMs: number;
  tempoAcumulado: number;
}

export function criarQuantizador(passosPorSegundo: number): Quantizador {
  return { intervaloMs: 1000 / passosPorSegundo, tempoAcumulado: 0 };
}

export function avancarQuantizador(quantizador: Quantizador, deltaMs: number): boolean {
  quantizador.tempoAcumulado += deltaMs;
  if (quantizador.tempoAcumulado >= quantizador.intervaloMs) {
    quantizador.tempoAcumulado -= quantizador.intervaloMs;
    return true;
  }
  return false;
}
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npx vitest run src/cobra/motor.test.ts`
Expected: PASS, 10 testes (5 do Task 4 + 5 novos).

- [ ] **Step 5: Commit**

```bash
git add src/cobra/motor.ts src/cobra/motor.test.ts
git commit -m "feat: adicionar quantizador stop motion"
```

---

## Task 6: motor.ts, tabela de passadas do traco

**Files:**
- Modify: `src/cobra/motor.ts`, `src/cobra/motor.test.ts`

- [ ] **Step 1: Adicionar o teste da tabela de passadas**

Adicionar ao final de `src/cobra/motor.test.ts`:

```typescript
import { PASSADAS_TRACO } from './motor';

describe('PASSADAS_TRACO', () => {
  it('tem exatamente 3 passadas', () => {
    expect(PASSADAS_TRACO).toHaveLength(3);
  });

  it('toda passada tem espessura positiva', () => {
    for (const passada of PASSADAS_TRACO) {
      expect(passada.espessura).toBeGreaterThan(0);
    }
  });

  it('as passadas tem deslocamentos distintos entre si (nao sao identicas)', () => {
    const chaves = PASSADAS_TRACO.map((p) => `${p.deslocamentoX},${p.deslocamentoY}`);
    const unicas = new Set(chaves);
    expect(unicas.size).toBe(PASSADAS_TRACO.length);
  });

  it('e uma tabela fixa e deterministica (mesma referencia sempre)', () => {
    // reimportar nao muda os valores, e uma constante de modulo, nunca gerada por Math.random
    expect(PASSADAS_TRACO[0]).toEqual({ deslocamentoX: 0, deslocamentoY: 0, espessura: 6 });
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npx vitest run src/cobra/motor.test.ts`
Expected: FAIL, `Cannot find export 'PASSADAS_TRACO'`.

- [ ] **Step 3: Implementar a tabela, adicionando ao final de motor.ts**

```typescript
export interface PassadaTraco {
  readonly deslocamentoX: number;
  readonly deslocamentoY: number;
  readonly espessura: number;
}

// Tabela fixa gerada uma unica vez, 3 passadas deterministas (nunca Math.random),
// estilo "rabisco nervoso": tres passadas levemente desalinhadas sobrepostas.
export const PASSADAS_TRACO: readonly PassadaTraco[] = [
  { deslocamentoX: 0, deslocamentoY: 0, espessura: 6 },
  { deslocamentoX: 1.5, deslocamentoY: -1, espessura: 4 },
  { deslocamentoX: -1, deslocamentoY: 1.2, espessura: 3 },
] as const;
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npx vitest run src/cobra/motor.test.ts`
Expected: PASS, 14 testes (10 do Task 5 + 4 novos).

- [ ] **Step 5: Rodar typecheck, lint e format completos**

Run: `npx tsc -b && npm run lint && npm run format:check`
Expected: tudo verde.

- [ ] **Step 6: Commit**

```bash
git add src/cobra/motor.ts src/cobra/motor.test.ts
git commit -m "feat: adicionar tabela de passadas do traco multi-passada"
```

---

## Task 7: docking.ts

**Files:**
- Create: `src/cobra/docking.ts`, `src/cobra/docking.test.ts`

- [ ] **Step 1: Escrever o teste primeiro**

```typescript
import { describe, it, expect } from 'vitest';
import { fatorDocking, INICIO_ZONA_DOCKING } from './docking';

describe('fatorDocking', () => {
  it('INICIO_ZONA_DOCKING e 0.92', () => {
    expect(INICIO_ZONA_DOCKING).toBeCloseTo(0.92, 5);
  });

  it('e 0 antes do inicio da zona', () => {
    expect(fatorDocking(0, 0.92)).toBe(0);
    expect(fatorDocking(0.5, 0.92)).toBe(0);
    expect(fatorDocking(0.92, 0.92)).toBe(0);
  });

  it('e 1 exatamente no fim do progresso', () => {
    expect(fatorDocking(1, 0.92)).toBeCloseTo(1, 5);
  });

  it('e monotonico crescente dentro da zona', () => {
    let anterior = -Infinity;
    for (let progresso = 0.92; progresso <= 1; progresso += 0.01) {
      const fator = fatorDocking(progresso, 0.92);
      expect(fator).toBeGreaterThanOrEqual(anterior);
      anterior = fator;
    }
  });

  it('nunca ultrapassa o intervalo [0, 1]', () => {
    for (let progresso = 0; progresso <= 1; progresso += 0.05) {
      const fator = fatorDocking(progresso, 0.92);
      expect(fator).toBeGreaterThanOrEqual(0);
      expect(fator).toBeLessThanOrEqual(1);
    }
  });

  it('e simetrico: o mesmo progresso sempre produz o mesmo fator (reversivel por construcao)', () => {
    const ida = fatorDocking(0.95, 0.92);
    const volta = fatorDocking(0.95, 0.92);
    expect(ida).toBe(volta);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npx vitest run src/cobra/docking.test.ts`
Expected: FAIL, `Cannot find module './docking'`.

- [ ] **Step 3: Implementar docking.ts**

```typescript
export const INICIO_ZONA_DOCKING = 0.92;

function suavizar(x: number): number {
  const limitado = Math.min(Math.max(x, 0), 1);
  return limitado * limitado * (3 - 2 * limitado);
}

export function fatorDocking(progresso: number, inicioZona: number): number {
  if (progresso <= inicioZona) {
    return 0;
  }
  const tamanhoZona = 1 - inicioZona;
  const fracao = tamanhoZona === 0 ? 1 : (progresso - inicioZona) / tamanhoZona;
  return suavizar(fracao);
}
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npx vitest run src/cobra/docking.test.ts`
Expected: PASS, 6 testes.

- [ ] **Step 5: Rodar o gate completo da engine pura**

Run: `npx tsc -b && npm run lint && npm run format:check && npm test`
Expected: tudo verde. Suite total deve ter 26 (Fase 0) + 9 (trajetoria) + 14 (motor) + 6 (docking) = 55 testes.

- [ ] **Step 6: Commit**

```bash
git add src/cobra/docking.ts src/cobra/docking.test.ts
git commit -m "feat: adicionar fator de docking da cobra"
```

---

## Task 8: src/lib/gsap.ts e src/lib/movimento.ts

**Files:**
- Create: `src/lib/gsap.ts`, `src/lib/movimento.ts`

Este task e de integracao (GSAP e Lenis reais), sem TDD unitario pesado - a verificacao e por typecheck/lint e, mais adiante, pela integracao visual no playground e no App.

- [ ] **Step 1: Criar src/lib/gsap.ts**

```typescript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

let pluginsRegistrados = false;

export function carregarGsap(): typeof gsap {
  if (!pluginsRegistrados) {
    gsap.registerPlugin(ScrollTrigger, Flip);
    pluginsRegistrados = true;
  }
  return gsap;
}

export { ScrollTrigger, Flip };
```

- [ ] **Step 2: Criar src/lib/movimento.ts**

```typescript
import Lenis from 'lenis';
import { carregarGsap, ScrollTrigger } from './gsap';

let lenis: Lenis | null = null;
let consumidores = 0;
let tickerRegistrado = false;

function aoTick(tempo: number): void {
  lenis?.raf(tempo * 1000);
}

export function iniciarMovimento(): void {
  consumidores += 1;

  const prefereReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefereReduzido) {
    return;
  }

  const gsap = carregarGsap();

  if (!lenis) {
    lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
  }

  if (!tickerRegistrado) {
    gsap.ticker.add(aoTick);
    tickerRegistrado = true;
  }
}

export function pararMovimento(): void {
  consumidores = Math.max(consumidores - 1, 0);
  if (consumidores === 0 && lenis) {
    carregarGsap().ticker.remove(aoTick);
    tickerRegistrado = false;
    lenis.destroy();
    lenis = null;
  }
}
```

- [ ] **Step 3: Rodar typecheck e lint**

Run: `npx tsc -b && npm run lint`
Expected: sem erros. Se `tsc` reclamar de tipos de `lenis.on('scroll', ...)` ou da assinatura de `ScrollTrigger.update`, inspecionar `node_modules/lenis/dist/lenis.d.ts` e `node_modules/gsap/types/` para ajustar a assinatura exata (mesma cautela da nota sobre Flip no topo do plano).

- [ ] **Step 4: Rodar o gate completo (nada deve ter regredido)**

Run: `npm test`
Expected: 55 testes, todos passando (nenhum teste novo neste task).

- [ ] **Step 5: Commit**

```bash
git add src/lib/gsap.ts src/lib/movimento.ts
git commit -m "feat: adicionar camada de movimento (GSAP + Lenis singleton)"
```

---

## Task 9: hooks/useCobra.ts

**Files:**
- Create: `src/hooks/useCobra.ts`
- Modify: `src/testes/configurar.ts`

- [ ] **Step 1: Adicionar stubs de ResizeObserver, IntersectionObserver e matchMedia ao setup de testes**

jsdom (o ambiente de teste) nao implementa `ResizeObserver`, `IntersectionObserver` nem `window.matchMedia` por padrao. Sem esses stubs, qualquer teste que renderize um componente usando `useCobra` (a partir do Task 11, quando `App.tsx` for modificado) lancaria erro. Editar `src/testes/configurar.ts`:

```typescript
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

if (typeof globalThis.ResizeObserver === 'undefined') {
  class ResizeObserverFalso {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  globalThis.ResizeObserver = ResizeObserverFalso as unknown as typeof ResizeObserver;
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  class IntersectionObserverFalso {
    root = null;
    rootMargin = '';
    thresholds: readonly number[] = [];
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  globalThis.IntersectionObserver = IntersectionObserverFalso as unknown as typeof IntersectionObserver;
}

if (typeof window.matchMedia === 'undefined') {
  window.matchMedia = (consulta: string): MediaQueryList =>
    ({
      matches: true,
      media: consulta,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
```

Nota importante: o stub de `matchMedia` retorna `matches: true` por padrao, simulando `prefers-reduced-motion: reduce` sempre ligado durante os testes. Isso e intencional: faz `useCobra` sair cedo (ver Step 2) sem tocar GSAP/ScrollTrigger/Lenis reais dentro do jsdom, evitando interacao fragil entre essas libs e o ambiente de teste. A integracao real com GSAP e verificada visualmente (playground, `/auditar-performance`), nao em testes unitarios - conforme a secao 5 da spec da Fase 1.

- [ ] **Step 2: Criar src/hooks/useCobra.ts**

```typescript
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { construirTrajetoria } from '../cobra/trajetoria';
import type { Trajetoria } from '../cobra/trajetoria';
import {
  criarBufferCircular,
  inserirPosicao,
  criarQuantizador,
  avancarQuantizador,
  TAMANHO_BUFFER_CORPO,
  PASSOS_POR_SEGUNDO,
  type BufferCircular,
} from '../cobra/motor';
import { fatorDocking, INICIO_ZONA_DOCKING } from '../cobra/docking';
import type { Ponto } from '../cobra/tipos';
import { carregarGsap, ScrollTrigger } from '../lib/gsap';
import { iniciarMovimento, pararMovimento } from '../lib/movimento';

interface OpcoesCobra {
  refInicio: RefObject<HTMLElement | null>;
  refFim: RefObject<HTMLElement | null>;
}

interface EstadoCobra {
  bufferRef: RefObject<BufferCircular>;
  fatorDocking: number;
}

function elementoParaPonto(elemento: HTMLElement): Ponto {
  const retangulo = elemento.getBoundingClientRect();
  return {
    x: retangulo.left + retangulo.width / 2 + window.scrollX,
    y: retangulo.top + retangulo.height / 2 + window.scrollY,
  };
}

export function useCobra({ refInicio, refFim }: OpcoesCobra): EstadoCobra {
  const bufferRef = useRef<BufferCircular>(criarBufferCircular(TAMANHO_BUFFER_CORPO));
  const [fator, setFator] = useState(0);

  useEffect(() => {
    const prefereReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefereReduzido) {
      return undefined;
    }

    const elementoInicio = refInicio.current;
    const elementoFim = refFim.current;
    if (!elementoInicio || !elementoFim) {
      return undefined;
    }

    let trajetoria: Trajetoria = construirTrajetoria([
      elementoParaPonto(elementoInicio),
      elementoParaPonto(elementoFim),
    ]);
    const quantizador = criarQuantizador(PASSOS_POR_SEGUNDO);
    let progressoAtual = 0;
    let visivelAba = document.visibilityState === 'visible';
    let visivelTela = true;

    const gsap = carregarGsap();

    const scrollTrigger = ScrollTrigger.create({
      trigger: elementoInicio,
      endTrigger: elementoFim,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progressoAtual = self.progress;
      },
    });

    let resizeTimeoutId: ReturnType<typeof setTimeout> | undefined;
    function aoRedimensionar(): void {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(() => {
        trajetoria = construirTrajetoria([
          elementoParaPonto(elementoInicio),
          elementoParaPonto(elementoFim),
        ]);
        scrollTrigger.refresh();
      }, 150);
    }
    const observadorRedimensionamento = new ResizeObserver(aoRedimensionar);
    observadorRedimensionamento.observe(document.body);

    function aoMudarVisibilidadeAba(): void {
      visivelAba = document.visibilityState === 'visible';
    }
    document.addEventListener('visibilitychange', aoMudarVisibilidadeAba);

    const observadorIntersecao = new IntersectionObserver(
      (entradas) => {
        const entrada = entradas[0];
        visivelTela = entrada ? entrada.isIntersecting : true;
      },
      { threshold: 0 },
    );
    observadorIntersecao.observe(elementoInicio);

    function aoTick(_tempo: number, deltaMs: number): void {
      if (!visivelAba || !visivelTela) {
        return;
      }
      const avancou = avancarQuantizador(quantizador, deltaMs);
      if (avancou) {
        const ponto = trajetoria.amostrar(progressoAtual);
        inserirPosicao(bufferRef.current, ponto);
        setFator(fatorDocking(progressoAtual, INICIO_ZONA_DOCKING));
      }
    }

    gsap.ticker.add(aoTick);
    iniciarMovimento();

    return () => {
      gsap.ticker.remove(aoTick);
      pararMovimento();
      scrollTrigger.kill();
      observadorRedimensionamento.disconnect();
      observadorIntersecao.disconnect();
      document.removeEventListener('visibilitychange', aoMudarVisibilidadeAba);
      clearTimeout(resizeTimeoutId);
    };
  }, [refInicio, refFim]);

  return { bufferRef, fatorDocking: fator };
}
```

- [ ] **Step 3: Rodar typecheck e lint**

Run: `npx tsc -b && npm run lint`
Expected: sem erros. Se `ScrollTrigger.create({...})` reclamar de tipos (`trigger`, `endTrigger`, `onUpdate`), inspecionar `node_modules/gsap/types/` e ajustar.

- [ ] **Step 4: Rodar o gate completo**

Run: `npm test`
Expected: 55 testes, todos passando (este hook nao tem teste unitario dedicado, e integracao com DOM/GSAP real - sera exercitado indiretamente no Task 11 via App.test.tsx).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCobra.ts src/testes/configurar.ts
git commit -m "feat: adicionar hook useCobra de orquestracao da engine"
```

---

## Task 10: componentes/CamadaCobra.tsx

**Files:**
- Create: `src/componentes/CamadaCobra.tsx`

**Antes de codar:** inspecionar `node_modules/gsap/types/flip.d.ts` para confirmar a assinatura exata de `Flip.getState`, `Flip.from` e do metodo `.progress()` do tween retornado. O codigo abaixo e a melhor implementacao possivel sem acesso a documentacao live do GSAP - ajustar se a API real divergir (ver nota no topo do plano).

- [ ] **Step 1: Criar CamadaCobra.tsx**

```typescript
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useCobra } from '../hooks/useCobra';
import { obterPosicao, PASSADAS_TRACO } from '../cobra/motor';
import { carregarGsap, Flip } from '../lib/gsap';

interface CamadaCobraProps {
  refInicio: RefObject<HTMLElement | null>;
  refFim: RefObject<HTMLElement | null>;
  refBotaoDestino: RefObject<HTMLElement | null>;
}

export function CamadaCobra({ refInicio, refFim, refBotaoDestino }: CamadaCobraProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const eloRef = useRef<HTMLDivElement | null>(null);
  const flipTweenRef = useRef<gsap.core.Tween | null>(null);
  const { bufferRef, fatorDocking } = useCobra({ refInicio, refFim });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }
    const contexto = canvas.getContext('2d');
    if (!contexto) {
      return undefined;
    }

    function redimensionar(): void {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    redimensionar();
    window.addEventListener('resize', redimensionar);

    function desenhar(): void {
      if (!canvas) return;
      const buffer = bufferRef.current;
      contexto?.clearRect(0, 0, canvas.width, canvas.height);
      if (!contexto || buffer.quantidadeEscrita < 2) {
        return;
      }
      for (const passada of PASSADAS_TRACO) {
        contexto.beginPath();
        contexto.lineWidth = passada.espessura;
        contexto.strokeStyle = '#0a0a0a';
        contexto.lineCap = 'round';
        contexto.lineJoin = 'round';
        for (let i = 0; i < buffer.quantidadeEscrita; i += 1) {
          const ponto = obterPosicao(buffer, i);
          const x = ponto.x + passada.deslocamentoX - window.scrollX;
          const y = ponto.y + passada.deslocamentoY - window.scrollY;
          if (i === 0) {
            contexto.moveTo(x, y);
          } else {
            contexto.lineTo(x, y);
          }
        }
        contexto.stroke();
      }
    }

    const gsap = carregarGsap();
    gsap.ticker.add(desenhar);

    return () => {
      gsap.ticker.remove(desenhar);
      window.removeEventListener('resize', redimensionar);
    };
  }, [bufferRef]);

  useEffect(() => {
    const elo = eloRef.current;
    const botao = refBotaoDestino.current;
    if (!elo || !botao) {
      return;
    }

    if (!flipTweenRef.current) {
      const estado = Flip.getState(elo);
      flipTweenRef.current = Flip.from(estado, {
        targets: botao,
        paused: true,
        absolute: true,
      });
    }

    flipTweenRef.current.progress(fatorDocking);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.opacity = String(1 - fatorDocking);
    }
    botao.style.opacity = String(fatorDocking);
  }, [fatorDocking, refBotaoDestino]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40"
      />
      <div ref={eloRef} aria-hidden="true" className="pointer-events-none fixed h-10 w-10 opacity-0" />
    </>
  );
}
```

- [ ] **Step 2: Rodar typecheck e lint**

Run: `npx tsc -b && npm run lint`
Expected: sem erros. Se `gsap.core.Tween` nao for o tipo certo para o retorno de `Flip.from`, ou se `.progress()` tiver assinatura diferente, ajustar conforme a inspecao de tipos mencionada no topo do Step 1.

- [ ] **Step 3: Rodar o gate completo**

Run: `npm test`
Expected: 55 testes, todos passando (componente ainda nao esta montado em nenhum lugar, sem teste dedicado - e integracao pesada com canvas/GSAP/Flip real).

- [ ] **Step 4: Commit**

```bash
git add src/componentes/CamadaCobra.tsx
git commit -m "feat: adicionar componente CamadaCobra (canvas + docking via Flip)"
```

---

## Task 11: Integrar a CamadaCobra no App.tsx

**Files:**
- Modify: `src/App.tsx`, `src/App.test.tsx`

- [ ] **Step 1: Atualizar o teste do App para incluir os elementos-ancora**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renderiza os componentes base da fundacao sem lancar erro', () => {
    render(<App />);
    expect(screen.getByLabelText('DG')).toBeInTheDocument();
    expect(screen.getByText('Python & AI Engineer')).toBeInTheDocument();
  });

  it('renderiza o botao de destino da cobra', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Fale comigo' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL, nao existe nenhum botao "Fale comigo" no App atual.

- [ ] **Step 3: Atualizar App.tsx com as ancoras e a CamadaCobra**

```typescript
import { useRef } from 'react';
import { Adesivo } from './componentes/Adesivo';
import { FitaAdesiva } from './componentes/FitaAdesiva';
import { PapelRasgado } from './componentes/PapelRasgado';
import { Carimbo } from './componentes/Carimbo';
import { NotaDeResgate } from './componentes/NotaDeResgate';
import { CamadaCobra } from './componentes/CamadaCobra';

export default function App() {
  const refInicio = useRef<HTMLDivElement>(null);
  const refFim = useRef<HTMLDivElement>(null);
  const refBotaoDestino = useRef<HTMLButtonElement>(null);

  return (
    <main className="min-h-screen bg-branco-papel text-preto-tinta p-8 textura-granulada">
      <NotaDeResgate texto="DG" />
      <div className="mt-4">
        <FitaAdesiva indice={1}>Python & AI Engineer</FitaAdesiva>
      </div>
      <div className="mt-4">
        <Adesivo indice={0}>Fundacao da Fase 0 pronta</Adesivo>
      </div>
      <div className="mt-4">
        <Carimbo indice={4}>04.07.2026</Carimbo>
      </div>
      <PapelRasgado />

      <div ref={refInicio} aria-hidden="true" />
      <div style={{ height: '150vh' }} />
      <div ref={refFim} aria-hidden="true" className="flex justify-center py-16">
        <button
          ref={refBotaoDestino}
          type="button"
          className="bg-vermelho-punk text-branco-papel px-6 py-3 font-bold uppercase tracking-widest opacity-0"
        >
          Fale comigo
        </button>
      </div>

      <CamadaCobra refInicio={refInicio} refFim={refFim} refBotaoDestino={refBotaoDestino} />
    </main>
  );
}
```

Nota: o botao comeca com `opacity-0` na classe (estado inicial antes do docking) - o `useEffect` da `CamadaCobra` sobrescreve `style.opacity` em tempo real conforme `fatorDocking`, mas o valor inicial via classe evita um "flash" do botao visivel antes do primeiro tick.

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS, 2 testes. (Como `matchMedia` esta mockado com `matches: true` no setup de testes, `useCobra` sai cedo e nao tenta rodar GSAP/ScrollTrigger real durante o teste - o botao existe no DOM independente disso, garantindo acessibilidade mesmo com a cobra desligada.)

- [ ] **Step 5: Rodar o gate completo da fase**

Run: `npx tsc -b && npm run lint && npm run format:check && npm test && npx vite build`
Expected: typecheck, lint, format, todos os testes (56: 55 anteriores + 1 novo) e build de producao passam sem erro.

- [ ] **Step 6: Verificacao visual manual**

Run: `npm run dev`, abrir no navegador, rolar a pagina lentamente. Confirmar: a cobra (rabisco preto multi-passada) aparece e acompanha o scroll entre o topo e a regiao do botao "Fale comigo"; ao chegar perto do fim, o botao vai ganhando opacidade enquanto o canvas perde (crossfade); testar `prefers-reduced-motion` (ativar nas configuracoes do SO ou DevTools) e confirmar que a cobra nao aparece e o botao "Fale comigo" fica visível de forma estática (sem depender do JS da cobra). Parar o servidor apos validar.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: integrar CamadaCobra ao App com ancoras reais de demonstracao"
```

---

## Task 12: paginas/Playground.tsx (dev-only)

**Files:**
- Create: `src/paginas/Playground.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Criar Playground.tsx**

```typescript
import { useRef, useState } from 'react';
import { CamadaCobra } from '../componentes/CamadaCobra';

export default function Playground() {
  const refInicio = useRef<HTMLDivElement>(null);
  const refFim = useRef<HTMLDivElement>(null);
  const refBotaoDestino = useRef<HTMLButtonElement>(null);
  const [velocidade, setVelocidade] = useState(150);
  const [espessura, setEspessura] = useState(6);
  const [quantizacao, setQuantizacao] = useState(12);

  return (
    <main className="min-h-screen bg-branco-papel text-preto-tinta p-8">
      <h1 className="text-2xl font-bold mb-4">Playground da Cobra de Scroll (dev only)</h1>

      <div className="mb-8 flex flex-col gap-4 max-w-md">
        <label className="flex flex-col gap-1">
          Velocidade (altura do scroll simulado, vh): {velocidade}
          <input
            type="range"
            min={50}
            max={400}
            value={velocidade}
            onChange={(evento) => setVelocidade(Number(evento.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1">
          Espessura base do traco: {espessura}
          <input
            type="range"
            min={2}
            max={16}
            value={espessura}
            onChange={(evento) => setEspessura(Number(evento.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1">
          Taxa de quantizacao (passos/s): {quantizacao}
          <input
            type="range"
            min={4}
            max={30}
            value={quantizacao}
            onChange={(evento) => setQuantizacao(Number(evento.target.value))}
          />
        </label>
        <p className="text-sm">
          Nota: os sliders acima registram a intencao de calibragem; a Fase 1 fixa os parametros
          reais em <code>src/cobra/motor.ts</code> (TAMANHO_BUFFER_CORPO, PASSOS_POR_SEGUNDO,
          PASSADAS_TRACO). Ajustar esses valores no codigo apos calibrar visualmente aqui e parte
          do processo desta pagina, nao ha ligacao automatica ainda entre os sliders e a engine
          nesta primeira versao do playground.
        </p>
      </div>

      <div ref={refInicio} aria-hidden="true" />
      <div style={{ height: `${velocidade}vh` }} />
      <div ref={refFim} aria-hidden="true" className="flex justify-center py-16">
        <button
          ref={refBotaoDestino}
          type="button"
          className="bg-vermelho-punk text-branco-papel px-6 py-3 font-bold uppercase tracking-widest opacity-0"
        >
          CTA de teste
        </button>
      </div>

      <CamadaCobra refInicio={refInicio} refFim={refFim} refBotaoDestino={refBotaoDestino} />
    </main>
  );
}
```

Nota: os sliders de espessura e quantizacao ainda nao alimentam `CamadaCobra`/`useCobra` diretamente nesta primeira versao (eles nao aceitam parametros configuraveis - `TAMANHO_BUFFER_CORPO`, `PASSOS_POR_SEGUNDO` e `PASSADAS_TRACO` sao constantes fixas em `motor.ts`). Isso e uma limitacao conhecida e aceitavel para o escopo da Fase 1: o playground serve para visualizar o comportamento atual e decidir se as constantes fixas precisam mudar, nao para configuracao ao vivo. Se o usuario quiser calibragem ao vivo de fato, isso e uma extensao de escopo a ser discutida separadamente (nao assumir agora).

- [ ] **Step 2: Modificar main.tsx para renderizar o playground condicionalmente**

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Elemento raiz nao encontrado');
}

const ehPlayground = import.meta.env.DEV && window.location.hash === '#playground';

async function renderizar(): Promise<void> {
  const Componente = ehPlayground ? (await import('./paginas/Playground.tsx')).default : App;
  createRoot(rootElement).render(
    <StrictMode>
      <Componente />
    </StrictMode>,
  );
}

void renderizar();
```

- [ ] **Step 3: Rodar typecheck, lint e format**

Run: `npx tsc -b && npm run lint && npm run format:check`
Expected: tudo verde (rodar `npm run format` se necessario).

- [ ] **Step 4: Rodar o gate completo**

Run: `npm test && npx vite build`
Expected: 56 testes passando, build de producao sem erro. Conferir que o build de producao NAO inclui `Playground.tsx` no chunk inicial (e um import dinamico `await import(...)`, condicionado a `import.meta.env.DEV`, entao o Vite deve fazer tree-shake dele fora do bundle de producao).

Run adicional: `npx vite build && grep -r "Playground" dist/ || echo "Playground ausente do build, como esperado"`
Expected: "Playground ausente do build, como esperado" (o codigo de import.meta.env.DEV e eliminado em build de producao pelo Vite).

- [ ] **Step 5: Verificacao visual manual do playground**

Run: `npm run dev`, abrir `http://localhost:5173/#playground` no navegador. Confirmar que a pagina mostra os 3 sliders, e que rolar a pagina faz a cobra se mover e fazer docking no botao "CTA de teste", igual ao comportamento no App real. Parar o servidor apos validar.

- [ ] **Step 6: Commit**

```bash
git add src/paginas/Playground.tsx src/main.tsx
git commit -m "feat: adicionar pagina playground dev-only da cobra"
```

---

## Task 13: Gate final da Fase 1

**Files:**
- Nenhum arquivo novo, so verificacao.

- [ ] **Step 1: Gate completo, tudo verde**

Run: `npx tsc -b && npm run lint && npm run format:check && npm test && npx vite build`
Expected: typecheck, lint, format, 56 testes e build de producao passam sem erro.

- [ ] **Step 2: Checagem manual dos 8 pontos do contrato tecnico da cobra (CLAUDE.md)**

Percorrer cada ponto e confirmar por leitura de codigo:
1. Canvas unico fixed, pointer-events none, aria-hidden true: `CamadaCobra.tsx`, elemento `<canvas>`.
2. Botoes reais sempre no DOM: o botao "Fale comigo" existe no DOM desde o mount, independente do estado da cobra.
3. Trajetoria pre-computada, leitura de layout so no mount e resize debounced: `useCobra.ts`, `elementoParaPonto` so chamado no mount e dentro do `setTimeout` de 150ms do `ResizeObserver`.
4. rAF unico no ticker do GSAP, Lenis conectado ao ScrollTrigger: `gsap.ticker` mantem internamente um unico `requestAnimationFrame` do navegador; cada chamada a `gsap.ticker.add(...)` apenas registra mais um assinante que roda dentro desse mesmo rAF a cada frame (nao cria um novo loop). `movimento.ts` registra `aoTick` (avanca o Lenis), `useCobra.ts` registra o `aoTick` que amostra a trajetoria e atualiza o buffer, e `CamadaCobra.tsx` registra `desenhar` (le o buffer e pinta o canvas) - sao 3 assinantes de um unico ticker/rAF, o que satisfaz o contrato ("um unico rAF", nao "uma unica funcao"). Nenhuma refatoracao e necessaria aqui.
5. Buffer circular tipado sem alocacao no loop, offsets pre-gerados: `motor.ts`, `BufferCircular` com `Float32Array`, `PASSADAS_TRACO` como tabela fixa.
6. Docking via GSAP Flip: `CamadaCobra.tsx`, `Flip.from` scrubado por `fatorDocking`.
7. prefers-reduced-motion desliga tudo: `useCobra.ts`, primeira linha do efeito.
8. IntersectionObserver e visibilitychange pausam o loop: `useCobra.ts`, ambos implementados e combinados em `aoTick`.

- [ ] **Step 3: Validar com o subagente arquiteto**

Delegar ao `arquiteto` (ou, se o subagente customizado nao for reconhecido pelo Agent tool, um `general-purpose` com as instrucoes do arquivo `.claude/agents/arquiteto.md` coladas no prompt) a validacao dos 8 pontos do contrato contra a implementacao real (nao o plano). Corrigir o que for apontado como bloqueante antes de considerar a fase fechada.

- [ ] **Step 4: Rodar /auditar-performance**

Delegar ao `auditor-performance` (mesmo cuidado de fallback do Step 3) o checklist completo: build com analise de chunks (GSAP, Lenis e a engine da cobra devem estar em chunk lazy, carregado so apos o primeiro paint, JS inicial ainda abaixo de 150KB gzip), grep por `getBoundingClientRect`/`scrollY`/`innerWidth` fora de mount/resize/boot, Math.random em qualquer lugar do codigo da cobra, fontes, reduced-motion. Reprovacao bloqueia o fechamento da fase.
