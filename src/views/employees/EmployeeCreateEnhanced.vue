<template>
  <div class="employee-create-enhanced">
    <v-container fluid>
      <!-- Header -->
      <v-row class="mb-4">
        <v-col cols="12">
          <enhanced-card class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <h1 class="text-h4 font-weight-bold text-primary mb-1">
                  {{ pageTitle }}
                </h1>
                <p class="text-body-1 text-grey-darken-1 ma-0">
                  {{ pageSubtitle }}
                </p>
              </div>
              <div class="d-flex gap-2">
                <v-btn
                  variant="outlined"
                  :to="{ name: backRoute }"
                  prepend-icon="mdi-arrow-left"
                >
                  Back to List
                </v-btn>
                <v-btn
                  color="warning"
                  variant="outlined"
                  prepend-icon="mdi-content-save"
                  @click="saveDraft"
                  :loading="saving"
                  :disabled="!isDirty"
                >
                  Save Draft
                </v-btn>
              </div>
            </div>
          </enhanced-card>
        </v-col>
      </v-row>

      <!-- Progress Indicator -->
      <v-row class="mb-4">
        <v-col cols="12">
          <enhanced-card>
            <v-card-text class="pa-4">
              <v-stepper
                v-model="currentStep"
                :items="stepperItems"
                hide-actions
                class="elevation-0"
              >
                <template #item.icon="{ item }">
                  <v-icon :color="getStepColor(item.value)">
                    {{ item.icon }}
                  </v-icon>
                </template>
              </v-stepper>
            </v-card-text>
          </enhanced-card>
        </v-col>
      </v-row>

      <!-- Form Content -->
      <v-form ref="form" v-model="formValid" @submit.prevent="saveEmployee">
        <v-window v-model="currentStep">
          <!-- Step 1: Personal Information -->
          <v-window-item value="1">
            <v-row>
              <v-col cols="12" lg="8">
                <enhanced-card
                  title="Personal Information"
                  subtitle="Basic employee details and identification"
                  icon="mdi-account"
                  icon-color="primary"
                >
                  <v-card-text class="pa-6">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="employee.firstName.value"
                          label="First Name"
                          variant="outlined"
                          density="compact"
                          :rules="employee.firstName.rules"
                          :error-messages="employee.firstName.errorMessage"
                          required
                          prepend-inner-icon="mdi-account"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="employee.lastName.value"
                          label="Last Name"
                          variant="outlined"
                          density="compact"
                          :rules="employee.lastName.rules"
                          :error-messages="employee.lastName.errorMessage"
                          required
                          prepend-inner-icon="mdi-account"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="employee.email.value"
                          label="Email Address"
                          variant="outlined"
                          density="compact"
                          :rules="employee.email.rules"
                          :error-messages="employee.email.errorMessage"
                          required
                          type="email"
                          prepend-inner-icon="mdi-email"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="employee.phone.value"
                          label="Phone Number"
                          variant="outlined"
                          density="compact"
                          :rules="employee.phone.rules"
                          :error-messages="employee.phone.errorMessage"
                          required
                          prepend-inner-icon="mdi-phone"
                          placeholder="+974 XXXXXXXX"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="employee.qatarId.value"
                          label="Qatar ID"
                          variant="outlined"
                          density="compact"
                          :rules="employee.qatarId.rules"
                          :error-messages="employee.qatarId.errorMessage"
                          required
                          prepend-inner-icon="mdi-card-account-details"
                          placeholder="12345678901"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="employee.passportNumber.value"
                          label="Passport Number"
                          variant="outlined"
                          density="compact"
                          :rules="employee.passportNumber.rules"
                          :error-messages="employee.passportNumber.errorMessage"
                          required
                          prepend-inner-icon="mdi-passport"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="employee.gender.value"
                          label="Gender"
                          variant="outlined"
                          density="compact"
                          :items="genderOptions"
                          :rules="employee.gender.rules"
                          :error-messages="employee.gender.errorMessage"
                          required
                          prepend-inner-icon="mdi-human-male-female"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <VueDatePicker
                          v-model="employee.dateOfBirth.value"
                          placeholder="Select Date of Birth"
                          format="yyyy-MM-dd"
                          :enable-time-picker="false"
                          :max-date="new Date()"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-autocomplete
                          v-model="employee.nationality.value"
                          label="Nationality"
                          variant="outlined"
                          density="compact"
                          :items="nationalityOptions"
                          :rules="employee.nationality.rules"
                          :error-messages="employee.nationality.errorMessage"
                          required
                          prepend-inner-icon="mdi-flag"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="employee.maritalStatus"
                          label="Marital Status"
                          variant="outlined"
                          density="compact"
                          :items="maritalStatusOptions"
                          prepend-inner-icon="mdi-heart"
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          v-model="employee.address"
                          label="Address in Qatar"
                          variant="outlined"
                          density="compact"
                          rows="3"
                          prepend-inner-icon="mdi-map-marker"
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </enhanced-card>
              </v-col>
              <v-col cols="12" lg="4">
                <enhanced-card
                  title="Emergency Contact"
                  subtitle="Contact person in case of emergency"
                  icon="mdi-phone-alert"
                  icon-color="error"
                >
                  <v-card-text class="pa-6">
                    <v-text-field
                      v-model="employee.emergencyContact.name"
                      label="Contact Name"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-account"
                      class="mb-4"
                    />
                    <v-text-field
                      v-model="employee.emergencyContact.relationship"
                      label="Relationship"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-account-heart"
                      class="mb-4"
                    />
                    <v-text-field
                      v-model="employee.emergencyContact.phone"
                      label="Phone Number"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-phone"
                    />
                  </v-card-text>
                </enhanced-card>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Step 2: Employment Details -->
          <v-window-item value="2">
            <v-row>
              <v-col cols="12" lg="8">
                <enhanced-card
                  title="Employment Information"
                  subtitle="Job role, department, and compensation details"
                  icon="mdi-briefcase"
                  icon-color="primary"
                >
                  <v-card-text class="pa-6">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="employeeId"
                          label="Employee ID"
                          variant="outlined"
                          density="compact"
                          readonly
                          prepend-inner-icon="mdi-identifier"
                          hint="Auto-generated on save"
                          persistent-hint
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-autocomplete
                          v-model="employee.position.value"
                          label="Position"
                          variant="outlined"
                          density="compact"
                          :items="positionOptions"
                          :rules="employee.position.rules"
                          :error-messages="employee.position.errorMessage"
                          required
                          prepend-inner-icon="mdi-account-tie"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="employee.department.value"
                          label="Department"
                          variant="outlined"
                          density="compact"
                          :items="departmentOptions"
                          :rules="employee.department.rules"
                          :error-messages="employee.department.errorMessage"
                          required
                          prepend-inner-icon="mdi-office-building"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <VueDatePicker
                          v-model="employee.hireDate.value"
                          placeholder="Select Hire Date"
                          format="yyyy-MM-dd"
                          :enable-time-picker="false"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="employee.basicSalary.value"
                          label="Basic Salary (QAR)"
                          variant="outlined"
                          density="compact"
                          :rules="employee.basicSalary.rules"
                          :error-messages="employee.basicSalary.errorMessage"
                          required
                          type="number"
                          prepend-inner-icon="mdi-cash"
                        />
                      </v-col>
                      <v-col cols="12" md="6" v-if="employeeType !== 'temporary'">
                        <v-text-field
                          v-model="employee.sponsor"
                          label="Sponsor Company"
                          variant="outlined"
                          density="compact"
                          readonly
                          prepend-inner-icon="mdi-domain"
                        />
                      </v-col>
                    </v-row>

                    <!-- Allowances Section -->
                    <v-divider class="my-6" />
                    <h3 class="text-h6 mb-4 d-flex align-center">
                      <v-icon class="mr-2" color="success">mdi-cash-plus</v-icon>
                      Allowances
                    </h3>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="employee.allowances.housing"
                          label="Housing Allowance (QAR)"
                          variant="outlined"
                          density="compact"
                          type="number"
                          prepend-inner-icon="mdi-home"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="employee.allowances.transportation"
                          label="Transportation Allowance (QAR)"
                          variant="outlined"
                          density="compact"
                          type="number"
                          prepend-inner-icon="mdi-car"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="employee.allowances.food"
                          label="Food Allowance (QAR)"
                          variant="outlined"
                          density="compact"
                          type="number"
                          prepend-inner-icon="mdi-food"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="employee.allowances.other"
                          label="Other Allowances (QAR)"
                          variant="outlined"
                          density="compact"
                          type="number"
                          prepend-inner-icon="mdi-plus"
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </enhanced-card>
              </v-col>
              <v-col cols="12" lg="4">
                <enhanced-card
                  title="Salary Summary"
                  subtitle="Total compensation breakdown"
                  icon="mdi-calculator"
                  icon-color="success"
                >
                  <v-card-text class="pa-6">
                    <v-list>
                      <v-list-item class="px-0">
                        <v-list-item-title>Basic Salary</v-list-item-title>
                        <template #append>
                          <span class="font-weight-bold">{{ formatCurrency(employee.basicSalary.value || 0) }}</span>
                        </template>
                      </v-list-item>
                      <v-list-item class="px-0">
                        <v-list-item-title>Housing</v-list-item-title>
                        <template #append>
                          <span>{{ formatCurrency(employee.allowances.housing || 0) }}</span>
                        </template>
                      </v-list-item>
                      <v-list-item class="px-0">
                        <v-list-item-title>Transportation</v-list-item-title>
                        <template #append>
                          <span>{{ formatCurrency(employee.allowances.transportation || 0) }}</span>
                        </template>
                      </v-list-item>
                      <v-list-item class="px-0">
                        <v-list-item-title>Food</v-list-item-title>
                        <template #append>
                          <span>{{ formatCurrency(employee.allowances.food || 0) }}</span>
                        </template>
                      </v-list-item>
                      <v-list-item class="px-0">
                        <v-list-item-title>Other</v-list-item-title>
                        <template #append>
                          <span>{{ formatCurrency(employee.allowances.other || 0) }}</span>
                        </template>
                      </v-list-item>
                      <v-divider class="my-2" />
                      <v-list-item class="px-0">
                        <v-list-item-title class="font-weight-bold text-success">Total Monthly</v-list-item-title>
                        <template #append>
                          <span class="font-weight-bold text-success text-h6">{{ formatCurrency(totalSalary) }}</span>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </enhanced-card>

                <!-- Contract Information for Temporary Employees -->
                <enhanced-card
                  v-if="employeeType === 'temporary'"
                  title="Contract Details"
                  subtitle="Temporary employment contract information"
                  icon="mdi-file-document"
                  icon-color="warning"
                  class="mt-4"
                >
                  <v-card-text class="pa-6">
                    <v-select
                      v-model="employee.contract.type"
                      label="Contract Type"
                      variant="outlined"
                      density="compact"
                      :items="contractTypeOptions"
                      prepend-inner-icon="mdi-file-document"
                      class="mb-4"
                    />
                    <v-text-field
                      v-model="employee.contract.duration"
                      label="Duration (months)"
                      variant="outlined"
                      density="compact"
                      type="number"
                      prepend-inner-icon="mdi-calendar-range"
                      @input="calculateEndDate"
                      class="mb-4"
                    />
                    <VueDatePicker
                      v-model="employee.contract.startDate"
                      placeholder="Contract Start Date"
                      format="yyyy-MM-dd"
                      :enable-time-picker="false"
                      @update:model-value="calculateEndDate"
                      class="mb-4"
                    />
                    <VueDatePicker
                      v-model="employee.contract.endDate"
                      placeholder="Contract End Date"
                      format="yyyy-MM-dd"
                      :enable-time-picker="false"
                      readonly
                    />
                  </v-card-text>
                </enhanced-card>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Step 3: Banking & Documents -->
          <v-window-item value="3">
            <v-row>
              <v-col cols="12" lg="6">
                <enhanced-card
                  title="Banking Information"
                  subtitle="Salary payment details"
                  icon="mdi-bank"
                  icon-color="primary"
                >
                  <v-card-text class="pa-6">
                    <v-text-field
                      v-model="employee.banking.accountHolder"
                      label="Account Holder Name"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-account"
                      class="mb-4"
                    />
                    <v-select
                      v-model="employee.banking.bankName"
                      label="Bank Name"
                      variant="outlined"
                      density="compact"
                      :items="bankOptions"
                      prepend-inner-icon="mdi-bank"
                      class="mb-4"
                    />
                    <v-text-field
                      v-model="employee.banking.accountNumber"
                      label="Account Number"
                      variant="outlined"
                      density="compact"
                      prepend-inner-icon="mdi-credit-card"
                      class="mb-4"
                    />
                    <v-text-field
                      v-model="employee.banking.iban"
                      label="IBAN"
                      variant="outlined"
                      density="compact"
                      :rules="ibanRules"
                      prepend-inner-icon="mdi-bank-transfer"
                      placeholder="QA XX AAAA ##################"
                    />
                  </v-card-text>
                </enhanced-card>
              </v-col>
              <v-col cols="12" lg="6">
                <enhanced-card
                  title="Document Upload"
                  subtitle="Required documents for employment"
                  icon="mdi-file-upload"
                  icon-color="info"
                >
                  <v-card-text class="pa-6">
                    <div class="document-upload-section mb-4">
                      <h4 class="text-body-1 font-weight-medium mb-2 d-flex align-center">
                        <v-icon class="mr-2" color="primary">mdi-card-account-details</v-icon>
                        Qatar ID Copy
                      </h4>
                      <div v-if="employee.documents.qatarId" class="document-preview mb-2">
                        <div class="d-flex align-center justify-space-between pa-2 bg-grey-lighten-5 rounded">
                          <div class="d-flex align-center">
                            <v-icon color="success" class="mr-2">mdi-file-check</v-icon>
                            <span class="text-body-2">{{ employee.documents.qatarId.name }}</span>
                          </div>
                          <v-btn
                            icon="mdi-delete"
                            variant="text"
                            size="small"
                            color="error"
                            @click="removeDocument('qatarId')"
                          />
                        </div>
                      </div>
                      <v-file-input
                        label="Upload Qatar ID (PDF/Image)"
                        variant="outlined"
                        density="compact"
                        accept=".pdf,.jpg,.jpeg,.png"
                        prepend-icon="mdi-paperclip"
                        @change="handleFileUpload($event, 'qatarId')"
                        hide-details
                      />
                    </div>

                    <div class="document-upload-section mb-4">
                      <h4 class="text-body-1 font-weight-medium mb-2 d-flex align-center">
                        <v-icon class="mr-2" color="primary">mdi-passport</v-icon>
                        Passport Copy
                      </h4>
                      <div v-if="employee.documents.passport" class="document-preview mb-2">
                        <div class="d-flex align-center justify-space-between pa-2 bg-grey-lighten-5 rounded">
                          <div class="d-flex align-center">
                            <v-icon color="success" class="mr-2">mdi-file-check</v-icon>
                            <span class="text-body-2">{{ employee.documents.passport.name }}</span>
                          </div>
                          <v-btn
                            icon="mdi-delete"
                            variant="text"
                            size="small"
                            color="error"
                            @click="removeDocument('passport')"
                          />
                        </div>
                      </div>
                      <v-file-input
                        label="Upload Passport (PDF/Image)"
                        variant="outlined"
                        density="compact"
                        accept=".pdf,.jpg,.jpeg,.png"
                        prepend-icon="mdi-paperclip"
                        @change="handleFileUpload($event, 'passport')"
                        hide-details
                      />
                    </div>

                    <div class="document-upload-section">
                      <h4 class="text-body-1 font-weight-medium mb-2 d-flex align-center">
                        <v-icon class="mr-2" color="primary">mdi-file-document</v-icon>
                        CV/Resume
                      </h4>
                      <div v-if="employee.documents.cv" class="document-preview mb-2">
                        <div class="d-flex align-center justify-space-between pa-2 bg-grey-lighten-5 rounded">
                          <div class="d-flex align-center">
                            <v-icon color="success" class="mr-2">mdi-file-check</v-icon>
                            <span class="text-body-2">{{ employee.documents.cv.name }}</span>
                          </div>
                          <v-btn
                            icon="mdi-delete"
                            variant="text"
                            size="small"
                            color="error"
                            @click="removeDocument('cv')"
                          />
                        </div>
                      </div>
                      <v-file-input
                        label="Upload CV/Resume (PDF)"
                        variant="outlined"
                        density="compact"
                        accept=".pdf"
                        prepend-icon="mdi-paperclip"
                        @change="handleFileUpload($event, 'cv')"
                        hide-details
                      />
                    </div>
                  </v-card-text>
                </enhanced-card>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>

        <!-- Navigation Buttons -->
        <v-row class="mt-6">
          <v-col cols="12">
            <enhanced-card>
              <v-card-text class="pa-4">
                <div class="d-flex justify-space-between align-center">
                  <v-btn
                    v-if="currentStep > 1"
                    variant="outlined"
                    prepend-icon="mdi-arrow-left"
                    @click="currentStep--"
                  >
                    Previous
                  </v-btn>
                  <v-spacer v-else />
                  
                  <div class="d-flex gap-2">
                    <v-btn
                      v-if="currentStep < 3"
                      color="primary"
                      append-icon="mdi-arrow-right"
                      @click="nextStep"
                      :disabled="!validateStep(currentStep)"
                    >
                      Next
                    </v-btn>
                    <v-btn
                      v-else
                      color="success"
                      prepend-icon="mdi-check"
                      type="submit"
                      :loading="saving"
                      :disabled="!formValid"
                    >
                      Create Employee
                    </v-btn>
                  </div>
                </div>
                
                <!-- Form Validation Summary -->
                <div v-if="hasErrors && currentStep === 3" class="mt-4">
                  <v-alert
                    type="warning"
                    variant="tonal"
                    class="mb-0"
                  >
                    <template #title>Form Validation Issues</template>
                    Please review and fix the following issues before submitting:
                    <ul class="mt-2">
                      <li v-for="error in getFormErrors()" :key="error">{{ error }}</li>
                    </ul>
                  </v-alert>
                </div>
              </v-card-text>
            </enhanced-card>
          </v-col>
        </v-row>
      </v-form>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useFormValidation, ValidationRules } from '@/composables/useFormValidation'
