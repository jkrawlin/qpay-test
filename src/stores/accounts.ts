import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Account {
  id: string
  name: string
  type: 'cash' | 'bank' | 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  balance: number
  currency: string
  status: 'active' | 'inactive'
  lastActivity: string
}

export interface Transaction {
  id: string
  accountId: string
  date: string
  description: string
  amount: number
  type: 'debit' | 'credit'
  category: string
  reconciled: boolean
}

export interface Expense {
  id: string
  date: string
  vendor: string
  category: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  accountId: string
}

// Payroll events (not yet posted to journal)
export interface PayrollEvent {
  id: string
  date: string
  employeeId: string
  employeeName: string
  type: 'payroll' | 'advance' | 'benefit'
  gross: number // for payroll run
  taxes: number // withheld / employer portion simplified
  net: number   // take home (gross - taxes for payroll type)
  posted: boolean
}

// Customer AR events
export interface CustomerEvent {
  id: string
  date: string
  customerId: string
  customerName: string
  type: 'invoice' | 'receipt'
  amount: number
  posted: boolean
}

// Expense events (approved operational expenses before posting)
export interface ExpenseEvent {
  id: string
  date: string
  vendor: string
  category: string
  amount: number
  posted: boolean
}

// Double-entry bookkeeping models
export interface JournalLine {
  id: string
  accountId: string
  description?: string
  debit: number // debit amount (>=0)
  credit: number // credit amount (>=0)
}

export interface JournalEntryContext {
  type: 'operational' | 'payroll' | 'customer' | 'quick-expense'
  // For batch events we keep ids to allow undo to un-post them
  eventIds?: string[]
}

export interface JournalEntry {
  id: string
  date: string // ISO date
  reference?: string // external ref / voucher number
  memo?: string
  lines: JournalLine[]
  createdAt: string
  context?: JournalEntryContext
}

function seed<T>(items: T[]): T[] { return items }

