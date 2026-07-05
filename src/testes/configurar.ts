import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// globals:false desativa a auto-deteccao de afterEach do Testing Library; registramos manualmente.
afterEach(() => {
  cleanup();
});
