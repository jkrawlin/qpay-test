import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// Firebase removed: local stubbed auth implementation

export interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  roles: string[]
  permissions: string[]
  companyId: string
  employeeId?: string
  createdAt: Date
  lastLogin: Date
  isActive: boolean
  subscription: {
    plan: 'free' | 'basic' | 'pro' | 'enterprise'
    status: 'active' | 'inactive' | 'trial' | 'expired'
    expiresAt?: Date
    features: string[]
  }
  profile: {
    firstName: string
    lastName: string
    phone?: string
    nationality?: string
    qatarId?: string
    position?: string
    department?: string
  }
  preferences: {
    theme: 'light' | 'dark'
    language: 'en' | 'ar'
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
    dashboard: {
      layout: string
      widgets: string[]
    }
  }
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const loading = ref(false)
  const initialized = ref(false)
  
  // Phase 1: Always local mode (Firestore removed)
  const isDevelopmentMode = ref(true)

  // Computed
  const isAuthenticated = computed(() => {
    if (isDevelopmentMode.value) {
      return true // Always authenticated in dev mode
    }
    return !!user.value
  })
  
  const userRoles = computed(() => {
    if (isDevelopmentMode.value && user.value) {
      return user.value.roles || ['admin']
    }
    return user.value?.roles || []
  })
  
  const userPermissions = computed(() => {
    if (isDevelopmentMode.value && user.value) {
      return user.value.permissions || ['all']
    }
    return user.value?.permissions || []
  })
  
  const isAdmin = computed(() => userRoles.value.includes('admin'))
  
  const isEmployee = computed(() => userRoles.value.includes('employee'))
  
  const canAccessModule = computed(() => (module: string) => {
    if (isAdmin.value) return true
    return userPermissions.value.includes(module)
  })

  // Actions
  const createDevUser = () => {
    user.value = {
      uid: 'dev-user-001',
      email: 'admin@niponpayroll.com',
      displayName: 'Development Admin',
      roles: ['admin', 'hr', 'finance'],
      permissions: ['all'],
      companyId: 'dev-company',
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: true,
      subscription: {
        plan: 'enterprise',
        status: 'active',
        features: ['all']
      },
      profile: {
        firstName: 'Development',
        lastName: 'Admin',
        position: 'System Administrator',
        department: 'IT'
      },
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        dashboard: {
          layout: 'default',
          widgets: ['recent_employees', 'payroll_summary', 'compliance_alerts']
        }
      }
    } as User
  }

  const initializeAuth = () => {
    if (!initialized.value) createDevUser()
    initialized.value = true
    return Promise.resolve()
  }

  // Removed firebase-specific helpers (loadUserProfile/createUserProfile/seedDevCompany)

  const login = async (_email: string, _password: string) => {
    // Local mode: simply ensure dev user exists
    if (!user.value) createDevUser()
    return { success: true }
  }

  const register = async (_email: string, _password: string, _profile: { firstName: string; lastName: string; companyName?: string }) => {
    if (!user.value) createDevUser()
    return { success: true }
  }

  const logout = async () => {
    user.value = null
    return { success: true }
  }

  const sendPasswordReset = async (_email: string) => ({ success: true })

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user.value) return { success: false, error: 'User not authenticated' }
    user.value = { ...user.value, ...updates }
    return { success: true }
  }

  const updateSubscription = async (
    plan: 'free' | 'basic' | 'pro' | 'enterprise',
    status: 'active' | 'inactive' | 'trial' | 'expired'
  ) => {
    if (!user.value) return { success: false, error: 'User not authenticated' }

    const expiresAt = status === 'active'
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date()
    const subscriptionUpdate: Partial<User> = {
      subscription: {
        ...(user.value.subscription || {}),
        plan,
        status,
        expiresAt
      }
    }
    return await updateUserProfile(subscriptionUpdate)
  }

  const hasPermission = (permission: string): boolean => {
    if (!user.value) return false
    if (isAdmin.value) return true
    return userPermissions.value.includes(permission) || userPermissions.value.includes('all')
  }

  const hasRole = (role: string): boolean => {
    if (!user.value) return false
    return userRoles.value.includes(role)
  }

  const forceAllAccess = async () => {
    if (!user.value) createDevUser()
    if (user.value) {
      user.value.roles = Array.from(new Set([...(user.value.roles||[]), 'admin']))
      user.value.permissions = ['all']
      user.value.companyId = 'dev-company'
    }
    return { success: true }
  }

  // Helper function for auth error messages
  const getAuthErrorMessage = (): string => 'Authentication unavailable (local mode)'

  return {
    // State
    user,
    loading,
    initialized,

    // Computed
    isAuthenticated,
    userRoles,
    userPermissions,
    isAdmin,
    isEmployee,
    canAccessModule,

    // Actions
    initializeAuth,
    login,
    register,
    logout,
    sendPasswordReset,
    updateUserProfile,
    updateSubscription,
    hasPermission,
    hasRole,
    forceAllAccess,
    getAuthErrorMessage
  }
})