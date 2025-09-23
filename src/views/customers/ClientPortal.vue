<template>
  <v-container fluid class="pa-4">
    <!-- Header Section -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center flex-wrap">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Client Portal</h1>
            <p class="text-body-1 text-medium-emphasis">
              Self-service portal for customer access to documents, payments, and contracts
            </p>
          </div>
          <div class="d-flex gap-2">
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-account-plus"
              @click="inviteClient"
            >
              Invite Client
            </v-btn>
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-cog"
              @click="managePortal"
              elevation="2"
            >
              Manage Portal
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Portal Access Statistics -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" variant="elevated" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="48" class="mr-4">
              <v-icon color="white">mdi-account-group</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ activeClients }}</div>
              <div class="text-body-2 text-medium-emphasis">Active Clients</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" variant="elevated" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="success" size="48" class="mr-4">
              <v-icon color="white">mdi-login</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ todayLogins }}</div>
              <div class="text-body-2 text-medium-emphasis">Today's Logins</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" variant="elevated" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="info" size="48" class="mr-4">
              <v-icon color="white">mdi-file-download</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ documentsDownloaded }}</div>
              <div class="text-body-2 text-medium-emphasis">Documents Downloaded</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" variant="elevated" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="warning" size="48" class="mr-4">
              <v-icon color="white">mdi-email-alert</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ pendingInvites }}</div>
              <div class="text-body-2 text-medium-emphasis">Pending Invites</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Client Access Management -->
    <v-row>
      <!-- Client List -->
      <v-col cols="12" lg="8">
        <v-card variant="outlined">
          <v-card-title class="d-flex align-center pa-4">
            <v-icon class="mr-2" color="primary">mdi-account-multiple</v-icon>
            <span class="text-h6 font-weight-bold">Client Portal Access</span>
            <v-spacer />
            <v-chip color="primary" variant="tonal" size="small">
              {{ clientAccess.length }} clients
            </v-chip>
          </v-card-title>
          <v-divider />

          <!-- Search and Filter -->
          <v-card-text class="pb-2">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="searchQuery"
                  label="Search clients..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedStatus"
                  :items="statusOptions"
                  label="Access Status"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-btn
                  color="primary"
                  variant="outlined"
                  @click="resetFilters"
                  block
                >
                  Reset
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>

          <v-data-table
            :headers="clientHeaders"
            :items="filteredClients"
            item-value="id"
            class="elevation-0"
            density="comfortable"
          >
            <!-- Client Info -->
            <template v-slot:item.client="{ item }">
              <div class="d-flex align-center">
                <v-avatar color="primary" size="40" class="mr-3">
                  <span class="text-white font-weight-bold">{{ getInitials(item.companyName) }}</span>
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-medium">{{ item.companyName }}</div>
                  <div class="text-caption text-medium-emphasis">{{ item.contactPerson }}</div>
                </div>
              </div>
            </template>

            <!-- Access Status -->
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getAccessStatusColor(item.accessStatus)"
                variant="tonal"
                size="small"
              >
                {{ item.accessStatus }}
              </v-chip>
            </template>

            <!-- Last Login -->
            <template v-slot:item.lastLogin="{ item }">
              <div v-if="item.lastLogin">
                <div class="text-body-2">{{ formatDate(item.lastLogin) }}</div>
                <div class="text-caption text-medium-emphasis">{{ getTimeAgo(item.lastLogin) }}</div>
              </div>
              <div v-else class="text-caption text-medium-emphasis">Never</div>
            </template>

            <!-- Actions -->
            <template v-slot:item.actions="{ item }">
              <div class="d-flex gap-1">
                <v-btn
                  v-if="item.accessStatus === 'Pending'"
                  icon="mdi-email-send"
                  variant="text"
                  size="small"
                  color="primary"
                  @click="resendInvite(item)"
                  title="Resend Invite"
                />
                <v-btn
                  v-if="item.accessStatus === 'Active'"
                  icon="mdi-account-off"
                  variant="text"
                  size="small"
                  color="warning"
                  @click="suspendAccess(item)"
                  title="Suspend Access"
                />
                <v-btn
                  v-if="item.accessStatus === 'Suspended'"
                  icon="mdi-account-check"
                  variant="text"
                  size="small"
                  color="success"
                  @click="reactivateAccess(item)"
                  title="Reactivate Access"
                />
                <v-btn
                  icon="mdi-cog"
                  variant="text"
                  size="small"
                  color="primary"
                  @click="manageClientAccess(item)"
                  title="Manage Access"
                />
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- Portal Features -->
      <v-col cols="12" lg="4">
        <v-card class="mb-4" variant="outlined">
          <v-card-title class="bg-primary text-white">
            <v-icon class="mr-2">mdi-feature-search</v-icon>
            Portal Features
          </v-card-title>
          <v-card-text class="pa-0">
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="success">mdi-file-document</v-icon>
                </template>
                <v-list-item-title>Document Access</v-list-item-title>
                <v-list-item-subtitle>Invoices, contracts, reports</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="info">mdi-credit-card</v-icon>
                </template>
                <v-list-item-title>Payment History</v-list-item-title>
                <v-list-item-subtitle>View payment records</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="warning">mdi-handshake</v-icon>
                </template>
                <v-list-item-title>Contract Viewing</v-list-item-title>
                <v-list-item-subtitle>Active contracts and terms</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-message</v-icon>
                </template>
                <v-list-item-title>Communication</v-list-item-title>
                <v-list-item-subtitle>Direct messaging support</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Recent Activity -->
        <v-card variant="outlined">
          <v-card-title class="bg-primary text-white">
            <v-icon class="mr-2">mdi-clock</v-icon>
            Recent Activity
          </v-card-title>
          <v-card-text class="pa-0">
            <v-list density="compact">
              <v-list-item
                v-for="activity in recentActivity"
                :key="activity.id"
              >
                <template v-slot:prepend>
                  <v-avatar :color="activity.color" size="32">
                    <v-icon :icon="activity.icon" color="white" size="16"></v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-2">{{ activity.action }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ activity.client }} • {{ getTimeAgo(activity.timestamp) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Client Access Setup Dialog -->
    <v-dialog v-model="showAccessDialog" max-width="600px">
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon class="mr-2">mdi-account-cog</v-icon>
          Manage Client Access
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" color="white" @click="showAccessDialog = false" />
        </v-card-title>

        <v-card-text class="pa-6">
          <v-form v-if="selectedClient" ref="accessFormRef">
            <h3 class="mb-4">{{ selectedClient.companyName }}</h3>
            
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="selectedClient.portalEmail"
                  label="Portal Access Email"
                  variant="outlined"
                  prepend-inner-icon="mdi-email"
                />
              </v-col>
              <v-col cols="12">
                <h4 class="mb-2">Access Permissions</h4>
                <v-checkbox
                  v-model="selectedClient.permissions.viewDocuments"
                  label="View Documents (Invoices, Contracts)"
                  color="primary"
                />
                <v-checkbox
                  v-model="selectedClient.permissions.viewPayments"
                  label="View Payment History"
                  color="primary"
                />
                <v-checkbox
                  v-model="selectedClient.permissions.downloadDocuments"
                  label="Download Documents"
                  color="primary"
                />
                <v-checkbox
                  v-model="selectedClient.permissions.messaging"
                  label="Direct Messaging"
                  color="primary"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="outlined" @click="showAccessDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveAccessSettings">Save Settings</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// State
