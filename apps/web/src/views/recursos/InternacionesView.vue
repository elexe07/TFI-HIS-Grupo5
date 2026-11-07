<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRecursosStore } from '@/stores/recursos'
import { useAdmisionStore } from '@/stores/admision'
import { useToastStore } from '@/stores/toast'
import { Card, Button, Select, Table, Badge, Modal, type TableColumn } from '@/components/ui'
import type { InternacionDTO, InternarPacienteRequest, EstadoInternacion, PacienteDTO, CamaDTO, MedicoDTO } from '@/types/api'

const recursosStore = useRecursosStore()
const admisionStore = useAdmisionStore()
const toastStore = useToastStore()

const showModal = ref(false)
const editingInternacion = ref<Partial<InternacionDTO> | null>(null)
const showAltaModal = ref(false)
const internacionParaAlta = ref<InternacionDTO | null>(null)

const columns: TableColumn<InternacionDTO>[] = [
  { key: 'id', label: 'ID', width: '80px', format: (v) => (v as string).slice(-8) },
  { key: 'paciente', label: 'Paciente', width: '220px', format: (v) => {
    const p = v as PacienteDTO | undefined
    return p ? `${p.apellido}, ${p.nombre} (${p.tipoDocumento} ${p.numeroDocumento})` : '—'
  }},
  { key: 'cama', label: 'Cama', width: '140px', format: (v) => {
    const c = v as CamaDTO | undefined
    return c ? `${c.habitacion?.sector || ''} - ${c.habitacion?.numero || ''} / ${c.codigo}` : '—'
  }},
  { key: 'medico', label: 'Médico', width: '180px', format: (v) => {
    const m = v as MedicoDTO | undefined
    return m ? `${m.apellido}, ${m.nombre} (${m.especialidad})` : '—'
  }},
  { key: 'motivo', label: 'Motivo', width: '200px' },
  { key: 'estado', label: 'Estado', width: '120px' },
  { key: 'ingresoEn', label: 'Ingreso', width: '160px', format: (v) => v ? new Date(v as string).toLocaleString('es-AR') : '—' },
  { key: 'egresoEn', label: 'Egreso', width: '160px', format: (v) => v ? new Date(v as string).toLocaleString('es-AR') : '—' },
]

function getEstadoVariant(estado: EstadoInternacion): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<EstadoInternacion, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    ACTIVA: 'success',
    ALTA: 'info',
  }
  return variants[estado] ?? 'info'
}

async function cargarDatos() {
  try {
    await Promise.all([
      recursosStore.cargarMapaCamas(),
      admisionStore.cargarPacientes(),
    ])
  } catch (err) {
    toastStore.error('Error', 'No se pudieron cargar los datos')
  }
}

async function internarPaciente() {
  if (!editingInternacion.value) return
  const req: InternarPacienteRequest = {
    pacienteId: editingInternacion.value.pacienteId || '',
    camaId: editingInternacion.value.camaId || '',
    medicoId: editingInternacion.value.medicoId || '',
    motivo: editingInternacion.value.motivo || '',
  }
  try {
    await recursosStore.internarPaciente(req)
    toastStore.success('Internación creada', 'Paciente internado correctamente')
    showModal.value = false
    editingInternacion.value = null
  } catch (err) {
    // Error manejado en store
  }
}

