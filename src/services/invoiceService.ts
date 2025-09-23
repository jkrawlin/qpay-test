// In-memory stub implementation replacing Firestore for phase 1 (Firebase removed)
// Data is volatile and will reset on reload. Suitable only for demo / build success.
import { generateId } from '@/firebase/config'
import { format } from 'date-fns'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { persistence } from '@/persistence/localStore'

export interface LineItem {
  id?: string
  description: string
  category: string
  quantity: number
  unitPrice: number
  discount: number
  vatRate: number
  vatExempt: boolean
  subtotal: number
  vatAmount: number
  total: number
}

export interface Invoice {
  id?: string
  invoiceNumber: string
  customerId: string
  customerName: string
  customerEmail: string
  customerAddress: string
  customerVatNumber?: string
  type: 'invoice' | 'receipt' | 'credit-note' | 'debit-note'
  status: 'draft' | 'sent' | 'paid' | 'partially-paid' | 'overdue' | 'cancelled'
  issueDate: Date
  dueDate: Date
  paymentTerms: number
  currency: string
  exchangeRate: number
  lineItems: LineItem[]
  subtotal: number
  totalDiscount: number
  vatBreakdown: VATBreakdown[]
  totalVAT: number
  totalAmount: number
  amountPaid: number
  amountDue: number
  paymentMethod?: string
  bankDetails?: BankDetails
  notes?: string
  terms?: string
  footerText?: string
  language: 'en' | 'ar'
  attachments?: string[]
  emailSent: boolean
  emailDate?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
  
  // Qatar-specific fields
  qatarVatNumber?: string
  isQatarResident: boolean
  exportDeclaration?: string
  ministryApprovalNumber?: string
  complianceNotes?: string
}

export interface VATBreakdown {
  rate: number
  taxableAmount: number
  vatAmount: number
  description: string
}

export interface BankDetails {
  bankName: string
  accountName: string
  accountNumber: string
  iban: string
  swiftCode: string
}

export interface PaymentRecord {
  id?: string
  invoiceId: string
  amount: number
  paymentDate: Date
  paymentMethod: string
  reference: string
  notes?: string
  exchangeRate?: number
  createdAt: Date
}

// Serialized forms for persistence (Date -> ISO string)
interface SerializedInvoice extends Omit<Invoice, 'issueDate' | 'dueDate' | 'createdAt' | 'updatedAt' | 'emailDate' | 'lineItems'> {
  issueDate: string
  dueDate: string
  createdAt: string
  updatedAt: string
  emailDate?: string
  lineItems: LineItem[]
}
interface SerializedPaymentRecord extends Omit<PaymentRecord, 'paymentDate' | 'createdAt'> {
  paymentDate: string
  createdAt: string
}

function serializeInvoice(inv: Invoice): SerializedInvoice {
  return {
    ...inv,
    issueDate: inv.issueDate.toISOString(),
    dueDate: inv.dueDate.toISOString(),
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString(),
    emailDate: inv.emailDate ? inv.emailDate.toISOString() : undefined
  }
}
function deserializeInvoice(inv: SerializedInvoice): Invoice {
  return {
    ...inv,
    issueDate: new Date(inv.issueDate),
    dueDate: new Date(inv.dueDate),
    createdAt: new Date(inv.createdAt),
    updatedAt: new Date(inv.updatedAt),
    emailDate: inv.emailDate ? new Date(inv.emailDate) : undefined
  }
}
function serializePaymentRecord(p: PaymentRecord): SerializedPaymentRecord { return { ...p, paymentDate: p.paymentDate.toISOString(), createdAt: p.createdAt.toISOString() } }
function deserializePaymentRecord(p: SerializedPaymentRecord): PaymentRecord { return { ...p, paymentDate: new Date(p.paymentDate), createdAt: new Date(p.createdAt) } }

export interface InvoiceStatistics {
  totalInvoices: number
  totalAmount: number
  totalPaid: number
  totalOutstanding: number
  overdueAmount: number
  thisMonthInvoices: number
  thisMonthAmount: number
  averageInvoiceValue: number
  averagePaymentDays: number
  vatCollected: number
  byStatus: Record<string, number>
  byCustomer: Record<string, number>
  monthlyTrend: Array<{
    month: string
    invoices: number
    amount: number
    payments: number
  }>
}

