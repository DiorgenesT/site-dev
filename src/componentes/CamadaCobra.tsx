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

    // Mesmo padrao de debounce de 150ms usado em useCobra.ts para o resize
    // dos waypoints (contrato tecnico, CLAUDE.md).
    let resizeTimeoutId: ReturnType<typeof setTimeout> | undefined;
    const aoRedimensionar = (): void => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(redimensionar, 150);
    };
    const observadorRedimensionamento = new ResizeObserver(aoRedimensionar);
    observadorRedimensionamento.observe(document.body);

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
      observadorRedimensionamento.disconnect();
      clearTimeout(resizeTimeoutId);
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
