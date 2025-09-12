<template>
  <div class="salary-management-enhanced">
    <v-container fluid>
      <!-- Header -->
      <v-row class="mb-4">
        <v-col cols="12">
          <enhanced-card class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <h1 class="text-h4 font-weight-bold text-primary mb-1">
                  Salary Management
                </h1>
                <p class="text-body-1 text-grey-darken-1 ma-0">
                  Comprehensive salary administration and compensation management
                </p>
              </div>
              <div class="d-flex gap-2">
                <v-btn
                  color="success"
                  prepend-icon="mdi-plus"
                  @click="showSalaryRevisionDialog = true"
                >
                  Salary Revision
                </v-btn>
                <v-btn
                  color="info"
                  variant="outlined"
                  prepend-icon="mdi-upload"
                  @click="showBulkUpdateDialog = true"
                >
                  Bulk Update
                </v-btn>
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-download"
                  @click="exportSalaryReport"
                >
                  Export Report
                </v-btn>
              </div>
            </div>
          </enhanced-card>
        </v-col>
      </v-row>

      <!-- Salary Overview Cards -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" lg="3" v-for="metric in salaryMetrics" :key="metric.title">
          <enhanced-card
            :icon="metric.icon"
            :icon-color="metric.color"
            hover
            class="metric-card"
          >
            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-h5 font-weight-bold mb-1" :class="`text-${metric.color}`">
                    {{ metric.value }}
                  </div>
                  <div class="text-body-2 text-grey-darken-1">
                    {{ metric.title }}
                  </div>
                  <div class="d-flex align-center mt-2" v-if="metric.trend">
                    <v-icon 
                      :icon="metric.trend > 0 ? 'mdi-trending-up' : 'mdi-trending-down'"
                      :color="metric.trend > 0 ? 'success' : 'error'"
                      size="small"
                      class="mr-1"
                    />
                    <span 
                      class="text-caption"
                      :class="metric.trend > 0 ? 'text-success' : 'text-error'"
                    >
                      {{ Math.abs(metric.trend) }}% vs last month
                    </span>
                  </div>
                </div>
                <v-icon 
                  :icon="metric.icon" 
                  :color="metric.color" 
                  size="32"
                  class="opacity-60"
                />
              </div>
            </v-card-text>
          </enhanced-card>
        </v-col>
      </v-row>

      <!-- Filters -->
      <v-row class="mb-4">
        <v-col cols="12">
          <enhanced-card
            title="Filters & Search"
            subtitle="Filter employees by various criteria"
            icon="mdi-filter"
            icon-color="primary"
            collapsible
          >
            <v-card-text class="pa-4">
              <v-row align="center">
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="filters.search"
                    prepend-inner-icon="mdi-magnify"
                    label="Search employees..."
                    variant="outlined"
                    density="compact"
                    clearable
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="2">
                  <v-select
                    v-model="filters.department"
                    :items="departmentOptions"
                    label="Department"
                    variant="outlined"
                    density="compact"
                    clearable
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="2">
                  <v-select
                    v-model="filters.position"
                    :items="positionOptions"
                    label="Position"
                    variant="outlined"
                    density="compact"
                    clearable
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="2">
                  <v-select
                    v-model="filters.salaryRange"
                    :items="salaryRangeOptions"
                    label="Salary Range"
                    variant="outlined"
                    density="compact"
                    clearable
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <div class="d-flex align-center gap-2">
                    <v-btn
                      color="primary"
                      @click="applyFilters"
                    >
                      Apply Filters
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      @click="clearFilters"
                    >
                      Clear
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </enhanced-card>
        </v-col>
      </v-row>

      <!-- Employee Salary Table -->
      <v-row class="mb-4">
        <v-col cols="12">
          <enhanced-card
            title="Employee Salaries"
            :subtitle="`${filteredEmployees.length} employees found`"
            icon="mdi-account-cash"
            icon-color="success"
          >
            <enhanced-data-table
              :columns="salaryColumns"
              :items="filteredEmployees"
              :loading="loading"
              :searchable="true"
              :exportable="true"
              :selectable="true"
              v-model:selected="selectedEmployees"
              @row-click="openEmployeeDetail"
            >
              <template #item.employee="{ item }">
                <div class="d-flex align-center">
                  <v-avatar color="primary" size="32" class="mr-3">
                    <span class="text-white font-weight-bold">
                      {{ getInitials(item.firstName, item.lastName) }}
                    </span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ item.firstName }} {{ item.lastName }}</div>
                    <div class="text-caption text-grey-darken-1">{{ item.employeeId }}</div>
                  </div>
                </div>
              </template>
              
              <template #item.basicSalary="{ value }">
                <span class="font-weight-bold text-success">{{ formatCurrency(value) }}</span>
              </template>
              
              <template #item.allowances="{ item }">
                <div class="text-caption">
                  <div>Housing: {{ formatCurrency(item.allowances.housing) }}</div>
                  <div>Transport: {{ formatCurrency(item.allowances.transport) }}</div>
                  <div>Other: {{ formatCurrency(item.allowances.other) }}</div>
                </div>
              </template>
              
              <template #item.totalSalary="{ value }">
                <span class="font-weight-bold text-primary text-h6">{{ formatCurrency(value) }}</span>
              </template>
              
              <template #item.lastRevision="{ value }">
                <v-chip
                  :color="getRevisionColor(value)"
                  size="small"
                  variant="flat"
                >
                  {{ formatDate(value) }}
                </v-chip>
              </template>
              
              <template #item.status="{ value }">
                <v-chip
                  :color="getStatusColor(value)"
                  size="small"
                  variant="flat"
                >
                  {{ value }}
                </v-chip>
              </template>
              
              <template #item.actions="{ item }">
                <div class="d-flex gap-1">
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    size="small"
                    color="primary"
                    @click.stop="editSalary(item)"
                  />
                  <v-btn
                    icon="mdi-history"
                    variant="text"
                    size="small"
                    color="info"
                    @click.stop="viewHistory(item)"
                  />
                  <v-btn
                    icon="mdi-file-document"
                    variant="text"
                    size="small"
                    color="success"
                    @click.stop="generatePayslip(item)"
                  />
                </div>
              </template>
            </enhanced-data-table>
            
            <!-- Bulk Actions -->
            <v-card-actions v-if="selectedEmployees.length > 0" class="pa-4 bg-grey-lighten-5">
              <v-chip class="mr-2" color="primary">
                {{ selectedEmployees.length }} selected
              </v-chip>
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                prepend-icon="mdi-pencil"
                @click="bulkSalaryUpdate"
              >
                Bulk Update
              </v-btn>
              <v-btn
                color="success"
                variant="outlined"
                size="small"
                prepend-icon="mdi-plus"
                @click="bulkAllowanceUpdate"
              >
                Add Allowance
              </v-btn>
              <v-btn
                color="info"
                variant="outlined"
                size="small"
                prepend-icon="mdi-file-export"
                @click="exportSelected"
              >
                Export Selected
              </v-btn>
            </v-card-actions>
          </enhanced-card>
        </v-col>
      </v-row>

      <!-- Salary Analytics -->
      <v-row>
        <v-col cols="12" lg="6">
          <enhanced-card
            title="Salary Distribution"
            subtitle="Salary ranges across departments"
            icon="mdi-chart-histogram"
            icon-color="info"
          >
            <v-card-text>
              <apexchart
                type="histogram"
                height="300"
                :options="salaryDistributionOptions"
                :series="salaryDistributionSeries"
              />
            </v-card-text>
          </enhanced-card>
        </v-col>
        
        <v-col cols="12" lg="6">
          <enhanced-card
            title="Department Payroll"
            subtitle="Total payroll by department"
            icon="mdi-office-building-cog"
            icon-color="warning"
          >
            <v-card-text>
              <apexchart
                type="bar"
                height="300"
                :options="departmentPayrollOptions"
                :series="departmentPayrollSeries"
              />
            </v-card-text>
          </enhanced-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Salary Revision Dialog -->
    <v-dialog v-model="showSalaryRevisionDialog" max-width="800">
      <enhanced-card
        title="Salary Revision"
        subtitle="Create a new salary revision for employee"
        icon="mdi-cash-plus"
        icon-color="success"
      >
        <v-card-text class="pa-6">
          <v-form ref="revisionForm" v-model="revisionFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="selectedEmployee"
                  :items="employees"
                  item-title="fullName"
                  item-value="id"
                  label="Select Employee"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || 'Employee is required']"
                  prepend-inner-icon="mdi-account"
                />
              </v-col>
              <v-col cols="12" md="6">
                <VueDatePicker
                  v-model="revisionData.effectiveDate"
                  placeholder="Effective Date"
                  format="yyyy-MM-dd"
                  :enable-time-picker="false"
                  :min-date="new Date()"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="revisionData.currentSalary"
                  label="Current Basic Salary"
                  variant="outlined"
                  density="compact"
                  type="number"
                  readonly
                  prepend-inner-icon="mdi-cash"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="revisionData.newSalary"
                  label="New Basic Salary"
                  variant="outlined"
                  density="compact"
                  type="number"
                  :rules="[v => !!v || 'New salary is required', v => v > 0 || 'Salary must be positive']"
                  prepend-inner-icon="mdi-cash-plus"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="revisionData.reason"
                  :items="revisionReasons"
                  label="Revision Reason"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || 'Reason is required']"
                  prepend-inner-icon="mdi-clipboard-text"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="percentageIncrease"
                  label="Percentage Increase"
                  variant="outlined"
                  density="compact"
                  readonly
                  suffix="%"
                  prepend-inner-icon="mdi-percent"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="revisionData.notes"
                  label="Notes"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  prepend-inner-icon="mdi-note-text"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showSalaryRevisionDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="success"
            :loading="saving"
            :disabled="!revisionFormValid"
            @click="saveSalaryRevision"
          >
            Save Revision
          </v-btn>
        </v-card-actions>
      </enhanced-card>
    </v-dialog>

    <!-- Bulk Update Dialog -->
    <v-dialog v-model="showBulkUpdateDialog" max-width="600">
      <enhanced-card
        title="Bulk Salary Update"
        subtitle="Apply salary changes to multiple employees"
        icon="mdi-account-group"
        icon-color="info"
      >
        <v-card-text class="pa-6">
          <v-form ref="bulkForm" v-model="bulkFormValid">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="bulkUpdateData.type"
                  :items="bulkUpdateTypes"
                  label="Update Type"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || 'Update type is required']"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="bulkUpdateData.value"
                  :label="bulkUpdateData.type === 'percentage' ? 'Percentage (%)' : 'Amount (QAR)'"
                  variant="outlined"
                  density="compact"
                  type="number"
                  :rules="[v => !!v || 'Value is required', v => v > 0 || 'Value must be positive']"
                />
              </v-col>
              <v-col cols="12" md="6">
                <VueDatePicker
                  v-model="bulkUpdateData.effectiveDate"
                  placeholder="Effective Date"
                  format="yyyy-MM-dd"
                  :enable-time-picker="false"
                  :min-date="new Date()"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="bulkUpdateData.reason"
                  label="Reason for Update"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  :rules="[v => !!v || 'Reason is required']"
                />
              </v-col>
            </v-row>
          </v-form>
          
          <v-alert
            v-if="selectedEmployees.length > 0"
            type="info"
            variant="tonal"
            class="mt-4"
          >
            This update will be applied to {{ selectedEmployees.length }} selected employee(s).
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showBulkUpdateDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="info"
            :loading="saving"
            :disabled="!bulkFormValid || selectedEmployees.length === 0"
            @click="saveBulkUpdate"
          >
            Apply Update
          </v-btn>
        </v-card-actions>
      </enhanced-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useToast } from '@/composables/useToast'
