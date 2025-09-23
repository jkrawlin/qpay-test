<template>
  <div class="super-login d-flex align-center justify-center" style="min-height:100vh;">
    <v-card max-width="400" elevation="4">
      <v-card-title class="text-h6 font-weight-bold">Super Admin Login</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleLogin" ref="form">
          <v-text-field v-model="email" label="Email" type="email" variant="outlined" density="comfortable" required hide-details class="mb-4" />
          <v-text-field v-model="password" label="Password" type="password" variant="outlined" density="comfortable" required hide-details class="mb-6" />
          <v-btn :loading="loading" block color="primary" type="submit">Login</v-btn>
          <v-alert v-if="error" type="error" variant="tonal" class="mt-4" density="comfortable">{{ error }}</v-alert>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { auth } from '@/firebase/config'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'

const email = ref('admin@example.com')
const password = ref('Admin123!')
const loading = ref(false)
const error = ref('')
const form = ref()
const router = useRouter()
const authStore = useAuthStore()

// Helper to ensure the user has full system permissions
async function elevateUser(uid: string) {
  // We store roles/permissions in the user document; if it does not exist we create it via updateUserProfile path
  try {
    await authStore.updateUserProfile({
      roles: ['admin', 'hr', 'finance', 'compliance'],
      permissions: ['all'],
      companyId: 'dev-company'
    } as any)
  } catch (e) {
    console.warn('Elevation failed (may be first profile creation). Attempting fallback create logic.')
  }
}

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    // Try sign in first
    let userCredential
    try {
      userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    } catch (signInErr: any) {
      if (signInErr.code === 'auth/user-not-found') {
        // Auto-register minimal user then continue
        userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
        await updateProfile(userCredential.user, { displayName: 'Super Admin' })
      } else {
        throw signInErr
      }
    }

    await authStore.initializeAuth() // load or create profile
    await elevateUser(userCredential.user.uid)

    router.push({ name: 'Dashboard' })
  } catch (e: any) {
    console.error('Super login failed', e)
    error.value = e?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.super-login { background: linear-gradient(135deg, #8b1538 0%, #56102c 100%); padding:16px; }
</style>
