<template>
  <v-menu offset-y>
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        size="large"
      >
        <v-avatar
          :size="36"
          :color="user?.photoURL ? 'transparent' : 'primary'"
        >
          <v-img
            v-if="user?.photoURL"
            :src="user.photoURL"
            :alt="user.displayName"
            cover
          />
          <span v-else class="text-h6 font-weight-medium text-white">
            {{ getUserInitials }}
          </span>
        </v-avatar>
      </v-btn>
    </template>

    <v-card min-width="280">
      <!-- User Info Header -->
      <v-card-item>
        <div class="d-flex align-center">
          <v-avatar
            :size="48"
            :color="user?.photoURL ? 'transparent' : 'primary'"
            class="mr-3"
          >
            <v-img
              v-if="user?.photoURL"
              :src="user.photoURL"
              :alt="user?.displayName"
              cover
            />
            <span v-else class="text-h5 font-weight-medium text-white">
              {{ getUserInitials }}
            </span>
          </v-avatar>

          <div class="flex-grow-1">
            <div class="text-h6 font-weight-medium">
              {{ user?.displayName || 'User' }}
            </div>
            <div class="text-caption text-grey-darken-1">
              {{ user?.email }}
            </div>
            <div class="d-flex align-center mt-1">
              <v-chip
                :color="getRoleColor(primaryRole)"
                size="x-small"
                variant="flat"
              >
                {{ formatRole(primaryRole) }}
              </v-chip>
              <v-chip
                v-if="hasPremiumAccess"
                color="gold"
                size="x-small"
                variant="flat"
                class="ml-1"
              >
                Premium
              </v-chip>
            </div>
          </div>
        </div>
      </v-card-item>

      <v-divider />

      <!-- Menu Items -->
      <v-list nav density="comfortable">
        <!-- Profile -->
        <v-list-item
          prepend-icon="mdi-account"
          title="My Profile"
          :to="isEmployee ? { name: 'EmployeeProfile' } : { name: 'CompanyProfile' }"
        />

        <!-- Settings (if admin) -->
        <v-list-item
          v-if="isAdmin"
          prepend-icon="mdi-cog"
          title="Settings"
          :to="{ name: 'Settings' }"
        />

        <!-- Subscription -->
        <v-list-item
          prepend-icon="mdi-credit-card"
          title="Subscription"
          :to="{ name: 'SubscriptionManagement' }"
        />

        <!-- Theme Toggle -->
        <v-list-item
          prepend-icon="mdi-theme-light-dark"
          title="Toggle Theme"
          @click="toggleTheme"
        />

        <!-- Language (Future feature) -->
        <v-list-item
          prepend-icon="mdi-translate"
          title="Language"
          @click="showLanguageDialog = true"
        />

        <v-divider />

        <!-- Help & Support -->
        <v-list-item
          prepend-icon="mdi-help-circle"
          title="Help & Support"
          @click="openHelpDialog"
        />

        <!-- About -->
        <v-list-item
          prepend-icon="mdi-information"
          title="About"
          @click="showAboutDialog = true"
        />

        <v-divider />

        <!-- Logout -->
        <v-list-item
          prepend-icon="mdi-logout"
          title="Logout"
          @click="handleLogout"
        />
      </v-list>
    </v-card>
  </v-menu>

  <!-- Language Selection Dialog -->
  <v-dialog v-model="showLanguageDialog" max-width="400">
    <v-card>
      <v-card-title>Select Language</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="language in availableLanguages"
            :key="language.code"
            @click="changeLanguage(language.code)"
          >
            <template #prepend>
              <v-icon>{{ language.icon }}</v-icon>
            </template>
            <v-list-item-title>{{ language.name }}</v-list-item-title>
            <template #append>
              <v-icon v-if="currentLanguage === language.code" color="primary">
                mdi-check
              </v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="showLanguageDialog = false">
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- About Dialog -->
  <v-dialog v-model="showAboutDialog" max-width="500">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" size="28">mdi-account-group</v-icon>
        About Nipon Payroll Pro
      </v-card-title>
      <v-card-text>
        <div class="text-center mb-4">
          <v-img
            src="/logo.png"
            alt="Nipon Payroll Pro"
            height="64"
            width="64"
            class="mx-auto mb-2"
            contain
          />
          <div class="text-h6 font-weight-bold">Nipon Payroll Pro</div>
          <div class="text-body-2 text-grey-darken-1">Version 1.0.0</div>
        </div>
        
        <p class="text-body-2 mb-3">
          Premium desktop-optimized web application designed specifically for 
          manpower supply companies in Qatar. Streamline your payroll, employee 
          management, and compliance operations with our comprehensive solution.
        </p>

        <div class="mb-3">
          <strong>Key Features:</strong>
          <ul class="text-body-2 mt-1">
            <li>Employee Management & Documentation</li>
            <li>Payroll Processing & Salary Management</li>
            <li>Qatar Compliance & Expiry Tracking</li>
            <li>Financial Accounting & Reports</li>
            <li>Customer & Contract Management</li>
            <li>Real-time Notifications & Alerts</li>
          </ul>
        </div>

        <div class="text-body-2 text-grey-darken-1">
          Built with Vue 3, TypeScript, Firebase, and Vuetify for the Qatar market.
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="showAboutDialog = false">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Logout Confirmation Dialog -->
  <v-dialog v-model="showLogoutDialog" max-width="400">
    <v-card>
      <v-card-title>Confirm Logout</v-card-title>
      <v-card-text>
        Are you sure you want to logout? Any unsaved changes will be lost.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="showLogoutDialog = false">
          Cancel
        </v-btn>
        <v-btn color="primary" @click="confirmLogout">
          Logout
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const theme = useTheme()
const authStore = useAuthStore()
const appStore = useAppStore()

