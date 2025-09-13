<template>
  <div class="payroll-dashboard">
    <!-- Enhanced Header -->
    <div class="enhanced-header mb-spacing-xl">
      <v-container fluid class="pa-spacing-lg">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              <v-icon size="32" class="mr-3 text-primary">mdi-cash-multiple</v-icon>
              Payroll Dashboard
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis ma-0">
              Overview of payroll metrics and activities
            </p>
          </div>
          <div class="d-flex gap-3">
            <v-btn
              color="success"
              size="large"
              elevation="2"
              @click="processPayroll"
              :loading="processing"
              class="enhanced-btn"
            >
              <template #prepend>
                <v-icon>mdi-play</v-icon>
              </template>
              Process Payroll
            </v-btn>
            <v-btn
              variant="outlined"
              color="primary"
              size="large"
              @click="exportPayroll"
              class="enhanced-btn"
            >
              <template #prepend>
                <v-icon>mdi-download</v-icon>
              </template>
              Export Report
            </v-btn>
          </div>
        </div>
      </v-container>
    </div>

    <v-container fluid class="pa-spacing-lg">
      <!-- Summary Cards -->
      <v-row class="mb-spacing-lg">
        <v-col cols="12" md="3" v-for="card in summaryCards" :key="card.title">
          <v-card 
            class="stats-card"
            :class="`stats-${card.color}`"
            elevation="4"
          >
            <v-card-text class="pa-spacing-lg">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <p class="text-subtitle-2 mb-2 opacity-90">{{ card.title }}</p>
                  <h2 class="text-h4 font-weight-bold mb-2">{{ card.value }}</h2>
                  <div class="d-flex align-center">
                    <v-icon 
                      size="small" 
                      :class="card.trend > 0 ? 'text-white' : 'text-red-lighten-1'"
                      class="mr-1"
                    >
                      {{ card.trend > 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                    </v-icon>
                    <span class="text-caption opacity-90">
                      {{ Math.abs(card.trend) }}% from last month
                    </span>
                  </div>
                </div>
                <v-icon size="48" class="stats-icon">{{ card.icon }}</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Charts Row -->
      <v-row class="mb-spacing-lg">
        <v-col cols="12" md="8">
          <v-card class="enhanced-card" elevation="4">
            <v-card-title class="d-flex justify-space-between align-center pa-spacing-lg">
              <div class="d-flex align-center">
                <v-icon class="mr-3" color="primary">mdi-chart-line</v-icon>
                <span class="text-h6 font-weight-bold">Payroll Trends</span>
              </div>
              <v-btn-toggle v-model="chartPeriod" variant="outlined" density="compact">
                <v-btn value="week" size="small">Week</v-btn>
                <v-btn value="month" size="small">Month</v-btn>
                <v-btn value="year" size="small">Year</v-btn>
              </v-btn-toggle>
            </v-card-title>
            <v-card-text class="pa-spacing-lg">
              <div style="position: relative; height: 300px;">
                <canvas ref="payrollChart"></canvas>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="enhanced-card" elevation="4" style="height: 100%;">
            <v-card-title class="pa-spacing-lg">
              <div class="d-flex align-center">
                <v-icon class="mr-3" color="primary">mdi-chart-donut</v-icon>
                <span class="text-h6 font-weight-bold">Department Distribution</span>
              </div>
            </v-card-title>
            <v-card-text class="pa-spacing-lg">
              <div style="position: relative; height: 250px;">
                <canvas ref="departmentChart"></canvas>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recent Activities and Upcoming Payrolls -->
      <v-row class="mb-spacing-lg">
        <v-col cols="12" md="6">
          <v-card class="enhanced-card" elevation="4">
            <v-card-title class="d-flex justify-space-between align-center pa-spacing-lg">
              <div class="d-flex align-center">
                <v-icon class="mr-3" color="primary">mdi-timeline-clock</v-icon>
                <span class="text-h6 font-weight-bold">Recent Payroll Activities</span>
              </div>
              <v-btn variant="text" size="small" color="primary">View All</v-btn>
            </v-card-title>
            <v-divider />
            <v-list class="pa-0">
              <v-list-item 
                v-for="activity in recentActivities" 
                :key="activity.id"
                class="px-spacing-lg py-spacing-md"
              >
                <template #prepend>
                  <v-avatar :color="activity.color" size="40" class="mr-spacing-md">
                    <v-icon color="white">{{ activity.icon }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">{{ activity.title }}</v-list-item-title>
                <v-list-item-subtitle class="text-medium-emphasis">{{ activity.description }}</v-list-item-subtitle>
                <template #append>
                  <v-chip 
                    size="small" 
                    :color="activity.status === 'completed' ? 'success' : 'warning'"
                    class="enhanced-chip"
                  >
                    {{ activity.status }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="enhanced-card" elevation="4">
            <v-card-title class="d-flex justify-space-between align-center pa-spacing-lg">
              <div class="d-flex align-center">
                <v-icon class="mr-3" color="primary">mdi-calendar-check</v-icon>
                <span class="text-h6 font-weight-bold">Upcoming Payrolls</span>
              </div>
              <v-btn variant="text" size="small" color="primary">Schedule</v-btn>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-spacing-lg">
              <v-timeline side="end" density="compact">
                <v-timeline-item
                  v-for="payroll in upcomingPayrolls"
                  :key="payroll.id"
                  :dot-color="payroll.color"
                  size="small"
                >
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <h4 class="font-weight-medium mb-1">{{ payroll.title }}</h4>
                      <p class="text-caption text-medium-emphasis mb-0">
                        {{ payroll.employees }} employees • QAR {{ formatNumber(payroll.amount) }}
                      </p>
                    </div>
                    <v-chip size="small" variant="outlined" color="primary">
                      {{ payroll.date }}
                    </v-chip>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Quick Actions -->
      <v-row>
        <v-col>
          <v-card class="enhanced-card" elevation="4">
            <v-card-title class="pa-spacing-lg">
              <div class="d-flex align-center">
                <v-icon class="mr-3" color="primary">mdi-lightning-bolt</v-icon>
                <span class="text-h6 font-weight-bold">Quick Actions</span>
              </div>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-spacing-lg">
              <v-row>
                <v-col cols="6" md="3" v-for="action in quickActions" :key="action.title">
                  <v-btn
                    block
                    variant="outlined"
                    :color="action.color"
                    @click="handleQuickAction(action.action)"
                    class="py-spacing-xl enhanced-btn"
                    style="height: 100px;"
                  >
                    <div class="text-center">
                      <v-icon size="32" class="mb-2">{{ action.icon }}</v-icon>
                      <div class="text-caption font-weight-medium">{{ action.title }}</div>
                    </div>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const router = useRouter()

// State
const processing = ref(false)
const chartPeriod = ref('month')

// Chart refs
const payrollChart = ref<HTMLCanvasElement>()
const departmentChart = ref<HTMLCanvasElement>()

// Chart instances
let payrollChartInstance: Chart | null = null
let departmentChartInstance: Chart | null = null

// Data for dashboard
const summaryCards = ref([
  {
    title: 'Total Employees',
    value: '245',
    trend: 5.2,
    color: 'primary',
    icon: 'mdi-account-group'
  },
  {
    title: 'Total Payroll',
    value: 'QAR 458K',
    trend: 8.1,
    color: 'success',
    icon: 'mdi-cash-multiple'
  },
  {
    title: 'Avg Salary',
    value: 'QAR 1,871',
    trend: 3.7,
    color: 'info',
    icon: 'mdi-calculator'
  },
  {
    title: 'Pending',
    value: '18',
    trend: -12.3,
    color: 'warning',
    icon: 'mdi-clock-alert'
  }
])

const recentActivities = ref([
  {
    id: 1,
    title: 'March Payroll Processed',
    description: '245 employees paid successfully',
    icon: 'mdi-check-circle',
    color: 'success',
    status: 'completed'
  },
  {
    id: 2,
    title: 'Salary Adjustments',
    description: '12 salary increases approved',
    icon: 'mdi-trending-up',
    color: 'primary',
    status: 'completed'
  },
  {
    id: 3,
    title: 'Advance Payments',
    description: '8 advance requests processed',
    icon: 'mdi-hand-coin',
    color: 'warning',
    status: 'pending'
  },
  {
    id: 4,
    title: 'Overtime Calculations',
    description: 'Q1 overtime hours calculated',
    icon: 'mdi-clock-plus',
    color: 'info',
    status: 'completed'
  }
])

const upcomingPayrolls = ref([
  {
    id: 1,
    title: 'April Payroll',
    date: 'Apr 30',
    employees: 245,
    amount: 462000,
    color: 'primary'
  },
  {
    id: 2,
    title: 'Quarterly Bonus',
    date: 'May 15',
    employees: 180,
    amount: 125000,
    color: 'warning'
  },
  {
    id: 3,
    title: 'Mid-Year Review',
    date: 'Jun 30',
    employees: 220,
    amount: 480000,
    color: 'success'
  }
])

const quickActions = ref([
  {
    title: 'Salary Management',
    icon: 'mdi-cash',
    color: 'primary',
    action: 'salary'
  },
  {
    title: 'Advance Loans',
    icon: 'mdi-hand-coin',
    color: 'warning',
    action: 'advances'
  },
  {
    title: 'Generate Payslips',
    icon: 'mdi-file-document',
    color: 'success',
    action: 'payslips'
  },
  {
    title: 'Transaction History',
    icon: 'mdi-history',
    color: 'info',
    action: 'history'
  },
  {
    title: 'Employee Reports',
    icon: 'mdi-chart-line',
    color: 'purple',
    action: 'reports'
  },
  {
    title: 'Settings',
    icon: 'mdi-cog',
    color: 'grey',
    action: 'settings'
  },
  {
    title: 'Tax Calculator',
    icon: 'mdi-calculator',
    color: 'orange',
    action: 'tax'
  },
  {
    title: 'Export Data',
    icon: 'mdi-download',
    color: 'blue',
    action: 'export'
  }
])

// Methods
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-QA').format(value)
}

const processPayroll = async () => {
  if (!confirm('Are you sure you want to process payroll? This action cannot be undone.')) {
    return
  }
  
  processing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 3000))
    alert('Payroll processed successfully!')
  } catch (error) {
    console.error('Error processing payroll:', error)
    alert('Failed to process payroll. Please try again.')
  } finally {
    processing.value = false
  }
}

