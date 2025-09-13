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
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  min-height: calc(100vh - 96px);
  position: relative;
}

.main-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(0,0,0,0.02)" stroke-width="1"/></pattern></defs><rect width="60" height="60" fill="url(%23grid)"/></svg>');
  pointer-events: none;
  z-index: 0;
}

.border-t {
  border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
}

/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(1.02);
}

/* App bar customizations */
.v-app-bar {
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08) !important;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
  backdrop-filter: blur(10px);
}

.v-app-bar .v-toolbar-title {
  flex: none;
  font-weight: 600 !important;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.v-app-bar .v-btn {
  border-radius: 12px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.v-app-bar .v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
}

/* Navigation drawer customizations */
:deep(.v-navigation-drawer) {
  border-right: 1px solid rgba(0, 0, 0, 0.06) !important;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.05);
  background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%) !important;
}

/* Footer customizations */
.v-footer {
  font-size: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.05) !important;
}

.v-footer .v-chip {
  border-radius: 8px !important;
  font-size: 10px !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
}

/* Loading overlay */
.v-overlay {
  backdrop-filter: blur(4px) !important;
}

.v-overlay .v-progress-circular {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

/* Snackbar improvements */
.v-snackbar {
  border-radius: 12px !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
  backdrop-filter: blur(10px);
}

.v-snackbar .v-btn {
  border-radius: 8px !important;
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
  background: linear-gradient(135deg, #121212 0%, #1a1a1a 100%);
}

.v-theme--dark .main-content::before {
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="60" height="60" fill="url(%23grid)"/></svg>');
}

.v-theme--dark .border-t {
  border-top: 1px solid rgba(255, 255, 255, 0.12) !important;
}

.v-theme--dark .v-app-bar {
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%) !important;
}

.v-theme--dark :deep(.v-navigation-drawer) {
  background: linear-gradient(180deg, #1e1e1e 0%, #121212 100%) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.v-theme--dark .v-footer {
  background: linear-gradient(135deg, #1e1e1e 0%, #121212 100%) !important;
}

/* Micro-animations for interactive elements */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}

/* Enhanced focus states */
:deep(.v-btn:focus-visible) {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.1) !important;
}

:deep(.v-text-field input:focus) {
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1) !important;
}
</style>