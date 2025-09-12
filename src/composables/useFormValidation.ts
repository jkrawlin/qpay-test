import { ref, computed, watch } from 'vue'

export interface ValidationRule {
  (value: any): boolean | string
}

export interface FieldValidation {
  value: any
  rules: ValidationRule[]
  errorMessage: string
  isValid: boolean
  isDirty: boolean
  isTouched: boolean
}

export interface FormValidationConfig {
  [fieldName: string]: {
    rules: ValidationRule[]
    immediate?: boolean
  }
}

export function useFormValidation(config: FormValidationConfig) {
  const fields = ref<Record<string, FieldValidation>>({})
  const isSubmitting = ref(false)
  const hasSubmitted = ref(false)

  // Initialize fields
  Object.keys(config).forEach(fieldName => {
    fields.value[fieldName] = {
      value: null,
      rules: config[fieldName].rules,
      errorMessage: '',
      isValid: true,
      isDirty: false,
      isTouched: false
    }
  })

  const isFormValid = computed(() => {
    return Object.values(fields.value).every(field => field.isValid)
  })

  const hasErrors = computed(() => {
    return Object.values(fields.value).some(field => !field.isValid && field.isTouched)
  })

  const getFieldErrors = computed(() => {
    const errors: Record<string, string> = {}
    Object.entries(fields.value).forEach(([fieldName, field]) => {
      if (!field.isValid && field.isTouched) {
        errors[fieldName] = field.errorMessage
      }
    })
    return errors
  })

  const validateField = (fieldName: string): boolean => {
    const field = fields.value[fieldName]
    if (!field) return true

    for (const rule of field.rules) {
      const result = rule(field.value)
      if (result !== true) {
        field.errorMessage = typeof result === 'string' ? result : 'Invalid value'
        field.isValid = false
        return false
      }
    }

    field.errorMessage = ''
    field.isValid = true
    return true
  }

  const validateAllFields = (): boolean => {
    let allValid = true
    Object.keys(fields.value).forEach(fieldName => {
      fields.value[fieldName].isTouched = true
      if (!validateField(fieldName)) {
        allValid = false
      }
    })
    return allValid
  }

  const setFieldValue = (fieldName: string, value: any, shouldValidate: boolean = false) => {
    const field = fields.value[fieldName]
    if (!field) return

    field.value = value
    field.isDirty = true

    if (shouldValidate || field.isTouched || hasSubmitted.value) {
      validateField(fieldName)
    }
  }

  const setFieldTouched = (fieldName: string, touched: boolean = true) => {
    const field = fields.value[fieldName]
    if (!field) return

    field.isTouched = touched
    if (touched) {
      validateField(fieldName)
    }
  }

  const resetField = (fieldName: string) => {
    const field = fields.value[fieldName]
    if (!field) return

    field.value = null
    field.errorMessage = ''
    field.isValid = true
    field.isDirty = false
    field.isTouched = false
  }

  const resetForm = () => {
    Object.keys(fields.value).forEach(resetField)
    hasSubmitted.value = false
    isSubmitting.value = false
  }

  const getFieldProps = (fieldName: string) => {
    const field = fields.value[fieldName]
    if (!field) return {}

    return {
      modelValue: field.value,
      'onUpdate:modelValue': (value: any) => setFieldValue(fieldName, value, true),
      onBlur: () => setFieldTouched(fieldName, true),
      error: !field.isValid && field.isTouched,
      errorMessages: !field.isValid && field.isTouched ? [field.errorMessage] : [],
      rules: field.rules
    }
  }

  const handleSubmit = async (submitFunction: () => Promise<void> | void) => {
    hasSubmitted.value = true
    
    if (!validateAllFields()) {
      return false
    }

    isSubmitting.value = true
    try {
      await submitFunction()
      return true
    } finally {
      isSubmitting.value = false
    }
  }

  // Watch for immediate validation if configured
  Object.entries(config).forEach(([fieldName, fieldConfig]) => {
    if (fieldConfig.immediate) {
      watch(
        () => fields.value[fieldName]?.value,
        () => {
          if (fields.value[fieldName]?.isDirty) {
            validateField(fieldName)
          }
        }
      )
    }
  })

  return {
    fields,
    isFormValid,
    hasErrors,
    getFieldErrors,
    isSubmitting,
    hasSubmitted,
    validateField,
    validateAllFields,
    setFieldValue,
    setFieldTouched,
    resetField,
    resetForm,
    getFieldProps,
    handleSubmit
  }
}

// Common validation rules
export const ValidationRules = {
  required: (message = 'This field is required') => (value: any) => {
    if (value === null || value === undefined || value === '') {
      return message
    }
    return true
  },

  email: (message = 'Please enter a valid email address') => (value: string) => {
    if (!value) return true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? true : message
  },

  minLength: (min: number, message?: string) => (value: string) => {
    if (!value) return true
    return value.length >= min ? true : (message || `Must be at least ${min} characters`)
  },

  maxLength: (max: number, message?: string) => (value: string) => {
    if (!value) return true
    return value.length <= max ? true : (message || `Must be no more than ${max} characters`)
  },

  pattern: (regex: RegExp, message = 'Invalid format') => (value: string) => {
    if (!value) return true
    return regex.test(value) ? true : message
  },

  numeric: (message = 'Must be a number') => (value: any) => {
    if (!value) return true
    return !isNaN(Number(value)) ? true : message
  },

  min: (minimum: number, message?: string) => (value: any) => {
    if (!value) return true
    const num = Number(value)
    return num >= minimum ? true : (message || `Must be at least ${minimum}`)
  },

  max: (maximum: number, message?: string) => (value: any) => {
    if (!value) return true
    const num = Number(value)
    return num <= maximum ? true : (message || `Must be no more than ${maximum}`)
  },

  qatarId: (message = 'Qatar ID must be 11 digits') => (value: string) => {
    if (!value) return true
    return /^\d{11}$/.test(value) ? true : message
  },

  phone: (message = 'Phone number must be 8 digits') => (value: string) => {
    if (!value) return true
    return /^\d{8}$/.test(value) ? true : message
  },

  passport: (message = 'Invalid passport number format') => (value: string) => {
    if (!value) return true
    return /^[A-Z0-9]{6,9}$/.test(value) ? true : message
  },

  date: (message = 'Please enter a valid date') => (value: string) => {
    if (!value) return true
    return !isNaN(Date.parse(value)) ? true : message
  },

  futureDate: (message = 'Date must be in the future') => (value: string) => {
    if (!value) return true
    return new Date(value) > new Date() ? true : message
  }
}