import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { registerSW } from 'virtual:pwa-register'

// Vuetify
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { fa } from 'vuetify/iconsets/fa'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Font Awesome
import '@fortawesome/fontawesome-free/css/all.css'

// Iconify
import { Icon } from '@iconify/vue'

// Lucide Icons (import commonly used ones)
import { 
  Users, Calendar, DollarSign, Eye, Edit3, Trash2, 
  Save, X, RefreshCw, Search, Filter, Download, 
  Upload, Printer, CheckCircle, AlertTriangle, 
  AlertCircle, Info, Loader2, Clock, MapPin, 
  Phone, Mail, TrendingUp, TrendingDown
} from 'lucide-vue-next'

// App & Router
import App from './App.vue'
import router from './router'

// Global Styles
import './style.css'

// Firebase
import { initializeFirebase } from './firebase/config'

// Handsontable
import { HotTable } from '@handsontable/vue3'
import { registerAllModules } from 'handsontable/registry'
import 'handsontable/dist/handsontable.full.min.css'

// Register Handsontable modules
registerAllModules()

// Initialize Firebase
initializeFirebase()

// Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'fa',
    aliases,
    sets: {
      mdi,
      fa,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976d2',
          'primary-darken-1': '#1565c0',
          'primary-lighten-1': '#42a5f5',
          secondary: '#424242',
          'secondary-darken-1': '#1c1c1c',
          'secondary-lighten-1': '#6d6d6d',
          accent: '#82b1ff',
          error: '#ef4444',
          'error-lighten-1': '#f87171',
          info: '#3b82f6',
          'info-lighten-1': '#60a5fa',
          success: '#10b981',
          'success-lighten-1': '#34d399',
          warning: '#f59e0b',
          'warning-lighten-1': '#fbbf24',
          background: '#fafafa',
          'background-lighten-1': '#ffffff',
          surface: '#ffffff',
          'surface-variant': '#f5f5f5',
          'on-surface': '#1f2937',
          'on-surface-variant': '#6b7280',
        },
      },
      dark: {
        colors: {
          primary: '#3b82f6',
          'primary-darken-1': '#1d4ed8',
          'primary-lighten-1': '#60a5fa',
          secondary: '#6b7280',
          'secondary-darken-1': '#374151',
          'secondary-lighten-1': '#9ca3af',
          accent: '#f472b6',
          error: '#ef4444',
          'error-lighten-1': '#f87171',
          info: '#3b82f6',
          'info-lighten-1': '#60a5fa',
          success: '#10b981',
          'success-lighten-1': '#34d399',
          warning: '#f59e0b',
          'warning-lighten-1': '#fbbf24',
          background: '#111827',
          'background-lighten-1': '#1f2937',
          surface: '#1f2937',
          'surface-variant': '#374151',
          'on-surface': '#f9fafb',
          'on-surface-variant': '#d1d5db',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      style: [
        { textTransform: 'none' },
        { fontWeight: '500' },
        { borderRadius: '12px' },
      ],
    },
    VCard: {
      style: [
        { borderRadius: '16px' },
      ],
    },
    VTextField: {
      style: [
        { borderRadius: '12px' },
      ],
      variant: 'outlined',
    },
    VSelect: {
      style: [
        { borderRadius: '12px' },
      ],
      variant: 'outlined',
    },
    VTextarea: {
      style: [
        { borderRadius: '12px' },
      ],
      variant: 'outlined',
    },
    VChip: {
      style: [
        { borderRadius: '8px' },
      ],
    },
  },
})

// Create app
const app = createApp(App)

// Register Iconify
app.component('Icon', Icon)

// Register Lucide Icons
app.component('LucideUsers', Users)
app.component('LucideCalendar', Calendar)
app.component('LucideDollarSign', DollarSign)
app.component('LucideEye', Eye)
app.component('LucideEdit3', Edit3)
app.component('LucideTrash2', Trash2)
app.component('LucideSave', Save)
app.component('LucideX', X)
app.component('LucideRefreshCw', RefreshCw)
app.component('LucideSearch', Search)
app.component('LucideFilter', Filter)
app.component('LucideDownload', Download)
app.component('LucideUpload', Upload)
app.component('LucidePrinter', Printer)
app.component('LucideCheckCircle', CheckCircle)
app.component('LucideAlertTriangle', AlertTriangle)
app.component('LucideAlertCircle', AlertCircle)
app.component('LucideInfo', Info)
app.component('LucideLoader2', Loader2)
app.component('LucideClock', Clock)
app.component('LucideMapPin', MapPin)
app.component('LucidePhone', Phone)
app.component('LucideMail', Mail)
app.component('LucideTrendingUp', TrendingUp)
app.component('LucideTrendingDown', TrendingDown)

// Register global components
app.component('HotTable', HotTable)

// Use plugins
app.use(createPinia())
app.use(router)
app.use(vuetify)

// PWA Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Show update available notification
    console.log('New content available, please refresh.')
  },
  onOfflineReady() {
    console.log('App ready to work offline.')
  },
})

// Mount app
app.mount('#app')

// Expose updateSW globally for manual updates
;(window as any).updateSW = updateSW