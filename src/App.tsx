import { Adesivo } from './componentes/Adesivo';
import { FitaAdesiva } from './componentes/FitaAdesiva';
import { PapelRasgado } from './componentes/PapelRasgado';
import { Carimbo } from './componentes/Carimbo';
import { NotaDeResgate } from './componentes/NotaDeResgate';

export default function App() {
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
    </main>
  );
}
