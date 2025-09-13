<template>
  <div class="dashboard">
    <!-- Welcome Header -->
    <div class="welcome-section bg-gradient-primary-light">
      <v-container fluid class="pa-6">
        <v-row>
          <v-col cols="12">
            <div class="welcome-header">
              <div class="d-flex align-center justify-space-between">
                <div class="fade-in">
                  <h1 class="text-h4 font-weight-bold text-white mb-2">
                    Welcome back, {{ userDisplayName }}!
                  </h1>
                  <p class="text-body-1 text-white opacity-90 mb-0">
                    {{ welcomeMessage }}
                  </p>
                </div>
                <div class="text-right fade-in-delay-1">
                  <v-card class="enhanced-card pa-3" variant="elevated" elevation="2">
                    <div class="text-h6 font-weight-medium text-primary">{{ currentTime }}</div>
                    <div class="text-caption text-grey-darken-1">{{ currentDate }}</div>
                  </v-card>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <v-container fluid class="pa-6">
      <!-- Quick Stats Cards -->
      <v-row class="mb-8">
        <v-col cols="12" sm="6" lg="3" v-for="(stat, index) in quickStats" :key="stat.title">
          <v-card
            :color="stat.color"
            dark
            hover
            class="enhanced-card stat-card slide-up"
            :style="{ 'animation-delay': `${index * 100}ms` }"
            @click="navigateTo(stat.route)"
            elevation="4"
          >
            <v-card-text class="pa-spacing-lg">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-h4 font-weight-bold mb-2">
                    {{ stat.value }}
                  </div>
                  <div class="text-body-2 opacity-90">
                    {{ stat.title }}
                  </div>
                </div>
                <v-icon size="40" class="opacity-70">{{ stat.icon }}</v-icon>
              </div>
              <div class="mt-3 d-flex align-center">
                <v-icon 
                  size="16"
                  class="mr-2" 
                  :icon="stat.trend > 0 ? 'mdi-trending-up' : stat.trend < 0 ? 'mdi-trending-down' : 'mdi-minus'" 
                />
                <span class="text-caption">
                  {{ Math.abs(stat.trend) }}% {{ stat.trend > 0 ? 'increase' : stat.trend < 0 ? 'decrease' : 'no change' }}
                </span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Main Dashboard Content -->
      <v-row class="mt-8">
        <!-- Left Column -->
        <v-col cols="12" lg="8">
          <!-- Recent Activities -->
          <v-card class="enhanced-card mb-8" elevation="3">
            <v-card-title class="d-flex align-center justify-space-between bg-surface pa-spacing-lg">
              <span class="text-h6 font-weight-bold">Recent Activities</span>
              <v-btn 
                variant="outlined" 
                size="small" 
                class="enhanced-btn"
                :to="{ name: 'TransactionHistory' }"
                prepend-icon="mdi-eye"
              >
                View All
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-spacing-lg">
              <v-timeline density="comfortable" side="end" class="enhanced-timeline">
                <v-timeline-item
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  :dot-color="activity.color"
                  size="small"
                  class="timeline-item"
                >
                  <template #icon>
                    <v-icon size="16">{{ activity.icon }}</v-icon>
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
                    <div class="text-caption text-grey-darken-1 font-weight-medium">
                      {{ formatTime(activity.timestamp) }}
                    </div>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>

          <!-- Payroll Summary Chart -->
          <v-card class="enhanced-card" elevation="3">
            <v-card-title class="bg-surface pa-spacing-lg">
              <span class="text-h6 font-weight-bold">Monthly Payroll Summary</span>
            </v-card-title>
            <v-card-text class="pa-spacing-lg">
              <div class="chart-container enhanced-chart-placeholder" style="height: 300px;">
                <!-- Chart will be implemented with Chart.js -->
                <div class="d-flex align-center justify-center h-100 text-grey-darken-1">
                  <div class="text-center">
                    <v-icon size="64" class="mb-4 text-primary">mdi-chart-line</v-icon>
                    <div class="text-h6 font-weight-medium text-grey-darken-1">Payroll Chart Coming Soon</div>
                    <div class="text-body-2 text-grey-darken-2 mt-2">Interactive charts will be displayed here</div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column -->
        <v-col cols="12" lg="4">
          <!-- Compliance Alerts -->
          <v-card class="enhanced-card mb-8" elevation="3">
            <v-card-title class="d-flex align-center justify-space-between bg-surface pa-spacing-lg">
              <span class="text-h6 font-weight-bold">Compliance Alerts</span>
              <v-chip
                v-if="complianceAlerts.length > 0"
                :color="getAlertSeverityColor()"
                size="small"
                variant="flat"
                class="enhanced-chip font-weight-bold"
                :text="complianceAlerts.length.toString()"
              />
            </v-card-title>
            <v-card-text class="pa-spacing-lg">
              <div v-if="complianceAlerts.length === 0" class="text-center py-8">
                <v-icon size="48" color="success" class="mb-4">mdi-shield-check</v-icon>
                <div class="text-h6 font-weight-medium text-success mb-2">All Clear!</div>
                <div class="text-body-2 text-grey-darken-1">
                  All compliance items are up to date
                </div>
              </div>
              <v-list v-else density="comfortable" class="bg-transparent">
                <v-list-item
                  v-for="alert in complianceAlerts.slice(0, 5)"
                  :key="alert.id"
                  @click="navigateTo(alert.route)"
                  class="enhanced-list-item rounded-lg ma-1"
                  :class="`alert-${alert.severity}`"
                >
                  <template #prepend>
                    <v-icon :color="alert.severity" size="20">{{ alert.icon }}</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2 font-weight-medium">
                    {{ alert.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ alert.daysUntilExpiry }} days remaining
                  </v-list-item-subtitle>
                  <template #append>
                    <v-icon size="16" class="text-grey-darken-1">mdi-chevron-right</v-icon>
                  </template>
                </v-list-item>
              </v-list>
              <v-btn
                v-if="complianceAlerts.length > 5"
                variant="outlined"
                size="small"
                block
                class="enhanced-btn mt-4"
                :to="{ name: 'ExpiryAlerts' }"
                prepend-icon="mdi-alert-multiple"
              >
                View All {{ complianceAlerts.length }} Alerts
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Quick Actions -->
          <v-card class="enhanced-card mb-8" elevation="3">
            <v-card-title class="bg-surface pa-spacing-lg">
              <span class="text-h6 font-weight-bold">Quick Actions</span>
            </v-card-title>
            <v-card-text class="pa-spacing-lg">
              <v-row dense>
                <v-col cols="6" v-for="(action, index) in quickActions" :key="action.title">
                  <v-btn
                    :color="action.color"
                    variant="outlined"
                    block
                    :to="action.route"
                    class="enhanced-btn quick-action-btn text-caption pa-4"
                    height="80"
                    :class="`slide-up-delay-${index}`"
                  >
                    <div class="text-center">
                      <v-icon size="24" class="mb-2">{{ action.icon }}</v-icon>
                      <div class="font-weight-medium">{{ action.title }}</div>
                    </div>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- System Status -->
          <v-card class="enhanced-card" elevation="3">
            <v-card-title class="bg-surface pa-spacing-lg">
              <span class="text-h6 font-weight-bold">System Status</span>
            </v-card-title>
            <v-card-text class="pa-spacing-lg">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <v-icon size="20" color="success" class="mr-3">mdi-database</v-icon>
                  <span class="text-body-2 font-weight-medium">Database</span>
                </div>
                <v-chip color="success" size="small" variant="flat" class="enhanced-chip">
                  <v-icon size="12" class="mr-1">mdi-check-circle</v-icon>
                  Connected
                </v-chip>
              </div>
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <v-icon size="20" color="info" class="mr-3">mdi-backup-restore</v-icon>
                  <span class="text-body-2 font-weight-medium">Backup Status</span>
                </div>
                <v-chip color="success" size="small" variant="flat" class="enhanced-chip">
                  <v-icon size="12" class="mr-1">mdi-check-circle</v-icon>
                  Up to date
                </v-chip>
              </div>
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <v-icon size="20" color="warning" class="mr-3">mdi-bell</v-icon>
                  <span class="text-body-2 font-weight-medium">Notifications</span>
                </div>
                <v-chip color="warning" size="small" variant="flat" class="enhanced-chip">
                  <v-icon size="12" class="mr-1">mdi-alert</v-icon>
                  {{ unreadNotifications }} pending
                </v-chip>
              </div>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon size="20" :color="subscriptionStatusColor" class="mr-3">{{ subscriptionIcon }}</v-icon>
                  <span class="text-body-2 font-weight-medium">Subscription</span>
                </div>
                <v-chip :color="subscriptionStatusColor" size="small" variant="flat" class="enhanced-chip">
                  <v-icon size="12" class="mr-1">{{ subscriptionIcon }}</v-icon>
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
import { format } from 'date-fns'

