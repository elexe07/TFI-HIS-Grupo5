<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRecursosStore } from '@/stores/recursos';
import { useToastStore } from '@/stores/toast';
import { Card, Button, Input, Table, type TableColumn } from '@/components/ui';
import type { InsumoDTO } from '@/types/api';

const recursosStore = useRecursosStore();
const toastStore = useToastStore();

const search = ref('');
const showModal = ref(false);
const showEgresoModal = ref(false);
const editingInsumo = ref<InsumoDTO | null>(null);
const cantidadIngreso = ref('');
const cantidadEgreso = ref('');

const columns: TableColumn<InsumoDTO>[] = [
  { key: 'codigo', label: 'Código', width: '120px' },
  { key: 'nombre', label: 'Nombre' },
  {
    key: 'medicamentoAsociado',
    label: 'Medicamento Asoc.',
    width: '180px',
    format: (v: unknown) => (v as string) || '—',
  },
  { key: 'stockActual', label: 'Stock Actual', width: '120px' },
  { key: 'stockMinimo', label: 'Stock Mínimo', width: '120px' },
  {
    key: 'updatedAt',
    label: 'Actualizado',
    width: '160px',
    format: (v: unknown) => (v ? new Date(v as string).toLocaleString('es-AR', { hour12: false }) : '—'),
  },
];

const insumosFiltrados = computed(() => {
  if (!search.value.trim()) return recursosStore.insumos;
  const s = search.value.toLowerCase();
  return recursosStore.insumos.filter(
    (i) =>
      i.codigo.toLowerCase().includes(s) ||
      i.nombre.toLowerCase().includes(s) ||
      (i.medicamentoAsociado?.toLowerCase().includes(s) ?? false),
  );
});

function getStockVariant(insumo: InsumoDTO): 'success' | 'warning' | 'danger' {
  if (insumo.stockActual <= 0) return 'danger';
  if (insumo.stockActual <= insumo.stockMinimo) return 'warning';
  return 'success';
}

async function cargarInsumos() {
  try {
    await recursosStore.cargarInsumos();
  } catch (err) {
    toastStore.error('Error', 'No se pudieron cargar los insumos');
  }
}

function abrirModalIngreso(insumo: InsumoDTO) {
  editingInsumo.value = insumo;
  cantidadIngreso.value = '';
  showModal.value = true;
}

async function registrarIngreso() {
  if (!editingInsumo.value || !cantidadIngreso.value.trim()) return;
  const cantidad = parseInt(cantidadIngreso.value, 10);
  if (cantidad <= 0) return;
  try {
    await recursosStore.ingresarInsumo(editingInsumo.value.id, cantidad);
    toastStore.success('Stock actualizado', `Se ingresaron ${cantidad} unidades`);
    showModal.value = false;
    editingInsumo.value = null;
    cantidadIngreso.value = '';
  } catch (err) {
    // Error manejado en store
  }
}

function abrirModalEgreso(insumo: InsumoDTO) {
  editingInsumo.value = insumo;
  cantidadEgreso.value = '';
  showEgresoModal.value = true;
}

async function registrarEgreso() {
  if (!editingInsumo.value || !cantidadEgreso.value.trim()) return;
  const cantidad = parseInt(cantidadEgreso.value, 10);
  if (cantidad <= 0) return;
  if (cantidad > editingInsumo.value.stockActual) {
    toastStore.error('Stock insuficiente', `El stock actual es de ${editingInsumo.value.stockActual} unidades`);
    return;
  }
  try {
    await recursosStore.egresarInsumo(editingInsumo.value.id, cantidad);
    toastStore.success('Stock actualizado', `Se descontaron ${cantidad} unidades`);
    showEgresoModal.value = false;
    editingInsumo.value = null;
    cantidadEgreso.value = '';
  } catch (err) {
    // Error manejado en store
  }
}

onMounted(() => {
  cargarInsumos();
});
</script>

