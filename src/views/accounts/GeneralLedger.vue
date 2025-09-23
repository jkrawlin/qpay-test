<template>
  <div class="ledger-view">
    <!-- Hero KPI Section -->
    <hero-kpi-group title="General Ledger" subtitle="Day-to-day income & expenses" :elevated="true" :kpis="kpis">
      <template #actions>
        <v-btn density="comfortable" color="primary" variant="flat" @click="addBlankRow">Add Row</v-btn>
        <v-btn density="comfortable" variant="text" @click="postAll" :disabled="pendingLines.length===0 || !isBalanced || invalidCount>0">Post All</v-btn>
        <v-divider vertical class="mx-1" />
        <v-btn density="comfortable" size="small" variant="text" color="primary" @click="quickFuel" title="Quick fuel expense">Fuel</v-btn>
        <v-btn density="comfortable" size="small" variant="text" color="primary" @click="quickTransport" title="Quick transport expense">Transport</v-btn>
        <v-divider vertical class="mx-1" />
        <v-btn density="comfortable" size="small" variant="text" color="primary" @click="downloadCsv" :disabled="journalEntries.length===0">CSV</v-btn>
        <v-btn density="comfortable" size="small" variant="text" color="warning" @click="undoLast" :disabled="journalEntries.length===0">Undo</v-btn>
      </template>
    </hero-kpi-group>

    <!-- Sub Tabs -->
    <div class="ledger-subtabs mt-6" role="tablist" aria-label="Ledger categories">
      <button
        v-for="t in tabs"
        :key="t.value"
        class="subtab"
        :class="{ active: activeTab===t.value }"
        role="tab"
        :aria-selected="activeTab===t.value"
        :tabindex="activeTab===t.value ? 0 : -1"
        @click="activeTab = t.value"
      >
        <v-icon size="16" class="mr-1">{{ t.icon }}</v-icon>{{ t.label }}
      </button>
    </div>

    <!-- Small Expenses Editable Grid -->
    <div v-if="activeTab==='expenses'" class="ledger-grid-wrapper">
      <table class="ledger-grid" aria-label="Small expenses editable batch table">
        <thead>
          <tr>
            <th style="width:110px">Date</th>
            <th style="width:150px">Account</th>
            <th>Description</th>
            <th style="width:110px">Debit</th>
            <th style="width:110px">Credit</th>
            <th style="width:46px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in pendingLines" :key="row.id" :class="{ invalid: !rowValid(row) }">
            <td>
              <input type="date" v-model="row.date" class="cell-input" @keydown="handleKey($event, idx, 'date')" />
            </td>
            <td>
              <v-autocomplete
                v-model="row.accountId"
                :items="accountOptions"
                item-title="label"
                item-value="id"
                density="compact"
                hide-details
                variant="solo"
                class="cell-autocomplete"
                @keydown="handleKey($event, idx, 'account')"
              />
            </td>
            <td>
              <input v-model="row.description" class="cell-input" placeholder="Memo / details" @keydown="handleKey($event, idx, 'description')" />
            </td>
            <td>
              <input v-model.number="row.debit" @input="normalize(row, 'debit')" class="cell-input number" inputmode="decimal" @keydown="handleKey($event, idx, 'debit')" />
            </td>
            <td>
              <input v-model.number="row.credit" @input="normalize(row, 'credit')" class="cell-input number" inputmode="decimal" @keydown="handleKey($event, idx, 'credit')" />
            </td>
            <td class="actions">
              <button class="icon-btn" @click="removeRow(idx)" aria-label="Remove row">
                <v-icon size="18">mdi-close</v-icon>
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="totals-label">Totals</td>
            <td class="totals-val">{{ totalDebits.toFixed(2) }}</td>
            <td class="totals-val">{{ totalCredits.toFixed(2) }}</td>
            <td></td>
          </tr>
          <tr>
            <td colspan="6" class="balance-indicator" :class="{ balanced: isBalanced, unbalanced: !isBalanced }">
              <v-icon size="16" class="mr-1">{{ isBalanced ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
              {{ isBalanced ? 'Balanced' : 'Not Balanced' }}
              <span v-if="invalidCount>0" class="invalid-pill">{{ invalidCount }} invalid</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Employees Tab -->
    <div v-else-if="activeTab==='employees'" class="mt-6" aria-label="Employees payroll batch table">
      <v-card elevation="1" class="mb-4 pa-3 payroll-filters">
        <div class="filters-row">
          <v-text-field v-model="employeeSearch" label="Search employee" density="compact" hide-details clearable prepend-inner-icon="mdi-magnify" style="max-width:220px" />
          <v-select v-model="employeeType" :items="employeeTypeItems" label="Type" density="compact" hide-details clearable style="max-width:160px" />
          <v-menu v-model="payrollDateMenu" :close-on-content-click="false" transition="scale-transition">
            <template #activator="{ props }">
              <v-text-field v-bind="props" :model-value="payrollDateRangeLabel" label="Date Range" density="compact" hide-details readonly style="max-width:210px" />
            </template>
            <v-date-picker v-model="payrollDateRange" range @update:model-value="payrollDateMenu=false" />
          </v-menu>
          <div class="ml-auto d-flex align-center gap-sm">
            <v-btn size="small" variant="text" :disabled="selectedPayrollIds.length===0" @click="postSelectedPayroll">Post Selected ({{ selectedPayrollIds.length }})</v-btn>
            <v-chip size="x-small" color="primary" variant="flat">{{ filteredPayrollEvents.length }}</v-chip>
          </div>
        </div>
      </v-card>
      <div class="payroll-table-wrapper">
        <table class="payroll-table" aria-label="Payroll events table">
          <thead>
            <tr>
              <th style="width:34px"><v-checkbox density="compact" hide-details :model-value="allPayrollSelected" @click="toggleAllPayroll" /></th>
              <th style="width:100px">Date</th>
              <th>Employee</th>
              <th style="width:110px">Type</th>
              <th style="width:110px" class="text-right">Gross</th>
              <th style="width:110px" class="text-right">Taxes</th>
              <th style="width:110px" class="text-right">Net / Amt</th>
              <th style="width:80px">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in filteredPayrollEvents" :key="e.id" :class="{ posted: e.posted }">
              <td><v-checkbox density="compact" hide-details :disabled="e.posted" v-model="selectedPayrollIds" :value="e.id" /></td>
              <td>{{ e.date }}</td>
              <td class="emp-name">{{ e.employeeName }}</td>
              <td><v-chip size="x-small" :color="payrollTypeColor(e.type)" variant="flat">{{ e.type }}</v-chip></td>
              <td class="num">{{ e.gross.toFixed(2) }}</td>
              <td class="num">{{ e.taxes.toFixed(2) }}</td>
              <td class="num">{{ e.type==='payroll' ? e.net.toFixed(2) : e.net.toFixed(2) }}</td>
              <td>
                <v-chip size="x-small" :color="e.posted ? 'success' : 'grey'" variant="flat">{{ e.posted ? 'Posted' : 'Pending' }}</v-chip>
              </td>
            </tr>
            <tr v-if="filteredPayrollEvents.length===0">
              <td colspan="8" class="text-center text-medium-emphasis py-4">No payroll events.</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="totals-label">Totals (Filtered)</td>
              <td class="totals-val">{{ payrollTotals.gross.toFixed(2) }}</td>
              <td class="totals-val">{{ payrollTotals.taxes.toFixed(2) }}</td>
              <td class="totals-val">{{ payrollTotals.net.toFixed(2) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Customers Tab -->
    <div v-else-if="activeTab==='customers'" class="mt-6" aria-label="Customer AR events table">
      <v-card elevation="1" class="mb-4 pa-3 customer-filters">
        <div class="filters-row">
          <v-text-field v-model="customerSearch" label="Search customer" density="compact" hide-details clearable prepend-inner-icon="mdi-magnify" style="max-width:220px" />
          <v-select v-model="customerType" :items="customerTypeItems" label="Type" density="compact" hide-details clearable style="max-width:160px" />
          <v-menu v-model="customerDateMenu" :close-on-content-click="false" transition="scale-transition">
            <template #activator="{ props }">
              <v-text-field v-bind="props" :model-value="customerDateRangeLabel" label="Date Range" density="compact" hide-details readonly style="max-width:210px" />
            </template>
            <v-date-picker v-model="customerDateRange" range @update:model-value="customerDateMenu=false" />
          </v-menu>
          <div class="ml-auto d-flex align-center gap-sm">
            <v-btn size="small" variant="text" :disabled="selectedCustomerIds.length===0" @click="postSelectedCustomers">Post Selected ({{ selectedCustomerIds.length }})</v-btn>
            <v-chip size="x-small" color="primary" variant="flat">{{ filteredCustomerEvents.length }}</v-chip>
          </div>
        </div>
      </v-card>
      <div class="customer-table-wrapper">
        <table class="customer-table" aria-label="Customer invoice receipt events">
          <thead>
            <tr>
              <th style="width:34px"><v-checkbox density="compact" hide-details :model-value="allCustomersSelected" @click="toggleAllCustomers" /></th>
              <th style="width:100px">Date</th>
              <th>Customer</th>
              <th style="width:110px">Type</th>
              <th style="width:130px" class="text-right">Amount</th>
              <th style="width:80px">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in filteredCustomerEvents" :key="c.id" :class="{ posted: c.posted }">
              <td><v-checkbox density="compact" hide-details :disabled="c.posted" v-model="selectedCustomerIds" :value="c.id" /></td>
              <td>{{ c.date }}</td>
              <td>{{ c.customerName }}</td>
              <td><v-chip size="x-small" :color="customerTypeColor(c.type)" variant="flat">{{ c.type }}</v-chip></td>
              <td class="num">{{ c.amount.toFixed(2) }}</td>
              <td><v-chip size="x-small" :color="c.posted ? 'success' : 'grey'" variant="flat">{{ c.posted ? 'Posted' : 'Pending' }}</v-chip></td>
            </tr>
            <tr v-if="filteredCustomerEvents.length===0">
              <td colspan="6" class="text-center text-medium-emphasis py-4">No customer events.</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="totals-label">Totals (Filtered)</td>
              <td class="totals-val">{{ customerTotals.amount.toFixed(2) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Posted Entries Table -->
    <v-card class="mt-8" elevation="2">
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-subtitle-1 font-weight-medium">Recent Journal Entries</span>
        <v-chip size="x-small" color="primary" variant="flat">{{ journalEntries.length }}</v-chip>
      </v-card-title>
      <v-table density="compact" class="journal-table">
        <thead>
          <tr>
            <th style="width:110px">Date</th>
            <th style="width:110px">Entry ID</th>
            <th style="width:140px">Reference</th>
            <th>Lines</th>
            <th style="width:130px" class="text-right">Debits</th>
            <th style="width:130px" class="text-right">Credits</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in journalEntries" :key="e.id">
            <td>{{ e.date }}</td>
            <td>{{ e.id }}</td>
            <td>{{ e.reference || '—' }}</td>
            <td>
              <div class="lines">
                <div v-for="l in e.lines" :key="l.id" class="line-item">
                  <span class="acct">{{ accountName(l.accountId) }}</span>
                  <span class="memo" v-if="l.description">- {{ l.description }}</span>
                  <span class="amount" :class="{ debit: l.debit>0, credit: l.credit>0 }">
                    {{ l.debit>0 ? l.debit.toFixed(2)+' D' : l.credit.toFixed(2)+' C' }}
                  </span>
                </div>
              </div>
            </td>
            <td class="text-right">{{ e.lines.reduce((s,l)=> s + l.debit,0).toFixed(2) }}</td>
            <td class="text-right">{{ e.lines.reduce((s,l)=> s + l.credit,0).toFixed(2) }}</td>
          </tr>
          <tr v-if="journalEntries.length===0">
            <td colspan="6" class="text-center text-medium-emphasis py-6">No entries yet.</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useAccountsStore, type JournalEntry } from '@/stores/accounts'
import HeroKpiGroup from '@/components/common/HeroKpiGroup.vue'

interface PendingLine {
  id: string
  date: string
  accountId: string | null
  description: string
  debit: number
  credit: number
}

const store = useAccountsStore()
const today = new Date().toISOString().slice(0,10)
const pendingLines = reactive<PendingLine[]>([])

// Sub tabs
interface LedgerTab { value: 'expenses'|'employees'|'customers'; label: string; icon: string }
const tabs: LedgerTab[] = [
  { value: 'expenses', label: 'Operational Entries', icon: 'mdi-receipt-text' },
  { value: 'employees', label: 'Employees', icon: 'mdi-account-multiple' },
  { value: 'customers', label: 'Customers', icon: 'mdi-account-group' }
]
const activeTab = ref<'expenses'|'employees'|'customers'>('expenses')

const accountOptions = computed(() => store.accounts.filter(a=> a.status==='active').map(a => ({ id: a.id, label: `${a.id} · ${a.name}` })))

function addBlankRow() {
  pendingLines.push({ id: crypto.randomUUID(), date: today, accountId: null, description: '', debit: 0, credit: 0 })
}
addBlankRow()

function removeRow(idx: number) { pendingLines.splice(idx,1) }

function normalize(row: PendingLine, field: 'debit'|'credit') {
  if (field === 'debit') { if (row.debit && row.debit > 0) row.credit = 0 } else { if (row.credit && row.credit > 0) row.debit = 0 }
}

const totalDebits = computed(()=> pendingLines.reduce((s,l)=> s + (l.debit||0),0))
const totalCredits = computed(()=> pendingLines.reduce((s,l)=> s + (l.credit||0),0))
const isBalanced = computed(()=> Math.abs(totalDebits.value - totalCredits.value) < 0.0001 && totalDebits.value>0)

function postAll() {
  if (!isBalanced.value) return
  // Build balanced journal entry
  const lines = pendingLines.filter(l=> l.accountId).map(l=> ({ accountId: l.accountId!, description: l.description || undefined, debit: l.debit, credit: l.credit }))
  try {
    store.postJournalEntry({ date: pendingLines[0]?.date, memo: 'Batch entry', lines, context: { type: 'operational' } })
    pendingLines.splice(0, pendingLines.length)
    addBlankRow()
  } catch(e) {
    console.error(e)
  }
}

const journalEntries = computed<JournalEntry[]>(() => store.journalEntries)

function accountName(id: string) { return store.accounts.find(a=> a.id===id)?.name || id }

// KPIs
const kpis = computed(()=> {
  const entries = journalEntries.value
  const periodDebits = entries.reduce((s,e)=> s + e.lines.reduce((lS,l)=> lS + l.debit,0),0)
  const periodCredits = entries.reduce((s,e)=> s + e.lines.reduce((lS,l)=> lS + l.credit,0),0)
  return [
    { key: 'entries', label: 'Entries', value: entries.length.toString() },
    { key: 'debits', label: 'Debits', value: periodDebits.toFixed(2) },
    { key: 'credits', label: 'Credits', value: periodCredits.toFixed(2) },
    { key: 'balanced', label: 'Balanced', value: store.trialBalance.balanced ? 'Yes' : 'No', foot: `${store.trialBalance.debitTotal.toFixed(2)} / ${store.trialBalance.creditTotal.toFixed(2)}` },
    { key: 'last-entry', label: 'Last Entry', value: entries[0]?.date || '—' }
  ]
})

// ---------------- Employees Tab Logic ----------------
const employeeSearch = ref('')
const employeeType = ref<string|null>(null) // payroll | advance | benefit
const employeeTypeItems = ['payroll','advance','benefit']
const payrollDateRange = ref<{ start: string, end: string } | null>(null)
const payrollDateMenu = ref(false)
const payrollDateRangeLabel = computed(()=> payrollDateRange.value ? `${payrollDateRange.value.start} → ${payrollDateRange.value.end}` : 'All Dates')
const selectedPayrollIds = ref<string[]>([])
const filteredPayrollEvents = computed(()=> {
  return store.payrollEvents.filter(e => {
    if (employeeSearch.value && !e.employeeName.toLowerCase().includes(employeeSearch.value.toLowerCase())) return false
    if (employeeType.value && e.type !== employeeType.value) return false
    if (payrollDateRange.value) {
      if (e.date < payrollDateRange.value.start || e.date > payrollDateRange.value.end) return false
    }
    return true
  })
})
const payrollTotals = computed(()=> filteredPayrollEvents.value.reduce((acc,e)=> { acc.gross+=e.gross; acc.taxes+=e.taxes; acc.net+= e.type==='payroll'? e.net : e.net; return acc }, { gross:0, taxes:0, net:0 }))
const allPayrollSelected = computed(()=> filteredPayrollEvents.value.length>0 && filteredPayrollEvents.value.every(e=> e.posted || selectedPayrollIds.value.includes(e.id)))
function toggleAllPayroll() {
  if (allPayrollSelected.value) selectedPayrollIds.value = []
  else selectedPayrollIds.value = filteredPayrollEvents.value.filter(e=> !e.posted).map(e=> e.id)
}
function postSelectedPayroll() {
  store.postPayrollEvents(selectedPayrollIds.value)
  selectedPayrollIds.value = []
}
function payrollTypeColor(t: string) { return t==='payroll' ? 'primary' : t==='advance' ? 'warning' : 'secondary' }

// ---------------- Customers Tab Logic ----------------
const customerSearch = ref('')
const customerType = ref<string|null>(null) // invoice | receipt
const customerTypeItems = ['invoice','receipt']
const customerDateRange = ref<{ start: string, end: string } | null>(null)
const customerDateMenu = ref(false)
const customerDateRangeLabel = computed(()=> customerDateRange.value ? `${customerDateRange.value.start} → ${customerDateRange.value.end}` : 'All Dates')
const selectedCustomerIds = ref<string[]>([])
const filteredCustomerEvents = computed(()=> store.customerEvents.filter(c => {
  if (customerSearch.value && !c.customerName.toLowerCase().includes(customerSearch.value.toLowerCase())) return false
  if (customerType.value && c.type !== customerType.value) return false
  if (customerDateRange.value) {
    if (c.date < customerDateRange.value.start || c.date > customerDateRange.value.end) return false
  }
  return true
}))
const customerTotals = computed(()=> filteredCustomerEvents.value.reduce((acc,c)=> { acc.amount += c.amount; return acc }, { amount:0 }))
const allCustomersSelected = computed(()=> filteredCustomerEvents.value.length>0 && filteredCustomerEvents.value.every(c=> c.posted || selectedCustomerIds.value.includes(c.id)))
function toggleAllCustomers() {
  if (allCustomersSelected.value) selectedCustomerIds.value = []
  else selectedCustomerIds.value = filteredCustomerEvents.value.filter(c=> !c.posted).map(c=> c.id)
}
function postSelectedCustomers() {
  store.postCustomerEvents(selectedCustomerIds.value)
  selectedCustomerIds.value = []
}
function customerTypeColor(t: string) { return t==='invoice' ? 'primary' : 'success' }

// -------- Validation & Keyboard & Quick Actions --------
function rowValid(r: PendingLine) {
  const hasAmt = (r.debit>0 && r.credit===0) || (r.credit>0 && r.debit===0)
  if (!r.accountId) return false
  if (!hasAmt) return false
  return true
}
const invalidCount = computed(()=> pendingLines.filter(r=> !rowValid(r)).length)

// Keyboard navigation between cells
const cellOrder: Array<keyof PendingLine | 'actions'> = ['date','accountId','description','debit','credit']
function focusCell(rowIndex: number, field: string) {
  requestAnimationFrame(()=> {
    const row = document.querySelectorAll('.ledger-grid tbody tr')[rowIndex] as HTMLElement | undefined
    if (!row) return
    let selector = ''
    switch(field){
      case 'date': selector = 'input[type="date"]'; break
      case 'accountId': selector = '.v-autocomplete input'; break
      case 'description': selector = 'input[placeholder="Memo / details"]'; break
      case 'debit': selector = 'input.number'; break
      case 'credit': selector = 'input.number'; break
    }
    const el = row.querySelector(selector) as HTMLElement | null
    if (el) el.focus()
  })
}
function handleKey(e: KeyboardEvent, rowIdx: number, field: string) {
  if (e.key === 'Enter' || e.key === 'ArrowDown') {
    e.preventDefault()
    if (rowIdx === pendingLines.length-1) {
      addBlankRow()
    }
    focusCell(Math.min(rowIdx+1, pendingLines.length-1), field)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    focusCell(Math.max(0,rowIdx-1), field)
  } else if (e.key === 'Tab') {
    // allow native, but if at last field and last row & moving forward, auto add
    if (!e.shiftKey && rowIdx===pendingLines.length-1 && field==='credit') {
      addBlankRow()
    }
  }
}

// Quick expense helpers
function quickFuel() {
  try { store.quickAddFuelExpense(50) } catch(e) { console.error(e) }
}
function quickTransport() {
  try { store.quickAddTransportExpense(100) } catch(e) { console.error(e) }
}

// CSV export
function downloadCsv() {
  const csv = store.exportJournalCsv()
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'journal-entries.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// Undo
function undoLast() { store.undoLastJournalEntry() }
</script>

<style scoped>
.ledger-view { padding: 0 0 var(--spacing-2xl); }
.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(140px,1fr)); gap: var(--spacing-md); }
.kpi { background: rgba(255,255,255,0.08); backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: var(--spacing-sm) var(--spacing-md); position: relative; box-shadow: var(--shadow-sm); }
.kpi-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.85; }
.kpi-value { font-size: 20px; font-weight: 600; margin-top: 2px; letter-spacing: .5px; }
.kpi-value.balanced { color: #4caf50; }
.kpi-value.unbalanced { color: #e53935; }
.kpi-foot { font-size: 11px; opacity: .6; margin-top: 2px; }

.ledger-grid-wrapper { overflow-x: auto; margin-top: var(--spacing-xl); border: 1px solid var(--color-border); border-radius: 12px; background: linear-gradient(135deg,#fafafa,#f5f7fa); box-shadow: var(--shadow-md); }
.ledger-grid { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
.ledger-grid thead th { position: sticky; top:0; background: linear-gradient(90deg,#8B1538,#6B0F2A); color:#fff; font-weight:600; padding:8px 10px; text-align:left; font-size:12px; letter-spacing:.5px; }
.ledger-grid tbody td { padding:0; border-bottom:1px solid #e3e6ea; background:#fff; }
.ledger-grid tfoot td { background:#fafbfc; font-weight:600; font-size:12px; }
.ledger-grid tr:last-of-type td { border-bottom:none; }
.cell-input { width:100%; height:32px; border:none; padding:0 8px; font-size:12.5px; background:transparent; font-family:inherit; }
.cell-input:focus { outline:2px solid #8B1538; outline-offset:-2px; background:#fff; }
.cell-autocomplete :deep(.v-field) { box-shadow:none !important; border-radius:0; background:transparent !important; }
.cell-autocomplete :deep(.v-field__overlay) { background:transparent !important; }
.number { text-align:right; }
.actions { text-align:center; }
.icon-btn { background:transparent; border:none; cursor:pointer; color:#888; display:flex; align-items:center; justify-content:center; width:32px; height:32px; }
.icon-btn:hover { color:#d32f2f; }
.totals-label { text-align:right; padding:6px 8px; }
.totals-val { text-align:right; padding:6px 8px; }
.balance-indicator { text-align:left; padding:6px 10px; font-size:12px; font-weight:500; }
.balance-indicator.balanced { color:#2e7d32; }
.balance-indicator.unbalanced { color:#c62828; }
.invalid-pill { background:#c62828; color:#fff; font-size:11px; padding:2px 6px; border-radius:12px; margin-left:10px; }

/* Invalid row highlighting */
tbody tr.invalid td { background: #fff4f4 !important; }
tbody tr.invalid td input { background: transparent; }

.journal-table thead th { background: linear-gradient(90deg,#8B1538,#6B0F2A); color:#fff; font-size:11.5px; font-weight:600; letter-spacing:.5px; }
.journal-table tbody td { font-size:12.25px; }
.lines { display:flex; flex-direction:column; gap:2px; }
.line-item { display:flex; align-items:center; gap:4px; }
.line-item .acct { font-weight:500; }
.line-item .amount { font-size:11.5px; padding:2px 6px; border-radius:12px; background:#eceff1; }
.line-item .amount.debit { background:#e8f5e9; color:#2e7d32; }
.line-item .amount.credit { background:#fbe9e7; color:#c62828; }

/* Subtabs */
.ledger-subtabs { display:flex; gap:6px; flex-wrap:wrap; }
.subtab { background:#fafbfc; border:1px solid #d9dde2; padding:6px 12px; font-size:12px; border-radius:18px; cursor:pointer; display:inline-flex; align-items:center; color:#5a5f66; font-weight:500; letter-spacing:.3px; transition:.18s background,color,border; }
.subtab:hover { background:#f0f3f7; }
.subtab.active { background:linear-gradient(90deg,#8B1538,#6B0F2A); color:#fff; border-color:#8B1538; box-shadow:0 2px 6px -2px rgba(0,0,0,.25); }
.subtab:focus-visible { outline:2px solid #8B1538; outline-offset:2px; }

/* Placeholders */
.placeholder-card { background:#fff; border:1px dashed #c2c8cf; padding:18px 22px; border-radius:12px; }
.feature-list { margin:0; padding-left:18px; font-size:12.75px; line-height:1.4; }
.feature-list li { margin:2px 0; }

/* Payroll & Customer Tables */
.payroll-table-wrapper, .customer-table-wrapper { overflow-x:auto; border:1px solid #dfe3e8; border-radius:12px; background:#fff; box-shadow:var(--shadow-sm); }
.payroll-table, .customer-table { width:100%; border-collapse:separate; border-spacing:0; font-size:12.5px; }
.payroll-table thead th, .customer-table thead th { background:linear-gradient(90deg,#8B1538,#6B0F2A); color:#fff; font-weight:600; font-size:11.5px; letter-spacing:.4px; padding:6px 8px; text-align:left; }
.payroll-table tbody td, .customer-table tbody td { background:#fff; border-bottom:1px solid #eceff1; padding:6px 8px; }
.payroll-table tfoot td, .customer-table tfoot td { background:#fafbfc; font-weight:600; font-size:12px; padding:6px 8px; }
.payroll-table tr.posted td, .customer-table tr.posted td { opacity:.55; }
.payroll-table .num, .customer-table .num { text-align:right; font-variant-numeric:tabular-nums; }
.payroll-filters .filters-row, .customer-filters .filters-row { display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
.gap-sm { gap:8px; }


@media (max-width: 900px) {
  .ledger-grid-wrapper { border-radius:8px; }
  .kpi-grid { grid-template-columns: repeat(auto-fit,minmax(120px,1fr)); }
}
</style>
