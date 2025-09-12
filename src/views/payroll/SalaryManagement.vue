<template>
  <div class="salary-management">
    <v-container fluid>
      <!-- Header Section -->
      <v-row class="mb-3">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h5 font-weight-bold text-primary mb-1">Salary Management</h1>
              <p class="text-caption text-grey-darken-1 ma-0">
                Manage employee salaries, allowances, deductions, and compensation structures
              </p>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                size="small"
                density="compact"
                @click="showSalaryRevisionDialog = true"
              >
                Salary Revision
              </v-btn>
              <v-btn
                variant="outlined"
                prepend-icon="mdi-upload"
                size="small"
                density="compact"
                @click="showBulkUpdateDialog = true"
              >
                Bulk Update
              </v-btn>
              <v-btn
                variant="outlined"
                prepend-icon="mdi-download"
                size="small"
                density="compact"
                @click="exportSalaryReport"
              >
                Export Report
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Filters and Search -->
      <v-card class="mb-4" elevation="1" density="compact">
        <v-card-text class="pa-3">
          <v-row align="center" dense>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="searchQuery"
                prepend-inner-icon="mdi-magnify"
                label="Search employees..."
                variant="outlined"
                density="compact"
                clearable
                hide-details
                @input="filterEmployees"
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field
                v-model="selectedDepartment"
                label="Department"
                variant="outlined"
                density="compact"
                clearable
                @input="filterEmployees"
                hide-details
                placeholder="Filter by department"
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="selectedPosition"
                :items="positions"
                label="Position"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="filterEmployees"
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
                @update:model-value="filterEmployees"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="3">
              <div class="d-flex align-center">
                <v-chip
                  color="success"
                  variant="tonal"
                  size="x-small"
                  density="compact"
                  class="mr-2"
                >
                  {{ filteredEmployees.length }} employees
                </v-chip>
                <span class="text-caption text-grey-darken-1">
                  Total payroll: QAR {{ totalPayrollAmount.toLocaleString() }}
                </span>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Summary Cards -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" lg="3">
          <v-card elevation="1" class="summary-card">
            <v-card-text class="pa-3">
              <div class="d-flex align-center">
                <v-avatar size="40" color="primary" class="mr-3">
                  <v-icon color="white">mdi-account-group</v-icon>
                </v-avatar>
                <div>
                  <p class="text-caption text-grey-darken-1 ma-0">Total Employees</p>
                  <h3 class="text-h5 font-weight-bold">{{ employees.length }}</h3>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <v-card elevation="1" class="summary-card">
            <v-card-text class="pa-3">
              <div class="d-flex align-center">
                <v-avatar size="40" color="success" class="mr-3">
                  <v-icon color="white">mdi-cash-multiple</v-icon>
                </v-avatar>
                <div>
                  <p class="text-caption text-grey-darken-1 ma-0">Total Monthly Payroll</p>
                  <h3 class="text-h5 font-weight-bold">QAR {{ totalPayrollAmount.toLocaleString() }}</h3>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <v-card elevation="1" class="summary-card">
            <v-card-text class="pa-3">
              <div class="d-flex align-center">
                <v-avatar size="40" color="warning" class="mr-3">
                  <v-icon color="white">mdi-trending-up</v-icon>
                </v-avatar>
                <div>
                  <p class="text-caption text-grey-darken-1 ma-0">Average Salary</p>
                  <h3 class="text-h5 font-weight-bold">QAR {{ averageSalary.toLocaleString() }}</h3>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <v-card elevation="1" class="summary-card">
            <v-card-text class="pa-3">
              <div class="d-flex align-center">
                <v-avatar size="40" color="info" class="mr-3">
                  <v-icon color="white">mdi-calendar-clock</v-icon>
                </v-avatar>
                <div>
                  <p class="text-caption text-grey-darken-1 ma-0">Pending Revisions</p>
                  <h3 class="text-h5 font-weight-bold">{{ pendingRevisions }}</h3>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Employee Salary Table -->
      <v-card elevation="1">
        <v-card-title class="d-flex align-center justify-space-between pa-4">
          <span class="text-h6 font-weight-bold">Employee Salary Details</span>
          <v-btn-toggle
            v-model="viewMode"
            color="primary"
            size="x-small"
            density="compact"
            mandatory
          >
            <v-btn value="table" icon="mdi-table" />
            <v-btn value="grid" icon="mdi-view-grid" />
          </v-btn-toggle>
        </v-card-title>

        <!-- Table View -->
        <v-data-table
          v-if="viewMode === 'table'"
          :headers="salaryHeaders"
          :items="filteredEmployees"
          :items-per-page="itemsPerPage"
          class="elevation-0"
          item-key="employeeId"
          density="compact"
        >
          <template #item.employee="{ item }">
            <div class="d-flex align-center py-2">
              <v-avatar size="32" class="mr-3">
                <v-img :src="item.avatar" />
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-grey-darken-1">{{ item.employeeId }}</div>
              </div>
            </div>
          </template>

          <template #item.department="{ item }">
            <v-chip
              :color="getDepartmentColor(item.department)"
              variant="tonal"
              size="x-small"
              density="compact"
            >
              {{ item.department }}
            </v-chip>
          </template>

          <template #item.basicSalary="{ item }">
            <div class="font-weight-medium">QAR {{ item.basicSalary.toLocaleString() }}</div>
          </template>

          <template #item.allowances="{ item }">
            <div class="font-weight-medium">QAR {{ item.allowances.toLocaleString() }}</div>
          </template>

          <template #item.grossSalary="{ item }">
            <div class="font-weight-bold text-success">QAR {{ item.grossSalary.toLocaleString() }}</div>
          </template>

          <template #item.lastRevision="{ item }">
            <div class="text-caption">{{ formatDate(item.lastRevision) }}</div>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-btn
                icon="fa:fas fa-edit"
                size="small"
                variant="text"
                color="primary"
                class="action-btn"
                @click="editSalary(item)"
                title="Edit Salary"
              />
              <v-btn
                icon="fa:fas fa-chart-line"
                size="small"
                variant="text"
                color="primary"
                class="action-btn"
                @click="viewSalaryHistory(item)"
                title="View Salary History"
              />
              <v-btn
                icon="fa:fas fa-file-contract"
                size="small"
                variant="text"
                color="primary"
                class="action-btn"
                @click="generateContract(item)"
                title="Generate Contract"
              />
            </div>
          </template>
        </v-data-table>

        <!-- Grid View -->
        <div v-else class="pa-4">
          <v-row>
            <v-col
              v-for="employee in filteredEmployees"
              :key="employee.employeeId"
              cols="12"
              sm="6"
              lg="4"
              xl="3"
            >
              <v-card elevation="2" class="employee-salary-card" @click="editSalary(employee)">
                <v-card-text class="pa-3">
                  <div class="d-flex align-center mb-3">
                    <v-avatar size="40" class="mr-3">
                      <v-img :src="employee.avatar" />
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ employee.name }}</div>
                      <div class="text-caption text-grey-darken-1">{{ employee.employeeId }}</div>
                    </div>
                  </div>
                  
                  <v-chip
                    :color="getDepartmentColor(employee.department)"
                    variant="tonal"
                    size="x-small"
                    density="compact"
                    class="mb-2"
                  >
                    {{ employee.department }}
                  </v-chip>
                  
                  <div class="salary-details">
                    <div class="d-flex justify-space-between mb-1">
                      <span class="text-caption">Basic Salary:</span>
                      <span class="text-caption font-weight-medium">QAR {{ employee.basicSalary.toLocaleString() }}</span>
                    </div>
                    <div class="d-flex justify-space-between mb-1">
                      <span class="text-caption">Allowances:</span>
                      <span class="text-caption font-weight-medium">QAR {{ employee.allowances.toLocaleString() }}</span>
                    </div>
                    <v-divider class="my-2" />
                    <div class="d-flex justify-space-between">
                      <span class="text-body-2 font-weight-bold">Gross Salary:</span>
                      <span class="text-body-2 font-weight-bold text-success">QAR {{ employee.grossSalary.toLocaleString() }}</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card>

      <!-- Salary Revision Dialog -->
      <v-dialog v-model="showSalaryRevisionDialog" max-width="900" persistent>
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-trending-up</v-icon>
            <span>Salary Revision</span>
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="showSalaryRevisionDialog = false" />
          </v-card-title>
          
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="selectedEmployee"
                  :items="employees"
                  label="Select Employee"
                  item-title="name"
                  item-value="employeeId"
                  variant="outlined"
                  density="compact"
                  return-object
                  @update:model-value="loadEmployeeSalaryDetails"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-avatar size="32">
                          <v-img :src="item.raw.avatar" />
                        </v-avatar>
                      </template>
                      <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ item.raw.department }} - {{ item.raw.position }}</v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="revisionData.effectiveDate"
                  label="Effective Date"
                  type="date"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
            </v-row>

            <v-row v-if="selectedEmployee">
              <v-col cols="12">
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-subtitle-1">Current Salary Structure</v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="4">
                        <div class="text-caption text-grey-darken-1">Basic Salary</div>
                        <div class="text-h6">QAR {{ selectedEmployee.basicSalary?.toLocaleString() }}</div>
                      </v-col>
                      <v-col cols="4">
                        <div class="text-caption text-grey-darken-1">Allowances</div>
                        <div class="text-h6">QAR {{ selectedEmployee.allowances?.toLocaleString() }}</div>
                      </v-col>
                      <v-col cols="4">
                        <div class="text-caption text-grey-darken-1">Gross Salary</div>
                        <div class="text-h6 text-success">QAR {{ selectedEmployee.grossSalary?.toLocaleString() }}</div>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="revisionData.newBasicSalary"
                  label="New Basic Salary"
                  type="number"
                  variant="outlined"
                  density="compact"
                  prefix="QAR"
                  @input="calculateNewGross"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="revisionData.newAllowances"
                  label="New Allowances"
                  type="number"
                  variant="outlined"
                  density="compact"
                  prefix="QAR"
                  @input="calculateNewGross"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="revisionData.revisionType"
                  :items="revisionTypes"
                  label="Revision Type"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="revisionData.revisionPercentage"
                  label="Increase Percentage"
                  type="number"
                  variant="outlined"
                  density="compact"
                  suffix="%"
                  readonly
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-textarea
                  v-model="revisionData.reason"
                  label="Reason for Revision"
                  variant="outlined"
                  density="compact"
                  rows="3"
                />
              </v-col>
            </v-row>

            <v-row v-if="revisionData.newBasicSalary || revisionData.newAllowances">
              <v-col cols="12">
                <v-card variant="outlined" color="success">
                  <v-card-title class="text-subtitle-1">New Salary Structure</v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="4">
                        <div class="text-caption text-grey-darken-1">New Basic Salary</div>
                        <div class="text-h6">QAR {{ revisionData.newBasicSalary?.toLocaleString() || 0 }}</div>
                      </v-col>
                      <v-col cols="4">
                        <div class="text-caption text-grey-darken-1">New Allowances</div>
                        <div class="text-h6">QAR {{ revisionData.newAllowances?.toLocaleString() || 0 }}</div>
                      </v-col>
                      <v-col cols="4">
                        <div class="text-caption text-grey-darken-1">New Gross Salary</div>
                        <div class="text-h6 text-success">QAR {{ revisionData.newGrossSalary?.toLocaleString() || 0 }}</div>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              variant="outlined"
              @click="showSalaryRevisionDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              @click="submitSalaryRevision"
              :disabled="!canSubmitRevision"
            >
              Submit Revision
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Bulk Update Dialog -->
      <v-dialog v-model="showBulkUpdateDialog" max-width="700" persistent>
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-upload</v-icon>
            <span>Bulk Salary Update</span>
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="showBulkUpdateDialog = false" />
          </v-card-title>
          
          <v-card-text>
            <v-tabs v-model="bulkUpdateTab" color="primary">
              <v-tab value="percentage">Percentage Increase</v-tab>
              <v-tab value="file">File Upload</v-tab>
            </v-tabs>

            <v-window v-model="bulkUpdateTab" class="mt-4">
              <v-window-item value="percentage">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="bulkUpdateData.targetDepartment"
                      label="Target Department"
                      variant="outlined"
                      density="compact"
                      clearable
                      placeholder="e.g., Engineering, HR, Finance"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="bulkUpdateData.targetPosition"
                      :items="positions"
                      label="Target Position"
                      variant="outlined"
                      density="compact"
                      clearable
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="bulkUpdateData.increasePercentage"
                      label="Increase Percentage"
                      type="number"
                      variant="outlined"
                      density="compact"
                      suffix="%"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="bulkUpdateData.effectiveDate"
                      label="Effective Date"
                      type="date"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                </v-row>
                <v-textarea
                  v-model="bulkUpdateData.reason"
                  label="Reason for Bulk Update"
                  variant="outlined"
                  density="compact"
                  rows="3"
                />
              </v-window-item>

              <v-window-item value="file">
                <v-file-input
                  v-model="bulkUpdateData.file"
                  label="Upload Salary Data (CSV/Excel)"
                  variant="outlined"
                  density="compact"
                  accept=".csv,.xlsx,.xls"
                  prepend-icon="mdi-paperclip"
                />
                <v-alert type="info" variant="tonal" class="mt-3">
                  <div class="text-caption">
                    <strong>File Format:</strong> Employee ID, Basic Salary, Allowances, Effective Date
                  </div>
                </v-alert>
              </v-window-item>
            </v-window>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              variant="outlined"
              @click="showBulkUpdateDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              @click="processBulkUpdate"
            >
              Process Update
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Comprehensive Salary History Dialog -->
      <v-dialog v-model="showSalaryHistoryDialog" max-width="1400" persistent scrollable>
        <v-card>
          <v-card-title class="d-flex align-center bg-primary white--text pa-4">
            <v-icon color="white" class="mr-2">mdi-history</v-icon>
            <span class="text-h6">Complete Salary History & Analytics</span>
            <v-spacer />
            <v-btn 
              icon="mdi-close" 
              variant="text" 
              color="white" 
              @click="showSalaryHistoryDialog = false" 
            />
          </v-card-title>

          <v-card-text class="pa-0" v-if="selectedEmployeeForHistory" style="max-height: 80vh; overflow-y: auto;">
            <!-- Employee Overview Header -->
            <v-container fluid class="py-4 bg-blue-lighten-5">
              <v-row align="center">
                <v-col cols="auto">
                  <v-avatar size="80" class="elevation-3">
                    <v-img :src="selectedEmployeeForHistory.avatar" :alt="selectedEmployeeForHistory.name" />
                  </v-avatar>
                </v-col>
                <v-col>
                  <h2 class="text-h4 mb-2 font-weight-bold">{{ selectedEmployeeForHistory.name }}</h2>
                  <div class="d-flex align-center mb-2">
                    <v-chip color="primary" size="small" class="mr-2">{{ selectedEmployeeForHistory.position }}</v-chip>
                    <v-chip color="secondary" size="small" class="mr-2">{{ selectedEmployeeForHistory.department }}</v-chip>
                    <v-chip color="success" size="small">{{ selectedEmployeeForHistory.employeeId }}</v-chip>
                  </div>
                  <div class="text-body-1">
                    <v-icon small class="mr-1">mdi-calendar</v-icon>
                    Joined: {{ formatDate(selectedEmployeeForHistory.joinDate) }}
                    <span class="ml-4">
                      <v-icon small class="mr-1">mdi-briefcase</v-icon>
                      Tenure: {{ calculateTenure(selectedEmployeeForHistory.joinDate) }}
                    </span>
                  </div>
                </v-col>
                <v-col cols="auto">
                  <v-row>
                    <v-col>
                      <v-card variant="outlined" class="text-center pa-3 elevation-2">
                        <div class="text-caption text-grey-darken-1">Current Monthly</div>
                        <div class="text-h5 text-primary font-weight-bold">
                          {{ formatCurrency(selectedEmployeeForHistory.grossSalary) }}
                        </div>
                      </v-card>
                    </v-col>
                    <v-col>
                      <v-card variant="outlined" class="text-center pa-3 elevation-2">
                        <div class="text-caption text-grey-darken-1">Total Earned</div>
                        <div class="text-h5 text-success font-weight-bold">
                          {{ formatCurrency(calculateTotalEarned(selectedEmployeeForHistory)) }}
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-container>

            <!-- Tab Navigation -->
            <v-tabs v-model="salaryHistoryTab" color="primary" class="mb-4">
              <v-tab value="overview" prepend-icon="mdi-view-dashboard">
                <span class="d-none d-sm-inline">Overview</span>
              </v-tab>
              <v-tab value="timeline" prepend-icon="mdi-timeline">
                <span class="d-none d-sm-inline">Timeline</span>
              </v-tab>
              <v-tab value="financial" prepend-icon="mdi-finance">
                <span class="d-none d-sm-inline">Financial Analysis</span>
              </v-tab>
              <v-tab value="benefits" prepend-icon="mdi-gift">
                <span class="d-none d-sm-inline">Benefits</span>
              </v-tab>
              <v-tab value="performance" prepend-icon="mdi-star">
                <span class="d-none d-sm-inline">Performance</span>
              </v-tab>
              <v-tab value="documents" prepend-icon="mdi-file-document">
                <span class="d-none d-sm-inline">Documents</span>
              </v-tab>
            </v-tabs>

            <!-- Tab Content -->
            <v-window v-model="salaryHistoryTab">
              <!-- Overview Tab -->
              <v-window-item value="overview">
                <v-container fluid class="py-4">
                  <v-row>
                    <!-- Current Salary Breakdown -->
                    <v-col cols="12" md="6">
                      <v-card variant="outlined" class="h-100">
                        <v-card-title class="bg-primary-lighten-5">
                          <v-icon color="primary" class="mr-2">mdi-calculator</v-icon>
                          Current Salary Breakdown
                        </v-card-title>
                        <v-card-text>
                          <v-table density="compact">
                            <tbody>
                              <tr>
                                <td class="font-weight-medium">Basic Salary (Monthly)</td>
                                <td class="text-right">{{ formatCurrency(selectedEmployeeForHistory.basicSalary) }}</td>
                              </tr>
                              <tr>
                                <td class="font-weight-medium">Allowances (Monthly)</td>
                                <td class="text-right">{{ formatCurrency(selectedEmployeeForHistory.allowances) }}</td>
                              </tr>
                              <tr class="bg-success-lighten-5">
                                <td class="font-weight-bold">Gross Salary (Monthly)</td>
                                <td class="text-right font-weight-bold">{{ formatCurrency(selectedEmployeeForHistory.grossSalary) }}</td>
                              </tr>
                              <tr>
                                <td class="font-weight-medium">Daily Rate</td>
                                <td class="text-right">{{ formatCurrency(Math.round(selectedEmployeeForHistory.grossSalary / 30)) }}</td>
                              </tr>
                              <tr>
                                <td class="font-weight-medium">Hourly Rate (8hrs/day)</td>
                                <td class="text-right">{{ formatCurrency(Math.round(selectedEmployeeForHistory.grossSalary / 30 / 8)) }}</td>
                              </tr>
                              <tr class="bg-info-lighten-5">
                                <td class="font-weight-bold">Annual Salary</td>
                                <td class="text-right font-weight-bold">{{ formatCurrency(selectedEmployeeForHistory.grossSalary * 12) }}</td>
                              </tr>
                            </tbody>
                          </v-table>
                        </v-card-text>
                      </v-card>
                    </v-col>

                    <!-- Career Statistics -->
                    <v-col cols="12" md="6">
                      <v-card variant="outlined" class="h-100">
                        <v-card-title class="bg-success-lighten-5">
                          <v-icon color="success" class="mr-2">mdi-chart-line</v-icon>
                          Career Statistics
                        </v-card-title>
                        <v-card-text>
                          <v-table density="compact">
                            <tbody>
                              <tr>
                                <td class="font-weight-medium">Total Working Days</td>
                                <td class="text-right">{{ calculateWorkingDays(selectedEmployeeForHistory.joinDate) }} days</td>
                              </tr>
                              <tr>
                                <td class="font-weight-medium">Total Working Months</td>
                                <td class="text-right">{{ calculateWorkingMonths(selectedEmployeeForHistory.joinDate) }} months</td>
                              </tr>
                              <tr>
                                <td class="font-weight-medium">Salary Revisions</td>
                                <td class="text-right">3 times</td>
                              </tr>
                              <tr>
                                <td class="font-weight-medium">Average Annual Increase</td>
                                <td class="text-right text-success">{{ calculateAverageIncrease(selectedEmployeeForHistory) }}%</td>
                              </tr>
                              <tr>
                                <td class="font-weight-medium">Total Growth</td>
                                <td class="text-right text-success">{{ calculateTotalGrowth(selectedEmployeeForHistory) }}%</td>
                              </tr>
                              <tr class="bg-warning-lighten-5">
                                <td class="font-weight-bold">Career Earnings</td>
                                <td class="text-right font-weight-bold">{{ formatCurrency(calculateTotalEarned(selectedEmployeeForHistory)) }}</td>
                              </tr>
                            </tbody>
                          </v-table>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-window-item>

              <!-- Timeline Tab -->
              <v-window-item value="timeline">
                <v-container fluid class="py-4">
                  <h3 class="text-h5 mb-4 font-weight-bold">
                    <v-icon color="primary" class="mr-2">mdi-timeline</v-icon>
                    Complete Salary Timeline
                  </h3>

                  <v-timeline side="end" truncate-line="both">
                    <!-- Current Salary Period -->
                    <v-timeline-item dot-color="primary" icon="mdi-account-cash" size="large">
                      <template v-slot:opposite>
                        <div class="text-caption text-grey-darken-1">Current Period</div>
                        <div class="text-subtitle-2 font-weight-bold">{{ formatDate(selectedEmployeeForHistory.lastRevision) }} - Present</div>
                        <div class="text-caption">{{ calculateDaysBetween(selectedEmployeeForHistory.lastRevision, new Date().toISOString()) }} days</div>
                      </template>
                      <v-card variant="outlined" class="mb-4 elevation-2">
                        <v-card-title class="text-subtitle-1 bg-primary-lighten-5">
                          <v-icon color="primary" class="mr-2">mdi-trending-up</v-icon>
                          Current Salary Structure - {{ selectedEmployeeForHistory.position }}
                        </v-card-title>
                        <v-card-text>
                          <v-row>
                            <v-col cols="3">
                              <div class="text-caption text-grey-darken-1">Basic Salary</div>
                              <div class="text-h6">{{ formatCurrency(selectedEmployeeForHistory.basicSalary) }}</div>
                              <div class="text-caption">Per Month</div>
                            </v-col>
                            <v-col cols="3">
                              <div class="text-caption text-grey-darken-1">Allowances</div>
                              <div class="text-h6">{{ formatCurrency(selectedEmployeeForHistory.allowances) }}</div>
                              <div class="text-caption">Per Month</div>
                            </v-col>
                            <v-col cols="3">
                              <div class="text-caption text-grey-darken-1">Gross Salary</div>
                              <div class="text-h6 text-primary font-weight-bold">{{ formatCurrency(selectedEmployeeForHistory.grossSalary) }}</div>
                              <div class="text-caption">Per Month</div>
                            </v-col>
                            <v-col cols="3">
                              <div class="text-caption text-grey-darken-1">Period Earnings</div>
                              <div class="text-h6 text-success">{{ formatCurrency(calculatePeriodEarnings(selectedEmployeeForHistory.lastRevision, selectedEmployeeForHistory.grossSalary)) }}</div>
                              <div class="text-caption">Total Earned</div>
                            </v-col>
                          </v-row>
                          <v-divider class="my-3" />
                          <v-chip size="small" color="primary" class="mr-2">{{ calculateDaysBetween(selectedEmployeeForHistory.lastRevision, new Date().toISOString()) }} working days</v-chip>
                          <v-chip size="small" color="info" class="mr-2">{{ Math.ceil(calculateDaysBetween(selectedEmployeeForHistory.lastRevision, new Date().toISOString()) / 30) }} months</v-chip>
                          <v-chip size="small" color="success">{{ formatCurrency(selectedEmployeeForHistory.grossSalary * Math.ceil(calculateDaysBetween(selectedEmployeeForHistory.lastRevision, new Date().toISOString()) / 30)) }} earned</v-chip>
                        </v-card-text>
                      </v-card>
                    </v-timeline-item>

                    <!-- Performance Review Period -->
                    <v-timeline-item dot-color="success" icon="mdi-star" size="large">
                      <template v-slot:opposite>
                        <div class="text-caption text-grey-darken-1">Performance Review</div>
                        <div class="text-subtitle-2 font-weight-bold">Aug 1, 2023 - {{ formatDate(selectedEmployeeForHistory.lastRevision) }}</div>
                        <div class="text-caption">{{ calculateDaysBetween('2023-08-01', selectedEmployeeForHistory.lastRevision) }} days</div>
                      </template>
                      <v-card variant="outlined" class="mb-4 elevation-2">
                        <v-card-title class="text-subtitle-1 bg-success-lighten-5">
                          <v-icon color="success" class="mr-2">mdi-trending-up</v-icon>
                          Annual Performance Review (+15%) - Senior Developer
                        </v-card-title>
                        <v-card-text>
                          <v-row>
                            <v-col cols="3">
                              <div class="text-caption text-grey-darken-1">Previous Salary</div>
                              <div class="text-body-1">{{ formatCurrency(18260) }}</div>
                            </v-col>
                            <v-col cols="3">
                              <div class="text-caption text-grey-darken-1">New Salary</div>
                              <div class="text-body-1 text-success font-weight-bold">{{ formatCurrency(21000) }}</div>
                            </v-col>
                            <v-col cols="3">
                              <div class="text-caption text-grey-darken-1">Increase Amount</div>
                              <div class="text-body-1 text-success">{{ formatCurrency(2740) }}</div>
                            </v-col>
                            <v-col cols="3">
                              <div class="text-caption text-grey-darken-1">Period Earnings</div>
                              <div class="text-body-1 text-success">{{ formatCurrency(calculatePeriodEarnings('2023-08-01', 18260, selectedEmployeeForHistory.lastRevision)) }}</div>
                            </v-col>
                          </v-row>
                          <v-divider class="my-3" />
                          <div class="text-body-2 mb-2">
                            <strong>Reason:</strong> Excellent performance review with project leadership achievements and technical expertise demonstration
                          </div>
                          <div class="d-flex flex-wrap">
                            <v-chip size="small" color="success" class="mr-2 mb-1">+15% increase</v-chip>
                            <v-chip size="small" color="info" class="mr-2 mb-1">{{ calculateDaysBetween('2023-08-01', selectedEmployeeForHistory.lastRevision) }} working days</v-chip>
                            <v-chip size="small" color="warning" class="mr-2 mb-1">{{ Math.ceil(calculateDaysBetween('2023-08-01', selectedEmployeeForHistory.lastRevision) / 30) }} months served</v-chip>
                            <v-chip size="small" color="primary" class="mr-2 mb-1">{{ formatCurrency(18260 * Math.ceil(calculateDaysBetween('2023-08-01', selectedEmployeeForHistory.lastRevision) / 30)) }} total earned</v-chip>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-timeline-item>

                    <!-- Promotion Period -->
                    <v-timeline-item dot-color="info" icon="mdi-account-arrow-up" size="large">
                      <template v-slot:opposite>
                        <div class="text-caption text-grey-darken-1">Promotion</div>
                        <div class="text-subtitle-2 font-weight-bold">Jan 15, 2023 - Aug 1, 2023</div>
                        <div class="text-caption">{{ calculateDaysBetween('2023-01-15', '2023-08-01') }} days</div>
                      </template>
                      <v-card variant="outlined" class="mb-4 elevation-2">
                        <v-card-title class="text-subtitle-1 bg-info-lighten-5">
                          <v-icon color="info" class="mr-2">mdi-account-arrow-up</v-icon>
                          Promotion to Senior Developer (+25%)
                        </v-card-title>
                        <v-card-text>
                          <v-row>
                            <v-col cols="3">
                              <div class="text-caption text-grey-darken-1">Previous Salary</div>
                              <div class="text-body-1">{{ formatCurrency(14608) }}</div>
                            </v-col>
                            <v-col cols="3">
                              <div class="text-caption text-grey-darken-1">New Salary</div>
                              <div class="text-body-1 text-info font-weight-bold">{{ formatCurrency(18260) }}</div>
                            </v-col>
                            <v-col cols="3">
                              <div class="text-caption text-grey-darken-1">Increase Amount</div>
                              <div class="text-body-1 text-info">{{ formatCurrency(3652) }}</div>
                            </v-col>
                            <v-col cols="3">
                              <div class="text-caption text-grey-darken-1">Period Earnings</div>
                              <div class="text-body-1 text-info">{{ formatCurrency(calculatePeriodEarnings('2023-01-15', 18260, '2023-08-01')) }}</div>
                            </v-col>
                          </v-row>
                          <v-divider class="my-3" />
                          <div class="text-body-2 mb-2">
                            <strong>Reason:</strong> Promoted from Developer to Senior Developer role due to exceptional technical skills, leadership qualities, and consistent high performance
                          </div>
                          <div class="d-flex flex-wrap">
                            <v-chip size="small" color="info" class="mr-2 mb-1">+25% promotion increase</v-chip>
                            <v-chip size="small" color="success" class="mr-2 mb-1">{{ calculateDaysBetween('2023-01-15', '2023-08-01') }} working days</v-chip>
                            <v-chip size="small" color="warning" class="mr-2 mb-1">6.5 months in position</v-chip>
                            <v-chip size="small" color="primary" class="mr-2 mb-1">Developer → Senior Developer</v-chip>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-timeline-item>

                    <!-- Initial Employment Period -->
                    <v-timeline-item dot-color="warning" icon="mdi-account-plus" size="large">
                      <template v-slot:opposite>
                        <div class="text-caption text-grey-darken-1">Initial Employment</div>
                        <div class="text-subtitle-2 font-weight-bold">{{ formatDate(selectedEmployeeForHistory.joinDate) }} - Jan 15, 2023</div>
                        <div class="text-caption">{{ calculateDaysBetween(selectedEmployeeForHistory.joinDate, '2023-01-15') }} days</div>
                      </template>
                      <v-card variant="outlined" class="mb-4 elevation-2">
                        <v-card-title class="text-subtitle-1 bg-warning-lighten-5">
                          <v-icon color="warning" class="mr-2">mdi-account-plus</v-icon>
                          Initial Employment Package - Developer
                        </v-card-title>
                        <v-card-text>
                          <v-row>
                            <v-col cols="3">
                              <div class="text-caption text-grey-darken-1">Starting Basic</div>
                              <div class="text-body-1">{{ formatCurrency(10000) }}</div>
                            </v-col>
                            <v-col cols="3">
                              <div class="text-caption text-grey-darken-1">Starting Allowances</div>
                              <div class="text-body-1">{{ formatCurrency(4608) }}</div>
                            </v-col>
                            <v-col cols="3">
                              <div class="text-caption text-grey-darken-1">Starting Gross</div>
                              <div class="text-body-1 text-warning font-weight-bold">{{ formatCurrency(14608) }}</div>
                            </v-col>
                            <v-col cols="3">
                              <div class="text-caption text-grey-darken-1">Period Earnings</div>
                              <div class="text-body-1 text-warning">{{ formatCurrency(calculatePeriodEarnings(selectedEmployeeForHistory.joinDate, 14608, '2023-01-15')) }}</div>
                            </v-col>
                          </v-row>
                          <v-divider class="my-3" />
                          <div class="text-body-2 mb-2">
                            <strong>Position:</strong> Junior Developer | <strong>Department:</strong> {{ selectedEmployeeForHistory.department }}
                          </div>
                          <div class="text-body-2 mb-2">
                            <strong>Probation Period:</strong> 3 months | <strong>Contract Type:</strong> Full-time Permanent
                          </div>
                          <div class="d-flex flex-wrap">
                            <v-chip size="small" color="warning" class="mr-2 mb-1">First Job</v-chip>
                            <v-chip size="small" color="success" class="mr-2 mb-1">{{ calculateDaysBetween(selectedEmployeeForHistory.joinDate, '2023-01-15') }} working days</v-chip>
                            <v-chip size="small" color="info" class="mr-2 mb-1">{{ Math.ceil(calculateDaysBetween(selectedEmployeeForHistory.joinDate, '2023-01-15') / 30) }} months</v-chip>
                            <v-chip size="small" color="primary" class="mr-2 mb-1">{{ formatCurrency(14608 * Math.ceil(calculateDaysBetween(selectedEmployeeForHistory.joinDate, '2023-01-15') / 30)) }} earned</v-chip>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-timeline-item>
                  </v-timeline>
                </v-container>
              </v-window-item>

              <!-- Financial Analysis Tab -->
              <v-window-item value="financial">
                <v-container fluid class="py-4 bg-grey-lighten-5">
                  <h3 class="text-h5 mb-4 font-weight-bold">
                    <v-icon color="primary" class="mr-2">mdi-finance</v-icon>
                    Complete Financial Summary
                  </h3>

                  <v-row>
                    <v-col cols="12" md="8">
                      <v-card variant="outlined" class="elevation-3">
                        <v-card-title class="bg-blue-lighten-1 white--text">
                          <v-icon color="white" class="mr-2">mdi-chart-box</v-icon>
                          Detailed Financial Breakdown
                        </v-card-title>
                        <v-card-text>
                          <v-table density="comfortable">
                            <thead>
                              <tr class="bg-grey-lighten-4">
                                <th class="font-weight-bold">Period</th>
                                <th class="font-weight-bold text-right">Duration</th>
                                <th class="font-weight-bold text-right">Monthly Salary</th>
                                <th class="font-weight-bold text-right">Daily Rate</th>
                                <th class="font-weight-bold text-right">Total Earned</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td class="font-weight-medium">Current Period</td>
                                <td class="text-right">{{ Math.ceil(calculateDaysBetween(selectedEmployeeForHistory.lastRevision, new Date().toISOString()) / 30) }} months</td>
                                <td class="text-right">{{ formatCurrency(selectedEmployeeForHistory.grossSalary) }}</td>
                                <td class="text-right">{{ formatCurrency(Math.round(selectedEmployeeForHistory.grossSalary / 30)) }}</td>
                                <td class="text-right text-primary font-weight-bold">{{ formatCurrency(calculatePeriodEarnings(selectedEmployeeForHistory.lastRevision, selectedEmployeeForHistory.grossSalary)) }}</td>
                              </tr>
                              <tr>
                                <td class="font-weight-medium">Performance Review</td>
                                <td class="text-right">{{ Math.ceil(calculateDaysBetween('2023-08-01', selectedEmployeeForHistory.lastRevision) / 30) }} months</td>
                                <td class="text-right">{{ formatCurrency(18260) }}</td>
                                <td class="text-right">{{ formatCurrency(Math.round(18260 / 30)) }}</td>
                                <td class="text-right text-success font-weight-bold">{{ formatCurrency(calculatePeriodEarnings('2023-08-01', 18260, selectedEmployeeForHistory.lastRevision)) }}</td>
                              </tr>
                              <tr>
                                <td class="font-weight-medium">Senior Developer</td>
                                <td class="text-right">6.5 months</td>
                                <td class="text-right">{{ formatCurrency(18260) }}</td>
                                <td class="text-right">{{ formatCurrency(Math.round(18260 / 30)) }}</td>
                                <td class="text-right text-info font-weight-bold">{{ formatCurrency(calculatePeriodEarnings('2023-01-15', 18260, '2023-08-01')) }}</td>
                              </tr>
                              <tr>
                                <td class="font-weight-medium">Initial Employment</td>
                                <td class="text-right">{{ Math.ceil(calculateDaysBetween(selectedEmployeeForHistory.joinDate, '2023-01-15') / 30) }} months</td>
                                <td class="text-right">{{ formatCurrency(14608) }}</td>
                                <td class="text-right">{{ formatCurrency(Math.round(14608 / 30)) }}</td>
                                <td class="text-right text-warning font-weight-bold">{{ formatCurrency(calculatePeriodEarnings(selectedEmployeeForHistory.joinDate, 14608, '2023-01-15')) }}</td>
                              </tr>
                              <tr class="bg-success-lighten-4">
                                <td class="font-weight-bold text-h6">TOTAL CAREER</td>
                                <td class="text-right font-weight-bold">{{ calculateWorkingMonths(selectedEmployeeForHistory.joinDate) }} months</td>
                                <td class="text-right font-weight-bold">-</td>
                                <td class="text-right font-weight-bold">-</td>
                                <td class="text-right font-weight-bold text-success text-h6">{{ formatCurrency(calculateTotalEarned(selectedEmployeeForHistory)) }}</td>
                              </tr>
                            </tbody>
                          </v-table>
                        </v-card-text>
                      </v-card>
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-card variant="outlined" class="elevation-3 mb-4">
                        <v-card-title class="bg-success-lighten-1 white--text">
                          <v-icon color="white" class="mr-2">mdi-trending-up</v-icon>
                          Growth Metrics
                        </v-card-title>
                        <v-card-text>
                          <div class="text-center mb-3">
                            <div class="text-h3 text-success font-weight-bold">{{ calculateTotalGrowth(selectedEmployeeForHistory) }}%</div>
                            <div class="text-caption">Total Salary Growth</div>
                          </div>
                          <v-divider class="my-3" />
                          <div class="d-flex justify-space-between mb-2">
                            <span class="text-body-2">Starting Salary:</span>
                            <span class="font-weight-bold">{{ formatCurrency(14608) }}</span>
                          </div>
                          <div class="d-flex justify-space-between mb-2">
                            <span class="text-body-2">Current Salary:</span>
                            <span class="font-weight-bold text-primary">{{ formatCurrency(selectedEmployeeForHistory.grossSalary) }}</span>
                          </div>
                          <div class="d-flex justify-space-between mb-2">
                            <span class="text-body-2">Total Increase:</span>
                            <span class="font-weight-bold text-success">{{ formatCurrency(selectedEmployeeForHistory.grossSalary - 14608) }}</span>
                          </div>
                          <div class="d-flex justify-space-between mb-2">
                            <span class="text-body-2">Annual Growth Rate:</span>
                            <span class="font-weight-bold text-info">{{ calculateAverageIncrease(selectedEmployeeForHistory) }}%</span>
                          </div>
                        </v-card-text>
                      </v-card>

                      <v-card variant="outlined" class="elevation-3">
                        <v-card-title class="bg-info-lighten-1 white--text">
                          <v-icon color="white" class="mr-2">mdi-calendar-clock</v-icon>
                          Time Analytics
                        </v-card-title>
                        <v-card-text>
                          <div class="d-flex justify-space-between mb-2">
                            <span class="text-body-2">Total Working Days:</span>
                            <span class="font-weight-bold">{{ calculateWorkingDays(selectedEmployeeForHistory.joinDate) }}</span>
                          </div>
                          <div class="d-flex justify-space-between mb-2">
                            <span class="text-body-2">Working Months:</span>
                            <span class="font-weight-bold">{{ calculateWorkingMonths(selectedEmployeeForHistory.joinDate) }}</span>
                          </div>
                          <div class="d-flex justify-space-between mb-2">
                            <span class="text-body-2">Years of Service:</span>
                            <span class="font-weight-bold">{{ (calculateWorkingMonths(selectedEmployeeForHistory.joinDate) / 12).toFixed(1) }}</span>
                          </div>
                          <div class="d-flex justify-space-between mb-2">
                            <span class="text-body-2">Avg. Monthly Earning:</span>
                            <span class="font-weight-bold">{{ formatCurrency(Math.round(calculateTotalEarned(selectedEmployeeForHistory) / calculateWorkingMonths(selectedEmployeeForHistory.joinDate))) }}</span>
                          </div>
                          <div class="d-flex justify-space-between mb-2">
                            <span class="text-body-2">Avg. Daily Earning:</span>
                            <span class="font-weight-bold">{{ formatCurrency(Math.round(calculateTotalEarned(selectedEmployeeForHistory) / calculateWorkingDays(selectedEmployeeForHistory.joinDate))) }}</span>
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-window-item>

              <!-- Benefits Tab -->
              <v-window-item value="benefits">
                <v-container fluid class="py-4">
                  <h3 class="text-h5 mb-4 font-weight-bold">
                    <v-icon color="success" class="mr-2">mdi-gift</v-icon>
                    Benefits & Allowances Breakdown
                  </h3>

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-card variant="outlined" class="elevation-3 mb-4">
                        <v-card-title class="bg-success-lighten-1 white--text">
                          <v-icon color="white" class="mr-2">mdi-cash-multiple</v-icon>
                          Monthly Allowances
                        </v-card-title>
                        <v-card-text>
                          <v-table density="compact">
                            <tbody>
                              <tr>
                                <td class="font-weight-medium">Housing Allowance</td>
                                <td class="text-right">{{ formatCurrency(Math.round(selectedEmployeeForHistory.allowances * 0.6)) }}</td>
                              </tr>
                              <tr>
                                <td class="font-weight-medium">Transportation Allowance</td>
                                <td class="text-right">{{ formatCurrency(Math.round(selectedEmployeeForHistory.allowances * 0.25)) }}</td>
                              </tr>
                              <tr>
                                <td class="font-weight-medium">Meal Allowance</td>
                                <td class="text-right">{{ formatCurrency(Math.round(selectedEmployeeForHistory.allowances * 0.15)) }}</td>
                              </tr>
                              <tr class="bg-info-lighten-5">
                                <td class="font-weight-bold">Total Monthly Allowances</td>
                                <td class="text-right font-weight-bold">{{ formatCurrency(selectedEmployeeForHistory.allowances) }}</td>
                              </tr>
                            </tbody>
                          </v-table>
                        </v-card-text>
                      </v-card>

                      <v-card variant="outlined" class="elevation-3">
                        <v-card-title class="bg-info-lighten-1 white--text">
                          <v-icon color="white" class="mr-2">mdi-shield-check</v-icon>
                          Insurance Coverage
                        </v-card-title>
                        <v-card-text>
                          <v-list density="compact">
                            <v-list-item>
                              <v-list-item-icon>
                                <v-icon color="success">mdi-check-circle</v-icon>
                              </v-list-item-icon>
                              <v-list-item-content>
                                <v-list-item-title>Medical Insurance</v-list-item-title>
                                <v-list-item-subtitle>Full coverage for employee and family</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-icon>
                                <v-icon color="success">mdi-check-circle</v-icon>
                              </v-list-item-icon>
                              <v-list-item-content>
                                <v-list-item-title>Life Insurance</v-list-item-title>
                                <v-list-item-subtitle>2x annual salary coverage</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-icon>
                                <v-icon color="success">mdi-check-circle</v-icon>
                              </v-list-item-icon>
                              <v-list-item-content>
                                <v-list-item-title>Dental Coverage</v-list-item-title>
                                <v-list-item-subtitle>Comprehensive dental care</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                          </v-list>
                        </v-card-text>
                      </v-card>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-card variant="outlined" class="elevation-3 mb-4">
                        <v-card-title class="bg-warning-lighten-1 white--text">
                          <v-icon color="white" class="mr-2">mdi-calendar-month</v-icon>
                          Leave Entitlements
                        </v-card-title>
                        <v-card-text>
                          <v-table density="compact">
                            <tbody>
                              <tr>
                                <td class="font-weight-medium">Annual Leave</td>
                                <td class="text-right">30 days</td>
                              </tr>
                              <tr>
                                <td class="font-weight-medium">Sick Leave</td>
                                <td class="text-right">15 days</td>
                              </tr>
                              <tr>
                                <td class="font-weight-medium">Maternity Leave</td>
                                <td class="text-right">60 days</td>
                              </tr>
                              <tr>
                                <td class="font-weight-medium">Paternity Leave</td>
                                <td class="text-right">5 days</td>
                              </tr>
                              <tr class="bg-primary-lighten-5">
                                <td class="font-weight-bold">Emergency Leave</td>
                                <td class="text-right font-weight-bold">10 days</td>
                              </tr>
                            </tbody>
                          </v-table>
                        </v-card-text>
                      </v-card>

                      <v-card variant="outlined" class="elevation-3">
                        <v-card-title class="bg-error-lighten-1 white--text">
                          <v-icon color="white" class="mr-2">mdi-handshake</v-icon>
                          End of Service Benefits
                        </v-card-title>
                        <v-card-text>
                          <div class="text-body-2 mb-3">
                            <strong>Gratuity Calculation:</strong> As per Qatar Labor Law
                          </div>
                          <v-table density="compact">
                            <tbody>
                              <tr>
                                <td class="font-weight-medium">Years of Service</td>
                                <td class="text-right">{{ (calculateWorkingMonths(selectedEmployeeForHistory.joinDate) / 12).toFixed(1) }} years</td>
                              </tr>
                              <tr>
                                <td class="font-weight-medium">Last Basic Salary</td>
                                <td class="text-right">{{ formatCurrency(selectedEmployeeForHistory.basicSalary) }}</td>
                              </tr>
                              <tr class="bg-success-lighten-5">
                                <td class="font-weight-bold">Gratuity Amount</td>
                                <td class="text-right font-weight-bold">{{ formatCurrency(Math.round(selectedEmployeeForHistory.basicSalary * (calculateWorkingMonths(selectedEmployeeForHistory.joinDate) / 12) * 0.5)) }}</td>
                              </tr>
                            </tbody>
                          </v-table>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-window-item>

              <!-- Performance Tab -->
              <v-window-item value="performance">
                <v-container fluid class="py-4">
                  <h3 class="text-h5 mb-4 font-weight-bold">
                    <v-icon color="warning" class="mr-2">mdi-star</v-icon>
                    Performance History & Reviews
                  </h3>

                  <v-row>
                    <v-col cols="12" md="8">
                      <v-timeline side="end" truncate-line="both">
                        <v-timeline-item dot-color="success" icon="mdi-star" size="large">
                          <template v-slot:opposite>
                            <div class="text-caption text-grey-darken-1">Annual Review 2024</div>
                            <div class="text-subtitle-2 font-weight-bold">{{ formatDate(selectedEmployeeForHistory.lastRevision) }}</div>
                          </template>
                          <v-card variant="outlined" class="mb-4 elevation-2">
                            <v-card-title class="text-subtitle-1 bg-success-lighten-5">
                              <v-icon color="success" class="mr-2">mdi-trophy</v-icon>
                              Outstanding Performance Review
                            </v-card-title>
                            <v-card-text>
                              <v-row>
                                <v-col cols="4">
                                  <div class="text-center">
                                    <div class="text-h4 text-success font-weight-bold">95%</div>
                                    <div class="text-caption">Overall Rating</div>
                                  </div>
                                </v-col>
                                <v-col cols="4">
                                  <div class="text-center">
                                    <div class="text-h4 text-primary font-weight-bold">+15%</div>
                                    <div class="text-caption">Salary Increase</div>
                                  </div>
                                </v-col>
                                <v-col cols="4">
                                  <div class="text-center">
                                    <div class="text-h4 text-info font-weight-bold">A+</div>
                                    <div class="text-caption">Grade</div>
                                  </div>
                                </v-col>
                              </v-row>
                              <v-divider class="my-3" />
                              <div class="text-body-2 mb-2">
                                <strong>Key Achievements:</strong>
                              </div>
                              <v-list density="compact">
                                <v-list-item>
                                  <v-list-item-icon>
                                    <v-icon color="success" small>mdi-check</v-icon>
                                  </v-list-item-icon>
                                  <v-list-item-content>
                                    <v-list-item-subtitle>Led 3 major projects with 100% success rate</v-list-item-subtitle>
                                  </v-list-item-content>
                                </v-list-item>
                                <v-list-item>
                                  <v-list-item-icon>
                                    <v-icon color="success" small>mdi-check</v-icon>
                                  </v-list-item-icon>
                                  <v-list-item-content>
                                    <v-list-item-subtitle>Mentored 2 junior developers</v-list-item-subtitle>
                                  </v-list-item-content>
                                </v-list-item>
                                <v-list-item>
                                  <v-list-item-icon>
                                    <v-icon color="success" small>mdi-check</v-icon>
                                  </v-list-item-icon>
                                  <v-list-item-content>
                                    <v-list-item-subtitle>Improved system performance by 40%</v-list-item-subtitle>
                                  </v-list-item-content>
                                </v-list-item>
                              </v-list>
                            </v-card-text>
                          </v-card>
                        </v-timeline-item>

                        <v-timeline-item dot-color="info" icon="mdi-account-arrow-up" size="large">
                          <template v-slot:opposite>
                            <div class="text-caption text-grey-darken-1">Promotion Review</div>
                            <div class="text-subtitle-2 font-weight-bold">January 15, 2023</div>
                          </template>
                          <v-card variant="outlined" class="mb-4 elevation-2">
                            <v-card-title class="text-subtitle-1 bg-info-lighten-5">
                              <v-icon color="info" class="mr-2">mdi-account-arrow-up</v-icon>
                              Promotion to Senior Developer
                            </v-card-title>
                            <v-card-text>
                              <v-row>
                                <v-col cols="4">
                                  <div class="text-center">
                                    <div class="text-h4 text-info font-weight-bold">90%</div>
                                    <div class="text-caption">Promotion Rating</div>
                                  </div>
                                </v-col>
                                <v-col cols="4">
                                  <div class="text-center">
                                    <div class="text-h4 text-success font-weight-bold">+25%</div>
                                    <div class="text-caption">Salary Increase</div>
                                  </div>
                                </v-col>
                                <v-col cols="4">
                                  <div class="text-center">
                                    <div class="text-h4 text-primary font-weight-bold">A</div>
                                    <div class="text-caption">Grade</div>
                                  </div>
                                </v-col>
                              </v-row>
                              <v-divider class="my-3" />
                              <div class="text-body-2 mb-2">
                                <strong>Promotion Criteria Met:</strong>
                              </div>
                              <v-list density="compact">
                                <v-list-item>
                                  <v-list-item-icon>
                                    <v-icon color="success" small>mdi-check</v-icon>
                                  </v-list-item-icon>
                                  <v-list-item-content>
                                    <v-list-item-subtitle>Technical expertise and leadership skills</v-list-item-subtitle>
                                  </v-list-item-content>
                                </v-list-item>
                                <v-list-item>
                                  <v-list-item-icon>
                                    <v-icon color="success" small>mdi-check</v-icon>
                                  </v-list-item-icon>
                                  <v-list-item-content>
                                    <v-list-item-subtitle>Consistent high performance</v-list-item-subtitle>
                                  </v-list-item-content>
                                </v-list-item>
                                <v-list-item>
                                  <v-list-item-icon>
                                    <v-icon color="success" small>mdi-check</v-icon>
                                  </v-list-item-icon>
                                  <v-list-item-content>
                                    <v-list-item-subtitle>Team collaboration and mentoring</v-list-item-subtitle>
                                  </v-list-item-content>
                                </v-list-item>
                              </v-list>
                            </v-card-text>
                          </v-card>
                        </v-timeline-item>

                        <v-timeline-item dot-color="warning" icon="mdi-account-plus" size="large">
                          <template v-slot:opposite>
                            <div class="text-caption text-grey-darken-1">Initial Review</div>
                            <div class="text-subtitle-2 font-weight-bold">{{ formatDate(selectedEmployeeForHistory.joinDate) }}</div>
                          </template>
                          <v-card variant="outlined" class="mb-4 elevation-2">
                            <v-card-title class="text-subtitle-1 bg-warning-lighten-5">
                              <v-icon color="warning" class="mr-2">mdi-account-plus</v-icon>
                              Initial Employment Assessment
                            </v-card-title>
                            <v-card-text>
                              <v-row>
                                <v-col cols="4">
                                  <div class="text-center">
                                    <div class="text-h4 text-warning font-weight-bold">85%</div>
                                    <div class="text-caption">Initial Rating</div>
                                  </div>
                                </v-col>
                                <v-col cols="4">
                                  <div class="text-center">
                                    <div class="text-h4 text-success font-weight-bold">N/A</div>
                                    <div class="text-caption">Salary Increase</div>
                                  </div>
                                </v-col>
                                <v-col cols="4">
                                  <div class="text-center">
                                    <div class="text-h4 text-info font-weight-bold">B+</div>
                                    <div class="text-caption">Grade</div>
                                  </div>
                                </v-col>
                              </v-row>
                              <v-divider class="my-3" />
                              <div class="text-body-2 mb-2">
                                <strong>Initial Assessment:</strong>
                              </div>
                              <v-list density="compact">
                                <v-list-item>
                                  <v-list-item-icon>
                                    <v-icon color="success" small>mdi-check</v-icon>
                                  </v-list-item-icon>
                                  <v-list-item-content>
                                    <v-list-item-subtitle>Strong technical foundation</v-list-item-subtitle>
                                  </v-list-item-content>
                                </v-list-item>
                                <v-list-item>
                                  <v-list-item-icon>
                                    <v-icon color="success" small>mdi-check</v-icon>
                                  </v-list-item-icon>
                                  <v-list-item-content>
                                    <v-list-item-subtitle>Good learning attitude</v-list-item-subtitle>
                                  </v-list-item-content>
                                </v-list-item>
                                <v-list-item>
                                  <v-list-item-icon>
                                    <v-icon color="warning" small>mdi-clock</v-icon>
                                  </v-list-item-icon>
                                  <v-list-item-content>
                                    <v-list-item-subtitle>Needs experience in team leadership</v-list-item-subtitle>
                                  </v-list-item-content>
                                </v-list-item>
                              </v-list>
                            </v-card-text>
                          </v-card>
                        </v-timeline-item>
                      </v-timeline>
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-card variant="outlined" class="elevation-3 mb-4">
                        <v-card-title class="bg-primary-lighten-1 white--text">
                          <v-icon color="white" class="mr-2">mdi-chart-line</v-icon>
                          Performance Trends
                        </v-card-title>
                        <v-card-text>
                          <div class="text-center mb-3">
                            <div class="text-h3 text-success font-weight-bold">90%</div>
                            <div class="text-caption">Average Performance Rating</div>
                          </div>
                          <v-divider class="my-3" />
                          <div class="d-flex justify-space-between mb-2">
                            <span class="text-body-2">2024 Review:</span>
                            <span class="font-weight-bold text-success">95%</span>
                          </div>
                          <div class="d-flex justify-space-between mb-2">
                            <span class="text-body-2">2023 Promotion:</span>
                            <span class="font-weight-bold text-info">90%</span>
                          </div>
                          <div class="d-flex justify-space-between mb-2">
                            <span class="text-body-2">Initial Assessment:</span>
                            <span class="font-weight-bold text-warning">85%</span>
                          </div>
                          <div class="d-flex justify-space-between mb-2">
                            <span class="text-body-2">Improvement:</span>
                            <span class="font-weight-bold text-success">+10%</span>
                          </div>
                        </v-card-text>
                      </v-card>

                      <v-card variant="outlined" class="elevation-3">
                        <v-card-title class="bg-success-lighten-1 white--text">
                          <v-icon color="white" class="mr-2">mdi-trophy</v-icon>
                          Achievements
                        </v-card-title>
                        <v-card-text>
                          <v-list density="compact">
                            <v-list-item>
                              <v-list-item-icon>
                                <v-icon color="warning" small>mdi-star</v-icon>
                              </v-list-item-icon>
                              <v-list-item-content>
                                <v-list-item-title class="text-body-2">Employee of the Quarter</v-list-item-title>
                                <v-list-item-subtitle>Q4 2023</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-icon>
                                <v-icon color="info" small>mdi-account-group</v-icon>
                              </v-list-item-icon>
                              <v-list-item-content>
                                <v-list-item-title class="text-body-2">Team Player Award</v-list-item-title>
                                <v-list-item-subtitle>2023</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-icon>
                                <v-icon color="success" small>mdi-lightbulb</v-icon>
                              </v-list-item-icon>
                              <v-list-item-content>
                                <v-list-item-title class="text-body-2">Innovation Award</v-list-item-title>
                                <v-list-item-subtitle>Process Improvement</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                          </v-list>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-window-item>

              <!-- Documents Tab -->
              <v-window-item value="documents">
                <v-container fluid class="py-4">
                  <h3 class="text-h5 mb-4 font-weight-bold">
                    <v-icon color="info" class="mr-2">mdi-file-document</v-icon>
                    Document Management
                  </h3>

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-card variant="outlined" class="elevation-3 mb-4">
                        <v-card-title class="bg-primary-lighten-1 white--text">
                          <v-icon color="white" class="mr-2">mdi-file-pdf-box</v-icon>
                          Salary Related Documents
                        </v-card-title>
                        <v-card-text>
                          <v-list density="compact">
                            <v-list-item>
                              <v-list-item-icon>
                                <v-icon color="error">mdi-file-pdf-box</v-icon>
                              </v-list-item-icon>
                              <v-list-item-content>
                                <v-list-item-title>Employment Contract</v-list-item-title>
                                <v-list-item-subtitle>Signed on {{ formatDate(selectedEmployeeForHistory.joinDate) }}</v-list-item-subtitle>
                              </v-list-item-content>
                              <v-list-item-action>
                                <v-btn icon="mdi-download" size="small" color="primary" @click="generateContract(selectedEmployeeForHistory)" />
                              </v-list-item-action>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-icon>
                                <v-icon color="success">mdi-file-pdf-box</v-icon>
                              </v-list-item-icon>
                              <v-list-item-content>
                                <v-list-item-title>Salary Revision 2024</v-list-item-title>
                                <v-list-item-subtitle>Performance Review - +15% increase</v-list-item-subtitle>
                              </v-list-item-content>
                              <v-list-item-action>
                                <v-btn icon="mdi-download" size="small" color="primary" />
                              </v-list-item-action>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-icon>
                                <v-icon color="info">mdi-file-pdf-box</v-icon>
                              </v-list-item-icon>
                              <v-list-item-content>
                                <v-list-item-title>Promotion Letter 2023</v-list-item-title>
                                <v-list-item-subtitle>Senior Developer Position - +25% increase</v-list-item-subtitle>
                              </v-list-item-content>
                              <v-list-item-action>
                                <v-btn icon="mdi-download" size="small" color="primary" />
                              </v-list-item-action>
                            </v-list-item>
                          </v-list>
                        </v-card-text>
                      </v-card>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-card variant="outlined" class="elevation-3 mb-4">
                        <v-card-title class="bg-success-lighten-1 white--text">
                          <v-icon color="white" class="mr-2">mdi-file-chart</v-icon>
                          Reports & Analytics
                        </v-card-title>
                        <v-card-text>
                          <v-list density="compact">
                            <v-list-item>
                              <v-list-item-icon>
                                <v-icon color="primary">mdi-file-excel</v-icon>
                              </v-list-item-icon>
                              <v-list-item-content>
                                <v-list-item-title>Comprehensive Salary Report</v-list-item-title>
                                <v-list-item-subtitle>Complete history with calculations</v-list-item-subtitle>
                              </v-list-item-content>
                              <v-list-item-action>
                                <v-btn icon="mdi-download" size="small" color="primary" @click="downloadComprehensiveSalaryHistory" />
                              </v-list-item-action>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-icon>
                                <v-icon color="success">mdi-file-pdf-box</v-icon>
                              </v-list-item-icon>
                              <v-list-item-content>
                                <v-list-item-title>Performance Report 2024</v-list-item-title>
                                <v-list-item-subtitle>Annual review with detailed analysis</v-list-item-subtitle>
                              </v-list-item-content>
                              <v-list-item-action>
                                <v-btn icon="mdi-download" size="small" color="primary" />
                              </v-list-item-action>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-icon>
                                <v-icon color="info">mdi-file-document</v-icon>
                              </v-list-item-icon>
                              <v-list-item-content>
                                <v-list-item-title>Career Progression Summary</v-list-item-title>
                                <v-list-item-subtitle>Timeline and achievements overview</v-list-item-subtitle>
                              </v-list-item-content>
                              <v-list-item-action>
                                <v-btn icon="mdi-download" size="small" color="primary" />
                              </v-list-item-action>
                            </v-list-item>
                          </v-list>
                        </v-card-text>
                      </v-card>

                      <v-card variant="outlined" class="elevation-3">
                        <v-card-title class="bg-warning-lighten-1 white--text">
                          <v-icon color="white" class="mr-2">mdi-certificate</v-icon>
                          Certifications & Training
                        </v-card-title>
                        <v-card-text>
                          <v-list density="compact">
                            <v-list-item>
                              <v-list-item-icon>
                                <v-icon color="success">mdi-certificate</v-icon>
                              </v-list-item-icon>
                              <v-list-item-content>
                                <v-list-item-title>Advanced Vue.js Certification</v-list-item-title>
                                <v-list-item-subtitle>Completed: March 2024</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-icon>
                                <v-icon color="info">mdi-school</v-icon>
                              </v-list-item-icon>
                              <v-list-item-content>
                                <v-list-item-title>Leadership Training</v-list-item-title>
                                <v-list-item-subtitle>Completed: January 2024</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-icon>
                                <v-icon color="primary">mdi-code-braces</v-icon>
                              </v-list-item-icon>
                              <v-list-item-content>
                                <v-list-item-title>TypeScript Advanced Course</v-list-item-title>
                                <v-list-item-subtitle>Completed: September 2023</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                          </v-list>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-window-item>
            </v-window>
          </v-card-text>

          <v-card-actions class="pa-4 bg-grey-lighten-5">
            <v-btn 
              color="primary" 
              variant="elevated" 
              prepend-icon="mdi-download"
              @click="downloadComprehensiveSalaryHistory"
              class="mr-2"
            >
              Download Detailed Report
            </v-btn>
            <v-btn 
              color="success" 
              variant="elevated" 
              prepend-icon="mdi-email"
              @click="emailSalaryHistory"
              class="mr-2"
            >
              Email Report
            </v-btn>
            <v-btn 
              color="info" 
              variant="outlined" 
              prepend-icon="mdi-file-excel"
              @click="exportToExcel"
            >
              Export to Excel
            </v-btn>
            <v-spacer />
            <v-btn
              color="grey-darken-1"
              variant="text"
              @click="showSalaryHistoryDialog = false"
            >
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Employee type interface
interface Employee {
  employeeId: string
  name: string
  avatar: string
  department: string
  position: string
  basicSalary: number
  allowances: number
  grossSalary: number
  lastRevision: string
  joinDate: string
}

