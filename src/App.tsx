import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Hero } from './secoes/Hero';
import { Sobre } from './secoes/Sobre';
import { Stack } from './secoes/Stack';
import { Projetos } from './secoes/Projetos';
import { LabIA } from './secoes/LabIA';
import { Contato } from './secoes/Contato';

// Isola GSAP, Lenis e a engine da cobra (tudo que CamadaCobra/useCobra
// trazem) num chunk separado, carregado so depois do primeiro render das
// secoes reais (contrato tecnico, CLAUDE.md).
const CamadaCobra = lazy(() =>
  import('./componentes/CamadaCobra').then((modulo) => ({ default: modulo.CamadaCobra })),
);

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

  // React.lazy dispara o import() assim que tenta renderizar o componente, o
  // que aconteceria ja no primeiro render. Dois rAF encadeados garantem que o
  // navegador ja pintou o frame anterior antes de montar CamadaCobra, entao o
  // chunk de GSAP/Lenis so comeca a baixar depois do first paint de verdade
  // (contrato tecnico, CLAUDE.md).
  const [pinturaConcluida, setPinturaConcluida] = useState(false);
  useEffect(() => {
    let idSegundoQuadro: number | undefined;
    const idPrimeiroQuadro = requestAnimationFrame(() => {
      idSegundoQuadro = requestAnimationFrame(() => setPinturaConcluida(true));
    });
    return () => {
      cancelAnimationFrame(idPrimeiroQuadro);
      if (idSegundoQuadro !== undefined) {
        cancelAnimationFrame(idSegundoQuadro);
      }
    };
  }, []);

  const refsSecoes = useMemo(
    () => [refHero, refSobre, refStack, refProjetos, refLabIA, refContato],
    [refHero, refSobre, refStack, refProjetos, refLabIA, refContato],
  );

  return (
    <main className="bg-branco-papel text-preto-tinta textura-granulada font-maquina">
      <div ref={refJornada}>
        <Hero refSecao={refHero} refBotao={refBotaoOrigem} />
        <Sobre refSecao={refSobre} />
        <Stack refSecao={refStack} />
        <Projetos refSecao={refProjetos} />
        <LabIA refSecao={refLabIA} />
        <Contato refSecao={refContato} refBotao={refBotaoDestino} />
      </div>

      {pinturaConcluida ? (
        <Suspense fallback={null}>
          <CamadaCobra
            refsSecoes={refsSecoes}
            refJornada={refJornada}
            refBotaoOrigem={refBotaoOrigem}
            refBotaoDestino={refBotaoDestino}
          />
        </Suspense>
      ) : null}
    </main>
  );
}
