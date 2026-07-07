import type { RefObject } from 'react';
import { Carimbo } from '../componentes/Carimbo';

interface SobreProps {
  refSecao: RefObject<HTMLElement>;
}

export function Sobre({ refSecao }: SobreProps) {
  return (
    <section ref={refSecao} id="sobre" className="min-h-screen flex items-center gap-8 p-8">
      <div className="flex-1 text-lg leading-relaxed">
        <h2 className="text-2xl font-bold mb-4">Sobre</h2>
        <p>
          Comecei gerenciando atendimento na Expresso Truck e na Monumental Assistencia 24hrs. Na
          Monumental, virei desenvolvedor Python: automatizei operacoes com LLMs e dashboards,
          reduzindo em 35% o tempo de atendimento. Hoje sou Analista Senior e Desenvolvedor na
          Fundacao Beta, Prefeitura de Betim.
        </p>
        <p className="mt-4">
          Pos Graduacao em Sistemas com Python (UniCesumar) e Bacharelado em Ciencia da Computacao
          (Cruzeiro do Sul).
        </p>
      </div>
      <div className="shrink-0">
        <Carimbo indice={2}>DG, EST. 2026</Carimbo>
      </div>
    </section>
  );
}
