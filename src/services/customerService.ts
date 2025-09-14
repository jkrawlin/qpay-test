import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { differenceInDays, addMonths } from 'date-fns'

export interface Customer {
  id?: string
  companyName: string
  businessType: string
  tradeLicenseNumber: string
  tradeLicenseExpiry: Date
  contactPersonName: string
  contactPersonPosition: string
  email: string
  phone: string
  address: string
  contractType: string
  contractStatus: string
  contractStartDate?: Date
  contractEndDate?: Date
  creditLimit: number
  paymentTerms: number
  vatNumber?: string
  vatStatus: 'registered' | 'not-registered' | 'exempt'
  isQatarResident: boolean
  requiresCompliance: boolean
  status: 'active' | 'inactive' | 'suspended'
  totalRevenue: number
  outstandingBalance: number
  lastPaymentDate?: Date
  notes?: string
  tags?: string[]
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  updatedAt: Date
}

export interface Contract {
  id?: string
  customerId: string
  contractNumber: string
  contractType: string
  description: string
  startDate: Date
  endDate: Date
  value: number
  currency: string
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'under-review'
  renewalTerms?: string
  paymentSchedule: string
  deliverables: string[]
  terms: string
  signedDate?: Date
  signedBy?: string
  attachments?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CustomerStatistics {
  totalCustomers: number
  activeCustomers: number
  inactiveCustomers: number
  suspendedCustomers: number
  totalRevenue: number
  averageRevenue: number
  outstandingPayments: number
  expiringLicenses: number
  expiringContracts: number
  complianceIssues: number
  departmentBreakdown: Record<string, number>
  monthlyGrowth: number
}

export interface LicenseAlert {
  customerId: string
  customerName: string
  tradeLicenseNumber: string
  expiryDate: Date
  daysUntilExpiry: number
  urgency: 'critical' | 'high' | 'medium' | 'low'
  recommendedAction: string
}

export class CustomerService {
  private customersCollection = collection(db, 'customers')
  private contractsCollection = collection(db, 'contracts')

  // Customer CRUD Operations
  async getAllCustomers(): Promise<Customer[]> {
    try {
      const q = query(this.customersCollection, orderBy('companyName', 'asc'))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tradeLicenseExpiry: doc.data().tradeLicenseExpiry?.toDate(),
        contractStartDate: doc.data().contractStartDate?.toDate(),
        contractEndDate: doc.data().contractEndDate?.toDate(),
        lastPaymentDate: doc.data().lastPaymentDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Customer[]
    } catch (error) {
      console.error('Error fetching customers:', error)
      return this.getMockCustomers()
    }
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const docRef = doc(this.customersCollection, id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          tradeLicenseExpiry: data.tradeLicenseExpiry?.toDate(),
          contractStartDate: data.contractStartDate?.toDate(),
          contractEndDate: data.contractEndDate?.toDate(),
          lastPaymentDate: data.lastPaymentDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Customer
      }
      return null
    } catch (error) {
      console.error('Error fetching customer:', error)
      return null
    }
  }

