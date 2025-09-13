<template>
  <div class="payroll-dashboard">
    <!-- Enhanced Header -->
    <div class="enhanced-header mb-spacing-xl">
      <v-container fluid class="pa-spacing-lg">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              <v-icon size="32" class="mr-3 text-primary">mdi-cash-multiple</v-icon>
              Payroll Management
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis ma-0">
              Process payroll, manage salaries, and generate payslips for all employees
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
              Export Data
            </v-btn>
          </div>
        </div>
      </v-container>
    </div>

    <v-container fluid class="pa-spacing-lg">
      <!-- Header Section -->
      <v-row class="mb-3">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h5 font-weight-bold text-primary mb-1">Payroll Management</h1>
              <p class="text-caption text-grey-darken-1 ma-0">
                Process payroll, manage salaries, and generate payslips for all employees
              </p>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                color="success"
                size="small"
                density="compact"
                @click="processPayroll"
                :loading="processing"
              >
                <template #prepend>
                  <v-icon>mdi-play</v-icon>
                </template>
                Process Payroll
              </v-btn>
              <v-btn
                variant="outlined"
                size="small"
                density="compact"
                @click="exportPayroll"
              >
                <template #prepend>
                  <v-icon>mdi-download</v-icon>
                </template>
                Export Report
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Payroll Period Selection -->
      <v-card class="mb-4" elevation="1" density="compact">
        <v-card-text class="pa-3">
          <v-row align="center" dense>
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedPeriod"
                :items="payrollPeriods"
                label="Payroll Period"
                variant="outlined"
                density="compact"
                item-title="label"
                item-value="value"
                @update:model-value="loadPayrollData"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="selectedDepartment"
                label="Department"
                variant="outlined"
                density="compact"
                clearable
                @input="filterPayrollData"
                hide-details
                placeholder="Filter by department"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="payrollStatus"
                :items="statusOptions"
                label="Status"
                variant="outlined"
                density="compact"
                @update:model-value="filterPayrollData"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="3">
              <div class="d-flex align-center">
                <v-chip
                  :color="getStatusColor(currentPeriodStatus)"
                  variant="tonal"
                  size="x-small"
                  density="compact"
                  class="mr-2"
                >
                  {{ currentPeriodStatus }}
                </v-chip>
                <span class="text-caption text-grey-darken-1">
                  {{ selectedPeriod }}
                </span>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Payroll Summary Cards -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" lg="3">
          <v-card color="primary" dark density="compact" elevation="1">
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-h6 font-weight-bold">{{ payrollSummary.totalEmployees }}</div>
                  <div class="text-caption">Total Employees</div>
                </div>
                <v-icon size="28">mdi-account-group</v-icon>
              </div>
              <v-progress-linear
                :model-value="(payrollSummary.processedEmployees / payrollSummary.totalEmployees) * 100"
                color="white"
                class="mt-2"
                height="3"
              />
              <div class="text-caption mt-1 opacity-90">
                {{ payrollSummary.processedEmployees }}/{{ payrollSummary.totalEmployees }} Processed
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <v-card color="success" dark density="compact" elevation="1">
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-h6 font-weight-bold">QAR {{ payrollSummary.totalPayroll.toLocaleString() }}</div>
                  <div class="text-caption">Total Payroll</div>
                </div>
                <v-icon size="28">mdi-cash</v-icon>
              </div>
              <div class="text-caption mt-2 opacity-90">
                Basic: QAR {{ payrollSummary.basicSalaryTotal.toLocaleString() }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <v-card color="info" dark density="compact" elevation="1">
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-h6 font-weight-bold">QAR {{ payrollSummary.totalDeductions.toLocaleString() }}</div>
                  <div class="text-caption">Total Deductions</div>
                </div>
                <v-icon size="28">mdi-minus-circle</v-icon>
              </div>
              <div class="text-caption mt-2 opacity-90">
                Tax: QAR {{ payrollSummary.taxDeductions.toLocaleString() }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <v-card color="warning" dark density="compact" elevation="1">
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-h6 font-weight-bold">QAR {{ payrollSummary.totalAdvances.toLocaleString() }}</div>
                  <div class="text-caption">Advances</div>
                </div>
                <v-icon size="28">mdi-hand-coin</v-icon>
              </div>
              <div class="text-caption mt-2 opacity-90">
                {{ payrollSummary.advanceCount }} Employees
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Main Content -->
      <v-row>
        <!-- Payroll Table -->
        <v-col cols="12" lg="8">
          <v-card elevation="1" density="compact">
            <v-card-title class="d-flex align-center justify-space-between pa-3">
              <span class="text-subtitle-1">Employee Payroll Details</span>
              <div class="d-flex gap-1">
                <v-btn
                  icon="mdi-refresh"
                  variant="text"
                  size="x-small"
                  density="compact"
                  @click="refreshPayrollData"
                  :loading="loading"
                />
                <v-btn
                  icon="mdi-cog"
                  variant="text"
                  size="x-small"
                  density="compact"
                  @click="openPayrollSettings"
                />
              </div>
            </v-card-title>

            <v-data-table
              :headers="payrollHeaders"
              :items="filteredPayrollData"
              :loading="loading"
              class="payroll-table elevation-0"
              item-value="employeeId"
              density="compact"
              hide-default-footer
            >
              <!-- Employee Column -->
              <template #item.employee="{ item }">
                <div class="d-flex align-center cursor-pointer" @click="showEmployeePayrollHistory(item)" title="Click to view detailed payroll history">
                  <v-avatar size="24" class="mr-2">
                    <v-icon color="grey-lighten-1" size="small">mdi-account</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-caption font-weight-medium">{{ item.employeeName }}</div>
                    <div class="text-caption text-grey-darken-1">{{ item.employeeId }}</div>
                  </div>
                  <v-icon size="x-small" color="primary" class="ml-1 opacity-60">mdi-history</v-icon>
                </div>
              </template>

              <!-- Department Column -->
              <template #item.department="{ item }">
                <v-chip
                  :color="getDepartmentColor(item.department)"
                  size="x-small"
                  density="compact"
                  variant="tonal"
                >
                  {{ item.department }}
                </v-chip>
              </template>

              <!-- Basic Salary Column -->
              <template #item.basicSalary="{ item }">
                <div class="text-caption font-weight-medium">
                  QAR {{ item.basicSalary.toLocaleString() }}
                </div>
              </template>

              <!-- Allowances Column -->
              <template #item.allowances="{ item }">
                <div class="text-caption">
                  QAR {{ item.allowances.toLocaleString() }}
                </div>
                <div class="text-caption text-grey-darken-1">
                  Housing: {{ item.housingAllowance || 0 }}
                </div>
              </template>

              <!-- Deductions Column -->
              <template #item.deductions="{ item }">
                <div class="text-caption text-error">
                  -QAR {{ item.deductions.toLocaleString() }}
                </div>
                <div class="text-caption text-grey-darken-1">
                  Advance: {{ item.advanceDeduction || 0 }}
                </div>
              </template>

              <!-- Net Pay Column -->
              <template #item.netPay="{ item }">
                <div class="text-caption font-weight-bold text-success">
                  QAR {{ item.netPay.toLocaleString() }}
                </div>
              </template>

              <!-- Status Column -->
              <template #item.status="{ item }">
                <v-chip
                  :color="getPayrollStatusColor(item.status)"
                  size="x-small"
                  density="compact"
                  variant="tonal"
                >
                  <v-icon start size="10">{{ getPayrollStatusIcon(item.status) }}</v-icon>
                  {{ item.status }}
                </v-chip>
              </template>

              <!-- Actions Column -->
              <template #item.actions="{ item }">
                <div class="d-flex gap-1">
                  <v-btn
                    icon="fa:fas fa-file-invoice"
                    size="small"
                    density="compact"
                    variant="text"
                    color="primary"
                    class="action-btn"
                    @click="generatePayslip(item)"
                    title="Generate Payslip"
                  />
                  <v-btn
                    icon="fa:fas fa-edit"
                    size="small"
                    density="compact"
                    variant="text"
                    color="primary"
                    class="action-btn"
                    @click="editPayroll(item)"
                    title="Edit Payroll"
                  />
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        icon="fa:fas fa-ellipsis-v"
                        size="small"
                        density="compact"
                        variant="text"
                        color="primary"
                        class="action-btn"
                        v-bind="props"
                      />
                    </template>
                    <v-list density="compact">
                      <v-list-item @click="processIndividualPayroll(item)">
                        <v-list-item-title class="text-caption">Process Individual</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="holdPayroll(item)">
                        <v-list-item-title class="text-caption">Hold Payroll</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="viewHistory(item)">
                        <v-list-item-title class="text-caption">View History</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <!-- Sidebar -->
        <v-col cols="12" lg="4">
          <!-- Quick Actions -->
          <v-card class="mb-4" elevation="1" density="compact">
            <v-card-title class="pa-3 text-subtitle-1">Quick Actions</v-card-title>
            <v-card-text class="pa-0">
              <v-list density="compact">
                <v-list-item @click="navigateTo('/payroll/salary-management')" class="px-3">
                  <template #prepend>
                    <v-icon color="primary" size="small">mdi-currency-usd</v-icon>
                  </template>
                  <v-list-item-title class="text-caption">Salary Management</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">Manage employee salaries</v-list-item-subtitle>
                </v-list-item>
                <v-list-item @click="navigateTo('/payroll/advance-loans')" class="px-3">
                  <template #prepend>
                    <v-icon color="warning" size="small">mdi-hand-coin</v-icon>
                  </template>
                  <v-list-item-title class="text-caption">Advance Loans</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">Manage salary advances</v-list-item-subtitle>
                </v-list-item>
                <v-list-item @click="navigateTo('/payroll/payslip-generation')" class="px-3">
                  <template #prepend>
                    <v-icon color="success" size="small">mdi-file-document</v-icon>
                  </template>
                  <v-list-item-title class="text-caption">Generate Payslips</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">Create and send payslips</v-list-item-subtitle>
                </v-list-item>
                <v-list-item @click="navigateTo('/payroll/transaction-history')" class="px-3">
                  <template #prepend>
                    <v-icon color="info" size="small">mdi-history</v-icon>
                  </template>
                  <v-list-item-title class="text-caption">Transaction History</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">View payroll history</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Pending Actions -->
          <v-card class="mb-4" elevation="1" density="compact">
            <v-card-title class="d-flex align-center justify-space-between pa-3">
              <span class="text-subtitle-1">Pending Actions</span>
              <v-chip color="warning" size="x-small" density="compact">{{ pendingActions.length }}</v-chip>
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list v-if="pendingActions.length > 0" density="compact">
                <v-list-item
                  v-for="action in pendingActions"
                  :key="action.id"
                  @click="handlePendingAction(action)"
                  class="px-3"
                >
                  <template #prepend>
                    <v-icon :color="action.priority" size="small">{{ action.icon }}</v-icon>
                  </template>
                  <v-list-item-title class="text-caption">{{ action.title }}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">{{ action.description }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <div v-else class="text-center py-3">
                <v-icon size="24" color="success" class="mb-1">mdi-check-circle</v-icon>
                <div class="text-caption text-grey-darken-1">No pending actions</div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Payroll Calendar -->
          <v-card elevation="1" density="compact">
            <v-card-title class="pa-3 text-subtitle-1">Payroll Calendar</v-card-title>
            <v-card-text class="pa-3">
              <div class="mb-3">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-caption font-weight-medium">Next Payroll Date:</span>
                  <span class="text-caption">{{ nextPayrollDate }}</span>
                </div>
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-caption font-weight-medium">Days Remaining:</span>
                  <v-chip color="warning" size="x-small" density="compact">{{ daysUntilPayroll }}</v-chip>
                </div>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption font-weight-medium">Cutoff Date:</span>
                  <span class="text-caption">{{ payrollCutoffDate }}</span>
                </div>
              </div>
              <v-btn
                color="primary"
                variant="outlined"
                block
                size="small"
                density="compact"
                @click="schedulePayroll"
              >
                Schedule Payroll
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Comprehensive Employee Payroll History Modal -->
    <v-dialog v-model="showPayrollHistoryDialog" max-width="1400px" scrollable>
      <v-card v-if="selectedEmployeeHistory" class="payroll-history-dialog" density="compact">
        <!-- Header -->
        <v-card-title class="px-4 py-3 bg-primary">
          <div class="d-flex align-center justify-space-between w-100">
            <div class="d-flex align-center text-white">
              <v-avatar
                :image="`https://i.pravatar.cc/48?u=${selectedEmployeeHistory.employeeId}`"
                size="48"
                class="mr-3"
              />
              <div>
                <div class="text-h6 font-weight-bold">{{ selectedEmployeeHistory.employeeName }}</div>
                <div class="text-caption opacity-90">Complete Payroll History & Financial Analysis</div>
                <div class="d-flex align-center mt-1">
                  <v-chip
                    color="white"
                    variant="outlined"
                    size="x-small"
                    density="compact"
                    text-color="white"
                    class="mr-1"
                  >
                    {{ selectedEmployeeHistory.employeeId }}
                  </v-chip>
                  <v-chip
                    :color="getDepartmentColor(selectedEmployeeHistory.department)"
                    variant="elevated"
                    size="x-small"
                    density="compact"
                  >
                    {{ selectedEmployeeHistory.department }}
                  </v-chip>
                </div>
              </div>
            </div>
            <v-btn 
              icon="mdi-close" 
              variant="text" 
              color="white"
              size="small"
              density="compact"
              @click="showPayrollHistoryDialog = false" 
            />
          </div>
        </v-card-title>

        <!-- Financial Overview Cards -->
        <v-card-text class="pa-4">
          <v-row class="mb-4">
            <v-col cols="6" md="2">
              <v-card color="success" dark density="compact" elevation="2">
                <v-card-text class="pa-2 text-center">
                  <div class="text-h6 font-weight-bold">QAR {{ employeePayrollSummary.totalLifetimeEarnings.toLocaleString() }}</div>
                  <div class="text-caption">Lifetime Earnings</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" md="2">
              <v-card color="primary" dark density="compact" elevation="2">
                <v-card-text class="pa-2 text-center">
                  <div class="text-h6 font-weight-bold">{{ employeePayrollSummary.totalPayments }}</div>
                  <div class="text-caption">Total Payments</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" md="2">
              <v-card color="info" dark density="compact" elevation="2">
                <v-card-text class="pa-2 text-center">
                  <div class="text-h6 font-weight-bold">QAR {{ employeePayrollSummary.averageMonthlyPay.toLocaleString() }}</div>
                  <div class="text-caption">Avg Monthly</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" md="2">
              <v-card color="warning" dark density="compact" elevation="2">
                <v-card-text class="pa-2 text-center">
                  <div class="text-h6 font-weight-bold">QAR {{ employeePayrollSummary.totalBonuses.toLocaleString() }}</div>
                  <div class="text-caption">Total Bonuses</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" md="2">
              <v-card color="orange" dark density="compact" elevation="2">
                <v-card-text class="pa-2 text-center">
                  <div class="text-h6 font-weight-bold">QAR {{ employeePayrollSummary.totalAdvances.toLocaleString() }}</div>
                  <div class="text-caption">Total Advances</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" md="2">
              <v-card color="error" dark density="compact" elevation="2">
                <v-card-text class="pa-2 text-center">
                  <div class="text-h6 font-weight-bold">QAR {{ employeePayrollSummary.totalDeductions.toLocaleString() }}</div>
                  <div class="text-caption">Total Deductions</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Employment Timeline -->
          <v-alert type="info" density="compact" class="mb-4">
            <div class="d-flex justify-space-between align-center">
              <div class="text-caption">
                <strong>Employment Period:</strong> {{ formatDate(employeePayrollSummary.joinDate) }} - Present
                ({{ employeePayrollSummary.employmentDays }} days)
              </div>
              <div class="text-caption">
                <strong>First Payment:</strong> {{ formatDate(employeePayrollSummary.firstPaymentDate) }}
              </div>
            </div>
          </v-alert>

          <!-- Detailed Payroll Tabs -->
          <v-tabs v-model="payrollHistoryTab" color="primary" align-tabs="start" density="compact">
            <v-tab value="timeline" class="text-caption">
              <v-icon size="small" class="mr-1">mdi-timeline-clock</v-icon>
              Payment Timeline
            </v-tab>
            <v-tab value="breakdown" class="text-caption">
              <v-icon size="small" class="mr-1">mdi-chart-pie</v-icon>
              Salary Breakdown
            </v-tab>
            <v-tab value="history" class="text-caption">
              <v-icon size="small" class="mr-1">mdi-table</v-icon>
              Complete History
            </v-tab>
            <v-tab value="bonuses" class="text-caption">
              <v-icon size="small" class="mr-1">mdi-gift</v-icon>
              Bonuses & Advances
            </v-tab>
            <v-tab value="analytics" class="text-caption">
              <v-icon size="small" class="mr-1">mdi-trending-up</v-icon>
              Analytics
            </v-tab>
          </v-tabs>

          <v-divider class="mb-4" />

          <v-window v-model="payrollHistoryTab">
            <!-- Payment Timeline Tab -->
            <v-window-item value="timeline">
              <v-row>
                <v-col cols="12" md="8">
                  <v-card variant="outlined" density="compact" class="pa-0">
                    <v-card-title class="pa-3 text-subtitle-1 bg-grey-lighten-5">
                      <v-icon class="mr-2" color="primary">mdi-timeline</v-icon>
                      Chronological Payment History
                    </v-card-title>
                    <v-card-text class="pa-2" style="max-height: 400px; overflow-y: auto;">
                      <v-timeline density="compact" align="start" side="end">
                        <v-timeline-item
                          v-for="payment in detailedPayrollHistory.slice(0, 20)"
                          :key="payment.id"
                          size="small"
                          :dot-color="getPaymentTypeColor(payment.type)"
                        >
                          <template v-slot:icon>
                            <v-icon size="x-small">{{ getPaymentTypeIcon(payment.type) }}</v-icon>
                          </template>
                          <div class="d-flex justify-space-between align-center mb-1">
                            <div>
                              <div class="text-caption font-weight-bold">{{ payment.description }}</div>
                              <div class="text-caption text-grey-darken-1">{{ formatDate(payment.date) }}</div>
                              <div class="d-flex align-center mt-1">
                                <v-chip
                                  :color="getPaymentStatusColor(payment.status)"
                                  size="x-small"
                                  density="compact"
                                  variant="tonal"
                                  class="mr-1"
                                >
                                  {{ payment.status }}
                                </v-chip>
                                <v-chip
                                  :color="getPaymentTypeColor(payment.type)"
                                  size="x-small"
                                  density="compact"
                                  variant="tonal"
                                >
                                  {{ payment.type }}
                                </v-chip>
                              </div>
                            </div>
                            <div class="text-right">
                              <div class="text-subtitle-2 font-weight-bold" :class="payment.amount >= 0 ? 'text-success' : 'text-error'">
                                {{ payment.amount >= 0 ? '+' : '' }}QAR {{ Math.abs(payment.amount).toLocaleString() }}
                              </div>
                              <div class="text-caption text-grey-darken-1" v-if="payment.details">
                                {{ payment.details }}
                              </div>
                            </div>
                          </div>
                        </v-timeline-item>
                      </v-timeline>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card variant="outlined" density="compact">
                    <v-card-title class="pa-3 text-subtitle-1 bg-grey-lighten-5">
                      <v-icon class="mr-2" color="info">mdi-information</v-icon>
                      Payment Statistics
                    </v-card-title>
                    <v-card-text class="pa-3">
                      <div class="mb-3">
                        <div class="text-caption text-grey-darken-1">Payment Frequency</div>
                        <div class="text-caption font-weight-medium">Monthly ({{ employeePayrollSummary.totalPayments }} payments)</div>
                      </div>
                      <div class="mb-3">
                        <div class="text-caption text-grey-darken-1">Current Salary</div>
                        <div class="text-subtitle-2 font-weight-bold text-primary">QAR {{ selectedEmployeeHistory.basicSalary.toLocaleString() }}</div>
                      </div>
                      <div class="mb-3">
                        <div class="text-caption text-grey-darken-1">Starting Salary</div>
                        <div class="text-caption font-weight-medium">QAR {{ employeePayrollSummary.startingSalary.toLocaleString() }}</div>
                      </div>
                      <div class="mb-3">
                        <div class="text-caption text-grey-darken-1">Salary Growth</div>
                        <v-chip
                          :color="employeePayrollSummary.salaryGrowthPercent > 0 ? 'success' : 'grey'"
                          size="x-small"
                          density="compact"
                          variant="tonal"
                        >
                          {{ employeePayrollSummary.salaryGrowthPercent > 0 ? '+' : '' }}{{ employeePayrollSummary.salaryGrowthPercent.toFixed(1) }}%
                        </v-chip>
                      </div>
                      <div class="mb-3">
                        <div class="text-caption text-grey-darken-1">Days Since Last Pay</div>
                        <div class="text-caption font-weight-medium">{{ employeePayrollSummary.daysSinceLastPay }} days</div>
                      </div>
                      <div class="mb-3">
                        <div class="text-caption text-grey-darken-1">Outstanding Advance</div>
                        <v-chip
                          :color="employeePayrollSummary.outstandingAdvance > 0 ? 'error' : 'success'"
                          size="x-small"
                          density="compact"
                          variant="tonal"
                        >
                          QAR {{ employeePayrollSummary.outstandingAdvance.toLocaleString() }}
                        </v-chip>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Salary Breakdown Tab -->
            <v-window-item value="breakdown">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" density="compact">
                    <v-card-title class="pa-3 text-subtitle-1 bg-success-lighten-5">
                      <v-icon class="mr-2" color="success">mdi-cash-plus</v-icon>
                      Current Monthly Earnings
                    </v-card-title>
                    <v-card-text class="pa-3">
                      <div class="mb-2 d-flex justify-space-between align-center">
                        <span class="text-caption">Basic Salary</span>
                        <span class="text-caption font-weight-bold">QAR {{ selectedEmployeeHistory.basicSalary.toLocaleString() }}</span>
                      </div>
                      <div class="mb-2 d-flex justify-space-between align-center">
                        <span class="text-caption">Housing Allowance (25%)</span>
                        <span class="text-caption font-weight-bold">QAR {{ Math.round(selectedEmployeeHistory.basicSalary * 0.25).toLocaleString() }}</span>
                      </div>
                      <div class="mb-2 d-flex justify-space-between align-center">
                        <span class="text-caption">Transport Allowance (10%)</span>
                        <span class="text-caption font-weight-bold">QAR {{ Math.round(selectedEmployeeHistory.basicSalary * 0.1).toLocaleString() }}</span>
                      </div>
                      <div class="mb-2 d-flex justify-space-between align-center">
                        <span class="text-caption">Other Allowances (5%)</span>
                        <span class="text-caption font-weight-bold">QAR {{ Math.round(selectedEmployeeHistory.basicSalary * 0.05).toLocaleString() }}</span>
                      </div>
                      <v-divider class="my-2" />
                      <div class="d-flex justify-space-between align-center">
                        <span class="text-subtitle-2 font-weight-bold">Gross Monthly Salary</span>
                        <span class="text-subtitle-1 font-weight-bold text-success">
                          QAR {{ Math.round(selectedEmployeeHistory.basicSalary * 1.4).toLocaleString() }}
                        </span>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" density="compact">
                    <v-card-title class="pa-3 text-subtitle-1 bg-error-lighten-5">
                      <v-icon class="mr-2" color="error">mdi-cash-minus</v-icon>
                      Monthly Deductions
                    </v-card-title>
                    <v-card-text class="pa-3">
                      <div class="mb-2 d-flex justify-space-between align-center">
                        <span class="text-caption">Social Security (5%)</span>
                        <span class="text-caption font-weight-bold text-error">-QAR {{ Math.round(selectedEmployeeHistory.basicSalary * 0.05).toLocaleString() }}</span>
                      </div>
                      <div class="mb-2 d-flex justify-space-between align-center">
                        <span class="text-caption">Health Insurance (2%)</span>
                        <span class="text-caption font-weight-bold text-error">-QAR {{ Math.round(selectedEmployeeHistory.basicSalary * 0.02).toLocaleString() }}</span>
                      </div>
                      <div class="mb-2 d-flex justify-space-between align-center">
                        <span class="text-caption">Income Tax (3%)</span>
                        <span class="text-caption font-weight-bold text-error">-QAR {{ Math.round(selectedEmployeeHistory.basicSalary * 0.03).toLocaleString() }}</span>
                      </div>
                      <div class="mb-2 d-flex justify-space-between align-center">
                        <span class="text-caption">Current Advance Deduction</span>
                        <span class="text-caption font-weight-bold text-error">-QAR {{ employeePayrollSummary.monthlyAdvanceDeduction.toLocaleString() }}</span>
                      </div>
                      <v-divider class="my-2" />
                      <div class="d-flex justify-space-between align-center">
                        <span class="text-subtitle-2 font-weight-bold">Total Monthly Deductions</span>
                        <span class="text-subtitle-1 font-weight-bold text-error">
                          -QAR {{ (Math.round(selectedEmployeeHistory.basicSalary * 0.1) + employeePayrollSummary.monthlyAdvanceDeduction).toLocaleString() }}
                        </span>
                      </div>
                      <v-divider class="my-2" />
                      <div class="d-flex justify-space-between align-center">
                        <span class="text-subtitle-1 font-weight-bold">Net Monthly Pay</span>
                        <span class="text-h6 font-weight-bold text-primary">
                          QAR {{ selectedEmployeeHistory.netPay.toLocaleString() }}
                        </span>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Complete History Tab -->
            <v-window-item value="history">
              <v-card variant="outlined" density="compact">
                <v-card-title class="pa-3 text-subtitle-1 bg-grey-lighten-5">
                  <v-icon class="mr-2" color="primary">mdi-table</v-icon>
                  Complete Payment History ({{ detailedPayrollHistory.length }} records)
                </v-card-title>
                <v-data-table
                  :headers="payrollDetailHeaders"
                  :items="detailedPayrollHistory"
                  density="compact"
                  class="elevation-0"
                  items-per-page="15"
                  :items-per-page-options="[10, 15, 25, 50]"
                >
                  <template #item.date="{ item }">
                    <div class="text-caption">{{ formatDate(item.date) }}</div>
                  </template>
                  <template #item.description="{ item }">
                    <div class="text-caption font-weight-medium">{{ item.description }}</div>
                  </template>
                  <template #item.type="{ item }">
                    <v-chip
                      :color="getPaymentTypeColor(item.type)"
                      size="x-small"
                      density="compact"
                      variant="tonal"
                    >
                      {{ item.type }}
                    </v-chip>
                  </template>
                  <template #item.amount="{ item }">
                    <div class="text-caption font-weight-bold" :class="item.amount >= 0 ? 'text-success' : 'text-error'">
                      {{ item.amount >= 0 ? '+' : '' }}QAR {{ Math.abs(item.amount).toLocaleString() }}
                    </div>
                  </template>
                  <template #item.status="{ item }">
                    <v-chip
                      :color="getPaymentStatusColor(item.status)"
                      size="x-small"
                      density="compact"
                      variant="tonal"
                    >
                      {{ item.status }}
                    </v-chip>
                  </template>
                  <template #item.details="{ item }">
                    <div class="text-caption">{{ item.details || '-' }}</div>
                  </template>
                </v-data-table>
              </v-card>
            </v-window-item>

            <!-- Bonuses & Advances Tab -->
            <v-window-item value="bonuses">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" density="compact">
                    <v-card-title class="pa-3 text-subtitle-1 bg-warning-lighten-5">
                      <v-icon class="mr-2" color="warning">mdi-gift</v-icon>
                      Bonuses & Incentives
                    </v-card-title>
                    <v-card-text class="pa-0">
                      <v-list density="compact">
                        <v-list-item
                          v-for="bonus in bonusHistory"
                          :key="bonus.id"
                          class="px-3"
                        >
                          <template #prepend>
                            <v-icon color="warning" size="small">mdi-gift</v-icon>
                          </template>
                          <v-list-item-title class="text-caption">{{ bonus.description }}</v-list-item-title>
                          <v-list-item-subtitle class="text-caption">{{ formatDate(bonus.date) }}</v-list-item-subtitle>
                          <template #append>
                            <div class="text-caption font-weight-bold text-success">+QAR {{ bonus.amount.toLocaleString() }}</div>
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" density="compact">
                    <v-card-title class="pa-3 text-subtitle-1 bg-orange-lighten-5">
                      <v-icon class="mr-2" color="orange">mdi-hand-coin</v-icon>
                      Advance Payments
                    </v-card-title>
                    <v-card-text class="pa-0">
                      <v-list density="compact">
                        <v-list-item
                          v-for="advance in advanceHistory"
                          :key="advance.id"
                          class="px-3"
                        >
                          <template #prepend>
                            <v-icon color="orange" size="small">mdi-hand-coin</v-icon>
                          </template>
                          <v-list-item-title class="text-caption">{{ advance.description }}</v-list-item-title>
                          <v-list-item-subtitle class="text-caption">{{ formatDate(advance.date) }}</v-list-item-subtitle>
                          <template #append>
                            <div class="text-caption font-weight-bold text-warning">QAR {{ advance.amount.toLocaleString() }}</div>
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Analytics Tab -->
            <v-window-item value="analytics">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" density="compact">
                    <v-card-title class="pa-3 text-subtitle-1 bg-info-lighten-5">
                      <v-icon class="mr-2" color="info">mdi-trending-up</v-icon>
                      Salary Growth Analysis
                    </v-card-title>
                    <v-card-text class="pa-3">
                      <div class="mb-3">
                        <div class="text-caption text-grey-darken-1">Starting Salary ({{ formatDate(employeePayrollSummary.joinDate) }})</div>
                        <div class="text-subtitle-2 font-weight-bold">QAR {{ employeePayrollSummary.startingSalary.toLocaleString() }}</div>
                      </div>
                      <div class="mb-3">
                        <div class="text-caption text-grey-darken-1">Current Salary</div>
                        <div class="text-subtitle-2 font-weight-bold text-primary">QAR {{ selectedEmployeeHistory.basicSalary.toLocaleString() }}</div>
                      </div>
                      <div class="mb-3">
                        <div class="text-caption text-grey-darken-1">Total Salary Increase</div>
                        <div class="text-subtitle-2 font-weight-bold text-success">
                          +QAR {{ (selectedEmployeeHistory.basicSalary - employeePayrollSummary.startingSalary).toLocaleString() }}
                          ({{ employeePayrollSummary.salaryGrowthPercent.toFixed(1) }}%)
                        </div>
                      </div>
                      <div class="mb-3">
                        <div class="text-caption text-grey-darken-1">Number of Raises</div>
                        <v-chip color="success" size="x-small" density="compact" variant="tonal">
                          {{ employeePayrollSummary.numberOfRaises }} Raises
                        </v-chip>
                      </div>
                      <div class="mb-3">
                        <div class="text-caption text-grey-darken-1">Average Annual Growth</div>
                        <div class="text-subtitle-2 font-weight-bold">{{ employeePayrollSummary.averageAnnualGrowth.toFixed(1) }}%</div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" density="compact">
                    <v-card-title class="pa-3 text-subtitle-1 bg-success-lighten-5">
                      <v-icon class="mr-2" color="success">mdi-calculator</v-icon>
                      Financial Summary
                    </v-card-title>
                    <v-card-text class="pa-3">
                      <div class="mb-3">
                        <div class="text-caption text-grey-darken-1">Total Lifetime Earnings</div>
                        <div class="text-h6 font-weight-bold text-success">QAR {{ employeePayrollSummary.totalLifetimeEarnings.toLocaleString() }}</div>
                      </div>
                      <div class="mb-3">
                        <div class="text-caption text-grey-darken-1">Total Regular Payments</div>
                        <div class="text-subtitle-2 font-weight-bold">QAR {{ employeePayrollSummary.totalRegularPayments.toLocaleString() }}</div>
                      </div>
                      <div class="mb-3">
                        <div class="text-caption text-grey-darken-1">Total Bonuses Received</div>
                        <div class="text-subtitle-2 font-weight-bold text-warning">QAR {{ employeePayrollSummary.totalBonuses.toLocaleString() }}</div>
                      </div>
                      <div class="mb-3">
                        <div class="text-caption text-grey-darken-1">Total Advances Taken</div>
                        <div class="text-subtitle-2 font-weight-bold text-orange">QAR {{ employeePayrollSummary.totalAdvances.toLocaleString() }}</div>
                      </div>
                      <div class="mb-3">
                        <div class="text-caption text-grey-darken-1">Total Deductions</div>
                        <div class="text-subtitle-2 font-weight-bold text-error">QAR {{ employeePayrollSummary.totalDeductions.toLocaleString() }}</div>
                      </div>
                      <v-divider class="my-2" />
                      <div class="mb-3">
                        <div class="text-caption text-grey-darken-1">Net Lifetime Value</div>
                        <div class="text-h6 font-weight-bold text-primary">
                          QAR {{ (employeePayrollSummary.totalLifetimeEarnings - employeePayrollSummary.totalDeductions).toLocaleString() }}
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </v-card-text>

        <!-- Footer Actions -->
        <v-divider />
        <v-card-actions class="pa-3">
          <v-btn 
            variant="outlined" 
            size="small"
            density="compact"
            prepend-icon="mdi-download"
            @click="downloadCompletePayrollReport"
          >
            Download Complete Report
          </v-btn>
          <v-btn 
            variant="outlined" 
            size="small"
            density="compact"
            prepend-icon="mdi-file-excel"
            @click="exportToExcel"
          >
            Export to Excel
          </v-btn>
          <v-btn 
            variant="outlined" 
            size="small"
            density="compact"
            prepend-icon="mdi-printer"
            @click="printPayrollHistory"
          >
            Print History
          </v-btn>
          <v-spacer />
          <v-btn 
            variant="outlined" 
            size="small"
            density="compact"
            @click="showPayrollHistoryDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Generate Payslip Dialog -->
    <v-dialog v-model="showPayslipDialog" max-width="800px" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center bg-primary text-white">
          <v-icon left class="mr-2">fa:fas fa-file-invoice</v-icon>
          Generate Payslip - {{ selectedEmployee?.employeeName }}
        </v-card-title>
        
        <v-card-text class="pt-6">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                label="Pay Period"
                :model-value="selectedPeriod"
                variant="outlined"
                density="compact"
                readonly
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="Basic Salary"
                :model-value="formatCurrency(selectedEmployee?.basicSalary)"
                variant="outlined"
                density="compact"
                readonly
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="Allowances"
                :model-value="formatCurrency(selectedEmployee?.allowances)"
                variant="outlined"
                density="compact"
                readonly
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="Overtime"
                :model-value="formatCurrency(selectedEmployee?.overtime || 0)"
                variant="outlined"
                density="compact"
                readonly
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="Deductions"
                :model-value="formatCurrency(selectedEmployee?.deductions)"
                variant="outlined"
                density="compact"
                readonly
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="Net Salary"
                :model-value="formatCurrency(selectedEmployee?.netSalary)"
                variant="outlined"
                density="compact"
                readonly
                class="font-weight-bold"
              />
            </v-col>
          </v-row>
          
          <v-divider class="my-4" />
          
          <div class="d-flex justify-space-between align-center">
            <div>
              <h3>Payslip Options</h3>
              <p class="text-caption">Choose payslip format and delivery method</p>
            </div>
          </div>
          
          <v-row class="mt-3">
            <v-col cols="12" md="6">
              <v-select
                label="Format"
                :items="['PDF', 'Excel', 'Word']"
                model-value="PDF"
                variant="outlined"
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                label="Delivery Method"
                :items="['Download', 'Email', 'Both']"
                model-value="Download"
                variant="outlined"
                density="compact"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showPayslipDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="generatePayslipDocument"
          >
            <v-icon left>fa:fas fa-download</v-icon>
            Generate Payslip
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Payroll Dialog -->
    <v-dialog v-model="showEditPayrollDialog" max-width="900px" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center bg-primary text-white">
          <v-icon left class="mr-2">fa:fas fa-edit</v-icon>
          Edit Payroll - {{ selectedEmployee?.employeeName }}
        </v-card-title>
        
        <v-card-text class="pt-6">
          <v-form>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Basic Salary"
                  :model-value="selectedEmployee?.basicSalary"
                  variant="outlined"
                  density="compact"
                  type="number"
                  prefix="QAR"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Housing Allowance"
                  :model-value="selectedEmployee?.housingAllowance || 0"
                  variant="outlined"
                  density="compact"
                  type="number"
                  prefix="QAR"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Transport Allowance"
                  :model-value="selectedEmployee?.transportAllowance || 0"
                  variant="outlined"
                  density="compact"
                  type="number"
                  prefix="QAR"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Other Allowances"
                  :model-value="selectedEmployee?.otherAllowances || 0"
                  variant="outlined"
                  density="compact"
                  type="number"
                  prefix="QAR"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Overtime Hours"
                  :model-value="selectedEmployee?.overtimeHours || 0"
                  variant="outlined"
                  density="compact"
                  type="number"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Overtime Rate (per hour)"
                  :model-value="selectedEmployee?.overtimeRate || 50"
                  variant="outlined"
                  density="compact"
                  type="number"
                  prefix="QAR"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Loan Deduction"
                  :model-value="selectedEmployee?.loanDeduction || 0"
                  variant="outlined"
                  density="compact"
                  type="number"
                  prefix="QAR"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Other Deductions"
                  :model-value="selectedEmployee?.otherDeductions || 0"
                  variant="outlined"
                  density="compact"
                  type="number"
                  prefix="QAR"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  label="Notes"
                  placeholder="Add any special notes for this payroll entry..."
                  variant="outlined"
                  density="compact"
                  rows="3"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showEditPayrollDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="savePayrollChanges"
          >
            <v-icon left>fa:fas fa-save</v-icon>
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format, differenceInDays, addDays } from 'date-fns'

const router = useRouter()

// State
const loading = ref(false)
const processing = ref(false)
const selectedPeriod = ref('March 2025')
const selectedDepartment = ref(null)
const payrollStatus = ref('All')
const currentPeriodStatus = ref('In Progress')

// Payroll History Modal State
const showPayrollHistoryDialog = ref(false)
const showPayslipDialog = ref(false)
const showEditPayrollDialog = ref(false)
const selectedEmployee = ref<any>(null)
const selectedEmployeeHistory = ref<any>(null)
const payrollHistoryTab = ref('timeline')

// Employee payroll data structures
const employeePayrollSummary = ref({
  totalLifetimeEarnings: 0,
  totalPayments: 0,
  averageMonthlyPay: 0,
  totalBonuses: 0,
  totalAdvances: 0,
  totalDeductions: 0,
  totalRegularPayments: 0,
  joinDate: '',
  firstPaymentDate: '',
  employmentDays: 0,
  startingSalary: 0,
  salaryGrowthPercent: 0,
  numberOfRaises: 0,
  averageAnnualGrowth: 0,
  daysSinceLastPay: 0,
  outstandingAdvance: 0,
  monthlyAdvanceDeduction: 0
})

const detailedPayrollHistory = ref([])
const bonusHistory = ref([])
const advanceHistory = ref([])

const payrollDetailHeaders = [
  { title: 'Date', key: 'date', sortable: true },
  { title: 'Description', key: 'description', sortable: true },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Amount', key: 'amount', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Details', key: 'details', sortable: false }
]

