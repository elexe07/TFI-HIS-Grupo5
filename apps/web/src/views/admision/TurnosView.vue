<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdmisionStore } from '@/stores/admision'
import { useToastStore } from '@/stores/toast'
import { Button, Input, Card, Table, Select, Modal, Badge } from '@/components/ui'
import type { TableColumn } from '@/components/ui/Table.types'
import type { TurnoDTO, EstadoTurno, MedicoDTO, PacienteDTO } from '@/types/api'

const admisionStore = useAdmisionStore()
const toastStore = useToastStore()

const searchDocumento = ref('')
const searchFechaDesde = ref(new Date().toISOString().split('T')[0])
const searchFechaHasta = ref(new Date().toISOString().split('T')[0])
const searchMedico = ref('')

// Form refs para Nuevo Turno
const showModalTurno = ref(false)
const formPacienteId = ref('')
const formMedicoId = ref('')
const formFecha = ref(new Date().toISOString().split('T')[0])
const formInicio = ref('09:00')
const formFin = ref('09:30')
const formMotivo = ref('')

const columns: TableColumn<TurnoDTO>[] = [
  { key: 'inicio', label: 'Fecha', width: '120px', format: (v) => v ? new Date(v as string).toLocaleDateString('es-AR') : '-' },
  { key: 'hora', label: 'Hora', width: '100px', format: (_v, row) => row.inicio ? new Date(row.inicio).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) : '-' },
  { key: 'paciente', label: 'Paciente', format: (_v, row) => row.paciente ? `${row.paciente.apellido}, ${row.paciente.nombre} (${row.paciente.tipoDocumento} ${row.paciente.numeroDocumento})` : '-' },
  { key: 'medico', label: 'Profesional', width: '180px', format: (_v, row) => row.medico ? `Dr. ${row.medico.apellido}, ${row.medico.nombre}` : '-' },
  { key: 'estado', label: 'Estado', width: '140px' },
  { key: 'motivoConsulta', label: 'Motivo', format: (v): string => (v as string) || '-' },
  { key: 'actions', label: 'Acciones', width: '120px' },
]

const medicosOptions = computed(() =>
  (admisionStore.medicos as MedicoDTO[]).map(p => ({ value: p.id, label: `Dr. ${p.apellido}, ${p.nombre} (${p.especialidad})` }))
)

const pacientesOptions = computed(() =>
  (admisionStore.pacientes as PacienteDTO[]).map(p => ({
    value: p.id,
    label: `${p.apellido}, ${p.nombre} (${p.tipoDocumento} ${p.numeroDocumento})`,
  }))
)

async function buscarTurnos() {
  let pacienteId: string | undefined = undefined

  if (searchDocumento.value.trim()) {
    const doc = searchDocumento.value.trim().toLowerCase()
    const match = admisionStore.pacientes.find(
      (p) => p.numeroDocumento.toLowerCase() === doc || p.id === doc
    )
    if (match) {
      pacienteId = match.id
    } else {
      try {
        await admisionStore.cargarPacientes({ documento: doc })
        const primero = admisionStore.pacientes.find(
          (p) => p.numeroDocumento.toLowerCase() === doc
        )
        if (primero) pacienteId = primero.id
      } catch {
        // no encontrado
      }
    }
  }

  await admisionStore.cargarTurnos({
    pacienteId,
    medicoId: searchMedico.value || undefined,
    fechaDesde: searchFechaDesde.value,
    fechaHasta: searchFechaHasta.value,
  })
}

function abrirModalTurno() {
  formPacienteId.value = admisionStore.pacientes[0]?.id ?? ''
  formMedicoId.value = admisionStore.medicos[0]?.id ?? ''
  formFecha.value = new Date().toISOString().split('T')[0]
  formInicio.value = '09:00'
  formFin.value = '09:30'
  formMotivo.value = ''
  showModalTurno.value = true
}

async function handleGuardarTurno() {
  if (!formPacienteId.value || !formMedicoId.value || !formFecha.value || !formInicio.value) {
    toastStore.error('Campos requeridos', 'Complete paciente, profesional, fecha y horario')
    return
  }

  const inicioISO = `${formFecha.value}T${formInicio.value}:00.000Z`
  const finISO = formFin.value ? `${formFecha.value}T${formFin.value}:00.000Z` : undefined

  try {
    await admisionStore.reservarTurno({
      pacienteId: formPacienteId.value,
      medicoId: formMedicoId.value,
      inicio: inicioISO,
      fin: finISO,
      motivoConsulta: formMotivo.value || undefined,
    })
    toastStore.success('Turno reservado', 'El turno ha sido agendado exitosamente')
    showModalTurno.value = false
    await buscarTurnos()
  } catch (err) {
    toastStore.apiError(err, 'No se pudo reservar el turno')
  }
}

async function confirmarCancelar(turno: TurnoDTO) {
  const pacienteTexto = turno.paciente ? `${turno.paciente.apellido}, ${turno.paciente.nombre}` : 'este turno'
  if (confirm(`¿Cancelar turno de ${pacienteTexto}?`)) {
    try {
      await admisionStore.cancelarTurno(turno.id)
      toastStore.success('Turno cancelado', 'El turno ha sido cancelado')
      buscarTurnos()
    } catch (err) {
      toastStore.error('Error', 'No se pudo cancelar el turno')
    }
  }
}

