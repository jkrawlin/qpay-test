<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-space-between align-center flex-wrap">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">Notification Center</h1>
          <p class="text-body-2 text-medium-emphasis">Monitor and manage system & compliance notifications</p>
        </div>
        <div class="d-flex gap-2 align-center">
          <v-switch v-model="highContrast" inset hide-details density="compact" color="primary" class="mr-2" :label="highContrast ? 'High Contrast On' : 'High Contrast'" />
          <v-btn color="primary" variant="flat" prepend-icon="mdi-check-all" :disabled="!unreadCount" @click="markAllRead">Mark All Read ({{ unreadCount }})</v-btn>
          <v-btn color="error" variant="flat" prepend-icon="mdi-delete-sweep" :disabled="!selectedIds.length" @click="bulkDelete">Delete ({{ selectedIds.length }})</v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filters & Settings (Refactored to AdvancedFilterPanel layout) -->
    <AdvancedFilterPanel
      class="mb-4 notif-filter-panel"
      title="Filters"
      :active-pills="activePills"
      :active-count="activePills.length"
      :show-advanced-toggle="false"
      :show-clear="true"
      panel-class="notif-panel"
      @clear="resetFilters"
      aria-label="Notification filters"
    >
      <template #quick>
        <button
          v-for="q in quickFilters"
          :key="q.key"
          :class="['qf-btn', { active: q.isActive }]"
          type="button"
          @click="toggleQuick(q.key)"
          :aria-pressed="q.isActive"
          :tabindex="-1"
        >
          <v-icon size="16" class="mr-1">{{ q.icon }}</v-icon>
          <span class="qf-label">{{ q.label }}</span>
          <span v-if="q.badge !== undefined" class="qf-badge" :data-severity="q.severity || ''">{{ q.badge }}</span>
        </button>
      </template>
      <!-- Fields occupy the component's advanced region slot -->
      <div class="af-field">
        <label class="af-label" for="nf-search">Search</label>
        <div class="af-input-icon">
          <v-icon size="16">mdi-magnify</v-icon>
          <input id="nf-search" v-model="search" type="text" placeholder="Title or message" />
          <button v-if="search" class="clear-mini" @click="search = ''" aria-label="Clear search">
            <v-icon size="14">mdi-close</v-icon>
          </button>
        </div>
      </div>
      <div class="af-field">
        <label class="af-label" for="nf-category">Category</label>
        <select id="nf-category" v-model="categoryFilter">
          <option value="">All</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div class="af-field">
        <label class="af-label" for="nf-severity">Severity</label>
        <select id="nf-severity" v-model="severityFilter">
          <option value="">All</option>
          <option v-for="s in severities" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div class="af-field">
        <label class="af-label" for="nf-read">Read Status</label>
        <select id="nf-read" v-model="readFilter">
          <option value="">All</option>
          <option v-for="r in readStatusOptions" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>
      <!-- Settings row spans full width below grid -->
      <div style="grid-column:1/-1" class="settings-row d-flex flex-wrap gap-4 mt-2">
        <v-switch v-model="settings.emailEnabled" label="Email Alerts" hide-details density="comfortable" color="primary" />
        <v-switch v-model="settings.inAppEnabled" label="In-App Alerts" hide-details density="comfortable" color="primary" />
        <v-switch v-model="settings.dailyDigest" label="Daily Digest" hide-details density="comfortable" color="primary" />
      </div>
    </AdvancedFilterPanel>

    <!-- Notifications Table -->
    <v-card variant="outlined">
      <v-card-title class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-bell</v-icon>
        <span class="text-h6 font-weight-bold">Notifications</span>
        <v-spacer />
        <v-chip size="small" :color="highContrast ? 'primary' : 'primary'" :variant="highContrast ? 'flat' : 'tonal'">{{ filteredNotifications.length }} shown</v-chip>
      </v-card-title>
      <v-divider />
      <v-data-table show-select v-model="selectedIds" :headers="headers" :items="filteredNotifications" item-value="id" density="comfortable" :items-per-page="25" :class="{'high-contrast-table': highContrast}">
        <template #item.message="{ item }">
          <div class="d-flex flex-column notification-cell" :class="{ 'unread': !item.read, 'contrast': highContrast }">
            <div class="d-flex align-center mb-1">
              <v-icon :color="!item.read ? 'primary' : (highContrast ? 'grey-lighten-1' : 'grey-lighten-2')" size="14" class="mr-2">{{ !item.read ? 'mdi-circle-medium' : 'mdi-circle-outline' }}</v-icon>
              <span class="font-weight-medium title-text">{{ item.title }}</span>
            </div>
            <span class="text-caption message-text">{{ truncate(item.message, 90) }}</span>
          </div>
        </template>
        <template #item.category="{ item }">
          <v-chip size="x-small" :variant="chipVariant" :color="chipColor('primary')" class="uppercase">{{ item.category }}</v-chip>
        </template>
        <template #item.severity="{ item }">
          <v-chip size="x-small" :color="severityColor(item.severity)" :variant="chipVariant" class="uppercase">{{ item.severity }}</v-chip>
        </template>
        <template #item.created="{ item }">{{ timeAgo(item.createdAt) }}</template>
        <template #item.actions="{ item }">
          <v-btn icon="mdi-eye" :variant="highContrast ? 'flat' : 'text'" size="small" @click="view(item)" />
          <v-btn :icon="item.read ? 'mdi-email-open-outline' : 'mdi-email-mark-as-unread'" :variant="highContrast ? 'flat' : 'text'" size="small" @click="toggleRead(item)" />
          <v-btn icon="mdi-delete" :variant="highContrast ? 'flat' : 'text'" size="small" color="error" @click="remove(item)" />
        </template>
        <template #no-data>
          <div class="text-center pa-6">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-bell-off-outline</v-icon>
            <div class="text-subtitle-1 mb-1">No notifications</div>
            <div class="text-caption text-medium-emphasis mb-3">Everything looks quiet right now</div>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- View Dialog -->
    <v-dialog v-model="showViewDialog" max-width="640px">
      <v-card v-if="viewing">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-eye</v-icon>
          <span class="font-weight-bold">{{ viewing.title }}</span>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="showViewDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-row dense>
            <v-col cols="12" md="6"><strong>Category:</strong> {{ viewing.category }}</v-col>
            <v-col cols="12" md="6"><strong>Severity:</strong> {{ viewing.severity }}</v-col>
            <v-col cols="12" md="6"><strong>Status:</strong> {{ viewing.read ? 'Read' : 'Unread' }}</v-col>
            <v-col cols="12" md="6"><strong>Created:</strong> {{ new Date(viewing.createdAt).toLocaleString() }}</v-col>
            <v-col cols="12"><strong>Message:</strong><br/> {{ viewing.message }}</v-col>
            <v-col cols="12" v-if="viewing.meta && Object.keys(viewing.meta).length">
              <strong>Meta:</strong>
              <ul class="text-caption mt-1">
                <li v-for="(val,key) in viewing.meta" :key="key"><strong>{{ key }}:</strong> {{ val }}</li>
              </ul>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
            <v-btn variant="text" @click="toggleRead(viewing)">{{ viewing.read ? 'Mark Unread' : 'Mark Read' }}</v-btn>
          <v-btn variant="text" @click="showViewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AdvancedFilterPanel from '@/components/common/AdvancedFilterPanel.vue'

