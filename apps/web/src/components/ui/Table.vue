<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from './Button.vue'
import type { TableProps, TableColumn } from './Table.types'

const props = defineProps<TableProps>()

const emit = defineEmits<{
  'row-click': [row: Record<string, unknown>, event: Event]
  'sort': [key: string, order: 'asc' | 'desc']
}>()

const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

const displayedRows = computed(() => {
  let rows = [...props.rows]
  if (sortKey.value && props.columns.some(c => c.key === sortKey.value)) {
    rows.sort((a, b) => {
      const aVal = getCellValue(a, sortKey.value!)
      const bVal = getCellValue(b, sortKey.value!)
      // Comparar de forma segura
      const aStr = String(aVal ?? '')
      const bStr = String(bVal ?? '')
      if (aStr < bStr) return sortOrder.value === 'asc' ? -1 : 1
      if (aStr > bStr) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })
  }
  return rows
})

function getRowKey(row: Record<string, unknown>, index: number): string {
  const key = row[props.rowKey as string]
  return key !== undefined && key !== null ? String(key) : String(index)
}

function getCellValue(row: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce((obj: unknown, k) => (obj as Record<string, unknown>)?.[k], row)
}

function formatCellValue(row: Record<string, unknown>, column: TableColumn): string {
  const value = getCellValue(row, column.key)
  if (value === null || value === undefined) return '-'
  if (column.format) return column.format(value, row)
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (value instanceof Date) return value.toLocaleString('es-AR')
  return String(value)
}

function handleSort(key: string) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  emit('sort', key, sortOrder.value)
}

function goToPage(page: number) {
  if (props.onPageChange) {
    props.onPageChange(page)
  }
}

function onPreviousPage() {
  goToPage(props.pagination!.page - 1)
}

function onNextPage() {
  goToPage(props.pagination!.page + 1)
}

function onRowClick(row: Record<string, unknown>, event: Event) {
  emit('row-click', row, event)
}
</script>

<template>
  <div class="table-wrapper">
    <table class="table" :class="{ 'table-striped': striped, 'table-hover': hoverable, 'table-bordered': bordered }">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" :class="column.class" @click="column.sortable ? handleSort(column.key) : undefined" :style="{ width: column.width }">
            <div class="th-content">
              <span>{{ column.label }}</span>
              <span v-if="column.sortable" class="sort-icon">
                <span v-if="sortKey === column.key && sortOrder === 'asc'" class="icon-asc">▲</span>
                <span v-else-if="sortKey === column.key && sortOrder === 'desc'" class="icon-desc">▼</span>
                <span v-else class="icon-none">⋮</span>
              </span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in displayedRows" :key="getRowKey(row, rowIndex)" :class="{ 'clickable': rowClickable }" @click="rowClickable && onRowClick(row, $event)">
          <td v-for="column in columns" :key="column.key" :class="column.class">
            <slot :name="`cell-${column.key}`" :row="row" :value="getCellValue(row, column.key)">
              {{ formatCellValue(row, column) }}
            </slot>
          </td>
        </tr>
        <tr v-if="displayedRows.length === 0">
          <td :colspan="columns.length" class="text-center text-muted py-lg">
            {{ emptyText }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  <div v-if="pagination" class="table-pagination">
    <div class="pagination-info">
      Mostrando {{ (pagination.page - 1) * pagination.limit + 1 }} - {{ Math.min(pagination.page * pagination.limit, pagination.total) }} de {{ pagination.total }}
    </div>
    <div class="pagination-controls">
      <Button variant="ghost" size="sm" :disabled="pagination.page === 1" @click="onPreviousPage">Anterior</Button>
      <Button variant="ghost" size="sm" :disabled="pagination.page === pagination.totalPages" @click="onNextPage">Siguiente</Button>
    </div>
  </div>
</template>

<style scoped>
.table-wrapper {
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.table th {
  background-color: var(--color-bg);
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  font-weight: 600;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
  user-select: none;
}

.table td {
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.table-striped tbody tr:nth-child(even) {
  background-color: var(--color-bg);
}

.table-hover tbody tr:hover {
  background-color: var(--color-primary-light);
}

.table-bordered td,
.table-bordered th {
  border-right: 1px solid var(--color-border);
}

.table-bordered td:last-child,
.table-bordered th:last-child {
  border-right: none;
}

.th-content {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.sort-icon {
  font-size: 0.625rem;
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}

.table th:hover .sort-icon {
  color: var(--color-primary);
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  background-color: var(--color-primary-light) !important;
}

.text-center { text-align: center; }
.text-muted { color: var(--color-text-muted); }
.py-lg { padding-top: var(--space-lg); padding-bottom: var(--space-lg); }

.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg);
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.pagination-controls {
  display: flex;
  gap: var(--space-sm);
}
</style>