<template>
  <div class="enhanced-data-table" :class="tableClasses">
    <!-- Table Header -->
    <div v-if="showHeader" class="table-header">
      <div class="d-flex align-center justify-space-between mb-4">
        <!-- Title Section -->
        <div v-if="title || $slots.title" class="table-title-section">
          <slot name="title">
            <h3 class="text-h6 font-weight-medium">{{ title }}</h3>
            <p v-if="subtitle" class="text-caption text-grey-darken-1 ma-0">
              {{ subtitle }}
            </p>
          </slot>
        </div>

        <!-- Actions Section -->
        <div v-if="$slots.actions" class="table-actions">
          <slot name="actions" />
        </div>
      </div>

      <!-- Filters and Search -->
      <div v-if="searchable || filterable || $slots.filters" class="table-controls mb-4">
        <v-row align="center" dense>
          <!-- Search -->
          <v-col v-if="searchable" cols="12" md="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search..."
              variant="outlined"
              density="compact"
              clearable
              hide-details
              :loading="loading"
            />
          </v-col>

          <!-- Custom Filters -->
          <v-col v-if="$slots.filters">
            <slot name="filters" :filters="filters" :update-filter="updateFilter" />
          </v-col>

          <!-- Items per page -->
          <v-col v-if="paginated" cols="auto">
            <v-select
              v-model="pagination.itemsPerPage"
              :items="itemsPerPageOptions"
              label="Items per page"
              variant="outlined"
              density="compact"
              hide-details
              style="min-width: 120px"
              @update:model-value="updateItemsPerPage"
            />
          </v-col>

          <!-- Export Button -->
          <v-col v-if="exportable" cols="auto">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-download"
                  variant="outlined"
                  size="small"
                  :loading="exporting"
                />
              </template>
              <v-list>
                <v-list-item @click="handleExport('csv')">
                  <v-list-item-title>Export as CSV</v-list-item-title>
                </v-list-item>
                <v-list-item @click="handleExport('json')">
                  <v-list-item-title>Export as JSON</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- Selection Summary -->
    <div v-if="selectable && selected.length > 0" class="selection-summary mb-3">
      <v-alert
        type="info"
        variant="tonal"
        density="compact"
        class="d-flex align-center"
      >
        <div class="flex-grow-1">
          {{ selected.length }} item{{ selected.length !== 1 ? 's' : '' }} selected
        </div>
        <div class="d-flex gap-2">
          <slot name="bulk-actions" :selected="selected" />
          <v-btn
            variant="text"
            size="small"
            @click="clearSelection"
          >
            Clear
          </v-btn>
        </div>
      </v-alert>
    </div>

    <!-- Data Table -->
    <v-data-table
      v-model="selected"
      :headers="tableHeaders"
      :items="items"
      :loading="loading"
      :search="search"
      :sort-by="sortBy"
      :items-per-page="pagination.itemsPerPage"
      :page="pagination.page"
      :show-select="selectable"
      :item-selectable="itemSelectable"
      :density="dense ? 'compact' : 'default'"
      :hover="hover"
      :class="dataTableClasses"
      class="enhanced-data-table__table"
      @update:page="updatePage"
      @update:items-per-page="updateItemsPerPage"
      @update:sort-by="updateSort"
      @click:row="handleRowClick"
    >
      <!-- Custom headers -->
      <template v-for="column in columns" :key="column.key" #[`header.${column.key}`]="{ column: headerColumn }">
        <div class="d-flex align-center">
          <span>{{ headerColumn.title }}</span>
          <v-tooltip v-if="column.tooltip" :text="column.tooltip" location="top">
            <template #activator="{ props }">
              <v-icon v-bind="props" size="small" class="ml-1">mdi-help-circle-outline</v-icon>
            </template>
          </v-tooltip>
        </div>
      </template>

      <!-- Custom cells -->
      <template v-for="column in columns" :key="column.key" #[`item.${column.key}`]="{ item, value }">
        <slot :name="`item.${column.key}`" :item="item" :value="value" :column="column">
          <div :class="getCellClasses(column)">
            {{ formatCellValue(item, column) }}
          </div>
        </slot>
      </template>

      <!-- Actions column -->
      <template v-if="$slots.actions || actions.length > 0" #item.actions="{ item }">
        <div class="table-row-actions">
          <slot name="item-actions" :item="item" :actions="actions">
            <v-menu v-if="actions.length > 3">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-dots-vertical"
                  variant="text"
                  size="small"
                />
              </template>
              <v-list>
                <v-list-item
                  v-for="action in actions"
                  :key="action.key"
                  @click="handleAction(action, item)"
                >
                  <template #prepend>
                    <v-icon :icon="action.icon" size="small" />
                  </template>
                  <v-list-item-title>{{ action.label }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <div v-else class="d-flex gap-1">
              <v-btn
                v-for="action in actions"
                :key="action.key"
                :icon="action.icon"
                :color="action.color"
                variant="text"
                size="small"
                :disabled="action.disabled?.(item)"
                @click="handleAction(action, item)"
              />
            </div>
          </slot>
        </div>
      </template>

      <!-- Loading slot -->
      <template #loading>
        <div class="text-center pa-4">
          <v-progress-circular
            indeterminate
            color="primary"
            :size="32"
          />
          <div class="text-subtitle-2 mt-2">{{ loadingMessage || 'Loading data...' }}</div>
        </div>
      </template>

      <!-- No data slot -->
      <template #no-data>
        <div class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">
            {{ noDataIcon }}
          </v-icon>
          <div class="text-h6 font-weight-medium mb-2">
            {{ noDataTitle || 'No data available' }}
          </div>
          <div class="text-body-2 text-grey-darken-1 mb-4">
            {{ noDataMessage || 'There are no items to display' }}
          </div>
          <slot name="no-data-actions" />
        </div>
      </template>

      <!-- Bottom slot for custom pagination -->
      <template v-if="$slots.bottom" #bottom>
        <slot name="bottom" />
      </template>
    </v-data-table>

    <!-- Table Footer -->
    <div v-if="showFooter || $slots.footer" class="table-footer mt-3">
      <slot name="footer" :items="items" :selected="selected" :pagination="pagination" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Column } from '@/composables/useDataTable'

