<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <!-- Header -->
        <div class="d-flex align-center justify-space-between mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold">Employee Management</h1>
            <p class="text-body-1 text-grey">Manage your workforce efficiently</p>
          </div>
          <v-btn
            color="primary"
            size="large"
            @click="showAddDialog = true"
          >
            <v-icon start>mdi-plus</v-icon>
            Add Employee
          </v-btn>
        </div>

        <!-- Search and Filters -->
        <v-card class="mb-4">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="search"
                  prepend-inner-icon="mdi-magnify"
                  label="Search employees..."
                  clearable
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="departmentFilter"
                  :items="departments"
                  label="Department"
                  clearable
                  hide-details
                ></v-select>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="statusFilter"
                  :items="['Active', 'Inactive', 'On Leave']"
                  label="Status"
                  clearable
                  hide-details
                ></v-select>
              </v-col>
              <v-col cols="12" md="2">
                <v-btn
                  variant="outlined"
                  color="primary"
                  block
                  @click="exportData"
                >
                  <v-icon start>mdi-download</v-icon>
                  Export
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Data Table -->
        <v-card>
          <v-data-table
            :headers="headers"
            :items="employees"
            :search="search"
            :loading="loading"
            items-per-page="10"
          >
            <!-- Employee Name with Avatar -->
            <template v-slot:item.name="{ item }">
              <div class="d-flex align-center py-2">
                <v-avatar size="36" color="primary" class="mr-3">
                  <span class="text-white">{{ getInitials(item.name) }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="text-caption text-grey">ID: {{ item.employeeId }}</div>
                </div>
              </div>
            </template>

            <!-- Status Badge -->
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
                label
              >
                {{ item.status }}
              </v-chip>
            </template>

            <!-- Qatar ID Status -->
            <template v-slot:item.qatarIdExpiry="{ item }">
              <div class="d-flex align-center">
                <v-icon
                  size="small"
                  :color="getExpiryColor(item.qatarIdExpiry)"
                  class="mr-2"
                >
                  {{ getExpiryIcon(item.qatarIdExpiry) }}
                </v-icon>
                <span :class="getExpiryTextColor(item.qatarIdExpiry)">
                  {{ formatDate(item.qatarIdExpiry) }}
                </span>
              </div>
            </template>

            <!-- Actions -->
            <template v-slot:item.actions="{ item }">
              <div class="d-flex gap-1">
                <!-- View Button -->
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="primary"
                  @click="viewEmployee(item)"
                >
                  <v-icon size="20">mdi-eye</v-icon>
                  <v-tooltip activator="parent" location="top">View Details</v-tooltip>
                </v-btn>

                <!-- Edit Button -->
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="primary"
                  @click="editEmployee(item)"
                >
                  <v-icon size="20">mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">Edit</v-tooltip>
                </v-btn>

                <!-- Documents Button -->
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="warning"
                  @click="viewDocuments(item)"
                >
                  <v-icon size="20">mdi-file-document</v-icon>
                  <v-tooltip activator="parent" location="top">Documents</v-tooltip>
                </v-btn>

                <!-- More Options -->
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      v-bind="props"
                    >
                      <v-icon size="20">mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item @click="generatePayslip(item)">
                      <template v-slot:prepend>
                        <v-icon size="20">mdi-file-pdf-box</v-icon>
                      </template>
                      <v-list-item-title>Generate Payslip</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="sendEmail(item)">
                      <template v-slot:prepend>
                        <v-icon size="20">mdi-email</v-icon>
                      </template>
                      <v-list-item-title>Send Email</v-list-item-title>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item @click="deleteEmployee(item)" class="text-error">
                      <template v-slot:prepend>
                        <v-icon size="20" color="error">mdi-delete</v-icon>
                      </template>
                      <v-list-item-title>Delete</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Employee Dialog -->
    <v-dialog
      v-model="showAddDialog"
      max-width="800"
      persistent
    >
      <v-card>
        <v-card-title class="text-h5 primary white--text">
          <span class="text-white">{{ editMode ? 'Edit' : 'Add New' }} Employee</span>
          <v-spacer></v-spacer>
          <v-btn
            icon
            variant="text"
            @click="closeDialog"
          >
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pt-4">
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name"
                  label="Full Name"
                  prepend-icon="mdi-account"
                  :rules="[v => !!v || 'Name is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.employeeId"
                  label="Employee ID"
                  prepend-icon="mdi-identifier"
                  :rules="[v => !!v || 'Employee ID is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.email"
                  label="Email"
                  prepend-icon="mdi-email"
                  type="email"
                  :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.phone"
                  label="Phone"
                  prepend-icon="mdi-phone"
                  :rules="[v => !!v || 'Phone is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="formData.department"
                  :items="departments"
                  label="Department"
                  prepend-icon="mdi-office-building"
                  :rules="[v => !!v || 'Department is required']"
                  required
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.position"
                  label="Position"
                  prepend-icon="mdi-briefcase"
                  :rules="[v => !!v || 'Position is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.qatarId"
                  label="Qatar ID"
                  prepend-icon="mdi-card-account-details"
                  :rules="[v => !!v || 'Qatar ID is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.qatarIdExpiry"
                  label="Qatar ID Expiry"
                  prepend-icon="mdi-calendar"
                  type="date"
                  :rules="[v => !!v || 'Expiry date is required']"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="px-6 pb-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="closeDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="!valid"
            @click="saveEmployee"
          >
            <v-icon start>mdi-content-save</v-icon>
            {{ editMode ? 'Update' : 'Save' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Employee Details Dialog -->
    <v-dialog
      v-model="showViewDialog"
      max-width="900"
    >
      <v-card>
        <v-card-title class="text-h5 primary">
          <span class="text-white">Employee Details</span>
          <v-spacer></v-spacer>
          <v-btn
            icon
            variant="text"
            @click="showViewDialog = false"
          >
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pt-4" v-if="selectedEmployee">
          <v-row>
            <v-col cols="12" class="text-center mb-4">
              <v-avatar size="100" color="primary">
                <span class="text-h3 text-white">
                  {{ getInitials(selectedEmployee.name) }}
                </span>
              </v-avatar>
              <h2 class="mt-3">{{ selectedEmployee.name }}</h2>
              <p class="text-grey">{{ selectedEmployee.position }}</p>
            </v-col>
          </v-row>
          
          <v-row>
            <v-col cols="12" md="6">
              <v-list density="comfortable">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-identifier</v-icon>
                  </template>
                  <v-list-item-title>Employee ID</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedEmployee.employeeId }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-email</v-icon>
                  </template>
                  <v-list-item-title>Email</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedEmployee.email }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-phone</v-icon>
                  </template>
                  <v-list-item-title>Phone</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedEmployee.phone }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-list density="comfortable">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-office-building</v-icon>
                  </template>
                  <v-list-item-title>Department</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedEmployee.department }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-card-account-details</v-icon>
                  </template>
                  <v-list-item-title>Qatar ID</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedEmployee.qatarId }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-calendar-alert</v-icon>
                  </template>
                  <v-list-item-title>Qatar ID Expiry</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(selectedEmployee.qatarIdExpiry) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-card-actions class="px-6 pb-4">
          <v-btn
            color="primary"
            variant="outlined"
            @click="editEmployee(selectedEmployee)"
          >
            <v-icon start>mdi-pencil</v-icon>
            Edit
          </v-btn>
          <v-btn
            color="primary"
            variant="outlined"
            @click="viewDocuments(selectedEmployee)"
          >
            <v-icon start>mdi-file-document</v-icon>
            Documents
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showViewDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { differenceInDays } from 'date-fns'

