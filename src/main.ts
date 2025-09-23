import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// App & Router
import App from './App.vue'
import router from './router'

// Vuetify
import vuetify from './plugins/vuetify'

// Global Styles
import './style.css'

// Firebase removed (initializeFirebase no-op stub eliminated)

// Create app
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Initialize local auth store (no remote calls)
const authStore = useAuthStore()
await authStore.initializeAuth()

// Continue plugin registration
app.use(router)
app.use(vuetify)

app.mount('#app')