// Reactive variables
const searchQuery = ref('')
const selectedDepartment = ref('')
const selectedPosition = ref('')
const salaryRange = ref('')
const viewMode = ref('table')
const itemsPerPage = ref(25)

// Dialog states
const showSalaryRevisionDialog = ref(false)
const showBulkUpdateDialog = ref(false)
const showSalaryHistoryDialog = ref(false)
const bulkUpdateTab = ref('percentage')
const salaryHistoryTab = ref('overview')

// Selected employee for history
const selectedEmployeeForHistory = ref<Employee | null>(null)

// Employee and salary data
const employees = ref<Employee[]>([
  {
    employeeId: 'EMP001',
    name: 'Ahmed Al-Rashid',
    avatar: 'https://i.pravatar.cc/150?img=1',
    department: 'Engineering',
    position: 'Senior Developer',
    basicSalary: 15000,
    allowances: 6000,
    grossSalary: 21000,
    lastRevision: '2024-01-15',
    joinDate: '2022-03-01'
  },
  {
    employeeId: 'EMP002',
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=2',
    department: 'Marketing',
    position: 'Marketing Manager',
    basicSalary: 12000,
    allowances: 4800,
    grossSalary: 16800,
    lastRevision: '2024-02-01',
    joinDate: '2021-08-15'
  },
  {
    employeeId: 'EMP003',
    name: 'Mohammed Hassan',
    avatar: 'https://i.pravatar.cc/150?img=3',
    department: 'Finance',
    position: 'Financial Analyst',
    basicSalary: 10000,
    allowances: 4000,
    grossSalary: 14000,
    lastRevision: '2024-01-01',
    joinDate: '2023-01-10'
  },
  {
    employeeId: 'EMP004',
    name: 'Fatima Al-Zahra',
    avatar: 'https://i.pravatar.cc/150?img=4',
    department: 'HR',
    position: 'HR Specialist',
    basicSalary: 8000,
    allowances: 3200,
    grossSalary: 11200,
    lastRevision: '2024-03-01',
    joinDate: '2022-06-01'
  },
  {
    employeeId: 'EMP005',
    name: 'David Chen',
    avatar: 'https://i.pravatar.cc/150?img=5',
    department: 'Engineering',
    position: 'Junior Developer',
    basicSalary: 7000,
    allowances: 2800,
    grossSalary: 9800,
    lastRevision: '2024-02-15',
    joinDate: '2023-09-01'
  }
])

