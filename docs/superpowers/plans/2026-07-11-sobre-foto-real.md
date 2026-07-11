# Foto real na Sobre, com moldura tematica Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a foto ilustrada (`foto-preta-branca.webp`) da secao Sobre pela foto real do Diorgenes, nitida e com grading leve (sem halftone), emoldurada com componentes que ja existem no site (`PapelRasgado` no topo/base, uma tira de fita decorativa no canto), mantendo a entrada por scroll (`data-colagem`).

**Architecture:** O asset de imagem ja foi processado offline (recorte 3:4, `ImageEnhance` leve, sem halftone) e validado visualmente com o usuario; esse arquivo (`foto-sobre-final.webp`, no scratchpad) so precisa ser copiado pra `public/image/foto-sobre.webp`. `Sobre.tsx` ganha um novo nivel de aninhamento no bloco da foto: um `div` externo com `data-colagem` e rotacao fixa de token (mesmo padrao ja usado em `Projetos.tsx`: `data-colagem` e `style={{ transform: rotate(...) }}` no mesmo elemento, o hook `useAnimacaoColagem` le essa rotacao via `extrairRotacao` e anima ate ela, sem conflito), contendo `PapelRasgado` (topo), a foto (inalterada em relacao a estrutura atual, so o `src`/`alt`), `PapelRasgado` rotacionado 180deg (base), e a fita decorativa como `span` irmao do bloco da foto (nao filho do `div` com `overflow-hidden`, senao seria cortada).

**Tech Stack:** React 18 + TypeScript strict, Tailwind CSS v4, Vitest + Testing Library. Zero JS novo, zero componente novo (reaproveita `PapelRasgado` existente).

Referência: spec completa em `docs/superpowers/specs/2026-07-11-sobre-foto-real-design.md`.

---

### Task 1: Trocar o asset de imagem

**Files:**
- Create: `public/image/foto-sobre.webp`
- Delete: `public/image/foto-preta-branca.webp`
- Delete: `public/image/foto.png:Zone.Identifier` (arquivo de metadado do Windows/WSL, sem uso)

- [ ] **Step 1: Copiar o asset final validado pro repositorio**

O arquivo ja foi gerado e aprovado visualmente (recorte 3:4 centralizado no rosto, `ImageEnhance.Color` 1.2x, `Contrast` 1.12x, `Brightness` 1.05x, 720x960, ~44KB, sem halftone).

Run: `cp /tmp/claude-1000/-home-dg-projetos-site-dev/d448ea0e-2781-4c92-b81e-f678f36ddd96/scratchpad/foto-sobre-final.webp public/image/foto-sobre.webp`
Expected: comando sem erro.

- [ ] **Step 2: Confirmar que o arquivo esta no lugar certo**

Run: `ls -la public/image/`
Expected: lista mostra `foto-sobre.webp` (~44KB), `foto-preta-branca.webp` e `foto.png` ainda presentes (removidos no Step 3).

- [ ] **Step 3: Remover os arquivos sem uso**

Run:
```bash
git rm public/image/foto-preta-branca.webp
rm -f "public/image/foto.png:Zone.Identifier"
```
Expected: `foto-preta-branca.webp` sai do índice do git; o arquivo de metadado `Zone.Identifier` (não versionado, do WSL) é apagado do disco.

- [ ] **Step 4: Confirmar que nada mais referencia o arquivo removido**

Run: `grep -rn "foto-preta-branca" src/`
Expected: nenhum resultado (o único uso, em `Sobre.tsx`, é trocado na Task 3).

Não commitar ainda. Seguir para a Task 2.

---

### Task 2: Testes da Sobre (TDD, escritos antes da implementação)

**Files:**
- Modify: `src/secoes/Sobre.test.tsx`

