<template>
  <v-container fluid class="pa-4">
    <a href="#temp-table" class="visually-hidden-focusable skip-link">Skip to temporary employees table</a>
    <!-- Hero KPI Section (shared component) -->
    <HeroKpiGroup :kpis="heroKpis" aria-label="Temporary workforce summary" class="mb-6">
      <template #title>Temporary Workforce Overview</template>
      <template #subtitle>
        Monitor contract health, visa timelines and documentation completeness for all temporary staff.
      </template>
      <template #actions>
        <v-btn color="primary" size="small" prepend-icon="mdi-plus" @click="addTemporaryEmployee">Add Temporary</v-btn>
        <v-btn variant="outlined" size="small" prepend-icon="mdi-download" @click="exportEmployees">Export</v-btn>
        <v-btn variant="outlined" size="small" prepend-icon="mdi-file-chart" @click="generateReport">Report</v-btn>
      </template>
    </HeroKpiGroup>
    <!-- Header Section -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Temporary Employees</h1>
            <p class="text-body-1 text-medium-emphasis">
              Manage temporary employees and contract workers with visa tracking and documentation
            </p>
          </div>
          <v-btn
            color="primary"
            size="large"
            :prepend-icon="'mdi-plus'"
            @click="addTemporaryEmployee"
            elevation="2"
          >
            Add Temporary Employee
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Advanced Filter Panel (shared component) -->
    <AdvancedFilterPanel
      v-model="showAdvanced"
      title="Filters"
      aria-label="Filter temporary employees"
      :active-pills="activePills"
      :active-count="activeFilterCount"
      :show-advanced-toggle="true"
      :show-clear="true"
      @clear="resetAllFilters"
      class="mb-6"
    >
      <template #quick>
        <button
          v-for="q in quickFilters"
          :key="q.key"
          :class="['qf-btn', { active: q.isActive }]"
          type="button"
          @click="toggleQuickFilter(q.key)"
          :aria-pressed="q.isActive"
          :tabindex="-1"
        >
          <v-icon size="16" class="mr-1">{{ q.icon }}</v-icon>{{ q.label }}
          <span v-if="q.badge !== undefined" class="qf-badge" :data-severity="q.severity || ''">{{ q.badge }}</span>
        </button>
      </template>
      <!-- Advanced Fields -->
      <div class="af-field">
        <label class="af-label" for="emp-search">Search</label>
        <div class="af-input-icon">
          <v-icon size="18">mdi-magnify</v-icon>
          <input id="emp-search" v-model="searchQuery" type="text" placeholder="Name, ID, position..." />
          <button v-if="searchQuery" class="clear-mini" @click="searchQuery = ''" :aria-label="'Clear search'">
            <v-icon size="14">mdi-close</v-icon>
          </button>
        </div>
      </div>
      <div class="af-field">
        <label class="af-label" for="contract-type">Contract Type</label>
        <select id="contract-type" v-model="contractTypeFilter">
          <option value="">All</option>
          <option v-for="c in contractTypeOptions" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="af-field">
        <label class="af-label" for="visa-status">Visa Status</label>
        <select id="visa-status" v-model="visaStatusFilter">
          <option value="">All</option>
          <option v-for="v in visaStatusOptions" :key="v" :value="v">{{ v }}</option>
        </select>
      </div>
      <div class="af-field">
        <label class="af-label" for="contract-status">Contract Status</label>
        <select id="contract-status" v-model="contractStatusFilter">
          <option value="">All</option>
          <option v-for="s in contractStatusOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <!-- Removed: Min/Max Rate, Max Days Remaining, Incomplete Docs toggle -->
    </AdvancedFilterPanel>

    <!-- Employee Table -->
    <v-card variant="outlined">
          <v-data-table
            v-model:items-per-page="itemsPerPage"
            :headers="headers"
            :items="pagedEmployees"
            :loading="loading"
            :search="searchQuery"
            class="elevation-0 temp-table"
            density="comfortable"
            item-value="id"
            hide-default-footer
            :item-class="rowClass"
            id="temp-table"
            aria-label="Temporary employees results"
          >
        <!-- Employee Avatar and Basic Info -->
        <template v-slot:item.employee="{ item }">
          <div class="d-flex align-center cursor-pointer emp-cell" @click="viewEmployee(item)">
            <div :class="['avatar-wrapper', presenceClass(item)]">
              <v-avatar
                :image="`https://i.pravatar.cc/48?u=${item.email}`"
                size="30"
              />
            </div>
            <div class="emp-meta">
              <div class="emp-name text-body-2 font-weight-medium">{{ item.firstName }} {{ item.lastName }}</div>
              <div class="emp-email text-caption text-medium-emphasis">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <!-- Employee ID -->
        <template v-slot:item.employeeId="{ item }">
          <v-chip color="primary" variant="outlined" size="x-small" density="compact">
            {{ item.employeeId }}
          </v-chip>
        </template>

        <!-- Contract Type -->
        <template v-slot:item.contractType="{ item }">
          <v-chip color="primary" variant="tonal" size="x-small" density="compact">
            {{ item.contractType }}
          </v-chip>
        </template>

        <!-- Position -->
        <template v-slot:item.position="{ item }">
          <span class="text-caption">{{ item.position }}</span>
        </template>

        <!-- Documents -->
        <template v-slot:item.documents="{ item }">
          <div class="d-flex align-center gap-1">
            <v-tooltip text="Qatar ID Document" v-if="item.qatarIdDocumentUrl || item.qatarIdDocument">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-fingerprint" size="x-small" variant="text" color="primary" :href="item.qatarIdDocumentUrl" target="_blank" :disabled="!item.qatarIdDocumentUrl" />
              </template>
            </v-tooltip>
            <v-tooltip text="Passport Document" v-if="item.passportDocumentUrl || item.passportDocument">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-passport-biometric" size="x-small" variant="text" color="primary" :href="item.passportDocumentUrl" target="_blank" :disabled="!item.passportDocumentUrl" />
              </template>
            </v-tooltip>
            <v-icon v-if="!item.qatarIdDocumentUrl && !item.passportDocumentUrl" size="16" color="grey">mdi-file-off</v-icon>
          </div>
        </template>

        <!-- Contract Duration -->
        <template v-slot:item.contractDuration="{ item }">
          <div class="text-caption">
            <div>{{ formatDate(item.contractStart) }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ calculateDaysRemaining(item.contractEnd) }} days left
            </div>
          </div>
        </template>

        <!-- Visa Status -->
        <template v-slot:item.visaStatus="{ item }">
          <v-chip
            :color="getVisaStatusColor(item.visaStatus)"
            variant="tonal"
            size="x-small"
            density="compact"
          >
            {{ item.visaStatus }}
          </v-chip>
        </template>

        <!-- Hourly Rate -->
        <template v-slot:item.hourlyRate="{ item }">
          <span class="text-caption font-weight-medium">{{ formatCurrency(item.hourlyRate) }}/hr</span>
        </template>

        <!-- Contract Status -->
        <template v-slot:item.contractStatus="{ item }">
          <v-chip
            :color="getContractStatusColor(item.contractStatus)"
            variant="tonal"
            size="x-small"
            density="compact"
          >
            {{ item.contractStatus }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center gap-1">
            <v-btn
              variant="text"
              size="small"
              density="compact"
              color="primary"
              class="action-btn"
              @click="viewEmployee(item)"
              title="View Employee"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              density="compact"
              color="primary"
              class="action-btn"
              @click="editEmployee(item)"
              title="Edit Employee"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              density="compact"
              color="primary"
              class="action-btn"
              @click="viewDocuments(item)"
              title="View Documents"
            >
              <v-icon>mdi-file-document</v-icon>
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              density="compact"
              color="primary"
              class="action-btn"
              @click="viewContract(item)"
              title="View Contract"
            >
              <v-icon>mdi-file-document-outline</v-icon>
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              density="compact"
              color="primary"
              class="action-btn"
              @click="promptLogHours(item)"
              title="Log Hours (stage payroll)"
            >
              <v-icon>mdi-timer-play</v-icon>
            </v-btn>
          </div>
        </template>

        <!-- No data -->
        <template v-slot:no-data>
          <div class="text-center pa-6">
            <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-account-clock-outline</v-icon>
            <div class="text-h6 mb-2">No temporary employees found</div>
            <div class="text-body-2 text-medium-emphasis mb-3">
              Add your first temporary employee to get started
            </div>
            <v-btn color="primary" size="small" @click="addTemporaryEmployee">
              Add Temporary Employee
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <!-- Table Footer -->
      <v-divider />
      <TableFooterSummary
        :start="pageStart"
        :end="pageEnd"
        :total-filtered="filteredEmployees.length"
        :total-all="temporaryEmployees.length"
        :pages="totalPages"
        :page="currentPage"
        :items-per-page="itemsPerPage"
        :summary="`Active: ${activeContracts} • Expiring <30d: ${expiringContracts} • Incomplete: ${incompleteProfiles}`"
        @update:page="val => currentPage = val"
        @update:items-per-page="val => itemsPerPage = val"
      />
    </v-card>

    <!-- Redesigned Employee Detail Dialog -->
    <v-dialog v-model="showDetailDialog" max-width="1100px" scrollable transition="dialog-bottom-transition">
      <v-card
        v-if="selectedEmployee"
        class="employee-detail-dialog redesigned"
        role="dialog"
        :aria-label="`${selectedEmployee.firstName} ${selectedEmployee.lastName} details`"
        aria-modal="true"
        @keydown.esc.prevent="showDetailDialog = false"
      >
        <div class="employee-modal-layout">
          <!-- Side Panel / Navigation -->
          <aside class="employee-modal-nav" :class="{'elevated': true}">
            <div class="profile-block">
              <v-avatar :image="`https://i.pravatar.cc/96?u=${selectedEmployee.email}`" size="72" class="mb-3" />
              <h2 class="emp-name">{{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</h2>
              <p class="emp-position">{{ selectedEmployee.position }}</p>
              <div class="chips-row">
                <!-- Status chip with explicit gradient for Active -->
                <v-chip
                  v-if="selectedEmployee.contractStatus === 'Active'"
                  size="x-small"
                  density="compact"
                  class="mr-1 status-chip status-active"
                >
                  {{ selectedEmployee.contractStatus }}
                </v-chip>
                <v-chip
                  v-else
                  :color="getContractStatusColor(selectedEmployee.contractStatus)"
                  variant="tonal"
                  size="x-small"
                  density="compact"
                  class="mr-1 status-chip"
                >
                  {{ selectedEmployee.contractStatus }}
                </v-chip>
                <v-chip class="emp-id-chip" size="x-small" density="compact" variant="outlined">
                  {{ selectedEmployee.employeeId }}
                </v-chip>
              </div>
            </div>

            <!-- Progress indicator removed per request: radial circle + percentage eliminated -->
            <div class="progress-block removed-progress" aria-hidden="true"></div>

            <nav class="section-nav" aria-label="Employee sections">
              <ul>
                <li v-for="s in sections" :key="s.key">
                  <button
                    :class="['nav-link', { active: activeSection === s.key }]"
                    @click="setSection(s.key)"
                    :aria-current="activeSection === s.key ? 'page' : false"
                    class="text-left"
                  >
                    <v-icon size="18" class="mr-2">{{ s.icon }}</v-icon>
                    <span>{{ s.label }}</span>
                    <v-chip v-if="s.key === 'documents'" size="x-small" variant="outlined" color="primary" class="ml-auto" density="compact">
                      {{ documentCount }}
                    </v-chip>
                  </button>
                </li>
              </ul>
            </nav>

            <div class="side-actions">
              <v-btn block color="primary" size="small" class="mb-2" @click="editEmployee(selectedEmployee)">
                <v-icon start size="16">mdi-pencil</v-icon> Edit
              </v-btn>
              <v-btn block variant="outlined" size="small" class="mb-2" @click="printSummary">
                <v-icon start size="16">mdi-printer</v-icon> Print
              </v-btn>
              <v-btn block variant="text" size="small" class="text-danger" @click="showDetailDialog = false">
                <v-icon start size="16">mdi-close</v-icon> Close
              </v-btn>
            </div>
          </aside>

          <!-- Main Content Area -->
          <main class="employee-modal-content" ref="contentArea" tabindex="0">
            <!-- Sticky Top Bar -->
            <div class="content-top-bar">
              <div class="breadcrumbs text-caption">
                Employees / Temporary / <span class="current">{{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</span>
              </div>
              <div class="top-actions">
                <v-btn variant="text" size="small" icon="mdi-arrow-left" @click="showDetailDialog = false" :title="'Close'" />
                <v-btn variant="text" size="small" icon="mdi-dots-vertical" :title="'More actions'" />
              </div>
            </div>

            <!-- Dynamic Section Rendering -->
            <section v-if="activeSection === 'overview'" key="overview" class="section-block" aria-labelledby="overview-heading">
              <header class="section-header">
                <h3 id="overview-heading"><v-icon size="20" class="mr-1 white-icon">mdi-account-details</v-icon> Overview</h3>
                <p class="section-sub">Key personal & employment attributes</p>
              </header>
              <div class="grid two">
                <div class="panel">
                  <h4 class="panel-title"><v-icon size="16" class="mr-1 white-icon">mdi-account</v-icon> Personal Information</h4>
                  <ul class="data-list">
                    <li><span>Full Name</span><strong>{{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</strong></li>
                    <li><span>Email</span><strong>{{ selectedEmployee.email }}</strong></li>
                    <li><span>Phone</span><strong>{{ selectedEmployee.phoneNumber || 'Not provided' }}</strong></li>
                    <li><span>Date of Birth</span><strong>{{ formatDate(selectedEmployee.dateOfBirth) || 'Not provided' }}</strong></li>
                    <li><span>Nationality</span><strong>{{ selectedEmployee.nationality || 'Not provided' }}</strong></li>
                    <li><span>Qatar ID</span><strong>{{ selectedEmployee.qatarId || 'Not provided' }}</strong></li>
                    <li><span>Passport #</span><strong>{{ selectedEmployee.passportNumber || 'Not provided' }}</strong></li>
                  </ul>
                </div>
                <div class="panel">
                  <h4 class="panel-title"><v-icon size="16" class="mr-1 white-icon">mdi-briefcase</v-icon> Employment Summary</h4>
                  <ul class="data-list">
                    <li><span>Employee ID</span><strong>{{ selectedEmployee.employeeId }}</strong></li>
                    <li><span>Contract Type</span><strong>{{ selectedEmployee.contractType }}</strong></li>
                    <li><span>Position</span><strong>{{ selectedEmployee.position }}</strong></li>
                    <li><span>Agency</span><strong>{{ selectedEmployee.agency || 'Direct' }}</strong></li>
                    <li><span>Hourly Rate</span><strong class="text-green">{{ formatCurrency(selectedEmployee.hourlyRate) }}/hr</strong></li>
                    <li><span>Days Remaining</span><strong>{{ calculateDaysRemaining(selectedEmployee.contractEnd) }} days</strong></li>
                  </ul>
                </div>
              </div>
              <div class="kpi-row">
                <div class="kpi">
                  <div class="kpi-label">Contract Duration</div>
                  <div class="kpi-value kpi-value--small">{{ formatDate(selectedEmployee.contractStart) }} → {{ formatDate(selectedEmployee.contractEnd) }}</div>
                </div>
                <div class="kpi">
                  <div class="kpi-label">Visa Status</div>
                  <div class="kpi-value">
                    <v-chip :color="getVisaStatusColor(selectedEmployee.visaStatus)" size="x-small" variant="tonal">{{ selectedEmployee.visaStatus }}</v-chip>
                  </div>
                </div>
                <div class="kpi">
                  <div class="kpi-label">Profile Docs</div>
                  <div class="kpi-value">{{ documentCount }} / {{ totalDocuments }}</div>
                </div>
              </div>
            </section>

            <section v-if="activeSection === 'contract'" key="contract" class="section-block" aria-labelledby="contract-heading">
              <header class="section-header">
                <h3 id="contract-heading"><v-icon size="20" class="mr-1 white-icon">mdi-contract</v-icon> Contract & Compensation</h3>
                <p class="section-sub">Contract lifecycle & financial terms</p>
              </header>
              <div class="grid two">
                <div class="panel">
                  <h4 class="panel-title"><v-icon size="16" class="mr-1 white-icon">mdi-file-document-outline</v-icon> Contract Details</h4>
                  <ul class="data-list">
                    <li><span>Status</span><strong><v-chip :color="getContractStatusColor(selectedEmployee.contractStatus)" size="x-small" variant="tonal">{{ selectedEmployee.contractStatus }}</v-chip></strong></li>
                    <li><span>Type</span><strong>{{ selectedEmployee.contractType }}</strong></li>
                    <li><span>Start Date</span><strong>{{ formatDate(selectedEmployee.contractStart) }}</strong></li>
                    <li><span>End Date</span><strong>{{ formatDate(selectedEmployee.contractEnd) }}</strong></li>
                    <li><span>Days Remaining</span><strong>{{ calculateDaysRemaining(selectedEmployee.contractEnd) }}</strong></li>
                    <li><span>Monthly Hours</span><strong>{{ selectedEmployee.monthlyHours || 'Not specified' }}</strong></li>
                  </ul>
                </div>
                <div class="panel">
                  <h4 class="panel-title"><v-icon size="16" class="mr-1 white-icon">mdi-cash</v-icon> Compensation</h4>
                  <ul class="data-list">
                    <li><span>Hourly Rate</span><strong class="text-green">{{ formatCurrency(selectedEmployee.hourlyRate) }}/hour</strong></li>
                    <li v-if="selectedEmployee.monthlyHours"><span>Est. Monthly</span><strong>{{ formatCurrency(selectedEmployee.hourlyRate * selectedEmployee.monthlyHours) }}</strong></li>
                  </ul>
                </div>
              </div>
            </section>

            <section v-if="activeSection === 'documents'" key="documents" class="section-block" aria-labelledby="documents-heading">
              <header class="section-header">
                <h3 id="documents-heading"><v-icon size="20" class="mr-1 white-icon">mdi-file-document-multiple</v-icon> Documents</h3>
                <p class="section-sub">Identity & contractual documents</p>
              </header>
              <div class="documents-list">
                <div class="doc-item" v-for="doc in documentItems" :key="doc.key">
                  <div class="doc-icon">
                    <v-icon :color="doc.color" size="22">{{ doc.icon }}</v-icon>
                  </div>
                  <div class="doc-meta">
                    <div class="doc-title">{{ doc.label }}</div>
                    <div class="doc-status" :class="{'missing': !doc.present}">
                      <v-chip v-if="doc.present" size="x-small" color="success" variant="tonal">Available</v-chip>
                      <v-chip v-else size="x-small" color="grey" variant="outlined">Missing</v-chip>
                    </div>
                  </div>
                  <div class="doc-actions">
                    <v-btn
                      v-if="doc.present"
                      size="x-small"
                      variant="text"
                      color="primary"
                      @click="viewDocument(doc.value as string)"
                    >
                      View
                    </v-btn>
                    <v-btn
                      v-else
                      size="x-small"
                      variant="text"
                      color="primary"
                    >
                      Upload
                    </v-btn>
                  </div>
                </div>
              </div>
            </section>

            <section v-if="activeSection === 'visa'" key="visa" class="section-block" aria-labelledby="visa-heading">
              <header class="section-header">
                <h3 id="visa-heading"><v-icon size="20" class="mr-1 white-icon">mdi-passport</v-icon> Visa Information</h3>
                <p class="section-sub">Status & key immigration details</p>
              </header>
              <div class="grid one">
                <div class="panel">
                  <h4 class="panel-title"><v-icon size="16" class="mr-1 white-icon">mdi-shield-account</v-icon> Visa Details</h4>
                  <ul class="data-list">
                    <li><span>Visa Type</span><strong>{{ selectedEmployee.visaType || 'Business Visa' }}</strong></li>
                    <li><span>Visa Status</span><strong><v-chip :color="getVisaStatusColor(selectedEmployee.visaStatus)" size="x-small" variant="tonal">{{ selectedEmployee.visaStatus }}</v-chip></strong></li>
                    <li><span>Entry Date</span><strong>{{ formatDate(selectedEmployee.entryDate) || 'Not provided' }}</strong></li>
                    <li><span>Visa Expiry</span><strong>{{ formatDate(selectedEmployee.visaExpiry) }}</strong></li>
                  </ul>
                </div>
              </div>
            </section>

            <section v-if="activeSection === 'activity'" key="activity" class="section-block" aria-labelledby="activity-heading">
              <header class="section-header">
                <h3 id="activity-heading"><v-icon size="20" class="mr-1 white-icon">mdi-history</v-icon> Activity (Placeholder)</h3>
                <p class="section-sub">Recent changes & audit log (future)</p>
              </header>
              <div class="placeholder muted">No activity data implemented yet.</div>
            </section>

            <section v-if="activeSection === 'notes'" key="notes" class="section-block" aria-labelledby="notes-heading">
              <header class="section-header">
                <h3 id="notes-heading"><v-icon size="20" class="mr-1 white-icon">mdi-note-text</v-icon> Notes (Placeholder)</h3>
                <p class="section-sub">Internal remarks & annotations (future)</p>
              </header>
              <div class="placeholder muted">Notes feature not yet implemented.</div>
            </section>
          </main>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useToastStore } from '@/stores/toasts'
import { useEmployeeStore } from '@/stores/employees-db'
import { useAccountsStore } from '@/stores/accounts'
import HeroKpiGroup from '@/components/common/HeroKpiGroup.vue'
import AdvancedFilterPanel from '@/components/common/AdvancedFilterPanel.vue'
import TableFooterSummary from '@/components/common/TableFooterSummary.vue'

// Router removed (was unused)

// Reactive state
const loading = ref(false)
const searchQuery = ref('')
const contractTypeFilter = ref('')
const visaStatusFilter = ref('')
const contractStatusFilter = ref('')
// Advanced filter state
const showAdvanced = ref(true)
// Removed numeric and docs toggle filters per request
// Quick filter flags
const qfExpiringSoon = ref(false)
const qfIncomplete = ref(false)
const qfActive = ref(false)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const showDetailDialog = ref(false)
// Removed unused dialog refs showEditDialog/showDocumentsDialog/showContractDialog
const selectedEmployee = ref<any>(null)
// New redesigned modal state
const activeSection = ref('overview')
const contentArea = ref<HTMLElement | null>(null)
// Removed unused 'opening' ref

// Placeholder pagination refs (will be reassigned after filteredEmployees defined)
let totalPages = computed<number>(() => 1)
let pagedEmployees = computed<TempEmployeeTable[]>(() => [])

// Accounts / Ledger store
const accountsStore = useAccountsStore()
const toast = useToastStore()

// --- Helper to register a payroll event for a temporary employee based on hours worked ---
const logContractHours = (emp: any, hours: number) => {
  if (!emp || !hours || hours <= 0) return
  const amount = Number((emp.hourlyRate * hours).toFixed(2))
  accountsStore.registerPayrollEvent({
    date: new Date().toISOString().slice(0,10),
    employeeId: emp.employeeId,
    employeeName: `${emp.firstName} ${emp.lastName}`,
    type: 'payroll',
    gross: amount,
    taxes: 0, // Simplified for temp staff (could extend later)
    net: amount
  })
  toast.push({ message: `Logged ${hours}h for ${emp.firstName}`, type: 'success' })
}

// (Bonus helper removed to avoid unused warning; reintroduce with UI trigger when needed)

// Firestore employee store integration
const employeeStore = useEmployeeStore()
employeeStore.initialize()

const addTemporaryEmployee = async () => {
  try {
    await employeeStore.createEmployee({
      employeeId: `TMP${Date.now().toString().slice(-5)}`,
      firstName: 'New',
      lastName: 'Temp',
      email: `temp${Date.now()}@example.com`,
      phone: '',
      position: 'Role',
      department: 'General',
      salary: 0,
      hireDate: new Date().toISOString().slice(0,10),
      status: 'active' as any,
      type: 'temporary' as any,
      nationality: 'N/A'
    } as any)
  toast.push({ message: 'Temporary employee added', type: 'success' })
  } catch (e) {
    console.error('Failed to create temporary employee', e)
  toast.push({ message: 'Failed to add temporary employee', type: 'error' })
  }
}

// Prompt helper for logging hours
const promptLogHours = (emp: any) => {
  const input = window.prompt('Hours to log for payroll?', '8')
  if (!input) return
  const h = Number(input)
  if (h > 0) logContractHours(emp, h)
}

// Placeholder methods referenced in template but previously missing
const viewEmployee = (emp: any) => { selectedEmployee.value = emp; showDetailDialog.value = true }
const editEmployee = (emp: any) => { viewEmployee(emp) }
const viewDocuments = (emp: any) => { viewEmployee(emp); activeSection.value = 'documents' }
const viewContract = (emp: any) => { viewEmployee(emp); activeSection.value = 'contract' }
const exportEmployees = () => { toast.push({ message: 'Export not implemented', type: 'info' }) }
const generateReport = () => { toast.push({ message: 'Report not implemented', type: 'info' }) }

// Section metadata
// Sidebar navigation sections (using valid MDI icon names)
const sections = [
  { key: 'overview', label: 'Overview', icon: 'mdi-account-details' },
  // Updated icon: mdi-contract is not a valid MDI glyph in standard set, replaced with file-document-outline
  { key: 'contract', label: 'Contract', icon: 'mdi-file-document-outline' },
  { key: 'documents', label: 'Documents', icon: 'mdi-file-document-multiple' },
  { key: 'visa', label: 'Visa', icon: 'mdi-passport' },
  { key: 'activity', label: 'Activity', icon: 'mdi-history' },
  { key: 'notes', label: 'Notes', icon: 'mdi-note-text' },
]

// Temporary employees derived from Firestore
const temporaryEmployees = computed(() => employeeStore.employees.filter(e => e.type === 'temporary'))

// Formatting & helpers
const formatDate = (iso: string | null | undefined) => iso ? new Date(iso).toLocaleDateString('en-GB') : ''
const calculateDaysRemaining = (iso: string | null | undefined) => {
  if (!iso) return 0; const end = new Date(iso).getTime(); const days = Math.ceil((end - Date.now())/86400000); return days < 0 ? 0 : days
}
const formatCurrency = (val: number) => new Intl.NumberFormat('en-QA',{ style:'currency', currency:'QAR'}).format(val)
const getVisaStatusColor = (s: string) => ({ 'Valid':'success','Expiring Soon':'warning','Expired':'error','Processing':'info','Tourist':'primary' } as Record<string,string>)[s] || 'default'
const getContractStatusColor = (s: string) => ({ 'Active':'success','Completed':'info','Extended':'primary','Terminated':'error','Suspended':'warning','Pending Start':'info' } as Record<string,string>)[s] || 'default'

// Filtering & pagination
const filteredEmployees = computed(() => {
  let list = [...temporaryEmployees.value]
  if (searchQuery.value) { const q = searchQuery.value.toLowerCase(); list = list.filter(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) || e.employeeId.toLowerCase().includes(q)) }
  if (contractTypeFilter.value) list = list.filter(e => e.contractType === contractTypeFilter.value)
  if (visaStatusFilter.value) list = list.filter(e => e.visaStatus === visaStatusFilter.value)
  if (contractStatusFilter.value) list = list.filter(e => e.contractStatus === contractStatusFilter.value)
  if (qfExpiringSoon.value) list = list.filter(e => { const d = calculateDaysRemaining(e.contractEnd); return d>0 && d<=30 })
  if (qfIncomplete.value) list = list.filter(e => !e.qatarIdDocument || !e.passportDocument || !e.contractDocument)
  if (qfActive.value) list = list.filter(e => e.contractStatus === 'Active')
  return list
})
// Pagination derived lists (reassign placeholders)
totalPages = computed(() => Math.max(1, Math.ceil(filteredEmployees.value.length / itemsPerPage.value)))
pagedEmployees = computed(() => filteredEmployees.value.slice(pageStart.value, pageStart.value + itemsPerPage.value))

interface ActivePill { label: string; key: string; type: 'quick' | 'field'; icon: string; clear: () => void }
const activePills = computed<ActivePill[]>(() => {
  const pills: ActivePill[] = []
  if (qfExpiringSoon.value) pills.push({ label:'Expiring <30d', key:'expiring', type:'quick', icon:'mdi-timer-sand', clear: () => { qfExpiringSoon.value = false } })
  if (qfIncomplete.value) pills.push({ label:'Incomplete Docs', key:'incomplete', type:'quick', icon:'mdi-file-alert', clear: () => { qfIncomplete.value = false } })
  if (qfActive.value) pills.push({ label:'Active', key:'active', type:'quick', icon:'mdi-briefcase-check', clear: () => { qfActive.value = false } })
  if (contractTypeFilter.value) pills.push({ label:`Type: ${contractTypeFilter.value}`, key:'ct', type:'field', icon:'mdi-clipboard-text', clear: () => { contractTypeFilter.value = '' } })
  if (visaStatusFilter.value) pills.push({ label:`Visa: ${visaStatusFilter.value}`, key:'visa', type:'field', icon:'mdi-passport', clear: () => { visaStatusFilter.value = '' } })
  if (contractStatusFilter.value) pills.push({ label:`Status: ${contractStatusFilter.value}`, key:'status', type:'field', icon:'mdi-identifier', clear: () => { contractStatusFilter.value = '' } })
  if (searchQuery.value) pills.push({ label:`Search: ${searchQuery.value}`, key:'search', type:'field', icon:'mdi-magnify', clear: () => { searchQuery.value = '' } })
  return pills
})
const activeFilterCount = computed(() => activePills.value.length)

// Documents meta for selected employee
const documentItems = computed(() => {
  const e = selectedEmployee.value; if (!e) return []
  return [
    { key:'qatarIdDocument', label:'Qatar ID', icon:'mdi-card-account-details', color:'primary', present: !!e.qatarIdDocument, value:e.qatarIdDocument },
    { key:'passportDocument', label:'Passport', icon:'mdi-passport', color:'indigo', present: !!e.passportDocument, value:e.passportDocument },
    { key:'contractDocument', label:'Contract', icon:'mdi-file-document-outline', color:'green', present: !!e.contractDocument, value:e.contractDocument }
  ]
})
const documentCount = computed(() => documentItems.value.filter(d => d.present).length)
const totalDocuments = computed(() => documentItems.value.length)
const requiredFields = ['employeeId','firstName','lastName','email','contractType','position','hourlyRate','contractStart','contractEnd']
const viewDocument = (path: string) => toast.push({ message: `Open doc: ${path}`, type: 'info' })

// KPI Metrics
const totalEmployees = computed(() => temporaryEmployees.value.length)
const activeContracts = computed(() => temporaryEmployees.value.filter(e => e.contractStatus === 'Active').length)
const expiringContracts = computed(() => temporaryEmployees.value.filter(e => {
  const end = new Date(e.contractEnd)
  const days = (end.getTime() - Date.now()) / 86400000
  return days > 0 && days <= 30
}).length)
const incompleteProfiles = computed(() => temporaryEmployees.value.filter(e => !e.qatarIdDocument || !e.passportDocument || !e.contractDocument).length)
// Removed profileCompletionPct (radial progress no longer displayed)
// (fully removed)

// Shared hero KPI mapping for component
const heroKpis = computed(() => [
  { key: 'total', label: 'Total', value: totalEmployees.value, foot: 'Employees' },
  { key: 'active', label: 'Active Contracts', value: activeContracts.value, foot: `${expiringContracts.value} expiring <30d`, warn: expiringContracts.value > 0 },
  { key: 'incomplete', label: 'Incomplete Profiles', value: incompleteProfiles.value, foot: `${incompleteProfiles.value ? 'Needs attention' : 'All docs present'}`, warn: incompleteProfiles.value > 0 }
])

// Employee type (lightweight for table scope)
interface TempEmployeeTable {
  id: number; employeeId: string; firstName: string; lastName: string; email: string;
  contractType: string; position: string; contractStart: string; contractEnd: string; hourlyRate: number;
  contractStatus: string; visaStatus: string; qatarIdDocument?: string | null; passportDocument?: string | null; contractDocument?: string | null;
}

// Pagination helpers (client-side)
const pageStart = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const pageEnd = computed(() => pageStart.value + itemsPerPage.value)
// (totalPages & pagedEmployees declared earlier after filteredEmployees)

// Table headers
const headers = [
  { title: 'Employee', key: 'employee', sortable: false, width: '200px' },
  { title: 'ID', key: 'employeeId', width: '80px' },
  { title: 'Contract Type', key: 'contractType', width: '120px' },
  { title: 'Position', key: 'position', width: '130px' },
  { title: 'Docs', key: 'documents', width: '90px', sortable: false },
  { title: 'Duration', key: 'contractDuration', width: '120px' },
  { title: 'Visa Status', key: 'visaStatus', width: '110px' },
  { title: 'Rate', key: 'hourlyRate', width: '90px' },
  { title: 'Status', key: 'contractStatus', width: '90px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '140px' }
]

// Option arrays
const contractTypeOptions = ['Project Based','Seasonal','Fixed Term','Part Time','Consultant']
const visaStatusOptions = ['Valid','Expiring Soon','Expired','Processing','Tourist']
const contractStatusOptions = ['Active','Completed','Extended','Terminated','Suspended','Pending Start']

// Quick filters meta
const quickFilters = computed(() => [
  {
    key: 'expiring',
    label: 'Expiring <30d',
    icon: 'mdi-timer-sand',
    isActive: qfExpiringSoon.value,
    badge: expiringContracts.value || 0,
    severity: expiringContracts.value ? 'warn' : undefined
  },
  {
    key: 'incomplete',
    label: 'Incomplete Docs',
    icon: 'mdi-file-alert',
    isActive: qfIncomplete.value,
    badge: incompleteProfiles.value || 0,
    severity: incompleteProfiles.value ? 'warn' : undefined
  },
  {
    key: 'active',
    label: 'Active Contracts',
    icon: 'mdi-briefcase-check',
    isActive: qfActive.value,
    badge: activeContracts.value || 0
  }
])

const toggleQuickFilter = (key: string) => {
  switch (key) {
    case 'expiring': qfExpiringSoon.value = !qfExpiringSoon.value; break
    case 'incomplete': qfIncomplete.value = !qfIncomplete.value; break
    case 'active': qfActive.value = !qfActive.value; break
  }
}


const resetAllFilters = () => {
  searchQuery.value = ''
  contractTypeFilter.value = ''
  visaStatusFilter.value = ''
  contractStatusFilter.value = ''
  // Removed numeric & docs toggle filters (no reset needed)
  qfExpiringSoon.value = false
  qfIncomplete.value = false
  qfActive.value = false
}


const rowClass = (item: any) => {
  if (!item) return ''
  const days = calculateDaysRemaining(item.contractEnd)
  if (days > 0 && days <= 30) return 'row-expiring'
  if (!item.qatarIdDocument || !item.passportDocument || !item.contractDocument) return 'row-incomplete'
  return ''
}

const presenceClass = (item: any) => {
  return item.contractStatus === 'Active' ? 'presence-online' : 'presence-offline'
}

// Quick filter keyboard nav handled inside shared component now

// Section helpers
const setSection = (key: string) => {
  activeSection.value = key
  nextTick(() => contentArea.value?.scrollTo({ top: 0, behavior: 'smooth' }))
}

// Print summary (basic implementation)
const printSummary = () => {
  if (!selectedEmployee.value) return
  const w = window.open('', '_blank')
  if (!w) return
  const emp = selectedEmployee.value
  w.document.write(`<html><head><title>Employee Summary</title><style>
    body { font-family: Arial; padding: 24px; }
    h1 { margin-top:0; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    td { border:1px solid #ddd; padding:6px 10px; font-size:13px; }
    th { text-align:left; padding:8px 10px; background:#f5f5f5; }
  </style></head><body>`)
  w.document.write(`<h1>${emp.firstName} ${emp.lastName}</h1>`)
  w.document.write('<table>')
  requiredFields.forEach(f => {
    w.document.write(`<tr><th>${f}</th><td>${emp[f] || ''}</td></tr>`) 
  })
  w.document.write('</table></body></html>')
  w.document.close()
  w.print()
}

// Expose quick action for dev console (optional)
// @ts-ignore
window.__logTempHours = logContractHours

// Watch dialog close to reset focus state
watch(showDetailDialog, val => {
  if (!val) {
    activeSection.value = 'overview'
  }
})
</script>

<style scoped>
.v-data-table :deep(.v-data-table__td) {
  padding: 6px 8px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.v-data-table :deep(.v-data-table__th) {
  padding: 8px 8px !important;
  font-weight: 600;
  font-size: 0.75rem;
  background-color: #f8f9fa;
  border-bottom: 2px solid rgba(0, 0, 0, 0.12);
}

/* Sticky header */
.temp-table :deep(thead) { position: sticky; top: 0; z-index: 5; box-shadow:0 1px 0 rgba(0,0,0,0.08); }

/* Row highlights (polished subtle gradients) */
.temp-table :deep(.row-expiring) { background: linear-gradient(90deg, rgba(255,222,173,0.18), rgba(255,222,173,0)); }
.temp-table :deep(.row-expiring:hover) { background: linear-gradient(90deg, rgba(255,222,173,0.32), rgba(255,222,173,0.04)); }
.temp-table :deep(.row-incomplete) { background: linear-gradient(90deg, rgba(255,235,230,0.22), rgba(255,235,230,0)); }
.temp-table :deep(.row-incomplete:hover) { background: linear-gradient(90deg, rgba(255,235,230,0.38), rgba(255,235,230,0.05)); }

/* Avatar presence indicator */
.avatar-wrapper {position:relative; display:inline-flex; border-radius:50%;}
.avatar-wrapper:after {content:''; position:absolute; width:10px; height:10px; border-radius:50%; bottom:0; right:0; border:2px solid #fff; background:#9ca3af;}
.avatar-wrapper.presence-online:after { background:#16a34a; }
.avatar-wrapper.presence-offline:after { background:#9ca3af; }
.emp-cell { gap:10px; }
.emp-meta { line-height:1.1; }
.emp-name { font-weight:600; }
.emp-email { opacity:.75; }

/* Footer enhancements */
.table-footer-enhanced { background:#fafbfc; border-top:1px solid #e5e7eb; }
.summary-inline { font-size:11px; letter-spacing:.3px; opacity:.75; }
.rows-select :deep(.v-field__input) { padding:0 4px !important; }
.footer-controls { gap:4px; }

/* Ensure white text on maroon gradients */
.temp-hero, .employee-modal-nav, .employee-detail-dialog .v-card-title.bg-primary { color:#fff; }
.temp-hero .v-btn, .employee-modal-nav .v-btn { color:#fff; }
.temp-hero .kpi-card { color:#fff; }
.employee-modal-nav .nav-link { color:#fff; }
.employee-modal-nav .nav-link.active { color:#6B0F2A; }
.employee-modal-nav .nav-link.active span { color:#6B0F2A; }
.employee-modal-nav .nav-link.active .v-icon { color:#6B0F2A !important; }

/* Force icons inside maroon regions to inherit white unless overridden */
.temp-hero .v-icon, .employee-modal-nav .v-icon, .employee-detail-dialog .v-card-title .v-icon { color:#fff !important; }
.temp-hero .v-btn.variant-outlined .v-icon { color:#fff !important; }

/* Accessibility utilities */
.visually-hidden-focusable {position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;}
.visually-hidden-focusable:focus {position:static;width:auto;height:auto;margin:0;padding:8px 12px;background:#8B1538;color:#fff;border-radius:6px;box-shadow:0 0 0 3px rgba(255,255,255,0.6);}
.qf-btn:focus-visible, .filter-pill:focus-visible, .af-field select:focus-visible, .af-field input:focus-visible {outline:2px solid #8B1538; outline-offset:2px;}



.v-data-table :deep(.v-data-table-header__content) {
  font-weight: 600;
  color: #424242;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: rgba(156, 39, 176, 0.04);
}

.employee-detail-dialog .v-card-title {
  background: linear-gradient(135deg, #8B1538 0%, #6B0F2A 100%) !important;
  color: white !important;
}

/* Modal Contrast Improvements */
.employee-detail-dialog.redesigned .employee-modal-nav { position:relative; background:linear-gradient(150deg,#7A1231 0%,#6B0F2A 60%,#520a21 100%); color:#fff; }
.employee-detail-dialog.redesigned .employee-modal-nav:before { content:""; position:absolute; inset:0; background:radial-gradient(circle at 30% 20%,rgba(255,255,255,0.18),transparent 65%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0)); pointer-events:none; }
.employee-detail-dialog.redesigned .employee-modal-nav > * { position:relative; z-index:2; }
.employee-detail-dialog.redesigned .employee-modal-nav .emp-name { color:#fff; font-weight:600; letter-spacing:.4px; }
.employee-detail-dialog.redesigned .employee-modal-nav .emp-position { color:rgba(255,255,255,0.85); font-size:13px; margin-top:2px; font-weight:500; }
.employee-detail-dialog.redesigned .employee-modal-nav .progress-caption { color:rgba(255,255,255,0.85); font-weight:500; }
.employee-detail-dialog.redesigned .employee-modal-nav .nav-link { color:rgba(255,255,255,0.9); }
.employee-detail-dialog.redesigned .employee-modal-nav .nav-link .v-icon { color:rgba(255,255,255,0.94) !important; }
.employee-detail-dialog.redesigned .employee-modal-nav .nav-link.active { background:#ffffff; color:#5A0F24; border-radius:14px; box-shadow:0 8px 22px -8px rgba(0,0,0,.5),0 2px 8px rgba(0,0,0,.3); font-weight:700; }
.employee-detail-dialog.redesigned .employee-modal-nav .nav-link.active span { color:#5A0F24; }
.employee-detail-dialog.redesigned .employee-modal-nav .nav-link.active .v-icon { color:#6B0F2A !important; }
.employee-detail-dialog.redesigned .employee-modal-nav .chips-row .v-chip { backdrop-filter:blur(4px); font-weight:600; letter-spacing:.3px; }
.employee-detail-dialog.redesigned .employee-modal-nav .chips-row .v-chip[variant~='outlined'] { border-color:rgba(255,255,255,0.65) !important; background:rgba(255,255,255,0.08) !important; }
.employee-detail-dialog.redesigned .employee-modal-nav .chips-row .v-chip:not([variant~='outlined']) { background:rgba(255,255,255,0.22) !important; color:#fff !important; }
.employee-detail-dialog.redesigned .employee-modal-nav .chips-row .v-chip[variant~='elevated'] { background:linear-gradient(145deg,#34d399,#059669) !important; color:#fff !important; box-shadow:0 2px 6px -2px rgba(0,0,0,.4),0 1px 2px rgba(0,0,0,.35) !important; font-weight:600; }
.employee-detail-dialog.redesigned .employee-modal-nav .chips-row .v-chip.success { background:linear-gradient(140deg,#34d399 0%,#059669 50%,#047857 100%) !important; }
.employee-detail-dialog.redesigned .employee-modal-nav .chips-row .v-chip.info { background:linear-gradient(140deg,#60a5fa 0%,#3b82f6 60%,#1d4ed8 100%) !important; color:#fff !important; }
.employee-detail-dialog.redesigned .employee-modal-nav .chips-row .status-chip.status-active { 
  background:#10b981 !important; /* Solid emerald (no gradient) */
  color:#fff !important; font-weight:600; letter-spacing:.3px;
  position:relative; 
  box-shadow:0 0 0 1px rgba(255,255,255,0.35) inset, 0 2px 6px -2px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.35);
  border:1px solid rgba(255,255,255,0.35) !important;
  backdrop-filter:blur(2px);
}
.employee-detail-dialog.redesigned .employee-modal-nav .chips-row .status-chip.status-active:hover { 
  box-shadow:0 0 0 1px rgba(255,255,255,0.45) inset, 0 3px 8px -3px rgba(0,0,0,.6), 0 1px 3px rgba(0,0,0,.4);
}
.employee-detail-dialog.redesigned .employee-modal-nav .chips-row .emp-id-chip { 
  background:rgba(255,255,255,0.16) !important; /* Subtle frosted base (no gradient) */
  border:1px solid rgba(255,255,255,0.55) !important; 
  color:#ffffff !important; font-weight:600; letter-spacing:.45px; 
  position:relative; 
  box-shadow:0 0 0 1px rgba(255,255,255,0.35) inset, 0 2px 5px -2px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.35);
  backdrop-filter:blur(4px);
}
.employee-detail-dialog.redesigned .employee-modal-nav .chips-row .emp-id-chip:hover { 
  background:rgba(255,255,255,0.24) !important; 
  box-shadow:0 0 0 1px rgba(255,255,255,0.45) inset, 0 3px 7px -3px rgba(0,0,0,.6), 0 1px 3px rgba(0,0,0,.45);
}
.employee-detail-dialog.redesigned .employee-modal-nav .side-actions .v-btn.variant-outlined { --btn-border:rgba(255,255,255,0.55); border-color:var(--btn-border) !important; color:#fff !important; }
.employee-detail-dialog.redesigned .employee-modal-nav .side-actions .v-btn.variant-text.text-danger { color:#ffd7de !important; }
.employee-detail-dialog.redesigned .employee-modal-nav .side-actions .v-btn.variant-text.text-danger:hover { color:#fff !important; }
.employee-detail-dialog.redesigned .employee-modal-nav .side-actions .v-btn:hover { box-shadow:0 3px 10px -2px rgba(0,0,0,.45); }

/* High contrast hover / focus states */
.employee-detail-dialog.redesigned .employee-modal-nav .nav-link:hover:not(.active) { background:rgba(255,255,255,0.12); border-radius:10px; }
.employee-detail-dialog.redesigned .employee-modal-nav .nav-link:focus-visible { outline:2px solid #ffffff; outline-offset:3px; box-shadow:0 0 0 3px rgba(255,255,255,0.35); }

/* Ensure minimum contrast on radial progress edges */
.employee-detail-dialog.redesigned .progress-block .radial-progress { outline:2px solid rgba(255,255,255,0.18); }
.employee-detail-dialog.redesigned .employee-modal-content { background:#fafbfc; }
.employee-detail-dialog.redesigned .employee-modal-content .section-header h3 { color:#222; font-weight:600; letter-spacing:.3px; }
.employee-detail-dialog.redesigned .employee-modal-content .section-sub { color:#444d56; font-weight:500; }
.employee-detail-dialog.redesigned .employee-modal-content .data-label { color:#3d4550; font-size:11px; font-weight:700; letter-spacing:.65px; text-transform:uppercase; }
.employee-detail-dialog.redesigned .employee-modal-content .data-value { color:#17181a; font-weight:600; letter-spacing:.2px; }
.employee-detail-dialog.redesigned .employee-modal-content .muted { color:#56606b; }
.employee-detail-dialog.redesigned .employee-modal-content .white-icon { color:#8B1538 !important; }
.employee-detail-dialog.redesigned .employee-modal-content .doc-item { background:#fff; border:1px solid #e3e6ea; border-radius:10px; padding:10px 12px; }
.employee-detail-dialog.redesigned .employee-modal-content .doc-item .doc-name { color:#1f2933; font-weight:500; }
.employee-detail-dialog.redesigned .employee-modal-content .doc-item .doc-meta { color:#5f6b76; font-size:12px; }
.employee-detail-dialog.redesigned .employee-modal-content .v-divider { border-color:#e5e7eb !important; }
.employee-detail-dialog.redesigned .employee-modal-content .info-grid { --cols:220px; display:grid; grid-template-columns:repeat(auto-fill,minmax(var(--cols),1fr)); gap:18px 22px; }
.employee-detail-dialog.redesigned .employee-modal-content .info-block { display:flex; flex-direction:column; gap:4px; }
.employee-detail-dialog.redesigned .employee-modal-content .badge-inline { display:inline-flex; align-items:center; gap:4px; background:#8B1538; color:#fff; font-size:11px; padding:2px 8px; border-radius:14px; }
.employee-detail-dialog.redesigned .employee-modal-content .highlight-box { background:#fff; border:1px solid #dadfe4; padding:14px 16px; border-radius:14px; box-shadow:0 2px 4px rgba(0,0,0,.04); }
.employee-detail-dialog.redesigned .employee-modal-content .highlight-box h4 { margin:0 0 6px; font-size:13px; font-weight:600; color:#8B1538; letter-spacing:.4px; }
.employee-detail-dialog.redesigned .employee-modal-content .highlight-box p { margin:0; color:#2d3640; font-size:12.75px; line-height:1.5; }
.employee-detail-dialog.redesigned .employee-modal-content .section-block { background:#fff; border:1px solid #dde2e6; padding:20px 22px 24px; border-radius:20px; box-shadow:0 4px 16px -6px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.04); }
.employee-detail-dialog.redesigned .employee-modal-content .section-block + .section-block { margin-top:28px; }
.employee-detail-dialog.redesigned .content-top-bar { background:#fff; border-bottom:1px solid #e5e7eb; }
.employee-detail-dialog.redesigned .breadcrumbs { color:#6b727c; }
.employee-detail-dialog.redesigned .breadcrumbs .current { color:#8B1538; font-weight:700; letter-spacing:.3px; }
.employee-detail-dialog.redesigned .side-actions .v-btn:not(.text-danger) { color:#fff !important; }
.employee-detail-dialog.redesigned .side-actions .v-btn.text-danger { color:#fff !important; opacity:.9; }
.employee-detail-dialog.redesigned .side-actions .v-btn.text-danger:hover { opacity:1; }
.employee-detail-dialog.redesigned .progress-block .radial-progress { --size:120px; width:var(--size); height:var(--size); background:conic-gradient(#33c48b calc(var(--val)*1%), rgba(255,255,255,0.15) 0); border-radius:50%; position:relative; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 18px -6px rgba(0,0,0,.4), inset 0 0 0 6px rgba(255,255,255,0.08); }
.employee-detail-dialog.redesigned .progress-block .progress-caption { font-weight:600; letter-spacing:.4px; }
.employee-detail-dialog.redesigned .progress-block .radial-progress:before { content:''; position:absolute; inset:10px; background:linear-gradient(145deg,rgba(255,255,255,0.15),rgba(255,255,255,0.02)); border-radius:inherit; }
.employee-detail-dialog.redesigned .progress-block .radial-progress .progress-value { position:relative; font-size:26px; font-weight:700; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,.4); }
.employee-detail-dialog.redesigned .progress-block { display:flex; flex-direction:column; align-items:center; gap:10px; margin:22px 0 28px; }

/* Ensure all text inside maroon side panel meets contrast ratios */
.employee-detail-dialog.redesigned .employee-modal-nav p, 
.employee-detail-dialog.redesigned .employee-modal-nav span, 
.employee-detail-dialog.redesigned .employee-modal-nav li, 
.employee-detail-dialog.redesigned .employee-modal-nav button { color:rgba(255,255,255,0.9); }

/* Adjust scroll area background for clarity */
.employee-detail-dialog.redesigned .employee-modal-content::-webkit-scrollbar-thumb { background:#c2c6cc; }

@media (max-width:980px){
  .employee-detail-dialog.redesigned .employee-modal-layout { flex-direction:column; }
  .employee-detail-dialog.redesigned .employee-modal-nav { flex-direction:row; overflow-x:auto; padding:20px 24px; }
  .employee-detail-dialog.redesigned .employee-modal-content { padding-top:8px; }
}

/* Focus states for navigation links */
.employee-detail-dialog.redesigned .employee-modal-nav .nav-link:focus-visible { outline:2px solid #ffffff; outline-offset:3px; }
.employee-detail-dialog.redesigned .employee-modal-content a:focus-visible, 
.employee_detail_dialog.redesigned .employee-modal-content button:focus-visible { outline:2px solid #8B1538; outline-offset:3px; }

/* Improve chip contrast inside side panel */
.employee-detail-dialog.redesigned .employee-modal-nav .chips-row .v-chip { color:#fff !important; }
.employee-detail-dialog.redesigned .employee-modal-nav .chips-row .v-chip[variant~='outlined'] { background:rgba(255,255,255,0.08) !important; }

/* Ensure tab text contrast */
.employee-detail-dialog.redesigned .employee-modal-content .v-tab { color:#49515a !important; }
.employee-detail-dialog.redesigned .employee-modal-content .v-tab.v-tab--selected { color:#8B1538 !important; }

@media (prefers-color-scheme: dark){
  .employee-detail-dialog.redesigned .employee-modal-content { background:#f5f7f9; }
}

.employee-detail-dialog .v-window-item {
  min-height: 400px;
}

.employee-detail_dialog .v-tabs {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.employee-detail-dialog .v-tab {
  font-weight: 500;
  text-transform: none;
}

.employee-detail-dialog .v-tab--selected {
  color: #8B1538 !important;
}

.action-btn {
  transition: all 0.2s ease-in-out !important;
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
  margin: 0 2px !important;
}

.action-btn:hover {
  background-color: rgba(139, 21, 56, 0.08) !important;
  transform: scale(1.05) !important;
}

.action-btn .v-icon {
  font-size: 18px !important;
  color: #8B1538 !important;
}

.employee-detail-dialog .v-card {
  border-radius: 8px;
}

.employee-detail-dialog .v-card-title {
  border-radius: 8px 8px 0 0;
}

/* Ensure dialog header has proper maroon theme with white text */
.employee-detail-dialog .v-card-title.bg-primary {
  background: linear-gradient(135deg, #8B1538 0%, #6B0F2A 100%) !important;
  color: white !important;
}

.employee-detail-dialog .v-card-title.bg-primary .v-icon {
  color: white !important;
}

.employee-detail-dialog .v-card-title:not(.bg-primary) .v-icon {
  color: #8B1538 !important;
}

.employee-detail-dialog .v-card-title .v-chip {
  color: white !important;
}

/* Force ALL icons to be visible with proper colors */
.employee-detail-dialog .v-icon {
  color: #8B1538 !important;
  opacity: 1 !important;
  visibility: visible !important;
  display: inline-flex !important;
}

/* Section title icons - WHITE COLOR */
.employee-detail-dialog .modal-section-icon {
  color: white !important;
}

/* Document icons */
.employee-detail-dialog .document-icon-blue {
  color: #1976d2 !important;
}

.employee-detail-dialog .document-icon-green {
  color: #4caf50 !important;
}

/* Tab icons */
.employee-detail-dialog .v-tab .v-icon {
  color: #666666 !important;
}

.employee-detail-dialog .v-tab--selected .v-icon {
  color: #8B1538 !important;
}

/* Main header icons (maroon background) */
.employee-detail-dialog .v-card-title.bg-primary .v-icon {
  color: white !important;
}

/* Force sidebar nav icons white regardless of state */
.employee-detail-dialog.redesigned .employee-modal-nav .nav-link .v-icon,
.employee-detail-dialog.redesigned .employee-modal-nav .nav-link.active .v-icon { color:#ffffff !important; }

/* Fix input field text visibility */
.v-text-field input,
.v-select .v-select__selection,
.v-text-field .v-field__input,
.v-select .v-field__input {
  color: #424242 !important;
}

.v-text-field .v-label,
.v-select .v-label {
  color: #757575 !important;
}

.v-text-field .v-field__input::placeholder,
.v-select .v-field__input::placeholder {
  color: #9e9e9e !important;
}

/* Ensure input fields are properly visible */
.v-text-field,
.v-select {
  color: #424242 !important;
}

.v-text-field .v-field,
.v-select .v-field {
  color: #424242 !important;
}

/* More specific input field styling */
.v-text-field .v-field__field input {
  color: #424242 !important;
  opacity: 1 !important;
}

.v-select .v-field__field .v-select__selection {
  color: #424242 !important;
  opacity: 1 !important;
}

/* Fix outlined variant specifically */
.v-text-field--variant-outlined .v-field__input,
.v-select--variant-outlined .v-field__input {
  color: #424242 !important;
}

/* Ensure labels are visible */
.v-field--active .v-label,
.v-field--focused .v-label {
  color: #1976d2 !important;
}

/* Advanced Filter Panel */
.adv-filter-panel {background:#ffffff; border:1px solid #e5e7eb; border-radius:22px; position:relative; box-shadow:0 4px 18px -4px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.04); overflow:hidden;}
.adv-filter-panel:before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#f8f9fa,#eef1f4);opacity:.85;}
.adv-filter-panel > * {position:relative; z-index:2;}
.af-header{display:flex;justify-content:space-between;align-items:center;padding:14px 20px 12px;border-bottom:1px solid #e5e7eb;background:linear-gradient(135deg,#fafbfc,#f0f3f6);} 
.af-title-group{display:flex;align-items:center;gap:6px;font-weight:600;font-size:15px;}
.af-title{margin:0;font-size:16px;font-weight:600;letter-spacing:.5px;}
.af-header-actions{display:flex;align-items:center;gap:4px;}
.quick-filters{display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px 6px;}
.qf-btn{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:500;letter-spacing:.3px;padding:6px 12px;border:1px solid #d5d9de;border-radius:28px;background:#fff;color:#374151;cursor:pointer;transition:.28s background,.28s color,.28s border,.28s box-shadow;position:relative;}
.qf-btn:hover{background:#f0f2f4;}
.qf-btn.active{background:linear-gradient(135deg,#8B1538,#6B0F2A);color:#fff;border-color:#8B1538;box-shadow:0 4px 14px -4px rgba(139,21,56,.55);} 
.qf-btn.active .v-icon{color:#ffffff !important;}
.qf-btn .v-icon{color:inherit !important;}
.qf-badge{background:#e5e7eb;color:#333;font-size:10px;font-weight:600;line-height:1; padding:3px 6px; border-radius:10px; margin-left:4px; position:relative; top:-1px;}
.qf-badge[data-severity="warn"]{background:#fff3cd;color:#924c00;}
.active-pills{padding:0 16px 2px;}
.pill-wrap{display:flex;flex-wrap:wrap;gap:8px;}
.filter-pill{display:inline-flex;align-items:center;max-width:220px;background:#fff;border:1px solid #d9dde2;border-radius:18px;padding:4px 8px 4px 10px;font-size:11px;font-weight:500;line-height:1; box-shadow:0 2px 4px rgba(0,0,0,.05); transition:.25s background,.25s border,.25s box-shadow;}
.filter-pill:hover{background:#f7f9fa;}
.filter-pill[data-type="quick"]{background:#8B1538;color:#fff;border-color:#8B1538;} 
.filter-pill[data-type="quick"] .v-icon{color:#fff !important;}
.filter-pill .v-icon{color:#657080 !important;}
.pill-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pill-clear{background:transparent;border:none;display:inline-flex;align-items:center;justify-content:center;margin-left:4px;padding:2px;cursor:pointer;color:inherit;}
.pill-clear .v-icon{font-size:14px !important;}
.advanced-region{padding:12px 18px 20px;border-top:1px dashed #e2e5e9;animation:slideDown .35s ease;}
@keyframes slideDown{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}
.af-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:18px;}
.af-field{display:flex;flex-direction:column;gap:6px;}
.af-label{font-size:11px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:#5a6472;}
.af-input-icon{position:relative;display:flex;align-items:center;}
.af-input-icon input{width:100%;padding:8px 28px 8px 34px;font-size:13px;border:1px solid #cfd4da;border-radius:10px;background:#ffffff;transition:.25s border,.25s box-shadow;}
.af-input-icon input:focus{outline:none;border-color:#8B1538;box-shadow:0 0 0 3px rgba(139,21,56,.15);}
.af-input-icon .v-icon{position:absolute;left:10px;color:#ffffff;}
.clear-mini{position:absolute;right:6px;border:none;background:transparent;padding:2px;cursor:pointer;color:#6b7280;}
.clear-mini .v-icon{font-size:14px !important;color:#6b7280 !important;}
.af-field select, .af-field input[type=number]{padding:8px 12px;font-size:13px;border:1px solid #cfd4da;border-radius:10px;background:#ffffff;transition:.25s;border:.25s box-shadow;}
.af-field select:focus, .af-field input[type=number]:focus{outline:none;border-color:#8B1538;box-shadow:0 0 0 3px rgba(139,21,56,.15);}
.af-toggle{display:flex;align-items:flex-start;justify-content:space-between;}
.af-toggle .v-switch{margin-top:2px;}
.pill-fade-enter-active,.pill-fade-leave-active{transition:all .25s ease;}
.pill-fade-enter-from{opacity:0;transform:translateY(-4px);} 
.pill-fade-leave-to{opacity:0;transform:translateY(-4px);} 
@media (max-width:780px){.af-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));}}
@media (max-width:640px){.af-header{flex-wrap:wrap;gap:10px;}.quick-filters{padding-top:10px;}}

/* ================= Redesigned Modal Styles ================= */
.employee-detail_dialog.redesigned {
  --brand: #8B1538;
  --brand-dark: #6B0F2A;
  --surface-alt: #fafbfc;
  --border: #e4e7eb;
  --track: #e5e7eb;
  --radius: 14px;
}

.employee-modal-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  min-height: 620px;
  max-height: 80vh;
  position: relative;
}

.employee-modal-nav {
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%);
  padding: 24px 20px 16px;
  color: #fff;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius) 0 0 var(--radius);
  overflow-y: auto;
}

.employee-modal-content {
  background: #fff;
  padding: 0;
  border-left: 1px solid var(--border);
  position: relative;
  overflow-y: auto;
  outline: none;
}

.content-top-bar {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffffd9;
  backdrop-filter: blur(6px);
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  z-index: 5;
}
.breadcrumbs .current { font-weight:600; }

.profile-block { text-align: center; margin-bottom: 20px; }
.emp-name { font-size: 18px; font-weight: 600; margin: 0 0 2px; }
.emp-position { font-size: 12px; opacity: 0.85; margin: 0 0 8px; }
.chips-row { display: flex; justify-content: center; flex-wrap: wrap; }

.progress-block { text-align: center; margin: 8px 0 24px; }
.radial-progress {
  width: 120px; height: 120px; border-radius: 50%;
  margin: 0 auto 8px; display:flex; align-items:center; justify-content:center;
  position: relative; font-size: 18px; font-weight: 600; color:#333;
  background: conic-gradient(var(--brand) 0%, var(--track) 0%);
}
.radial-progress::after {
  content: ''; position:absolute; inset:8px; background:#fff; border-radius:50%;
}
.radial-progress .progress-value { position:relative; z-index:2; font-size: 16px; }
.progress-caption { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; opacity:.9; }

.section-nav ul { list-style:none; margin:0; padding:0; }
.section-nav li { margin-bottom:4px; }
.section-nav .nav-link {
  width:100%; display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.15); padding:8px 10px; border-radius:8px;
  font-size:13px; color:#fff; transition:.25s background, .25s border, .25s transform;
}
.section-nav .nav-link:hover { background:rgba(255,255,255,0.15); transform:translateX(4px); }
.section-nav .nav-link.active { background:#fff; color:var(--brand); border-color:#fff; font-weight:600; }
.section-nav .nav-link.active .v-icon { color: var(--brand) !important; }

.side-actions { margin-top: auto; padding-top: 12px; border-top:1px solid rgba(255,255,255,0.15); }
.side-actions .text-danger { color: #ffb4b4 !important; }
.side-actions .text-danger:hover { background: rgba(255,255,255,0.12); }

.employee-modal-content .section-block { padding: 28px 32px 40px; animation: fadeSlide .35s ease; }
@keyframes fadeSlide { from { opacity:0; transform:translateY(8px);} to { opacity:1; transform:translateY(0);} }

.section-header h3 { margin:0; font-size:20px; font-weight:600; display:flex; align-items:center; }
.section-header .section-sub { margin:4px 0 20px; font-size:12px; text-transform:uppercase; letter-spacing:.5px; color:#6b7280; }

.grid.two { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:28px; }
.grid.one { display:grid; grid-template-columns:1fr; gap:24px; margin-bottom:28px; }

.panel { background: var(--surface-alt); border:1px solid var(--border); border-radius:12px; padding:18px 20px 12px; position:relative; }
.panel-title { margin:0 0 12px; font-size:13px; font-weight:600; letter-spacing:.5px; text-transform:uppercase; display:flex; align-items:center; gap:4px; color:#333; }
.white-icon { color: var(--brand) !important; }

.data-list { list-style:none; margin:0; padding:0; font-size:12px; }
.data-list li { display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed #e2e5e9; }
.data-list li:last-child { border-bottom:none; }
.data-list span { color:#6b7280; }
.data-list strong { font-weight:600; color:#111827; }

.kpi-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; margin-top:4px; }
.kpi { background:#fff; border:1px solid var(--border); border-radius:10px; padding:12px 14px; }
.kpi-label { font-size:11px; text-transform:uppercase; letter-spacing:.5px; color:#6b7280; margin-bottom:4px; }
.kpi-value { font-size:13px; font-weight:600; }
.kpi-value.kpi-value--small { font-size:11px; font-weight:500; letter-spacing:.3px; }

.documents-list { display:flex; flex-direction:column; gap:10px; }
.doc-item { display:flex; align-items:center; background:var(--surface-alt); border:1px solid var(--border); border-radius:10px; padding:10px 14px; gap:14px; }
.doc-icon { width:34px; height:34px; border-radius:8px; background:#fff; display:flex; align-items:center; justify-content:center; border:1px solid var(--border); }
.doc-title { font-size:13px; font-weight:600; }
.doc-status { font-size:11px; }
.doc-status.missing { color:#b91c1c; }
.doc-actions { margin-left:auto; }

.placeholder { background: var(--surface-alt); border:1px dashed var(--border); border-radius:10px; padding:28px; text-align:center; font-size:13px; }
.placeholder.muted { color:#6b7280; }

/* Scrollbar styling */
.employee-modal-content::-webkit-scrollbar { width:10px; }
.employee-modal-content::-webkit-scrollbar-track { background: #f2f3f5; }
.employee-modal-content::-webkit-scrollbar-thumb { background: #c2c7cc; border-radius:5px; }
.employee-modal-content::-webkit-scrollbar-thumb:hover { background:#a8adb3; }

@media (max-width: 980px) {
  .employee-modal-layout { grid-template-columns: 1fr; }
  .employee-modal-nav { border-radius: var(--radius) var(--radius) 0 0; flex-direction:row; flex-wrap:wrap; justify-content:center; }
  .section-nav { width:100%; order:3; }
  .section-nav .nav-link { background:rgba(255,255,255,0.12); }
  .employee-modal-content { border-left:none; }
}

@media (max-width: 640px) {
  .grid.two { grid-template-columns:1fr; }
  .employee-modal-content .section-block { padding:22px 20px 32px; }
  .content-top-bar { padding:8px 14px; }
  .radial-progress { width:90px; height:90px; }
}

/* Hero KPI Styles */
.temp-hero {display:flex; flex-wrap:wrap; gap:30px; background:linear-gradient(135deg,#8B1538 0%,#6B0F2A 55%,#5a0d24 100%); padding:34px 40px 36px; border-radius:26px; position:relative; overflow:hidden;}
.temp-hero:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 85% 20%,rgba(255,255,255,0.25),transparent 60%);pointer-events:none;}
.hero-intro{flex:1 1 320px; min-width:260px; max-width:480px;}
.hero-title{margin:0 0 10px;font-size:30px;font-weight:700;letter-spacing:.5px;color:#fff;}
.hero-sub{margin:0 0 18px;font-size:14px;line-height:1.55;color:rgba(255,255,255,0.88);}
.hero-actions{display:flex;gap:8px;flex-wrap:wrap;}
.hero-kpis{flex:1 1 460px;min-width:340px;display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));}
.kpi-card{background:rgba(255,255,255,0.14);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);border-radius:18px;padding:14px 16px 16px;position:relative;color:#fff;overflow:hidden;display:flex;flex-direction:column;transition:.35s transform,.35s box-shadow;}
.kpi-card:hover{transform:translateY(-3px); box-shadow:0 6px 24px -8px rgba(139,21,56,.55);} 
.kpi-card:after{content:'';position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,0.22),rgba(255,255,255,0));opacity:0;transition:.35s;}
.kpi-card:hover:after{opacity:1;}
.kpi-label{font-size:11px;text-transform:uppercase;letter-spacing:.65px;opacity:.8;font-weight:600;}
.kpi-value{font-size:30px;font-weight:700;line-height:1.05;margin:4px 0 4px;}
.kpi-value.warn{color:#ffcf5c;}
.kpi-foot{font-size:11px;letter-spacing:.5px;text-transform:uppercase;opacity:.75;font-weight:500;}
.kpi-foot.warn{color:#ffb347;opacity:1;}
.kpi-foot.success{color:#8ef0b2;opacity:1;}
/* Force Incomplete Profiles KPI text white explicitly */
.temp-hero .kpi-card[data-key='incomplete'] .kpi-label,
.temp-hero .kpi-card[data-key='incomplete'] .kpi-value,
.temp-hero .kpi-card[data-key='incomplete'] .kpi-foot { color:#ffffff !important; }
@media (max-width:960px){.temp-hero{padding:30px 28px 32px;}.hero-title{font-size:26px;}}
@media (max-width:640px){.hero-kpis{grid-template-columns:repeat(2,1fr);} }

/* Incomplete Profiles KPI (3rd card) force all text white, overriding warn coloring */
.temp-hero .kpi-card:nth-of-type(3) .kpi-label,
.temp-hero .kpi-card:nth-of-type(3) .kpi-value,
.temp-hero .kpi-card:nth-of-type(3) .kpi-foot,
.temp-hero .kpi-card[data-kpi-key='incomplete'] .kpi-label,
.temp-hero .kpi-card[data-kpi-key='incomplete'] .kpi-value,
.temp-hero .kpi-card[data-kpi-key='incomplete'] .kpi-foot { color:#fff !important; }
.temp-hero .kpi-card:nth-of-type(3) .kpi-foot.warn,
.temp-hero .kpi-card[data-kpi-key='incomplete'] .kpi-foot.warn { color:#fff !important; }
</style>