import { useAsync } from '@/composables/useAsync'
import EnhancedCard from '@/components/common/EnhancedCard.vue'

const router = useRouter()
const route = useRoute()
const { showSuccess, showError, showWarning } = useToast()

// Form validation setup
const form = ref()
const { 
  createField, 
  validateForm, 
  resetForm, 
  isDirty,
  hasErrors 
} = useFormValidation()

// Async operations
const { executeAsync, loading: saving } = useAsync()

// State
const currentStep = ref(1)
const formValid = ref(false)

// Props
const employeeType = computed(() => route.query.type as string || 'nipon')

// Employee data with validation
const employee = reactive({
  firstName: createField('', [ValidationRules.required]),
  lastName: createField('', [ValidationRules.required]),
  email: createField('', [ValidationRules.required, ValidationRules.email]),
  phone: createField('', [ValidationRules.required, ValidationRules.qatarPhone]),
  qatarId: createField('', [ValidationRules.required, ValidationRules.qatarId]),
  passportNumber: createField('', [ValidationRules.required, ValidationRules.passport]),
  nationality: createField('', [ValidationRules.required]),
  gender: createField('', [ValidationRules.required]),
  dateOfBirth: createField('', [ValidationRules.required]),
  position: createField('', [ValidationRules.required]),
  department: createField('', [ValidationRules.required]),
  hireDate: createField('', [ValidationRules.required]),
  basicSalary: createField(0, [ValidationRules.required, ValidationRules.number]),
  
  // Non-validated fields
  maritalStatus: '',
  address: '',
  sponsor: employeeType.value === 'temporary' ? '' : 'Al Wakra Construction Company',
  
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  },
  documents: {
    passport: null,
    qatarId: null,
    visa: null,
    cv: null
  },
  banking: {
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    iban: ''
  },
  contract: {
    type: '',
    duration: '',
    startDate: '',
    endDate: ''
  },
  allowances: {
    housing: 0,
    transportation: 0,
    food: 0,
    other: 0
  }
})

