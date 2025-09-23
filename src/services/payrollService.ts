// In-memory payroll service stub replacing Firestore implementation
// Phase 1 removal: all persistence happens in local arrays during session/runtime only.
// NOTE: This is NOT production-ready persistence.

// Removed firebase/firestore imports.

import { generateId } from '@/firebase/config'
import { persistence } from '@/persistence/localStore'

interface SalaryTransaction {
  id?: string
  employeeId: string
  employeeName: string
  month: string
  year: number
  basicSalary: number
  allowances: {
    housing: number
    transport: number
    food: number
    overtime: number
    other: number
  }
  deductions: {
    advances: number
    absences: number
    latePenalty: number
    other: number
  }
  grossSalary: number
  netPayable: number
  paidAmount: number
  paymentDate: Date | null
  paymentMethod: 'cash' | 'bank' | 'cheque'
  status: 'pending' | 'partial' | 'paid'
  bankDetails?: {
    bankName: string
    accountNumber: string
    transactionRef: string
  }
  notes?: string
  createdAt: Date
  updatedAt: Date
}

interface AdvanceLoan {
  id?: string
  employeeId: string
  employeeName: string
  department: string
  amount: number
  reason: string
  requestDate: Date
  approvalDate?: Date
  repaymentMethod: 'monthly' | 'lumpsum' | 'salary-deduction'
  installments?: number
  monthlyDeduction?: number
  balance: number
  paidAmount: number
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed'
  approvedBy?: string
  guarantor?: string
  documents: string[]
  paymentHistory: AdvancePayment[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

interface AdvancePayment {
  id: string
  loanId: string
  amount: number
  paymentDate: Date
  paymentMethod: 'cash' | 'bank' | 'salary-deduction'
  transactionRef?: string
  notes?: string
  recordedBy: string
}

// Serialized representations (Dates converted to ISO strings)
interface SerializedSalary extends Omit<SalaryTransaction, 'createdAt' | 'updatedAt' | 'paymentDate'> {
  createdAt: string
  updatedAt: string
  paymentDate: string | null
}
interface SerializedLoan extends Omit<AdvanceLoan, 'createdAt' | 'updatedAt' | 'approvalDate' | 'requestDate' | 'paymentHistory'> {
  createdAt: string
  updatedAt: string
  approvalDate?: string
  requestDate: string
  paymentHistory: SerializedPayment[]
}
interface SerializedPayment extends Omit<AdvancePayment, 'paymentDate'> {
  paymentDate: string
}

function serializeSalary(s: SalaryTransaction): SerializedSalary {
  return { ...s, createdAt: s.createdAt.toISOString(), updatedAt: s.updatedAt.toISOString(), paymentDate: s.paymentDate ? s.paymentDate.toISOString() : null }
}
function deserializeSalary(s: SerializedSalary): SalaryTransaction {
  return { ...s, createdAt: new Date(s.createdAt), updatedAt: new Date(s.updatedAt), paymentDate: s.paymentDate ? new Date(s.paymentDate) : null }
}
function serializeLoan(l: AdvanceLoan): SerializedLoan {
  return { ...l, createdAt: l.createdAt.toISOString(), updatedAt: l.updatedAt.toISOString(), approvalDate: l.approvalDate ? l.approvalDate.toISOString() : undefined, requestDate: l.requestDate.toISOString(), paymentHistory: l.paymentHistory.map(serializePayment) }
}
function deserializeLoan(l: SerializedLoan): AdvanceLoan {
  return { ...l, createdAt: new Date(l.createdAt), updatedAt: new Date(l.updatedAt), approvalDate: l.approvalDate ? new Date(l.approvalDate) : undefined, requestDate: new Date(l.requestDate), paymentHistory: l.paymentHistory.map(deserializePayment) }
}
function serializePayment(p: AdvancePayment): SerializedPayment { return { ...p, paymentDate: p.paymentDate.toISOString() } }
function deserializePayment(p: SerializedPayment): AdvancePayment { return { ...p, paymentDate: new Date(p.paymentDate) } }

export class PayrollService {
  // In-memory stores (hydrated from persistence if available)
  private salaryTransactions: SalaryTransaction[] = []
  private advanceLoans: AdvanceLoan[] = []
  private advancePayments: AdvancePayment[] = []

  constructor() {
    this.hydrate()
  }

  private hydrate() {
    const salaries = persistence.get<SerializedSalary[]>('payroll:salaries', [])
    const loans = persistence.get<SerializedLoan[]>('payroll:loans', [])
    const payments = persistence.get<SerializedPayment[]>('payroll:advancePayments', [])
    if (salaries) this.salaryTransactions = salaries.map(deserializeSalary)
    if (loans) this.advanceLoans = loans.map(deserializeLoan)
    if (payments) this.advancePayments = payments.map(deserializePayment)
  }

  private persist() {
    persistence.set('payroll:salaries', this.salaryTransactions.map(serializeSalary))
    persistence.set('payroll:loans', this.advanceLoans.map(serializeLoan))
    persistence.set('payroll:advancePayments', this.advancePayments.map(serializePayment))
  }
  
  // Utility to find salary transaction
  private findSalary(id: string) {
    return this.salaryTransactions.find(t => t.id === id)
  }
  private findLoan(id: string) {
    return this.advanceLoans.find(l => l.id === id)
  }
  
  // Salary Transaction Management
  async createSalaryTransaction(transaction: Partial<SalaryTransaction>): Promise<string> {
    const id = generateId()
    const salaryData: SalaryTransaction = {
      ...(transaction as SalaryTransaction),
      id,
      grossSalary: this.calculateGrossSalary(transaction),
      netPayable: this.calculateNetPayable(transaction),
      paidAmount: transaction.paidAmount || 0,
      paymentDate: transaction.paymentDate || null,
      status: transaction.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.salaryTransactions.push(salaryData)
    this.persist()
    return id
  }

  async updateSalaryTransaction(id: string, updates: Partial<SalaryTransaction>): Promise<void> {
    const existing = this.findSalary(id)
    if (existing) {
      Object.assign(existing, updates, { updatedAt: new Date() })
      if (updates.basicSalary || updates.allowances || updates.deductions) {
        existing.grossSalary = this.calculateGrossSalary(existing)
        existing.netPayable = this.calculateNetPayable(existing)
      }
      this.persist()
    }
  }

  async getSalaryTransactions(employeeId?: string, month?: string, year?: number): Promise<SalaryTransaction[]> {
    return this.salaryTransactions
      .filter(t => !employeeId || t.employeeId === employeeId)
      .filter(t => !month || t.month === month)
      .filter(t => !year || t.year === year)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async processSalaryPayment(transactionId: string, paymentData: {
    amount: number
    paymentMethod: 'cash' | 'bank' | 'cheque'
    paymentDate: Date
    bankDetails?: any
    notes?: string
  }): Promise<void> {
    const tx = this.findSalary(transactionId)
    if (!tx) return
    tx.paidAmount = paymentData.amount
    tx.paymentDate = paymentData.paymentDate
    tx.paymentMethod = paymentData.paymentMethod
    tx.bankDetails = paymentData.bankDetails
    tx.status = paymentData.amount === 0 ? 'pending' : (paymentData.amount >= tx.netPayable ? 'paid' : 'partial')
    tx.notes = paymentData.notes
    tx.updatedAt = new Date()
    this.persist()
  }

  // Advance Loan Management
  async createAdvanceLoan(loan: Partial<AdvanceLoan>): Promise<string> {
    const id = generateId()
    const loanData: AdvanceLoan = {
      ...(loan as AdvanceLoan),
      id,
      balance: loan.amount || 0,
      paidAmount: 0,
      status: 'pending',
      paymentHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.advanceLoans.push(loanData)
    this.persist()
    return id
  }

  async approveLoan(loanId: string, approvedBy: string, approvalNotes?: string): Promise<void> {
    const loan = this.findLoan(loanId)
    if (loan) {
      Object.assign(loan, {
        status: 'approved',
        approvalDate: new Date(),
        approvedBy,
        notes: approvalNotes,
        updatedAt: new Date()
      })
      this.persist()
    }
  }

  async rejectLoan(loanId: string, rejectedBy: string, rejectionReason?: string): Promise<void> {
    const loan = this.findLoan(loanId)
    if (loan) {
      Object.assign(loan, {
        status: 'rejected',
        rejectedBy,
        rejectionReason,
        updatedAt: new Date()
      })
      this.persist()
    }
  }

  async recordLoanPayment(paymentData: {
    loanId: string
    amount: number
    paymentDate: Date
    paymentMethod: 'cash' | 'bank' | 'salary-deduction'
    transactionRef?: string
    notes?: string
    recordedBy: string
  }): Promise<void> {
    const loan = this.findLoan(paymentData.loanId)
    if (!loan) throw new Error('Loan not found')
    const payment: AdvancePayment = {
      id: generateId(),
      loanId: paymentData.loanId,
      amount: paymentData.amount,
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      transactionRef: paymentData.transactionRef,
      notes: paymentData.notes,
      recordedBy: paymentData.recordedBy
    }
    this.advancePayments.push(payment)
    loan.paidAmount += payment.amount
    loan.balance = (loan.amount || 0) - loan.paidAmount
    loan.paymentHistory.push(payment)
    loan.status = loan.balance <= 0 ? 'completed' : 'active'
    loan.updatedAt = new Date()
    this.persist()
  }

  async getAdvanceLoans(employeeId?: string, status?: string): Promise<AdvanceLoan[]> {
    return this.advanceLoans
      .filter(l => !employeeId || l.employeeId === employeeId)
      .filter(l => !status || l.status === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  // Payroll Analytics
  async getPayrollSummary(month: string, year: number): Promise<any> {
    const transactions = await this.getSalaryTransactions(undefined, month, year)
    
    const summary = {
      totalEmployees: transactions.length,
      totalBasicSalary: 0,
      totalAllowances: 0,
      totalDeductions: 0,
      totalGrossSalary: 0,
      totalNetPayable: 0,
      totalPaid: 0,
      pending: 0,
      departmentBreakdown: {} as Record<string, any>,
      allowanceBreakdown: {
        housing: 0,
        transport: 0,
        food: 0,
        overtime: 0,
        other: 0
      },
      deductionBreakdown: {
        advances: 0,
        absences: 0,
        latePenalty: 0,
        other: 0
      }
    }
    
    transactions.forEach(transaction => {
      summary.totalBasicSalary += transaction.basicSalary
      summary.totalGrossSalary += transaction.grossSalary
      summary.totalNetPayable += transaction.netPayable
      summary.totalPaid += transaction.paidAmount
      
      if (transaction.status === 'pending') summary.pending++
      
      // Allowances
      Object.keys(transaction.allowances).forEach(key => {
        summary.totalAllowances += transaction.allowances[key as keyof typeof transaction.allowances]
        summary.allowanceBreakdown[key as keyof typeof summary.allowanceBreakdown] += 
          transaction.allowances[key as keyof typeof transaction.allowances]
      })
      
      // Deductions
      Object.keys(transaction.deductions).forEach(key => {
        summary.totalDeductions += transaction.deductions[key as keyof typeof transaction.deductions]
        summary.deductionBreakdown[key as keyof typeof summary.deductionBreakdown] += 
          transaction.deductions[key as keyof typeof transaction.deductions]
      })
    })
    
    return summary
  }

  async getLoanSummary(): Promise<any> {
    const loans = [...this.advanceLoans]
    
    const summary = {
      totalLoans: loans.length,
      totalAmount: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      pendingApproval: 0,
      activeLoans: 0,
      completedLoans: 0,
      rejectedLoans: 0,
      averageLoanAmount: 0,
      departmentBreakdown: {} as Record<string, any>
    }
    
    loans.forEach(loan => {
      summary.totalAmount += loan.amount
      summary.totalPaid += loan.paidAmount
      summary.totalOutstanding += loan.balance
      
      switch (loan.status) {
        case 'pending':
          summary.pendingApproval++
          break
        case 'active':
        case 'approved':
          summary.activeLoans++
          break
        case 'completed':
          summary.completedLoans++
          break
        case 'rejected':
          summary.rejectedLoans++
          break
      }
      
      // Department breakdown
      if (!summary.departmentBreakdown[loan.department]) {
        summary.departmentBreakdown[loan.department] = {
          count: 0,
          totalAmount: 0,
          outstanding: 0
        }
      }
      summary.departmentBreakdown[loan.department].count++
      summary.departmentBreakdown[loan.department].totalAmount += loan.amount
      summary.departmentBreakdown[loan.department].outstanding += loan.balance
    })
    
    summary.averageLoanAmount = summary.totalAmount / summary.totalLoans || 0
    
    return summary
  }

  // Bulk Operations
  async generateMonthlySalaries(month: string, year: number, employees: any[]): Promise<string[]> {
    const transactionIds: string[] = []
    
    for (const employee of employees) {
      const transaction: Partial<SalaryTransaction> = {
        employeeId: employee.id,
        employeeName: employee.name,
        month,
        year,
        basicSalary: employee.basicSalary || 0,
        allowances: {
          housing: employee.allowances?.housing || 0,
          transport: employee.allowances?.transport || 0,
          food: employee.allowances?.food || 0,
          overtime: 0,
          other: 0
        },
        deductions: {
          advances: await this.calculateAdvanceDeduction(employee.id, month, year),
          absences: 0,
          latePenalty: 0,
          other: 0
        },
        paymentMethod: 'bank'
      }
      
      const id = await this.createSalaryTransaction(transaction)
      transactionIds.push(id)
    }
    
    return transactionIds
  }

  // Helper Methods
  private calculateGrossSalary(transaction: Partial<SalaryTransaction>): number {
    const basic = transaction.basicSalary || 0
    const allowances: SalaryTransaction['allowances'] = transaction.allowances || {
      housing: 0,
      transport: 0,
      food: 0,
      overtime: 0,
      other: 0
    }
    return basic + allowances.housing + allowances.transport + allowances.food + allowances.overtime + allowances.other
  }

  private calculateNetPayable(transaction: Partial<SalaryTransaction>): number {
    const gross = this.calculateGrossSalary(transaction)
    const deductions: SalaryTransaction['deductions'] = transaction.deductions || {
      advances: 0,
      absences: 0,
      latePenalty: 0,
      other: 0
    }
    return gross - deductions.advances - deductions.absences - deductions.latePenalty - deductions.other
  }

  private async calculateAdvanceDeduction(employeeId: string, _month: string, _year: number): Promise<number> {
    const loans = this.advanceLoans.filter(l => 
      l.employeeId === employeeId && 
      ['approved', 'active'].includes(l.status) &&
      l.repaymentMethod === 'salary-deduction'
    )
    return loans.reduce((sum, loan) => {
      if (loan.monthlyDeduction && loan.balance > 0) {
        return sum + Math.min(loan.monthlyDeduction, loan.balance)
      }
      return sum
    }, 0)
  }

  // Export Functions
  async exportPayrollData(month: string, year: number): Promise<any[]> {
    const transactions = await this.getSalaryTransactions(undefined, month, year)
    
    return transactions.map(transaction => ({
      'Employee ID': transaction.employeeId,
      'Employee Name': transaction.employeeName,
      'Month': transaction.month,
      'Year': transaction.year,
      'Basic Salary': transaction.basicSalary,
      'Housing Allowance': transaction.allowances.housing,
      'Transport Allowance': transaction.allowances.transport,
      'Food Allowance': transaction.allowances.food,
      'Overtime': transaction.allowances.overtime,
      'Other Allowances': transaction.allowances.other,
      'Advance Deductions': transaction.deductions.advances,
      'Absence Deductions': transaction.deductions.absences,
      'Late Penalty': transaction.deductions.latePenalty,
      'Other Deductions': transaction.deductions.other,
      'Gross Salary': transaction.grossSalary,
      'Net Payable': transaction.netPayable,
      'Paid Amount': transaction.paidAmount,
      'Payment Status': transaction.status,
      'Payment Method': transaction.paymentMethod,
      'Payment Date': transaction.paymentDate,
      'Bank Name': transaction.bankDetails?.bankName || '',
      'Account Number': transaction.bankDetails?.accountNumber || '',
      'Transaction Reference': transaction.bankDetails?.transactionRef || ''
    }))
  }

  async exportLoanData(): Promise<any[]> {
    const loans = await this.getAdvanceLoans()
    
    return loans.map(loan => ({
      'Loan ID': loan.id,
      'Employee ID': loan.employeeId,
      'Employee Name': loan.employeeName,
      'Department': loan.department,
      'Loan Amount': loan.amount,
      'Reason': loan.reason,
      'Request Date': loan.requestDate,
      'Approval Date': loan.approvalDate || '',
      'Repayment Method': loan.repaymentMethod,
      'Installments': loan.installments || '',
      'Monthly Deduction': loan.monthlyDeduction || '',
      'Paid Amount': loan.paidAmount,
      'Balance': loan.balance,
      'Status': loan.status,
      'Approved By': loan.approvedBy || '',
      'Guarantor': loan.guarantor || '',
      'Total Payments': loan.paymentHistory.length
    }))
  }
}

export const payrollService = new PayrollService()