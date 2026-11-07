

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useEnfermeriaStore } from '@/stores/enfermeria'
import { useAdmisionStore } from '@/stores/admision'
import { useToastStore } from '@/stores/toast'
import { Card, Button, Input, Select, Badge, Modal, Table } from '@/components/ui'
import type { TableColumn } from '@/components/ui/Table.types'
import type { EstadoIndicacion, IndicacionDTO } from '@/types/api'

const enfermeriaStore = useEnfermeriaStore()
const admisionStore = useAdmisionStore()
const toastStore = useToastStore()

const pacienteId = ref('')
const internacionId = ref('')
const showGenerarModal = ref(false)
const showOmitirModal = ref(false)
const indicacionOmitir = ref<{ id: string; motivo: string } | null>(null)
const indicacionOmitirMotivo = ref('')

// Form refs for Generar modal
const medicamento = ref('Amoxicilina')
const dosis = ref('500 mg')
const frecuenciaHoras = ref('8')
const duracionDias = ref('1')

const columns: TableColumn<IndicacionDTO>[] = [
  { key: 'descripcion', label: 'Medicamento y Dosis', sortable: true },
  { key: 'programadaPara', label: 'Programada Para', width: '180px', format: (v) => v ? new Date(v as string).toLocaleString('es-AR') : '-' },
  { key: 'estado', label: 'Estado', width: '120px' },
  { key: 'motivoOmision', label: 'Observaciones', format: (v): string => v ? `<em>${v}</em>` : '-' },
  { key: 'actions', label: 'Acciones', width: '180px' },
]

async function cargarDatos() {
  if (!pacienteId.value) return
  enfermeriaStore.setContexto(pacienteId.value, internacionId.value ?? undefined)
  await enfermeriaStore.cargarDatos()
}

async function generarIndicaciones() {
  // Para demo, usamos datos simulados
  await enfermeriaStore.generarIndicaciones({
    prescripcionId: crypto.randomUUID(),
    pacienteId: pacienteId.value,
    internacionId: internacionId.value ?? undefined,
    medicamento: 'Amoxicilina',
    dosis: '500 mg',
    frecuenciaHoras: 8,
    duracionDias: 1,
    inicioEn: new Date().toISOString(),
  })
  toastStore.success('Indicaciones generadas', '3 dosis programadas')
  showGenerarModal.value = false
}

async function administrar(id: string) {
  await enfermeriaStore.administrarIndicacion(id)
  toastStore.success('Medicación administrada', 'Stock notificado a recursos')
}

function abrirOmitir(id: string) {
  indicacionOmitir.value = { id, motivo: '' }
  indicacionOmitirMotivo.value = ''
  showOmitirModal.value = true
}

async function confirmarOmision() {
  if (!indicacionOmitirMotivo.value.trim()) return
  if (!indicacionOmitir.value) return
  await enfermeriaStore.omitirIndicacion(indicacionOmitir.value.id, indicacionOmitirMotivo.value.trim())
  toastStore.warning('Indicación omitida', indicacionOmitirMotivo.value)
  showOmitirModal.value = false
  indicacionOmitir.value = null
  indicacionOmitirMotivo.value = ''
}

function cerrarModalOmitir() {
  showOmitirModal.value = false
  indicacionOmitir.value = null
  indicacionOmitirMotivo.value = ''
}

function getEstadoVariant(estado: EstadoIndicacion): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<EstadoIndicacion, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    PENDIENTE: 'info',
    EJECUTADA: 'success',
    OMITIDA: 'warning',
  }
  return variants[estado] ?? 'info'
}

watch(() => admisionStore.pacienteSeleccionado, (paciente) => {
  if (paciente) {
    pacienteId.value = paciente.id
    cargarDatos()
  }
})

onMounted(() => {
  if (admisionStore.pacienteSeleccionado) {
    pacienteId.value = admisionStore.pacienteSeleccionado.id
    cargarDatos()
  }
})
</script>

