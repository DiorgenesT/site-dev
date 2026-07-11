# Moldura de capa de fanzine na Hero (desktop) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preencher o vazio lateral da Hero em telas largas (>= 1024px) com 4 elementos decorativos que imitam a moldura de uma capa de fanzine (marca de edição, selo de data/local, fita no canto, lombada de texto vertical), sem alterar nada no mobile/tablet nem nas outras seções.

**Architecture:** Os 4 elementos novos vivem só em `src/secoes/Hero.tsx`, posicionados com `absolute` dentro da `<section id="hero">` (que ganha `relative`), visíveis só a partir de `lg` (`hidden lg:block`). Reaproveitam a classe `.entrada-camada` já existente em `src/index.css` (nenhuma mudança nesse arquivo), cada um com suas próprias CSS custom properties de entrada, seguindo exatamente o padrão dos 4 elementos que já existem no Hero. Cada elemento decorativo separa a rotação de repouso fixa (span interno, com `style={{ transform: 'rotate(Ndeg)' }}`) da animação de entrada (wrapper com `.entrada-camada`), pelo mesmo motivo já documentado no botão "Ver projetos": a animação CSS sobrescreve `transform` no frame final, então rotação de repouso e animação de entrada não podem estar no mesmo elemento.

**Tech Stack:** React 18 + TypeScript strict, Tailwind CSS v4, Vitest + Testing Library. Zero JS novo, zero CSS novo compartilhado, zero componente novo.

Referência: spec completa em `docs/superpowers/specs/2026-07-11-hero-moldura-fanzine-design.md`.

---

### Task 1: Testes do Hero (TDD, escritos antes da implementação)

**Files:**
- Modify: `src/secoes/Hero.test.tsx`

- [ ] **Step 1: Acrescentar os testes que descrevem os 4 elementos novos**

Abrir `src/secoes/Hero.test.tsx` (hoje com 5 testes, ver conteúdo atual abaixo) e acrescentar, dentro do mesmo `describe('Hero', ...)`, os seguintes testes ao final (antes do `});` que fecha o describe):

```tsx
  it('a secao vira container relativo pra ancorar a moldura decorativa', () => {
    const { container } = render(<Hero />);
    const secao = container.querySelector('#hero');
    expect(secao?.className).toContain('relative');
  });

  it('mostra a marca de edicao e o selo de data/local, decorativos e so visiveis em telas largas', () => {
    render(<Hero />);

    const marcaEdicao = screen.getByText('Edição Nº 01');
    expect(marcaEdicao.closest('[aria-hidden="true"]')).toHaveClass('hidden', 'lg:block');

    const selo = screen.getByText('Betim, 2026');
    expect(selo.closest('[aria-hidden="true"]')).toHaveClass('hidden', 'lg:block');
  });

  it('mostra a lombada de texto vertical, decorativa e so visivel em telas largas', () => {
    render(<Hero />);

    const lombada = screen.getByText('diorgenesgeorge.dev');
    expect(lombada.closest('[aria-hidden="true"]')).toHaveClass('hidden', 'lg:block');
    expect(lombada.getAttribute('style')).toContain('rotate(90deg)');
  });

  it('a tira de fita do canto e puramente decorativa e so visivel em telas largas', () => {
    render(<Hero />);

    const fita = screen.getByTestId('hero-fita-canto');
    expect(fita.closest('[aria-hidden="true"]')).toHaveClass('hidden', 'lg:block');
  });

  it('anima a moldura decorativa depois que o conteudo principal ja assentou', () => {
    render(<Hero />);

    const marcaEdicao = screen.getByText('Edição Nº 01').closest<HTMLElement>('.entrada-camada');
    const selo = screen.getByText('Betim, 2026').closest<HTMLElement>('.entrada-camada');
    const fita = screen.getByTestId('hero-fita-canto').closest<HTMLElement>('.entrada-camada');
    const lombada = screen.getByText('diorgenesgeorge.dev').closest<HTMLElement>('.entrada-camada');

    expect(marcaEdicao?.style.getPropertyValue('--entrada-atraso')).toBe('0.5s');
    expect(selo?.style.getPropertyValue('--entrada-atraso')).toBe('0.58s');
    expect(fita?.style.getPropertyValue('--entrada-atraso')).toBe('0.66s');
    expect(lombada?.style.getPropertyValue('--entrada-atraso')).toBe('0.74s');
  });

  it('a marca de edicao e o selo mantem rotacao de repouso fixa, separada da animacao de entrada', () => {
    render(<Hero />);

    expect(screen.getByText('Edição Nº 01').getAttribute('style')).toContain('rotate(-3deg)');
    expect(screen.getByText('Betim, 2026').getAttribute('style')).toContain('rotate(2.5deg)');
  });
```

