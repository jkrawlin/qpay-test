<template>
  <div class="employee-create">
    <v-container fluid>
      <!-- Header -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h4 font-weight-bold text-primary">
                {{ employeeType === 'temporary' ? 'Add New Temporary Employee' : 'Add New Sponsored Employee' }}
              </h1>
              <p class="text-body-1 text-grey-darken-1 ma-0">
                {{ employeeType === 'temporary' 
                  ? 'Register a new temporary employee with contract and visa information'
                  : 'Register a new employee under Nipon sponsorship with Qatar compliance information'
                }}
              </p>
            </div>
            <v-btn
              variant="outlined"
              :to="{ name: backRoute }"
              prepend-icon="mdi-arrow-left"
            >
              Back to List
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Form -->
      <v-form ref="form" v-model="formValid" @submit.prevent="saveEmployee">
        <v-row>
          <!-- Personal Information Card -->
          <v-col cols="12" lg="6">
            <v-card elevation="2" class="mb-6">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-account</v-icon>
                Personal Information
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.firstName"
                      label="First Name *"
                      variant="outlined"
                      density="compact"
                      :rules="nameRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.lastName"
                      label="Last Name *"
                      variant="outlined"
                      density="compact"
                      :rules="nameRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.employeeId"
                      label="Employee ID *"
                      variant="outlined"
                      density="compact"
                      :rules="employeeIdRules"
                      required
                      hint="Auto-generated if left empty"
                      persistent-hint
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="employee.gender"
                      :items="genderOptions"
                      label="Gender *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.dateOfBirth"
                      label="Date of Birth *"
                      type="date"
                      variant="outlined"
                      density="compact"
                      :rules="dateRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="employee.nationality"
                      :items="nationalities"
                      label="Nationality *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.phone"
                      label="Phone Number *"
                      variant="outlined"
                      density="compact"
                      :rules="phoneRules"
                      required
                      prefix="+974"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.email"
                      label="Email Address"
                      type="email"
                      variant="outlined"
                      density="compact"
                      :rules="emailRules"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Employment Information Card -->
          <v-col cols="12" lg="6">
            <v-card elevation="2" class="mb-6">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-briefcase</v-icon>
                Employment Information
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.department"
                      label="Department *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                      placeholder="e.g., Construction, Engineering, HR"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="employee.position"
                      :items="positions"
                      label="Position *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.hireDate"
                      label="Hire Date *"
                      type="date"
                      variant="outlined"
                      density="compact"
                      :rules="dateRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="employee.contractType"
                      :items="contractTypes"
                      label="Contract Type *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="employee.basicSalary"
                      label="Basic Salary (QAR) *"
                      type="number"
                      variant="outlined"
                      density="compact"
                      :rules="salaryRules"
                      required
                      prefix="QAR"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="employee.workLocation"
                      :items="workLocations"
                      label="Work Location *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="employee.manager"
                      label="Direct Manager"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Documents Information Card -->
          <v-col cols="12" lg="6">
            <v-card elevation="2" class="mb-6">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-file-document</v-icon>
                Legal Documents (Qatar Specific)
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.qatarId"
                      label="Qatar ID Number *"
                      variant="outlined"
                      density="compact"
                      :rules="qatarIdRules"
                      required
                      maxlength="11"
                      hint="11-digit Qatar ID number"
                      persistent-hint
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.qatarIdExpiry"
                      label="Qatar ID Expiry Date *"
                      type="date"
                      variant="outlined"
                      density="compact"
                      :rules="futureDateRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.passportNumber"
                      label="Passport Number *"
                      variant="outlined"
                      density="compact"
                      :rules="passportRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.passportExpiry"
                      label="Passport Expiry Date *"
                      type="date"
                      variant="outlined"
                      density="compact"
                      :rules="futureDateRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="employee.visaStatus"
                      :items="visaStatusOptions"
                      label="Visa Status *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.visaExpiry"
                      label="Visa Expiry Date"
                      type="date"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="employee.sponsor"
                      label="Sponsor/Company Name *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Banking Information Card -->
          <v-col cols="12" lg="6">
            <v-card elevation="2" class="mb-6">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-bank</v-icon>
                Banking Information
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="employee.bankName"
                      :items="qatarBanks"
                      label="Bank Name *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.accountNumber"
                      label="Account Number *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                      hint="Bank account number"
                      persistent-hint
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.iban"
                      label="IBAN"
                      variant="outlined"
                      density="compact"
                      hint="QA format: QA58XXXX000000000000123456789 (Optional)"
                      persistent-hint
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Document Upload Card -->
          <v-col cols="12" lg="6">
            <v-card elevation="2" class="mb-6">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-file-upload</v-icon>
                Document Uploads
              </v-card-title>
              <v-card-text>
                <!-- Qatar ID Document -->
                <div class="document-upload-section mb-4">
                  <h4 class="text-body-1 font-weight-medium mb-2">Qatar ID Copy</h4>
                  
                  <div v-if="employee.qatarIdDocument" class="document-preview mb-2">
                    <div class="d-flex align-center">
                      <v-icon 
                        :color="getFileIcon(employee.qatarIdDocument.name).color" 
                        class="mr-2"
                      >
                        {{ getFileIcon(employee.qatarIdDocument.name).icon }}
                      </v-icon>
                      <span class="text-body-2">{{ employee.qatarIdDocument.name }}</span>
                      <v-spacer />
                      <v-btn
                        icon="fa:fas fa-trash"
                        variant="text"
                        size="small"
                        color="primary"
                        class="action-btn"
                        @click="removeDocument('qatarIdDocument')"
                        title="Remove Document"
                      />
                    </div>
                  </div>
                  
                  <v-file-input
                    :key="`qatar-id-${fileInputKey}`"
                    label="Upload Qatar ID (PDF/Image)"
                    variant="outlined"
                    density="compact"
                    accept=".pdf,.jpg,.jpeg,.png"
                    prepend-icon="mdi-paperclip"
                    @change="handleFileUpload($event, 'qatarIdDocument')"
                    :loading="uploading"
                    hide-details
                  />
                </div>

                <!-- Passport Document -->
                <div class="document-upload-section">
                  <h4 class="text-body-1 font-weight-medium mb-2">Passport Copy</h4>
                  
                  <div v-if="employee.passportDocument" class="document-preview mb-2">
                    <div class="d-flex align-center">
                      <v-icon 
                        :color="getFileIcon(employee.passportDocument.name).color" 
                        class="mr-2"
                      >
                        {{ getFileIcon(employee.passportDocument.name).icon }}
                      </v-icon>
                      <span class="text-body-2">{{ employee.passportDocument.name }}</span>
                      <v-spacer />
                      <v-btn
                        icon="fa:fas fa-trash"
                        variant="text"
                        size="small"
                        color="primary"
                        class="action-btn"
                        @click="removeDocument('passportDocument')"
                        title="Remove Document"
                      />
                    </div>
                  </div>
                  
                  <v-file-input
                    :key="`passport-${fileInputKey}`"
                    label="Upload Passport (PDF/Image)"
                    variant="outlined"
                    density="compact"
                    accept=".pdf,.jpg,.jpeg,.png"
                    prepend-icon="mdi-paperclip"
                    @change="handleFileUpload($event, 'passportDocument')"
                    :loading="uploading"
                    hide-details
                  />
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Additional Information Card -->
          <v-col cols="12" lg="6">
            <v-card elevation="2" class="mb-6">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-information</v-icon>
                Additional Information
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12">
                    <v-textarea
                      v-model="employee.address"
                      label="Address in Qatar"
                      variant="outlined"
                      density="compact"
                      rows="3"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.emergencyContact"
                      label="Emergency Contact Name"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="employee.emergencyPhone"
                      label="Emergency Contact Phone"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="employee.notes"
                      label="Additional Notes"
                      variant="outlined"
                      density="compact"
                      rows="3"
                      hint="Any special requirements or notes"
                      persistent-hint
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-file-input
                      v-model="employee.photo"
                      label="Employee Photo"
                      variant="outlined"
                      density="compact"
                      accept="image/*"
                      prepend-icon="mdi-camera"
                      hint="Upload employee photo (optional)"
                      persistent-hint
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Action Buttons -->
        <v-row>
          <v-col cols="12">
            <v-card elevation="2">
              <v-card-text>
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <v-switch
                      v-model="employee.isActive"
                      label="Activate employee immediately"
                      color="primary"
                      inset
                    />
                  </div>
                  <div class="d-flex gap-3">
                    <v-btn
                      variant="outlined"
                      @click="resetForm"
                    >
                      Reset Form
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      @click="saveAsDraft"
                      :loading="saving"
                    >
                      Save as Draft
                    </v-btn>
                    <v-btn
                      type="submit"
                      color="primary"
                      :loading="saving"
                      :disabled="!formValid"
                    >
                      Create Employee
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-form>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEmployeeStore } from '@/stores/employees-db'
import { useAuthStore } from '@/stores/auth'
import { uploadEmployeeDocumentsIfAny } from '@/services/storage'
import { useToastStore } from '@/stores/toasts'

