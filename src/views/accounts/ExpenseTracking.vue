<template>
  <div class="expenses-view">
    <HeroKpiGroup :kpis="kpis" aria-label="Expense KPIs">
      <template #title>
        <v-icon size="28" class="mr-2 kpi-icon">mdi-receipt-text</v-icon>
        Expense Tracking
      </template>
      <template #subtitle>Monitoring spend velocity & approval pipeline ({{ periodLabel }})</template>
      <template #actions>
        <v-btn v-for="p in periods" :key="p.key" size="small" :color="period===p.key ? 'white':'white'" :variant="period===p.key ? 'flat':'outlined'" class="period-btn" @click="setPeriod(p.key as any)">{{ p.label }}</v-btn>
      </template>
    </HeroKpiGroup>

    <AdvancedFilterPanel
      title="Expense Filters"
      :active-count="pillCount"
      :active-pills="pills"
      show-clear
      show-advanced-toggle
      @clear="clearAll"
    >
      <template #quick>
        <button class="qf-btn" :class="{ active: status==='all' }" @click="setStatus('all')"><v-icon size="14">mdi-inbox</v-icon>All</button>
        <button class="qf-btn" :class="{ active: status==='pending' }" @click="setStatus('pending')"><v-icon size="14">mdi-timer-sand</v-icon>Pending</button>
        <button class="qf-btn" :class="{ active: status==='approved' }" @click="setStatus('approved')"><v-icon size="14">mdi-check</v-icon>Approved</button>
        <button class="qf-btn" :class="{ active: status==='rejected' }" @click="setStatus('rejected')"><v-icon size="14">mdi-close</v-icon>Rejected</button>
      </template>
      <div class="af-field">
        <label class="af-label">Category</label>
        <v-select v-model="categoryFilter" :items="categoryItems" density="compact" variant="outlined" hide-details clearable placeholder="Any" />
      </div>
      <div class="af-field">
        <label class="af-label">Search</label>
        <v-text-field v-model="search" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-magnify" placeholder="Vendor or ID" />
      </div>
    </AdvancedFilterPanel>

    <div class="expenses-card">
      <h3 class="table-title"><v-icon size="18" class="mr-1">mdi-table</v-icon>Expenses</h3>
      <v-data-table
        :headers="headers"
        :items="paged"
  :items-length="filtered.length"
        :page="page"
        :items-per-page="perPage"
        density="comfortable"
        class="expense-table"
        item-key="id"
        @update:page="page=$event"
        @update:items-per-page="perPage=$event"
      >
        <template #item.date="{ item }">{{ shortDate(item.date) }}</template>
        <template #item.vendor="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-600">{{ item.vendor }}</span>
            <span class="text-caption text-medium-emphasis">{{ item.id }}</span>
          </div>
        </template>
        <template #item.amount="{ item }">
          <span :class="item.status==='approved' ? 'text-success' : (item.status==='rejected' ? 'text-error':'')">{{ currency(item.amount) }}</span>
        </template>
        <template #item.category="{ item }">
          <v-chip size="x-small" color="primary" variant="tonal">{{ item.category }}</v-chip>
        </template>
        <template #item.status="{ item }">
          <v-chip size="x-small" :color="statusColor(item.status)" variant="flat" class="status-chip">{{ item.status }}</v-chip>
        </template>
        <template #bottom>
          <TableFooterSummary
            :start="start"
            :end="end"
            :total-filtered="filtered.length"
            :page="page"
            :pages="pages"
            :items-per-page="perPage"
            :summary="summary"
            @update:page="page=$event"
            @update:items-per-page="perPage=$event"
          />
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeroKpiGroup from '@/components/common/HeroKpiGroup.vue'
import AdvancedFilterPanel from '@/components/common/AdvancedFilterPanel.vue'
import TableFooterSummary from '@/components/common/TableFooterSummary.vue'
import { useFinanceKpis } from '@/composables/useFinanceKpis'
import { useAccountsStore } from '@/stores/accounts'

const store = useAccountsStore()
const { period, periodLabel } = useFinanceKpis() // reuse period presets only

// Query state init
const route = useRoute(); const router = useRouter()
if (typeof route.query.period === 'string' && ['7d','30d','mtd','qtd','ytd'].includes(route.query.period)) period.value = route.query.period as any

const status = ref<'all'|'pending'|'approved'|'rejected'>(['pending','approved','rejected'].includes(String(route.query.status)) ? route.query.status as any : 'all')
const categoryFilter = ref<string | null>(route.query.category ? String(route.query.category) : null)
const search = ref(route.query.search ? String(route.query.search) : '')

watch([period, status, categoryFilter, search], () => {
  const q: Record<string,string> = {}
  if (period.value) q.period = period.value
  if (status.value !== 'all') q.status = status.value
  if (categoryFilter.value) q.category = categoryFilter.value
  if (search.value) q.search = search.value
  router.replace({ query: q })
})

const periods = [
  { key:'7d', label:'7d' },
  { key:'30d', label:'30d' },
  { key:'mtd', label:'MTD' },
  { key:'qtd', label:'QTD' },
  { key:'ytd', label:'YTD' }
]
const setPeriod = (p:'7d'|'30d'|'mtd'|'qtd'|'ytd') => { period.value = p as any }
const setStatus = (s:'all'|'pending'|'approved'|'rejected') => { status.value = s }

