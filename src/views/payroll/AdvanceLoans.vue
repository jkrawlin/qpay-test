<template>
  <div class="advance-loans">
    <v-container fluid>
      <!-- Header Section -->
      <v-row class="mb-3">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h5 font-weight-bold text-primary mb-1">Salary Advances</h1>
              <p class="text-caption text-grey-darken-1 ma-0">
                Manage interest-free salary advances with structured repayment plans
              </p>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                color="primary"
                prepend-icon="mdi-cash-fast"
                size="small"
                density="compact"
                @click="showNewAdvanceDialog = true"
              >
                <template #prepend>
                  <Icon icon="material-symbols:request-quote" :width="20" :height="20" />
                </template>
                New Salary Advance
              </v-btn>
              <v-btn
                variant="outlined"
                size="small"
                density="compact"
                @click="exportAdvanceReport"
              >
                <LucideDownload :size="20" class="mr-2" />
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
                label="Search employees or requests..."
                variant="outlined"
                density="compact"
                clearable
                hide-details
                @input="filterRequests"
              >
                <template #prepend-inner>
                  <LucideSearch :size="20" />
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="selectedDepartment"
                :items="departments"
                label="Department"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="filterRequests"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="selectedType"
                :items="requestTypes"
                label="Type"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="filterRequests"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="selectedStatus"
                :items="statusOptions"
                label="Status"
                variant="outlined"
                density="compact"
                clearable
                @update:model-value="filterRequests"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="3">
              <div class="d-flex align-center">
                <v-chip
                  color="info"
                  variant="tonal"
                  size="x-small"
                  density="compact"
                  class="mr-2"
                >
                  {{ filteredRequests.length }} requests
                </v-chip>
                <span class="text-caption text-grey-darken-1">
                  Outstanding: QAR {{ totalOutstanding.toLocaleString() }}
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
                  <v-icon color="white">mdi-cash-fast</v-icon>
                </v-avatar>
                <div>
                  <p class="text-caption text-grey-darken-1 ma-0">Salary Advances (Interest-Free)</p>
                  <h3 class="text-h5 font-weight-bold">QAR {{ totalAdvances.toLocaleString() }}</h3>
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
                  <v-icon color="white">mdi-clock-alert</v-icon>
                </v-avatar>
                <div>
                  <p class="text-caption text-grey-darken-1 ma-0">Outstanding Amount</p>
                  <h3 class="text-h5 font-weight-bold">QAR {{ totalOutstanding.toLocaleString() }}</h3>
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
                  <v-icon color="white">mdi-file-clock</v-icon>
                </v-avatar>
                <div>
                  <p class="text-caption text-grey-darken-1 ma-0">Pending Requests</p>
                  <h3 class="text-h5 font-weight-bold">{{ pendingRequests }}</h3>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Main Content Tabs -->
      <v-card elevation="1">
        <v-tabs v-model="activeTab" color="primary" class="px-4">
          <v-tab value="all">All Requests</v-tab>
          <v-tab value="advances">Salary Advances</v-tab>
          <v-tab value="repayments">Repayment Schedule</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <!-- All Requests Tab -->
          <v-window-item value="all">
            <v-data-table
              :headers="allRequestsHeaders"
              :items="filteredRequests"
              :items-per-page="itemsPerPage"
              class="elevation-0"
              item-key="id"
              density="compact"
            >
              <template #item.employee="{ item }">
                <div class="d-flex align-center py-2">
                  <v-avatar size="32" class="mr-3">
                    <v-img :src="item.avatar" />
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ item.employeeName }}</div>
                    <div class="text-caption text-grey-darken-1">{{ item.employeeId }}</div>
                  </div>
                </div>
              </template>

              <template #item.amount="{ item }">
                <div class="font-weight-medium">QAR {{ item.amount.toLocaleString() }}</div>
              </template>

              <template #item.outstanding="{ item }">
                <div class="font-weight-medium text-warning">QAR {{ item.outstanding.toLocaleString() }}</div>
              </template>

              <template #item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  variant="tonal"
                  size="x-small"
                  density="compact"
                >
                  {{ item.status }}
                </v-chip>
              </template>

              <template #item.requestDate="{ item }">
                <div class="text-caption">{{ formatDate(item.requestDate) }}</div>
              </template>

              <template #item.actions="{ item }">
                <div class="d-flex gap-2">
                  <v-btn
                    icon="fa:fas fa-eye"
                    size="small"
                    variant="text"
                    color="primary"
                    class="action-btn"
                    @click="viewRequestDetails(item)"
                    title="View Details"
                  />
                  <v-btn
                    v-if="item.status === 'Pending'"
                    icon="fa:fas fa-check-circle"
                    size="small"
                    variant="text"
                    color="primary"
                    class="action-btn"
                    @click="approveRequest(item)"
                    title="Approve Request"
                  />
                  <v-btn
                    v-if="item.status === 'Pending'"
                    icon="fa:fas fa-times-circle"
                    size="small"
                    variant="text"
                    color="primary"
                    class="action-btn"
                    @click="rejectRequest(item)"
                    title="Reject Request"
                  />
                  <v-btn
                    v-if="item.status === 'Approved' && item.outstanding > 0"
                    icon="fa:fas fa-dollar-sign"
                    size="small"
                    variant="text"
                    color="primary"
                    class="action-btn"
                    @click="recordPayment(item)"
                    title="Record Salary Deduction"
                  />
                  <v-btn
                    v-if="item.status === 'Approved'"
                    icon="fa:fas fa-edit"
                    size="small"
                    variant="text"
                    color="primary"
                    class="action-btn"
                    @click="editRequest(item)"
                    title="Edit Request"
                  />
                </div>
              </template>
            </v-data-table>
          </v-window-item>

          <!-- Advances Tab -->
          <v-window-item value="advances">
            <div class="pa-4">
              <v-alert type="info" variant="tonal" class="mb-4">
                <v-icon slot="prepend">mdi-information</v-icon>
                <strong>Salary Advances:</strong> Interest-free advances deducted from future salary payments over the specified period.
              </v-alert>
              <v-row>
                <v-col
                  v-for="advance in advanceRequests"
                  :key="advance.id"
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <v-card elevation="2" class="advance-card" hover>
                    <!-- Primary Eye Action Button -->
                    <v-btn
                      icon="mdi-eye"
                      size="small"
                      variant="elevated"
                      color="primary"
                      class="position-absolute action-btn-primary"
                      style="top: 8px; right: 8px; z-index: 5;"
                      @click="viewRequestDetails(advance)"
                      title="View Details"
                    />
                    
                    <!-- Additional Actions Menu -->
                    <v-menu location="end" v-if="advance.status === 'Pending' || advance.status === 'Approved'">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          icon="mdi-dots-vertical"
                          size="small"
                          variant="text"
                          class="position-absolute"
                          style="top: 8px; right: 48px; z-index: 5;"
                          v-bind="props"
                        />
                      </template>
                      <v-list density="compact">
                        <v-list-item
                          v-if="advance.status === 'Pending'"
                          prepend-icon="mdi-check-circle"
                          title="Approve Request"
                          @click="approveRequest(advance)"
                        />
                        <v-list-item
                          v-if="advance.status === 'Pending'"
                          prepend-icon="mdi-close-circle"
                          title="Reject Request"
                          @click="rejectRequest(advance)"
                        />
                        <v-list-item
                          v-if="advance.status === 'Approved' && advance.outstanding > 0"
                          prepend-icon="mdi-currency-usd"
                          title="Record Salary Deduction"
                          @click="recordPayment(advance)"
                        />
                        <v-list-item
                          v-if="advance.status === 'Approved'"
                          prepend-icon="mdi-pencil"
                          title="Edit Request"
                          @click="editRequest(advance)"
                        />
                      </v-list>
                    </v-menu>

                    <v-card-text class="pa-3">
                      <div class="d-flex align-center justify-space-between mb-3">
                        <div class="d-flex align-center">
                          <v-avatar size="40" class="mr-3">
                            <v-img :src="advance.avatar" />
                          </v-avatar>
                          <div>
                            <div class="font-weight-medium">{{ advance.employeeName }}</div>
                            <div class="text-caption text-grey-darken-1">{{ advance.employeeId }}</div>
                          </div>
                        </div>
                        <v-chip
                          :color="getStatusColor(advance.status)"
                          variant="tonal"
                          size="x-small"
                          density="compact"
                        >
                          {{ advance.status }}
                        </v-chip>
                      </div>
                      
                      <div class="advance-details">
                        <div class="d-flex justify-space-between mb-1">
                          <span class="text-caption">Advance Amount:</span>
                          <span class="text-caption font-weight-medium">QAR {{ advance.amount.toLocaleString() }}</span>
                        </div>
                        <div class="d-flex justify-space-between mb-1">
                          <span class="text-caption">Outstanding:</span>
                          <span class="text-caption font-weight-medium text-warning">QAR {{ advance.outstanding.toLocaleString() }}</span>
                        </div>
                        <div class="d-flex justify-space-between mb-1">
                          <span class="text-caption">Monthly Deduction:</span>
                          <span class="text-caption font-weight-medium text-error">QAR {{ Math.round(advance.amount / advance.repaymentMonths).toLocaleString() }}</span>
                        </div>
                        <div class="d-flex justify-space-between mb-1">
                          <span class="text-caption">Deduction Period:</span>
                          <span class="text-caption font-weight-medium">{{ advance.repaymentMonths }} months</span>
                        </div>
                        <v-divider class="my-2" />
                        <div class="d-flex justify-space-between">
                          <span class="text-body-2">Request Date:</span>
                          <span class="text-body-2">{{ formatDate(advance.requestDate) }}</span>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-window-item>


          <!-- Repayments Tab -->
          <v-window-item value="repayments">
            <v-data-table
              :headers="repaymentHeaders"
              :items="repaymentSchedule"
              :items-per-page="itemsPerPage"
              class="elevation-0"
              item-key="id"
              density="compact"
            >
              <template #item.employee="{ item }">
                <div class="d-flex align-center py-2">
                  <v-avatar size="32" class="mr-3">
                    <v-img :src="item.avatar" />
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ item.employeeName }}</div>
                    <div class="text-caption text-grey-darken-1">{{ item.employeeId }}</div>
                  </div>
                </div>
              </template>

              <template #item.amount="{ item }">
                <div class="font-weight-medium">QAR {{ item.amount.toLocaleString() }}</div>
              </template>

              <template #item.dueDate="{ item }">
                <div class="text-caption">{{ formatDate(item.dueDate) }}</div>
              </template>

              <template #item.status="{ item }">
                <v-chip
                  :color="getPaymentStatusColor(item.status)"
                  variant="tonal"
                  size="x-small"
                  density="compact"
                >
                  {{ item.status }}
                </v-chip>
              </template>

              <template #item.actions="{ item }">
                <div class="d-flex gap-2">
                  <v-btn
                    v-if="item.status === 'Due'"
                    icon="fa:fas fa-money-bill-wave"
                    size="small"
                    variant="text"
                    color="primary"
                    class="action-btn"
                    @click="markAsPaid(item)"
                    title="Mark as Paid"
                  />
                  <v-btn
                    icon="fa:fas fa-receipt"
                    size="small"
                    variant="text"
                    color="primary"
                    class="action-btn"
                    @click="generateReceipt(item)"
                    title="Generate Receipt"
                  />
                </div>
              </template>
            </v-data-table>
          </v-window-item>
        </v-window>
      </v-card>

      <!-- New Advance Dialog -->
      <v-dialog v-model="showNewAdvanceDialog" max-width="700" persistent>
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-cash-fast</v-icon>
            <span>New Salary Advance (Interest-Free)</span>
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="showNewAdvanceDialog = false" />
          </v-card-title>
          
          <v-card-text>
            <v-form ref="advanceForm">
              <v-row>
                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="newAdvance.employee"
                    :items="employees"
                    label="Select Employee"
                    item-title="name"
                    item-value="employeeId"
                    variant="outlined"
                    density="compact"
                    return-object
                    :rules="[v => !!v || 'Employee is required']"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-avatar size="32">
                            <v-img :src="item.raw.avatar" />
                          </v-avatar>
                        </template>
                        <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{ item.raw.department }} - QAR {{ item.raw.basicSalary.toLocaleString() }}/month</v-list-item-subtitle>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="newAdvance.amount"
                    label="Advance Amount (from Salary)"
                    type="number"
                    variant="outlined"
                    density="compact"
                    prefix="QAR"
                    :rules="[v => !!v || 'Amount is required', v => v > 0 || 'Amount must be positive']"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="newAdvance.repaymentMonths"
                    :items="[1, 2, 3, 4, 5, 6, 12]"
                    label="Salary Deduction Period (Months)"
                    variant="outlined"
                    density="compact"
                    :rules="[v => !!v || 'Deduction period is required']"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="newAdvance.reason"
                    :items="advanceReasons"
                    label="Reason for Advance"
                    variant="outlined"
                    density="compact"
                    :rules="[v => !!v || 'Reason is required']"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="newAdvance.description"
                    label="Additional Details"
                    variant="outlined"
                    density="compact"
                    rows="3"
                  />
                </v-col>
              </v-row>

              <v-row v-if="newAdvance.employee && newAdvance.amount">
                <v-col cols="12">
                  <v-card variant="outlined" color="info">
                    <v-card-title class="text-subtitle-1">
                      <v-icon class="mr-2">mdi-calculator</v-icon>
                      Salary Advance Calculation
                    </v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="3">
                          <div class="text-caption text-grey-darken-1">Monthly Salary</div>
                          <div class="text-h6">QAR {{ newAdvance.employee?.basicSalary?.toLocaleString() || 'N/A' }}</div>
                        </v-col>
                        <v-col cols="3">
                          <div class="text-caption text-grey-darken-1">Advance Amount</div>
                          <div class="text-h6 text-primary">QAR {{ newAdvance.amount?.toLocaleString() || 0 }}</div>
                        </v-col>
                        <v-col cols="3">
                          <div class="text-caption text-grey-darken-1">Monthly Deduction</div>
                          <div class="text-h6 text-warning">QAR {{ monthlyDeduction.toLocaleString() }}</div>
                        </v-col>
                        <v-col cols="3">
                          <div class="text-caption text-grey-darken-1">Interest Rate</div>
                          <div class="text-h6 text-success">0% (Interest-Free)</div>
                        </v-col>
                      </v-row>
                      <v-divider class="my-3" />
                      <div class="text-caption text-grey-darken-1 mb-2">
                        <strong>Note:</strong> This advance will be deducted equally over {{ newAdvance.repaymentMonths || 0 }} months from salary payments.
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              variant="outlined"
              @click="showNewAdvanceDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              @click="submitAdvanceRequest"
            >
              Submit Advance Request
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Request Details Modal -->
      <v-dialog 
        v-model="showRequestDetailsDialog" 
        max-width="1200" 
        persistent
        scrollable
      >
        <v-card>
          <v-card-title class="d-flex align-center bg-primary white--text pa-4">
            <v-icon color="white" class="mr-2">mdi-cash-fast</v-icon>
            <div>
              <span class="text-h6">Salary Advance Details</span>
              <div class="text-caption" v-if="selectedRequest">{{ selectedRequest.employeeName }} - {{ selectedRequest.employeeId }}</div>
            </div>
            <v-spacer />
            <v-chip 
              v-if="selectedRequest"
              :color="getStatusColor(selectedRequest.status)" 
              size="small" 
              class="mr-2"
            >
              {{ selectedRequest.status }}
            </v-chip>
            <v-btn 
              icon="mdi-close" 
              variant="text" 
              color="white" 
              @click="showRequestDetailsDialog = false" 
            />
          </v-card-title>

          <v-card-text class="pa-0" v-if="selectedRequest" style="max-height: 80vh; overflow-y: auto;">
            <!-- Employee Information Header -->
            <v-container fluid class="py-4 bg-blue-lighten-5">
              <v-row align="center">
                <v-col cols="auto">
                  <v-avatar size="80" class="elevation-3">
                    <v-img :src="selectedRequest.avatar" :alt="selectedRequest.employeeName" />
                  </v-avatar>
                </v-col>
                <v-col>
                  <h2 class="text-h4 mb-2 font-weight-bold">{{ selectedRequest.employeeName }}</h2>
                  <div class="d-flex align-center mb-2">
                    <v-chip color="primary" size="small" class="mr-2">{{ selectedRequest.employeeId }}</v-chip>
                    <v-chip color="secondary" size="small" class="mr-2">{{ selectedRequest.department }}</v-chip>
                    <v-chip :color="getStatusColor(selectedRequest.status)" size="small">{{ selectedRequest.status }}</v-chip>
                  </div>
                  <div class="text-body-1">
                    <v-icon small class="mr-1">mdi-calendar</v-icon>
                    Request Date: {{ formatDate(selectedRequest.requestDate) }}
                  </div>
                </v-col>
                <v-col cols="auto">
                  <v-card variant="outlined" class="text-center pa-4 elevation-2">
                    <div class="text-caption text-grey-darken-1">Advance Amount</div>
                    <div class="text-h4 text-primary font-weight-bold">
                      {{ formatCurrency(selectedRequest.amount) }}
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>

            <!-- Request Details Tabs -->
            <v-tabs v-model="requestDetailsTab" color="primary" class="mb-4">
              <v-tab value="overview" prepend-icon="mdi-view-dashboard">Overview</v-tab>
              <v-tab value="history" prepend-icon="mdi-history">History</v-tab>
            </v-tabs>

            <v-window v-model="requestDetailsTab">
              <!-- Overview Tab -->
              <v-window-item value="overview">
                <v-container fluid>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-card class="mb-4">
                        <v-card-title class="bg-grey-lighten-5">Request Information</v-card-title>
                        <v-card-text>
                          <v-row dense>
                            <v-col cols="6">
                              <div class="text-caption text-grey-darken-1">Amount Requested</div>
                              <div class="text-h6 text-primary">{{ formatCurrency(selectedRequest.amount) }}</div>
                            </v-col>
                            <v-col cols="6">
                              <div class="text-caption text-grey-darken-1">Status</div>
                              <v-chip :color="getStatusColor(selectedRequest.status)" size="small">
                                {{ selectedRequest.status }}
                              </v-chip>
                            </v-col>
                            <v-col cols="6">
                              <div class="text-caption text-grey-darken-1">Request Date</div>
                              <div class="text-h6">{{ formatDate(selectedRequest.requestDate) }}</div>
                            </v-col>
                            <v-col cols="6" v-if="selectedRequest.approvedDate">
                              <div class="text-caption text-grey-darken-1">Approved Date</div>
                              <div class="text-h6 text-success">{{ formatDate(selectedRequest.approvedDate) }}</div>
                            </v-col>
                            <v-col cols="12">
                              <div class="text-caption text-grey-darken-1">Reason for Advance</div>
                              <div class="text-body-1">{{ selectedRequest.reason || 'No reason provided' }}</div>
                            </v-col>
                            <v-col cols="12" v-if="selectedRequest.description">
                              <div class="text-caption text-grey-darken-1">Additional Details</div>
                              <div class="text-body-1">{{ selectedRequest.description }}</div>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-card class="mb-4">
                        <v-card-title class="bg-grey-lighten-5">Employee Details</v-card-title>
                        <v-card-text>
                          <v-row dense>
                            <v-col cols="6">
                              <div class="text-caption text-grey-darken-1">Employee ID</div>
                              <div class="text-h6">{{ selectedRequest.employeeId }}</div>
                            </v-col>
                            <v-col cols="6">
                              <div class="text-caption text-grey-darken-1">Department</div>
                              <div class="text-h6">{{ selectedRequest.department }}</div>
                            </v-col>
                            <v-col cols="6">
                              <div class="text-caption text-grey-darken-1">Basic Salary</div>
                              <div class="text-h6">{{ formatCurrency(selectedRequest.basicSalary) }}</div>
                            </v-col>
                            <v-col cols="6">
                              <div class="text-caption text-grey-darken-1">Eligible Amount</div>
                              <div class="text-h6 text-success">{{ formatCurrency(selectedRequest.basicSalary * 0.3) }}</div>
                            </v-col>
                            <v-col cols="6">
                              <div class="text-caption text-grey-darken-1">Outstanding Balance</div>
                              <div class="text-h6 text-warning">{{ formatCurrency(selectedRequest.outstanding || selectedRequest.amount) }}</div>
                            </v-col>
                            <v-col cols="6">
                              <div class="text-caption text-grey-darken-1">Monthly Deduction</div>
                              <div class="text-h6 text-info">{{ formatCurrency(selectedRequest.monthlyDeduction || (selectedRequest.amount / (selectedRequest.repaymentPeriod || 6))) }}</div>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>

                      <!-- Progress Card -->
                      <v-card v-if="selectedRequest.status === 'Approved'" class="mb-4">
                        <v-card-title class="bg-grey-lighten-5">Repayment Progress</v-card-title>
                        <v-card-text>
                          <v-row dense>
                            <v-col cols="12">
                              <div class="text-caption text-grey-darken-1 mb-2">
                                Repayment Progress: {{ Math.round(((selectedRequest.amount - (selectedRequest.outstanding || selectedRequest.amount)) / selectedRequest.amount) * 100) }}%
                              </div>
                              <v-progress-linear
                                :model-value="((selectedRequest.amount - (selectedRequest.outstanding || selectedRequest.amount)) / selectedRequest.amount) * 100"
                                color="primary"
                                height="20"
                                rounded
                              >
                                <template v-slot:default="{ value }">
                                  <strong>{{ Math.ceil(value) }}%</strong>
                                </template>
                              </v-progress-linear>
                            </v-col>
                            <v-col cols="6">
                              <div class="text-caption text-grey-darken-1">Amount Paid</div>
                              <div class="text-h6 text-success">{{ formatCurrency(selectedRequest.amount - (selectedRequest.outstanding || selectedRequest.amount)) }}</div>
                            </v-col>
                            <v-col cols="6">
                              <div class="text-caption text-grey-darken-1">Remaining Period</div>
                              <div class="text-h6">{{ Math.ceil((selectedRequest.outstanding || selectedRequest.amount) / (selectedRequest.monthlyDeduction || (selectedRequest.amount / (selectedRequest.repaymentPeriod || 6)))) }} months</div>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-window-item>

              <!-- History Tab -->
              <v-window-item value="history">
                <v-container fluid>
                  <v-timeline side="end">
                    <v-timeline-item
                      v-for="(event, index) in getRequestHistory(selectedRequest)"
                      :key="index"
                      :dot-color="event.color"
                      size="small"
                    >
                      <template v-slot:opposite>
                        <div class="text-caption">{{ formatDate(event.date) }}</div>
                      </template>
                      <v-card class="elevation-2">
                        <v-card-title class="text-h6">{{ event.title }}</v-card-title>
                        <v-card-text>{{ event.description }}</v-card-text>
                      </v-card>
                    </v-timeline-item>
                  </v-timeline>
                </v-container>
              </v-window-item>
            </v-window>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-btn
              v-if="selectedRequest?.status === 'Approved'"
              variant="outlined"
              color="primary"
              prepend-icon="mdi-cash-minus"
              @click="recordPayment(selectedRequest); showRequestDetailsDialog = false"
            >
              Record Payment
            </v-btn>
            <v-btn
              v-if="selectedRequest?.status === 'Approved'"
              variant="outlined"
              color="info"
              prepend-icon="mdi-file-edit"
              @click="editRequest(selectedRequest); showRequestDetailsDialog = false"
            >
              Edit Details
            </v-btn>
            <v-spacer />
            <v-btn
              variant="outlined"
              @click="showRequestDetailsDialog = false"
            >
              Close
            </v-btn>
            <v-btn
              v-if="selectedRequest?.status === 'Pending'"
              color="error"
              @click="rejectRequest(selectedRequest)"
            >
              Reject
            </v-btn>
            <v-btn
              v-if="selectedRequest?.status === 'Pending'"
              color="success"
              @click="approveRequest(selectedRequest)"
            >
              Approve
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Request Approval Modal -->
      <v-dialog v-model="showApprovalDialog" max-width="600" persistent>
        <v-card>
          <v-card-title class="d-flex align-center bg-success white--text pa-4">
            <v-icon color="white" class="mr-2">mdi-check-circle</v-icon>
            <span class="text-h6">Approve Request</span>
            <v-spacer />
            <v-btn 
              icon="mdi-close" 
              variant="text" 
              color="white" 
              @click="showApprovalDialog = false" 
            />
          </v-card-title>

          <v-card-text class="pa-4" v-if="selectedRequest">
            <v-alert type="info" variant="tonal" class="mb-4">
              <strong>Confirm Approval</strong><br>
              You are about to approve a {{ selectedRequest.type?.toLowerCase() }} request for <strong>{{ selectedRequest.employeeName }}</strong>
            </v-alert>

            <!-- Request Summary -->
            <v-card variant="outlined" class="mb-4">
              <v-card-text>
                <v-row dense>
                  <v-col cols="6">
                    <div class="text-caption text-grey-darken-1">Employee</div>
                    <div class="font-weight-bold">{{ selectedRequest.employeeName }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-grey-darken-1">Amount</div>
                    <div class="font-weight-bold text-primary">{{ formatCurrency(selectedRequest.amount) }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-grey-darken-1">Type</div>
                    <div class="font-weight-bold">{{ selectedRequest.type }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-grey-darken-1">Request Date</div>
                    <div class="font-weight-bold">{{ formatDate(selectedRequest.requestDate) }}</div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Approval Form -->
            <v-form ref="approvalForm" v-model="approvalFormValid">
              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="approvalData.repaymentPeriod"
                    :items="repaymentPeriods"
                    label="Repayment Period"
                    variant="outlined"
                    density="compact"
                    :rules="[v => !!v || 'Repayment period is required']"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="approvalData.monthlyDeduction"
                    label="Monthly Deduction Amount"
                    variant="outlined"
                    density="compact"
                    prefix="QAR"
                    type="number"
                    readonly
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="approvalData.approvalNotes"
                    label="Approval Notes (Optional)"
                    variant="outlined"
                    density="compact"
                    rows="3"
                    placeholder="Add any notes or conditions for this approval..."
                  />
                </v-col>
                <v-col cols="12">
                  <v-checkbox
                    v-model="approvalData.generateSchedule"
                    label="Auto-generate repayment schedule"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12">
                  <v-checkbox
                    v-model="approvalData.notifyEmployee"
                    label="Send approval notification to employee"
                    density="compact"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              variant="outlined"
              @click="showApprovalDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="success"
              @click="confirmApproval"
              :disabled="!approvalFormValid"
            >
              Approve Request
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Request Rejection Modal -->
      <v-dialog v-model="showRejectionDialog" max-width="600" persistent>
        <v-card>
          <v-card-title class="d-flex align-center bg-error white--text pa-4">
            <v-icon color="white" class="mr-2">mdi-close-circle</v-icon>
            <span class="text-h6">Reject Request</span>
            <v-spacer />
            <v-btn 
              icon="mdi-close" 
              variant="text" 
              color="white" 
              @click="showRejectionDialog = false" 
            />
          </v-card-title>

          <v-card-text class="pa-4" v-if="selectedRequest">
            <v-alert type="warning" variant="tonal" class="mb-4">
              <strong>Confirm Rejection</strong><br>
              You are about to reject a {{ selectedRequest.type?.toLowerCase() }} request for <strong>{{ selectedRequest.employeeName }}</strong>
            </v-alert>

            <!-- Request Summary -->
            <v-card variant="outlined" class="mb-4">
              <v-card-text>
                <v-row dense>
                  <v-col cols="6">
                    <div class="text-caption text-grey-darken-1">Employee</div>
                    <div class="font-weight-bold">{{ selectedRequest.employeeName }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-grey-darken-1">Amount</div>
                    <div class="font-weight-bold text-primary">{{ formatCurrency(selectedRequest.amount) }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-grey-darken-1">Type</div>
                    <div class="font-weight-bold">{{ selectedRequest.type }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-grey-darken-1">Request Date</div>
                    <div class="font-weight-bold">{{ formatDate(selectedRequest.requestDate) }}</div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Rejection Form -->
            <v-form ref="rejectionForm" v-model="rejectionFormValid">
              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="rejectionData.reason"
                    :items="rejectionReasons"
                    label="Rejection Reason"
                    variant="outlined"
                    density="compact"
                    :rules="[v => !!v || 'Rejection reason is required']"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="rejectionData.comments"
                    label="Additional Comments"
                    variant="outlined"
                    density="compact"
                    rows="4"
                    placeholder="Provide detailed explanation for the rejection..."
                    :rules="[v => !!v || 'Comments are required']"
                  />
                </v-col>
                <v-col cols="12">
                  <v-checkbox
                    v-model="rejectionData.notifyEmployee"
                    label="Send rejection notification to employee"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12">
                  <v-checkbox
                    v-model="rejectionData.allowResubmission"
                    label="Allow employee to resubmit request"
                    density="compact"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              variant="outlined"
              @click="showRejectionDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="error"
              @click="confirmRejection"
              :disabled="!rejectionFormValid"
            >
              Reject Request
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Payment Recording Modal -->
      <v-dialog v-model="showPaymentDialog" max-width="700" persistent>
        <v-card>
          <v-card-title class="d-flex align-center bg-primary white--text pa-4">
            <v-icon color="white" class="mr-2">mdi-cash-register</v-icon>
            <span class="text-h6">{{ isAdvanceContext ? 'Record Salary Deduction' : 'Record Payment' }}</span>
            <v-spacer />
            <v-btn 
              icon="mdi-close" 
              variant="text" 
              color="white" 
              @click="showPaymentDialog = false" 
            />
          </v-card-title>

          <v-card-text class="pa-4" v-if="selectedRequest">
            <!-- Request Summary -->
            <v-card variant="outlined" class="mb-4">
              <v-card-text>
                <v-row dense>
                  <v-col cols="6">
                    <div class="text-caption text-grey-darken-1">Employee</div>
                    <div class="font-weight-bold">{{ selectedRequest.employeeName }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-grey-darken-1">Advance Given</div>
                    <div class="font-weight-bold text-primary">{{ formatCurrency(selectedRequest.amount) }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-grey-darken-1">{{ isAdvanceContext ? 'Remaining to Deduct' : 'Outstanding Balance' }}</div>
                    <div class="font-weight-bold text-error">{{ formatCurrency(calculateOutstandingBalance(selectedRequest)) }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-caption text-grey-darken-1">Monthly {{ isAdvanceContext ? 'Deduction' : 'Payment' }}</div>
                    <div class="font-weight-bold">{{ formatCurrency(selectedRequest.monthlyDeduction || 0) }}</div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Payment Form -->
            <v-form ref="paymentForm" v-model="paymentFormValid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="paymentData.amount"
                    :label="isAdvanceContext ? 'Deduction Amount' : 'Payment Amount'"
                    variant="outlined"
                    density="compact"
                    prefix="QAR"
                    type="number"
                    :rules="getPaymentAmountRules()"
                    @input="calculateRemainingBalance"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="paymentData.date"
                    :label="isAdvanceContext ? 'Deduction Date' : 'Payment Date'"
                    variant="outlined"
                    density="compact"
                    type="date"
                    :rules="[v => !!v || (isAdvanceContext ? 'Deduction date is required' : 'Payment date is required')]"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="paymentData.method"
                    :items="isAdvanceContext ? advanceDeductionMethods : paymentMethods"
                    :label="isAdvanceContext ? 'Deduction Method' : 'Payment Method'"
                    variant="outlined"
                    density="compact"
                    :rules="[v => !!v || (isAdvanceContext ? 'Deduction method is required' : 'Payment method is required')]"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="paymentData.reference"
                    :label="isAdvanceContext ? 'Payroll Reference' : 'Transaction Reference'"
                    variant="outlined"
                    density="compact"
                    :placeholder="isAdvanceContext ? 'Payroll cycle reference' : 'Optional reference number'"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="paymentData.notes"
                    :label="isAdvanceContext ? 'Deduction Notes' : 'Payment Notes'"
                    variant="outlined"
                    density="compact"
                    rows="2"
                    :placeholder="isAdvanceContext ? 'Additional notes about this deduction...' : 'Additional notes about this payment...'"
                  />
                </v-col>
                <v-col cols="12">
                  <v-file-input
                    v-model="paymentData.receipt"
                    :label="isAdvanceContext ? 'Upload Payroll Document (Optional)' : 'Upload Receipt (Optional)'"
                    variant="outlined"
                    density="compact"
                    accept="image/*,.pdf"
                    prepend-icon="mdi-receipt"
                    show-size
                  />
                </v-col>
                <v-col cols="12">
                  <v-card variant="tonal" color="info" class="pa-3">
                    <div class="d-flex justify-space-between">
                      <span>{{ isAdvanceContext ? 'Remaining to Deduct After This:' : 'Remaining Balance After Payment:' }}</span>
                      <span class="font-weight-bold">{{ formatCurrency(paymentData.remainingBalance) }}</span>
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12">
                  <v-checkbox
                    v-model="paymentData.generateReceipt"
                    :label="isAdvanceContext ? 'Generate deduction slip' : 'Generate payment receipt'"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12">
                  <v-checkbox
                    v-model="paymentData.updateSchedule"
                    :label="isAdvanceContext ? 'Update deduction schedule' : 'Update repayment schedule'"
                    density="compact"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              variant="outlined"
              @click="showPaymentDialog = false"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              @click="confirmPayment"
              :disabled="!paymentFormValid"
            >
              {{ isAdvanceContext ? 'Record Deduction' : 'Record Payment' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Edit Request Dialog -->
      <v-dialog v-model="showEditDialog" max-width="600" persistent>
        <v-card>
          <v-card-title class="d-flex align-center bg-info white--text pa-4">
            <v-icon color="white" class="mr-2">mdi-pencil</v-icon>
            <span class="text-h6">Edit Request</span>
            <v-spacer />
            <v-btn 
              icon="mdi-close" 
              variant="text" 
              color="white" 
              @click="showEditDialog = false" 
            />
          </v-card-title>

          <v-card-text class="pa-6" v-if="selectedRequest">
            <div class="mb-4">
              <v-alert type="info" variant="tonal" class="mb-4">
                <v-icon slot="prepend">mdi-information</v-icon>
                <strong>Note:</strong> Modifying request details may require re-approval from management.
              </v-alert>
            </div>

            <v-form>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="editData.amount"
                    label="Request Amount"
                    type="number"
                    prefix="QAR"
                    variant="outlined"
                    density="comfortable"
                    :rules="[v => !!v || 'Amount is required', v => v > 0 || 'Amount must be greater than 0']"
                  />
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editData.repaymentMonths"
                    label="Repayment Period"
                    type="number"
                    suffix="months"
                    variant="outlined"
                    density="comfortable"
                    :rules="[v => !!v || 'Repayment period is required', v => v > 0 || 'Must be greater than 0']"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="editData.reason"
                    label="Reason"
                    variant="outlined"
                    density="comfortable"
                    :rules="[v => !!v || 'This field is required']"
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="editData.description"
                    label="Additional Details"
                    variant="outlined"
                    density="comfortable"
                    rows="3"
                    auto-grow
                  />
                </v-col>
              </v-row>

              <!-- Summary Card -->
              <v-card variant="outlined" class="mt-4 bg-blue-lighten-5">
                <v-card-text>
                  <h4 class="text-h6 mb-3">Updated Summary</h4>
                  <v-row>
                    <v-col cols="6">
                      <div class="text-caption text-grey-darken-1">New Amount</div>
                      <div class="text-h6 text-primary">{{ formatCurrency(editData.amount || 0) }}</div>
                    </v-col>
                    <v-col cols="6">
                      <div class="text-caption text-grey-darken-1">Monthly Deduction</div>
                      <div class="text-h6 text-warning">
                        {{ formatCurrency(editData.amount && editData.repaymentMonths ? Math.round(editData.amount / editData.repaymentMonths) : 0) }}
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-form>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              variant="outlined"
              @click="showEditDialog = false"
              class="mr-2"
            >
              Cancel
            </v-btn>
            <v-btn
              color="info"
              variant="elevated"
              @click="confirmEditRequest"
            >
              <v-icon left>mdi-content-save</v-icon>
              Save Changes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

// Add error boundary and cleanup
let isComponentMounted = ref(true)

// Add navigation debugging
const router = useRouter()

// Safe navigation function
const navigateTo = (routeName: string) => {
  try {
    console.log(`Navigating to: ${routeName}`)
    router.push({ name: routeName }).catch((error) => {
      console.error(`Navigation error to ${routeName}:`, error)
    })
  } catch (error) {
    console.error(`Error initiating navigation to ${routeName}:`, error)
  }
}

// Cleanup function to prevent memory leaks
onBeforeUnmount(() => {
  try {
    console.log('=== ADVANCE LOANS COMPONENT UNMOUNTING ===')
    isComponentMounted.value = false
    console.log('AdvanceLoans component unmounting - cleaning up')
    console.log('=== UNMOUNT COMPLETE ===')
  } catch (error) {
    console.error('Error during unmount:', error)
  }
})

// Reactive variables
const searchQuery = ref('')
const selectedDepartment = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const activeTab = ref('all')
const itemsPerPage = ref(25)

// Dialog states
const showNewAdvanceDialog = ref(false)
const showRequestDetailsDialog = ref(false)
const showApprovalDialog = ref(false)
const showRejectionDialog = ref(false)
const showPaymentDialog = ref(false)
const showEditDialog = ref(false)
const isAdvanceContext = ref(true) // Track if modal is opened for advances

// Selected data for modals
const selectedRequest = ref<any>(null)

// Helper functions
const formatCurrency = (amount: number): string => {
  return `QAR ${amount.toLocaleString()}`
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const getStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    'Pending': 'orange',
    'Approved': 'success',
    'Rejected': 'error',
    'Active': 'success',
    'Completed': 'grey'
  }
  return colors[status] || 'grey'
}
const requestDetailsTab = ref('overview')

// Approval form data
const approvalFormValid = ref(false)
const approvalData = ref({
  repaymentPeriod: 12,
  monthlyDeduction: 0,
  approvalNotes: '',
  generateSchedule: true,
  notifyEmployee: true
})

const repaymentPeriods = [
  { title: '6 Months', value: 6 },
  { title: '12 Months', value: 12 },
  { title: '18 Months', value: 18 },
  { title: '24 Months', value: 24 }
]

// Rejection form data
const rejectionFormValid = ref(false)
const rejectionData = ref({
  reason: '',
  comments: '',
  notifyEmployee: true,
  allowResubmission: true
})

const rejectionReasons = [
  'Insufficient documentation',
  'Amount exceeds salary limit',
  'Recent advance still outstanding',
  'Policy violation',
  'Budget constraints',
  'Other'
]

// Payment form data
const paymentFormValid = ref(false)
const paymentData = ref({
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  method: '',
  reference: '',
  notes: '',
  receipt: null,
  remainingBalance: 0,
  generateReceipt: true,
  updateSchedule: true
})

const paymentMethods = [
  'Bank Transfer',
  'Cash',
  'Cheque',
  'Salary Deduction',
  'Online Payment'
]

const advanceDeductionMethods = [
  'Salary Deduction',
  'Monthly Payroll',
  'Final Settlement',
  'Manual Adjustment'
]

// Edit request form data
const editData = ref({
  amount: 0,
  repaymentMonths: 0,
  reason: '',
  description: '',
  interestRate: 0,
  purpose: ''
})

const getPaymentAmountRules = () => {
  const amountLabel = isAdvanceContext.value ? 'Deduction amount' : 'Payment amount'
  const balanceLabel = isAdvanceContext.value ? 'remaining balance to deduct' : 'outstanding balance'
  
  return [
    (v: any) => !!v || `${amountLabel} is required`,
    (v: any) => v > 0 || `${amountLabel} must be greater than 0`,
    (v: any) => v <= calculateOutstandingBalance(selectedRequest.value) || `${amountLabel} cannot exceed ${balanceLabel}`
  ]
}

// Employee data
const employees = ref([
  {
    employeeId: 'EMP001',
    name: 'Ahmed Al-Rashid',
    avatar: 'https://i.pravatar.cc/150?img=1',
    department: 'Engineering',
    position: 'Senior Developer',
    basicSalary: 15000
  },
  {
    employeeId: 'EMP002',
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=2',
    department: 'Marketing',
    position: 'Marketing Manager',
    basicSalary: 12000
  },
  {
    employeeId: 'EMP003',
    name: 'Mohammed Hassan',
    avatar: 'https://i.pravatar.cc/150?img=3',
    department: 'Finance',
    position: 'Financial Analyst',
    basicSalary: 10000
  },
  {
    employeeId: 'EMP004',
    name: 'Fatima Al-Zahra',
    avatar: 'https://i.pravatar.cc/150?img=4',
    department: 'HR',
    position: 'HR Specialist',
    basicSalary: 8000
  }
])

// Requests data
const allRequests = ref([
  {
    id: 1,
    employeeId: 'EMP001',
    employeeName: 'Ahmed Al-Rashid',
    avatar: 'https://i.pravatar.cc/150?img=1',
    department: 'Engineering',
    type: 'Advance',
    amount: 5000,
    outstanding: 3000,
    status: 'Approved',
    requestDate: '2024-08-15',
    repaymentMonths: 6,
    reason: 'Medical Emergency',
    isInterestFree: true,
    approvedDate: '2024-08-16',
    purpose: 'Medical Emergency - Surgery expenses'
  },
  {
    id: 2,
    employeeId: 'EMP002',
    employeeName: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=2',
    department: 'Marketing',
    type: 'Salary Advance',
    amount: 25000,
    outstanding: 18000,
    status: 'Approved',
    requestDate: '2024-07-01',
    repaymentMonths: 24,
    monthlyPayment: 1042, // Simple division: 25000/24
    isInterestFree: true,
    approvedDate: '2024-07-02',
    purpose: 'Home renovation project'
  },
  {
    id: 3,
    employeeId: 'EMP003',
    employeeName: 'Mohammed Hassan',
    avatar: 'https://i.pravatar.cc/150?img=3',
    department: 'Finance',
    type: 'Advance',
    amount: 3000,
    outstanding: 0,
    status: 'Completed',
    requestDate: '2024-06-10',
    repaymentMonths: 3,
    reason: 'Family Emergency',
    isInterestFree: true,
    approvedDate: '2024-06-11',
    purpose: 'Family Emergency - Urgent travel expenses'
  },
  {
    id: 4,
    employeeId: 'EMP004',
    employeeName: 'Fatima Al-Zahra',
    avatar: 'https://i.pravatar.cc/150?img=4',
    department: 'HR',
    type: 'Advance',
    amount: 2000,
    outstanding: 2000,
    status: 'Pending',
    requestDate: '2024-09-01',
    repaymentMonths: 4,
    reason: 'Education Expense',
    isInterestFree: true,
    purpose: 'Education Expense - Training course fees'
  },
  {
    id: 5,
    employeeId: 'EMP002',
    employeeName: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=2',
    department: 'Marketing',
    type: 'Advance',
    amount: 4000,
    outstanding: 1000,
    status: 'Approved',
    requestDate: '2024-07-20',
    repaymentMonths: 4,
    reason: 'Housing Expense',
    isInterestFree: true
  }
])

const filteredRequests = ref([...allRequests.value])

// Form data
const newAdvance = ref<{
  employee: any
  amount: number
  repaymentMonths: number | null
  reason: string
  description: string
}>({
  employee: null,
  amount: 0,
  repaymentMonths: null,
  reason: '',
  description: ''
})

// Repayment schedule data
const repaymentSchedule = ref([
  {
    id: 1,
    employeeId: 'EMP001',
    employeeName: 'Ahmed Al-Rashid',
    avatar: 'https://i.pravatar.cc/150?img=1',
    type: 'Salary Deduction (Advance)',
    amount: 833,
    dueDate: '2024-09-28',
    status: 'Due',
    isInterestFree: true
  },
  {
    id: 2,
    employeeId: 'EMP002',
    employeeName: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=2',
    type: 'Salary Deduction (Advance)',
    amount: 1042,
    dueDate: '2024-09-30',
    status: 'Due',
    isInterestFree: true
  },
  {
    id: 3,
    employeeId: 'EMP001',
    employeeName: 'Ahmed Al-Rashid',
    avatar: 'https://i.pravatar.cc/150?img=1',
    type: 'Salary Deduction (Advance)',
    amount: 833,
    dueDate: '2024-08-28',
    status: 'Paid',
    isInterestFree: true
  },
  {
    id: 4,
    employeeId: 'EMP002',
    employeeName: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=2',
    type: 'Salary Deduction (Advance)',
    amount: 1000,
    dueDate: '2024-09-28',
    status: 'Due',
    isInterestFree: true
  }
])

// Options
const requestTypes = ref(['Salary Advance'])
const statusOptions = ref(['Pending', 'Approved', 'Rejected', 'Completed'])
const advanceReasons = ref([
  'Medical Emergency',
  'Family Emergency',
  'Education Expense',
  'Housing Expense',
  'Vehicle Repair',
  'Personal Emergency',
  'Wedding Expense',
  'Travel Expense'
])

// Table headers
const allRequestsHeaders = ref([
  { title: 'Employee', key: 'employee', sortable: false },
  { title: 'Amount', key: 'amount' },
  { title: 'Outstanding', key: 'outstanding' },
  { title: 'Status', key: 'status' },
  { title: 'Request Date', key: 'requestDate' },
  { title: 'Actions', key: 'actions', sortable: false }
])

const repaymentHeaders = ref([
  { title: 'Employee', key: 'employee', sortable: false },
  { title: 'Payment Type', key: 'type' },
  { title: 'Amount', key: 'amount' },
  { title: 'Due Date', key: 'dueDate' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false }
])

// Computed properties
const totalAdvances = computed(() => {
  return allRequests.value
    .filter(req => req.type === 'Advance')
    .reduce((total, req) => total + req.amount, 0)
})

const totalOutstanding = computed(() => {
  return filteredRequests.value.reduce((total, req) => total + req.outstanding, 0)
})

const pendingRequests = computed(() => {
  return allRequests.value.filter(req => req.status === 'Pending').length
})

const advanceRequests = computed(() => {
  return allRequests.value.filter(req => req.type === 'Advance')
})

const monthlyDeduction = computed(() => {
  if (newAdvance.value.amount && newAdvance.value.repaymentMonths) {
    return Math.round(newAdvance.value.amount / newAdvance.value.repaymentMonths)
  }
  return 0
})

// Methods
const filterRequests = () => {
  try {
    if (!isComponentMounted.value) return
    
    let filtered = [...allRequests.value]

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(req => 
        req.employeeName.toLowerCase().includes(query) ||
        req.employeeId.toLowerCase().includes(query) ||
        req.type.toLowerCase().includes(query)
      )
    }

    if (selectedDepartment.value) {
      filtered = filtered.filter(req => req.department === selectedDepartment.value)
    }

    if (selectedType.value) {
      filtered = filtered.filter(req => req.type === selectedType.value)
    }

    if (selectedStatus.value) {
      filtered = filtered.filter(req => req.status === selectedStatus.value)
    }

    filteredRequests.value = filtered
  } catch (error) {
    console.error('Error in filterRequests:', error)
    // Fallback to show all requests if filtering fails
    filteredRequests.value = [...allRequests.value]
  }
}

// Helper functions for Request Details Modal
const repaymentScheduleHeaders = [
  { title: 'Month', value: 'month', sortable: false },
  { title: 'Due Date', value: 'dueDate', sortable: false },
  { title: 'Amount', value: 'amount', sortable: false },
  { title: 'Status', value: 'status', sortable: false }
]

const generateRepaymentSchedule = (request: any) => {
  if (!request) return []
  
  const monthlyAmount = request.amount / 12 // 12 month repayment
  const schedule = []
  
  for (let i = 1; i <= 12; i++) {
    const dueDate = new Date()
    dueDate.setMonth(dueDate.getMonth() + i)
    
    schedule.push({
      month: i,
      dueDate: formatDate(dueDate.toISOString()),
      amount: monthlyAmount,
      status: i <= 3 ? 'Paid' : i <= 6 ? 'Due' : 'Pending'
    })
  }
  
  return schedule
}

const getPaymentStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    'Paid': 'success',
    'Due': 'warning',
    'Pending': 'grey',
    'Overdue': 'error'
  }
  return colors[status] || 'grey'
}

const getRequestHistory = (request: any) => {
  if (!request) return []
  
  return [
    {
      date: request.requestDate,
      title: 'Request Submitted',
      description: `${request.type} request for ${formatCurrency(request.amount)} submitted by ${request.employeeName}`,
      color: 'primary'
    },
    {
      date: request.requestDate,
      title: 'Under Review',
      description: 'Request is being reviewed by HR department',
      color: 'orange'
    },
    ...(request.status === 'Approved' ? [{
      date: request.approvedDate || request.requestDate,
      title: 'Request Approved',
      description: 'Request has been approved and processed',
      color: 'success'
    }] : []),
    ...(request.status === 'Rejected' ? [{
      date: request.rejectedDate || request.requestDate,
      title: 'Request Rejected',
      description: request.rejectionReason || 'Request was rejected',
      color: 'error'
    }] : [])
  ]
}

// Payment calculation helpers
const calculateOutstandingBalance = (request: any) => {
  if (!request) return 0
  // Mock calculation - in real app this would come from payments history
  const paidAmount = request.amount * 0.3 // Assume 30% has been paid
  return request.amount - paidAmount
}

const calculateRemainingBalance = () => {
  const outstanding = calculateOutstandingBalance(selectedRequest.value)
  paymentData.value.remainingBalance = Math.max(0, outstanding - (paymentData.value.amount || 0))
}

// Action methods
const viewRequestDetails = (request: any) => {
  try {
    if (!isComponentMounted.value) return
    
    console.log('=== viewRequestDetails CALLED ===')
    console.log('Request data:', request?.employeeName, request)
    selectedRequest.value = request
    requestDetailsTab.value = 'overview'
    showRequestDetailsDialog.value = true
    console.log('Modal state after setting:', showRequestDetailsDialog.value)
    console.log('=== END viewRequestDetails ===')
  } catch (error) {
    console.error('Error in viewRequestDetails:', error)
  }
}

const approveRequest = (request: any) => {
  selectedRequest.value = request
  approvalData.value.monthlyDeduction = request.amount / approvalData.value.repaymentPeriod
  showApprovalDialog.value = true
}

const confirmApproval = () => {
  if (selectedRequest.value) {
    selectedRequest.value.status = 'Approved'
    selectedRequest.value.approvedDate = new Date().toISOString().split('T')[0]
    selectedRequest.value.repaymentPeriod = approvalData.value.repaymentPeriod
    selectedRequest.value.monthlyDeduction = approvalData.value.monthlyDeduction
    selectedRequest.value.approvalNotes = approvalData.value.approvalNotes
    
    console.log('Approved request:', selectedRequest.value.id)
    
    // Show success message
    alert(`Request approved successfully! Monthly deduction: ${formatCurrency(approvalData.value.monthlyDeduction)}`)
    
    // Reset form and close dialog
    showApprovalDialog.value = false
    showRequestDetailsDialog.value = false
    
    // TODO: Update status in backend
    // Send notification to employee
    // Generate repayment schedule
    // Update employee's available advance limit
  }
}

const rejectRequest = (request: any) => {
  selectedRequest.value = request
  rejectionData.value = {
    reason: '',
    comments: '',
    notifyEmployee: true,
    allowResubmission: true
  }
  showRejectionDialog.value = true
}

const confirmRejection = () => {
  if (selectedRequest.value) {
    selectedRequest.value.status = 'Rejected'
    selectedRequest.value.rejectedDate = new Date().toISOString().split('T')[0]
    selectedRequest.value.rejectionReason = rejectionData.value.reason
    selectedRequest.value.rejectionComments = rejectionData.value.comments
    selectedRequest.value.allowResubmission = rejectionData.value.allowResubmission
    
    console.log('Rejected request:', selectedRequest.value.id, 'Reason:', rejectionData.value.reason)
    
    // Show success message
    alert(`Request rejected successfully. ${rejectionData.value.notifyEmployee ? 'Employee will be notified.' : ''}`)
    
    // Reset form and close dialog
    showRejectionDialog.value = false
    showRequestDetailsDialog.value = false
    
    // TODO: Update status in backend
    // Send rejection notification to employee
    // Log rejection reason
  }
}

const editRequest = (request: any) => {
  selectedRequest.value = request
  // Populate form with current values
  editData.value = {
    amount: request.amount,
    repaymentMonths: request.repaymentMonths,
    reason: request.reason || request.purpose || '',
    description: request.description || '',
    interestRate: request.interestRate || 0,
    purpose: request.purpose || request.reason || ''
  }
  showEditDialog.value = true
}

const confirmEditRequest = () => {
  if (selectedRequest.value) {
    // Update the request with new values
    selectedRequest.value.amount = editData.value.amount
    selectedRequest.value.repaymentMonths = editData.value.repaymentMonths
    selectedRequest.value.reason = editData.value.reason
    selectedRequest.value.description = editData.value.description
    
    selectedRequest.value.purpose = editData.value.reason
    
    // Mark as requiring re-approval if amount changed significantly
    const originalAmount = selectedRequest.value.amount
    if (Math.abs(editData.value.amount - originalAmount) > originalAmount * 0.1) {
      selectedRequest.value.status = 'Pending'
      alert('Request has been updated and sent for re-approval due to significant amount change.')
    } else {
      alert('Request has been updated successfully!')
    }
    
    console.log('Updated request:', selectedRequest.value.id)
    showEditDialog.value = false
  }
}

const recordPayment = (request: any) => {
  selectedRequest.value = request
  isAdvanceContext.value = request.type === 'Advance' // Set context flag
  const outstanding = calculateOutstandingBalance(request)
  paymentData.value = {
    amount: Math.min(outstanding, request.monthlyDeduction || outstanding),
    date: new Date().toISOString().split('T')[0],
    method: '',
    reference: '',
    notes: '',
    receipt: null,
    remainingBalance: outstanding,
    generateReceipt: true,
    updateSchedule: true
  }
  calculateRemainingBalance()
  showPaymentDialog.value = true
}

const confirmPayment = () => {
  if (selectedRequest.value) {
    // Create payment record
    const payment = {
      id: Date.now(),
      requestId: selectedRequest.value.id,
      amount: paymentData.value.amount,
      date: paymentData.value.date,
      method: paymentData.value.method,
      reference: paymentData.value.reference,
      notes: paymentData.value.notes,
      status: 'Paid'
    }
    
    console.log('Recording payment:', payment)
    
    // Show success message
    const messageType = isAdvanceContext.value ? 'Salary deduction' : 'Payment'
    alert(`${messageType} of ${formatCurrency(paymentData.value.amount)} recorded successfully!`)
    
    // Reset form and close dialog
    showPaymentDialog.value = false
    showRequestDetailsDialog.value = false
    
    // TODO: Update payment records in backend
    // Update outstanding balance
    // Generate payment receipt if requested
    // Update repayment schedule if requested
  }
}

const markAsPaid = (payment: any) => {
  if (confirm(`Mark this payment of ${formatCurrency(payment.amount)} as paid?\n\nThis action will update the payment status and repayment schedule.`)) {
    payment.status = 'Paid'
    payment.paidDate = new Date().toISOString().split('T')[0]
    console.log('Marked as paid:', payment.id)
    alert('Payment marked as paid successfully!')
    
    // TODO: Update payment status in backend
    // Update repayment schedule
    // Generate payment confirmation
    // Update employee's outstanding balance
  }
}

const generateReceipt = (payment: any) => {
  console.log('Generating receipt for:', payment.id)
  
  // Mock receipt generation
  const receiptContent = `NIPON PAYROLL PRO - Payment Receipt
===================
Receipt #: ${payment.id}
Date: ${new Date().toLocaleDateString()}
Employee: ${payment.employeeName || 'N/A'}
Amount: ${formatCurrency(payment.amount)}
Method: ${payment.method || 'N/A'}
Reference: ${payment.reference || 'N/A'}
===================`
  
  alert('Receipt generated successfully!\n\n' + receiptContent)
  
  // TODO: Generate actual PDF receipt
}

const submitAdvanceRequest = () => {
  console.log('Submitting advance request:', newAdvance.value)
  // TODO: Submit advance request to backend
  showNewAdvanceDialog.value = false
  // Reset form
  newAdvance.value = {
    employee: null,
    amount: 0,
    repaymentMonths: null,
    reason: '',
    description: ''
  }
}

const exportAdvanceReport = () => {
  try {
    // Create comprehensive advance report
    const headers = ['Employee', 'Amount', 'Status', 'Request Date', 'Approved Date', 'Reason']
    const allRequests = [
      ...advanceRequests.value.map(req => [
        req.employeeName,
        req.amount,
        req.status,
        req.requestDate,
        req.approvedDate || 'N/A',
        req.reason
      ])
    ]
    
    const csvContent = [
      headers.join(','),
      ...allRequests.map(req => req.map(field => `"${field}"`).join(','))
    ].join('\n')

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `advance_report_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    alert('Advance report exported successfully!')
  } catch (error) {
    console.error('Export failed:', error)
    alert('Failed to export report. Please try again.')
  }
}

// Watchers
watch([() => approvalData.value.repaymentPeriod, () => selectedRequest.value], () => {
  try {
    if (!isComponentMounted.value) return
    
    if (selectedRequest.value && approvalData.value.repaymentPeriod) {
      approvalData.value.monthlyDeduction = Math.round(selectedRequest.value.amount / approvalData.value.repaymentPeriod)
    }
  } catch (error) {
    console.error('Error in watcher:', error)
  }
}, { immediate: false })

onMounted(() => {
  try {
    console.log('AdvanceLoans component mounted')
    // Initialize component
    filterRequests()
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
})
</script>

<style scoped>
.advance-loans {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.summary-card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease-in-out;
}

.advance-card {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  overflow: hidden;
}

.advance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.advance-details {
  border-top: 1px solid #e0e0e0;
  padding-top: 8px;
  margin-top: 8px;
}

.action-btn-primary {
  border-radius: 50% !important;
  transition: all 0.2s ease-in-out !important;
  min-width: 36px !important;
  width: 36px !important;
  height: 36px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

.action-btn-primary:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25) !important;
}

/* Individual button color enhancements */
.action-btn.v-btn--variant-elevated {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

.action-btn.v-btn--variant-elevated:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25) !important;
}

/* Mobile responsive design */
@media (max-width: 768px) {
  .card-actions-overlay {
    position: static;
    opacity: 1;
    transform: none;
    background: rgba(248, 249, 250, 0.95);
    margin-top: 12px;
    flex-direction: row;
    justify-content: center;
    padding: 12px;
  }
  
  .advance-card:hover .card-actions-overlay,
  .action-btn {
    min-width: 40px !important;
    width: 40px !important;
    height: 40px !important;
  }
}

/* Touch device optimizations */
@media (hover: none) {
  .card-actions-overlay {
    opacity: 1;
    transform: translateY(0);
    position: static;
    background: rgba(248, 249, 250, 0.95);
    margin-top: 12px;
    flex-direction: row;
    justify-content: center;
  }
}
</style>