import { useDataTable } from '@/composables/useDataTable'
import { useAsync } from '@/composables/useAsync'
import EnhancedCard from '@/components/common/EnhancedCard.vue'
import EnhancedDataTable from '@/components/common/EnhancedDataTable.vue'

const { showSuccess, showError, showWarning } = useToast()
const { executeAsync, loading: saving } = useAsync()

// State
const loading = ref(false)
const selectedEmployees = ref([])
const showSalaryRevisionDialog = ref(false)
const showBulkUpdateDialog = ref(false)
const revisionFormValid = ref(false)
const bulkFormValid = ref(false)
const selectedEmployee = ref(null)

// Filters
const filters = reactive({
  search: '',
  department: null,
  position: null,
  salaryRange: null
})

// Form data
const revisionData = reactive({
  effectiveDate: new Date(),
  currentSalary: 0,
  newSalary: 0,
  reason: '',
  notes: ''
})

const bulkUpdateData = reactive({
  type: '',
  value: 0,
  effectiveDate: new Date(),
  reason: ''
})

// Salary Metrics
const salaryMetrics = ref([
  {
    title: 'Total Monthly Payroll',
    value: 'QAR 1.8M',
    icon: 'mdi-cash-multiple',
    color: 'success',
    trend: 5.2
  },
  {
    title: 'Average Salary',
    value: 'QAR 8,500',
    icon: 'mdi-calculator',
    color: 'primary',
    trend: 3.1
  },
  {
    title: 'Pending Revisions',
    value: '12',
    icon: 'mdi-clock-alert',
    color: 'warning',
    trend: -15.8
  },
  {
    title: 'Active Employees',
    value: '847',
    icon: 'mdi-account-group',
    color: 'info',
    trend: 2.4
  }
])

