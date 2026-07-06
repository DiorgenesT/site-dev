import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useCobra } from '../hooks/useCobra';
import { obterPosicao, PASSADAS_TRACO } from '../cobra/motor';
import { carregarGsap, Flip } from '../lib/gsap';

interface CamadaCobraProps {
  refInicio: RefObject<HTMLElement | null>;
  refFim: RefObject<HTMLElement | null>;
  refJornada: RefObject<HTMLElement | null>;
  refBotaoDestino: RefObject<HTMLElement | null>;
}

export function CamadaCobra({ refInicio, refFim, refJornada, refBotaoDestino }: CamadaCobraProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const eloRef = useRef<HTMLDivElement | null>(null);
  // Flip.from() retorna uma Timeline (nao um Tween) - confirmado em gsap/types/Flip.d.ts.
  const flipTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const { bufferRef, fatorDocking } = useCobra({ refInicio, refFim, refJornada });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
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

    function desenhar(): void {
      if (!canvas || !contexto) {
        return;
      }
      const buffer = bufferRef.current;
      contexto.clearRect(0, 0, canvas.width, canvas.height);
      if (!buffer || buffer.quantidadeEscrita < 2) {
        return;
      }
      for (const passada of PASSADAS_TRACO) {
        contexto.beginPath();
        contexto.lineWidth = passada.espessura;
        contexto.strokeStyle = '#0a0a0a';
        contexto.lineCap = 'round';
        contexto.lineJoin = 'round';
        for (let i = 0; i < buffer.quantidadeEscrita; i += 1) {
          const ponto = obterPosicao(buffer, i);
          const x = ponto.x + passada.deslocamentoX - window.scrollX;
          const y = ponto.y + passada.deslocamentoY - window.scrollY;
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
  }, [bufferRef]);

  useEffect(() => {
    const elo = eloRef.current;
    const botao = refBotaoDestino.current;
    if (!elo || !botao) {
      return;
    }

    // carregarGsap() registra o plugin Flip antes de qualquer uso: nao depender
    // do efeito do canvas para isso, pois ele pode retornar cedo (ex.: contexto
    // 2d indisponivel) e deixar o Flip sem registro, quebrando Flip.getState.
    const gsap = carregarGsap();

    if (!flipTimelineRef.current) {
      const estado = Flip.getState(elo);
      flipTimelineRef.current = Flip.from(estado, {
        targets: botao,
        paused: true,
        absolute: true,
      });
    }

    flipTimelineRef.current.progress(fatorDocking);

    // gsap.set (nao atribuicao direta a .style) para nao mutar diretamente um
    // elemento DOM alcancado por uma ref recebida via prop (react-hooks/immutability).
    const canvas = canvasRef.current;
    if (canvas) {
      gsap.set(canvas, { opacity: 1 - fatorDocking });
    }
    gsap.set(botao, { opacity: fatorDocking });
  }, [fatorDocking, refBotaoDestino]);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40"
      />
      <div
        ref={eloRef}
        aria-hidden="true"
        className="pointer-events-none fixed h-10 w-10 opacity-0"
      />
    </>
  );
}
