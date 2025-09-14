import { createApp } from 'vue'
import { createPinia } from 'pinia'

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

// Use plugins
app.use(createPinia())
app.use(router)
app.use(vuetify)

// Mount app
app.mount('#app')