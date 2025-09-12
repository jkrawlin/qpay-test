import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  
  const userRoles = computed(() => user.value?.roles || [])
  
  const userPermissions = computed(() => user.value?.permissions || [])
  
  const hasPremiumAccess = computed(() => {
    if (!user.value) return false
    const { plan, status } = user.value.subscription
    return status === 'active' && ['basic', 'pro', 'enterprise'].includes(plan)
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

  const initializeAuth = async () => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('nipon-auth-user')
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
        // Convert date strings back to Date objects
        if (user.value) {
          user.value.createdAt = new Date(user.value.createdAt)
          user.value.lastLogin = new Date(user.value.lastLogin)
        }
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('nipon-auth-user')
      }
    }
    
    // If no user found, create dev user for development
    if (!user.value) {
      createDevUser()
      // Store in localStorage
      localStorage.setItem('nipon-auth-user', JSON.stringify(user.value))
    }
    
    initialized.value = true
  }

  const login = async (email: string, _password: string) => {
    loading.value = true
    try {
      // Simple local authentication for development
      // In production, this would connect to your backend API
      
      // For development, accept any email/password combination
      const devUser: User = {
        uid: `user-${Date.now()}`,
        email: email,
        displayName: email.split('@')[0],
        roles: email.includes('admin') ? ['admin', 'hr', 'finance'] : ['employee'],
        permissions: email.includes('admin') ? ['all'] : ['dashboard', 'profile'],
        companyId: 'default-company',
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
        subscription: {
          plan: 'pro',
          status: 'active',
          features: ['all']
        },
        profile: {
          firstName: email.split('@')[0],
          lastName: 'User'
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
      }

      user.value = devUser
      localStorage.setItem('nipon-auth-user', JSON.stringify(user.value))
      
      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: 'Login failed. Please try again.' 
      }
    } finally {
      loading.value = false
    }
  }

  const register = async (
    email: string, 
    _password: string, 
    profile: { firstName: string; lastName: string; companyName?: string }
  ) => {
    loading.value = true
    try {
      const newUser: User = {
        uid: `user-${Date.now()}`,
        email: email,
        displayName: `${profile.firstName} ${profile.lastName}`,
        roles: profile.companyName ? ['admin'] : ['employee'],
        permissions: profile.companyName 
          ? ['all'] 
          : ['dashboard', 'profile', 'payslips'],
        companyId: profile.companyName ? `company_${Date.now()}` : 'default',
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
        subscription: {
          plan: 'free',
          status: 'trial',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          features: ['basic_payroll', 'employee_management']
        },
        profile: {
          firstName: profile.firstName,
          lastName: profile.lastName
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
      }

      user.value = newUser
      localStorage.setItem('nipon-auth-user', JSON.stringify(user.value))
      
      return { success: true }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: 'Registration failed. Please try again.' 
      }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      user.value = null
      localStorage.removeItem('nipon-auth-user')
      return { success: true }
    } catch (error: any) {
      console.error('Logout error:', error)
      return { 
        success: false, 
        error: 'Logout failed' 
      }
    } finally {
      loading.value = false
    }
  }

  const sendPasswordReset = async (email: string) => {
    loading.value = true
    try {
      // Simulate password reset
      console.log('Password reset email sent to:', email)
      return { success: true }
    } catch (error: any) {
      console.error('Password reset error:', error)
      return { 
        success: false, 
        error: 'Password reset failed' 
      }
    } finally {
      loading.value = false
    }
  }

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user.value) return { success: false, error: 'User not authenticated' }

    loading.value = true
    try {
      user.value = { ...user.value, ...updates }
      localStorage.setItem('nipon-auth-user', JSON.stringify(user.value))
      return { success: true }
    } catch (error: any) {
      console.error('Profile update error:', error)
      return { 
        success: false, 
        error: 'Failed to update profile' 
      }
    } finally {
      loading.value = false
    }
  }

  const updateSubscription = async (
    plan: 'free' | 'basic' | 'pro' | 'enterprise',
    status: 'active' | 'inactive' | 'trial' | 'expired'
  ) => {
    if (!user.value) return { success: false, error: 'User not authenticated' }

    const subscriptionUpdate = {
      subscription: {
        ...user.value.subscription,
        plan,
        status,
        expiresAt: status === 'active' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
          : new Date()
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

  return {
    // State
    user,
    loading,
    initialized,

    // Computed
    isAuthenticated,
    userRoles,
    userPermissions,
    hasPremiumAccess,
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
    hasRole
  }
})