function getEstadoVariant(estado: EstadoTurno): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<EstadoTurno, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    RESERVADO: 'info',
    CONFIRMADO: 'primary',
    EN_SALA_ESPERA: 'warning',
    ATENDIDO: 'success',
    CANCELADO: 'danger',
  }
  return variants[estado] ?? 'info'
}

function limpiarFiltros() {
  searchDocumento.value = ''
  searchFechaDesde.value = new Date().toISOString().split('T')[0]
  searchFechaHasta.value = new Date().toISOString().split('T')[0]
  searchMedico.value = ''
  buscarTurnos()
}

onMounted(async () => {
  if (admisionStore.medicos.length === 0) {
    await admisionStore.cargarMedicos()
  }
  if (admisionStore.pacientes.length === 0) {
    await admisionStore.cargarPacientes({})
  }
  buscarTurnos()
})
</script>

<template>
  <div class="turnos-view">
    <div class="view-header">
      <div>
        <h2>Gestión de Turnos</h2>
        <p class="view-subtitle">Búsqueda, filtrado y control de estados de turnos</p>
      </div>
      <Button variant="primary" @click="abrirModalTurno" :disabled="admisionStore.medicos.length === 0 || admisionStore.pacientes.length === 0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        Nuevo Turno
      </Button>
    </div>

    <Card class="search-card">
      <div class="search-form">
        <Input
          v-model="searchDocumento"
          label="Documento Paciente"
          placeholder="Número de documento"
          size="sm"
        />
        <Select
          v-model="searchMedico"
          label="Profesional"
          :options="medicosOptions"
          placeholder="Todos los profesionales"
          size="sm"
        />
        <div class="date-range">
          <Input
            v-model="searchFechaDesde"
            label="Desde"
            type="date"
            size="sm"
          />
          <Input
            v-model="searchFechaHasta"
            label="Hasta"
            type="date"
            size="sm"
          />
        </div>
        <Button variant="secondary" @click="buscarTurnos" class="search-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          Buscar
        </Button>
        <Button variant="ghost" @click="limpiarFiltros">
          Limpiar
        </Button>
      </div>
    </Card>

    <Card>
      <Table
        :columns="columns"
        :rows="admisionStore.turnos"
        rowKey="id"
        :hoverable="true"
        :striped="true"
        emptyText="No se encontraron turnos con los filtros aplicados."
      >
        <template #cell-estado="{ value }">
          <Badge :variant="getEstadoVariant(value as EstadoTurno)" size="md">{{ value }}</Badge>
        </template>

        <template #cell-motivoConsulta="{ value }">
          <span v-if="value">{{ value }}</span>
          <span v-else class="text-muted">-</span>
        </template>

        <template #cell-actions="{ row }">
          <div class="action-buttons">
            <Button
              v-if="row.estado !== 'CANCELADO' && row.estado !== 'ATENDIDO'"
              variant="ghost"
              size="sm"
              class="danger"
              @click.stop="confirmarCancelar(row as unknown as TurnoDTO)"
              title="Cancelar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </Button>
          </div>
        </template>
      </Table>
    </Card>

    <!-- Modal Reservar Turno -->
    <Modal v-model="showModalTurno" title="Reservar Turno" size="md" @close="showModalTurno = false">
      <div class="turno-form">
        <div class="form-grid">
          <div class="form-row">
            <Select
              v-model="formPacienteId"
              label="Paciente"
              :options="pacientesOptions"
              placeholder="Seleccionar paciente"
              required
            />
          </div>
          <div class="form-row">
            <Select
              v-model="formMedicoId"
              label="Profesional Médico"
              :options="medicosOptions"
              placeholder="Seleccionar profesional"
              required
            />
          </div>
          <div class="form-row">
            <Input v-model="formFecha" label="Fecha" type="date" required />
          </div>
          <div class="form-row-2">
            <Input v-model="formInicio" label="Hora Inicio (HH:mm)" type="time" required />
            <Input v-model="formFin" label="Hora Fin (opcional)" type="time" />
          </div>
          <div class="form-row">
            <Input v-model="formMotivo" label="Motivo de Consulta" placeholder="Ej: Control general, dolor lumbar..." />
          </div>
        </div>
        <div class="form-actions">
          <Button variant="ghost" @click="showModalTurno = false">Cancelar</Button>
          <Button variant="primary" @click="handleGuardarTurno">Reservar Turno</Button>
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

.search-card {
  margin-bottom: var(--space-md);
}

.search-form {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
  align-items: flex-end;
}

.date-range {
  display: flex;
  gap: var(--space-sm);
}

.search-btn {
  height: 40px;
}

.action-buttons {
  display: flex;
  gap: var(--space-xs);
  align-items: center;
}

.action-buttons .danger:hover {
  color: var(--color-danger);
  background-color: var(--color-danger-light);
}

.text-muted {
  color: var(--color-text-muted);
}

.turno-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}
</style>