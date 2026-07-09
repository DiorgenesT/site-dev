import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// globals:false desativa a auto-deteccao de afterEach do Testing Library; registramos manualmente.
afterEach(() => {
  cleanup();
});

if (typeof window.matchMedia === 'undefined') {
  window.matchMedia = (consulta: string): MediaQueryList =>
    ({
      matches: true,
      media: consulta,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
