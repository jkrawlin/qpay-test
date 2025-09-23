<template>
  <v-card>
    <v-card-title>
      <v-icon left>mdi-file-upload</v-icon>
      Document Upload
    </v-card-title>
    
    <v-card-text>
      <!-- Document Type Selection -->
      <v-select
        v-model="documentType"
        :items="documentTypes"
        label="Document Type"
        prepend-icon="mdi-file-document"
        required
      ></v-select>

      <!-- File Upload Area -->
      <v-file-input
        v-model="files"
        :accept="acceptedFormats"
        label="Select Document"
        prepend-icon="mdi-paperclip"
        show-size
        counter
        multiple
        @change="handleFileSelect"
      >
        <template v-slot:selection="{ text }">
          <v-chip small label color="primary">
            {{ text }}
          </v-chip>
        </template>
      </v-file-input>

      <!-- Preview Area -->
      <v-row v-if="previews.length > 0" class="mt-4">
        <v-col v-for="(preview, index) in previews" :key="index" cols="12" md="6">
          <v-card outlined>
            <v-img
              v-if="preview.type === 'image'"
              :src="preview.url"
              height="200"
              contain
            ></v-img>
            <v-card-text v-else>
              <v-icon large>mdi-file-pdf</v-icon>
              <p>{{ preview.name }}</p>
            </v-card-text>
            <v-card-actions>
              <v-btn text small color="error" @click="removeFile(index)">
                Remove
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- OCR Results -->
      <v-alert v-if="ocrResults" type="info" class="mt-4">
        <h4>Extracted Information:</h4>
        <div v-for="(value, key) in ocrResults" :key="key">
          <strong>{{ key }}:</strong> {{ value }}
        </div>
      </v-alert>

      <!-- Upload Progress -->
      <v-progress-linear
        v-if="uploading"
        :value="uploadProgress"
        color="primary"
        height="25"
        striped
      >
        <template v-slot:default="{ value }">
          <strong>{{ Math.ceil(value) }}%</strong>
        </template>
      </v-progress-linear>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="cancel">Cancel</v-btn>
      <v-btn
        color="primary"
        :loading="uploading"
        :disabled="files.length === 0"
        @click="uploadDocuments"
      >
        Upload Documents
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { documentService } from '@/services/documentService'
import { useNotification } from '@/composables/useNotification'

const emit = defineEmits(['uploaded', 'cancelled'])
const props = defineProps<{
  employeeId?: string
}>()

const { showSuccess, showError } = useNotification()

const documentType = ref('qatar-id')
const files = ref<File[]>([])
const previews = ref<any[]>([])
const uploading = ref(false)
const uploadProgress = ref(0)
const ocrResults = ref<any>(null)

const documentTypes = [
  { text: 'Qatar ID', value: 'qatar-id' },
  { text: 'Passport', value: 'passport' },
  { text: 'Visa', value: 'visa' },
  { text: 'Work Permit', value: 'work-permit' },
  { text: 'Contract', value: 'contract' },
  { text: 'Other', value: 'other' }
]

const acceptedFormats = computed(() => {
  return documentType.value === 'contract' 
    ? '.pdf,.doc,.docx' 
    : 'image/*,.pdf'
})

const handleFileSelect = async () => {
  previews.value = []
  
  for (const file of files.value) {
    const preview = {
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'pdf',
      url: ''
    }
    
    if (preview.type === 'image') {
      preview.url = URL.createObjectURL(file)
      
      // Perform OCR on Qatar ID or Passport
      if (['qatar-id', 'passport'].includes(documentType.value)) {
        try {
          const extracted = await documentService.performOCR(file)
          ocrResults.value = extracted
        } catch (error) {
          console.error('OCR failed:', error)
        }
      }
    }
    
    previews.value.push(preview)
  }
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
  previews.value.splice(index, 1)
}

const uploadDocuments = async () => {
  uploading.value = true
  uploadProgress.value = 0
  
  try {
    const uploadedUrls = []
    const totalFiles = files.value.length
    
    for (let i = 0; i < totalFiles; i++) {
      const file = files.value[i]
      
      // Encrypt sensitive documents
      const encrypted = await documentService.encryptDocument(file)
      
      // Upload to Firebase Storage
      const url = await documentService.uploadToStorage(
        encrypted,
        documentType.value,
        (progress) => {
          uploadProgress.value = ((i + progress / 100) / totalFiles) * 100
        }
      )
      
      uploadedUrls.push(url)
    }
    
    // Save document metadata
    await documentService.saveDocumentMetadata({
      employeeId: props.employeeId || '',
      type: documentType.value,
      urls: uploadedUrls,
      ocrData: ocrResults.value,
      uploadedAt: new Date()
    })
    
    showSuccess('Documents uploaded successfully!')
    emit('uploaded', uploadedUrls)
    resetForm()
  } catch (error) {
    showError('Failed to upload documents')
    console.error(error)
  } finally {
    uploading.value = false
  }
}

const cancel = () => {
  resetForm()
  emit('cancelled')
}

const resetForm = () => {
  documentType.value = 'qatar-id'
  files.value = []
  previews.value = []
  uploadProgress.value = 0
  ocrResults.value = null
}
</script>