export const useAccountsStore = defineStore('accounts', () => {
  // State
  const accounts = ref<Account[]>(seed([
    { id: 'A-100', name: 'Operating Cash', type: 'cash', balance: 45250.32, currency: 'USD', status: 'active', lastActivity: '2025-09-18' },
    { id: 'A-101', name: 'Bank - Checking', type: 'bank', balance: 128450.12, currency: 'USD', status: 'active', lastActivity: '2025-09-20' },
    { id: 'A-102', name: 'Bank - Savings', type: 'bank', balance: 90500.00, currency: 'USD', status: 'active', lastActivity: '2025-09-15' },
    { id: 'A-200', name: 'Accounts Receivable', type: 'asset', balance: 18230.44, currency: 'USD', status: 'active', lastActivity: '2025-09-19' },
    { id: 'A-300', name: 'Accounts Payable', type: 'liability', balance: -12400.75, currency: 'USD', status: 'active', lastActivity: '2025-09-17' },
    { id: 'A-400', name: 'Retained Earnings', type: 'equity', balance: 250000.00, currency: 'USD', status: 'active', lastActivity: '2025-09-01' },
    { id: 'A-500', name: 'Sales Revenue', type: 'revenue', balance: 684500.23, currency: 'USD', status: 'active', lastActivity: '2025-09-20' },
    { id: 'A-600', name: 'Operating Expenses', type: 'expense', balance: -95200.11, currency: 'USD', status: 'active', lastActivity: '2025-09-20' },
    { id: 'A-601', name: 'Transport Expense', type: 'expense', balance: 0, currency: 'USD', status: 'active', lastActivity: '2025-09-20' },
    { id: 'A-602', name: 'Fuel Expense', type: 'expense', balance: 0, currency: 'USD', status: 'active', lastActivity: '2025-09-20' },
    { id: 'A-510', name: 'Misc Income', type: 'revenue', balance: 0, currency: 'USD', status: 'active', lastActivity: '2025-09-20' },
    // Payroll related
    { id: 'A-700', name: 'Salary Expense', type: 'expense', balance: 0, currency: 'USD', status: 'active', lastActivity: '2025-09-20' },
    { id: 'A-701', name: 'Payroll Tax Expense', type: 'expense', balance: 0, currency: 'USD', status: 'active', lastActivity: '2025-09-20' },
    { id: 'A-800', name: 'Payroll Tax Liability', type: 'liability', balance: 0, currency: 'USD', status: 'active', lastActivity: '2025-09-20' },
    { id: 'A-750', name: 'Employee Advances', type: 'asset', balance: 0, currency: 'USD', status: 'active', lastActivity: '2025-09-20' }
  ]))

  const transactions = ref<Transaction[]>(seed([
    { id: 'T-1', accountId: 'A-100', date: '2025-09-20', description: 'Client payment', amount: 2500, type: 'credit', category: 'income', reconciled: true },
    { id: 'T-2', accountId: 'A-300', date: '2025-09-19', description: 'Vendor payment', amount: -1200, type: 'debit', category: 'expense', reconciled: false },
    { id: 'T-3', accountId: 'A-101', date: '2025-09-19', description: 'Bank fee', amount: -25, type: 'debit', category: 'bank-fee', reconciled: true },
    { id: 'T-4', accountId: 'A-200', date: '2025-09-18', description: 'Invoice #155', amount: 1800, type: 'credit', category: 'income', reconciled: false },
    { id: 'T-5', accountId: 'A-600', date: '2025-09-18', description: 'Office supplies', amount: -340, type: 'debit', category: 'office', reconciled: true },
    { id: 'T-6', accountId: 'A-100', date: '2025-09-17', description: 'Subscription', amount: -99, type: 'debit', category: 'software', reconciled: true },
    { id: 'T-7', accountId: 'A-101', date: '2025-09-17', description: 'Client refund', amount: -400, type: 'debit', category: 'refund', reconciled: false },
    { id: 'T-8', accountId: 'A-500', date: '2025-09-17', description: 'Sales batch', amount: 12500, type: 'credit', category: 'income', reconciled: true }
  ]))

  const expenses = ref<Expense[]>(seed([
    { id: 'E-1', date: '2025-09-20', vendor: 'Acme Hosting', category: 'IT', amount: 180, status: 'approved', accountId: 'A-600' },
    { id: 'E-2', date: '2025-09-19', vendor: 'Office Depot', category: 'Office', amount: 340, status: 'pending', accountId: 'A-600' },
    { id: 'E-3', date: '2025-09-18', vendor: 'Travel Co', category: 'Travel', amount: 1250, status: 'approved', accountId: 'A-600' },
    { id: 'E-4', date: '2025-09-17', vendor: 'Consultant LLC', category: 'Professional', amount: 2200, status: 'pending', accountId: 'A-600' },
    { id: 'E-5', date: '2025-09-16', vendor: 'Cloud SaaS', category: 'IT', amount: 99, status: 'approved', accountId: 'A-600' },
  ]))

  const payrollEvents = ref<PayrollEvent[]>(seed([
    { id: 'P-1', date: '2025-09-20', employeeId: 'EMP-100', employeeName: 'Alice Johnson', type: 'payroll', gross: 3000, taxes: 600, net: 2400, posted: false },
    { id: 'P-2', date: '2025-09-20', employeeId: 'EMP-101', employeeName: 'Brian Smith', type: 'payroll', gross: 2800, taxes: 560, net: 2240, posted: false },
    { id: 'P-3', date: '2025-09-19', employeeId: 'EMP-102', employeeName: 'Carla Hill', type: 'advance', gross: 0, taxes: 0, net: 500, posted: false },
    { id: 'P-4', date: '2025-09-18', employeeId: 'EMP-103', employeeName: 'David Lee', type: 'benefit', gross: 300, taxes: 0, net: 300, posted: false }
  ]))

  const customerEvents = ref<CustomerEvent[]>(seed([
    { id: 'C-1', date: '2025-09-20', customerId: 'CUST-10', customerName: 'Nimbus Corp', type: 'invoice', amount: 4200, posted: false },
    { id: 'C-2', date: '2025-09-19', customerId: 'CUST-11', customerName: 'Orbit LLC', type: 'invoice', amount: 1800, posted: false },
    { id: 'C-3', date: '2025-09-19', customerId: 'CUST-10', customerName: 'Nimbus Corp', type: 'receipt', amount: 2500, posted: false },
    { id: 'C-4', date: '2025-09-18', customerId: 'CUST-12', customerName: 'Vector Dynamics', type: 'receipt', amount: 1200, posted: false }
  ]))

  // Journal (double-entry)
  const journalEntries = ref<JournalEntry[]>([])
  const expenseEvents = ref<ExpenseEvent[]>([])

  // Filters (generic pattern for reuse in views)
  const accountSearch = ref('')
  const accountTypeFilter = ref<string | null>(null)
  const statusFilter = ref<string | null>(null)

  // Computed KPIs
  const totalAccounts = computed(() => accounts.value.length)
  const activeAccounts = computed(() => accounts.value.filter(a => a.status === 'active').length)
  const totalCash = computed(() => accounts.value.filter(a => a.type === 'cash' || a.type === 'bank').reduce((s,a)=> s + a.balance,0))
  const totalLiabilities = computed(() => accounts.value.filter(a => a.type === 'liability').reduce((s,a)=> s + a.balance,0))
  const netPosition = computed(() => accounts.value.reduce((s,a)=> s + a.balance,0))

  // Trial balance (from journal) – sums debits and credits independently
  const trialBalance = computed(() => {
    const debitTotal = journalEntries.value.reduce((sum, je) => sum + je.lines.reduce((lSum, l) => lSum + l.debit, 0), 0)
    const creditTotal = journalEntries.value.reduce((sum, je) => sum + je.lines.reduce((lSum, l) => lSum + l.credit, 0), 0)
    return { debitTotal, creditTotal, balanced: Math.abs(debitTotal - creditTotal) < 0.0001 }
  })

  const filteredAccounts = computed(() => {
    return accounts.value.filter(a => {
      if (accountSearch.value && !a.name.toLowerCase().includes(accountSearch.value.toLowerCase()) && !a.id.toLowerCase().includes(accountSearch.value.toLowerCase())) return false
      if (accountTypeFilter.value && a.type !== accountTypeFilter.value) return false
      if (statusFilter.value && a.status !== statusFilter.value) return false
      return true
    })
  })

  // Actions
  const setAccountSearch = (v: string) => accountSearch.value = v
  const setAccountType = (v: string | null) => accountTypeFilter.value = v
  const setStatusFilter = (v: string | null) => statusFilter.value = v

  const addAccount = (account: Account) => {
    accounts.value.push(account)
  }

  const updateAccountBalance = (id: string, delta: number) => {
    const acc = accounts.value.find(a => a.id === id)
    if (acc) acc.balance += delta
  }

  const toggleTransactionReconciled = (id: string) => {
    const t = transactions.value.find(t => t.id === id)
    if (t) t.reconciled = !t.reconciled
  }

  // --- Posting helpers for payroll & customer events ---
  const postPayrollEvents = (ids: string[]) => {
    const targets = payrollEvents.value.filter(e => ids.includes(e.id) && !e.posted)
    if (targets.length === 0) return
    // Aggregate by type (positive advances = issuance, negative advances = repayment)
    let salaryTotal = 0, taxExpenseTotal = 0, taxLiabilityTotal = 0, cashCreditTotal = 0,
        advanceIssueTotal = 0, advanceRepayTotal = 0, benefitTotal = 0
    targets.forEach(e => {
      if (e.type === 'payroll') {
        salaryTotal += e.gross
        taxExpenseTotal += e.taxes
        taxLiabilityTotal += e.taxes
        cashCreditTotal += e.net // paying out net cash
      } else if (e.type === 'advance') {
        if (e.net >= 0) {
          advanceIssueTotal += e.net
          cashCreditTotal += e.net // cash out
        } else {
          // repayment (negative net means money coming back)
          advanceRepayTotal += (-e.net)
        }
      } else if (e.type === 'benefit') {
        benefitTotal += e.net
        cashCreditTotal += e.net
      }
    })
    const lines: PostJournalPayload["lines"] = []
    if (salaryTotal > 0) lines.push({ accountId: 'A-700', debit: salaryTotal })
    if (taxExpenseTotal > 0) lines.push({ accountId: 'A-701', debit: taxExpenseTotal })
    if (benefitTotal > 0) lines.push({ accountId: 'A-700', debit: benefitTotal, description: 'Benefits' })
    if (advanceIssueTotal > 0) lines.push({ accountId: 'A-750', debit: advanceIssueTotal, description: 'Employee Advances Issued' })
    if (advanceRepayTotal > 0) lines.push({ accountId: 'A-100', debit: advanceRepayTotal, description: 'Advance Repayments (Cash In)' })
    if (taxLiabilityTotal > 0) lines.push({ accountId: 'A-800', credit: taxLiabilityTotal })
    if (cashCreditTotal > 0) lines.push({ accountId: 'A-100', credit: cashCreditTotal })
    if (advanceRepayTotal > 0) lines.push({ accountId: 'A-750', credit: advanceRepayTotal, description: 'Advance Repayments Applied' })
    if (lines.length < 2) return
    const entry = postJournalEntry({ memo: 'Payroll batch', lines, context: { type: 'payroll', eventIds: targets.map(t=> t.id) } })
    targets.forEach(t => t.posted = true)
    return entry
  }

  const postCustomerEvents = (ids: string[]) => {
    const targets = customerEvents.value.filter(e => ids.includes(e.id) && !e.posted)
    if (targets.length === 0) return
    let invoiceTotal = 0, receiptTotal = 0
    targets.forEach(e => {
      if (e.type === 'invoice') invoiceTotal += e.amount
      else if (e.type === 'receipt') receiptTotal += e.amount
    })
    const lines: PostJournalPayload['lines'] = []
    // Invoices: Dr AR Cr Revenue
    if (invoiceTotal > 0) {
      lines.push({ accountId: 'A-200', debit: invoiceTotal })
      lines.push({ accountId: 'A-500', credit: invoiceTotal })
    }
    // Receipts: Dr Cash Cr AR
    if (receiptTotal > 0) {
      lines.push({ accountId: 'A-100', debit: receiptTotal })
      lines.push({ accountId: 'A-200', credit: receiptTotal })
    }
    if (lines.length < 2) return
    const entry = postJournalEntry({ memo: 'Customer batch', lines, context: { type: 'customer', eventIds: targets.map(t=> t.id) } })
    targets.forEach(t => t.posted = true)
    return entry
  }

  // --- Journal Helpers & Actions ---
  let journalSeq = 1
  const genEntryId = () => `JE-${journalSeq++}`
  let journalLineSeq = 1
  const genLineId = () => `JL-${journalLineSeq++}`

  interface PostJournalPayload {
    date?: string
    reference?: string
    memo?: string
    lines: Array<Partial<JournalLine> & { accountId: string; debit?: number; credit?: number; description?: string }>
    context?: JournalEntryContext
  }

  const postJournalEntry = (payload: PostJournalPayload) => {
    if (!payload.lines || payload.lines.length < 2) {
      throw new Error('A journal entry requires at least two lines.')
    }

    // Normalize & validate lines
    const lines: JournalLine[] = payload.lines.map(raw => {
      const account = accounts.value.find(a => a.id === raw.accountId)
      if (!account) throw new Error(`Account not found: ${raw.accountId}`)
      const debit = Number(raw.debit || 0)
      const credit = Number(raw.credit || 0)
      if (debit < 0 || credit < 0) throw new Error('Debit and credit must be non-negative.')
      if (debit > 0 && credit > 0) throw new Error('A line cannot have both debit and credit amounts.')
      if (debit === 0 && credit === 0) throw new Error('A line must have either a debit or credit amount.')
      return {
        id: genLineId(),
        accountId: raw.accountId,
        description: raw.description,
        debit,
        credit
      }
    })

    const totalDebits = lines.reduce((s,l)=> s + l.debit, 0)
    const totalCredits = lines.reduce((s,l)=> s + l.credit, 0)
    if (Math.abs(totalDebits - totalCredits) > 0.0001) {
      throw new Error(`Unbalanced entry: debits (${totalDebits}) do not equal credits (${totalCredits}).`)
    }

    // Apply to account balances (simple approach: debit adds for asset/expense, credit subtracts; reverse for liability/equity/revenue)
    lines.forEach(line => {
      const acc = accounts.value.find(a => a.id === line.accountId)
      if (!acc) return
      const isDebitNormal = (acc.type === 'asset' || acc.type === 'expense' || acc.type === 'cash' || acc.type === 'bank')
      const delta = line.debit - line.credit
      // For normal debit accounts delta is added as-is; for normal credit accounts invert
      acc.balance += isDebitNormal ? delta : -delta
      acc.lastActivity = payload.date || new Date().toISOString().slice(0,10)
    })

    const entry: JournalEntry = {
      id: genEntryId(),
      date: payload.date || new Date().toISOString().slice(0,10),
      reference: payload.reference,
      memo: payload.memo,
      lines,
      createdAt: new Date().toISOString(),
      context: payload.context
    }
    journalEntries.value.unshift(entry)
    return entry
  }

  // --- Integration Helpers ---
  let payrollIdSeq = 1000
  const genPayrollId = () => `P-${++payrollIdSeq}`
  let customerIdSeq = 1000
  const genCustomerId = () => `C-${++customerIdSeq}`

  /** Register a new payroll event (e.g., from payroll processing module) */
  const registerPayrollEvent = (evt: Omit<PayrollEvent,'id'|'posted'> & { id?: string }) => {
    payrollEvents.value.push({
      id: evt.id || genPayrollId(),
      posted: false,
      ...evt
    })
  }

  /** Register a new customer AR event (invoice or receipt) */
  const registerCustomerEvent = (evt: Omit<CustomerEvent,'id'|'posted'> & { id?: string }) => {
    customerEvents.value.push({
      id: evt.id || genCustomerId(),
      posted: false,
      ...evt
    })
  }

  /** Register an approved expense to later batch post */
  let expenseSeq = 1
  const registerExpenseEvent = (evt: Omit<ExpenseEvent,'id'|'posted'> & { id?: string }) => {
    expenseEvents.value.push({ id: evt.id || `X-${expenseSeq++}`, posted: false, ...evt })
  }

  /** Quick expense helper: creates an immediate balanced journal entry (Debit expense, Credit cash) */
  const quickAddExpense = (accountId: string, amount: number, description?: string, date?: string) => {
    if (amount <= 0) throw new Error('Amount must be positive')
    const lines: PostJournalPayload['lines'] = [
      { accountId, debit: amount, description },
      { accountId: 'A-100', credit: amount }
    ]
    return postJournalEntry({ date, memo: description || 'Quick expense', lines, context: { type: 'quick-expense' } })
  }
  const quickAddFuelExpense = (amount: number, description = 'Fuel Expense', date?: string) => quickAddExpense('A-602', amount, description, date)
  const quickAddTransportExpense = (amount: number, description = 'Transport Expense', date?: string) => quickAddExpense('A-601', amount, description, date)

  /** Undo the most recently posted journal entry including un-posting batch events if applicable */
  const undoLastJournalEntry = () => {
    const entry = journalEntries.value.shift()
    if (!entry) return
    // Reverse account balance effects
    entry.lines.forEach(line => {
      const acc = accounts.value.find(a => a.id === line.accountId)
      if (!acc) return
      const isDebitNormal = (acc.type === 'asset' || acc.type === 'expense' || acc.type === 'cash' || acc.type === 'bank')
      const delta = line.debit - line.credit
      acc.balance -= isDebitNormal ? delta : -delta
      acc.lastActivity = new Date().toISOString().slice(0,10)
    })
    // Un-post related events for payroll / customer batches
    if (entry.context?.eventIds && entry.context.type === 'payroll') {
      payrollEvents.value.forEach(e => { if (entry.context!.eventIds!.includes(e.id)) e.posted = false })
    } else if (entry.context?.eventIds && entry.context.type === 'customer') {
      customerEvents.value.forEach(e => { if (entry.context!.eventIds!.includes(e.id)) e.posted = false })
    }
    return entry
  }

  /** Export journal entries to CSV string */
  const exportJournalCsv = () => {
    const header = 'Entry ID,Date,Memo,Line ID,Account ID,Account Name,Description,Debit,Credit'
    const rows = journalEntries.value.flatMap(e => e.lines.map(l => {
      const acc = accounts.value.find(a => a.id === l.accountId)
      return [
        e.id,
        e.date,
        e.memo ? '"'+e.memo.replace(/"/g,'""')+'"' : '',
        l.id,
        l.accountId,
        acc ? '"'+acc.name.replace(/"/g,'""')+'"' : '',
        l.description ? '"'+l.description.replace(/"/g,'""')+'"' : '',
        l.debit.toFixed(2),
        l.credit.toFixed(2)
      ].join(',')
    }))
    return [header, ...rows].join('\n')
  }

  return {
    // state
  accounts, transactions, expenses, journalEntries, payrollEvents, customerEvents, expenseEvents,

    // filters
    accountSearch, accountTypeFilter, statusFilter,

  // computed
  totalAccounts, activeAccounts, totalCash, totalLiabilities, netPosition, filteredAccounts, trialBalance,

    // actions
    setAccountSearch, setAccountType, setStatusFilter, addAccount, updateAccountBalance, toggleTransactionReconciled,
    postJournalEntry, postPayrollEvents, postCustomerEvents,
    registerPayrollEvent, registerCustomerEvent, registerExpenseEvent,
    quickAddExpense, quickAddFuelExpense, quickAddTransportExpense,
    undoLastJournalEntry, exportJournalCsv
  }
})
