import { describe, it, expect, beforeEach } from 'vitest'
import { invoiceService } from '@/services/invoiceService'

function reset() {
  // @ts-ignore
  invoiceService['invoices'] = []
  // @ts-ignore
  invoiceService['payments'] = []
}

describe('InvoiceService', () => {
  beforeEach(() => reset())

  it('creates invoice with totals and VAT', async () => {
    const id = await invoiceService.createInvoice({
      invoiceNumber: '',
      customerId: 'c1',
      customerName: 'Client One',
      customerEmail: 'client@example.com',
      customerAddress: 'Street 123',
      type: 'invoice',
      status: 'draft',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 86400000),
      paymentTerms: 1,
      currency: 'QAR',
      exchangeRate: 1,
      lineItems: [
        { description: 'Service A', category: 'services', quantity: 2, unitPrice: 100, discount: 0, vatRate: 5, vatExempt: false, subtotal: 0, vatAmount: 0, total: 0 }
      ],
      subtotal: 0,
      totalDiscount: 0,
      vatBreakdown: [],
      totalVAT: 0,
      totalAmount: 0,
      amountPaid: 0,
      amountDue: 0,
      language: 'en',
      isQatarResident: true,
      emailSent: false,
      createdBy: 'tester',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    expect(id).toBeTruthy()
    const inv = await invoiceService.getInvoice(id!)
    expect(inv?.totalAmount).toBeGreaterThan(0)
    expect(inv?.vatBreakdown.length).toBeGreaterThan(0)
  })

  it('records payment and updates status', async () => {
    const id = await invoiceService.createInvoice({
      invoiceNumber: '',
      customerId: 'c2',
      customerName: 'Client Two',
      customerEmail: 'client2@example.com',
      customerAddress: 'Street 456',
      type: 'invoice',
      status: 'draft',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 86400000),
      paymentTerms: 1,
      currency: 'QAR',
      exchangeRate: 1,
      lineItems: [
        { description: 'Consulting', category: 'services', quantity: 1, unitPrice: 300, discount: 0, vatRate: 5, vatExempt: false, subtotal: 0, vatAmount: 0, total: 0 }
      ],
      subtotal: 0,
      totalDiscount: 0,
      vatBreakdown: [],
      totalVAT: 0,
      totalAmount: 0,
      amountPaid: 0,
      amountDue: 0,
      language: 'en',
      isQatarResident: true,
      emailSent: false,
      createdBy: 'tester',
      createdAt: new Date(),
      updatedAt: new Date()
    })
    await invoiceService.recordPayment({ invoiceId: id!, amount: 100, paymentDate: new Date(), paymentMethod: 'cash', reference: 'REF1', createdAt: new Date() })
    const inv = await invoiceService.getInvoice(id!)
    expect(inv?.amountPaid).toBe(100)
    expect(inv?.status).toBe('partially-paid')
  })
})