interface AppNotification {
  id: string
  title: string
  message: string
  category: string
  severity: 'info' | 'warning' | 'error' | 'success'
  createdAt: string
  read: boolean
  meta?: Record<string, any>
}

// State
const notifications = ref<AppNotification[]>([])
let seq = 1000
const genId = () => `NT-${++seq}`
const selectedIds = ref<string[]>([])
const showViewDialog = ref(false)
const viewing = ref<AppNotification | null>(null)

// Filters
const search = ref('')
const categoryFilter = ref<string | null>(null)
const severityFilter = ref<AppNotification['severity'] | null>(null)
const readFilter = ref<string | null>(null)
const categories = ['Compliance','System','Security','Reminder','Billing']
const severities: AppNotification['severity'][] = ['info','warning','error','success']
const readStatusOptions = ['Unread','Read']

// Settings toggles (mock configuration state)
const settings = ref({ emailEnabled: true, inAppEnabled: true, dailyDigest: false })
const highContrast = ref(false)

// Headers
const headers = [
  { title: 'Notification', key: 'message', sortable: false },
  { title: 'Category', key: 'category', sortable: true },
  { title: 'Severity', key: 'severity', sortable: true },
  { title: 'Created', key: 'created', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Quick filter flags
const qfUnread = ref(false)
const qfErrors = ref(false)
const qfWarnings = ref(false)
const qfSecurity = ref(false)
const qfCompliance = ref(false)

// Computed
const filteredNotifications = computed(() => {
  let list = [...notifications.value]
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(n => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q))
  }
  if (categoryFilter.value) list = list.filter(n => n.category === categoryFilter.value)
  if (severityFilter.value) list = list.filter(n => n.severity === severityFilter.value)
  if (readFilter.value === 'Unread') list = list.filter(n => !n.read)
  else if (readFilter.value === 'Read') list = list.filter(n => n.read)
  // Quick filters (additive)
  if (qfUnread.value) list = list.filter(n => !n.read)
  if (qfErrors.value) list = list.filter(n => n.severity === 'error')
  if (qfWarnings.value) list = list.filter(n => n.severity === 'warning')
  if (qfSecurity.value) list = list.filter(n => n.category === 'Security')
  if (qfCompliance.value) list = list.filter(n => n.category === 'Compliance')
  return list
})
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

