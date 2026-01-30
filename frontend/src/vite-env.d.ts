/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL: string
  readonly VITE_BACKEND_URL: string
  readonly VITE_INSTANCE_KEY: string
  readonly VITE_RECAPTCHA_KEY: string
  readonly VITE_FRONTEND_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    config: {
      instanceKey: string
      recaptchaKey: string
      frontendUrl: string
    }
  }
}

export {}