const router = useRouter()

// Reactive data
const currentDate = ref('')
const currentTime = ref('')

// Computed properties
const userDisplayName = computed(() => 'Development User')

const welcomeMessage = computed(() => {
  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
  return `Good ${timeOfDay}! Here's your business overview for today.`
})

const unreadNotifications = computed(() => 5) // Mock value

const subscriptionStatus = computed(() => 'Premium')

const subscriptionStatusColor = computed(() => 'success')

const subscriptionIcon = computed(() => 'mdi-check-circle')

// Mock data - in real implementation, these would come from stores/API
const quickStats = ref([
  {
    title: 'Total Employees',
    value: '245',
    icon: 'mdi-account-group',
    color: 'primary',
    trend: 5.2,
    route: { name: 'EmployeeList' }
  },
  {
    title: 'This Month Payroll',
    value: 'QAR 182K',
    icon: 'mdi-cash',
    color: 'success',
    trend: 2.1,
    route: { name: 'PayrollDashboard' }
  },
  {
    title: 'Active Customers',
    value: '48',
    icon: 'mdi-domain',
    color: 'info',
    trend: 8.7,
    route: { name: 'CustomerList' }
  },
  {
    title: 'Compliance Alerts',
    value: '7',
    icon: 'mdi-alert',
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
    icon: 'mdi-cash',
    color: 'success',
    timestamp: new Date('2025-03-01T10:30:00')
  },
  {
    id: 2,
    title: 'New employee onboarded',
    description: 'Ahmed Hassan - Construction Worker',
    icon: 'mdi-account-plus',
    color: 'primary',
    timestamp: new Date('2025-02-28T15:45:00')
  },
  {
    id: 3,
    title: 'Qatar ID expiry alert',
    description: '5 employees require renewal',
    icon: 'mdi-alert',
    color: 'warning',
    timestamp: new Date('2025-02-28T09:15:00')
  },
  {
    id: 4,
    title: 'Invoice generated',
    description: 'Al Wakra Construction - QAR 45,600',
    icon: 'mdi-file-document',
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
    icon: 'mdi-card-account-details',
    route: { name: 'ExpiryAlerts' }
  },
  {
    id: 2,
    title: 'Passport expiry - Mohamed Khan',
    daysUntilExpiry: 45,
    severity: 'warning',
    icon: 'mdi-passport',
    route: { name: 'ExpiryAlerts' }
  },
  {
    id: 3,
    title: 'Work permit renewal - Sarah Ahmed',
    daysUntilExpiry: 30,
    severity: 'warning',
    icon: 'mdi-briefcase',
    route: { name: 'ExpiryAlerts' }
  }
])

