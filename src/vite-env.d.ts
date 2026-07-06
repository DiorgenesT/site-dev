/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MANUTENCAO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
