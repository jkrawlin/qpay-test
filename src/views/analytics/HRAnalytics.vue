<template>
  <div class="hr-analytics">
    <v-container fluid>
      <!-- Header -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h4 font-weight-bold text-primary mb-1">
                HR Analytics
              </h1>
              <p class="text-body-1 text-grey-darken-1 ma-0">
                Human Resources insights and workforce analytics
              </p>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                prepend-icon="mdi-filter"
                variant="outlined"
                @click="showFilters = !showFilters"
              >
                Filters
              </v-btn>
              <v-btn
                prepend-icon="mdi-download"
                color="primary"
                @click="exportHRReport"
              >
                Export HR Report
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Filters Panel -->
      <v-expand-transition>
        <v-row v-show="showFilters" class="mb-4">
          <v-col cols="12">
            <v-card elevation="1" class="pa-4">
              <v-row align="center">
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filters.department"
                    :items="departmentOptions"
                    label="Department"
                    variant="outlined"
                    density="compact"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filters.employeeType"
                    :items="employeeTypeOptions"
                    label="Employee Type"
                    variant="outlined"
                    density="compact"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="filters.tenure"
                    :items="tenureOptions"
                    label="Tenure Range"
                    variant="outlined"
                    density="compact"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-btn
                    block
                    color="primary"
                    @click="applyFilters"
                  >
                    Apply Filters
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-expand-transition>

      <!-- HR Metrics Overview -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" lg="3" v-for="metric in hrMetrics" :key="metric.title">
          <enhanced-card
            :icon="metric.icon"
            :icon-color="metric.color"
            hover
            class="metric-card"
          >
            <v-card-text class="pa-4">
              <div class="text-h4 font-weight-bold mb-1" :class="`text-${metric.color}`">
                {{ metric.value }}
              </div>
              <div class="text-body-2 text-grey-darken-1 mb-2">
                {{ metric.title }}
              </div>
              <div class="d-flex align-center">
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
            </v-card-text>
          </enhanced-card>
        </v-col>
      </v-row>

      <!-- Charts Row 1 -->
      <v-row class="mb-4">
        <!-- Employee Demographics -->
        <v-col cols="12" lg="6">
          <enhanced-card
            title="Employee Demographics"
            subtitle="Age distribution and diversity metrics"
            icon="mdi-account-group"
            icon-color="primary"
            :loading="loading"
          >
            <v-card-text>
              <v-chart
                :option="demographicsOption"
                style="height: 300px"
              />
            </v-card-text>
          </enhanced-card>
        </v-col>

        <!-- Turnover Analysis -->
        <v-col cols="12" lg="6">
          <enhanced-card
            title="Employee Turnover"
            subtitle="Monthly turnover rates and trends"
            icon="mdi-account-switch"
            icon-color="warning"
            :loading="loading"
          >
            <v-card-text>
              <apexchart
                type="line"
                height="300"
                :options="turnoverChartOptions"
                :series="turnoverChartSeries"
              />
            </v-card-text>
          </enhanced-card>
        </v-col>
      </v-row>

      <!-- Charts Row 2 -->
      <v-row class="mb-4">
        <!-- Performance Distribution -->
        <v-col cols="12" lg="4">
          <enhanced-card
            title="Performance Distribution"
            subtitle="Employee performance ratings"
            icon="mdi-chart-donut"
            icon-color="success"
            :loading="loading"
          >
            <v-card-text>
              <apexchart
                type="donut"
                height="280"
                :options="performanceChartOptions"
                :series="performanceChartSeries"
              />
            </v-card-text>
          </enhanced-card>
        </v-col>

        <!-- Salary Distribution -->
        <v-col cols="12" lg="8">
          <enhanced-card
            title="Salary Distribution by Department"
            subtitle="Compensation analysis across departments"
            icon="mdi-cash-multiple"
            icon-color="info"
            :loading="loading"
          >
            <v-card-text>
              <apexchart
                type="boxPlot"
                height="280"
                :options="salaryBoxplotOptions"
                :series="salaryBoxplotSeries"
              />
            </v-card-text>
          </enhanced-card>
        </v-col>
      </v-row>

      <!-- Attendance and Leave Analysis -->
      <v-row class="mb-4">
        <v-col cols="12" lg="6">
          <enhanced-card
            title="Attendance Trends"
            subtitle="Monthly attendance patterns"
            icon="mdi-calendar-check"
            icon-color="primary"
            :loading="loading"
          >
            <v-card-text>
              <v-chart
                :option="attendanceOption"
                style="height: 300px"
              />
            </v-card-text>
          </enhanced-card>
        </v-col>

        <v-col cols="12" lg="6">
          <enhanced-card
            title="Leave Analysis"
            subtitle="Leave types and utilization"
            icon="mdi-calendar-remove"
            icon-color="orange"
            :loading="loading"
          >
            <v-card-text>
              <apexchart
                type="bar"
                height="300"
                :options="leaveChartOptions"
                :series="leaveChartSeries"
              />
            </v-card-text>
          </enhanced-card>
        </v-col>
      </v-row>

      <!-- Detailed Analytics Tables -->
      <v-row>
        <v-col cols="12" lg="8">
          <enhanced-card
            title="Department Analytics"
            subtitle="Detailed department-wise HR metrics"
            icon="mdi-office-building"
            icon-color="purple"
          >
            <enhanced-data-table
              :columns="departmentAnalyticsColumns"
              :items="departmentAnalytics"
              :loading="loading"
              dense
              :paginated="false"
              :searchable="true"
              :exportable="true"
            >
              <template #item.headcount="{ value }">
                <v-chip size="small" color="primary" variant="flat">
                  {{ value }}
                </v-chip>
              </template>
              <template #item.turnoverRate="{ value }">
                <div class="d-flex align-center">
                  <v-progress-linear
                    :model-value="value"
                    :color="getTurnoverColor(value)"
                    height="6"
                    rounded
                    class="mr-2"
                  />
                  <span class="text-caption">{{ value }}%</span>
                </div>
              </template>
              <template #item.avgSalary="{ value }">
                <span class="font-weight-bold">{{ formatCurrency(value) }}</span>
              </template>
              <template #item.satisfaction="{ value }">
                <v-rating
                  :model-value="value / 20"
                  readonly
                  size="small"
                  density="compact"
                  color="amber"
                />
                <span class="text-caption ml-1">({{ value }}%)</span>
              </template>
            </enhanced-data-table>
          </enhanced-card>
        </v-col>

        <v-col cols="12" lg="4">
          <enhanced-card
            title="HR Alerts & Insights"
            subtitle="Important notifications and recommendations"
            icon="mdi-bell"
            icon-color="error"
          >
            <v-card-text class="pa-0">
              <v-list>
                <v-list-item
                  v-for="alert in hrAlerts"
                  :key="alert.id"
                  class="px-4 py-3"
                  :class="alert.priority === 'high' ? 'bg-error-lighten-5' : 
                         alert.priority === 'medium' ? 'bg-warning-lighten-5' : 'bg-info-lighten-5'"
                >
                  <template #prepend>
                    <v-avatar :color="alert.color" size="32">
                      <v-icon :icon="alert.icon" size="16" />
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-body-2 font-weight-medium">
                    {{ alert.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ alert.description }}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-chip
                      :color="alert.color"
                      size="x-small"
                      variant="flat"
                    >
                      {{ alert.priority.toUpperCase() }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </enhanced-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import EnhancedCard from '@/components/common/EnhancedCard.vue'
import EnhancedDataTable from '@/components/common/EnhancedDataTable.vue'

const { showSuccess, showError } = useToast()

// State
const loading = ref(false)
const showFilters = ref(false)

// Filters
const filters = ref({
  department: null,
  employeeType: null,
  tenure: null
})

const departmentOptions = [
  { title: 'All Departments', value: null },
  { title: 'Engineering', value: 'engineering' },
  { title: 'HR', value: 'hr' },
  { title: 'Finance', value: 'finance' },
  { title: 'Operations', value: 'operations' },
  { title: 'Sales', value: 'sales' }
]

const employeeTypeOptions = [
  { title: 'All Types', value: null },
  { title: 'Full-time', value: 'fulltime' },
  { title: 'Part-time', value: 'parttime' },
  { title: 'Contract', value: 'contract' },
  { title: 'Temporary', value: 'temporary' }
]

const tenureOptions = [
  { title: 'All Tenure', value: null },
  { title: '0-1 years', value: '0-1' },
  { title: '1-3 years', value: '1-3' },
  { title: '3-5 years', value: '3-5' },
  { title: '5+ years', value: '5+' }
]

// HR Metrics
const hrMetrics = ref([
  {
    title: 'Total Employees',
    value: '847',
    icon: 'mdi-account-group',
    color: 'primary',
    trend: 5.2
  },
  {
    title: 'Turnover Rate',
    value: '8.3%',
    icon: 'mdi-account-switch',
    color: 'warning',
    trend: -2.1
  },
  {
    title: 'Avg. Tenure',
    value: '3.2 years',
    icon: 'mdi-calendar-clock',
    color: 'info',
    trend: 8.7
  },
  {
    title: 'Satisfaction Score',
    value: '4.2/5',
    icon: 'mdi-heart',
    color: 'success',
    trend: 3.5
  }
])

// Demographics Chart
const demographicsOption = ref({
  title: {
    text: 'Age & Gender Distribution'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  legend: {
    data: ['Male', 'Female', 'Other']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['20-25', '26-30', '31-35', '36-40', '41-45', '46-50', '51-55', '56-60', '60+']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Male',
      type: 'bar',
      stack: 'gender',
      emphasis: { focus: 'series' },
      data: [45, 85, 120, 95, 75, 55, 35, 25, 15],
      itemStyle: { color: '#1976d2' }
    },
    {
      name: 'Female',
      type: 'bar',
      stack: 'gender',
      emphasis: { focus: 'series' },
      data: [35, 75, 110, 85, 65, 45, 30, 20, 10],
      itemStyle: { color: '#e91e63' }
    },
    {
      name: 'Other',
      type: 'bar',
      stack: 'gender',
      emphasis: { focus: 'series' },
      data: [2, 3, 5, 4, 3, 2, 1, 1, 0],
      itemStyle: { color: '#9c27b0' }
    }
  ]
})

// Turnover Chart
const turnoverChartOptions = {
  chart: { type: 'line', height: 300 },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },
  yaxis: {
    title: { text: 'Turnover Rate (%)' },
    min: 0,
    max: 15
  },
  colors: ['#ff9800', '#f44336'],
  markers: { size: 6 },
  grid: { borderColor: '#e7e7e7', row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 } }
}