O arquivo completo fica assim (conteúdo integral, pra copiar direto):

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

  it('a secao vira container relativo pra ancorar a moldura decorativa', () => {
    const { container } = render(<Hero />);
    const secao = container.querySelector('#hero');
    expect(secao?.className).toContain('relative');
  });

  it('mostra a marca de edicao e o selo de data/local, decorativos e so visiveis em telas largas', () => {
    render(<Hero />);

    const marcaEdicao = screen.getByText('Edição Nº 01');
    expect(marcaEdicao.closest('[aria-hidden="true"]')).toHaveClass('hidden', 'lg:block');

    const selo = screen.getByText('Betim, 2026');
    expect(selo.closest('[aria-hidden="true"]')).toHaveClass('hidden', 'lg:block');
  });

  it('mostra a lombada de texto vertical, decorativa e so visivel em telas largas', () => {
    render(<Hero />);

    const lombada = screen.getByText('diorgenesgeorge.dev');
    expect(lombada.closest('[aria-hidden="true"]')).toHaveClass('hidden', 'lg:block');
    expect(lombada.getAttribute('style')).toContain('rotate(90deg)');
  });

  it('a tira de fita do canto e puramente decorativa e so visivel em telas largas', () => {
    render(<Hero />);

    const fita = screen.getByTestId('hero-fita-canto');
    expect(fita.closest('[aria-hidden="true"]')).toHaveClass('hidden', 'lg:block');
  });

  it('anima a moldura decorativa depois que o conteudo principal ja assentou', () => {
    render(<Hero />);

    const marcaEdicao = screen.getByText('Edição Nº 01').closest<HTMLElement>('.entrada-camada');
    const selo = screen.getByText('Betim, 2026').closest<HTMLElement>('.entrada-camada');
    const fita = screen.getByTestId('hero-fita-canto').closest<HTMLElement>('.entrada-camada');
    const lombada = screen.getByText('diorgenesgeorge.dev').closest<HTMLElement>('.entrada-camada');

    expect(marcaEdicao?.style.getPropertyValue('--entrada-atraso')).toBe('0.5s');
    expect(selo?.style.getPropertyValue('--entrada-atraso')).toBe('0.58s');
    expect(fita?.style.getPropertyValue('--entrada-atraso')).toBe('0.66s');
    expect(lombada?.style.getPropertyValue('--entrada-atraso')).toBe('0.74s');
  });

  it('a marca de edicao e o selo mantem rotacao de repouso fixa, separada da animacao de entrada', () => {
    render(<Hero />);

    expect(screen.getByText('Edição Nº 01').getAttribute('style')).toContain('rotate(-3deg)');
    expect(screen.getByText('Betim, 2026').getAttribute('style')).toContain('rotate(2.5deg)');
  });
});
```

- [ ] **Step 2: Rodar os testes e confirmar que as 6 novas asserções falham**

Run: `npx vitest run src/secoes/Hero.test.tsx`
Expected: FAIL nos 6 testes novos (`a secao vira container relativo`, `mostra a marca de edicao e o selo`, `mostra a lombada`, `a tira de fita do canto`, `anima a moldura decorativa`, `a marca de edicao e o selo mantem rotacao`). Os 5 testes originais continuam passando, já que o `Hero.tsx` atual ainda não mudou.

---

### Task 2: Implementar os 4 elementos decorativos no `Hero.tsx`

**Files:**
- Modify: `src/secoes/Hero.tsx`

- [ ] **Step 1: Reescrever `Hero.tsx`**

Substituir o conteúdo de `src/secoes/Hero.tsx` por:

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

const entradaMarcaEdicao: EntradaCamadaVars = {
  '--entrada-escala': 1.4,
  '--entrada-rotacao': '10deg',
  '--entrada-y': '-12px',
  '--entrada-blur': '3px',
  '--entrada-duracao': '0.45s',
  '--entrada-atraso': '0.5s',
};

const entradaSeloData: EntradaCamadaVars = {
  '--entrada-escala': 1.4,
  '--entrada-rotacao': '-10deg',
  '--entrada-y': '-12px',
  '--entrada-blur': '3px',
  '--entrada-duracao': '0.45s',
  '--entrada-atraso': '0.58s',
};

const entradaFitaCanto: EntradaCamadaVars = {
  '--entrada-escala': 1.3,
  '--entrada-rotacao': '-8deg',
  '--entrada-y': '10px',
  '--entrada-blur': '2px',
  '--entrada-duracao': '0.4s',
  '--entrada-atraso': '0.66s',
};

const entradaLombada: EntradaCamadaVars = {
  '--entrada-escala': 1.3,
  '--entrada-rotacao': '8deg',
  '--entrada-y': '8px',
  '--entrada-blur': '2px',
  '--entrada-duracao': '0.4s',
  '--entrada-atraso': '0.74s',
};

const ROTACAO_MARCA_EDICAO = -3;
const ROTACAO_SELO_DATA = 2.5;
const ROTACAO_FITA_CANTO = -42;

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex flex-col items-center gap-6 px-8 py-24 md:py-32 text-center"
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

      <div
        aria-hidden="true"
        className="hidden lg:block absolute top-8 left-8 entrada-camada"
        style={entradaMarcaEdicao}
      >
        <span
          className="block text-xs uppercase tracking-widest text-preto-tinta/60 font-bold"
          style={{ transform: `rotate(${ROTACAO_MARCA_EDICAO}deg)` }}
        >
          Edição Nº 01
        </span>
      </div>

      <div
        aria-hidden="true"
        className="hidden lg:block absolute top-8 right-8 entrada-camada"
        style={entradaSeloData}
      >
        <span
          className="block border border-preto-tinta/20 text-xs uppercase tracking-widest px-2 py-1 font-bold"
          style={{ transform: `rotate(${ROTACAO_SELO_DATA}deg)` }}
        >
          Betim, 2026
        </span>
      </div>

      <div
        aria-hidden="true"
        className="hidden lg:block absolute -left-6 bottom-10 entrada-camada"
        style={entradaFitaCanto}
      >
        <span
          data-testid="hero-fita-canto"
          className="block w-28 h-5 bg-amarelo-fita opacity-90"
          style={{ transform: `rotate(${ROTACAO_FITA_CANTO}deg)` }}
        />
      </div>

      <div
        aria-hidden="true"
        className="hidden lg:block absolute right-6 top-1/2 -translate-y-1/2"
      >
        <div className="entrada-camada" style={entradaLombada}>
          <span
            className="block text-xs uppercase tracking-widest font-bold whitespace-nowrap"
            style={{ transform: 'rotate(90deg)' }}
          >
            diorgenesgeorge.dev
          </span>
        </div>
      </div>
    </section>
  );
}
```

