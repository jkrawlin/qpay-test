<template>
  <div class="financial-analytics">
    <v-container fluid>
      <!-- Header -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h4 font-weight-bold text-primary mb-1">
                Financial Analytics
              </h1>
              <p class="text-body-1 text-grey-darken-1 ma-0">
                Comprehensive financial insights and performance metrics
              </p>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                prepend-icon="mdi-calendar"
                variant="outlined"
                @click="showDatePicker = !showDatePicker"
              >
                {{ formatDateRange() }}
              </v-btn>
              <v-btn
                prepend-icon="mdi-file-excel"
                color="success"
                @click="exportFinancialReport"
              >
                Export to Excel
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Date Range Picker -->
      <v-expand-transition>
        <v-row v-show="showDatePicker" class="mb-4">
          <v-col cols="12" md="6" lg="4">
            <v-card elevation="1" class="pa-4">
              <v-card-title class="text-subtitle-1 pa-0 mb-3">Select Date Range</v-card-title>
              <VueDatePicker
                v-model="selectedDateRange"
                range
                format="yyyy-MM-dd"
                :enable-time-picker="false"
                placeholder="Select date range"
                @update:model-value="updateFinancialData"
              />
              <v-card-actions class="pa-0 pt-3">
                <v-spacer />
                <v-btn
                  color="primary"
                  size="small"
                  @click="showDatePicker = false"
                >
                  Apply
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-expand-transition>

      <!-- Financial KPIs -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" lg="3" v-for="kpi in financialKPIs" :key="kpi.title">
          <enhanced-card
            :icon="kpi.icon"
            :icon-color="kpi.color"
            hover
            class="kpi-card"
          >
            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between align-start">
                <div class="flex-grow-1">
                  <div class="text-h4 font-weight-bold mb-1" :class="`text-${kpi.color}`">
                    {{ kpi.value }}
                  </div>
                  <div class="text-body-2 text-grey-darken-1 mb-2">
                    {{ kpi.title }}
                  </div>
                  <div class="d-flex align-center">
                    <v-icon 
                      :icon="kpi.trend > 0 ? 'mdi-trending-up' : 'mdi-trending-down'"
                      :color="kpi.trend > 0 ? 'success' : 'error'"
                      size="small"
                      class="mr-1"
                    />
                    <span 
                      class="text-caption"
                      :class="kpi.trend > 0 ? 'text-success' : 'text-error'"
                    >
                      {{ Math.abs(kpi.trend) }}%
                    </span>
                  </div>
                </div>
                <div>
                  <v-icon 
                    :icon="kpi.icon" 
                    :color="kpi.color" 
                    size="24"
                    class="opacity-60"
                  />
                </div>
              </div>
            </v-card-text>
          </enhanced-card>
        </v-col>
      </v-row>

      <!-- Revenue & Profit Analysis -->
      <v-row class="mb-4">
        <v-col cols="12" lg="8">
          <enhanced-card
            title="Revenue vs Profit Analysis"
            subtitle="Monthly revenue and profit trends"
            icon="mdi-chart-line"
            icon-color="primary"
            :loading="loading"
          >
            <v-card-text>
              <v-tabs v-model="revenueTab" class="mb-4">
                <v-tab value="monthly">Monthly View</v-tab>
                <v-tab value="quarterly">Quarterly View</v-tab>
                <v-tab value="yearly">Yearly View</v-tab>
              </v-tabs>
              
              <v-window v-model="revenueTab">
                <v-window-item value="monthly">
                  <apexchart
                    type="area"
                    height="350"
                    :options="revenueChartOptions"
                    :series="monthlyRevenueSeries"
                  />
                </v-window-item>
                <v-window-item value="quarterly">
                  <apexchart
                    type="column"
                    height="350"
                    :options="quarterlyChartOptions"
                    :series="quarterlyRevenueSeries"
                  />
                </v-window-item>
                <v-window-item value="yearly">
                  <apexchart
                    type="line"
                    height="350"
                    :options="yearlyChartOptions"
                    :series="yearlyRevenueSeries"
                  />
                </v-window-item>
              </v-window>
            </v-card-text>
          </enhanced-card>
        </v-col>

        <v-col cols="12" lg="4">
          <enhanced-card
            title="Cost Breakdown"
            subtitle="Expense distribution"
            icon="mdi-chart-pie"
            icon-color="warning"
            :loading="loading"
          >
            <v-card-text>
              <apexchart
                type="donut"
                height="350"
                :options="costBreakdownOptions"
                :series="costBreakdownSeries"
              />
            </v-card-text>
          </enhanced-card>
        </v-col>
      </v-row>

      <!-- Cash Flow & Budgets -->
      <v-row class="mb-4">
        <v-col cols="12" lg="6">
          <enhanced-card
            title="Cash Flow Statement"
            subtitle="Operating, investing, and financing activities"
            icon="mdi-cash-flow"
            icon-color="info"
            :loading="loading"
          >
            <v-card-text>
              <v-chart
                :option="cashFlowOption"
                style="height: 350px"
              />
            </v-card-text>
          </enhanced-card>
        </v-col>

        <v-col cols="12" lg="6">
          <enhanced-card
            title="Budget vs Actual"
            subtitle="Budget performance by category"
            icon="mdi-target"
            icon-color="success"
            :loading="loading"
          >
            <v-card-text>
              <apexchart
                type="bar"
                height="350"
                :options="budgetChartOptions"
                :series="budgetChartSeries"
              />
            </v-card-text>
          </enhanced-card>
        </v-col>
      </v-row>

      <!-- Financial Ratios & Detailed Analytics -->
      <v-row class="mb-4">
        <v-col cols="12" lg="4">
          <enhanced-card
            title="Financial Ratios"
            subtitle="Key financial health indicators"
            icon="mdi-calculator"
            icon-color="purple"
          >
            <v-card-text class="pa-0">
              <v-list>
                <v-list-item
                  v-for="ratio in financialRatios"
                  :key="ratio.name"
                  class="px-4 py-3"
                >
                  <template #prepend>
                    <v-avatar :color="ratio.color" size="32" class="mr-3">
                      <v-icon :icon="ratio.icon" size="16" />
                    </v-avatar>
                  </template>
                  <div class="d-flex justify-space-between align-center w-100">
                    <div>
                      <v-list-item-title class="text-body-2 font-weight-medium">
                        {{ ratio.name }}
                      </v-list-item-title>
                      <v-list-item-subtitle class="text-caption">
                        {{ ratio.description }}
                      </v-list-item-subtitle>
                    </div>
                    <div class="text-right">
                      <div class="text-h6 font-weight-bold" :class="`text-${ratio.color}`">
                        {{ ratio.value }}
                      </div>
                      <div class="text-caption" :class="ratio.status === 'good' ? 'text-success' : 
                                                      ratio.status === 'average' ? 'text-warning' : 'text-error'">
                        {{ ratio.status.toUpperCase() }}
                      </div>
                    </div>
                  </div>
                </v-list-item>
              </v-list>
            </v-card-text>
          </enhanced-card>
        </v-col>

        <v-col cols="12" lg="8">
          <enhanced-card
            title="Monthly Financial Summary"
            subtitle="Detailed monthly financial breakdown"
            icon="mdi-table"
            icon-color="primary"
          >
            <enhanced-data-table
              :columns="financialSummaryColumns"
              :items="financialSummaryData"
              :loading="loading"
              dense
              :paginated="true"
              :items-per-page="6"
              :searchable="true"
              :exportable="true"
            >
              <template #item.month="{ value }">
                <span class="font-weight-bold">{{ value }}</span>
              </template>
              <template #item.revenue="{ value }">
                <span class="text-success font-weight-bold">{{ formatCurrency(value) }}</span>
              </template>
              <template #item.expenses="{ value }">
                <span class="text-error">{{ formatCurrency(value) }}</span>
              </template>
              <template #item.profit="{ value }">
                <span 
                  class="font-weight-bold"
                  :class="value > 0 ? 'text-success' : 'text-error'"
                >
                  {{ formatCurrency(value) }}
                </span>
              </template>
              <template #item.margin="{ value }">
                <v-progress-linear
                  :model-value="Math.abs(value)"
                  :color="value > 0 ? 'success' : 'error'"
                  height="8"
                  rounded
                />
                <span class="text-caption ml-2">{{ value.toFixed(1) }}%</span>
              </template>
            </enhanced-data-table>
          </enhanced-card>
        </v-col>
      </v-row>

      <!-- Financial Forecasting -->
      <v-row>
        <v-col cols="12">
          <enhanced-card
            title="Financial Forecasting"
            subtitle="12-month revenue and expense projections"
            icon="mdi-crystal-ball"
            icon-color="indigo"
            :loading="loading"
          >
            <v-card-text>
              <div class="d-flex justify-space-between align-center mb-4">
                <v-btn-toggle v-model="forecastModel" mandatory>
                  <v-btn value="linear">Linear Trend</v-btn>
                  <v-btn value="seasonal">Seasonal</v-btn>
                  <v-btn value="advanced">ML Model</v-btn>
                </v-btn-toggle>
                
                <div class="d-flex align-center gap-2">
                  <v-chip color="primary" size="small">
                    Accuracy: 92.5%
                  </v-chip>
                  <v-chip color="success" size="small">
                    Confidence: High
                  </v-chip>
                </div>
              </div>
              
              <apexchart
                type="area"
                height="400"
                :options="forecastChartOptions"
                :series="forecastChartSeries"
              />
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
const showDatePicker = ref(false)
const revenueTab = ref('monthly')
const forecastModel = ref('linear')

