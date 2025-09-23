import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { employeeService, type Employee } from '@/services/database'
// Firestore removed: using in-memory db; where replaced by local filtering
type Unsubscribe = () => void
const where = (..._args: any[]) => []

export const useEmployeeStore = defineStore('employees', () => {
  // State
  const employees = ref<Employee[]>([])
  const temporaryEmployees = ref<Employee[]>([])
  const permanentEmployees = ref<Employee[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Real-time listeners
  let allEmployeesUnsubscribe: Unsubscribe | null = null
  let temporaryEmployeesUnsubscribe: Unsubscribe | null = null
  let permanentEmployeesUnsubscribe: Unsubscribe | null = null

  // Computed
  const totalEmployees = computed(() => employees.value.length)
  const activeEmployees = computed(() => 
    employees.value.filter(emp => emp.status === 'active')
  )
  const inactiveEmployees = computed(() => 
    employees.value.filter(emp => emp.status === 'inactive')
  )
  const temporaryEmployeesCount = computed(() => temporaryEmployees.value.length)
  const permanentEmployeesCount = computed(() => permanentEmployees.value.length)

  // Actions
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  // Fetch all employees
  const fetchEmployees = async (_companyId?: string) => {
    try {
      setLoading(true)
      clearError()
      
      const fetchedEmployees = await employeeService.getAll()
      employees.value = fetchedEmployees
      
      // Split into temporary and permanent
      temporaryEmployees.value = fetchedEmployees.filter(emp => emp.type === 'temporary')
      permanentEmployees.value = fetchedEmployees.filter(emp => emp.type === 'permanent')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employees'
      setError(errorMessage)
      console.error('Error fetching employees:', err)
    } finally {
      setLoading(false)
    }
  }

  // Set up real-time listeners
  const setupRealTimeListeners = () => {
    allEmployeesUnsubscribe = employeeService.onSnapshot((docs) => {
      employees.value = docs
      temporaryEmployees.value = docs.filter(emp => emp.type === 'temporary')
      permanentEmployees.value = docs.filter(emp => emp.type === 'permanent')
    })
  }

  // Clean up listeners
  const cleanupListeners = () => {
    if (allEmployeesUnsubscribe) {
      allEmployeesUnsubscribe()
      allEmployeesUnsubscribe = null
    }
    if (temporaryEmployeesUnsubscribe) {
      temporaryEmployeesUnsubscribe()
      temporaryEmployeesUnsubscribe = null
    }
    if (permanentEmployeesUnsubscribe) {
      permanentEmployeesUnsubscribe()
      permanentEmployeesUnsubscribe = null
    }
  }

  // Create new employee
  const createEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true)
      clearError()
      
      const id = await employeeService.create(employeeData)
      
      // Optimistically add to local state (will be updated by real-time listener)
      const newEmployee: Employee = { ...employeeData, id, createdAt: new Date(), updatedAt: new Date() }
      
      employees.value.unshift(newEmployee)
      
      if (newEmployee.type === 'temporary') {
        temporaryEmployees.value.unshift(newEmployee)
      } else if (newEmployee.type === 'permanent') {
        permanentEmployees.value.unshift(newEmployee)
      }
      
      return id
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create employee'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update employee
  const updateEmployee = async (id: string, updates: Partial<Employee>) => {
    try {
      setLoading(true)
      clearError()
      
      await employeeService.update(id, updates)
      
      // Optimistically update local state
      const index = employees.value.findIndex(emp => emp.id === id)
      if (index !== -1) {
        employees.value[index] = { ...employees.value[index], ...updates }
        
        // Update in type-specific arrays
        const tempIndex = temporaryEmployees.value.findIndex(emp => emp.id === id)
        if (tempIndex !== -1) {
          temporaryEmployees.value[tempIndex] = { ...temporaryEmployees.value[tempIndex], ...updates }
        }
        
        const permIndex = permanentEmployees.value.findIndex(emp => emp.id === id)
        if (permIndex !== -1) {
          permanentEmployees.value[permIndex] = { ...permanentEmployees.value[permIndex], ...updates }
        }
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update employee'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete employee
  const deleteEmployee = async (id: string) => {
    try {
      setLoading(true)
      clearError()
      
      await employeeService.delete(id)
      
      // Optimistically remove from local state
      employees.value = employees.value.filter(emp => emp.id !== id)
      temporaryEmployees.value = temporaryEmployees.value.filter(emp => emp.id !== id)
      permanentEmployees.value = permanentEmployees.value.filter(emp => emp.id !== id)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete employee'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get employee by ID
  const getEmployeeById = async (id: string): Promise<Employee | null> => {
    try {
      // First check local state
      const localEmployee = employees.value.find(emp => emp.id === id)
      if (localEmployee) {
        return localEmployee
      }
      
      // If not found locally, fetch from database
      return await employeeService.getById(id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get employee'
      setError(errorMessage)
      return null
    }
  }

  // Search employees
  const searchEmployees = async (searchTerm: string, type?: 'temporary' | 'permanent'): Promise<Employee[]> => {
    try {
      if (!searchTerm.trim()) {
        return type ? 
          (type === 'temporary' ? temporaryEmployees.value : permanentEmployees.value) :
          employees.value
      }
      
      // Simple local search first
      const localResults = employees.value.filter(emp => {
        const matchesSearch = 
          emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesType = type ? emp.type === type : true
        
        return matchesSearch && matchesType
      })
      
      if (localResults.length > 0) {
        return localResults
      }
      
      // In-memory already searched; return [] when no local results
      return []
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search employees'
      setError(errorMessage)
      return []
    }
  }

  // Get employees by type with pagination
  const getEmployeesByType = async (type: 'temporary' | 'permanent', pageSize: number = 20) => {
    try {
      setLoading(true)
      clearError()
      const all = employees.value.filter(e => e.type === type)
      const page = all.slice(0, pageSize)
      return { docs: page, lastDoc: page.length ? { id: page[page.length - 1].id } as any : null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch employees by type'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get employees with expiring documents
  const getEmployeesWithExpiringDocuments = async (daysUntilExpiry: number = 30): Promise<Employee[]> => {
    try {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry)
      
      return employees.value.filter(emp => {
        const qatarIdExpiry = emp.visa?.expiryDate ? new Date(emp.visa.expiryDate) : null
        const workPermitExpiry = emp.workPermit?.expiryDate ? new Date(emp.workPermit.expiryDate) : null
        
        return (qatarIdExpiry && qatarIdExpiry <= expiryDate) ||
               (workPermitExpiry && workPermitExpiry <= expiryDate)
      })
    } catch (err) {
      setError('Failed to get employees with expiring documents')
      return []
    }
  }
  const initialize = async (companyId?: string) => {
    const auth = useAuthStore()
    // Wait if auth not yet initialized
    if (!auth.initialized) {
      try {
        await auth.initializeAuth()
      } catch (e) {
        console.warn('Auth init inside employee store failed', e)
      }
    }
    const effectiveCompanyId = companyId || auth.user?.companyId || 'dev-company'
    try {
  await fetchEmployees(effectiveCompanyId)
  setupRealTimeListeners()
    } catch (err: any) {
      // If permission denied first time, attempt one delayed retry (in case seeding just occurred)
      console.error('Employees initialize failed:', err)
    }
  }

  // Reset store
  const reset = () => {
    cleanupListeners()
    employees.value = []
    temporaryEmployees.value = []
    permanentEmployees.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    employees,
    temporaryEmployees,
    permanentEmployees,
    loading,
    error,
    
    // Computed
    totalEmployees,
    activeEmployees,
    inactiveEmployees,
    temporaryEmployeesCount,
    permanentEmployeesCount,
    
    // Actions
    initialize,
    reset,
    fetchEmployees,
    setupRealTimeListeners,
    cleanupListeners,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    searchEmployees,
    getEmployeesByType,
    getEmployeesWithExpiringDocuments,
    setLoading,
    setError,
    clearError
  }
})