interface TableAction {
  key: string
  label: string
  icon: string
  color?: string
  disabled?: (item: any) => boolean
  handler: (item: any) => void
}

interface Props {
  columns: Column[]
  items: any[]
  title?: string
  subtitle?: string
  loading?: boolean
  loadingMessage?: string
  searchable?: boolean
  sortable?: boolean
  filterable?: boolean
  paginated?: boolean
  selectable?: boolean
  multiSelect?: boolean
  dense?: boolean
  hover?: boolean
  exportable?: boolean
  showHeader?: boolean
  showFooter?: boolean
  itemsPerPageOptions?: number[]
  actions?: TableAction[]
  noDataTitle?: string
  noDataMessage?: string
  noDataIcon?: string
  itemSelectable?: (item: any) => boolean
  rowClickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  searchable: true,
  sortable: true,
  filterable: false,
  paginated: true,
  selectable: false,
  multiSelect: true,
  dense: false,
  hover: true,
  exportable: true,
  showHeader: true,
  showFooter: false,
  itemsPerPageOptions: () => [10, 25, 50, 100],
  actions: () => [],
  noDataIcon: 'mdi-inbox-outline',
  rowClickable: false
})

const emit = defineEmits<{
  'row-click': [item: any, event: MouseEvent]
  'action': [action: string, item: any]
  'export': [format: 'csv' | 'json', items: any[]]
}>()

// State
const search = ref('')
const selected = ref<any[]>([])
const filters = ref<Record<string, any>>({})
const sortBy = ref<{ key: string; order: 'asc' | 'desc' }[]>([])
const pagination = ref({
  page: 1,
  itemsPerPage: props.itemsPerPageOptions[0]
})
const exporting = ref(false)

// Computed
const tableHeaders = computed(() => {
  const headers = props.columns.map(column => ({
    title: column.title,
    key: column.key,
    sortable: column.sortable !== false && props.sortable,
    width: column.width,
    align: column.align || 'start'
  }))

  // Add actions column if needed
  if (props.actions.length > 0 || $slots['item-actions']) {
    headers.push({
      title: 'Actions',
      key: 'actions',
      sortable: false,
      width: '100px',
      align: 'center' as const
    })
  }

  return headers
})

const tableClasses = computed(() => [
  'enhanced-data-table',
  {
    'enhanced-data-table--dense': props.dense,
    'enhanced-data-table--selectable': props.selectable
  }
])

const dataTableClasses = computed(() => [
  {
    'table-hover': props.hover,
    'table-clickable': props.rowClickable
  }
])

// Methods
const updateFilter = (key: string, value: any) => {
  filters.value[key] = value
}

const updatePage = (page: number) => {
  pagination.value.page = page
}

const updateItemsPerPage = (itemsPerPage: number) => {
  pagination.value.itemsPerPage = itemsPerPage
  pagination.value.page = 1
}

const updateSort = (sort: { key: string; order: 'asc' | 'desc' }[]) => {
  sortBy.value = sort
}

const clearSelection = () => {
  selected.value = []
}

const handleRowClick = (event: MouseEvent, { item }: { item: any }) => {
  if (props.rowClickable) {
    emit('row-click', item, event)
  }
}

const handleAction = (action: TableAction, item: any) => {
  action.handler(item)
  emit('action', action.key, item)
}

const handleExport = async (format: 'csv' | 'json') => {
  exporting.value = true
  try {
    emit('export', format, props.items)
  } finally {
    exporting.value = false
  }
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

const getCellClasses = (column: Column) => [
  `cell-${column.type || 'text'}`,
  {
    'text-end': column.align === 'end',
    'text-center': column.align === 'center'
  }
]

// Watch for external changes
watch(() => props.items, () => {
  // Reset pagination when items change
  pagination.value.page = 1
})
</script>

<style scoped>
.enhanced-data-table {
  width: 100%;
}

.table-header {
  margin-bottom: 16px;
}

.table-title-section {
  flex: 1;
}

.table-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.table-controls {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 8px;
  padding: 16px;
}

.selection-summary {
  margin-bottom: 16px;
}

.enhanced-data-table__table {
  border-radius: 8px;
  overflow: hidden;
}

.table-row-actions {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.table-footer {
  padding-top: 16px;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Cell type styles */
.cell-currency {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
}

.cell-percentage {
  color: rgb(var(--v-theme-primary));
  font-weight: 500;
}

.cell-number {
  font-family: 'Roboto Mono', monospace;
}

.cell-date {
  white-space: nowrap;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .table-header {
    .d-flex {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }

  .table-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

/* Hover effects */
.table-hover :deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.table-clickable :deep(.v-data-table__tr) {
  cursor: pointer;
}
</style>