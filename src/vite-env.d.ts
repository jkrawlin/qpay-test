/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string
  readonly VITE_FIREBASE_VAPID_KEY: string
  readonly VITE_USE_FIREBASE_EMULATORS: string
  readonly VITE_ENABLE_DEBUG_LOGGING: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_DEFAULT_LANGUAGE: string
  readonly VITE_DEFAULT_CURRENCY: string
  readonly VITE_DEFAULT_TIMEZONE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@handsontable/vue3' {
  import { DefineComponent } from 'vue'
  export const HotTable: DefineComponent<any, any, any>
}

declare module 'virtual:pwa-register' {
  export function registerSW(options?: {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: any) => void
  }): (reloadPage?: boolean) => Promise<void>
}

// Global types for the application
declare global {
  interface Window {
    updateSW: (reloadPage?: boolean) => Promise<void>
  }
}

// Firebase types extensions
declare module 'firebase/auth' {
  interface User {
    roles?: string[]
    permissions?: string[]
    companyId?: string
  }
}

export {}