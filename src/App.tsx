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
