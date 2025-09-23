import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { transactionService } from '@/services/database'
import type { Transaction } from '@/services/database'

export const useTransactionsDbStore = defineStore('transactions-db', () => {
  // State
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const typeFilter = ref<string>('all')
  const statusFilter = ref<string>('all')
  const dateFilter = ref<{ start: string; end: string }>({ start: '', end: '' })
  const sortBy = ref<'date' | 'amount' | 'type' | 'description'>('date')
  const sortOrder = ref<'asc' | 'desc'>('desc')

  // Computed
  const filteredTransactions = computed(() => {
    let filtered = transactions.value

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(query) ||
        transaction.employeeId?.toLowerCase().includes(query) ||
        transaction.customerId?.toLowerCase().includes(query) ||
        transaction.reference?.toLowerCase().includes(query)
      )
    }

    // Filter by type
    if (typeFilter.value !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === typeFilter.value)
    }

    // Filter by status
    if (statusFilter.value !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter.value)
    }

    // Filter by date range
    if (dateFilter.value.start) {
      const startDate = new Date(dateFilter.value.start)
      filtered = filtered.filter(transaction => new Date(transaction.date) >= startDate)
    }
    if (dateFilter.value.end) {
      const endDate = new Date(dateFilter.value.end)
      filtered = filtered.filter(transaction => new Date(transaction.date) <= endDate)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy.value) {
        case 'date':
          aValue = new Date(a.date)
          bValue = new Date(b.date)
          break
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'description':
          aValue = a.description.toLowerCase()
          bValue = b.description.toLowerCase()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  })

  const totalIncome = computed(() =>
    transactions.value
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const totalExpenses = computed(() =>
    transactions.value
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const netBalance = computed(() => totalIncome.value - totalExpenses.value)

  const pendingTransactions = computed(() =>
    transactions.value.filter(t => t.status === 'pending').length
  )

  const recentTransactions = computed(() =>
    transactions.value
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  )

  // Actions
  const fetchTransactions = async () => {
    loading.value = true
    error.value = null
    
    try {
      const unsubscribe = transactionService.onSnapshot((snapshot: Transaction[]) => {
        transactions.value = snapshot
        loading.value = false
      }, (err: Error) => {
        error.value = err.message
        loading.value = false
      })

      // Return unsubscribe function for cleanup
      return unsubscribe
    } catch (err: any) {
      error.value = err.message
      loading.value = false
      throw err
    }
  }

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null

    try {
      const newTransaction: Omit<Transaction, 'id'> = {
        ...transactionData,
        companyId: 'default-company', // This should come from auth store
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const id = await transactionService.create(newTransaction)
      console.log('Transaction created with ID:', id)
      return id
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    loading.value = true
    error.value = null

    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      }
      await transactionService.update(id, updateData)
      console.log('Transaction updated:', id)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTransaction = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      await transactionService.delete(id)
      console.log('Transaction deleted:', id)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getTransactionById = async (id: string): Promise<Transaction | null> => {
    try {
      return await transactionService.getById(id)
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  const searchTransactions = async (query: string) => {
    loading.value = true
    error.value = null

    try {
      const results = await transactionService.search(query, ['description', 'employeeId', 'customerId', 'reference'])
      return results
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const getTransactionsByEmployee = async (employeeId: string) => {
    loading.value = true
    error.value = null

    try {
      const results = await transactionService.search(employeeId, ['employeeId'])
      return results
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const getTransactionsByCustomer = async (customerId: string) => {
    loading.value = true
    error.value = null

    try {
      const results = await transactionService.search(customerId, ['customerId'])
      return results
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const getTransactionsByDateRange = async (startDate: string, endDate: string) => {
    loading.value = true
    error.value = null

    try {
      // This would need a custom query implementation in the service
      const allTransactions = await transactionService.getAll()
      const filtered = allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date)
        return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate)
      })
      return filtered
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const approveTransaction = async (id: string) => {
    return updateTransaction(id, { 
      status: 'completed'
    })
  }

  const rejectTransaction = async (id: string, reason?: string) => {
    return updateTransaction(id, { 
      status: 'cancelled'
    })
  }

  // Filters and sorting
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setTypeFilter = (type: string) => {
    typeFilter.value = type
  }

  const setStatusFilter = (status: string) => {
    statusFilter.value = status
  }

  const setDateFilter = (start: string, end: string) => {
    dateFilter.value = { start, end }
  }

  const setSorting = (field: 'date' | 'amount' | 'type' | 'description', order: 'asc' | 'desc') => {
    sortBy.value = field
    sortOrder.value = order
  }

  const clearFilters = () => {
    searchQuery.value = ''
    typeFilter.value = 'all'
    statusFilter.value = 'all'
    dateFilter.value = { start: '', end: '' }
    sortBy.value = 'date'
    sortOrder.value = 'desc'
  }

  const clearError = () => {
    error.value = null
  }

  // Stats for dashboard
  const getTransactionStats = computed(() => ({
    totalIncome: totalIncome.value,
    totalExpenses: totalExpenses.value,
    netBalance: netBalance.value,
    pending: pendingTransactions.value,
    totalTransactions: transactions.value.length
  }))

  return {
    // State
    transactions,
    loading,
    error,
    searchQuery,
    typeFilter,
    statusFilter,
    dateFilter,
    sortBy,
    sortOrder,

    // Computed
    filteredTransactions,
    totalIncome,
    totalExpenses,
    netBalance,
    pendingTransactions,
    recentTransactions,
    getTransactionStats,

    // Actions
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    searchTransactions,
    getTransactionsByEmployee,
    getTransactionsByCustomer,
    getTransactionsByDateRange,
    approveTransaction,
    rejectTransaction,
    setSearchQuery,
    setTypeFilter,
    setStatusFilter,
    setDateFilter,
    setSorting,
    clearFilters,
    clearError
  }
})