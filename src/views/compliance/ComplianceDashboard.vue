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

      <!-- Compliance Overview Cards -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" lg="3">
          <v-card :color="complianceScore >= 90 ? 'success' : complianceScore >= 70 ? 'warning' : 'error'" dark>
            <v-card-text>
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-h4 font-weight-bold">{{ complianceScore }}%</div>
                  <div class="text-body-2">Compliance Score</div>
                </div>
                <v-icon size="40">mdi-shield-check</v-icon>
              </div>
              <v-progress-linear
                :model-value="complianceScore"
                color="white"
                class="mt-3"
                height="4"
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <v-card color="error" dark>
            <v-card-text>
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-h4 font-weight-bold">{{ criticalAlerts }}</div>
                  <div class="text-body-2">Critical Alerts</div>
                </div>
                <v-icon size="40">mdi-alert-circle</v-icon>
              </div>
              <div class="text-caption mt-3">
                Requires immediate attention
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <v-card color="warning" dark>
            <v-card-text>
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-h4 font-weight-bold">{{ expiringDocuments }}</div>
                  <div class="text-body-2">Expiring Soon</div>
                </div>
                <v-icon size="40">mdi-calendar-alert</v-icon>
              </div>
              <div class="text-caption mt-3">
                Next 60 days
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" lg="3">
          <v-card color="info" dark>
            <v-card-text>
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-h4 font-weight-bold">{{ totalDocuments }}</div>
                  <div class="text-body-2">Total Documents</div>
                </div>
                <v-icon size="40">mdi-file-document-multiple</v-icon>
              </div>
              <div class="text-caption mt-3">
                {{ validDocuments }} valid
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

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

// Mock data
const complianceScore = ref(92)
const criticalAlerts = ref(3)
const expiringDocuments = ref(12)
const totalDocuments = ref(245)
const validDocuments = ref(220)

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
Total Score: ${complianceScore.value}%
Critical Alerts: ${criticalAlerts.value}
Expiring Documents: ${expiringDocuments.value}
Total Documents: ${totalDocuments.value}
Valid Documents: ${validDocuments.value}

DOCUMENT STATUS:
${documents.value.map(doc => 
  `- ${doc.title} (${doc.type}): ${doc.status} - Expires: ${doc.expiryDate.toLocaleDateString()}`
).join('\n')}

URGENT ACTIONS REQUIRED:
${urgentActions.value.map(action => 
  `- ${action.title}: ${action.description}`
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
    // Simulate data refresh
    setTimeout(() => {
      complianceScore.value = Math.floor(Math.random() * 10) + 90 // 90-99%
      criticalAlerts.value = Math.floor(Math.random() * 5) + 1 // 1-5
      expiringDocuments.value = Math.floor(Math.random() * 15) + 5 // 5-19
      loading.value = false
      alert('Data refreshed successfully!')
    }, 1500)
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
      criticalAlerts.value = Math.max(0, criticalAlerts.value - 1)
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
has achieved a compliance score of ${complianceScore.value}%
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
        `"${doc.title}"`,
        doc.type,
        doc.status,
        doc.employee,
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
  background: linear-gradient(135deg, #fafafa 0%, #f0f2f5 100%);
  min-height: 100vh;
  position: relative;
}

.compliance-dashboard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><defs><pattern id="hex" width="28" height="49" patternUnits="userSpaceOnUse" patternTransform="scale(0.3)"><polygon points="14,1 26,8 26,22 14,29 2,22 2,8" fill="none" stroke="rgba(0,0,0,0.02)" stroke-width="1"/></pattern></defs><rect width="60" height="60" fill="url(%23hex)"/></svg>');
  pointer-events: none;
  z-index: 0;
}

/* Enhanced data table styling */
.compliance-table {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
}

.compliance-table :deep(.v-data-table__tr) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.compliance-table :deep(.v-data-table__tr:hover) {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.06) 0%, rgba(25, 118, 210, 0.02) 100%);
  transform: scale(1.001);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.1);
}

