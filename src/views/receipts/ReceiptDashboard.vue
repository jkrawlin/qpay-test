<template>
  <v-container fluid>
    <!-- Header Section -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold text-primary">Receipt & Invoice Management</h1>
            <p class="text-subtitle-1 text-medium-emphasis">Generate and manage receipts with Qatar VAT compliance</p>
          </div>
          <div class="d-flex gap-2">
            <v-btn
              color="success"
              size="large"
              prepend-icon="mdi-receipt"
              @click="openReceiptDialog()"
            >
              New Receipt
            </v-btn>
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-file-document"
              @click="openInvoiceDialog()"
            >
              New Invoice
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Quick Stats -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="primary" size="40" class="me-3">mdi-receipt</v-icon>
              <div>
                <div class="text-h4 font-weight-bold">{{ statistics.totalReceipts }}</div>
                <div class="text-caption text-medium-emphasis">Total Receipts</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="success" size="40" class="me-3">mdi-cash</v-icon>
              <div>
                <div class="text-h4 font-weight-bold">{{ formatCurrency(statistics.totalAmount) }}</div>
                <div class="text-caption text-medium-emphasis">Total Amount</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="warning" size="40" class="me-3">mdi-clock-outline</v-icon>
              <div>
                <div class="text-h4 font-weight-bold">{{ statistics.pendingInvoices }}</div>
                <div class="text-caption text-medium-emphasis">Pending Invoices</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="info" size="40" class="me-3">mdi-percent</v-icon>
              <div>
                <div class="text-h4 font-weight-bold">{{ formatCurrency(statistics.totalVAT) }}</div>
                <div class="text-caption text-medium-emphasis">VAT Collected</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters & Search -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-text-field
          v-model="searchQuery"
          label="Search receipts/invoices..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-select
          v-model="selectedType"
          :items="typeOptions"
          label="Type"
          variant="outlined"
          density="compact"
          clearable
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-select
          v-model="selectedStatus"
          :items="statusOptions"
          label="Status"
          variant="outlined"
          density="compact"
          clearable
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-text-field
          v-model="dateFrom"
          label="From Date"
          type="date"
          variant="outlined"
          density="compact"
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-text-field
          v-model="dateTo"
          label="To Date"
          type="date"
          variant="outlined"
          density="compact"
        />
      </v-col>
      <v-col cols="12" md="1">
        <v-btn
          variant="outlined"
          block
          @click="exportData"
          prepend-icon="mdi-download"
        >
          Export
        </v-btn>
      </v-col>
    </v-row>

    <!-- Documents Table -->
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="me-2">mdi-file-document-multiple</v-icon>
        Documents
        <v-spacer />
        <v-chip
          color="primary"
          variant="tonal"
          size="small"
        >
          {{ filteredDocuments.length }} documents
        </v-chip>
      </v-card-title>

      <v-data-table
        :headers="documentHeaders"
        :items="filteredDocuments"
        :loading="loading"
        item-value="id"
        class="elevation-0"
        :items-per-page="25"
      >
        <!-- Document Number -->
        <template #item.documentNumber="{ item }">
          <div class="d-flex align-center">
            <v-icon 
              :color="getDocumentTypeColor(item.type)" 
              size="20" 
              class="me-2"
            >
              {{ getDocumentIcon(item.type) }}
            </v-icon>
            <div>
              <div class="font-weight-medium">{{ item.documentNumber }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.type }}</div>
            </div>
          </div>
        </template>

        <!-- Customer -->
        <template #item.customer="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.customerName }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.customerEmail }}</div>
          </div>
        </template>

        <!-- Amount -->
        <template #item.amount="{ item }">
          <div class="text-right">
            <div class="font-weight-medium">{{ formatCurrency(item.totalAmount) }}</div>
            <div class="text-caption text-medium-emphasis">
              VAT: {{ formatCurrency(item.vatAmount) }}
            </div>
          </div>
        </template>

        <!-- Date -->
        <template #item.date="{ item }">
          <div>
            <div>{{ formatDate(item.issueDate) }}</div>
            <div class="text-caption text-medium-emphasis" v-if="item.dueDate">
              Due: {{ formatDate(item.dueDate) }}
            </div>
          </div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            variant="tonal"
            size="small"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-btn
              icon="mdi-eye"
              variant="text"
              size="small"
              @click="viewDocument(item)"
            />
            <v-btn
              icon="mdi-download"
              variant="text"
              size="small"
              @click="downloadDocument(item)"
            />
            <v-btn
              icon="mdi-email"
              variant="text"
              size="small"
              @click="emailDocument(item)"
            />
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  variant="text"
                  size="small"
                  v-bind="props"
                />
              </template>
              <v-list density="compact">
                <v-list-item @click="duplicateDocument(item)">
                  <v-list-item-title>Duplicate</v-list-item-title>
                </v-list-item>
                <v-list-item 
                  @click="markAsPaid(item)"
                  v-if="item.status === 'sent'"
                >
                  <v-list-item-title>Mark as Paid</v-list-item-title>
                </v-list-item>
                <v-list-item @click="editDocument(item)">
                  <v-list-item-title>Edit</v-list-item-title>
                </v-list-item>
                <v-divider />
                <v-list-item
                  @click="deleteDocument(item)"
                  class="text-error"
                >
                  <v-list-item-title>Delete</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Receipt Dialog -->
    <v-dialog v-model="receiptDialog" max-width="700px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon class="me-2">mdi-receipt</v-icon>
          Generate New Receipt
        </v-card-title>

        <v-card-text>
          <v-form ref="receiptForm" v-model="receiptFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="receiptForm.customerId"
                  :items="customers"
                  item-title="companyName"
                  item-value="id"
                  label="Customer"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="receiptForm.receiptNumber"
                  label="Receipt Number"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="receiptForm.issueDate"
                  label="Issue Date"
                  type="date"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="receiptForm.paymentMethod"
                  :items="paymentMethods"
                  label="Payment Method"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              
              <!-- Line Items -->
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1 pa-3">
                    Line Items
                    <v-spacer />
                    <v-btn
                      icon="mdi-plus"
                      variant="text"
                      size="small"
                      @click="addLineItem"
                    />
                  </v-card-title>
                  <v-card-text>
                    <div v-for="(item, index) in receiptForm.lineItems" :key="index" class="mb-3">
                      <v-row>
                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model="item.description"
                            label="Description"
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>
                        <v-col cols="6" md="2">
                          <v-text-field
                            v-model="item.quantity"
                            label="Qty"
                            type="number"
                            variant="outlined"
                            density="compact"
                            @input="calculateLineTotal(index)"
                          />
                        </v-col>
                        <v-col cols="6" md="2">
                          <v-text-field
                            v-model="item.unitPrice"
                            label="Unit Price"
                            type="number"
                            variant="outlined"
                            density="compact"
                            @input="calculateLineTotal(index)"
                          />
                        </v-col>
                        <v-col cols="6" md="2">
                          <v-text-field
                            v-model="item.vatRate"
                            label="VAT %"
                            type="number"
                            variant="outlined"
                            density="compact"
                            @input="calculateLineTotal(index)"
                          />
                        </v-col>
                        <v-col cols="6" md="2">
                          <v-text-field
                            v-model="item.total"
                            label="Total"
                            readonly
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>
                        <v-col cols="auto">
                          <v-btn
                            icon="mdi-delete"
                            variant="text"
                            size="small"
                            color="error"
                            @click="removeLineItem(index)"
                          />
                        </v-col>
                      </v-row>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Totals -->
              <v-col cols="12" md="6" class="ms-auto">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1 pa-3">Summary</v-card-title>
                  <v-card-text>
                    <div class="d-flex justify-space-between">
                      <span>Subtotal:</span>
                      <span>{{ formatCurrency(receiptTotals.subtotal) }}</span>
                    </div>
                    <div class="d-flex justify-space-between">
                      <span>VAT:</span>
                      <span>{{ formatCurrency(receiptTotals.vat) }}</span>
                    </div>
                    <v-divider class="my-2" />
                    <div class="d-flex justify-space-between font-weight-bold">
                      <span>Total:</span>
                      <span>{{ formatCurrency(receiptTotals.total) }}</span>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="receiptForm.notes"
                  label="Notes"
                  variant="outlined"
                  density="compact"
                  rows="2"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="closeReceiptDialog">Cancel</v-btn>
          <v-btn
            color="success"
            :loading="saving"
            :disabled="!receiptFormValid"
            @click="generateReceipt"
          >
            Generate Receipt
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Invoice Dialog -->
    <v-dialog v-model="invoiceDialog" max-width="700px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon class="me-2">mdi-file-document</v-icon>
          Generate New Invoice
        </v-card-title>

        <v-card-text>
          <v-form ref="invoiceForm" v-model="invoiceFormValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-autocomplete
                  v-model="invoiceForm.customerId"
                  :items="customers"
                  item-title="companyName"
                  item-value="id"
                  label="Customer"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="invoiceForm.invoiceNumber"
                  label="Invoice Number"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="invoiceForm.issueDate"
                  label="Issue Date"
                  type="date"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="invoiceForm.dueDate"
                  label="Due Date"
                  type="date"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              
              <!-- Similar line items structure -->
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1 pa-3">
                    Line Items
                    <v-spacer />
                    <v-btn
                      icon="mdi-plus"
                      variant="text"
                      size="small"
                      @click="addInvoiceLineItem"
                    />
                  </v-card-title>
                  <v-card-text>
                    <div v-for="(item, index) in invoiceForm.lineItems" :key="index" class="mb-3">
                      <v-row>
                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model="item.description"
                            label="Description"
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>
                        <v-col cols="6" md="2">
                          <v-text-field
                            v-model="item.quantity"
                            label="Qty"
                            type="number"
                            variant="outlined"
                            density="compact"
                            @input="calculateInvoiceLineTotal(index)"
                          />
                        </v-col>
                        <v-col cols="6" md="2">
                          <v-text-field
                            v-model="item.unitPrice"
                            label="Unit Price"
                            type="number"
                            variant="outlined"
                            density="compact"
                            @input="calculateInvoiceLineTotal(index)"
                          />
                        </v-col>
                        <v-col cols="6" md="2">
                          <v-text-field
                            v-model="item.vatRate"
                            label="VAT %"
                            type="number"
                            variant="outlined"
                            density="compact"
                            @input="calculateInvoiceLineTotal(index)"
                          />
                        </v-col>
                        <v-col cols="6" md="2">
                          <v-text-field
                            v-model="item.total"
                            label="Total"
                            readonly
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>
                        <v-col cols="auto">
                          <v-btn
                            icon="mdi-delete"
                            variant="text"
                            size="small"
                            color="error"
                            @click="removeInvoiceLineItem(index)"
                          />
                        </v-col>
                      </v-row>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Invoice Totals -->
              <v-col cols="12" md="6" class="ms-auto">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1 pa-3">Summary</v-card-title>
                  <v-card-text>
                    <div class="d-flex justify-space-between">
                      <span>Subtotal:</span>
                      <span>{{ formatCurrency(invoiceTotals.subtotal) }}</span>
                    </div>
                    <div class="d-flex justify-space-between">
                      <span>VAT:</span>
                      <span>{{ formatCurrency(invoiceTotals.vat) }}</span>
                    </div>
                    <v-divider class="my-2" />
                    <div class="d-flex justify-space-between font-weight-bold">
                      <span>Total:</span>
                      <span>{{ formatCurrency(invoiceTotals.total) }}</span>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="invoiceForm.terms"
                  label="Payment Terms & Conditions"
                  variant="outlined"
                  density="compact"
                  rows="3"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="closeInvoiceDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!invoiceFormValid"
            @click="generateInvoice"
          >
            Generate Invoice
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'

