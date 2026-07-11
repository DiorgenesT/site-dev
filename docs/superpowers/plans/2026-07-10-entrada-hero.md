# Entrada em camadas do Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a entrada do Hero (hoje via `useAnimacaoColagem`/GSAP ScrollTrigger, igual as outras 5 secoes) por uma animacao "colagem em camadas" em CSS puro, isolada so no `Hero.tsx`, sem tocar nas outras secoes nem no hook compartilhado.

**Architecture:** Um unico `@keyframes camadaEntrada` em `src/index.css`, aplicado via classe `.entrada-camada` reutilizada nos 4 elementos do Hero com intensidade diferente por CSS custom properties (`--entrada-escala`, `--entrada-rotacao`, `--entrada-y`, `--entrada-blur`, `--entrada-duracao`, `--entrada-atraso`). A regra de animacao fica inteira dentro de `@media (prefers-reduced-motion: no-preference)`. O botao "Ver projetos" ganha um `div` wrapper novo pra nao perder a rotacao de repouso do token quando a animacao termina (animacao CSS tem prioridade sobre `style` inline nas propriedades que ela anima).

**Tech Stack:** React 18 + TypeScript strict, Tailwind CSS v4 (`src/index.css`), Vitest + Testing Library. Sem GSAP, sem JS novo.

Referencia: spec completa em `docs/superpowers/specs/2026-07-10-entrada-hero-design.md`.

---

### Task 1: Keyframes e classe utilitaria em `src/index.css`

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Adicionar o `@keyframes` e a classe `.entrada-camada`**

Abrir `src/index.css` (conteudo atual tem `@import 'tailwindcss'`, o bloco `@theme` com as cores, e `.textura-granulada`). Adicionar ao final do arquivo:

```css
@keyframes camadaEntrada {
  0% {
    opacity: 0;
    filter: blur(var(--entrada-blur, 6px));
    transform: scale(var(--entrada-escala, 2)) rotate(var(--entrada-rotacao, 20deg))
      translateY(var(--entrada-y, -28px));
  }
  60% {
    opacity: 1;
    filter: blur(0);
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: scale(1) rotate(0deg) translateY(0);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .entrada-camada {
    animation: camadaEntrada var(--entrada-duracao, 0.6s) cubic-bezier(0.22, 1.6, 0.36, 1) both;
    animation-delay: var(--entrada-atraso, 0s);
  }
}
```

- [ ] **Step 2: Verificar que o build do Tailwind aceita o CSS puro**

Run: `npm run build`
Expected: build termina sem erro (`vite build` compila `src/index.css` normalmente; `@keyframes` e `@media` fora de `@theme` sao CSS puro, o Tailwind v4 so processa as camadas que reconhece e repassa o resto).

- [ ] **Step 3: Commit**

Nao commitar ainda. Esse projeto exige teste local aprovado pelo usuario antes de qualquer commit (ver Task 4, Step 6). Seguir para a Task 2.

---

### Task 2: Testes do Hero (TDD, escritos antes da implementacao)

**Files:**
- Modify: `src/secoes/Hero.test.tsx`

- [ ] **Step 1: Escrever os testes que descrevem o novo comportamento**

Substituir o conteudo de `src/secoes/Hero.test.tsx` por:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from './Hero';
import { obterRotacao } from '../estilos/tokens';