// Sample data
const employees = ref([
  {
    id: 1,
    employeeId: 'NIP_001',
    firstName: 'Ahmed',
    lastName: 'Al-Rashid',
    fullName: 'Ahmed Al-Rashid',
    department: 'Engineering',
    position: 'Senior Engineer',
    basicSalary: 12000,
    allowances: {
      housing: 3000,
      transport: 800,
      other: 500
    },
    totalSalary: 16300,
    lastRevision: '2024-01-15',
    status: 'Active'
  },
  {
    id: 2,
    employeeId: 'NIP_002',
    firstName: 'Fatima',
    lastName: 'Hassan',
    fullName: 'Fatima Hassan',
    department: 'HR',
    position: 'HR Manager',
    basicSalary: 15000,
    allowances: {
      housing: 4000,
      transport: 1000,
      other: 800
    },
    totalSalary: 20800,
    lastRevision: '2024-02-01',
    status: 'Active'
  },
  {
    id: 3,
    employeeId: 'NIP_003',
    firstName: 'Mohammed',
    lastName: 'Ali',
    fullName: 'Mohammed Ali',
    department: 'Operations',
    position: 'Supervisor',
    basicSalary: 8000,
    allowances: {
      housing: 2000,
      transport: 600,
      other: 300
    },
    totalSalary: 10900,
    lastRevision: '2023-12-10',
    status: 'Active'
  }
])

