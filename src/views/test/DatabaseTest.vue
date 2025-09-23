<template>
  <v-container fluid class="pa-4">
    <v-card class="mx-auto" max-width="800">
      <v-card-title class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-database</v-icon>
        <span>Firebase Database Test</span>
        <v-spacer />
        <v-chip :color="connectionStatus === 'connected' ? 'success' : 'error'" size="small">
          {{ connectionStatus }}
        </v-chip>
      </v-card-title>
      
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">Add Test Employee</h3>
            <v-form @submit.prevent="addTestEmployee">
              <v-text-field
                v-model="testEmployee.employeeId"
                label="Employee ID"
                dense
                outlined
                class="mb-2"
              />
              <v-text-field
                v-model="testEmployee.firstName"
                label="First Name"
                dense
                outlined
                class="mb-2"
              />
              <v-text-field
                v-model="testEmployee.lastName"
                label="Last Name"
                dense
                outlined
                class="mb-2"
              />
              <v-text-field
                v-model="testEmployee.email"
                label="Email"
                type="email"
                dense
                outlined
                class="mb-2"
              />
              <v-text-field
                v-model="testEmployee.position"
                label="Position"
                dense
                outlined
                class="mb-2"
              />
              <v-select
                v-model="testEmployee.type"
                :items="['temporary', 'permanent']"
                label="Type"
                dense
                outlined
                class="mb-3"
              />
              <v-btn 
                type="submit" 
                color="primary" 
                :loading="loading"
                :disabled="!isFormValid"
                block
              >
                Add Employee
              </v-btn>
            </v-form>
          </v-col>
          
          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">Employees in Database</h3>
            <v-card variant="outlined" class="mb-3">
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-subtitle-2">Total Employees:</span>
                  <v-chip size="small" color="primary">{{ employees.length }}</v-chip>
                </div>
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-subtitle-2">Temporary:</span>
                  <v-chip size="small" color="warning">{{ temporaryEmployees.length }}</v-chip>
                </div>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-subtitle-2">Permanent:</span>
                  <v-chip size="small" color="success">{{ permanentEmployees.length }}</v-chip>
                </div>
              </v-card-text>
            </v-card>
            
            <v-btn 
              @click="refreshEmployees" 
              color="secondary" 
              variant="outlined"
              :loading="loading"
              class="mb-3"
              block
            >
              <v-icon start>mdi-refresh</v-icon>
              Refresh Data
            </v-btn>
            
            <v-btn 
              @click="clearTestData" 
              color="error" 
              variant="outlined"
              :loading="loading"
              block
            >
              <v-icon start>mdi-delete</v-icon>
              Clear Test Data
            </v-btn>
          </v-col>
        </v-row>
        
        <!-- Employee List -->
        <v-divider class="my-4" />
        <h3 class="text-h6 mb-3">Employee List</h3>
        
        <v-data-table
          :headers="headers"
          :items="employees"
          :loading="loading"
          density="compact"
          class="border"
        >
          <template #item.type="{ item }">
            <v-chip 
              :color="item.type === 'temporary' ? 'warning' : 'success'" 
              size="small"
            >
              {{ item.type }}
            </v-chip>
          </template>
          
          <template #item.actions="{ item }">
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              variant="text"
              @click="deleteEmployee(item.id)"
              :loading="loading"
            />
          </template>
          
          <template #no-data>
            <div class="text-center pa-4">
              <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-database-off</v-icon>
              <div class="text-subtitle-1">No employees found</div>
              <div class="text-caption text-grey-darken-1">Add some test data to get started</div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    
    <!-- Error/Success Messages -->
    <v-snackbar v-model="showMessage" :color="messageType" timeout="3000">
      {{ message }}
      <template #actions>
        <v-btn color="white" variant="text" @click="showMessage = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEmployeeStore } from '@/stores/employees-db'
import type { Employee } from '@/services/database'

const employeeStore = useEmployeeStore()

