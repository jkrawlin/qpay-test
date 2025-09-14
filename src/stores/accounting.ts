import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface AccountingEntry {
  id: string
  date: Date
  reference: string
  type: 'Income' | 'Expense'
  category: string
  description: string
  customer: string
  amount: number
  vat: number
  total: number
  paymentMethod: string
  status: 'Paid' | 'Pending' | 'Overdue'
  notes: string
}

export const useAccountingStore = defineStore('accounting', () => {
  const entries = ref<AccountingEntry[]>([])
  const loading = ref(false)

  const totalIncome = computed(() => {
    return entries.value
      .filter(entry => entry.type === 'Income' && entry.status === 'Paid')
      .reduce((sum, entry) => sum + entry.total, 0)
  })

  const totalExpenses = computed(() => {
    return entries.value
      .filter(entry => entry.type === 'Expense' && entry.status === 'Paid')
      .reduce((sum, entry) => sum + entry.total, 0)
  })

  const netBalance = computed(() => totalIncome.value - totalExpenses.value)

  const pendingAmount = computed(() => {
    return entries.value
      .filter(entry => entry.status === 'Pending')
      .reduce((sum, entry) => sum + entry.total, 0)
  })

  const fetchAccountingData = async (): Promise<AccountingEntry[]> => {
    loading.value = true
    try {
      // Mock data - replace with actual API call
      const mockData: AccountingEntry[] = [
        {
          id: '1',
          date: new Date('2024-12-15'),
          reference: 'REF-001',
          type: 'Income',
          category: 'Service Revenue',
          description: 'Monthly service contract - Qatar National Industries',
          customer: 'Qatar National Industries',
          amount: 25000,
          vat: 1250,
          total: 26250,
          paymentMethod: 'Bank Transfer',
          status: 'Paid',
          notes: 'Regular monthly payment'
        },
        {
          id: '2',
          date: new Date('2024-12-14'),
          reference: 'REF-002',
          type: 'Expense',
          category: 'Salaries & Wages',
          description: 'Staff salaries for December 2024',
          customer: 'Internal',
          amount: 45000,
          vat: 0,
          total: 45000,
          paymentMethod: 'Bank Transfer',
          status: 'Paid',
          notes: 'Monthly payroll'
        }
      ]
      
      entries.value = mockData
      return mockData
    } catch (error) {
      console.error('Failed to fetch accounting data:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const saveAccountingData = async (data: any[]): Promise<void> => {
    loading.value = true
    try {
      // Convert array data to AccountingEntry format and save
      console.log('Saving accounting data:', data)
      // Implementation would save to backend
    } catch (error) {
      console.error('Failed to save accounting data:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const addEntry = async (entry: Omit<AccountingEntry, 'id'>): Promise<string> => {
    const newEntry: AccountingEntry = {
      ...entry,
      id: Date.now().toString()
    }
    entries.value.push(newEntry)
    return newEntry.id
  }

  const updateEntry = async (id: string, updates: Partial<AccountingEntry>): Promise<void> => {
    const index = entries.value.findIndex(entry => entry.id === id)
    if (index !== -1) {
      entries.value[index] = { ...entries.value[index], ...updates }
    }
  }

  const deleteEntry = async (id: string): Promise<void> => {
    const index = entries.value.findIndex(entry => entry.id === id)
    if (index !== -1) {
      entries.value.splice(index, 1)
    }
  }

  return {
    entries,
    loading,
    totalIncome,
    totalExpenses,
    netBalance,
    pendingAmount,
    fetchAccountingData,
    saveAccountingData,
    addEntry,
    updateEntry,
    deleteEntry
  }
})