export class InvoiceService {
  // In-memory collections
  private invoices: Invoice[] = []
  private payments: PaymentRecord[] = []
  // customers array removed (unused in in-memory stub)

  constructor() {
    this.hydrate()
  }

  private hydrate() {
    const storedInvoices = persistence.get<SerializedInvoice[]>('invoices:data', [])
    const storedPayments = persistence.get<SerializedPaymentRecord[]>('invoices:payments', [])
    if (storedInvoices) this.invoices = storedInvoices.map(deserializeInvoice)
    if (storedPayments) this.payments = storedPayments.map(deserializePaymentRecord)
  }

  private persist() {
    persistence.set('invoices:data', this.invoices.map(serializeInvoice))
    persistence.set('invoices:payments', this.payments.map(serializePaymentRecord))
  }

  // Qatar VAT Configuration
  private readonly QATAR_VAT_RATE = 5 // 5% VAT rate in Qatar
  private readonly VAT_EXEMPT_CATEGORIES = [
    'medical-services',
    'education',
    'financial-services',
    'residential-rent',
    'essential-food-items'
  ]

  // Invoice CRUD Operations
  async createInvoice(invoiceData: Omit<Invoice, 'id'>): Promise<string | null> {
    try {
      // Validate invoice data
      this.validateInvoiceData(invoiceData)
      
      // Calculate totals and VAT
      const calculatedInvoice = this.calculateInvoiceTotals(invoiceData)
      
      // Generate invoice number if not provided
      if (!calculatedInvoice.invoiceNumber) {
        calculatedInvoice.invoiceNumber = await this.generateInvoiceNumber(calculatedInvoice.type)
      }
      
      // Validate Qatar compliance
      await this.validateQatarCompliance(calculatedInvoice)
      
      const id = generateId()
      const now = new Date()
      const toStore: Invoice = {
        ...calculatedInvoice,
        id,
        createdAt: now,
        updatedAt: now,
        emailDate: calculatedInvoice.emailDate || undefined
      }
      this.invoices.push(toStore)
      this.persist()
      return id
    } catch (error) {
      console.error('Error creating invoice:', error)
      throw error
    }
  }

  async updateInvoice(id: string, invoiceData: Partial<Invoice>): Promise<void> {
    try {
      // Recalculate totals if line items changed
      if (invoiceData.lineItems) {
        const recalculated = this.calculateInvoiceTotals(invoiceData as Invoice)
        Object.assign(invoiceData, {
          subtotal: recalculated.subtotal,
          totalDiscount: recalculated.totalDiscount,
          vatBreakdown: recalculated.vatBreakdown,
          totalVAT: recalculated.totalVAT,
          totalAmount: recalculated.totalAmount,
          amountDue: recalculated.totalAmount - (invoiceData.amountPaid || 0)
        })
      }
      
      const existing = this.invoices.find(inv => inv.id === id)
      if (existing) {
        Object.assign(existing, invoiceData, { updatedAt: new Date() })
        this.persist()
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
      throw error
    }
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    try {
      return this.invoices.find(inv => inv.id === id) || null
    } catch (error) {
      console.error('Error fetching invoice:', error)
      return null
    }
  }

  async getAllInvoices(): Promise<Invoice[]> {
    try {
      return [...this.invoices].sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime())
    } catch (error) {
      console.error('Error fetching invoices:', error)
      return this.getMockInvoices()
    }
  }

  async deleteInvoice(id: string): Promise<void> {
    try {
      // Check if invoice has payments
      const payments = await this.getInvoicePayments(id)
      if (payments.length > 0) {
        throw new Error('Cannot delete invoice with payments. Cancel invoice instead.')
      }
      this.invoices = this.invoices.filter(inv => inv.id !== id)
      this.persist()
    } catch (error) {
      console.error('Error deleting invoice:', error)
      throw error
    }
  }

