# Fase 0, Fundacao, Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deixar o repositorio diorgenes.dev com fundacao tecnica funcionando: scaffold Vite + React 18 + TypeScript strict, tooling (ESLint, Prettier, Vitest, Testing Library), Tailwind CSS v4, tokens de design deterministas do sistema zine (paleta, tipografia, rotacao e jitter, granulacao de fotocopia) e os 5 componentes base de UI pura (Adesivo, FitaAdesiva, PapelRasgado, Carimbo, NotaDeResgate), todos com build, typecheck, lint e testes verdes.

**Architecture:** Scaffold minimo do Vite com template react-ts, depois configuracao de tooling em camadas independentes (lint, format, testes, estilos), depois uma camada de tokens puros em TypeScript (sem React, testavel em isolamento) e por fim os componentes de apresentacao que consomem esses tokens. Nenhuma logica da Cobra de Scroll entra nesta fase, ela pertence a src/cobra/ na Fase 1.

**Tech Stack:** Vite 8, React 18.3 (fixado, o scaffold padrao do npm instala React 19 e deve ser corrigido), TypeScript 6 (strict), Tailwind CSS v4 (via @tailwindcss/vite), ESLint 10 (flat config), Prettier 3, Vitest 4, @testing-library/react e jest-dom.

**Fluxo de git obrigatorio (CLAUDE.md), para cada Task abaixo:**

1. Criar issue no GitHub em DiorgenesT/site-dev descrevendo a task.
2. Criar branch a partir de main: `feature/<numero-da-issue>-<slug>` ou `chore/<numero-da-issue>-<slug>` (tasks de setup sao `chore`, tokens e componentes sao `feat`).
3. Implementar, rodar typecheck, lint e testes localmente.
4. So commitar apos eu confirmar que testei localmente (regra do CLAUDE.md, nunca commitar sem essa confirmacao).
5. Abrir PR para main.
6. Apos minha confirmacao de teste local (passo 4), o agente mergeia o PR no GitHub diretamente (gh pr merge), sem precisar de acao manual minha (regra atualizada em 2026-07-05, substitui a regra original de merge exclusivo pelo usuario).

**Nota operacional para quem for executar `gh`:** neste ambiente (WSL) o resolver DNS puro do Go falha para `api.github.com` mesmo com internet funcionando (curl funciona, `gh` nao). Rodar sempre com `GODEBUG=netdns=cgo` antes de qualquer comando `gh`, por exemplo `GODEBUG=netdns=cgo gh issue create ...`. Sem isso o comando falha com "error connecting to api.github.com".

**Nota operacional critica sobre scaffolding em diretorio nao vazio:** o CLI `npm create vite@latest .` (e ferramentas similares), ao encontrar um diretorio de destino nao vazio, pode oferecer para "remover os arquivos existentes e continuar". Confirmar essa opcao APAGA TUDO no diretorio, inclusive arquivos que nao tem nada a ver com o scaffold (CLAUDE.md, docs/, .claude/agents, .claude/commands, .claude/skills, .git preservado mas conteudo de trabalho nao commitado se perde). Nunca confirmar uma limpeza automatica de diretorio nao vazio sem antes checar exatamente o que sera removido. Se o CLI nao aceitar rodar em diretorio nao vazio sem limpar, rodar o scaffold em um diretorio temporario vazio e copiar manualmente apenas os arquivos relevantes (package.json, index.html, vite.config.ts, tsconfig*.json, src/, public/), nunca deixar a ferramenta apagar o diretorio de trabalho atual.

---

## File Structure

```
site-dev/
  index.html
  package.json
  tsconfig.json
  tsconfig.app.json
  tsconfig.node.json
  vite.config.ts
  eslint.config.js
  .prettierrc.json
  .prettierignore
  public/
    textura/
      granulacao.svg
  src/
    main.tsx
    App.tsx
    index.css
    testes/
      configurar.ts
    estilos/
      contraste.ts
      contraste.test.ts
      tokens.ts
      tokens.test.ts
    componentes/
      Adesivo.tsx
      Adesivo.test.tsx
      FitaAdesiva.tsx
      FitaAdesiva.test.tsx
      PapelRasgado.tsx
      PapelRasgado.test.tsx
      Carimbo.tsx
      Carimbo.test.tsx
      NotaDeResgate.tsx
      NotaDeResgate.test.tsx
```

