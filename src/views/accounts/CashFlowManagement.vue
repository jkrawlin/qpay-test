<template>
  <div class="cashflow-view">
    <HeroKpiGroup :kpis="kpiCards" aria-label="Cash Flow KPIs">
      <template #title>
        <v-icon size="28" class="mr-2 kpi-icon">mdi-cash-multiple</v-icon>
        Cash Flow
      </template>
      <template #subtitle>
        Monitoring inflows & outflows ({{ periodLabel }})
      </template>
      <template #actions>
  <v-btn v-for="p in periods" :key="p.key" size="small" :color="period===p.key ? 'white' : 'white'" :variant="period===p.key ? 'flat':'outlined'" class="period-btn" @click="setPeriod(p.key as '7d'|'30d'|'mtd'|'qtd'|'ytd')">{{ p.label }}</v-btn>
      </template>
    </HeroKpiGroup>

    <AdvancedFilterPanel
      title="Flow Filters"
      :active-count="pillCount"
      :active-pills="pills"
      show-clear
      show-advanced-toggle
      @clear="clearAll"
    >
      <template #quick>
        <button class="qf-btn" :class="{ active: direction==='all' }" @click="setDirection('all')"><v-icon size="14">mdi-sync</v-icon>All</button>
        <button class="qf-btn" :class="{ active: direction==='in' }" @click="setDirection('in')"><v-icon size="14">mdi-trending-up</v-icon>Inflows</button>
        <button class="qf-btn" :class="{ active: direction==='out' }" @click="setDirection('out')"><v-icon size="14">mdi-trending-down</v-icon>Outflows</button>
      </template>
      <div class="af-field">
        <label class="af-label">Source</label>
        <v-select v-model="sourceFilter" :items="sourceItems" density="compact" variant="outlined" hide-details clearable placeholder="Any" />
      </div>
      <div class="af-field">
        <label class="af-label">Search</label>
        <v-text-field v-model="search" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-magnify" placeholder="ID or category" />
      </div>
    </AdvancedFilterPanel>

    <div class="unified-card">
      <h3 class="flow-title combined"><v-icon size="18" class="mr-1">mdi-timeline-text</v-icon>Combined Flows</h3>
      <v-data-table
        :headers="headers"
        :items="paged"
  :items-length="filtered.length"
        :page="page"
        :items-per-page="perPage"
        class="flow-table unified-table"
        item-key="id"
        density="comfortable"
        @update:page="page=$event"
        @update:items-per-page="perPage=$event"
      >
        <template #item.date="{ item }">{{ shortDate(item.date) }}</template>
        <template #item.direction="{ item }">
          <v-chip size="x-small" :color="item.amount>0 ? 'success':'error'" variant="flat" class="dir-chip" :class="item.amount>0 ? 'in' : 'out'">
            <v-icon size="14" start>{{ item.amount>0 ? 'mdi-arrow-bottom-left' : 'mdi-arrow-top-right' }}</v-icon>
            {{ item.amount>0 ? 'Inflow' : 'Outflow' }}
          </v-chip>
        </template>
        <template #item.amount="{ item }">
            <span :class="item.amount>0 ? 'text-success' : 'text-error'">{{ currency(Math.abs(item.amount)) }}</span>
        </template>
        <template #item.source="{ item }">
          <v-chip size="x-small" :color="item.amount>0 ? 'primary':'deep-orange'" variant="tonal">{{ item.source }}</v-chip>
        </template>
        <template #item.running="{ item }">
          <span :class="item.running >= 0 ? 'text-success' : 'text-error'">{{ currency(item.running) }}</span>
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
import { ref, computed, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeroKpiGroup from '@/components/common/HeroKpiGroup.vue'
import AdvancedFilterPanel from '@/components/common/AdvancedFilterPanel.vue'
import TableFooterSummary from '@/components/common/TableFooterSummary.vue'
import { useFinanceKpis } from '@/composables/useFinanceKpis'
import { CASH_FLOW_HEADERS } from '@/constants/financeTableHeaders'

const route = useRoute()
const router = useRouter()
const { period, kpiCards, periodLabel, periodTransactions } = useFinanceKpis()

// initialize from query with allowed presets
if (typeof route.query.period === 'string' && ['7d','30d','mtd','qtd','ytd'].includes(route.query.period)) {
  period.value = route.query.period as any
}
const direction = ref<'all'|'in'|'out'>(['all','in','out'].includes(String(route.query.dir)) ? route.query.dir as any : 'all')

// Local filters
const sourceFilter = ref<string | null>(route.query.source ? String(route.query.source) : null)
const search = ref(route.query.search ? String(route.query.search) : '')

// Persist to query (debounced-ish via watchEffect)
watchEffect(() => {
  const q: Record<string,string> = {}
  if (period.value) q.period = period.value
  if (direction.value !== 'all') q.dir = direction.value
  if (sourceFilter.value) q.source = sourceFilter.value
  if (search.value) q.search = search.value
  router.replace({ query: q })
})

// Period buttons
const periods = [
  { key:'7d', label:'7d' },
  { key:'30d', label:'30d' },
  { key:'mtd', label:'MTD' },
  { key:'qtd', label:'QTD' },
  { key:'ytd', label:'YTD' }
]
const setPeriod = (p:'7d'|'30d'|'mtd'|'qtd'|'ytd') => { period.value = p as any }
const setDirection = (d:'all'|'in'|'out') => { direction.value = d }

// Derive sources list
const sourceItems = computed(() => Array.from(new Set(periodTransactions.value.map(t => t.source))))

// Filtered list + running net
const filtered = computed(() => {
  const base = periodTransactions.value
    .filter(t => {
      if (direction.value === 'in' && t.amount <= 0) return false
      if (direction.value === 'out' && t.amount >= 0) return false
      if (sourceFilter.value && t.source !== sourceFilter.value) return false
      if (search.value && !`${t.id}${t.meta?.category||''}`.toLowerCase().includes(search.value.toLowerCase())) return false
      return true
    })
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  let running = 0
  return base.map(t => {
    running += t.amount
    return { ...t, running }
  })
})

// Pagination unified
const page = ref(1)
const perPage = ref(14)
const start = computed(() => (page.value - 1) * perPage.value)
const end = computed(() => start.value + perPage.value)
const paged = computed(() => filtered.value.slice(start.value, end.value))
const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)))
watch([filtered, perPage], () => { if (page.value > pages.value) page.value = 1 })