const filteredEmployees = computed(() => {
  let result = employees.value

  if (filters.search) {
    const search = filters.search.toLowerCase()
    result = result.filter(emp => 
      emp.firstName.toLowerCase().includes(search) ||
      emp.lastName.toLowerCase().includes(search) ||
      emp.employeeId.toLowerCase().includes(search)
    )
  }

  if (filters.department) {
    result = result.filter(emp => emp.department === filters.department)
  }

  if (filters.position) {
    result = result.filter(emp => emp.position === filters.position)
  }

  if (filters.salaryRange) {
    const [min, max] = filters.salaryRange.split('-').map(Number)
    result = result.filter(emp => emp.totalSalary >= min && emp.totalSalary <= max)
  }

  return result
})

const percentageIncrease = computed(() => {
  if (revisionData.currentSalary && revisionData.newSalary) {
    const increase = ((revisionData.newSalary - revisionData.currentSalary) / revisionData.currentSalary) * 100
    return increase.toFixed(2)
  }
  return '0.00'
})

// Data options
const departmentOptions = [
  'Engineering', 'HR', 'Operations', 'Finance', 'Construction', 'Quality Control'
]

const positionOptions = [
  'Senior Engineer', 'HR Manager', 'Supervisor', 'Project Manager', 'Technician', 'Operator'
]

