<template>
  <div class="accounts-dashboard">
    <!-- Hero KPIs -->
    <HeroKpiGroup :kpis="heroKpis" aria-label="Accounts KPIs">
      <template #title>
        <v-icon size="30" class="mr-2 kpi-icon">mdi-calculator-variant</v-icon>
        Accounts Overview
      </template>
      <template #subtitle>
        Financial position snapshot across cash, liabilities and equity
      </template>
      <template #actions>
        <v-btn size="small" color="white" variant="outlined" prepend-icon="mdi-plus" @click="openAddAccount">
          New Account
        </v-btn>
      </template>
    </HeroKpiGroup>

    <!-- Filters -->
    <AdvancedFilterPanel
      title="Filters"
      :active-count="activeFilterCount"
      :active-pills="activePills"
      show-clear
      show-advanced-toggle
      @clear="clearAllFilters"
    >
      <template #quick>
        <button class="qf-btn" :class="{ active: quickScope==='all' }" @click="setQuick('all')">
          <v-icon size="14">mdi-view-grid</v-icon>
          All
        </button>
        <button class="qf-btn" :class="{ active: quickScope==='cash' }" @click="setQuick('cash')">
          <v-icon size="14">mdi-cash</v-icon>
          Cash & Bank
        </button>
        <button class="qf-btn" :class="{ active: quickScope==='liability' }" @click="setQuick('liability')">
          <v-icon size="14">mdi-balance-scale</v-icon>
          Liabilities
        </button>
        <button class="qf-btn" :class="{ active: quickScope==='equity' }" @click="setQuick('equity')">
          <v-icon size="14">mdi-chart-line</v-icon>
          Equity
        </button>
      </template>

      <!-- Advanced Fields -->
      <div class="af-field">
        <label class="af-label">Search</label>
        <v-text-field
          v-model="store.accountSearch"
          density="compact"
          variant="outlined"
          hide-details
          prepend-inner-icon="mdi-magnify"
          placeholder="Name or ID"
        />
      </div>
      <div class="af-field">
        <label class="af-label">Type</label>
        <v-select
          v-model="store.accountTypeFilter"
          density="compact"
          variant="outlined"
          hide-details
          :items="accountTypeItems"
          placeholder="Any"
          clearable
        />
      </div>
      <div class="af-field">
        <label class="af-label">Status</label>
        <v-select
          v-model="store.statusFilter"
          density="compact"
          variant="outlined"
          hide-details
          :items="statusItems"
          placeholder="Any"
          clearable
        />
      </div>
    </AdvancedFilterPanel>

    <!-- Accounts Table -->
    <div class="accounts-table-wrapper">
      <v-data-table
        :headers="headers"
        :items="pagedAccounts"
        :items-length="store.filteredAccounts.length"
        :page="page"
        :items-per-page="itemsPerPage"
        class="elevated-table"
        item-key="id"
        density="comfortable"
        @update:page="page = $event"
        @update:items-per-page="itemsPerPage = $event"
      >
        <template #item.name="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-600">{{ item.name }}</span>
            <span class="text-caption text-medium-emphasis">{{ item.id }}</span>
          </div>
        </template>
        <template #item.type="{ item }">
          <v-chip size="x-small" :color="typeColor(item.type)" class="text-white" variant="flat">{{ item.type }}</v-chip>
        </template>
        <template #item.balance="{ item }">
          <span :class="{'text-error': item.balance < 0, 'text-success': item.balance > 0 }">{{ currency(item.balance) }}</span>
        </template>
        <template #item.status="{ item }">
          <v-chip size="x-small" :color="item.status==='active' ? 'success' : 'grey'" variant="tonal">{{ item.status }}</v-chip>
        </template>
        <template #item.lastActivity="{ item }">
          <span class="text-caption">{{ formatDate(item.lastActivity) }}</span>
        </template>

        <template #bottom>
          <TableFooterSummary
            :start="startIndex"
            :end="endIndex"
            :total-filtered="store.filteredAccounts.length"
            :page="page"
            :pages="totalPages"
            :items-per-page="itemsPerPage"
            @update:page="page = $event"
            @update:items-per-page="itemsPerPage = $event"
            :summary="netSummary"
          />
        </template>
      </v-data-table>
    </div>

    <!-- Add Account Dialog (placeholder) -->
    <v-dialog v-model="showAddDialog" max-width="520">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-plus</v-icon> New Account
        </v-card-title>
        <v-card-text>
          <p class="text-body-2 mb-2">Form coming soon.</p>
          <v-text-field label="Name" density="compact" variant="outlined" hide-details class="mb-2" />
          <v-select label="Type" :items="accountTypeItems" density="compact" variant="outlined" hide-details class="mb-2" />
          <v-text-field label="Opening Balance" density="compact" variant="outlined" hide-details />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
            <v-btn variant="text" @click="showAddDialog=false">Cancel</v-btn>
            <v-btn color="primary" variant="flat" @click="showAddDialog=false">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
// @ts-ignore - allow optional import typing depending on Vuetify version
import type { DataTableHeader } from 'vuetify'
import { useAccountsStore } from '@/stores/accounts'
import HeroKpiGroup from '@/components/common/HeroKpiGroup.vue'
import AdvancedFilterPanel from '@/components/common/AdvancedFilterPanel.vue'
import TableFooterSummary from '@/components/common/TableFooterSummary.vue'

const store = useAccountsStore()

