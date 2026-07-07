# Fase 2, Secoes Reais do Site, Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o placeholder de `App.tsx` pelas 6 secoes reais do portfolio (Hero, Sobre, Stack, Projetos, LabIA, Contato), estendendo a engine da Cobra de Scroll para percorrer a pagina inteira com N waypoints e o mecanismo de desmonte simetrico no Hero, corrigindo a divida tecnica de acessibilidade herdada da Fase 1.

**Architecture:** Extensao pura em `src/cobra/docking.ts` (nova funcao `fatorDesmonte`), mudanca de API em `src/hooks/useCobra.ts` (de 2 ancoras fixas para um array de N refs) e em `src/componentes/CamadaCobra.tsx` (dois mecanismos de Flip, um por ponta da jornada, e remocao do acoplamento de opacidade dos botoes reais), 6 novos componentes de secao em `src/secoes/` com conteudo real, e `App.tsx` reescrito para compor tudo.

**Tech Stack:** React 18 + TypeScript strict, GSAP (ScrollTrigger, Flip), Lenis, Canvas 2D, Vitest + Testing Library, Tailwind v4 (sem mudanca de stack).

---

## Contexto global (ler antes de comecar)

- Spec aprovada: `docs/superpowers/specs/2026-07-06-fase-2-secoes-design.md` - leia antes de iniciar a Task 1.
- Contrato tecnico inegociavel de 8 pontos da Cobra de Scroll: `CLAUDE.md` na raiz do repositorio.
- Fluxo obrigatorio por task: issue no GitHub (`GODEBUG=netdns=cgo gh issue create ...`), branch a partir de `main` (`feature/<n>-slug` ou `chore/<n>-slug`), implementar, rodar `npx tsc -b --noEmit && npm run lint && npm run format:check && npm run test && npm run build` localmente, **PARAR e esperar confirmacao explicita do usuario de que testou localmente antes de commitar**, so entao commit + push + PR (`GODEBUG=netdns=cgo gh pr create ...`), e o proprio agente mergeia o PR apos a confirmacao (`GODEBUG=netdns=cgo gh pr merge <n> --squash --delete-branch`).
- Nunca rodar `rm -rf` neste ambiente (bloqueado por permissao), usar `mv` para relocar arquivos indesejados.
- Convencoes: tudo em pt-BR sem acentos (confirmar contra o codigo existente antes de escrever texto novo), sem emojis, sem travessao/meia-risca (usar virgula, dois pontos ou parenteses), Conventional Commits em portugues, nunca `Co-Authored-By`.
- Tailwind v4: usar `shrink-0` (nao `flex-shrink-0`, renomeado no v4).

---

### Task 1: `docking.ts` - fator de desmonte simetrico

**Files:**
- Modify: `src/cobra/docking.ts`
- Test: `src/cobra/docking.test.ts`

- [ ] **Step 1: Escrever os testes que falham primeiro**

Adicionar ao final de `src/cobra/docking.test.ts` (mantendo o `describe('fatorDocking', ...)` existente intacto, so acrescentando um novo bloco):

```typescript
import { describe, it, expect } from 'vitest';
import { fatorDocking, INICIO_ZONA_DOCKING, fatorDesmonte, FIM_ZONA_DESMONTE } from './docking';

// ... describe('fatorDocking', ...) existente permanece igual, sem mudancas ...

describe('fatorDesmonte', () => {
  it('FIM_ZONA_DESMONTE e 0.08', () => {
    expect(FIM_ZONA_DESMONTE).toBeCloseTo(0.08, 5);
  });

  it('e 1 no inicio do progresso (cobra ainda colada na origem)', () => {
    expect(fatorDesmonte(0, 0.08)).toBeCloseTo(1, 5);
  });

  it('e 0 no fim da zona e depois dela (cobra ja solta)', () => {
    expect(fatorDesmonte(0.08, 0.08)).toBe(0);
    expect(fatorDesmonte(0.5, 0.08)).toBe(0);
    expect(fatorDesmonte(1, 0.08)).toBe(0);
  });

  it('e monotonico decrescente dentro da zona', () => {
    let anterior = Infinity;
    for (let progresso = 0; progresso <= 0.08; progresso += 0.005) {
      const fator = fatorDesmonte(progresso, 0.08);
      expect(fator).toBeLessThanOrEqual(anterior);
      anterior = fator;
    }
  });

  it('nunca ultrapassa o intervalo [0, 1]', () => {
    for (let progresso = 0; progresso <= 1; progresso += 0.05) {
      const fator = fatorDesmonte(progresso, 0.08);
      expect(fator).toBeGreaterThanOrEqual(0);
      expect(fator).toBeLessThanOrEqual(1);
    }
  });

  it('e reversivel: o mesmo progresso sempre produz o mesmo fator', () => {
    const ida = fatorDesmonte(0.04, 0.08);
    const volta = fatorDesmonte(0.04, 0.08);
    expect(ida).toBe(volta);
  });
});
```

Atualizar a linha de import no topo do arquivo de teste para incluir `fatorDesmonte, FIM_ZONA_DESMONTE` (ainda nao existem em `docking.ts`, e esperado que o proximo passo falhe).

- [ ] **Step 2: Rodar os testes e confirmar que falham**

Run: `npm run test -- docking`
Expected: FAIL - `fatorDesmonte` e `FIM_ZONA_DESMONTE` nao sao exportados por `./docking`.

- [ ] **Step 3: Implementar `fatorDesmonte`**

Substituir o conteudo completo de `src/cobra/docking.ts` por:

```typescript
export const INICIO_ZONA_DOCKING = 0.92;
export const FIM_ZONA_DESMONTE = 0.08;

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

// Simetrico a fatorDocking: comeca em 1 (cobra ainda "colada" no botao de
// origem, como um adesivo) e cai suavemente ate 0 ao fim da zona de desmonte,
// quando a cobra solta e passa a percorrer a trajetoria livre. Reaproveita
// fatorDocking invertendo progresso e zona, em vez de duplicar a logica de
// easing (mesma curva smoothstep, mesmo principio de zona fixa).
export function fatorDesmonte(progresso: number, fimZona: number): number {
  return fatorDocking(1 - progresso, 1 - fimZona);
}
```

- [ ] **Step 4: Rodar os testes de novo e confirmar que passam**

Run: `npm run test -- docking`
Expected: PASS - todos os testes de `fatorDocking` (inalterados) e `fatorDesmonte` (novos) passam.

- [ ] **Step 5: Rodar o gate completo**

Run: `npx tsc -b --noEmit && npm run lint && npm run format:check && npm run test && npm run build`
Expected: tudo limpo, sem erros.

- [ ] **Step 6: Parar para confirmacao do usuario, depois commitar**

So depois do usuario confirmar que testou localmente:

```bash
git add src/cobra/docking.ts src/cobra/docking.test.ts
git commit -m "feat: adicionar fatorDesmonte simetrico ao docking da cobra"
```

---

### Task 2: `useCobra.ts` - API de N waypoints e correcao de acessibilidade

