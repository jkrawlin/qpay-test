<template>
  <div class="employee-detail">
    <v-container fluid>
      <v-row class="mb-4">
        <v-col cols="12" class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-1">Employee Details</h1>
            <p class="text-body-2 text-grey-darken-1 mb-0">Review personal, employment and compliance documents</p>
          </div>
          <v-btn variant="outlined" prepend-icon="mdi-arrow-left" :to="{ name: backRoute }">Back</v-btn>
        </v-col>
      </v-row>

      <v-alert type="error" v-if="error" class="mb-4" variant="tonal">{{ error }}</v-alert>
      <v-skeleton-loader v-if="loading" type="card, card, card" class="mb-4" />

      <template v-if="employee && !loading">
        <v-row>
          <!-- Left column: core info -->
          <v-col cols="12" md="6">
            <v-card elevation="2" class="mb-4">
              <v-card-title class="d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-account</v-icon>
                Personal Information
                <v-spacer />
                <v-chip size="small" :color="employee.status === 'active' ? 'success' : 'grey'" variant="flat">{{ employee.status }}</v-chip>
              </v-card-title>
              <v-divider />
              <v-card-text>
                <div class="info-grid">
                  <div class="info-item"><span>ID</span><strong>{{ employee.employeeId }}</strong></div>
                  <div class="info-item"><span>Name</span><strong>{{ employee.firstName }} {{ employee.lastName }}</strong></div>
                  <div class="info-item"><span>Nationality</span><strong>{{ employee.nationality || '—' }}</strong></div>
                  <div class="info-item"><span>Phone</span><strong>{{ employee.phone || '—' }}</strong></div>
                  <div class="info-item" v-if="employee.email"><span>Email</span><strong>{{ employee.email }}</strong></div>
                  <div class="info-item" v-if="employee.address"><span>Address</span><strong>{{ employee.address }}</strong></div>
                </div>
              </v-card-text>
            </v-card>

            <v-card elevation="2" class="mb-4">
              <v-card-title class="d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-briefcase</v-icon>
                Employment
              </v-card-title>
              <v-divider />
              <v-card-text>
                <div class="info-grid">
                  <div class="info-item"><span>Type</span><strong class="text-capitalize">{{ employee.type }}</strong></div>
                  <div class="info-item"><span>Department</span><strong>{{ employee.department }}</strong></div>
                  <div class="info-item"><span>Position</span><strong>{{ employee.position }}</strong></div>
                  <div class="info-item"><span>Hire Date</span><strong>{{ formatDate(employee.hireDate) }}</strong></div>
                  <div class="info-item"><span>Salary</span><strong>QAR {{ employee.salary?.toLocaleString() }}</strong></div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Right column: compliance documents -->
          <v-col cols="12" md="6">
            <v-card elevation="2" class="mb-4">
              <v-card-title class="d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-file-document-outline</v-icon>
                Documents
              </v-card-title>
              <v-divider />
              <v-card-text>
                <div class="doc-section">
                  <div class="doc-row">
                    <div class="doc-meta">
                      <v-icon size="18" color="primary" class="mr-1">mdi-fingerprint</v-icon>
                      <span class="label">Qatar ID</span>
                      <v-chip v-if="employee.qatarId" size="x-small" color="primary" variant="outlined">{{ employee.qatarId }}</v-chip>
                    </div>
                    <div class="doc-actions">
                      <template v-if="employee.qatarIdDocumentUrl">
                        <v-btn icon="mdi-open-in-new" variant="text" size="small" :href="employee.qatarIdDocumentUrl" target="_blank" title="View Qatar ID" />
                        <v-btn icon="mdi-download" variant="text" size="small" :href="employee.qatarIdDocumentUrl" target="_blank" download title="Download Qatar ID" />
                      </template>
                      <v-icon v-else size="18" color="grey">mdi-file-off</v-icon>
                    </div>
                  </div>

                  <v-divider class="my-2" />

                  <div class="doc-row">
                    <div class="doc-meta">
                      <v-icon size="18" color="primary" class="mr-1">mdi-passport-biometric</v-icon>
                      <span class="label">Passport</span>
                      <v-chip v-if="employee.passportNumber" size="x-small" color="primary" variant="outlined">{{ employee.passportNumber }}</v-chip>
                    </div>
                    <div class="doc-actions">
                      <template v-if="employee.passportDocumentUrl">
                        <v-btn icon="mdi-open-in-new" variant="text" size="small" :href="employee.passportDocumentUrl" target="_blank" title="View Passport" />
                        <v-btn icon="mdi-download" variant="text" size="small" :href="employee.passportDocumentUrl" target="_blank" download title="Download Passport" />
                      </template>
                      <v-icon v-else size="18" color="grey">mdi-file-off</v-icon>
                    </div>
                  </div>

                  <v-divider class="my-2" />

                  <div class="doc-row">
                    <div class="doc-meta">
                      <v-icon size="18" color="primary" class="mr-1">mdi-badge-account</v-icon>
                      <span class="label">Visa Status</span>
                    </div>
                    <div class="doc-actions">
                      <v-chip size="x-small" :color="visaChipColor" variant="flat">{{ employee.visa?.status || '—' }}</v-chip>
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <v-card elevation="2">
              <v-card-title class="d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-timeline-clock-outline</v-icon>
                Meta
              </v-card-title>
              <v-divider />
              <v-card-text>
                <div class="info-grid">
                  <div class="info-item"><span>Created</span><strong>{{ formatDateTime(employee.createdAt) }}</strong></div>
                  <div class="info-item"><span>Updated</span><strong>{{ formatDateTime(employee.updatedAt) }}</strong></div>
                  <div class="info-item"><span>Company</span><strong>{{ employee.companyId || '—' }}</strong></div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEmployeeStore } from '@/stores/employees-db'
import { useToastStore } from '@/stores/toasts'

const route = useRoute()
const router = useRouter()
const employeeStore = useEmployeeStore()
const toast = useToastStore()

const loading = ref(false)
const error = ref<string | null>(null)
const employee = ref<any>(null)

const id = route.params.id as string | undefined

const backRoute = computed(() => 'NiponEmployees')

const visaChipColor = computed(() => {
  const status = employee.value?.visa?.status?.toLowerCase() || ''
  if (status.includes('pending')) return 'warning'
  if (status.includes('expire')) return 'error'
  if (status.includes('process')) return 'info'
  return 'success'
})

const loadEmployee = async () => {
  if (!id) {
    error.value = 'No employee ID provided'
    return
  }
  loading.value = true
  try {
    const emp = await employeeStore.getEmployeeById(id)
    if (!emp) {
      error.value = 'Employee not found'
      return
    }
    employee.value = emp
  } catch (e) {
    error.value = 'Failed to load employee'
    console.error(e)
    toast.push({ message: 'Failed to load employee', type: 'error' })
  } finally {
    loading.value = false
  }
}

const formatDate = (value?: any) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleDateString()
  } catch { return '—' }
}

const formatDateTime = (value?: any) => {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch { return '—' }
}

onMounted(() => {
  loadEmployee()
})
</script>

<style scoped>
.employee-detail { background:#fafafa; min-height:100vh; }
.info-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:12px; }
.info-item span { display:block; font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:#666; }
.info-item strong { font-size:13px; font-weight:600; color:#1a1a1a; }
.doc-section { display:flex; flex-direction:column; gap:8px; }
.doc-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; }
.doc-meta { display:flex; align-items:center; gap:4px; }
.label { font-size:13px; font-weight:600; }
@media (max-width: 600px) { .info-grid { grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); } }
</style>
