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
import { fatorDocking, INICIO_ZONA_DOCKING } from '../cobra/docking';
import type { Ponto } from '../cobra/tipos';
import { carregarGsap, ScrollTrigger } from '../lib/gsap';
import { iniciarMovimento, pararMovimento } from '../lib/movimento';

interface OpcoesCobra {
  refInicio: RefObject<HTMLElement | null>;
  refFim: RefObject<HTMLElement | null>;
}

interface EstadoCobra {
  bufferRef: RefObject<BufferCircular>;
  fatorDocking: number;
}

function elementoParaPonto(elemento: HTMLElement): Ponto {
  const retangulo = elemento.getBoundingClientRect();
  return {
    x: retangulo.left + retangulo.width / 2 + window.scrollX,
    y: retangulo.top + retangulo.height / 2 + window.scrollY,
  };
}

export function useCobra({ refInicio, refFim }: OpcoesCobra): EstadoCobra {
  const bufferRef = useRef<BufferCircular>(criarBufferCircular(TAMANHO_BUFFER_CORPO));
  // Fallback estatico funcional (contrato tecnico da cobra, ponto 7): com
  // reduced-motion, o fator de docking ja nasce em 1 (em vez de 0), fazendo o
  // botao real de CTA ficar visivel e o canvas invisivel desde o primeiro
  // render, sem depender de nenhuma animacao ou de setState dentro do efeito.
  const [fator, setFator] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0,
  );

  useEffect(() => {
    const prefereReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefereReduzido) {
      return undefined;
    }

    const elementoInicio = refInicio.current;
    const elementoFim = refFim.current;
    if (!elementoInicio || !elementoFim) {
      return undefined;
    }

    let trajetoria: Trajetoria = construirTrajetoria([
      elementoParaPonto(elementoInicio),
      elementoParaPonto(elementoFim),
    ]);
    const quantizador = criarQuantizador(PASSOS_POR_SEGUNDO);
    let progressoAtual = 0;
    let visivelAba = document.visibilityState === 'visible';
    let visivelTela = true;

    const gsap = carregarGsap();

    const scrollTrigger = ScrollTrigger.create({
      trigger: elementoInicio,
      endTrigger: elementoFim,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        progressoAtual = self.progress;
      },
    });

    let resizeTimeoutId: ReturnType<typeof setTimeout> | undefined;
    // Arrow function (nao function declaration): preserva o estreitamento de tipo
    // de elementoInicio/elementoFim (HTMLElement | null -> HTMLElement) dentro do closure.
    const aoRedimensionar = (): void => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(() => {
        trajetoria = construirTrajetoria([
          elementoParaPonto(elementoInicio),
          elementoParaPonto(elementoFim),
        ]);
        scrollTrigger.refresh();
      }, 150);
    };
    const observadorRedimensionamento = new ResizeObserver(aoRedimensionar);
    observadorRedimensionamento.observe(document.body);

    function aoMudarVisibilidadeAba(): void {
      visivelAba = document.visibilityState === 'visible';
    }
    document.addEventListener('visibilitychange', aoMudarVisibilidadeAba);

    const observadorIntersecao = new IntersectionObserver(
      (entradas) => {
        const entrada = entradas[0];
        visivelTela = entrada ? entrada.isIntersecting : true;
      },
      { threshold: 0 },
    );
    observadorIntersecao.observe(elementoInicio);

    function aoTick(_tempo: number, deltaMs: number): void {
      if (!visivelAba || !visivelTela) {
        return;
      }
      const avancou = avancarQuantizador(quantizador, deltaMs);
      if (avancou) {
        const ponto = trajetoria.amostrar(progressoAtual);
        inserirPosicao(bufferRef.current, ponto);
        setFator(fatorDocking(progressoAtual, INICIO_ZONA_DOCKING));
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
  }, [refInicio, refFim]);

  return { bufferRef, fatorDocking: fator };
}
