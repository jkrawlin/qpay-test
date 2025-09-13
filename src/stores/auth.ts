import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'

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
  
  // Development mode - set to true to bypass Firebase auth
  const isDevelopmentMode = ref(import.meta.env.DEV && import.meta.env.VITE_USE_DEV_AUTH === 'true')

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

  const initializeAuth = () => {
    return new Promise<void>((resolve) => {
      if (isDevelopmentMode.value) {
        createDevUser()
        initialized.value = true
        resolve()
        return
      }
      
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          await loadUserProfile(firebaseUser)
        } else {
          user.value = null
        }
        initialized.value = true
        resolve()
      })
    })
  }

  const loadUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || userData.profile?.firstName || 'User',
          photoURL: firebaseUser.photoURL,
          ...userData,
          lastLogin: new Date()
        } as User

        // Update last login
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          lastLogin: new Date()
        })
      } else {
        // Create default user profile
        await createUserProfile(firebaseUser)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const createUserProfile = async (firebaseUser: FirebaseUser) => {
    const defaultUser: Partial<User> = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || 'New User',
      photoURL: firebaseUser.photoURL,
      roles: ['employee'], // Default role
      permissions: ['dashboard', 'profile'],
      companyId: 'default', // Should be set during onboarding
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: true,
      subscription: {
        plan: 'free',
        status: 'trial',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        features: ['basic_payroll', 'employee_management']
      },
      profile: {
        firstName: firebaseUser.displayName?.split(' ')[0] || '',
        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || ''
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

    await setDoc(doc(db, 'users', firebaseUser.uid), defaultUser)
    user.value = defaultUser as User
  }

  const login = async (email: string, password: string) => {
    loading.value = true
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      await loadUserProfile(result.user)
      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: getAuthErrorMessage(error.code) 
      }
    } finally {
      loading.value = false
    }
  }

  const register = async (
    email: string, 
    password: string, 
    profile: { firstName: string; lastName: string; companyName?: string }
  ) => {
    loading.value = true
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update Firebase Auth profile
      await updateProfile(result.user, {
        displayName: `${profile.firstName} ${profile.lastName}`
      })

      // Create user document in Firestore
      const newUser: Partial<User> = {
        uid: result.user.uid,
        email: result.user.email!,
        displayName: `${profile.firstName} ${profile.lastName}`,
        roles: profile.companyName ? ['admin'] : ['employee'],
        permissions: profile.companyName 
          ? ['all'] 
          : ['dashboard', 'profile', 'payslips'],
        companyId: profile.companyName ? `company_${result.user.uid}` : 'default',
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

      await setDoc(doc(db, 'users', result.user.uid), newUser)
      
      // If company name provided, create company document
      if (profile.companyName) {
        await setDoc(doc(db, 'companies', `company_${result.user.uid}`), {
          name: profile.companyName,
          ownerId: result.user.uid,
          createdAt: new Date(),
          isActive: true,
          settings: {
            currency: 'QAR',
            timezone: 'Asia/Qatar',
            language: 'en'
          }
        })
      }

      user.value = newUser as User
      return { success: true }
    } catch (error: any) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: getAuthErrorMessage(error.code) 
      }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      await signOut(auth)
      user.value = null
      return { success: true }
    } catch (error: any) {
      console.error('Logout error:', error)
      return { 
        success: false, 
        error: getAuthErrorMessage(error.code) 
      }
    } finally {
      loading.value = false
    }
  }

  const sendPasswordReset = async (email: string) => {
    loading.value = true
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error: any) {
      console.error('Password reset error:', error)
      return { 
        success: false, 
        error: getAuthErrorMessage(error.code) 
      }
    } finally {
      loading.value = false
    }
  }

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user.value) return { success: false, error: 'User not authenticated' }

    loading.value = true
    try {
      await updateDoc(doc(db, 'users', user.value.uid), updates)
      user.value = { ...user.value, ...updates }
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
      'subscription.plan': plan,
      'subscription.status': status,
      'subscription.expiresAt': status === 'active' 
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        : new Date()
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

  // Helper function for auth error messages
  const getAuthErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'default': 'An unexpected error occurred. Please try again.'
    }

    return errorMessages[errorCode] || errorMessages.default
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