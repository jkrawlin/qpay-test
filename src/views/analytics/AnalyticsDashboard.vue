<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">
          <v-icon left>mdi-chart-box</v-icon>
          Reports & Analytics
        </h1>
      </v-col>
    </v-row>

    <!-- Quick Stats -->
    <v-row>
      <v-col v-for="stat in quickStats" :key="stat.title" cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption grey--text">{{ stat.title }}</p>
                <p class="text-h5 font-weight-bold">{{ stat.value }}</p>
                <p class="text-caption" :class="stat.trend > 0 ? 'success--text' : 'error--text'">
                  <v-icon small>{{ stat.trend > 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}</v-icon>
                  {{ Math.abs(stat.trend) }}% from last month
                </p>
              </div>
              <v-avatar :color="stat.color" size="40">
                <v-icon color="white">{{ stat.icon }}</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Report Cards -->
    <v-row class="mt-4">
      <v-col cols="12" md="6" lg="4" v-for="report in availableReports" :key="report.id">
        <v-card hover @click="generateReport(report.type)">
          <v-card-title>
            <v-icon left :color="report.color">{{ report.icon }}</v-icon>
            {{ report.title }}
          </v-card-title>
          <v-card-text>
            {{ report.description }}
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text>
              Generate Report
              <v-icon right>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts Section -->
    <v-row class="mt-4">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            Monthly Payroll Trend
            <v-spacer></v-spacer>
            <v-btn-toggle v-model="chartPeriod" mandatory dense>
              <v-btn value="3">3M</v-btn>
              <v-btn value="6">6M</v-btn>
              <v-btn value="12">1Y</v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text>
            <canvas ref="payrollChart"></canvas>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Department Distribution</v-card-title>
          <v-card-text>
            <canvas ref="departmentChart"></canvas>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Document Expiry Alerts -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon left color="warning">mdi-alert</v-icon>
            Document Expiry Alerts
            <v-spacer></v-spacer>
            <v-btn color="warning" @click="refreshAlerts">
              <v-icon left>mdi-refresh</v-icon>
              Refresh
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="alertHeaders"
              :items="expiryAlerts"
              :loading="loadingAlerts"
              class="elevation-1"
            >
              <template v-slot:item.priority="{ item }">
                <v-chip
                  :color="getPriorityColor(item.priority)"
                  small
                  dark
                >
                  {{ item.priority.toUpperCase() }}
                </v-chip>
              </template>

              <template v-slot:item.daysUntilExpiry="{ item }">
                <span :class="getDaysColor(item.daysUntilExpiry)">
                  {{ item.daysUntilExpiry }} days
                </span>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  small
                  color="primary"
                  @click="viewEmployeeDocuments(item.employeeId)"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  color="success"
                  @click="markAlertResolved(item.id)"
                >
                  <v-icon>mdi-check</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Report Generation Dialog -->
    <v-dialog v-model="showReportDialog" max-width="600">
      <v-card>
        <v-card-title>
          Generate {{ selectedReport?.title }}
          <v-spacer></v-spacer>
          <v-btn icon @click="showReportDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="reportForm" v-model="validReportForm">
            <!-- Date Range Selection -->
            <v-row v-if="selectedReport?.requiresDateRange">
              <v-col cols="6">
                <v-text-field
                  v-model="reportParams.startDate"
                  label="Start Date"
                  type="date"
                  :rules="[v => !!v || 'Start date is required']"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="reportParams.endDate"
                  label="End Date"
                  type="date"
                  :rules="[v => !!v || 'End date is required']"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Month/Year Selection -->
            <v-row v-if="selectedReport?.requiresMonth">
              <v-col cols="6">
                <v-select
                  v-model="reportParams.month"
                  :items="months"
                  label="Month"
                  :rules="[v => !!v || 'Month is required']"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="reportParams.year"
                  :items="years"
                  label="Year"
                  :rules="[v => !!v || 'Year is required']"
                ></v-select>
              </v-col>
            </v-row>

            <!-- Department Filter -->
            <v-select
              v-if="selectedReport?.allowsDepartmentFilter"
              v-model="reportParams.departments"
              :items="departments"
              label="Departments (Optional)"
              multiple
              chips
              clearable
            ></v-select>

            <!-- Export Format -->
            <v-radio-group v-model="reportParams.format" row>
              <v-radio label="PDF" value="pdf"></v-radio>
              <v-radio label="Excel" value="excel"></v-radio>
              <v-radio label="CSV" value="csv"></v-radio>
            </v-radio-group>

            <!-- Email Options -->
            <v-checkbox
              v-model="reportParams.emailReport"
              label="Email report to stakeholders"
            ></v-checkbox>

            <v-text-field
              v-if="reportParams.emailReport"
              v-model="reportParams.emailRecipients"
              label="Additional Email Recipients (comma separated)"
              placeholder="email1@example.com, email2@example.com"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showReportDialog = false">Cancel</v-btn>
          <v-btn 
            color="primary" 
            :loading="generatingReport"
            :disabled="!validReportForm"
            @click="processReportGeneration"
          >
            Generate Report
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { reportService } from '@/services/reportService'
import { complianceNotificationService } from '@/services/notificationService'
import { useRouter } from 'vue-router'
import { useNotification } from '@/composables/useNotification'

Chart.register(...registerables)

const router = useRouter()
const { showSuccess, showError } = useNotification()

// Data
const chartPeriod = ref('6')
const payrollChart = ref<HTMLCanvasElement>()
const departmentChart = ref<HTMLCanvasElement>()
const expiryAlerts = ref<any[]>([])
const loadingAlerts = ref(false)

// Report Generation
const showReportDialog = ref(false)
const selectedReport = ref<any>(null)
const validReportForm = ref(false)
const generatingReport = ref(false)

const reportParams = ref({
  startDate: '',
  endDate: '',
  month: '',
  year: new Date().getFullYear(),
  departments: [],
  format: 'pdf',
  emailReport: false,
  emailRecipients: ''
})

// Chart instances
let payrollChartInstance: Chart | null = null
let departmentChartInstance: Chart | null = null

const quickStats = computed(() => [
  {
    title: 'Total Payroll This Month',
    value: 'QAR 450,000',
    trend: 5.2,
    color: 'primary',
    icon: 'mdi-cash-multiple'
  },
  {
    title: 'Active Employees',
    value: '156',
    trend: 2.1,
    color: 'success',
    icon: 'mdi-account-group'
  },
  {
    title: 'Documents Expiring',
    value: expiryAlerts.value.filter(a => a.daysUntilExpiry <= 30).length.toString(),
    trend: -15,
    color: 'warning',
    icon: 'mdi-alert'
  },
  {
    title: 'Pending Payments',
    value: '8',
    trend: -25,
    color: 'info',
    icon: 'mdi-clock-outline'
  }
])

const availableReports = [
  {
    id: 'payroll-summary',
    type: 'payroll-summary',
    title: 'Monthly Payroll Summary',
    description: 'Comprehensive breakdown of monthly salaries, allowances, and deductions',
    icon: 'mdi-file-chart',
    color: 'primary',
    requiresMonth: true,
    allowsDepartmentFilter: true
  },
  {
    id: 'employee-cost',
    type: 'employee-cost',
    title: 'Employee Cost Analysis',
    description: 'Detailed cost analysis per employee including all benefits',
    icon: 'mdi-account-cash',
    color: 'success',
    requiresDateRange: true,
    allowsDepartmentFilter: true
  },
  {
    id: 'document-expiry',
    type: 'document-expiry',
    title: 'Document Expiry Report',
    description: 'List of expiring Qatar IDs, passports, and visas',
    icon: 'mdi-file-alert',
    color: 'warning',
    requiresDateRange: false
  },
  {
    id: 'cash-flow',
    type: 'cash-flow',
    title: 'Cash Flow Statement',
    description: 'Income and expense tracking with categorization',
    icon: 'mdi-cash-sync',
    color: 'info',
    requiresDateRange: true
  },
  {
    id: 'customer-payment',
    type: 'customer-payment',
    title: 'Customer Payment Tracking',
    description: 'Outstanding invoices and payment history',
    icon: 'mdi-account-cash-outline',
    color: 'purple',
    requiresDateRange: true
  },
  {
    id: 'ministry-compliance',
    type: 'ministry-compliance',
    title: 'Ministry Compliance Report',
    description: 'Qatar labor law compliance and ministry requirements',
    icon: 'mdi-shield-check',
    color: 'teal',
    requiresDateRange: false
  }
]

const alertHeaders = [
  { text: 'Employee', value: 'employeeName' },
  { text: 'Document Type', value: 'documentType' },
  { text: 'Document Number', value: 'documentNumber' },
  { text: 'Expiry Date', value: 'expiryDate' },
  { text: 'Days Until Expiry', value: 'daysUntilExpiry' },
  { text: 'Priority', value: 'priority' },
  { text: 'Actions', value: 'actions', sortable: false }
]

const months = [
  { text: 'January', value: '01' },
  { text: 'February', value: '02' },
  { text: 'March', value: '03' },
  { text: 'April', value: '04' },
  { text: 'May', value: '05' },
  { text: 'June', value: '06' },
  { text: 'July', value: '07' },
  { text: 'August', value: '08' },
  { text: 'September', value: '09' },
  { text: 'October', value: '10' },
  { text: 'November', value: '11' },
  { text: 'December', value: '12' }
]

const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i)

