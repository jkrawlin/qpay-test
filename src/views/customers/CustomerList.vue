<template>
  <v-container fluid>
    <!-- Header Section -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold text-primary">Customer Management</h1>
            <p class="text-subtitle-1 text-medium-emphasis">Manage B2B customers with Qatar compliance tracking</p>
          </div>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-plus"
            @click="openCustomerDialog()"
          >
            Add Customer
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filters & Search -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="searchQuery"
          label="Search customers..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedStatus"
          :items="statusOptions"
          label="Status"
          variant="outlined"
          density="compact"
          clearable
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedType"
          :items="typeOptions"
          label="Customer Type"
          variant="outlined"
          density="compact"
          clearable
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-btn
          variant="outlined"
          block
          @click="exportCustomers"
          prepend-icon="mdi-download"
        >
          Export
        </v-btn>
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="primary" size="40" class="me-3">mdi-account-group</v-icon>
              <div>
                <div class="text-h4 font-weight-bold">{{ statistics.totalCustomers }}</div>
                <div class="text-caption text-medium-emphasis">Total Customers</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="success" size="40" class="me-3">mdi-check-circle</v-icon>
              <div>
                <div class="text-h4 font-weight-bold">{{ statistics.activeCustomers }}</div>
                <div class="text-caption text-medium-emphasis">Active Customers</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="warning" size="40" class="me-3">mdi-alert-circle</v-icon>
              <div>
                <div class="text-h4 font-weight-bold">{{ statistics.expiringLicenses }}</div>
                <div class="text-caption text-medium-emphasis">Expiring Licenses</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="info" size="40" class="me-3">mdi-currency-usd</v-icon>
              <div>
                <div class="text-h4 font-weight-bold">{{ formatCurrency(statistics.totalRevenue) }}</div>
                <div class="text-caption text-medium-emphasis">Total Revenue</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Customer Data Table -->
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="me-2">mdi-account-group</v-icon>
        Customer Directory
        <v-spacer />
        <v-chip
          :color="getStatusColor('')"
          variant="tonal"
          size="small"
        >
          {{ filteredCustomers.length }} customers
        </v-chip>
      </v-card-title>

      <v-data-table
        :headers="customerHeaders"
        :items="filteredCustomers"
        :loading="loading"
        item-value="id"
        class="elevation-0"
        :items-per-page="25"
      >
        <!-- Company Name -->
        <template #item.companyName="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="32" class="me-3">
              <span class="text-white text-caption">{{ item.companyName.charAt(0) }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.companyName }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.businessType }}</div>
            </div>
          </div>
        </template>

        <!-- Contact Info -->
        <template #item.contactInfo="{ item }">
          <div>
            <div class="d-flex align-center">
              <v-icon size="14" class="me-1">mdi-email</v-icon>
              <span class="text-caption">{{ item.email }}</span>
            </div>
            <div class="d-flex align-center mt-1">
              <v-icon size="14" class="me-1">mdi-phone</v-icon>
              <span class="text-caption">{{ item.phone }}</span>
            </div>
          </div>
        </template>

        <!-- Trade License -->
        <template #item.tradeLicense="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.tradeLicenseNumber }}</div>
            <div class="text-caption text-medium-emphasis">
              Expires: {{ formatDate(item.tradeLicenseExpiry) }}
            </div>
            <v-chip
              :color="getLicenseStatusColor(item.tradeLicenseExpiry)"
              variant="tonal"
              size="x-small"
              class="mt-1"
            >
              {{ getLicenseStatus(item.tradeLicenseExpiry) }}
            </v-chip>
          </div>
        </template>

        <!-- Contract Status -->
        <template #item.contractStatus="{ item }">
          <div>
            <v-chip
              :color="getContractStatusColor(item.contractStatus)"
              variant="tonal"
              size="small"
            >
              {{ item.contractStatus }}
            </v-chip>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ item.contractType }}
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            variant="tonal"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-btn
              icon="mdi-eye"
              variant="text"
              size="small"
              @click="viewCustomer(item)"
            />
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              @click="editCustomer(item)"
            />
            <v-btn
              icon="mdi-receipt"
              variant="text"
              size="small"
              @click="generateInvoice(item)"
            />
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  variant="text"
                  size="small"
                  v-bind="props"
                />
              </template>
              <v-list density="compact">
                <v-list-item @click="renewLicense(item)">
                  <v-list-item-title>Renew License</v-list-item-title>
                </v-list-item>
                <v-list-item @click="viewContracts(item)">
                  <v-list-item-title>View Contracts</v-list-item-title>
                </v-list-item>
                <v-list-item @click="viewPaymentHistory(item)">
                  <v-list-item-title>Payment History</v-list-item-title>
                </v-list-item>
                <v-divider />
                <v-list-item
                  @click="deleteCustomer(item)"
                  class="text-error"
                >
                  <v-list-item-title>Delete</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Customer Dialog -->
    <v-dialog v-model="customerDialog" max-width="800px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon class="me-2">{{ editingCustomer ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ editingCustomer ? 'Edit Customer' : 'Add New Customer' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="customerForm" v-model="formValid">
            <v-row>
              <!-- Company Information -->
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1 pa-3">Company Information</v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="customerForm.companyName"
                          label="Company Name"
                          :rules="[rules.required]"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="customerForm.businessType"
                          label="Business Type"
                          :rules="[rules.required]"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="customerForm.tradeLicenseNumber"
                          label="Trade License Number"
                          :rules="[rules.required]"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="customerForm.tradeLicenseExpiry"
                          label="Trade License Expiry"
                          type="date"
                          :rules="[rules.required]"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Contact Information -->
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1 pa-3">Contact Information</v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="customerForm.contactPersonName"
                          label="Contact Person Name"
                          :rules="[rules.required]"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="customerForm.contactPersonPosition"
                          label="Position"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="customerForm.email"
                          label="Email"
                          type="email"
                          :rules="[rules.required, rules.email]"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="customerForm.phone"
                          label="Phone"
                          :rules="[rules.required]"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          v-model="customerForm.address"
                          label="Address"
                          :rules="[rules.required]"
                          variant="outlined"
                          density="compact"
                          rows="2"
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Contract & Billing -->
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1 pa-3">Contract & Billing</v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="customerForm.contractType"
                          :items="contractTypes"
                          label="Contract Type"
                          :rules="[rules.required]"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="customerForm.contractStatus"
                          :items="contractStatuses"
                          label="Contract Status"
                          :rules="[rules.required]"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="customerForm.contractStartDate"
                          label="Contract Start Date"
                          type="date"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="customerForm.contractEndDate"
                          label="Contract End Date"
                          type="date"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="customerForm.creditLimit"
                          label="Credit Limit (QAR)"
                          type="number"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="customerForm.paymentTerms"
                          label="Payment Terms (Days)"
                          type="number"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Qatar VAT Information -->
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1 pa-3">Qatar VAT & Compliance</v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="customerForm.vatNumber"
                          label="VAT Registration Number"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="customerForm.vatStatus"
                          :items="vatStatuses"
                          label="VAT Status"
                          variant="outlined"
                          density="compact"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-switch
                          v-model="customerForm.isQatarResident"
                          label="Qatar Resident Company"
                          color="primary"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-switch
                          v-model="customerForm.requiresCompliance"
                          label="Requires Ministry Compliance"
                          color="primary"
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="closeCustomerDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!formValid"
            @click="saveCustomer"
          >
            {{ editingCustomer ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format, differenceInDays } from 'date-fns'

// Types
interface Customer {
  id: string
  companyName: string
  businessType: string
  tradeLicenseNumber: string
  tradeLicenseExpiry: Date
  contactPersonName: string
  contactPersonPosition: string
  email: string
  phone: string
  address: string
  contractType: string
  contractStatus: string
  contractStartDate?: Date
  contractEndDate?: Date
  creditLimit: number
  paymentTerms: number
  vatNumber?: string
  vatStatus: string
  isQatarResident: boolean
  requiresCompliance: boolean
  status: string
  totalRevenue: number
  createdAt: Date
  updatedAt: Date
}

// Reactive data
const loading = ref(false)
const customerDialog = ref(false)
const editingCustomer = ref<Customer | null>(null)
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedType = ref('')
const formValid = ref(false)
const saving = ref(false)

const customers = ref<Customer[]>([])
const statistics = ref({
  totalCustomers: 0,
  activeCustomers: 0,
  expiringLicenses: 0,
  totalRevenue: 0
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Form data
const customerForm = ref({
  companyName: '',
  businessType: '',
  tradeLicenseNumber: '',
  tradeLicenseExpiry: '',
  contactPersonName: '',
  contactPersonPosition: '',
  email: '',
  phone: '',
  address: '',
  contractType: '',
  contractStatus: '',
  contractStartDate: '',
  contractEndDate: '',
  creditLimit: 0,
  paymentTerms: 30,
  vatNumber: '',
  vatStatus: 'not-registered',
  isQatarResident: true,
  requiresCompliance: true
})

// Options
const statusOptions = [
  { value: 'active', title: 'Active' },
  { value: 'inactive', title: 'Inactive' },
  { value: 'suspended', title: 'Suspended' }
]

const typeOptions = [
  { value: 'corporate', title: 'Corporate' },
  { value: 'government', title: 'Government' },
  { value: 'semi-government', title: 'Semi-Government' },
  { value: 'private', title: 'Private' }
]

const contractTypes = [
  'Annual Service Contract',
  'Project-Based Contract',
  'Retainer Agreement',
  'One-Time Service',
  'Maintenance Contract'
]

const contractStatuses = [
  'Active',
  'Pending',
  'Expired',
  'Under Review',
  'Terminated'
]

const vatStatuses = [
  { value: 'registered', title: 'VAT Registered' },
  { value: 'not-registered', title: 'Not VAT Registered' },
  { value: 'exempt', title: 'VAT Exempt' }
]

// Validation rules
const rules = {
  required: (value: any) => !!value || 'This field is required',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Invalid email format'
  }
}

// Table headers
const customerHeaders = [
  { title: 'Company', value: 'companyName', sortable: true },
  { title: 'Contact Info', value: 'contactInfo', sortable: false },
  { title: 'Trade License', value: 'tradeLicense', sortable: true },
  { title: 'Contract', value: 'contractStatus', sortable: true },
  { title: 'Status', value: 'status', sortable: true },
  { title: 'Actions', value: 'actions', sortable: false, align: 'center', width: '200px' }
]

// Computed
const filteredCustomers = computed(() => {
  let filtered = customers.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(customer =>
      customer.companyName.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.tradeLicenseNumber.toLowerCase().includes(query)
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(customer => customer.status === selectedStatus.value)
  }

  if (selectedType.value) {
    filtered = filtered.filter(customer => customer.businessType === selectedType.value)
  }

  return filtered
})

// Methods
const formatDate = (date: Date | string) => {
  if (!date) return 'N/A'
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy')
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: 'QAR'
  }).format(amount)
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'active': 'success',
    'inactive': 'warning',
    'suspended': 'error'
  }
  return colors[status] || 'default'
}

