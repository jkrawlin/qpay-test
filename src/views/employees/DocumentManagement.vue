<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-file-document-multiple</v-icon>
            Employee Document Management
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="showUploadDialog = true">
              <v-icon left>mdi-upload</v-icon>
              Upload Document
            </v-btn>
          </v-card-title>

          <v-card-text>
            <!-- Search and Filters -->
            <v-row class="mb-4">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchQuery"
                  label="Search Employee"
                  prepend-icon="mdi-magnify"
                  clearable
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="documentTypeFilter"
                  :items="documentTypes"
                  label="Document Type"
                  clearable
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="expiryFilter"
                  :items="expiryFilters"
                  label="Expiry Status"
                  clearable
                  outlined
                  dense
                ></v-select>
              </v-col>
              <v-col cols="12" md="2">
                <v-btn color="warning" block @click="checkExpiring">
                  <v-icon left>mdi-alert</v-icon>
                  Check Expiring
                </v-btn>
              </v-col>
            </v-row>

            <!-- Document Statistics -->
            <v-row class="mb-4">
              <v-col cols="12" md="3">
                <v-card color="error" dark>
                  <v-card-text class="text-center">
                    <v-icon large>mdi-alert-circle</v-icon>
                    <div class="text-h4">{{ expiringCount.critical }}</div>
                    <div>Expiring in 7 days</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card color="warning" dark>
                  <v-card-text class="text-center">
                    <v-icon large>mdi-clock-alert</v-icon>
                    <div class="text-h4">{{ expiringCount.warning }}</div>
                    <div>Expiring in 30 days</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card color="info" dark>
                  <v-card-text class="text-center">
                    <v-icon large>mdi-information</v-icon>
                    <div class="text-h4">{{ expiringCount.info }}</div>
                    <div>Expiring in 90 days</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card color="success" dark>
                  <v-card-text class="text-center">
                    <v-icon large>mdi-check-circle</v-icon>
                    <div class="text-h4">{{ validDocuments }}</div>
                    <div>Valid Documents</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Employee Documents Table -->
            <v-data-table
              :headers="headers"
              :items="filteredEmployees"
              :search="searchQuery"
              :loading="loading"
              class="elevation-1"
              show-expand
              item-key="id"
            >
              <template v-slot:item.qatarIdStatus="{ item }">
                <v-chip
                  :color="getDocumentStatusColor(item.qatarIdStatus)"
                  small
                  dark
                >
                  {{ item.qatarIdStatus }}
                </v-chip>
              </template>

              <template v-slot:item.passportStatus="{ item }">
                <v-chip
                  :color="getDocumentStatusColor(item.passportStatus)"
                  small
                  dark
                >
                  {{ item.passportStatus }}
                </v-chip>
              </template>

              <template v-slot:item.visaStatus="{ item }">
                <v-chip
                  :color="getDocumentStatusColor(item.visaStatus)"
                  small
                  dark
                >
                  {{ item.visaStatus }}
                </v-chip>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  small
                  color="primary"
                  @click="editDocuments(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  color="info"
                  @click="viewDocuments(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  color="success"
                  @click="generateReport(item)"
                >
                  <v-icon>mdi-file-pdf-box</v-icon>
                </v-btn>
              </template>

              <template v-slot:expanded-item="{ headers, item }">
                <td :colspan="headers.length">
                  <v-card flat>
                    <v-card-text>
                      <v-row>
                        <!-- Qatar ID Details -->
                        <v-col cols="12" md="4">
                          <h4>Qatar ID Details</h4>
                          <v-list dense>
                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item-title>Number</v-list-item-title>
                                <v-list-item-subtitle>{{ item.documents?.qatarId?.number || 'Not provided' }}</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item-title>Issue Date</v-list-item-title>
                                <v-list-item-subtitle>{{ formatDate(item.documents?.qatarId?.issueDate) || 'Not provided' }}</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item-title>Expiry Date</v-list-item-title>
                                <v-list-item-subtitle>{{ formatDate(item.documents?.qatarId?.expiryDate) || 'Not provided' }}</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                            <v-list-item v-if="item.documents?.qatarId?.scannedCopyUrl">
                              <v-list-item-content>
                                <v-btn small color="primary" @click="viewDocument(item.documents.qatarId.scannedCopyUrl)">
                                  View Document
                                </v-btn>
                              </v-list-item-content>
                            </v-list-item>
                          </v-list>
                        </v-col>

                        <!-- Passport Details -->
                        <v-col cols="12" md="4">
                          <h4>Passport Details</h4>
                          <v-list dense>
                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item-title>Number</v-list-item-title>
                                <v-list-item-subtitle>{{ item.documents?.passport?.number || 'Not provided' }}</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item-title>Nationality</v-list-item-title>
                                <v-list-item-subtitle>{{ item.documents?.passport?.nationality || 'Not provided' }}</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item-title>Expiry Date</v-list-item-title>
                                <v-list-item-subtitle>{{ formatDate(item.documents?.passport?.expiryDate) || 'Not provided' }}</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                            <v-list-item v-if="item.documents?.passport?.scannedCopyUrl">
                              <v-list-item-content>
                                <v-btn small color="primary" @click="viewDocument(item.documents.passport.scannedCopyUrl)">
                                  View Document
                                </v-btn>
                              </v-list-item-content>
                            </v-list-item>
                          </v-list>
                        </v-col>

                        <!-- Visa Details -->
                        <v-col cols="12" md="4">
                          <h4>Visa Details</h4>
                          <v-list dense>
                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item-title>Number</v-list-item-title>
                                <v-list-item-subtitle>{{ item.documents?.visa?.number || 'Not provided' }}</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item-title>Type</v-list-item-title>
                                <v-list-item-subtitle>{{ item.documents?.visa?.type || 'Not provided' }}</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item-title>Sponsor</v-list-item-title>
                                <v-list-item-subtitle>{{ item.documents?.visa?.sponsor || 'Not provided' }}</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item-title>Expiry Date</v-list-item-title>
                                <v-list-item-subtitle>{{ formatDate(item.documents?.visa?.expiryDate) || 'Not provided' }}</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                            <v-list-item v-if="item.documents?.visa?.scannedCopyUrl">
                              <v-list-item-content>
                                <v-btn small color="primary" @click="viewDocument(item.documents.visa.scannedCopyUrl)">
                                  View Document
                                </v-btn>
                              </v-list-item-content>
                            </v-list-item>
                          </v-list>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </td>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Upload Dialog -->
    <v-dialog v-model="showUploadDialog" max-width="800">
      <DocumentUpload
        :employee-id="selectedEmployeeId"
        @uploaded="handleDocumentUploaded"
        @cancelled="showUploadDialog = false"
      />
    </v-dialog>

    <!-- Document Edit Dialog -->
    <v-dialog v-model="showEditDialog" max-width="900">
      <v-card>
        <v-card-title>
          Edit Documents - {{ selectedEmployee?.name }}
          <v-spacer></v-spacer>
          <v-btn icon @click="showEditDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form ref="documentForm" v-model="validDocumentForm">
            <v-tabs v-model="activeTab">
              <v-tab>Qatar ID</v-tab>
              <v-tab>Passport</v-tab>
              <v-tab>Visa</v-tab>

              <!-- Qatar ID Tab -->
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <v-text-field
                      v-model="editingDocuments.qatarId.number"
                      label="Qatar ID Number"
                      :rules="[v => !v || v.length === 11 || 'Qatar ID must be 11 digits']"
                    ></v-text-field>
                    <v-text-field
                      v-model="editingDocuments.qatarId.issueDate"
                      label="Issue Date"
                      type="date"
                    ></v-text-field>
                    <v-text-field
                      v-model="editingDocuments.qatarId.expiryDate"
                      label="Expiry Date"
                      type="date"
                      :rules="[v => !v || new Date(v) > new Date() || 'Expiry date must be in the future']"
                    ></v-text-field>
                    <v-file-input
                      v-model="qatarIdFile"
                      label="Upload Qatar ID Scan"
                      accept="image/*,.pdf"
                      @change="handleQatarIdUpload"
                    ></v-file-input>
                  </v-card-text>
                </v-card>
              </v-tab-item>

              <!-- Passport Tab -->
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <v-text-field
                      v-model="editingDocuments.passport.number"
                      label="Passport Number"
                    ></v-text-field>
                    <v-text-field
                      v-model="editingDocuments.passport.nationality"
                      label="Nationality"
                    ></v-text-field>
                    <v-text-field
                      v-model="editingDocuments.passport.issueDate"
                      label="Issue Date"
                      type="date"
                    ></v-text-field>
                    <v-text-field
                      v-model="editingDocuments.passport.expiryDate"
                      label="Expiry Date"
                      type="date"
                      :rules="[v => !v || new Date(v) > new Date() || 'Expiry date must be in the future']"
                    ></v-text-field>
                    <v-file-input
                      v-model="passportFile"
                      label="Upload Passport Scan"
                      accept="image/*,.pdf"
                      @change="handlePassportUpload"
                    ></v-file-input>
                  </v-card-text>
                </v-card>
              </v-tab-item>

              <!-- Visa Tab -->
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <v-text-field
                      v-model="editingDocuments.visa.number"
                      label="Visa Number"
                    ></v-text-field>
                    <v-text-field
                      v-model="editingDocuments.visa.type"
                      label="Visa Type"
                    ></v-text-field>
                    <v-text-field
                      v-model="editingDocuments.visa.sponsor"
                      label="Sponsor"
                    ></v-text-field>
                    <v-text-field
                      v-model="editingDocuments.visa.expiryDate"
                      label="Expiry Date"
                      type="date"
                      :rules="[v => !v || new Date(v) > new Date() || 'Expiry date must be in the future']"
                    ></v-text-field>
                    <v-file-input
                      v-model="visaFile"
                      label="Upload Visa Scan"
                      accept="image/*,.pdf"
                      @change="handleVisaUpload"
                    ></v-file-input>
                  </v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showEditDialog = false">Cancel</v-btn>
          <v-btn 
            color="primary" 
            :loading="saving"
            @click="saveDocuments"
          >
            Save Documents
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { documentService } from '@/services/documentService'
import DocumentUpload from '@/components/documents/DocumentUpload.vue'
import { useNotification } from '@/composables/useNotification'
import { format } from 'date-fns'

