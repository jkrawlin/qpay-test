import { describe, it, expect, beforeEach } from 'vitest'
import { payrollService } from '@/services/payrollService'

// Reset state by creating a new instance (current export is singleton; for now we'll clear arrays via any cast)
function reset() {
  // @ts-ignore accessing private for test reset
  payrollService['salaryTransactions'] = []
  // @ts-ignore
  payrollService['advanceLoans'] = []
  // @ts-ignore
  payrollService['advancePayments'] = []
}

describe('PayrollService', () => {
  beforeEach(() => reset())

  it('creates salary transaction and calculates gross/net', async () => {
    const id = await payrollService.createSalaryTransaction({
      employeeId: 'emp1',
      employeeName: 'Alice',
      month: 'Jan',
      year: 2025,
      basicSalary: 1000,
      allowances: { housing: 100, transport: 50, food: 0, overtime: 0, other: 0 },
      deductions: { advances: 0, absences: 0, latePenalty: 0, other: 0 },
      paymentMethod: 'bank'
    })
    expect(id).toBeTruthy()
    const list = await payrollService.getSalaryTransactions('emp1')
    expect(list.length).toBe(1)
    expect(list[0].grossSalary).toBe(1150)
    expect(list[0].netPayable).toBe(1150)
  })

  it('processes payment updates status', async () => {
    const id = await payrollService.createSalaryTransaction({
      employeeId: 'emp2',
      employeeName: 'Bob',
      month: 'Jan',
      year: 2025,
      basicSalary: 500,
      allowances: { housing: 0, transport: 0, food: 0, overtime: 0, other: 0 },
      deductions: { advances: 0, absences: 0, latePenalty: 0, other: 0 },
      paymentMethod: 'cash'
    })
    await payrollService.processSalaryPayment(id, { amount: 500, paymentDate: new Date(), paymentMethod: 'cash' })
    const tx = (await payrollService.getSalaryTransactions()).find(t => t.id === id)!
    expect(tx.status).toBe('paid')
    expect(tx.paidAmount).toBe(500)
  })
})