// Firestore employee store & auth
const employeeStore = useEmployeeStore()
const authStore = useAuthStore()
// Derive active companyId (fallback to 'default-company' if not available)
const companyId = computed(() => authStore.user?.companyId || 'default-company')
const toast = useToastStore()

const router = useRouter()
const route = useRoute()

// Determine employee type from query parameter
const employeeType = computed(() => route.query.type || 'nipon')

// Compute back navigation route
const backRoute = computed(() => {
  return employeeType.value === 'temporary' ? 'TemporaryEmployees' : 'NiponEmployees'
})

// Form state
const form = ref()
const formValid = ref(false)
const saving = ref(false)
const uploading = ref(false)
const fileInputKey = ref(0)

// Employee data
const employee = reactive({
  // Personal Information
  firstName: '',
  lastName: '',
  employeeId: '',
  gender: '',
  dateOfBirth: '',
  nationality: '',
  phone: '',
  email: '',
  
  // Employment Information
  department: '',
  position: '',
  hireDate: '',
  contractType: '',
  basicSalary: 0,
  workLocation: '',
  manager: '',
  
  // Documents
  qatarId: '',
  qatarIdExpiry: '',
  passportNumber: '',
  passportExpiry: '',
  visaStatus: '',
  visaExpiry: '',
  sponsor: '',
  
  // Banking Information
  bankName: '',
  accountNumber: '',
  iban: '',
  
  // Document Files
  qatarIdDocument: null as File | null,
  passportDocument: null as File | null,
  
  // Additional Information
  address: '',
  emergencyContact: '',
  emergencyPhone: '',
  notes: '',
  photo: null,
  isActive: true
})