const getLicenseStatus = (expiryDate: Date | string) => {
  if (!expiryDate) return 'Unknown'
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate
  const daysUntilExpiry = differenceInDays(expiry, new Date())
  
  if (daysUntilExpiry < 0) return 'Expired'
  if (daysUntilExpiry <= 30) return 'Expiring Soon'
  if (daysUntilExpiry <= 90) return 'Due for Renewal'
  return 'Valid'
}

const getLicenseStatusColor = (expiryDate: Date | string) => {
  const status = getLicenseStatus(expiryDate)
  const colors: Record<string, string> = {
    'Expired': 'error',
    'Expiring Soon': 'warning',
    'Due for Renewal': 'info',
    'Valid': 'success'
  }
  return colors[status] || 'default'
}

const getContractStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Active': 'success',
    'Pending': 'warning',
    'Expired': 'error',
    'Under Review': 'info',
    'Terminated': 'error'
  }
  return colors[status] || 'default'
}

const openCustomerDialog = (customer?: Customer) => {
  if (customer) {
    editingCustomer.value = customer
    Object.assign(customerForm.value, {
      ...customer,
      tradeLicenseExpiry: customer.tradeLicenseExpiry ? format(customer.tradeLicenseExpiry, 'yyyy-MM-dd') : '',
      contractStartDate: customer.contractStartDate ? format(customer.contractStartDate, 'yyyy-MM-dd') : '',
      contractEndDate: customer.contractEndDate ? format(customer.contractEndDate, 'yyyy-MM-dd') : ''
    })
  } else {
    editingCustomer.value = null
    resetForm()
  }
  customerDialog.value = true
}

