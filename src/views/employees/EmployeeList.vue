<template>
  <div class="employee-list enhanced-page">
    <!-- Header Section -->
    <div class="page-header enhanced-header bg-gradient-primary-light">
      <v-container fluid class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="fade-in">
            <h1 class="text-h4 font-weight-bold text-white mb-2">Employee Management</h1>
            <p class="text-body-1 text-white opacity-90 ma-0">
              Manage your workforce with Qatar-specific compliance tracking
            </p>
          </div>
          <v-btn
            color="white"
            variant="elevated"
            size="large"
            :to="{ name: 'EmployeeCreate' }"
            class="enhanced-btn fade-in-delay-1"
            elevation="4"
          >
            <template #prepend>
              <v-icon>mdi-account-plus</v-icon>
            </template>
            Add Employee
          </v-btn>
        </div>
      </v-container>
    </div>

    <v-container fluid class="pa-6">
      <!-- Filters and Search -->
      <v-card class="enhanced-card mb-8 filter-card" elevation="4">
        <v-card-title class="bg-surface pa-spacing-lg">
          <div class="d-flex align-center">
            <v-icon class="mr-3" color="primary">mdi-filter-variant</v-icon>
            <span class="text-h6 font-weight-bold">Filters & Search</span>
          </div>
        </v-card-title>
        <v-card-text class="pa-spacing-lg">
          <v-row dense>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="searchQuery"
                label="Search employees..."
                variant="outlined"
                density="comfortable"
                clearable
                hide-details
                class="enhanced-input"
                @input="debouncedSearch"
              >
                <template #prepend-inner>
                  <v-icon size="18">mdi-magnify</v-icon>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field
                v-model="selectedDepartment"
                label="Department"
                variant="outlined"
                density="comfortable"
                clearable
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
                hide-details
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="selectedNationality"
                :items="nationalities"
                label="Nationality"
                variant="outlined"
                density="compact"
                clearable
                hide-details
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Employee Stats Cards -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="3">
          <v-card color="primary" dark class="stat-card">
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-h6 font-weight-bold">{{ totalEmployees }}</div>
                  <div class="text-caption">Total Employees</div>
                </div>
                <v-icon size="24">mdi-account-group</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card color="success" dark class="stat-card">
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-h6 font-weight-bold">{{ activeEmployees }}</div>
                  <div class="text-caption">Active</div>
                </div>
                <v-icon size="24">mdi-account-check</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card color="warning" dark class="stat-card">
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-h6 font-weight-bold">{{ expiringDocuments }}</div>
                  <div class="text-caption">Expiring Soon</div>
                </div>
                <v-icon size="24">mdi-alert</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card color="info" dark class="stat-card">
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-h6 font-weight-bold">{{ onLeaveEmployees }}</div>
                  <div class="text-caption">On Leave</div>
                </div>
                <v-icon size="24">mdi-calendar-clock</v-icon>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Employee Data Table -->
      <v-card class="enhanced-card employee-table-card" elevation="4">
        <v-card-title class="d-flex align-center justify-space-between bg-surface pa-spacing-lg">
          <div class="d-flex align-center">
            <v-icon class="mr-3" color="primary">mdi-account-group</v-icon>
            <span class="text-h6 font-weight-bold">Employee Directory</span>
          </div>
          <div class="d-flex align-center gap-3">
            <v-btn
              variant="outlined"
              size="small"
              class="enhanced-btn"
              @click="exportEmployees"
              title="Export to Excel"
            >
              <v-icon class="mr-2">mdi-download</v-icon>
              Export
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              class="enhanced-btn"
              @click="refreshData"
              :loading="loading"
              title="Refresh"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        
        <!-- Loading State with Skeleton -->
        <div v-if="loading" class="table-loading pa-spacing-xl">
          <SkeletonLoader variant="card" :lines="1" class="mb-4" />
          <SkeletonLoader variant="text" :lines="8" class="mb-3" />
          <SkeletonLoader variant="text" :lines="8" class="mb-3" />
          <SkeletonLoader variant="text" :lines="8" />
        </div>
        
        <!-- Data Table -->
        <v-data-table
          v-else
          v-model:items-per-page="itemsPerPage"
          :headers="headers"
          :items="filteredEmployees"
          :search="searchQuery"
          class="enhanced-table employee-table"
          item-value="id"
          density="comfortable"
          hover
          @click:row="openEmployeeDetails"
        >
          <!-- Employee Info Column -->
          <template #item.employee="{ item }">
            <div class="d-flex align-center py-1">
              <v-avatar size="32" class="mr-3">
                <v-img
                  v-if="item.photoURL"
                  :src="item.photoURL"
                  :alt="item.fullName"
                />
                <div v-else class="avatar-initials">
                  {{ getInitials(item.fullName) }}
                </div>
              </v-avatar>
              <div>
                <div class="text-body-2 font-weight-medium">{{ item.fullName }}</div>
                <div class="text-caption text-grey-darken-1">{{ item.employeeId }}</div>
              </div>
            </div>
          </template>

          <!-- Department & Position Column -->
          <template #item.department="{ item }">
            <div>
              <div class="text-body-2">{{ item.department }}</div>
              <div class="text-caption text-grey-darken-1">{{ item.position }}</div>
            </div>
          </template>

          <!-- Qatar ID Column -->
          <template #item.qatarId="{ item }">
            <div>
              <div class="text-body-2">{{ item.qatarId || 'N/A' }}</div>
              <v-chip
                v-if="item.qatarIdExpiry"
                :color="getExpiryColor(item.qatarIdExpiry)"
                size="x-small"
                class="mt-1"
              >
                {{ formatDate(item.qatarIdExpiry) }}
              </v-chip>
            </div>
          </template>

          <!-- Status Column -->
          <template #item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="flat"
            >
              {{ item.status }}
            </v-chip>
          </template>

          <!-- Salary Column -->
          <template #item.salary="{ item }">
            <div class="text-body-2 font-weight-medium">
              {{ formatCurrency(item.salary) }}
            </div>
          </template>

          <!-- Actions Column -->
          <template #item.actions="{ item }">
            <div class="d-flex align-center gap-1">
              <v-btn
                variant="text"
                color="primary"
                size="small"
                class="action-btn"
                @click.stop="openEmployeeDetails($event, item)"
                title="View Details"
              >
                <v-icon size="16">mdi-eye</v-icon>
              </v-btn>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                class="action-btn"
                @click.stop="editEmployee(item)"
                title="Edit Employee"
              >
                <v-icon size="16">mdi-pencil</v-icon>
              </v-btn>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    variant="text"
                    color="primary"
                    size="small"
                    class="action-btn"
                    v-bind="props"
                    title="More Actions"
                  >
                    <v-icon size="16">mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item @click="generatePayslip(item)">
                    <template #prepend>
                      <v-icon size="18">mdi-file-document</v-icon>
                    </template>
                    <v-list-item-title>Generate Payslip</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="viewDocuments(item)">
                    <template #prepend>
                      <v-icon size="18">mdi-folder-open</v-icon>
                    </template>
                    <v-list-item-title>View Documents</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="deactivateEmployee(item)" :disabled="item.status === 'Inactive'">
                    <template #prepend>
                      <v-icon size="18">mdi-account-off</v-icon>
                    </template>
                    <v-list-item-title>Deactivate</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>
        </v-data-table>
      </v-card>

      <!-- Employee Detail Dialog -->
      <v-dialog
        v-model="employeeDialog"
        max-width="900px"
        persistent
        scrollable
      >
        <v-card v-if="selectedEmployee">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-avatar size="48" class="mr-4">
                <v-img
                  v-if="selectedEmployee.photoURL"
                  :src="selectedEmployee.photoURL"
                  :alt="selectedEmployee.fullName"
                />
                <div v-else class="avatar-initials text-h6">
                  {{ getInitials(selectedEmployee.fullName) }}
                </div>
              </v-avatar>
              <div>
                <h2 class="text-h6 font-weight-medium">{{ selectedEmployee.fullName }}</h2>
                <div class="text-body-2 text-grey-darken-1">{{ selectedEmployee.employeeId }}</div>
              </div>
            </div>
            <div class="d-flex align-center gap-2">
              <v-btn
                variant="text"
                @click="editMode = !editMode"
                :color="editMode ? 'primary' : 'primary'"
                title="Edit Mode"
              >
                <v-icon size="18">mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                variant="text"
                color="primary"
                @click="closeEmployeeDialog"
                title="Close"
              >
                <v-icon size="18">mdi-close</v-icon>
              </v-btn>
            </div>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-0">
            <v-container fluid class="pa-4">
              <v-row>
                <!-- Personal Information -->
                <v-col cols="12" md="6">
                  <h3 class="text-subtitle-1 font-weight-medium mb-3">Personal Information</h3>
                  <v-row dense>
                    <v-col cols="12">
                      <v-text-field
                        v-model="selectedEmployee.fullName"
                        label="Full Name"
                        :readonly="!editMode"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="selectedEmployee.email"
                        label="Email"
                        :readonly="!editMode"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="selectedEmployee.phone"
                        label="Phone"
                        :readonly="!editMode"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="selectedEmployee.nationality"
                        label="Nationality"
                        :readonly="!editMode"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                  </v-row>
                </v-col>

                <!-- Employment Information -->
                <v-col cols="12" md="6">
                  <h3 class="text-subtitle-1 font-weight-medium mb-3">Employment Information</h3>
                  <v-row dense>
                    <v-col cols="6">
                      <v-text-field
                        v-model="selectedEmployee.department"
                        label="Department"
                        :readonly="!editMode"
                        variant="outlined"
                        density="compact"
                        placeholder="e.g., Engineering, HR, Finance"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="selectedEmployee.position"
                        label="Position"
                        :readonly="!editMode"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-select
                        v-model="selectedEmployee.status"
                        :items="statusOptions"
                        label="Status"
                        :readonly="!editMode"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="selectedEmployee.salary"
                        label="Salary (QAR)"
                        type="number"
                        :readonly="!editMode"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                  </v-row>
                </v-col>

                <!-- Qatar Documents -->
                <v-col cols="12">
                  <h3 class="text-subtitle-1 font-weight-medium mb-3">Qatar Documents</h3>
                  <v-row dense>
                    <v-col cols="12" md="3">
                      <v-text-field
                        v-model="selectedEmployee.qatarId"
                        label="Qatar ID"
                        :readonly="!editMode"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field
                        v-model="selectedEmployee.passportNumber"
                        label="Passport Number"
                        :readonly="!editMode"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field
                        v-model="selectedEmployee.visaNumber"
                        label="Visa Number"
                        :readonly="!editMode"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field
                        v-model="selectedEmployee.sponsor"
                        label="Sponsor"
                        :readonly="!editMode"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                  </v-row>
                </v-col>

                <!-- Bank Details -->
                <v-col cols="12">
                  <h3 class="text-subtitle-1 font-weight-medium mb-3">Banking Information</h3>
                  <v-row dense>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="selectedEmployee.bankName"
                        label="Bank Name"
                        :readonly="!editMode"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="selectedEmployee.accountNumber"
                        label="Account Number"
                        :readonly="!editMode"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="selectedEmployee.iban"
                        label="IBAN"
                        :readonly="!editMode"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                  </v-row>
                </v-col>

                <!-- Document Uploads -->
                <v-col cols="12">
                  <h3 class="text-subtitle-1 font-weight-medium mb-3">Document Attachments</h3>
                  
                  <!-- Qatar ID Document -->
                  <v-row dense class="mb-3">
                    <v-col cols="12" md="6">
                      <div class="document-section">
                        <div class="d-flex align-center justify-space-between mb-2">
                          <h4 class="text-body-1 font-weight-medium">Qatar ID Copy</h4>
                          <v-chip
                            v-if="selectedEmployee.qatarIdDocument"
                            color="success"
                            size="small"
                            variant="flat"
                          >
                            Uploaded
                          </v-chip>
                        </div>
                        
                        <div v-if="selectedEmployee.qatarIdDocument" class="document-preview mb-2">
                          <div class="d-flex align-center">
                            <v-icon 
                              :color="getFileIcon(selectedEmployee.qatarIdDocument).color" 
                              class="mr-2"
                            >
                              {{ getFileIcon(selectedEmployee.qatarIdDocument).icon }}
                            </v-icon>
                            <span class="text-body-2">{{ getFileName(selectedEmployee.qatarIdDocument) }}</span>
                            <v-spacer />
                            <v-btn
                              variant="text"
                              size="small"
                              color="primary"
                              class="action-btn"
                              @click="viewDocument(selectedEmployee.qatarIdDocument)"
                              title="View Document"
                            >
                              <v-icon size="16">mdi-eye</v-icon>
                            </v-btn>
                            <v-btn
                              v-if="editMode"
                              variant="text"
                              size="small"
                              color="primary"
                              class="action-btn"
                              @click="removeDocument('qatarIdDocument')"
                              title="Remove Document"
                            >
                              <v-icon size="16">mdi-delete</v-icon>
                            </v-btn>
                          </div>
                        </div>
                        
                        <v-file-input
                          v-if="editMode"
                          :key="`qatar-id-${fileInputKey}`"
                          label="Upload Qatar ID (PDF/Image)"
                          variant="outlined"
                          density="compact"
                          accept=".pdf,.jpg,.jpeg,.png"
                          @change="handleFileUpload($event, 'qatarIdDocument')"
                          :loading="uploading"
                          hide-details
                        >
                          <template #prepend>
                            <v-icon size="18">mdi-paperclip</v-icon>
                          </template>
                        </v-file-input>
                      </div>
                    </v-col>

                    <!-- Passport Document -->
                    <v-col cols="12" md="6">
                      <div class="document-section">
                        <div class="d-flex align-center justify-space-between mb-2">
                          <h4 class="text-body-1 font-weight-medium">Passport Copy</h4>
                          <v-chip
                            v-if="selectedEmployee.passportDocument"
                            color="success"
                            size="small"
                            variant="flat"
                          >
                            Uploaded
                          </v-chip>
                        </div>
                        
                        <div v-if="selectedEmployee.passportDocument" class="document-preview mb-2">
                          <div class="d-flex align-center">
                            <v-icon 
                              :color="getFileIcon(selectedEmployee.passportDocument).color" 
                              class="mr-2"
                            >
                              {{ getFileIcon(selectedEmployee.passportDocument).icon }}
                            </v-icon>
                            <span class="text-body-2">{{ getFileName(selectedEmployee.passportDocument) }}</span>
                            <v-spacer />
                            <v-btn
                              icon="fa:fas fa-eye"
                              variant="text"
                              size="small"
                              color="primary"
                              class="action-btn"
                              @click="viewDocument(selectedEmployee.passportDocument)"
                              title="View Document"
                            />
                            <v-btn
                              v-if="editMode"
                              icon="fa:fas fa-trash"
                              variant="text"
                              size="small"
                              color="primary"
                              class="action-btn"
                              @click="removeDocument('passportDocument')"
                              title="Remove Document"
                            />
                          </div>
                        </div>
                        
                        <v-file-input
                          v-if="editMode"
                          :key="`passport-${fileInputKey}`"
                          label="Upload Passport (PDF/Image)"
                          variant="outlined"
                          density="compact"
                          accept=".pdf,.jpg,.jpeg,.png"
                          prepend-icon="mdi-paperclip"
                          @change="handleFileUpload($event, 'passportDocument')"
                          :loading="uploading"
                          hide-details
                        />
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              variant="text"
              @click="closeEmployeeDialog"
            >
              Cancel
            </v-btn>
            <v-btn
              v-if="editMode"
              color="primary"
              @click="saveEmployee"
              :loading="saving"
            >
              Save Changes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { debounce } from 'lodash-es'