const turnoverChartSeries = ref([
  {
    name: 'Voluntary',
    data: [5.2, 4.8, 6.1, 7.3, 8.9, 9.2, 8.7, 7.5, 6.8, 5.9, 6.2, 5.7]
  },
  {
    name: 'Involuntary',
    data: [1.2, 1.5, 2.1, 1.8, 2.3, 2.7, 2.4, 2.1, 1.9, 1.6, 1.8, 1.4]
  }
])

// Performance Chart
const performanceChartOptions = {
  chart: { type: 'donut' },
  labels: ['Excellent', 'Good', 'Average', 'Needs Improvement'],
  colors: ['#4caf50', '#2196f3', '#ff9800', '#f44336'],
  legend: { position: 'bottom' }
}

const performanceChartSeries = ref([35, 40, 20, 5])

// Salary Boxplot
const salaryBoxplotOptions = {
  chart: { type: 'boxPlot', height: 280 },
  title: { text: 'Salary Distribution (QAR)' },
  xaxis: {
    type: 'category',
    categories: ['Engineering', 'Operations', 'Sales', 'HR', 'Finance']
  },
  yaxis: {
    title: { text: 'Salary (QAR)' }
  },
  colors: ['#1976d2']
}

const salaryBoxplotSeries = ref([{
  name: 'Salary Range',
  data: [
    { x: 'Engineering', y: [8000, 12000, 15000, 18000, 25000] },
    { x: 'Operations', y: [6000, 8000, 10000, 12000, 16000] },
    { x: 'Sales', y: [5000, 7000, 9000, 11000, 15000] },
    { x: 'HR', y: [7000, 9000, 11000, 13000, 17000] },
    { x: 'Finance', y: [8000, 10000, 12000, 15000, 20000] }
  ]
}])

