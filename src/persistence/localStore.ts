// Lightweight persistence adapter (Phase 1)
// Provides namespaced, versioned localStorage access with graceful fallbacks.

interface PersistenceOptions {
  namespace?: string
  version?: number
}

const DEFAULT_NAMESPACE = 'qpay'
const DEFAULT_VERSION = 1

const buildKey = (namespace: string, version: number, key: string) => {
  return `${namespace}:v${version}:${key}`
}

export class LocalStore {
  private namespace: string
  private version: number
  private available: boolean

  constructor(options: PersistenceOptions = {}) {
    this.namespace = options.namespace || DEFAULT_NAMESPACE
    this.version = options.version ?? DEFAULT_VERSION
    this.available = this.check()
  }

  private check(): boolean {
    try {
      const testKey = '__ls_test__'
      window.localStorage.setItem(testKey, '1')
      window.localStorage.removeItem(testKey)
      return true
    } catch (_) {
      return false
    }
  }

  get isAvailable() { return this.available }

  get<T = unknown>(key: string, fallback: T | null = null): T | null {
    if (!this.available) return fallback
    try {
      const raw = window.localStorage.getItem(buildKey(this.namespace, this.version, key))
      if (raw == null) return fallback
      return JSON.parse(raw) as T
    } catch (e) {
      console.warn('[LocalStore] Failed to parse key', key, e)
      return fallback
    }
  }

  set<T = unknown>(key: string, value: T): boolean {
    if (!this.available) return false
    try {
      window.localStorage.setItem(buildKey(this.namespace, this.version, key), JSON.stringify(value))
      return true
    } catch (e) {
      console.warn('[LocalStore] Failed to set key', key, e)
      return false
    }
  }

  remove(key: string): void {
    if (!this.available) return
    try { window.localStorage.removeItem(buildKey(this.namespace, this.version, key)) } catch (_) { /* noop */ }
  }

  // Optional: clear all keys for this namespace+version
  clear(): void {
    if (!this.available) return
    try {
      const prefix = `${this.namespace}:v${this.version}:`
      for (let i = window.localStorage.length - 1; i >= 0; i--) {
        const k = window.localStorage.key(i)
        if (k && k.startsWith(prefix)) window.localStorage.removeItem(k)
      }
    } catch (e) {
      console.warn('[LocalStore] Failed to clear namespace', e)
    }
  }
}

export const persistence = new LocalStore()
