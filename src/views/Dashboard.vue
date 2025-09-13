<template>
  <div class="dashboard">
    <!-- Welcome Header -->
    <div class="welcome-section">
      <v-container fluid class="pa-4">
        <v-row>
          <v-col cols="12">
            <div class="welcome-header">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <h1 class="text-h5 font-weight-medium text-primary mb-1">
                    Welcome back, {{ userDisplayName }}!
                  </h1>
                  <p class="text-body-2 text-grey-darken-1 mb-0">
                    {{ welcomeMessage }}
                  </p>
                </div>
                <div class="text-right">
                  <div class="text-subtitle-1 font-weight-medium">{{ currentDate }}</div>
                  <div class="text-caption text-grey-darken-1">{{ currentTime }}</div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <v-container fluid class="pa-4">
      <!-- Quick Stats Cards -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" lg="3" v-for="stat in quickStats" :key="stat.title">
          <v-card
            :color="stat.color"
            dark
            hover
            class="stat-card"
            @click="navigateTo(stat.route)"
            elevation="2"
          >
            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-h5 font-weight-bold mb-1">
                    {{ stat.value }}
                  </div>
                  <div class="text-caption opacity-90">
                    {{ stat.title }}
                  </div>
                </div>
                <Icon :icon="stat.icon" :width="36" :height="36" class="opacity-70" />
              </div>
              <div class="mt-2 d-flex align-center">
                <Icon 
                  :icon="stat.trend > 0 ? 'material-symbols:trending-up' : stat.trend < 0 ? 'material-symbols:trending-down' : 'material-symbols:remove'" 
                  :width="14" 
                  :height="14" 
                  class="mr-1" 
                />
                <span class="text-body-2">
                  {{ Math.abs(stat.trend) }}% {{ stat.trend > 0 ? 'increase' : stat.trend < 0 ? 'decrease' : 'no change' }}
                </span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Main Dashboard Content -->
      <v-row class="mt-6">
        <!-- Left Column -->
        <v-col cols="12" lg="8">
          <!-- Recent Activities -->
          <v-card class="mb-6" elevation="2">
            <v-card-title class="d-flex align-center justify-space-between">
              <span>Recent Activities</span>
              <v-btn variant="text" size="small" :to="{ name: 'TransactionHistory' }">
                View All
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-timeline density="comfortable" side="end">
                <v-timeline-item
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  :dot-color="activity.color"
                  size="small"
                >
                  <template #icon>
                    <Icon :icon="activity.icon" :width="16" :height="16" />
                  </template>
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <div class="text-body-2 font-weight-medium">
                        {{ activity.title }}
                      </div>
                      <div class="text-caption text-grey-darken-1">
                        {{ activity.description }}
                      </div>
                    </div>
                    <div class="text-caption text-grey-darken-1">
                      {{ formatTime(activity.timestamp) }}
                    </div>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>

          <!-- Payroll Summary Chart -->
          <v-card elevation="2">
            <v-card-title>Monthly Payroll Summary</v-card-title>
            <v-card-text>
              <div class="chart-container" style="height: 300px;">
                <!-- Chart will be implemented with Chart.js -->
                <div class="d-flex align-center justify-center h-100 text-grey-darken-1">
                  <div class="text-center">
                    <Icon icon="material-symbols:monitoring" :width="48" :height="48" class="mb-2" />
                    <div>Payroll Chart Coming Soon</div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column -->
        <v-col cols="12" lg="4">
          <!-- Compliance Alerts -->
          <v-card class="mb-6" elevation="2">
            <v-card-title class="d-flex align-center justify-space-between">
              <span>Compliance Alerts</span>
              <v-chip
                v-if="complianceAlerts.length > 0"
                :color="getAlertSeverityColor()"
                size="small"
                :text="complianceAlerts.length.toString()"
              />
            </v-card-title>
            <v-card-text>
              <div v-if="complianceAlerts.length === 0" class="text-center py-4">
                <Icon icon="material-symbols:verified-user" :width="32" :height="32" color="success" class="mb-2" />
                <div class="text-body-2 text-grey-darken-1">
                  All compliance items are up to date
                </div>
              </div>
              <v-list v-else density="comfortable">
                <v-list-item
                  v-for="alert in complianceAlerts.slice(0, 5)"
                  :key="alert.id"
                  @click="navigateTo(alert.route)"
                >
                  <template #prepend>
                    <Icon :icon="alert.icon" :color="alert.severity" :width="20" :height="20" />
                  </template>
                  <v-list-item-title class="text-body-2">
                    {{ alert.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ alert.daysUntilExpiry }} days remaining
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <v-btn
                v-if="complianceAlerts.length > 5"
                variant="text"
                size="small"
                block
                class="mt-2"
                :to="{ name: 'ExpiryAlerts' }"
              >
                View All {{ complianceAlerts.length }} Alerts
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Quick Actions -->
          <v-card class="mb-6" elevation="2">
            <v-card-title>Quick Actions</v-card-title>
            <v-card-text>
              <v-row dense>
                <v-col cols="6" v-for="action in quickActions" :key="action.title">
                  <v-btn
                    :color="action.color"
                    variant="tonal"
                    block
                    :to="action.route"
                    class="text-caption"
                    height="60"
                  >
                    <div class="text-center">
                      <Icon :icon="action.icon" :width="20" :height="20" class="mb-1" />
                      <div>{{ action.title }}</div>
                    </div>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- System Status -->
          <v-card elevation="2">
            <v-card-title>System Status</v-card-title>
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-body-2">Database</span>
                <v-chip color="success" size="small" variant="flat">
                  <Icon icon="material-symbols:check-circle" :width="12" :height="12" class="mr-1" />
                  Connected
                </v-chip>
              </div>
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-body-2">Backup Status</span>
                <v-chip color="success" size="small" variant="flat">
                  <Icon icon="material-symbols:check-circle" :width="12" :height="12" class="mr-1" />
                  Up to date
                </v-chip>
              </div>
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="text-body-2">Notifications</span>
                <v-chip color="warning" size="small" variant="flat">
                  <Icon icon="material-symbols:warning" :width="12" :height="12" class="mr-1" />
                  {{ unreadNotifications }} pending
                </v-chip>
              </div>
              <div class="d-flex align-center justify-space-between">
                <span class="text-body-2">Subscription</span>
                <v-chip :color="subscriptionStatusColor" size="small" variant="flat">
                  <Icon :icon="subscriptionIcon" :width="12" :height="12" class="mr-1" />
                  {{ subscriptionStatus }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { format } from 'date-fns'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// Reactive data
const currentDate = ref('')
const currentTime = ref('')

// Computed properties
const userDisplayName = computed(() => {
  const user = authStore.user
  if (!user) return 'User'
  
  if (user.profile?.firstName) {
    return user.profile.firstName
  }
  
  return user.displayName || 'User'
})

const welcomeMessage = computed(() => {
  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
  return `Good ${timeOfDay}! Here's your business overview for today.`
})

const unreadNotifications = computed(() => appStore.unreadNotifications)

const subscriptionStatus = computed(() => {
  const subscription = authStore.user?.subscription
  if (!subscription) return 'Unknown'
  
  const { plan, status } = subscription
  if (status === 'trial') return 'Trial'
  if (status === 'expired') return 'Expired'
  if (status === 'active') return plan.charAt(0).toUpperCase() + plan.slice(1)
  return 'Inactive'
})

const subscriptionStatusColor = computed(() => {
  const status = authStore.user?.subscription?.status
  const colorMap: Record<string, string> = {
    active: 'success',
    trial: 'info',
    expired: 'error',
    inactive: 'warning'
  }
  return colorMap[status || 'inactive'] || 'grey'
})

const subscriptionIcon = computed(() => {
  const status = authStore.user?.subscription?.status
  const iconMap: Record<string, string> = {
    active: 'material-symbols:check-circle',
    trial: 'material-symbols:schedule',
    expired: 'material-symbols:warning',
    inactive: 'material-symbols:pause-circle'
  }
  return iconMap[status || 'inactive'] || 'material-symbols:help'
})

// Mock data - in real implementation, these would come from stores/API
const quickStats = ref([
  {
    title: 'Total Employees',
    value: '245',
    icon: 'material-symbols:group',
    color: 'primary',
    trend: 5.2,
    route: { name: 'EmployeeList' }
  },
  {
    title: 'This Month Payroll',
    value: 'QAR 182K',
    icon: 'material-symbols:payments',
    color: 'success',
    trend: 2.1,
    route: { name: 'PayrollDashboard' }
  },
  {
    title: 'Active Customers',
    value: '48',
    icon: 'material-symbols:corporate-fare',
    color: 'info',
    trend: 8.7,
    route: { name: 'CustomerList' }
  },
  {
    title: 'Compliance Alerts',
    value: '7',
    icon: 'material-symbols:warning',
    color: 'warning',
    trend: -15.3,
    route: { name: 'ExpiryAlerts' }
  }
])

const recentActivities = ref([
  {
    id: 1,
    title: 'Payroll processed for March 2025',
    description: '245 employees - QAR 182,450',
    icon: 'material-symbols:payments',
    color: 'success',
    timestamp: new Date('2025-03-01T10:30:00')
  },
  {
    id: 2,
    title: 'New employee onboarded',
    description: 'Ahmed Hassan - Construction Worker',
    icon: 'material-symbols:person-add',
    color: 'primary',
    timestamp: new Date('2025-02-28T15:45:00')
  },
  {
    id: 3,
    title: 'Qatar ID expiry alert',
    description: '5 employees require renewal',
    icon: 'material-symbols:warning',
    color: 'warning',
    timestamp: new Date('2025-02-28T09:15:00')
  },
  {
    id: 4,
    title: 'Invoice generated',
    description: 'Al Wakra Construction - QAR 45,600',
    icon: 'material-symbols:invoice',
    color: 'info',
    timestamp: new Date('2025-02-27T16:20:00')
  }
])

const complianceAlerts = ref([
  {
    id: 1,
    title: 'Qatar ID expiry - Ahmed Ali',
    daysUntilExpiry: 15,
    severity: 'error',
    icon: 'material-symbols:badge',
    route: { name: 'ExpiryAlerts' }
  },
  {
    id: 2,
    title: 'Passport expiry - Mohamed Khan',
    daysUntilExpiry: 45,
    severity: 'warning',
    icon: 'material-symbols:travel-explore',
    route: { name: 'ExpiryAlerts' }
  },
  {
    id: 3,
    title: 'Work permit renewal - Sarah Ahmed',
    daysUntilExpiry: 30,
    severity: 'warning',
    icon: 'material-symbols:work',
    route: { name: 'ExpiryAlerts' }
  }
])

const quickActions = computed(() => {
  const actions = []
  
  if (authStore.hasPermission('employee-create')) {
    actions.push({
      title: 'Add Employee',
      icon: 'material-symbols:person-add',
      color: 'primary',
      route: { name: 'EmployeeCreate' }
    })
  }
  
  if (authStore.hasPermission('payroll')) {
    actions.push({
      title: 'Process Payroll',
      icon: 'material-symbols:payments',
      color: 'success',
      route: { name: 'PayrollDashboard' }
    })
  }
  
  if (authStore.hasPermission('receipts')) {
    actions.push({
      title: 'Generate Invoice',
      icon: 'material-symbols:invoice',
      color: 'info',
      route: { name: 'InvoiceGeneration' }
    })
  }
  
  if (authStore.hasPermission('customers')) {
    actions.push({
      title: 'Add Customer',
      icon: 'material-symbols:corporate-fare',
      color: 'secondary',
      route: { name: 'CustomerCreate' }
    })
  }
  
  return actions.slice(0, 6) // Limit to 6 actions
})

// Methods
const navigateTo = (route: any) => {
  if (route && route.name) {
    router.push(route)
  }
}

const formatTime = (timestamp: Date): string => {
  return format(timestamp, 'MMM dd, HH:mm')
}

const getAlertSeverityColor = (): string => {
  const hasError = complianceAlerts.value.some(alert => alert.severity === 'error')
  const hasWarning = complianceAlerts.value.some(alert => alert.severity === 'warning')
  
  if (hasError) return 'error'
  if (hasWarning) return 'warning'
  return 'success'
}

const updateTime = () => {
  const now = new Date()
  currentDate.value = format(now, 'EEEE, MMMM dd, yyyy')
  currentTime.value = format(now, 'HH:mm:ss')
}

// Lifecycle
onMounted(() => {
  updateTime()
  // Update time every second
  setInterval(updateTime, 1000)
})
</script>

<style scoped>
.dashboard {
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  min-height: 100vh;
  position: relative;
}

.dashboard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="0.5" fill="rgba(0,0,0,0.02)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
  pointer-events: none;
  z-index: 0;
}