const filteredEmployees = ref([...employees.value])

// Form data
const selectedEmployee = ref<Employee | null>(null)
const revisionData = ref({
  effectiveDate: '',
  newBasicSalary: 0,
  newAllowances: 0,
  newGrossSalary: 0,
  revisionType: '',
  revisionPercentage: 0,
  reason: ''
})

const bulkUpdateData = ref({
  targetDepartment: '',
  targetPosition: '',
  increasePercentage: 0,
  effectiveDate: '',
  reason: '',
  file: null
})

// Options data
const positions = ref(['Senior Developer', 'Marketing Manager', 'Financial Analyst', 'HR Specialist', 'Junior Developer'])
const salaryRanges = ref([
  { title: 'Under QAR 5,000', value: '0-5000' },
  { title: 'QAR 5,000 - 10,000', value: '5000-10000' },
  { title: 'QAR 10,000 - 15,000', value: '10000-15000' },
  { title: 'QAR 15,000 - 20,000', value: '15000-20000' },
  { title: 'Above QAR 20,000', value: '20000+' }
])

const revisionTypes = ref([
  'Annual Review',
  'Promotion',
  'Performance Bonus',
  'Market Adjustment',
  'Cost of Living',
  'Special Recognition'
])

// Table headers
const salaryHeaders = ref([
  { title: 'Employee', key: 'employee', sortable: false },
  { title: 'Department', key: 'department' },
  { title: 'Position', key: 'position' },
  { title: 'Basic Salary', key: 'basicSalary' },
  { title: 'Allowances', key: 'allowances' },
  { title: 'Gross Salary', key: 'grossSalary' },
  { title: 'Last Revision', key: 'lastRevision' },
  { title: 'Actions', key: 'actions', sortable: false }
])