const { showSuccess, showError } = useNotification()

// Data
const employees = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const documentTypeFilter = ref('')
const expiryFilter = ref('')

// Dialogs
const showUploadDialog = ref(false)
const showEditDialog = ref(false)
const validDocumentForm = ref(false)
const activeTab = ref(0)

// Selected items
const selectedEmployee = ref<any>(null)
const selectedEmployeeId = ref('')

// Document editing
const editingDocuments = ref({
  qatarId: {
    number: '',
    issueDate: '',
    expiryDate: '',
    scannedCopyUrl: ''
  },
  passport: {
    number: '',
    nationality: '',
    issueDate: '',
    expiryDate: '',
    scannedCopyUrl: ''
  },
  visa: {
    number: '',
    type: '',
    sponsor: '',
    expiryDate: '',
    scannedCopyUrl: ''
  }
})

const qatarIdFile = ref<File[]>([])
const passportFile = ref<File[]>([])
const visaFile = ref<File[]>([])

// Constants
const documentTypes = [
  { text: 'Qatar ID', value: 'qatar-id' },
  { text: 'Passport', value: 'passport' },
  { text: 'Visa', value: 'visa' }
]

const expiryFilters = [
  { text: 'Expiring in 7 days', value: '7' },
  { text: 'Expiring in 30 days', value: '30' },
  { text: 'Expiring in 90 days', value: '90' },
  { text: 'Valid', value: 'valid' },
  { text: 'Expired', value: 'expired' }
]

