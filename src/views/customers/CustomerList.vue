<template>
  <v-container fluid class="pa-4">
    <!-- Header Section -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center flex-wrap">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Customer Management</h1>
            <p class="text-body-1 text-medium-emphasis">
              Manage B2B customers with Qatar compliance tracking
            </p>
          </div>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-plus"
            @click="addCustomer"
            elevation="2"
          >
            Add Customer
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Search Filters - Redesigned -->
    <div class="custom-filter-section mb-6">
      <div class="filter-header">
        <h3 class="filter-title">
          <v-icon class="filter-icon">mdi-filter-variant</v-icon>
          Search & Filter
        </h3>
      </div>
      <div class="filter-content">
        <div class="filter-row">
          <div class="filter-item">
            <label class="filter-label">Search Customers</label>
            <div class="custom-input-wrapper">
              <v-icon class="input-icon">mdi-magnify</v-icon>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search by company, email, contact..."
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
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
              <v-icon class="select-icon">mdi-chevron-down</v-icon>
            </div>
          </div>
          
          <div class="filter-item">
            <label class="filter-label">Business Type</label>
            <div class="custom-select-wrapper">
              <select v-model="selectedBusinessType" class="custom-select">
                <option value="">All Types</option>
                <option value="Construction">Construction</option>
                <option value="Technology">Technology</option>
                <option value="Trading">Trading</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Services">Services</option>
              </select>
              <v-icon class="select-icon">mdi-chevron-down</v-icon>
            </div>
          </div>
          
          <div class="filter-item">
            <label class="filter-label">Actions</label>
            <button class="custom-reset-btn" @click="resetFilters">
              <v-icon class="btn-icon">mdi-refresh</v-icon>
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Data Table -->
    <v-card variant="outlined">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-2" style="color: #8B1538;">mdi-account-group</v-icon>
        <span class="text-h6 font-weight-bold" style="color: #8B1538;">Customer Directory</span>
        <v-spacer />
        <v-chip color="primary" variant="tonal" size="small">
          {{ filteredCustomers.length }} customers
        </v-chip>
      </v-card-title>
      <v-divider />

      <v-data-table
        :headers="headers"
        :items="filteredCustomers"
        item-value="id"
        class="elevation-0"
        density="comfortable"
        :items-per-page="25"
      >
        <!-- Company Name -->
        <template v-slot:item.company="{ item }">
          <div class="d-flex align-center cursor-pointer" @click="viewCustomer(item)">
            <v-avatar color="primary" size="40" class="mr-3">
              <span class="text-white font-weight-bold">{{ getInitials(item.companyName) }}</span>
            </v-avatar>
            <div>
              <div class="text-body-2 font-weight-medium">{{ item.companyName }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.businessType }}</div>
            </div>
          </div>
        </template>

        <!-- Contact Info -->
        <template v-slot:item.contact="{ item }">
          <div>
            <div class="text-body-2">{{ item.email }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.phone }}</div>
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
              @click="viewCustomer(item)"
              title="View Customer"
            />
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              color="primary"
              @click="editCustomer(item)"
              title="Edit Customer"
            />
            <v-btn
              icon="mdi-file-document"
              variant="text"
              size="small"
              color="primary"
              @click="viewContracts(item)"
              title="View Contracts"
            />
            <v-btn
              icon="mdi-file-invoice-outline"
              variant="text"
              size="small"
              color="primary"
              @click="openInvoiceDialog(item)"
              title="Create Invoice"
            />
            <v-btn
              icon="mdi-cash-plus"
              variant="text"
              size="small"
              color="primary"
              @click="openPaymentDialog(item)"
              title="Record Payment"
            />
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="openDeleteDialog(item)"
              title="Delete Customer"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- View Dialog -->
    <v-dialog v-model="showViewDialog" max-width="640">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-domain</v-icon>
          <span class="font-weight-bold">Customer Details</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="showViewDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text v-if="selectedCustomer">
          <v-row dense>
            <v-col cols="12" md="6"><strong>Company:</strong> {{ selectedCustomer.companyName }}</v-col>
            <v-col cols="12" md="6"><strong>Business Type:</strong> {{ selectedCustomer.businessType }}</v-col>
            <v-col cols="12" md="6"><strong>Email:</strong> {{ selectedCustomer.email }}</v-col>
            <v-col cols="12" md="6"><strong>Phone:</strong> {{ selectedCustomer.phone }}</v-col>
            <v-col cols="12" md="6"><strong>Contact Person:</strong> {{ selectedCustomer.contactPerson }}</v-col>
            <v-col cols="12" md="6"><strong>Status:</strong> {{ selectedCustomer.status }}</v-col>
            <v-col cols="12" md="6"><strong>Trade Lic #:</strong> {{ selectedCustomer.tradeLicenseNumber }}</v-col>
            <v-col cols="12" md="6"><strong>License Expiry:</strong> {{ selectedCustomer.tradeLicenseExpiry }}</v-col>
            <v-col cols="12"><strong>Address:</strong> {{ selectedCustomer.address }}</v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
            <v-btn variant="text" color="primary" @click="showViewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Dialog -->
    <v-dialog v-model="showEditDialog" max-width="680">
      <v-card :loading="savingEdit">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-pencil</v-icon>
          <span class="font-weight-bold">Edit Customer</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="closeEdit" />
        </v-card-title>
        <v-divider />
        <v-form ref="editFormRef" @submit.prevent="saveEdit">
          <v-card-text v-if="editDraft">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field v-model="editDraft.companyName" label="Company Name" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="editDraft.businessType" :items="businessTypes" label="Business Type" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editDraft.email" label="Email" density="comfortable" type="email" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editDraft.phone" label="Phone" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editDraft.contactPerson" label="Contact Person" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="editDraft.status" :items="statusOptions" label="Status" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editDraft.tradeLicenseNumber" label="Trade License #" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="editDraft.tradeLicenseExpiry" label="License Expiry" density="comfortable" type="date" />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="editDraft.address" label="Address" rows="2" auto-grow density="comfortable" />
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

    <!-- New Invoice Dialog -->
    <v-dialog v-model="showInvoiceDialog" max-width="700">
      <v-card :loading="submittingInvoice">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-file-invoice-outline</v-icon>
          <span class="font-weight-bold">Create Invoice</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="closeInvoiceDialog" />
        </v-card-title>
        <v-divider />
        <v-form ref="invoiceFormRef" @submit.prevent="submitInvoice">
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field v-model="invoiceDraft.date" label="Invoice Date" type="date" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="invoiceDraft.dueDate" label="Due Date" type="date" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="invoiceDraft.amount" label="Amount (QAR)" type="number" min="0" density="comfortable" :rules="[rPositive]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="invoiceDraft.status" :items="invoiceStatusOptions" label="Status" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="invoiceDraft.description" label="Description" rows="2" auto-grow density="comfortable" />
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="closeInvoiceDialog">Cancel</v-btn>
            <v-btn color="primary" type="submit" :loading="submittingInvoice">Create</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Record Payment Dialog -->
    <v-dialog v-model="showPaymentDialog" max-width="600">
      <v-card :loading="submittingPayment">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-cash-plus</v-icon>
          <span class="font-weight-bold">Record Payment</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="closePaymentDialog" />
        </v-card-title>
        <v-divider />
        <v-form ref="paymentFormRef" @submit.prevent="submitPayment">
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field v-model="paymentDraft.date" label="Payment Date" type="date" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="paymentDraft.amount" label="Amount (QAR)" type="number" min="0" density="comfortable" :rules="[rPositive]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="paymentDraft.method" :items="paymentMethods" label="Method" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="paymentDraft.reference" label="Reference" density="comfortable" />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="paymentDraft.notes" label="Notes" rows="2" auto-grow density="comfortable" />
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="closePaymentDialog">Cancel</v-btn>
            <v-btn color="primary" type="submit" :loading="submittingPayment">Record</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="480">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="error">mdi-alert</v-icon>
          <span class="font-weight-bold">Delete Customer</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="showDeleteDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <p class="mb-2">Are you sure you want to delete <strong>{{ selectedCustomer?.companyName }}</strong>? This action cannot be undone.</p>
          <p class="text-caption text-medium-emphasis">(Logical delete placeholder — actual API integration pending)</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAccountsStore } from '@/stores/accounts'
