import { useRef, useState } from 'react';
import { CamadaCobra } from '../componentes/CamadaCobra';

export default function Playground() {
  const refInicio = useRef<HTMLDivElement>(null);
  const refFim = useRef<HTMLDivElement>(null);
  const refJornada = useRef<HTMLDivElement>(null);
  const refBotaoDestino = useRef<HTMLButtonElement>(null);
  const [velocidade, setVelocidade] = useState(150);
  const [espessura, setEspessura] = useState(6);
  const [quantizacao, setQuantizacao] = useState(12);

  return (
    <main className="min-h-screen bg-branco-papel text-preto-tinta p-8">
      <h1 className="text-2xl font-bold mb-4">Playground da Cobra de Scroll (dev only)</h1>

      <div className="mb-8 flex flex-col gap-4 max-w-md">
        <label className="flex flex-col gap-1">
          Velocidade (altura do scroll simulado, vh): {velocidade}
          <input
            type="range"
            min={50}
            max={400}
            value={velocidade}
            onChange={(evento) => setVelocidade(Number(evento.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1">
          Espessura base do traco: {espessura}
          <input
            type="range"
            min={2}
            max={16}
            value={espessura}
            onChange={(evento) => setEspessura(Number(evento.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1">
          Taxa de quantizacao (passos/s): {quantizacao}
          <input
            type="range"
            min={4}
            max={30}
            value={quantizacao}
            onChange={(evento) => setQuantizacao(Number(evento.target.value))}
          />
        </label>
        <p className="text-sm">
          Nota: os sliders acima registram a intencao de calibragem; a Fase 1 fixa os parametros
          reais em <code>src/cobra/motor.ts</code> (TAMANHO_BUFFER_CORPO, PASSOS_POR_SEGUNDO,
          PASSADAS_TRACO). Ajustar esses valores no codigo apos calibrar visualmente aqui e parte do
          processo desta pagina, nao ha ligacao automatica ainda entre os sliders e a engine nesta
          primeira versao do playground.
        </p>
      </div>

      <div ref={refJornada}>
        <div ref={refInicio} aria-hidden="true" />
        <div aria-hidden="true" style={{ height: `${velocidade}vh` }} />
        <div ref={refFim} className="flex justify-center py-16">
          <button
            ref={refBotaoDestino}
            type="button"
            className="bg-vermelho-punk text-branco-papel px-6 py-3 font-bold uppercase tracking-widest opacity-0"
          >
            CTA de teste
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
