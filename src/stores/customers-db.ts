import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { customerService } from '@/services/database'
import type { Customer } from '@/services/database'

export const useCustomersDbStore = defineStore('customers-db', () => {
  // State
  const customers = ref<Customer[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const statusFilter = ref<string>('all')
  const sortBy = ref<'name' | 'contractDate' | 'status'>('name')
  const sortOrder = ref<'asc' | 'desc'>('asc')

  // Computed
  const filteredCustomers = computed(() => {
    let filtered = customers.value

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.contactPerson.toLowerCase().includes(query)
      )
    }

    // Filter by status
    if (statusFilter.value !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter.value)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortBy.value) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'contractDate':
          aValue = new Date(a.createdAt || 0)
          bValue = new Date(b.createdAt || 0)
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

  const activeCustomers = computed(() => 
    customers.value.filter(customer => customer.status === 'active')
  )

  const totalCustomers = computed(() => customers.value.length)
  const totalActiveContracts = computed(() => activeCustomers.value.length)

  // Actions
  const fetchCustomers = async () => {
    loading.value = true
    error.value = null
    
    try {
      const unsubscribe = customerService.onSnapshot((snapshot: Customer[]) => {
        customers.value = snapshot
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

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true
    error.value = null

    try {
      const newCustomer: Omit<Customer, 'id'> = {
        ...customerData,
        companyId: 'default-company', // This should come from auth store
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const id = await customerService.create(newCustomer)
      console.log('Customer created with ID:', id)
      return id
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    loading.value = true
    error.value = null

    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      }
      await customerService.update(id, updateData)
      console.log('Customer updated:', id)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCustomer = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      await customerService.delete(id)
      console.log('Customer deleted:', id)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const getCustomerById = async (id: string): Promise<Customer | null> => {
    try {
      return await customerService.getById(id)
    } catch (err: any) {
      error.value = err.message
      return null
    }
  }

  const searchCustomers = async (query: string) => {
    loading.value = true
    error.value = null

    try {
      const results = await customerService.search(query, ['name', 'email', 'phone', 'contactPerson'])
      return results
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Filters and sorting
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setStatusFilter = (status: string) => {
    statusFilter.value = status
  }

  const setSorting = (field: 'name' | 'contractDate' | 'status', order: 'asc' | 'desc') => {
    sortBy.value = field
    sortOrder.value = order
  }

  const clearFilters = () => {
    searchQuery.value = ''
    statusFilter.value = 'all'
    sortBy.value = 'name'
    sortOrder.value = 'asc'
  }

  const clearError = () => {
    error.value = null
  }

  // Stats for dashboard
  const getCustomerStats = computed(() => ({
    total: totalCustomers.value,
    active: totalActiveContracts.value,
    inactive: customers.value.filter(c => c.status === 'inactive').length
  }))

  return {
    // State
    customers,
    loading,
    error,
    searchQuery,
    statusFilter,
    sortBy,
    sortOrder,

    // Computed
    filteredCustomers,
    activeCustomers,
    totalCustomers,
    totalActiveContracts,
    getCustomerStats,

    // Actions
    fetchCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    searchCustomers,
    setSearchQuery,
    setStatusFilter,
    setSorting,
    clearFilters,
    clearError
  }
})