// Types
interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  vatRate: number
  total: number
}

interface Document {
  id: string
  type: 'receipt' | 'invoice'
  documentNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  issueDate: Date
  dueDate?: Date
  lineItems: LineItem[]
  subtotal: number
  vatAmount: number
  totalAmount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  paymentMethod?: string
  notes?: string
  terms?: string
  createdAt: Date
}

// Reactive data
const loading = ref(false)
const receiptDialog = ref(false)
const invoiceDialog = ref(false)
const receiptFormValid = ref(false)
const invoiceFormValid = ref(false)
const saving = ref(false)

const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const documents = ref<Document[]>([])
const customers = ref([
  { id: '1', companyName: 'Qatar National Industries' },
  { id: '2', companyName: 'Doha Trading Company' }
])

const statistics = ref({
  totalReceipts: 0,
  totalAmount: 0,
  pendingInvoices: 0,
  totalVAT: 0
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Form data
const receiptForm = ref({
  customerId: '',
  receiptNumber: '',
  issueDate: format(new Date(), 'yyyy-MM-dd'),
  paymentMethod: '',
  lineItems: [{ description: '', quantity: 1, unitPrice: 0, vatRate: 5, total: 0 }],
  notes: ''
})

const invoiceForm = ref({
  customerId: '',
  invoiceNumber: '',
  issueDate: format(new Date(), 'yyyy-MM-dd'),
  dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  lineItems: [{ description: '', quantity: 1, unitPrice: 0, vatRate: 5, total: 0 }],
  terms: 'Payment due within 30 days'
})

// Options
const typeOptions = [
  { value: 'receipt', title: 'Receipt' },
  { value: 'invoice', title: 'Invoice' }
]

const statusOptions = [
  { value: 'draft', title: 'Draft' },
  { value: 'sent', title: 'Sent' },
  { value: 'paid', title: 'Paid' },
  { value: 'overdue', title: 'Overdue' },
  { value: 'cancelled', title: 'Cancelled' }
]

const paymentMethods = [
  'Cash', 'Bank Transfer', 'Credit Card', 'Cheque', 'Online Payment'
]

// Validation rules
const rules = {
  required: (value: any) => !!value || 'This field is required'
}

// Table headers
const documentHeaders = [
  { title: 'Document #', value: 'documentNumber', sortable: true },
  { title: 'Customer', value: 'customer', sortable: true },
  { title: 'Amount', value: 'amount', sortable: true, align: 'end' },
  { title: 'Date', value: 'date', sortable: true },
  { title: 'Status', value: 'status', sortable: true },
  { title: 'Actions', value: 'actions', sortable: false, align: 'center', width: '150px' }
]

// Computed
const filteredDocuments = computed(() => {
  let filtered = documents.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(doc =>
      doc.documentNumber.toLowerCase().includes(query) ||
      doc.customerName.toLowerCase().includes(query)
    )
  }

  if (selectedType.value) {
    filtered = filtered.filter(doc => doc.type === selectedType.value)
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(doc => doc.status === selectedStatus.value)
  }

  if (dateFrom.value) {
    filtered = filtered.filter(doc => doc.issueDate >= new Date(dateFrom.value))
  }

  if (dateTo.value) {
    filtered = filtered.filter(doc => doc.issueDate <= new Date(dateTo.value))
  }

  return filtered
})

const receiptTotals = computed(() => {
  const subtotal = receiptForm.value.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const vat = receiptForm.value.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.vatRate / 100), 0)
  return {
    subtotal,
    vat,
    total: subtotal + vat
  }
})