// Form options
const genderOptions = ['Male', 'Female']
const nationalities = [
  'Egyptian', 'Indian', 'Pakistani', 'Sudanese', 'Filipino', 
  'Bangladeshi', 'Sri Lankan', 'Nepalese', 'Jordanian', 'Syrian',
  'Lebanese', 'Palestinian', 'Yemeni', 'Moroccan', 'Tunisian'
]
const positions = [
  'Site Engineer', 'Construction Worker', 'HR Specialist', 'Accountant',
  'Safety Officer', 'Project Manager', 'Supervisor', 'Technician',
  'Administrative Assistant', 'Quality Inspector'
]
const contractTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary']
const workLocations = [
  'Doha', 'Al Wakra', 'Al Rayyan', 'Lusail', 'Al Khor', 
  'Mesaieed', 'Dukhan', 'Al Shamal', 'Umm Salal'
]
const visaStatusOptions = [
  'Valid', 'Pending Renewal', 'Expiring Soon', 'Under Process', 'Expired'
]
const qatarBanks = [
  'Qatar National Bank (QNB)',
  'Commercial Bank of Qatar (CBQ)',
  'Doha Bank',
  'Qatar Islamic Bank (QIB)',
  'Al Rayan Bank',
  'Qatar Development Bank',
  'International Bank of Qatar (IBQ)',
  'Ahli Bank',
  'Al Khalij Commercial Bank'
]

// Validation rules
const nameRules = [
  (v: string) => !!v || 'Name is required',
  (v: string) => v.length >= 2 || 'Name must be at least 2 characters',
  (v: string) => /^[a-zA-Z\s]+$/.test(v) || 'Name must contain only letters'
]

const employeeIdRules = [
  (v: string) => !v || v.length >= 3 || 'Employee ID must be at least 3 characters'
]

const requiredRules = [
  (v: any) => !!v || 'This field is required'
]

const dateRules = [
  (v: string) => !!v || 'Date is required',
  (v: string) => !isNaN(Date.parse(v)) || 'Invalid date format'
]

const futureDateRules = [
  (v: string) => !!v || 'Date is required',
  (v: string) => !isNaN(Date.parse(v)) || 'Invalid date format',
  (v: string) => new Date(v) > new Date() || 'Date must be in the future'
]

const phoneRules = [
  (v: string) => !!v || 'Phone number is required',
  (v: string) => /^\d{8}$/.test(v) || 'Phone number must be 8 digits'
]

