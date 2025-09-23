import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

// Firebase configuration
// Note: These are public configuration values - update with your actual Firebase project config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key-here",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nipontest-21f1c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nipontest-21f1c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nipontest-21f1c.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)

// Initialize messaging for push notifications (only in supported browsers)
let messaging: any = null
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app)
  } catch (error) {
    console.warn('Firebase messaging not supported in this browser:', error)
  }
}

export { messaging }

// Environment-based emulator connections for development
const isDevelopment = import.meta.env.DEV
const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true'

if (isDevelopment && useEmulators) {
  // Connect to Firebase emulators in development
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, 'localhost', 8080)
    connectStorageEmulator(storage, 'localhost', 9199)
    connectFunctionsEmulator(functions, 'localhost', 5001)
    console.log('Connected to Firebase emulators')
  } catch (error) {
    console.warn('Failed to connect to Firebase emulators:', error)
  }
}

// Initialize Firebase app
export const initializeFirebase = () => {
  console.log('Firebase initialized successfully')
  
  // Setup messaging if available
  if (messaging) {
    setupMessaging()
  }
  
  return app
}

// Firebase Cloud Messaging setup
const setupMessaging = async () => {
  if (!messaging) return

  try {
    // Guard: skip if no real VAPID key configured
    const vapidKey = 'your-vapid-key-here'
    if (!vapidKey || vapidKey === 'your-vapid-key-here') {
      console.warn('Skipping FCM setup: No valid VAPID key configured')
      return
    }

    // Request notification permission
    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      // Get FCM token
      const token = await getToken(messaging, { vapidKey })
      
      if (token) {
        console.log('FCM token:', token)
        // Send token to your server to associate with the user
        // This will be handled in the auth store
      }
    } else {
      console.log('Notification permission denied')
    }

    // Handle foreground messages
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload)
      
      // Show notification using the app's notification system
      if (payload.notification) {
        showCustomNotification(
          payload.notification.title || 'New Notification',
          payload.notification.body || '',
          payload.data
        )
      }
    })
  } catch (error) {
    console.error('Error setting up messaging:', error)
  }
}

// Custom notification handler
const showCustomNotification = (title: string, body: string, data?: any) => {
  // This will integrate with the app's notification system
  // For now, we'll use the browser's notification API
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      tag: 'nipon-payroll-pro',
      data
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
      
      // Handle notification click based on data
      if (data?.route) {
        // Navigate to specific route
        window.location.hash = data.route
      }
    }

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000)
  }
}

// Utility functions for Firebase operations
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

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

export default app