const invoiceTotals = computed(() => {
  const subtotal = invoiceForm.value.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const vat = invoiceForm.value.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.vatRate / 100), 0)
  return {
    subtotal,
    vat,
    total: subtotal + vat
  }
})

// Methods
const formatDate = (date: Date | string) => {
  if (!date) return 'N/A'
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy')
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: 'QAR'
  }).format(amount)
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'draft': 'grey',
    'sent': 'info',
    'paid': 'success',
    'overdue': 'error',
    'cancelled': 'warning'
  }
  return colors[status] || 'default'
}

const getDocumentTypeColor = (type: string) => {
  return type === 'receipt' ? 'success' : 'primary'
}

const getDocumentIcon = (type: string) => {
  return type === 'receipt' ? 'mdi-receipt' : 'mdi-file-document'
}

// Dialog methods
const openReceiptDialog = () => {
  receiptDialog.value = true
  generateReceiptNumber()
}

const closeReceiptDialog = () => {
  receiptDialog.value = false
  resetReceiptForm()
}

const openInvoiceDialog = () => {
  invoiceDialog.value = true
  generateInvoiceNumber()
}

const closeInvoiceDialog = () => {
  invoiceDialog.value = false
  resetInvoiceForm()
}

const resetReceiptForm = () => {
  receiptForm.value = {
    customerId: '',
    receiptNumber: '',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: '',
    lineItems: [{ description: '', quantity: 1, unitPrice: 0, vatRate: 5, total: 0 }],
    notes: ''
  }
}