// Attendance Chart
const attendanceOption = ref({
  title: {
    text: 'Monthly Attendance Rate'
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },
  yAxis: {
    type: 'value',
    min: 85,
    max: 100,
    axisLabel: {
      formatter: '{value}%'
    }
  },
  series: [{
    data: [94.5, 92.8, 95.2, 93.7, 96.1, 94.8, 93.5, 95.3, 94.7, 96.2, 95.8, 96.5],
    type: 'line',
    smooth: true,
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(25, 118, 210, 0.3)' },
          { offset: 1, color: 'rgba(25, 118, 210, 0.05)' }
        ]
      }
    },
    itemStyle: { color: '#1976d2' }
  }]
})

// Leave Chart
const leaveChartOptions = {
  chart: { type: 'bar', height: 300 },
  plotOptions: {
    bar: { horizontal: true, columnWidth: '70%', endingShape: 'rounded' }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Annual Leave', 'Sick Leave', 'Maternity', 'Emergency', 'Personal']
  },
  colors: ['#ff9800', '#4caf50', '#e91e63', '#f44336', '#9c27b0']
}

const leaveChartSeries = ref([{
  name: 'Days Taken',
  data: [2845, 1234, 456, 678, 892]
}])

// Department Analytics Table
const departmentAnalyticsColumns = [
  { key: 'department', title: 'Department', sortable: true },
  { key: 'headcount', title: 'Headcount', align: 'center' },
  { key: 'turnoverRate', title: 'Turnover Rate', align: 'center' },
  { key: 'avgSalary', title: 'Avg Salary', type: 'currency' },
  { key: 'satisfaction', title: 'Satisfaction', align: 'center' }
]

