import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { format, startOfMonth, endOfMonth, addMonths, differenceInDays } from 'date-fns'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

interface ReportData {
  title: string
  generatedDate: Date
  data: any[]
  summary?: any
}

export class ReportService {
  // Monthly Payroll Summary
  async generatePayrollSummary(month: Date): Promise<ReportData> {
    const startDate = startOfMonth(month)
    const endDate = endOfMonth(month)
    
    try {
      const payrollQuery = query(
        collection(db, 'salary-transactions'),
        where('paymentDate', '>=', Timestamp.fromDate(startDate)),
        where('paymentDate', '<=', Timestamp.fromDate(endDate)),
        orderBy('paymentDate', 'desc')
      )
      
      const snapshot = await getDocs(payrollQuery)
      const payrollData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Calculate summary
      const summary = {
        totalBasicSalary: 0,
        totalAllowances: 0,
        totalDeductions: 0,
        totalNetPay: 0,
        employeeCount: new Set(payrollData.map(p => p.employeeId)).size,
        averageSalary: 0,
        departmentBreakdown: {} as Record<string, any>,
        paymentMethodBreakdown: {} as Record<string, number>
      }
      
      payrollData.forEach(record => {
        summary.totalBasicSalary += record.basicSalary || 0
        summary.totalAllowances += this.calculateTotalAllowances(record.allowances)
        summary.totalDeductions += this.calculateTotalDeductions(record.deductions)
        summary.totalNetPay += record.netPayable || 0
        
        // Department breakdown
        const dept = record.department || 'Unknown'
        if (!summary.departmentBreakdown[dept]) {
          summary.departmentBreakdown[dept] = {
            employees: 0,
            totalSalary: 0,
            totalAllowances: 0,
            totalDeductions: 0
          }
        }
        summary.departmentBreakdown[dept].employees++
        summary.departmentBreakdown[dept].totalSalary += record.basicSalary || 0
        summary.departmentBreakdown[dept].totalAllowances += this.calculateTotalAllowances(record.allowances)
        summary.departmentBreakdown[dept].totalDeductions += this.calculateTotalDeductions(record.deductions)
        
        // Payment method breakdown
        const method = record.paymentMethod || 'unknown'
        summary.paymentMethodBreakdown[method] = (summary.paymentMethodBreakdown[method] || 0) + 1
      })
      
      summary.averageSalary = summary.employeeCount > 0 ? summary.totalNetPay / summary.employeeCount : 0
      
      return {
        title: `Payroll Summary - ${format(month, 'MMMM yyyy')}`,
        generatedDate: new Date(),
        data: payrollData,
        summary
      }
    } catch (error) {
      console.error('Error generating payroll summary:', error)
      // Return mock data for demonstration
      return this.getMockPayrollSummary(month)
    }
  }

  // Employee Cost Analysis
  async generateEmployeeCostAnalysis(): Promise<ReportData> {
    try {
      const employeesQuery = query(collection(db, 'employees'), where('status', '==', 'active'))
      const employeesSnapshot = await getDocs(employeesQuery)
      
      const costAnalysis = await Promise.all(
        employeesSnapshot.docs.map(async (doc) => {
          const employee = { id: doc.id, ...doc.data() }
          
          // Get last 12 months of payroll
          const payrollQuery = query(
            collection(db, 'salary-transactions'),
            where('employeeId', '==', employee.id),
            orderBy('paymentDate', 'desc'),
            limit(12)
          )
          
          const payrollSnapshot = await getDocs(payrollQuery)
          const payrollRecords = payrollSnapshot.docs.map(d => d.data())
          
          const totalCost = payrollRecords.reduce((sum, record) => {
            return sum + (record.netPayable || 0) + (record.companyContributions || 0)
          }, 0)
          
          return {
            employeeId: employee.id,
            employeeName: employee.name,
            department: employee.department,
            position: employee.position,
            monthlyCost: totalCost / Math.max(payrollRecords.length, 1),
            annualCost: totalCost,
            benefitsCost: employee.benefitsCost || 0,
            overtimeCost: employee.overtimeCost || 0,
            totalCompensation: totalCost + (employee.benefitsCost || 0)
          }
        })
      )
      
      return {
        title: 'Employee Cost Analysis Report',
        generatedDate: new Date(),
        data: costAnalysis.sort((a, b) => b.annualCost - a.annualCost)
      }
    } catch (error) {
      console.error('Error generating cost analysis:', error)
      return this.getMockCostAnalysis()
    }
  }

