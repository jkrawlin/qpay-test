<template>
  <div class="transaction-history">
    <!-- Enhanced Header -->
    <div class="enhanced-header mb-spacing-xl">
      <v-container fluid class="pa-spacing-lg">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              <v-icon size="32" class="mr-3 text-primary">mdi-history</v-icon>
              Transaction History
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis ma-0">
              Complete history of payroll transactions and financial movements
            </p>
          </div>
          <div class="d-flex gap-3 align-center">
            <v-btn
              color="#8B1538"
              size="large"
              elevation="2"
              @click="exportTransactions"
              class="enhanced-btn"
              variant="elevated"
            >
              <template #prepend>
                <v-icon>mdi-download</v-icon>
              </template>
              Export Report
            </v-btn>
            <v-btn
              variant="outlined"
              color="#8B1538"
              size="large"
              @click="generateReport"
              class="enhanced-btn"
            >
              <template #prepend>
                <v-icon>mdi-chart-box</v-icon>
              </template>
              Generate Report
            </v-btn>
          </div>
        </div>
      </v-container>
    </div>

    <v-container fluid class="pa-spacing-lg">
      <!-- Search Filters - Custom Design -->
      <div class="custom-filter-section mb-spacing-lg">
        <div class="filter-header">
          <h3 class="filter-title">
            <v-icon class="filter-icon">mdi-filter-variant</v-icon>
            Search & Filter Transactions
          </h3>
        </div>
        <div class="filter-content">
          <div class="filter-row">
            <div class="filter-item">
              <label class="filter-label">Search Transactions</label>
              <div class="custom-input-wrapper">
                <v-icon class="input-icon">mdi-magnify</v-icon>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search by description, employee, reference..."
                  class="custom-input"
                />
                <v-btn
                  v-if="searchQuery"
                  icon="mdi-close"
                  size="x-small"
                  variant="text"
                  class="clear-btn"
                  @click="searchQuery = ''"
                />
              </div>
            </div>
            
            <div class="filter-item">
              <label class="filter-label">Transaction Type</label>
              <div class="custom-select-wrapper">
                <select v-model="selectedType" class="custom-select">
                  <option value="">All Types</option>
                  <option value="Salary">Salary</option>
                  <option value="Bonus">Bonus</option>
                  <option value="Deduction">Deduction</option>
                  <option value="Allowance">Allowance</option>
                  <option value="Overtime">Overtime</option>
                </select>
                <v-icon class="select-icon">mdi-chevron-down</v-icon>
              </div>
            </div>
            
            <div class="filter-item">
              <label class="filter-label">Status</label>
              <div class="custom-select-wrapper">
                <select v-model="selectedStatus" class="custom-select">
                  <option value="">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Processing">Processing</option>
                </select>
                <v-icon class="select-icon">mdi-chevron-down</v-icon>
              </div>
            </div>
            
            <div class="filter-item">
              <label class="filter-label">Date Range</label>
              <div class="date-range-inputs">
                <input
                  v-model="dateFrom"
                  type="date"
                  class="custom-date-input"
                  placeholder="From"
                />
                <span class="date-separator">to</span>
                <input
                  v-model="dateTo"
                  type="date"
                  class="custom-date-input"
                  placeholder="To"
                />
              </div>
            </div>
            
            <div class="filter-item">
              <label class="filter-label">Actions</label>
              <div class="filter-action-buttons">
                <button class="custom-reset-btn" @click="resetFilters">
                  <v-icon class="btn-icon">mdi-refresh</v-icon>
                  Reset
                </button>
                <button class="custom-export-btn" @click="exportTransactions">
                  <v-icon class="btn-icon">mdi-download</v-icon>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Filters -->
      <div class="mb-spacing-lg">
        <v-chip-group v-model="quickFilter" class="mb-4">
          <v-chip
            v-for="filter in quickFilters"
            :key="filter.value"
            :value="filter.value"
            variant="outlined"
            @click="applyQuickFilter(filter)"
          >
            <v-icon start>{{ filter.icon }}</v-icon>
            {{ filter.label }}
          </v-chip>
        </v-chip-group>
      </div>

      <!-- Transactions Table -->
      <v-card class="enhanced-card" elevation="4">
        <v-card-title class="d-flex justify-space-between align-center pa-spacing-lg">
          <div class="d-flex align-center">
            <v-icon class="mr-3" color="primary">mdi-table</v-icon>
            <span class="text-h6 font-weight-bold">Transaction History</span>
            <v-chip class="ml-3" size="small" color="primary" variant="tonal">
              {{ filteredTransactions.length }} records
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
              @click="openBulkActions"
            >
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        <v-divider />
        
        <v-data-table
          v-model:expanded="expanded"
          :headers="headers"
          :items="filteredTransactions"
          :loading="loading"
          item-value="id"
          show-expand
          class="elevation-0"
          density="compact"
          :items-per-page="25"
        >
          <!-- Transaction ID -->
          <template #item.transactionId="{ item }">
            <div class="font-weight-medium font-mono">{{ item.transactionId }}</div>
            <div class="text-caption text-medium-emphasis">{{ formatDate(item.date) }}</div>
          </template>

          <!-- Employee -->
          <template #item.employee="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" class="mr-3" :color="getAvatarColor(item.employeeName)">
                <span class="text-white text-caption font-weight-bold">
                  {{ getInitials(item.employeeName) }}
                </span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.employeeName }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.employeeId }}</div>
              </div>
            </div>
          </template>

          <!-- Type -->
          <template #item.type="{ item }">
            <v-chip
              :color="getTypeColor(item.type)"
              size="small"
              variant="tonal"
            >
              <v-icon start size="small">{{ getTypeIcon(item.type) }}</v-icon>
              {{ item.type }}
            </v-chip>
          </template>

          <!-- Amount -->
          <template #item.amount="{ item }">
            <div 
              class="font-weight-bold"
              :class="item.amount >= 0 ? 'text-success' : 'text-error'"
            >
              {{ item.amount >= 0 ? '+' : '' }}QAR {{ formatNumber(Math.abs(item.amount)) }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ item.category }}
            </div>
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

          <!-- Payment Method -->
          <template #item.paymentMethod="{ item }">
            <div class="font-weight-medium">{{ item.paymentMethod }}</div>
            <div class="text-caption text-medium-emphasis" v-if="item.reference">
              Ref: {{ item.reference }}
            </div>
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                color="primary"
                @click="viewTransaction(item)"
              />
              <v-btn
                icon="mdi-receipt"
                size="small"
                variant="text"
                color="#8B1538"
                @click="generateReceipt(item)"
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
                  <v-list-item @click="editTransaction(item)">
                    <v-list-item-title>Edit</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="duplicateTransaction(item)">
                    <v-list-item-title>Duplicate</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="reverseTransaction(item)">
                    <v-list-item-title>Reverse</v-list-item-title>
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
                  <h4 class="mb-3">Transaction Details</h4>
                  <v-row>
                    <v-col cols="12" md="6">
                      <h5 class="mb-2">Basic Information</h5>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Transaction ID:</span>
                        <span class="font-weight-bold font-mono">{{ item.transactionId }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Date & Time:</span>
                        <span>{{ formatDateTime(item.date) }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Processed By:</span>
                        <span>{{ item.processedBy }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Department:</span>
                        <span>{{ item.department }}</span>
                      </div>
                      <div class="d-flex justify-space-between">
                        <span>Reference:</span>
                        <span>{{ item.reference || 'N/A' }}</span>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <h5 class="mb-2">Financial Details</h5>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Gross Amount:</span>
                        <span class="font-weight-bold">QAR {{ formatNumber(item.grossAmount) }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Deductions:</span>
                        <span class="text-error">-QAR {{ formatNumber(item.deductions) }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Net Amount:</span>
                        <span class="font-weight-bold text-success">QAR {{ formatNumber(item.amount) }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Tax Amount:</span>
                        <span>QAR {{ formatNumber(item.taxAmount) }}</span>
                      </div>
                      <div v-if="item.description" class="mt-3">
                        <strong>Description:</strong>
                        <p class="text-body-2 mt-1">{{ item.description }}</p>
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

    <!-- Transaction Details Dialog -->
    <v-dialog v-model="showDetailsDialog" max-width="800px" scrollable>
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon class="mr-2">mdi-eye</v-icon>
          Transaction Details
        </v-card-title>
        
        <v-card-text v-if="selectedTransaction" class="pa-6">
          <!-- Transaction details content here -->
          <div class="text-center">
            <h3>{{ selectedTransaction.transactionId }}</h3>
            <p>{{ selectedTransaction.employeeName }}</p>
          </div>
        </v-card-text>

        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn variant="outlined" @click="showDetailsDialog = false">
            Close
          </v-btn>
          <v-btn color="primary" @click="generateReceipt(selectedTransaction)">
            Generate Receipt
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
const selectedType = ref(null)
const selectedStatus = ref(null)
const dateFrom = ref('')
const dateTo = ref('')
const quickFilter = ref(null)
const expanded = ref([])
const showDetailsDialog = ref(false)
const selectedTransaction = ref<any>(null)

// Chart refs
const transactionVolumeChart = ref<HTMLCanvasElement | null>(null)
const transactionTypesChart = ref<HTMLCanvasElement | null>(null)
let volumeChartInstance: Chart | null = null
let typesChartInstance: Chart | null = null

// Data
const summaryCards = ref([
  {
    title: 'Total Transactions',
    value: '2,847',
    trend: 12.3,
    color: 'primary',
    icon: 'mdi-swap-horizontal'
  },
  {
    title: 'Total Amount',
    value: 'QAR 2.4M',
    trend: 8.7,
    color: 'success',
    icon: 'mdi-cash-multiple'
  },
  {
    title: 'Pending Approval',
    value: '23',
    trend: -15.2,
    color: 'warning',
    icon: 'mdi-clock-alert'
  },
  {
    title: 'Failed Transactions',
    value: '7',
    trend: -28.4,
    color: 'error',
    icon: 'mdi-alert-circle'
  }
])

const transactionTypes = ['All', 'Salary Payment', 'Bonus', 'Overtime', 'Advance Loan', 'Deduction', 'Reimbursement']
const statuses = ['All', 'Completed', 'Pending', 'Failed', 'Cancelled']

const quickFilters = [
  { label: 'Today', value: 'today', icon: 'mdi-calendar-today' },
  { label: 'This Week', value: 'week', icon: 'mdi-calendar-week' },
  { label: 'This Month', value: 'month', icon: 'mdi-calendar-month' },
  { label: 'Last 3 Months', value: 'quarter', icon: 'mdi-calendar-range' }
]

const headers = [
  { title: 'Transaction ID', key: 'transactionId', sortable: true },
  { title: 'Employee', key: 'employee', sortable: false },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Amount', key: 'amount', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Payment Method', key: 'paymentMethod', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

const transactions = ref([
  {
    id: 1,
    transactionId: 'TXN-2024-001234',
    employeeName: 'Ahmed Hassan Ali',
    employeeId: 'NP001',
    type: 'Salary Payment',
    amount: 8500,
    grossAmount: 9200,
    deductions: 700,
    taxAmount: 0,
    status: 'Completed',
    paymentMethod: 'Bank Transfer',
    category: 'Regular Salary',
    date: '2024-12-01T10:30:00',
    processedBy: 'Sarah Ahmed',
    department: 'Construction',
    reference: 'SAL-DEC-2024-001',
    description: 'Monthly salary payment for December 2024'
  },
  {
    id: 2,
    transactionId: 'TXN-2024-001235',
    employeeName: 'Sarah Ahmed Mohamed',
    employeeId: 'NP002',
    type: 'Bonus',
    amount: 2500,
    grossAmount: 2500,
    deductions: 0,
    taxAmount: 0,
    status: 'Completed',
    paymentMethod: 'Bank Transfer',
    category: 'Performance Bonus',
    date: '2024-12-02T14:15:00',
    processedBy: 'Mohamed Ali',
    department: 'Administration',
    reference: 'BON-Q4-2024-002',
    description: 'Q4 performance bonus'
  },
  {
    id: 3,
    transactionId: 'TXN-2024-001236',
    employeeName: 'Rajesh Kumar Singh',
    employeeId: 'NP003',
    type: 'Advance Loan',
    amount: -650,
    grossAmount: 0,
    deductions: 650,
    taxAmount: 0,
    status: 'Completed',
    paymentMethod: 'Salary Deduction',
    category: 'Loan Repayment',
    date: '2024-12-03T09:00:00',
    processedBy: 'Ahmed Hassan',
    department: 'Construction',
    reference: 'LOAN-2024-008',
    description: 'Monthly loan repayment deduction'
  },
  {
    id: 4,
    transactionId: 'TXN-2024-001237',
    employeeName: 'Ahmed Hassan Ali',
    employeeId: 'NP001',
    type: 'Overtime',
    amount: 1200,
    grossAmount: 1200,
    deductions: 0,
    taxAmount: 0,
    status: 'Pending',
    paymentMethod: 'Bank Transfer',
    category: 'Overtime Pay',
    date: '2024-12-04T16:45:00',
    processedBy: 'Sarah Ahmed',
    department: 'Construction',
    reference: 'OT-NOV-2024-015',
    description: 'Overtime hours for November 2024'
  }
])

// Computed
const filteredTransactions = computed(() => {
  let filtered = transactions.value

  if (searchQuery.value) {
    filtered = filtered.filter(txn => 
      txn.transactionId.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      txn.employeeName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      txn.employeeId.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedType.value && selectedType.value !== 'All') {
    filtered = filtered.filter(txn => txn.type === selectedType.value)
  }

  if (selectedStatus.value && selectedStatus.value !== 'All') {
    filtered = filtered.filter(txn => txn.status === selectedStatus.value)
  }

  if (dateFrom.value) {
    filtered = filtered.filter(txn => new Date(txn.date) >= new Date(dateFrom.value))
  }

  if (dateTo.value) {
    filtered = filtered.filter(txn => new Date(txn.date) <= new Date(dateTo.value))
  }

  return filtered
})

// Methods
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-QA').format(value)
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-GB')
}

const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('en-GB')
}

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getAvatarColor = (name: string): string => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error']
  const index = name.length % colors.length
  return colors[index]
}

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'Salary Payment': 'success',
    'Bonus': 'purple',
    'Overtime': 'blue',
    'Advance Loan': 'orange',
    'Deduction': 'red',
    'Reimbursement': 'green'
  }
  return colors[type] || 'grey'
}

const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'Salary Payment': 'mdi-cash',
    'Bonus': 'mdi-gift',
    'Overtime': 'mdi-clock-plus',
    'Advance Loan': 'mdi-cash-fast',
    'Deduction': 'mdi-cash-minus',
    'Reimbursement': 'mdi-cash-refund'
  }
  return icons[type] || 'mdi-cash'
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Completed': 'success',
    'Pending': 'warning',
    'Failed': 'error',
    'Cancelled': 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status: string): string => {
  const icons: Record<string, string> = {
    'Completed': 'mdi-check-circle',
    'Pending': 'mdi-clock',
    'Failed': 'mdi-alert-circle',
    'Cancelled': 'mdi-cancel'
  }
  return icons[status] || 'mdi-help-circle'
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedType.value = null
  selectedStatus.value = null
  dateFrom.value = ''
  dateTo.value = ''
  quickFilter.value = null
}

const applyQuickFilter = (filter: any) => {
  const today = new Date()
  switch (filter.value) {
    case 'today':
      dateFrom.value = today.toISOString().split('T')[0]
      dateTo.value = today.toISOString().split('T')[0]
      break
    case 'week':
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
      dateFrom.value = weekStart.toISOString().split('T')[0]
      dateTo.value = new Date().toISOString().split('T')[0]
      break
    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      dateFrom.value = monthStart.toISOString().split('T')[0]
      dateTo.value = new Date().toISOString().split('T')[0]
      break
    case 'quarter':
      const quarterStart = new Date(today.getFullYear(), today.getMonth() - 3, 1)
      dateFrom.value = quarterStart.toISOString().split('T')[0]
      dateTo.value = new Date().toISOString().split('T')[0]
      break
  }
}

const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const viewTransaction = (transaction: any) => {
  selectedTransaction.value = transaction
  showDetailsDialog.value = true
}

const editTransaction = (transaction: any) => {
  alert(`Editing transaction ${transaction.transactionId}`)
}

const duplicateTransaction = (transaction: any) => {
  alert(`Duplicating transaction ${transaction.transactionId}`)
}

const reverseTransaction = (transaction: any) => {
  alert(`Reversing transaction ${transaction.transactionId}`)
}

const generateReceipt = (transaction: any) => {
  alert(`Generating receipt for ${transaction.transactionId}`)
}

const exportTransactions = () => {
  alert('Exporting transaction data...')
}

const generateReport = () => {
  alert('Generating financial report...')
}

const openBulkActions = () => {
  alert('Bulk actions coming soon!')
}

const initializeCharts = () => {
  nextTick(() => {
    // Transaction Volume Chart
    if (transactionVolumeChart.value) {
      if (volumeChartInstance) {
        volumeChartInstance.destroy()
      }
      
      volumeChartInstance = new Chart(transactionVolumeChart.value, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Transaction Volume (QAR)',
              data: [180000, 195000, 210000, 185000, 225000, 240000, 235000, 250000, 220000, 245000, 260000, 280000],
              backgroundColor: 'rgba(25, 118, 210, 0.8)',
              borderColor: '#1976d2',
              borderWidth: 1
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
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return 'QAR ' + (Number(value) / 1000) + 'K'
                }
              }
            }
          }
        }
      })
    }

    // Transaction Types Chart
    if (transactionTypesChart.value) {
      if (typesChartInstance) {
        typesChartInstance.destroy()
      }
      
      typesChartInstance = new Chart(transactionTypesChart.value, {
        type: 'doughnut',
        data: {
          labels: ['Salary Payment', 'Bonus', 'Overtime', 'Advance Loan', 'Deduction'],
          datasets: [{
            data: [65, 15, 10, 7, 3],
            backgroundColor: [
              '#4caf50',
              '#9c27b0',
              '#2196f3',
              '#ff9800',
              '#f44336'
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
.transaction-history {
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

.stats-error {
  background: linear-gradient(135deg, #d32f2f, #c62828) !important;
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
  min-height: 40px;
  padding: 0 16px;
}

/* Maroon theme buttons */
.v-btn[style*="#8B1538"] {
  background-color: #8B1538 !important;
  border-color: #8B1538 !important;
}

.v-btn[style*="#8B1538"]:hover {
  background-color: #6B0F2A !important;
  border-color: #6B0F2A !important;
}

/* Ensure proper button alignment and spacing */
.enhanced-header .d-flex {
  align-items: center;
  gap: 12px;
}

.enhanced-header .d-flex .v-btn {
  white-space: nowrap;
}

.font-mono {
  font-family: 'Courier New', monospace;
}

/* Custom Filter Section */
.custom-filter-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.filter-header {
  background: linear-gradient(135deg, #8B1538 0%, #6B0F2A 100%);
  padding: 16px 24px;
}

.filter-title {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-icon {
  color: white;
}

.filter-content {
  padding: 24px;
  background: white;
}

.filter-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr auto;
  gap: 24px;
  align-items: end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

/* Custom Input Styles */
.custom-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.custom-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  color: #374151;
}

.custom-input:focus {
  outline: none;
  border-color: #8B1538;
  box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.1);
}

.custom-input::placeholder {
  color: #9ca3af;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #6b7280;
  z-index: 1;
}

.clear-btn {
  position: absolute !important;
  right: 8px;
  color: #6b7280 !important;
}

/* Custom Select Styles */
.custom-select-wrapper {
  position: relative;
}

.custom-select {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
}

.custom-select:focus {
  outline: none;
  border-color: #8B1538;
  box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.1);
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
}

/* Date Range Inputs */
.date-range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-date-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  color: #374151;
  transition: all 0.3s ease;
}

.custom-date-input:focus {
  outline: none;
  border-color: #8B1538;
  box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.1);
}

.date-separator {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

/* Custom Action Buttons */
.filter-action-buttons {
  display: flex;
  gap: 12px;
}

.custom-reset-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.custom-reset-btn:hover {
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
}

.custom-export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.custom-export-btn:hover {
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.btn-icon {
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .filter-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .filter-content {
    padding: 16px;
  }
  
  .filter-action-buttons {
    flex-direction: column;
  }
  
  .date-range-inputs {
    flex-direction: column;
  }
}
</style>