<template>
  <div class="indicaciones-view">
    <div class="view-header">
      <div>
        <h2>Indicaciones Médicas</h2>
        <p class="view-subtitle">Control de indicaciones programadas, administración y omisión de medicación</p>
      </div>
      <div class="view-actions">
        <Button variant="primary" @click="showGenerarModal = true" :disabled="!pacienteId">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Generar Indicaciones
        </Button>
      </div>
    </div>

    <Card class="context-card">
      <div class="context-grid">
        <div class="context-field">
          <label>Paciente</label>
          <Select
            v-model="pacienteId"
            :options="admisionStore.pacientes.map(p => ({ value: p.id, label: `${p.apellido}, ${p.nombre} (${p.tipoDocumento} ${p.numeroDocumento})` }))"
            placeholder="Seleccionar paciente"
          />
        </div>
        <div class="context-field">
          <label>Internación (opcional)</label>
          <Input
            v-model="internacionId"
            placeholder="ID de internación"
            type="text"
          />
        </div>
        <Button variant="secondary" @click="cargarDatos" :loading="enfermeriaStore.cargando" class="load-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
          Cargar
        </Button>
      </div>
    </Card>

    <!-- Alertas de indicaciones vencidas -->
    <div v-if="enfermeriaStore.indicacionesVencidas.length" class="alertas-vencidas">
      <div class="alerta-banner warning">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
        <span>{{ enfermeriaStore.indicacionesVencidas.length }} indicación(es) vencida(s) sin administrar</span>
      </div>
    </div>

    <Card>
      <Table
        :columns="columns"
        :rows="enfermeriaStore.indicaciones"
        rowKey="id"
        :hoverable="true"
        :striped="true"
        emptyText="No hay indicaciones para este paciente. Seleccione un paciente y presione 'Cargar'."
      >
        <template #cell-estado="{ value }">
          <Badge :variant="getEstadoVariant(value as EstadoIndicacion)" size="md">{{ value }}</Badge>
        </template>

        <template #cell-motivoOmision="{ value }">
          <span v-if="value" class="motivo-omision">{{ value }}</span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell-actions="{ row }">
          <div class="action-buttons">
            <Button
              v-if="row.estado === 'PENDIENTE'"
              variant="success"
              size="sm"
              @click.stop="administrar(row.id as string)"
              :loading="enfermeriaStore.cargando"
            >
              Administrar
            </Button>
            <Button
              v-if="row.estado === 'PENDIENTE'"
              variant="danger"
              size="sm"
              @click.stop="abrirOmitir(row.id as string)"
            >
              Omitir
            </Button>
            <span v-else class="text-muted text-xs">Completada</span>
          </div>
        </template>
      </Table>
    </Card>

    <Modal v-model="showGenerarModal" title="Generar Indicaciones desde Prescripción" @close="showGenerarModal = false">
      <div class="modal-form">
        <p class="text-muted mb-md">Esto creará 3 indicaciones (cada 8 horas por 1 día) para el paciente seleccionado.</p>
        <div class="form-row">
          <Input v-model="medicamento" label="Medicamento" placeholder="Amoxicilina" required />
          <Input v-model="dosis" label="Dosis" placeholder="500 mg" required />
        </div>
        <div class="form-row">
          <Input v-model="frecuenciaHoras" label="Frecuencia (horas)" type="number" required />
          <Input v-model="duracionDias" label="Duración (días)" type="number" required />
        </div>
        <div class="form-actions">
          <Button variant="secondary" @click="showGenerarModal = false">Cancelar</Button>
          <Button variant="primary" @click="generarIndicaciones" :loading="enfermeriaStore.cargando">Generar</Button>
        </div>
      </div>
    </Modal>

    <Modal v-model="showOmitirModal" title="Omitir Indicación" @close="cerrarModalOmitir">
      <div class="modal-form">
        <p class="text-muted mb-md">Debe ingresar el motivo de la omisión.</p>
        <textarea
          v-model="indicacionOmitirMotivo"
          class="textarea-input"
          placeholder="Ej. Paciente dormido, rechaza medicación, en ayunas..."
          required
          rows="3"
        ></textarea>
        <div class="form-actions">
          <Button variant="secondary" @click="showOmitirModal = false">Cancelar</Button>
          <Button variant="danger" @click="confirmarOmision" :disabled="!indicacionOmitirMotivo.trim()">Confirmar Omisión</Button>
        </div>
      </div>
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

.view-actions {
  flex-shrink: 0;
}

.context-card {
  margin-bottom: var(--space-md);
}

.context-grid {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: var(--space-md);
  align-items: end;
}

@media (max-width: 768px) {
  .context-grid {
    grid-template-columns: 1fr;
  }
}

.context-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.context-field label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.load-btn {
  height: 40px;
}

.alertas-vencidas {
  margin-bottom: var(--space-md);
}

.alerta-banner {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background-color: var(--color-warning-light);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-md);
  color: var(--color-warning);
}

.motivo-omision {
  font-style: italic;
  color: var(--color-warning);
  font-size: 0.8125rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.textarea-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--color-text);
  background-color: var(--color-surface);
  resize: vertical;
}

.textarea-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.mb-md { margin-bottom: var(--space-md); }
</style>