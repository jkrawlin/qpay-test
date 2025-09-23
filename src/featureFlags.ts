// Centralized feature flags. Extend as needed.
// Firebase is disabled in Phase 1 removal; set VITE_ENABLE_FIREBASE=true to re-enable guarded code (once reinstated).

export const ENABLE_FIREBASE = (import.meta.env.VITE_ENABLE_FIREBASE || '').toLowerCase() === 'true'

export const flags = {
  firebase: ENABLE_FIREBASE
} as const
