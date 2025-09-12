import { ref, computed, onMounted } from 'vue'

export interface Column {
  key: string
  title: string
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  align?: 'start' | 'center' | 'end'
  format?: (value: any) => string
  type?: 'text' | 'number' | 'date' | 'boolean' | 'currency' | 'percentage'
}

export interface SortState {
  column: string | null
  direction: 'asc' | 'desc'
}

export interface FilterState {
  [key: string]: any
}

export interface PaginationState {
  page: number
  itemsPerPage: number
  total: number
}

export interface DataTableOptions {
  columns: Column[]
  data: any[]
  searchable?: boolean
  sortable?: boolean
  filterable?: boolean
  paginated?: boolean
  itemsPerPageOptions?: number[]
  defaultItemsPerPage?: number
  defaultSort?: SortState
  loading?: boolean
  selectable?: boolean
  multiSelect?: boolean
}

export function useDataTable(options: DataTableOptions) {
  const search = ref('')
  const sort = ref<SortState>(options.defaultSort || { column: null, direction: 'asc' })
  const filters = ref<FilterState>({})
  const pagination = ref<PaginationState>({
    page: 1,
    itemsPerPage: options.defaultItemsPerPage || 10,
    total: 0
  })
  const selected = ref<any[]>([])
  const loading = ref(options.loading || false)

  // Computed filtered and sorted data
  const processedData = computed(() => {
    let result = [...options.data]

    // Apply search filter
    if (search.value && options.searchable) {
      const searchTerm = search.value.toLowerCase()
      result = result.filter(item => {
        return options.columns.some(column => {
          const value = item[column.key]
          return value?.toString().toLowerCase().includes(searchTerm)
        })
      })
    }

    // Apply column filters
    Object.entries(filters.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        result = result.filter(item => {
          const itemValue = item[key]
          if (typeof value === 'string') {
            return itemValue?.toString().toLowerCase().includes(value.toLowerCase())
          }
          return itemValue === value
        })
      }
    })

    // Apply sorting
    if (sort.value.column && options.sortable) {
      const column = options.columns.find(col => col.key === sort.value.column)
      if (column && column.sortable !== false) {
        result.sort((a, b) => {
          let aVal = a[sort.value.column!]
          let bVal = b[sort.value.column!]

          // Handle different data types
          if (column.type === 'number' || column.type === 'currency' || column.type === 'percentage') {
            aVal = Number(aVal) || 0
            bVal = Number(bVal) || 0
          } else if (column.type === 'date') {
            aVal = new Date(aVal).getTime()
            bVal = new Date(bVal).getTime()
          } else {
            aVal = aVal?.toString().toLowerCase() || ''
            bVal = bVal?.toString().toLowerCase() || ''
          }

          if (aVal < bVal) return sort.value.direction === 'asc' ? -1 : 1
          if (aVal > bVal) return sort.value.direction === 'asc' ? 1 : -1
          return 0
        })
      }
    }

    // Update total count for pagination
    pagination.value.total = result.length

    // Apply pagination
    if (options.paginated) {
      const start = (pagination.value.page - 1) * pagination.value.itemsPerPage
      const end = start + pagination.value.itemsPerPage
      result = result.slice(start, end)
    }

    return result
  })

  const totalPages = computed(() => {
    if (!options.paginated) return 1
    return Math.ceil(pagination.value.total / pagination.value.itemsPerPage)
  })

  const isAllSelected = computed(() => {
    return processedData.value.length > 0 && selected.value.length === processedData.value.length
  })

  const isSomeSelected = computed(() => {
    return selected.value.length > 0 && selected.value.length < processedData.value.length
  })

  // Methods
  const updateSort = (columnKey: string) => {
    const column = options.columns.find(col => col.key === columnKey)
    if (!column || column.sortable === false) return

    if (sort.value.column === columnKey) {
      sort.value.direction = sort.value.direction === 'asc' ? 'desc' : 'asc'
    } else {
      sort.value.column = columnKey
      sort.value.direction = 'asc'
    }
  }

  const updateFilter = (columnKey: string, value: any) => {
    filters.value[columnKey] = value
    pagination.value.page = 1 // Reset to first page when filtering
  }

  const clearFilters = () => {
    filters.value = {}
    search.value = ''
    pagination.value.page = 1
  }

  const updatePage = (page: number) => {
    pagination.value.page = Math.max(1, Math.min(page, totalPages.value))
  }

  const updateItemsPerPage = (itemsPerPage: number) => {
    pagination.value.itemsPerPage = itemsPerPage
    pagination.value.page = 1
  }

  const toggleRowSelection = (item: any) => {
    if (!options.selectable) return

    const index = selected.value.findIndex(selectedItem => selectedItem === item)
    if (index === -1) {
      if (options.multiSelect) {
        selected.value.push(item)
      } else {
        selected.value = [item]
      }
    } else {
      selected.value.splice(index, 1)
    }
  }

  const toggleAllSelection = () => {
    if (!options.selectable || !options.multiSelect) return

    if (isAllSelected.value) {
      selected.value = []
    } else {
      selected.value = [...processedData.value]
    }
  }

  const clearSelection = () => {
    selected.value = []
  }

  const isRowSelected = (item: any) => {
    return selected.value.includes(item)
  }

  const formatCellValue = (item: any, column: Column) => {
    const value = item[column.key]
    
    if (column.format) {
      return column.format(value)
    }

    switch (column.type) {
      case 'currency':
        return new Intl.NumberFormat('en-QA', {
          style: 'currency',
          currency: 'QAR'
        }).format(Number(value) || 0)
      case 'percentage':
        return `${Number(value) || 0}%`
      case 'date':
        return value ? new Date(value).toLocaleDateString() : ''
      case 'boolean':
        return value ? 'Yes' : 'No'
      default:
        return value?.toString() || ''
    }
  }

  const exportData = (format: 'csv' | 'json' = 'csv', filename?: string) => {
    const dataToExport = processedData.value
    const timestamp = new Date().toISOString().split('T')[0]
    const defaultFilename = `export_${timestamp}`

    if (format === 'csv') {
      const headers = options.columns.map(col => col.title).join(',')
      const rows = dataToExport.map(item => {
        return options.columns.map(col => {
          const value = formatCellValue(item, col)
          return `"${value.replace(/"/g, '""')}"`
        }).join(',')
      })
      
      const csvContent = [headers, ...rows].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename || defaultFilename}.csv`
      link.click()
    } else {
      const jsonContent = JSON.stringify(dataToExport, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename || defaultFilename}.json`
      link.click()
    }
  }

  // Auto-update pagination when data changes
  onMounted(() => {
    pagination.value.total = options.data.length
  })

  return {
    // State
    search,
    sort,
    filters,
    pagination,
    selected,
    loading,

    // Computed
    processedData,
    totalPages,
    isAllSelected,
    isSomeSelected,

    // Methods
    updateSort,
    updateFilter,
    clearFilters,
    updatePage,
    updateItemsPerPage,
    toggleRowSelection,
    toggleAllSelection,
    clearSelection,
    isRowSelected,
    formatCellValue,
    exportData
  }
}