import { useRouter } from 'vue-router'

const router = useRouter()
const accountsStore = useAccountsStore()

// Filter state
const searchQuery = ref('')
const selectedStatus = ref(null)
const selectedBusinessType = ref(null)

// Sample data
const customers = ref([
  {
    id: 1,
    companyName: 'Al Rayyan Construction LLC',
    businessType: 'Construction',
    email: 'info@alrayyan.qa',
    phone: '+974 4444 5555',
    address: 'Doha, Qatar',
    contactPerson: 'Ahmed Al Kuwari',
    tradeLicenseNumber: 'TL-2024-001',
    tradeLicenseExpiry: '2025-06-15',
    contractStatus: 'Active',
    status: 'Active',
    totalRevenue: 850000
  },
  {
    id: 2,
    companyName: 'Qatar Tech Solutions WLL',
    businessType: 'Technology',
    email: 'contact@qatartech.qa',
    phone: '+974 4444 6666',
    address: 'West Bay, Doha',
    contactPerson: 'Sarah Mohammed',
    tradeLicenseNumber: 'TL-2024-002',
    tradeLicenseExpiry: '2024-12-20',
    contractStatus: 'Active',
    status: 'Active',
    totalRevenue: 1200000
  },
  {
    id: 3,
    companyName: 'Pearl Trading Company',
    businessType: 'Trading',
    email: 'admin@pearltrading.qa',
    phone: '+974 4444 7777',
    address: 'Industrial Area, Doha',
    contactPerson: 'Mohamed Hassan',
    tradeLicenseNumber: 'TL-2024-003',
    tradeLicenseExpiry: '2024-03-10',
    contractStatus: 'Expired',
    status: 'Inactive',
    totalRevenue: 450000
  }
])