Note o que mudou em relação à versão anterior:
- `<section>` ganha `relative` no início do `className`.
- 4 novos blocos depois do `div` do CTA, cada um com `aria-hidden="true"`, `hidden lg:block`, `absolute` com o posicionamento do canto/borda correspondente, e `entrada-camada` com suas próprias CSS vars.
- 3 constantes novas (`ROTACAO_MARCA_EDICAO`, `ROTACAO_SELO_DATA`, `ROTACAO_FITA_CANTO`) pra rotação de repouso fixa, seguindo o mesmo princípio de determinismo visual das outras rotações do projeto (nenhuma vem de `Math.random`).
- A lombada tem um nível de aninhamento a mais (`div` externo só com posicionamento/centralização, sem animação) porque `-translate-y-1/2` e a animação de `.entrada-camada` não podem dividir o mesmo `transform` (a animação sobrescreveria a centralização no frame final), o mesmo problema já resolvido no botão "Ver projetos" com seu wrapper.

- [ ] **Step 2: Rodar os testes do Hero e confirmar que todos passam**

Run: `npx vitest run src/secoes/Hero.test.tsx`
Expected: PASS nos 11 testes (5 originais + 6 novos).

- [ ] **Step 3: Rodar a suite completa**

Run: `npx vitest run`
Expected: PASS em todos os arquivos (nenhuma outra seção foi tocada).