// Computed properties
const backRoute = computed(() => {
  return employeeType.value === 'temporary' ? 'TemporaryEmployees' : 'NiponEmployees'
})

const pageTitle = computed(() => {
  return employeeType.value === 'temporary' 
    ? 'Add New Temporary Employee' 
    : 'Add New Nipon Employee'
})

const pageSubtitle = computed(() => {
  return employeeType.value === 'temporary'
    ? 'Register a new temporary employee with contract and visa information'
    : 'Register a new employee under Nipon sponsorship with Qatar compliance information'
})

const employeeId = computed(() => {
  const prefix = employeeType.value === 'temporary' ? 'TEMP' : 'NIP'
  return `${prefix}_${Date.now().toString().slice(-6)}`
})

const totalSalary = computed(() => {
  return (employee.basicSalary.value || 0) + 
         (employee.allowances.housing || 0) + 
         (employee.allowances.transportation || 0) + 
         (employee.allowances.food || 0) + 
         (employee.allowances.other || 0)
})

// Stepper configuration
const stepperItems = [
  { 
    title: 'Personal Information', 
    value: 1, 
    icon: 'mdi-account' 
  },
  { 
    title: 'Employment Details', 
    value: 2, 
    icon: 'mdi-briefcase' 
  },
  { 
    title: 'Banking & Documents', 
    value: 3, 
    icon: 'mdi-file-document' 
  }
]