// Source data (filter by period date range)
const periodFiltered = computed(() => {
  const now = new Date()
  const start = new Date()
  if (period.value === '7d') start.setDate(now.getDate()-7)
  else if (period.value === '30d') start.setDate(now.getDate()-30)
  else if (period.value === 'mtd') { start.setDate(1) }
  else if (period.value === 'qtd') { start.setMonth(Math.floor(now.getMonth()/3)*3,1) }
  else if (period.value === 'ytd') { start.setMonth(0,1) }
  return store.expenses.filter(e => new Date(e.date) >= start)
})

const filtered = computed(() => periodFiltered.value.filter(e => {
  if (status.value !== 'all' && e.status !== status.value) return false
  if (categoryFilter.value && e.category !== categoryFilter.value) return false
  if (search.value && !`${e.vendor}${e.id}`.toLowerCase().includes(search.value.toLowerCase())) return false
  return true
}).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()))

// Pagination
const page = ref(1); const perPage = ref(12)
const start = computed(() => (page.value - 1) * perPage.value)
const end = computed(() => start.value + perPage.value)
const paged = computed(() => filtered.value.slice(start.value, end.value))
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))
watch([filtered, perPage], () => { if (page.value > pages.value) page.value = 1 })

// Headers
interface H { title: string; value: string; align?: 'start'|'end'|'center'; width?: number; sortable?: boolean }
const headers: H[] = [
  { title: 'Date', value: 'date', width: 110 },
  { title: 'Vendor', value: 'vendor' },
  { title: 'Category', value: 'category', width: 120 },
  { title: 'Amount', value: 'amount', align: 'end', sortable: true },
  { title: 'Status', value: 'status', width: 110 }
]

// KPIs
const total = computed(() => filtered.value.length)
const totalApproved = computed(() => filtered.value.filter(e => e.status==='approved').length)
const pending = computed(() => filtered.value.filter(e => e.status==='pending').length)
const rejected = computed(() => filtered.value.filter(e => e.status==='rejected').length)
const spend = computed(() => filtered.value.filter(e => e.status==='approved').reduce((s,e)=> s + e.amount,0))

const kpis = computed(() => [
  { key: 'total', label: 'Total', value: total.value, foot: 'Filtered' },
  { key: 'approved', label: 'Approved', value: totalApproved.value, foot: 'Approved', success: true },
  { key: 'pending', label: 'Pending', value: pending.value, foot: 'Awaiting', warn: pending.value>0 },
  { key: 'rejected', label: 'Rejected', value: rejected.value, foot: 'Declined' },
  { key: 'spend', label: 'Approved Spend', value: currency(spend.value), foot: 'Sum' }
])

// Category items
const categoryItems = computed(() => Array.from(new Set(store.expenses.map(e => e.category))))

// Pills
const pills = computed(() => {
  const arr: any[] = []
  if (status.value !== 'all') arr.push({ key:'status', label:`Status: ${status.value}`, icon:'mdi-filter', clear:() => status.value='all', type:'quick' })
  if (categoryFilter.value) arr.push({ key:'cat', label:`Category: ${categoryFilter.value}`, icon:'mdi-shape', clear:() => categoryFilter.value=null, type:'field' })
  if (search.value) arr.push({ key:'search', label:`Search: ${search.value}`, icon:'mdi-magnify', clear:() => search.value='', type:'field' })
  return arr
})
const pillCount = computed(() => pills.value.length)

// Summary
const summary = computed(() => `Approved Spend: ${currency(spend.value)}`)

const clearAll = () => { status.value='all'; categoryFilter.value=null; search.value=''; page.value=1 }

// Helpers
const currency = (v: number) => new Intl.NumberFormat('en-US',{ style:'currency', currency:'USD' }).format(v)
const shortDate = (d: string) => new Date(d).toLocaleDateString(undefined,{ month:'short', day:'numeric' })
const statusColor = (s: string) => ({ approved:'green', pending:'amber', rejected:'red' } as any)[s] || 'grey'
</script>

<style scoped>
.expenses-view{display:flex;flex-direction:column;gap:26px;padding:18px 24px 60px;}
.kpi-icon{color:#fff !important;}
.expenses-card{background:#fff;border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;box-shadow:0 4px 16px -4px rgba(0,0,0,.08),0 2px 4px rgba(0,0,0,.04);display:flex;flex-direction:column;}
.table-title{margin:0;padding:14px 18px;font-size:13px;letter-spacing:.6px;text-transform:uppercase;font-weight:700;display:flex;align-items:center;gap:4px;border-bottom:1px solid #e5e7eb;background:linear-gradient(90deg,#fafbfc,#f1f4f7);color:#334155;}
.expense-table :deep(thead){background:linear-gradient(90deg,#fafbfc,#f1f4f7);} 
.expense-table :deep(th){font-weight:600 !important;font-size:11px !important;letter-spacing:.55px;color:#475569 !important;text-transform:uppercase;border-bottom:1px solid #e5e7eb !important;}
.expense-table :deep(td){font-size:12.5px;}
.expense-table :deep(tbody tr:hover){background:#f7f9fb !important;}
.status-chip{color:#fff !important;}
@media (max-width:960px){.expenses-view{padding:16px 16px 48px;}}
</style>
