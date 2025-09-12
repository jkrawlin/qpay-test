<template>
  <v-container fluid class="pa-4">
    <!-- Header Section -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Temporary Employees</h1>
            <p class="text-body-1 text-medium-emphasis">
              Manage temporary employees and contract workers with visa tracking and documentation
            </p>
          </div>
          <v-btn
            color="primary"
            size="large"
            :prepend-icon="'mdi-plus'"
            @click="addTemporaryEmployee"
            elevation="2"
          >
            Add Temporary Employee
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" variant="elevated" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="48" class="mr-4">
              <v-icon color="white">mdi-account-clock</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ temporaryEmployees.length }}</div>
              <div class="text-body-2 text-medium-emphasis">Total Temporary</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" variant="elevated" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="48" class="mr-4">
              <v-icon color="white">mdi-calendar-check</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ activeContracts }}</div>
              <div class="text-body-2 text-medium-emphasis">Active Contracts</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" variant="elevated" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="orange" size="48" class="mr-4">
              <v-icon color="white">mdi-clock-end</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ expiringContracts }}</div>
              <div class="text-body-2 text-medium-emphasis">Expiring Soon</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" variant="elevated" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="green" size="48" class="mr-4">
              <v-icon color="white">mdi-cash</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ formatCurrency(totalMonthlyCost) }}</div>
              <div class="text-body-2 text-medium-emphasis">Monthly Cost</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters and Search -->
    <v-card class="mb-6" variant="outlined">
      <v-card-text class="pb-2">
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="searchQuery"
              label="Search employees..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="contractTypeFilter"
              :items="contractTypes"
              label="Contract Type"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="visaStatusFilter"
              :items="visaStatuses"
              label="Visa Status"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="contractStatusFilter"
              :items="contractStatuses"
              label="Contract Status"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <div class="d-flex ga-2">
              <v-btn
                color="primary"
                variant="outlined"
                @click="exportEmployees"
                :prepend-icon="'mdi-download'"
              >
                Export
              </v-btn>
              <v-btn
                color="info"
                variant="outlined"
                @click="generateReport"
                :prepend-icon="'mdi-file-chart'"
              >
                Report
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Employee Table -->
    <v-card variant="outlined">
      <v-data-table
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="filteredEmployees"
        :loading="loading"
        :search="searchQuery"
        class="elevation-0"
        density="comfortable"
        item-value="id"
        hide-default-footer
      >
        <!-- Employee Avatar and Basic Info -->
        <template v-slot:item.employee="{ item }">
          <div class="d-flex align-center cursor-pointer" @click="viewEmployee(item)">
            <v-avatar
              :image="`https://i.pravatar.cc/48?u=${item.email}`"
              size="28"
              class="mr-2"
            />
            <div>
              <div class="text-body-2 font-weight-medium">{{ item.firstName }} {{ item.lastName }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <!-- Employee ID -->
        <template v-slot:item.employeeId="{ item }">
          <v-chip color="primary" variant="outlined" size="x-small" density="compact">
            {{ item.employeeId }}
          </v-chip>
        </template>

        <!-- Contract Type -->
        <template v-slot:item.contractType="{ item }">
          <v-chip color="primary" variant="tonal" size="x-small" density="compact">
            {{ item.contractType }}
          </v-chip>
        </template>

        <!-- Position -->
        <template v-slot:item.position="{ item }">
          <span class="text-caption">{{ item.position }}</span>
        </template>

        <!-- Contract Duration -->
        <template v-slot:item.contractDuration="{ item }">
          <div class="text-caption">
            <div>{{ formatDate(item.contractStart) }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ calculateDaysRemaining(item.contractEnd) }} days left
            </div>
          </div>
        </template>

        <!-- Visa Status -->
        <template v-slot:item.visaStatus="{ item }">
          <v-chip
            :color="getVisaStatusColor(item.visaStatus)"
            variant="tonal"
            size="x-small"
            density="compact"
          >
            {{ item.visaStatus }}
          </v-chip>
        </template>

        <!-- Hourly Rate -->
        <template v-slot:item.hourlyRate="{ item }">
          <span class="text-caption font-weight-medium">{{ formatCurrency(item.hourlyRate) }}/hr</span>
        </template>

        <!-- Contract Status -->
        <template v-slot:item.contractStatus="{ item }">
          <v-chip
            :color="getContractStatusColor(item.contractStatus)"
            variant="tonal"
            size="x-small"
            density="compact"
          >
            {{ item.contractStatus }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center gap-1">
            <v-btn
              variant="text"
              size="small"
              density="compact"
              color="primary"
              class="action-btn"
              @click="viewEmployee(item)"
              title="View Employee"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              density="compact"
              color="primary"
              class="action-btn"
              @click="editEmployee(item)"
              title="Edit Employee"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              density="compact"
              color="primary"
              class="action-btn"
              @click="viewDocuments(item)"
              title="View Documents"
            >
              <v-icon>mdi-file-document</v-icon>
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              density="compact"
              color="primary"
              class="action-btn"
              @click="viewContract(item)"
              title="View Contract"
            >
              <v-icon>mdi-file-contract</v-icon>
            </v-btn>
          </div>
        </template>

        <!-- No data -->
        <template v-slot:no-data>
          <div class="text-center pa-6">
            <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-account-clock-outline</v-icon>
            <div class="text-h6 mb-2">No temporary employees found</div>
            <div class="text-body-2 text-medium-emphasis mb-3">
              Add your first temporary employee to get started
            </div>
            <v-btn color="primary" size="small" @click="addTemporaryEmployee">
              Add Temporary Employee
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <!-- Table Footer -->
      <v-divider />
      <div class="d-flex align-center justify-space-between pa-3">
        <div class="text-body-2 text-medium-emphasis">
          Showing {{ filteredEmployees.length }} of {{ temporaryEmployees.length }} employees
        </div>
        <div class="d-flex align-center">
          <v-select
            v-model="itemsPerPage"
            :items="[10, 25, 50, 100]"
            label="Rows per page"
            variant="outlined"
            density="compact"
            hide-details
            class="mr-4"
            style="width: 120px;"
          />
          <v-pagination
            v-model="currentPage"
            :length="Math.ceil(filteredEmployees.length / itemsPerPage)"
            :total-visible="5"
            size="small"
            density="compact"
          />
        </div>
      </div>
    </v-card>

    <!-- Employee Detail Dialog -->
    <v-dialog v-model="showDetailDialog" max-width="900px" scrollable>
      <v-card v-if="selectedEmployee" class="employee-detail-dialog" density="compact">
        <!-- Header -->
        <v-card-title class="px-4 py-3 bg-primary">
          <div class="d-flex align-center justify-space-between w-100">
            <div class="d-flex align-center text-white">
              <v-avatar
                :image="`https://i.pravatar.cc/48?u=${selectedEmployee.email}`"
                size="48"
                class="mr-3"
              />
              <div>
                <div class="text-h6 font-weight-bold">{{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</div>
                <div class="text-caption opacity-90">{{ selectedEmployee.position }}</div>
                <div class="d-flex align-center mt-1">
                  <v-chip
                    :color="getContractStatusColor(selectedEmployee.contractStatus)"
                    variant="elevated"
                    size="x-small"
                    density="compact"
                    class="mr-1"
                  >
                    {{ selectedEmployee.contractStatus }}
                  </v-chip>
                  <v-chip
                    color="white"
                    variant="outlined"
                    size="x-small"
                    density="compact"
                    text-color="white"
                  >
                    {{ selectedEmployee.employeeId }}
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
              @click="showDetailDialog = false" 
            />
          </div>
        </v-card-title>

        <!-- Content Tabs -->
        <v-card-text class="pa-0">
          <v-tabs v-model="activeTab" color="primary" align-tabs="start" density="compact">
            <v-tab value="overview" class="text-caption">
              <v-icon size="small" class="mr-1">mdi-account-details</v-icon>
              Overview
            </v-tab>
            <v-tab value="contract" class="text-caption">
              <v-icon size="small" class="mr-1">mdi-contract</v-icon>
              Contract
            </v-tab>
            <v-tab value="documents" class="text-caption">
              <v-icon size="small" class="mr-1">mdi-file-document-multiple</v-icon>
              Documents
            </v-tab>
            <v-tab value="visa" class="text-caption">
              <v-icon size="small" class="mr-1">mdi-passport</v-icon>
              Visa
            </v-tab>
          </v-tabs>

          <v-divider />

          <v-window v-model="activeTab" class="pa-4">
            <!-- Overview Tab -->
            <v-window-item value="overview">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="h-100" density="compact">
                    <v-card-title class="text-subtitle-1 pb-1">
                      <v-icon size="small" class="mr-1" color="primary">mdi-account</v-icon>
                      Personal Information
                    </v-card-title>
                    <v-card-text class="pa-3">
                      <v-row dense>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Full Name</div>
                          <div class="text-caption font-weight-medium">{{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Email</div>
                          <div class="text-caption">{{ selectedEmployee.email }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Phone</div>
                          <div class="text-caption">{{ selectedEmployee.phoneNumber || 'Not provided' }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Date of Birth</div>
                          <div class="text-caption">{{ formatDate(selectedEmployee.dateOfBirth) || 'Not provided' }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Nationality</div>
                          <div class="text-caption">{{ selectedEmployee.nationality || 'Not provided' }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Qatar ID</div>
                          <div class="text-caption">{{ selectedEmployee.qatarId || 'Not provided' }}</div>
                        </v-col>
                        <v-col cols="12">
                          <div class="text-caption text-medium-emphasis">Passport Number</div>
                          <div class="text-caption">{{ selectedEmployee.passportNumber || 'Not provided' }}</div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="h-100" density="compact">
                    <v-card-title class="text-subtitle-1 pb-1">
                      <v-icon size="small" class="mr-1" color="primary">mdi-briefcase</v-icon>
                      Employment Summary
                    </v-card-title>
                    <v-card-text class="pa-3">
                      <v-row dense>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Employee ID</div>
                          <div class="text-caption font-weight-medium">{{ selectedEmployee.employeeId }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Contract Type</div>
                          <v-chip color="primary" variant="tonal" size="x-small" density="compact">{{ selectedEmployee.contractType }}</v-chip>
                        </v-col>
                        <v-col cols="12">
                          <div class="text-caption text-medium-emphasis">Position</div>
                          <div class="text-caption">{{ selectedEmployee.position }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Agency</div>
                          <div class="text-caption">{{ selectedEmployee.agency || 'Direct' }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Hourly Rate</div>
                          <div class="text-subtitle-2 font-weight-bold text-green">{{ formatCurrency(selectedEmployee.hourlyRate) }}/hr</div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Contract Tab -->
            <v-window-item value="contract">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title class="text-h6 pb-2">
                      <v-icon class="mr-2" color="primary">mdi-contract</v-icon>
                      Contract Details
                    </v-card-title>
                    <v-card-text>
                      <v-row dense>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Contract Status</div>
                          <v-chip
                            :color="getContractStatusColor(selectedEmployee.contractStatus)"
                            variant="tonal"
                            size="small"
                          >
                            {{ selectedEmployee.contractStatus }}
                          </v-chip>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Contract Type</div>
                          <div class="text-body-1">{{ selectedEmployee.contractType }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Start Date</div>
                          <div class="text-body-1">{{ formatDate(selectedEmployee.contractStart) }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">End Date</div>
                          <div class="text-body-1">{{ formatDate(selectedEmployee.contractEnd) }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Days Remaining</div>
                          <div class="text-body-1 font-weight-medium">{{ calculateDaysRemaining(selectedEmployee.contractEnd) }} days</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Monthly Hours</div>
                          <div class="text-body-1">{{ selectedEmployee.monthlyHours || 'Not specified' }}</div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title class="text-h6 pb-2">
                      <v-icon class="mr-2" color="green">mdi-cash</v-icon>
                      Compensation
                    </v-card-title>
                    <v-card-text>
                      <v-row dense>
                        <v-col cols="12">
                          <div class="text-caption text-medium-emphasis">Hourly Rate</div>
                          <div class="text-h5 font-weight-bold text-green">{{ formatCurrency(selectedEmployee.hourlyRate) }}/hour</div>
                        </v-col>
                        <v-col cols="12" v-if="selectedEmployee.monthlyHours">
                          <div class="text-caption text-medium-emphasis">Estimated Monthly Earnings</div>
                          <div class="text-h6 font-weight-medium">{{ formatCurrency(selectedEmployee.hourlyRate * selectedEmployee.monthlyHours) }}</div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Documents Tab -->
            <v-window-item value="documents">
              <v-row>
                <v-col cols="12" md="8">
                  <v-card variant="outlined">
                    <v-card-title class="text-h6 pb-2">
                      <v-icon class="mr-2" color="primary">mdi-file-document</v-icon>
                      Employee Documents
                    </v-card-title>
                    <v-card-text>
                      <v-list density="compact">
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon color="blue">mdi-card-account-details</v-icon>
                          </template>
                          <v-list-item-title>Qatar ID Document</v-list-item-title>
                          <template v-slot:append>
                            <v-btn
                              v-if="selectedEmployee.qatarIdDocument"
                              variant="outlined"
                              size="small"
                              color="primary"
                              @click="viewDocument(selectedEmployee.qatarIdDocument)"
                            >
                              View
                            </v-btn>
                            <v-chip v-else color="grey" variant="outlined" size="small">
                              Not uploaded
                            </v-chip>
                          </template>
                        </v-list-item>
                        
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon color="green">mdi-passport</v-icon>
                          </template>
                          <v-list-item-title>Passport Document</v-list-item-title>
                          <template v-slot:append>
                            <v-btn
                              v-if="selectedEmployee.passportDocument"
                              variant="outlined"
                              size="small"
                              color="primary"
                              @click="viewDocument(selectedEmployee.passportDocument)"
                            >
                              View
                            </v-btn>
                            <v-chip v-else color="grey" variant="outlined" size="small">
                              Not uploaded
                            </v-chip>
                          </template>
                        </v-list-item>

                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon color="primary">mdi-contract</v-icon>
                          </template>
                          <v-list-item-title>Contract Document</v-list-item-title>
                          <template v-slot:append>
                            <v-btn
                              v-if="selectedEmployee.contractDocument"
                              variant="outlined"
                              size="small"
                              color="primary"
                              @click="viewDocument(selectedEmployee.contractDocument)"
                            >
                              View
                            </v-btn>
                            <v-chip v-else color="grey" variant="outlined" size="small">
                              Not uploaded
                            </v-chip>
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Visa Tab -->
            <v-window-item value="visa">
              <v-row>
                <v-col cols="12" md="8">
                  <v-card variant="outlined">
                    <v-card-title class="text-h6 pb-2">
                      <v-icon class="mr-2" color="primary">mdi-passport</v-icon>
                      Visa Information
                    </v-card-title>
                    <v-card-text>
                      <v-row dense>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Visa Type</div>
                          <div class="text-body-1">{{ selectedEmployee.visaType || 'Business Visa' }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Visa Status</div>
                          <v-chip
                            :color="getVisaStatusColor(selectedEmployee.visaStatus)"
                            variant="tonal"
                            size="small"
                          >
                            {{ selectedEmployee.visaStatus }}
                          </v-chip>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Entry Date</div>
                          <div class="text-body-1">{{ formatDate(selectedEmployee.entryDate) || 'Not provided' }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis">Visa Expiry</div>
                          <div class="text-body-1">{{ formatDate(selectedEmployee.visaExpiry) }}</div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </v-card-text>

        <!-- Footer Actions -->
        <v-divider />
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn 
            variant="outlined" 
            @click="showDetailDialog = false"
            class="mr-2"
          >
            Close
          </v-btn>
          <v-btn 
            color="primary" 
            @click="editEmployee(selectedEmployee)"
            class="mr-2"
          >
            Edit Employee
          </v-btn>
          <v-btn 
            color="primary" 
            variant="outlined"
            @click="viewContract(selectedEmployee)"
            class="mr-2"
          >
            View Contract
          </v-btn>
          <v-btn 
            color="primary" 
            variant="outlined"
            @click="viewDocuments(selectedEmployee)"
          >
            Manage Documents
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

// Reactive state
const loading = ref(false)
const searchQuery = ref('')
const contractTypeFilter = ref('')
const visaStatusFilter = ref('')
const contractStatusFilter = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const showDetailDialog = ref(false)
const showEditDialog = ref(false)
const showDocumentsDialog = ref(false)
const showContractDialog = ref(false)
const selectedEmployee = ref<any>(null)
const activeTab = ref('overview')

// Sample data for temporary employees
const temporaryEmployees = ref([
  {
    id: 1,
    employeeId: 'TMP001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@contractor.qa',
    phoneNumber: '+974 5555 2468',
    contractType: 'Fixed Term',
    position: 'Electrical Technician',
    contractStart: '2024-01-01',
    contractEnd: '2024-06-30',
    hourlyRate: 85,
    monthlyHours: 160,
    contractStatus: 'Active',
    visaStatus: 'Valid',
    visaType: 'Business Visa',
    visaExpiry: '2024-07-01',
    entryDate: '2023-12-28',
    dateOfBirth: '1980-05-15',
    nationality: 'Filipino',
    qatarId: '45678901234',
    passportNumber: 'PH2468135',
    agency: 'Qatar Technical Services',
    qatarIdDocument: 'qatar-id-tmp001.pdf',
    passportDocument: 'passport-tmp001.pdf',
    contractDocument: 'contract-tmp001.pdf'
  },
  {
    id: 2,
    employeeId: 'TMP002',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    email: 'maria.rodriguez@freelance.qa',
    phoneNumber: '+974 5555 1357',
    contractType: 'Project Based',
    position: 'Architect',
    contractStart: '2023-11-01',
    contractEnd: '2024-04-30',
    hourlyRate: 120,
    monthlyHours: 120,
    contractStatus: 'Active',
    visaStatus: 'Expiring Soon',
    visaType: 'Business Visa',
    visaExpiry: '2024-02-15',
    entryDate: '2023-10-25',
    dateOfBirth: '1987-09-22',
    nationality: 'Spanish',
    qatarId: '56789012345',
    passportNumber: 'ES9753186',
    agency: null,
    qatarIdDocument: 'qatar-id-tmp002.pdf',
    passportDocument: 'passport-tmp002.pdf',
    contractDocument: null
  },
  {
    id: 3,
    employeeId: 'TMP003',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@consultant.qa',
    phoneNumber: '+974 5555 8642',
    contractType: 'Consultant',
    position: 'Project Consultant',
    contractStart: '2024-02-01',
    contractEnd: '2024-12-31',
    hourlyRate: 200,
    monthlyHours: 80,
    contractStatus: 'Pending Start',
    visaStatus: 'Processing',
    visaType: 'Business Visa',
    visaExpiry: '2025-01-31',
    entryDate: null,
    dateOfBirth: '1975-12-08',
    nationality: 'Canadian',
    qatarId: null,
    passportNumber: 'CA1472583',
    agency: 'International Consultants Ltd',
    qatarIdDocument: null,
    passportDocument: 'passport-tmp003.pdf',
    contractDocument: 'contract-tmp003.pdf'
  }
])

// Table headers
const headers = [
  { title: 'Employee', key: 'employee', sortable: false, width: '200px' },
  { title: 'ID', key: 'employeeId', width: '80px' },
  { title: 'Contract Type', key: 'contractType', width: '120px' },
  { title: 'Position', key: 'position', width: '130px' },
  { title: 'Duration', key: 'contractDuration', width: '120px' },
  { title: 'Visa Status', key: 'visaStatus', width: '110px' },
  { title: 'Rate', key: 'hourlyRate', width: '90px' },
  { title: 'Status', key: 'contractStatus', width: '90px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '140px' }
]

// Filter options
const contractTypes = ['Fixed Term', 'Project Based', 'Consultant', 'Freelance', 'Agency']
const visaStatuses = ['Valid', 'Expiring Soon', 'Renewal Required', 'Processing']
const contractStatuses = ['Active', 'Pending Start', 'Completed', 'Terminated']

// Computed properties
const filteredEmployees = computed(() => {
  let filtered = temporaryEmployees.value

  if (contractTypeFilter.value) {
    filtered = filtered.filter(emp => emp.contractType === contractTypeFilter.value)
  }

  if (visaStatusFilter.value) {
    filtered = filtered.filter(emp => emp.visaStatus === visaStatusFilter.value)
  }

  if (contractStatusFilter.value) {
    filtered = filtered.filter(emp => emp.contractStatus === contractStatusFilter.value)
  }

  return filtered
})

const activeContracts = computed(() => 
  temporaryEmployees.value.filter(emp => emp.contractStatus === 'Active').length
)

const expiringContracts = computed(() => 
  temporaryEmployees.value.filter(emp => isContractExpiringSoon(emp.contractEnd)).length
)

const totalMonthlyCost = computed(() => 
  temporaryEmployees.value
    .filter(emp => emp.contractStatus === 'Active')
    .reduce((total, emp) => total + (emp.hourlyRate * (emp.monthlyHours || 0)), 0)
)

// Methods
const addTemporaryEmployee = () => {
  router.push('/employees/create?type=temporary')
}

const viewEmployee = (employee: any) => {
  console.log('viewEmployee called:', employee?.name)
  selectedEmployee.value = employee
  showDetailDialog.value = true
  console.log('showDetailDialog set to:', showDetailDialog.value)
}

const editEmployee = (employee: any) => {
  console.log('editEmployee called:', employee?.name)
  selectedEmployee.value = employee
  showEditDialog.value = true
  console.log('showEditDialog set to:', showEditDialog.value)
}

const viewDocuments = (employee: any) => {
  console.log('viewDocuments called:', employee?.name)
  selectedEmployee.value = employee
  showDocumentsDialog.value = true
  console.log('showDocumentsDialog set to:', showDocumentsDialog.value)
}

const viewContract = (employee: any) => {
  selectedEmployee.value = employee
  showContractDialog.value = true
}

const viewDocument = (documentPath: string) => {
  if (documentPath) {
    alert(`Opening document: ${documentPath}\n\nIn a real application, this would open the document in a new tab or modal viewer.`)
  } else {
    alert('No document available to view.')
  }
}

const exportEmployees = () => {
  try {
    // Create CSV content for temporary employees
    const headers = ['Employee ID', 'Full Name', 'Position', 'Department', 'Contract Start', 'Contract End', 'Daily Rate', 'Contract Status', 'Visa Status']
    const csvContent = [
      headers.join(','),
      ...temporaryEmployees.value.map(emp => [
        emp.employeeId,
        `"${emp.firstName} ${emp.lastName}"`,
        emp.position,
        emp.department,
        emp.contractStartDate,
        emp.contractEndDate,
        emp.dailyRate,
        emp.contractStatus,
        emp.visaStatus
      ].join(','))
    ].join('\n')

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `temporary_employees_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    alert('Temporary employees data exported successfully!')
  } catch (error) {
    console.error('Export failed:', error)
    alert('Failed to export data. Please try again.')
  }
}

const generateReport = () => {
  try {
    // Generate comprehensive temporary employee report
    const reportContent = `
TEMPORARY EMPLOYEES REPORT
Generated on: ${new Date().toLocaleDateString()}

SUMMARY:
Total Temporary Employees: ${temporaryEmployees.value.length}
Active Contracts: ${temporaryEmployees.value.filter(emp => emp.contractStatus === 'Active').length}
Pending Start: ${temporaryEmployees.value.filter(emp => emp.contractStatus === 'Pending Start').length}
Expiring Soon: ${temporaryEmployees.value.filter(emp => {
  const endDate = new Date(emp.contractEndDate)
  const today = new Date()
  const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
  return diffDays <= 30 && diffDays > 0
}).length}

DETAILED LIST:
${temporaryEmployees.value.map(emp => 
  `${emp.firstName} ${emp.lastName} - ${emp.position} (${emp.contractStatus})`
).join('\n')}

VISA STATUS OVERVIEW:
Valid: ${temporaryEmployees.value.filter(emp => emp.visaStatus === 'Valid').length}
Expiring Soon: ${temporaryEmployees.value.filter(emp => emp.visaStatus === 'Expiring Soon').length}
Renewal Required: ${temporaryEmployees.value.filter(emp => emp.visaStatus === 'Renewal Required').length}
    `
    
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `temporary_employees_report_${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    
    alert('Temporary employee report generated successfully!')
  } catch (error) {
    console.error('Report generation failed:', error)
    alert('Failed to generate report. Please try again.')
  }
}

const getContractStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return 'success'
    case 'Pending Start': return 'info'
    case 'Completed': return 'grey'
    case 'Terminated': return 'error'
    default: return 'grey'
  }
}

const getVisaStatusColor = (status: string) => {
  switch (status) {
    case 'Valid': return 'success'
    case 'Expiring Soon': return 'warning'
    case 'Renewal Required': return 'error'
    case 'Processing': return 'info'
    default: return 'grey'
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB')
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: 'QAR'
  }).format(amount)
}

const calculateDaysRemaining = (endDate: string) => {
  if (!endDate) return 0
  const end = new Date(endDate)
  const now = new Date()
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

const isContractExpiringSoon = (endDate: string) => {
  if (!endDate) return false
  const days = calculateDaysRemaining(endDate)
  return days <= 30 && days > 0
}

// Lifecycle
onMounted(() => {
  // Load temporary employees data
})
</script>

<style scoped>
.v-data-table :deep(.v-data-table__td) {
  padding: 6px 8px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.v-data-table :deep(.v-data-table__th) {
  padding: 8px 8px !important;
  font-weight: 600;
  font-size: 0.75rem;
  background-color: #f8f9fa;
  border-bottom: 2px solid rgba(0, 0, 0, 0.12);
}

.v-data-table :deep(.v-data-table-header__content) {
  font-weight: 600;
  color: #424242;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: rgba(156, 39, 176, 0.04);
}

.employee-detail-dialog .v-card-title {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.employee-detail-dialog .v-window-item {
  min-height: 400px;
}

.employee-detail-dialog .v-tabs {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.employee-detail-dialog .v-tab {
  font-weight: 500;
  text-transform: none;
}

.action-btn {
  transition: all 0.2s ease-in-out !important;
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
  margin: 0 2px !important;
}

.action-btn:hover {
  background-color: rgba(25, 118, 210, 0.08) !important;
  transform: scale(1.05) !important;
}

.action-btn .v-icon {
  font-size: 18px !important;
}

.employee-detail-dialog .v-card {
  border-radius: 8px;
}

.employee-detail-dialog .v-card-title {
  border-radius: 8px 8px 0 0;
}
</style>