const quickActions = computed(() => [
  {
    title: 'Add Employee',
    icon: 'mdi-account-plus',
    color: 'primary',
    route: { name: 'EmployeeCreate' }
  },
  {
    title: 'Process Payroll',
    icon: 'mdi-cash',
    color: 'success',
    route: { name: 'PayrollDashboard' }
  },
  {
    title: 'Generate Invoice',
    icon: 'mdi-file-document',
    color: 'info',
    route: { name: 'InvoiceGeneration' }
  },
  {
    title: 'Add Customer',
    icon: 'mdi-domain-plus',
    color: 'secondary',
    route: { name: 'CustomerCreate' }
  }
])

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
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.welcome-section {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  position: relative;
  overflow: hidden;
  margin-bottom: var(--spacing-xl);
}

.welcome-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.welcome-header {
  padding: var(--spacing-xl);
  position: relative;
  z-index: 1;
  color: white;
}

.time-display {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95) !important;
}

.stat-card {
  transition: all var(--transition-medium);
  cursor: pointer;
  border-radius: var(--border-radius-lg) !important;
  overflow: hidden;
  position: relative;
  height: 130px;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl) !important;
}

.stat-card:hover::before {
  opacity: 1;
}

.enhanced-timeline .timeline-item {
  transition: all var(--transition-fast);
  border-radius: var(--border-radius-md);
  margin: var(--spacing-xs) 0;
  padding: var(--spacing-sm);
}