- [ ] **Step 1: Substituir o conteúdo de `src/secoes/Sobre.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sobre } from './Sobre';
import { obterRotacao } from '../estilos/tokens';

describe('Sobre', () => {
  it('renderiza a trajetoria profissional e a formacao', () => {
    render(<Sobre />);

    expect(screen.getByText(/Expresso Truck/)).toBeInTheDocument();
    expect(screen.getByText(/Fundação Beta/)).toBeInTheDocument();
    expect(screen.getByText(/UniCesumar/)).toBeInTheDocument();
  });

  it('usa a foto real, nitida, com alt descritivo', () => {
    render(<Sobre />);

    const foto = screen.getByAltText('Foto de Diorgenes George, trabalhando em um notebook');
    expect(foto).toBeInTheDocument();
    expect(foto).toHaveAttribute('src', '/image/foto-sobre.webp');
  });

  it('emoldura a foto com PapelRasgado no topo e na base', () => {
    const { container } = render(<Sobre />);

    const rasgos = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(rasgos).toHaveLength(2);
  });

  it('mostra a fita decorativa do canto, puramente decorativa', () => {
    render(<Sobre />);

    const fita = screen.getByTestId('sobre-fita-canto');
    expect(fita).toHaveAttribute('aria-hidden', 'true');
  });

  it('o quadro da foto participa da colagem por scroll com rotacao fixa de token', () => {
    render(<Sobre />);

    const foto = screen.getByAltText('Foto de Diorgenes George, trabalhando em um notebook');
    const quadro = foto.closest('[data-colagem]');
    expect(quadro).not.toBeNull();
    expect(quadro?.getAttribute('style')).toContain(`rotate(${obterRotacao(4)}deg)`);
  });
});
```

- [ ] **Step 2: Rodar os testes e confirmar que os 4 novos falham**

Run: `npx vitest run src/secoes/Sobre.test.tsx`
Expected: FAIL em `usa a foto real`, `emoldura a foto com PapelRasgado`, `mostra a fita decorativa`, `o quadro da foto participa da colagem`. O teste original (`renderiza a trajetoria profissional`) continua passando, já que o texto não mudou.

---

### Task 3: Implementar a nova foto e moldura no `Sobre.tsx`

**Files:**
- Modify: `src/secoes/Sobre.tsx`

- [ ] **Step 1: Reescrever `Sobre.tsx`**

Substituir o conteúdo de `src/secoes/Sobre.tsx` por:

```tsx
import { useRef } from 'react';
import { FitaAdesiva } from '../componentes/FitaAdesiva';
import { Adesivo } from '../componentes/Adesivo';
import { PapelRasgado } from '../componentes/PapelRasgado';
import { useAnimacaoColagem } from '../hooks/useAnimacaoColagem';
import { obterRotacao } from '../estilos/tokens';

const ROTACAO_FITA_FOTO = -18;

export function Sobre() {
  const refConteudo = useRef<HTMLDivElement>(null);
  useAnimacaoColagem(refConteudo);

  return (
    <section id="sobre" className="py-16 md:py-24 px-8">
      <div
        ref={refConteudo}
        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
      >
        <div className="text-lg leading-[1.75]">
          <h2 className="mb-6" data-colagem>
            <FitaAdesiva indice={2}>Sobre</FitaAdesiva>
          </h2>
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
        </div>
        <div className="flex justify-center">
          <div
            data-colagem
            className="relative w-56 sm:w-64"
            style={{ transform: `rotate(${obterRotacao(4)}deg)` }}
          >
            <PapelRasgado className="w-full h-3 text-branco-papel" />
            <span
              aria-hidden="true"
              data-testid="sobre-fita-canto"
              className="absolute -top-2 -left-5 z-10 block w-28 h-5 bg-amarelo-fita opacity-90"
              style={{ transform: `rotate(${ROTACAO_FITA_FOTO}deg)` }}
            />
            <div className="relative aspect-[3/4] overflow-hidden shadow-lg">
              <img
                src="/image/foto-sobre.webp"
                alt="Foto de Diorgenes George, trabalhando em um notebook"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <PapelRasgado className="w-full h-3 text-branco-papel rotate-180" />
          </div>
        </div>
      </div>
    </section>
  );
}
```