// Data options
const genderOptions = [
  { title: 'Male', value: 'male' },
  { title: 'Female', value: 'female' }
]

const maritalStatusOptions = [
  { title: 'Single', value: 'single' },
  { title: 'Married', value: 'married' },
  { title: 'Divorced', value: 'divorced' },
  { title: 'Widowed', value: 'widowed' }
]

const nationalityOptions = [
  'Qatari', 'Indian', 'Pakistani', 'Filipino', 'Bangladeshi', 'Nepalese', 'Sri Lankan',
  'Egyptian', 'Sudanese', 'Syrian', 'Lebanese', 'Jordanian', 'Palestinian', 'American',
  'British', 'Canadian', 'Australian', 'French', 'German', 'Italian', 'Spanish', 'Other'
]

const departmentOptions = [
  { title: 'Engineering', value: 'engineering' },
  { title: 'Construction', value: 'construction' },
  { title: 'Finance', value: 'finance' },
  { title: 'Human Resources', value: 'hr' },
  { title: 'Operations', value: 'operations' },
  { title: 'Quality Control', value: 'quality' },
  { title: 'Safety', value: 'safety' },
  { title: 'Administration', value: 'admin' }
]

const positionOptions = [
  'Project Manager', 'Site Engineer', 'Foreman', 'Supervisor', 'Technician', 'Operator',
  'Accountant', 'HR Specialist', 'Administrative Assistant', 'Safety Officer', 'QC Inspector',
  'Architect', 'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Plumber',
  'Carpenter', 'Mason', 'Steel Fixer', 'Driver', 'Security Guard', 'Cleaner'
]

