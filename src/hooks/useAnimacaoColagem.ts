import { useLayoutEffect, useEffect, type RefObject } from 'react';
import type { ScrollTrigger as TipoScrollTrigger } from 'gsap/ScrollTrigger';

function selecionarAlvos(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-colagem]'));
}

function prefereReduzido(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Le a rotacao que os tokens (obterRotacao) ja aplicaram via style inline,
// direto da string, sem depender do GSAP (que a essa altura ainda nao rodou).
function extrairRotacao(elemento: HTMLElement): number {
  const match = /rotate\(([-\d.]+)deg\)/.exec(elemento.style.transform);
  return match?.[1] ? parseFloat(match[1]) : 0;
}

// Anima elementos marcados com data-colagem dentro do container: cada um
// entra com rotacao exagerada, deslocado e menor, ate assentar na posicao
// deterministica que os tokens ja definiram via CSS, como se estivesse
// sendo colado na pagina.
export function useAnimacaoColagem(refContainer: RefObject<HTMLElement>): void {
  // Esconde os elementos de forma sincrona, antes do navegador pintar o
  // primeiro frame: sem isso, o conteudo aparece no estado final e so depois
  // "pisca" pra escondido quando o GSAP (carregado em chunk lazy) finalmente
  // roda, porque o import dinamico e mais lento que o primeiro paint.
  useLayoutEffect(() => {
    const container = refContainer.current;
    if (!container || prefereReduzido()) {
      return;
    }
    selecionarAlvos(container).forEach((elemento) => {
      elemento.style.opacity = '0';
    });
  }, [refContainer]);

  useEffect(() => {
    const container = refContainer.current;
    if (!container || prefereReduzido()) {
      return;
    }

    let cancelado = false;
    let triggers: TipoScrollTrigger[] = [];

    // Dois rAF encadeados adiam o import ate depois do navegador ja ter
    // pintado o frame anterior, pra baixar/rodar o GSAP nunca competir com o
    // first paint (contrato de performance, CLAUDE.md). A visibilidade em si
    // ja foi resolvida sincronamente acima, entao esse atraso nao causa
    // flash de conteudo no estado final.
    const idPrimeiroQuadro = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void (async () => {
          const alvos = selecionarAlvos(container);
          if (alvos.length === 0) {
            return;
          }

          try {
            const { carregarGsap, ScrollTrigger } = await import('../lib/gsap');
            if (cancelado) {
              return;
            }
            const gsap = carregarGsap();

            triggers = ScrollTrigger.batch(alvos, {
              start: 'top 88%',
              once: true,
              onEnter: (elementosNoBatch) => {
                const alvosBatch = elementosNoBatch as HTMLElement[];
                const rotacoesFinais = new Map(
                  alvosBatch.map((alvo) => [alvo, extrairRotacao(alvo)]),
                );

                gsap.fromTo(
                  alvosBatch,
                  {
                    opacity: 0,
                    y: 24,
                    scale: 0.9,
                    rotation: (_i, alvo: Element) =>
                      (rotacoesFinais.get(alvo as HTMLElement) ?? 0) + 14,
                  },
                  {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotation: (_i, alvo: Element) => rotacoesFinais.get(alvo as HTMLElement) ?? 0,
                    duration: 0.6,
                    ease: 'back.out(1.6)',
                    stagger: 0.12,
                  },
                );
              },
            });
          } catch {
            // Se o chunk do GSAP falhar ao carregar, garante que o
            // conteudo continua visivel em vez de ficar escondido pra
            // sempre.
            alvos.forEach((alvo) => {
              alvo.style.opacity = '1';
            });
          }
        })();
      });
    });

    return () => {
      cancelado = true;
      cancelAnimationFrame(idPrimeiroQuadro);
      triggers.forEach((trigger) => {
        trigger.kill();
      });
    };
  }, [refContainer]);
}