// Headers from shared constant
const headers = CASH_FLOW_HEADERS

// KPI pills
const pills = computed(() => {
  const arr: any[] = []
  if (direction.value !== 'all') arr.push({ key:'dir', label:`Direction: ${direction.value}`, icon:'mdi-sync', clear:() => direction.value='all', type:'quick' })
  if (sourceFilter.value) arr.push({ key:'src', label:`Source: ${sourceFilter.value}`, icon:'mdi-database', clear:() => sourceFilter.value=null, type:'field' })
  if (search.value) arr.push({ key:'search', label:`Search: ${search.value}`, icon:'mdi-magnify', clear:() => search.value='', type:'field' })
  return arr
})
const pillCount = computed(() => pills.value.length)

const clearAll = () => {
  direction.value = 'all'
  sourceFilter.value = null
  search.value = ''
  page.value = 1
}

// Summary footer
const summary = computed(() => {
  const net = filtered.value.at(-1)?.running || 0
  return `Net Movement: ${currency(net)}`
})

// Helpers
const currency = (v: number) => new Intl.NumberFormat('en-US',{ style:'currency', currency:'USD' }).format(v)
const shortDate = (d: string) => new Date(d).toLocaleDateString(undefined,{ month:'short', day:'numeric' })
</script>

<style scoped>
.cashflow-view{display:flex;flex-direction:column;gap:26px;padding:18px 24px 60px;}
.kpi-icon{color:#fff !important;}
.unified-card{background:#fff;border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;box-shadow:0 4px 16px -4px rgba(0,0,0,.08),0 2px 4px rgba(0,0,0,.04);display:flex;flex-direction:column;}
.flow-title{margin:0;padding:14px 18px;font-size:13px;letter-spacing:.6px;text-transform:uppercase;font-weight:700;display:flex;align-items:center;gap:4px;border-bottom:1px solid #e5e7eb;background:linear-gradient(90deg,#fafbfc,#f1f4f7);color:#334155;}
.flow-table :deep(thead){background:linear-gradient(90deg,#fafbfc,#f1f4f7);} 
.flow-table :deep(th){font-weight:600 !important;font-size:11px !important;letter-spacing:.55px;color:#475569 !important;text-transform:uppercase;border-bottom:1px solid #e5e7eb !important;}
.flow-table :deep(td){font-size:12.5px;}
.flow-table :deep(tbody tr:hover){background:#f7f9fb !important;}
.dir-chip.in{background:linear-gradient(135deg,#059669,#10b981) !important;color:#fff !important;}
.dir-chip.out{background:linear-gradient(135deg,#dc2626,#f87171) !important;color:#fff !important;}
@media (max-width:960px){.cashflow-view{padding:16px 16px 48px;}}
</style>
