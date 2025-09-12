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

// Toast Notifications
import Toast, { PluginOptions } from 'vue-toastification/dist/index.mjs'
import 'vue-toastification/dist/index.css'

// ECharts
import ECharts from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { 
  GridComponent, 
  TooltipComponent, 
  LegendComponent,
  TitleComponent 
} from 'echarts/components'

// ApexCharts
import VueApexCharts from 'vue3-apexcharts'

// Date Picker
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

// Perfect Scrollbar
import PerfectScrollbar from 'vue3-perfect-scrollbar'
import 'vue3-perfect-scrollbar/style.css'

// Floating Vue (Tooltips)
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'

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

// Register ECharts components
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

// Toast configuration
const toastOptions: PluginOptions = {
  position: 'top-right',
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

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

// Register ECharts
app.component('VChart', ECharts)

// Register Date Picker
app.component('VueDatePicker', VueDatePicker)

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

// Use plugins
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(Toast, toastOptions)
// app.use(VueApexCharts) // Temporarily disabled
app.use(PerfectScrollbar)
app.use(FloatingVue)

// Initialize auth store
const { useAuthStore } = await import('@/stores/auth')
const authStore = useAuthStore(pinia)
await authStore.initializeAuth()

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