// Data
const employees = ref([
  {
    id: 1,
    employeeId: 'EMP001',
    name: 'Ahmed Hassan',
    email: 'ahmed.hassan@company.qa',
    phone: '+974 5555 1234',
    department: 'Operations',
    position: 'Senior Engineer',
    status: 'Active',
    qatarId: '28574839201',
    qatarIdExpiry: '2025-12-15',
    joinDate: '2023-01-15'
  },
  {
    id: 2,
    employeeId: 'EMP002',
    name: 'Fatima Al-Rashid',
    email: 'fatima.rashid@company.qa',
    phone: '+974 5555 2345',
    department: 'HR',
    position: 'HR Manager',
    status: 'Active',
    qatarId: '28574839202',
    qatarIdExpiry: '2025-03-20',
    joinDate: '2022-06-10'
  },
  {
    id: 3,
    employeeId: 'EMP003',
    name: 'John Smith',
    email: 'john.smith@company.qa',
    phone: '+974 5555 3456',
    department: 'IT',
    position: 'Developer',
    status: 'On Leave',
    qatarId: '28574839203',
    qatarIdExpiry: '2025-04-10',
    joinDate: '2023-08-01'
  }
])

const departments = ['Operations', 'HR', 'IT', 'Finance', 'Sales', 'Admin']