import SkeletonLoader from '@/components/common/SkeletonLoader.vue'

// Types
interface Employee {
  id: string
  employeeId: string
  fullName: string
  email: string
  phone: string
  department: string
  position: string
  salary: number
  status: 'Active' | 'Inactive' | 'On Leave' | 'Terminated'
  joinDate: string
  nationality: string
  photoURL?: string
  qatarId: string
  passportNumber: string
  visaNumber: string
  sponsor: string
  qatarIdExpiry?: string
  passportExpiry?: string
  visaExpiry?: string
  // Bank Details
  bankName: string
  accountNumber: string
  iban: string
  // Document URLs
  qatarIdDocument?: string
  passportDocument?: string
}

// Reactive data
const employees = ref<Employee[]>([])
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const selectedDepartment = ref('')
const selectedPosition = ref('')
const selectedStatus = ref('')
const selectedNationality = ref('')
const employeeDialog = ref(false)
const selectedEmployee = ref<Employee | null>(null)
const editMode = ref(false)
const itemsPerPage = ref(10)
const uploading = ref(false)
const fileInputKey = ref(0) // For resetting file inputs

// Mock data
const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    fullName: 'Ahmed Al-Mansouri',
    email: 'ahmed.mansouri@niponpayroll.com',
    phone: '+974 5555 1234',
    department: 'Engineering',
    position: 'Senior Developer',
    salary: 15000,
    status: 'Active',
    joinDate: '2023-01-15',
    nationality: 'Qatari',
    photoURL: 'https://i.pravatar.cc/150?img=1',
    qatarId: '12345678901',
    passportNumber: 'Q12345678',
    visaNumber: 'V123456789',
    sponsor: 'Nipon Payroll Pro',
    qatarIdExpiry: '2025-12-31',
    passportExpiry: '2026-06-15',
    visaExpiry: '2024-08-30',
    bankName: 'Qatar National Bank',
    accountNumber: '123456789012',
    iban: 'QA58QNBA000000000000693123456',
    qatarIdDocument: '/documents/ahmed_qatar_id.pdf',
    passportDocument: '/documents/ahmed_passport.pdf'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    fullName: 'Fatima Al-Zahra',
    email: 'fatima.zahra@niponpayroll.com',
    phone: '+974 5555 5678',
    department: 'HR',
    position: 'HR Manager',
    salary: 12000,
    status: 'Active',
    joinDate: '2022-03-20',
    nationality: 'Qatari',
    photoURL: 'https://i.pravatar.cc/150?img=2',
    qatarId: '12345678902',
    passportNumber: 'Q12345679',
    visaNumber: 'V123456790',
    sponsor: 'Nipon Payroll Pro',
    qatarIdExpiry: '2025-11-15',
    passportExpiry: '2026-04-20',
    visaExpiry: '2024-09-15',
    bankName: 'Commercial Bank of Qatar',
    accountNumber: '987654321098',
    iban: 'QA58CBQA000000000000693987654',
    qatarIdDocument: '/documents/fatima_qatar_id.jpg'
  },
  {
    id: '3',
    employeeId: 'EMP003',
    fullName: 'Rajesh Kumar',
    email: 'rajesh.kumar@niponpayroll.com',
    phone: '+974 5555 9012',
    department: 'Finance',
    position: 'Accountant',
    salary: 8000,
    status: 'Active',
    joinDate: '2023-06-10',
    nationality: 'Indian',
    photoURL: 'https://i.pravatar.cc/150?img=3',
    qatarId: '12345678903',
    passportNumber: 'K12345678',
    visaNumber: 'V123456791',
    sponsor: 'Nipon Payroll Pro',
    qatarIdExpiry: '2024-03-30',
    passportExpiry: '2025-12-10',
    visaExpiry: '2024-07-20',
    bankName: 'Doha Bank',
    accountNumber: '456789123456',
    iban: 'QA58DOHB000000000000693456789',
    passportDocument: '/documents/rajesh_passport.pdf'
  },
  {
    id: '4',
    employeeId: 'EMP004',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@niponpayroll.com',
    phone: '+974 5555 3456',
    department: 'Marketing',
    position: 'Marketing Specialist',
    salary: 9500,
    status: 'On Leave',
    joinDate: '2022-11-05',
    nationality: 'American',
    photoURL: 'https://i.pravatar.cc/150?img=4',
    qatarId: '12345678904',
    passportNumber: 'US12345678',
    visaNumber: 'V123456792',
    sponsor: 'Nipon Payroll Pro',
    qatarIdExpiry: '2025-08-20',
    passportExpiry: '2026-02-28',
    visaExpiry: '2024-12-15',
    bankName: 'Qatar Islamic Bank',
    accountNumber: '789012345678',
    iban: 'QA58QIIB000000000000693789012',
    qatarIdDocument: '/documents/sarah_qatar_id.pdf',
    passportDocument: '/documents/sarah_passport.jpg'
  },
  {
    id: '5',
    employeeId: 'EMP005',
    fullName: 'Mohamed Hassan',
    email: 'mohamed.hassan@niponpayroll.com',
    phone: '+974 5555 7890',
    department: 'Operations',
    position: 'Operations Manager',
    salary: 13500,
    status: 'Active',
    joinDate: '2021-08-12',
    nationality: 'Egyptian',
    photoURL: 'https://i.pravatar.cc/150?img=5',
    qatarId: '12345678905',
    passportNumber: 'EG12345678',
    visaNumber: 'V123456793',
    sponsor: 'Nipon Payroll Pro',
    qatarIdExpiry: '2025-05-10',
    passportExpiry: '2025-11-30',
    visaExpiry: '2024-10-05',
    bankName: 'Al Rayan Bank',
    accountNumber: '345678901234',
    iban: 'QA58ARBB000000000000693345678',
    qatarIdDocument: '/documents/mohamed_qatar_id.jpg',
    passportDocument: '/documents/mohamed_passport.pdf'
  }
]