const selectedDateRange = ref([
  new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
  new Date()
])

// Financial KPIs
const financialKPIs = ref([
  {
    title: 'Total Revenue',
    value: 'QAR 3.2M',
    icon: 'mdi-trending-up',
    color: 'success',
    trend: 15.2
  },
  {
    title: 'Net Profit',
    value: 'QAR 850K',
    icon: 'mdi-cash-plus',
    color: 'primary',
    trend: 8.7
  },
  {
    title: 'Operating Expenses',
    value: 'QAR 2.1M',
    icon: 'mdi-cash-minus',
    color: 'warning',
    trend: -3.5
  },
  {
    title: 'Cash Flow',
    value: 'QAR 1.2M',
    icon: 'mdi-water',
    color: 'info',
    trend: 12.1
  }
])

// Chart Options
const revenueChartOptions = {
  chart: { type: 'area', height: 350, toolbar: { show: true } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },
  yaxis: {
    title: { text: 'Amount (QAR)' },
    labels: {
      formatter: function (value: number) {
        return 'QAR ' + (value / 1000).toFixed(0) + 'K'
      }
    }
  },
  colors: ['#4caf50', '#1976d2', '#ff5722'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.1
    }
  },
  legend: { position: 'top' }
}

const monthlyRevenueSeries = ref([
  {
    name: 'Revenue',
    data: [280000, 320000, 290000, 350000, 310000, 380000, 340000, 420000, 390000, 450000, 410000, 480000]
  },
  {
    name: 'Profit',
    data: [65000, 78000, 70000, 85000, 72000, 95000, 82000, 105000, 94000, 115000, 98000, 125000]
  },
  {
    name: 'Expenses',
    data: [215000, 242000, 220000, 265000, 238000, 285000, 258000, 315000, 296000, 335000, 312000, 355000]
  }
])