// Helpers
function truncate(s:string, max:number) { return s.length > max ? s.slice(0,max-1) + '…' : s }
function timeAgo(iso:string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff/60000)
  if (mins < 60) return mins + 'm ago'
  const hrs = Math.floor(mins/60)
  if (hrs < 24) return hrs + 'h ago'
  const days = Math.floor(hrs/24)
  return days + 'd ago'
}
function severityColor(s:AppNotification['severity']) { return s==='error' ? 'error' : s==='warning' ? 'warning' : s==='success' ? 'success' : 'info' }
const chipVariant = computed(() => highContrast.value ? 'flat' : 'tonal')
const chipColor = (fallback:string) => (highContrast.value ? fallback : fallback)

// Actions
const view = (n:AppNotification) => { viewing.value = n; showViewDialog.value = true; if (!n.read) n.read = true }
const toggleRead = (n:AppNotification) => { n.read = !n.read }
const remove = (n:AppNotification) => { notifications.value = notifications.value.filter(x => x.id !== n.id); selectedIds.value = selectedIds.value.filter(id => id !== n.id) }
const markAllRead = () => { notifications.value.forEach(n => n.read = true) }
const bulkDelete = () => { notifications.value = notifications.value.filter(n => !selectedIds.value.includes(n.id)); selectedIds.value = [] }
const resetFilters = () => {
  search.value=''
  categoryFilter.value=null
  severityFilter.value=null
  readFilter.value=null
  qfUnread.value=false
  qfErrors.value=false
  qfWarnings.value=false
  qfSecurity.value=false
  qfCompliance.value=false
}
// Quick filters collection for template
const quickFilters = computed(() => [
  { key:'unread', label:'Unread', icon:'mdi-email-mark-as-unread', isActive:qfUnread.value, badge: unreadCount.value || 0 },
  { key:'errors', label:'Errors', icon:'mdi-alert-octagon', isActive:qfErrors.value, badge: notifications.value.filter(n=>n.severity==='error').length || 0, severity: notifications.value.some(n=>n.severity==='error') ? 'warn' : undefined },
  { key:'warnings', label:'Warnings', icon:'mdi-alert-outline', isActive:qfWarnings.value, badge: notifications.value.filter(n=>n.severity==='warning').length || 0 },
  { key:'security', label:'Security', icon:'mdi-shield-lock', isActive:qfSecurity.value, badge: notifications.value.filter(n=>n.category==='Security').length || 0 },
  { key:'compliance', label:'Compliance', icon:'mdi-certificate', isActive:qfCompliance.value, badge: notifications.value.filter(n=>n.category==='Compliance').length || 0 }
])
function toggleQuick(key:string) {
  if (key==='unread') qfUnread.value = !qfUnread.value
  else if (key==='errors') qfErrors.value = !qfErrors.value
  else if (key==='warnings') qfWarnings.value = !qfWarnings.value
  else if (key==='security') qfSecurity.value = !qfSecurity.value
  else if (key==='compliance') qfCompliance.value = !qfCompliance.value
}
// Active pills mapping (align with AdvancedFilterPanel API) includes quick filters
const activePills = computed(() => {
  const pills: { key:string; label:string; icon:string; clear:() => void; type:string }[] = []
  if (qfUnread.value) pills.push({ key:'q-unread', label:'Unread', icon:'mdi-email-mark-as-unread', type:'quick', clear: () => { qfUnread.value=false } })
  if (qfErrors.value) pills.push({ key:'q-errors', label:'Errors', icon:'mdi-alert-octagon', type:'quick', clear: () => { qfErrors.value=false } })
  if (qfWarnings.value) pills.push({ key:'q-warnings', label:'Warnings', icon:'mdi-alert-outline', type:'quick', clear: () => { qfWarnings.value=false } })
  if (qfSecurity.value) pills.push({ key:'q-security', label:'Security', icon:'mdi-shield-lock', type:'quick', clear: () => { qfSecurity.value=false } })
  if (qfCompliance.value) pills.push({ key:'q-compliance', label:'Compliance', icon:'mdi-certificate', type:'quick', clear: () => { qfCompliance.value=false } })
  if (search.value) pills.push({ key:'search', label:`Search: ${search.value}`, icon:'mdi-magnify', type:'field', clear: () => { search.value='' } })
  if (categoryFilter.value) pills.push({ key:'category', label:`Category: ${categoryFilter.value}`, icon:'mdi-shape-outline', type:'field', clear: () => { categoryFilter.value=null } })
  if (severityFilter.value) pills.push({ key:'severity', label:`Severity: ${severityFilter.value}`, icon:'mdi-alert', type:'field', clear: () => { severityFilter.value=null } })
  if (readFilter.value) pills.push({ key:'read', label:`Read: ${readFilter.value}`, icon:'mdi-email', type:'field', clear: () => { readFilter.value=null } })
  return pills
})

