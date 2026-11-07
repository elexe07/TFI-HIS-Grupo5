<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRecursosStore } from '@/stores/recursos'
import { useToastStore } from '@/stores/toast'
import { Card, Button, Select, Badge, Modal } from '@/components/ui'
import type { CamaDTO, EstadoCama } from '@/types/api'

const recursosStore = useRecursosStore()
const toastStore = useToastStore()

const showModal = ref(false)
const editingCama = ref<CamaDTO | null>(null)
const nuevoEstado = ref<EstadoCama>('LIBRE')

const sectorFilter = ref('')
const estadoFilter = ref<EstadoCama | ''>('')

const allCamas = computed(() => recursosStore.habitaciones.flatMap(h => h.camas))
const sectores = computed(() => {
  const sects = allCamas.value
    .map(c => c.habitacion?.sector)
    .filter((s): s is string => typeof s === 'string' && s.length > 0)
  return [...new Set(sects)]
})

const sectorOptions = computed(() => [
  { value: '', label: 'Todos los sectores' },
  ...sectores.value.map((s: string) => ({ value: s, label: s })),
])

function getEstadoVariant(estado: EstadoCama): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<EstadoCama, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    LIBRE: 'success',
    OCUPADA: 'danger',
    EN_LIMPIEZA: 'warning',
    BLOQUEADA: 'info',
  }
  return variants[estado] ?? 'info'
}

async function cargarDatos() {
  try {
    await recursosStore.cargarMapaCamas()
  } catch (err) {
    toastStore.error('Error', 'No se pudo cargar el mapa de camas')
  }
}

function abrirModalCambiarEstado(cama: CamaDTO) {
  editingCama.value = cama
  nuevoEstado.value = cama.estado
  showModal.value = true
}

async function cambiarEstado() {
  if (!editingCama.value) return
  try {
    await recursosStore.cambiarEstadoCama(editingCama.value.id, nuevoEstado.value)
    toastStore.success('Estado actualizado', `Cama ${editingCama.value.codigo} ahora está ${nuevoEstado.value}`)
    showModal.value = false
    editingCama.value = null
  } catch (err) {
    // Error manejado en store
  }
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <div class="mapa-camas-view">
    <div class="view-header">
      <div>
        <h2>Mapa de Camas</h2>
        <p class="view-subtitle">Visualización y gestión del estado de camas por sector</p>
      </div>
    </div>

    <!-- Filtros -->
    <Card class="filters-card">
      <div class="filters-grid">
        <div class="filter-field">
          <label class="label">Sector</label>
          <Select
            v-model="sectorFilter"
            :options="sectorOptions"
            placeholder="Filtrar por sector"
          />
        </div>
        <div class="filter-field">
          <label class="label">Estado</label>
          <Select
            v-model="estadoFilter"
            :options="[
              { value: '', label: 'Todos los estados' },
              { value: 'LIBRE', label: 'Libre' },
              { value: 'OCUPADA', label: 'Ocupada' },
              { value: 'EN_LIMPIEZA', label: 'En limpieza' },
              { value: 'BLOQUEADA', label: 'Bloqueada' },
            ]"
            placeholder="Filtrar por estado"
          />
        </div>
      </div>
    </Card>

    <!-- Resumen -->
    <div class="resumen-grid">
      <div class="resumen-card success">
        <span class="resumen-label">Libres</span>
        <span class="resumen-value">{{ recursosStore.resumenCamas?.libres ?? 0 }}</span>
      </div>
      <div class="resumen-card danger">
        <span class="resumen-label">Ocupadas</span>
        <span class="resumen-value">{{ recursosStore.resumenCamas?.ocupadas ?? 0 }}</span>
      </div>
      <div class="resumen-card warning">
        <span class="resumen-label">En Limpieza</span>
        <span class="resumen-value">{{ recursosStore.resumenCamas?.enLimpieza ?? 0 }}</span>
      </div>
      <div class="resumen-card info">
        <span class="resumen-label">Bloqueadas</span>
        <span class="resumen-value">{{ recursosStore.resumenCamas?.bloqueadas ?? 0 }}</span>
      </div>
      <div class="resumen-card primary">
        <span class="resumen-label">Total</span>
        <span class="resumen-value">{{ recursosStore.resumenCamas?.total ?? 0 }}</span>
      </div>
    </div>

    <!-- Mapa por Habitación -->
    <div class="habitaciones-grid">
      <Card v-for="habitacion in recursosStore.habitaciones" :key="habitacion.id" class="habitacion-card">
        <div class="habitacion-header">
          <h4>{{ habitacion.sector }} - {{ habitacion.numero }}</h4>
          <span class="habitacion-count">{{ habitacion.camas.length }} camas</span>
        </div>
        <div class="camas-grid">
          <div
            v-for="cama in habitacion.camas"
            :key="cama.id"
            :class="['cama-card', getEstadoVariant(cama.estado)]"
            @click="abrirModalCambiarEstado(cama)"
          >
            <div class="cama-codigo">{{ cama.codigo }}</div>
            <div class="cama-estado">{{ cama.estado }}</div>
            <div v-if="cama.internacionActiva" class="cama-paciente">
              {{ cama.internacionActiva.paciente?.apellido }}, {{ cama.internacionActiva.paciente?.nombre }}
            </div>
            <div v-else class="cama-paciente empty">Sin paciente</div>
          </div>
        </div>
      </Card>
    </div>

    <div v-if="recursosStore.habitaciones.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
        <path d="M2 4v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4"></path>
        <path d="M2 8h18"></path>
        <path d="M2 16h18"></path>
      </svg>
      <h3>No hay habitaciones configuradas</h3>
      <p class="text-muted">Configure habitaciones y camas desde el backend.</p>
    </div>

    <!-- Modal Cambiar Estado -->
    <Modal v-model:modelValue="showModal" title="Cambiar Estado de Cama" size="md" :closable="true">
      <div v-if="editingCama" class="form-grid">
        <div class="form-field">
          <label class="label">Cama</label>
          <input class="input" :value="`${editingCama.habitacion?.sector} - ${editingCama.habitacion?.numero} / ${editingCama.codigo}`" readonly />
        </div>
        <div class="form-field">
          <label class="label">Estado Actual</label>
          <Badge :variant="getEstadoVariant(editingCama.estado)" size="md">{{ editingCama.estado }}</Badge>
        </div>
        <div class="form-field">
          <label class="label">Nuevo Estado *</label>
          <Select
            v-model="nuevoEstado"
            :options="[
              { value: 'LIBRE', label: 'Libre' },
              { value: 'OCUPADA', label: 'Ocupada' },
              { value: 'EN_LIMPIEZA', label: 'En limpieza' },
              { value: 'BLOQUEADA', label: 'Bloqueada' },
            ]"
            required
          />
        </div>
      </div>
      <template #footer>
        <Button variant="secondary" @click="showModal = false">Cancelar</Button>
        <Button variant="primary" @click="cambiarEstado" :loading="recursosStore.cargando">Confirmar Cambio</Button>
      </template>
    </Modal>
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