  async createCustomer(customerData: Omit<Customer, 'id'>): Promise<string | null> {
    try {
      // Validate required fields
      this.validateCustomerData(customerData)
      
      // Check for duplicate trade license
      const isDuplicate = await this.checkDuplicateTradeLicense(customerData.tradeLicenseNumber)
      if (isDuplicate) {
        throw new Error('Trade license number already exists')
      }

      // Prepare data for Firestore
      const firestoreData = {
        ...customerData,
        tradeLicenseExpiry: Timestamp.fromDate(customerData.tradeLicenseExpiry),
        contractStartDate: customerData.contractStartDate ? 
          Timestamp.fromDate(customerData.contractStartDate) : null,
        contractEndDate: customerData.contractEndDate ? 
          Timestamp.fromDate(customerData.contractEndDate) : null,
        lastPaymentDate: customerData.lastPaymentDate ? 
          Timestamp.fromDate(customerData.lastPaymentDate) : null,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        totalRevenue: 0,
        outstandingBalance: 0,
        priority: 'medium',
        tags: []
      }

      const docRef = await addDoc(this.customersCollection, firestoreData)
      return docRef.id
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<void> {
    try {
      // Prepare data for Firestore
      const firestoreData: any = {
        ...customerData,
        updatedAt: Timestamp.fromDate(new Date())
      }

      // Convert dates to Timestamps
      if (customerData.tradeLicenseExpiry) {
        firestoreData.tradeLicenseExpiry = Timestamp.fromDate(customerData.tradeLicenseExpiry)
      }
      if (customerData.contractStartDate) {
        firestoreData.contractStartDate = Timestamp.fromDate(customerData.contractStartDate)
      }
      if (customerData.contractEndDate) {
        firestoreData.contractEndDate = Timestamp.fromDate(customerData.contractEndDate)
      }
      if (customerData.lastPaymentDate) {
        firestoreData.lastPaymentDate = Timestamp.fromDate(customerData.lastPaymentDate)
      }

      const docRef = doc(this.customersCollection, id)
      await updateDoc(docRef, firestoreData)
    } catch (error) {
      console.error('Error updating customer:', error)
      throw error
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      // Check if customer has active contracts
      const activeContracts = await this.getCustomerContracts(id, 'active')
      if (activeContracts.length > 0) {
        throw new Error('Cannot delete customer with active contracts')
      }

      const docRef = doc(this.customersCollection, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error deleting customer:', error)
      throw error
    }
  }

  // Contract Management
  async getCustomerContracts(customerId: string, status?: string): Promise<Contract[]> {
    try {
      let q = query(this.contractsCollection, where('customerId', '==', customerId))
      
      if (status) {
        q = query(q, where('status', '==', status))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
        signedDate: doc.data().signedDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Contract[]
    } catch (error) {
      console.error('Error fetching contracts:', error)
      return []
    }
  }

  async createContract(contractData: Omit<Contract, 'id'>): Promise<string | null> {
    try {
      const firestoreData = {
        ...contractData,
        startDate: Timestamp.fromDate(contractData.startDate),
        endDate: Timestamp.fromDate(contractData.endDate),
        signedDate: contractData.signedDate ? 
          Timestamp.fromDate(contractData.signedDate) : null,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      }

      const docRef = await addDoc(this.contractsCollection, firestoreData)
      return docRef.id
    } catch (error) {
      console.error('Error creating contract:', error)
      throw error
    }
  }

  // License Management
  async getLicenseAlerts(daysAhead: number = 90): Promise<LicenseAlert[]> {
    try {
      const customers = await this.getAllCustomers()
      const alerts: LicenseAlert[] = []
      const today = new Date()
      
      customers.forEach(customer => {
        if (customer.tradeLicenseExpiry) {
          const daysUntilExpiry = differenceInDays(customer.tradeLicenseExpiry, today)
          
          if (daysUntilExpiry <= daysAhead && daysUntilExpiry > -30) {
            alerts.push({
              customerId: customer.id!,
              customerName: customer.companyName,
              tradeLicenseNumber: customer.tradeLicenseNumber,
              expiryDate: customer.tradeLicenseExpiry,
              daysUntilExpiry,
              urgency: this.getUrgencyLevel(daysUntilExpiry),
              recommendedAction: this.getRecommendedAction(daysUntilExpiry)
            })
          }
        }
      })

      return alerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
    } catch (error) {
      console.error('Error getting license alerts:', error)
      return []
    }
  }

  async renewTradeLicense(customerId: string, newExpiryDate: Date): Promise<void> {
    try {
      await this.updateCustomer(customerId, {
        tradeLicenseExpiry: newExpiryDate,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error renewing trade license:', error)
      throw error
    }
  }

  // Qatar Compliance
  async validateQatarCompliance(customer: Customer): Promise<{
    isCompliant: boolean
    issues: string[]
    recommendations: string[]
  }> {
    const issues: string[] = []
    const recommendations: string[] = []

    // Check trade license validity
    const daysUntilExpiry = differenceInDays(customer.tradeLicenseExpiry, new Date())
    if (daysUntilExpiry < 0) {
      issues.push('Trade license has expired')
      recommendations.push('Immediately renew trade license')
    } else if (daysUntilExpiry <= 30) {
      issues.push('Trade license expiring soon')
      recommendations.push('Schedule trade license renewal')
    }

    // Check VAT compliance
    if (customer.vatStatus === 'registered' && !customer.vatNumber) {
      issues.push('VAT number missing despite registered status')
      recommendations.push('Update VAT registration number')
    }

    // Check contract validity
    if (customer.contractEndDate && differenceInDays(customer.contractEndDate, new Date()) < 0) {
      issues.push('Contract has expired')
      recommendations.push('Renew or update contract terms')
    }

    // Check payment compliance
    if (customer.outstandingBalance > customer.creditLimit) {
      issues.push('Outstanding balance exceeds credit limit')
      recommendations.push('Follow up on overdue payments')
    }

    return {
      isCompliant: issues.length === 0,
      issues,
      recommendations
    }
  }

  // Statistics and Analytics
  async getCustomerStatistics(): Promise<CustomerStatistics> {
    try {
      const customers = await this.getAllCustomers()
      const today = new Date()
      const oneMonthAgo = addMonths(today, -1)

      const stats: CustomerStatistics = {
        totalCustomers: customers.length,
        activeCustomers: customers.filter(c => c.status === 'active').length,
        inactiveCustomers: customers.filter(c => c.status === 'inactive').length,
        suspendedCustomers: customers.filter(c => c.status === 'suspended').length,
        totalRevenue: customers.reduce((sum, c) => sum + c.totalRevenue, 0),
        averageRevenue: 0,
        outstandingPayments: customers.reduce((sum, c) => sum + c.outstandingBalance, 0),
        expiringLicenses: 0,
        expiringContracts: 0,
        complianceIssues: 0,
        departmentBreakdown: {},
        monthlyGrowth: 0
      }

      // Calculate averages
      stats.averageRevenue = stats.totalCustomers > 0 ? stats.totalRevenue / stats.totalCustomers : 0

      // Count expiring licenses (next 90 days)
      stats.expiringLicenses = customers.filter(c => {
        if (!c.tradeLicenseExpiry) return false
        const daysUntilExpiry = differenceInDays(c.tradeLicenseExpiry, today)
        return daysUntilExpiry <= 90 && daysUntilExpiry > 0
      }).length

      // Count expiring contracts
      stats.expiringContracts = customers.filter(c => {
        if (!c.contractEndDate) return false
        const daysUntilExpiry = differenceInDays(c.contractEndDate, today)
        return daysUntilExpiry <= 90 && daysUntilExpiry > 0
      }).length

      // Count compliance issues
      for (const customer of customers) {
        const compliance = await this.validateQatarCompliance(customer)
        if (!compliance.isCompliant) {
          stats.complianceIssues++
        }
      }

      // Department breakdown
      customers.forEach(customer => {
        const dept = customer.businessType || 'Unknown'
        stats.departmentBreakdown[dept] = (stats.departmentBreakdown[dept] || 0) + 1
      })

      // Calculate monthly growth
      const newCustomersThisMonth = customers.filter(c => 
        c.createdAt >= oneMonthAgo
      ).length
      stats.monthlyGrowth = newCustomersThisMonth

      return stats
    } catch (error) {
      console.error('Error getting customer statistics:', error)
      return this.getMockStatistics()
    }
  }

  // Search and Filtering
  async searchCustomers(query: string): Promise<Customer[]> {
    try {
      const customers = await this.getAllCustomers()
      const searchTerm = query.toLowerCase()
      
      return customers.filter(customer =>
        customer.companyName.toLowerCase().includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm) ||
        customer.tradeLicenseNumber.toLowerCase().includes(searchTerm) ||
        customer.contactPersonName.toLowerCase().includes(searchTerm)
      )
    } catch (error) {
      console.error('Error searching customers:', error)
      return []
    }
  }

  async getCustomersByStatus(status: string): Promise<Customer[]> {
    try {
      const q = query(this.customersCollection, where('status', '==', status))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        tradeLicenseExpiry: doc.data().tradeLicenseExpiry?.toDate(),
        contractStartDate: doc.data().contractStartDate?.toDate(),
        contractEndDate: doc.data().contractEndDate?.toDate(),
        lastPaymentDate: doc.data().lastPaymentDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Customer[]
    } catch (error) {
      console.error('Error fetching customers by status:', error)
      return []
    }
  }

  // Helper Methods
  private validateCustomerData(customerData: Omit<Customer, 'id'>): void {
    if (!customerData.companyName?.trim()) {
      throw new Error('Company name is required')
    }
    if (!customerData.tradeLicenseNumber?.trim()) {
      throw new Error('Trade license number is required')
    }
    if (!customerData.email?.trim()) {
      throw new Error('Email is required')
    }
    if (!customerData.phone?.trim()) {
      throw new Error('Phone number is required')
    }
    if (!customerData.tradeLicenseExpiry) {
      throw new Error('Trade license expiry date is required')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerData.email)) {
      throw new Error('Invalid email format')
    }

    // Validate trade license expiry is not in the past
    if (customerData.tradeLicenseExpiry <= new Date()) {
      throw new Error('Trade license expiry date must be in the future')
    }
  }

  private async checkDuplicateTradeLicense(licenseNumber: string, excludeId?: string): Promise<boolean> {
    try {
      const q = query(this.customersCollection, where('tradeLicenseNumber', '==', licenseNumber))
      const snapshot = await getDocs(q)
      
      if (excludeId) {
        return snapshot.docs.some(doc => doc.id !== excludeId)
      }
      
      return !snapshot.empty
    } catch (error) {
      console.error('Error checking duplicate trade license:', error)
      return false
    }
  }

  private getUrgencyLevel(daysUntilExpiry: number): 'critical' | 'high' | 'medium' | 'low' {
    if (daysUntilExpiry < 0) return 'critical'
    if (daysUntilExpiry <= 7) return 'critical'
    if (daysUntilExpiry <= 30) return 'high'
    if (daysUntilExpiry <= 60) return 'medium'
    return 'low'
  }

  private getRecommendedAction(daysUntilExpiry: number): string {
    if (daysUntilExpiry < 0) return 'License expired - immediate renewal required'
    if (daysUntilExpiry <= 7) return 'Urgent - renew within 7 days'
    if (daysUntilExpiry <= 30) return 'Schedule renewal appointment'
    if (daysUntilExpiry <= 60) return 'Prepare renewal documentation'
    return 'Monitor expiry date'
  }

  // Mock Data for Development
  private getMockCustomers(): Customer[] {
    return [
      {
        id: 'CUST-001',
        companyName: 'Qatar National Industries',
        businessType: 'Manufacturing',
        tradeLicenseNumber: 'TL-2024-001',
        tradeLicenseExpiry: new Date('2024-12-31'),
        contactPersonName: 'Ahmed Al-Thani',
        contactPersonPosition: 'General Manager',
        email: 'ahmed@qni.qa',
        phone: '+974 4444 1234',
        address: 'Industrial Area, Doha, Qatar',
        contractType: 'Annual Service Contract',
        contractStatus: 'Active',
        contractStartDate: new Date('2024-01-01'),
        contractEndDate: new Date('2024-12-31'),
        creditLimit: 100000,
        paymentTerms: 30,
        vatNumber: 'VAT-QA-123456789',
        vatStatus: 'registered',
        isQatarResident: true,
        requiresCompliance: true,
        status: 'active',
        totalRevenue: 250000,
        outstandingBalance: 15000,
        lastPaymentDate: new Date('2024-10-15'),
        priority: 'high',
        tags: ['VIP', 'Manufacturing'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      },
      {
        id: 'CUST-002',
        companyName: 'Doha Trading Company',
        businessType: 'Trading',
        tradeLicenseNumber: 'TL-2024-002',
        tradeLicenseExpiry: new Date('2024-11-15'),
        contactPersonName: 'Sarah Mohammed',
        contactPersonPosition: 'Operations Director',
        email: 'sarah@dohatrading.qa',
        phone: '+974 4444 5678',
        address: 'West Bay, Doha, Qatar',
        contractType: 'Project-Based Contract',
        contractStatus: 'Active',
        contractStartDate: new Date('2024-02-01'),
        contractEndDate: new Date('2024-11-30'),
        creditLimit: 75000,
        paymentTerms: 15,
        vatNumber: '',
        vatStatus: 'not-registered',
        isQatarResident: true,
        requiresCompliance: true,
        status: 'active',
        totalRevenue: 150000,
        outstandingBalance: 8000,
        lastPaymentDate: new Date('2024-10-20'),
        priority: 'medium',
        tags: ['Trading', 'B2B'],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date()
      }
    ]
  }

  private getMockStatistics(): CustomerStatistics {
    return {
      totalCustomers: 156,
      activeCustomers: 142,
      inactiveCustomers: 10,
      suspendedCustomers: 4,
      totalRevenue: 2500000,
      averageRevenue: 16025,
      outstandingPayments: 125000,
      expiringLicenses: 8,
      expiringContracts: 12,
      complianceIssues: 3,
      departmentBreakdown: {
        'Manufacturing': 45,
        'Trading': 38,
        'Services': 32,
        'Construction': 28,
        'Technology': 13
      },
      monthlyGrowth: 12
    }
  }
}

export const customerService = new CustomerService()