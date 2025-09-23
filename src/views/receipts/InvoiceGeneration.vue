<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-space-between align-center flex-wrap">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Invoice Management</h1>
          <p class="text-body-2 text-medium-emphasis">Create, stage and post customer invoices to the ledger</p>
        </div>
        <div class="d-flex gap-2">
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openNewInvoice">New Invoice</v-btn>
          <v-btn color="primary" variant="outlined" prepend-icon="mdi-upload" :disabled="!stagedInvoiceCount" @click="postBatch">Post Batch ({{ stagedInvoiceCount }})</v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card class="mb-4" variant="outlined">
      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="3">
            <v-text-field v-model="search" label="Search" density="comfortable" prepend-inner-icon="mdi-magnify" clearable />
          </v-col>
          <v-col cols="12" md="2">
            <v-select v-model="statusFilter" :items="invoiceStatusOptions" label="Status" density="comfortable" clearable />
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="fromDate" type="date" label="From" density="comfortable" />
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="toDate" type="date" label="To" density="comfortable" />
          </v-col>
          <v-col cols="12" md="3" class="d-flex align-end">
            <v-btn variant="text" @click="resetFilters">Reset Filters</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Invoices Table -->
    <v-card variant="outlined">
      <v-card-title class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-file-invoice-outline</v-icon>
        <span class="text-h6 font-weight-bold">Invoices</span>
        <v-spacer />
        <v-chip size="small" color="primary" variant="tonal">{{ filteredInvoices.length }} shown</v-chip>
      </v-card-title>
      <v-divider />
      <v-data-table :headers="headers" :items="filteredInvoices" item-value="id" :items-per-page="20" density="comfortable">
        <template #item.invoice="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-medium">{{ item.invoiceNumber }}</span>
            <span class="text-caption text-medium-emphasis">{{ item.description || '—' }}</span>
          </div>
        </template>
        <template #item.customer="{ item }">
          <div>
            <div class="text-body-2">Customer #{{ item.customerId }}</div>
            <div class="text-caption text-medium-emphasis">Due: {{ formatDate(item.dueDate) }}</div>
          </div>
        </template>
        <template #item.amount="{ item }">
          <span class="font-weight-medium">{{ formatCurrency(item.amount) }}</span>
        </template>
        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" variant="tonal">{{ item.status }}</v-chip>
        </template>
        <template #item.posted="{ item }">
          <v-icon :color="item.posted ? 'success' : 'warning'">{{ item.posted ? 'mdi-check-circle' : 'mdi-clock-outline' }}</v-icon>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-eye" variant="text" size="small" @click="viewInvoice(item)" />
          <v-btn icon="mdi-pencil" variant="text" size="small" @click="editInvoice(item)" :disabled="item.posted" />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="deleteInvoice(item)" :disabled="item.posted" />
        </template>
        <template #no-data>
          <div class="text-center pa-6">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-file-invoice-outline</v-icon>
            <div class="text-subtitle-1 mb-1">No invoices found</div>
            <div class="text-caption text-medium-emphasis mb-3">Create your first invoice to get started</div>
            <v-btn color="primary" @click="openNewInvoice">New Invoice</v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- New/Edit Invoice Dialog -->
    <v-dialog v-model="showInvoiceDialog" max-width="720px">
      <v-card :loading="savingInvoice">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-file-invoice-outline</v-icon>
          <span class="font-weight-bold">{{ invoiceDraft.id ? 'Edit Invoice' : 'New Invoice' }}</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="closeInvoiceDialog" />
        </v-card-title>
        <v-divider />
        <v-form ref="invoiceFormRef" @submit.prevent="saveInvoice">
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field v-model="invoiceDraft.date" type="date" label="Date" :rules="[rRequired]" density="comfortable" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="invoiceDraft.dueDate" type="date" label="Due Date" :rules="[rRequired]" density="comfortable" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model.number="invoiceDraft.amount" type="number" min="0" label="Amount (QAR)" :rules="[rPositive]" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="invoiceDraft.status" :items="invoiceStatusOptions" label="Status" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="invoiceDraft.customerId" type="number" label="Customer ID" :rules="[rRequired]" density="comfortable" />
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
            <v-btn color="primary" type="submit" :loading="savingInvoice">Save</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- View Invoice Dialog -->
    <v-dialog v-model="showViewDialog" max-width="640">
      <v-card v-if="viewingInvoice">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-eye</v-icon>
          <span class="font-weight-bold">Invoice {{ viewingInvoice.invoiceNumber }}</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="showViewDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-row dense>
            <v-col cols="12" md="6"><strong>Date:</strong> {{ formatDate(viewingInvoice.date) }}</v-col>
            <v-col cols="12" md="6"><strong>Due:</strong> {{ formatDate(viewingInvoice.dueDate) }}</v-col>
            <v-col cols="12" md="6"><strong>Customer ID:</strong> {{ viewingInvoice.customerId }}</v-col>
            <v-col cols="12" md="6"><strong>Status:</strong> {{ viewingInvoice.status }}</v-col>
            <v-col cols="12" md="6"><strong>Amount:</strong> {{ formatCurrency(viewingInvoice.amount) }}</v-col>
            <v-col cols="12"><strong>Description:</strong> {{ viewingInvoice.description || '—' }}</v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showViewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAccountsStore } from '@/stores/accounts'