---

### Task 3: Verificação final e commit

**Files:** nenhum arquivo novo além dos já criados nas Tasks anteriores, só validação.

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: sem erros.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros (confirma que as 4 novas `EntradaCamadaVars` e os `style` inline tipam certo, sem `any`).

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build limpo. Zero JS novo (só marcação e classes Tailwind), então o bundle inicial não deve crescer de forma perceptível.

- [ ] **Step 4: Teste visual manual em telas largas**

Rodar `npm run dev`, abrir o Hero no navegador numa janela >= 1024px de largura, confirmar visualmente:
- Os 4 elementos aparecem: marca de edição (canto superior esquerdo), selo "Betim, 2026" (canto superior direito), fita amarela cruzando o canto inferior esquerdo, "diorgenesgeorge.dev" vertical na borda direita.
- Nenhum dos 4 elementos sobrepõe ou colide com o conteúdo central (DG, subtítulo, descrição, CTA) em nenhuma largura entre 1024px e telas ultrawide.
- Os 4 elementos entram animados, depois que o conteúdo central já assentou (sensação de "camada extra" chegando por último).
- A fita amarela e o selo mantêm a rotação de repouso depois que a animação termina (não ficam retos).

- [ ] **Step 5: Teste visual manual em mobile/tablet**

Redimensionar a janela para menos de 1024px (ou usar o modo responsivo do DevTools em 375px e 768px).
Expected: Hero idêntica à versão anterior, nenhum dos 4 elementos novos visível, nenhuma diferença de espaçamento ou de scroll horizontal.

- [ ] **Step 6: Teste com `prefers-reduced-motion: reduce`**

Ativar "reduzir movimento" no sistema operacional (ou emular via DevTools > Rendering > Emulate CSS media feature `prefers-reduced-motion`), recarregar a página numa janela >= 1024px.
Expected: os 4 elementos decorativos aparecem direto no estado final (sem nenhuma animação), igual ao comportamento já validado pro conteúdo central.

- [ ] **Step 7: Aguardar aprovação do usuário após o teste local**

Regra do projeto: só commitar depois que o usuário confirmar que testou localmente e aprovou. Não rodar o Step 8 antes disso.

- [ ] **Step 8: Commit (só após aprovação)**

```bash
git add src/secoes/Hero.tsx src/secoes/Hero.test.tsx docs/superpowers/specs/2026-07-11-hero-moldura-fanzine-design.md docs/superpowers/plans/2026-07-11-hero-moldura-fanzine.md
git commit -m "feat: adicionar moldura de capa de fanzine na Hero em telas largas

Preenche o vazio lateral da Hero em desktop (>= 1024px) com 4 elementos
decorativos (marca de edicao, selo de data/local, fita no canto, lombada
vertical), reaproveitando a animacao de entrada em camadas ja existente.
Mobile e tablet ficam identicos ao comportamento atual."
```

---

## Fora de escopo (não fazer neste plano)

- Nenhuma mudança em `src/index.css`, `useAnimacaoColagem.ts`, `lib/gsap.ts` ou qualquer seção além do Hero.
- Ajustar o breakpoint (`lg` vs `md`/`xl`) ou o texto dinâmico do selo (ano via `Date`) ficam para uma iteração futura, conforme já registrado na spec.