const resetInvoiceForm = () => {
  invoiceForm.value = {
    customerId: '',
    invoiceNumber: '',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    lineItems: [{ description: '', quantity: 1, unitPrice: 0, vatRate: 5, total: 0 }],
    terms: 'Payment due within 30 days'
  }
}

// Line item methods
const addLineItem = () => {
  receiptForm.value.lineItems.push({
    description: '',
    quantity: 1,
    unitPrice: 0,
    vatRate: 5,
    total: 0
  })
}

const removeLineItem = (index: number) => {
  receiptForm.value.lineItems.splice(index, 1)
}

const calculateLineTotal = (index: number) => {
  const item = receiptForm.value.lineItems[index]
  const subtotal = item.quantity * item.unitPrice
  const vat = subtotal * (item.vatRate / 100)
  item.total = subtotal + vat
}

const addInvoiceLineItem = () => {
  invoiceForm.value.lineItems.push({
    description: '',
    quantity: 1,
    unitPrice: 0,
    vatRate: 5,
    total: 0
  })
}

const removeInvoiceLineItem = (index: number) => {
  invoiceForm.value.lineItems.splice(index, 1)
}

const calculateInvoiceLineTotal = (index: number) => {
  const item = invoiceForm.value.lineItems[index]
  const subtotal = item.quantity * item.unitPrice
  const vat = subtotal * (item.vatRate / 100)
  item.total = subtotal + vat
}

