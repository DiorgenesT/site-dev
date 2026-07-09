import { NotaDeResgate } from '../componentes/NotaDeResgate';
import { FitaAdesiva } from '../componentes/FitaAdesiva';
import { Adesivo } from '../componentes/Adesivo';
import { Carimbo } from '../componentes/Carimbo';
import { PapelRasgado } from '../componentes/PapelRasgado';

export default function Manutencao() {
  return (
    <main className="min-h-screen bg-branco-papel text-preto-tinta p-8 textura-granulada flex flex-col justify-center items-center text-center gap-6">
      <div className="text-5xl md:text-7xl">
        <NotaDeResgate texto="DG" />
      </div>
      <div className="text-xl md:text-2xl">
        <FitaAdesiva indice={1}>Python & AI Engineer</FitaAdesiva>
      </div>
      <div className="text-lg md:text-xl max-w-md">
        <Adesivo indice={0}>Site em construção, páginas novas em breve</Adesivo>
      </div>
      <div className="text-lg md:text-xl">
        <Carimbo indice={4}>EM BREVE</Carimbo>
      </div>
      <div className="w-full max-w-xl">
        <PapelRasgado />
      </div>
    </main>
  );
}