// Options
const positions = ['Manager', 'Senior Developer', 'Developer', 'Accountant', 'Specialist', 'Coordinator']
const statusOptions = ['Active', 'Inactive', 'On Leave', 'Terminated']
const nationalities = ['Qatari', 'Indian', 'Pakistani', 'Egyptian', 'Bangladeshi', 'Nepalese', 'Filipino', 'American', 'British', 'Canadian']

// Table headers
const headers = [
  { title: 'Employee', key: 'employee', sortable: true },
  { title: 'Department', key: 'department', sortable: true },
  { title: 'Qatar ID', key: 'qatarId', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Salary', key: 'salary', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px' }
]

// Computed
const filteredEmployees = computed(() => {
  let filtered = [...employees.value]

  if (selectedDepartment.value) {
    filtered = filtered.filter(emp => 
      emp.department.toLowerCase().includes(selectedDepartment.value.toLowerCase())
    )
  }
  if (selectedPosition.value) {
    filtered = filtered.filter(emp => emp.position.includes(selectedPosition.value))
  }
  if (selectedStatus.value) {
    filtered = filtered.filter(emp => emp.status === selectedStatus.value)
  }
  if (selectedNationality.value) {
    filtered = filtered.filter(emp => emp.nationality === selectedNationality.value)
  }

  return filtered
})