.enhanced-timeline .timeline-item:hover {
  background: var(--color-surface-hover);
  transform: translateX(var(--spacing-xs));
}

.enhanced-chart-placeholder {
  background: linear-gradient(45deg, #f8f9fa 25%, transparent 25%), 
              linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #f8f9fa 75%), 
              linear-gradient(-45deg, transparent 75%, #f8f9fa 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  border-radius: var(--border-radius-md);
  border: 2px dashed var(--color-border);
  transition: all var(--transition-medium);
}

.enhanced-chart-placeholder:hover {
  border-color: var(--color-primary);
  background-color: rgba(var(--color-primary-rgb), 0.02);
}

.alert-error {
  border-left: 4px solid rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.05);
}

.alert-warning {
  border-left: 4px solid rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.05);
}

.quick-action-btn {
  transition: all var(--transition-medium);
  border-radius: var(--border-radius-lg) !important;
  position: relative;
  overflow: hidden;
}

.quick-action-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all var(--transition-medium);
}

.quick-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.quick-action-btn:hover::before {
  width: 100%;
  height: 100%;
}

/* Animation classes */
.slide-up-delay-0 { animation-delay: 0ms; }
.slide-up-delay-1 { animation-delay: 100ms; }
.slide-up-delay-2 { animation-delay: 200ms; }
.slide-up-delay-3 { animation-delay: 300ms; }

/* Timeline styling */
.v-timeline {
  padding-top: 0;
}

/* Button styling */
.v-btn {
  text-transform: none;
  font-weight: 500;
  border-radius: var(--border-radius-md) !important;
}

/* Card styling */
.v-card {
  transition: all var(--transition-medium);
  border-radius: var(--border-radius-lg) !important;
}

.v-card:hover {
  box-shadow: var(--shadow-lg) !important;
}

/* Typography improvements */
.text-h4, .text-h5, .text-h6 {
  letter-spacing: 0.5px;
}

.text-caption {
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .welcome-header {
    padding: var(--spacing-lg);
    text-align: center;
  }
  
  .stat-card {
    margin-bottom: var(--spacing-md);
    height: 120px;
  }
  
  .time-display {
    margin-top: var(--spacing-md);
  }
}

@media (max-width: 600px) {
  .welcome-section {
    margin-bottom: var(--spacing-lg);
  }
  
  .quick-action-btn {
    height: 70px !important;
  }
  
  .dashboard {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  }
}

/* Dark theme adjustments */
.v-theme--dark .dashboard {
  background: linear-gradient(135deg, #121212 0%, #1e1e1e 100%);
}

.v-theme--dark .welcome-section {
  background: linear-gradient(135deg, #0D47A1 0%, #1565C0 100%);
}

.v-theme--dark .enhanced-chart-placeholder {
  border-color: #424242;
  background: #1e1e1e;
  background-image: linear-gradient(45deg, #2a2a2a 25%, transparent 25%), 
                    linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #2a2a2a 75%), 
                    linear-gradient(-45deg, transparent 75%, #2a2a2a 75%);
}

.v-theme--dark .enhanced-chart-placeholder:hover {
  border-color: var(--color-primary);
  background-color: rgba(var(--color-primary-rgb), 0.1);
}

.v-theme--dark .time-display {
  background: rgba(30, 30, 30, 0.95) !important;
}

.v-theme--dark .enhanced-timeline .timeline-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>