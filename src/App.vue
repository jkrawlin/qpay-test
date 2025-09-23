<template>
  <v-app>
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
        >
          <v-icon>mdi-menu</v-icon>
        </v-app-bar-nav-icon>
        
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
        <div class="main-content enhanced-main">
          <!-- Route Transition -->
          <router-view v-slot="{ Component, route }">
            <transition 
              :name="getTransitionName(route)" 
              mode="out-in"
              @enter="onEnter"
              @leave="onLeave"
            >
              <Suspense>
                <template #default>
                  <component :is="Component" :key="route.path" />
                </template>
                <template #fallback>
                  <div class="route-loading">
                    <LoadingSpinner size="large" text="Loading page..." />
                  </div>
                </template>
              </Suspense>
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
      <!-- Global Toaster -->
      <GlobalToaster />
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onErrorCaptured } from 'vue'
import { useOnline } from '@vueuse/core'
import { useTheme } from 'vuetify'
import { useAppStore } from '@/stores/app'
import type { RouteLocationNormalized } from 'vue-router'

// Components
import NavigationDrawer from '@/components/layout/NavigationDrawer.vue'
import NotificationMenu from '@/components/layout/NotificationMenu.vue'
import UserMenu from '@/components/layout/UserMenu.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import GlobalToaster from '@/components/common/GlobalToaster.vue'

// Composables
const isOnline = useOnline()
const appStore = useAppStore()
const theme = useTheme()

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
const currentYear = computed(() => new Date().getFullYear())
const isLoading = computed(() => appStore.isLoading)
const snackbar = computed(() => appStore.snackbar)

// Methods
const getTransitionName = (route: RouteLocationNormalized) => {
  // Different transitions for different route types
  if (route.meta?.transition) {
    return route.meta.transition as string
  }
  
  // Default slide transition
  return 'slide-fade'
}

const onEnter = () => {
  // Animation started
  appStore.setLoading(false)
}

const onLeave = () => {
  // Animation started
  appStore.setLoading(true)
}

// Lifecycle
onMounted(() => {
  // Check for app updates
  checkForUpdates()
  
  // Initialize theme to light mode only
  // Ensure we point to existing theme key
  if (theme?.global?.name) {
    theme.global.name.value = 'qatar'
  }
  
  // Set up window resize listener for mobile detection
  window.addEventListener('resize', handleResize)
})

const checkForUpdates = () => {
  if ('serviceWorker' in navigator && (window as any).updateSW) {
    // Check for updates periodically
    setInterval(() => {
      (window as any).updateSW(true)
    }, 60000) // Check every minute
  }
}

const handleResize = () => {
  // Disable mobile redirect for now - app should work regardless of screen size
  // if (window.innerWidth < 1024) {
  //   window.location.href = '/mobile-redirect.html'
  // }
}
</script>

<style scoped>
/* Main content styling */
.main-content {
  background: var(--gradient-surface-light);
  min-height: calc(100vh - 96px);
}

.enhanced-main {
  position: relative;
  overflow: hidden;
}

.route-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: var(--spacing-xl);
}

.border-t {
  border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
}

/* Enhanced page transition animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.zoom-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.zoom-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* App bar customizations */
.v-app-bar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  background: #8B1538 !important;
  /* Remove backdrop filter that causes transparency */
}

.v-app-bar .v-toolbar-title {
  flex: none;
  font-weight: 600 !important;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.v-app-bar .v-app-bar-nav-icon {
  transition: all var(--transition-fast);
}

.v-app-bar .v-app-bar-nav-icon:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.1);
}

/* Navigation drawer customizations */
:deep(.v-navigation-drawer) {
  border-right: 1px solid var(--color-border) !important;
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(10px);
}

/* Footer customizations */
.v-footer {
  font-size: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
  border-top: 1px solid var(--color-border) !important;
}

.v-footer .v-chip {
  transition: all var(--transition-fast);
}

.v-footer .v-chip:hover {
  transform: scale(1.05);
}

/* Loading overlay enhancements */
:deep(.v-overlay) {
  backdrop-filter: blur(4px);
}

:deep(.v-overlay .v-overlay__content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
}

/* Snackbar enhancements */
:deep(.v-snackbar) {
  backdrop-filter: blur(10px);
}

:deep(.v-snackbar .v-snackbar__wrapper) {
  border-radius: var(--border-radius-lg) !important;
  box-shadow: var(--shadow-lg);
}

/* Responsive adjustments */
@media (max-width: 1023px) {
  /* Hide everything on small screens */
  .v-app > *:not(.mobile-redirect) {
    display: none !important;
  }
}

@media (max-width: 768px) {
  .main-content {
    min-height: calc(100vh - 88px);
  }
  
  .v-app-bar .v-toolbar-title {
    font-size: 1rem;
  }
  
  .route-loading {
    min-height: 300px;
    padding: var(--spacing-lg);
  }
}

/* Performance optimizations */
.main-content {
  will-change: transform;
  transform: translateZ(0);
}

.v-app-bar {
  will-change: transform;
  transform: translateZ(0);
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .slide-fade-enter-active,
  .slide-fade-leave-active,
  .fade-enter-active,
  .fade-leave-active,
  .zoom-enter-active,
  .zoom-leave-active {
    transition: none;
  }
  
  .v-app-bar .v-app-bar-nav-icon,
  .v-footer .v-chip {
    transition: none;
  }
}
</style>