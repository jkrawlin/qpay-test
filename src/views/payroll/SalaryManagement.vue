<template>
  <div class="salary-management">
    <!-- Enhanced Header -->
    <div class="enhanced-header mb-spacing-xl">
      <v-container fluid class="pa-spacing-lg">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              <v-icon size="32" class="mr-3 text-primary">mdi-cash</v-icon>
              Salary Management
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis ma-0">
              Manage employee salaries, raises, and compensation structures
            </p>
          </div>
          <div class="d-flex gap-3">
            <v-btn
              color="success"
              size="large"
              elevation="2"
              @click="openSalaryAdjustmentDialog"
              class="enhanced-btn"
            >
              <template #prepend>
                <v-icon>mdi-trending-up</v-icon>
              </template>
              Salary Adjustment
            </v-btn>
            <v-btn
              variant="outlined"
              color="primary"
              size="large"
              @click="exportSalaryData"
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
        <v-col cols="12" md="3" v-for="card in salaryCards" :key="card.title">
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
                      {{ Math.abs(card.trend) }}% from last period
                    </span>
                  </div>
                </div>
                <v-icon size="48" class="stats-icon">{{ card.icon }}</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Filters and Search -->
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
                v-model="salaryRange"
                :items="salaryRanges"
                label="Salary Range"
                variant="outlined"
                density="compact"
                clearable
                hide-details
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="selectedGrade"
                :items="salaryGrades"
                label="Grade"
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
                  color="success"
                  @click="bulkSalaryUpdate"
                  class="enhanced-btn"
                >
                  Bulk Update
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Salary Data Table -->
      <v-card class="enhanced-card" elevation="4">
        <v-card-title class="d-flex justify-space-between align-center pa-spacing-lg">
          <div class="d-flex align-center">
            <v-icon class="mr-3" color="primary">mdi-table</v-icon>
            <span class="text-h6 font-weight-bold">Employee Salary Details</span>
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
              @click="openSalaryGradeDialog"
            >
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        <v-divider />
        
        <v-data-table
          v-model:expanded="expanded"
          :headers="headers"
          :items="filteredEmployees"
          :loading="loading"
          item-value="id"
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

          <!-- Position -->
          <template #item.position="{ item }">
            <div class="font-weight-medium">{{ item.position }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.grade }}</div>
          </template>

          <!-- Current Salary -->
          <template #item.currentSalary="{ item }">
            <div class="font-weight-bold">QAR {{ formatNumber(item.currentSalary) }}</div>
            <div class="text-caption text-medium-emphasis">
              Effective: {{ formatDate(item.lastRaiseDate) }}
            </div>
          </template>

          <!-- Previous Salary -->
          <template #item.previousSalary="{ item }">
            <div class="text-medium-emphasis">QAR {{ formatNumber(item.previousSalary) }}</div>
            <div class="text-caption" :class="item.salaryIncrease > 0 ? 'text-success' : 'text-error'">
              {{ item.salaryIncrease > 0 ? '+' : '' }}{{ item.salaryIncrease.toFixed(1) }}%
            </div>
          </template>

          <!-- Performance -->
          <template #item.performance="{ item }">
            <v-rating
              v-model="item.performance"
              readonly
              size="small"
              color="warning"
              density="compact"
            />
            <div class="text-caption">{{ getPerformanceText(item.performance) }}</div>
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

          <!-- Actions -->
          <template #item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="primary"
                @click="editSalary(item)"
                :disabled="item.status === 'Pending'"
              />
              <v-btn
                icon="mdi-history"
                size="small"
                variant="text"
                color="info"
                @click="viewSalaryHistory(item)"
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
                  <v-list-item @click="promoteSalary(item)">
                    <v-list-item-title>Promote</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="freezeSalary(item)">
                    <v-list-item-title>Freeze</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="viewComparison(item)">
                    <v-list-item-title>Compare</v-list-item-title>
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
                  <h4 class="mb-3">Detailed Salary Information</h4>
                  <v-row>
                    <v-col cols="12" md="6">
                      <h5 class="mb-2">Current Compensation</h5>
                      <div class="d-flex justify-space-between mb-1">
                        <span>Basic Salary:</span>
                        <span class="font-weight-bold">QAR {{ formatNumber(item.currentSalary) }}</span>
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
                        <span>Other Allowances:</span>
                        <span>QAR {{ formatNumber(item.otherAllowances) }}</span>
                      </div>
                      <v-divider class="my-2" />
                      <div class="d-flex justify-space-between font-weight-bold">
                        <span>Total Package:</span>
                        <span class="text-success">QAR {{ formatNumber(item.totalPackage) }}</span>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <h5 class="mb-2">Employment Details</h5>
                      <div class="mb-2">
                        <strong>Join Date:</strong> {{ formatDate(item.joinDate) }}
                      </div>
                      <div class="mb-2">
                        <strong>Years of Service:</strong> {{ item.yearsOfService }} years
                      </div>
                      <div class="mb-2">
                        <strong>Contract Type:</strong> {{ item.contractType }}
                      </div>
                      <div class="mb-2">
                        <strong>Next Review:</strong> {{ formatDate(item.nextReviewDate) }}
                      </div>
                      <div class="mb-2">
                        <strong>Manager:</strong> {{ item.manager }}
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

    <!-- Salary Edit Dialog -->
    <v-dialog v-model="showEditDialog" max-width="800px" scrollable>
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon class="mr-2">mdi-pencil</v-icon>
          Edit Salary - {{ selectedEmployee?.name }}
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-form v-if="selectedEmployee" ref="editForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editData.currentSalary"
                  label="Basic Salary"
                  type="number"
                  variant="outlined"
                  prefix="QAR"
                  :rules="[rules.required, rules.positive]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editData.housingAllowance"
                  label="Housing Allowance"
                  type="number"
                  variant="outlined"
                  prefix="QAR"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editData.transportAllowance"
                  label="Transport Allowance"
                  type="number"
                  variant="outlined"
                  prefix="QAR"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editData.otherAllowances"
                  label="Other Allowances"
                  type="number"
                  variant="outlined"
                  prefix="QAR"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="editData.grade"
                  :items="salaryGrades"
                  label="Salary Grade"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editData.effectiveDate"
                  label="Effective Date"
                  type="date"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editData.reason"
                  label="Reason for Change"
                  variant="outlined"
                  rows="3"
                  placeholder="Enter reason for salary adjustment..."
                />
              </v-col>
            </v-row>
            
            <v-card variant="outlined" class="mt-4 pa-4 bg-grey-lighten-5">
              <h4 class="mb-2">Salary Summary</h4>
              <div class="d-flex justify-space-between mb-1">
                <span>Current Salary:</span>
                <span>QAR {{ formatNumber(selectedEmployee.currentSalary) }}</span>
              </div>
              <div class="d-flex justify-space-between mb-1">
                <span>New Salary:</span>
                <span class="font-weight-bold">QAR {{ formatNumber(Number(editData.currentSalary) || 0) }}</span>
              </div>
              <div class="d-flex justify-space-between mb-1">
                <span>Difference:</span>
                <span :class="salaryDifference >= 0 ? 'text-success' : 'text-error'">
                  {{ salaryDifference >= 0 ? '+' : '' }}QAR {{ formatNumber(Math.abs(salaryDifference)) }}
                </span>
              </div>
              <div class="d-flex justify-space-between">
                <span>Percentage Change:</span>
                <span :class="percentageChange >= 0 ? 'text-success' : 'text-error'">
                  {{ percentageChange >= 0 ? '+' : '' }}{{ percentageChange.toFixed(2) }}%
                </span>
              </div>
            </v-card>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn variant="outlined" @click="showEditDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" @click="saveSalaryChanges">
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Salary History Dialog -->
    <v-dialog v-model="showHistoryDialog" max-width="900px" scrollable>
      <v-card>
        <v-card-title class="bg-info text-white">
          <v-icon class="mr-2">mdi-history</v-icon>
          Salary History - {{ selectedEmployee?.name }}
        </v-card-title>
        
        <v-card-text class="pa-0">
          <v-timeline side="end" density="compact" class="pa-4">
            <v-timeline-item
              v-for="(record, index) in salaryHistory"
              :key="index"
              :dot-color="record.type === 'increase' ? 'success' : record.type === 'decrease' ? 'error' : 'primary'"
              size="small"
            >
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="font-weight-medium">{{ record.reason }}</div>
                  <div class="text-caption text-medium-emphasis">{{ formatDate(record.effectiveDate) }}</div>
                </div>
                <div class="text-right">
                  <div class="font-weight-bold">QAR {{ formatNumber(record.newSalary) }}</div>
                  <div class="text-caption" :class="record.change >= 0 ? 'text-success' : 'text-error'">
                    {{ record.change >= 0 ? '+' : '' }}{{ record.change.toFixed(1) }}%
                  </div>
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="outlined" @click="showHistoryDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// State
const loading = ref(false)
const searchQuery = ref('')
const selectedDepartment = ref(null)
const salaryRange = ref(null)
const selectedGrade = ref(null)
const expanded = ref([])
const showEditDialog = ref(false)
const showHistoryDialog = ref(false)
const selectedEmployee = ref<any>(null)
const editData = ref({
  currentSalary: 0,
  housingAllowance: 0,
  transportAllowance: 0,
  otherAllowances: 0,
  grade: '',
  effectiveDate: '',
  reason: ''
})