const searchQuery = ref('')
const selectedStatus = ref(null)
const showAccessDialog = ref(false)
const selectedClient = ref<any>(null)
const accessFormRef = ref()

// Sample data
const clientAccess = ref([
  {
    id: 1,
    companyName: 'Al Rayyan Construction LLC',
    contactPerson: 'Ahmed Al Kuwari',
    email: 'ahmed@alrayyan.qa',
    portalEmail: 'portal@alrayyan.qa',
    accessStatus: 'Active',
    lastLogin: '2024-01-15T10:30:00',
    permissions: {
      viewDocuments: true,
      viewPayments: true,
      downloadDocuments: true,
      messaging: true
    }
  },
  {
    id: 2,
    companyName: 'Qatar Tech Solutions WLL',
    contactPerson: 'Sarah Mohammed',
    email: 'sarah@qatartech.qa',
    portalEmail: 'portal@qatartech.qa',
    accessStatus: 'Active',
    lastLogin: '2024-01-14T15:45:00',
    permissions: {
      viewDocuments: true,
      viewPayments: true,
      downloadDocuments: false,
      messaging: true
    }
  },
  {
    id: 3,
    companyName: 'Pearl Trading Company',
    contactPerson: 'Mohamed Hassan',
    email: 'mohamed@pearltrading.qa',
    portalEmail: '',
    accessStatus: 'Pending',
    lastLogin: null,
    permissions: {
      viewDocuments: false,
      viewPayments: false,
      downloadDocuments: false,
      messaging: false
    }
  }
])