  // VAT Calculations (Qatar-specific)
  calculateQatarVAT(lineItems: LineItem[]): {
    vatBreakdown: VATBreakdown[]
    totalVAT: number
  } {
    const vatBreakdown: VATBreakdown[] = []
    let totalVAT = 0

    // Group line items by VAT rate
    const vatGroups = new Map<number, { taxableAmount: number; vatAmount: number }>()

    lineItems.forEach(item => {
      if (!item.vatExempt) {
        const vatRate = item.vatRate || this.QATAR_VAT_RATE
        const taxableAmount = item.subtotal - (item.discount || 0)
        const vatAmount = taxableAmount * (vatRate / 100)

        if (vatGroups.has(vatRate)) {
          const existing = vatGroups.get(vatRate)!
          existing.taxableAmount += taxableAmount
          existing.vatAmount += vatAmount
        } else {
          vatGroups.set(vatRate, { taxableAmount, vatAmount })
        }

        // Update line item VAT amount
        item.vatAmount = vatAmount
        item.total = taxableAmount + vatAmount
        totalVAT += vatAmount
      } else {
        item.vatAmount = 0
        item.total = item.subtotal - (item.discount || 0)
      }
    })

    // Create VAT breakdown
    vatGroups.forEach((amounts, rate) => {
      vatBreakdown.push({
        rate,
        taxableAmount: amounts.taxableAmount,
        vatAmount: amounts.vatAmount,
        description: rate === 0 ? 'VAT Exempt' : rate === this.QATAR_VAT_RATE ? 'Standard Rate' : 'Special Rate'
      })
    })

    return { vatBreakdown, totalVAT }
  }

  private calculateInvoiceTotals(invoice: Partial<Invoice>): Invoice {
    const lineItems = invoice.lineItems || []
    
    // Calculate subtotals for each line item
    lineItems.forEach(item => {
      item.subtotal = item.quantity * item.unitPrice
    })

    const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0)
    const totalDiscount = lineItems.reduce((sum, item) => sum + (item.discount || 0), 0)
    
    // Calculate VAT
    const { vatBreakdown, totalVAT } = this.calculateQatarVAT(lineItems)
    
    const totalAmount = subtotal - totalDiscount + totalVAT
    const amountPaid = invoice.amountPaid || 0
    const amountDue = totalAmount - amountPaid

