/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_SERVER_URL?: string
  // Add other VITE_ prefixed environment variables here as needed
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  // etc.
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