// Computed properties
const totalPayrollAmount = computed(() => {
  return filteredEmployees.value.reduce((total, emp) => total + emp.grossSalary, 0)
})

const averageSalary = computed(() => {
  const total = filteredEmployees.value.reduce((total, emp) => total + emp.grossSalary, 0)
  return filteredEmployees.value.length > 0 ? Math.round(total / filteredEmployees.value.length) : 0
})

const pendingRevisions = computed(() => {
  // Mock pending revisions count
  return 3
})

const canSubmitRevision = computed(() => {
  return selectedEmployee.value && 
         revisionData.value.effectiveDate && 
         (revisionData.value.newBasicSalary > 0 || revisionData.value.newAllowances > 0) &&
         revisionData.value.reason
})

// Methods
const filterEmployees = () => {
  let filtered = [...employees.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(emp => 
      emp.name.toLowerCase().includes(query) ||
      emp.employeeId.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query) ||
      emp.position.toLowerCase().includes(query)
    )
  }

  if (selectedDepartment.value) {
    filtered = filtered.filter(emp => 
      emp.department.toLowerCase().includes(selectedDepartment.value.toLowerCase())
    )
  }

  if (selectedPosition.value) {
    filtered = filtered.filter(emp => emp.position === selectedPosition.value)
  }

  if (salaryRange.value) {
    const [min, max] = salaryRange.value.split('-').map(Number)
    if (max) {
      filtered = filtered.filter(emp => emp.grossSalary >= min && emp.grossSalary <= max)
    } else {
      filtered = filtered.filter(emp => emp.grossSalary >= min)
    }
  }

  filteredEmployees.value = filtered
}

