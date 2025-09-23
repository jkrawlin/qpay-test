<template>
  <v-container fluid class="pa-4">
    <!-- Header Section -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center flex-wrap">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Contract Management</h1>
            <p class="text-body-1 text-medium-emphasis">
              Manage customer contracts, renewals, and compliance tracking
            </p>
          </div>
          <div class="d-flex">
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-download"
              @click="exportContracts"
              class="me-3"
            >
              Export
            </v-btn>
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-plus"
              @click="createContract"
              elevation="2"
            >
              New Contract
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Search Filters - Redesigned -->
    <div class="custom-filter-section mb-6">
      <div class="filter-header">
        <h3 class="filter-title">
          <v-icon class="filter-icon">mdi-filter-variant</v-icon>
          Search & Filter Contracts
        </h3>
      </div>
      <div class="filter-content">
        <div class="filter-row">
          <div class="filter-item">
            <label class="filter-label">Search Contracts</label>
            <div class="custom-input-wrapper">
              <v-icon class="input-icon">mdi-magnify</v-icon>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by title, customer, description..."
                class="custom-input"
              />
              <v-btn
                v-if="searchQuery"
                icon="mdi-close"
                size="x-small"
                variant="text"
                class="clear-btn"
                @click="searchQuery = ''"
              />
            </div>
          </div>
          
          <div class="filter-item">
            <label class="filter-label">Status</label>
            <div class="custom-select-wrapper">
              <select v-model="selectedStatus" class="custom-select">
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Expired">Expired</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <v-icon class="select-icon">mdi-chevron-down</v-icon>
            </div>
          </div>
          
          <div class="filter-item">
            <label class="filter-label">Contract Type</label>
            <div class="custom-select-wrapper">
              <select v-model="selectedType" class="custom-select">
                <option value="">All Types</option>
                <option value="Service">Service</option>
                <option value="Supply">Supply</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Consulting">Consulting</option>
              </select>
              <v-icon class="select-icon">mdi-chevron-down</v-icon>
            </div>
          </div>
          
          <div class="filter-item">
            <label class="filter-label">Customer</label>
            <div class="custom-select-wrapper">
              <select v-model="selectedCustomer" class="custom-select">
                <option value="">All Customers</option>
                <option value="ABC Construction">ABC Construction</option>
                <option value="TechCorp Ltd">TechCorp Ltd</option>
                <option value="Global Trading">Global Trading</option>
                <option value="Manufacturing Inc">Manufacturing Inc</option>
              </select>
              <v-icon class="select-icon">mdi-chevron-down</v-icon>
            </div>
          </div>
          
          <div class="filter-item">
            <label class="filter-label">Actions</label>
            <div class="filter-action-buttons">
              <button class="custom-reset-btn" @click="resetFilters">
                <v-icon class="btn-icon">mdi-refresh</v-icon>
                Reset
              </button>
              <button class="custom-report-btn" @click="generateReport">
                <v-icon class="btn-icon">mdi-file-chart</v-icon>
                Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contracts Data Table -->
    <v-card variant="outlined">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-2" color="primary">mdi-file-document-multiple</v-icon>
        <span class="text-h6 font-weight-bold">Contract Directory</span>
        <v-spacer />
        <v-chip color="primary" variant="tonal" size="small">
          {{ filteredContracts.length }} contracts
        </v-chip>
      </v-card-title>
      <v-divider />

      <v-data-table
        :headers="headers"
        :items="filteredContracts"
        item-value="id"
        class="elevation-0"
        density="comfortable"
        :items-per-page="25"
      >
        <!-- Contract Info -->
        <template v-slot:item.contract="{ item }">
          <div class="cursor-pointer" @click="viewContract(item)">
            <div class="text-body-2 font-weight-medium">{{ item.contractNumber }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.title }}</div>
          </div>
        </template>

        <!-- Customer -->
        <template v-slot:item.customer="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="32" class="mr-2">
              <span class="text-white text-caption font-weight-bold">
                {{ getInitials(item.customerName) }}
              </span>
            </v-avatar>
            <div>
              <div class="text-body-2">{{ item.customerName }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.customerType }}</div>
            </div>
          </div>
        </template>

        <!-- Contract Period -->
        <template v-slot:item.period="{ item }">
          <div>
            <div class="text-body-2">{{ formatDate(item.startDate) }} - {{ formatDate(item.endDate) }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ getDaysRemaining(item.endDate) }} days remaining
            </div>
          </div>
        </template>

        <!-- Value -->
        <template v-slot:item.value="{ item }">
          <div class="text-body-2 font-weight-medium">
            {{ formatCurrency(item.value) }}
          </div>
        </template>

        <!-- Status -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            variant="tonal"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-btn
              icon="mdi-eye"
              variant="text"
              size="small"
              color="primary"
              @click="viewContract(item)"
              title="View Contract"
            />
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              color="primary"
              @click="openEditContract(item)"
              title="Edit Contract"
            />
            <v-btn
              icon="mdi-download"
              variant="text"
              size="small"
              color="primary"
              @click="downloadContract(item)"
              title="Download Contract"
            />
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  variant="text"
                  size="small"
                  v-bind="props"
                />
              </template>
              <v-list density="compact">
                <v-list-item @click="renewContract(item)">
                  <v-list-item-title>Renew Contract</v-list-item-title>
                </v-list-item>
                <v-list-item @click="duplicateContract(item)">
                  <v-list-item-title>Duplicate</v-list-item-title>
                </v-list-item>
                <v-list-item @click="terminateContract(item)">
                  <v-list-item-title>Terminate</v-list-item-title>
                </v-list-item>
                <v-divider />
                <v-list-item @click="deleteContract(item)" class="text-error">
                  <v-list-item-title>Delete</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Contract Detail Dialog -->
    <v-dialog v-model="showDetailDialog" max-width="1000px" scrollable>
      <v-card v-if="selectedContract">
        <v-card-title class="bg-primary text-white">
          <v-icon class="mr-2">mdi-file-document</v-icon>
          Contract Details - {{ selectedContract.contractNumber }}
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" color="white" @click="showDetailDialog = false" />
        </v-card-title>

        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="6">
              <h3 class="mb-3">Contract Information</h3>
              <div class="mb-2">
                <strong>Contract Number:</strong> {{ selectedContract.contractNumber }}
              </div>
              <div class="mb-2">
                <strong>Title:</strong> {{ selectedContract.title }}
              </div>
              <div class="mb-2">
                <strong>Type:</strong> {{ selectedContract.type }}
              </div>
              <div class="mb-2">
                <strong>Status:</strong> 
                <v-chip :color="getStatusColor(selectedContract.status)" variant="tonal" size="small">
                  {{ selectedContract.status }}
                </v-chip>
              </div>
              <div class="mb-2">
                <strong>Value:</strong> {{ formatCurrency(selectedContract.value) }}
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <h3 class="mb-3">Customer & Timeline</h3>
              <div class="mb-2">
                <strong>Customer:</strong> {{ selectedContract.customerName }}
              </div>
              <div class="mb-2">
                <strong>Start Date:</strong> {{ formatDate(selectedContract.startDate) }}
              </div>
              <div class="mb-2">
                <strong>End Date:</strong> {{ formatDate(selectedContract.endDate) }}
              </div>
              <div class="mb-2">
                <strong>Duration:</strong> {{ selectedContract.duration }} months
              </div>
              <div class="mb-2">
                <strong>Auto Renewal:</strong> {{ selectedContract.autoRenewal ? 'Yes' : 'No' }}
              </div>
            </v-col>
            <v-col cols="12">
              <h3 class="mb-3">Description</h3>
              <p>{{ selectedContract.description }}</p>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="outlined" @click="showDetailDialog = false">Close</v-btn>
          <v-btn color="primary" @click="openEditContract(selectedContract)">Edit Contract</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Contract Dialog -->
    <v-dialog v-model="showEditDialog" max-width="800px" scrollable>
      <v-card :loading="savingEdit">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-pencil</v-icon>
          <span class="font-weight-bold">Edit Contract</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="closeEdit" />
        </v-card-title>
        <v-divider />
        <v-form ref="editFormRef" @submit.prevent="saveEdit">
          <v-card-text v-if="editDraft">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field v-model="editDraft.contractNumber" label="Contract Number" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editDraft.title" label="Title" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="editDraft.type" :items="contractTypes" label="Type" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="editDraft.status" :items="statusOptions" label="Status" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editDraft.startDate" type="date" label="Start Date" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editDraft.endDate" type="date" label="End Date" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="editDraft.value" type="number" min="0" label="Value (QAR)" density="comfortable" :rules="[rPositive]" />
              </v-col>
              <v-col cols="12" md="6" class="d-flex align-center">
                <v-switch v-model="editDraft.autoRenewal" inset color="primary" label="Auto Renewal" />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="editDraft.description" label="Description" rows="3" auto-grow density="comfortable" />
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="closeEdit">Cancel</v-btn>
            <v-btn color="primary" type="submit" :loading="savingEdit">Save</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const searchQuery = ref('')