const headers = [
  { text: 'Employee', value: 'name' },
  { text: 'Department', value: 'department' },
  { text: 'Qatar ID Status', value: 'qatarIdStatus' },
  { text: 'Passport Status', value: 'passportStatus' },
  { text: 'Visa Status', value: 'visaStatus' },
  { text: 'Actions', value: 'actions', sortable: false }
]

// Computed
const filteredEmployees = computed(() => {
  let result = employees.value

  if (expiryFilter.value) {
    result = result.filter(emp => {
      const days = parseInt(expiryFilter.value)
      if (expiryFilter.value === 'valid') {
        return emp.qatarIdStatus === 'valid' || emp.passportStatus === 'valid' || emp.visaStatus === 'valid'
      }
      if (expiryFilter.value === 'expired') {
        return emp.qatarIdStatus === 'expired' || emp.passportStatus === 'expired' || emp.visaStatus === 'expired'
      }
      return emp.qatarIdDaysToExpiry <= days || emp.passportDaysToExpiry <= days || emp.visaDaysToExpiry <= days
    })
  }

  return result
})

const expiringCount = computed(() => {
  return {
    critical: employees.value.filter(emp => 
      emp.qatarIdDaysToExpiry <= 7 || emp.passportDaysToExpiry <= 7 || emp.visaDaysToExpiry <= 7
    ).length,
    warning: employees.value.filter(emp => 
      emp.qatarIdDaysToExpiry <= 30 || emp.passportDaysToExpiry <= 30 || emp.visaDaysToExpiry <= 30
    ).length,
    info: employees.value.filter(emp => 
      emp.qatarIdDaysToExpiry <= 90 || emp.passportDaysToExpiry <= 90 || emp.visaDaysToExpiry <= 90
    ).length
  }
})

