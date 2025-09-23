<template>
  <div class="customer-create">
    <v-container fluid>
      <!-- Header -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h4 font-weight-bold text-primary">
                Add New Customer
              </h1>
              <p class="text-body-1 text-grey-darken-1 ma-0">
                Create a comprehensive B2B customer profile with Qatar compliance details
              </p>
            </div>
            <v-btn
              variant="outlined"
              :to="{ name: 'CustomerList' }"
              prepend-icon="mdi-arrow-left"
            >
              Back to List
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Form -->
      <v-form ref="form" v-model="formValid" @submit.prevent="saveCustomer">
        <v-row>
          <!-- Company Information Card -->
          <v-col cols="12" lg="6">
            <v-card elevation="2" class="mb-6">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-domain</v-icon>
                Company Information
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="8">
                    <v-text-field
                      v-model="customer.companyName"
                      label="Company Name *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-select
                      v-model="customer.businessType"
                      :items="businessTypes"
                      label="Business Type *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="customer.industry"
                      :items="industries"
                      label="Industry *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="customer.country"
                      :items="countries"
                      label="Country of Operation *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="customer.businessDescription"
                      label="Business Description"
                      variant="outlined"
                      density="compact"
                      rows="3"
                      placeholder="Describe your company's main business activities..."
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Contact Information Card -->
          <v-col cols="12" lg="6">
            <v-card elevation="2" class="mb-6">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-account-details</v-icon>
                Contact Information
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="customer.contactPerson"
                      label="Primary Contact Person *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="customer.contactPosition"
                      label="Position/Title"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="customer.email"
                      label="Email Address *"
                      type="email"
                      variant="outlined"
                      density="compact"
                      :rules="emailRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="customer.phone"
                      label="Phone Number *"
                      variant="outlined"
                      density="compact"
                      :rules="phoneRules"
                      required
                      prefix="+974"
                      placeholder="XXXX XXXX"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="customer.alternatePhone"
                      label="Alternate Phone Number"
                      variant="outlined"
                      density="compact"
                      prefix="+974"
                      placeholder="XXXX XXXX"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="customer.website"
                      label="Website"
                      variant="outlined"
                      density="compact"
                      placeholder="https://company.com"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Address Information Card -->
          <v-col cols="12" lg="6">
            <v-card elevation="2" class="mb-6">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
                Business Address
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12">
                    <v-textarea
                      v-model="customer.address"
                      label="Business Address *"
                      variant="outlined"
                      density="compact"
                      rows="3"
                      :rules="requiredRules"
                      required
                      placeholder="Street address, building number, zone..."
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="customer.city"
                      label="City *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="customer.postalCode"
                      label="Postal Code"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="customer.poBox"
                      label="P.O. Box"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Qatar Legal Information Card -->
          <v-col cols="12" lg="6">
            <v-card elevation="2" class="mb-6">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-certificate</v-icon>
                Qatar Legal Information
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="customer.tradeLicenseNumber"
                      label="Trade License Number *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="customer.tradeLicenseExpiry"
                      label="License Expiry Date *"
                      type="date"
                      variant="outlined"
                      density="compact"
                      :rules="futureDateRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="customer.crNumber"
                      label="CR Number"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="customer.taxNumber"
                      label="Tax Number"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="customer.vatStatus"
                      :items="vatStatuses"
                      label="VAT Status *"
                      variant="outlined"
                      density="compact"
                      :rules="requiredRules"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="customer.registrationDate"
                      label="Registration Date"
                      type="date"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Contract & Billing Information Card -->
          <v-col cols="12" lg="6">
            <v-card elevation="2" class="mb-6">
              <v-card-title class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-file-document-outline</v-icon>
                Contract & Billing
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="customer.contractType"
                      :items="contractTypes"
                      label="Contract Type"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="customer.paymentTerms"
                      label="Payment Terms (Days)"
                      type="number"
                      variant="outlined"
                      density="compact"
                      min="0"
                      max="365"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="customer.creditLimit"
                      label="Credit Limit (QAR)"
                      type="number"
                      variant="outlined"
                      density="compact"
                      min="0"
                      prefix="QAR"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="customer.preferredCurrency"
                      :items="currencies"
                      label="Preferred Currency"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                </v-row>
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
                      v-model="customer.notes"
                      label="Additional Notes"
                      variant="outlined"
                      density="compact"
                      rows="4"
                      placeholder="Any special requirements, preferences, or additional information..."
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="customer.status"
                      :items="statusOptions"
                      label="Customer Status"
                      variant="outlined"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="customer.priority"
                      :items="priorityOptions"
                      label="Priority Level"
                      variant="outlined"
                      density="compact"
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
                      v-model="customer.isActive"
                      label="Activate customer immediately"
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
                      Create Customer
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Form state
const form = ref()
const formValid = ref(false)
const saving = ref(false)

