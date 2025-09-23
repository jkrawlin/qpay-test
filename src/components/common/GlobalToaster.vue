<template>
  <div class="toaster" role="status" aria-live="polite">
    <transition-group name="toast-fade" tag="div" class="toast-stack">
      <div v-for="t in toasts" :key="t.id" :class="['toast', t.type]">
        <div class="msg">{{ t.message }}</div>
        <button v-if="t.actionLabel" class="action" @click="action(t)">{{ t.actionLabel }}</button>
        <button class="close" @click="dismiss(t.id)" aria-label="Dismiss">×</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toasts'
const store = useToastStore()
const toasts = store.toasts
const dismiss = store.dismiss
const action = (t: any) => { t.onAction?.(); dismiss(t.id) }
</script>

<style scoped>
.toaster { position: fixed; top: 1rem; right: 1rem; z-index: 3000; display:flex; flex-direction:column; gap:.5rem; }
.toast-stack { display:flex; flex-direction:column; gap:.5rem; }
.toast { min-width: 240px; max-width: 360px; background:#1e1e1f; color:#fff; padding:.75rem 1rem; border-radius:8px; box-shadow:0 4px 14px rgba(0,0,0,.25); display:flex; align-items:center; gap:.75rem; font-size:.875rem; position:relative; overflow:hidden; }
.toast.success { background:#256029; }
.toast.error { background:#b71c1c; }
.toast.info { background:#1565c0; }
.toast.warning { background:#b26a00; }
.toast .close { appearance:none; border:none; background:transparent; color:#fff; font-size:1rem; cursor:pointer; margin-left:auto; }
.toast .action { background:rgba(255,255,255,.15); color:#fff; border:none; padding:.25rem .5rem; border-radius:4px; cursor:pointer; font-size:.75rem; }
.toast-fade-enter-active, .toast-fade-leave-active { transition: all .25s ease; }
.toast-fade-enter-from { opacity:0; transform: translateY(-6px); }
.toast-fade-leave-to { opacity:0; transform: translateY(-6px); }
</style>