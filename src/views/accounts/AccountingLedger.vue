<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold">Accounting Ledger</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Track income and expenses with Qatar VAT compliance
            </p>
          </div>
          <v-btn
            color="primary"
            size="large"
            @click="openAddDialog"
          >
            <v-icon start>mdi-plus</v-icon>
            Add Entry
          </v-btn>
        </div>

        <!-- Summary Cards -->
        <v-row class="mb-6">
          <v-col cols="12" md="3">
            <v-card>
              <v-card-text>
                <div class="text-h6 text-success">Total Income</div>
                <div class="text-h5 font-weight-bold">QAR {{ totalIncome.toLocaleString() }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card>
              <v-card-text>
                <div class="text-h6 text-error">Total Expenses</div>
                <div class="text-h5 font-weight-bold">QAR {{ totalExpenses.toLocaleString() }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card>
              <v-card-text>
                <div class="text-h6">Net Profit</div>
                <div class="text-h5 font-weight-bold" :class="netProfit >= 0 ? 'text-success' : 'text-error'">
                  QAR {{ netProfit.toLocaleString() }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card>
              <v-card-text>
                <div class="text-h6">Total Entries</div>
                <div class="text-h5 font-weight-bold">{{ filteredData.length }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Filters and Search -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedFilter"
              :items="filterOptions"
              label="Filter Entries"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              label="Search entries..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-btn
              color="success"
              variant="outlined"
              @click="exportExcel"
              class="mr-2"
            >
              <v-icon start>mdi-file-excel</v-icon>
              Export Excel
            </v-btn>
          </v-col>
        </v-row>

        <!-- Data Table -->
        <v-card>
          <v-data-table
            :headers="tableHeaders"
            :items="filteredData"
            :search="search"
            :loading="loading"
            class="elevation-1"
            item-value="id"
          >
            <template #item.type="{ item }">
              <v-chip
                :color="item.type === 'income' ? 'success' : 'error'"
                variant="flat"
                size="small"
              >
                {{ item.type }}
              </v-chip>
            </template>

            <template #item.amount="{ item }">
              QAR {{ item.amount.toLocaleString() }}
            </template>

            <template #item.vat="{ item }">
              QAR {{ item.vat.toLocaleString() }}
            </template>

            <template #item.total="{ item }">
              <strong>QAR {{ item.total.toLocaleString() }}</strong>
            </template>

            <template #item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                variant="flat"
                size="small"
              >
                {{ item.status }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="editItem(item)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="confirmDelete(item)"
              />
            </template>
          </v-data-table>
        </v-card>

        <!-- Add/Edit Entry Dialog -->
        <v-dialog v-model="entryDialog" max-width="800px">
          <v-card>
            <v-card-title>
              {{ selectedEntry ? 'Edit Entry' : 'Add New Entry' }}
            </v-card-title>
            <v-card-text>
              <v-form>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="newEntry.date"
                      label="Date"
                      type="date"
                      variant="outlined"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="newEntry.reference"
                      label="Reference Number"
                      variant="outlined"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="newEntry.type"
                      :items="typeOptions"
                      label="Type"
                      variant="outlined"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="newEntry.category"
                      :items="categoryOptions"
                      label="Category"
                      variant="outlined"
                      required
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="newEntry.description"
                      label="Description"
                      variant="outlined"
                      rows="2"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="newEntry.customer"
                      label="Customer/Vendor"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="newEntry.amount"
                      label="Amount (QAR)"
                      type="number"
                      variant="outlined"
                      required
                      @input="calculateTotals"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="newEntry.vat"
                      label="VAT (5%)"
                      type="number"
                      variant="outlined"
                      readonly
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="newEntry.total"
                      label="Total Amount"
                      type="number"
                      variant="outlined"
                      readonly
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="newEntry.paymentMethod"
                      :items="paymentMethods"
                      label="Payment Method"
                      variant="outlined"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="newEntry.status"
                      :items="[
                        { text: 'Pending', value: 'pending' },
                        { text: 'Paid', value: 'paid' },
                        { text: 'Overdue', value: 'overdue' }
                      ]"
                      label="Status"
                      variant="outlined"
                    />
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn text @click="entryDialog = false">Cancel</v-btn>
              <v-btn color="primary" @click="saveEntry" :loading="saving">
                {{ selectedEntry ? 'Update' : 'Save' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Delete Confirmation Dialog -->
        <v-dialog v-model="deleteDialog" max-width="400px">
          <v-card>
            <v-card-title>Confirm Delete</v-card-title>
            <v-card-text>
              Are you sure you want to delete this entry? This action cannot be undone.
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn text @click="deleteDialog = false">Cancel</v-btn>
              <v-btn color="error" @click="deleteItem">Delete</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAccountingStore } from '@/stores/accounting'
import { useNotification } from '@/composables/useNotification'
import * as XLSX from 'xlsx'

// const accountingStore = useAccountingStore() // For future integration
const { showSuccess, showError } = useNotification()

// Reactive state
const saving = ref(false)
const selectedFilter = ref('all')
const data = ref<any[]>([])
const loading = ref(false)

// Table headers for v-data-table
const tableHeaders = [
  { title: 'Date', key: 'date', sortable: true },
  { title: 'Reference #', key: 'reference', sortable: true },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Category', key: 'category', sortable: true },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Customer/Vendor', key: 'customer', sortable: true },
  { title: 'Amount (QAR)', key: 'amount', sortable: true },
  { title: 'VAT (5%)', key: 'vat', sortable: true },
  { title: 'Total', key: 'total', sortable: true },
  { title: 'Payment Method', key: 'paymentMethod', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

const search = ref('')
const newEntry = ref({
  date: new Date().toISOString().substr(0, 10),
  reference: '',
  type: 'income',
  category: '',
  description: '',
  customer: '',
  amount: 0,
  vat: 0,
  total: 0,
  paymentMethod: 'bank',
  status: 'pending'
})

const entryDialog = ref(false)
const deleteDialog = ref(false)
const selectedEntry = ref<any>(null)

// Filter options
const filterOptions = [
  { text: 'All Entries', value: 'all' },
  { text: 'Income Only', value: 'income' },
  { text: 'Expenses Only', value: 'expense' },
  { text: 'Pending', value: 'pending' },
  { text: 'Paid', value: 'paid' },
  { text: 'This Month', value: 'this_month' }
]

const typeOptions = [
  { text: 'Income', value: 'income' },
  { text: 'Expense', value: 'expense' }
]

const categoryOptions = [
  'Salary & Benefits',
  'Office Rent',
  'Utilities',
  'Equipment',
  'Travel & Transport',
  'Marketing',
  'Professional Services',
  'Insurance',
  'Taxes',
  'Other'
]

const paymentMethods = [
  { text: 'Bank Transfer', value: 'bank' },
  { text: 'Cash', value: 'cash' },
  { text: 'Credit Card', value: 'credit' },
  { text: 'Cheque', value: 'cheque' }
]

// Computed properties
const filteredData = computed(() => {
  if (!data.value) return []
  
  let filtered = [...data.value]
  
  if (selectedFilter.value === 'income') {
    filtered = filtered.filter(item => item.type === 'income')
  } else if (selectedFilter.value === 'expense') {
    filtered = filtered.filter(item => item.type === 'expense')
  } else if (selectedFilter.value === 'pending') {
    filtered = filtered.filter(item => item.status === 'pending')
  } else if (selectedFilter.value === 'paid') {
    filtered = filtered.filter(item => item.status === 'paid')
  } else if (selectedFilter.value === 'this_month') {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear
    })
  }
  
  return filtered
})

const totalIncome = computed(() => {
  return filteredData.value
    .filter(item => item.type === 'income')
    .reduce((sum, item) => sum + item.total, 0)
})

const totalExpenses = computed(() => {
  return filteredData.value
    .filter(item => item.type === 'expense')
    .reduce((sum, item) => sum + item.total, 0)
})

const netProfit = computed(() => totalIncome.value - totalExpenses.value)

// Methods
const loadData = async () => {
  loading.value = true
  try {
    // Mock data for demonstration
    data.value = [
      {
        id: 1,
        date: '2024-01-15',
        reference: 'INV-001',
        type: 'income',
        category: 'Professional Services',
        description: 'Payroll processing service',
        customer: 'ABC Company',
        amount: 5000,
        vat: 250,
        total: 5250,
        paymentMethod: 'bank',
        status: 'paid'
      },
      {
        id: 2,
        date: '2024-01-10',
        reference: 'EXP-001',
        type: 'expense',
        category: 'Office Rent',
        description: 'Monthly office rent',
        customer: 'Property Management Co.',
        amount: 3000,
        vat: 150,
        total: 3150,
        paymentMethod: 'bank',
        status: 'paid'
      }
    ]
  } catch (error) {
    showError('Failed to load accounting data')
  } finally {
    loading.value = false
  }
}

const calculateTotals = () => {
  const amount = newEntry.value.amount || 0
  newEntry.value.vat = Math.round(amount * 0.05 * 100) / 100 // 5% VAT
  newEntry.value.total = amount + newEntry.value.vat
}

const openAddDialog = () => {
  newEntry.value = {
    date: new Date().toISOString().substr(0, 10),
    reference: '',
    type: 'income',
    category: '',
    description: '',
    customer: '',
    amount: 0,
    vat: 0,
    total: 0,
    paymentMethod: 'bank',
    status: 'pending'
  }
  entryDialog.value = true
}

const saveEntry = async () => {
  if (!newEntry.value.reference || !newEntry.value.description) {
    showError('Please fill in all required fields')
    return
  }

  saving.value = true
  try {
    calculateTotals()
    
    if (selectedEntry.value) {
      // Update existing entry
      const index = data.value.findIndex(item => item.id === selectedEntry.value.id)
      if (index > -1) {
        data.value[index] = { ...newEntry.value, id: selectedEntry.value.id }
      }
      showSuccess('Entry updated successfully')
    } else {
      // Add new entry
      const newId = Math.max(...data.value.map(item => item.id), 0) + 1
      data.value.push({ ...newEntry.value, id: newId })
      showSuccess('Entry added successfully')
    }
    
    entryDialog.value = false
    selectedEntry.value = null
  } catch (error) {
    showError('Failed to save entry')
  } finally {
    saving.value = false
  }
}

const editItem = (item: any) => {
  selectedEntry.value = item
  newEntry.value = { ...item }
  entryDialog.value = true
}

const confirmDelete = (item: any) => {
  selectedEntry.value = item
  deleteDialog.value = true
}

const deleteItem = async () => {
  if (!selectedEntry.value) return
  
  try {
    const index = data.value.findIndex(item => item.id === selectedEntry.value.id)
    if (index > -1) {
      data.value.splice(index, 1)
      showSuccess('Entry deleted successfully')
    }
    deleteDialog.value = false
    selectedEntry.value = null
  } catch (error) {
    showError('Failed to delete entry')
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return 'success'
    case 'pending': return 'warning'
    case 'overdue': return 'error'
    default: return 'primary'
  }
}

const exportExcel = () => {
  try {
    const ws = XLSX.utils.json_to_sheet(filteredData.value)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Accounting Ledger')
    XLSX.writeFile(wb, 'accounting-ledger.xlsx')
    showSuccess('Excel file exported successfully')
  } catch (error) {
    showError('Failed to export Excel file')
  }
}

// Initialize data on mount
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.v-data-table {
  background: white;
}
.text-success {
  color: rgb(76, 175, 80) !important;
}
.text-error {
  color: rgb(244, 67, 54) !important;
}
</style>