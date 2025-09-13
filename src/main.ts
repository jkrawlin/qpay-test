import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { registerSW } from 'virtual:pwa-register'

// Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
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
import './styles/globals.scss'

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
    defaultSet: 'mdi',
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
          secondary: '#424242',
          accent: '#82b1ff',
          error: '#ff5252',
          info: '#2196f3',
          success: '#4caf50',
          warning: '#ffc107',
          background: '#fafafa',
          surface: '#ffffff',
        },
      },
      dark: {
        colors: {
          primary: '#2196f3',
          secondary: '#424242',
          accent: '#ff4081',
          error: '#ff5252',
          info: '#2196f3',
          success: '#4caf50',
          warning: '#ffc107',
          background: '#121212',
          surface: '#1e1e1e',
        },
      },
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