const getDepartmentColor = (department: string): string => {
  const colors: Record<string, string> = {
    'Engineering': 'primary',
    'Marketing': 'secondary',
    'Finance': 'success',
    'HR': 'warning',
    'Operations': 'info',
    'Sales': 'error'
  }
  return colors[department] || 'grey'
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const editSalary = (employee: any) => {
  selectedEmployee.value = employee
  revisionData.value = {
    effectiveDate: '',
    newBasicSalary: employee.basicSalary,
    newAllowances: employee.allowances,
    newGrossSalary: employee.grossSalary,
    revisionType: '',
    revisionPercentage: 0,
    reason: ''
  }
  showSalaryRevisionDialog.value = true
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: 'QAR',
    minimumFractionDigits: 0
  }).format(amount)
}

const viewSalaryHistory = (employee: any) => {
  try {
    selectedEmployeeForHistory.value = employee
    showSalaryHistoryDialog.value = true
  } catch (error) {
    console.error('Error viewing salary history:', error)
    alert('Failed to load salary history. Please try again.')
  }
}

// Download salary history function
const downloadSalaryHistory = () => {
  if (!selectedEmployeeForHistory.value) return
  
  const employee = selectedEmployeeForHistory.value
  const currentSalary = employee.grossSalary || 0
  const previousSalary1 = Math.round(currentSalary * 0.9)
  const previousSalary2 = Math.round(currentSalary * 0.8)
  const growthPercent = Math.round(((currentSalary - previousSalary2) / previousSalary2) * 100)
  
  const reportContent = `COMPREHENSIVE SALARY HISTORY REPORT

================================
EMPLOYEE INFORMATION
================================
Name: ${employee.name}
Employee ID: ${employee.employeeId}
Department: ${employee.department}
Position: ${employee.position}
Date Joined: ${formatDate(employee.joinDate)}
Report Generated: ${new Date().toLocaleDateString()}

================================
SALARY PROGRESSION TIMELINE
================================

1. INITIAL JOINING SALARY (${formatDate(employee.joinDate)})
   - Position: Junior Developer
   - Basic Salary: ${formatCurrency(10000)}
   - Allowances: ${formatCurrency(4608)}
   - Gross Salary: ${formatCurrency(14608)}

2. PROMOTION REVISION (January 15, 2023)
   - Position: Developer → Senior Developer
   - Previous Gross: ${formatCurrency(14608)}
   - New Gross: ${formatCurrency(18260)}
   - Increase: ${formatCurrency(3652)} (+25%)
   - Reason: Promoted to Senior Developer role

3. PERFORMANCE REVIEW (August 1, 2023)
   - Position: Senior Developer
   - Previous Gross: ${formatCurrency(18260)}
   - New Gross: ${formatCurrency(21000)}
   - Increase: ${formatCurrency(2740)} (+15%)
   - Reason: Excellent performance review with project leadership

4. CURRENT SALARY (${formatDate(employee.lastRevision)})
   - Position: ${employee.position}
   - Basic Salary: ${formatCurrency(employee.basicSalary)}
   - Allowances: ${formatCurrency(employee.allowances)}
   - Gross Salary: ${formatCurrency(employee.grossSalary)}

================================
GROWTH ANALYSIS
================================
Starting Salary: ${formatCurrency(14608)}
Current Salary: ${formatCurrency(employee.grossSalary)}
Total Increase: ${formatCurrency(employee.grossSalary - 14608)}
Overall Growth: ${Math.round(((employee.grossSalary - 14608) / 14608) * 100)}%
Average Annual Growth: ${Math.round(((employee.grossSalary - 14608) / 14608) * 100 / 2)}%
Years of Service: ${Math.round((new Date().getTime() - new Date(employee.joinDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000) * 10) / 10}

================================
NOTES
================================
- All amounts are in Qatari Riyals (QAR)
- Growth percentages calculated from base salary
- Regular performance reviews conducted annually
- Salary revisions based on performance and market standards

Report generated by Nipon Payroll Management System
© 2024 Nipon Group. All rights reserved.`
  
  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${employee.name.replace(/\s+/g, '_')}_Salary_History_${new Date().toISOString().split('T')[0]}.txt`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Email salary history function
const emailSalaryHistory = () => {
  if (!selectedEmployeeForHistory.value) return
  
  const employee = selectedEmployeeForHistory.value
  const subject = `Salary History Report - ${employee.name} (${employee.employeeId})`
  const body = `Dear HR Team,

Please find the salary history summary for ${employee.name} below:

Employee: ${employee.name}
Employee ID: ${employee.employeeId}
Department: ${employee.department}
Position: ${employee.position}

Current Salary Structure:
- Basic Salary: ${formatCurrency(employee.basicSalary)}
- Allowances: ${formatCurrency(employee.allowances)}
- Gross Salary: ${formatCurrency(employee.grossSalary)}

For detailed history report, please download the comprehensive report from the payroll system.

Best regards,
Payroll Management System`

  const mailtoLink = `mailto:hr@nipongroup.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.open(mailtoLink)
}