const exportPayroll = () => {
  try {
    const data = 'Employee ID,Name,Department,Basic Salary,Net Pay\n' +
                 'NP001,Ahmed Hassan,Construction,8500,10150\n' +
                 'NP002,Sarah Ahmed,Administration,6500,7650'
    
    const blob = new Blob([data], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'payroll_report.csv'
    link.click()
    
    alert('Payroll data exported successfully!')
  } catch (error) {
    console.error('Export failed:', error)
    alert('Failed to export data.')
  }
}

const handleQuickAction = (action: string) => {
  switch (action) {
    case 'salary':
      router.push('/payroll/salary-management')
      break
    case 'advances':
      router.push('/payroll/advance-loans')
      break
    case 'payslips':
      router.push('/payroll/payslip-generation')
      break
    case 'history':
      router.push('/payroll/transaction-history')
      break
    case 'reports':
      alert('Employee Reports feature coming soon!')
      break
    case 'settings':
      alert('Payroll Settings feature coming soon!')
      break
    case 'tax':
      alert('Tax Calculator feature coming soon!')
      break
    case 'export':
      exportPayroll()
      break
    default:
      console.log('Unknown action:', action)
  }
}

const initializeCharts = async () => {
  await nextTick()
  
  if (payrollChart.value) {
    const ctx = payrollChart.value.getContext('2d')
    if (ctx) {
      // Destroy existing chart if it exists
      if (payrollChartInstance) {
        payrollChartInstance.destroy()
      }
      
      payrollChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Total Payroll',
              data: [420000, 435000, 458000, 462000, 478000, 485000],
              borderColor: '#1976d2',
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Net Pay',
              data: [378000, 391500, 412200, 415800, 430200, 436500],
              borderColor: '#388e3c',
              backgroundColor: 'rgba(56, 142, 60, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: function(value) {
                  return 'QAR ' + (Number(value) / 1000).toFixed(0) + 'K'
                }
              }
            }
          }
        }
      })
    }
  }

  if (departmentChart.value) {
    const ctx = departmentChart.value.getContext('2d')
    if (ctx) {
      // Destroy existing chart if it exists
      if (departmentChartInstance) {
        departmentChartInstance.destroy()
      }
      
      departmentChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Construction', 'Administration', 'HR', 'Finance', 'Safety'],
          datasets: [{
            data: [120, 45, 25, 30, 25],
            backgroundColor: [
              '#ff9800',
              '#2196f3',
              '#9c27b0',
              '#4caf50',
              '#f44336'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 15
              }
            }
          }
        }
      })
    }
  }
}

onMounted(() => {
  initializeCharts()
})
</script>

<style scoped>
.payroll-dashboard {
  background-color: var(--background-color);
  min-height: 100vh;
}

.stats-card {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  position: relative;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(30px, -30px);
}

.stats-primary {
  background: linear-gradient(135deg, #1976d2, #1565c0) !important;
}

.stats-success {
  background: linear-gradient(135deg, #388e3c, #2e7d32) !important;
}

.stats-info {
  background: linear-gradient(135deg, #0288d1, #0277bd) !important;
}

.stats-warning {
  background: linear-gradient(135deg, #f57c00, #ef6c00) !important;
}

.stats-icon {
  opacity: 0.7;
}

.enhanced-card {
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
}

.enhanced-btn {
  border-radius: var(--border-radius-md);
  text-transform: none;
  font-weight: 500;
}

.enhanced-chip {
  border-radius: var(--border-radius-sm);
}

/* Chart containers */
canvas {
  max-height: 100% !important;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .stats-card {
    margin-bottom: var(--spacing-md);
  }
}
</style>
