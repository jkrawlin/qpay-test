import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface SnackbarState {
  show: boolean
  text: string
  color: string
  timeout: number
  multiLine: boolean
  icon: string
}

export const useAppStore = defineStore('app', () => {
  // State
  const isLoading = ref(false)
  const theme = ref<'light' | 'dark'>('light')
  const snackbar = ref<SnackbarState>({
    show: false,
    text: '',
    color: 'success',
    timeout: 4000,
    multiLine: false,
    icon: 'mdi-check-circle'
  })

  const sidebar = ref({
    drawer: false,
    mini: false
  })

  const notifications = ref<any[]>([])
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.read).length
  )

  // Actions
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    localStorage.setItem('nipon-theme', newTheme)
  }

  const showSnackbar = (
    text: string, 
    color: string = 'success', 
    timeout: number = 4000,
    icon?: string
  ) => {
    const iconMap: Record<string, string> = {
      success: 'mdi-check-circle',
      error: 'mdi-alert-circle',
      warning: 'mdi-alert',
      info: 'mdi-information'
    }

    snackbar.value = {
      show: true,
      text,
      color,
      timeout,
      multiLine: text.length > 50,
      icon: icon || iconMap[color] || 'mdi-information'
    }
  }

  const hideSnackbar = () => {
    snackbar.value.show = false
  }

  const toggleSidebar = () => {
    sidebar.value.drawer = !sidebar.value.drawer
  }

  const setSidebarMini = (mini: boolean) => {
    sidebar.value.mini = mini
  }

  const addNotification = (notification: any) => {
    notifications.value.unshift({
      id: Date.now(),
      read: false,
      timestamp: new Date(),
      ...notification
    })
  }

  const markNotificationAsRead = (id: number) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  const markAllNotificationsAsRead = () => {
    notifications.value.forEach(n => n.read = true)
  }

  const removeNotification = (id: number) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAllNotifications = () => {
    notifications.value = []
  }

  return {
    // State
    isLoading,
    theme,
    snackbar,
    sidebar,
    notifications,
    unreadNotifications,

    // Actions
    setLoading,
    setTheme,
    showSnackbar,
    hideSnackbar,
    toggleSidebar,
    setSidebarMini,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearAllNotifications
  }
})