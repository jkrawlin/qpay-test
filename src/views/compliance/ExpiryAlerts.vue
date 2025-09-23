<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-space-between align-center flex-wrap">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Expiry Alerts</h1>
          <p class="text-body-2 text-medium-emphasis">Track upcoming expirations for compliance critical documents</p>
        </div>
        <div class="d-flex gap-2">
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openNew">Add Document</v-btn>
          <v-btn variant="outlined" color="primary" prepend-icon="mdi-refresh" @click="refreshSoonExpiring" :disabled="loading">Refresh</v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filters (Enhanced Panel) -->
    <div class="filter-panel mb-4">
      <div class="fp-header d-flex align-center mb-3">
        <v-icon class="mr-2" size="20" color="primary">mdi-filter-variant</v-icon>
        <h2 class="fp-title text-subtitle-1 font-weight-medium mb-0">Filters</h2>
        <v-spacer />
        <v-btn size="small" variant="text" @click="resetFilters">Reset</v-btn>
      </div>
      <div class="fp-grid mb-2">
        <v-text-field v-model="search" label="Search" hide-details density="comfortable" prepend-inner-icon="mdi-magnify" clearable />
        <v-select v-model="typeFilter" :items="docTypes" label="Type" hide-details density="comfortable" clearable />
        <v-select v-model="statusFilter" :items="statusOptions" label="Status" hide-details density="comfortable" clearable />
        <v-text-field v-model.number="withinDays" type="number" min="0" label="Within (days)" hide-details density="comfortable" clearable />
      </div>
      <transition name="fade-slide">
        <div v-if="activeFilterChips.length" class="active-chips mb-1">
          <span class="chips-label text-caption">Active:</span>
          <v-chip v-for="chip in activeFilterChips" :key="chip.key" size="small" class="mr-2 mb-1" closable @click:close="clearFilter(chip.key)">{{ chip.label }}</v-chip>
        </div>
      </transition>
    </div>

    <!-- Documents Table -->
    <v-card variant="outlined">
      <v-card-title class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-alert-decagram-outline</v-icon>
        <span class="text-h6 font-weight-bold">Tracked Documents</span>
        <v-spacer />
        <v-chip size="small" color="primary" variant="tonal">{{ filteredDocuments.length }} shown</v-chip>
      </v-card-title>
      <v-divider />
      <v-data-table :headers="headers" :items="filteredDocuments" item-value="id" density="comfortable" :items-per-page="20">
        <template #item.document="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-medium">{{ item.name }}</span>
            <span class="text-caption text-medium-emphasis">{{ item.reference || '—' }}</span>
          </div>
        </template>
        <template #item.type="{ item }">
          <v-chip size="x-small" variant="tonal" color="primary">{{ item.type }}</v-chip>
        </template>
        <template #item.expiry="{ item }">
          <div class="d-flex flex-column">
            <span>{{ formatDate(item.expiryDate) }}</span>
            <span class="text-caption" :class="getDaysClass(daysUntil(item.expiryDate))">{{ daysUntil(item.expiryDate) }}d</span>
          </div>
        </template>
        <template #item.status="{ item }">
          <v-chip size="small" :color="statusColor(item.status)" variant="tonal">{{ item.status }}</v-chip>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-refresh" size="small" variant="text" @click="renew(item)" />
          <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="remove(item)" />
        </template>
        <template #no-data>
          <div class="text-center pa-6">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-alert-decagram-outline</v-icon>
            <div class="text-subtitle-1 mb-1">No tracked documents</div>
            <div class="text-caption text-medium-emphasis mb-3">Add documents to begin receiving alerts</div>
            <v-btn color="primary" @click="openNew">Add Document</v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add / Renew Dialog -->
    <v-dialog v-model="showDialog" max-width="640px">
      <v-card :loading="saving">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">{{ editingDoc ? 'mdi-refresh' : 'mdi-plus' }}</v-icon>
          <span class="font-weight-bold">{{ editingDoc ? 'Renew Document' : 'Add Document' }}</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="closeDialog" />
        </v-card-title>
        <v-divider />
        <v-form ref="formRef" @submit.prevent="save">
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field v-model="draft.name" label="Name" :rules="[rRequired]" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="draft.type" :items="docTypes" label="Type" :rules="[rRequired]" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="draft.reference" label="Reference" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="draft.expiryDate" type="date" label="Expiry Date" :rules="[rRequired]" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="draft.noticeDays" type="number" min="0" label="Notice (days)" :rules="[rNonNegative]" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="draft.status" :items="statusOptions" label="Status" :rules="[rRequired]" density="comfortable" />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="draft.notes" label="Notes" rows="2" auto-grow density="comfortable" />
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
            <v-btn color="primary" type="submit" :loading="saving">Save</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface ExpiringDoc {
  id: string
  name: string
  type: string
  reference?: string
  expiryDate: string
  noticeDays: number
  status: 'active' | 'pending' | 'expired'
  notes?: string
}

// State
const documents = ref<ExpiringDoc[]>([])
let seq = 1000
const genId = () => `DOC-${++seq}`
const loading = ref(false)

// Filters & UI state
const search = ref('')
const typeFilter = ref<string | null>(null)
const statusFilter = ref<ExpiringDoc['status'] | null>(null)
const withinDays = ref<number | null>(30)
const showDialog = ref(false)
const saving = ref(false)
const formRef = ref()
const editingDoc = ref<ExpiringDoc | null>(null)
const docTypes = ['License','Contract','ID','Certification','Insurance','Permit']
const statusOptions: Array<ExpiringDoc['status']> = ['active','pending','expired']
const emptyDraft = () => ({ id:'', name:'', type:'License', reference:'', expiryDate: futureDate(90), noticeDays:30, status:'active', notes:'' })
const draft = ref<any>(emptyDraft())