Note o que mudou em relação à versão anterior:
- Novo import de `PapelRasgado` e de `obterRotacao` (tokens).
- Nova constante `ROTACAO_FITA_FOTO` (rotação fixa, mesmo princípio de determinismo visual das outras rotações do projeto).
- O `data-colagem` sai do `div` `aspect-[3/4]` e vai pro novo `div` externo (`w-56 sm:w-64`), que agora é o quadro inteiro (papel rasgado + foto + papel rasgado). Esse `div` externo ganha a rotação fixa via `style`, seguindo exatamente o mesmo padrão já usado em `Projetos.tsx` (`data-colagem` e `style={{ transform: rotate(...) }}` no mesmo elemento — o hook lê essa rotação inline e anima até ela, sem precisar de wrapper extra).
- A fita decorativa é um `span` irmão do `div` `overflow-hidden` (não filho dele), porque um filho de um container com `overflow-hidden` seria cortado ao sangrar pra fora do canto.
- `src` e `alt` da imagem trocados.

- [ ] **Step 2: Rodar os testes da Sobre e confirmar que passam**

Run: `npx vitest run src/secoes/Sobre.test.tsx`
Expected: PASS nos 5 testes.

- [ ] **Step 3: Rodar a suite completa**

Run: `npx vitest run`
Expected: PASS em todos os arquivos.

---

### Task 4: Verificação final e commit

**Files:** nenhum arquivo novo além dos já criados/modificados nas Tasks anteriores, só validação.

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: sem erros.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build limpo. O novo asset (~44KB) é mais leve que o antigo (~197KB), então o peso de imagens da página cai.

- [ ] **Step 4: Teste visual manual**

Rodar `npm run dev`, abrir a Sobre no navegador, confirmar visualmente:
- A foto aparece nítida (rosto reconhecível), com leve ajuste de cor/contraste, sem nenhum padrão de pontos.
- `PapelRasgado` aparece no topo e na base do quadro, com o rasgo virado pra fora dos dois lados (não espelhado pra dentro).
- A fita amarela cruza o canto superior esquerdo, sobrepondo levemente a borda da foto e do papel rasgado, sem ficar cortada.
- O quadro inteiro tem uma leve rotação (não fica esquadrejado).
- Ao rolar a página até a Sobre, o quadro entra animado (GSAP), assentando na rotação final correta (mesma rotação de repouso, sem "pulo" pra uma rotação diferente no fim da animação).
- Ajustar a posição/tamanho da fita (`-top-2 -left-5 w-28 h-5`) neste passo se visualmente ela ficar desproporcional ao quadro renderizado, antes de seguir pro commit.

- [ ] **Step 5: Aguardar aprovação do usuário após o teste local**

Regra do projeto: só commitar depois que o usuário confirmar que testou localmente e aprovou. Não rodar o Step 6 antes disso.

- [ ] **Step 6: Commit (só após aprovação)**

A remoção de `public/image/foto-preta-branca.webp` já foi staged pelo `git rm` da Task 1 (Step 3) e continua staged até aqui, então entra automaticamente neste mesmo commit junto com os arquivos abaixo.

```bash
git add public/image/foto-sobre.webp src/secoes/Sobre.tsx src/secoes/Sobre.test.tsx docs/superpowers/specs/2026-07-11-sobre-foto-real-design.md docs/superpowers/plans/2026-07-11-sobre-foto-real.md
git commit -m "feat: trocar foto ilustrada da Sobre pela foto real, com moldura tematica

A foto agora e a original (nitida, so com grading leve), emoldurada com
PapelRasgado e uma fita decorativa, componentes que ja existiam no site,
em vez de uma versao inteiramente reprocessada fora do fluxo do projeto."
```

---

## Fora de escopo (não fazer neste plano)

- Gerar versão 2x/retina do asset (`srcset`) fica pra uma iteração futura, conforme já registrado na spec.
- Nenhuma mudança no texto da Sobre, em `PapelRasgado.tsx`/`FitaAdesiva.tsx`, ou em qualquer outra seção.