const departments = [
  'Operations',
  'Administration',
  'Sales',
  'IT',
  'HR',
  'Finance',
  'Marketing'
]

// Mock data for demonstration
const generateMockAlerts = () => {
  return [
    {
      id: '1',
      employeeId: 'emp001',
      employeeName: 'Ahmed Al-Thani',
      documentType: 'Qatar ID',
      documentNumber: '12345678901',
      expiryDate: '2024-12-15',
      daysUntilExpiry: 45,
      priority: 'medium'
    },
    {
      id: '2',
      employeeId: 'emp002',
      employeeName: 'Sarah Mohamed',
      documentType: 'Passport',
      documentNumber: 'P1234567',
      expiryDate: '2024-10-20',
      daysUntilExpiry: 15,
      priority: 'high'
    }
  ]
}

// Methods
const generateReport = (type: string) => {
  selectedReport.value = availableReports.find(r => r.type === type)
  
  // Set default values
  const now = new Date()
  reportParams.value = {
    startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0],
    month: String(now.getMonth() + 1).padStart(2, '0'),
    year: now.getFullYear(),
    departments: [],
    format: 'pdf',
    emailReport: false,
    emailRecipients: ''
  }
  
  showReportDialog.value = true
}

const processReportGeneration = async () => {
  generatingReport.value = true
  
  try {
    // Mock report generation - in real app would call actual services
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    showSuccess(`${selectedReport.value?.title} generated successfully!`)
    showReportDialog.value = false
  } catch (error) {
    showError('Failed to generate report')
    console.error(error)
  } finally {
    generatingReport.value = false
  }
}