// Validation
const rRequired = (v:any) => (!!v || v===0) || 'Required'
const rNonNegative = (v:number) => v >= 0 || 'Must be >= 0'

// Table headers
const headers = [
  { title: 'Document', key: 'document', sortable: false },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Expiry', key: 'expiry', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Computed
const filteredDocuments = computed(() => documents.value.filter(d => {
  if (search.value && !(d.name.toLowerCase().includes(search.value.toLowerCase()) || (d.reference||'').toLowerCase().includes(search.value.toLowerCase()))) return false
  if (typeFilter.value && d.type !== typeFilter.value) return false
  if (statusFilter.value && d.status !== statusFilter.value) return false
  if (withinDays.value != null) {
    if (daysUntil(d.expiryDate) > withinDays.value) return false
  }
  return true
}))
const activeFilterChips = computed(() => {
  const chips: { key:string; label:string }[] = []
  if (search.value) chips.push({ key: 'search', label: `Search: ${search.value}` })
  if (typeFilter.value) chips.push({ key: 'type', label: `Type: ${typeFilter.value}` })
  if (statusFilter.value) chips.push({ key: 'status', label: `Status: ${statusFilter.value}` })
  if (withinDays.value != null) chips.push({ key: 'within', label: `Within: ${withinDays.value}d` })
  return chips
})

// Helpers
function futureDate(days:number) { return new Date(Date.now() + days*86400000).toISOString().slice(0,10) }
function formatDate(iso:string) { return new Date(iso).toLocaleDateString('en-GB') }
function daysUntil(iso:string) { return Math.ceil((new Date(iso).getTime() - Date.now())/86400000) }
function statusColor(s:ExpiringDoc['status']) { return s==='expired' ? 'error' : s==='pending' ? 'warning' : 'success' }
function getDaysClass(days:number) { return days < 0 ? 'text-error' : days <=7 ? 'text-warning' : '' }

// Actions
const openNew = () => { draft.value = emptyDraft(); editingDoc.value = null; showDialog.value = true }
const renew = (doc:ExpiringDoc) => { draft.value = { ...doc, id:'', expiryDate: futureDate(365) }; editingDoc.value = doc; showDialog.value = true }
const remove = (doc:ExpiringDoc) => { documents.value = documents.value.filter(d => d.id !== doc.id) }
const closeDialog = () => { showDialog.value = false }
const resetFilters = () => { search.value=''; typeFilter.value=null; statusFilter.value=null; withinDays.value=30 }
function clearFilter(key:string) {
  if (key==='search') search.value=''
  else if (key==='type') typeFilter.value=null
  else if (key==='status') statusFilter.value=null
  else if (key==='within') withinDays.value=null
}
const refreshSoonExpiring = () => { /* placeholder for server refresh */ loading.value = true; setTimeout(()=> loading.value=false, 600) }

const save = async () => {
  if (saving.value) return
  saving.value = true
  try {
    const d = draft.value
    const valid = await formRef.value?.validate?.()
    if (valid && valid.valid === false) return
    const record: ExpiringDoc = {
      id: genId(),
      name: d.name,
      type: d.type,
      reference: d.reference,
      expiryDate: d.expiryDate,
      noticeDays: Number(d.noticeDays||0),
      status: d.status,
      notes: d.notes
    }
    if (editingDoc.value) {
      // Mark previous as renewed (could archive instead)
      editingDoc.value.status = 'expired'
      documents.value.unshift(record)
    } else {
      documents.value.unshift(record)
    }
    updateStatuses()
    showDialog.value = false
  } finally {
    saving.value = false
  }
}

function updateStatuses() {
  documents.value.forEach(d => {
    const days = daysUntil(d.expiryDate)
    if (days < 0) d.status = 'expired'
    else if (days <= d.noticeDays) d.status = 'pending'
    else d.status = 'active'
  })
}

// Seed sample data
documents.value = [
  { id: genId(), name: 'Trade License', type: 'License', reference: 'TL-2025', expiryDate: futureDate(20), noticeDays: 30, status: 'active', notes: '' },
  { id: genId(), name: 'HQ Lease Contract', type: 'Contract', reference: 'LC-778', expiryDate: futureDate(5), noticeDays: 14, status: 'active', notes: 'Renew negotiating' },
  { id: genId(), name: 'Insurance Policy', type: 'Insurance', reference: 'POL-55', expiryDate: futureDate(-2), noticeDays: 30, status: 'active', notes: '' }
]
updateStatuses()
</script>

<style scoped>
.gap-2 > * + * { margin-left: 8px; }
/* Filter panel styling aligned with NotificationCenter for consistency */
.filter-panel { background:linear-gradient(135deg,#ffffff,#f8fafc); border:1px solid #e2e6ea; border-radius:18px; padding:18px 20px 10px; position:relative; box-shadow:0 2px 6px rgba(0,0,0,.04),0 1px 3px rgba(0,0,0,.03); }
.fp-header { border-bottom:1px solid rgba(0,0,0,0.06); padding-bottom:8px; }
.fp-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:14px; }
.active-chips { display:flex; flex-wrap:wrap; align-items:center; }
.chips-label { margin-right:6px; font-weight:600; letter-spacing:.5px; }
.filter-panel :deep(.v-field) { border-radius:12px; }
.filter-panel :deep(.v-field__input) { font-size:.85rem; }
.filter-panel :deep(.v-label) { font-size:.7rem; letter-spacing:.6px; text-transform:uppercase; font-weight:600; }
.fade-slide-enter-active,.fade-slide-leave-active { transition:.25s ease; }
.fade-slide-enter-from,.fade-slide-leave-to { opacity:0; transform:translateY(-4px); }
</style>