const validDocuments = computed(() => {
  return employees.value.filter(emp => 
    emp.qatarIdStatus === 'valid' && emp.passportStatus === 'valid' && emp.visaStatus === 'valid'
  ).length
})

// Mock data for demonstration
const loadEmployees = async () => {
  loading.value = true
  try {
    // Simulated employee data with document information
    employees.value = [
      {
        id: '1',
        name: 'Ahmed Al-Thani',
        department: 'Operations',
        documents: {
          qatarId: {
            number: '12345678901',
            issueDate: new Date('2020-01-15'),
            expiryDate: new Date('2025-01-15'),
            scannedCopyUrl: 'https://example.com/doc1.pdf'
          },
          passport: {
            number: 'P1234567',
            nationality: 'Qatari',
            issueDate: new Date('2019-03-10'),
            expiryDate: new Date('2029-03-10'),
            scannedCopyUrl: 'https://example.com/passport1.pdf'
          },
          visa: {
            number: 'V7654321',
            type: 'Work Visa',
            sponsor: 'Company ABC',
            expiryDate: new Date('2024-12-31'),
            scannedCopyUrl: 'https://example.com/visa1.pdf'
          }
        }
      },
      {
        id: '2',
        name: 'Sarah Mohamed',
        department: 'HR',
        documents: {
          qatarId: {
            number: '09876543210',
            issueDate: new Date('2021-06-20'),
            expiryDate: new Date('2024-10-20'),
            scannedCopyUrl: 'https://example.com/doc2.pdf'
          },
          passport: {
            number: 'P9876543',
            nationality: 'Egyptian',
            issueDate: new Date('2020-01-05'),
            expiryDate: new Date('2025-01-05'),
            scannedCopyUrl: 'https://example.com/passport2.pdf'
          }
        }
      }
    ].map(emp => ({
      ...emp,
      qatarIdStatus: getDocumentStatus(emp.documents?.qatarId?.expiryDate),
      passportStatus: getDocumentStatus(emp.documents?.passport?.expiryDate),
      visaStatus: getDocumentStatus(emp.documents?.visa?.expiryDate),
      qatarIdDaysToExpiry: getDaysToExpiry(emp.documents?.qatarId?.expiryDate),
      passportDaysToExpiry: getDaysToExpiry(emp.documents?.passport?.expiryDate),
      visaDaysToExpiry: getDaysToExpiry(emp.documents?.visa?.expiryDate)
    }))
  } catch (error) {
    showError('Failed to load employees')
  } finally {
    loading.value = false
  }
}

const getDocumentStatus = (expiryDate: any) => {
  if (!expiryDate) return 'missing'
  
  const expiry = expiryDate instanceof Date ? expiryDate : new Date(expiryDate)
  const today = new Date()
  const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysToExpiry < 0) return 'expired'
  if (daysToExpiry <= 7) return 'critical'
  if (daysToExpiry <= 30) return 'warning'
  if (daysToExpiry <= 90) return 'caution'
  return 'valid'
}

const getDaysToExpiry = (expiryDate: any) => {
  if (!expiryDate) return 999
  
  const expiry = expiryDate instanceof Date ? expiryDate : new Date(expiryDate)
  const today = new Date()
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

const getDocumentStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    valid: 'success',
    caution: 'info',
    warning: 'warning',
    critical: 'error',
    expired: 'error',
    missing: 'grey'
  }
  return colors[status] || 'grey'
}