// State
const search = ref('')
const departmentFilter = ref('')
const statusFilter = ref('')
const loading = ref(false)
const showAddDialog = ref(false)
const showViewDialog = ref(false)
const editMode = ref(false)
const valid = ref(false)
const selectedEmployee = ref<any>(null)
const formData = ref({
  name: '',
  employeeId: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  qatarId: '',
  qatarIdExpiry: ''
})

// Table headers
const headers = [
  { title: 'Employee', key: 'name', sortable: true },
  { title: 'Department', key: 'department', sortable: true },
  { title: 'Position', key: 'position', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Qatar ID Expiry', key: 'qatarIdExpiry', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const }
]

// Methods
const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Active': 'success',
    'Inactive': 'error',
    'On Leave': 'warning'
  }
  return colors[status] || 'grey'
}

const getExpiryColor = (date: string) => {
  const days = differenceInDays(new Date(date), new Date())
  if (days < 30) return 'error'
  if (days < 90) return 'warning'
  return 'success'
}

const getExpiryIcon = (date: string) => {
  const days = differenceInDays(new Date(date), new Date())
  if (days < 30) return 'mdi-alert-circle'
  if (days < 90) return 'mdi-alert'
  return 'mdi-check-circle'
}

const getExpiryTextColor = (date: string) => {
  const days = differenceInDays(new Date(date), new Date())
  if (days < 30) return 'text-error'
  if (days < 90) return 'text-warning'
  return 'text-success'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-GB')
}

const viewEmployee = (employee: any) => {
  selectedEmployee.value = employee
  showViewDialog.value = true
}

const editEmployee = (employee: any) => {
  selectedEmployee.value = employee
  formData.value = { ...employee }
  editMode.value = true
  showAddDialog.value = true
  showViewDialog.value = false
}

const viewDocuments = (employee: any) => {
  console.log('View documents for:', employee.name)
  // Navigate to documents page
}

const generatePayslip = (employee: any) => {
  console.log('Generate payslip for:', employee.name)
}

const sendEmail = (employee: any) => {
  console.log('Send email to:', employee.email)
}

const deleteEmployee = (employee: any) => {
  if (confirm(`Are you sure you want to delete ${employee.name}?`)) {
    employees.value = employees.value.filter(e => e.id !== employee.id)
  }
}

const closeDialog = () => {
  showAddDialog.value = false
  editMode.value = false
  formData.value = {
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    qatarId: '',
    qatarIdExpiry: ''
  }
}

const saveEmployee = () => {
  if (editMode.value) {
    const index = employees.value.findIndex(e => e.id === selectedEmployee.value.id)
    if (index !== -1) {
      employees.value[index] = { ...employees.value[index], ...formData.value }
    }
  } else {
    employees.value.push({
      id: Date.now(),
      ...formData.value,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0]
    })
  }
  closeDialog()
}

const exportData = () => {
  console.log('Exporting data...')
}
</script>

<style scoped>
:deep(.v-data-table) {
  font-size: 14px;
}

:deep(.v-data-table-header) {
  background-color: #fafafa;
}

:deep(.v-data-table-header th) {
  font-weight: 600 !important;
  color: #424242 !important;
}
</style>