// Store
const accountsStore = useAccountsStore()

// Local invoice state (staged + UI) - in real app you'd fetch persisted invoices
interface LocalInvoice { id: string; invoiceNumber: string; date: string; dueDate: string; amount: number; status: string; customerId: number; description?: string; posted: boolean }
let seq = 1000
const genId = () => `INV-${++seq}`
const invoices = ref<LocalInvoice[]>([])

// Filters
const search = ref('')
const statusFilter = ref<string | null>(null)
const fromDate = ref<string | null>(null)
const toDate = ref<string | null>(null)

// Draft / dialogs
const showInvoiceDialog = ref(false)
const savingInvoice = ref(false)
const invoiceFormRef = ref()
const invoiceStatusOptions = ['Draft','Issued','Paid','Cancelled']
const emptyDraft = () => ({ id: '', date: today(), dueDate: inDays(7), amount: 0, status: 'Draft', customerId: 1, description: '' })
const invoiceDraft = ref<any>(emptyDraft())
const showViewDialog = ref(false)
const viewingInvoice = ref<LocalInvoice | null>(null)

// Validation
const rRequired = (v: any) => (!!v || v === 0) || 'Required'
const rPositive = (v: number) => v > 0 || 'Must be > 0'

// Headers
const headers = [
  { title: 'Invoice', key: 'invoice', sortable: false },
  { title: 'Customer', key: 'customer', sortable: false },
  { title: 'Amount', key: 'amount', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Posted', key: 'posted', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Computed
const filteredInvoices = computed(() => {
  return invoices.value.filter(inv => {
    if (search.value && !(inv.invoiceNumber.toLowerCase().includes(search.value.toLowerCase()) || (inv.description||'').toLowerCase().includes(search.value.toLowerCase()))) return false
    if (statusFilter.value && inv.status !== statusFilter.value) return false
    if (fromDate.value && inv.date < fromDate.value) return false
    if (toDate.value && inv.date > toDate.value) return false
    return true
  })
})

const stagedInvoiceCount = computed(() => accountsStore.customerEvents.filter(e => !e.posted && e.type === 'invoice').length)
// Collect ids of staged (unposted) invoice events for batch posting
const stagedInvoiceEventIds = computed(() => accountsStore.customerEvents.filter(e => !e.posted && e.type === 'invoice').map(e => e.id))

// Helpers
function today() { return new Date().toISOString().slice(0,10) }
function inDays(d: number) { return new Date(Date.now() + d*86400000).toISOString().slice(0,10) }
const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB')
const formatCurrency = (n: number) => new Intl.NumberFormat('en-QA',{ style:'currency', currency:'QAR'}).format(n)
const getStatusColor = (s: string) => ({ Draft:'info', Issued:'primary', Paid:'success', Cancelled:'error' } as Record<string,string>)[s] || 'default'

// Actions
const openNewInvoice = () => { invoiceDraft.value = emptyDraft(); showInvoiceDialog.value = true }
const editInvoice = (inv: LocalInvoice) => { invoiceDraft.value = { ...inv }; showInvoiceDialog.value = true }
const viewInvoice = (inv: LocalInvoice) => { viewingInvoice.value = inv; showViewDialog.value = true }
const deleteInvoice = (inv: LocalInvoice) => { invoices.value = invoices.value.filter(i => i.id !== inv.id) }
const closeInvoiceDialog = () => { showInvoiceDialog.value = false }
const resetFilters = () => { search.value=''; statusFilter.value=null; fromDate.value=null; toDate.value=null }

const saveInvoice = async () => {
  if (savingInvoice.value) return
  savingInvoice.value = true
  try {
    const draft = invoiceDraft.value
    const isEdit = !!draft.id
    // Local persistence
    if (isEdit) {
      const idx = invoices.value.findIndex(i => i.id === draft.id)
      if (idx !== -1) invoices.value[idx] = { ...invoices.value[idx], ...draft }
    } else {
      const id = genId()
      const record: LocalInvoice = { id, invoiceNumber: id, date: draft.date, dueDate: draft.dueDate, amount: draft.amount, status: draft.status, customerId: Number(draft.customerId), description: draft.description, posted: false }
      invoices.value.unshift(record)
      // Stage AR event for ledger (only if amount > 0)
      if (record.amount > 0) {
        // Register AR event (invoice). CustomerEvent requires a customerName; using placeholder until real customer lookup integrated.
        accountsStore.registerCustomerEvent({ type: 'invoice', amount: record.amount, date: record.date, customerId: String(record.customerId), customerName: `Customer #${record.customerId}` })
      }
    }
    showInvoiceDialog.value = false
  } finally {
    savingInvoice.value = false
  }
}

const postBatch = () => {
  if (!stagedInvoiceEventIds.value.length) return
  accountsStore.postCustomerEvents(stagedInvoiceEventIds.value)
}
</script>

<style scoped>
.gap-2 > * + * { margin-left: 8px; }
</style>
