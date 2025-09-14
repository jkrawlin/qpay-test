import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Employee {
  id: string
  name: string
  employeeId: string
  department: string
  position: string
  email: string
  phone: string
  qatarId: string
  passport: string
  visa: string
  startDate: Date
  salary: number
  status: 'active' | 'inactive' | 'terminated'
}

export const useEmployeeStore = defineStore('employees', () => {
  const employees = ref<Employee[]>([])
  const loading = ref(false)

  const fetchEmployees = async (): Promise<Employee[]> => {
    loading.value = true
    try {
      // Mock data - replace with actual API call
      const mockEmployees: Employee[] = [
        {
          id: 'EMP001',
          name: 'Ahmed Hassan Ali',
          employeeId: 'NP001',
          department: 'Construction',
          position: 'Site Engineer',
          email: 'ahmed@company.com',
          phone: '+974 5555 1111',
          qatarId: '12345678901',
          passport: 'P123456789',
          visa: 'V987654321',
          startDate: new Date('2023-01-15'),
          salary: 8500,
          status: 'active'
        },
        {
          id: 'EMP002',
          name: 'Sarah Ahmed Mohamed',
          employeeId: 'NP002',
          department: 'Administration',
          position: 'HR Coordinator',
          email: 'sarah@company.com',
          phone: '+974 5555 2222',
          qatarId: '10987654321',
          passport: 'P987654321',
          visa: 'V123456789',
          startDate: new Date('2023-03-01'),
          salary: 6500,
          status: 'active'
        },
        {
          id: 'EMP003',
          name: 'Rajesh Kumar Singh',
          employeeId: 'NP003',
          department: 'Construction',
          position: 'Construction Worker',
          email: 'rajesh@company.com',
          phone: '+974 5555 3333',
          qatarId: '11122334455',
          passport: 'P555666777',
          visa: 'V444555666',
          startDate: new Date('2023-06-15'),
          salary: 2200,
          status: 'active'
        }
      ]
      
      employees.value = mockEmployees
      return mockEmployees
    } catch (error) {
      console.error('Failed to fetch employees:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const getEmployee = (id: string): Employee | undefined => {
    return employees.value.find(emp => emp.id === id)
  }

  const getEmployeesByDepartment = (department: string): Employee[] => {
    return employees.value.filter(emp => emp.department === department)
  }

  const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<string> => {
    const newEmployee: Employee = {
      ...employee,
      id: `EMP${Date.now()}`
    }
    employees.value.push(newEmployee)
    return newEmployee.id
  }

  const updateEmployee = async (id: string, updates: Partial<Employee>): Promise<void> => {
    const index = employees.value.findIndex(emp => emp.id === id)
    if (index !== -1) {
      employees.value[index] = { ...employees.value[index], ...updates }
    }
  }

  const deleteEmployee = async (id: string): Promise<void> => {
    const index = employees.value.findIndex(emp => emp.id === id)
    if (index !== -1) {
      employees.value.splice(index, 1)
    }
  }

  return {
    employees,
    loading,
    fetchEmployees,
    getEmployee,
    getEmployeesByDepartment,
    addEmployee,
    updateEmployee,
    deleteEmployee
  }
})