const selectedStatus = ref(null)
const selectedType = ref(null)
const selectedCustomer = ref(null)
const showDetailDialog = ref(false)
const selectedContract = ref<any>(null)
// Edit dialog state
const showEditDialog = ref(false)
const editDraft = ref<any | null>(null)
const savingEdit = ref(false)
const editFormRef = ref()
const rRequired = (v: any) => (!!v || v === 0) || 'Required'
const rPositive = (v: number) => (v >= 0) || 'Must be >= 0'
const contractTypes = ['Annual Service','Project Based','Partnership','Maintenance','Consulting','Supply','Service']
const statusOptions = ['Active','Pending','Expired','Cancelled','Terminated','Draft']

// Sample data
const contracts = ref([
  {
    id: 1,
    contractNumber: 'CT-2024-001',
    title: 'Annual Construction Services',
    customerName: 'Al Rayyan Construction LLC',
    customerType: 'Construction',
    type: 'Annual Service',
    status: 'Active',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    duration: 12,
    value: 850000,
    autoRenewal: true,
    description: 'Comprehensive construction and project management services for Qatar market'
  },
  {
    id: 2,
    contractNumber: 'CT-2024-002',
    title: 'IT Solutions Contract',
    customerName: 'Qatar Tech Solutions WLL',
    customerType: 'Technology',
    type: 'Project Based',
    status: 'Active',
    startDate: '2024-02-01',
    endDate: '2024-08-31',
    duration: 7,
    value: 450000,
    autoRenewal: false,
    description: 'Software development and IT infrastructure services'
  },
  {
    id: 3,
    contractNumber: 'CT-2023-015',
    title: 'Trading Partnership Agreement',
    customerName: 'Pearl Trading Company',
    customerType: 'Trading',
    type: 'Partnership',
    status: 'Expired',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    duration: 12,
    value: 320000,
    autoRenewal: false,
    description: 'Import/export and distribution services agreement'
  }
])

