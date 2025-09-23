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

// Firebase
import { initializeFirebase } from './firebase/config'

// Initialize Firebase
initializeFirebase()

// Create app
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Initialize auth BEFORE mounting and router usage to ensure company context
const authStore = useAuthStore()
await authStore.initializeAuth()

// Continue plugin registration
app.use(router)
app.use(vuetify)

app.mount('#app')