// Customer data
const customer = reactive({
  // Company Information
  companyName: '',
  businessType: '',
  industry: '',
  country: 'Qatar',
  businessDescription: '',
  
  // Contact Information
  contactPerson: '',
  contactPosition: '',
  email: '',
  phone: '',
  alternatePhone: '',
  website: '',
  
  // Address Information
  address: '',
  city: '',
  postalCode: '',
  poBox: '',
  
  // Qatar Legal Information
  tradeLicenseNumber: '',
  tradeLicenseExpiry: '',
  crNumber: '',
  taxNumber: '',
  vatStatus: '',
  registrationDate: '',
  
  // Contract & Billing
  contractType: '',
  paymentTerms: 30,
  creditLimit: 0,
  preferredCurrency: 'QAR',
  
  // Additional Information
  notes: '',
  status: 'Active',
  priority: 'Medium',
  isActive: true
})

// Form options
const businessTypes = [
  'Limited Liability Company (LLC)',
  'Sole Proprietorship',
  'Partnership',
  'Branch Office',
  'Representative Office',
  'Joint Venture',
  'Public Shareholding Company',
  'Private Shareholding Company'
]

const industries = [
  'Construction & Real Estate',
  'Information Technology',
  'Import/Export & Trading',
  'Healthcare & Medical',
  'Education & Training',
  'Hospitality & Tourism',
  'Manufacturing',
  'Transportation & Logistics',
  'Financial Services',
  'Retail & Wholesale',
  'Oil & Gas',
  'Consulting Services',
  'Agriculture & Food',
  'Telecommunications',
  'Engineering Services'
]

const countries = [
  'Qatar',
  'Saudi Arabia',
  'United Arab Emirates',
  'Kuwait',
  'Bahrain',
  'Oman',
  'Other'
]

const vatStatuses = [
  'VAT Registered',
  'Not VAT Registered',
  'Exempt',
  'Pending Registration'
]

const contractTypes = [
  'Annual Service Contract',
  'Project-based Contract',
  'Monthly Service Contract',
  'One-time Service',
  'Maintenance Contract',
  'Retainer Agreement'
]

const currencies = [
  'QAR - Qatari Riyal',
  'USD - US Dollar',
  'EUR - Euro',
  'GBP - British Pound',
  'SAR - Saudi Riyal',
  'AED - UAE Dirham'
]

const statusOptions = [
  'Active',
  'Inactive',
  'Pending',
  'Suspended'
]

const priorityOptions = [
  'High',
  'Medium',
  'Low'
]

// Validation rules
const requiredRules = [
  (v: any) => !!v || 'This field is required'
]

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const phoneRules = [
  (v: string) => !!v || 'Phone number is required',
  (v: string) => /^\d{8}$/.test(v) || 'Phone number must be 8 digits'
]

const futureDateRules = [
  (v: string) => !!v || 'Date is required',
  (v: string) => !isNaN(Date.parse(v)) || 'Invalid date format',
  (v: string) => new Date(v) > new Date() || 'Date must be in the future'
]

// Methods
const resetForm = () => {
  form.value?.reset()
  Object.keys(customer).forEach(key => {
    if (key === 'isActive') {
      customer[key] = true
    } else if (key === 'paymentTerms') {
      customer[key] = 30
    } else if (key === 'creditLimit') {
      customer[key] = 0
    } else if (key === 'country') {
      customer[key] = 'Qatar'
    } else if (key === 'preferredCurrency') {
      customer[key] = 'QAR'
    } else if (key === 'status') {
      customer[key] = 'Active'
    } else if (key === 'priority') {
      customer[key] = 'Medium'
    } else {
      customer[key] = ''
    }
  })
}

const saveAsDraft = async () => {
  saving.value = true
  try {
    // Generate a draft ID
    const draftId = `DRAFT_${Date.now()}`
    
    // Create draft customer object
    const draftCustomer = {
      ...customer,
      id: draftId,
      status: 'Draft',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
    
    // Save to localStorage (in a real app, this would be saved to backend)
    const existingDrafts = JSON.parse(localStorage.getItem('customerDrafts') || '[]')
    existingDrafts.push(draftCustomer)
    localStorage.setItem('customerDrafts', JSON.stringify(existingDrafts))
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert('Customer information saved as draft successfully!')
    
    // Redirect back to customer list
    router.push({ name: 'CustomerList' })
  } catch (error) {
    console.error('Error saving draft:', error)
    alert('Failed to save draft. Please try again.')
  } finally {
    saving.value = false
  }
}

const saveCustomer = async () => {
  if (!formValid.value) {
    alert('Please fill in all required fields correctly.')
    return
  }
  
  saving.value = true
  try {
    // Create new customer object
    const newCustomer = {
      ...customer,
      id: `CUST_${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
    
    // Save to localStorage (in a real app, this would be saved to backend)
    const existingCustomers = JSON.parse(localStorage.getItem('customers') || '[]')
    existingCustomers.push(newCustomer)
    localStorage.setItem('customers', JSON.stringify(existingCustomers))
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    alert(`Customer ${customer.companyName} created successfully!`)
    
    // Redirect back to customer list
    router.push({ name: 'CustomerList' })
  } catch (error) {
    console.error('Error creating customer:', error)
    alert('Failed to create customer. Please try again.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  // Set default registration date to today
  customer.registrationDate = new Date().toISOString().split('T')[0]
})
</script>

<style scoped>
.customer-create {
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

/* Card title styling */
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