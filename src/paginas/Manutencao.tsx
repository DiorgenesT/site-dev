import { NotaDeResgate } from '../componentes/NotaDeResgate';
import { FitaAdesiva } from '../componentes/FitaAdesiva';
import { Adesivo } from '../componentes/Adesivo';
import { Carimbo } from '../componentes/Carimbo';
import { PapelRasgado } from '../componentes/PapelRasgado';

export default function Manutencao() {
  return (
    <main className="min-h-screen bg-branco-papel text-preto-tinta p-8 textura-granulada flex flex-col justify-center items-start">
      <NotaDeResgate texto="DG" />
      <div className="mt-4">
        <FitaAdesiva indice={1}>Python & AI Engineer</FitaAdesiva>
      </div>
      <div className="mt-4">
        <Adesivo indice={0}>Zine em producao, novas paginas em breve</Adesivo>
      </div>
      <div className="mt-4">
        <Carimbo indice={4}>EM BREVE</Carimbo>
      </div>
      <PapelRasgado />
    </main>
  );
}
