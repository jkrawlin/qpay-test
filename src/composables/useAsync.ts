import { ref, reactive } from 'vue'

export interface LoadingState {
  isLoading: boolean
  message?: string
  progress?: number
}

export interface AsyncOperationOptions {
  loadingMessage?: string
  successMessage?: string
  errorMessage?: string
  showProgress?: boolean
  minDuration?: number
}

export function useAsync() {
  const loading = ref<LoadingState>({
    isLoading: false,
    message: undefined,
    progress: undefined
  })

  const operations = reactive<Map<string, LoadingState>>(new Map())

  const setLoading = (
    key?: string, 
    isLoading: boolean = true, 
    message?: string, 
    progress?: number
  ) => {
    if (key) {
      operations.set(key, { isLoading, message, progress })
    } else {
      loading.value = { isLoading, message, progress }
    }
  }

  const isOperationLoading = (key: string): boolean => {
    return operations.get(key)?.isLoading || false
  }

  const getOperationState = (key: string): LoadingState | undefined => {
    return operations.get(key)
  }

  const clearOperation = (key: string) => {
    operations.delete(key)
  }

  const executeAsync = async <T>(
    operation: () => Promise<T>,
    options: AsyncOperationOptions = {}
  ): Promise<T> => {
    const startTime = Date.now()
    const { minDuration = 500, loadingMessage, showProgress } = options

    try {
      setLoading(undefined, true, loadingMessage, showProgress ? 0 : undefined)
      
      const result = await operation()
      
      // Ensure minimum duration for better UX
      const elapsed = Date.now() - startTime
      if (elapsed < minDuration) {
        await new Promise(resolve => setTimeout(resolve, minDuration - elapsed))
      }

      return result
    } finally {
      setLoading(undefined, false)
    }
  }

  const executeAsyncWithKey = async <T>(
    key: string,
    operation: () => Promise<T>,
    options: AsyncOperationOptions = {}
  ): Promise<T> => {
    const startTime = Date.now()
    const { minDuration = 500, loadingMessage, showProgress } = options

    try {
      setLoading(key, true, loadingMessage, showProgress ? 0 : undefined)
      
      const result = await operation()
      
      // Ensure minimum duration for better UX
      const elapsed = Date.now() - startTime
      if (elapsed < minDuration) {
        await new Promise(resolve => setTimeout(resolve, minDuration - elapsed))
      }

      return result
    } finally {
      clearOperation(key)
    }
  }

  const updateProgress = (key: string | undefined, progress: number, message?: string) => {
    if (key) {
      const current = operations.get(key)
      if (current) {
        operations.set(key, { ...current, progress, message: message || current.message })
      }
    } else {
      loading.value = { ...loading.value, progress, message: message || loading.value.message }
    }
  }

  return {
    loading: loading.value,
    operations,
    setLoading,
    isOperationLoading,
    getOperationState,
    clearOperation,
    executeAsync,
    executeAsyncWithKey,
    updateProgress
  }
}