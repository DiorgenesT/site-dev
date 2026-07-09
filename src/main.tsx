import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Elemento raiz nao encontrado');
}

// Gatilho de deploy: liga so quando VITE_MANUTENCAO=true e definido no ambiente
// de build (ex: no comando de build usado pelo wrangler pages deploy). O dev
// local nunca define essa variavel, entao sempre mostra o site real.
const ehManutencao = import.meta.env.VITE_MANUTENCAO === 'true';

async function renderizar(raiz: HTMLElement): Promise<void> {
  const Componente = ehManutencao
    ? (await import('./paginas/Manutencao.tsx')).default
    : (await import('./App.tsx')).default;
  createRoot(raiz).render(
    <StrictMode>
      <Componente />
    </StrictMode>,
  );
}

void renderizar(rootElement);
