// Firestore removed: this module now provides an in-memory stub implementation
// preserving the asynchronous API shape used throughout the app so that we can
// progressively reintroduce Firestore collection by collection in later phases.
import { COLLECTIONS, generateId } from '@/firebase/config'

// Minimal placeholder types to satisfy existing signatures
export type QueryConstraint = any
export type Unsubscribe = () => void
export type DocumentSnapshot = any

// Base interface for all documents
export interface BaseDocument {
  id: string
  createdAt: any
  updatedAt: any
  createdBy?: string
  updatedBy?: string
  companyId?: string
}

// Generic database service class
export class DatabaseService<T extends BaseDocument> {
  private collectionName: string

  constructor(collectionName: string) {
    this.collectionName = collectionName
  }

  // Get collection reference
  // In-memory storage map per collection
  private static memoryDB: Record<string, Record<string, any>> = {}

  private getCollectionStore() {
    if (!DatabaseService.memoryDB[this.collectionName]) {
      DatabaseService.memoryDB[this.collectionName] = {}
    }
    return DatabaseService.memoryDB[this.collectionName]
  }

  // Create a new document
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = generateId()
    const now = new Date().toISOString()
    const store = this.getCollectionStore()
    // Strip undefined values
    const sanitized: any = {}
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) sanitized[k] = v
    })
    store[id] = { id, ...sanitized, createdAt: now, updatedAt: now }
    return id
  }

  // Get a document by ID
  async getById(id: string): Promise<T | null> {
    const store = this.getCollectionStore()
    return store[id] ? { ...store[id] } as T : null
  }

  // Get all documents with optional constraints
  async getAll(_constraints: QueryConstraint[] = []): Promise<T[]> {
    const store = this.getCollectionStore()
    return Object.values(store).map(v => ({ ...v })) as T[]
  }

  // Update a document
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> {
    const store = this.getCollectionStore()
    if (!store[id]) throw new Error('Document not found')
    const sanitized: any = {}
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) sanitized[k] = v
    })
    store[id] = { ...store[id], ...sanitized, updatedAt: new Date().toISOString() }
  }

  // Delete a document
  async delete(id: string): Promise<void> {
    const store = this.getCollectionStore()
    delete store[id]
  }

  // Get documents with pagination
  async getPaginated(pageSize: number = 20, lastDoc?: DocumentSnapshot): Promise<{ docs: T[]; lastDoc: DocumentSnapshot | null }> {
    const all = await this.getAll()
    const startIndex = lastDoc ? all.findIndex(d => d.id === lastDoc.id) + 1 : 0
    const page = all.slice(startIndex, startIndex + pageSize)
    const newLast = page.length ? { id: page[page.length - 1].id } : null
    return { docs: page, lastDoc: newLast }
  }

  // Real-time listener for documents
  onSnapshot(callback: (docs: T[]) => void): Unsubscribe {
    // Immediately invoke with current state; return no-op unsubscribe.
    this.getAll().then(callback)
    return () => {}
  }

  // Real-time listener for a single document
  onDocSnapshot(id: string, callback: (doc: T | null) => void): Unsubscribe {
    this.getById(id).then(callback)
    return () => {}
  }

  // Batch operations
  async batchWrite(operations: Array<{ type: 'create' | 'update' | 'delete'; id?: string; data?: any }>): Promise<void> {
    for (const op of operations) {
      if (op.type === 'create') await this.create(op.data)
      if (op.type === 'update' && op.id) await this.update(op.id, op.data)
      if (op.type === 'delete' && op.id) await this.delete(op.id)
    }
  }

  // Search documents (requires composite indexes for complex queries)
  async search(field: string, value: any): Promise<T[]> {
    const all = await this.getAll()
    return all.filter((doc: any) => doc[field] === value)
  }

  // Count documents (approximate for large collections)
  async count(): Promise<number> {
    const docs = await this.getAll()
    return docs.length
  }
}

// Specific service instances for different collections
export const employeeService = new DatabaseService<Employee>(COLLECTIONS.EMPLOYEES)
export const customerService = new DatabaseService<Customer>(COLLECTIONS.CUSTOMERS)
export const payrollService = new DatabaseService<PayrollRecord>(COLLECTIONS.PAYROLL)
export const transactionService = new DatabaseService<Transaction>(COLLECTIONS.TRANSACTIONS)
export const documentService = new DatabaseService<Document>(COLLECTIONS.DOCUMENTS)
export const notificationService = new DatabaseService<Notification>(COLLECTIONS.NOTIFICATIONS)

// Type definitions for different document types
export interface Employee extends BaseDocument {
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  department: string
  salary: number
  hireDate: string
  status: 'active' | 'inactive' | 'terminated'
  type: 'permanent' | 'temporary' | 'contract'
  nationality: string
  qatarId?: string
  passportNumber?: string
  qatarIdDocumentUrl?: string
  passportDocumentUrl?: string
  visa?: {
    number: string
    expiryDate: string
    status: string
  }
  workPermit?: {
    number: string
    expiryDate: string
    status: string
  }
  address?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

export interface Customer extends BaseDocument {
  customerCode: string
  name: string
  email: string
  phone: string
  address: string
  contactPerson: string
  contractType: string
  status: 'active' | 'inactive'
  creditLimit?: number
  paymentTerms?: string
}

export interface PayrollRecord extends BaseDocument {
  employeeId: string
  payPeriod: string
  basicSalary: number
  allowances: number
  deductions: number
  overtime: number
  netSalary: number
  status: 'draft' | 'processed' | 'paid'
  paymentDate?: string
}

export interface Transaction extends BaseDocument {
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
  accountId?: string
  employeeId?: string
  customerId?: string
  reference?: string
  status: 'pending' | 'completed' | 'cancelled'
}

export interface Document extends BaseDocument {
  name: string
  type: string
  category: string
  employeeId?: string
  customerId?: string
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  expiryDate?: string
  status: 'active' | 'expired' | 'archived'
}

export interface Notification extends BaseDocument {
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  category: string
  userId?: string
  read: boolean
  actionUrl?: string
  metadata?: Record<string, any>
}

// Utility functions for common database operations
export const dbUtils = {
  // Placeholder utilities retained for compatibility; filtering done client side now.
  createTextSearchQuery: (_field: string, _searchTerm: string) => [],
  createPaginationQuery: (_pageSize: number, _orderField: string = 'createdAt') => [],
  createDateRangeQuery: (_field: string, _startDate: Date, _endDate: Date) => [],
  createCompanyFilter: (_companyId: string) => [],
  createUserFilter: (_userId: string) => [],
  orderByCreatedAt: [],
  orderByUpdatedAt: [],
  orderByName: []
}

export default DatabaseService