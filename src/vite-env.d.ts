/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_USE_MOCK?: string;
  readonly VITE_USE_MOCK_AUTH?: string;
  readonly VITE_USE_MOCK_USER_DATA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