const quarterlyChartOptions = {
  chart: { type: 'column', height: 350 },
  plotOptions: {
    bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' }
  },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: ['transparent'] },
  xaxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4'] },
  yaxis: {
    title: { text: 'Amount (QAR)' },
    labels: {
      formatter: function (value: number) {
        return 'QAR ' + (value / 1000).toFixed(0) + 'K'
      }
    }
  },
  colors: ['#4caf50', '#1976d2', '#ff5722']
}

const quarterlyRevenueSeries = ref([
  { name: 'Revenue', data: [890000, 1040000, 1150000, 1340000] },
  { name: 'Profit', data: [213000, 252000, 291000, 338000] },
  { name: 'Expenses', data: [677000, 788000, 859000, 1002000] }
])

const yearlyChartOptions = {
  chart: { type: 'line', height: 350 },
  stroke: { curve: 'smooth', width: 4 },
  xaxis: { categories: ['2020', '2021', '2022', '2023', '2024'] },
  yaxis: {
    title: { text: 'Amount (QAR)' },
    labels: {
      formatter: function (value: number) {
        return 'QAR ' + (value / 1000000).toFixed(1) + 'M'
      }
    }
  },
  colors: ['#4caf50', '#1976d2', '#ff5722'],
  markers: { size: 6 }
}