const departmentAnalytics = ref([
  {
    department: 'Engineering',
    headcount: 245,
    turnoverRate: 6.2,
    avgSalary: 15500,
    satisfaction: 88
  },
  {
    department: 'Operations',
    headcount: 180,
    turnoverRate: 8.9,
    avgSalary: 10200,
    satisfaction: 82
  },
  {
    department: 'Sales',
    headcount: 125,
    turnoverRate: 12.5,
    avgSalary: 9800,
    satisfaction: 78
  },
  {
    department: 'HR',
    headcount: 45,
    turnoverRate: 4.2,
    avgSalary: 11800,
    satisfaction: 91
  },
  {
    department: 'Finance',
    headcount: 85,
    turnoverRate: 5.1,
    avgSalary: 13200,
    satisfaction: 85
  }
])

// HR Alerts
const hrAlerts = ref([
  {
    id: 1,
    title: 'High Turnover Alert',
    description: 'Sales department turnover rate exceeds 12%',
    priority: 'high',
    color: 'error',
    icon: 'mdi-alert-circle'
  },
  {
    id: 2,
    title: 'Performance Review Due',
    description: '25 employees due for quarterly review',
    priority: 'medium',
    color: 'warning',
    icon: 'mdi-calendar-alert'
  },
  {
    id: 3,
    title: 'Training Completion',
    description: 'Compliance training completion at 95%',
    priority: 'low',
    color: 'success',
    icon: 'mdi-school'
  },
  {
    id: 4,
    title: 'Leave Balance Alert',
    description: '15 employees with excessive leave balance',
    priority: 'medium',
    color: 'info',
    icon: 'mdi-calendar-remove'
  }
])

// Methods
const getTurnoverColor = (value: number) => {
  if (value <= 5) return 'success'
  if (value <= 10) return 'warning'
  return 'error'
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: 'QAR',
    minimumFractionDigits: 0
  }).format(value)
}

const applyFilters = () => {
  // Apply filters and refresh data
  console.log('Applying filters:', filters.value)
  showSuccess('Filters applied successfully')
}

const exportHRReport = () => {
  const reportData = {
    metrics: hrMetrics.value,
    departmentAnalytics: departmentAnalytics.value,
    alerts: hrAlerts.value,
    filters: filters.value,
    generatedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `hr_analytics_report_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  showSuccess('HR Analytics report exported successfully')
}

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1500)
})
</script>

<style scoped>
.hr-analytics {
  min-height: 100vh;
}

.metric-card {
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
}

:deep(.v-expansion-panels) {
  box-shadow: none;
}

:deep(.v-data-table) {
  background: transparent;
}
</style>
