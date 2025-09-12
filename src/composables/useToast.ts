import { useToast as useVueToastification } from 'vue-toastification/dist/index.mjs'

export function useToast() {
  const toast = useVueToastification()

  const showSuccess = (message: string, options?: any) => {
    toast.success(message, {
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
      ...options
    })
  }

  const showError = (message: string, options?: any) => {
    toast.error(message, {
      position: 'top-right',
      timeout: 6000,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      draggable: true,
      draggablePercent: 0.6,
      showCloseButtonOnHover: false,
      hideProgressBar: false,
      closeButton: 'button',
      icon: true,
      ...options
    })
  }

  const showWarning = (message: string, options?: any) => {
    toast.warning(message, {
      position: 'top-right',
      timeout: 5000,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      draggable: true,
      draggablePercent: 0.6,
      showCloseButtonOnHover: false,
      hideProgressBar: false,
      closeButton: 'button',
      icon: true,
      ...options
    })
  }

  const showInfo = (message: string, options?: any) => {
    toast.info(message, {
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
      ...options
    })
  }

  const clear = () => {
    toast.clear()
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clear
  }
}