<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-space-between align-center flex-wrap">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Payment Tracking</h1>
          <p class="text-body-2 text-medium-emphasis">Record customer payments and post receipts to the ledger</p>
        </div>
        <div class="d-flex gap-2">
          <v-btn color="primary" prepend-icon="mdi-cash-plus" @click="openPaymentDialog">Record Payment</v-btn>
          <v-btn color="primary" variant="outlined" prepend-icon="mdi-upload" :disabled="!stagedPaymentCount" @click="postBatch">Post Batch ({{ stagedPaymentCount }})</v-btn>
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
            <v-select v-model="methodFilter" :items="paymentMethods" label="Method" density="comfortable" clearable />
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

    <!-- Payments Table -->
    <v-card variant="outlined">
      <v-card-title class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-cash</v-icon>
        <span class="text-h6 font-weight-bold">Payments</span>
        <v-spacer />
        <v-chip size="small" color="primary" variant="tonal">{{ filteredPayments.length }} shown</v-chip>
      </v-card-title>
      <v-divider />
      <v-data-table :headers="headers" :items="filteredPayments" item-value="id" :items-per-page="20" density="comfortable">
        <template #item.payment="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-medium">{{ item.paymentNumber }}</span>
            <span class="text-caption text-medium-emphasis">{{ item.reference || '—' }}</span>
          </div>
        </template>
        <template #item.customer="{ item }">
          <div class="text-body-2">Customer #{{ item.customerId }}</div>
        </template>
        <template #item.amount="{ item }">
          <span class="font-weight-medium">{{ formatCurrency(item.amount) }}</span>
        </template>
        <template #item.method="{ item }">
          {{ item.method }}
        </template>
        <template #item.posted="{ item }">
          <v-icon :color="item.posted ? 'success' : 'warning'">{{ item.posted ? 'mdi-check-circle' : 'mdi-clock-outline' }}</v-icon>
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-eye" variant="text" size="small" @click="viewPayment(item)" />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="deletePayment(item)" :disabled="item.posted" />
        </template>
        <template #no-data>
          <div class="text-center pa-6">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-cash</v-icon>
            <div class="text-subtitle-1 mb-1">No payments found</div>
            <div class="text-caption text-medium-emphasis mb-3">Record a payment to get started</div>
            <v-btn color="primary" @click="openPaymentDialog">Record Payment</v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- New Payment Dialog -->
    <v-dialog v-model="showPaymentDialog" max-width="640px">
      <v-card :loading="savingPayment">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-cash-plus</v-icon>
          <span class="font-weight-bold">Record Payment</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="closePaymentDialog" />
        </v-card-title>
        <v-divider />
        <v-form ref="paymentFormRef" @submit.prevent="savePayment">
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="4">
                <v-text-field v-model="paymentDraft.date" type="date" label="Date" :rules="[rRequired]" density="comfortable" />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model.number="paymentDraft.amount" type="number" min="0" label="Amount (QAR)" :rules="[rPositive]" density="comfortable" />
              </v-col>
              <v-col cols="12" md="4">
                <v-select v-model="paymentDraft.method" :items="paymentMethods" label="Method" :rules="[rRequired]" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="paymentDraft.customerId" type="number" label="Customer ID" :rules="[rRequired]" density="comfortable" />
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
            <v-btn color="primary" type="submit" :loading="savingPayment">Save</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- View Payment Dialog -->
    <v-dialog v-model="showViewDialog" max-width="560px">
      <v-card v-if="viewingPayment">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-eye</v-icon>
          <span class="font-weight-bold">Payment {{ viewingPayment.paymentNumber }}</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="showViewDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-row dense>
            <v-col cols="12" md="6"><strong>Date:</strong> {{ formatDate(viewingPayment.date) }}</v-col>
            <v-col cols="12" md="6"><strong>Customer:</strong> {{ viewingPayment.customerId }}</v-col>
            <v-col cols="12" md="6"><strong>Amount:</strong> {{ formatCurrency(viewingPayment.amount) }}</v-col>
            <v-col cols="12" md="6"><strong>Method:</strong> {{ viewingPayment.method }}</v-col>
            <v-col cols="12"><strong>Reference:</strong> {{ viewingPayment.reference || '—' }}</v-col>
            <v-col cols="12"><strong>Notes:</strong> {{ viewingPayment.notes || '—' }}</v-col>
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

interface LocalPayment { id: string; paymentNumber: string; date: string; amount: number; method: string; customerId: number; reference?: string; notes?: string; posted: boolean }
let pSeq = 1000
const genId = () => `PAY-${++pSeq}`
const payments = ref<LocalPayment[]>([])