describe('Hero', () => {
  it('renderiza a identidade, a tag e o CTA real, sempre visivel e focavel', () => {
    render(<Hero />);

    expect(screen.getByLabelText('DG')).toBeInTheDocument();
    expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();

    const botao = screen.getByRole('button', { name: 'Ver projetos' });
    expect(botao).toBeInTheDocument();
    expect(botao).not.toHaveClass('opacity-0');
  });

  it('nao usa mais o sistema de colagem por scroll (nenhum data-colagem)', () => {
    const { container } = render(<Hero />);

    expect(container.querySelectorAll('[data-colagem]')).toHaveLength(0);
  });

  it('anima a entrada do DG em camadas, com a maior intensidade e sem atraso', () => {
    render(<Hero />);

    const wrapper = screen.getByLabelText('DG').closest<HTMLElement>('.entrada-camada');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.style.getPropertyValue('--entrada-escala')).toBe('2.4');
    expect(wrapper?.style.getPropertyValue('--entrada-rotacao')).toBe('26deg');
    expect(wrapper?.style.getPropertyValue('--entrada-y')).toBe('-36px');
    expect(wrapper?.style.getPropertyValue('--entrada-blur')).toBe('8px');
    expect(wrapper?.style.getPropertyValue('--entrada-duracao')).toBe('0.65s');
    expect(wrapper?.style.getPropertyValue('--entrada-atraso')).toBe('0s');
  });

  it('atrasa a entrada do subtitulo e da descricao em sequencia', () => {
    render(<Hero />);

    const subtitulo = screen
      .getByText('Full Stack Developer')
      .closest<HTMLElement>('.entrada-camada');
    const descricao = screen
      .getByText('Engenharia de software aplicada à IA')
      .closest<HTMLElement>('.entrada-camada');

    expect(subtitulo?.style.getPropertyValue('--entrada-atraso')).toBe('0.14s');
    expect(descricao?.style.getPropertyValue('--entrada-atraso')).toBe('0.26s');
  });

  it('atrasa a entrada do CTA e preserva a rotacao de repouso do token no botao interno', () => {
    render(<Hero />);

    const botao = screen.getByRole('button', { name: 'Ver projetos' });
    const wrapper = botao.closest<HTMLElement>('.entrada-camada');

    expect(wrapper).not.toBeNull();
    expect(wrapper?.style.getPropertyValue('--entrada-atraso')).toBe('0.38s');
    expect(botao).not.toHaveClass('entrada-camada');
    expect(botao.getAttribute('style')).toContain(`rotate(${obterRotacao(4)}deg)`);
  });
});
```

- [ ] **Step 2: Rodar os testes e confirmar que as 4 novas assercoes falham**

Run: `npx vitest run src/secoes/Hero.test.tsx`
Expected: FAIL nos testes `nao usa mais o sistema de colagem`, `anima a entrada do DG`, `atrasa a entrada do subtitulo`, `atrasa a entrada do CTA` (o `Hero.tsx` atual ainda usa `data-colagem` e nao tem nenhuma classe `entrada-camada`). O primeiro teste (`renderiza a identidade...`) continua passando, ja que o conteudo textual nao mudou.

---

### Task 3: Implementar a nova entrada no `Hero.tsx`

**Files:**
- Modify: `src/secoes/Hero.tsx`

- [ ] **Step 1: Reescrever `Hero.tsx`**

Substituir o conteudo de `src/secoes/Hero.tsx` por:

```tsx
import type { CSSProperties } from 'react';
import { NotaDeResgate } from '../componentes/NotaDeResgate';
import { FitaAdesiva } from '../componentes/FitaAdesiva';
import { Adesivo } from '../componentes/Adesivo';
import { obterRotacao } from '../estilos/tokens';

type EntradaCamadaVars = CSSProperties & Record<`--entrada-${string}`, string | number>;

function aoClicarVerProjetos(): void {
  const alvo = document.getElementById('projetos');
  if (!alvo) {
    return;
  }
  const prefereReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  alvo.scrollIntoView({ behavior: prefereReduzido ? 'auto' : 'smooth' });
}

const entradaDg: EntradaCamadaVars = {
  '--entrada-escala': 2.4,
  '--entrada-rotacao': '26deg',
  '--entrada-y': '-36px',
  '--entrada-blur': '8px',
  '--entrada-duracao': '0.65s',
  '--entrada-atraso': '0s',
};

const entradaSubtitulo: EntradaCamadaVars = {
  '--entrada-escala': 1.8,
  '--entrada-rotacao': '18deg',
  '--entrada-y': '-24px',
  '--entrada-blur': '5px',
  '--entrada-duracao': '0.55s',
  '--entrada-atraso': '0.14s',
};

const entradaDescricao: EntradaCamadaVars = {
  '--entrada-escala': 1.6,
  '--entrada-rotacao': '14deg',
  '--entrada-y': '-20px',
  '--entrada-blur': '4px',
  '--entrada-duracao': '0.5s',
  '--entrada-atraso': '0.26s',
};

