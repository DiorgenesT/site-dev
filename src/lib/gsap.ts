import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registrado = false;

// Import dinamico (chamado so de dentro de hooks apos o mount) mantem
// GSAP fora do chunk inicial, carregado em background apos o first paint.
export function carregarGsap(): typeof gsap {
  if (!registrado) {
    gsap.registerPlugin(ScrollTrigger);
    registrado = true;
  }
  return gsap;
}

export { ScrollTrigger };