// Seed sample notifications
function seed(category:string, severity:AppNotification['severity'], title:string, message:string, meta?:Record<string,any>) {
  notifications.value.unshift({ id: genId(), category, severity, title, message, meta, createdAt: new Date(Date.now() - Math.random()*86400000).toISOString(), read: false })
}
seed('Compliance','warning','License Expiring','Company trade license expires in 20 days', { expiresInDays: 20 })
seed('System','info','New Version Available','Version 1.4.2 is ready to install')
seed('Security','error','Failed Login Attempts','5 failed login attempts detected', { username: 'admin' })
seed('Reminder','info','Payroll Cutoff','Submit payroll adjustments by tomorrow noon')
seed('Billing','success','Receipt Posted','Customer payment batch posted successfully')

</script>

<style scoped>
.gap-2 > * + * { margin-left: 8px; }
/* Reuse AdvancedFilterPanel styling already defined in shared component; only page-specific tweaks here */
.settings-row { gap:28px; }
.notif-filter-panel :deep(.notif-panel) { border:1px solid #d5d9de; background:linear-gradient(135deg,#fafbfc,#f4f6f8); position:relative; }
.notif-filter-panel :deep(.notif-panel)::before { content:""; position:absolute; inset:0; pointer-events:none; border-radius:inherit; box-shadow:0 0 0 1px rgba(139,21,56,.15),0 2px 4px -2px rgba(0,0,0,.08),0 4px 18px -4px rgba(0,0,0,.06); }
.qf-btn {
  display:inline-flex; align-items:center; position:relative; border:1px solid #c9ced3; background:#ffffff; color:#4a5563;
  font-size:12px; font-weight:600; letter-spacing:.5px; text-transform:uppercase; padding:4px 10px 4px 8px; border-radius:24px; margin:0 6px 6px 0;
  line-height:1; cursor:pointer; transition:.18s background,.18s color,.18s border-color,.18s box-shadow;
}
.qf-btn .v-icon { color:#8B1538; transition:color .18s; }
.qf-btn.active { background:linear-gradient(135deg,#8B1538,#6B0F2A); color:#fff; border-color:#8B1538; box-shadow:0 2px 6px -2px rgba(107,15,42,.4); }
.qf-btn.active .v-icon { color:#fff; }
.qf-btn:focus-visible { outline:2px solid #8B1538; outline-offset:2px; }
.qf-badge { background:#f1f3f5; color:#343a40; font-size:10px; font-weight:600; padding:2px 6px; border-radius:10px; margin-left:6px; line-height:1; min-width:22px; text-align:center; }
.qf-btn.active .qf-badge { background:rgba(255,255,255,.18); color:#fff; }
.qf-badge[data-severity="warn"] { background:#fff4e5; color:#b25300; }
.qf-btn.active .qf-badge[data-severity="warn"] { background:rgba(255,255,255,.25); color:#fff; }
.high-contrast-table :deep(tbody tr) { transition: background-color .15s ease, color .15s ease; }
.high-contrast-table :deep(tbody tr:hover) { background: rgba(0,0,0,0.04); }
.notification-cell.unread { background: rgba(25,118,210,0.08); border-left: 3px solid var(--v-theme-primary); padding: 4px 8px; border-radius: 4px; }
.high-contrast-table .notification-cell.unread { background: #102a43; }
.notification-cell .title-text { font-size: .83rem; line-height: 1.1; }
.notification-cell .message-text { color: var(--v-theme-on-surface-variant); }
.high-contrast-table .notification-cell .message-text { color: #cfd8dc; }
.uppercase { text-transform: uppercase; letter-spacing: .5px; }
/* Inline field styling for raw inputs/selects to match panel look */
.af-input-icon { position:relative; display:flex; align-items:center; }
.af-input-icon input { width:100%; padding:8px 30px 8px 32px; font-size:13px; border:1px solid #cfd4da; border-radius:10px; background:#fff; }
.af-input-icon input:focus { outline:none; border-color:#8B1538; box-shadow:0 0 0 3px rgba(139,21,56,.15); }
.af-input-icon .v-icon { position:absolute; left:10px; color:#8B1538; }
.clear-mini { position:absolute; right:6px; border:none; background:transparent; padding:2px; cursor:pointer; color:#6b7280; }
.clear-mini .v-icon { font-size:14px !important; }
.af-field select { padding:8px 12px; font-size:13px; border:1px solid #cfd4da; border-radius:10px; background:#fff; }
.af-field select:focus { outline:none; border-color:#8B1538; box-shadow:0 0 0 3px rgba(139,21,56,.15); }
.af-label { font-size:11px; font-weight:600; letter-spacing:.6px; text-transform:uppercase; color:#5a6472; display:block; margin-bottom:4px; }
.af-field { display:flex; flex-direction:column; gap:6px; }
</style>
