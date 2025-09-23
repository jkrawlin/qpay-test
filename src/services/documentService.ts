// Phase 1 (Firestore removed): In-memory stub implementation of document service.
// Original Firebase + Storage + OCR logic stripped out for local-only operation.

// (Optional future) If re-integrating: restore Firebase imports and logic guarded by feature flags.

interface DocumentMetadata {
  id?: string
  employeeId: string
  type: string
  urls?: string[]
  url?: string
  fileName?: string
  fileSize?: number
  expiryDate?: Date
  ocrData?: any
  uploadedAt?: Date
  verified?: boolean
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

// In-memory stores
const _documents: DocumentMetadata[] = []
const _employeeDocuments: Record<string, EmployeeDocument> = {}

export class DocumentService {
  async encryptDocument(file: File): Promise<Blob> {
    // Stub: return original file as blob (no real encryption in local mode)
    return new Blob([await file.arrayBuffer()], { type: file.type })
  }

  async performOCR(_file: File): Promise<any> {
    // Stub: return empty object (could simulate basic extraction later)
    return {}
  }

  async uploadToStorage(
    file: File | Blob,
    documentType: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    // Simulate progress
    onProgress?.(0)
    onProgress?.(50)
    onProgress?.(100)
    const name = file instanceof File ? file.name : 'document'
    return `https://local.documents/${documentType}/${Date.now()}-${Math.random().toString(36).slice(2)}-${name}`
  }

  async saveDocumentMetadata(metadata: Partial<DocumentMetadata>): Promise<string> {
    const id = metadata.id || Math.random().toString(36).slice(2)
    const record: DocumentMetadata = {
      employeeId: metadata.employeeId || 'unknown-employee',
      type: metadata.type || 'other',
      ...metadata,
      id,
      uploadedAt: new Date(),
      verified: false
    }
    _documents.push(record)
    return id
  }

  async updateEmployeeDocuments(employeeId: string, documents: EmployeeDocument): Promise<void> {
    _employeeDocuments[employeeId] = documents
  }

  async generateExpiryReport(daysAhead: number = 90): Promise<any[]> {
    const future = Date.now() + daysAhead * 24 * 60 * 60 * 1000
    const out: any[] = []
    Object.entries(_employeeDocuments).forEach(([employeeId, docs]) => {
      const pushIf = (label: string, doc: any, numberField: string) => {
        if (!doc?.expiryDate) return
        const expiry = doc.expiryDate instanceof Date ? doc.expiryDate : new Date(doc.expiryDate)
        const ms = expiry.getTime() - Date.now()
        if (ms <= 0) return
        if (expiry.getTime() <= future) {
          const days = Math.ceil(ms / (1000 * 60 * 60 * 24))
            out.push({
              employeeId,
              employeeName: employeeId,
              documentType: label,
              documentNumber: doc[numberField],
              expiryDate: expiry,
              daysUntilExpiry: days,
              urgency: days <= 30 ? 'high' : days <= 60 ? 'medium' : 'low'
            })
        }
      }
      pushIf('Qatar ID', (docs as any).qatarId, 'number')
      pushIf('Passport', (docs as any).passport, 'number')
      pushIf('Visa', (docs as any).visa, 'number')
    })
    return out.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
  }
}

export const documentService = new DocumentService()