const contractTypeOptions = [
  { title: 'Permanent', value: 'permanent' },
  { title: 'Fixed-term', value: 'fixed_term' },
  { title: 'Project-based', value: 'project_based' },
  { title: 'Probationary', value: 'probationary' }
]

const bankOptions = [
  'Qatar National Bank (QNB)', 'Commercial Bank of Qatar', 'Doha Bank', 'Ahli Bank',
  'Qatar Islamic Bank', 'Barwa Bank', 'International Bank of Qatar', 'Masraf Al Rayan',
  'Qatar Development Bank', 'HSBC Qatar', 'Standard Chartered Qatar'
]

// Validation rules
const ibanRules = [
  (v: string) => !v || /^QA\d{2}[A-Z0-9]{4}\d{18}$/.test(v) || 'Invalid Qatar IBAN format (QAxxAAAA##################)'
]

// Methods
const getStepColor = (step: number) => {
  if (step < currentStep.value) return 'success'
  if (step === currentStep.value) return 'primary'
  return 'grey'
}

const validateStep = (step: number): boolean => {
  switch (step) {
    case 1: // Personal Information
      return !!(employee.firstName.value && employee.lastName.value && 
                employee.email.value && employee.phone.value && 
                employee.qatarId.value && employee.nationality.value)
    case 2: // Employment Details
      return !!(employee.position.value && employee.department.value && 
                employee.hireDate.value && employee.basicSalary.value)
    case 3: // Banking & Documents
      return !!(employee.banking.accountHolder && employee.banking.bankName)
    default:
      return true
  }
}

