import { Hero } from './secoes/Hero';
import { Sobre } from './secoes/Sobre';
import { Stack } from './secoes/Stack';
import { Projetos } from './secoes/Projetos';
import { LabIA } from './secoes/LabIA';
import { Contato } from './secoes/Contato';

export default function App() {
  return (
    <main className="bg-branco-papel text-preto-tinta textura-granulada">
      <Hero />
      <Sobre />
      <Stack />
      <Projetos />
      <LabIA />
      <Contato />
    </main>
  );
}
