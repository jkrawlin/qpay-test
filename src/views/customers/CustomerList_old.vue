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

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" variant="elevated" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="48" class="mr-4">
              <v-icon color="white">mdi-account-group</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ customers.length }}</div>
              <div class="text-body-2 text-medium-emphasis">Total Customers</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" variant="elevated" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="success" size="48" class="mr-4">
              <v-icon color="white">mdi-handshake</v-icon>
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
            <v-avatar color="warning" size="48" class="mr-4">
              <v-icon color="white">mdi-clock-alert</v-icon>
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
            <v-avatar color="info" size="48" class="mr-4">
              <v-icon color="white">mdi-cash-multiple</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ formatCurrency(totalRevenue) }}</div>
              <div class="text-body-2 text-medium-emphasis">Total Revenue</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Customer Data Table -->
    <v-card variant="outlined">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-2" color="primary">mdi-account-group</v-icon>
        <span class="text-h6 font-weight-bold">Customer Directory</span>
        <v-spacer />
        <v-chip color="primary" variant="tonal" size="small">
          {{ customers.length }} customers
        </v-chip>
      </v-card-title>
      <v-divider />

      <v-data-table
        :headers="headers"
        :items="customers"
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
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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
const activeContracts = computed(() => 
  customers.value.filter(customer => customer.contractStatus === 'Active').length
)

const expiringContracts = computed(() => 
  customers.value.filter(customer => {
    const expiryDate = new Date(customer.tradeLicenseExpiry)
    const today = new Date()
    const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    return diffDays <= 30 && diffDays > 0
  }).length
)

const totalRevenue = computed(() => 
  customers.value.reduce((total, customer) => total + customer.totalRevenue, 0)
)

// Methods
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: 'QAR'
  }).format(amount)
}

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

const viewCustomer = (customer: any) => {
  router.push(`/customers/${customer.id}`)
}

const editCustomer = (customer: any) => {
  router.push(`/customers/${customer.id}`)
}

const viewContracts = (customer: any) => {
  router.push(`/customers/contracts?customer=${customer.id}`)
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: rgba(139, 21, 56, 0.04);
}
</style>
