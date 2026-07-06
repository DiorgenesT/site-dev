import { useRef } from 'react';
import { Adesivo } from './componentes/Adesivo';
import { FitaAdesiva } from './componentes/FitaAdesiva';
import { PapelRasgado } from './componentes/PapelRasgado';
import { Carimbo } from './componentes/Carimbo';
import { NotaDeResgate } from './componentes/NotaDeResgate';
import { CamadaCobra } from './componentes/CamadaCobra';

export default function App() {
  const refInicio = useRef<HTMLDivElement>(null);
  const refFim = useRef<HTMLDivElement>(null);
  const refJornada = useRef<HTMLDivElement>(null);
  const refBotaoDestino = useRef<HTMLButtonElement>(null);

  return (
    <main className="min-h-screen bg-branco-papel text-preto-tinta p-8 textura-granulada">
      <NotaDeResgate texto="DG" />
      <div className="mt-4">
        <FitaAdesiva indice={1}>Python & AI Engineer</FitaAdesiva>
      </div>
      <div className="mt-4">
        <Adesivo indice={0}>Fundacao da Fase 0 pronta</Adesivo>
      </div>
      <div className="mt-4">
        <Carimbo indice={4}>04.07.2026</Carimbo>
      </div>
      <PapelRasgado />

      <div ref={refJornada}>
        <div ref={refInicio} aria-hidden="true" />
        <div aria-hidden="true" style={{ height: '150vh' }} />
        <div ref={refFim} className="flex justify-center py-16">
          <button
            ref={refBotaoDestino}
            type="button"
            className="bg-vermelho-punk text-branco-papel px-6 py-3 font-bold uppercase tracking-widest opacity-0"
          >
            Fale comigo
          </button>
        </div>
      </div>

      <CamadaCobra
        refInicio={refInicio}
        refFim={refFim}
        refJornada={refJornada}
        refBotaoDestino={refBotaoDestino}
      />
    </main>
  );
}