// Table headers
const headers = [
  { title: 'Company', key: 'company', sortable: false },
  { title: 'Contact', key: 'contact', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Computed properties
const filteredCustomers = computed(() => {
  let filtered = customers.value

  if (searchQuery.value) {
    filtered = filtered.filter(customer => 
      customer.companyName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.contactPerson.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.businessType.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(customer => customer.status === selectedStatus.value)
  }

  if (selectedBusinessType.value) {
    filtered = filtered.filter(customer => customer.businessType === selectedBusinessType.value)
  }

  return filtered
})

// Methods
const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Active': 'success',
    'Inactive': 'error',
    'Pending': 'warning',
    'Suspended': 'error'
  }
  return colors[status] || 'grey'
}

const addCustomer = () => {
  router.push('/customers/create')
}

// (Original navigation handlers replaced by modal versions below)

const viewContracts = (customer: any) => {
  router.push(`/customers/contracts?customer=${customer.id}`)
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = null
  selectedBusinessType.value = null
}

// ----------------- Action Buttons & Modal Logic -----------------
const selectedCustomer = ref<any | null>(null)

// View
const showViewDialog = ref(false)
const viewCustomer = (customer: any) => {
  selectedCustomer.value = customer
  showViewDialog.value = true
}

// Edit
const showEditDialog = ref(false)
const savingEdit = ref(false)
const editDraft = ref<any | null>(null)
const editFormRef = ref()
const rRequired = (v: any) => (!!v || v === 0) || 'Required'
const rPositive = (v: number) => (v > 0) || 'Must be > 0'
const statusOptions = ['Active','Inactive','Pending','Suspended']
const businessTypes = ['Construction','Technology','Trading','Manufacturing','Services']
const editCustomer = (customer: any) => {
  editDraft.value = { ...customer }
  selectedCustomer.value = customer
  showEditDialog.value = true
}
const saveEdit = async () => {
  if (!editDraft.value) return
  savingEdit.value = true
  try {
    const idx = customers.value.findIndex(c => c.id === editDraft.value.id)
    if (idx !== -1) customers.value[idx] = { ...customers.value[idx], ...editDraft.value }
    showEditDialog.value = false
  } finally {
    savingEdit.value = false
  }
}
const closeEdit = () => { showEditDialog.value = false; editDraft.value = null }

// Invoice
const showInvoiceDialog = ref(false)
const submittingInvoice = ref(false)
const invoiceFormRef = ref()
const invoiceStatusOptions = ['Draft','Issued','Paid','Cancelled']
const invoiceDraft = ref({ date: new Date().toISOString().slice(0,10), dueDate: new Date(Date.now()+7*86400000).toISOString().slice(0,10), amount: 0, status: 'Draft', description: '', customerId: null as number | null })
const openInvoiceDialog = (customer: any) => {
  selectedCustomer.value = customer
  invoiceDraft.value = { date: new Date().toISOString().slice(0,10), dueDate: new Date(Date.now()+7*86400000).toISOString().slice(0,10), amount: 0, status: 'Draft', description: '', customerId: customer.id }
  showInvoiceDialog.value = true
}
const submitInvoice = async () => {
  submittingInvoice.value = true
  try {
    // Stage AR invoice event (future posting batch)
    if (invoiceDraft.value.customerId !== null) {
      accountsStore.registerCustomerEvent({
        type: 'invoice',
        amount: invoiceDraft.value.amount,
        date: invoiceDraft.value.date,
        customerId: String(invoiceDraft.value.customerId),
        description: invoiceDraft.value.description || `Invoice for customer ${invoiceDraft.value.customerId}`
      } as any)
    }
    console.log('Invoice created (placeholder):', invoiceDraft.value)
    showInvoiceDialog.value = false
  } finally {
    submittingInvoice.value = false
  }
}
const closeInvoiceDialog = () => { showInvoiceDialog.value = false }

// Payment
const showPaymentDialog = ref(false)
const submittingPayment = ref(false)
const paymentFormRef = ref()
const paymentMethods = ['Bank Transfer','Cash','Cheque','Card']
const paymentDraft = ref({ date: new Date().toISOString().slice(0,10), amount: 0, method: 'Bank Transfer', reference: '', notes: '', customerId: null as number | null })
const openPaymentDialog = (customer: any) => {
  selectedCustomer.value = customer
  paymentDraft.value = { date: new Date().toISOString().slice(0,10), amount: 0, method: 'Bank Transfer', reference: '', notes: '', customerId: customer.id }
  showPaymentDialog.value = true
}
const submitPayment = async () => {
  submittingPayment.value = true
  try {
    // Stage AR receipt event
    if (paymentDraft.value.customerId !== null) {
      accountsStore.registerCustomerEvent({
        type: 'receipt',
        amount: paymentDraft.value.amount,
        date: paymentDraft.value.date,
        customerId: String(paymentDraft.value.customerId),
        description: paymentDraft.value.notes || `Payment from customer ${paymentDraft.value.customerId}`
      } as any)
    }
    console.log('Payment recorded (placeholder):', paymentDraft.value)
    showPaymentDialog.value = false
  } finally {
    submittingPayment.value = false
  }
}
const closePaymentDialog = () => { showPaymentDialog.value = false }

// Delete
const showDeleteDialog = ref(false)
const openDeleteDialog = (customer: any) => { selectedCustomer.value = customer; showDeleteDialog.value = true }
const confirmDelete = () => {
  if (selectedCustomer.value) {
    customers.value = customers.value.filter(c => c.id !== selectedCustomer.value!.id)
  }
  showDeleteDialog.value = false
  selectedCustomer.value = null
}

</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  color: #2c3e50;
  font-weight: 600;
  margin: 0;
}