const entradaCta: EntradaCamadaVars = {
  '--entrada-escala': 1.5,
  '--entrada-rotacao': '12deg',
  '--entrada-y': '-16px',
  '--entrada-blur': '3px',
  '--entrada-duracao': '0.5s',
  '--entrada-atraso': '0.38s',
};

export function Hero() {
  return (
    <section
      id="hero"
      className="flex flex-col items-center gap-6 px-8 py-24 md:py-32 text-center"
    >
      <div className="entrada-camada text-5xl md:text-7xl" style={entradaDg}>
        <NotaDeResgate texto="DG" />
      </div>
      <div className="entrada-camada text-xl md:text-2xl" style={entradaSubtitulo}>
        <FitaAdesiva indice={1}>Full Stack Developer</FitaAdesiva>
      </div>
      <div className="entrada-camada text-lg md:text-xl max-w-md" style={entradaDescricao}>
        <Adesivo indice={0}>Engenharia de software aplicada à IA</Adesivo>
      </div>
      <div className="entrada-camada" style={entradaCta}>
        <button
          type="button"
          onClick={aoClicarVerProjetos}
          className="inline-block border-2 border-vermelho-punk text-vermelho-punk uppercase tracking-widest px-2 py-0.5 font-bold"
          style={{ transform: `rotate(${obterRotacao(4)}deg)` }}
        >
          Ver projetos
        </button>
      </div>
    </section>
  );
}
```

Note o que saiu em relacao a versao anterior: `useRef`, `useAnimacaoColagem`, `refSecao`, `ref={refSecao}` e todos os `data-colagem` nao existem mais no arquivo.

- [ ] **Step 2: Rodar os testes do Hero e confirmar que passam**

Run: `npx vitest run src/secoes/Hero.test.tsx`
Expected: PASS nos 5 testes.

- [ ] **Step 3: Rodar a suite completa**

Run: `npx vitest run`
Expected: PASS em todos os arquivos (nenhuma outra secao foi tocada, entao os testes de `App.test.tsx` e das outras 5 secoes continuam passando sem mudanca).

---

### Task 4: Verificacao final e commit

**Files:** nenhum arquivo novo, so validacao.

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: sem erros.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros (confirma que `EntradaCamadaVars` e o uso de `style` tipam certo, sem `any`/`as CSSProperties` solto).

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build limpo, bundle inicial dentro do orcamento (< 150KB gzip). Essa mudanca nao adiciona nenhum JS novo (so CSS), entao nao deve fazer o bundle inicial crescer.

- [ ] **Step 4: Teste visual manual**

Rodar `npm run dev`, abrir o Hero no navegador, confirmar visualmente:
- Os 4 elementos entram em sequencia (DG primeiro, CTA por ultimo), cada um vindo grande/borrado/rotacionado ate assentar.
- O botao "Ver projetos" mantem a rotacao de repouso do token depois que a animacao termina (nao fica reto/sem rotacao).
- Com "reduzir movimento" ativado no sistema operacional, o Hero aparece direto, sem nenhuma animacao.

- [ ] **Step 5: Aguardar aprovacao do usuario apos o teste local**

Regra do projeto: so commitar depois que o usuario confirmar que testou localmente e aprovou. Nao rodar o Step 6 antes disso.

- [ ] **Step 6: Commit (so apos aprovacao)**

```bash
git add src/index.css src/secoes/Hero.tsx src/secoes/Hero.test.tsx
git commit -m "feat: substituir colagem por scroll no Hero por entrada em camadas via CSS

O Hero deixa de usar useAnimacaoColagem/GSAP ScrollTrigger (que atrasava
o LCP esperando o chunk lazy carregar) e passa a usar uma animacao de
entrada em CSS puro, isolada, rodando no primeiro frame."
```

---

## Fora de escopo (nao fazer neste plano)

- Diferenciar Sobre/Stack/Projetos/LabIA/Contato entre si continua fora de escopo (decisao explicita do usuario). Nenhuma Task deste plano toca `useAnimacaoColagem.ts`, `lib/gsap.ts` ou qualquer secao alem do Hero.