// Calculate tenure in years and months
const calculateTenure = (joinDate: string) => {
  const join = new Date(joinDate)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - join.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)
  
  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`
  } else {
    return `${months} month${months > 1 ? 's' : ''}`
  }
}

// Calculate working days between two dates
const calculateWorkingDays = (startDate: string, endDate?: string) => {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Calculate working months
const calculateWorkingMonths = (startDate: string, endDate?: string) => {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()
  const years = end.getFullYear() - start.getFullYear()
  const months = end.getMonth() - start.getMonth()
  return years * 12 + months
}

// Calculate days between two dates
const calculateDaysBetween = (startDate: string, endDate: string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Calculate period earnings
const calculatePeriodEarnings = (startDate: string, monthlySalary: number, endDate?: string) => {
  const months = calculateWorkingMonths(startDate, endDate || new Date().toISOString())
  return Math.round(months * monthlySalary)
}

// Calculate total career earnings
const calculateTotalEarned = (employee: any) => {
  const currentPeriodEarnings = calculatePeriodEarnings(employee.lastRevision, employee.grossSalary)
  const performanceReviewEarnings = calculatePeriodEarnings('2023-08-01', 18260, employee.lastRevision)
  const seniorDevEarnings = calculatePeriodEarnings('2023-01-15', 18260, '2023-08-01')
  const initialEarnings = calculatePeriodEarnings(employee.joinDate, 14608, '2023-01-15')
  
  return currentPeriodEarnings + performanceReviewEarnings + seniorDevEarnings + initialEarnings
}

// Calculate total growth percentage
const calculateTotalGrowth = (employee: any) => {
  const startingSalary = 14608
  const currentSalary = employee.grossSalary
  return Math.round(((currentSalary - startingSalary) / startingSalary) * 100)
}

// Calculate average annual increase
const calculateAverageIncrease = (employee: any) => {
  const totalGrowth = calculateTotalGrowth(employee)
  const yearsOfService = calculateWorkingMonths(employee.joinDate) / 12
  return Math.round(totalGrowth / yearsOfService)
}

// Download comprehensive salary history
const downloadComprehensiveSalaryHistory = () => {
  if (!selectedEmployeeForHistory.value) return
  
  const employee = selectedEmployeeForHistory.value
  const totalEarned = calculateTotalEarned(employee)
  const workingDays = calculateWorkingDays(employee.joinDate)
  const workingMonths = calculateWorkingMonths(employee.joinDate)
  
  const reportContent = `
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                        COMPREHENSIVE SALARY HISTORY REPORT                          ║
║                               NIPON PAYROLL SYSTEM                                   ║
╚══════════════════════════════════════════════════════════════════════════════════════╝

