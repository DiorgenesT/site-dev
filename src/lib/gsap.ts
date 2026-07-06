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