<template>
  <div class="insumos-view">
    <div class="view-header">
      <div>
        <h2>Gestión de Insumos</h2>
        <p class="view-subtitle">Inventario de insumos y medicamentos</p>
      </div>
    </div>

    <Card class="search-card">
      <Input
        v-model="search"
        placeholder="Buscar por código, nombre o medicamento..."
        size="sm"
        class="search-input"
      >
        <template #prefix>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </template>
      </Input>
    </Card>

    <Card>
      <Table
        :columns="columns"
        :rows="insumosFiltrados"
        rowKey="id"
        :hoverable="true"
        :striped="true"
        emptyText="No hay insumos registrados."
      >
        <template #cell-stockActual="{ row }">
          <span :class="['stock-badge', getStockVariant(row as unknown as InsumoDTO)]">
            {{ (row as unknown as InsumoDTO).stockActual }}
          </span>
        </template>
        <template #cell-stockMinimo="{ row }">
          <span class="text-muted">{{ (row as unknown as InsumoDTO).stockMinimo }}</span>
        </template>
        <template #cell-actions="{ row }">
          <div class="action-buttons">
            <Button
              size="sm"
              variant="ghost"
              @click.stop="abrirModalIngreso(row as unknown as InsumoDTO)"
              title="Registrar ingreso de stock (+)"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              @click.stop="abrirModalEgreso(row as unknown as InsumoDTO)"
              title="Registrar consumo / egreso de stock (-)"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </Button>
          </div>
        </template>
      </Table>
    </Card>

    <!-- Modal Registrar Ingreso -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal modal-md" @click.stop>
        <div class="modal-header">
          <h3>Registrar Ingreso de Stock</h3>
          <button class="modal-close" @click="showModal = false" aria-label="Cerrar">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body" v-if="editingInsumo">
          <div class="form-grid">
            <div class="form-field">
              <label class="label">Insumo</label>
              <input class="input" :value="editingInsumo.nombre" readonly />
            </div>
            <div class="form-field">
              <label class="label">Stock Actual</label>
              <input class="input" :value="editingInsumo.stockActual" readonly type="number" />
            </div>
            <div class="form-field">
              <label class="label">Stock Mínimo</label>
              <input class="input" :value="editingInsumo.stockMinimo" readonly type="number" />
            </div>
            <div class="form-field">
              <label class="label">Cantidad a Ingresar *</label>
              <Input
                v-model="cantidadIngreso"
                type="number"
                placeholder="Ej. 50"
                required
                min="1"
              />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <Button variant="secondary" @click="showModal = false">Cancelar</Button>
          <Button variant="primary" @click="registrarIngreso" :loading="recursosStore.cargando"
            >Confirmar Ingreso</Button
          >
        </div>
      </div>
    </div>

    <!-- Modal Registrar Egreso / Consumo -->
    <div v-if="showEgresoModal" class="modal-overlay" @click="showEgresoModal = false">
      <div class="modal modal-md" @click.stop>
        <div class="modal-header">
          <h3>Registrar Consumo / Egreso de Stock</h3>
          <button class="modal-close" @click="showEgresoModal = false" aria-label="Cerrar">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body" v-if="editingInsumo">
          <div class="form-grid">
            <div class="form-field">
              <label class="label">Insumo</label>
              <input class="input" :value="editingInsumo.nombre" readonly />
            </div>
            <div class="form-field">
              <label class="label">Stock Actual</label>
              <input class="input" :value="editingInsumo.stockActual" readonly type="number" />
            </div>
            <div class="form-field">
              <label class="label">Stock Mínimo</label>
              <input class="input" :value="editingInsumo.stockMinimo" readonly type="number" />
            </div>
            <div class="form-field">
              <label class="label">Cantidad a Descontar / Consumida *</label>
              <Input
                v-model="cantidadEgreso"
                type="number"
                placeholder="Ej. 10"
                required
                min="1"
                :max="editingInsumo.stockActual"
              />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <Button variant="secondary" @click="showEgresoModal = false">Cancelar</Button>
          <Button variant="danger" @click="registrarEgreso" :loading="recursosStore.cargando"
            >Confirmar Consumo</Button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
  flex-wrap: wrap;
}

.view-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.view-subtitle {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
}

.search-card {
  margin-bottom: var(--space-md);
}

.search-input {
  width: 100%;
  max-width: 400px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.input {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.875rem;
}

.stock-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.stock-badge.success {
  background-color: var(--color-success-light);
  color: var(--color-success);
}

.stock-badge.warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}

.stock-badge.danger {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
}

.text-muted {
  color: var(--color-text-muted);
}

.action-buttons {
  display: flex;
  gap: var(--space-xs);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  z-index: 1000;
  animation: fadeIn var(--transition-fast);
}

.modal {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 480px;
  animation: slideUp var(--transition-normal);
}

.modal-md {
  max-width: 480px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
}

.modal-close {
  background: none;
  border: none;
  padding: var(--space-xs);
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: color var(--transition-fast);
}

.modal-close:hover {
  color: var(--color-text);
}

.modal-body {
  padding: var(--space-lg);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