const editDocuments = (employee: any) => {
  selectedEmployee.value = employee
  editingDocuments.value = {
    qatarId: {
      number: employee.documents?.qatarId?.number || '',
      issueDate: employee.documents?.qatarId?.issueDate ? formatDateForInput(employee.documents.qatarId.issueDate) : '',
      expiryDate: employee.documents?.qatarId?.expiryDate ? formatDateForInput(employee.documents.qatarId.expiryDate) : '',
      scannedCopyUrl: employee.documents?.qatarId?.scannedCopyUrl || ''
    },
    passport: {
      number: employee.documents?.passport?.number || '',
      nationality: employee.documents?.passport?.nationality || '',
      issueDate: employee.documents?.passport?.issueDate ? formatDateForInput(employee.documents.passport.issueDate) : '',
      expiryDate: employee.documents?.passport?.expiryDate ? formatDateForInput(employee.documents.passport.expiryDate) : '',
      scannedCopyUrl: employee.documents?.passport?.scannedCopyUrl || ''
    },
    visa: {
      number: employee.documents?.visa?.number || '',
      type: employee.documents?.visa?.type || '',
      sponsor: employee.documents?.visa?.sponsor || '',
      expiryDate: employee.documents?.visa?.expiryDate ? formatDateForInput(employee.documents.visa.expiryDate) : '',
      scannedCopyUrl: employee.documents?.visa?.scannedCopyUrl || ''
    }
  }
  showEditDialog.value = true
}

const saveDocuments = async () => {
  saving.value = true
  try {
    const documentData = {
      qatarId: {
        ...editingDocuments.value.qatarId,
        issueDate: editingDocuments.value.qatarId.issueDate ? new Date(editingDocuments.value.qatarId.issueDate) : null,
        expiryDate: editingDocuments.value.qatarId.expiryDate ? new Date(editingDocuments.value.qatarId.expiryDate) : null
      },
      passport: {
        ...editingDocuments.value.passport,
        issueDate: editingDocuments.value.passport.issueDate ? new Date(editingDocuments.value.passport.issueDate) : null,
        expiryDate: editingDocuments.value.passport.expiryDate ? new Date(editingDocuments.value.passport.expiryDate) : null
      },
      visa: {
        ...editingDocuments.value.visa,
        expiryDate: editingDocuments.value.visa.expiryDate ? new Date(editingDocuments.value.visa.expiryDate) : null
      }
    }

    await documentService.updateEmployeeDocuments(selectedEmployee.value.id, documentData)
    showSuccess('Documents updated successfully')
    showEditDialog.value = false
    loadEmployees()
  } catch (error) {
    showError('Failed to update documents')
  } finally {
    saving.value = false
  }
}

const checkExpiring = async () => {
  try {
    const expiringDocs = await documentService.generateExpiryReport(90)
    console.log('Expiring documents:', expiringDocs)
    showSuccess(`Found ${expiringDocs.length} documents expiring in the next 90 days`)
  } catch (error) {
    showError('Failed to check expiring documents')
  }
}

const handleDocumentUploaded = () => {
  showUploadDialog.value = false
  loadEmployees()
}

const formatDate = (date: any) => {
  if (!date) return 'Not provided'
  const d = date instanceof Date ? date : new Date(date)
  return format(d, 'dd/MM/yyyy')
}

const formatDateForInput = (date: any) => {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  return format(d, 'yyyy-MM-dd')
}

const viewDocument = (url: string) => {
  window.open(url, '_blank')
}

const viewDocuments = (employee: any) => {
  console.log('Viewing documents for:', employee.name)
}

const generateReport = (employee: any) => {
  console.log('Generating report for:', employee.name)
}

const handleQatarIdUpload = async () => {
  if (qatarIdFile.value && qatarIdFile.value[0]) {
    try {
      const url = await documentService.uploadToStorage(qatarIdFile.value[0], 'qatar-id')
      editingDocuments.value.qatarId.scannedCopyUrl = url
      showSuccess('Qatar ID uploaded successfully')
    } catch (error) {
      showError('Failed to upload Qatar ID')
    }
  }
}

const handlePassportUpload = async () => {
  if (passportFile.value && passportFile.value[0]) {
    try {
      const url = await documentService.uploadToStorage(passportFile.value[0], 'passport')
      editingDocuments.value.passport.scannedCopyUrl = url
      showSuccess('Passport uploaded successfully')
    } catch (error) {
      showError('Failed to upload passport')
    }
  }
}

const handleVisaUpload = async () => {
  if (visaFile.value && visaFile.value[0]) {
    try {
      const url = await documentService.uploadToStorage(visaFile.value[0], 'visa')
      editingDocuments.value.visa.scannedCopyUrl = url
      showSuccess('Visa uploaded successfully')
    } catch (error) {
      showError('Failed to upload visa')
    }
  }
}

onMounted(() => {
  loadEmployees()
})
</script>

<style scoped>
.text-h4 {
  font-weight: bold;
}
</style>