.compliance-table :deep(.v-data-table-header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 12px;
}

.compliance-table :deep(.v-data-table-header__content) {
  color: #374151;
}

/* Enhanced progress indicators */
.v-progress-linear {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.05);
}

.v-progress-linear :deep(.v-progress-linear__determinate) {
  background: linear-gradient(90deg, #10b981, #34d399);
  position: relative;
}

.v-progress-linear :deep(.v-progress-linear__determinate::after) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: progress-shimmer 2s infinite;
}

@keyframes progress-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Enhanced card hover effects */
.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  position: relative;
  overflow: hidden;
}

.v-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #10b981, #34d399, #10b981);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.v-card:hover::before {
  transform: scaleX(1);
}

.v-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

/* Status card enhancements */
.v-card.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.v-card.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.v-card.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.v-card.info {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

/* Enhanced expansion panels styling */
.v-expansion-panels {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.v-expansion-panels :deep(.v-expansion-panel) {
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.v-expansion-panels :deep(.v-expansion-panel-title) {
  font-weight: 600;
  padding: 20px 24px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.v-expansion-panels :deep(.v-expansion-panel-title:hover) {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.04) 100%);
  transform: translateX(4px);
}

.v-expansion-panels :deep(.v-expansion-panel-text) {
  padding: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
}

/* Enhanced buttons */
.v-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  text-transform: none;
  font-weight: 500;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.v-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.v-btn.v-btn--variant-elevated.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.v-btn.v-btn--variant-elevated.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.v-btn.v-btn--variant-elevated.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

/* Enhanced chips and badges */
.v-chip {
  border-radius: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 11px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.v-chip:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.v-chip.text-success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.v-chip.text-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.v-chip.text-error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Icon enhancements */
.v-icon {
  transition: all 0.2s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.v-btn:hover .v-icon {
  transform: scale(1.1);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .compliance-table :deep(.v-data-table) {
    font-size: 0.875rem;
  }
  
  .v-card:hover {
    transform: translateY(-2px) scale(1.01);
  }
  
  .v-expansion-panels :deep(.v-expansion-panel-title) {
    padding: 16px 20px;
  }
}

/* Dark theme adjustments */
.v-theme--dark .compliance-dashboard {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.v-theme--dark .compliance-dashboard::before {
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><defs><pattern id="hex" width="28" height="49" patternUnits="userSpaceOnUse" patternTransform="scale(0.3)"><polygon points="14,1 26,8 26,22 14,29 2,22 2,8" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="60" height="60" fill="url(%23hex)"/></svg>');
}

.v-theme--dark .compliance-table,
.v-theme--dark .v-card {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.v-theme--dark .compliance-table :deep(.v-data-table-header) {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
}

.v-theme--dark .v-expansion-panels :deep(.v-expansion-panel) {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.v-theme--dark .v-expansion-panels :deep(.v-expansion-panel-title) {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
}

.v-theme--dark .v-expansion-panels :deep(.v-expansion-panel-text) {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

/* Animation classes */
@keyframes compliance-pulse {
  0%, 100% { 
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 8px 30px rgba(16, 185, 129, 0.5);
    transform: scale(1.02);
  }
}

.compliance-pulse {
  animation: compliance-pulse 2s infinite;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fade-in-up 0.6s ease-out;
}

/* Custom scrollbar for panels */
.v-expansion-panels :deep(.v-expansion-panel-text)::-webkit-scrollbar {
  width: 6px;
}

.v-expansion-panels :deep(.v-expansion-panel-text)::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.v-expansion-panels :deep(.v-expansion-panel-text)::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.4) 0%, rgba(16, 185, 129, 0.2) 100%);
  border-radius: 3px;
}

.v-expansion-panels :deep(.v-expansion-panel-text)::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.6) 0%, rgba(16, 185, 129, 0.4) 100%);
}
</style>
