import { ref } from 'vue'

export function useNotification() {
  const notifications = ref<any[]>([])

  const showSuccess = (message: string) => {
    console.log('✅ Success:', message)
    // You can implement actual notification system here
    // For now, just using console.log
  }

  const showError = (message: string) => {
    console.error('❌ Error:', message)
    // You can implement actual notification system here
  }

  const showWarning = (message: string) => {
    console.warn('⚠️ Warning:', message)
    // You can implement actual notification system here
  }

  const showInfo = (message: string) => {
    console.info('ℹ️ Info:', message)
    // You can implement actual notification system here
  }

  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}