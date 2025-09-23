<template>
  <div class="d-flex align-center justify-space-between pa-3 table-footer-enhanced">
    <div class="text-body-2 text-medium-emphasis">
      <slot name="range">
        Showing {{ start + 1 }}–{{ Math.min(end, totalFiltered) }} of {{ totalFiltered }}<span v-if="totalAll !== undefined"> (Total: {{ totalAll }})</span>
      </slot>
      <span v-if="$slots.summary || summary" class="ml-2 summary-inline">
        <slot name="summary">{{ summary }}</slot>
      </span>
    </div>
    <div class="d-flex align-center footer-controls">
      <v-select
        v-model="modelItemsPerPage"
        :items="rowsItems"
        label="Rows"
        variant="outlined"
        density="compact"
        hide-details
        class="mr-3 rows-select"
        style="width: 92px;"
      />
      <v-pagination
        v-model="modelPage"
        :length="pages"
        :total-visible="5"
        size="small"
        density="compact"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ start:number; end:number; totalFiltered:number; totalAll?:number; pages:number; page:number; itemsPerPage:number; rowsItems?: number[]; summary?: string }>()
const emit = defineEmits(['update:page','update:items-per-page'])
const modelPage = computed({ get:() => props.page, set:v => emit('update:page', v) })
const modelItemsPerPage = computed({ get:() => props.itemsPerPage, set:v => emit('update:items-per-page', v) })
const rowsItems = computed(() => props.rowsItems || [10,25,50,100])
</script>

<style scoped>
.table-footer-enhanced { background:#fafbfc;border-top:1px solid #e5e7eb; }
.summary-inline { font-size:11px; letter-spacing:.3px; opacity:.75; }
.rows-select :deep(.v-field__input) { padding:0 4px !important; }
.footer-controls { gap:4px; }
</style>