const yearlyRevenueSeries = ref([
  { name: 'Revenue', data: [2800000, 3200000, 3800000, 4200000, 4420000] },
  { name: 'Profit', data: [650000, 780000, 920000, 1050000, 1094000] },
  { name: 'Expenses', data: [2150000, 2420000, 2880000, 3150000, 3326000] }
])

// Cost Breakdown
const costBreakdownOptions = {
  chart: { type: 'donut' },
  labels: ['Salaries', 'Operations', 'Technology', 'Marketing', 'Admin', 'Other'],
  colors: ['#1976d2', '#4caf50', '#ff9800', '#9c27b0', '#f44336', '#607d8b'],
  legend: { position: 'bottom' },
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total Expenses',
            formatter: () => 'QAR 2.1M'
          }
        }
      }
    }
  }
}

const costBreakdownSeries = ref([65, 15, 8, 5, 4, 3])

// Cash Flow Chart
const cashFlowOption = ref({
  title: { text: 'Cash Flow Analysis' },
  tooltip: { trigger: 'axis' },
  legend: { data: ['Operating', 'Investing', 'Financing', 'Net Cash Flow'] },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: 'Operating',
      type: 'bar',
      data: [85000, 95000, 78000, 110000, 92000, 125000, 108000, 135000, 118000, 145000, 128000, 155000],
      itemStyle: { color: '#4caf50' }
    },
    {
      name: 'Investing',
      type: 'bar',
      data: [-25000, -15000, -35000, -20000, -45000, -30000, -25000, -40000, -20000, -35000, -30000, -50000],
      itemStyle: { color: '#ff9800' }
    },
    {
      name: 'Financing',
      type: 'bar',
      data: [-10000, 5000, -8000, -12000, 15000, -5000, -10000, 8000, -15000, -8000, 12000, -10000],
      itemStyle: { color: '#f44336' }
    },
    {
      name: 'Net Cash Flow',
      type: 'line',
      data: [50000, 85000, 35000, 78000, 62000, 90000, 73000, 103000, 83000, 102000, 110000, 95000],
      itemStyle: { color: '#1976d2' },
      lineStyle: { width: 3 }
    }
  ]
})

// Budget Chart
const budgetChartOptions = {
  chart: { type: 'bar', height: 350 },
  plotOptions: {
    bar: { horizontal: true, columnWidth: '70%', endingShape: 'rounded' }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Salaries', 'Operations', 'Technology', 'Marketing', 'Admin']
  },
  colors: ['#2196f3', '#4caf50'],
  legend: { position: 'top' }
}

const budgetChartSeries = ref([
  { name: 'Budget', data: [1400000, 320000, 180000, 120000, 95000] },
  { name: 'Actual', data: [1365000, 315000, 168000, 105000, 84000] }
])

// Financial Ratios
const financialRatios = ref([
  {
    name: 'Current Ratio',
    description: 'Current Assets / Current Liabilities',
    value: '2.4',
    status: 'good',
    color: 'success',
    icon: 'mdi-scale-balance'
  },
  {
    name: 'Quick Ratio',
    description: 'Quick Assets / Current Liabilities',
    value: '1.8',
    status: 'good',
    color: 'primary',
    icon: 'mdi-flash'
  },
  {
    name: 'Debt-to-Equity',
    description: 'Total Debt / Total Equity',
    value: '0.35',
    status: 'good',
    color: 'info',
    icon: 'mdi-chart-line'
  },
  {
    name: 'ROI',
    description: 'Return on Investment',
    value: '18.5%',
    status: 'good',
    color: 'success',
    icon: 'mdi-percent'
  },
  {
    name: 'Gross Margin',
    description: 'Gross Profit / Revenue',
    value: '32.8%',
    status: 'average',
    color: 'warning',
    icon: 'mdi-trending-up'
  }
])

// Financial Summary Table
const financialSummaryColumns = [
  { key: 'month', title: 'Month', sortable: true },
  { key: 'revenue', title: 'Revenue', type: 'currency' },
  { key: 'expenses', title: 'Expenses', type: 'currency' },
  { key: 'profit', title: 'Profit', type: 'currency' },
  { key: 'margin', title: 'Margin %', align: 'center' }
]

