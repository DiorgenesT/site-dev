import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Elemento raiz nao encontrado');
}

// Gatilho de deploy: liga so quando VITE_MANUTENCAO=true e definido no ambiente
// de build (ex: no comando de build usado pelo wrangler pages deploy). O dev
// local nunca define essa variavel, entao sempre mostra o site real. App
// tambem e importado dinamicamente para que o bundle de manutencao nao carregue
// GSAP/Lenis/engine da cobra.
const ehManutencao = import.meta.env.VITE_MANUTENCAO === 'true';

// Calculado uma unica vez no carregamento do modulo, nao reativo a mudancas de
// hash pos-load: acessar o playground exige recarregar a URL com #playground.
const ehPlayground = import.meta.env.DEV && window.location.hash === '#playground';

async function renderizar(raiz: HTMLElement): Promise<void> {
  const Componente = ehManutencao
    ? (await import('./paginas/Manutencao.tsx')).default
    : ehPlayground
      ? (await import('./paginas/Playground.tsx')).default
      : (await import('./App.tsx')).default;
  createRoot(raiz).render(
    <StrictMode>
      <Componente />
    </StrictMode>,
  );
}

void renderizar(rootElement);
