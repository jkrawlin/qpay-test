<template>
  <div class="analytics-dashboard">
    <v-container fluid>
      <!-- Header -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h4 font-weight-bold text-primary mb-1">
                Analytics Dashboard
              </h1>
              <p class="text-body-1 text-grey-darken-1 ma-0">
                Comprehensive insights and business intelligence
              </p>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                prepend-icon="mdi-refresh"
                variant="outlined"
                @click="refreshData"
                :loading="loading"
              >
                Refresh
              </v-btn>
              <v-btn
                prepend-icon="mdi-download"
                color="primary"
                @click="exportReport"
              >
                Export Report
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Time Period Filter -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card elevation="1">
            <v-card-text class="pa-3">
              <v-row align="center">
                <v-col cols="12" md="3">
                  <v-select
                    v-model="selectedPeriod"
                    :items="periodOptions"
                    label="Time Period"
                    variant="outlined"
                    density="compact"
                    @update:model-value="updateChartData"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <VueDatePicker
                    v-model="dateRange"
                    range
                    format="yyyy-MM-dd"
                    :enable-time-picker="false"
                    placeholder="Select date range"
                    @update:model-value="updateChartData"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="selectedDepartment"
                    :items="departmentOptions"
                    label="Department"
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:model-value="updateChartData"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-btn
                    block
                    color="primary"
                    variant="outlined"
                    @click="applyFilters"
                  >
                    Apply Filters
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Key Metrics Cards -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" lg="3" v-for="metric in keyMetrics" :key="metric.title">
          <enhanced-card
            :icon="metric.icon"
            :icon-color="metric.color"
            hover
            class="metric-card"
          >
            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between align-center">
                <div>
                  <div class="text-h4 font-weight-bold mb-1" :class="`text-${metric.color}`">
                    {{ metric.value }}
                  </div>
                  <div class="text-body-2 text-grey-darken-1">
                    {{ metric.title }}
                  </div>
                  <div class="d-flex align-center mt-2">
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
                <div>
                  <apexchart
                    type="line"
                    height="60"
                    width="100"
                    :options="getSparklineOptions(metric.color)"
                    :series="[{ data: metric.sparklineData }]"
                  />
                </div>
              </div>
            </v-card-text>
          </enhanced-card>
        </v-col>
      </v-row>

      <!-- Charts Row -->
      <v-row class="mb-4">
        <!-- Revenue Trend -->
        <v-col cols="12" lg="8">
          <enhanced-card
            title="Revenue & Expense Trends"
            subtitle="Monthly financial performance overview"
            icon="mdi-chart-line"
            icon-color="primary"
            :loading="loading"
          >
            <v-card-text>
              <apexchart
                type="area"
                height="350"
                :options="revenueChartOptions"
                :series="revenueChartSeries"
              />
            </v-card-text>
          </enhanced-card>
        </v-col>

        <!-- Department Performance -->
        <v-col cols="12" lg="4">
          <enhanced-card
            title="Department Performance"
            subtitle="Revenue by department"
            icon="mdi-office-building"
            icon-color="success"
            :loading="loading"
          >
            <v-card-text>
              <apexchart
                type="donut"
                height="350"
                :options="departmentChartOptions"
                :series="departmentChartSeries"
              />
            </v-card-text>
          </enhanced-card>
        </v-col>
      </v-row>

      <!-- Employee Analytics -->
      <v-row class="mb-4">
        <v-col cols="12" lg="6">
          <enhanced-card
            title="Employee Growth"
            subtitle="Hiring trends and workforce expansion"
            icon="mdi-account-multiple"
            icon-color="info"
            :loading="loading"
          >
            <v-card-text>
              <v-chart
                :option="employeeGrowthOption"
                style="height: 300px"
              />
            </v-card-text>
          </enhanced-card>
        </v-col>

        <v-col cols="12" lg="6">
          <enhanced-card
            title="Payroll Distribution"
            subtitle="Salary ranges across departments"
            icon="mdi-cash-multiple"
            icon-color="warning"
            :loading="loading"
          >
            <v-card-text>
              <apexchart
                type="bar"
                height="300"
                :options="payrollChartOptions"
                :series="payrollChartSeries"
              />
            </v-card-text>
          </enhanced-card>
        </v-col>
      </v-row>

      <!-- Data Tables -->
      <v-row>
        <v-col cols="12" lg="8">
          <enhanced-card
            title="Top Performing Employees"
            subtitle="Based on productivity metrics"
            icon="mdi-trophy"
            icon-color="gold"
          >
            <enhanced-data-table
              :columns="employeeColumns"
              :items="topEmployees"
              :loading="loading"
              dense
              :paginated="false"
              :searchable="false"
              :exportable="false"
            >
              <template #item.performance="{ value }">
                <v-progress-linear
                  :model-value="value"
                  :color="getPerformanceColor(value)"
                  height="8"
                  rounded
                />
                <span class="text-caption ml-2">{{ value }}%</span>
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
            </enhanced-data-table>
          </enhanced-card>
        </v-col>

        <v-col cols="12" lg="4">
          <enhanced-card
            title="Recent Activities"
            subtitle="Latest system activities"
            icon="mdi-clock-outline"
            icon-color="primary"
          >
            <v-card-text class="pa-0">
              <v-list>
                <v-list-item
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  class="px-4 py-2"
                >
                  <template #prepend>
                    <v-avatar :color="activity.color" size="32">
                      <v-icon :icon="activity.icon" size="16" />
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-body-2">
                    {{ activity.title }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ activity.time }}
                  </v-list-item-subtitle>
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
import { ref, onMounted, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import EnhancedCard from '@/components/common/EnhancedCard.vue'
import EnhancedDataTable from '@/components/common/EnhancedDataTable.vue'

const { showSuccess, showError } = useToast()

// State
const loading = ref(false)
const selectedPeriod = ref('last_6_months')
const selectedDepartment = ref(null)
const dateRange = ref([
  new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
  new Date()
])

// Options
const periodOptions = [
  { title: 'Last 30 Days', value: 'last_30_days' },
  { title: 'Last 3 Months', value: 'last_3_months' },
  { title: 'Last 6 Months', value: 'last_6_months' },
  { title: 'Last Year', value: 'last_year' },
  { title: 'Custom Range', value: 'custom' }
]

const departmentOptions = [
  { title: 'All Departments', value: null },
  { title: 'Engineering', value: 'engineering' },
  { title: 'HR', value: 'hr' },
  { title: 'Finance', value: 'finance' },
  { title: 'Operations', value: 'operations' },
  { title: 'Sales', value: 'sales' }
]

// Key Metrics
const keyMetrics = ref([
  {
    title: 'Total Revenue',
    value: 'QAR 2.4M',
    icon: 'mdi-currency-usd',
    color: 'success',
    trend: 12.5,
    sparklineData: [10, 15, 12, 18, 20, 25, 22, 28, 30, 35, 32, 40]
  },
  {
    title: 'Active Employees',
    value: '847',
    icon: 'mdi-account-group',
    color: 'primary',
    trend: 8.2,
    sparklineData: [100, 105, 108, 112, 115, 118, 120, 125, 128, 130, 135, 140]
  },
  {
    title: 'Monthly Payroll',
    value: 'QAR 1.8M',
    icon: 'mdi-cash',
    color: 'warning',
    trend: -2.1,
    sparklineData: [80, 85, 88, 82, 78, 75, 72, 70, 68, 65, 62, 60]
  },
  {
    title: 'Compliance Score',
    value: '94%',
    icon: 'mdi-shield-check',
    color: 'info',
    trend: 5.3,
    sparklineData: [85, 87, 89, 90, 88, 91, 93, 94, 96, 95, 94, 94]
  }
])

// Chart Options and Data
const revenueChartOptions = {
  chart: {
    type: 'area',
    height: 350,
    toolbar: { show: true }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },
  tooltip: { x: { format: 'dd/MM/yy HH:mm' } },
  colors: ['#1976d2', '#ff5722'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.1
    }
  }
}