Responsabilidade de cada modulo novo:

- `src/estilos/contraste.ts`: funcao pura de calculo de contraste WCAG, usada para provar (via teste) que os acentos vermelho e amarelo atingem 4.5:1 nos pares de fundo em que sao usados como texto.
- `src/estilos/tokens.ts`: paleta de cores, familias tipograficas, tabela fixa de rotacoes e tabela fixa de jitter (ambas deterministas, sem Math.random).
- `src/componentes/*`: cinco componentes de apresentacao pura, cada um consumindo os tokens, sem logica de negocio.
- `public/textura/granulacao.svg`: unico tile de granulacao de fotocopia, reutilizado via CSS (`background-repeat: repeat` + `mix-blend-mode`), nunca textura fullscreen.

---

## Task 1: Scaffold Vite + React 18 + TypeScript strict

**Files:**

- Create: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `src/main.tsx`, `src/App.tsx`, `src/index.css`

- [ ] **Step 1: Rodar o scaffold oficial do Vite**

O diretorio atual JA CONTEM arquivos do projeto (CLAUDE.md, .claude/, docs/, .gitignore) que NAO podem ser apagados. Rodar o scaffold em um diretorio temporario vazio e depois copiar so os arquivos do scaffold para a raiz do projeto:

```bash
mkdir -p /tmp/scaffold-site-dev
cd /tmp/scaffold-site-dev
npm create vite@latest . -- --template react-ts
```

Confirmar qualquer prompt de "diretorio vazio" normalmente (o diretorio temporario esta de fato vazio, sem risco). Depois, copiar para a raiz do projeto (`/home/dg/projetos/site-dev`) apenas: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `src/` e `public/` (mesclar `public/` se ja existir algo la, sem sobrescrever nada fora do escopo do scaffold). NAO copiar `.gitignore` do template por cima do `.gitignore` existente no projeto (o projeto ja tem um `.gitignore` proprio criado na Etapa 2 do setup, com regras especificas de CLAUDE.md e settings.local.json, ele deve ser preservado; adicionar a ele manualmente qualquer regra do template do Vite que fizer sentido, como `dist`, `node_modules`, ja devem estar cobertas). NAO copiar `README.md` do template (o projeto nao pediu um). Remover o diretorio temporario no final.

- [ ] **Step 2: Fixar versoes da stack fechada (React 18, nao React 19)**

O scaffold do Vite instala React 19 por padrao. Editar `package.json` para fixar:

```json
{
  "dependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/react": "18.3.31",
    "@types/react-dom": "18.3.1"
  }
}
```

Run: `npm install`

- [ ] **Step 3: Ativar strict total no tsconfig.app.json**

Editar `tsconfig.app.json`, garantir que `compilerOptions` contenha:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

- [ ] **Step 4: Rodar typecheck e build para validar o scaffold**

Run: `npx tsc -b && npx vite build`
Expected: build conclui sem erros, gera pasta `dist/`.

- [ ] **Step 5: Confirmar que nada fora do escopo do scaffold foi alterado ou removido**

Run: `ls CLAUDE.md && ls docs/superpowers/plans/ && find .claude/agents .claude/commands -type f`
Expected: todos os arquivos de governanca (CLAUDE.md, o proprio plano da fase, os 4 agentes e os 2 comandos) continuam presentes e inalterados. Se qualquer um sumiu, PARAR e reportar BLOCKED antes de continuar, nao seguir para o commit.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json src/main.tsx src/App.tsx src/index.css src/vite-env.d.ts src/assets public
git commit -m "chore: inicializar projeto com Vite, React 18 e TypeScript strict"
```

---

## Task 2: Configurar ESLint e Prettier

**Files:**

- Create: `eslint.config.js`, `.prettierrc.json`, `.prettierignore`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Instalar dependencias de lint e format**

Run: `npm install -D eslint@10 @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh prettier eslint-config-prettier globals`

- [ ] **Step 2: Escrever eslint.config.js**

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
  prettier,
);
```

