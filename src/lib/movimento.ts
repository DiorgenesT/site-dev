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
    // Lenis ja suaviza o scroll por conta propria; sem isso o GSAP pode "engolir"
    // deltas grandes apos a aba voltar do background, causando saltos.
    gsap.ticker.lagSmoothing(0);
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
