<template>
  <div class="advance-loans">
    <!-- Enhanced Header -->
    <div class="enhanced-header mb-spacing-xl">
      <v-container fluid class="pa-spacing-lg">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              <v-icon size="32" class="mr-3 text-primary">mdi-cash-fast</v-icon>
              Advance Loans
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis ma-0">
              Manage employee advance loans, applications, and repayments
            </p>
          </div>
          <div class="d-flex gap-3">
            <v-btn
              color="success"
              size="large"
              elevation="2"
              @click="openNewLoanDialog"
              class="enhanced-btn"
            >
              <template #prepend>
                <v-icon>mdi-plus</v-icon>
              </template>
              New Loan Application
            </v-btn>
            <v-btn
              variant="outlined"
              color="primary"
              size="large"
              @click="exportLoanData"
              class="enhanced-btn"
            >
              <template #prepend>
                <v-icon>mdi-download</v-icon>
              </template>
              Export Data
            </v-btn>
          </div>
        </div>
      </v-container>
    </div>

    <v-container fluid class="pa-spacing-lg">
      <!-- Summary Cards -->
      <v-row class="mb-spacing-lg">
        <v-col cols="12" md="3" v-for="card in loanCards" :key="card.title">
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
              <v-icon class="mr-3" color="primary">mdi-chart-line</v-icon>
              Loan Trends
            </v-card-title>
            <v-card-text class="pa-spacing-lg">
              <canvas ref="loanTrendsChart" height="100"></canvas>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="enhanced-card" elevation="4">
            <v-card-title class="pa-spacing-lg">
              <v-icon class="mr-3" color="success">mdi-chart-donut</v-icon>
              Loan Status
            </v-card-title>
            <v-card-text class="pa-spacing-lg">
              <canvas ref="loanStatusChart" height="100"></canvas>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Filters -->
      <v-card class="enhanced-card mb-spacing-lg" elevation="2">
        <v-card-text class="pa-spacing-lg">
          <v-row align="center">
            <v-col cols="12" md="3">
              <v-text-field
                v-model="searchQuery"
                label="Search loans..."
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="selectedStatus"
                :items="loanStatuses"
                label="Status"
                variant="outlined"
                density="compact"
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
                v-model="loanAmountRange"
                :items="amountRanges"
                label="Amount Range"
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
                  @click="sendReminders"
                  class="enhanced-btn"
                >
                  Send Reminders
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Loans Data Table -->
      <v-card class="enhanced-card" elevation="4">
        <v-card-title class="d-flex justify-space-between align-center pa-spacing-lg">
          <div class="d-flex align-center">
            <v-icon class="mr-3" color="primary">mdi-table</v-icon>
            <span class="text-h6 font-weight-bold">Advance Loans</span>
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
          :items="filteredLoans"
          :loading="loading"
          item-value="id"
          show-expand
          class="elevation-0"
          density="compact"
        >
          <!-- Employee Info -->
          <template #item.employee="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="40" class="mr-3" :color="getAvatarColor(item.employeeName)">
                <span class="text-white font-weight-bold">
                  {{ getInitials(item.employeeName) }}
                </span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.employeeName }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.employeeId }}</div>
              </div>
            </div>
          </template>

          <!-- Loan Amount -->
          <template #item.loanAmount="{ item }">
            <div class="font-weight-bold">QAR {{ formatNumber(item.loanAmount) }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ item.installments }} installments
            </div>
          </template>

          <!-- Remaining Balance -->
          <template #item.remainingBalance="{ item }">
            <div class="font-weight-medium">QAR {{ formatNumber(item.remainingBalance) }}</div>
            <v-progress-linear
              :model-value="((item.loanAmount - item.remainingBalance) / item.loanAmount) * 100"
              color="success"
              height="4"
              class="mt-1"
            />
          </template>

          <!-- Status -->
          <template #item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="tonal"
            >
              {{ item.status }}
            </v-chip>
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

          <!-- Next Payment -->
          <template #item.nextPayment="{ item }">
            <div class="font-weight-medium">{{ formatDate(item.nextPaymentDate) }}</div>
            <div class="text-caption" :class="isOverdue(item.nextPaymentDate) ? 'text-error' : 'text-medium-emphasis'">
              {{ isOverdue(item.nextPaymentDate) ? 'Overdue' : 'Due in ' + getDaysUntil(item.nextPaymentDate) + ' days' }}
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
                @click="viewLoanDetails(item)"
              />
              <v-btn
                icon="mdi-cash"
                size="small"
                variant="text"
                color="success"
                @click="recordPayment(item)"
                :disabled="item.status === 'Completed'"
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
                  <v-list-item @click="editLoan(item)">
                    <v-list-item-title>Edit</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="viewHistory(item)">
                    <v-list-item-title>Payment History</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="generateReport(item)">
                    <v-list-item-title>Generate Report</v-list-item-title>
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
                  <h4 class="mb-3">Loan Details</h4>
                  <v-row>
                    <v-col cols="12" md="6">
                      <h5 class="mb-2">Loan Information</h5>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Application Date:</span>
                        <span>{{ formatDate(item.applicationDate) }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Approval Date:</span>
                        <span>{{ formatDate(item.approvalDate) }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Loan Type:</span>
                        <span>{{ item.loanType }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Interest Rate:</span>
                        <span>{{ item.interestRate }}%</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Monthly Deduction:</span>
                        <span class="font-weight-bold">QAR {{ formatNumber(item.monthlyDeduction) }}</span>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <h5 class="mb-2">Payment Summary</h5>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Total Paid:</span>
                        <span class="text-success font-weight-bold">
                          QAR {{ formatNumber(item.loanAmount - item.remainingBalance) }}
                        </span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Remaining:</span>
                        <span class="font-weight-bold">QAR {{ formatNumber(item.remainingBalance) }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Payments Made:</span>
                        <span>{{ item.paymentsMade }} / {{ item.installments }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Expected Completion:</span>
                        <span>{{ formatDate(item.expectedCompletion) }}</span>
                      </div>
                      <div class="d-flex justify-space-between">
                        <span>Guarantor:</span>
                        <span>{{ item.guarantor }}</span>
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

    <!-- New Loan Application Dialog -->
    <v-dialog v-model="showNewLoanDialog" max-width="900px" scrollable>
      <v-card>
        <v-card-title class="bg-success text-white">
          <v-icon class="mr-2">mdi-plus</v-icon>
          New Loan Application
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form ref="newLoanForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newLoan.employeeId"
                  :items="availableEmployees"
                  item-title="name"
                  item-value="id"
                  label="Employee"
                  variant="outlined"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newLoan.loanType"
                  :items="loanTypes"
                  label="Loan Type"
                  variant="outlined"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newLoan.loanAmount"
                  label="Loan Amount"
                  type="number"
                  variant="outlined"
                  prefix="QAR"
                  :rules="[rules.required, rules.positive]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newLoan.installments"
                  label="Number of Installments"
                  type="number"
                  variant="outlined"
                  :rules="[rules.required, rules.positive]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newLoan.interestRate"
                  label="Interest Rate (%)"
                  type="number"
                  variant="outlined"
                  step="0.1"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newLoan.applicationDate"
                  label="Application Date"
                  type="date"
                  variant="outlined"
                  :rules="[rules.required]"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="newLoan.guarantor"
                  label="Guarantor"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="newLoan.purpose"
                  label="Purpose of Loan"
                  variant="outlined"
                  rows="3"
                  placeholder="Describe the purpose of this loan..."
                />
              </v-col>
            </v-row>
            
            <v-card variant="outlined" class="mt-4 pa-4 bg-grey-lighten-5">
              <h4 class="mb-2">Loan Calculation</h4>
              <div class="d-flex justify-space-between mb-1">
                <span>Monthly Payment:</span>
                <span class="font-weight-bold">QAR {{ calculateMonthlyPayment() }}</span>
              </div>
              <div class="d-flex justify-space-between mb-1">
                <span>Total Interest:</span>
                <span>QAR {{ calculateTotalInterest() }}</span>
              </div>
              <div class="d-flex justify-space-between">
                <span>Total Amount:</span>
                <span class="font-weight-bold text-primary">QAR {{ calculateTotalAmount() }}</span>
              </div>
            </v-card>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn variant="outlined" @click="showNewLoanDialog = false">
            Cancel
          </v-btn>
          <v-btn color="success" @click="submitLoanApplication">
            Submit Application
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Payment Recording Dialog -->
    <v-dialog v-model="showPaymentDialog" max-width="600px">
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon class="mr-2">mdi-cash</v-icon>
          Record Payment
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form v-if="selectedLoan" ref="paymentForm">
            <div class="mb-4">
              <h4>{{ selectedLoan.employeeName }}</h4>
              <p class="text-medium-emphasis">Remaining Balance: QAR {{ formatNumber(selectedLoan.remainingBalance) }}</p>
            </div>
            
            <v-text-field
              v-model="paymentData.amount"
              label="Payment Amount"
              type="number"
              variant="outlined"
              prefix="QAR"
              :rules="[rules.required, rules.positive]"
              :max="selectedLoan.remainingBalance"
            />
            
            <v-text-field
              v-model="paymentData.paymentDate"
              label="Payment Date"
              type="date"
              variant="outlined"
              :rules="[rules.required]"
            />
            
            <v-select
              v-model="paymentData.paymentMethod"
              :items="paymentMethods"
              label="Payment Method"
              variant="outlined"
              :rules="[rules.required]"
            />
            
            <v-textarea
              v-model="paymentData.notes"
              label="Notes"
              variant="outlined"
              rows="2"
              placeholder="Add any notes about this payment..."
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn variant="outlined" @click="showPaymentDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" @click="savePayment">
            Record Payment
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
const selectedStatus = ref(null)
const selectedDepartment = ref(null)
const loanAmountRange = ref(null)
const expanded = ref([])
const showNewLoanDialog = ref(false)
const showPaymentDialog = ref(false)
const selectedLoan = ref<any>(null)

// Chart refs
const loanTrendsChart = ref<HTMLCanvasElement | null>(null)
const loanStatusChart = ref<HTMLCanvasElement | null>(null)
let trendsChartInstance: Chart | null = null
let statusChartInstance: Chart | null = null

// Form data
const newLoan = ref({
  employeeId: null,
  loanType: '',
  loanAmount: 0,
  installments: 0,
  interestRate: 0,
  applicationDate: new Date().toISOString().split('T')[0],
  guarantor: '',
  purpose: ''
})

const paymentData = ref({
  amount: 0,
  paymentDate: new Date().toISOString().split('T')[0],
  paymentMethod: '',
  notes: ''
})

// Data
const loanCards = ref([
  {
    title: 'Active Loans',
    value: '47',
    trend: 8.3,
    color: 'primary',
    icon: 'mdi-cash-fast'
  },
  {
    title: 'Total Outstanding',
    value: 'QAR 284K',
    trend: -12.5,
    color: 'warning',
    icon: 'mdi-cash-minus'
  },
  {
    title: 'Monthly Collections',
    value: 'QAR 89K',
    trend: 15.7,
    color: 'success',
    icon: 'mdi-cash-plus'
  },
  {
    title: 'Overdue Payments',
    value: '8',
    trend: -25.4,
    color: 'error',
    icon: 'mdi-alert-circle'
  }
])

const loanStatuses = ['All', 'Active', 'Pending Approval', 'Completed', 'Overdue', 'Rejected']
const departments = ['All', 'Construction', 'Administration', 'HR', 'Finance', 'Safety']
const amountRanges = ['All', '< QAR 5,000', 'QAR 5,000-15,000', 'QAR 15,000-30,000', '> QAR 30,000']
const loanTypes = ['Emergency Loan', 'Personal Loan', 'Medical Loan', 'Education Loan', 'Housing Advance']
const paymentMethods = ['Salary Deduction', 'Cash', 'Bank Transfer', 'Cheque']

const availableEmployees = ref([
  { id: 1, name: 'Ahmed Hassan Ali' },
  { id: 2, name: 'Sarah Ahmed Mohamed' },
  { id: 3, name: 'Rajesh Kumar Singh' }
])

const headers = [
  { title: 'Employee', key: 'employee', sortable: false },
  { title: 'Department', key: 'department', sortable: true },
  { title: 'Loan Amount', key: 'loanAmount', sortable: true },
  { title: 'Remaining Balance', key: 'remainingBalance', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Next Payment', key: 'nextPayment', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

const loans = ref([
  {
    id: 1,
    employeeName: 'Ahmed Hassan Ali',
    employeeId: 'NP001',
    department: 'Construction',
    loanAmount: 15000,
    remainingBalance: 8500,
    status: 'Active',
    applicationDate: '2024-01-15',
    approvalDate: '2024-01-20',
    loanType: 'Personal Loan',
    interestRate: 2.5,
    installments: 24,
    monthlyDeduction: 650,
    nextPaymentDate: '2024-12-15',
    paymentsMade: 10,
    expectedCompletion: '2026-01-15',
    guarantor: 'Sarah Ahmed'
  },
  {
    id: 2,
    employeeName: 'Sarah Ahmed Mohamed',
    employeeId: 'NP002',
    department: 'Administration',
    loanAmount: 25000,
    remainingBalance: 18750,
    status: 'Active',
    applicationDate: '2024-03-10',
    approvalDate: '2024-03-15',
    loanType: 'Housing Advance',
    interestRate: 1.8,
    installments: 36,
    monthlyDeduction: 720,
    nextPaymentDate: '2024-12-10',
    paymentsMade: 8,
    expectedCompletion: '2027-03-10',
    guarantor: 'Mohamed Ali'
  },
  {
    id: 3,
    employeeName: 'Rajesh Kumar Singh',
    employeeId: 'NP003',
    department: 'Construction',
    loanAmount: 5000,
    remainingBalance: 2500,
    status: 'Overdue',
    applicationDate: '2024-06-01',
    approvalDate: '2024-06-05',
    loanType: 'Emergency Loan',
    interestRate: 3.0,
    installments: 12,
    monthlyDeduction: 450,
    nextPaymentDate: '2024-11-01',
    paymentsMade: 6,
    expectedCompletion: '2025-06-01',
    guarantor: 'Ahmed Hassan'
  }
])

const rules = {
  required: (value: any) => !!value || 'Required',
  positive: (value: any) => value > 0 || 'Must be positive'
}

// Computed
const filteredLoans = computed(() => {
  let filtered = loans.value

  if (searchQuery.value) {
    filtered = filtered.filter(loan => 
      loan.employeeName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      loan.employeeId.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedStatus.value && selectedStatus.value !== 'All') {
    filtered = filtered.filter(loan => loan.status === selectedStatus.value)
  }

  if (selectedDepartment.value && selectedDepartment.value !== 'All') {
    filtered = filtered.filter(loan => loan.department === selectedDepartment.value)
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
    'Active': 'success',
    'Pending Approval': 'warning',
    'Completed': 'info',
    'Overdue': 'error',
    'Rejected': 'grey'
  }
  return colors[status] || 'grey'
}

const isOverdue = (date: string): boolean => {
  return new Date(date) < new Date()
}

const getDaysUntil = (date: string): number => {
  const days = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, days)
}

const calculateMonthlyPayment = (): string => {
  if (!newLoan.value.loanAmount || !newLoan.value.installments) return '0'
  const principal = Number(newLoan.value.loanAmount)
  const rate = Number(newLoan.value.interestRate) / 100 / 12
  const months = Number(newLoan.value.installments)
  
  if (rate === 0) {
    return formatNumber(principal / months)
  }
  
  const payment = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
  return formatNumber(Math.round(payment))
}

const calculateTotalInterest = (): string => {
  const monthlyPayment = Number(calculateMonthlyPayment().replace(/,/g, ''))
  const totalPayments = monthlyPayment * Number(newLoan.value.installments)
  const interest = totalPayments - Number(newLoan.value.loanAmount)
  return formatNumber(Math.round(interest))
}

const calculateTotalAmount = (): string => {
  const monthlyPayment = Number(calculateMonthlyPayment().replace(/,/g, ''))
  const total = monthlyPayment * Number(newLoan.value.installments)
  return formatNumber(Math.round(total))
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = null
  selectedDepartment.value = null
  loanAmountRange.value = null
}

const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const openNewLoanDialog = () => {
  showNewLoanDialog.value = true
}

const submitLoanApplication = () => {
  alert('Loan application submitted for approval!')
  showNewLoanDialog.value = false
}

const recordPayment = (loan: any) => {
  selectedLoan.value = loan
  paymentData.value.amount = loan.monthlyDeduction
  showPaymentDialog.value = true
}

const savePayment = () => {
  alert('Payment recorded successfully!')
  showPaymentDialog.value = false
}

const viewLoanDetails = (loan: any) => {
  alert(`Viewing details for ${loan.employeeName}`)
}

const editLoan = (loan: any) => {
  alert(`Editing loan for ${loan.employeeName}`)
}

const viewHistory = (loan: any) => {
  alert(`Payment history for ${loan.employeeName}`)
}

const generateReport = (loan: any) => {
  alert(`Generating report for ${loan.employeeName}`)
}

const exportLoanData = () => {
  alert('Export functionality coming soon!')
}

const sendReminders = () => {
  alert('Payment reminders sent!')
}

const openBulkActions = () => {
  alert('Bulk actions coming soon!')
}

const initializeCharts = () => {
  nextTick(() => {
    // Loan Trends Chart
    if (loanTrendsChart.value) {
      if (trendsChartInstance) {
        trendsChartInstance.destroy()
      }
      
      trendsChartInstance = new Chart(loanTrendsChart.value, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'New Loans',
              data: [12, 15, 8, 22, 18, 25, 20, 28, 15, 19, 24, 16],
              borderColor: '#1976d2',
              backgroundColor: 'rgba(25, 118, 210, 0.1)',
              tension: 0.4
            },
            {
              label: 'Completed Loans',
              data: [8, 12, 10, 15, 13, 18, 16, 20, 12, 14, 17, 11],
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

    // Loan Status Chart
    if (loanStatusChart.value) {
      if (statusChartInstance) {
        statusChartInstance.destroy()
      }
      
      statusChartInstance = new Chart(loanStatusChart.value, {
        type: 'doughnut',
        data: {
          labels: ['Active', 'Completed', 'Overdue', 'Pending'],
          datasets: [{
            data: [47, 23, 8, 12],
            backgroundColor: [
              '#4caf50',
              '#2196f3',
              '#f44336',
              '#ff9800'
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
.advance-loans {
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
}
</style>