    return {
      ...invoice,
      lineItems,
      subtotal,
      totalDiscount,
      vatBreakdown,
      totalVAT,
      totalAmount,
      amountDue,
      currency: invoice.currency || 'QAR',
      exchangeRate: invoice.exchangeRate || 1,
      language: invoice.language || 'en',
      isQatarResident: invoice.isQatarResident ?? true
    } as Invoice
  }

  // Payment Management
  async recordPayment(paymentData: Omit<PaymentRecord, 'id'>): Promise<string | null> {
    try {
      // Get the invoice
      const invoice = await this.getInvoice(paymentData.invoiceId)
      if (!invoice) {
        throw new Error('Invoice not found')
      }

      // Validate payment amount
      if (paymentData.amount <= 0) {
        throw new Error('Payment amount must be positive')
      }
      if (paymentData.amount > invoice.amountDue) {
        throw new Error('Payment amount exceeds amount due')
      }

      // Record payment
      const id = generateId()
      const record: PaymentRecord = {
        ...paymentData,
        id,
        createdAt: new Date()
      }
      this.payments.push(record)

      // Update invoice
      const newAmountPaid = invoice.amountPaid + paymentData.amount
      const newAmountDue = invoice.totalAmount - newAmountPaid
      const newStatus = newAmountDue <= 0 ? 'paid' : 'partially-paid'

      invoice.amountPaid = newAmountPaid
      invoice.amountDue = newAmountDue
      invoice.status = newStatus as Invoice['status']
      invoice.updatedAt = new Date()
  this.persist()
      return id
    } catch (error) {
      console.error('Error recording payment:', error)
      throw error
    }
  }

  async getInvoicePayments(invoiceId: string): Promise<PaymentRecord[]> {
    try {
      return this.payments
        .filter(p => p.invoiceId === invoiceId)
        .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime())
    } catch (error) {
      console.error('Error fetching payments:', error)
      return []
    }
  }

  // PDF Generation
  async generateInvoicePDF(invoice: Invoice): Promise<Blob> {
    const doc = new jsPDF()
    
    // Company Header
    doc.setFontSize(20)
    doc.text('QPAY SYSTEMS', 20, 30)
    doc.setFontSize(10)
    doc.text('Comprehensive Qatar Payroll Solutions', 20, 40)
    doc.text('Doha, Qatar | VAT No: QA-123456789', 20, 46)
    
    // Invoice Title
    doc.setFontSize(16)
    doc.text(invoice.type.toUpperCase(), 150, 30)
    doc.setFontSize(10)
    doc.text(`${invoice.type.charAt(0).toUpperCase() + invoice.type.slice(1)} #: ${invoice.invoiceNumber}`, 150, 40)
    doc.text(`Date: ${format(invoice.issueDate, 'dd/MM/yyyy')}`, 150, 46)
    doc.text(`Due Date: ${format(invoice.dueDate, 'dd/MM/yyyy')}`, 150, 52)
    
    // Customer Details
    doc.text('Bill To:', 20, 70)
    doc.text(invoice.customerName, 20, 80)
    doc.text(invoice.customerAddress, 20, 86)
    if (invoice.customerVatNumber) {
      doc.text(`VAT No: ${invoice.customerVatNumber}`, 20, 92)
    }
    
    // Line Items Table
    const tableData = invoice.lineItems.map(item => [
      item.description,
      item.quantity.toString(),
      this.formatCurrency(item.unitPrice),
      `${item.discount || 0}%`,
      `${item.vatRate}%`,
      this.formatCurrency(item.total)
    ])
    
    ;(doc as any).autoTable({
      head: [['Description', 'Qty', 'Unit Price', 'Discount', 'VAT', 'Total']],
      body: tableData,
      startY: 110,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    })
    
    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10
    
    doc.text('Subtotal:', 130, finalY)
    doc.text(this.formatCurrency(invoice.subtotal), 170, finalY)
    
    doc.text('Discount:', 130, finalY + 6)
    doc.text(this.formatCurrency(invoice.totalDiscount), 170, finalY + 6)
    
    // VAT Breakdown
    let vatY = finalY + 12
    invoice.vatBreakdown.forEach(vat => {
      doc.text(`VAT (${vat.rate}%):`, 130, vatY)
      doc.text(this.formatCurrency(vat.vatAmount), 170, vatY)
      vatY += 6
    })
    
    // Total
    doc.setFontSize(12)
    doc.text('TOTAL:', 130, vatY + 6)
    doc.text(this.formatCurrency(invoice.totalAmount), 170, vatY + 6)
    
    // Payment Terms
    if (invoice.terms) {
      doc.setFontSize(10)
      doc.text('Terms & Conditions:', 20, vatY + 20)
      doc.text(invoice.terms, 20, vatY + 26)
    }
    
    // Qatar Compliance Footer
    doc.setFontSize(8)
    doc.text('This invoice is generated in compliance with Qatar VAT regulations', 20, 280)
    if (invoice.ministryApprovalNumber) {
      doc.text(`Ministry Approval: ${invoice.ministryApprovalNumber}`, 20, 286)
    }
    
    return doc.output('blob')
  }

  // Utility Methods
  private async generateInvoiceNumber(type: string): Promise<string> {
    const prefix = type === 'receipt' ? 'RCP' : 'INV'
    const year = new Date().getFullYear()
    
    try {
      const existing = this.invoices.filter(i => i.type === type)
      const sequence = existing.length + 1
      return `${prefix}-${year}-${String(sequence).padStart(4, '0')}`
    } catch (error) {
      // Fallback
      return `${prefix}-${year}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`
    }
  }

  private validateInvoiceData(invoiceData: Omit<Invoice, 'id'>): void {
    if (!invoiceData.customerId) {
      throw new Error('Customer is required')
    }
    if (!invoiceData.lineItems || invoiceData.lineItems.length === 0) {
      throw new Error('At least one line item is required')
    }
    if (!invoiceData.issueDate) {
      throw new Error('Issue date is required')
    }
    if (!invoiceData.dueDate) {
      throw new Error('Due date is required')
    }
    if (invoiceData.dueDate <= invoiceData.issueDate) {
      throw new Error('Due date must be after issue date')
    }
  }

  private async validateQatarCompliance(invoice: Invoice): Promise<void> {
    // Check VAT registration requirements
    if (invoice.totalAmount > 375000 && !invoice.qatarVatNumber) { // QAR 375,000 VAT threshold
      console.warn('Invoice amount exceeds VAT registration threshold')
    }
    
    // Validate VAT exempt categories
    invoice.lineItems.forEach(item => {
      if (item.vatExempt && !this.VAT_EXEMPT_CATEGORIES.includes(item.category)) {
        throw new Error(`Category '${item.category}' is not eligible for VAT exemption`)
      }
    })
    
    // Check for required fields for Qatar residents
    if (invoice.isQatarResident && invoice.totalAmount > 10000 && !invoice.customerVatNumber) {
      console.warn('Large transaction with Qatar resident without VAT number')
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-QA', {
      style: 'currency',
      currency: 'QAR'
    }).format(amount)
  }

  // Statistics
  async getInvoiceStatistics(): Promise<InvoiceStatistics> {
    try {
      const invoices = await this.getAllInvoices()
      const today = new Date()
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      
      const stats: InvoiceStatistics = {
        totalInvoices: invoices.length,
        totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
        totalPaid: invoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
        totalOutstanding: invoices.reduce((sum, inv) => sum + inv.amountDue, 0),
        overdueAmount: invoices
          .filter(inv => inv.dueDate < today && inv.amountDue > 0)
          .reduce((sum, inv) => sum + inv.amountDue, 0),
        thisMonthInvoices: invoices.filter(inv => inv.issueDate >= thisMonth).length,
        thisMonthAmount: invoices
          .filter(inv => inv.issueDate >= thisMonth)
          .reduce((sum, inv) => sum + inv.totalAmount, 0),
        averageInvoiceValue: invoices.length > 0 ? 
          invoices.reduce((sum, inv) => sum + inv.totalAmount, 0) / invoices.length : 0,
        averagePaymentDays: 0, // Calculate from payment records
        vatCollected: invoices.reduce((sum, inv) => sum + inv.totalVAT, 0),
        byStatus: {},
        byCustomer: {},
        monthlyTrend: []
      }
      
      // Group by status
      invoices.forEach(invoice => {
        stats.byStatus[invoice.status] = (stats.byStatus[invoice.status] || 0) + 1
      })
      
      // Group by customer
      invoices.forEach(invoice => {
        stats.byCustomer[invoice.customerName] = (stats.byCustomer[invoice.customerName] || 0) + invoice.totalAmount
      })
      
      return stats
    } catch (error) {
      console.error('Error getting invoice statistics:', error)
      return this.getMockStatistics()
    }
  }

  // Mock Data
  private getMockInvoices(): Invoice[] {
    return [
      {
        id: 'INV-001',
        invoiceNumber: 'INV-2024-0001',
        customerId: 'CUST-001',
        customerName: 'Qatar National Industries',
        customerEmail: 'ahmed@qni.qa',
        customerAddress: 'Industrial Area, Doha, Qatar',
        customerVatNumber: 'VAT-QA-123456789',
        type: 'invoice',
        status: 'sent',
        issueDate: new Date('2024-10-20'),
        dueDate: new Date('2024-11-19'),
        paymentTerms: 30,
        currency: 'QAR',
        exchangeRate: 1,
        lineItems: [
          {
            description: 'Monthly Payroll Services',
            category: 'services',
            quantity: 1,
            unitPrice: 5000,
            discount: 0,
            vatRate: 5,
            vatExempt: false,
            subtotal: 5000,
            vatAmount: 250,
            total: 5250
          }
        ],
        subtotal: 5000,
        totalDiscount: 0,
        vatBreakdown: [
          {
            rate: 5,
            taxableAmount: 5000,
            vatAmount: 250,
            description: 'Standard Rate'
          }
        ],
        totalVAT: 250,
        totalAmount: 5250,
        amountPaid: 0,
        amountDue: 5250,
        language: 'en',
        isQatarResident: true,
        qatarVatNumber: 'QA-987654321',
        emailSent: true,
        emailDate: new Date('2024-10-20'),
        createdBy: 'admin',
        createdAt: new Date('2024-10-20'),
        updatedAt: new Date('2024-10-20'),
        terms: 'Payment due within 30 days. Late fees may apply.'
      }
    ]
  }

  private getMockStatistics(): InvoiceStatistics {
    return {
      totalInvoices: 25,
      totalAmount: 125000,
      totalPaid: 85000,
      totalOutstanding: 40000,
      overdueAmount: 15000,
      thisMonthInvoices: 8,
      thisMonthAmount: 35000,
      averageInvoiceValue: 5000,
      averagePaymentDays: 22,
      vatCollected: 6250,
      byStatus: {
        'draft': 2,
        'sent': 8,
        'paid': 12,
        'overdue': 3
      },
      byCustomer: {
        'Qatar National Industries': 45000,
        'Doha Trading Company': 30000,
        'Al Thani Group': 25000,
        'Qatar Petroleum': 25000
      },
      monthlyTrend: []
    }
  }
}

export const invoiceService = new InvoiceService()