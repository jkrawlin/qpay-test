import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { payrollService } from '@/services/database'
import type { PayrollRecord } from '@/services/database'

export const usePayrollDbStore = defineStore('payroll-db', () => {
  // State
  const payrollRecords = ref<PayrollRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const statusFilter = ref<string>('all')
  const monthFilter = ref<string>('')
  const sortBy = ref<'employeeName' | 'month' | 'baseSalary' | 'status'>('month')
  const sortOrder = ref<'asc' | 'desc'>('desc')

  // Computed
  const filteredPayrollRecords = computed(() => {
    let filtered = payrollRecords.value

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(record =>
        record.employeeName.toLowerCase().includes(query) ||
        record.employeeId.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter.value !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter.value)
    }

    // Filter by month
    if (monthFilter.value) {
      filtered = filtered.filter(record => record.month === monthFilter.value)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy.value) {
        case 'employeeName':
          aValue = a.employeeName.toLowerCase()
          bValue = b.employeeName.toLowerCase()
          break
        case 'month':
          aValue = a.month
          bValue = b.month
          break
        case 'baseSalary':
          aValue = a.baseSalary
          bValue = b.baseSalary
          break
        case 'status':
          aValue = a.status
          bValue = b.status
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

  const totalPayroll = computed(() => 
    payrollRecords.value.reduce((sum, record) => sum + record.totalSalary, 0)
  )

  const monthlyPayroll = computed(() => {
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    return payrollRecords.value
      .filter(record => record.month === currentMonth)
      .reduce((sum, record) => sum + record.totalSalary, 0)
  })

  const pendingPayroll = computed(() =>
    payrollRecords.value.filter(record => record.status === 'pending').length
  )

  const processedPayroll = computed(() =>
    payrollRecords.value.filter(record => record.status === 'processed').length
  )

  // Actions
  const fetchPayrollRecords = async () => {
    loading.value = true
    error.value = null
    
    try {
      const unsubscribe = payrollService.onSnapshot((snapshot: PayrollRecord[]) => {
        payrollRecords.value = snapshot
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

  const addPayrollRecord = async (recordData: Omit<PayrollRecord, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null

    try {
      const newRecord: Omit<PayrollRecord, 'id'> = {
        ...recordData,
        companyId: 'default-company', // This should come from auth store
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const id = await payrollService.create(newRecord)
      console.log('Payroll record created with ID:', id)
      return id
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePayrollRecord = async (id: string, updates: Partial<PayrollRecord>) => {
    loading.value = true
    error.value = null

    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      }
      await payrollService.update(id, updateData)
      console.log('Payroll record updated:', id)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePayrollRecord = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      await payrollService.delete(id)
      console.log('Payroll record deleted:', id)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getPayrollRecordById = async (id: string): Promise<PayrollRecord | null> => {
    try {
      return await payrollService.getById(id)
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  const searchPayrollRecords = async (query: string) => {
    loading.value = true
    error.value = null

    try {
      const results = await payrollService.search(query, ['employeeName', 'employeeId'])
      return results
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const getPayrollByEmployee = async (employeeId: string) => {
    loading.value = true
    error.value = null

    try {
      const results = await payrollService.getByField('employeeId', employeeId)
      return results
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const getPayrollByMonth = async (month: string) => {
    loading.value = true
    error.value = null

    try {
      const results = await payrollService.getByField('month', month)
      return results
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  const processPayroll = async (id: string) => {
    return updatePayrollRecord(id, { 
      status: 'processed',
      processedAt: new Date()
    })
  }

  const approvePayroll = async (id: string) => {
    return updatePayrollRecord(id, { 
      status: 'approved',
      approvedAt: new Date()
    })
  }

  // Filters and sorting
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setStatusFilter = (status: string) => {
    statusFilter.value = status
  }

  const setMonthFilter = (month: string) => {
    monthFilter.value = month
  }

  const setSorting = (field: 'employeeName' | 'month' | 'baseSalary' | 'status', order: 'asc' | 'desc') => {
    sortBy.value = field
    sortOrder.value = order
  }

  const clearFilters = () => {
    searchQuery.value = ''
    statusFilter.value = 'all'
    monthFilter.value = ''
    sortBy.value = 'month'
    sortOrder.value = 'desc'
  }

  const clearError = () => {
    error.value = null
  }

  // Stats for dashboard
  const getPayrollStats = computed(() => ({
    total: totalPayroll.value,
    monthly: monthlyPayroll.value,
    pending: pendingPayroll.value,
    processed: processedPayroll.value,
    totalRecords: payrollRecords.value.length
  }))

  return {
    // State
    payrollRecords,
    loading,
    error,
    searchQuery,
    statusFilter,
    monthFilter,
    sortBy,
    sortOrder,

    // Computed
    filteredPayrollRecords,
    totalPayroll,
    monthlyPayroll,
    pendingPayroll,
    processedPayroll,
    getPayrollStats,

    // Actions
    fetchPayrollRecords,
    addPayrollRecord,
    updatePayrollRecord,
    deletePayrollRecord,
    getPayrollRecordById,
    searchPayrollRecords,
    getPayrollByEmployee,
    getPayrollByMonth,
    processPayroll,
    approvePayroll,
    setSearchQuery,
    setStatusFilter,
    setMonthFilter,
    setSorting,
    clearFilters,
    clearError
  }
})