// Data
const salaryCards = ref([
  {
    title: 'Average Salary',
    value: 'QAR 4,250',
    trend: 6.2,
    color: 'primary',
    icon: 'mdi-calculator'
  },
  {
    title: 'Total Payroll',
    value: 'QAR 1.04M',
    trend: 8.5,
    color: 'success',
    icon: 'mdi-cash-multiple'
  },
  {
    title: 'Pending Reviews',
    value: '23',
    trend: -15.2,
    color: 'warning',
    icon: 'mdi-clock-alert'
  },
  {
    title: 'Grade Changes',
    value: '8',
    trend: 12.1,
    color: 'info',
    icon: 'mdi-trending-up'
  }
])

const departments = ['All', 'Construction', 'Administration', 'HR', 'Finance', 'Safety']
const salaryRanges = ['All', '< QAR 2,000', 'QAR 2,000-5,000', 'QAR 5,000-10,000', '> QAR 10,000']
const salaryGrades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']

const headers = [
  { title: 'Employee', key: 'employee', sortable: false },
  { title: 'Department', key: 'department', sortable: true },
  { title: 'Position', key: 'position', sortable: true },
  { title: 'Current Salary', key: 'currentSalary', sortable: true },
  { title: 'Previous Salary', key: 'previousSalary', sortable: true },
  { title: 'Performance', key: 'performance', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

const employees = ref([
  {
    id: 1,
    name: 'Ahmed Hassan Ali',
    employeeId: 'NP001',
    department: 'Construction',
    position: 'Senior Engineer',
    grade: 'Grade 4',
    currentSalary: 8500,
    previousSalary: 8000,
    housingAllowance: 2125,
    transportAllowance: 850,
    otherAllowances: 425,
    totalPackage: 11900,
    performance: 4.5,
    status: 'Active',
    joinDate: '2023-01-15',
    lastRaiseDate: '2024-01-01',
    yearsOfService: 2,
    contractType: 'Permanent',
    nextReviewDate: '2025-01-01',
    manager: 'Sarah Ahmed',
    salaryIncrease: 6.25
  },
  {
    id: 2,
    name: 'Sarah Ahmed Mohamed',
    employeeId: 'NP002',
    department: 'Administration',
    position: 'HR Manager',
    grade: 'Grade 5',
    currentSalary: 6500,
    previousSalary: 6200,
    housingAllowance: 1625,
    transportAllowance: 650,
    otherAllowances: 325,
    totalPackage: 9100,
    performance: 4.8,
    status: 'Active',
    joinDate: '2022-03-10',
    lastRaiseDate: '2023-12-01',
    yearsOfService: 3,
    contractType: 'Permanent',
    nextReviewDate: '2024-12-01',
    manager: 'Mohamed Ali',
    salaryIncrease: 4.84
  },
  {
    id: 3,
    name: 'Rajesh Kumar Singh',
    employeeId: 'NP003',
    department: 'Construction',
    position: 'Worker',
    grade: 'Grade 1',
    currentSalary: 2200,
    previousSalary: 2100,
    housingAllowance: 550,
    transportAllowance: 220,
    otherAllowances: 110,
    totalPackage: 3080,
    performance: 4.2,
    status: 'Pending',
    joinDate: '2024-01-01',
    lastRaiseDate: '2024-06-01',
    yearsOfService: 1,
    contractType: 'Contract',
    nextReviewDate: '2024-12-01',
    manager: 'Ahmed Hassan',
    salaryIncrease: 4.76
  }
])

const salaryHistory = ref([
  {
    effectiveDate: '2024-01-01',
    newSalary: 8500,
    previousSalary: 8000,
    change: 6.25,
    reason: 'Annual Performance Review',
    type: 'increase'
  },
  {
    effectiveDate: '2023-06-01',
    newSalary: 8000,
    previousSalary: 7500,
    change: 6.67,
    reason: 'Mid-year Adjustment',
    type: 'increase'
  },
  {
    effectiveDate: '2023-01-01',
    newSalary: 7500,
    previousSalary: 7200,
    change: 4.17,
    reason: 'Annual Raise',
    type: 'increase'
  }
])

const rules = {
  required: (value: any) => !!value || 'Required',
  positive: (value: any) => value > 0 || 'Must be positive'
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

  if (selectedGrade.value) {
    filtered = filtered.filter(emp => emp.grade === selectedGrade.value)
  }

  return filtered
})

const salaryDifference = computed(() => {
  if (!selectedEmployee.value) return 0
  return (Number(editData.value.currentSalary) || 0) - selectedEmployee.value.currentSalary
})

const percentageChange = computed(() => {
  if (!selectedEmployee.value || selectedEmployee.value.currentSalary === 0) return 0
  return (salaryDifference.value / selectedEmployee.value.currentSalary) * 100
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
    'Pending': 'warning',
    'Frozen': 'error',
    'Review': 'info'
  }
  return colors[status] || 'grey'
}

const getPerformanceText = (rating: number): string => {
  if (rating >= 4.5) return 'Excellent'
  if (rating >= 4) return 'Good'
  if (rating >= 3.5) return 'Average'
  if (rating >= 3) return 'Below Average'
  return 'Poor'
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedDepartment.value = null
  salaryRange.value = null
  selectedGrade.value = null
}

const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const editSalary = (employee: any) => {
  selectedEmployee.value = employee
  editData.value = {
    currentSalary: employee.currentSalary,
    housingAllowance: employee.housingAllowance,
    transportAllowance: employee.transportAllowance,
    otherAllowances: employee.otherAllowances,
    grade: employee.grade,
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: ''
  }
  showEditDialog.value = true
}

const viewSalaryHistory = (employee: any) => {
  selectedEmployee.value = employee
  showHistoryDialog.value = true
}

const saveSalaryChanges = () => {
  // Update employee data
  if (selectedEmployee.value) {
    const index = employees.value.findIndex(emp => emp.id === selectedEmployee.value.id)
    if (index !== -1) {
      employees.value[index] = {
        ...employees.value[index],
        ...editData.value,
        previousSalary: employees.value[index].currentSalary,
        lastRaiseDate: editData.value.effectiveDate
      }
    }
  }
  showEditDialog.value = false
  alert('Salary updated successfully!')
}

const openSalaryAdjustmentDialog = () => {
  alert('Salary Adjustment feature coming soon!')
}

const exportSalaryData = () => {
  alert('Export functionality coming soon!')
}

const bulkSalaryUpdate = () => {
  alert('Bulk update feature coming soon!')
}

const openSalaryGradeDialog = () => {
  alert('Salary grade configuration coming soon!')
}

const promoteSalary = (employee: any) => {
  alert(`Promotion feature for ${employee.name} coming soon!`)
}

const freezeSalary = (employee: any) => {
  alert(`Freeze salary for ${employee.name}?`)
}

const viewComparison = (employee: any) => {
  alert(`Salary comparison for ${employee.name} coming soon!`)
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.salary-management {
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
</style>