const refreshAlerts = async () => {
  loadingAlerts.value = true
  try {
    // Mock alerts - in real app would call actual service
    await new Promise(resolve => setTimeout(resolve, 1000))
    expiryAlerts.value = generateMockAlerts()
  } catch (error) {
    showError('Failed to load alerts')
  } finally {
    loadingAlerts.value = false
  }
}

const markAlertResolved = async (alertId: string) => {
  try {
    // Mock resolution - in real app would call actual service
    expiryAlerts.value = expiryAlerts.value.filter(alert => alert.id !== alertId)
    showSuccess('Alert marked as resolved')
  } catch (error) {
    showError('Failed to mark alert as resolved')
  }
}

const viewEmployeeDocuments = (employeeId: string) => {
  router.push(`/employees/documents?employee=${employeeId}`)
}

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success'
  }
  return colors[priority] || 'grey'
}

const getDaysColor = (days: number) => {
  if (days <= 0) return 'error--text'
  if (days <= 7) return 'error--text'
  if (days <= 30) return 'warning--text'
  return 'success--text'
}

const initializeCharts = () => {
  // Payroll Trend Chart
  if (payrollChart.value) {
    payrollChartInstance = new Chart(payrollChart.value, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Total Payroll (QAR)',
          data: [420000, 435000, 425000, 440000, 445000, 450000],
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'QAR ' + value.toLocaleString()
              }
            }
          }
        }
      }
    })
  }

  // Department Distribution Chart
  if (departmentChart.value) {
    departmentChartInstance = new Chart(departmentChart.value, {
      type: 'doughnut',
      data: {
        labels: ['Operations', 'Admin', 'Sales', 'IT', 'HR'],
        datasets: [{
          data: [45, 20, 15, 12, 8],
          backgroundColor: [
            '#1976D2',
            '#388E3C',
            '#F57C00',
            '#7B1FA2',
            '#0097A7'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    })
  }
}

const destroyCharts = () => {
  if (payrollChartInstance) {
    payrollChartInstance.destroy()
    payrollChartInstance = null
  }
  if (departmentChartInstance) {
    departmentChartInstance.destroy()
    departmentChartInstance = null
  }
}

onMounted(() => {
  initializeCharts()
  refreshAlerts()
})

onUnmounted(() => {
  destroyCharts()
})
</script>

<style scoped>
.text-h4 {
  font-weight: bold;
}
</style>
