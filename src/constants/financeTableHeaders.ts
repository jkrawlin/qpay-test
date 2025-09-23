// Shared finance table headers for cash flow style transaction listings
// Keeping narrow, uppercase styling handled via table scoped styles.
export interface FinanceHeader { title: string; value: string; align?: 'start'|'end'|'center'; width?: number; sortable?: boolean }

export const CASH_FLOW_HEADERS: FinanceHeader[] = [
  { title: 'ID', value: 'id', width: 90 },
  { title: 'Date', value: 'date', width: 110 },
  { title: 'Direction', value: 'direction', width: 105 },
  { title: 'Amount', value: 'amount', align: 'end', sortable: true },
  { title: 'Source', value: 'source', width: 110 },
  { title: 'Category', value: 'meta.category' },
  { title: 'Run Net', value: 'running', align: 'end', width: 120 }
]
