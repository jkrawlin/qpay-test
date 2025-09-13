<template>
  <div class="login-page">
    <v-container fluid class="fill-height pa-0">
      <v-row no-gutters class="fill-height">
        <!-- Left Panel - Branding -->
        <v-col cols="12" md="6" class="login-branding d-none d-md-flex">
          <div class="branding-content">
            <div class="logo-section">
              <Icon icon="material-symbols:business" :width="80" :height="80" color="white" class="mb-4" />
              <h1 class="text-h3 font-weight-bold text-white mb-4">
                Nipon Payroll Pro
              </h1>
              <p class="text-h6 text-white mb-8 opacity-90">
                Premium Manpower Management for Qatar
              </p>
            </div>
            
            <div class="features-list">
              <div class="feature-item" v-for="feature in features" :key="feature.title">
                <Icon :icon="feature.icon" :width="24" :height="24" color="white" class="mr-3" />
                <div>
                  <div class="text-body-1 font-weight-medium text-white">
                    {{ feature.title }}
                  </div>
                  <div class="text-body-2 text-white opacity-80">
                    {{ feature.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Right Panel - Login Form -->
        <v-col cols="12" md="6" class="login-form-panel">
          <div class="login-form-container">
            <!-- Mobile Logo -->
            <div class="mobile-logo d-md-none text-center mb-6">
              <Icon icon="material-symbols:business" :width="60" :height="60" color="primary" class="mb-2" />
              <h2 class="text-h5 font-weight-bold text-primary">
                Nipon Payroll Pro
              </h2>
            </div>

            <!-- Login Form -->
            <div class="login-form">
              <h2 class="text-h4 font-weight-bold mb-2">Welcome Back</h2>
              <p class="text-body-1 text-grey-darken-1 mb-6">
                Sign in to your account to continue
              </p>

              <v-form ref="loginForm" v-model="formValid" @submit.prevent="handleLogin">
                <v-text-field
                  v-model="loginData.email"
                  label="Email Address"
                  type="email"
                  variant="outlined"
                  prepend-inner-icon="mdi-email-outline"
                  :rules="emailRules"
                  :error-messages="fieldErrors.email"
                  class="mb-4"
                  autocomplete="email"
                />

                <v-text-field
                  v-model="loginData.password"
                  label="Password"
                  :type="showPassword ? 'text' : 'password'"
                  variant="outlined"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  @click:append-inner="showPassword = !showPassword"
                  :rules="passwordRules"
                  :error-messages="fieldErrors.password"
                  class="mb-2"
                  autocomplete="current-password"
                />

                <div class="d-flex justify-space-between align-center mb-6">
                  <v-checkbox
                    v-model="rememberMe"
                    label="Remember me"
                    density="compact"
                    hide-details
                  />
                  <v-btn
                    variant="text"
                    size="small"
                    :to="{ name: 'ForgotPassword' }"
                    class="text-caption"
                  >
                    Forgot Password?
                  </v-btn>
                </div>

                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  :loading="loading"
                  :disabled="!formValid"
                  class="mb-4"
                >
                  Sign In
                </v-btn>

                <v-divider class="my-4">
                  <span class="text-caption text-grey-darken-1 px-3">Or</span>
                </v-divider>

                <v-btn
                  variant="outlined"
                  size="large"
                  block
                  prepend-icon="mdi-google"
                  @click="handleGoogleLogin"
                  :loading="googleLoading"
                  class="mb-6"
                >
                  Continue with Google
                </v-btn>

                <div class="text-center">
                  <span class="text-body-2 text-grey-darken-1">
                    Don't have an account?
                  </span>
                  <v-btn
                    variant="text"
                    :to="{ name: 'Register' }"
                    class="text-body-2 font-weight-medium"
                  >
                    Sign Up
                  </v-btn>
                </div>
              </v-form>
            </div>

            <!-- Footer -->
            <div class="login-footer text-center mt-8">
              <p class="text-caption text-grey-darken-1">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
              <div class="qatar-flag mt-2"></div>
              <p class="text-caption text-grey-darken-1 mt-1">
                Designed for Qatar • Desktop Only
              </p>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Loading Overlay -->
    <v-overlay
      v-model="loading"
      class="align-center justify-center"
      persistent
    >
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      />
    </v-overlay>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { Icon } from '@iconify/vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

// Form data
const loginForm = ref()
const formValid = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const googleLoading = ref(false)

const loginData = reactive({
  email: '',
  password: ''
})

const fieldErrors = reactive({
  email: [],
  password: []
})

// Validation rules
const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters'
]

// Features to display on branding panel
const features = [
  {
    title: 'Employee Management',
    description: 'Complete HR solution with Qatar compliance',
    icon: 'material-symbols:group'
  },
  {
    title: 'Payroll Processing',
    description: 'Automated salary calculations and payments',
    icon: 'material-symbols:payments'
  },
  {
    title: 'Compliance Tracking',
    description: 'Qatar ID, passport, and visa monitoring',
    icon: 'material-symbols:verified-user'
  },
  {
    title: 'Financial Reports',
    description: 'Comprehensive accounting and analytics',
    icon: 'material-symbols:analytics'
  }
]

// Methods
const handleLogin = async () => {
  if (!formValid.value) return

  loading.value = true
  fieldErrors.email = []
  fieldErrors.password = []

  try {
    const result = await authStore.login(loginData.email, loginData.password)

    if (result.success) {
      appStore.showSnackbar('Login successful!', 'success')
      
      // Redirect to intended page or dashboard
      const redirect = route.query.redirect as string
      router.push(redirect || { name: 'Dashboard' })
    } else {
      appStore.showSnackbar(result.error || 'Login failed', 'error')
      
      // Handle specific field errors
      if (result.error?.includes('email')) {
        fieldErrors.email = [result.error]
      } else if (result.error?.includes('password')) {
        fieldErrors.password = [result.error]
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    appStore.showSnackbar('An unexpected error occurred', 'error')
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  googleLoading.value = true
  
  try {
    // Google login implementation would go here
    appStore.showSnackbar('Google login coming soon!', 'info')
  } catch (error) {
    console.error('Google login error:', error)
    appStore.showSnackbar('Google login failed', 'error')
  } finally {
    googleLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Pre-fill email for development
  if (import.meta.env.DEV) {
    loginData.email = 'admin@niponpayroll.com'
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #fafafa;
}

.login-branding {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  position: relative;
  overflow: hidden;
}

.login-branding::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.branding-content {
  position: relative;
  z-index: 1;
  padding: 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.logo-section {
  text-align: center;
  margin-bottom: 48px;
}

.features-list {
  max-width: 400px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: white;
}

.login-form-container {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-form {
  margin-bottom: 32px;
}

.mobile-logo {
  padding: 24px 0;
}

.qatar-flag {
  width: 40px;
  height: 24px;
  background: linear-gradient(90deg, #8d1538 0%, #8d1538 33%, white 33%, white 100%);
  border: 1px solid #ddd;
  margin: 0 auto;
  border-radius: 4px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .login-form-panel {
    padding: 24px 16px;
  }
  
  .login-form-container {
    padding: 32px 24px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
  
  .branding-content {
    padding: 32px;
  }
  
  .feature-item {
    margin-bottom: 16px;
    padding: 16px;
  }
}

/* Form styling */
.v-text-field {
  margin-bottom: 0;
}

.v-text-field :deep(.v-field) {
  border-radius: 12px;
}

.v-btn {
  text-transform: none;
  font-weight: 500;
  border-radius: 12px;
  letter-spacing: 0.5px;
}

.v-btn--size-large {
  height: 56px;
  font-size: 16px;
}

/* Focus and hover states */
.v-text-field:focus-within {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
  box-shadow: 0 8px 25px rgba(25, 118, 210, 0.3);
}

/* Loading states */
.v-btn--loading {
  pointer-events: none;
}

/* Dark theme support */
.v-theme--dark .login-page {
  background: #121212;
}

.v-theme--dark .login-form-panel {
  background: #1e1e1e;
}

.v-theme--dark .feature-item {
  background: rgba(255, 255, 255, 0.05);
}
</style>