const closeCustomerDialog = () => {
  customerDialog.value = false
  editingCustomer.value = null
  resetForm()
}

const resetForm = () => {
  Object.assign(customerForm.value, {
    companyName: '',
    businessType: '',
    tradeLicenseNumber: '',
    tradeLicenseExpiry: '',
    contactPersonName: '',
    contactPersonPosition: '',
    email: '',
    phone: '',
    address: '',
    contractType: '',
    contractStatus: '',
    contractStartDate: '',
    contractEndDate: '',
    creditLimit: 0,
    paymentTerms: 30,
    vatNumber: '',
    vatStatus: 'not-registered',
    isQatarResident: true,
    requiresCompliance: true
  })
}

const saveCustomer = async () => {
  if (!formValid.value) return

  saving.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const customerData = {
      ...customerForm.value,
      tradeLicenseExpiry: new Date(customerForm.value.tradeLicenseExpiry),
      contractStartDate: customerForm.value.contractStartDate ? new Date(customerForm.value.contractStartDate) : undefined,
      contractEndDate: customerForm.value.contractEndDate ? new Date(customerForm.value.contractEndDate) : undefined,
      status: 'active',
      totalRevenue: 0,
      updatedAt: new Date()
    }

    if (editingCustomer.value) {
      // Update existing customer
      const index = customers.value.findIndex(c => c.id === editingCustomer.value!.id)
      if (index !== -1) {
        customers.value[index] = { ...customers.value[index], ...customerData }
      }
    } else {
      // Add new customer
      const newCustomer: Customer = {
        id: `CUST-${Date.now()}`,
        ...customerData,
        createdAt: new Date()
      } as Customer
      customers.value.push(newCustomer)
    }

    showSnackbar(
      `Customer ${editingCustomer.value ? 'updated' : 'created'} successfully`,
      'success'
    )
    closeCustomerDialog()
    updateStatistics()
  } catch (error) {
    showSnackbar('Error saving customer', 'error')
  } finally {
    saving.value = false
  }
}

