import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/firebase/config'

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

export class PayrollService {
  
  // Salary Transaction Management
  async createSalaryTransaction(transaction: Partial<SalaryTransaction>): Promise<string> {
    const docRef = doc(collection(db, 'salary-transactions'))
    
    const salaryData: SalaryTransaction = {
      ...transaction as SalaryTransaction,
      id: docRef.id,
      grossSalary: this.calculateGrossSalary(transaction),
      netPayable: this.calculateNetPayable(transaction),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await setDoc(docRef, salaryData)
    return docRef.id
  }

  async updateSalaryTransaction(id: string, updates: Partial<SalaryTransaction>): Promise<void> {
    const docRef = doc(db, 'salary-transactions', id)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    })
  }

  async getSalaryTransactions(employeeId?: string, month?: string, year?: number): Promise<SalaryTransaction[]> {
    let q = query(collection(db, 'salary-transactions'), orderBy('createdAt', 'desc'))
    
    if (employeeId) {
      q = query(q, where('employeeId', '==', employeeId))
    }
    
    if (month) {
      q = query(q, where('month', '==', month))
    }
    
    if (year) {
      q = query(q, where('year', '==', year))
    }
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SalaryTransaction))
  }

  async processSalaryPayment(transactionId: string, paymentData: {
    amount: number
    paymentMethod: 'cash' | 'bank' | 'cheque'
    paymentDate: Date
    bankDetails?: any
    notes?: string
  }): Promise<void> {
    const docRef = doc(db, 'salary-transactions', transactionId)
    
    const status = paymentData.amount >= 0 ? 
      (paymentData.amount === 0 ? 'pending' : 'paid') : 'partial'
    
    await updateDoc(docRef, {
      paidAmount: paymentData.amount,
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      bankDetails: paymentData.bankDetails,
      status,
      notes: paymentData.notes,
      updatedAt: new Date()
    })
  }

  // Advance Loan Management
  async createAdvanceLoan(loan: Partial<AdvanceLoan>): Promise<string> {
    const docRef = doc(collection(db, 'advance-loans'))
    
    const loanData: AdvanceLoan = {
      ...loan as AdvanceLoan,
      id: docRef.id,
      balance: loan.amount || 0,
      paidAmount: 0,
      status: 'pending',
      paymentHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await setDoc(docRef, loanData)
    return docRef.id
  }

  async approveLoan(loanId: string, approvedBy: string, approvalNotes?: string): Promise<void> {
    const docRef = doc(db, 'advance-loans', loanId)
    await updateDoc(docRef, {
      status: 'approved',
      approvalDate: new Date(),
      approvedBy,
      notes: approvalNotes,
      updatedAt: new Date()
    })
  }

  async rejectLoan(loanId: string, rejectedBy: string, rejectionReason?: string): Promise<void> {
    const docRef = doc(db, 'advance-loans', loanId)
    await updateDoc(docRef, {
      status: 'rejected',
      rejectedBy,
      rejectionReason,
      updatedAt: new Date()
    })
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
    // Get current loan data
    const loanDoc = await getDocs(query(
      collection(db, 'advance-loans'), 
      where('id', '==', paymentData.loanId)
    ))
    
    if (loanDoc.empty) {
      throw new Error('Loan not found')
    }
    
    const loan = loanDoc.docs[0].data() as AdvanceLoan
    const newPaidAmount = loan.paidAmount + paymentData.amount
    const newBalance = loan.amount - newPaidAmount
    
    // Create payment record
    const payment: AdvancePayment = {
      id: doc(collection(db, 'temp')).id,
      loanId: paymentData.loanId,
      amount: paymentData.amount,
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
      transactionRef: paymentData.transactionRef,
      notes: paymentData.notes,
      recordedBy: paymentData.recordedBy
    }
    
    // Update loan
    const loanRef = doc(db, 'advance-loans', paymentData.loanId)
    await updateDoc(loanRef, {
      paidAmount: newPaidAmount,
      balance: newBalance,
      status: newBalance <= 0 ? 'completed' : 'active',
      paymentHistory: [...loan.paymentHistory, payment],
      updatedAt: new Date()
    })
  }

  async getAdvanceLoans(employeeId?: string, status?: string): Promise<AdvanceLoan[]> {
    let q = query(collection(db, 'advance-loans'), orderBy('createdAt', 'desc'))
    
    if (employeeId) {
      q = query(q, where('employeeId', '==', employeeId))
    }
    
    if (status) {
      q = query(q, where('status', '==', status))
    }
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AdvanceLoan))
  }

  // Payroll Analytics
  async getPayrollSummary(month: string, year: number): Promise<any> {
    const q = query(
      collection(db, 'salary-transactions'),
      where('month', '==', month),
      where('year', '==', year)
    )
    
    const snapshot = await getDocs(q)
    const transactions = snapshot.docs.map(doc => doc.data() as SalaryTransaction)
    
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
    const snapshot = await getDocs(collection(db, 'advance-loans'))
    const loans = snapshot.docs.map(doc => doc.data() as AdvanceLoan)
    
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
    const allowances = transaction.allowances || {}
    
    return basic + 
      (allowances.housing || 0) + 
      (allowances.transport || 0) + 
      (allowances.food || 0) + 
      (allowances.overtime || 0) + 
      (allowances.other || 0)
  }

  private calculateNetPayable(transaction: Partial<SalaryTransaction>): number {
    const gross = this.calculateGrossSalary(transaction)
    const deductions = transaction.deductions || {}
    
    return gross - 
      (deductions.advances || 0) - 
      (deductions.absences || 0) - 
      (deductions.latePenalty || 0) - 
      (deductions.other || 0)
  }

  private async calculateAdvanceDeduction(employeeId: string, month: string, year: number): Promise<number> {
    const q = query(
      collection(db, 'advance-loans'),
      where('employeeId', '==', employeeId),
      where('status', 'in', ['approved', 'active']),
      where('repaymentMethod', '==', 'salary-deduction')
    )
    
    const snapshot = await getDocs(q)
    let totalDeduction = 0
    
    snapshot.docs.forEach(doc => {
      const loan = doc.data() as AdvanceLoan
      if (loan.monthlyDeduction && loan.balance > 0) {
        totalDeduction += Math.min(loan.monthlyDeduction, loan.balance)
      }
    })
    
    return totalDeduction
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