.welcome-section {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
  margin-bottom: 0;
  position: relative;
  overflow: hidden;
}

.welcome-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="waves" width="100" height="20" patternUnits="userSpaceOnUse"><path d="M0,10 Q25,0 50,10 T100,10" stroke="rgba(255,255,255,0.1)" stroke-width="1" fill="none"/></pattern></defs><rect width="100" height="100" fill="url(%23waves)"/></svg>');
  opacity: 0.6;
}

.welcome-header {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  padding: 24px;
  border-radius: 16px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.welcome-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 130px;
  border-radius: 16px !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  backdrop-filter: blur(10px);
  overflow: hidden;
  position: relative;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2) !important;
}

.chart-container {
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chart-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

/* Card hover effects */
.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px !important;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  overflow: hidden;
  position: relative;
}

.v-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #1976d2, #42a5f5, #1976d2);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.v-card:hover::before {
  transform: scaleX(1);
}

.v-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

/* Timeline styling */
.v-timeline {
  padding-top: 0;
}

.v-timeline :deep(.v-timeline-item__body) {
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.v-timeline :deep(.v-timeline-item__body:hover) {
  transform: translateX(4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* Quick action buttons */
.v-btn {
  text-transform: none;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.v-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.v-btn.v-btn--variant-elevated {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

/* Typography improvements */
.text-h5 {
  letter-spacing: 0.5px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.text-caption {
  font-weight: 500;
  opacity: 0.9;
}

/* Enhanced progress indicators */
.v-progress-linear {
  border-radius: 8px;
  overflow: hidden;
}

.v-progress-linear :deep(.v-progress-linear__background) {
  background: rgba(255, 255, 255, 0.3) !important;
}

/* Icon enhancements */
.v-icon {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .welcome-header {
    padding: 20px;
  }
  
  .stat-card {
    height: 120px;
  }
}

/* Dark theme adjustments */
.v-theme--dark .dashboard {
  background: linear-gradient(135deg, #121212 0%, #1a1a1a 100%);
}

.v-theme--dark .dashboard::before {
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
}

.v-theme--dark .welcome-section {
  background: linear-gradient(135deg, #0D47A1 0%, #1565C0 100%);
}

.v-theme--dark .welcome-header {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.v-theme--dark .stat-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.v-theme--dark .chart-container {
  border-color: rgba(255, 255, 255, 0.1);
  background: linear-gradient(135deg, #1e1e1e 0%, #121212 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.v-theme--dark .v-card {
  background: linear-gradient(135deg, #1e1e1e 0%, #121212 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.v-theme--dark .v-timeline :deep(.v-timeline-item__body) {
  background: linear-gradient(135deg, #1e1e1e 0%, #121212 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.floating-animation {
  animation: float 6s ease-in-out infinite;
}

.shimmer-effect {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
</style>