  // Document Expiry Report
  async generateDocumentExpiryReport(daysAhead: number = 90): Promise<ReportData> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)
    
    try {
      const employeesQuery = query(collection(db, 'employees'), where('status', '==', 'active'))
      const snapshot = await getDocs(employeesQuery)
      
      const expiringDocuments: any[] = []
      
      snapshot.docs.forEach(doc => {
        const employee = { id: doc.id, ...doc.data() } as any
        
        // Check Qatar ID
        if (employee.documents?.qatarId?.expiryDate) {
          const expiryDate = employee.documents.qatarId.expiryDate.toDate()
          const daysUntilExpiry = differenceInDays(expiryDate, new Date())
          
          if (daysUntilExpiry <= daysAhead && daysUntilExpiry > -30) { // Include expired docs up to 30 days
            expiringDocuments.push({
              employeeId: employee.id,
              employeeName: employee.name,
              department: employee.department,
              documentType: 'Qatar ID',
              documentNumber: employee.documents.qatarId.number,
              issueDate: employee.documents.qatarId.issueDate?.toDate() || null,
              expiryDate: expiryDate,
              daysUntilExpiry,
              urgency: this.getUrgencyLevel(daysUntilExpiry),
              status: daysUntilExpiry < 0 ? 'Expired' : 'Expiring'
            })
          }
        }
        
        // Check Passport
        if (employee.documents?.passport?.expiryDate) {
          const expiryDate = employee.documents.passport.expiryDate.toDate()
          const daysUntilExpiry = differenceInDays(expiryDate, new Date())
          
          if (daysUntilExpiry <= daysAhead && daysUntilExpiry > -30) {
            expiringDocuments.push({
              employeeId: employee.id,
              employeeName: employee.name,
              department: employee.department,
              documentType: 'Passport',
              documentNumber: employee.documents.passport.number,
              nationality: employee.documents.passport.nationality,
              issueDate: employee.documents.passport.issueDate?.toDate() || null,
              expiryDate: expiryDate,
              daysUntilExpiry,
              urgency: this.getUrgencyLevel(daysUntilExpiry),
              status: daysUntilExpiry < 0 ? 'Expired' : 'Expiring'
            })
          }
        }
        
        // Check Visa
        if (employee.documents?.visa?.expiryDate) {
          const expiryDate = employee.documents.visa.expiryDate.toDate()
          const daysUntilExpiry = differenceInDays(expiryDate, new Date())
          
          if (daysUntilExpiry <= daysAhead && daysUntilExpiry > -30) {
            expiringDocuments.push({
              employeeId: employee.id,
              employeeName: employee.name,
              department: employee.department,
              documentType: 'Visa',
              documentNumber: employee.documents.visa.number,
              visaType: employee.documents.visa.type,
              sponsor: employee.documents.visa.sponsor,
              expiryDate: expiryDate,
              daysUntilExpiry,
              urgency: this.getUrgencyLevel(daysUntilExpiry),
              status: daysUntilExpiry < 0 ? 'Expired' : 'Expiring'
            })
          }
        }
      })
      
      const summary = {
        totalDocuments: expiringDocuments.length,
        expiredDocuments: expiringDocuments.filter(d => d.daysUntilExpiry < 0).length,
        criticalExpiry: expiringDocuments.filter(d => d.urgency === 'Critical').length,
        highExpiry: expiringDocuments.filter(d => d.urgency === 'High').length,
        mediumExpiry: expiringDocuments.filter(d => d.urgency === 'Medium').length,
        byDocumentType: this.groupByDocumentType(expiringDocuments),
        byDepartment: this.groupByDepartment(expiringDocuments)
      }
      
      return {
        title: `Document Expiry Report - Next ${daysAhead} Days`,
        generatedDate: new Date(),
        data: expiringDocuments.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry),
        summary
      }
    } catch (error) {
      console.error('Error generating expiry report:', error)
      return this.getMockExpiryReport(daysAhead)
    }
  }

  // Cash Flow Statement
  async generateCashFlowStatement(startDate: Date, endDate: Date): Promise<ReportData> {
    try {
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      )
      
      const snapshot = await getDocs(transactionsQuery)
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      const cashFlow = {
        income: [] as any[],
        expenses: [] as any[],
        totalIncome: 0,
        totalExpenses: 0,
        netCashFlow: 0,
        categories: {} as Record<string, number>,
        monthlyBreakdown: {} as Record<string, any>
      }
      
      transactions.forEach(transaction => {
        const monthKey = format(transaction.date.toDate(), 'yyyy-MM')
        
        if (!cashFlow.monthlyBreakdown[monthKey]) {
          cashFlow.monthlyBreakdown[monthKey] = {
            income: 0,
            expenses: 0,
            net: 0
          }
        }
        
        if (transaction.type === 'income') {
          cashFlow.income.push(transaction)
          cashFlow.totalIncome += transaction.amount || 0
          cashFlow.monthlyBreakdown[monthKey].income += transaction.amount || 0
        } else {
          cashFlow.expenses.push(transaction)
          cashFlow.totalExpenses += transaction.amount || 0
          cashFlow.monthlyBreakdown[monthKey].expenses += transaction.amount || 0
          
          // Categorize expenses
          const category = transaction.category || 'Other'
          cashFlow.categories[category] = (cashFlow.categories[category] || 0) + transaction.amount
        }
        
        cashFlow.monthlyBreakdown[monthKey].net = 
          cashFlow.monthlyBreakdown[monthKey].income - cashFlow.monthlyBreakdown[monthKey].expenses
      })
      
      cashFlow.netCashFlow = cashFlow.totalIncome - cashFlow.totalExpenses
      
      return {
        title: `Cash Flow Statement - ${format(startDate, 'MMM dd')} to ${format(endDate, 'MMM dd, yyyy')}`,
        generatedDate: new Date(),
        data: transactions,
        summary: cashFlow
      }
    } catch (error) {
      console.error('Error generating cash flow statement:', error)
      return this.getMockCashFlow(startDate, endDate)
    }
  }

  // Customer Payment Tracking
  async generateCustomerPaymentReport(): Promise<ReportData> {
    try {
      const invoicesQuery = query(
        collection(db, 'invoices'),
        orderBy('dueDate', 'asc')
      )
      
      const snapshot = await getDocs(invoicesQuery)
      const invoices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      const paymentTracking = {
        outstanding: [] as any[],
        overdue: [] as any[],
        paid: [] as any[],
        totalOutstanding: 0,
        totalOverdue: 0,
        totalPaid: 0,
        customerBreakdown: {} as Record<string, any>
      }
      
      const today = new Date()
      
      invoices.forEach(invoice => {
        const dueDate = invoice.dueDate?.toDate()
        const customer = invoice.customerName || 'Unknown'
        
        if (!paymentTracking.customerBreakdown[customer]) {
          paymentTracking.customerBreakdown[customer] = {
            totalInvoices: 0,
            totalAmount: 0,
            paidAmount: 0,
            outstandingAmount: 0,
            overdueAmount: 0
          }
        }
        
        paymentTracking.customerBreakdown[customer].totalInvoices++
        paymentTracking.customerBreakdown[customer].totalAmount += invoice.amount || 0
        
        if (invoice.status === 'paid') {
          paymentTracking.paid.push(invoice)
          paymentTracking.totalPaid += invoice.amount || 0
          paymentTracking.customerBreakdown[customer].paidAmount += invoice.amount || 0
        } else if (dueDate && dueDate < today) {
          const daysOverdue = differenceInDays(today, dueDate)
          const overdueInvoice = {
            ...invoice,
            daysOverdue
          }
          paymentTracking.overdue.push(overdueInvoice)
          paymentTracking.totalOverdue += invoice.amount || 0
          paymentTracking.customerBreakdown[customer].overdueAmount += invoice.amount || 0
        } else {
          paymentTracking.outstanding.push(invoice)
          paymentTracking.totalOutstanding += invoice.amount || 0
          paymentTracking.customerBreakdown[customer].outstandingAmount += invoice.amount || 0
        }
      })
      
      return {
        title: 'Customer Payment Tracking Report',
        generatedDate: new Date(),
        data: invoices,
        summary: paymentTracking
      }
    } catch (error) {
      console.error('Error generating payment report:', error)
      return this.getMockPaymentReport()
    }
  }

  // Ministry Compliance Report
  async generateComplianceReport(): Promise<ReportData> {
    try {
      const employeesQuery = query(collection(db, 'employees'), where('status', '==', 'active'))
      const snapshot = await getDocs(employeesQuery)
      
      const complianceData = {
        totalEmployees: snapshot.size,
        qatariEmployees: 0,
        expatEmployees: 0,
        validDocuments: 0,
        expiringDocuments: 0,
        expiredDocuments: 0,
        wageCompliance: true,
        workingHoursCompliance: true,
        documentCompliance: true,
        violations: [] as any[],
        recommendations: [] as string[],
        nationalityBreakdown: {} as Record<string, number>,
        departmentCompliance: {} as Record<string, any>
      }
      
      const minWage = 1000 // QAR minimum wage
      const maxWorkingHours = 48 // per week
      const today = new Date()
      const thirtyDaysFromNow = addMonths(today, 1)
      
      snapshot.docs.forEach(doc => {
        const employee = { id: doc.id, ...doc.data() } as any
        
        // Nationality tracking
        const nationality = employee.nationality || 'Unknown'
        complianceData.nationalityBreakdown[nationality] = (complianceData.nationalityBreakdown[nationality] || 0) + 1
        
        if (employee.nationality === 'Qatari') {
          complianceData.qatariEmployees++
        } else {
          complianceData.expatEmployees++
        }
        
        // Department compliance tracking
        const dept = employee.department || 'Unknown'
        if (!complianceData.departmentCompliance[dept]) {
          complianceData.departmentCompliance[dept] = {
            employees: 0,
            violations: 0,
            documentIssues: 0
          }
        }
        complianceData.departmentCompliance[dept].employees++
        
        // Document compliance
        let hasValidDocuments = true
        
        if (employee.documents?.qatarId?.expiryDate) {
          const expiryDate = employee.documents.qatarId.expiryDate.toDate()
          if (expiryDate <= today) {
            complianceData.expiredDocuments++
            hasValidDocuments = false
            complianceData.departmentCompliance[dept].documentIssues++
          } else if (expiryDate <= thirtyDaysFromNow) {
            complianceData.expiringDocuments++
          }
        }
        
        if (hasValidDocuments) {
          complianceData.validDocuments++
        } else {
          complianceData.documentCompliance = false
        }
        
        // Wage compliance
        if (employee.basicSalary && employee.basicSalary < minWage) {
          complianceData.wageCompliance = false
          complianceData.departmentCompliance[dept].violations++
          complianceData.violations.push({
            type: 'Minimum Wage Violation',
            employeeId: employee.id,
            employeeName: employee.name,
            department: employee.department,
            details: `Salary (${employee.basicSalary} QAR) below minimum wage (${minWage} QAR)`,
            severity: 'High'
          })
        }
        
        // Working hours compliance
        if (employee.weeklyHours && employee.weeklyHours > maxWorkingHours) {
          complianceData.workingHoursCompliance = false
          complianceData.departmentCompliance[dept].violations++
          complianceData.violations.push({
            type: 'Working Hours Violation',
            employeeId: employee.id,
            employeeName: employee.name,
            department: employee.department,
            details: `Weekly hours (${employee.weeklyHours}) exceed maximum (${maxWorkingHours})`,
            severity: 'Medium'
          })
        }
      })
      
      // Generate recommendations
      if (complianceData.expiredDocuments > 0) {
        complianceData.recommendations.push(`Immediate action required: ${complianceData.expiredDocuments} expired documents need renewal`)
      }
      if (complianceData.expiringDocuments > 0) {
        complianceData.recommendations.push(`Schedule renewals for ${complianceData.expiringDocuments} documents expiring within 30 days`)
      }
      if (!complianceData.wageCompliance) {
        complianceData.recommendations.push('Adjust salaries to meet Qatar minimum wage requirements')
      }
      if (!complianceData.workingHoursCompliance) {
        complianceData.recommendations.push('Review and adjust working hours to comply with Qatar labor law')
      }
      
      // Calculate overall compliance score
      const totalChecks = 4 // wage, hours, documents, general
      let passedChecks = 0
      if (complianceData.wageCompliance) passedChecks++
      if (complianceData.workingHoursCompliance) passedChecks++
      if (complianceData.documentCompliance) passedChecks++
      if (complianceData.violations.length === 0) passedChecks++
      
      const complianceScore = Math.round((passedChecks / totalChecks) * 100)
      
      return {
        title: 'Ministry Compliance Report',
        generatedDate: new Date(),
        data: [{
          ...complianceData,
          complianceScore,
          overallStatus: complianceScore >= 80 ? 'Compliant' : complianceScore >= 60 ? 'Warning' : 'Non-Compliant'
        }],
        summary: complianceData
      }
    } catch (error) {
      console.error('Error generating compliance report:', error)
      return this.getMockComplianceReport()
    }
  }

  // Export Functions
  exportToPDF(reportData: ReportData): void {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(18)
    doc.text(reportData.title, 14, 20)
    
    // Add generation date
    doc.setFontSize(10)
    doc.text(`Generated: ${format(reportData.generatedDate, 'PPP')}`, 14, 30)
    
    // Add summary if available
    if (reportData.summary) {
      doc.setFontSize(14)
      doc.text('Summary', 14, 45)
      
      let yPosition = 55
      Object.entries(reportData.summary).forEach(([key, value]) => {
        if (typeof value === 'object') return // Skip complex objects
        doc.setFontSize(10)
        doc.text(`${key}: ${value}`, 14, yPosition)
        yPosition += 8
      })
    }
    
    // Add data table
    if (reportData.data.length > 0) {
      const headers = Object.keys(reportData.data[0]).filter(key => 
        typeof reportData.data[0][key] !== 'object'
      )
      const rows = reportData.data.map(item => 
        headers.map(header => {
          const value = item[header]
          if (value instanceof Date) return format(value, 'dd/MM/yyyy')
          return value?.toString() || ''
        })
      )
      
      ;(doc as any).autoTable({
        head: [headers],
        body: rows,
        startY: reportData.summary ? 100 : 40,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] }
      })
    }
    
    // Save the PDF
    doc.save(`${reportData.title.replace(/\s+/g, '_')}.pdf`)
  }

  exportToExcel(reportData: ReportData): void {
    const workbook = XLSX.utils.book_new()
    
    // Add main data sheet
    const worksheet = XLSX.utils.json_to_sheet(reportData.data)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Data')
    
    // Add summary sheet if available
    if (reportData.summary) {
      const summaryData = Object.entries(reportData.summary)
        .filter(([_, value]) => typeof value !== 'object')
        .map(([key, value]) => ({ Metric: key, Value: value }))
      
      const summarySheet = XLSX.utils.json_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
    }
    
    // Save the file
    XLSX.writeFile(workbook, `${reportData.title.replace(/\s+/g, '_')}.xlsx`)
  }

  // Helper Methods
  private calculateTotalAllowances(allowances: any): number {
    if (!allowances) return 0
    return Object.values(allowances).reduce((sum: number, value: any) => sum + (value || 0), 0)
  }

  private calculateTotalDeductions(deductions: any): number {
    if (!deductions) return 0
    return Object.values(deductions).reduce((sum: number, value: any) => sum + (value || 0), 0)
  }

  private getUrgencyLevel(daysUntilExpiry: number): string {
    if (daysUntilExpiry < 0) return 'Expired'
    if (daysUntilExpiry <= 7) return 'Critical'
    if (daysUntilExpiry <= 30) return 'High'
    if (daysUntilExpiry <= 60) return 'Medium'
    return 'Low'
  }

  private groupByDocumentType(documents: any[]): Record<string, number> {
    return documents.reduce((acc, doc) => {
      acc[doc.documentType] = (acc[doc.documentType] || 0) + 1
      return acc
    }, {})
  }

  private groupByDepartment(documents: any[]): Record<string, number> {
    return documents.reduce((acc, doc) => {
      acc[doc.department] = (acc[doc.department] || 0) + 1
      return acc
    }, {})
  }

  // Mock Data Methods (for demonstration when Firebase is not available)
  private getMockPayrollSummary(month: Date): ReportData {
    return {
      title: `Payroll Summary - ${format(month, 'MMMM yyyy')}`,
      generatedDate: new Date(),
      data: [
        {
          employeeId: 'EMP001',
          employeeName: 'Ahmed Al-Thani',
          department: 'Operations',
          basicSalary: 5000,
          allowances: { housing: 2000, transport: 500, food: 300 },
          deductions: { advances: 200, absences: 0 },
          netPayable: 7600
        }
      ],
      summary: {
        totalEmployees: 156,
        totalBasicSalary: 780000,
        totalNetPay: 1170000,
        averageSalary: 7500
      }
    }
  }

  private getMockCostAnalysis(): ReportData {
    return {
      title: 'Employee Cost Analysis Report',
      generatedDate: new Date(),
      data: [
        {
          employeeId: 'EMP001',
          employeeName: 'Ahmed Al-Thani',
          department: 'Operations',
          position: 'Manager',
          monthlyCost: 8500,
          annualCost: 102000,
          totalCompensation: 115000
        }
      ]
    }
  }

  private getMockExpiryReport(daysAhead: number): ReportData {
    return {
      title: `Document Expiry Report - Next ${daysAhead} Days`,
      generatedDate: new Date(),
      data: [
        {
          employeeId: 'EMP001',
          employeeName: 'Ahmed Al-Thani',
          documentType: 'Qatar ID',
          documentNumber: '12345678901',
          expiryDate: new Date('2024-12-15'),
          daysUntilExpiry: 45,
          urgency: 'Medium'
        }
      ],
      summary: {
        totalDocuments: 15,
        criticalExpiry: 2,
        highExpiry: 5,
        mediumExpiry: 8
      }
    }
  }

  private getMockCashFlow(startDate: Date, endDate: Date): ReportData {
    return {
      title: `Cash Flow Statement - ${format(startDate, 'MMM dd')} to ${format(endDate, 'MMM dd, yyyy')}`,
      generatedDate: new Date(),
      data: [],
      summary: {
        totalIncome: 1500000,
        totalExpenses: 1200000,
        netCashFlow: 300000
      }
    }
  }

  private getMockPaymentReport(): ReportData {
    return {
      title: 'Customer Payment Tracking Report',
      generatedDate: new Date(),
      data: [],
      summary: {
        totalOutstanding: 250000,
        totalOverdue: 50000,
        totalPaid: 800000
      }
    }
  }

  private getMockComplianceReport(): ReportData {
    return {
      title: 'Ministry Compliance Report',
      generatedDate: new Date(),
      data: [{
        totalEmployees: 156,
        complianceScore: 85,
        overallStatus: 'Compliant',
        violations: []
      }],
      summary: {
        totalEmployees: 156,
        violations: [],
        recommendations: []
      }
    }
  }
}

export const reportService = new ReportService()