const emailRules = [
  (v: string) => !v || /.+@.+\..+/.test(v) || 'Email must be valid'
]

const qatarIdRules = [
  (v: string) => !!v || 'Qatar ID is required',
  (v: string) => /^\d{11}$/.test(v) || 'Qatar ID must be 11 digits'
]

const passportRules = [
  (v: string) => !!v || 'Passport number is required',
  (v: string) => v.length >= 6 || 'Passport number must be at least 6 characters'
]

const salaryRules = [
  (v: number) => !!v || 'Salary is required',
  (v: number) => v > 0 || 'Salary must be greater than 0',
  (v: number) => v >= 1000 || 'Minimum salary in Qatar is QAR 1,000'
]

// (Legacy placeholder) IBAN validation rules removed (field optional)

// Methods
// generateEmployeeId deprecated in favor of ensureUniqueEmployeeId()

// Ensure unique employeeId (regenerate if auto, block if user-entered duplicate)
const ensureUniqueEmployeeId = () => {
  const existingIds = new Set(employeeStore.employees.map(e => e.employeeId.toLowerCase()))
  // If user manually entered an ID
  if (employee.employeeId) {
    if (existingIds.has(employee.employeeId.toLowerCase())) {
      // Collision on user-specified ID
      throw new Error(`Employee ID ${employee.employeeId} already exists. Please choose another.`)
    }
    return
  }
  // Auto-generate until unique (max 5 attempts to avoid infinite loop)
  let attempts = 0
  do {
    const prefix = 'NP'
    const timestamp = Date.now().toString().slice(-6)
    employee.employeeId = `${prefix}${timestamp}${attempts > 0 ? Math.floor(Math.random() * 9) : ''}`
    attempts++
  } while (attempts < 5 && existingIds.has(employee.employeeId.toLowerCase()))
  if (existingIds.has(employee.employeeId.toLowerCase())) {
    // Fallback - extremely unlikely
    throw new Error('Could not generate a unique Employee ID. Please enter one manually.')
  }
}

const resetForm = () => {
  form.value?.reset()
  // Explicit reset to satisfy strict typing
  employee.firstName = ''
  employee.lastName = ''
  employee.employeeId = ''
  employee.gender = ''
  employee.dateOfBirth = ''
  employee.nationality = ''
  employee.phone = ''
  employee.email = ''
  employee.department = ''
  employee.position = ''
  employee.hireDate = ''
  employee.contractType = ''
  employee.basicSalary = 0
  employee.workLocation = ''
  employee.manager = ''
  employee.qatarId = ''
  employee.qatarIdExpiry = ''
  employee.passportNumber = ''
  employee.passportExpiry = ''
  employee.visaStatus = ''
  employee.visaExpiry = ''
  employee.sponsor = ''
  employee.bankName = ''
  employee.accountNumber = ''
  employee.iban = ''
  employee.qatarIdDocument = null
  employee.passportDocument = null
  employee.address = ''
  employee.emergencyContact = ''
  employee.emergencyPhone = ''
  employee.notes = ''
  employee.photo = null
  employee.isActive = true
  fileInputKey.value++
}

// File handling methods
const handleFileUpload = async (event: Event, documentType: 'qatarIdDocument' | 'passportDocument') => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // Validate file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    toast.push({ message: 'Only PDF or image files (JPG, PNG) are allowed', type: 'error' })
    return
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.push({ message: 'File size must be less than 5MB', type: 'error' })
    return
  }
  
  // Store the file
  employee[documentType] = file
  console.log(`${documentType} selected:`, file.name)
}

const removeDocument = (documentType: 'qatarIdDocument' | 'passportDocument') => {
  if (confirm('Are you sure you want to remove this document?')) {
    employee[documentType] = null
    fileInputKey.value++
    console.log(`${documentType} removed`)
  }
}

const getFileIcon = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf':
      return { icon: 'mdi-file-pdf-box', color: 'error' }
    case 'jpg':
    case 'jpeg':
    case 'png':
      return { icon: 'mdi-file-image', color: 'info' }
    default:
      return { icon: 'mdi-file', color: 'grey' }
  }
}

