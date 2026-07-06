import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Elemento raiz nao encontrado');
}

// Calculado uma unica vez no carregamento do modulo, nao reativo a mudancas de
// hash pos-load: acessar o playground exige recarregar a URL com #playground.
const ehPlayground = import.meta.env.DEV && window.location.hash === '#playground';

async function renderizar(raiz: HTMLElement): Promise<void> {
  const Componente = ehPlayground ? (await import('./paginas/Playground.tsx')).default : App;
  createRoot(raiz).render(
    <StrictMode>
      <Componente />
    </StrictMode>,
  );
}

void renderizar(rootElement);
