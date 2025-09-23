import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  type DocumentData,
  type QueryConstraint,
  type Unsubscribe,
  type DocumentSnapshot,
  type QuerySnapshot
} from 'firebase/firestore'
import { db, COLLECTIONS, formatFirebaseError } from '@/firebase/config'

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
  private getCollection() {
    return collection(db, this.collectionName)
  }

  // Get document reference
  private getDocRef(id: string) {
    return doc(db, this.collectionName, id)
  }

  // Create a new document
  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      // Firestore rejects fields explicitly set to undefined. Strip them out.
      const sanitized = Object.fromEntries(
        Object.entries(docData).filter(([, value]) => value !== undefined)
      )

      const docRef = await addDoc(this.getCollection(), sanitized)
      return docRef.id
    } catch (error) {
      throw new Error(formatFirebaseError(error))
    }
  }

  // Get a document by ID
  async getById(id: string): Promise<T | null> {
    try {
      const docRef = this.getDocRef(id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as T
      }
      
      return null
    } catch (error) {
      throw new Error(formatFirebaseError(error))
    }
  }

  // Get all documents with optional constraints
  async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const q = query(this.getCollection(), ...constraints)
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[]
    } catch (error) {
      throw new Error(formatFirebaseError(error))
    }
  }

  // Update a document
  async update(id: string, data: Partial<Omit<T, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = this.getDocRef(id)
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      }
      
      await updateDoc(docRef, updateData)
    } catch (error) {
      throw new Error(formatFirebaseError(error))
    }
  }

  // Delete a document
  async delete(id: string): Promise<void> {
    try {
      const docRef = this.getDocRef(id)
      await deleteDoc(docRef)
    } catch (error) {
      throw new Error(formatFirebaseError(error))
    }
  }

  // Get documents with pagination
  async getPaginated(
    pageSize: number = 20,
    lastDoc?: DocumentSnapshot,
    constraints: QueryConstraint[] = []
  ): Promise<{ docs: T[]; lastDoc: DocumentSnapshot | null }> {
    try {
      const queryConstraints = [...constraints, limit(pageSize)]
      
      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc))
      }
      
      const q = query(this.getCollection(), ...queryConstraints)
      const querySnapshot = await getDocs(q)
      
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[]
      
      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null
      
      return { docs, lastDoc: newLastDoc }
    } catch (error) {
      throw new Error(formatFirebaseError(error))
    }
  }

  // Real-time listener for documents
  onSnapshot(
    callback: (docs: T[]) => void,
    errorCallback?: (error: Error) => void,
    constraints: QueryConstraint[] = []
  ): Unsubscribe {
    const q = query(this.getCollection(), ...constraints)
    
    return onSnapshot(
      q,
      (querySnapshot) => {
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[]
        callback(docs)
      },
      (error) => {
        const formattedError = new Error(formatFirebaseError(error))
        if (errorCallback) {
          errorCallback(formattedError)
        } else {
          console.error('Firestore snapshot error:', formattedError)
        }
      }
    )
  }

  // Real-time listener for a single document
  onDocSnapshot(
    id: string,
    callback: (doc: T | null) => void,
    errorCallback?: (error: Error) => void
  ): Unsubscribe {
    const docRef = this.getDocRef(id)
    
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const doc = {
            id: docSnap.id,
            ...docSnap.data()
          } as T
          callback(doc)
        } else {
          callback(null)
        }
      },
      (error) => {
        const formattedError = new Error(formatFirebaseError(error))
        if (errorCallback) {
          errorCallback(formattedError)
        } else {
          console.error('Firestore document snapshot error:', formattedError)
        }
      }
    )
  }

  // Batch operations
  async batchWrite(operations: Array<{
    type: 'create' | 'update' | 'delete'
    id?: string
    data?: any
  }>): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      for (const operation of operations) {
        switch (operation.type) {
          case 'create':
            const createRef = doc(this.getCollection())
            batch.set(createRef, {
              ...operation.data,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            })
            break
            
          case 'update':
            if (!operation.id) throw new Error('ID required for update operation')
            const updateRef = this.getDocRef(operation.id)
            batch.update(updateRef, {
              ...operation.data,
              updatedAt: serverTimestamp()
            })
            break
            
          case 'delete':
            if (!operation.id) throw new Error('ID required for delete operation')
            const deleteRef = this.getDocRef(operation.id)
            batch.delete(deleteRef)
            break
        }
      }
      
      await batch.commit()
    } catch (error) {
      throw new Error(formatFirebaseError(error))
    }
  }

  // Search documents (requires composite indexes for complex queries)
  async search(
    field: string,
    value: any,
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in' = '==',
    additionalConstraints: QueryConstraint[] = []
  ): Promise<T[]> {
    try {
      const constraints = [where(field, operator, value), ...additionalConstraints]
      return await this.getAll(constraints)
    } catch (error) {
      throw new Error(formatFirebaseError(error))
    }
  }

  // Count documents (approximate for large collections)
  async count(constraints: QueryConstraint[] = []): Promise<number> {
    try {
      const docs = await this.getAll(constraints)
      return docs.length
    } catch (error) {
      throw new Error(formatFirebaseError(error))
    }
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
  // Create a compound query for text search (limited functionality)
  createTextSearchQuery: (field: string, searchTerm: string) => {
    const end = searchTerm.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1))
    return [
      where(field, '>=', searchTerm),
      where(field, '<', end)
    ]
  },

  // Create pagination query
  createPaginationQuery: (pageSize: number, orderField: string = 'createdAt') => [
    orderBy(orderField, 'desc'),
    limit(pageSize)
  ],

  // Create date range query
  createDateRangeQuery: (field: string, startDate: Date, endDate: Date) => [
    where(field, '>=', startDate),
    where(field, '<=', endDate)
  ],

  // Create company filter
  createCompanyFilter: (companyId: string) => where('companyId', '==', companyId),

  // Create user filter
  createUserFilter: (userId: string) => where('createdBy', '==', userId),

  // Common ordering
  orderByCreatedAt: orderBy('createdAt', 'desc'),
  orderByUpdatedAt: orderBy('updatedAt', 'desc'),
  orderByName: orderBy('name', 'asc')
}

export default DatabaseService