// Reactive data
const showLanguageDialog = ref(false)
const showAboutDialog = ref(false)
const showLogoutDialog = ref(false)
const currentLanguage = ref('en')

// Available languages
const availableLanguages = [
  { code: 'en', name: 'English', icon: 'mdi-flag' },
  { code: 'ar', name: 'العربية (Arabic)', icon: 'mdi-flag' }
]

// Computed properties
const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)
const isEmployee = computed(() => authStore.isEmployee)
const hasPremiumAccess = computed(() => authStore.hasPremiumAccess)

const primaryRole = computed(() => {
  if (!user.value?.roles?.length) return 'user'
  return user.value.roles[0]
})

const getUserInitials = computed(() => {
  if (!user.value?.displayName) return 'U'
  return user.value.displayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// Methods
const toggleTheme = () => {
  const newTheme = theme.global.current.value.dark ? 'light' : 'dark'
  theme.global.name.value = newTheme
  appStore.setTheme(newTheme)
}

const changeLanguage = (languageCode: string) => {
  currentLanguage.value = languageCode
  showLanguageDialog.value = false
  
  // In a real implementation, this would update the i18n locale
  appStore.showSnackbar(
    `Language changed to ${availableLanguages.find(l => l.code === languageCode)?.name}`,
    'success'
  )
}

const getRoleColor = (role: string): string => {
  const roleColors: Record<string, string> = {
    admin: 'primary',
    manager: 'secondary',
    hr: 'info',
    finance: 'success',
    employee: 'grey',
    client: 'warning'
  }
  return roleColors[role] || 'grey'
}

const formatRole = (role: string): string => {
  const roleNames: Record<string, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    hr: 'HR',
    finance: 'Finance',
    employee: 'Employee',
    client: 'Client'
  }
  return roleNames[role] || role.charAt(0).toUpperCase() + role.slice(1)
}

const openHelpDialog = () => {
  // In a real implementation, this could open a help center or support chat
  appStore.showSnackbar('Help & Support coming soon!', 'info')
}

const handleLogout = () => {
  showLogoutDialog.value = true
}

const confirmLogout = async () => {
  showLogoutDialog.value = false
  appStore.setLoading(true)
  
  try {
    const result = await authStore.logout()
    
    if (result.success) {
      appStore.showSnackbar('Logged out successfully', 'success')
      router.push({ name: 'Login' })
    } else {
      appStore.showSnackbar(result.error || 'Logout failed', 'error')
    }
  } catch (error) {
    console.error('Logout error:', error)
    appStore.showSnackbar('An unexpected error occurred', 'error')
  } finally {
    appStore.setLoading(false)
  }
}
</script>

<style scoped>
.v-list-item {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  margin: 2px 4px;
}

.v-list-item:hover {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.1);
}

.v-theme--dark .v-list-item:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

/* Avatar styling */
.v-avatar {
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.v-avatar:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Role chip styling */
.v-chip {
  font-size: 10px;
  height: 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.v-chip:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Menu styling */
.v-menu > .v-overlay__content > .v-card {
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.v-theme--dark .v-menu > .v-overlay__content > .v-card {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

/* Dialog styling */
.v-dialog .v-card {
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.v-dialog .v-list-item {
  padding: 12px 16px;
  border-radius: 8px;
  margin: 2px 8px;
  transition: all 0.2s ease;
}

.v-dialog .v-list-item:hover {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%);
  transform: translateX(4px);
}

/* About dialog content styling */
.v-dialog .v-card-text {
  line-height: 1.6;
}

.v-dialog .v-card-text ul {
  padding-left: 20px;
  margin: 0;
}

.v-dialog .v-card-text li {
  margin-bottom: 6px;
  position: relative;
  transition: all 0.2s ease;
}

.v-dialog .v-card-text li:hover {
  transform: translateX(4px);
  color: #1976d2;
}

.v-dialog .v-card-text li::before {
  content: '▸';
  position: absolute;
  left: -16px;
  color: #1976d2;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.v-dialog .v-card-text li:hover::before {
  opacity: 1;
}

/* Button enhancements */
.v-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: none;
  font-weight: 500;
  border-radius: 12px;
}

.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.v-btn.v-btn--variant-text:hover {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%);
}

/* Icon enhancements */
.v-icon {
  transition: all 0.2s ease;
}

.v-list-item:hover .v-icon {
  color: #1976d2;
  transform: scale(1.1);
}

/* Badge enhancements */
.v-badge {
  transition: all 0.2s ease;
}

.v-badge:hover {
  transform: scale(1.05);
}

/* Divider styling */
.v-divider {
  margin: 8px 0;
  opacity: 0.6;
}

/* Scrollbar styling for dialogs */
.v-dialog ::-webkit-scrollbar {
  width: 6px;
}

.v-dialog ::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.v-dialog ::-webkit-scrollbar-thumb {
  background: rgba(25, 118, 210, 0.3);
  border-radius: 3px;
}

.v-dialog ::-webkit-scrollbar-thumb:hover {
  background: rgba(25, 118, 210, 0.5);
}
</style>