.filters-card {
  margin-bottom: var(--space-md);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.resumen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.resumen-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-md);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-align: center;
}

.resumen-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-xs);
}

.resumen-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.resumen-card.success .resumen-value { color: var(--color-success); }
.resumen-card.danger .resumen-value { color: var(--color-danger); }
.resumen-card.warning .resumen-value { color: var(--color-warning); }
.resumen-card.info .resumen-value { color: var(--color-info); }
.resumen-card.primary .resumen-value { color: var(--color-primary); }

.habitaciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-md);
}

.habitacion-card {
  display: flex;
  flex-direction: column;
}

.habitacion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  margin: calc(-1 * var(--space-md)) calc(-1 * var(--space-md)) var(--space-sm);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.habitacion-header h4 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
}

.habitacion-count {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.camas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-sm);
}

.cama-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-md);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
}

.cama-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.cama-card.success { border-color: var(--color-success); background-color: var(--color-success-light); }
.cama-card.danger { border-color: var(--color-danger); background-color: var(--color-danger-light); }
.cama-card.warning { border-color: var(--color-warning); background-color: var(--color-warning-light); }
.cama-card.info { border-color: var(--color-info); background-color: var(--color-info-light); }

.cama-codigo {
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: var(--space-xs);
}

.cama-estado {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: var(--space-xs);
}

.cama-paciente {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.cama-paciente.empty {
  color: var(--color-text-muted);
  font-style: italic;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl);
  text-align: center;
  color: var(--color-text-muted);
}

.empty-icon {
  margin-bottom: var(--space-lg);
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 var(--space-sm);
  color: var(--color-text);
}

.empty-state p {
  margin: 0;
}

.text-muted {
  color: var(--color-text-muted);
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

.input {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.875rem;
}
</style>