const recentActivity = ref([
  {
    id: 1,
    action: 'Downloaded invoice INV-2024-001',
    client: 'Al Rayyan Construction',
    timestamp: '2024-01-15T10:30:00',
    icon: 'mdi-download',
    color: 'success'
  },
  {
    id: 2,
    action: 'Viewed payment history',
    client: 'Qatar Tech Solutions',
    timestamp: '2024-01-14T15:45:00',
    icon: 'mdi-eye',
    color: 'info'
  },
  {
    id: 3,
    action: 'Portal access granted',
    client: 'Al Rayyan Construction',
    timestamp: '2024-01-13T09:15:00',
    icon: 'mdi-account-check',
    color: 'primary'
  }
])

// Table headers
const clientHeaders = [
  { title: 'Client', key: 'client', sortable: false },
  { title: 'Access Status', key: 'status', sortable: true },
  { title: 'Last Login', key: 'lastLogin', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Filter options
const statusOptions = ['Active', 'Pending', 'Suspended', 'Inactive']

// Computed properties
const filteredClients = computed(() => {
  let filtered = clientAccess.value

  if (searchQuery.value) {
    filtered = filtered.filter(client => 
      client.companyName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(client => client.accessStatus === selectedStatus.value)
  }

  return filtered
})

const activeClients = computed(() => 
  clientAccess.value.filter(client => client.accessStatus === 'Active').length
)

const todayLogins = computed(() => {
  const today = new Date().toDateString()
  return clientAccess.value.filter(client => 
    client.lastLogin && new Date(client.lastLogin).toDateString() === today
  ).length
})

const documentsDownloaded = computed(() => 145) // Sample number

const pendingInvites = computed(() => 
  clientAccess.value.filter(client => client.accessStatus === 'Pending').length
)

// Methods
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB')
}

const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return 'Just now'
}

const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getAccessStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Active': 'success',
    'Pending': 'warning',
    'Suspended': 'error',
    'Inactive': 'grey'
  }
  return colors[status] || 'grey'
}

const inviteClient = () => {
  alert('Client invitation functionality will be implemented')
}

const managePortal = () => {
  alert('Portal management functionality will be implemented')
}

const resendInvite = (client: any) => {
  alert(`Resending invite to ${client.companyName}`)
}

const suspendAccess = (client: any) => {
  if (confirm(`Suspend portal access for ${client.companyName}?`)) {
    client.accessStatus = 'Suspended'
  }
}

const reactivateAccess = (client: any) => {
  client.accessStatus = 'Active'
  alert(`Portal access reactivated for ${client.companyName}`)
}

const manageClientAccess = (client: any) => {
  selectedClient.value = { ...client }
  showAccessDialog.value = true
}

const saveAccessSettings = () => {
  if (selectedClient.value) {
    const index = clientAccess.value.findIndex(c => c.id === selectedClient.value.id)
    if (index !== -1) {
      clientAccess.value[index] = { ...selectedClient.value }
    }
    showAccessDialog.value = false
    alert('Access settings saved successfully')
  }
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = null
}
</script>

<style scoped>
.v-list-item {
  min-height: 48px;
}
</style>