const salaryRangeOptions = [
  { title: 'Below QAR 5,000', value: '0-5000' },
  { title: 'QAR 5,000 - 10,000', value: '5000-10000' },
  { title: 'QAR 10,000 - 15,000', value: '10000-15000' },
  { title: 'QAR 15,000 - 20,000', value: '15000-20000' },
  { title: 'Above QAR 20,000', value: '20000-999999' }
]

const revisionReasons = [
  'Annual Increment',
  'Promotion',
  'Performance Bonus',
  'Market Adjustment',
  'Cost of Living Adjustment',
  'Special Recognition'
]

const bulkUpdateTypes = [
  { title: 'Percentage Increase', value: 'percentage' },
  { title: 'Fixed Amount Increase', value: 'amount' }
]

// Table columns
const salaryColumns = [
  { key: 'employee', title: 'Employee', sortable: true },
  { key: 'department', title: 'Department', sortable: true },
  { key: 'position', title: 'Position', sortable: true },
  { key: 'basicSalary', title: 'Basic Salary', type: 'currency', sortable: true },
  { key: 'allowances', title: 'Allowances', align: 'center' },
  { key: 'totalSalary', title: 'Total Salary', type: 'currency', sortable: true },
  { key: 'lastRevision', title: 'Last Revision', align: 'center' },
  { key: 'status', title: 'Status', align: 'center' },
  { key: 'actions', title: 'Actions', align: 'center', sortable: false }
]

// Chart options
const salaryDistributionOptions = {
  chart: { type: 'histogram', height: 300 },
  xaxis: { title: { text: 'Salary Range (QAR)' } },
  yaxis: { title: { text: 'Number of Employees' } },
  colors: ['#1976d2']
}

const salaryDistributionSeries = ref([{
  name: 'Employees',
  data: [
    { x: '5000-7500', y: 25 },
    { x: '7500-10000', y: 45 },
    { x: '10000-12500', y: 38 },
    { x: '12500-15000', y: 28 },
    { x: '15000-17500', y: 15 },
    { x: '17500-20000', y: 8 },
    { x: '20000+', y: 5 }
  ]
}])

const departmentPayrollOptions = {
  chart: { type: 'bar', height: 300 },
  plotOptions: {
    bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' }
  },
  xaxis: { categories: ['Engineering', 'Operations', 'HR', 'Finance', 'Construction', 'QC'] },
  yaxis: { title: { text: 'Total Payroll (QAR)' } },
  colors: ['#ff9800']
}

const departmentPayrollSeries = ref([{
  name: 'Monthly Payroll',
  data: [450000, 280000, 180000, 220000, 380000, 120000]
}])

// Methods
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: 'QAR',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-QA')
}

const getRevisionColor = (date: string) => {
  const revisionDate = new Date(date)
  const now = new Date()
  const diffMonths = (now.getFullYear() - revisionDate.getFullYear()) * 12 + 
                     (now.getMonth() - revisionDate.getMonth())
  
  if (diffMonths <= 3) return 'success'
  if (diffMonths <= 6) return 'warning'
  return 'error'
}