const revenueChartSeries = ref([
  {
    name: 'Revenue',
    data: [180000, 210000, 190000, 240000, 220000, 280000, 250000, 290000, 270000, 310000, 295000, 340000]
  },
  {
    name: 'Expenses',
    data: [120000, 140000, 130000, 160000, 150000, 180000, 170000, 190000, 180000, 200000, 195000, 220000]
  }
])

const departmentChartOptions = {
  chart: { type: 'donut' },
  labels: ['Engineering', 'Operations', 'Sales', 'HR', 'Finance'],
  colors: ['#1976d2', '#4caf50', '#ff9800', '#9c27b0', '#f44336'],
  legend: { position: 'bottom' },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: { width: 200 },
      legend: { position: 'bottom' }
    }
  }]
}

const departmentChartSeries = ref([45, 25, 15, 10, 5])

const employeeGrowthOption = ref({
  title: {
    text: 'Employee Growth Trend',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: [750, 765, 780, 785, 800, 815, 825, 830, 835, 840, 845, 847],
    type: 'line',
    smooth: true,
    itemStyle: { color: '#1976d2' },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(25, 118, 210, 0.3)' },
          { offset: 1, color: 'rgba(25, 118, 210, 0.05)' }
        ]
      }
    }
  }]
})

const payrollChartOptions = {
  chart: { type: 'bar', height: 300 },
  plotOptions: {
    bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' }
  },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: ['transparent'] },
  xaxis: { categories: ['Engineering', 'Operations', 'Sales', 'HR', 'Finance'] },
  yaxis: { title: { text: 'QAR (thousands)' } },
  fill: { opacity: 1 },
  tooltip: {
    y: {
      formatter: function (val: number) {
        return "QAR " + val + "K"
      }
    }
  },
  colors: ['#1976d2', '#4caf50', '#ff9800']
}

