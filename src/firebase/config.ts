// Phase 1: Firebase fully disabled. This stub preserves previous exports so the rest
// of the application continues to compile. A feature flag (ENABLE_FIREBASE) will
// allow controlled reintegration later without widespread refactors.
import { ENABLE_FIREBASE } from '@/featureFlags'

export const FIREBASE_ENABLED = ENABLE_FIREBASE

// When re‑enabling, replace these nulls with actual initialized SDK instances.
export const auth: any = null
export const db: any = null
export const storage: any = null
export const functions: any = null
export const messaging: any = null

export const initializeFirebase = () => {
  if (!FIREBASE_ENABLED) {
    // Guarded log to make it clear in dev builds why Firebase features are inert
    if (import.meta.env.DEV) console.log('[Stub] Firebase disabled (FIREBASE_ENABLED=false)')
    return null
  }
  // Placeholder path for future actual initialization (kept explicit for clarity)
  if (import.meta.env.DEV) console.warn('[Flag] FIREBASE_ENABLED=true but initialization code not implemented in Phase 1')
  return null
}

// Utility functions for Firebase operations
export const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2)

export const formatFirebaseError = (error: any): string => {
  const errorMessages: Record<string, string> = {
    'permission-denied': 'You do not have permission to perform this action.',
    'not-found': 'The requested document was not found.',
    'already-exists': 'The document already exists.',
    'invalid-argument': 'Invalid data provided.',
    'unavailable': 'The service is currently unavailable. Please try again later.',
    'unauthenticated': 'You must be logged in to perform this action.',
    'resource-exhausted': 'Quota exceeded. Please try again later.',
    'failed-precondition': 'The operation was rejected due to the current state.',
    'aborted': 'The operation was aborted due to a conflict.',
    'out-of-range': 'The operation was attempted past the valid range.',
    'unimplemented': 'This operation is not implemented.',
    'internal': 'An internal error occurred.',
    'deadline-exceeded': 'The operation timed out.',
    'cancelled': 'The operation was cancelled.',
    'data-loss': 'Unrecoverable data loss or corruption.'
  }

  if (error?.code) {
    const code = error.code.replace('firestore/', '').replace('auth/', '')
    return errorMessages[code] || error.message || 'An unexpected error occurred.'
  }

  return error?.message || 'An unexpected error occurred.'
}

// Firebase collections constants
export const COLLECTIONS = {
  USERS: 'users',
  COMPANIES: 'companies',
  EMPLOYEES: 'employees',
  CUSTOMERS: 'customers',
  PAYROLL: 'payroll',
  TRANSACTIONS: 'transactions',
  DOCUMENTS: 'documents',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  AUDIT_LOGS: 'audit_logs',
  TEMPLATES: 'templates',
  REPORTS: 'reports'
} as const

// Firebase security rules helpers
export const SECURITY_RULES = {
  isOwner: (uid: string, resource: any) => resource?.ownerId === uid,
  hasRole: (userRoles: string[], requiredRoles: string[]) => 
    requiredRoles.some(role => userRoles.includes(role)),
  isCompanyMember: (userCompanyId: string, resourceCompanyId: string) => 
    userCompanyId === resourceCompanyId
}

export default {}