const saveAsDraft = async () => {
  saving.value = true
  try {
    // Generate a draft ID
    const draftId = `DRAFT_${Date.now()}`
    
    // Create draft employee object
    const draftEmployee = {
      ...employee,
      id: draftId,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
    
    // Save to localStorage (in a real app, this would be saved to backend)
    const existingDrafts = JSON.parse(localStorage.getItem('employeeDrafts') || '[]')
    existingDrafts.push(draftEmployee)
    localStorage.setItem('employeeDrafts', JSON.stringify(existingDrafts))
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
  toast.push({ message: 'Employee draft saved locally', type: 'success' })
    
    // Redirect back to the previous page
    router.push({ name: backRoute.value })
  } catch (error) {
    console.error('Error saving draft:', error)
    toast.push({ message: 'Failed to save draft', type: 'error' })
  } finally {
    saving.value = false
  }
}

const saveEmployee = async () => {
  // Run base Vuetify validation first
  if (!formValid.value) {
    toast.push({ message: 'Please correct the highlighted validation errors', type: 'error' })
    return
  }

  // Enhanced group + business validation
  const validationErrors = validateEmployeeForm()
  if (validationErrors.length) {
    // Show up to first 5 errors individually to avoid toast spam
    validationErrors.slice(0, 5).forEach(err => toast.push({ message: err, type: 'error' }))
    if (validationErrors.length > 5) {
      toast.push({ message: `+ ${validationErrors.length - 5} more issues...`, type: 'error' })
    }
    return
  }

  saving.value = true
  try {
    // Ensure ID uniqueness
    ensureUniqueEmployeeId()

    // Map form data to Firestore Employee shape
    const type = employeeType.value === 'temporary' ? 'temporary' : 'permanent'
    const status = employee.isActive ? 'active' : 'inactive'

    const employeePayload = {
      employeeId: employee.employeeId,
      firstName: employee.firstName.trim(),
      lastName: employee.lastName.trim(),
      email: employee.email?.trim() || '',
      phone: employee.phone?.trim() || '',
      position: employee.position,
      department: employee.department,
      salary: Number(employee.basicSalary) || 0,
      hireDate: employee.hireDate,
      status: status as 'active' | 'inactive' | 'terminated',
      type: type as 'permanent' | 'temporary' | 'contract',
      nationality: employee.nationality,
      qatarId: employee.qatarId || undefined,
      passportNumber: employee.passportNumber || undefined,
      visa: employee.visaStatus ? {
        number: `AUTO-${Date.now()}`,
        expiryDate: employee.visaExpiry || '',
        status: employee.visaStatus
      } : undefined,
      // Optional placeholders for model completeness
      workPermit: undefined,
      address: employee.address || undefined,
      emergencyContact: employee.emergencyContact ? {
        name: employee.emergencyContact,
        phone: employee.emergencyPhone || '',
        relationship: 'N/A'
      } : undefined,
      // Metadata (companyId can be injected later once auth/org implemented)
      companyId: companyId.value
    }

    const newId = await employeeStore.createEmployee(employeePayload as any)
    toast.push({ message: `Employee ${employee.firstName} ${employee.lastName} created`, type: 'success' })

    // Upload documents if present
    if (employee.qatarIdDocument || employee.passportDocument) {
      uploading.value = true
      toast.push({ message: 'Uploading documents...', type: 'info' })
      try {
        const uploaded = await uploadEmployeeDocumentsIfAny(companyId.value, newId, {
          qatarIdDocument: employee.qatarIdDocument || undefined,
          passportDocument: employee.passportDocument || undefined
        })
        const hasUpdates = Object.keys(uploaded).length > 0
        if (hasUpdates) {
          await employeeStore.updateEmployee(newId, uploaded as any)
          toast.push({ message: 'Documents uploaded successfully', type: 'success' })
        }
      } catch (docErr) {
        console.error('Document upload failed:', docErr)
        toast.push({ message: 'Some documents failed to upload', type: 'error' })
      } finally {
        uploading.value = false
      }
    }

    router.push({ name: backRoute.value })
  } catch (error) {
    console.error('Error creating employee:', error)
    const message = error instanceof Error ? error.message : 'Failed to create employee'
    toast.push({ message, type: 'error' })
  } finally {
    saving.value = false
  }
}

// Enhanced validation logic (group + business rules)
const validateEmployeeForm = (): string[] => {
  const errors: string[] = []
  const today = new Date().toISOString().split('T')[0]

  // Helper functions (local to validation to avoid global clutter)
  const calcAge = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    let age = now.getFullYear() - d.getFullYear()
    const mDiff = now.getMonth() - d.getMonth()
    if (mDiff < 0 || (mDiff === 0 && now.getDate() < d.getDate())) age--
    return age
  }
  const isFuture = (dateStr: string) => new Date(dateStr) > new Date()
  const isPastOrToday = (dateStr: string) => new Date(dateStr) <= new Date()

  // Helper to check empty
  const isEmpty = (v: any) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '')

  // Group: Personal
  const personalFields: Record<string, any> = {
    'First Name': employee.firstName,
    'Last Name': employee.lastName,
    'Gender': employee.gender,
    'Date of Birth': employee.dateOfBirth,
    'Nationality': employee.nationality,
    'Phone Number': employee.phone
  }
  Object.entries(personalFields).forEach(([label, value]) => {
    if (isEmpty(value)) errors.push(`${label} is required`)
  })

  // Birth date sanity (must be past and age < 80 > 15)
  if (employee.dateOfBirth) {
    if (isFuture(employee.dateOfBirth)) errors.push('Date of Birth cannot be in the future')
    const age = calcAge(employee.dateOfBirth)
    // Relaxed age rule for test data (allow age >= 14). If needed remove entirely later.
    if (age < 14) errors.push('Employee must be at least 14 years old')
    if (age > 80) errors.push('Employee age seems invalid (> 80)')
  }

  // Group: Employment
  const employmentFields: Record<string, any> = {
    'Department': employee.department,
    'Position': employee.position,
    'Hire Date': employee.hireDate,
    'Contract Type': employee.contractType,
    'Work Location': employee.workLocation
  }
  Object.entries(employmentFields).forEach(([label, value]) => {
    if (isEmpty(value)) errors.push(`${label} is required`)
  })
  if (!employee.basicSalary || employee.basicSalary <= 0) {
    errors.push('Basic Salary must be greater than 0')
  } else if (employee.basicSalary < 1000) {
    errors.push('Basic Salary must be at least QAR 1,000')
  }

  // Group: Documents (Qatar requires these for sponsored employees)
  const documentFields: Record<string, any> = {
    'Qatar ID Number': employee.qatarId,
    'Qatar ID Expiry Date': employee.qatarIdExpiry,
    'Passport Number': employee.passportNumber,
    'Passport Expiry Date': employee.passportExpiry,
    'Visa Status': employee.visaStatus
  }
  Object.entries(documentFields).forEach(([label, value]) => {
    if (isEmpty(value)) errors.push(`${label} is required`)
  })

  // Expiry future checks
  if (employee.qatarIdExpiry && employee.qatarIdExpiry <= today) {
    errors.push('Qatar ID expiry must be a future date')
  }
  if (employee.passportExpiry && employee.passportExpiry <= today) {
    errors.push('Passport expiry must be a future date')
  }
  // Visa expiry: allow empty OR today (only flag if explicitly in the past)
  if (employee.visaExpiry) {
    if (employee.visaExpiry < today) {
      errors.push('Visa expiry must not be in the past')
    }
  }

  // Group: Banking
  const bankingFields: Record<string, any> = {
    'Bank Name': employee.bankName,
    'Account Number': employee.accountNumber
  }
  Object.entries(bankingFields).forEach(([label, value]) => {
    if (isEmpty(value)) errors.push(`${label} is required`)
  })

  // IBAN validation removed entirely (field optional for rapid test entry)

  return errors
}

onMounted(() => {
  // Set default hire date to today
  employee.hireDate = new Date().toISOString().split('T')[0]
  
  // Set default sponsor (this would come from company settings)
  employee.sponsor = 'Al Wakra Construction Company'

  // Ensure employee store initialized (real-time listener)
  // For now no company scoping
  try {
    employeeStore.initialize(companyId.value)
  } catch (e) {
    console.warn('Employee store init failed (possibly already initialized):', e)
  }
})
</script>

<style scoped>
.employee-create {
  background-color: #fafafa;
  min-height: 100vh;
}

/* Form styling improvements */
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Required field indicators */
.v-label--required::after {
  content: " *";
  color: #f44336;
}

/* Document Upload Sections */
.document-upload-section {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 12px;
  background: rgba(248, 249, 250, 0.5);
}

.document-preview {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 6px;
  padding: 8px;
}

.document-preview:hover {
  background: rgba(103, 126, 234, 0.02);
}

/* Banking section styling */
.v-card-title {
  color: #1976d2;
  border-bottom: 2px solid rgba(25, 118, 210, 0.1);
  padding-bottom: 8px;
  margin-bottom: 8px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .v-container {
    padding: 12px;
  }
}
</style>
