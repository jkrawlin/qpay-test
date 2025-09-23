<template>
  <v-menu offset-y>
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        size="large"
        color="white"
      >
        <v-avatar
          :size="36"
          color="primary"
        >
          <span class="text-h6 font-weight-medium text-white">
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
            color="primary"
            class="mr-3"
          >
            <span class="text-h5 font-weight-medium text-white">
              {{ getUserInitials }}
            </span>
          </v-avatar>

          <div class="flex-grow-1">
            <div class="text-h6 font-weight-medium">
              Development User
            </div>
            <div class="text-caption text-grey-darken-1">
              dev@niponpayroll.com
            </div>
            <div class="d-flex align-center mt-1">
              <v-chip
                color="primary"
                size="x-small"
                variant="flat"
              >
                Administrator
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
          :to="{ name: 'CompanyProfile' }"
        />

        <!-- Settings -->
        <v-list-item
          prepend-icon="mdi-cog"
          title="Settings"
          :to="{ name: 'Settings' }"
        />

        <!-- Theme Toggle -->
        <v-list-item
          prepend-icon="mdi-theme-light-dark"
          title="Toggle Theme"
          @click="toggleTheme"
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
      </v-list>
    </v-card>
  </v-menu>

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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import { useAppStore } from '@/stores/app'

const theme = useTheme()
const appStore = useAppStore()

// Reactive data
const showAboutDialog = ref(false)

// Computed properties
const getUserInitials = computed(() => {
  return 'DU' // Development User
})

// Methods
const toggleTheme = () => {
  if (!theme?.global?.current) return
  const isDark = theme.global.current.value.dark
  const newThemeName = isDark ? 'qatar' : 'qatarDark'
  theme.global.name.value = newThemeName
  appStore.setTheme(isDark ? 'light' : 'dark')
}

const openHelpDialog = () => {
  appStore.showSnackbar('Help & Support coming soon!', 'info')
}
</script>

<style scoped>
.v-list-item {
  transition: background-color 0.2s ease;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.v-theme--dark .v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

/* Avatar styling */
.v-avatar {
  border: 2px solid rgba(255, 255, 255, 0.2);
}

/* Role chip styling */
.v-chip {
  font-size: 10px;
  height: 18px;
}

/* Language dialog list styling */
.v-dialog .v-list-item {
  padding: 12px 16px;
}

/* About dialog content styling */
.v-dialog .v-card-text ul {
  padding-left: 20px;
  margin: 0;
}

.v-dialog .v-card-text li {
  margin-bottom: 4px;
}
</style>