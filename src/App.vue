<template>
  <v-app>
    <!-- Mobile Detection Alert -->
    <MobileRedirect v-if="isMobile" />
    
    <!-- Main App Content for Desktop -->
    <template v-else>
      <!-- Navigation Bar -->
      <v-app-bar
        app
        color="primary"
        dark
        elevate-on-scroll
        height="56"
        density="compact"
      >
        <v-app-bar-nav-icon
          @click="drawer = !drawer"
          aria-label="Toggle navigation menu"
          size="small"
        />
        
        <v-toolbar-title class="text-subtitle-1 font-weight-medium">
          <v-icon class="mr-2" size="20">mdi-office-building</v-icon>
          Nipon Payroll Pro
        </v-toolbar-title>

        <v-spacer />

        <!-- Notifications -->
        <NotificationMenu />

        <!-- User Menu -->
        <UserMenu />
      </v-app-bar>

      <!-- Navigation Drawer -->
      <v-navigation-drawer
        v-model="drawer"
        app
        width="260"
        :permanent="$vuetify.display.lgAndUp"
        border="0"
      >
        <NavigationDrawer />
      </v-navigation-drawer>

      <!-- Main Content -->
      <v-main>
        <div class="main-content">
          <!-- Route Transition -->
          <router-view v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </v-main>

      <!-- Footer -->
      <v-footer app color="grey-lighten-5" height="40" class="border-t">
        <v-row no-gutters align="center" class="text-caption px-4">
          <v-col>
            <span class="text-grey-darken-1">
              © {{ currentYear }} Nipon Payroll Pro
            </span>
          </v-col>
          <v-col cols="auto">
            <v-chip
              size="x-small"
              :color="isOnline ? 'success' : 'error'"
              variant="flat"
              :prepend-icon="isOnline ? 'mdi-wifi' : 'mdi-wifi-off'"
            >
              {{ isOnline ? 'Online' : 'Offline' }}
            </v-chip>
          </v-col>
        </v-row>
      </v-footer>

      <!-- Loading Overlay -->
      <v-overlay
        v-model="isLoading"
        class="align-center justify-center"
        persistent
      >
        <v-progress-circular
          color="primary"
          indeterminate
          size="48"
        />
        <div class="text-subtitle-1 mt-3">Loading...</div>
      </v-overlay>

      <!-- Global Snackbar for Notifications -->
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="snackbar.timeout"
        :multi-line="snackbar.multiLine"
        location="top right"
        variant="elevated"
      >
        <v-icon class="mr-2" size="small">{{ snackbar.icon }}</v-icon>
        {{ snackbar.text }}
        
        <template #actions>
          <v-btn
            variant="text"
            size="small"
            @click="snackbar.show = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    </template>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onErrorCaptured } from 'vue'
import { useDisplay } from 'vuetify'
import { useOnline } from '@vueuse/core'
import { useAppStore } from '@/stores/app'
import { useRouter } from 'vue-router'

// Components
import MobileRedirect from '@/components/common/MobileRedirect.vue'
import NavigationDrawer from '@/components/layout/NavigationDrawer.vue'
import NotificationMenu from '@/components/layout/NotificationMenu.vue'
import UserMenu from '@/components/layout/UserMenu.vue'

// Composables
const { mobile } = useDisplay()
const isOnline = useOnline()
const appStore = useAppStore()
const router = useRouter()

// Global error handling
onErrorCaptured((error, instance, info) => {
  console.error('Global error caught:', error)
  console.error('Component instance:', instance)
  console.error('Error info:', info)
  
  // Don't propagate error to cause app crash
  return false
})

// Reactive data
const drawer = ref(false)

// Computed properties
const isMobile = computed(() => {
  return mobile.value || window.innerWidth < 1024
})

const currentYear = computed(() => new Date().getFullYear())

const isLoading = computed(() => appStore.isLoading)

const snackbar = computed(() => appStore.snackbar)

// Lifecycle
onMounted(() => {
  // Check for app updates
  checkForUpdates()
  
  // Initialize theme from localStorage
  initializeTheme()
  
  // Set up window resize listener for mobile detection
  window.addEventListener('resize', handleResize)
})

// Methods
const checkForUpdates = () => {
  if ('serviceWorker' in navigator && window.updateSW) {
    // Check for updates periodically
    setInterval(() => {
      window.updateSW(true)
    }, 60000) // Check every minute
  }
}

const initializeTheme = () => {
  const savedTheme = localStorage.getItem('nipon-theme')
  if (savedTheme) {
    appStore.setTheme(savedTheme as 'light' | 'dark')
  }
}

const handleResize = () => {
  if (window.innerWidth < 1024) {
    // Redirect to mobile page if window becomes too small
    window.location.href = '/mobile-redirect.html'
  }
}
</script>

<style scoped>
/* Main content styling */
.main-content {
  background-color: #fafafa;
  min-height: calc(100vh - 96px);
}

.border-t {
  border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
}

/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s ease-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* App bar customizations */
.v-app-bar {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12) !important;
}

.v-app-bar .v-toolbar-title {
  flex: none;
  font-weight: 500 !important;
  letter-spacing: 0.5px;
}

/* Navigation drawer customizations */
:deep(.v-navigation-drawer) {
  border-right: 1px solid rgba(0, 0, 0, 0.08) !important;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
}

/* Footer customizations */
.v-footer {
  font-size: 12px;
}

/* Responsive adjustments */
@media (max-width: 1023px) {
  /* Hide everything on small screens */
  .v-app > *:not(.mobile-redirect) {
    display: none !important;
  }
}

/* Dark theme adjustments */
.v-theme--dark .main-content {
  background-color: #121212;
}

.v-theme--dark .border-t {
  border-top: 1px solid rgba(255, 255, 255, 0.12) !important;
}
</style>