const totalEmployees = computed(() => employees.value.length)
const activeEmployees = computed(() => employees.value.filter(emp => emp.status === 'Active').length)
const onLeaveEmployees = computed(() => employees.value.filter(emp => emp.status === 'On Leave').length)
const expiringDocuments = computed(() => {
  const oneMonthFromNow = new Date()
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)
  
  return employees.value.filter(emp => {
    const qatarIdExpiry = emp.qatarIdExpiry ? new Date(emp.qatarIdExpiry) : null
    const passportExpiry = emp.passportExpiry ? new Date(emp.passportExpiry) : null
    const visaExpiry = emp.visaExpiry ? new Date(emp.visaExpiry) : null
    
    return (qatarIdExpiry && qatarIdExpiry <= oneMonthFromNow) ||
           (passportExpiry && passportExpiry <= oneMonthFromNow) ||
           (visaExpiry && visaExpiry <= oneMonthFromNow)
  }).length
})

// Methods
const loadEmployees = async () => {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    employees.value = mockEmployees
  } catch (error) {
    console.error('Failed to load employees:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadEmployees()
}

const debouncedSearch = debounce(() => {
  // Search functionality will be handled by v-data-table
}, 300)

const openEmployeeDetails = (_event: any, itemOrWrapper: Employee | { item: Employee }) => {
  const item = 'item' in itemOrWrapper ? itemOrWrapper.item : itemOrWrapper
  selectedEmployee.value = { ...item }
  editMode.value = false
  employeeDialog.value = true
}

const closeEmployeeDialog = () => {
  employeeDialog.value = false
  selectedEmployee.value = null
  editMode.value = false
}

const editEmployee = (employee: Employee) => {
  selectedEmployee.value = { ...employee }
  editMode.value = true
  employeeDialog.value = true
}

const saveEmployee = async () => {
  if (!selectedEmployee.value) return
  
  saving.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update employee in the list
    const index = employees.value.findIndex(emp => emp.id === selectedEmployee.value!.id)
    if (index !== -1) {
      employees.value[index] = { ...selectedEmployee.value }
    }
    
    closeEmployeeDialog()
  } catch (error) {
    console.error('Failed to save employee:', error)
  } finally {
    saving.value = false
  }
}