const financialSummaryData = ref([
  { month: 'January 2024', revenue: 280000, expenses: 215000, profit: 65000, margin: 23.2 },
  { month: 'February 2024', revenue: 320000, expenses: 242000, profit: 78000, margin: 24.4 },
  { month: 'March 2024', revenue: 290000, expenses: 220000, profit: 70000, margin: 24.1 },
  { month: 'April 2024', revenue: 350000, expenses: 265000, profit: 85000, margin: 24.3 },
  { month: 'May 2024', revenue: 310000, expenses: 238000, profit: 72000, margin: 23.2 },
  { month: 'June 2024', revenue: 380000, expenses: 285000, profit: 95000, margin: 25.0 },
  { month: 'July 2024', revenue: 340000, expenses: 258000, profit: 82000, margin: 24.1 },
  { month: 'August 2024', revenue: 420000, expenses: 315000, profit: 105000, margin: 25.0 },
  { month: 'September 2024', revenue: 390000, expenses: 296000, profit: 94000, margin: 24.1 },
  { month: 'October 2024', revenue: 450000, expenses: 335000, profit: 115000, margin: 25.6 },
  { month: 'November 2024', revenue: 410000, expenses: 312000, profit: 98000, margin: 23.9 },
  { month: 'December 2024', revenue: 480000, expenses: 355000, profit: 125000, margin: 26.0 }
])

// Forecast Chart
const forecastChartOptions = {
  chart: { type: 'area', height: 400 },
  stroke: { curve: 'smooth', width: [3, 3, 2, 2] },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 
                'Jan+1', 'Feb+1', 'Mar+1', 'Apr+1', 'May+1', 'Jun+1', 'Jul+1', 'Aug+1', 'Sep+1', 'Oct+1', 'Nov+1', 'Dec+1']
  },
  annotations: {
    xaxis: [{
      x: 'Dec',
      borderColor: '#775DD0',
      label: {
        style: { color: '#fff', background: '#775DD0' },
        text: 'Forecast Start'
      }
    }]
  },
  colors: ['#4caf50', '#1976d2', '#4caf50', '#1976d2'],
  fill: {
    type: 'solid',
    opacity: [0.35, 0.35, 0.15, 0.15]
  },
  legend: { position: 'top' }
}

const forecastChartSeries = ref([
  {
    name: 'Historical Revenue',
    data: [280000, 320000, 290000, 350000, 310000, 380000, 340000, 420000, 390000, 450000, 410000, 480000, 
           null, null, null, null, null, null, null, null, null, null, null, null]
  },
  {
    name: 'Historical Profit',
    data: [65000, 78000, 70000, 85000, 72000, 95000, 82000, 105000, 94000, 115000, 98000, 125000,
           null, null, null, null, null, null, null, null, null, null, null, null]
  },
  {
    name: 'Forecasted Revenue',
    data: [null, null, null, null, null, null, null, null, null, null, null, 480000,
           510000, 525000, 495000, 565000, 535000, 610000, 580000, 650000, 620000, 685000, 655000, 720000]
  },
  {
    name: 'Forecasted Profit',
    data: [null, null, null, null, null, null, null, null, null, null, null, 125000,
           133000, 137000, 129000, 147000, 139000, 159000, 151000, 169000, 161000, 178000, 170000, 187000]
  }
])

// Methods
const formatDateRange = () => {
  if (selectedDateRange.value && selectedDateRange.value.length === 2) {
    const start = selectedDateRange.value[0].toLocaleDateString()
    const end = selectedDateRange.value[1].toLocaleDateString()
    return `${start} - ${end}`
  }
  return 'Select Date Range'
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: 'QAR',
    minimumFractionDigits: 0
  }).format(value)
}

const updateFinancialData = () => {
  console.log('Updating financial data for:', selectedDateRange.value)
  showSuccess('Financial data updated for selected date range')
}

const exportFinancialReport = () => {
  const reportData = {
    kpis: financialKPIs.value,
    summary: financialSummaryData.value,
    ratios: financialRatios.value,
    dateRange: selectedDateRange.value,
    generatedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `financial_analytics_report_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  showSuccess('Financial report exported successfully')
}

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1500)
})
</script>

<style scoped>
.financial-analytics {
  min-height: 100vh;
}

.kpi-card {
  transition: all 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

:deep(.v-tabs) {
  border-bottom: 1px solid rgba(0,0,0,0.12);
}

:deep(.v-btn-toggle) {
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 4px;
}

:deep(.v-data-table) {
  background: transparent;
}
</style>
