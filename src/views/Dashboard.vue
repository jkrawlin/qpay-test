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
      <v-row class="mb-6">
        <v-col cols="12" sm="6" lg="3" v-for="stat in quickStats" :key="stat.title">
          <v-card
            :color="stat.color"
            dark
            hover
            class="stat-card"
            @click="navigateTo(stat.route)"
            elevation="3"
          >
            <v-card-text class="pa-6">
              <div class="d-flex justify-space-between align-center mb-3">
                <div class="flex-grow-1">
                  <div class="text-h4 font-weight-bold mb-2">
                    {{ stat.value }}
                  </div>
                  <div class="text-body-1 opacity-90">
                    {{ stat.title }}
                  </div>
                </div>
                <div class="stat-icon">
                  <Icon :icon="stat.icon" :width="48" :height="48" class="opacity-80" />
                </div>
              </div>
              <div class="d-flex align-center">
                <Icon 
                  :icon="stat.trend > 0 ? 'material-symbols:trending-up' : stat.trend < 0 ? 'material-symbols:trending-down' : 'material-symbols:remove'" 
                  :width="16" 
                  :height="16" 
                  class="mr-2" 
                />
                <span class="text-body-2 opacity-90">
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
          <v-card class="mb-6" elevation="3">
            <v-card-title class="d-flex align-center justify-space-between pa-6 pb-4">
              <div class="d-flex align-center">
                <Icon icon="material-symbols:history" :width="24" :height="24" class="mr-3 text-primary" />
                <span class="text-h6 font-weight-medium">Recent Activities</span>
              </div>
              <v-btn variant="text" size="small" :to="{ name: 'TransactionHistory' }" class="text-primary">
                <Icon icon="material-symbols:arrow-forward" :width="16" :height="16" class="mr-1" />
                View All
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-6 pt-2">
              <v-timeline density="comfortable" side="end">
                <v-timeline-item
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  :dot-color="activity.color"
                  size="small"
                >
                  <template #icon>
                    <Icon :icon="activity.icon" :width="18" :height="18" />
                  </template>
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <div class="text-body-1 font-weight-medium mb-1">
                        {{ activity.title }}
                      </div>
                      <div class="text-body-2 text-grey-darken-1">
                        {{ activity.description }}
                      </div>
                    </div>
                    <div class="text-caption text-grey-darken-1 ml-4">
                      {{ formatTime(activity.timestamp) }}
                    </div>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>

          <!-- Payroll Summary Chart -->
          <v-card elevation="3">
            <v-card-title class="pa-6 pb-4">
              <div class="d-flex align-center">
                <Icon icon="material-symbols:analytics" :width="24" :height="24" class="mr-3 text-primary" />
                <span class="text-h6 font-weight-medium">Monthly Payroll Summary</span>
              </div>
            </v-card-title>
            <v-card-text class="pa-6 pt-2">
              <div class="chart-container" style="height: 300px;">
                <!-- Chart will be implemented with Chart.js -->
                <div class="d-flex align-center justify-center h-100 text-grey-darken-1">
                  <div class="text-center">
                    <div class="chart-placeholder">
                      <Icon icon="material-symbols:monitoring" :width="64" :height="64" class="mb-4 text-primary opacity-60" />
                      <div class="text-h6 font-weight-medium mb-2">Payroll Analytics</div>
                      <div class="text-body-2">Advanced charts coming soon</div>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column -->
        <v-col cols="12" lg="4">
          <!-- Compliance Alerts -->
          <v-card class="mb-6" elevation="3">
            <v-card-title class="d-flex align-center justify-space-between pa-6 pb-4">
              <div class="d-flex align-center">
                <Icon icon="material-symbols:verified-user" :width="24" :height="24" class="mr-3 text-primary" />
                <span class="text-h6 font-weight-medium">Compliance Alerts</span>
              </div>
              <v-chip
                v-if="complianceAlerts.length > 0"
                :color="getAlertSeverityColor()"
                size="small"
                variant="flat"
                :text="complianceAlerts.length.toString()"
              />
            </v-card-title>
            <v-card-text class="pa-6 pt-2">
              <div v-if="complianceAlerts.length === 0" class="text-center py-6">
                <Icon icon="material-symbols:verified-user" :width="48" :height="48" color="success" class="mb-3" />
                <div class="text-body-1 font-weight-medium mb-1">All Up to Date</div>
                <div class="text-body-2 text-grey-darken-1">
                  All compliance items are current
                </div>
              </div>
              <v-list v-else density="comfortable" class="pa-0">
                <v-list-item
                  v-for="alert in complianceAlerts.slice(0, 5)"
                  :key="alert.id"
                  @click="navigateTo(alert.route)"
                  class="px-0 hover-item"
                  rounded
                >
                  <template #prepend>
                    <v-avatar size="36" :color="alert.severity" variant="tonal" class="mr-3">
                      <Icon :icon="alert.icon" :width="20" :height="20" />
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-body-1 font-weight-medium">
                    {{ alert.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2">
                    {{ alert.daysUntilExpiry }} days remaining
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <v-btn
                v-if="complianceAlerts.length > 5"
                variant="text"
                size="small"
                block
                class="mt-4"
                :to="{ name: 'ExpiryAlerts' }"
              >
                <Icon icon="material-symbols:arrow-forward" :width="16" :height="16" class="mr-1" />
                View All {{ complianceAlerts.length }} Alerts
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Quick Actions -->
          <v-card class="mb-6" elevation="3">
            <v-card-title class="pa-6 pb-4">
              <div class="d-flex align-center">
                <Icon icon="material-symbols:dashboard-customize" :width="24" :height="24" class="mr-3 text-primary" />
                <span class="text-h6 font-weight-medium">Quick Actions</span>
              </div>
            </v-card-title>
            <v-card-text class="pa-6 pt-2">
              <v-row dense>
                <v-col cols="6" v-for="action in quickActions" :key="action.title">
                  <v-btn
                    :color="action.color"
                    variant="tonal"
                    block
                    :to="action.route"
                    class="text-caption action-btn"
                    height="72"
                  >
                    <div class="text-center">
                      <Icon :icon="action.icon" :width="24" :height="24" class="mb-2" />
                      <div class="font-weight-medium">{{ action.title }}</div>
                    </div>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- System Status -->
          <v-card elevation="3">
            <v-card-title class="pa-6 pb-4">
              <div class="d-flex align-center">
                <Icon icon="material-symbols:monitor-heart" :width="24" :height="24" class="mr-3 text-primary" />
                <span class="text-h6 font-weight-medium">System Status</span>
              </div>
            </v-card-title>
            <v-card-text class="pa-6 pt-2">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <Icon icon="material-symbols:database" :width="20" :height="20" class="mr-3 text-grey-darken-1" />
                  <span class="text-body-1">Database</span>
                </div>
                <v-chip color="success" size="small" variant="flat">
                  <Icon icon="material-symbols:check-circle" :width="14" :height="14" class="mr-1" />
                  Connected
                </v-chip>
              </div>
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <Icon icon="material-symbols:backup" :width="20" :height="20" class="mr-3 text-grey-darken-1" />
                  <span class="text-body-1">Backup Status</span>
                </div>
                <v-chip color="success" size="small" variant="flat">
                  <Icon icon="material-symbols:check-circle" :width="14" :height="14" class="mr-1" />
                  Up to date
                </v-chip>
              </div>
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <Icon icon="material-symbols:notifications" :width="20" :height="20" class="mr-3 text-grey-darken-1" />
                  <span class="text-body-1">Notifications</span>
                </div>
                <v-chip color="warning" size="small" variant="flat">
                  <Icon icon="material-symbols:warning" :width="14" :height="14" class="mr-1" />
                  {{ unreadNotifications }} pending
                </v-chip>
              </div>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <Icon icon="material-symbols:credit-card" :width="20" :height="20" class="mr-3 text-grey-darken-1" />
                  <span class="text-body-1">Subscription</span>
                </div>
                <v-chip :color="subscriptionStatusColor" size="small" variant="flat">
                  <Icon :icon="subscriptionIcon" :width="14" :height="14" class="mr-1" />
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
import { Icon } from '@iconify/vue'

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
  background-color: #fafafa;
  min-height: 100vh;
}

.welcome-section {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
  margin-bottom: 0;
}

.welcome-header {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 150px;
  border-radius: 16px !important;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  pointer-events: none;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

.stat-icon {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Card hover effects */
.v-card {
  transition: all 0.3s ease;
  border-radius: 16px !important;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.v-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
  transform: translateY(-1px);
}

/* Action buttons */
.action-btn {
  border-radius: 12px !important;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

/* Chart placeholder */
.chart-placeholder {
  padding: 40px;
  border-radius: 12px;
  background: rgba(25, 118, 210, 0.02);
  border: 2px dashed rgba(25, 118, 210, 0.2);
}

/* List hover effects */
.hover-item {
  transition: all 0.2s ease;
  border-radius: 12px !important;
  margin-bottom: 4px;
}

.hover-item:hover {
  background: rgba(25, 118, 210, 0.04) !important;
  transform: translateX(4px);
}

/* Timeline styling */
.v-timeline {
  padding-top: 0;
}

/* Quick action buttons */
.v-btn {
  text-transform: none;
  border-radius: 8px;
  font-weight: 500;
}

/* Typography improvements */
.text-h5 {
  letter-spacing: 0.5px;
}

.text-caption {
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .welcome-header {
    padding: 16px;
  }
  
  .stat-card {
    height: 110px;
  }
}

/* Dark theme adjustments */
.v-theme--dark .dashboard {
  background-color: #121212;
}

.v-theme--dark .welcome-section {
  background: linear-gradient(135deg, #0D47A1 0%, #1565C0 100%);
}

.v-theme--dark .chart-container {
  border-color: #424242;
  background: #1e1e1e;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.v-theme--dark .v-card {
  background-color: #1e1e1e;
}
</style>