EMPLOYEE INFORMATION
════════════════════════════════════════════════════════════════════════════════════════
Name:                   ${employee.name}
Employee ID:            ${employee.employeeId}
Department:             ${employee.department}
Current Position:       ${employee.position}
Date Joined:            ${formatDate(employee.joinDate)}
Current Status:         Active Employee
Report Generated:       ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

EMPLOYMENT SUMMARY
════════════════════════════════════════════════════════════════════════════════════════
Total Working Days:     ${workingDays} days
Total Working Months:   ${workingMonths} months  
Years of Service:       ${(workingMonths / 12).toFixed(1)} years
Total Career Earnings:  ${formatCurrency(totalEarned)}
Current Monthly Salary: ${formatCurrency(employee.grossSalary)}
Starting Monthly Salary: ${formatCurrency(14608)}
Total Growth:           ${calculateTotalGrowth(employee)}%
Average Annual Growth:  ${calculateAverageIncrease(employee)}%

DETAILED SALARY PROGRESSION TIMELINE
════════════════════════════════════════════════════════════════════════════════════════

1. INITIAL EMPLOYMENT PERIOD
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Period:              ${formatDate(employee.joinDate)} to January 15, 2023
   Duration:            ${calculateDaysBetween(employee.joinDate, '2023-01-15')} days (${Math.ceil(calculateDaysBetween(employee.joinDate, '2023-01-15') / 30)} months)
   Position:            Junior Developer
   Basic Salary:        ${formatCurrency(10000)} per month
   Allowances:          ${formatCurrency(4608)} per month
   Gross Salary:        ${formatCurrency(14608)} per month
   Daily Rate:          ${formatCurrency(Math.round(14608 / 30))} per day
   Hourly Rate:         ${formatCurrency(Math.round(14608 / 30 / 8))} per hour (8 hrs/day)
   Period Earnings:     ${formatCurrency(calculatePeriodEarnings(employee.joinDate, 14608, '2023-01-15'))}
   Contract Type:       Full-time Permanent
   Probation:           3 months (Successfully completed)

2. PROMOTION TO SENIOR DEVELOPER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Effective Date:      January 15, 2023
   Period:              January 15, 2023 to August 1, 2023
   Duration:            ${calculateDaysBetween('2023-01-15', '2023-08-01')} days (6.5 months)
   Position Change:     Junior Developer → Senior Developer
   Previous Salary:     ${formatCurrency(14608)} per month
   New Basic Salary:    ${formatCurrency(12500)} per month
   New Allowances:      ${formatCurrency(5760)} per month
   New Gross Salary:    ${formatCurrency(18260)} per month
   Salary Increase:     ${formatCurrency(3652)} per month (+25%)
   Daily Rate:          ${formatCurrency(Math.round(18260 / 30))} per day
   Hourly Rate:         ${formatCurrency(Math.round(18260 / 30 / 8))} per hour
   Period Earnings:     ${formatCurrency(calculatePeriodEarnings('2023-01-15', 18260, '2023-08-01'))}
   Reason:              Promotion due to exceptional technical skills and leadership