**Files:**
- Modify: `src/hooks/useCobra.ts`
- Test: `src/hooks/useCobra.test.ts`

- [ ] **Step 1: Escrever o teste que falha primeiro**

Substituir o conteudo completo de `src/hooks/useCobra.test.ts` por:

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { RefObject } from 'react';
import { useCobra } from './useCobra';

function criarRef(): RefObject<HTMLElement | null> {
  return { current: document.createElement('div') };
}

describe('useCobra', () => {
  it('desliga a cobra por completo sob prefers-reduced-motion (fallback estatico funcional)', () => {
    // O stub global de matchMedia em src/testes/configurar.ts retorna matches:true
    // por padrao, simulando reduced-motion sempre ligado no ambiente de teste.
    // Com a correcao de acessibilidade da Fase 2 (spec, secao 3.3), os botoes
    // reais nao dependem mais de fatorDocking/fatorDesmonte para ficarem
    // visiveis - a garantia do fallback agora e so cobraAtiva=false (o desenho
    // da cobra nunca liga), nao mais um valor magico de fator.
    const refsSecoes = [criarRef(), criarRef(), criarRef()];
    const refJornada = criarRef();

    const { result } = renderHook(() => useCobra({ refsSecoes, refJornada }));

    expect(result.current.cobraAtiva).toBe(false);
    expect(result.current.fatorDocking).toBe(0);
    expect(result.current.fatorDesmonte).toBe(0);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm run test -- useCobra`
Expected: FAIL - `useCobra` ainda espera `{ refInicio, refFim, refJornada }`, nao `{ refsSecoes, refJornada }`, e nao expoe `fatorDesmonte`.

- [ ] **Step 3: Implementar a nova API**

Substituir o conteudo completo de `src/hooks/useCobra.ts` por:

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
import { fatorDocking, INICIO_ZONA_DOCKING, fatorDesmonte, FIM_ZONA_DESMONTE } from '../cobra/docking';
import type { Ponto } from '../cobra/tipos';
import { carregarGsap, ScrollTrigger } from '../lib/gsap';
import { iniciarMovimento, pararMovimento } from '../lib/movimento';

interface OpcoesCobra {
  // Uma ancora por secao, na ordem em que aparecem na pagina (Hero primeiro,
  // Contato por ultimo). A trajetoria da cobra passa por todas elas.
  refsSecoes: readonly RefObject<HTMLElement | null>[];
  refJornada: RefObject<HTMLElement | null>;
}

interface EstadoCobra {
  bufferRef: RefObject<BufferCircular>;
  fatorDocking: number;
  fatorDesmonte: number;
  scrollRef: RefObject<Ponto>;
  cobraAtiva: boolean;
}

function elementoParaPonto(elemento: HTMLElement): Ponto {
  const retangulo = elemento.getBoundingClientRect();
  return {
    x: retangulo.left + retangulo.width / 2 + window.scrollX,
    y: retangulo.top + retangulo.height / 2 + window.scrollY,
  };
}

export function useCobra({ refsSecoes, refJornada }: OpcoesCobra): EstadoCobra {
  const bufferRef = useRef<BufferCircular>(criarBufferCircular(TAMANHO_BUFFER_CORPO));
  // Ponto reutilizado pela amostragem quantizada (12x/s): evita alocar um Ponto
  // novo por tick, na mesma linha do buffer circular do corpo.
  const amostraRef = useRef<Ponto>({ x: 0, y: 0 });
  // Cache do scroll atual para o canvas fixed converter coordenadas de pagina
  // (dos waypoints) em coordenadas de viewport sem ler window.scrollX/scrollY
  // dentro do loop de desenho (contrato, pontos 3 e 4). So e escrito no mount
  // e em callbacks ja acionados fora do rAF de desenho (onUpdate do
  // ScrollTrigger e resize debounced).
  const scrollRef = useRef<Ponto>({ x: 0, y: 0 });
  const [reducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  // Os botoes reais nao dependem mais destes valores para ficarem visiveis
  // (correcao de acessibilidade, spec Fase 2 secao 3.3) - por isso os dois
  // fatores comecam neutros (0), sem precisar de caso especial para
  // reduced-motion. O fallback estatico funcional agora vem inteiramente de
  // cobraAtiva=false, que desliga o desenho decorativo da cobra.
  const [fatorDockingAtual, setFatorDockingAtual] = useState(0);
  const [fatorDesmonteAtual, setFatorDesmonteAtual] = useState(0);
  // Visibilidade combinada (aba em foco e secao da jornada na tela). Comeca
  // true: o efeito abaixo corrige para o valor real assim que os observers
  // disparam, e com reduced-motion o efeito nem chega a rodar.
  const [visivel, setVisivel] = useState(true);

  useEffect(() => {
    if (reducedMotion) {
      return undefined;
    }

    const elementosSecoes = refsSecoes.map((ref) => ref.current);
    const elementoJornada = refJornada.current;
    if (elementosSecoes.some((elemento) => elemento === null) || !elementoJornada) {
      return undefined;
    }
    const elementosValidados = elementosSecoes as HTMLElement[];
    const elementoInicio = elementosValidados[0];
    const elementoFim = elementosValidados[elementosValidados.length - 1];
    if (!elementoInicio || !elementoFim) {
      return undefined;
    }

    let trajetoria: Trajetoria = construirTrajetoria(elementosValidados.map(elementoParaPonto));
    const quantizador = criarQuantizador(PASSOS_POR_SEGUNDO);
    let progressoAtual = 0;
    let visivelAba = document.visibilityState === 'visible';
    let visivelTela = true;

    scrollRef.current.x = window.scrollX;
    scrollRef.current.y = window.scrollY;

    const gsap = carregarGsap();

    const scrollTrigger = ScrollTrigger.create({
      trigger: elementoInicio,
      endTrigger: elementoFim,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progressoAtual = self.progress;
        // self.scroll() e o valor de scroll que o proprio ScrollTrigger ja
        // recalculou neste ciclo (disparado pelo evento 'scroll' do Lenis),
        // entao cachear aqui nao introduz uma leitura de layout por frame.
        scrollRef.current.y = self.scroll();
      },
    });

    let resizeTimeoutId: ReturnType<typeof setTimeout> | undefined;
    // Arrow function (nao function declaration): preserva o estreitamento de tipo
    // de elementosValidados dentro do closure.
    const aoRedimensionar = (): void => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(() => {
        trajetoria = construirTrajetoria(elementosValidados.map(elementoParaPonto));
        scrollRef.current.x = window.scrollX;
        scrollTrigger.refresh();
      }, 150);
    };
    const observadorRedimensionamento = new ResizeObserver(aoRedimensionar);
    observadorRedimensionamento.observe(document.body);

    function aoMudarVisibilidadeAba(): void {
      visivelAba = document.visibilityState === 'visible';
      setVisivel(visivelAba && visivelTela);
    }
    document.addEventListener('visibilitychange', aoMudarVisibilidadeAba);

    // Observa o container que envolve toda a jornada (inicio ao fim), nao so a
    // ancora de inicio: assim visivelTela so vira false quando a jornada inteira
    // sai da tela, nao assim que o usuario rola um pouco alem da ancora inicial.
    const observadorIntersecao = new IntersectionObserver(
      (entradas) => {
        const entrada = entradas[0];
        visivelTela = entrada ? entrada.isIntersecting : true;
        setVisivel(visivelAba && visivelTela);
      },
      { threshold: 0 },
    );
    observadorIntersecao.observe(elementoJornada);

    function aoTick(_tempo: number, deltaMs: number): void {
      if (!visivelAba || !visivelTela) {
        return;
      }
      const avancou = avancarQuantizador(quantizador, deltaMs);
      if (avancou) {
        trajetoria.amostrar(progressoAtual, amostraRef.current);
        inserirPosicao(bufferRef.current, amostraRef.current);
        setFatorDockingAtual(fatorDocking(progressoAtual, INICIO_ZONA_DOCKING));
        setFatorDesmonteAtual(fatorDesmonte(progressoAtual, FIM_ZONA_DESMONTE));
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
  }, [refsSecoes, refJornada, reducedMotion]);

  return {
    bufferRef,
    fatorDocking: fatorDockingAtual,
    fatorDesmonte: fatorDesmonteAtual,
    scrollRef,
    // Contrato pontos 7 e 8: cobra so desenha sem reduced-motion e com a
    // jornada visivel (aba em foco e secao na tela).
    cobraAtiva: !reducedMotion && visivel,
  };
}
```

- [ ] **Step 4: Rodar o teste de novo e confirmar que passa**

Run: `npm run test -- useCobra`
Expected: PASS.

- [ ] **Step 5: Rodar o gate completo**

Run: `npx tsc -b --noEmit && npm run lint && npm run format:check && npm run test && npm run build`
Expected: FALHA esperada neste ponto - `src/componentes/CamadaCobra.tsx` e `src/paginas/Playground.tsx` ainda usam a API antiga (`refInicio`/`refFim`/`refBotaoDestino` sem `refBotaoOrigem`) e nao compilam contra a nova assinatura de `useCobra`. Isso e esperado e sera corrigido nas Tasks 3 e 4 - nao commitar ainda.

- [ ] **Step 6: Commitar so depois da Task 3 (CamadaCobra) estar pronta**

Este passo fica pendente ate a Task 3 terminar, pois `useCobra.ts` e `CamadaCobra.tsx` mudam juntos para o projeto continuar compilando. Ver o commit combinado ao final da Task 3.

---

### Task 3: `CamadaCobra.tsx` - dois mecanismos de Flip e correcao de acessibilidade

**Files:**
- Modify: `src/componentes/CamadaCobra.tsx`
- Modify: `src/lib/movimento.ts`

- [ ] **Step 1: Adicionar `rolarAte` a `src/lib/movimento.ts`**

Usado pelo CTA do Hero (Task 5) para rolar ate a secao Projetos usando a mesma instancia de Lenis que ja controla o scroll (evita dessincronizar o scroll nativo do scroll virtual do Lenis). Adicionar ao final de `src/lib/movimento.ts` (o resto do arquivo permanece igual):

```typescript
// Rolagem programatica (ex.: clique no CTA do Hero) usando a mesma instancia
// de Lenis que ja controla o scroll, para nao dessincronizar scroll nativo e
// scroll virtual. Se Lenis ainda nao foi criado (ex.: reduced-motion, onde
// iniciarMovimento nunca chega a instancia-lo), cai para scrollIntoView nativo.
export function rolarAte(alvo: HTMLElement): void {
  if (lenis) {
    lenis.scrollTo(alvo);
    return;
  }
  const prefereReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  alvo.scrollIntoView({ behavior: prefereReduzido ? 'auto' : 'smooth' });
}
```

- [ ] **Step 2: Reescrever `CamadaCobra.tsx`**

Substituir o conteudo completo de `src/componentes/CamadaCobra.tsx` por:

```typescript
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useCobra } from '../hooks/useCobra';
import { obterPosicao, PASSADAS_TRACO } from '../cobra/motor';
import type { Ponto } from '../cobra/tipos';
import { carregarGsap, Flip } from '../lib/gsap';

interface CamadaCobraProps {
  refsSecoes: readonly RefObject<HTMLElement | null>[];
  refJornada: RefObject<HTMLElement | null>;
  refBotaoOrigem: RefObject<HTMLElement | null>;
  refBotaoDestino: RefObject<HTMLElement | null>;
}

export function CamadaCobra({
  refsSecoes,
  refJornada,
  refBotaoOrigem,
  refBotaoDestino,
}: CamadaCobraProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const eloOrigemRef = useRef<HTMLDivElement | null>(null);
  const eloDestinoRef = useRef<HTMLDivElement | null>(null);
  // Flip.from() retorna uma Timeline (nao um Tween) - confirmado em gsap/types/Flip.d.ts.
  const flipOrigemRef = useRef<gsap.core.Timeline | null>(null);
  const flipDestinoRef = useRef<gsap.core.Timeline | null>(null);
  const { bufferRef, fatorDocking, fatorDesmonte, scrollRef, cobraAtiva } = useCobra({
    refsSecoes,
    refJornada,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    // Contrato pontos 7 e 8: sem reduced-motion ativo ou com a jornada fora de
    // vista (aba oculta ou secao fora da tela), o ticker de desenho nem e
    // registrado, entao o trabalho mais caro (clearRect + stroke) para por completo.
    if (!canvas || !cobraAtiva) {
      return undefined;
    }
    const contexto = canvas.getContext('2d');
    if (!contexto) {
      return undefined;
    }

    function redimensionar(): void {
      if (!canvas) {
        return;
      }
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    redimensionar();
    window.addEventListener('resize', redimensionar);

    // Ponto reutilizado a cada chamada de obterPosicao dentro do loop: o
    // contrato proibe alocacao dentro do rAF de desenho.
    const pontoReutilizavel: Ponto = { x: 0, y: 0 };

    function desenhar(): void {
      if (!canvas || !contexto) {
        return;
      }
      const buffer = bufferRef.current;
      const scroll = scrollRef.current;
      contexto.clearRect(0, 0, canvas.width, canvas.height);
      if (!buffer || buffer.quantidadeEscrita < 2 || !scroll) {
        return;
      }
      for (const passada of PASSADAS_TRACO) {
        contexto.beginPath();
        contexto.lineWidth = passada.espessura;
        contexto.strokeStyle = '#0a0a0a';
        contexto.lineCap = 'round';
        contexto.lineJoin = 'round';
        for (let i = 0; i < buffer.quantidadeEscrita; i += 1) {
          obterPosicao(buffer, i, pontoReutilizavel);
          const x = pontoReutilizavel.x + passada.deslocamentoX - scroll.x;
          const y = pontoReutilizavel.y + passada.deslocamentoY - scroll.y;
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
  }, [bufferRef, scrollRef, cobraAtiva]);

  useEffect(() => {
    const gsapInstancia = carregarGsap();

    const eloOrigem = eloOrigemRef.current;
    const botaoOrigem = refBotaoOrigem.current;
    if (eloOrigem && botaoOrigem) {
      if (!flipOrigemRef.current) {
        const estado = Flip.getState(eloOrigem);
        flipOrigemRef.current = Flip.from(estado, {
          targets: botaoOrigem,
          paused: true,
          absolute: true,
        });
      }
      // Desmonte e o inverso do docking: fatorDesmonte comeca em 1 (cobra ainda
      // colada na origem, progresso 0 do Flip = forma do elo) e cai a 0 (cobra
      // solta, progresso 1 do Flip = forma natural do botao).
      flipOrigemRef.current.progress(1 - fatorDesmonte);
    }

    const eloDestino = eloDestinoRef.current;
    const botaoDestino = refBotaoDestino.current;
    if (eloDestino && botaoDestino) {
      if (!flipDestinoRef.current) {
        const estado = Flip.getState(eloDestino);
        flipDestinoRef.current = Flip.from(estado, {
          targets: botaoDestino,
          paused: true,
          absolute: true,
        });
      }
      flipDestinoRef.current.progress(fatorDocking);
    }

    // Correcao de acessibilidade (spec Fase 2, secao 3.3): os botoes reais
    // nunca tem a propria opacidade amarrada a fatorDocking/fatorDesmonte - eles
    // ficam sempre visiveis e focaveis, com o estilo final, desde o primeiro
    // render. So a camada canvas (decorativa, aria-hidden) anima opacidade: 1
    // no meio da jornada (cobra visivel viajando), 0 perto da origem (ainda nao
    // desmontou) ou do destino (ja fez o docking).
    const canvas = canvasRef.current;
    if (canvas) {
      gsapInstancia.set(canvas, { opacity: 1 - fatorDesmonte - fatorDocking });
    }
  }, [fatorDocking, fatorDesmonte, refBotaoOrigem, refBotaoDestino]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40"
      />
      <div
        ref={eloOrigemRef}
        aria-hidden="true"
        className="pointer-events-none fixed h-10 w-10 opacity-0"
      />
      <div
        ref={eloDestinoRef}
        aria-hidden="true"
        className="pointer-events-none fixed h-10 w-10 opacity-0"
      />
    </>
  );
}
```

- [ ] **Step 3: Rodar o gate completo**

Run: `npx tsc -b --noEmit && npm run lint && npm run format:check && npm run test && npm run build`
Expected: `src/componentes/CamadaCobra.tsx` e `src/hooks/useCobra.ts` agora compilam entre si. Ainda deve FALHAR em `src/paginas/Playground.tsx` (Task 4) e `src/App.tsx` (Task 11), que ainda chamam `<CamadaCobra>` com a API antiga - esperado, nao commitar ainda.

- [ ] **Step 4: Commitar so depois da Task 4 (Playground) estar pronta**

Ver o commit combinado ao final da Task 4 (Tasks 2, 3 e 4 formam uma unica mudanca coerente na engine, commitadas juntas para o projeto nunca ficar num estado que nao compila entre commits).

---

### Task 4: Adaptar `Playground.tsx` a nova API

**Files:**
- Modify: `src/paginas/Playground.tsx`

- [ ] **Step 1: Reescrever `Playground.tsx`**

Substituir o conteudo completo de `src/paginas/Playground.tsx` por:

```typescript
import { useMemo, useRef, useState } from 'react';
import { CamadaCobra } from '../componentes/CamadaCobra';

export default function Playground() {
  const refInicio = useRef<HTMLDivElement>(null);
  const refFim = useRef<HTMLDivElement>(null);
  const refJornada = useRef<HTMLDivElement>(null);
  const refBotaoOrigem = useRef<HTMLButtonElement>(null);
  const refBotaoDestino = useRef<HTMLButtonElement>(null);
  const [velocidade, setVelocidade] = useState(150);
  const [espessura, setEspessura] = useState(6);
  const [quantizacao, setQuantizacao] = useState(12);

  const refsSecoes = useMemo(() => [refInicio, refFim], [refInicio, refFim]);

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
          PASSADAS_TRACO). Ajustar esses valores no codigo apos calibrar visualmente aqui e parte do
          processo desta pagina, nao ha ligacao automatica ainda entre os sliders e a engine nesta
          primeira versao do playground.
        </p>
      </div>

      <div ref={refJornada}>
        <div ref={refInicio} className="flex justify-center py-16">
          <button
            ref={refBotaoOrigem}
            type="button"
            className="bg-vermelho-punk text-branco-papel px-6 py-3 font-bold uppercase tracking-widest"
          >
            CTA de origem (teste)
          </button>
        </div>
        <div aria-hidden="true" style={{ height: `${velocidade}vh` }} />
        <div ref={refFim} className="flex justify-center py-16">
          <button
            ref={refBotaoDestino}
            type="button"
            className="bg-vermelho-punk text-branco-papel px-6 py-3 font-bold uppercase tracking-widest"
          >
            CTA de destino (teste)
          </button>
        </div>
      </div>

      <CamadaCobra
        refsSecoes={refsSecoes}
        refJornada={refJornada}
        refBotaoOrigem={refBotaoOrigem}
        refBotaoDestino={refBotaoDestino}
      />
    </main>
  );
}
```

Nota: os dois botoes de teste perderam a classe `opacity-0` que tinham antes - consistente com a correcao de acessibilidade (Task 3): botoes reais nunca nascem invisiveis.

- [ ] **Step 2: Rodar o gate completo**

Run: `npx tsc -b --noEmit && npm run lint && npm run format:check && npm run test && npm run build`
Expected: tudo limpo. `src/App.tsx` ainda vai falhar (Task 11 corrige) - se a falha for so em `App.tsx`/`App.test.tsx`, prossiga; se houver qualquer erro em `docking`, `useCobra`, `CamadaCobra` ou `Playground`, pare e corrija antes de continuar.

- [ ] **Step 3: Verificacao visual manual (dev server)**

Run: `npm run dev` e acessar `http://localhost:5173/#playground` no navegador. Confirmar: os dois botoes de teste aparecem normalmente (nao mais invisiveis), a cobra desenha e percorre a tela ao rolar, e ao chegar perto do botao de destino ele "recebe" o docking visualmente. Se a posicao inicial dos elementos `eloOrigemRef`/`eloDestinoRef` (internos ao `CamadaCobra`) fizer a transicao do Flip parecer visualmente estranha (ex.: botao aparece "pulando" de um canto distante), isso e uma calibracao visual fina e pode ser ajustada depois - nao bloqueia esta task, mas anote o que observar caso precise de ajuste na Task 12 (gate final).

- [ ] **Step 4: Parar para confirmacao do usuario, depois commitar Tasks 2, 3 e 4 juntas**

So depois do usuario confirmar que testou localmente (typecheck/lint/format/testes/build limpos e verificacao visual do playground):

```bash
git add src/cobra/docking.ts src/cobra/docking.test.ts src/hooks/useCobra.ts src/hooks/useCobra.test.ts src/componentes/CamadaCobra.tsx src/lib/movimento.ts src/paginas/Playground.tsx
git commit -m "feat: estender a cobra para N waypoints e desmonte simetrico

Adiciona fatorDesmonte (simetrico ao fatorDocking existente), muda a
API de useCobra/CamadaCobra de duas ancoras fixas para um array de
refs por secao, e corrige a divida de acessibilidade da Fase 1: os
botoes reais nunca mais tem a propria opacidade amarrada ao progresso
da cobra, ficando sempre visiveis e focaveis desde o primeiro render."
```

---

### Task 5: `src/secoes/Hero.tsx`

**Files:**
- Create: `src/secoes/Hero.tsx`
- Test: `src/secoes/Hero.test.tsx`

- [ ] **Step 1: Escrever o teste que falha primeiro**

Criar `src/secoes/Hero.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { RefObject } from 'react';
import { Hero } from './Hero';

function criarRefSecao(): RefObject<HTMLElement | null> {
  return { current: null };
}

function criarRefBotao(): RefObject<HTMLButtonElement | null> {
  return { current: null };
}

describe('Hero', () => {
  it('renderiza a identidade, a tag e o CTA real, sempre visivel e focavel', () => {
    render(<Hero refSecao={criarRefSecao()} refBotao={criarRefBotao()} />);

    expect(screen.getByLabelText('DG')).toBeInTheDocument();
    expect(screen.getByText('Python & AI Engineer')).toBeInTheDocument();

    const botao = screen.getByRole('button', { name: 'Ver projetos' });
    expect(botao).toBeInTheDocument();
    expect(botao).not.toHaveClass('opacity-0');
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm run test -- Hero`
Expected: FAIL - `./Hero` nao existe ainda.

- [ ] **Step 3: Criar `Hero.tsx`**

Criar `src/secoes/Hero.tsx`:

```typescript
import type { RefObject } from 'react';
import { NotaDeResgate } from '../componentes/NotaDeResgate';
import { FitaAdesiva } from '../componentes/FitaAdesiva';
import { rolarAte } from '../lib/movimento';

interface HeroProps {
  refSecao: RefObject<HTMLElement | null>;
  refBotao: RefObject<HTMLButtonElement | null>;
}

export function Hero({ refSecao, refBotao }: HeroProps) {
  function aoClicarVerProjetos(): void {
    const alvo = document.getElementById('projetos');
    if (alvo) {
      rolarAte(alvo);
    }
  }

  return (
    <section
      ref={refSecao}
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center text-center gap-6 p-8"
    >
      <NotaDeResgate texto="DG" />
      <FitaAdesiva indice={1}>Python & AI Engineer</FitaAdesiva>
      <button
        ref={refBotao}
        type="button"
        onClick={aoClicarVerProjetos}
        className="bg-vermelho-punk text-branco-papel px-6 py-3 font-bold uppercase tracking-widest"
      >
        Ver projetos
      </button>
    </section>
  );
}
```

- [ ] **Step 4: Rodar o teste de novo e confirmar que passa**

Run: `npm run test -- Hero`
Expected: PASS.

- [ ] **Step 5: Rodar o gate completo**

Run: `npx tsc -b --noEmit && npm run lint && npm run format:check && npm run test && npm run build`
Expected: limpo (App.tsx ainda nao usa Hero, entao nada quebra por integracao ainda).

- [ ] **Step 6: Parar para confirmacao do usuario, depois commitar**

```bash
git add src/secoes/Hero.tsx src/secoes/Hero.test.tsx
git commit -m "feat: adicionar secao Hero com CTA real Ver projetos"
```

---

### Task 6: `src/secoes/Sobre.tsx`

**Files:**
- Create: `src/secoes/Sobre.tsx`
- Test: `src/secoes/Sobre.test.tsx`

- [ ] **Step 1: Escrever o teste que falha primeiro**

Criar `src/secoes/Sobre.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { RefObject } from 'react';
import { Sobre } from './Sobre';

function criarRefSecao(): RefObject<HTMLElement | null> {
  return { current: null };
}

describe('Sobre', () => {
  it('renderiza a trajetoria profissional e a formacao', () => {
    render(<Sobre refSecao={criarRefSecao()} />);

    expect(screen.getByText(/Expresso Truck/)).toBeInTheDocument();
    expect(screen.getByText(/Fundacao Beta/)).toBeInTheDocument();
    expect(screen.getByText(/UniCesumar/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm run test -- Sobre`
Expected: FAIL - `./Sobre` nao existe ainda.

- [ ] **Step 3: Criar `Sobre.tsx`**

Criar `src/secoes/Sobre.tsx`:

```typescript
import type { RefObject } from 'react';
import { Carimbo } from '../componentes/Carimbo';

interface SobreProps {
  refSecao: RefObject<HTMLElement | null>;
}

export function Sobre({ refSecao }: SobreProps) {
  return (
    <section ref={refSecao} id="sobre" className="min-h-screen flex items-center gap-8 p-8">
      <div className="flex-1 text-lg leading-relaxed">
        <h2 className="text-2xl font-bold mb-4">Sobre</h2>
        <p>
          Comecei gerenciando atendimento na Expresso Truck e na Monumental Assistencia 24hrs. Na
          Monumental, virei desenvolvedor Python: automatizei operacoes com LLMs e dashboards,
          reduzindo em 35% o tempo de atendimento. Hoje sou Analista Senior e Desenvolvedor na
          Fundacao Beta, Prefeitura de Betim.
        </p>
        <p className="mt-4">
          Pos Graduacao em Sistemas com Python (UniCesumar) e Bacharelado em Ciencia da Computacao
          (Cruzeiro do Sul).
        </p>
      </div>
      <div className="shrink-0">
        <Carimbo indice={2}>DG, EST. 2026</Carimbo>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Rodar o teste de novo e confirmar que passa**

Run: `npm run test -- Sobre`
Expected: PASS.

- [ ] **Step 5: Rodar o gate completo**

Run: `npx tsc -b --noEmit && npm run lint && npm run format:check && npm run test && npm run build`
Expected: limpo.

- [ ] **Step 6: Parar para confirmacao do usuario, depois commitar**

```bash
git add src/secoes/Sobre.tsx src/secoes/Sobre.test.tsx
git commit -m "feat: adicionar secao Sobre com trajetoria profissional"
```

---

### Task 7: `src/secoes/Stack.tsx`

**Files:**
- Create: `src/secoes/Stack.tsx`
- Test: `src/secoes/Stack.test.tsx`

- [ ] **Step 1: Escrever o teste que falha primeiro**

Criar `src/secoes/Stack.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { RefObject } from 'react';
import { Stack } from './Stack';

function criarRefSecao(): RefObject<HTMLElement | null> {
  return { current: null };
}

describe('Stack', () => {
  it('renderiza a lista de tecnologias como mural de adesivos', () => {
    render(<Stack refSecao={criarRefSecao()} />);

    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('FastAPI')).toBeInTheDocument();
    expect(screen.getByText('LangChain')).toBeInTheDocument();
    expect(screen.getByText('RAG')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm run test -- Stack`
Expected: FAIL - `./Stack` nao existe ainda.

- [ ] **Step 3: Criar `Stack.tsx`**

Criar `src/secoes/Stack.tsx`:

```typescript
import type { RefObject } from 'react';
import { Adesivo } from '../componentes/Adesivo';

interface StackProps {
  refSecao: RefObject<HTMLElement | null>;
}

const TECNOLOGIAS = [
  'Python',
  'FastAPI',
  'LangChain',
  'LangGraph',
  'RAG',
  'ChromaDB',
  'Pinecone',
  'OpenAI API',
  'Claude API',
  'Docker',
  'PostgreSQL',
  'React',
  'TypeScript',
] as const;

export function Stack({ refSecao }: StackProps) {
  return (
    <section
      ref={refSecao}
      id="stack"
      className="min-h-screen flex flex-col items-center justify-center gap-8 p-8"
    >
      <h2 className="text-2xl font-bold">Stack</h2>
      <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
        {TECNOLOGIAS.map((tecnologia, indice) => (
          <Adesivo key={tecnologia} indice={indice}>
            {tecnologia}
          </Adesivo>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Rodar o teste de novo e confirmar que passa**

Run: `npm run test -- Stack`
Expected: PASS.

- [ ] **Step 5: Rodar o gate completo**

Run: `npx tsc -b --noEmit && npm run lint && npm run format:check && npm run test && npm run build`
Expected: limpo.

- [ ] **Step 6: Parar para confirmacao do usuario, depois commitar**

```bash
git add src/secoes/Stack.tsx src/secoes/Stack.test.tsx
git commit -m "feat: adicionar secao Stack com mural de adesivos"
```

---

### Task 8: `src/secoes/Projetos.tsx`

**Files:**
- Create: `src/secoes/Projetos.tsx`
- Test: `src/secoes/Projetos.test.tsx`

- [ ] **Step 1: Escrever o teste que falha primeiro**

Criar `src/secoes/Projetos.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { RefObject } from 'react';
import { Projetos } from './Projetos';

function criarRefSecao(): RefObject<HTMLElement | null> {
  return { current: null };
}

describe('Projetos', () => {
  it('renderiza os 4 projetos reais, o Tudo Em Dia com link externo', () => {
    render(<Projetos refSecao={criarRefSecao()} />);

    expect(screen.getByText('Tudo Em Dia')).toBeInTheDocument();
    expect(screen.getByText('Sistema de Ponto')).toBeInTheDocument();
    expect(screen.getByText('Controle de Ponto')).toBeInTheDocument();
    expect(screen.getByText('ingestao-async')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'Ver projeto' });
    expect(link).toHaveAttribute('href', 'https://tatudoemdia.com.br/');
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm run test -- Projetos`
Expected: FAIL - `./Projetos` nao existe ainda.

- [ ] **Step 3: Criar `Projetos.tsx`**

Criar `src/secoes/Projetos.tsx`:

```typescript
import type { RefObject } from 'react';
import { obterRotacao } from '../estilos/tokens';

interface ProjetosProps {
  refSecao: RefObject<HTMLElement | null>;
}

interface Projeto {
  nome: string;
  descricao: string;
  stack: string;
  link?: string;
}

const PROJETOS: readonly Projeto[] = [
  {
    nome: 'Tudo Em Dia',
    descricao: 'SaaS de financas pessoais com assistente de IA por voz, no ar em producao.',
    stack: 'Next.js, TypeScript',
    link: 'https://tatudoemdia.com.br/',
  },
  {
    nome: 'Sistema de Ponto',
    descricao:
      'Ponto eletronico com reconhecimento facial e banco de horas, conforme Portaria 671/2021 e LGPD.',
    stack: 'Python',
  },
  {
    nome: 'Controle de Ponto',
    descricao:
      'Sistema sob demanda para cliente real, substituindo planilha manual por autenticacao JWT/bcrypt e geracao de folha de ponto em PDF.',
    stack: 'TypeScript',
  },
  {
    nome: 'ingestao-async',
    descricao:
      'API assincrona de ingestao de dados publicos: fila Postgres, worker em background e dashboard React.',
    stack: 'Python, FastAPI, React',
  },
];

export function Projetos({ refSecao }: ProjetosProps) {
  return (
    <section
      ref={refSecao}
      id="projetos"
      className="min-h-screen flex flex-col items-center justify-center gap-8 p-8"
    >
      <h2 className="text-2xl font-bold">Projetos</h2>
      <div className="grid gap-6 sm:grid-cols-2 max-w-4xl">
        {PROJETOS.map((projeto, indice) => (
          <article
            key={projeto.nome}
            className="border-2 border-preto-tinta bg-branco-papel p-4"
            style={{ transform: `rotate(${obterRotacao(indice)}deg)` }}
          >
            <h3 className="font-bold text-lg">{projeto.nome}</h3>
            <p className="mt-2 text-sm">{projeto.descricao}</p>
            <p className="mt-2 text-xs uppercase tracking-wide">{projeto.stack}</p>
            {projeto.link ? (
              <a
                href={projeto.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block underline"
              >
                Ver projeto
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Rodar o teste de novo e confirmar que passa**

Run: `npm run test -- Projetos`
Expected: PASS.

- [ ] **Step 5: Rodar o gate completo**

Run: `npx tsc -b --noEmit && npm run lint && npm run format:check && npm run test && npm run build`
Expected: limpo.

- [ ] **Step 6: Parar para confirmacao do usuario, depois commitar**

```bash
git add src/secoes/Projetos.tsx src/secoes/Projetos.test.tsx
git commit -m "feat: adicionar secao Projetos com os 4 projetos reais em cards"
```

---

### Task 9: `src/secoes/LabIA.tsx`

**Files:**
- Create: `src/secoes/LabIA.tsx`
- Test: `src/secoes/LabIA.test.tsx`

- [ ] **Step 1: Escrever o teste que falha primeiro**

Criar `src/secoes/LabIA.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { RefObject } from 'react';
import { LabIA } from './LabIA';

function criarRefSecao(): RefObject<HTMLElement | null> {
  return { current: null };
}

describe('LabIA', () => {
  it('renderiza o case study institucional sem link de codigo', () => {
    render(<LabIA refSecao={criarRefSecao()} />);

    expect(screen.getByText(/LangChain/)).toBeInTheDocument();
    expect(screen.getByText(/35%/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm run test -- LabIA`
Expected: FAIL - `./LabIA` nao existe ainda.

- [ ] **Step 3: Criar `LabIA.tsx`**

Criar `src/secoes/LabIA.tsx`:

```typescript
import type { RefObject } from 'react';

interface LabIAProps {
  refSecao: RefObject<HTMLElement | null>;
}

export function LabIA({ refSecao }: LabIAProps) {
  return (
    <section
      ref={refSecao}
      id="labia"
      className="min-h-screen flex flex-col md:flex-row items-center gap-8 p-8"
    >
      <div className="flex-1 text-lg leading-relaxed">
        <h2 className="text-2xl font-bold mb-4">LabIA</h2>
        <p>
          Na Monumental Assistencia 24hrs, automatizei operacoes de atendimento usando LLMs
          (LangChain, LangGraph, RAG) e dashboards, reduzindo em 35% o tempo de atendimento. Esse
          trabalho e institucional e nao tem codigo publico, mas o fluxo geral segue o padrao ao
          lado.
        </p>
      </div>
      <div className="flex-1 border-2 border-dashed border-preto-tinta p-6 text-sm text-center">
        Entrada do atendimento, RAG sobre base de conhecimento, LLM gera resposta, dashboard de
        acompanhamento
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Rodar o teste de novo e confirmar que passa**

Run: `npm run test -- LabIA`
Expected: PASS.

- [ ] **Step 5: Rodar o gate completo**

Run: `npx tsc -b --noEmit && npm run lint && npm run format:check && npm run test && npm run build`
Expected: limpo.

- [ ] **Step 6: Parar para confirmacao do usuario, depois commitar**

```bash
git add src/secoes/LabIA.tsx src/secoes/LabIA.test.tsx
git commit -m "feat: adicionar secao LabIA com case study institucional"
```

---

### Task 10: `src/secoes/Contato.tsx`

**Files:**
- Create: `src/secoes/Contato.tsx`
- Test: `src/secoes/Contato.test.tsx`

- [ ] **Step 1: Escrever o teste que falha primeiro**

Criar `src/secoes/Contato.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { RefObject } from 'react';
import { Contato } from './Contato';

function criarRefSecao(): RefObject<HTMLElement | null> {
  return { current: null };
}

function criarRefBotao(): RefObject<HTMLAnchorElement | null> {
  return { current: null };
}

describe('Contato', () => {
  it('renderiza o CTA real do WhatsApp, sempre visivel e focavel', () => {
    render(<Contato refSecao={criarRefSecao()} refBotao={criarRefBotao()} />);

    const link = screen.getByRole('link', { name: 'Fale comigo' });
    expect(link).toBeInTheDocument();
    expect(link).not.toHaveClass('opacity-0');
    expect(link).toHaveAttribute('href', expect.stringContaining('wa.me/5531991519864'));
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm run test -- Contato`
Expected: FAIL - `./Contato` nao existe ainda.

- [ ] **Step 3: Criar `Contato.tsx`**

Criar `src/secoes/Contato.tsx`:

```typescript
import type { RefObject } from 'react';

interface ContatoProps {
  refSecao: RefObject<HTMLElement | null>;
  refBotao: RefObject<HTMLAnchorElement | null>;
}

const LINK_WHATSAPP = 'https://wa.me/5531991519864?text=Ola%2C%20vim%20pelo%20seu%20portfolio%21';

export function Contato({ refSecao, refBotao }: ContatoProps) {
  return (
    <section
      ref={refSecao}
      id="contato"
      className="min-h-screen flex flex-col items-center justify-center text-center gap-6 p-8"
    >
      <h2 className="text-2xl font-bold">Vamos conversar?</h2>
      <a
        ref={refBotao}
        href={LINK_WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-vermelho-punk text-branco-papel px-6 py-3 font-bold uppercase tracking-widest"
      >
        Fale comigo
      </a>
    </section>
  );
}
```

- [ ] **Step 4: Rodar o teste de novo e confirmar que passa**

Run: `npm run test -- Contato`
Expected: PASS.

- [ ] **Step 5: Rodar o gate completo**

Run: `npx tsc -b --noEmit && npm run lint && npm run format:check && npm run test && npm run build`
Expected: limpo.

- [ ] **Step 6: Parar para confirmacao do usuario, depois commitar**

```bash
git add src/secoes/Contato.tsx src/secoes/Contato.test.tsx
git commit -m "feat: adicionar secao Contato com CTA real do WhatsApp"
```

---

### Task 11: Reescrever `App.tsx` compondo as 6 secoes

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Atualizar o teste de integracao**

Substituir o conteudo completo de `src/App.test.tsx` por:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renderiza a identidade do Hero', () => {
    render(<App />);
    expect(screen.getByLabelText('DG')).toBeInTheDocument();
    expect(screen.getByText('Python & AI Engineer')).toBeInTheDocument();
  });

  it('renderiza o CTA real do Hero', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Ver projetos' })).toBeInTheDocument();
  });

  it('renderiza o CTA real do Contato', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: 'Fale comigo' })).toBeInTheDocument();
  });

  it('renderiza as 6 secoes na ordem esperada', () => {
    render(<App />);
    const secoes = document.querySelectorAll('section');
    const ids = Array.from(secoes).map((secao) => secao.id);
    expect(ids).toEqual(['hero', 'sobre', 'stack', 'projetos', 'labia', 'contato']);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm run test -- App.test`
Expected: FAIL - `App.tsx` ainda usa o placeholder da Fase 0/1, sem as 6 secoes.

- [ ] **Step 3: Reescrever `App.tsx`**

Substituir o conteudo completo de `src/App.tsx` por:

```typescript
import { useMemo, useRef } from 'react';
import { Hero } from './secoes/Hero';
import { Sobre } from './secoes/Sobre';
import { Stack } from './secoes/Stack';
import { Projetos } from './secoes/Projetos';
import { LabIA } from './secoes/LabIA';
import { Contato } from './secoes/Contato';
import { CamadaCobra } from './componentes/CamadaCobra';

export default function App() {
  const refJornada = useRef<HTMLDivElement>(null);
  const refHero = useRef<HTMLElement>(null);
  const refSobre = useRef<HTMLElement>(null);
  const refStack = useRef<HTMLElement>(null);
  const refProjetos = useRef<HTMLElement>(null);
  const refLabIA = useRef<HTMLElement>(null);
  const refContato = useRef<HTMLElement>(null);
  const refBotaoOrigem = useRef<HTMLButtonElement>(null);
  const refBotaoDestino = useRef<HTMLAnchorElement>(null);

  const refsSecoes = useMemo(
    () => [refHero, refSobre, refStack, refProjetos, refLabIA, refContato],
    [refHero, refSobre, refStack, refProjetos, refLabIA, refContato],
  );

  return (
    <main className="bg-branco-papel text-preto-tinta textura-granulada">
      <div ref={refJornada}>
        <Hero refSecao={refHero} refBotao={refBotaoOrigem} />
        <Sobre refSecao={refSobre} />
        <Stack refSecao={refStack} />
        <Projetos refSecao={refProjetos} />
        <LabIA refSecao={refLabIA} />
        <Contato refSecao={refContato} refBotao={refBotaoDestino} />
      </div>

      <CamadaCobra
        refsSecoes={refsSecoes}
        refJornada={refJornada}
        refBotaoOrigem={refBotaoOrigem}
        refBotaoDestino={refBotaoDestino}
      />
    </main>
  );
}
```

- [ ] **Step 4: Rodar o teste de novo e confirmar que passa**

Run: `npm run test -- App.test`
Expected: PASS.

- [ ] **Step 5: Rodar o gate completo**

Run: `npx tsc -b --noEmit && npm run lint && npm run format:check && npm run test && npm run build`
Expected: tudo limpo, projeto inteiro compila.

- [ ] **Step 6: Verificacao visual manual (dev server)**

Run: `npm run dev`, acessar `http://localhost:5173`. Confirmar: as 6 secoes aparecem na ordem certa, a cobra percorre a pagina inteira ao rolar (do Hero ao Contato), o CTA "Ver projetos" no Hero rola suavemente ate Projetos, e o CTA "Fale comigo" no Contato aponta para o WhatsApp certo.

- [ ] **Step 7: Parar para confirmacao do usuario, depois commitar**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat: compor as 6 secoes reais em App.tsx

Substitui o placeholder herdado das Fases 0 e 1 pelas secoes reais do
portfolio, com a cobra percorrendo a pagina inteira via refsSecoes."
```

---

### Task 12: Gate final da Fase 2 + auditoria de performance

**Files:** nenhum arquivo de codigo, so verificacao.

- [ ] **Step 1: Rodar o gate local completo uma ultima vez**

Run: `npx tsc -b --noEmit && npm run lint && npm run format:check && npm run test && npm run build`
Expected: tudo limpo.

- [ ] **Step 2: Revalidar os 8 pontos do contrato tecnico manualmente**

Conferir contra `CLAUDE.md`: canvas unico fixed com aria-hidden (ponto 1), botoes reais sempre no DOM e focaveis independente da cobra (ponto 2, ja corrigido nas Tasks 2 a 4), trajetoria pre-computada sem leitura de layout no loop (ponto 3, `elementoParaPonto` so no mount/resize), rAF unico do GSAP com Lenis conectado (ponto 4), buffer circular sem alocacao no rAF (ponto 5, ja validado na Fase 1 e preservado), docking via Flip (ponto 6, agora com dois mecanismos simetricos), reduced-motion desliga tudo com fallback estatico (ponto 7, `cobraAtiva=false` + botoes sempre visiveis), IntersectionObserver/visibilitychange pausam o loop (ponto 8, preservado de `useCobra`).

- [ ] **Step 3: Delegar a auditoria de performance a um subagente**

Dispatch do subagente `auditor-performance` (ou `general-purpose` com as instrucoes coladas, se o subagente customizado nao for reconhecido - ver memoria do projeto `subagentes_customizados_nao_reconhecidos`), pedindo: build de producao (`npm run build`), Lighthouse mobile real contra o build (reusar a tecnica documentada na memoria `chromium_headless_sem_sudo` para Chromium headless sem sudo neste ambiente, via `apt-get download` + `dpkg-deb -x` das libs `libnspr4`, `libnss3`, `libasound2t64`), com metas: Performance >= 95, Acessibilidade 100, LCP < 2.0s, CLS < 0.05, zero long tasks acima de 50ms durante scroll. Pedir tambem grep por `Math.random` fora de comentarios e por libs proibidas no `package.json`.

- [ ] **Step 4: Corrigir bloqueadores que a auditoria encontrar**

Se a auditoria retornar BLOQUEADO, corrigir cada item antes de prosseguir, rodando o gate completo de novo apos cada correcao. Se aprovado, seguir para a Task 13.

---

### Task 13: Review final de branch

**Files:** nenhum arquivo de codigo, so verificacao.

- [ ] **Step 1: Gerar o pacote de review**

```bash
git log --oneline <commit-antes-da-task-1>..HEAD -- src/cobra/docking.ts src/hooks/useCobra.ts src/componentes/CamadaCobra.tsx src/lib/movimento.ts src/paginas/Playground.tsx src/secoes/ src/App.tsx > /tmp/claude-1000/*/scratchpad/review-fase2-commits.txt
git diff <commit-antes-da-task-1>..HEAD -- src/cobra/docking.ts src/hooks/useCobra.ts src/componentes/CamadaCobra.tsx src/lib/movimento.ts src/paginas/Playground.tsx src/secoes/ src/App.tsx > /tmp/claude-1000/*/scratchpad/review-fase2-diff.patch
```

(Ajustar o caminho do scratchpad para o da sessao atual, e `<commit-antes-da-task-1>` para o hash do commit em `main` imediatamente anterior ao merge da Task 1 desta fase.)

- [ ] **Step 2: Dispatch do subagente de review**

Dispatch do subagente `revisor-codigo` no modelo mais capaz disponivel (Opus, seguindo a estrategia opusplan do projeto), passando os dois arquivos gerados no Step 1 e pedindo foco em: corretude, aderencia aos 8 pontos do contrato tecnico (incluindo os 2 novos: N waypoints e desmonte simetrico), a correcao de acessibilidade (secao 3.3 da spec, confirmar que os botoes reais realmente nunca dependem da cobra), determinismo visual (sem `Math.random`), tipos estritos (zero `any`/`ts-ignore`), simplicidade (YAGNI/DRY), e conteudo real correto (nomes de projetos, links, texto das secoes batendo com a spec).

- [ ] **Step 3: Tratar o veredito**

Se BLOQUEADO, corrigir cada item listado (delegando a um subagente de implementacao se apropriado), rodar o gate completo de novo, e re-rodar o review. Se APROVADO, a Fase 2 esta fechada - atualizar a memoria do projeto (`project_site_dev.md` e `MEMORY.md`) registrando o fechamento e o proximo passo (Fase 3: pagina 404 com minigame).

---

## Self-review (checklist do autor do plano)

**Cobertura da spec:** conteudo real das 6 secoes (Task 5 a 10), extensao de N waypoints (Task 2), desmonte simetrico (Task 1, 3), correcao de acessibilidade (Task 2, 3), ritmo visual variando por secao (Hero/Contato centralizados nas Tasks 5/10, Sobre/LabIA split editorial nas Tasks 6/9, Stack mural na Task 7, Projetos cards na Task 8), gate final e review (Tasks 12, 13) - todos os pontos da spec tem uma task correspondente.

**Placeholders:** nenhum `TBD`/`TODO` no plano; todo passo de codigo tem o codigo completo.

**Consistencia de tipos:** `refsSecoes: readonly RefObject<HTMLElement | null>[]` e identico em `OpcoesCobra` (useCobra.ts) e `CamadaCobraProps` (CamadaCobra.tsx); `fatorDocking`/`fatorDesmonte` tem os mesmos nomes em `docking.ts`, `useCobra.ts` (retorno do hook) e `CamadaCobra.tsx` (destructuring); `refBotaoOrigem`/`refBotaoDestino` mantidos consistentes em `CamadaCobraProps`, `App.tsx` e `Playground.tsx`.