const viewCustomer = (customer: Customer) => {
  // Navigate to customer detail view
  console.log('View customer:', customer)
}

const editCustomer = (customer: Customer) => {
  openCustomerDialog(customer)
}

const generateInvoice = (customer: Customer) => {
  // Navigate to invoice generation
  console.log('Generate invoice for:', customer)
}

const renewLicense = (customer: Customer) => {
  console.log('Renew license for:', customer)
}

const viewContracts = (customer: Customer) => {
  console.log('View contracts for:', customer)
}

const viewPaymentHistory = (customer: Customer) => {
  console.log('View payment history for:', customer)
}

const deleteCustomer = async (customer: Customer) => {
  if (confirm('Are you sure you want to delete this customer?')) {
    const index = customers.value.findIndex(c => c.id === customer.id)
    if (index !== -1) {
      customers.value.splice(index, 1)
      showSnackbar('Customer deleted successfully', 'success')
      updateStatistics()
    }
  }
}

const exportCustomers = () => {
  // Export functionality
  console.log('Export customers')
}

const updateStatistics = () => {
  statistics.value = {
    totalCustomers: customers.value.length,
    activeCustomers: customers.value.filter(c => c.status === 'active').length,
    expiringLicenses: customers.value.filter(c => {
      const daysUntilExpiry = differenceInDays(c.tradeLicenseExpiry, new Date())
      return daysUntilExpiry <= 90 && daysUntilExpiry > 0
    }).length,
    totalRevenue: customers.value.reduce((sum, c) => sum + c.totalRevenue, 0)
  }
}

const showSnackbar = (message: string, color: string = 'success') => {
  snackbar.value = { show: true, message, color }
}

const loadMockData = () => {
  customers.value = [
    {
      id: 'CUST-001',
      companyName: 'Qatar National Industries',
      businessType: 'Manufacturing',
      tradeLicenseNumber: 'TL-2024-001',
      tradeLicenseExpiry: new Date('2024-12-31'),
      contactPersonName: 'Ahmed Al-Thani',
      contactPersonPosition: 'General Manager',
      email: 'ahmed@qni.qa',
      phone: '+974 4444 1234',
      address: 'Industrial Area, Doha, Qatar',
      contractType: 'Annual Service Contract',
      contractStatus: 'Active',
      contractStartDate: new Date('2024-01-01'),
      contractEndDate: new Date('2024-12-31'),
      creditLimit: 100000,
      paymentTerms: 30,
      vatNumber: 'VAT-QA-123456789',
      vatStatus: 'registered',
      isQatarResident: true,
      requiresCompliance: true,
      status: 'active',
      totalRevenue: 250000,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    },
    {
      id: 'CUST-002',
      companyName: 'Doha Trading Company',
      businessType: 'Trading',
      tradeLicenseNumber: 'TL-2024-002',
      tradeLicenseExpiry: new Date('2024-11-15'),
      contactPersonName: 'Sarah Mohammed',
      contactPersonPosition: 'Operations Director',
      email: 'sarah@dohatrading.qa',
      phone: '+974 4444 5678',
      address: 'West Bay, Doha, Qatar',
      contractType: 'Project-Based Contract',
      contractStatus: 'Active',
      contractStartDate: new Date('2024-02-01'),
      contractEndDate: new Date('2024-11-30'),
      creditLimit: 75000,
      paymentTerms: 15,
      vatNumber: '',
      vatStatus: 'not-registered',
      isQatarResident: true,
      requiresCompliance: true,
      status: 'active',
      totalRevenue: 150000,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date()
    }
  ]
  updateStatistics()
}

onMounted(() => {
  loadMockData()
})
</script>

<style scoped>
.stat-card {
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.v-data-table {
  border-radius: 8px;
}

.v-card-title {
  background-color: rgb(var(--v-theme-surface-variant));
}
</style>
