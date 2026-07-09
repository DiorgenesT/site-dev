import { Carimbo } from '../componentes/Carimbo';

export function Sobre() {
  return (
    <section id="sobre" className="min-h-screen flex items-center gap-8 p-8">
      <div className="flex-1 text-lg leading-relaxed">
        <h2 className="text-2xl mb-4">Sobre</h2>
        <p>
          Comecei gerenciando atendimento na Expresso Truck e na Monumental Assistência 24hrs. Na
          Monumental, virei desenvolvedor Python: automatizei operações com LLMs e dashboards,
          reduzindo em 35% o tempo de atendimento. Hoje sou Analista Sênior e Desenvolvedor na
          Fundação Beta, Prefeitura de Betim.
        </p>
        <p className="mt-4">
          Pós-Graduação em Sistemas com Python (UniCesumar) e Bacharelado em Ciência da Computação
          (Cruzeiro do Sul).
        </p>
      </div>
      <div className="shrink-0">
        <Carimbo indice={2}>DG, EST. 2026</Carimbo>
      </div>
    </section>
  );
}
