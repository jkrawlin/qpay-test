<template>
  <div class="login-page">
    <v-container fluid class="fill-height pa-0">
      <v-row no-gutters class="fill-height">
        <!-- Left Panel - Branding -->
        <v-col cols="12" md="6" class="login-branding d-none d-md-flex">
          <div class="branding-content">
            <div class="logo-section">
              <v-icon size="80" color="white" class="mb-4">
                mdi-account-group
              </v-icon>
              <h1 class="text-h3 font-weight-bold text-white mb-4">
                Nipon Payroll Pro
              </h1>
              <p class="text-h6 text-white mb-8 opacity-90">
                Premium Manpower Management for Qatar
              </p>
            </div>
            
            <div class="features-list">
              <div class="feature-item" v-for="feature in features" :key="feature.title">
                <v-icon color="white" class="mr-3">{{ feature.icon }}</v-icon>
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
              <v-icon size="60" color="primary" class="mb-2">
                mdi-account-group
              </v-icon>
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
                  prepend-inner-icon="mdi-email"
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
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
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
    icon: 'mdi-account-group'
  },
  {
    title: 'Payroll Processing',
    description: 'Automated salary calculations and payments',
    icon: 'mdi-cash'
  },
  {
    title: 'Compliance Tracking',
    description: 'Qatar ID, passport, and visa monitoring',
    icon: 'mdi-shield-check'
  },
  {
    title: 'Financial Reports',
    description: 'Comprehensive accounting and analytics',
    icon: 'mdi-chart-line'
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
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
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
  max-width: 400px;
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
  
  .branding-content {
    padding: 32px;
  }
  
  .feature-item {
    margin-bottom: 16px;
    padding: 12px;
  }
}

/* Form styling */
.v-text-field {
  margin-bottom: 0;
}

.v-btn {
  text-transform: none;
  font-weight: 500;
}

/* Focus and hover states */
.v-text-field:focus-within {
  transform: translateY(-2px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 25px rgba(25, 118, 210, 0.15);
}

.v-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.v-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.v-btn.v-btn--variant-elevated {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.v-btn.v-btn--variant-elevated:hover {
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
  box-shadow: 0 8px 25px rgba(25, 118, 210, 0.4);
}

.v-btn.v-btn--variant-outlined {
  border: 2px solid #1976d2;
  background: transparent;
}

.v-btn.v-btn--variant-outlined:hover {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%);
  border-color: #1565c0;
}

/* Enhanced form field styling */
.v-text-field {
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.v-text-field .v-field {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.v-text-field .v-field:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.v-text-field .v-field--focused {
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
}

/* Checkbox enhancements */
.v-checkbox {
  transition: all 0.2s ease;
}

.v-checkbox:hover {
  transform: scale(1.05);
}

/* Link enhancements */
.v-btn.v-btn--variant-text {
  font-weight: 500;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.v-btn.v-btn--variant-text:hover {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%);
  transform: translateX(2px);
}

/* Loading states */
.v-btn--loading {
  pointer-events: none;
  position: relative;
}

.v-btn--loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Card enhancements */
.v-card {
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* Divider styling */
.v-divider {
  opacity: 0.6;
  margin: 16px 0;
}

/* Dark theme support */
.v-theme--dark .login-page {
  background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
}

.v-theme--dark .login-form-panel {
  background: linear-gradient(135deg, #1c2128 0%, #161b22 100%);
}

.v-theme--dark .feature-item {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.v-theme--dark .v-text-field .v-field {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.v-theme--dark .v-text-field .v-field:hover {
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}

.v-theme--dark .v-card {
  background: linear-gradient(135deg, #1c2128 0%, #161b22 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>