<template>
  <v-dialog v-model="modelValue" max-width="1080" scrollable transition="dialog-bottom-transition">
    <v-card class="employee-view-modal">
      <v-sheet class="header" elevation="0">
        <div class="id-block">
          <v-avatar :image="avatarUrl" size="64" class="mr-4" />
          <div class="identity">
            <h2 class="name">{{ employee.firstName }} {{ employee.lastName }}</h2>
            <p class="position">{{ employee.position }} • <span class="dept">{{ employee.department }}</span></p>
            <div class="chips">
              <v-chip size="x-small" variant="tonal" :color="statusColor" class="mr-1">{{ employee.status }}</v-chip>
              <v-chip size="x-small" variant="outlined">{{ employee.employeeId }}</v-chip>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <v-btn variant="text" size="small" icon="mdi-pencil" @click="$emit('edit', employee)" :title="'Edit'" />
          <v-btn variant="text" size="small" icon="mdi-file-document" @click="$emit('documents', employee)" :title="'Documents'" />
          <v-btn variant="text" size="small" icon="mdi-close" @click="close" :title="'Close'" />
        </div>
      </v-sheet>

      <v-divider />

      <v-row no-gutters class="body">
        <v-col cols="3" class="nav-col">
          <nav class="section-nav" aria-label="Employee sections">
            <ul>
              <li v-for="s in sections" :key="s.key">
                <button :class="['nav-link', { active: activeSection === s.key }]" @click="setSection(s.key)">
                  <v-icon size="18" class="mr-2">{{ s.icon }}</v-icon>{{ s.label }}
                  <v-chip v-if="s.key === 'documents'" size="x-small" variant="outlined" color="primary" class="ml-auto" density="compact">{{ documentCount }}</v-chip>
                </button>
              </li>
            </ul>
          </nav>
        </v-col>
        <v-col cols="9" class="content-col" ref="contentArea">
          <component :is="currentSectionComponent" :employee="employee" :documents="documents" />
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'

interface EmployeeDocItem { key:string; label:string; value?:string; present:boolean; icon:string; color:string }

const props = defineProps<{ modelValue:boolean; employee:any }>()
const emit = defineEmits(['update:modelValue','edit','documents'])

const sections = [
  { key: 'overview', label: 'Overview', icon: 'mdi-account-details' },
  { key: 'employment', label: 'Employment', icon: 'mdi-briefcase' },
  { key: 'documents', label: 'Documents', icon: 'mdi-file-document-multiple' },
  { key: 'visa', label: 'Visa', icon: 'mdi-passport' }
]

const activeSection = ref('overview')
const contentArea = ref<HTMLElement | null>(null)

const avatarUrl = computed(() => `https://i.pravatar.cc/96?u=${props.employee?.email}`)

const documentItems = computed<EmployeeDocItem[]>(() => {
  if (!props.employee) return []
  return [
    { key: 'qatarIdDocument', label: 'Qatar ID Document', value: props.employee.qatarIdDocument, present: !!props.employee.qatarIdDocument, icon: 'mdi-card-account-details', color: 'primary' },
    { key: 'passportDocument', label: 'Passport Document', value: props.employee.passportDocument, present: !!props.employee.passportDocument, icon: 'mdi-passport', color: 'green' }
  ]
})

const documentCount = computed(() => documentItems.value.filter(d => d.present).length)

const statusColor = computed(() => {
  switch (props.employee?.status) {
    case 'Active': return 'success'
    case 'Inactive': return 'error'
    case 'On Leave': return 'warning'
    default: return 'grey'
  }
})

const close = () => emit('update:modelValue', false)

const setSection = (key:string) => {
  activeSection.value = key
  nextTick(() => contentArea.value?.scrollTo({ top:0, behavior:'smooth' }))
}

