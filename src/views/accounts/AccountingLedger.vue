<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <v-icon left>mdi-table-large</v-icon>
        Accounting Ledger
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="saveData" :loading="saving">
          <v-icon left>mdi-content-save</v-icon>
          Save Changes
        </v-btn>
        <v-btn color="secondary" @click="exportExcel" class="ml-2">
          <v-icon left>mdi-microsoft-excel</v-icon>
          Export Excel
        </v-btn>
      </v-card-title>

      <v-card-subtitle>
        <v-chip-group v-model="selectedFilter" mandatory>
          <v-chip value="all">All Entries</v-chip>
          <v-chip value="income" color="success">Income</v-chip>
          <v-chip value="expense" color="error">Expenses</v-chip>
          <v-chip value="pending" color="warning">Pending</v-chip>
        </v-chip-group>
      </v-card-subtitle>

      <v-card-text>
        <!-- Summary Cards -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-card color="success" dark flat>
              <v-card-text>
                <div class="text-overline">Total Income</div>
                <div class="text-h5">QAR {{ totalIncome.toLocaleString() }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="error" dark flat>
              <v-card-text>
                <div class="text-overline">Total Expenses</div>
                <div class="text-h5">QAR {{ totalExpenses.toLocaleString() }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="info" dark flat>
              <v-card-text>
                <div class="text-overline">Net Balance</div>
                <div class="text-h5">QAR {{ netBalance.toLocaleString() }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card color="warning" dark flat>
              <v-card-text>
                <div class="text-overline">Pending</div>
                <div class="text-h5">QAR {{ pendingAmount.toLocaleString() }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Handsontable Container -->
        <div ref="hotTableContainer" id="accounting-table"></div>

        <!-- Add New Entry Button -->
        <v-btn
          color="primary"
          fab
          fixed
          bottom
          right
          @click="addNewRow"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { HotTable } from '@handsontable/vue3'
import Handsontable from 'handsontable'
import 'handsontable/dist/handsontable.full.css'
import * as XLSX from 'xlsx'

const hotTableContainer = ref<HTMLElement>()
const hotInstance = ref<Handsontable | null>(null)
const saving = ref(false)
const selectedFilter = ref('all')

const data = ref<any[]>([])

// Chart of Accounts
const chartOfAccounts = {
  income: [
    'Service Revenue',
    'Contract Revenue',
    'Interest Income',
    'Other Income'
  ],
  expense: [
    'Salaries & Wages',
    'Rent Expense',
    'Utilities',
    'Office Supplies',
    'Transportation',
    'Marketing',
    'Insurance',
    'Depreciation',
    'Other Expenses'
  ]
}

const columns = [
  {
    data: 'date',
    type: 'date',
    dateFormat: 'DD/MM/YYYY',
    title: 'Date',
    width: 100
  },
  {
    data: 'reference',
    type: 'text',
    title: 'Reference #',
    width: 100
  },
  {
    data: 'type',
    type: 'dropdown',
    source: ['Income', 'Expense'],
    title: 'Type',
    width: 80
  },
  {
    data: 'category',
    type: 'dropdown',
    source: [...chartOfAccounts.income, ...chartOfAccounts.expense],
    title: 'Category',
    width: 150
  },
  {
    data: 'description',
    type: 'text',
    title: 'Description',
    width: 250
  },
  {
    data: 'customer',
    type: 'text',
    title: 'Customer/Vendor',
    width: 150
  },
  {
    data: 'amount',
    type: 'numeric',
    numericFormat: {
      pattern: '0,0.00',
      culture: 'en-US'
    },
    title: 'Amount (QAR)',
    width: 120
  },
  {
    data: 'vat',
    type: 'numeric',
    numericFormat: {
      pattern: '0,0.00',
      culture: 'en-US'
    },
    title: 'VAT (5%)',
    width: 100,
    renderer: function(instance: any, td: any, row: number, col: number, prop: any, value: any, cellProperties: any) {
      // Auto-calculate VAT
      const amount = instance.getDataAtRowProp(row, 'amount')
      if (amount && !value) {
        value = amount * 0.05
        instance.setDataAtRowProp(row, 'vat', value)
      }
      td.innerHTML = value ? value.toFixed(2) : '0.00'
      return td
    }
  },
  {
    data: 'total',
    type: 'numeric',
    numericFormat: {
      pattern: '0,0.00',
      culture: 'en-US'
    },
    title: 'Total',
    width: 120,
    readOnly: true,
    renderer: function(instance: any, td: any, row: number, col: number, prop: any, value: any, cellProperties: any) {
      // Auto-calculate total
      const amount = instance.getDataAtRowProp(row, 'amount') || 0
      const vat = instance.getDataAtRowProp(row, 'vat') || 0
      const total = amount + vat
      td.innerHTML = total.toFixed(2)
      td.style.fontWeight = 'bold'
      return td
    }
  },
  {
    data: 'paymentMethod',
    type: 'dropdown',
    source: ['Cash', 'Bank Transfer', 'Cheque', 'Credit Card'],
    title: 'Payment Method',
    width: 120
  },
  {
    data: 'status',
    type: 'dropdown',
    source: ['Paid', 'Pending', 'Overdue'],
    title: 'Status',
    width: 80,
    renderer: function(instance: any, td: any, row: number, col: number, prop: any, value: any, cellProperties: any) {
      td.innerHTML = value || 'Pending'
      if (value === 'Paid') {
        td.style.background = '#4CAF50'
        td.style.color = 'white'
      } else if (value === 'Pending') {
        td.style.background = '#FFC107'
        td.style.color = 'black'
      } else if (value === 'Overdue') {
        td.style.background = '#F44336'
        td.style.color = 'white'
      }
      return td
    }
  },
  {
    data: 'notes',
    type: 'text',
    title: 'Notes',
    width: 200
  }
]

// Computed properties
const totalIncome = computed(() => {
  return data.value
    .filter(row => row.type === 'Income' && row.status === 'Paid')
    .reduce((sum, row) => sum + (row.total || row.amount || 0), 0)
})

const totalExpenses = computed(() => {
  return data.value
    .filter(row => row.type === 'Expense' && row.status === 'Paid')
    .reduce((sum, row) => sum + (row.total || row.amount || 0), 0)
})

const netBalance = computed(() => totalIncome.value - totalExpenses.value)

const pendingAmount = computed(() => {
  return data.value
    .filter(row => row.status === 'Pending')
    .reduce((sum, row) => sum + (row.total || row.amount || 0), 0)
})

// Initialize Handsontable
const initializeTable = () => {
  if (!hotTableContainer.value) return

  const settings: Handsontable.GridSettings = {
    data: data.value,
    columns: columns,
    stretchH: 'all',
    autoWrapRow: true,
    height: 600,
    maxRows: 10000,
    manualRowResize: true,
    manualColumnResize: true,
    rowHeaders: true,
    colHeaders: true,
    manualRowMove: true,
    manualColumnMove: true,
    contextMenu: true,
    filters: true,
    dropdownMenu: true,
    multiColumnSorting: true,
    undo: true,
    licenseKey: 'non-commercial-and-evaluation',
    afterChange: function(changes: any, source: string) {
      if (source === 'loadData') return
      
      // Auto-save after changes
      if (changes) {
        saveDataDebounced()
      }
    },
    beforeRemoveRow: function(index: number, amount: number) {
      // Confirm before deleting
      return confirm(`Delete ${amount} row(s)?`)
    }
  }

  hotInstance.value = new Handsontable(hotTableContainer.value, settings)
}

// Load data from store
const loadData = async () => {
  try {
    // Mock data - replace with actual service call
    data.value = [
      {
        date: '15/12/2024',
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
        date: '14/12/2024',
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
      },
      {
        date: '13/12/2024',
        reference: 'REF-003',
        type: 'Income',
        category: 'Contract Revenue',
        description: 'Construction project milestone payment',
        customer: 'Doha Development Co.',
        amount: 75000,
        vat: 3750,
        total: 78750,
        paymentMethod: 'Cheque',
        status: 'Pending',
        notes: 'Awaiting cheque clearance'
      }
    ]
  } catch (error) {
    console.error('Failed to load accounting data:', error)
  }
}

// Save data
const saveData = async () => {
  if (!hotInstance.value) return
  
  saving.value = true
  try {
    const tableData = hotInstance.value.getData()
    // Here you would save to your backend
    console.log('Saving data:', tableData)
    
    // Show success message
    setTimeout(() => {
      saving.value = false
      alert('Data saved successfully!')
    }, 1000)
  } catch (error) {
    console.error('Failed to save data:', error)
    saving.value = false
    alert('Failed to save data')
  }
}

// Debounced save
let saveTimeout: NodeJS.Timeout
const saveDataDebounced = () => {
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    saveData()
  }, 2000)
}

// Add new row
const addNewRow = () => {
  if (!hotInstance.value) return
  
  const newRow = {
    date: new Date().toLocaleDateString('en-GB'),
    reference: `REF-${Date.now()}`,
    type: 'Income',
    category: '',
    description: '',
    customer: '',
    amount: 0,
    vat: 0,
    total: 0,
    paymentMethod: 'Cash',
    status: 'Pending',
    notes: ''
  }
  
  hotInstance.value.alter('insert_row_at', 0, 1)
  hotInstance.value.populateFromArray(0, 0, [Object.values(newRow)])
}

// Export to Excel
const exportExcel = () => {
  if (!hotInstance.value) return
  
  const tableData = hotInstance.value.getData()
  const headers = hotInstance.value.getColHeader()
  
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...tableData])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Accounting Data')
  
  XLSX.writeFile(workbook, `accounting_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// Filter data
watch(selectedFilter, (newFilter) => {
  if (!hotInstance.value) return
  
  const filtersPlugin = hotInstance.value.getPlugin('filters')
  filtersPlugin.clearConditions()
  
  if (newFilter !== 'all') {
    if (newFilter === 'pending') {
      filtersPlugin.addCondition(10, 'eq', ['Pending'])
    } else {
      const type = newFilter === 'income' ? 'Income' : 'Expense'
      filtersPlugin.addCondition(2, 'eq', [type])
    }
  }
  
  filtersPlugin.filter()
})

onMounted(async () => {
  await loadData()
  initializeTable()
})
</script>

<style>
@import 'handsontable/dist/handsontable.full.css';

.handsontable td {
  font-size: 13px;
}

.handsontable th {
  background-color: #f5f5f5;
  font-weight: bold;
}

#accounting-table {
  margin: 20px 0;
}
</style>