const payrollChartSeries = ref([
  { name: 'Average Salary', data: [85, 75, 65, 55, 70] },
  { name: 'Total Payroll', data: [450, 300, 180, 120, 200] },
  { name: 'Bonuses', data: [25, 20, 15, 10, 18] }
])

// Employee Table
const employeeColumns = [
  { key: 'name', title: 'Employee', sortable: true },
  { key: 'department', title: 'Department', sortable: true },
  { key: 'performance', title: 'Performance', align: 'center' },
  { key: 'revenue', title: 'Revenue Generated', type: 'currency' },
  { key: 'status', title: 'Status', align: 'center' }
]

const topEmployees = ref([
  {
    name: 'Ahmed Al-Rashid',
    department: 'Engineering',
    performance: 95,
    revenue: 120000,
    status: 'Excellent'
  },
  {
    name: 'Fatima Hassan',
    department: 'Sales',
    performance: 92,
    revenue: 180000,
    status: 'Excellent'
  },
  {
    name: 'Mohammed Ali',
    department: 'Operations',
    performance: 88,
    revenue: 95000,
    status: 'Good'
  },
  {
    name: 'Sarah Ibrahim',
    department: 'HR',
    performance: 85,
    revenue: 75000,
    status: 'Good'
  },
  {
    name: 'Omar Abdullah',
    department: 'Finance',
    performance: 90,
    revenue: 110000,
    status: 'Excellent'
  }
])

const recentActivities = ref([
  {
    id: 1,
    title: 'New employee onboarded',
    time: '5 minutes ago',
    icon: 'mdi-account-plus',
    color: 'success'
  },
  {
    id: 2,
    title: 'Payroll processed for September',
    time: '2 hours ago',
    icon: 'mdi-cash',
    color: 'primary'
  },
  {
    id: 3,
    title: 'Compliance audit completed',
    time: '4 hours ago',
    icon: 'mdi-shield-check',
    color: 'info'
  },
  {
    id: 4,
    title: 'Performance review scheduled',
    time: '1 day ago',
    icon: 'mdi-calendar',
    color: 'warning'
  }
])

// Methods
const getSparklineOptions = (color: string) => ({
  chart: {
    type: 'line',
    width: 100,
    height: 60,
    sparkline: { enabled: true }
  },
  stroke: { curve: 'smooth', width: 2 },
  colors: [getColorValue(color)],
  tooltip: { enabled: false }
})

const getColorValue = (color: string) => {
  const colorMap: Record<string, string> = {
    primary: '#1976d2',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
    error: '#f44336'
  }
  return colorMap[color] || '#1976d2'
}

const getPerformanceColor = (value: number) => {
  if (value >= 90) return 'success'
  if (value >= 80) return 'primary'
  if (value >= 70) return 'warning'
  return 'error'
}

const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    'Excellent': 'success',
    'Good': 'primary',
    'Average': 'warning',
    'Poor': 'error'
  }
  return statusMap[status] || 'grey'
}

const refreshData = async () => {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update data with random variations
    keyMetrics.value.forEach(metric => {
      metric.trend = (Math.random() - 0.5) * 20
    })
    
    showSuccess('Analytics data refreshed successfully')
  } catch (error) {
    showError('Failed to refresh analytics data')
  } finally {
    loading.value = false
  }
}

const updateChartData = () => {
  // Update charts based on selected filters
  console.log('Updating charts for:', selectedPeriod.value, selectedDepartment.value)
}

const applyFilters = () => {
  updateChartData()
  showSuccess('Filters applied successfully')
}

const exportReport = () => {
  // Generate comprehensive analytics report
  const reportData = {
    metrics: keyMetrics.value,
    employees: topEmployees.value,
    period: selectedPeriod.value,
    department: selectedDepartment.value,
    generatedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  showSuccess('Analytics report exported successfully')
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.analytics-dashboard {
  min-height: 100vh;
}

.metric-card {
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
}

:deep(.apexcharts-toolbar) {
  background: transparent !important;
}

:deep(.v-data-table) {
  background: transparent;
}
</style>
