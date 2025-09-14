import { 
  ref as storageRef, 
  uploadBytesResumable, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage'
import { storage, db } from '@/firebase/config'
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  Timestamp 
} from 'firebase/firestore'
import Tesseract from 'tesseract.js'
import CryptoJS from 'crypto-js'

interface DocumentMetadata {
  id?: string
  employeeId: string
  type: 'qatar-id' | 'passport' | 'visa' | 'work-permit' | 'contract' | 'other'
  fileName: string
  fileSize: number
  url: string
  encryptedUrl?: string
  expiryDate?: Date
  extractedData?: any
  uploadedBy: string
  uploadedAt: Date
  lastModified?: Date
  verified: boolean
  verifiedBy?: string
  verifiedAt?: Date
}

interface EmployeeDocument {
  qatarId: {
    number: string
    issueDate: Date
    expiryDate: Date
    photoUrl?: string
    scannedCopyUrl?: string
  }
  passport: {
    number: string
    nationality: string
    issueDate: Date
    expiryDate: Date
    photoUrl?: string
    scannedCopyUrl?: string
  }
  visa: {
    number: string
    type: string
    sponsor: string
    expiryDate: Date
    scannedCopyUrl?: string
  }
}

export class DocumentService {
  private encryptionKey = import.meta.env.VITE_DOCUMENT_ENCRYPTION_KEY || 'default-key'

