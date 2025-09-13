<template>
  <div class="payslip-generation">
    <!-- Enhanced Header -->
    <div class="enhanced-header mb-spacing-xl">
      <v-container fluid class="pa-spacing-lg">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              <v-icon size="32" class="mr-3 text-primary">mdi-file-document</v-icon>
              Payslip Generation
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis ma-0">
              Generate, manage and distribute employee payslips with customizable templates
            </p>
          </div>
          <div class="d-flex gap-3">
            <v-btn
              color="success"
              size="large"
              elevation="2"
              @click="openBulkGenerationDialog"
              class="enhanced-btn"
            >
              <template #prepend>
                <v-icon>mdi-file-multiple</v-icon>
              </template>
              Bulk Generate
            </v-btn>
            <v-btn
              variant="outlined"
              color="primary"
              size="large"
              @click="openTemplateManager"
              class="enhanced-btn"
            >
              <template #prepend>
                <v-icon>mdi-file-edit</v-icon>
              </template>
              Manage Templates
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
            <v-card-title class="pa-spacing-lg">
              <v-icon class="mr-3" color="primary">mdi-chart-timeline</v-icon>
              Payslip Generation Trends
            </v-card-title>
            <v-card-text class="pa-spacing-lg">
              <canvas ref="generationTrendsChart" height="100"></canvas>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="enhanced-card" elevation="4">
            <v-card-title class="pa-spacing-lg">
              <v-icon class="mr-3" color="success">mdi-chart-donut</v-icon>
              Distribution Methods
            </v-card-title>
            <v-card-text class="pa-spacing-lg">
              <canvas ref="distributionChart" height="100"></canvas>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Quick Actions -->
      <v-card class="enhanced-card mb-spacing-lg" elevation="2">
        <v-card-title class="pa-spacing-lg">
          <v-icon class="mr-3" color="primary">mdi-lightning-bolt</v-icon>
          Quick Actions
        </v-card-title>
        <v-card-text class="pa-spacing-lg">
          <v-row>
            <v-col cols="12" md="3" v-for="action in quickActions" :key="action.title">
              <v-card 
                class="quick-action-card"
                elevation="1"
                @click="action.action"
                :color="action.color"
                variant="tonal"
              >
                <v-card-text class="text-center pa-spacing-md">
                  <v-icon size="32" class="mb-2" :color="action.color">{{ action.icon }}</v-icon>
                  <h4 class="mb-1">{{ action.title }}</h4>
                  <p class="text-caption mb-0">{{ action.description }}</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Filters -->
      <v-card class="enhanced-card mb-spacing-lg" elevation="2">
        <v-card-text class="pa-spacing-lg">
          <v-row align="center">
            <v-col cols="12" md="3">
              <v-text-field
                v-model="searchQuery"
                label="Search employees..."
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="selectedDepartment"
                :items="departments"
                label="Department"
                variant="outlined"
                density="compact"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="selectedStatus"
                :items="statuses"
                label="Status"
                variant="outlined"
                density="compact"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="selectedPeriod"
                :items="periods"
                label="Pay Period"
                variant="outlined"
                density="compact"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" md="3">
              <div class="d-flex gap-2">
                <v-btn
                  color="primary"
                  variant="outlined"
                  @click="resetFilters"
                  class="enhanced-btn"
                >
                  Reset
                </v-btn>
                <v-btn
                  color="warning"
                  @click="previewSelected"
                  class="enhanced-btn"
                  :disabled="selectedPayslips.length === 0"
                >
                  Preview Selected
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Payslips Table -->
      <v-card class="enhanced-card" elevation="4">
        <v-card-title class="d-flex justify-space-between align-center pa-spacing-lg">
          <div class="d-flex align-center">
            <v-icon class="mr-3" color="primary">mdi-table</v-icon>
            <span class="text-h6 font-weight-bold">Employee Payslips</span>
            <v-chip class="ml-3" size="small" color="primary" variant="tonal">
              {{ filteredEmployees.length }} employees
            </v-chip>
          </div>
          <div class="d-flex gap-2">
            <v-btn
              variant="text"
              size="small"
              @click="refreshData"
              :loading="loading"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              @click="selectAll"
            >
              <v-icon>mdi-select-all</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        <v-divider />
        
        <v-data-table
          v-model="selectedPayslips"
          v-model:expanded="expanded"
          :headers="headers"
          :items="filteredEmployees"
          :loading="loading"
          item-value="id"
          show-select
          show-expand
          class="elevation-0"
          density="compact"
        >
          <!-- Employee Info -->
          <template #item.employee="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="40" class="mr-3" :color="getAvatarColor(item.name)">
                <span class="text-white font-weight-bold">
                  {{ getInitials(item.name) }}
                </span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.employeeId }}</div>
              </div>
            </div>
          </template>

          <!-- Department -->
          <template #item.department="{ item }">
            <v-chip
              :color="getDepartmentColor(item.department)"
              size="small"
              variant="tonal"
            >
              {{ item.department }}
            </v-chip>
          </template>

          <!-- Salary -->
          <template #item.salary="{ item }">
            <div class="font-weight-bold">QAR {{ formatNumber(item.grossSalary) }}</div>
            <div class="text-caption text-medium-emphasis">
              Net: QAR {{ formatNumber(item.netSalary) }}
            </div>
          </template>

          <!-- Last Generated -->
          <template #item.lastGenerated="{ item }">
            <div v-if="item.lastGenerated">
              <div class="font-weight-medium">{{ formatDate(item.lastGenerated) }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.lastPeriod }}</div>
            </div>
            <v-chip v-else color="grey" size="small" variant="tonal">
              Never Generated
            </v-chip>
          </template>

          <!-- Status -->
          <template #item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="tonal"
            >
              <v-icon start size="small">{{ getStatusIcon(item.status) }}</v-icon>
              {{ item.status }}
            </v-chip>
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-btn
                icon="mdi-file-plus"
                size="small"
                variant="text"
                color="success"
                @click="generatePayslip(item)"
              />
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                color="primary"
                @click="previewPayslip(item)"
                :disabled="!item.lastGenerated"
              />
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    size="small"
                    variant="text"
                    v-bind="props"
                  />
                </template>
                <v-list density="compact">
                  <v-list-item @click="downloadPayslip(item)">
                    <v-list-item-title>Download PDF</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="emailPayslip(item)">
                    <v-list-item-title>Send Email</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="viewHistory(item)">
                    <v-list-item-title>View History</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>

          <!-- Expanded Details -->
          <template #expanded-row="{ columns, item }">
            <tr>
              <td :colspan="columns.length" class="pa-4">
                <v-card variant="outlined" class="pa-4">
                  <h4 class="mb-3">Payslip Details</h4>
                  <v-row>
                    <v-col cols="12" md="6">
                      <h5 class="mb-2">Earnings</h5>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Basic Salary:</span>
                        <span class="font-weight-bold">QAR {{ formatNumber(item.basicSalary) }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Housing Allowance:</span>
                        <span>QAR {{ formatNumber(item.housingAllowance) }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Transport Allowance:</span>
                        <span>QAR {{ formatNumber(item.transportAllowance) }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Overtime:</span>
                        <span>QAR {{ formatNumber(item.overtime) }}</span>
                      </div>
                      <v-divider class="my-2" />
                      <div class="d-flex justify-space-between font-weight-bold">
                        <span>Gross Salary:</span>
                        <span class="text-success">QAR {{ formatNumber(item.grossSalary) }}</span>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <h5 class="mb-2">Deductions</h5>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Loan Deduction:</span>
                        <span class="text-error">-QAR {{ formatNumber(item.loanDeduction) }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Advance Deduction:</span>
                        <span class="text-error">-QAR {{ formatNumber(item.advanceDeduction) }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Other Deductions:</span>
                        <span class="text-error">-QAR {{ formatNumber(item.otherDeductions) }}</span>
                      </div>
                      <v-divider class="my-2" />
                      <div class="d-flex justify-space-between font-weight-bold">
                        <span>Net Salary:</span>
                        <span class="text-primary">QAR {{ formatNumber(item.netSalary) }}</span>
                      </div>
                    </v-col>
                  </v-row>
                </v-card>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card>
    </v-container>

    <!-- Bulk Generation Dialog -->
    <v-dialog v-model="showBulkDialog" max-width="800px" scrollable>
      <v-card>
        <v-card-title class="bg-success text-white">
          <v-icon class="mr-2">mdi-file-multiple</v-icon>
          Bulk Payslip Generation
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form ref="bulkForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="bulkData.department"
                  :items="departments"
                  label="Department"
                  variant="outlined"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="bulkData.period"
                  :items="periods"
                  label="Pay Period"
                  variant="outlined"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="bulkData.startDate"
                  label="Start Date"
                  type="date"
                  variant="outlined"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="bulkData.endDate"
                  label="End Date"
                  type="date"
                  variant="outlined"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="bulkData.template"
                  :items="templates"
                  label="Payslip Template"
                  variant="outlined"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  v-model="bulkData.sendEmail"
                  label="Send email notifications to employees"
                />
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  v-model="bulkData.saveToArchive"
                  label="Save to payslip archive"
                />
              </v-col>
            </v-row>
            
            <v-alert 
              v-if="bulkData.department"
              type="info" 
              variant="tonal"
              class="mt-4"
            >
              {{ getSelectedEmployeesCount() }} employees selected for payslip generation
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn variant="outlined" @click="showBulkDialog = false">
            Cancel
          </v-btn>
          <v-btn color="success" @click="processBulkGeneration">
            Generate Payslips
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Payslip Preview Dialog -->
    <v-dialog v-model="showPreviewDialog" max-width="900px" scrollable>
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon class="mr-2">mdi-eye</v-icon>
          Payslip Preview
        </v-card-title>
        
        <v-card-text v-if="previewEmployee" class="pa-6">
          <!-- Payslip Preview Content -->
          <div class="payslip-preview">
            <div class="text-center mb-4">
              <h2>Nipon Payroll Pro</h2>
              <h3>Employee Payslip</h3>
            </div>
            
            <v-row class="mb-4">
              <v-col cols="6">
                <strong>Employee:</strong> {{ previewEmployee.name }}<br>
                <strong>ID:</strong> {{ previewEmployee.employeeId }}<br>
                <strong>Department:</strong> {{ previewEmployee.department }}
              </v-col>
              <v-col cols="6" class="text-right">
                <strong>Pay Period:</strong> December 2024<br>
                <strong>Generated:</strong> {{ formatDate(new Date()) }}
              </v-col>
            </v-row>
            
            <!-- More payslip content here -->
          </div>
        </v-card-text>

        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn variant="outlined" @click="showPreviewDialog = false">
            Close
          </v-btn>
          <v-btn color="primary" @click="downloadPreview">
            Download PDF
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// State
const loading = ref(false)
const searchQuery = ref('')
const selectedDepartment = ref(null)
const selectedStatus = ref(null)
const selectedPeriod = ref(null)
const selectedPayslips = ref([])
const expanded = ref([])
const showBulkDialog = ref(false)
const showPreviewDialog = ref(false)
const previewEmployee = ref<any>(null)

// Chart refs
const generationTrendsChart = ref<HTMLCanvasElement | null>(null)
const distributionChart = ref<HTMLCanvasElement | null>(null)
let trendsChartInstance: Chart | null = null
let distributionChartInstance: Chart | null = null

// Form data
const bulkData = ref({
  department: null,
  period: '',
  startDate: '',
  endDate: '',
  template: '',
  sendEmail: true,
  saveToArchive: true
})

// Data
const summaryCards = ref([
  {
    title: 'Total Payslips',
    value: '2,847',
    trend: 12.3,
    color: 'primary',
    icon: 'mdi-file-document-multiple'
  },
  {
    title: 'This Month',
    value: '247',
    trend: 8.7,
    color: 'success',
    icon: 'mdi-calendar-month'
  },
  {
    title: 'Pending Generation',
    value: '23',
    trend: -15.2,
    color: 'warning',
    icon: 'mdi-clock-alert'
  },
  {
    title: 'Emails Sent',
    value: '224',
    trend: 18.4,
    color: 'info',
    icon: 'mdi-email-check'
  }
])

const quickActions = [
  {
    title: 'Current Month',
    description: 'Generate for current period',
    icon: 'mdi-calendar-today',
    color: 'primary',
    action: () => generateCurrentMonth()
  },
  {
    title: 'Mass Email',
    description: 'Send all payslips via email',
    icon: 'mdi-email-multiple',
    color: 'success',
    action: () => sendMassEmail()
  },
  {
    title: 'Archive Export',
    description: 'Export payslip archive',
    icon: 'mdi-archive',
    color: 'info',
    action: () => exportArchive()
  },
  {
    title: 'Template Editor',
    description: 'Customize payslip design',
    icon: 'mdi-file-edit',
    color: 'warning',
    action: () => openTemplateEditor()
  }
]

const departments = ['All', 'Construction', 'Administration', 'HR', 'Finance', 'Safety']
const statuses = ['All', 'Ready', 'Generated', 'Sent', 'Failed']
const periods = ['December 2024', 'November 2024', 'October 2024', 'September 2024']
const templates = ['Standard Template', 'Detailed Template', 'Compact Template', 'Custom Template']

const headers = [
  { title: 'Employee', key: 'employee', sortable: false },
  { title: 'Department', key: 'department', sortable: true },
  { title: 'Salary', key: 'salary', sortable: true },
  { title: 'Last Generated', key: 'lastGenerated', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

const employees = ref([
  {
    id: 1,
    name: 'Ahmed Hassan Ali',
    employeeId: 'NP001',
    department: 'Construction',
    basicSalary: 8500,
    housingAllowance: 2125,
    transportAllowance: 850,
    overtime: 1200,
    grossSalary: 12675,
    loanDeduction: 650,
    advanceDeduction: 500,
    otherDeductions: 125,
    netSalary: 11400,
    lastGenerated: '2024-11-30',
    lastPeriod: 'November 2024',
    status: 'Generated'
  },
  {
    id: 2,
    name: 'Sarah Ahmed Mohamed',
    employeeId: 'NP002',
    department: 'Administration',
    basicSalary: 6500,
    housingAllowance: 1625,
    transportAllowance: 650,
    overtime: 0,
    grossSalary: 8775,
    loanDeduction: 720,
    advanceDeduction: 0,
    otherDeductions: 55,
    netSalary: 8000,
    lastGenerated: '2024-11-30',
    lastPeriod: 'November 2024',
    status: 'Sent'
  },
  {
    id: 3,
    name: 'Rajesh Kumar Singh',
    employeeId: 'NP003',
    department: 'Construction',
    basicSalary: 2200,
    housingAllowance: 550,
    transportAllowance: 220,
    overtime: 800,
    grossSalary: 3770,
    loanDeduction: 450,
    advanceDeduction: 200,
    otherDeductions: 20,
    netSalary: 3100,
    lastGenerated: null,
    lastPeriod: null,
    status: 'Ready'
  }
])

const rules = {
  required: (value: any) => !!value || 'Required'
}

// Computed
const filteredEmployees = computed(() => {
  let filtered = employees.value

  if (searchQuery.value) {
    filtered = filtered.filter(emp => 
      emp.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedDepartment.value && selectedDepartment.value !== 'All') {
    filtered = filtered.filter(emp => emp.department === selectedDepartment.value)
  }

  if (selectedStatus.value && selectedStatus.value !== 'All') {
    filtered = filtered.filter(emp => emp.status === selectedStatus.value)
  }

  return filtered
})

// Methods
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-QA').format(value)
}

const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-GB')
}

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getAvatarColor = (name: string): string => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error']
  const index = name.length % colors.length
  return colors[index]
}

const getDepartmentColor = (department: string): string => {
  const colors: Record<string, string> = {
    'Construction': 'orange',
    'Administration': 'blue',
    'HR': 'purple',
    'Finance': 'green',
    'Safety': 'red'
  }
  return colors[department] || 'grey'
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Ready': 'warning',
    'Generated': 'success',
    'Sent': 'info',
    'Failed': 'error'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status: string): string => {
  const icons: Record<string, string> = {
    'Ready': 'mdi-clock',
    'Generated': 'mdi-check',
    'Sent': 'mdi-email-check',
    'Failed': 'mdi-alert'
  }
  return icons[status] || 'mdi-help'
}

const getSelectedEmployeesCount = (): number => {
  if (!bulkData.value.department || bulkData.value.department === 'All') {
    return employees.value.length
  }
  return employees.value.filter(emp => emp.department === bulkData.value.department).length
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedDepartment.value = null
  selectedStatus.value = null
  selectedPeriod.value = null
}

const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const selectAll = () => {
  selectedPayslips.value = filteredEmployees.value.map(emp => emp.id)
}

const previewSelected = () => {
  alert(`Previewing ${selectedPayslips.value.length} selected payslips`)
}

const generatePayslip = (employee: any) => {
  alert(`Generating payslip for ${employee.name}`)
}

const previewPayslip = (employee: any) => {
  previewEmployee.value = employee
  showPreviewDialog.value = true
}

const downloadPayslip = (employee: any) => {
  alert(`Downloading payslip for ${employee.name}`)
}

const emailPayslip = (employee: any) => {
  alert(`Sending payslip email to ${employee.name}`)
}

const viewHistory = (employee: any) => {
  alert(`Viewing payslip history for ${employee.name}`)
}

const openBulkGenerationDialog = () => {
  showBulkDialog.value = true
}

const processBulkGeneration = () => {
  alert('Processing bulk payslip generation...')
  showBulkDialog.value = false
}

const openTemplateManager = () => {
  alert('Template manager coming soon!')
}

const downloadPreview = () => {
  alert('Downloading preview PDF...')
}

// Quick Actions
const generateCurrentMonth = () => {
  alert('Generating payslips for current month...')
}

const sendMassEmail = () => {
  alert('Sending mass email...')
}

const exportArchive = () => {
  alert('Exporting payslip archive...')
}

const openTemplateEditor = () => {
  alert('Template editor coming soon!')
}

const initializeCharts = () => {
  nextTick(() => {
    // Generation Trends Chart
    if (generationTrendsChart.value) {
      if (trendsChartInstance) {
        trendsChartInstance.destroy()
      }
      
      trendsChartInstance = new Chart(generationTrendsChart.value, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Payslips Generated',
              data: [245, 248, 252, 247, 251, 249, 253, 250, 247, 252, 248, 247],
              borderColor: '#1976d2',
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
              tension: 0.4
            },
            {
              label: 'Emails Sent',
              data: [240, 243, 247, 242, 246, 244, 248, 245, 242, 247, 243, 224],
              borderColor: '#388e3c',
              backgroundColor: 'rgba(56, 142, 60, 0.1)',
              tension: 0.4
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
              beginAtZero: true
            }
          }
        }
      })
    }

    // Distribution Chart
    if (distributionChart.value) {
      if (distributionChartInstance) {
        distributionChartInstance.destroy()
      }
      
      distributionChartInstance = new Chart(distributionChart.value, {
        type: 'doughnut',
        data: {
          labels: ['Email', 'Portal Download', 'PDF Archive', 'Print'],
          datasets: [{
            data: [70, 20, 8, 2],
            backgroundColor: [
              '#4caf50',
              '#2196f3',
              '#ff9800',
              '#9e9e9e'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }
  })
}

onMounted(() => {
  refreshData()
  initializeCharts()
})
</script>

<style scoped>
.payslip-generation {
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

.stats-warning {
  background: linear-gradient(135deg, #f57c00, #ef6c00) !important;
}

.stats-info {
  background: linear-gradient(135deg, #0288d1, #0277bd) !important;
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

.quick-action-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: var(--border-radius-md);
}

.quick-action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.payslip-preview {
  border: 1px solid #ddd;
  padding: 24px;
  background: white;
  border-radius: 8px;
}
</style>
