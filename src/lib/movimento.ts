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