// Generation methods
const generateReceiptNumber = () => {
  const prefix = 'RCP'
  const year = new Date().getFullYear()
  const sequence = String(documents.value.filter(d => d.type === 'receipt').length + 1).padStart(4, '0')
  receiptForm.value.receiptNumber = `${prefix}-${year}-${sequence}`
}

const generateInvoiceNumber = () => {
  const prefix = 'INV'
  const year = new Date().getFullYear()
  const sequence = String(documents.value.filter(d => d.type === 'invoice').length + 1).padStart(4, '0')
  invoiceForm.value.invoiceNumber = `${prefix}-${year}-${sequence}`
}

const generateReceipt = async () => {
  if (!receiptFormValid.value) return

  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const receipt: Document = {
      id: `RCP-${Date.now()}`,
      type: 'receipt',
      documentNumber: receiptForm.value.receiptNumber,
      customerId: receiptForm.value.customerId,
      customerName: customers.value.find(c => c.id === receiptForm.value.customerId)?.companyName || '',
      customerEmail: 'customer@example.com',
      issueDate: new Date(receiptForm.value.issueDate),
      lineItems: receiptForm.value.lineItems,
      subtotal: receiptTotals.value.subtotal,
      vatAmount: receiptTotals.value.vat,
      totalAmount: receiptTotals.value.total,
      status: 'paid',
      paymentMethod: receiptForm.value.paymentMethod,
      notes: receiptForm.value.notes,
      createdAt: new Date()
    }

    documents.value.push(receipt)
    updateStatistics()
    showSnackbar('Receipt generated successfully', 'success')
    closeReceiptDialog()
  } catch (error) {
    showSnackbar('Error generating receipt', 'error')
  } finally {
    saving.value = false
  }
}

