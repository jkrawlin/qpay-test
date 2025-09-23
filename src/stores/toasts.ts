import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  timeout?: number
  actionLabel?: string
  onAction?: () => void
}

export const useToastStore = defineStore('toasts', () => {
  const toasts = ref<Toast[]>([])

  const push = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const full: Toast = { timeout: 4000, ...toast, id }
    toasts.value.push(full)
    if (full.timeout) {
      setTimeout(() => dismiss(id), full.timeout)
    }
    return id
  }

  const dismiss = (id: string) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const clear = () => { toasts.value = [] }

  return { toasts, push, dismiss, clear }
})