// Pagination state
const page = ref(1)
const itemsPerPage = ref(10)
const showAddDialog = ref(false)

// Quick scope filter (subset convenience)
const quickScope = ref<'all' | 'cash' | 'liability' | 'equity'>('all')
const setQuick = (scope: typeof quickScope.value) => { quickScope.value = scope }

// Derived collection with quick scope applied
const scopedAccounts = computed(() => {
  if (quickScope.value === 'all') return store.filteredAccounts
  if (quickScope.value === 'cash') return store.filteredAccounts.filter(a => a.type === 'cash' || a.type === 'bank')
  if (quickScope.value === 'liability') return store.filteredAccounts.filter(a => a.type === 'liability')
  if (quickScope.value === 'equity') return store.filteredAccounts.filter(a => a.type === 'equity')
  return store.filteredAccounts
})

// Pagination slice
const startIndex = computed(() => (page.value - 1) * itemsPerPage.value)
const endIndex = computed(() => startIndex.value + itemsPerPage.value)
const pagedAccounts = computed(() => scopedAccounts.value.slice(startIndex.value, endIndex.value))
const totalPages = computed(() => Math.ceil(scopedAccounts.value.length / itemsPerPage.value) || 1)
watch([scopedAccounts, itemsPerPage], () => { if (page.value > totalPages.value) page.value = 1 })

// Headers (typed for Vuetify data table)
const headers: DataTableHeader[] = [
  { title: 'Account', value: 'name', sortable: true, align: 'start' },
  { title: 'Type', value: 'type', width: 110, align: 'start' },
  { title: 'Balance', value: 'balance', align: 'end', sortable: true },
  { title: 'Status', value: 'status', width: 100, align: 'start' },
  { title: 'Last Activity', value: 'lastActivity', width: 130, align: 'start' }
]

// KPI setup
const heroKpis = computed(() => [
  { key: 'total', label: 'Total Accounts', value: store.totalAccounts, foot: 'All types' },
  { key: 'active', label: 'Active', value: store.activeAccounts, foot: 'Enabled', success: true },
  { key: 'cash', label: 'Cash & Bank', value: currency(store.totalCash), foot: 'Liquid funds' },
  { key: 'liabilities', label: 'Liabilities', value: currency(store.totalLiabilities), foot: 'Obligations', warn: store.totalLiabilities < 0 },
  { key: 'net', label: 'Net Position', value: currency(store.netPosition), foot: 'All balances', success: store.netPosition > 0 }
])

// Active filters pills
const activePills = computed(() => {
  const pills: any[] = []
  if (store.accountTypeFilter) pills.push({ key: 'type', label: `Type: ${store.accountTypeFilter}`, icon: 'mdi-shape', clear: () => store.accountTypeFilter = null, type: 'field' })
  if (store.statusFilter) pills.push({ key: 'status', label: `Status: ${store.statusFilter}`, icon: 'mdi-toggle-switch', clear: () => store.statusFilter = null, type: 'field' })
  if (store.accountSearch) pills.push({ key: 'search', label: `Search: ${store.accountSearch}`, icon: 'mdi-magnify', clear: () => store.accountSearch = '', type: 'field' })
  if (quickScope.value !== 'all') pills.push({ key: 'scope', label: `Scope: ${quickScope.value}`, icon: 'mdi-filter', clear: () => quickScope.value = 'all', type: 'quick' })
  return pills
})
const activeFilterCount = computed(() => activePills.value.length)

// Select items
const accountTypeItems = ['cash','bank','asset','liability','equity','revenue','expense']
const statusItems = ['active','inactive']

// Helpers
const currency = (v: number) => new Intl.NumberFormat('en-US',{ style:'currency', currency:'USD' }).format(v)
const formatDate = (d: string) => new Date(d).toLocaleDateString(undefined,{ month:'short', day:'numeric' })
const typeColor = (t: string) => ({ cash:'teal', bank:'teal-darken-2', asset:'indigo', liability:'orange-darken-2', equity:'purple', revenue:'green-darken-1', expense:'red-darken-1' } as any)[t] || 'grey'
const netSummary = computed(() => `Net: ${currency(store.netPosition)}`)

const clearAllFilters = () => {
  store.accountTypeFilter = null
  store.statusFilter = null
  store.accountSearch = ''
  quickScope.value = 'all'
}

const openAddAccount = () => { showAddDialog.value = true }
</script>

<style scoped>
.accounts-dashboard{display:flex;flex-direction:column;gap:26px;padding:18px 24px 60px;}
.kpi-icon{color:#fff !important;filter:drop-shadow(0 2px 4px rgba(0,0,0,.35));}
.accounts-table-wrapper{background:#fff;border:1px solid #e5e7eb;border-radius:22px;overflow:hidden;box-shadow:0 4px 18px -4px rgba(0,0,0,.08),0 2px 4px rgba(0,0,0,.04);} 
.elevated-table :deep(thead){background:linear-gradient(90deg,#fafbfc,#f1f4f7);} 
.elevated-table :deep(th){font-weight:600 !important;font-size:12px !important;letter-spacing:.6px;text-transform:uppercase;color:#4b5563 !important;border-bottom:1px solid #e5e7eb !important;}
.elevated-table :deep(td){font-size:13px;}
.elevated-table :deep(tbody tr:hover){background:#f7f9fb !important;}
.elevated-table :deep(.v-data-table__td--align-end){text-align:right;}
@media (max-width:960px){.accounts-dashboard{padding:16px 16px 48px;}}
</style>
