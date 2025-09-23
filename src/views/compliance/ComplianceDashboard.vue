<template>
  <div class="compliance-dashboard">
    <v-container fluid>
      <!-- Header Section -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h4 font-weight-bold text-primary">Compliance Management</h1>
              <p class="text-body-1 text-grey-darken-1 ma-0">
                Monitor Qatar labor law compliance and document expiry tracking
              </p>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                color="warning"
                prepend-icon="mdi-alert"
                @click="generateComplianceReport"
              >
                Generate Report
              </v-btn>
              <v-btn
                variant="outlined"
                prepend-icon="mdi-refresh"
                @click="refreshData"
                :loading="loading"
              >
                Refresh
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- KPI cards removed (Critical Alerts, Expiring Soon, Total Documents) per request -->

      <!-- Main Content -->
      <v-row>
        <!-- Document Expiry Tracking -->
        <v-col cols="12" lg="8">
          <v-card elevation="2" class="mb-6">
            <v-card-title class="d-flex align-center justify-space-between">
              <span>Document Expiry Tracking</span>
              <v-btn-toggle v-model="viewMode" mandatory variant="outlined" density="compact">
                <v-btn value="critical" size="small">Critical</v-btn>
                <v-btn value="warning" size="small">Warning</v-btn>
                <v-btn value="all" size="small">All</v-btn>
              </v-btn-toggle>
            </v-card-title>

            <v-data-table
              :headers="documentHeaders"
              :items="filteredDocuments"
              :loading="loading"
              class="compliance-table"
              item-value="id"
              density="compact"
            >
              <!-- Employee Column -->
              <template #item.employee="{ item }">
                <div class="d-flex align-center py-2">
                  <v-avatar size="32" class="mr-2">
                    <v-icon color="grey-lighten-1">mdi-account</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-body-2 font-weight-medium">{{ item.employeeName }}</div>
                    <div class="text-caption text-grey-darken-1">{{ item.employeeId }}</div>
                  </div>
                </div>
              </template>

              <!-- Document Type Column -->
              <template #item.documentType="{ item }">
                <v-chip
                  :color="getDocumentTypeColor(item.documentType)"
                  size="small"
                  variant="flat"
                >
                  <v-icon start size="12">{{ getDocumentIcon(item.documentType) }}</v-icon>
                  {{ item.documentType }}
                </v-chip>
              </template>

              <!-- Document Number Column -->
              <template #item.documentNumber="{ item }">
                <div class="text-body-2 font-family-monospace">
                  {{ item.documentNumber }}
                </div>
              </template>

              <!-- Expiry Date Column -->
              <template #item.expiryDate="{ item }">
                <div>
                  <div class="text-body-2">{{ formatDate(item.expiryDate) }}</div>
                  <v-chip
                    :color="getExpiryUrgencyColor(item.expiryDate)"
                    size="x-small"
                    variant="flat"
                  >
                    {{ getDaysUntilExpiry(item.expiryDate) }} days
                  </v-chip>
                </div>
              </template>

              <!-- Status Column -->
              <template #item.status="{ item }">
                <v-chip
                  :color="getDocumentStatusColor(item.status)"
                  size="small"
                  variant="flat"
                >
                  <v-icon start size="12">{{ getDocumentStatusIcon(item.status) }}</v-icon>
                  {{ item.status }}
                </v-chip>
              </template>

              <!-- Actions Column -->
                            <template #item.actions="{ item }">
                <div class="d-flex gap-1">
                  <v-btn
                    icon="fa:fas fa-eye"
                    size="small"
                    variant="text"
                    color="primary"
                    class="action-btn"
                    @click="viewDocument(item)"
                    title="View Document"
                  />
                  <v-btn
                    icon="fa:fas fa-edit"
                    size="small"
                    variant="text"
                    color="primary"
                    class="action-btn"
                    @click="editDocument(item)"
                    title="Edit Document"
                  />
                  <v-btn
                    icon="fa:fas fa-bell"
                    size="small"
                    variant="text"
                    color="primary"
                    class="action-btn"
                    @click="setReminder(item)"
                    title="Set Reminder"
                  />
                  <v-btn
                    icon="mdi-refresh"
                    size="small"
                    variant="tonal"
                    color="info"
                    @click="renewDocument(item)"
                    title="Renew Document"
                  />
                </div>
              </template>
            </v-data-table>
          </v-card>

          <!-- Qatar Labor Law Compliance -->
          <v-card elevation="2">
            <v-card-title>Qatar Labor Law Compliance Checklist</v-card-title>
            <v-card-text>
              <v-expansion-panels variant="accordion">
                <v-expansion-panel
                  v-for="category in complianceCategories"
                  :key="category.title"
                  :title="category.title"
                >
                  <template #text>
                    <v-list density="compact">
                      <v-list-item
                        v-for="item in category.items"
                        :key="item.id"
                        @click="handleComplianceItem(item)"
                      >
                        <template #prepend>
                          <v-icon :color="item.compliant ? 'success' : 'error'">
                            {{ item.compliant ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                          </v-icon>
                        </template>
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                        <v-list-item-subtitle>{{ item.description }}</v-list-item-subtitle>
                        <template #append>
                          <v-chip
                            :color="item.compliant ? 'success' : 'error'"
                            size="small"
                            variant="flat"
                          >
                            {{ item.compliant ? 'Compliant' : 'Non-Compliant' }}
                          </v-chip>
                        </template>
                      </v-list-item>
                    </v-list>
                  </template>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Sidebar -->
        <v-col cols="12" lg="4">
          <!-- Urgent Actions -->
          <v-card class="mb-6" elevation="2">
            <v-card-title class="d-flex align-center justify-space-between">
              <span>Urgent Actions Required</span>
              <v-chip color="error" size="small">{{ urgentActions.length }}</v-chip>
            </v-card-title>
            <v-card-text>
              <v-list v-if="urgentActions.length > 0" density="compact">
                <v-list-item
                  v-for="action in urgentActions"
                  :key="action.id"
                  @click="handleUrgentAction(action)"
                  class="mb-2"
                >
                  <template #prepend>
                    <v-icon :color="action.priority" size="20">{{ action.icon }}</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">{{ action.title }}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    Due: {{ formatDate(action.dueDate) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <div v-else class="text-center py-4">
                <v-icon size="32" color="success" class="mb-2">mdi-check-circle</v-icon>
                <div class="text-body-2 text-grey-darken-1">No urgent actions</div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Compliance Trends -->
          <v-card class="mb-6" elevation="2">
            <v-card-title>Compliance Trends</v-card-title>
            <v-card-text>
              <div class="mb-4">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-body-2">This Month</span>
                  <v-chip color="success" size="small">96%</v-chip>
                </div>
                <v-progress-linear color="success" :model-value="96" height="8" />
              </div>
              <div class="mb-4">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-body-2">Last Month</span>
                  <v-chip color="warning" size="small">88%</v-chip>
                </div>
                <v-progress-linear color="warning" :model-value="88" height="8" />
              </div>
              <div class="mb-4">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-body-2">3 Months Ago</span>
                  <v-chip color="error" size="small">75%</v-chip>
                </div>
                <v-progress-linear color="error" :model-value="75" height="8" />
              </div>
              <v-btn
                color="primary"
                variant="outlined"
                block
                @click="viewDetailedTrends"
              >
                View Detailed Trends
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Quick Actions -->
          <v-card elevation="2">
            <v-card-title>Quick Actions</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item @click="bulkDocumentUpload">
                  <template #prepend>
                    <v-icon color="primary">mdi-upload</v-icon>
                  </template>
                  <v-list-item-title>Bulk Document Upload</v-list-item-title>
                </v-list-item>
                <v-list-item @click="scheduleComplianceAudit">
                  <template #prepend>
                    <v-icon color="warning">mdi-calendar-check</v-icon>
                  </template>
                  <v-list-item-title>Schedule Audit</v-list-item-title>
                </v-list-item>
                <v-list-item @click="generateComplianceCertificate">
                  <template #prepend>
                    <v-icon color="success">mdi-certificate</v-icon>
                  </template>
                  <v-list-item-title>Generate Certificate</v-list-item-title>
                </v-list-item>
                <v-list-item @click="exportComplianceData">
                  <template #prepend>
                    <v-icon color="info">mdi-download</v-icon>
                  </template>
                  <v-list-item-title>Export Data</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format, differenceInDays } from 'date-fns'

// State
const loading = ref(false)
const viewMode = ref('critical')

// Dialog states
const showDocumentDialog = ref(false)
const showEditDocumentDialog = ref(false)
const showReminderDialog = ref(false)
const showRenewalDialog = ref(false)
const selectedDocument = ref<any>(null)

// Mock data (top-level KPI metrics removed per request so underlying refs removed)

const documentHeaders = [
  { title: 'Employee', key: 'employee', sortable: true },
  { title: 'Document Type', key: 'documentType', sortable: true },
  { title: 'Document Number', key: 'documentNumber', sortable: true },
  { title: 'Expiry Date', key: 'expiryDate', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

const documents = ref([
  {
    id: 1,
    employeeId: 'NP001',
    employeeName: 'Ahmed Hassan Ali',
    documentType: 'Qatar ID',
    documentNumber: '28012345678',
    expiryDate: new Date('2025-12-15'),
    status: 'Valid',
    urgency: 'medium'
  },
  {
    id: 2,
    employeeId: 'NP001',
    employeeName: 'Ahmed Hassan Ali',
    documentType: 'Passport',
    documentNumber: 'A1234567',
    expiryDate: new Date('2026-08-20'),
    status: 'Valid',
    urgency: 'low'
  },
  {
    id: 3,
    employeeId: 'NP003',
    employeeName: 'Rajesh Kumar Singh',
    documentType: 'Qatar ID',
    documentNumber: '28054321098',
    expiryDate: new Date('2025-09-25'),
    status: 'Expiring Soon',
    urgency: 'critical'
  },
  {
    id: 4,
    employeeId: 'NP003',
    employeeName: 'Rajesh Kumar Singh',
    documentType: 'Passport',
    documentNumber: 'C5432109',
    expiryDate: new Date('2025-11-15'),
    status: 'Expiring Soon',
    urgency: 'high'
  }
])

const urgentActions = ref([
  {
    id: 1,
    title: 'Renew Qatar ID - Rajesh Kumar',
    dueDate: new Date('2025-09-20'),
    priority: 'error',
    icon: 'mdi-card-account-details'
  },
  {
    id: 2,
    title: 'Update work permit - 5 employees',
    dueDate: new Date('2025-09-30'),
    priority: 'warning',
    icon: 'mdi-briefcase'
  },
  {
    id: 3,
    title: 'Medical check-up due - 8 employees',
    dueDate: new Date('2025-10-15'),
    priority: 'warning',
    icon: 'mdi-medical-bag'
  }
])

const complianceCategories = ref([
  {
    title: 'Worker Documentation',
    items: [
      {
        id: 1,
        title: 'Valid Qatar ID for all employees',
        description: 'All workers must have valid Qatar ID',
        compliant: true
      },
      {
        id: 2,
        title: 'Work permit compliance',
        description: 'Valid work permits for all foreign workers',
        compliant: false
      },
      {
        id: 3,
        title: 'Medical fitness certificates',
        description: 'Current medical certificates for all employees',
        compliant: true
      }
    ]
  },
  {
    title: 'Wage & Hour Compliance',
    items: [
      {
        id: 4,
        title: 'Minimum wage compliance',
        description: 'All salaries meet Qatar minimum wage requirements',
        compliant: true
      },
      {
        id: 5,
        title: 'Working hours tracking',
        description: 'Proper tracking of working hours and overtime',
        compliant: false
      },
      {
        id: 6,
        title: 'End of service benefits',
        description: 'Proper calculation and provision of end service benefits',
        compliant: true
      }
    ]
  },
  {
    title: 'Health & Safety',
    items: [
      {
        id: 7,
        title: 'Safety training completion',
        description: 'All employees completed mandatory safety training',
        compliant: true
      },
      {
        id: 8,
        title: 'Personal protective equipment',
        description: 'PPE provided and maintained for all workers',
        compliant: false
      },
      {
        id: 9,
        title: 'Workplace safety inspections',
        description: 'Regular safety inspections conducted',
        compliant: true
      }
    ]
  }
])

// Computed
const filteredDocuments = computed(() => {
  let filtered = documents.value

  switch (viewMode.value) {
    case 'critical':
      filtered = filtered.filter(doc => doc.urgency === 'critical')
      break
    case 'warning':
      filtered = filtered.filter(doc => ['critical', 'high'].includes(doc.urgency))
      break
    case 'all':
    default:
      // Show all documents
      break
  }

  return filtered
})

// Methods
const getDaysUntilExpiry = (date: Date): number => {
  return Math.max(0, differenceInDays(date, new Date()))
}

const getExpiryUrgencyColor = (date: Date): string => {
  const days = getDaysUntilExpiry(date)
  if (days <= 30) return 'error'
  if (days <= 60) return 'warning'
  return 'success'
}

const getDocumentTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    'Qatar ID': 'primary',
    'Passport': 'info',
    'Work Permit': 'warning',
    'Medical Certificate': 'success',
    'Visa': 'purple'
  }
  return colors[type] || 'grey'
}

const getDocumentIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'Qatar ID': 'mdi-card-account-details',
    'Passport': 'mdi-passport',
    'Work Permit': 'mdi-briefcase',
    'Medical Certificate': 'mdi-medical-bag',
    'Visa': 'mdi-airplane'
  }
  return icons[type] || 'mdi-file-document'
}

const getDocumentStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Valid': 'success',
    'Expiring Soon': 'warning',
    'Expired': 'error',
    'Under Review': 'info'
  }
  return colors[status] || 'grey'
}

const getDocumentStatusIcon = (status: string): string => {
  const icons: Record<string, string> = {
    'Valid': 'mdi-check-circle',
    'Expiring Soon': 'mdi-clock-alert',
    'Expired': 'mdi-close-circle',
    'Under Review': 'mdi-clock'
  }
  return icons[status] || 'mdi-help-circle'
}

const formatDate = (date: Date): string => {
  return format(date, 'MMM dd, yyyy')
}

// Actions
const generateComplianceReport = () => {
  try {
    loading.value = true
    
    // Create comprehensive compliance report
    const reportContent = `
NIPON PAYROLL PRO - COMPLIANCE REPORT
Generated on: ${new Date().toLocaleDateString()}

COMPLIANCE OVERVIEW:
Top-level KPI metrics removed from dashboard (score, critical alerts, expiring counts).

DOCUMENT STATUS:
${documents.value.map(doc => 
  `- ${doc.employeeName} (${doc.documentType} ${doc.documentNumber}): ${doc.status} - Expires: ${doc.expiryDate.toLocaleDateString()}`
).join('\n')}

URGENT ACTIONS REQUIRED:
${urgentActions.value.map(action => 
  `- ${action.title}`
).join('\n')}
    `
    
    // Download the report
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `compliance_report_${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    
    alert('Compliance report generated successfully!')
  } catch (error) {
    console.error('Report generation failed:', error)
    alert('Failed to generate compliance report. Please try again.')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loading.value = true
  try {
    // Simulate data refresh (KPI metrics removed)
    setTimeout(() => {
      loading.value = false
      alert('Data refreshed successfully!')
    }, 1000)
  } catch (error) {
    console.error('Data refresh failed:', error)
    alert('Failed to refresh data. Please try again.')
    loading.value = false
  }
}

const viewDocument = (document: any) => {
  selectedDocument.value = document
  showDocumentDialog.value = true
  console.log('Viewing document:', document)
}

const editDocument = (document: any) => {
  selectedDocument.value = document
  showEditDocumentDialog.value = true
  console.log('Editing document:', document)
}

const setReminder = (document: any) => {
  selectedDocument.value = document
  showReminderDialog.value = true
  console.log('Setting reminder for:', document)
}

const renewDocument = (document: any) => {
  selectedDocument.value = document
  showRenewalDialog.value = true
  console.log('Renewing document:', document)
}

const handleComplianceItem = (item: any) => {
  if (confirm(`Take action on: ${item.title}?`)) {
    alert(`Action taken on ${item.title}. Status updated.`)
  }
}

const handleUrgentAction = (action: any) => {
  if (confirm(`Execute urgent action: ${action.title}?`)) {
    // Remove from urgent actions list
    const index = urgentActions.value.findIndex(a => a.id === action.id)
    if (index !== -1) {
      urgentActions.value.splice(index, 1)
  // criticalAlerts metric removed; no decrement necessary
    }
    alert(`${action.title} has been completed successfully!`)
  }
}

const viewDetailedTrends = () => {
  alert('Detailed compliance trends view would open here. This feature shows comprehensive analytics and historical compliance data.')
}

const bulkDocumentUpload = () => {
  alert('Bulk document upload dialog would open here. This feature allows uploading multiple compliance documents at once.')
}

const scheduleComplianceAudit = () => {
  const auditDate = prompt('Enter audit date (YYYY-MM-DD):')
  if (auditDate) {
    alert(`Compliance audit scheduled for ${auditDate}. Notification sent to relevant teams.`)
  }
}

const generateComplianceCertificate = () => {
  try {
    const certificateContent = `
COMPLIANCE CERTIFICATE

This certifies that NIPON PAYROLL PRO
has removed dashboard compliance score metric
as of ${new Date().toLocaleDateString()}

All critical compliance requirements have been met.
Valid until: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}

Issued by: Compliance Management System
Certificate ID: COMP-${Date.now()}
    `
    
    const blob = new Blob([certificateContent], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `compliance_certificate_${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    
    alert('Compliance certificate generated successfully!')
  } catch (error) {
    console.error('Certificate generation failed:', error)
    alert('Failed to generate compliance certificate. Please try again.')
  }
}

const exportComplianceData = () => {
  try {
    // Create CSV content for compliance data
    const headers = ['Document', 'Type', 'Status', 'Employee', 'Expiry Date', 'Days Until Expiry']
    const csvContent = [
      headers.join(','),
      ...documents.value.map(doc => [
        `"${doc.employeeName}"`,
        doc.documentType,
        doc.status,
        doc.employeeId,
        doc.expiryDate.toLocaleDateString(),
        getDaysUntilExpiry(doc.expiryDate)
      ].join(','))
    ].join('\n')

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `compliance_data_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    alert('Compliance data exported successfully!')
  } catch (error) {
    console.error('Export failed:', error)
    alert('Failed to export compliance data. Please try again.')
  }
}

onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.compliance-dashboard {
  background-color: #fafafa;
  min-height: 100vh;
}

.compliance-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(25, 118, 210, 0.04);
}

.compliance-table :deep(.v-data-table-header) {
  background-color: #f5f5f5;
}

/* Progress indicators */
.v-progress-linear {
  border-radius: 2px;
}

/* Card hover effects */
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Expansion panels styling */
.v-expansion-panels :deep(.v-expansion-panel-title) {
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .compliance-table :deep(.v-data-table) {
    font-size: 0.875rem;
  }
}
</style>