// State
const connectionStatus = ref<'connecting' | 'connected' | 'error'>('connecting')
const loading = ref(false)
const showMessage = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const testEmployee = ref({
  employeeId: '',
  firstName: '',
  lastName: '',
  email: '',
  position: '',
  type: 'temporary' as 'temporary' | 'permanent',
  phone: '+974',
  department: 'Test Department',
  salary: 3000,
  hireDate: new Date().toISOString().split('T')[0],
  status: 'active' as const,
  nationality: 'Test'
})

// Table headers
const headers = [
  { title: 'Employee ID', key: 'employeeId', sortable: true },
  { title: 'Name', key: 'firstName', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Position', key: 'position', sortable: true },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Computed
const employees = computed(() => employeeStore.employees)
const temporaryEmployees = computed(() => employeeStore.temporaryEmployees)
const permanentEmployees = computed(() => employeeStore.permanentEmployees)

const isFormValid = computed(() => {
  return testEmployee.value.employeeId &&
         testEmployee.value.firstName &&
         testEmployee.value.lastName &&
         testEmployee.value.email &&
         testEmployee.value.position &&
         testEmployee.value.type
})

// Methods
const showSuccessMessage = (msg: string) => {
  message.value = msg
  messageType.value = 'success'
  showMessage.value = true
}

const showErrorMessage = (msg: string) => {
  message.value = msg
  messageType.value = 'error'
  showMessage.value = true
}

const addTestEmployee = async () => {
  try {
    loading.value = true
    
    const employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'> = {
      ...testEmployee.value,
      companyId: 'test-company-id' // In real app, this would come from auth
    }
    
    await employeeStore.createEmployee(employeeData)
    
    // Reset form
    testEmployee.value = {
      employeeId: '',
      firstName: '',
      lastName: '',
      email: '',
      position: '',
      type: 'temporary',
      phone: '+974',
      department: 'Test Department',
      salary: 3000,
      hireDate: new Date().toISOString().split('T')[0],
      status: 'active',
      nationality: 'Test'
    }
    
    showSuccessMessage('Employee added successfully!')
    
  } catch (error) {
    console.error('Error adding employee:', error)
    showErrorMessage(error instanceof Error ? error.message : 'Failed to add employee')
  } finally {
    loading.value = false
  }
}

const deleteEmployee = async (id: string) => {
  try {
    loading.value = true
    await employeeStore.deleteEmployee(id)
    showSuccessMessage('Employee deleted successfully!')
  } catch (error) {
    console.error('Error deleting employee:', error)
    showErrorMessage(error instanceof Error ? error.message : 'Failed to delete employee')
  } finally {
    loading.value = false
  }
}

const refreshEmployees = async () => {
  try {
    loading.value = true
    await employeeStore.fetchEmployees('test-company-id')
    showSuccessMessage('Data refreshed successfully!')
  } catch (error) {
    console.error('Error refreshing employees:', error)
    showErrorMessage(error instanceof Error ? error.message : 'Failed to refresh data')
  } finally {
    loading.value = false
  }
}

const clearTestData = async () => {
  if (!confirm('Are you sure you want to delete all test employees?')) return
  
  try {
    loading.value = true
    
    // Delete all employees one by one
    const employeeIds = employees.value.map(emp => emp.id)
    for (const id of employeeIds) {
      await employeeStore.deleteEmployee(id)
    }
    
    showSuccessMessage('All test data cleared!')
    
  } catch (error) {
    console.error('Error clearing test data:', error)
    showErrorMessage(error instanceof Error ? error.message : 'Failed to clear test data')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  try {
    connectionStatus.value = 'connecting'
    
    // Initialize the employee store
    await employeeStore.initialize('test-company-id')
    
    connectionStatus.value = 'connected'
    showSuccessMessage('Connected to Firebase successfully!')
    
  } catch (error) {
    console.error('Error connecting to Firebase:', error)
    connectionStatus.value = 'error'
    showErrorMessage('Failed to connect to Firebase database')
  }
})

onUnmounted(() => {
  // Clean up listeners
  employeeStore.cleanupListeners()
})
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-data-table {
  border-radius: 8px;
}
</style>