// Mock data
const payrollSummary = ref({
  totalEmployees: 245,
  processedEmployees: 180,
  totalPayroll: 458750,
  basicSalaryTotal: 380250,
  totalDeductions: 45875,
  taxDeductions: 23400,
  totalAdvances: 15600,
  advanceCount: 18
})

const payrollPeriods = [
  { label: 'March 2025', value: 'March 2025' },
  { label: 'February 2025', value: 'February 2025' },
  { label: 'January 2025', value: 'January 2025' }
]

const statusOptions = ['All', 'Pending', 'Processed', 'On Hold', 'Completed']

const payrollHeaders = [
  { title: 'Employee', key: 'employee', sortable: true },
  { title: 'Department', key: 'department', sortable: true },
  { title: 'Basic Salary', key: 'basicSalary', sortable: true },
  { title: 'Allowances', key: 'allowances', sortable: true },
  { title: 'Deductions', key: 'deductions', sortable: true },
  { title: 'Net Pay', key: 'netPay', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

const payrollData = ref([
  {
    employeeId: 'NP001',
    employeeName: 'Ahmed Hassan Ali',
    department: 'Construction',
    basicSalary: 8500,
    housingAllowance: 2000,
    allowances: 2500,
    deductions: 850,
    advanceDeduction: 500,
    netPay: 10150,
    status: 'Processed'
  },
  {
    employeeId: 'NP002',
    employeeName: 'Sarah Ahmed Mohamed',
    department: 'Administration',
    basicSalary: 6500,
    housingAllowance: 1500,
    allowances: 1800,
    deductions: 650,
    advanceDeduction: 0,
    netPay: 7650,
    status: 'Pending'
  },
  {
    employeeId: 'NP003',
    employeeName: 'Rajesh Kumar Singh',
    department: 'Construction',
    basicSalary: 2200,
    housingAllowance: 800,
    allowances: 900,
    deductions: 220,
    advanceDeduction: 300,
    netPay: 2580,
    status: 'On Hold'
  }
])

const pendingActions = ref([
  {
    id: 1,
    title: 'Approve salary increase',
    description: '5 employees pending approval',
    icon: 'mdi-arrow-up',
    priority: 'warning'
  },
  {
    id: 2,
    title: 'Process advance payments',
    description: '12 advance requests',
    icon: 'mdi-hand-coin',
    priority: 'info'
  },
  {
    id: 3,
    title: 'Review overtime calculations',
    description: '8 overtime entries',
    icon: 'mdi-clock',
    priority: 'warning'
  }
])

// Computed
const filteredPayrollData = computed(() => {
  let filtered = payrollData.value

  if (selectedDepartment.value && selectedDepartment.value !== 'All') {
    filtered = filtered.filter(item => 
      item.department.toLowerCase().includes(selectedDepartment.value.toLowerCase())
    )
  }

  if (payrollStatus.value && payrollStatus.value !== 'All') {
    filtered = filtered.filter(item => item.status === payrollStatus.value)
  }

  return filtered
})

const nextPayrollDate = computed(() => {
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1, 1)
  return format(nextMonth, 'MMM dd, yyyy')
})

const daysUntilPayroll = computed(() => {
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1, 1)
  return differenceInDays(nextMonth, new Date())
})