// Table headers
const headers = [
  { title: 'Contract', key: 'contract', sortable: false },
  { title: 'Customer', key: 'customer', sortable: false },
  { title: 'Period', key: 'period', sortable: true },
  { title: 'Value', key: 'value', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Computed properties
const filteredContracts = computed(() => {
  let filtered = contracts.value

  if (searchQuery.value) {
    filtered = filtered.filter(contract => 
      contract.contractNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      contract.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      contract.customerName.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(contract => contract.status === selectedStatus.value)
  }

  if (selectedType.value) {
    filtered = filtered.filter(contract => contract.type === selectedType.value)
  }

  if (selectedCustomer.value) {
    filtered = filtered.filter(contract => contract.customerName === selectedCustomer.value)
  }

  return filtered
})

// Methods
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: 'QAR'
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB')
}

const getDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate)
  const today = new Date()
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24))
}

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Active': 'success',
    'Expired': 'error',
    'Pending': 'warning',
    'Terminated': 'error',
    'Draft': 'info'
  }
  return colors[status] || 'grey'
}

const createContract = () => {
  router.push('/customers/contracts/create')
}

const viewContract = (contract: any) => {
  selectedContract.value = contract
  showDetailDialog.value = true
}

const openEditContract = (contract: any) => {
  selectedContract.value = contract
  editDraft.value = { ...contract }
  showEditDialog.value = true
}
const saveEdit = async () => {
  if (!editDraft.value) return
  savingEdit.value = true
  try {
    const idx = contracts.value.findIndex(c => c.id === editDraft.value.id)
    if (idx !== -1) {
      contracts.value[idx] = { ...contracts.value[idx], ...editDraft.value }
    }
    showEditDialog.value = false
  } finally {
    savingEdit.value = false
  }
}
const closeEdit = () => { showEditDialog.value = false; editDraft.value = null }

