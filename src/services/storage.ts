import { storage } from '@/firebase/config'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

/**
 * Upload an employee document to Firebase Storage.
 * Path convention: employees/{companyId}/{employeeDocId}/{docType}.{ext}
 */
export const uploadEmployeeDocument = async (params: {
  companyId: string
  employeeId: string
  file: File
  docType: 'qatarId' | 'passport'
}): Promise<string> => {
  const { companyId, employeeId, file, docType } = params
  const ext = file.name.split('.').pop() || 'bin'
  const path = `employees/${companyId}/${employeeId}/${docType}.${ext}`
  const fileRef = storageRef(storage, path)
  await uploadBytes(fileRef, file, { contentType: file.type })
  return await getDownloadURL(fileRef)
}

/** Convenience bulk uploader */
export const uploadEmployeeDocumentsIfAny = async (companyId: string, employeeId: string, files: {
  qatarIdDocument?: File | null
  passportDocument?: File | null
}) => {
  const result: { qatarIdDocumentUrl?: string; passportDocumentUrl?: string } = {}
  if (files.qatarIdDocument) {
    result.qatarIdDocumentUrl = await uploadEmployeeDocument({
      companyId,
      employeeId,
      file: files.qatarIdDocument,
      docType: 'qatarId'
    })
  }
  if (files.passportDocument) {
    result.passportDocumentUrl = await uploadEmployeeDocument({
      companyId,
      employeeId,
      file: files.passportDocument,
      docType: 'passport'
    })
  }
  return result
}