// Store for staging receipt events
const accountsStore = useAccountsStore()

// Filters
const search = ref('')
const methodFilter = ref<string | null>(null)
const fromDate = ref<string | null>(null)
const toDate = ref<string | null>(null)

// Draft/dialogs
const showPaymentDialog = ref(false)
const savingPayment = ref(false)
const paymentFormRef = ref()
const paymentMethods = ['Bank Transfer','Cash','Cheque','Card']
const paymentDraft = ref<any>({ id: '', date: today(), amount: 0, method: 'Bank Transfer', customerId: 1, reference: '', notes: '' })
const showViewDialog = ref(false)
const viewingPayment = ref<LocalPayment | null>(null)

// Validation
const rRequired = (v: any) => (!!v || v === 0) || 'Required'
const rPositive = (v: number) => v > 0 || 'Must be > 0'

// Headers
const headers = [
  { title: 'Payment', key: 'payment', sortable: false },
  { title: 'Customer', key: 'customer', sortable: false },
  { title: 'Amount', key: 'amount', sortable: true },
  { title: 'Method', key: 'method', sortable: true },
  { title: 'Posted', key: 'posted', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Computed
const filteredPayments = computed(() => payments.value.filter(p => {
  if (search.value && !(p.paymentNumber.toLowerCase().includes(search.value.toLowerCase()) || (p.reference||'').toLowerCase().includes(search.value.toLowerCase()))) return false
  if (methodFilter.value && p.method !== methodFilter.value) return false
  if (fromDate.value && p.date < fromDate.value) return false
  if (toDate.value && p.date > toDate.value) return false
  return true
}))
const stagedPaymentCount = computed(() => accountsStore.customerEvents.filter(e => !e.posted && e.type === 'receipt').length)
const stagedReceiptEventIds = computed(() => accountsStore.customerEvents.filter(e => !e.posted && e.type === 'receipt').map(e => e.id))

// Helpers
function today() { return new Date().toISOString().slice(0,10) }
function formatDate(iso: string) { return new Date(iso).toLocaleDateString('en-GB') }
const formatCurrency = (n: number) => new Intl.NumberFormat('en-QA',{ style:'currency', currency:'QAR'}).format(n)

// Actions
const openPaymentDialog = () => { paymentDraft.value = { id:'', date: today(), amount: 0, method: 'Bank Transfer', customerId: 1, reference: '', notes: '' }; showPaymentDialog.value = true }
const viewPayment = (p: LocalPayment) => { viewingPayment.value = p; showViewDialog.value = true }
const deletePayment = (p: LocalPayment) => { payments.value = payments.value.filter(x => x.id !== p.id) }
const closePaymentDialog = () => { showPaymentDialog.value = false }
const resetFilters = () => { search.value=''; methodFilter.value=null; fromDate.value=null; toDate.value=null }

const savePayment = async () => {
  if (savingPayment.value) return
  savingPayment.value = true
  try {
    const d = paymentDraft.value
    if (d.id) {
      const idx = payments.value.findIndex(p => p.id === d.id)
      if (idx !== -1) payments.value[idx] = { ...payments.value[idx], ...d }
    } else {
      const id = genId()
      const record: LocalPayment = { id, paymentNumber: id, date: d.date, amount: d.amount, method: d.method, customerId: Number(d.customerId), reference: d.reference, notes: d.notes, posted: false }
      payments.value.unshift(record)
      if (record.amount > 0) {
        accountsStore.registerCustomerEvent({ type: 'receipt', amount: record.amount, date: record.date, customerId: String(record.customerId), customerName: `Customer #${record.customerId}` })
      }
    }
    showPaymentDialog.value = false
  } finally {
    savingPayment.value = false
  }
}

const postBatch = () => {
  if (!stagedReceiptEventIds.value.length) return
  accountsStore.postCustomerEvents(stagedReceiptEventIds.value)
  // Mark local payments whose amounts/dates/customer match newly posted receipt events
  const postedSet = new Set(stagedReceiptEventIds.value)
  accountsStore.customerEvents.forEach(e => {
    if (postedSet.has(e.id) && e.type === 'receipt') {
      // naive matching by amount/date/customerId (improvement: store mapping id)
      const p = payments.value.find(p => !p.posted && p.amount === e.amount && p.date === e.date && String(p.customerId) === e.customerId)
      if (p) p.posted = true
    }
  })
}
</script>

<style scoped>
.gap-2 > * + * { margin-left: 8px; }
</style>
