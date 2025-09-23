import { ref, computed } from 'vue'
import { useAccountsStore } from '@/stores/accounts'

export interface ExternalTransaction {
  id: string
  date: string // ISO
  amount: number // positive for inflow, negative for outflow
  source: string // e.g. 'payroll', 'advance', 'receipt'
  meta?: Record<string, any>
}

export type PeriodPreset = '7d' | '30d' | 'qtd' | 'mtd' | 'ytd'

function startOfQuarter(d: Date) {
  const q = Math.floor(d.getMonth() / 3)
  return new Date(d.getFullYear(), q * 3, 1)
}

function startOfYear(d: Date) { return new Date(d.getFullYear(), 0, 1) }
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }

export function useFinanceKpis() {
  const accountsStore = useAccountsStore()
  const external = ref<ExternalTransaction[]>([])
  const period = ref<PeriodPreset>('30d')

  const periodRange = computed(() => {
    const now = new Date()
    let from: Date
    switch (period.value) {
      case '7d': from = new Date(now.getTime() - 7 * 86400000); break
      case '30d': from = new Date(now.getTime() - 30 * 86400000); break
      case 'qtd': from = startOfQuarter(now); break
      case 'mtd': from = startOfMonth(now); break
      case 'ytd': from = startOfYear(now); break
      default: from = new Date(now.getTime() - 30 * 86400000)
    }
    return { from, to: now }
  })

  const allTransactions = computed(() => {
    // Map store transactions to unified direction (credit positive / debit negative assumption)
    const core = accountsStore.transactions.map(t => ({
      id: t.id,
      date: t.date,
      amount: t.amount, // already signed in seed (credits positive, debits negative)
      source: 'accounts',
      meta: { accountId: t.accountId, category: t.category, reconciled: t.reconciled }
    }))
    return [...core, ...external.value]
  })

  const periodTransactions = computed(() => {
    const { from, to } = periodRange.value
    return allTransactions.value.filter(t => {
      const d = new Date(t.date)
      return d >= from && d <= to
    })
  })

  const totalInflow = computed(() => periodTransactions.value.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0))
  const totalOutflow = computed(() => periodTransactions.value.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0))
  const netFlow = computed(() => totalInflow.value - totalOutflow.value)
  const avgDailyNet = computed(() => {
    const days = Math.max(1, Math.round((periodRange.value.to.getTime() - periodRange.value.from.getTime()) / 86400000))
    return netFlow.value / days
  })

  const largestOutflow = computed(() => {
    const negative = periodTransactions.value.filter(t => t.amount < 0)
    if (!negative.length) return 0
    return Math.min(...negative.map(t => t.amount)) // most negative
  })

  const inflowToOutflowRatio = computed(() => totalOutflow.value === 0 ? null : totalInflow.value / totalOutflow.value)

  const registerExternalTransactions = (tx: ExternalTransaction | ExternalTransaction[]) => {
    const arr = Array.isArray(tx) ? tx : [tx]
    external.value.push(...arr)
  }

  const clearExternalBySource = (source: string) => {
    external.value = external.value.filter(t => t.source !== source)
  }

  const kpiCards = computed(() => [
    { key: 'inflow', label: 'Inflows', value: currency(totalInflow.value), foot: periodLabel.value },
    { key: 'outflow', label: 'Outflows', value: currency(totalOutflow.value), foot: periodLabel.value, warn: totalOutflow.value > totalInflow.value * 0.8 },
    { key: 'net', label: 'Net Flow', value: currency(netFlow.value), foot: avgDailyNet.value ? `Avg/day ${currency(avgDailyNet.value)}` : '', success: netFlow.value > 0, warn: netFlow.value < 0 },
    { key: 'ratio', label: 'In/Out Ratio', value: inflowToOutflowRatio.value ? inflowToOutflowRatio.value.toFixed(2) : '—', foot: 'Efficiency' }
  ])

  const periodLabel = computed(() => {
    switch (period.value) {
      case '7d': return 'Last 7d'
      case '30d': return 'Last 30d'
      case 'qtd': return 'Quarter'
      case 'mtd': return 'Month'
      case 'ytd': return 'Year'
      default: return ''
    }
  })

  const currency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)

  return {
    // state
    period,
    // computed
    periodRange, allTransactions, periodTransactions, totalInflow, totalOutflow, netFlow, avgDailyNet, largestOutflow, inflowToOutflowRatio, kpiCards, periodLabel,
    // actions
    registerExternalTransactions, clearExternalBySource
  }
}
