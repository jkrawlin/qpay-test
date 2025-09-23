<template>
  <v-container fluid class="pa-4">
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-space-between align-center flex-wrap">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Receipt Templates</h1>
          <p class="text-body-2 text-medium-emphasis">Reusable templates for faster invoice & receipt generation</p>
        </div>
        <div>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openNewTemplate">New Template</v-btn>
        </div>
      </v-col>
    </v-row>

    <v-card variant="outlined">
      <v-card-title class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-file-document-multiple</v-icon>
        <span class="text-h6 font-weight-bold">Templates</span>
        <v-spacer />
        <v-chip size="small" color="primary" variant="tonal">{{ templates.length }} total</v-chip>
      </v-card-title>
      <v-divider />
      <v-data-table :headers="headers" :items="templates" density="comfortable" :items-per-page="15">
        <template #item.template="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-medium">{{ item.name }}</span>
            <span class="text-caption text-medium-emphasis">{{ item.category || 'General' }}</span>
          </div>
        </template>
        <template #item.amount="{ item }">
          {{ formatCurrency(item.defaultAmount) }}
        </template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" @click="editTemplate(item)" />
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="deleteTemplate(item)" />
        </template>
        <template #no-data>
          <div class="text-center pa-6">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-file-document-multiple</v-icon>
            <div class="text-subtitle-1">No templates yet</div>
            <div class="text-caption text-medium-emphasis mb-3">Create a template to speed up future billing</div>
            <v-btn color="primary" @click="openNewTemplate">New Template</v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- New/Edit Template Dialog -->
    <v-dialog v-model="showTemplateDialog" max-width="640px">
      <v-card :loading="savingTemplate">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-file-document-edit-outline</v-icon>
          <span class="font-weight-bold">{{ templateDraft.id ? 'Edit Template' : 'New Template' }}</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="closeTemplateDialog" />
        </v-card-title>
        <v-divider />
        <v-form ref="templateFormRef" @submit.prevent="saveTemplate">
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field v-model="templateDraft.name" label="Template Name" :rules="[rRequired]" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="templateDraft.category" label="Category" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="templateDraft.defaultAmount" type="number" min="0" label="Default Amount (QAR)" :rules="[rPositive]" density="comfortable" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="templateDraft.type" :items="templateTypes" label="Type" density="comfortable" :rules="[rRequired]" />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="templateDraft.description" label="Description" rows="2" auto-grow density="comfortable" />
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="closeTemplateDialog">Cancel</v-btn>
            <v-btn color="primary" type="submit" :loading="savingTemplate">Save</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Template { id: string; name: string; category?: string; type: string; defaultAmount: number; description?: string }
let tSeq = 0
const genId = () => `T-${++tSeq}`
const templates = ref<Template[]>([])

const showTemplateDialog = ref(false)
const savingTemplate = ref(false)
const templateFormRef = ref()
const templateTypes = ['Invoice','Receipt','Credit Note']
const templateDraft = ref<any>({ id: '', name: '', category: '', type: 'Invoice', defaultAmount: 0, description: '' })

const rRequired = (v: any) => (!!v || v === 0) || 'Required'
const rPositive = (v: number) => v >= 0 || 'Must be >= 0'

const headers = [
  { title: 'Template', key: 'template', sortable: false },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Default Amount', key: 'amount', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

const formatCurrency = (n: number) => new Intl.NumberFormat('en-QA',{ style:'currency', currency:'QAR'}).format(n)

const openNewTemplate = () => { templateDraft.value = { id: '', name: '', category: '', type: 'Invoice', defaultAmount: 0, description: '' }; showTemplateDialog.value = true }
const editTemplate = (tpl: Template) => { templateDraft.value = { ...tpl }; showTemplateDialog.value = true }
const deleteTemplate = (tpl: Template) => { templates.value = templates.value.filter(t => t.id !== tpl.id) }
const closeTemplateDialog = () => { showTemplateDialog.value = false }
const saveTemplate = async () => {
  if (savingTemplate.value) return
  savingTemplate.value = true
  try {
    const d = templateDraft.value
    if (d.id) {
      const idx = templates.value.findIndex(t => t.id === d.id)
      if (idx !== -1) templates.value[idx] = { ...templates.value[idx], ...d }
    } else {
      d.id = genId()
      templates.value.unshift({ ...d })
    }
    showTemplateDialog.value = false
  } finally {
    savingTemplate.value = false
  }
}
</script>

<style scoped>
</style>