const generateInvoice = async () => {
  if (!invoiceFormValid.value) return

  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const invoice: Document = {
      id: `INV-${Date.now()}`,
      type: 'invoice',
      documentNumber: invoiceForm.value.invoiceNumber,
      customerId: invoiceForm.value.customerId,
      customerName: customers.value.find(c => c.id === invoiceForm.value.customerId)?.companyName || '',
      customerEmail: 'customer@example.com',
      issueDate: new Date(invoiceForm.value.issueDate),
      dueDate: new Date(invoiceForm.value.dueDate),
      lineItems: invoiceForm.value.lineItems,
      subtotal: invoiceTotals.value.subtotal,
      vatAmount: invoiceTotals.value.vat,
      totalAmount: invoiceTotals.value.total,
      status: 'sent',
      terms: invoiceForm.value.terms,
      createdAt: new Date()
    }

    documents.value.push(invoice)
    updateStatistics()
    showSnackbar('Invoice generated successfully', 'success')
    closeInvoiceDialog()
  } catch (error) {
    showSnackbar('Error generating invoice', 'error')
  } finally {
    saving.value = false
  }
}

// Document actions
const viewDocument = (document: Document) => {
  console.log('View document:', document)
}

const downloadDocument = (document: Document) => {
  console.log('Download document:', document)
}

const emailDocument = (document: Document) => {
  console.log('Email document:', document)
}

const duplicateDocument = (document: Document) => {
  console.log('Duplicate document:', document)
}

const markAsPaid = (document: Document) => {
  document.status = 'paid'
  showSnackbar('Document marked as paid', 'success')
  updateStatistics()
}

const editDocument = (document: Document) => {
  console.log('Edit document:', document)
}

const deleteDocument = (document: Document) => {
  if (confirm('Are you sure you want to delete this document?')) {
    const index = documents.value.findIndex(d => d.id === document.id)
    if (index !== -1) {
      documents.value.splice(index, 1)
      showSnackbar('Document deleted successfully', 'success')
      updateStatistics()
    }
  }
}

const exportData = () => {
  console.log('Export data')
}

const updateStatistics = () => {
  statistics.value = {
    totalReceipts: documents.value.filter(d => d.type === 'receipt').length,
    totalAmount: documents.value.reduce((sum, d) => sum + d.totalAmount, 0),
    pendingInvoices: documents.value.filter(d => d.type === 'invoice' && d.status !== 'paid').length,
    totalVAT: documents.value.reduce((sum, d) => sum + d.vatAmount, 0)
  }
}

const showSnackbar = (message: string, color: string = 'success') => {
  snackbar.value = { show: true, message, color }
}

const loadMockData = () => {
  documents.value = [
    {
      id: 'RCP-001',
      type: 'receipt',
      documentNumber: 'RCP-2024-0001',
      customerId: '1',
      customerName: 'Qatar National Industries',
      customerEmail: 'ahmed@qni.qa',
      issueDate: new Date('2024-10-15'),
      lineItems: [
        { description: 'Payroll Services', quantity: 1, unitPrice: 5000, vatRate: 5, total: 5250 }
      ],
      subtotal: 5000,
      vatAmount: 250,
      totalAmount: 5250,
      status: 'paid',
      paymentMethod: 'Bank Transfer',
      createdAt: new Date('2024-10-15')
    },
    {
      id: 'INV-001',
      type: 'invoice',
      documentNumber: 'INV-2024-0001',
      customerId: '2',
      customerName: 'Doha Trading Company',
      customerEmail: 'sarah@dohatrading.qa',
      issueDate: new Date('2024-10-20'),
      dueDate: new Date('2024-11-19'),
      lineItems: [
        { description: 'Monthly HR Services', quantity: 1, unitPrice: 3000, vatRate: 5, total: 3150 }
      ],
      subtotal: 3000,
      vatAmount: 150,
      totalAmount: 3150,
      status: 'sent',
      terms: 'Payment due within 30 days',
      createdAt: new Date('2024-10-20')
    }
  ]
  updateStatistics()
}

onMounted(() => {
  loadMockData()
})
</script>

<style scoped>
.stat-card {
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.v-data-table {
  border-radius: 8px;
}

.v-card-title {
  background-color: rgb(var(--v-theme-surface-variant));
}
</style>