function abrirModalInternar() {
  editingInternacion.value = {
    pacienteId: '',
    camaId: '',
    medicoId: '',
    motivo: '',
    estado: 'ACTIVA',
    ingresoEn: new Date().toISOString(),
    egresoEn: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  showModal.value = true
}

function abrirModalAlta(internacion: InternacionDTO) {
  internacionParaAlta.value = internacion
  showAltaModal.value = true
}

async function darAlta() {
  if (!internacionParaAlta.value) return
  try {
    await recursosStore.darAlta(internacionParaAlta.value.id)
    toastStore.success('Alta realizada', 'Internación finalizada correctamente')
    showAltaModal.value = false
    internacionParaAlta.value = null
  } catch (err) {
    // Error manejado en store
  }
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <div class="internaciones-view">
    <div class="view-header">
      <div>
        <h2>Gestión de Internaciones</h2>
        <p class="view-subtitle">Administración de ingresos y altas de pacientes</p>
      </div>
      <Button variant="primary" @click="abrirModalInternar" :disabled="!recursosStore.camasLibres.length || !admisionStore.pacientes.length">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Nueva Internación
      </Button>
    </div>

    <Card>
      <Table
        :columns="columns"
        :rows="recursosStore.internaciones"
        rowKey="id"
        :hoverable="true"
        :striped="true"
        emptyText="No hay internaciones registradas."
      >
        <template #cell-estado="{ value }">
          <Badge :variant="getEstadoVariant(value as EstadoInternacion)" size="sm">{{ value }}</Badge>
        </template>
        <template #cell-actions="{ row }">
          <div class="action-buttons">
            <Button
              v-if="(row as unknown as InternacionDTO).estado === 'ACTIVA'"
              size="sm"
              variant="ghost"
              @click.stop="abrirModalAlta(row as unknown as InternacionDTO)"
              title="Dar alta médica"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            </Button>
          </div>
        </template>
      </Table>
    </Card>

    <!-- Modal Nueva Internación -->
    <Modal v-model:modelValue="showModal" title="Nueva Internación" size="lg" :closable="true">
      <div v-if="editingInternacion" class="form-grid">
        <div class="form-field">
          <label class="label">Paciente *</label>
          <Select
            v-model="editingInternacion.pacienteId"
            :options="admisionStore.pacientes.map(p => ({ value: p.id, label: `${p.apellido}, ${p.nombre} (${p.tipoDocumento} ${p.numeroDocumento})` }))"
            placeholder="Seleccionar paciente"
            required
          />
        </div>
        <div class="form-field">
          <label class="label">Cama *</label>
          <Select
            v-model="editingInternacion.camaId"
            :options="recursosStore.camasLibres.map(c => ({ value: c.id, label: `${c.habitacion?.sector || ''} - ${c.habitacion?.numero || ''} / ${c.codigo}` }))"
            placeholder="Seleccionar cama disponible"
            required
          />
        </div>
        <div class="form-field">
          <label class="label">Médico *</label>
          <Select
            v-model="editingInternacion.medicoId"
            :options="admisionStore.medicos.map(m => ({ value: m.id, label: `${m.apellido}, ${m.nombre} (${m.especialidad})` }))"
            placeholder="Seleccionar médico"
            required
          />
        </div>
        <div class="form-field form-field-full">
          <label class="label">Motivo *</label>
          <textarea class="input" v-model="editingInternacion.motivo" rows="3" placeholder="Motivo de la internación" required></textarea>
        </div>
      </div>
      <template #footer>
        <Button variant="secondary" @click="showModal = false">Cancelar</Button>
        <Button variant="primary" @click="internarPaciente" :loading="recursosStore.cargando" :disabled="!editingInternacion?.pacienteId || !editingInternacion?.camaId || !editingInternacion?.medicoId || !editingInternacion?.motivo">Confirmar Internación</Button>
      </template>
    </Modal>

    <!-- Modal Alta Médica -->
    <Modal v-model:modelValue="showAltaModal" title="Dar Alta Médica" size="md" :closable="true">
      <div v-if="internacionParaAlta" class="confirm-dialog">
        <p>¿Confirma dar alta médica a la internación del paciente <strong>{{ internacionParaAlta.paciente?.apellido }}, {{ internacionParaAlta.paciente?.nombre }}</strong>?</p>
        <p class="text-muted">Cama: {{ internacionParaAlta.cama?.habitacion?.sector }} - {{ internacionParaAlta.cama?.habitacion?.numero }} / {{ internacionParaAlta.cama?.codigo }}</p>
      </div>
      <template #footer>
        <Button variant="secondary" @click="showAltaModal = false">Cancelar</Button>
        <Button variant="danger" @click="darAlta" :loading="recursosStore.cargando">Confirmar Alta</Button>
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

.form-field-full {
  grid-column: 1 / -1;
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

.text-muted {
  color: var(--color-text-muted);
}

.action-buttons {
  display: flex;
  gap: var(--space-xs);
}

.confirm-dialog {
  padding: var(--space-md) 0;
}

.confirm-dialog p {
  margin: 0 0 var(--space-sm);
}

.confirm-dialog p:last-child {
  margin: 0;
}
</style>