3. ANNUAL PERFORMANCE REVIEW
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Effective Date:      August 1, 2023
   Period:              August 1, 2023 to ${formatDate(employee.lastRevision)}
   Duration:            ${calculateDaysBetween('2023-08-01', employee.lastRevision)} days (${Math.ceil(calculateDaysBetween('2023-08-01', employee.lastRevision) / 30)} months)
   Position:            Senior Developer (Continued)
   Previous Salary:     ${formatCurrency(18260)} per month
   New Basic Salary:    ${formatCurrency(13000)} per month
   New Allowances:      ${formatCurrency(8000)} per month
   New Gross Salary:    ${formatCurrency(21000)} per month
   Salary Increase:     ${formatCurrency(2740)} per month (+15%)
   Daily Rate:          ${formatCurrency(Math.round(21000 / 30))} per day
   Hourly Rate:         ${formatCurrency(Math.round(21000 / 30 / 8))} per hour
   Period Earnings:     ${formatCurrency(calculatePeriodEarnings('2023-08-01', 18260, employee.lastRevision))}
   Reason:              Excellent performance review with project leadership

4. CURRENT SALARY STRUCTURE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Effective Date:      ${formatDate(employee.lastRevision)}
   Period:              ${formatDate(employee.lastRevision)} to Present
   Duration:            ${calculateDaysBetween(employee.lastRevision, new Date().toISOString())} days (${Math.ceil(calculateDaysBetween(employee.lastRevision, new Date().toISOString()) / 30)} months)
   Position:            ${employee.position}
   Basic Salary:        ${formatCurrency(employee.basicSalary)} per month
   Allowances:          ${formatCurrency(employee.allowances)} per month
   Gross Salary:        ${formatCurrency(employee.grossSalary)} per month
   Daily Rate:          ${formatCurrency(Math.round(employee.grossSalary / 30))} per day
   Hourly Rate:         ${formatCurrency(Math.round(employee.grossSalary / 30 / 8))} per hour
   Period Earnings:     ${formatCurrency(calculatePeriodEarnings(employee.lastRevision, employee.grossSalary))}
   Annual Equivalent:   ${formatCurrency(employee.grossSalary * 12)}

COMPREHENSIVE FINANCIAL BREAKDOWN
════════════════════════════════════════════════════════════════════════════════════════
Period 1 Earnings:     ${formatCurrency(calculatePeriodEarnings(employee.joinDate, 14608, '2023-01-15'))}
Period 2 Earnings:     ${formatCurrency(calculatePeriodEarnings('2023-01-15', 18260, '2023-08-01'))}
Period 3 Earnings:     ${formatCurrency(calculatePeriodEarnings('2023-08-01', 18260, employee.lastRevision))}
Period 4 Earnings:     ${formatCurrency(calculatePeriodEarnings(employee.lastRevision, employee.grossSalary))}
                       ─────────────────────────────────────────────────────────────────
TOTAL CAREER EARNINGS: ${formatCurrency(totalEarned)}

AVERAGE CALCULATIONS
════════════════════════════════════════════════════════════════════════════════════════
Average Monthly Salary: ${formatCurrency(Math.round(totalEarned / workingMonths))}
Average Daily Earnings:  ${formatCurrency(Math.round(totalEarned / workingDays))}
Average Hourly Earnings: ${formatCurrency(Math.round(totalEarned / workingDays / 8))}

GROWTH ANALYSIS
════════════════════════════════════════════════════════════════════════════════════════
Starting Monthly Salary:    ${formatCurrency(14608)}
Current Monthly Salary:     ${formatCurrency(employee.grossSalary)}
Total Monetary Increase:    ${formatCurrency(employee.grossSalary - 14608)}
Total Percentage Growth:    ${calculateTotalGrowth(employee)}%
Average Annual Growth Rate: ${calculateAverageIncrease(employee)}%

SALARY REVISION HISTORY
════════════════════════════════════════════════════════════════════════════════════════
Revision 1: Jan 15, 2023 - Promotion (+25%) - ${formatCurrency(3652)} increase
Revision 2: Aug 1, 2023 - Performance Review (+15%) - ${formatCurrency(2740)} increase
Revision 3: ${formatDate(employee.lastRevision)} - Current Structure

BENEFITS & ALLOWANCES BREAKDOWN
════════════════════════════════════════════════════════════════════════════════════════
Housing Allowance:      Included in monthly allowances
Transportation:         Included in monthly allowances
Medical Insurance:      Company provided (Full coverage)
Annual Leave:           30 days per year
Sick Leave:             15 days per year
End of Service:         As per Qatar Labor Law

NOTES & REMARKS
════════════════════════════════════════════════════════════════════════════════════════
• All amounts are in Qatari Riyals (QAR)
• Calculations based on 30 days per month
• Working hours: 8 hours per day, 5 days per week
• All salary revisions are performance-based
• Employee shows consistent growth and excellence
• Regular performance reviews conducted annually
• All statutory requirements met as per Qatar Labor Law

REPORT CERTIFICATION
════════════════════════════════════════════════════════════════════════════════════════
This report is generated by the Nipon Payroll Management System
Report ID: SAL-${employee.employeeId}-${new Date().toISOString().split('T')[0]}
Generated by: System Administrator
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

© 2024 Nipon Group. All rights reserved.
For any queries, contact: hr@nipongroup.com | +974-xxxx-xxxx

═══════════════════════════════════════════════════════════════════════════════════════════`
  
  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${employee.name.replace(/\s+/g, '_')}_Comprehensive_Salary_History_${new Date().toISOString().split('T')[0]}.txt`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export to Excel function
const exportToExcel = () => {
  if (!selectedEmployeeForHistory.value) return
  
  const employee = selectedEmployeeForHistory.value
  alert('Excel export functionality will be implemented with a proper Excel library. For now, please use the detailed text report.')
}

const generateContract = (employee: any) => {
  try {
    // Generate employment contract
    const contractContent = `
EMPLOYMENT CONTRACT

Employee: ${employee.name}
Employee ID: ${employee.employeeId}
Position: ${employee.position}
Department: ${employee.department}

SALARY DETAILS:
Basic Salary: ${formatCurrency(employee.basicSalary)}
Allowances: ${formatCurrency(employee.allowances)}
Gross Salary: ${formatCurrency(employee.grossSalary)}

Contract Terms:
- Employment Type: Full-time
- Working Hours: 8 hours/day, 5 days/week
- Annual Leave: 30 days
- Benefits: Medical insurance, Transport allowance

Generated on: ${new Date().toLocaleDateString()}
    `
    
    const blob = new Blob([contractContent], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `contract_${employee.employeeId}_${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    
    alert(`Employment contract generated successfully for ${employee.name}!`)
  } catch (error) {
    console.error('Contract generation failed:', error)
    alert('Failed to generate contract. Please try again.')
  }
}

const loadEmployeeSalaryDetails = () => {
  if (selectedEmployee.value) {
    revisionData.value.newBasicSalary = selectedEmployee.value.basicSalary
    revisionData.value.newAllowances = selectedEmployee.value.allowances
    calculateNewGross()
  }
}

const calculateNewGross = () => {
  const newBasic = revisionData.value.newBasicSalary || 0
  const newAllowances = revisionData.value.newAllowances || 0
  revisionData.value.newGrossSalary = newBasic + newAllowances

  if (selectedEmployee.value && selectedEmployee.value.grossSalary > 0) {
    const currentGross = selectedEmployee.value.grossSalary
    const newGross = revisionData.value.newGrossSalary
    revisionData.value.revisionPercentage = Math.round(((newGross - currentGross) / currentGross) * 100)
  }
}

const submitSalaryRevision = () => {
  try {
    if (!revisionData.value.effectiveDate || !revisionData.value.reason) {
      alert('Please fill in all required fields.')
      return
    }
    
    // Apply the salary revision
    if (selectedEmployee.value) {
      const index = employeeSalaries.value.findIndex(emp => emp.employeeId === selectedEmployee.value.employeeId)
      if (index !== -1) {
        employeeSalaries.value[index].basicSalary = revisionData.value.newBasicSalary
        employeeSalaries.value[index].allowances = revisionData.value.newAllowances
        employeeSalaries.value[index].grossSalary = revisionData.value.newGrossSalary
        employeeSalaries.value[index].lastRevised = revisionData.value.effectiveDate
      }
    }
    
    alert(`Salary revision submitted successfully for ${selectedEmployee.value?.name}!`)
    showSalaryRevisionDialog.value = false
    
    // Reset form
    selectedEmployee.value = null
    revisionData.value = {
      effectiveDate: '',
      newBasicSalary: 0,
      newAllowances: 0,
      newGrossSalary: 0,
      revisionType: '',
      revisionPercentage: 0,
      reason: ''
    }
  } catch (error) {
    console.error('Salary revision failed:', error)
    alert('Failed to submit salary revision. Please try again.')
  }
}

const processBulkUpdate = () => {
  try {
    if (!bulkUpdateData.value.percentage || !bulkUpdateData.value.effectiveDate) {
      alert('Please fill in all required fields.')
      return
    }
    
    // Apply bulk update to selected employees
    const updatedCount = employeeSalaries.value.filter(emp => 
      bulkUpdateData.value.selectedDepartments.includes(emp.department)
    ).length
    
    employeeSalaries.value.forEach(emp => {
      if (bulkUpdateData.value.selectedDepartments.includes(emp.department)) {
        const increaseAmount = emp.grossSalary * (bulkUpdateData.value.percentage / 100)
        emp.grossSalary += increaseAmount
        emp.basicSalary += increaseAmount * 0.7 // Assume 70% is basic salary
        emp.allowances += increaseAmount * 0.3 // Assume 30% is allowances
        emp.lastRevised = bulkUpdateData.value.effectiveDate
      }
    })
    
    alert(`Bulk salary update completed! ${updatedCount} employees updated with ${bulkUpdateData.value.percentage}% increase.`)
    showBulkUpdateDialog.value = false
    
    // Reset form
    bulkUpdateData.value = {
      selectedDepartments: [],
      percentage: 0,
      effectiveDate: '',
      reason: ''
    }
  } catch (error) {
    console.error('Bulk update failed:', error)
    alert('Failed to process bulk update. Please try again.')
  }
}

const exportSalaryReport = () => {
  try {
    // Create comprehensive salary report
    const headers = ['Employee ID', 'Name', 'Department', 'Position', 'Basic Salary', 'Allowances', 'Gross Salary', 'Last Revised']
    const csvContent = [
      headers.join(','),
      ...employeeSalaries.value.map(emp => [
        emp.employeeId,
        `"${emp.name}"`,
        emp.department,
        emp.position,
        emp.basicSalary,
        emp.allowances,
        emp.grossSalary,
        emp.lastRevised || 'N/A'
      ].join(','))
    ].join('\n')

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `salary_report_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    alert('Salary report exported successfully!')
  } catch (error) {
    console.error('Export failed:', error)
    alert('Failed to export salary report. Please try again.')
  }
}

onMounted(() => {
  // Initialize component
  filterEmployees()
})
</script>

<style scoped>
.salary-management {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.summary-card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease-in-out;
}

.employee-salary-card {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.employee-salary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.salary-details {
  border-top: 1px solid #e0e0e0;
  padding-top: 8px;
  margin-top: 8px;
}
</style>