const nextStep = () => {
  if (validateStep(currentStep.value)) {
    currentStep.value++
  } else {
    showWarning('Please complete all required fields in this step')
  }
}

const getFormErrors = () => {
  const errors: string[] = []
  
  if (!employee.firstName.value) errors.push('First name is required')
  if (!employee.lastName.value) errors.push('Last name is required')
  if (!employee.email.value) errors.push('Email is required')
  if (!employee.phone.value) errors.push('Phone number is required')
  if (!employee.position.value) errors.push('Position is required')
  if (!employee.department.value) errors.push('Department is required')
  if (!employee.basicSalary.value) errors.push('Basic salary is required')
  
  return errors
}

const handleFileUpload = (event: Event, documentType: string) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('File size must be less than 5MB')
      return
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      showError('Only PDF, JPG, and PNG files are allowed')
      return
    }
    
    employee.documents[documentType as keyof typeof employee.documents] = file
    showSuccess(`${documentType} uploaded successfully`)
  }
}

const removeDocument = (documentType: string) => {
  employee.documents[documentType as keyof typeof employee.documents] = null
  showSuccess(`${documentType} removed`)
}

const calculateEndDate = () => {
  if (employee.contract.startDate && employee.contract.duration) {
    const startDate = new Date(employee.contract.startDate)
    const durationMonths = parseInt(employee.contract.duration)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + durationMonths)
    employee.contract.endDate = endDate.toISOString().split('T')[0]
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: 'QAR',
    minimumFractionDigits: 0
  }).format(value)
}