// Simplified section components inline for now
const currentSectionComponent = computed(() => ({
  props:['employee','documents'],
  template: `
  <div class='section-wrapper'>
    <div v-if="$attrs.employee && '${activeSection.value}' === 'overview'" class='grid two'>
      <div class='panel'>
        <h3 class='panel-title'><v-icon size='16' class='mr-1'>mdi-account</v-icon> Personal</h3>
        <ul class='data-list'>
          <li><span>Email</span><strong>{{ $attrs.employee.email }}</strong></li>
          <li><span>Phone</span><strong>{{ $attrs.employee.phoneNumber || 'Not provided' }}</strong></li>
          <li><span>Nationality</span><strong>{{ $attrs.employee.nationality || 'Not provided' }}</strong></li>
          <li><span>Qatar ID</span><strong>{{ $attrs.employee.qatarId || 'Not provided' }}</strong></li>
          <li><span>Passport</span><strong>{{ $attrs.employee.passportNumber || 'Not provided' }}</strong></li>
        </ul>
      </div>
      <div class='panel'>
        <h3 class='panel-title'><v-icon size='16' class='mr-1'>mdi-briefcase</v-icon> Employment</h3>
        <ul class='data-list'>
          <li><span>Department</span><strong>{{ $attrs.employee.department }}</strong></li>
          <li><span>Join Date</span><strong>{{ $attrs.employee.joinDate }}</strong></li>
          <li><span>Status</span><strong>{{ $attrs.employee.status }}</strong></li>
          <li><span>Salary</span><strong>{{ new Intl.NumberFormat('en-QA',{style:'currency', currency:'QAR'}).format($attrs.employee.salary) }}</strong></li>
        </ul>
      </div>
    </div>
    <div v-else-if="'${activeSection.value}' === 'documents'" class='documents-list'>
      <div v-for="d in ${JSON.stringify(documentItems.value)}" :key="d.key" class='doc-item'>
        <div class='doc-icon'><v-icon :color="d.color" size='20'>{{ d.icon }}</v-icon></div>
        <div class='doc-meta'>
          <div class='doc-title'>{{ d.label }}</div>
          <div class='doc-status'><v-chip v-if="d.present" size='x-small' color='success' variant='tonal'>Available</v-chip><v-chip v-else size='x-small' color='grey' variant='outlined'>Missing</v-chip></div>
        </div>
      </div>
    </div>
    <div v-else-if="'${activeSection.value}' === 'visa'" class='panel'>
      <h3 class='panel-title'><v-icon size='16' class='mr-1'>mdi-passport</v-icon> Visa</h3>
      <ul class='data-list'>
        <li><span>Status</span><strong>{{ $attrs.employee.visaStatus }}</strong></li>
        <li><span>Expiry</span><strong>{{ $attrs.employee.visaExpiry }}</strong></li>
      </ul>
    </div>
  </div>`
}))

</script>

<style scoped>
.employee-view-modal { overflow:hidden; }
.header { display:flex; align-items:center; justify-content:space-between; padding:18px 22px; background:linear-gradient(135deg,#8B1538,#6B0F2A); color:#fff; }
.name { margin:0 0 4px; font-size:22px; font-weight:600; letter-spacing:.4px; }
.position { margin:0 0 6px; font-size:13px; opacity:.85; }
.dept { font-weight:600; }
.id-block { display:flex; align-items:center; }
.chips { display:flex; gap:4px; }
.section-nav ul { list-style:none; margin:0; padding:0; }
.section-nav .nav-link { width:100%; display:flex; align-items:center; gap:6px; padding:10px 14px; background:transparent; border:none; text-align:left; font-size:13px; border-radius:10px; cursor:pointer; font-weight:500; color:#4a4f57; transition:.25s background,.25s color; }
.section-nav .nav-link:hover { background:#f4f5f7; }
.section-nav .nav-link.active { background:#8B1538; color:#fff; box-shadow:0 4px 14px -4px rgba(139,21,56,.5); }
.body { min-height:420px; }
.nav-col { background:#fafbfc; border-right:1px solid #eceff3; }
.content-col { padding:22px 26px 34px; max-height:60vh; overflow:auto; }
.grid.two { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:22px; }
.panel { background:#fff; border:1px solid #e4e7eb; border-radius:14px; padding:16px 18px 14px; box-shadow:0 2px 6px rgba(0,0,0,.04); }
.panel-title { margin:0 0 10px; font-size:14px; font-weight:600; letter-spacing:.5px; display:flex; align-items:center; }
.data-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px; font-size:12px; }
.data-list li { display:flex; justify-content:space-between; gap:12px; padding:4px 0; border-bottom:1px dashed #eef0f3; }
.data-list li span { font-weight:500; color:#606872; }
.data-list li strong { font-weight:600; color:#1d2329; }
.documents-list { display:flex; flex-direction:column; gap:10px; }
.doc-item { display:flex; align-items:center; gap:12px; background:#fff; border:1px solid #e4e7eb; border-radius:12px; padding:10px 12px; }
.doc-title { font-size:13px; font-weight:600; }
</style>