- [ ] **Step 3: Escrever .prettierrc.json e .prettierignore**

`.prettierrc.json`:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

`.prettierignore`:

```
dist
coverage
package-lock.json
```

- [ ] **Step 4: Remover o oxlint do scaffold (nao faz parte da stack escolhida)**

O template do Vite usado no Task 1 pode ter incluido `oxlint` (arquivo `.oxlintrc.json`, devDependency `oxlint`, script `"lint": "oxlint"`). O projeto usa ESLint, nao oxlint. Remover:

```bash
npm uninstall oxlint
rm -f .oxlintrc.json
```

- [ ] **Step 5: Adicionar scripts no package.json**

```json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

- [ ] **Step 6: Rodar lint e format:check**

Run: `npm run lint && npm run format:check`
Expected: sem erros (rodar `npm run format` antes se `format:check` acusar arquivos do scaffold fora do padrao).

- [ ] **Step 7: Commit**

```bash
git add eslint.config.js .prettierrc.json .prettierignore package.json package-lock.json
git commit -m "chore: configurar ESLint e Prettier"
```

---

## Task 3: Configurar Vitest e Testing Library

**Files:**

- Modify: `vite.config.ts`, `tsconfig.app.json`, `package.json`
- Create: `src/testes/configurar.ts`

- [ ] **Step 1: Instalar dependencias de teste**

Run: `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`

- [ ] **Step 2: Escrever src/testes/configurar.ts**

```typescript
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Adicionar bloco test ao vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testes/configurar.ts'],
    globals: false,
  },
});
```

- [ ] **Step 4: Adicionar tipos de teste ao tsconfig.app.json**

Como `globals: false` foi escolhido no Step 3 (import explicito de `describe`, `it`, `expect` em cada teste, mais rastreavel), o tsconfig nao precisa de `vitest/globals`. Adicionar apenas o tipo do jest-dom, para os matchers (`toBeInTheDocument`, etc) serem reconhecidos pelo TypeScript:

```json
{
  "compilerOptions": {
    "types": ["@testing-library/jest-dom"]
  }
}
```

- [ ] **Step 5: Adicionar script de teste**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 6: Escrever um teste trivial para validar o pipeline**

Create: `src/App.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('deve renderizar sem lancar erro', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Rodar os testes**

Run: `npm test`
Expected: 1 arquivo de teste, 1 teste passando.

- [ ] **Step 8: Commit**

```bash
git add vite.config.ts tsconfig.app.json package.json package-lock.json src/testes/configurar.ts src/App.test.tsx
git commit -m "chore: configurar Vitest e Testing Library"
```

---

## Task 4: Instalar e configurar Tailwind CSS v4

**Files:**

- Modify: `vite.config.ts`, `src/index.css`
- Create: `src/estilos/tailwind.css` (ou uso direto de `src/index.css`, decidido no Step 2)

- [ ] **Step 1: Instalar Tailwind v4 e o plugin do Vite**

Run: `npm install -D tailwindcss @tailwindcss/vite`

- [ ] **Step 2: Registrar o plugin no vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testes/configurar.ts'],
    globals: false,
  },
});
```

- [ ] **Step 3: Importar o Tailwind no src/index.css**

Substituir o conteudo de `src/index.css` por:

```css
@import 'tailwindcss';
```

(os tokens de tema do zine entram aqui como camada `@theme` na Task 6, depois que `tokens.ts` existir como fonte da verdade e for espelhado em CSS.)

- [ ] **Step 4: Validar que uma classe utilitaria aplica**

Editar `src/App.tsx` temporariamente para incluir `className="text-3xl font-bold"` em um elemento, rodar `npm run dev` manualmente (verificacao visual pelo usuario) ou validar via build.

Run: `npx vite build`
Expected: build conclui sem erro e o CSS gerado em `dist/assets/*.css` contem as regras utilitarias (`grep -c "font-weight: 700" dist/assets/*.css` retorna maior que 0).

- [ ] **Step 5: Reverter a classe de teste do App.tsx**

Deixar `App.tsx` de volta ao estado minimo do scaffold (sera reescrito de qualquer forma na Task 13).

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts src/index.css package.json package-lock.json
git commit -m "chore: configurar Tailwind CSS v4"
```

---

## Task 5: Utilitario de contraste WCAG

**Files:**

- Create: `src/estilos/contraste.ts`, `src/estilos/contraste.test.ts`

- [ ] **Step 1: Escrever o teste primeiro**

```typescript
import { describe, it, expect } from 'vitest';
import { calcularContraste } from './contraste';

describe('calcularContraste', () => {
  it('retorna 21 para preto contra branco puro', () => {
    expect(calcularContraste('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('retorna 1 quando as duas cores sao identicas', () => {
    expect(calcularContraste('#c81d25', '#c81d25')).toBeCloseTo(1, 5);
  });

  it('e simetrico em relacao a ordem dos argumentos', () => {
    const a = calcularContraste('#0a0a0a', '#f2ede4');
    const b = calcularContraste('#f2ede4', '#0a0a0a');
    expect(a).toBeCloseTo(b, 10);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npx vitest run src/estilos/contraste.test.ts`
Expected: FAIL, `Cannot find module './contraste'`.

- [ ] **Step 3: Implementar calcularContraste**

```typescript
type CorHex = `#${string}`;

function paraLinear(canal: number): number {
  const c = canal / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminanciaRelativa(hex: CorHex): number {
  const valor = hex.replace('#', '');
  const r = parseInt(valor.substring(0, 2), 16);
  const g = parseInt(valor.substring(2, 4), 16);
  const b = parseInt(valor.substring(4, 6), 16);
  return 0.2126 * paraLinear(r) + 0.7152 * paraLinear(g) + 0.0722 * paraLinear(b);
}

export function calcularContraste(corA: CorHex, corB: CorHex): number {
  const luminanciaA = luminanciaRelativa(corA);
  const luminanciaB = luminanciaRelativa(corB);
  const maior = Math.max(luminanciaA, luminanciaB);
  const menor = Math.min(luminanciaA, luminanciaB);
  return (maior + 0.05) / (menor + 0.05);
}
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npx vitest run src/estilos/contraste.test.ts`
Expected: PASS, 3 testes.

- [ ] **Step 5: Commit**

```bash
git add src/estilos/contraste.ts src/estilos/contraste.test.ts
git commit -m "feat: adicionar utilitario de calculo de contraste WCAG"
```

---

## Task 6: Tokens de design deterministas

**Files:**

- Create: `src/estilos/tokens.ts`, `src/estilos/tokens.test.ts`

- [ ] **Step 1: Escrever o teste primeiro**

```typescript
import { describe, it, expect } from 'vitest';
import { calcularContraste } from './contraste';
import { cores, obterRotacao, obterJitter, ROTACOES, JITTER } from './tokens';

describe('cores', () => {
  it('vermelhoPunk como texto sobre brancoPapel atinge 4.5:1', () => {
    expect(calcularContraste(cores.vermelhoPunk, cores.brancoPapel)).toBeGreaterThanOrEqual(4.5);
  });

  it('pretoTinta como texto sobre amareloFita atinge 4.5:1', () => {
    expect(calcularContraste(cores.pretoTinta, cores.amareloFita)).toBeGreaterThanOrEqual(4.5);
  });

  it('brancoPapel como texto sobre pretoTinta atinge 4.5:1', () => {
    expect(calcularContraste(cores.brancoPapel, cores.pretoTinta)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('obterRotacao', () => {
  it('e deterministica: mesma entrada sempre retorna o mesmo valor', () => {
    expect(obterRotacao(3)).toBe(obterRotacao(3));
  });

  it('faz wraparound pelo tamanho da tabela', () => {
    expect(obterRotacao(0)).toBe(obterRotacao(ROTACOES.length));
  });

  it('nunca excede a faixa de +-6 graus', () => {
    for (let i = 0; i < ROTACOES.length; i += 1) {
      expect(Math.abs(obterRotacao(i))).toBeLessThanOrEqual(6);
    }
  });
});

describe('obterJitter', () => {
  it('e deterministica: mesma entrada sempre retorna o mesmo valor', () => {
    expect(obterJitter(2)).toEqual(obterJitter(2));
  });

  it('faz wraparound pelo tamanho da tabela', () => {
    expect(obterJitter(0)).toEqual(obterJitter(JITTER.length));
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npx vitest run src/estilos/tokens.test.ts`
Expected: FAIL, `Cannot find module './tokens'`.

- [ ] **Step 3: Implementar tokens.ts**

```typescript
export const cores = {
  pretoTinta: '#0a0a0a',
  brancoPapel: '#f2ede4',
  vermelhoPunk: '#c81d25',
  amareloFita: '#e8b923',
} as const;

export const tipografia = {
  maquinaEscrever: '"Special Elite", "Courier New", monospace',
  recorteRevista: '"Anton", "Arial Narrow", sans-serif',
  manuscrita: '"Caveat", "Segoe Print", cursive',
} as const;

// Tabela fixa, gerada uma vez e congelada. Nunca calcular rotacao com Math.random em render.
export const ROTACOES = [-3, 2.5, -1.5, 4, -2.5, 1, 3.5, -4, 0.5, 2, -5, 5.5] as const;

export function obterRotacao(indice: number): number {
  const posicao = ((indice % ROTACOES.length) + ROTACOES.length) % ROTACOES.length;
  return ROTACOES[posicao];
}

interface Jitter {
  x: number;
  y: number;
}

// Tabela fixa de deslocamentos em pixels, mesmo principio das rotacoes.
export const JITTER: readonly Jitter[] = [
  { x: -2, y: 1 },
  { x: 3, y: -2 },
  { x: -1, y: 3 },
  { x: 2, y: 2 },
  { x: -3, y: -1 },
  { x: 1, y: -3 },
  { x: 4, y: 0 },
  { x: -4, y: 2 },
] as const;

export function obterJitter(indice: number): Jitter {
  const posicao = ((indice % JITTER.length) + JITTER.length) % JITTER.length;
  return JITTER[posicao];
}
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npx vitest run src/estilos/tokens.test.ts`
Expected: PASS, 8 testes.

- [ ] **Step 5: Espelhar as cores como variaveis CSS no Tailwind v4 (camada @theme)**

Editar `src/index.css`:

```css
@import 'tailwindcss';

@theme {
  --color-preto-tinta: #0a0a0a;
  --color-branco-papel: #f2ede4;
  --color-vermelho-punk: #c81d25;
  --color-amarelo-fita: #e8b923;
}
```

Os valores hexadecimais aqui devem ser mantidos identicos aos de `cores` em `tokens.ts` (fonte da verdade em TS, espelhada manualmente em CSS ate que exista necessidade real de gerar um a partir do outro).

- [ ] **Step 6: Rodar typecheck, lint e testes completos**

Run: `npx tsc -b && npm run lint && npm test`
Expected: tudo verde.

- [ ] **Step 7: Commit**

```bash
git add src/estilos/tokens.ts src/estilos/tokens.test.ts src/index.css
git commit -m "feat: adicionar tokens de design deterministas do sistema zine"
```

---

## Task 7: Tile de granulacao de fotocopia

**Files:**

- Create: `public/textura/granulacao.svg`
- Modify: `src/index.css`

- [ ] **Step 1: Criar o tile SVG (feTurbulence, pequeno, unico)**

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
  <filter id="ruido">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch" />
    <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0" />
  </filter>
  <rect width="64" height="64" filter="url(#ruido)" />
</svg>
```

- [ ] **Step 2: Confirmar tamanho do arquivo abaixo de 8KB**

Run: `du -b public/textura/granulacao.svg`
Expected: menor que 8192 bytes.

- [ ] **Step 3: Adicionar classe utilitaria de granulacao ao index.css**

```css
.textura-granulada {
  position: relative;
}

.textura-granulada::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/textura/granulacao.svg');
  background-repeat: repeat;
  mix-blend-mode: multiply;
  pointer-events: none;
}
```

- [ ] **Step 4: Rodar build para confirmar que o asset e servido**

Run: `npx vite build && ls dist/textura/granulacao.svg`
Expected: arquivo presente em `dist/textura/`.

- [ ] **Step 5: Commit**

```bash
git add public/textura/granulacao.svg src/index.css
git commit -m "feat: adicionar tile unico de granulacao de fotocopia"
```

---

## Task 8: Componente Adesivo

**Files:**

- Create: `src/componentes/Adesivo.tsx`, `src/componentes/Adesivo.test.tsx`

- [ ] **Step 1: Escrever o teste primeiro**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Adesivo } from './Adesivo';

describe('Adesivo', () => {
  it('renderiza o conteudo filho', () => {
    render(<Adesivo indice={0}>Ola</Adesivo>);
    expect(screen.getByText('Ola')).toBeInTheDocument();
  });

  it('aplica uma rotacao deterministica via style, nunca aleatoria', () => {
    render(<Adesivo indice={2}>Teste</Adesivo>);
    const elemento = screen.getByText('Teste');
    expect(elemento.style.getPropertyValue('--rotacao')).not.toBe('');
  });

  it('renderiza a mesma rotacao para o mesmo indice em renders diferentes', () => {
    const { unmount } = render(<Adesivo indice={5}>A</Adesivo>);
    const rotacaoUm = screen.getByText('A').style.getPropertyValue('--rotacao');
    unmount();
    render(<Adesivo indice={5}>B</Adesivo>);
    const rotacaoDois = screen.getByText('B').style.getPropertyValue('--rotacao');
    expect(rotacaoUm).toBe(rotacaoDois);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npx vitest run src/componentes/Adesivo.test.tsx`
Expected: FAIL, `Cannot find module './Adesivo'`.

- [ ] **Step 3: Implementar Adesivo.tsx**

```typescript
import type { ReactNode } from 'react';
import { obterRotacao } from '../estilos/tokens';

interface AdesivoProps {
  indice: number;
  children: ReactNode;
}

export function Adesivo({ indice, children }: AdesivoProps) {
  const rotacao = obterRotacao(indice);

  return (
    <span
      className="inline-block bg-branco-papel px-3 py-1 shadow-md"
      style={{ '--rotacao': `${rotacao}deg`, transform: 'rotate(var(--rotacao))' } as React.CSSProperties}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npx vitest run src/componentes/Adesivo.test.tsx`
Expected: PASS, 3 testes.

- [ ] **Step 5: Commit**

```bash
git add src/componentes/Adesivo.tsx src/componentes/Adesivo.test.tsx
git commit -m "feat: adicionar componente Adesivo"
```

---

## Task 9: Componente FitaAdesiva

**Files:**

- Create: `src/componentes/FitaAdesiva.tsx`, `src/componentes/FitaAdesiva.test.tsx`

- [ ] **Step 1: Escrever o teste primeiro**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FitaAdesiva } from './FitaAdesiva';

describe('FitaAdesiva', () => {
  it('renderiza o conteudo filho', () => {
    render(<FitaAdesiva indice={1}>Backend</FitaAdesiva>);
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('usa cor de fundo amarelo fita com texto preto (par de contraste validado)', () => {
    render(<FitaAdesiva indice={1}>Backend</FitaAdesiva>);
    const elemento = screen.getByText('Backend').closest('div');
    expect(elemento?.className).toContain('bg-amarelo-fita');
    expect(elemento?.className).toContain('text-preto-tinta');
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npx vitest run src/componentes/FitaAdesiva.test.tsx`
Expected: FAIL, `Cannot find module './FitaAdesiva'`.

- [ ] **Step 3: Implementar FitaAdesiva.tsx**

```typescript
import type { ReactNode } from 'react';
import { obterRotacao } from '../estilos/tokens';

interface FitaAdesivaProps {
  indice: number;
  children: ReactNode;
}

export function FitaAdesiva({ indice, children }: FitaAdesivaProps) {
  const rotacao = obterRotacao(indice);

  return (
    <div
      className="inline-block bg-amarelo-fita text-preto-tinta px-4 py-1 font-bold opacity-90"
      style={{ transform: `rotate(${rotacao}deg)` }}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npx vitest run src/componentes/FitaAdesiva.test.tsx`
Expected: PASS, 2 testes.

- [ ] **Step 5: Commit**

```bash
git add src/componentes/FitaAdesiva.tsx src/componentes/FitaAdesiva.test.tsx
git commit -m "feat: adicionar componente FitaAdesiva"
```

---

## Task 10: Componente PapelRasgado

**Files:**

- Create: `src/componentes/PapelRasgado.tsx`, `src/componentes/PapelRasgado.test.tsx`

- [ ] **Step 1: Escrever o teste primeiro**

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PapelRasgado } from './PapelRasgado';

describe('PapelRasgado', () => {
  it('renderiza um svg de borda rasgada inline', () => {
    const { container } = render(<PapelRasgado />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('e decorativo, com aria-hidden true', () => {
    const { container } = render(<PapelRasgado />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npx vitest run src/componentes/PapelRasgado.test.tsx`
Expected: FAIL, `Cannot find module './PapelRasgado'`.

- [ ] **Step 3: Implementar PapelRasgado.tsx**

```typescript
export function PapelRasgado() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 40"
      preserveAspectRatio="none"
      className="block w-full h-10 text-branco-papel"
    >
      <path
        d="M0,20 L20,8 L40,24 L60,4 L80,18 L100,10 L120,26 L140,6 L160,20 L180,12 L200,22 L220,8 L240,18 L260,4 L280,24 L300,10 L320,20 L340,6 L360,22 L380,12 L400,20 L400,40 L0,40 Z"
        fill="currentColor"
      />
    </svg>
  );
}
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npx vitest run src/componentes/PapelRasgado.test.tsx`
Expected: PASS, 2 testes.

- [ ] **Step 5: Commit**

```bash
git add src/componentes/PapelRasgado.tsx src/componentes/PapelRasgado.test.tsx
git commit -m "feat: adicionar componente PapelRasgado"
```

---

## Task 11: Componente Carimbo

**Files:**

- Create: `src/componentes/Carimbo.tsx`, `src/componentes/Carimbo.test.tsx`

- [ ] **Step 1: Escrever o teste primeiro**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Carimbo } from './Carimbo';

describe('Carimbo', () => {
  it('renderiza o texto do carimbo', () => {
    render(<Carimbo indice={4}>04.07.2026</Carimbo>);
    expect(screen.getByText('04.07.2026')).toBeInTheDocument();
  });

  it('usa cor vermelho punk como texto (par de contraste validado)', () => {
    render(<Carimbo indice={4}>04.07.2026</Carimbo>);
    expect(screen.getByText('04.07.2026').className).toContain('text-vermelho-punk');
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npx vitest run src/componentes/Carimbo.test.tsx`
Expected: FAIL, `Cannot find module './Carimbo'`.

- [ ] **Step 3: Implementar Carimbo.tsx**

```typescript
import type { ReactNode } from 'react';
import { obterRotacao } from '../estilos/tokens';

interface CarimboProps {
  indice: number;
  children: ReactNode;
}

export function Carimbo({ indice, children }: CarimboProps) {
  const rotacao = obterRotacao(indice);

  return (
    <span
      className="inline-block border-2 border-vermelho-punk text-vermelho-punk uppercase tracking-widest px-2 py-0.5 font-bold"
      style={{ transform: `rotate(${rotacao}deg)` }}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npx vitest run src/componentes/Carimbo.test.tsx`
Expected: PASS, 2 testes.

- [ ] **Step 5: Commit**

```bash
git add src/componentes/Carimbo.tsx src/componentes/Carimbo.test.tsx
git commit -m "feat: adicionar componente Carimbo"
```

---

## Task 12: Componente NotaDeResgate

**Files:**

- Create: `src/componentes/NotaDeResgate.tsx`, `src/componentes/NotaDeResgate.test.tsx`

- [ ] **Step 1: Escrever o teste primeiro**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotaDeResgate } from './NotaDeResgate';

describe('NotaDeResgate', () => {
  it('renderiza cada letra da palavra em um recorte proprio', () => {
    render(<NotaDeResgate texto="DG" />);
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('G')).toBeInTheDocument();
  });

  it('mantem o texto completo acessivel para leitor de tela via aria-label', () => {
    render(<NotaDeResgate texto="DG" />);
    expect(screen.getByLabelText('DG')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npx vitest run src/componentes/NotaDeResgate.test.tsx`
Expected: FAIL, `Cannot find module './NotaDeResgate'`.

- [ ] **Step 3: Implementar NotaDeResgate.tsx**

```typescript
import { obterRotacao, obterJitter } from '../estilos/tokens';

interface NotaDeResgateProps {
  texto: string;
}

export function NotaDeResgate({ texto }: NotaDeResgateProps) {
  const letras = texto.split('');

  return (
    <span role="img" aria-label={texto} className="inline-flex gap-1">
      {letras.map((letra, indice) => {
        const rotacao = obterRotacao(indice);
        const jitter = obterJitter(indice);
        return (
          <span
            key={`${letra}-${indice}`}
            aria-hidden="true"
            className="inline-block bg-preto-tinta text-branco-papel px-1.5 font-black"
            style={{
              transform: `rotate(${rotacao}deg) translate(${jitter.x}px, ${jitter.y}px)`,
            }}
          >
            {letra}
          </span>
        );
      })}
    </span>
  );
}
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npx vitest run src/componentes/NotaDeResgate.test.tsx`
Expected: PASS, 2 testes.

- [ ] **Step 5: Commit**

```bash
git add src/componentes/NotaDeResgate.tsx src/componentes/NotaDeResgate.test.tsx
git commit -m "feat: adicionar componente NotaDeResgate"
```

---

## Task 13: Compor App.tsx de verificacao e gate final da fase

**Files:**

- Modify: `src/App.tsx`, `src/App.test.tsx`

- [ ] **Step 1: Atualizar o teste do App para refletir a composicao real**

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
});
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL (o App atual do scaffold nao contem esse conteudo).

- [ ] **Step 3: Reescrever App.tsx compondo os 5 componentes base**

```typescript
import { Adesivo } from './componentes/Adesivo';
import { FitaAdesiva } from './componentes/FitaAdesiva';
import { PapelRasgado } from './componentes/PapelRasgado';
import { Carimbo } from './componentes/Carimbo';
import { NotaDeResgate } from './componentes/NotaDeResgate';

export default function App() {
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
    </main>
  );
}
```

- [ ] **Step 4: Rodar o teste e confirmar sucesso**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS.

- [ ] **Step 5: Gate final da fase, tudo verde**

Run: `npx tsc -b && npm run lint && npm run format:check && npm test && npx vite build`
Expected: typecheck, lint, format check, todos os testes (>= 20 testes no total) e build de producao passam sem erro.

- [ ] **Step 6: Verificacao visual manual**

Run: `npm run dev`, abrir no navegador, confirmar visualmente: nota de resgate "DG" com letras rotacionadas e deslocadas, etiqueta de fita amarela com o cargo, adesivo com rotacao, carimbo vermelho com a data, borda de papel rasgado, textura de granulacao sutil no fundo. Parar o servidor apos validar.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: compor App de verificacao com os componentes base da fundacao"
```

---

## Self-Review

**Cobertura do spec (Fase 0 do CLAUDE.md):** Vite, React, TS strict (Task 1), ESLint, Prettier (Task 2), Vitest (Task 3), Tailwind v4 (Task 4), paleta com acentos vermelho e amarelo validados por contraste real (Tasks 5 e 6), 3 familias tipograficas (Task 6), escala de rotacoes e jitter deterministas (Task 6), tile de granulacao (Task 7), 5 componentes base (Tasks 8 a 12), verificacao integrada (Task 13). Nenhum item da lista de Fase 0 do CLAUDE.md ficou de fora.

**Fora de escopo, de proposito:** engine da cobra (`src/cobra/`), secoes (`src/secoes/`), paginas (`src/paginas/`, incluindo 404), hooks especificos de scroll. Pertencem as Fases 1 e 2.

**Consistencia de tipos:** `obterRotacao(indice: number): number` e `obterJitter(indice: number): { x: number; y: number }` sao usados com a mesma assinatura em `tokens.ts` (Task 6) e em todos os componentes que os consomem (Tasks 8, 9, 11, 12). `cores` e `calcularContraste` tem a mesma assinatura em todos os pontos de uso.