  // Encrypt document before upload
  async encryptDocument(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const content = e.target?.result as ArrayBuffer
        const wordArray = CryptoJS.lib.WordArray.create(content)
        const encrypted = CryptoJS.AES.encrypt(wordArray, this.encryptionKey)
        
        const blob = new Blob([encrypted.toString()], { type: 'application/octet-stream' })
        resolve(blob)
      }
      
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  // Decrypt document after download
  async decryptDocument(encryptedData: string): Promise<Blob> {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey)
    const typedArray = this.convertWordArrayToUint8Array(decrypted)
    return new Blob([typedArray])
  }

  private convertWordArrayToUint8Array(wordArray: any): Uint8Array {
    const words = wordArray.words
    const sigBytes = wordArray.sigBytes
    const u8 = new Uint8Array(sigBytes)
    
    for (let i = 0; i < sigBytes; i++) {
      const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
      u8[i] = byte
    }
    
    return u8
  }

  // Upload to Firebase Storage
  async uploadToStorage(
    file: File | Blob,
    documentType: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const timestamp = Date.now()
    const fileName = `documents/${documentType}/${timestamp}_${file instanceof File ? file.name : 'document'}`
    const fileRef = storageRef(storage, fileName)
    
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(fileRef, file)
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          onProgress?.(progress)
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadURL)
        }
      )
    })
  }

  // Perform OCR on document
  async performOCR(file: File): Promise<any> {
    const result = await Tesseract.recognize(file, 'eng+ara', {
      logger: (info) => console.log(info)
    })
    
    const text = result.data.text
    const extractedData: any = {}
    
    // Extract Qatar ID information
    if (text.includes('State of Qatar') || text.includes('دولة قطر')) {
      // Qatar ID patterns
      const qidPattern = /\d{11}/
      const qidMatch = text.match(qidPattern)
      if (qidMatch) {
        extractedData.qatarId = qidMatch[0]
      }
      
      // Name extraction (simplified)
      const namePattern = /Name[:\s]+([A-Za-z\s]+)/i
      const nameMatch = text.match(namePattern)
      if (nameMatch) {
        extractedData.name = nameMatch[1].trim()
      }
      
      // Expiry date pattern
      const expiryPattern = /(\d{2}[\/\-]\d{2}[\/\-]\d{4})/
      const expiryMatch = text.match(expiryPattern)
      if (expiryMatch) {
        extractedData.expiryDate = expiryMatch[1]
      }
    }
    
    // Extract Passport information
    if (text.includes('PASSPORT') || text.includes('جواز السفر')) {
      const passportPattern = /[A-Z]\d{8}/
      const passportMatch = text.match(passportPattern)
      if (passportMatch) {
        extractedData.passportNumber = passportMatch[0]
      }
      
      // Extract nationality
      const nationalityPattern = /Nationality[:\s]+([A-Za-z\s]+)/i
      const nationalityMatch = text.match(nationalityPattern)
      if (nationalityMatch) {
        extractedData.nationality = nationalityMatch[1].trim()
      }
    }
    
    return extractedData
  }

  // Save document metadata to Firestore
  async saveDocumentMetadata(metadata: Partial<DocumentMetadata>): Promise<string> {
    const docRef = doc(collection(db, 'documents'))
    await setDoc(docRef, {
      ...metadata,
      id: docRef.id,
      createdAt: new Date(),
      lastModified: new Date(),
      verified: false
    })
    return docRef.id
  }

  // Check for expiring documents
  async checkExpiringDocuments(daysAhead: number = 30): Promise<DocumentMetadata[]> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)
    
    const documentsRef = collection(db, 'documents')
    const q = query(
      documentsRef,
      where('expiryDate', '<=', Timestamp.fromDate(futureDate)),
      where('expiryDate', '>=', Timestamp.fromDate(new Date()))
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DocumentMetadata))
  }

  // Delete document
  async deleteDocument(documentId: string, fileUrl: string): Promise<void> {
    // Delete from Storage
    const fileRef = storageRef(storage, fileUrl)
    await deleteObject(fileRef)
    
    // Delete from Firestore
    await deleteDoc(doc(db, 'documents', documentId))
  }

  // Verify document
  async verifyDocument(documentId: string, verifiedBy: string): Promise<void> {
    await updateDoc(doc(db, 'documents', documentId), {
      verified: true,
      verifiedBy,
      verifiedAt: new Date()
    })
  }

  // Get employee documents
  async getEmployeeDocuments(employeeId: string): Promise<DocumentMetadata[]> {
    const documentsRef = collection(db, 'documents')
    const q = query(documentsRef, where('employeeId', '==', employeeId))
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DocumentMetadata))
  }

  // Update employee document information
  async updateEmployeeDocuments(employeeId: string, documents: EmployeeDocument): Promise<void> {
    const employeeRef = doc(db, 'employees', employeeId)
    await updateDoc(employeeRef, {
      documents,
      lastDocumentUpdate: new Date()
    })
  }

  // Generate document expiry report
  async generateExpiryReport(daysAhead: number = 90): Promise<any[]> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)
    
    const employeesRef = collection(db, 'employees')
    const snapshot = await getDocs(employeesRef)
    
    const expiringDocuments: any[] = []
    
    snapshot.docs.forEach(doc => {
      const employee = { id: doc.id, ...doc.data() }
      
      // Check Qatar ID
      if (employee.documents?.qatarId?.expiryDate) {
        const expiryDate = employee.documents.qatarId.expiryDate.toDate()
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilExpiry <= daysAhead && daysUntilExpiry > 0) {
          expiringDocuments.push({
            employeeId: employee.id,
            employeeName: employee.name,
            documentType: 'Qatar ID',
            documentNumber: employee.documents.qatarId.number,
            expiryDate: expiryDate,
            daysUntilExpiry,
            urgency: daysUntilExpiry <= 30 ? 'high' : daysUntilExpiry <= 60 ? 'medium' : 'low'
          })
        }
      }
      
      // Check Passport
      if (employee.documents?.passport?.expiryDate) {
        const expiryDate = employee.documents.passport.expiryDate.toDate()
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilExpiry <= daysAhead && daysUntilExpiry > 0) {
          expiringDocuments.push({
            employeeId: employee.id,
            employeeName: employee.name,
            documentType: 'Passport',
            documentNumber: employee.documents.passport.number,
            expiryDate: expiryDate,
            daysUntilExpiry,
            urgency: daysUntilExpiry <= 30 ? 'high' : daysUntilExpiry <= 60 ? 'medium' : 'low'
          })
        }
      }
      
      // Check Visa
      if (employee.documents?.visa?.expiryDate) {
        const expiryDate = employee.documents.visa.expiryDate.toDate()
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilExpiry <= daysAhead && daysUntilExpiry > 0) {
          expiringDocuments.push({
            employeeId: employee.id,
            employeeName: employee.name,
            documentType: 'Visa',
            documentNumber: employee.documents.visa.number,
            expiryDate: expiryDate,
            daysUntilExpiry,
            urgency: daysUntilExpiry <= 30 ? 'high' : daysUntilExpiry <= 60 ? 'medium' : 'low'
          })
        }
      }
    })
    
    return expiringDocuments.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
  }
}

export const documentService = new DocumentService()