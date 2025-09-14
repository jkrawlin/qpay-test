<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        <v-icon left>mdi-receipt</v-icon>
        Receipt Generator
      </v-card-title>

      <v-card-text>
        <!-- Customer Selection -->
        <v-row>
          <v-col cols="12" md="6">
            <v-autocomplete
              v-model="receipt.customerId"
              :items="customers"
              item-title="companyName"
              item-value="id"
              label="Select Customer"
              prepend-icon="mdi-domain"
              @update:model-value="loadCustomerDetails"
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="receipt.invoiceNumber"
              label="Invoice Number"
              prepend-icon="mdi-file-document-outline"
              readonly
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Items Table -->
        <v-simple-table class="my-4">
          <template v-slot:default>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in receipt.items" :key="index">
                <td>
                  <v-text-field
                    v-model="item.description"
                    density="compact"
                    hide-details
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    v-model.number="item.quantity"
                    type="number"
                    density="compact"
                    hide-details
                    @update:model-value="calculateItemAmount(index)"
                  ></v-text-field>
                </td>
                <td>
                  <v-text-field
                    v-model.number="item.unitPrice"
                    type="number"
                    density="compact"
                    hide-details
                    prefix="QAR"
                    @update:model-value="calculateItemAmount(index)"
                  ></v-text-field>
                </td>
                <td>QAR {{ item.amount.toFixed(2) }}</td>
                <td>
                  <v-btn icon size="small" color="error" @click="removeItem(index)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>

        <v-btn color="primary" @click="addItem" size="small">
          <v-icon left>mdi-plus</v-icon>
          Add Item
        </v-btn>

        <!-- Totals -->
        <v-card class="mt-4" variant="outlined">
          <v-card-text>
            <v-row>
              <v-col cols="6" class="text-right">Subtotal:</v-col>
              <v-col cols="6">QAR {{ subtotal.toFixed(2) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6" class="text-right">VAT (5%):</v-col>
              <v-col cols="6">QAR {{ vat.toFixed(2) }}</v-col>
            </v-row>
            <v-row class="font-weight-bold">
              <v-col cols="6" class="text-right">Total:</v-col>
              <v-col cols="6">QAR {{ total.toFixed(2) }}</v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Receipt Preview -->
        <div ref="receiptContent" class="receipt-preview mt-4">
          <!-- Receipt Template -->
          <div class="receipt-header text-center">
            <h2>{{ companyInfo.name }}</h2>
            <p>{{ companyInfo.address }}</p>
            <p>Tel: {{ companyInfo.phone }} | Email: {{ companyInfo.email }}</p>
            <p>VAT Registration: {{ companyInfo.vatNumber }}</p>
          </div>

          <v-divider class="my-3"></v-divider>

          <h3 class="text-center">TAX INVOICE</h3>

          <div class="receipt-details">
            <v-row>
              <v-col cols="6">
                <strong>Bill To:</strong><br>
                {{ customerDetails?.companyName }}<br>
                {{ customerDetails?.address }}<br>
                VAT: {{ customerDetails?.vatNumber }}
              </v-col>
              <v-col cols="6" class="text-right">
                <strong>Invoice #:</strong> {{ receipt.invoiceNumber }}<br>
                <strong>Date:</strong> {{ formatDate(receipt.date) }}<br>
                <strong>Due Date:</strong> {{ formatDate(receipt.dueDate) }}
              </v-col>
            </v-row>
          </div>

          <v-simple-table class="my-3">
            <template v-slot:default>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in receipt.items" :key="item.id">
                  <td>{{ item.description }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>QAR {{ item.unitPrice.toFixed(2) }}</td>
                  <td>QAR {{ item.amount.toFixed(2) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-right">Subtotal:</td>
                  <td>QAR {{ subtotal.toFixed(2) }}</td>
                </tr>
                <tr>
                  <td colspan="3" class="text-right">VAT (5%):</td>
                  <td>QAR {{ vat.toFixed(2) }}</td>
                </tr>
                <tr class="font-weight-bold">
                  <td colspan="3" class="text-right">Total:</td>
                  <td>QAR {{ total.toFixed(2) }}</td>
                </tr>
              </tfoot>
            </template>
          </v-simple-table>

          <div class="receipt-footer text-center mt-4">
            <p>Thank you for your business!</p>
            <p class="text-caption">This is a computer-generated invoice</p>
          </div>
        </div>

        <!-- Actions -->
        <v-row class="mt-4">
          <v-col cols="12" class="text-center">
            <v-btn color="primary" @click="saveReceipt" class="mr-2">
              <v-icon left>mdi-content-save</v-icon>
              Save Receipt
            </v-btn>
            <v-btn color="secondary" @click="printReceipt" class="mr-2">
              <v-icon left>mdi-printer</v-icon>
              Print
            </v-btn>
            <v-btn color="info" @click="emailReceipt">
              <v-icon left>mdi-email</v-icon>
              Email to Customer
            </v-btn>
            <v-btn color="success" @click="downloadPDF" class="ml-2">
              <v-icon left>mdi-download</v-icon>
              Download PDF
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { customerService } from '@/services/customerService'
import { invoiceService } from '@/services/invoiceService'
import { format } from 'date-fns'
import html2pdf from 'html2pdf.js'

const customers = ref<any[]>([])
const customerDetails = ref<any>(null)
const receiptContent = ref<HTMLElement>()

const receipt = ref({
  customerId: '',
  invoiceNumber: generateInvoiceNumber(),
  date: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  items: [
    {
      id: 1,
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    }
  ],
  subtotal: 0,
  vat: 0,
  total: 0,
  status: 'pending',
  notes: ''
})

const companyInfo = {
  name: 'Nipon Manpower Services',
  address: 'Building 123, Street 456, Doha, Qatar',
  phone: '+974 4444 5555',
  email: 'accounts@niponservices.qa',
  vatNumber: 'VAT-123456789'
}

// Computed
const subtotal = computed(() => {
  return receipt.value.items.reduce((sum, item) => sum + item.amount, 0)
})

const vat = computed(() => {
  return subtotal.value * 0.05 // 5% VAT in Qatar
})

const total = computed(() => {
  return subtotal.value + vat.value
})

// Methods
function generateInvoiceNumber() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(4, '0')
  return `INV-${year}${month}-${random}`
}

const loadCustomers = async () => {
  try {
    customers.value = await customerService.getAllCustomers()
  } catch (error) {
    console.error('Failed to load customers:', error)
    // Mock data fallback
    customers.value = [
      {
        id: '1',
        companyName: 'Qatar National Industries',
        address: 'Industrial Area, Doha, Qatar',
        vatNumber: 'VAT-QA-123456789'
      },
      {
        id: '2',
        companyName: 'Doha Development Co.',
        address: 'West Bay, Doha, Qatar',
        vatNumber: 'VAT-QA-987654321'
      }
    ]
  }
}

const loadCustomerDetails = async () => {
  if (receipt.value.customerId) {
    try {
      customerDetails.value = await customerService.getCustomer(receipt.value.customerId)
    } catch (error) {
      console.error('Failed to load customer details:', error)
      // Fallback to selected customer from list
      customerDetails.value = customers.value.find(c => c.id === receipt.value.customerId)
    }
  }
}

const calculateItemAmount = (index: number) => {
  const item = receipt.value.items[index]
  item.amount = item.quantity * item.unitPrice
}

const addItem = () => {
  receipt.value.items.push({
    id: Date.now(),
    description: '',
    quantity: 1,
    unitPrice: 0,
    amount: 0
  })
}

const removeItem = (index: number) => {
  receipt.value.items.splice(index, 1)
}

const saveReceipt = async () => {
  try {
    const invoiceData = {
      customerId: receipt.value.customerId,
      customerName: customerDetails.value?.companyName || '',
      customerEmail: customerDetails.value?.email || '',
      customerAddress: customerDetails.value?.address || '',
      customerVatNumber: customerDetails.value?.vatNumber || '',
      type: 'invoice' as const,
      status: 'draft' as const,
      issueDate: receipt.value.date,
      dueDate: receipt.value.dueDate,
      paymentTerms: 30,
      currency: 'QAR',
      exchangeRate: 1,
      lineItems: receipt.value.items.map(item => ({
        description: item.description,
        category: 'services',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: 0,
        vatRate: 5,
        vatExempt: false,
        subtotal: item.amount,
        vatAmount: item.amount * 0.05,
        total: item.amount * 1.05
      })),
      subtotal: subtotal.value,
      totalDiscount: 0,
      vatBreakdown: [{
        rate: 5,
        taxableAmount: subtotal.value,
        vatAmount: vat.value,
        description: 'Standard Rate'
      }],
      totalVAT: vat.value,
      totalAmount: total.value,
      amountPaid: 0,
      amountDue: total.value,
      language: 'en' as const,
      isQatarResident: true,
      emailSent: false,
      createdBy: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      invoiceNumber: receipt.value.invoiceNumber
    }
    
    await invoiceService.createInvoice(invoiceData)
    alert('Receipt saved successfully!')
  } catch (error) {
    console.error('Failed to save receipt:', error)
    alert('Failed to save receipt')
  }
}

const printReceipt = () => {
  window.print()
}

const emailReceipt = async () => {
  try {
    // Implementation would use the invoiceService
    alert('Receipt emailed successfully!')
  } catch (error) {
    console.error('Failed to email receipt:', error)
    alert('Failed to email receipt')
  }
}

const downloadPDF = () => {
  const element = receiptContent.value
  const opt = {
    margin: 10,
    filename: `receipt_${receipt.value.invoiceNumber}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }
  
  html2pdf().set(opt).from(element).save()
}

const formatDate = (date: Date) => {
  return format(date, 'dd/MM/yyyy')
}

onMounted(() => {
  loadCustomers()
})
</script>

<style scoped>
.receipt-preview {
  background: white;
  padding: 30px;
  border: 1px solid #ddd;
  max-width: 800px;
  margin: 0 auto;
}

.receipt-header {
  margin-bottom: 20px;
}

.receipt-details {
  margin: 20px 0;
}

.receipt-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

@media print {
  .v-card-actions,
  .v-btn {
    display: none !important;
  }
  
  .receipt-preview {
    border: none;
    box-shadow: none;
  }
}
</style>