const saveDraft = async () => {
  if (!isDirty.value) {
    showWarning('No changes to save')
    return
  }

  await executeAsync(async () => {
    // Create draft employee object
    const draftEmployee = {
      ...employee,
      employeeId: employeeId.value,
      id: `DRAFT_${Date.now()}`,
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
    
    showSuccess('Employee information saved as draft successfully!')
    
    // Redirect back to the previous page
    router.push({ name: backRoute.value })
  }, 'Saving draft...')
}

const saveEmployee = async () => {
  if (!await validateForm()) {
    showError('Please fill in all required fields correctly.')
    return
  }
  
  await executeAsync(async () => {
    // Create new employee object
    const newEmployee = {
      ...employee,
      employeeId: employeeId.value,
      id: `EMP_${Date.now()}`,
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
    
    // Save to localStorage (in a real app, this would be saved to backend)
    const existingEmployees = JSON.parse(localStorage.getItem('employees') || '[]')
    existingEmployees.push(newEmployee)
    localStorage.setItem('employees', JSON.stringify(existingEmployees))
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    showSuccess(`Employee ${employee.firstName.value} ${employee.lastName.value} created successfully!`)
    
    // Redirect back to the previous page
    router.push({ name: backRoute.value })
  }, 'Creating employee...')
}

onMounted(() => {
  // Set default hire date to today
  employee.hireDate.value = new Date().toISOString().split('T')[0]
})
</script>

<style scoped>
.employee-create-enhanced {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.document-upload-section {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 16px;
  background: rgba(248, 249, 250, 0.5);
}

.document-preview {
  transition: all 0.2s ease;
}

.document-preview:hover {
  background: rgba(25, 118, 210, 0.04) !important;
}

:deep(.v-stepper) {
  box-shadow: none !important;
  background: transparent !important;
}

:deep(.v-stepper-header) {
  box-shadow: none !important;
}

:deep(.v-stepper-item) {
  padding: 12px 24px;
}

:deep(.v-stepper-item__avatar) {
  margin-right: 16px;
}

.v-window-item {
  padding: 0;
}

:deep(.v-card) {
  transition: all 0.3s ease;
}

:deep(.v-card:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

@media (max-width: 600px) {
  .v-container {
    padding: 12px;
  }
  
  :deep(.v-stepper-item__title) {
    font-size: 0.875rem;
  }
}
</style>