const downloadContract = (contract: any) => {
  alert(`Downloading contract: ${contract.contractNumber}`)
}

const renewContract = (contract: any) => {
  alert(`Renewing contract: ${contract.contractNumber}`)
}

const duplicateContract = (contract: any) => {
  alert(`Duplicating contract: ${contract.contractNumber}`)
}

const terminateContract = (contract: any) => {
  if (confirm(`Are you sure you want to terminate ${contract.contractNumber}?`)) {
    contract.status = 'Terminated'
  }
}

const deleteContract = (contract: any) => {
  if (confirm(`Are you sure you want to delete ${contract.contractNumber}?`)) {
    const index = contracts.value.findIndex(c => c.id === contract.id)
    if (index !== -1) {
      contracts.value.splice(index, 1)
    }
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = null
  selectedType.value = null
  selectedCustomer.value = null
}

const exportContracts = () => {
  alert('Export functionality will be implemented')
}

const generateReport = () => {
  alert('Report generation functionality will be implemented')
}
</script>

<style scoped>
/* Custom Filter Section */
.custom-filter-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.filter-header {
  background: linear-gradient(135deg, #8B1538 0%, #6B0F2A 100%);
  padding: 16px 24px;
}

.filter-title {
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-icon {
  color: white;
}

.filter-content {
  padding: 24px;
  background: white;
}

.filter-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 24px;
  align-items: end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

/* Custom Input Styles */
.custom-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.custom-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  color: #374151;
}

.custom-input:focus {
  outline: none;
  border-color: #8B1538;
  box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.1);
}

.custom-input::placeholder {
  color: #9ca3af;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #6b7280;
  z-index: 1;
}

.clear-btn {
  position: absolute !important;
  right: 8px;
  color: #6b7280 !important;
}

/* Custom Select Styles */
.custom-select-wrapper {
  position: relative;
}

.custom-select {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
}

.custom-select:focus {
  outline: none;
  border-color: #8B1538;
  box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.1);
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
}

/* Custom Action Buttons */
.filter-action-buttons {
  display: flex;
  gap: 12px;
}

.custom-reset-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.custom-reset-btn:hover {
  background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
}

.custom-report-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.custom-report-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-icon {
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .filter-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .filter-content {
    padding: 16px;
  }
  
  .filter-action-buttons {
    flex-direction: column;
  }
}

/* Table Styles */
.v-data-table :deep(.v-table__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.v-data-table :deep(.v-data-table-header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.v-data-table :deep(.v-data-table-header th) {
  color: #374151 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
}

.v-data-table :deep(.v-data-table__td) {
  padding: 16px !important;
  border-bottom: 1px solid #f3f4f6 !important;
}

.v-data-table :deep(.v-data-table__tr:hover) {
  background: #f8f9fa !important;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}

.view-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  color: white !important;
  min-width: auto !important;
  padding: 8px !important;
  border-radius: 8px !important;
}

.edit-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
  color: white !important;
  min-width: auto !important;
  padding: 8px !important;
  border-radius: 8px !important;
}

.delete-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  color: white !important;
  min-width: auto !important;
  padding: 8px !important;
  border-radius: 8px !important;
}

/* Status Chips */
.status-chip {
  padding: 6px 12px !important;
  border-radius: 20px !important;
  font-weight: 600 !important;
  font-size: 12px !important;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: rgba(139, 21, 56, 0.04);
}
</style>