const payrollCutoffDate = computed(() => {
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth(), 25)
  return format(cutoff, 'MMM dd, yyyy')
})

// Methods
const getDepartmentColor = (department: string): string => {
  const colors: Record<string, string> = {
    'Construction': 'orange',
    'Administration': 'blue',
    'Finance': 'green',
    'Human Resources': 'purple',
    'Safety': 'red'
  }
  return colors[department] || 'grey'
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Completed': 'success',
    'In Progress': 'warning',
    'Pending': 'info',
    'Draft': 'grey'
  }
  return colors[status] || 'grey'
}

const getPayrollStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Processed': 'success',
    'Pending': 'warning',
    'On Hold': 'error',
    'Completed': 'success'
  }
  return colors[status] || 'grey'
}

const getPayrollStatusIcon = (status: string): string => {
  const icons: Record<string, string> = {
    'Processed': 'mdi-check-circle',
    'Pending': 'mdi-clock',
    'On Hold': 'mdi-pause-circle',
    'Completed': 'mdi-check-all'
  }
  return icons[status] || 'mdi-help-circle'
}

const navigateTo = (path: string) => {
  router.push(path)
}

const processPayroll = async () => {
  if (!confirm('Are you sure you want to process payroll for the selected period? This action cannot be undone.')) {
    return
  }
  
  processing.value = true
  try {
    // Simulate payroll processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Update all employee payroll status to processed
    payrollData.value.forEach(employee => {
      employee.status = 'Processed'
      employee.lastProcessed = new Date().toLocaleDateString()
    })
    
    // Update period status
    currentPeriodStatus.value = 'Completed'
    
    alert(`Payroll processing completed successfully for ${selectedPeriod.value}!`)
  } catch (error) {
    console.error('Error processing payroll:', error)
    alert('Failed to process payroll. Please try again.')
  } finally {
    processing.value = false
  }
}

