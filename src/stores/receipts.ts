import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Receipt {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  date: Date
  dueDate: Date
  items: ReceiptItem[]
  subtotal: number
  vat: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'cancelled'
  notes: string
}

interface ReceiptItem {
  id: number
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export const useReceiptStore = defineStore('receipts', () => {
  const receipts = ref<Receipt[]>([])
  const loading = ref(false)

  const fetchReceipts = async (): Promise<Receipt[]> => {
    loading.value = true
    try {
      // Mock data - replace with actual API call
      const mockReceipts: Receipt[] = [
        {
          id: '1',
          invoiceNumber: 'INV-202412-0001',
          customerId: '1',
          customerName: 'Qatar National Industries',
          date: new Date('2024-12-15'),
          dueDate: new Date('2025-01-14'),
          items: [
            {
              id: 1,
              description: 'Monthly Payroll Services',
              quantity: 1,
              unitPrice: 5000,
              amount: 5000
            }
          ],
          subtotal: 5000,
          vat: 250,
          total: 5250,
          status: 'sent',
          notes: 'Regular monthly service'
        }
      ]
      
      receipts.value = mockReceipts
      return mockReceipts
    } catch (error) {
      console.error('Failed to fetch receipts:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const saveReceipt = async (receipt: Omit<Receipt, 'id'>): Promise<string> => {
    loading.value = true
    try {
      const newReceipt: Receipt = {
        ...receipt,
        id: Date.now().toString()
      }
      receipts.value.push(newReceipt)
      
      // Here you would save to backend
      console.log('Saving receipt:', newReceipt)
      
      return newReceipt.id
    } catch (error) {
      console.error('Failed to save receipt:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateReceipt = async (id: string, updates: Partial<Receipt>): Promise<void> => {
    const index = receipts.value.findIndex(receipt => receipt.id === id)
    if (index !== -1) {
      receipts.value[index] = { ...receipts.value[index], ...updates }
    }
  }

  const deleteReceipt = async (id: string): Promise<void> => {
    const index = receipts.value.findIndex(receipt => receipt.id === id)
    if (index !== -1) {
      receipts.value.splice(index, 1)
    }
  }

  const emailReceipt = async (receipt: Receipt): Promise<void> => {
    try {
      // Implementation for emailing receipt
      console.log('Emailing receipt:', receipt.invoiceNumber)
      
      // Update status
      await updateReceipt(receipt.id, { status: 'sent' })
    } catch (error) {
      console.error('Failed to email receipt:', error)
      throw error
    }
  }

  const getReceiptsByCustomer = (customerId: string): Receipt[] => {
    return receipts.value.filter(receipt => receipt.customerId === customerId)
  }

  const getReceiptsByStatus = (status: Receipt['status']): Receipt[] => {
    return receipts.value.filter(receipt => receipt.status === status)
  }

  return {
    receipts,
    loading,
    fetchReceipts,
    saveReceipt,
    updateReceipt,
    deleteReceipt,
    emailReceipt,
    getReceiptsByCustomer,
    getReceiptsByStatus
  }
})