.add-btn {
  background: linear-gradient(135deg, #8B1538 0%, #6B0F2A 100%);
  color: white;
  font-weight: 600;
  text-transform: none;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(139, 21, 56, 0.3);
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: linear-gradient(135deg, #6B0F2A 0%, #5A0C23 100%);
  box-shadow: 0 6px 16px rgba(139, 21, 56, 0.4);
  transform: translateY(-2px);
}

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
  grid-template-columns: 2fr 1fr 1fr auto;
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

/* Custom Reset Button */
.custom-reset-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
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
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}

/* Table Styles */
.customers-table :deep(.v-table__wrapper) {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.customers-table :deep(.v-data-table-header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.customers-table :deep(.v-data-table-header th) {
  color: #374151 !important;
  font-weight: 600 !important;
  font-size: 14px !important;
}

.customers-table :deep(.v-data-table__td) {
  padding: 16px !important;
  border-bottom: 1px solid #f3f4f6 !important;
}

.customers-table :deep(.v-data-table__tr:hover) {
  background: #f8f9fa !important;
}

/* Status Chips */
.status-chip {
  padding: 6px 12px !important;
  border-radius: 20px !important;
  font-weight: 600 !important;
  font-size: 12px !important;
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

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: rgba(139, 21, 56, 0.04);
}
</style>