const exportPayroll = () => {
  try {
    // Create comprehensive payroll export
    const headers = ['Employee ID', 'Employee Name', 'Department', 'Basic Salary', 'Allowances', 'Deductions', 'Net Pay', 'Status']
    const csvContent = [
      headers.join(','),
      ...payrollData.value.map(emp => [
        emp.employeeId,
        `"${emp.employeeName}"`,
        emp.department,
        emp.basicSalary,
        emp.allowances,
        emp.deductions,
        emp.netPay,
        emp.status
      ].join(','))
    ].join('\n')

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `payroll_export_${selectedPeriod.value.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    alert('Payroll data exported successfully!')
  } catch (error) {
    console.error('Export failed:', error)
    alert('Failed to export payroll data. Please try again.')
  }
}

const loadPayrollData = () => {
  loading.value = true
  // TODO: Load payroll data for selected period
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

const filterPayrollData = () => {
  // Filtering is handled by computed property
}

const refreshPayrollData = () => {
  loadPayrollData()
}

const openPayrollSettings = () => {
  alert('Payroll Settings:\n\n• Payment Schedule: Monthly\n• Tax Rates: Standard Qatar Rates\n• Allowances: Transport, Housing\n• Deductions: Insurance, Social Security\n\nSettings can be modified in the main Settings page.')
}

const generatePayslip = (employee: any) => {
  selectedEmployee.value = employee
  showPayslipDialog.value = true
}

const editPayroll = (employee: any) => {
  selectedEmployee.value = employee
  showEditPayrollDialog.value = true
}

const processIndividualPayroll = (employee: any) => {
  if (confirm(`Process payroll for ${employee.employeeName}?`)) {
    // Update employee status
    const index = payrollData.value.findIndex(emp => emp.employeeId === employee.employeeId)
    if (index !== -1) {
      payrollData.value[index].status = 'Processed'
      payrollData.value[index].lastProcessed = new Date().toLocaleDateString()
    }
    alert(`Payroll processed successfully for ${employee.employeeName}!`)
  }
}

const holdPayroll = (employee: any) => {
  if (confirm(`Hold payroll for ${employee.employeeName}?`)) {
    // Update employee status
    const index = payrollData.value.findIndex(emp => emp.employeeId === employee.employeeId)
    if (index !== -1) {
      payrollData.value[index].status = 'On Hold'
    }
    alert(`Payroll put on hold for ${employee.employeeName}.`)
  }
}

const viewHistory = (employee: any) => {
  selectedEmployeeHistory.value = employee
  showPayrollHistoryDialog.value = true
}

const handlePendingAction = (action: any) => {
  if (confirm(`Execute action: ${action.title}?`)) {
    // Remove action from pending list
    const index = pendingActions.value.findIndex(a => a.id === action.id)
    if (index !== -1) {
      pendingActions.value.splice(index, 1)
    }
    alert(`${action.title} has been completed successfully!`)
  }
}

const schedulePayroll = () => {
  const scheduleDate = prompt('Enter schedule date (YYYY-MM-DD):')
  if (scheduleDate) {
    alert(`Payroll scheduled for ${scheduleDate}. Automated processing will begin at the specified date.`)
  }
}

// New dialog functions
const generatePayslipDocument = () => {
  if (selectedEmployee.value) {
    console.log('Generating payslip document for:', selectedEmployee.value.employeeName)
    showPayslipDialog.value = false
    alert(`Payslip generated successfully for ${selectedEmployee.value.employeeName}!`)
  }
}

const savePayrollChanges = () => {
  if (selectedEmployee.value) {
    console.log('Saving payroll changes for:', selectedEmployee.value.employeeName)
    showEditPayrollDialog.value = false
    alert(`Payroll updated successfully for ${selectedEmployee.value.employeeName}!`)
  }
}

const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: 'QAR'
  }).format(numAmount || 0)
}

// Comprehensive Payroll History Methods
const showEmployeePayrollHistory = (employee: any) => {
  selectedEmployeeHistory.value = employee
  generateComprehensivePayrollData(employee)
  showPayrollHistoryDialog.value = true
}

const generateComprehensivePayrollData = (employee: any) => {
  // Calculate employment duration
  const joinDate = new Date('2023-01-15') // Mock join date
  const currentDate = new Date()
  const employmentDays = Math.floor((currentDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24))
  const employmentMonths = Math.floor(employmentDays / 30)

  // Generate comprehensive payment history
  const history = []
  const bonuses = []
  const advances = []
  
  let currentMonth = new Date(joinDate.getFullYear(), joinDate.getMonth(), 1)
  let idCounter = 1
  let totalLifetime = 0
  let totalBonusAmount = 0
  let totalAdvanceAmount = 0
  let totalDeductionAmount = 0
  let startingSalary = Math.round(employee.basicSalary * 0.7) // Starting salary was 70% of current
  let currentSalary = startingSalary
  let numberOfRaises = 0

  while (currentMonth <= currentDate) {
    const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const paymentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 28)

    // Apply salary raises every 6 months
    if (idCounter % 6 === 0 && idCounter > 1) {
      const raiseAmount = Math.round(currentSalary * 0.08) // 8% raise
      currentSalary += raiseAmount
      numberOfRaises++
      
      // Add raise record
      history.push({
        id: idCounter++,
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 15).toISOString(),
        description: `Salary Raise - ${monthYear}`,
        type: 'Salary Raise',
        amount: raiseAmount,
        status: 'Processed',
        details: `New salary: QAR ${currentSalary.toLocaleString()}`
      })
    }

    // Monthly salary payment
    const allowances = Math.round(currentSalary * 0.4)
    const grossPay = currentSalary + allowances
    const deductions = Math.round(currentSalary * 0.1)
    const netPay = grossPay - deductions
    
    totalLifetime += netPay
    totalDeductionAmount += deductions

    history.push({
      id: idCounter++,
      date: paymentDate.toISOString(),
      description: `Monthly Salary - ${monthYear}`,
      type: 'Regular Salary',
      amount: netPay,
      status: idCounter === 2 ? 'Pending' : 'Processed',
      details: `Basic: ${currentSalary.toLocaleString()}, Allowances: ${allowances.toLocaleString()}, Deductions: ${deductions.toLocaleString()}`
    })

    // Random bonuses (20% chance each month)
    if (Math.random() < 0.2) {
      const bonusAmount = Math.round(currentSalary * (0.1 + Math.random() * 0.4)) // 10-50% of salary
      const bonusTypes = ['Performance Bonus', 'Project Completion Bonus', 'Annual Bonus', 'Overtime Bonus']
      const bonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)]
      
      bonuses.push({
        id: bonuses.length + 1,
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), Math.floor(Math.random() * 28) + 1).toISOString(),
        description: bonusType,
        amount: bonusAmount
      })

      history.push({
        id: idCounter++,
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), Math.floor(Math.random() * 28) + 1).toISOString(),
        description: bonusType,
        type: 'Bonus',
        amount: bonusAmount,
        status: 'Processed',
        details: `Special payment for exceptional performance`
      })

      totalBonusAmount += bonusAmount
      totalLifetime += bonusAmount
    }

    // Random advances (15% chance each month)
    if (Math.random() < 0.15) {
      const advanceAmount = Math.round(currentSalary * (0.2 + Math.random() * 0.3)) // 20-50% of salary
      const advanceReasons = ['Medical Emergency', 'Family Emergency', 'Education Expense', 'Housing Advance']
      const advanceReason = advanceReasons[Math.floor(Math.random() * advanceReasons.length)]
      
      advances.push({
        id: advances.length + 1,
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), Math.floor(Math.random() * 20) + 1).toISOString(),
        description: `Salary Advance - ${advanceReason}`,
        amount: advanceAmount
      })

      history.push({
        id: idCounter++,
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), Math.floor(Math.random() * 20) + 1).toISOString(),
        description: `Salary Advance - ${advanceReason}`,
        type: 'Advance',
        amount: advanceAmount,
        status: 'Processed',
        details: `To be deducted over next 6 months`
      })

      totalAdvanceAmount += advanceAmount
      totalLifetime += advanceAmount

      // Add advance deduction records for next 6 months
      for (let i = 1; i <= 6; i++) {
        const deductionMonth = new Date(currentMonth)
        deductionMonth.setMonth(deductionMonth.getMonth() + i)
        if (deductionMonth <= currentDate) {
          const deductionAmount = Math.round(advanceAmount / 6)
          history.push({
            id: idCounter++,
            date: new Date(deductionMonth.getFullYear(), deductionMonth.getMonth(), 28).toISOString(),
            description: `Advance Deduction (${i}/6)`,
            type: 'Deduction',
            amount: -deductionAmount,
            status: 'Processed',
            details: `Advance repayment installment`
          })
          totalLifetime -= deductionAmount
          totalDeductionAmount += deductionAmount
        }
      }
    }

    currentMonth.setMonth(currentMonth.getMonth() + 1)
  }

  // Sort history by date (newest first)
  history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  bonuses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  advances.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Calculate summary statistics
  const salaryGrowthPercent = startingSalary > 0 ? ((currentSalary - startingSalary) / startingSalary) * 100 : 0
  const averageAnnualGrowth = employmentMonths > 0 ? (salaryGrowthPercent / (employmentMonths / 12)) : 0
  const lastPaymentDate = history.find(h => h.type === 'Regular Salary')?.date
  const daysSinceLastPay = lastPaymentDate ? Math.floor((currentDate.getTime() - new Date(lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
  const outstandingAdvance = Math.round(Math.random() * 3000) // Random outstanding advance
  const monthlyAdvanceDeduction = outstandingAdvance > 0 ? Math.round(outstandingAdvance / 6) : 0

  // Update reactive data
  detailedPayrollHistory.value = history
  bonusHistory.value = bonuses
  advanceHistory.value = advances

  employeePayrollSummary.value = {
    totalLifetimeEarnings: totalLifetime,
    totalPayments: history.filter(h => h.amount > 0).length,
    averageMonthlyPay: employmentMonths > 0 ? Math.round(totalLifetime / employmentMonths) : 0,
    totalBonuses: totalBonusAmount,
    totalAdvances: totalAdvanceAmount,
    totalDeductions: totalDeductionAmount,
    totalRegularPayments: totalLifetime - totalBonusAmount - totalAdvanceAmount,
    joinDate: joinDate.toISOString(),
    firstPaymentDate: history.length > 0 ? history[history.length - 1].date : joinDate.toISOString(),
    employmentDays,
    startingSalary,
    salaryGrowthPercent,
    numberOfRaises,
    averageAnnualGrowth,
    daysSinceLastPay,
    outstandingAdvance,
    monthlyAdvanceDeduction
  }
}

const getPaymentTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'Regular Salary': 'primary',
    'Bonus': 'warning',
    'Advance': 'orange',
    'Deduction': 'error',
    'Salary Raise': 'success',
    'Overtime': 'info'
  }
  return colors[type] || 'grey'
}

const getPaymentTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'Regular Salary': 'mdi-cash',
    'Bonus': 'mdi-gift',
    'Advance': 'mdi-hand-coin',
    'Deduction': 'mdi-minus-circle',
    'Salary Raise': 'mdi-trending-up',
    'Overtime': 'mdi-clock-plus'
  }
  return icons[type] || 'mdi-cash'
}

const getPaymentStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Processed': 'success',
    'Pending': 'warning',
    'Failed': 'error',
    'Cancelled': 'grey'
  }
  return colors[status] || 'grey'
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const downloadCompletePayrollReport = () => {
  console.log('Downloading complete payroll report for:', selectedEmployeeHistory.value?.employeeId)
  // TODO: Generate comprehensive PDF report with all payroll data
}

const exportToExcel = () => {
  console.log('Exporting payroll data to Excel for:', selectedEmployeeHistory.value?.employeeId)
  // TODO: Export detailed payroll history to Excel format
}

const printPayrollHistory = () => {
  console.log('Printing payroll history for:', selectedEmployeeHistory.value?.employeeId)
  // TODO: Open print dialog with formatted payroll history
}

onMounted(() => {
  loadPayrollData()
})
</script>

<style scoped>
.payroll-dashboard {
  background-color: #fafafa;
  min-height: 100vh;
}

.payroll-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(25, 118, 210, 0.04);
}

.payroll-table :deep(.v-data-table-header) {
  background-color: #f5f5f5;
}

/* Card hover effects */
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Progress indicators */
.v-progress-linear {
  border-radius: 2px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .payroll-table :deep(.v-data-table) {
    font-size: 0.875rem;
  }
}
</style>