const exportEmployees = () => {
  try {
    // Create CSV content
    const headers = ['Employee ID', 'Full Name', 'Email', 'Phone', 'Department', 'Position', 'Salary', 'Status', 'Join Date', 'Nationality']
    const csvContent = [
      headers.join(','),
      ...filteredEmployees.value.map(emp => [
        emp.employeeId,
        `"${emp.fullName}"`,
        emp.email,
        emp.phone,
        emp.department,
        emp.position,
        emp.salary,
        emp.status,
        emp.joinDate,
        emp.nationality
      ].join(','))
    ].join('\n')

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    // Show success message
    alert('Employee data exported successfully!')
  } catch (error) {
    console.error('Export failed:', error)
    alert('Failed to export employee data. Please try again.')
  }
}

const generatePayslip = (employee: Employee) => {
  try {
    // Create a professional payslip document
    const payslipContent = `
NIPON PAYROLL PRO
Monthly Payslip

Employee: ${employee.fullName}
Employee ID: ${employee.employeeId}
Department: ${employee.department}
Position: ${employee.position}
Period: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

EARNINGS:
Basic Salary: ${formatCurrency(employee.salary)}
Total Earnings: ${formatCurrency(employee.salary)}

DEDUCTIONS:
Total Deductions: ${formatCurrency(0)}

NET PAY: ${formatCurrency(employee.salary)}

Generated on: ${new Date().toLocaleDateString()}
    `
    
    // Create and download the payslip
    const blob = new Blob([payslipContent], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `payslip_${employee.employeeId}_${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    
    alert(`Payslip generated successfully for ${employee.fullName}!`)
  } catch (error) {
    console.error('Payslip generation failed:', error)
    alert('Failed to generate payslip. Please try again.')
  }
}

const viewDocuments = (employee: Employee) => {
  selectedEmployee.value = { ...employee }
  employeeDialog.value = true
  editMode.value = false
}

const deactivateEmployee = (employee: Employee) => {
  if (confirm(`Are you sure you want to deactivate ${employee.fullName}?`)) {
    try {
      // Find and update the employee status
      const index = employees.value.findIndex(emp => emp.id === employee.id)
      if (index !== -1) {
        employees.value[index].status = 'Inactive'
        alert(`${employee.fullName} has been deactivated successfully.`)
      }
    } catch (error) {
      console.error('Deactivation failed:', error)
      alert('Failed to deactivate employee. Please try again.')
    }
  }
}

// Document handling methods
const handleFileUpload = async (event: Event, documentType: 'qatarIdDocument' | 'passportDocument') => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file || !selectedEmployee.value) return
  
  // Validate file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    alert('Please upload only PDF or image files (JPG, PNG)')
    return
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be less than 5MB')
    return
  }
  
  uploading.value = true
  try {
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In a real app, you would upload to a server and get back a URL
    const mockDocumentUrl = `/documents/${selectedEmployee.value.employeeId}_${documentType}_${Date.now()}.${file.name.split('.').pop()}`
    
    // Update the employee's document URL
    selectedEmployee.value[documentType] = mockDocumentUrl
    
    // Reset file input
    fileInputKey.value++
    
    console.log(`${documentType} uploaded successfully:`, mockDocumentUrl)
  } catch (error) {
    console.error('Failed to upload document:', error)
    alert('Failed to upload document. Please try again.')
  } finally {
    uploading.value = false
  }
}

const removeDocument = (documentType: 'qatarIdDocument' | 'passportDocument') => {
  if (!selectedEmployee.value) return
  
  if (confirm('Are you sure you want to remove this document?')) {
    selectedEmployee.value[documentType] = undefined
    console.log(`${documentType} removed`)
  }
}

const viewDocument = (documentUrl: string) => {
  if (documentUrl) {
    // In a real app, this would open the document in a new tab or modal
    console.log('Viewing document:', documentUrl)
    // For demo purposes, we'll just show an alert
    alert(`Opening document: ${documentUrl}`)
  }
}

const getFileIcon = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf':
      return { icon: 'mdi-file-pdf-box', color: 'error' }
    case 'jpg':
    case 'jpeg':
    case 'png':
      return { icon: 'mdi-file-image', color: 'info' }
    default:
      return { icon: 'mdi-file', color: 'grey' }
  }
}

const getFileName = (filePath: string) => {
  return filePath.split('/').pop() || filePath
}

const getInitials = (fullName: string): string => {
  return fullName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Active: 'success',
    Inactive: 'grey',
    'On Leave': 'warning',
    Terminated: 'error'
  }
  return colors[status] || 'grey'
}

const getExpiryColor = (expiryDate: string): string => {
  const expiry = new Date(expiryDate)
  const today = new Date()
  const oneMonth = new Date()
  oneMonth.setMonth(oneMonth.getMonth() + 1)
  
  if (expiry <= today) return 'error'
  if (expiry <= oneMonth) return 'warning'
  return 'success'
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'QAR',
    minimumFractionDigits: 0
  }).format(amount)
}

// Lifecycle
onMounted(() => {
  loadEmployees()
})
</script>

<style scoped>
.employee-list {
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  margin-bottom: 0;
}

.filter-card {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.stat-card {
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.employee-table-card {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.employee-table :deep(.v-data-table__wrapper) {
  border-radius: 0;
}

.employee-table :deep(.v-data-table-header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.employee-table :deep(.v-data-table__tr:hover) {
  background: rgba(103, 126, 234, 0.05);
  cursor: pointer;
}

.avatar-initials {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

/* Document Section Styles */
.document-section {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 12px;
  background: rgba(248, 249, 250, 0.5);
}

.document-preview {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 6px;
  padding: 8px;
}

.document-preview:hover {
  background: rgba(103, 126, 234, 0.02);
}

/* Dialog responsiveness */
.v-dialog .v-card {
  max-height: 90vh;
  overflow-y: auto;
}

/* Banking section styling */
.v-col h3 {
  color: #1976d2;
  border-bottom: 2px solid rgba(25, 118, 210, 0.1);
  padding-bottom: 4px;
}
</style>