const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    'Active': 'success',
    'Pending': 'warning',
    'Inactive': 'error'
  }
  return statusMap[status] || 'grey'
}

const applyFilters = () => {
  // Filters are reactive, so this just shows a success message
  showSuccess('Filters applied successfully')
}

const clearFilters = () => {
  filters.search = ''
  filters.department = null
  filters.position = null
  filters.salaryRange = null
  showSuccess('Filters cleared')
}

const openEmployeeDetail = (employee: any) => {
  // Open employee detail view
  console.log('Opening employee detail for:', employee)
}

const editSalary = (employee: any) => {
  selectedEmployee.value = employee.id
  revisionData.currentSalary = employee.basicSalary
  revisionData.newSalary = employee.basicSalary
  showSalaryRevisionDialog.value = true
}

const viewHistory = (employee: any) => {
  // Show salary history
  showSuccess(`Viewing salary history for ${employee.firstName} ${employee.lastName}`)
}

const generatePayslip = (employee: any) => {
  // Generate payslip
  showSuccess(`Generating payslip for ${employee.firstName} ${employee.lastName}`)
}

const bulkSalaryUpdate = () => {
  if (selectedEmployees.value.length === 0) {
    showWarning('Please select employees to update')
    return
  }
  showBulkUpdateDialog.value = true
}

const bulkAllowanceUpdate = () => {
  showSuccess('Bulk allowance update feature coming soon')
}

const exportSelected = () => {
  if (selectedEmployees.value.length === 0) {
    showWarning('Please select employees to export')
    return
  }
  showSuccess(`Exporting ${selectedEmployees.value.length} employee records`)
}

const exportSalaryReport = () => {
  const reportData = {
    employees: filteredEmployees.value,
    metrics: salaryMetrics.value,
    generatedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `salary_report_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  showSuccess('Salary report exported successfully')
}

const saveSalaryRevision = async () => {
  await executeAsync(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update employee salary
    const employee = employees.value.find(emp => emp.id === selectedEmployee.value)
    if (employee) {
      employee.basicSalary = revisionData.newSalary
      employee.totalSalary = revisionData.newSalary + 
                            employee.allowances.housing + 
                            employee.allowances.transport + 
                            employee.allowances.other
      employee.lastRevision = new Date().toISOString().split('T')[0]
    }
    
    showSuccess('Salary revision saved successfully')
    showSalaryRevisionDialog.value = false
    
    // Reset form
    Object.assign(revisionData, {
      effectiveDate: new Date(),
      currentSalary: 0,
      newSalary: 0,
      reason: '',
      notes: ''
    })
  }, 'Saving salary revision...')
}

const saveBulkUpdate = async () => {
  await executeAsync(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Apply bulk update
    selectedEmployees.value.forEach((empId: number) => {
      const employee = employees.value.find(emp => emp.id === empId)
      if (employee) {
        if (bulkUpdateData.type === 'percentage') {
          employee.basicSalary = Math.round(employee.basicSalary * (1 + bulkUpdateData.value / 100))
        } else {
          employee.basicSalary += bulkUpdateData.value
        }
        
        employee.totalSalary = employee.basicSalary + 
                              employee.allowances.housing + 
                              employee.allowances.transport + 
                              employee.allowances.other
        employee.lastRevision = new Date().toISOString().split('T')[0]
      }
    })
    
    showSuccess(`Bulk update applied to ${selectedEmployees.value.length} employees`)
    showBulkUpdateDialog.value = false
    selectedEmployees.value = []
    
    // Reset form
    Object.assign(bulkUpdateData, {
      type: '',
      value: 0,
      effectiveDate: new Date(),
      reason: ''
    })
  }, 'Applying bulk update...')
}

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
})
</script>

<style scoped>
.salary-management-enhanced {
  min-height: 100vh;
}

.metric-card {
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

:deep(.v-data-table) {
  background: transparent;
}

:deep(.v-dialog .v-card) {
  overflow: visible;
}
</style>