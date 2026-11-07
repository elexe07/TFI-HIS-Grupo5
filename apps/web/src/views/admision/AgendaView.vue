<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useAdmisionStore } from '@/stores/admision';
import { useToastStore } from '@/stores/toast';
import { Button, Input, Card, Table, Select, Modal, Badge } from '@/components/ui';
import type { TableColumn } from '@/components/ui/Table.types';
import type {
  TurnoDTO,
  EstadoTurno,
  MedicoDTO,
  ReservarTurnoRequest,
  FranjaAgendaDTO,
  PacienteDTO,
} from '@/types/api';

const admisionStore = useAdmisionStore();
const toastStore = useToastStore();

// Devuelve la fecha local en formato YYYY-MM-DD (evita el bug UTC donde
// a las 21:00 Argentina ya es "mañana" en UTC)
function localDateString(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const profesionalId = ref('');
const fechaSeleccionada = ref(localDateString());
const showTurnoModal = ref(false);
const showAgendaModal = ref(false);
const editingTurno = ref<TurnoDTO | null>(null);

// Form refs para Turno
const formPacienteId = ref('');
const formFecha = ref(''); // fecha del turno (YYYY-MM-DD)
const formInicio = ref('');
const formFin = ref('');
const formMotivo = ref('');

// Form refs para Definir Agenda
const franjasForm = ref<
  { diaSemana: number; horaInicio: string; horaFin: string; duracionTurnoMin: number }[]
>([]);

const diasSemana = [
  { value: '1', label: 'Lunes' },
  { value: '2', label: 'Martes' },
  { value: '3', label: 'Miércoles' },
  { value: '4', label: 'Jueves' },
  { value: '5', label: 'Viernes' },
  { value: '6', label: 'Sábado' },
  { value: '0', label: 'Domingo' },
];

const diasSemanaNombres = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

function formatHoraTurno(fechaIso?: string): string {
  if (!fechaIso) return '-';
  const d = new Date(fechaIso);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    hour12: true,
  });
}

const columns: TableColumn<TurnoDTO>[] = [
  {
    key: 'inicio',
    label: 'Hora Inicio',
    width: '130px',
    format: (v) => formatHoraTurno(v as string),
  },
  {
    key: 'fin',
    label: 'Hora Fin',
    width: '130px',
    format: (v) => formatHoraTurno(v as string),
  },
  {
    key: 'paciente',
    label: 'Paciente',
    format: (_v, row) =>
      row.paciente
        ? `${row.paciente.apellido}, ${row.paciente.nombre} (${row.paciente.tipoDocumento} ${row.paciente.numeroDocumento})`
        : 'Sin datos',
  },
  { key: 'estado', label: 'Estado', width: '120px' },
  { key: 'actions', label: 'Acciones', width: '120px' },
];

const profesionalesOptions = computed(() =>
  (admisionStore.medicos as MedicoDTO[]).map((p) => ({
    value: p.id,
    label: `Dr. ${p.apellido}, ${p.nombre} (${p.especialidad})`,
  })),
);

const pacientesOptions = computed(() =>
  (admisionStore.pacientes as PacienteDTO[]).map((p) => ({
    value: p.id,
    label: `${p.apellido}, ${p.nombre} (${p.tipoDocumento} ${p.numeroDocumento})`,
  })),
);

const franjasActuales = computed<FranjaAgendaDTO[]>(() => {
  return admisionStore.agendaActual?.franjas ?? [];
});

async function cargarAgenda() {
  if (!profesionalId.value) return;
  try {
    await admisionStore.cargarAgendaMedico(profesionalId.value);
  } catch {
    // Si no tiene agenda configurada aún, la store maneja el estado
  }
}

async function cargarTurnos(fecha?: string) {
  if (!profesionalId.value) return;
  const fechaBusqueda = fecha ?? fechaSeleccionada.value;
  await admisionStore.cargarTurnos({
    medicoId: profesionalId.value,
    fechaDesde: fechaBusqueda,
    fechaHasta: fechaBusqueda,
  });
}

watch([profesionalId, fechaSeleccionada], () => {
  cargarAgenda();
  cargarTurnos();
});

onMounted(async () => {
  if (admisionStore.medicos.length === 0) {
    await admisionStore.cargarMedicos();
  }
  if (admisionStore.pacientes.length === 0) {
    await admisionStore.cargarPacientes({});
  }
});

function abrirModalTurno(turno?: TurnoDTO) {
  editingTurno.value = turno ?? null;
  if (turno) {
    formPacienteId.value = turno.pacienteId;
    formFecha.value = turno.inicio ? turno.inicio.slice(0, 10) : fechaSeleccionada.value;
    formInicio.value = turno.inicio ? new Date(turno.inicio).toISOString().slice(11, 16) : '';
    formFin.value = turno.fin ? new Date(turno.fin).toISOString().slice(11, 16) : '';
    formMotivo.value = turno.motivoConsulta || '';
  } else {
    formPacienteId.value = admisionStore.pacientes[0]?.id ?? '';
    formFecha.value = fechaSeleccionada.value;
    formInicio.value = '09:00';
    formFin.value = '09:30';
    formMotivo.value = '';
  }
  showTurnoModal.value = true;
}

async function handleTurnoSave() {
  if (!profesionalId.value || !formPacienteId.value || !formFecha.value || !formInicio.value) {
    toastStore.error('Campos incompletos', 'Complete profesional, paciente, fecha y horario');
    return;
  }

  // La fecha viene de formFecha (local) y la hora se trata como UTC
  // para coincidir con los horarios de agenda almacenados en UTC en el backend
  const inicioISO = `${formFecha.value}T${formInicio.value}:00.000Z`;
  const finISO = formFin.value ? `${formFecha.value}T${formFin.value}:00.000Z` : undefined;

  const data: ReservarTurnoRequest = {
    pacienteId: formPacienteId.value,
    medicoId: profesionalId.value,
    inicio: inicioISO,
    ...(finISO ? { fin: finISO } : {}),
    motivoConsulta: formMotivo.value || undefined,
  };

  try {
    if (editingTurno.value) {
      await admisionStore.cancelarTurno(editingTurno.value.id);
    }
    await admisionStore.reservarTurno(data);
    toastStore.success('Turno guardado', 'El turno se agendó correctamente');
    showTurnoModal.value = false;
    editingTurno.value = null;
    // Sincronizar el filtro de fecha principal con la fecha del turno guardado
    // para que la lista se refresque mostrando el turno nuevo
    fechaSeleccionada.value = formFecha.value;
    await cargarTurnos(formFecha.value);
  } catch (err) {
    toastStore.apiError(err, 'No se pudo agendar el turno');
  }
}

async function confirmarCancelar(turno: TurnoDTO) {
  const pacNombre = turno.paciente
    ? `${turno.paciente.apellido}, ${turno.paciente.nombre}`
    : 'este turno';
  if (confirm(`¿Cancelar el turno de ${pacNombre}?`)) {
    try {
      await admisionStore.cancelarTurno(turno.id);
      toastStore.success('Turno cancelado', 'El turno fue cancelado correctamente');
      cargarTurnos();
    } catch (err) {
      toastStore.apiError(err, 'Error al cancelar el turno');
    }
  }
}

function abrirModalAgenda() {
  const existentes = admisionStore.agendaActual?.franjas ?? [];
  if (existentes.length > 0) {
    franjasForm.value = existentes.map((f) => ({
      diaSemana: f.diaSemana,
      horaInicio: f.horaInicio,
      horaFin: f.horaFin,
      duracionTurnoMin: f.duracionTurnoMin,
    }));
  } else {
    franjasForm.value = [
      { diaSemana: 1, horaInicio: '08:00', horaFin: '12:00', duracionTurnoMin: 30 },
      { diaSemana: 3, horaInicio: '08:00', horaFin: '12:00', duracionTurnoMin: 30 },
    ];
  }
  showAgendaModal.value = true;
}

function agregarFranja() {
  franjasForm.value.push({
    diaSemana: 1,
    horaInicio: '09:00',
    horaFin: '13:00',
    duracionTurnoMin: 30,
  });
}

function quitarFranja(index: number) {
  franjasForm.value.splice(index, 1);
}

async function handleGuardarAgenda() {
  if (!profesionalId.value) return;
  try {
    await admisionStore.definirAgenda(profesionalId.value, franjasForm.value);
    toastStore.success(
      'Agenda configurada',
      'Los horarios semanales han sido actualizados exitosamente',
    );
    showAgendaModal.value = false;
    await cargarAgenda();
  } catch (err) {
    toastStore.apiError(err, 'Error al configurar la agenda');
  }
}

function getEstadoVariant(
  estado: EstadoTurno,
): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<EstadoTurno, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    RESERVADO: 'info',
    CONFIRMADO: 'primary',
    EN_SALA_ESPERA: 'warning',
    ATENDIDO: 'success',
    CANCELADO: 'danger',
  };
  return variants[estado] ?? 'info';
}

function formatDateForDisplay(dateStr: string | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
</script>

<template>
  <div class="agenda-view">
    <div class="view-header">
      <div>
        <h2>Agenda Médica</h2>
        <p class="view-subtitle">Gestión de horarios de atención y turnos por profesional</p>
      </div>
    </div>

    <Card class="controls-card">
      <div class="controls-grid">
        <div class="control-field">
          <label>Profesional</label>
          <Select
            v-model="profesionalId"
            :options="profesionalesOptions"
            placeholder="Seleccionar profesional"
            required
          />
        </div>
        <div class="control-field">
          <label>Fecha</label>
          <Input v-model="fechaSeleccionada" type="date" required />
        </div>
        <div class="control-field">
          <label>&nbsp;</label>
          <Button
            variant="secondary"
            @click="fechaSeleccionada = localDateString()"
            class="today-btn"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Hoy
          </Button>
        </div>
      </div>
    </Card>

    <div v-if="profesionalId" class="agenda-grid">
      <!-- Lista de turnos del día -->
      <Card class="turnos-list-card">
        <template #header>
          <div class="card-header-flex">
            <h3>Turnos del Día ({{ formatDateForDisplay(fechaSeleccionada) }})</h3>
            <Button
              variant="primary"
              size="sm"
              @click="() => abrirModalTurno()"
              :disabled="!profesionalId"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Nuevo Turno
            </Button>
          </div>
        </template>

        <Table
          v-if="admisionStore.turnos.length > 0"
          :columns="columns"
          :rows="admisionStore.turnos"
          rowKey="id"
          :hoverable="true"
          :striped="true"
          emptyText="No hay turnos para este día"
        >
          <template #cell-estado="{ value }">
            <Badge :variant="getEstadoVariant(value as EstadoTurno)" size="sm">{{ value }}</Badge>
          </template>
          <template #cell-actions="{ row }">
            <div class="action-buttons">
              <Button
                v-if="row.estado === 'RESERVADO'"
                size="sm"
                variant="ghost"
                class="danger"
                @click="() => confirmarCancelar(row as unknown as TurnoDTO)"
                title="Cancelar turno"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </Button>
            </div>
          </template>
        </Table>

        <div v-else class="empty-state">
          <div class="empty-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h3>Sin turnos programados</h3>
          <p>No hay turnos agendados para la fecha seleccionada</p>
        </div>
      </Card>

      <!-- Disponibilidad y configuración de agenda semanal -->
      <Card class="agenda-slots-card">
        <template #header>
          <div class="card-header-flex">
            <h3>Disponibilidad Semanal</h3>
            <Button variant="secondary" size="sm" @click="abrirModalAgenda">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                ></path>
              </svg>
              Definir Agenda
            </Button>
          </div>
        </template>

        <div v-if="franjasActuales.length > 0" class="franjas-list">
          <div
            v-for="franja in franjasActuales"
            :key="franja.id || `${franja.diaSemana}-${franja.horaInicio}`"
            class="franja-item"
          >
            <div class="franja-day">
              <strong>{{ diasSemanaNombres[franja.diaSemana] }}</strong>
            </div>
            <div class="franja-hours">
              <span>{{ franja.horaInicio }} hs a {{ franja.horaFin }} hs</span>
              <span class="franja-duration">({{ franja.duracionTurnoMin }} min / turno)</span>
            </div>
          </div>
        </div>

        <div v-else class="empty-agenda">
          <p>Este profesional aún no tiene agenda semanal configurada.</p>
          <Button variant="primary" size="sm" @click="abrirModalAgenda">Configurar Horarios</Button>
        </div>
      </Card>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      </div>
      <h3>Seleccione un profesional</h3>
      <p>Elija un médico en la lista superior para ver su agenda y turnos</p>
    </div>

    <!-- Modal Reservar Turno -->
    <Modal
      v-model="showTurnoModal"
      :title="editingTurno ? 'Editar Turno' : 'Nuevo Turno'"
      size="md"
      @close="showTurnoModal = false"
    >
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
            <Input v-model="formFecha" label="Fecha del Turno" type="date" required />
          </div>
          <div class="form-row-2">
            <Input v-model="formInicio" label="Hora Inicio (HH:mm)" type="time" required />
            <Input v-model="formFin" label="Hora Fin (opcional)" type="time" />
          </div>
          <div class="form-row">
            <Input
              v-model="formMotivo"
              label="Motivo de Consulta"
              placeholder="Ej: Control de rutina, dolor agudo..."
            />
          </div>
        </div>
        <div class="form-actions">
          <Button variant="ghost" @click="showTurnoModal = false">Cancelar</Button>
          <Button variant="primary" @click="handleTurnoSave">Guardar Turno</Button>
        </div>
      </div>
    </Modal>

    <!-- Modal Definir Agenda Semanal (ADM-03) -->
    <Modal
      v-model="showAgendaModal"
      title="Definir Agenda Semanal del Médico"
      size="lg"
      @close="showAgendaModal = false"
    >
      <div class="agenda-modal-content">
        <p class="modal-desc">
          Configure las franjas horarias semanales de atención. Franjas del mismo día no deben
          solaparse.
        </p>

        <div class="franjas-form-list">
          <div v-for="(franja, idx) in franjasForm" :key="idx" class="franja-form-row">
            <div class="franja-col">
              <label>Día</label>
              <Select
                :modelValue="String(franja.diaSemana)"
                @update:modelValue="(val) => (franja.diaSemana = Number(val))"
                :options="diasSemana"
                required
              />
            </div>
            <div class="franja-col">
              <label>Inicio</label>
              <Input v-model="franja.horaInicio" type="time" required />
            </div>
            <div class="franja-col">
              <label>Fin</label>
              <Input v-model="franja.horaFin" type="time" required />
            </div>
            <div class="franja-col">
              <label>Duración (min)</label>
              <Input
                :modelValue="String(franja.duracionTurnoMin)"
                @update:modelValue="(val) => (franja.duracionTurnoMin = Number(val))"
                type="number"
                min="5"
                max="240"
                required
              />
            </div>
            <div class="franja-col franja-del">
              <label>&nbsp;</label>
              <Button
                variant="ghost"
                class="danger"
                size="sm"
                @click="quitarFranja(idx)"
                title="Eliminar franja"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  ></path>
                </svg>
              </Button>
            </div>
          </div>
        </div>

        <div class="add-franja-row">
          <Button variant="secondary" size="sm" @click="agregarFranja">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Agregar Franja Horaria
          </Button>
        </div>

        <div class="form-actions">
          <Button variant="ghost" @click="showAgendaModal = false">Cancelar</Button>
          <Button variant="primary" @click="handleGuardarAgenda">Guardar Agenda</Button>
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

.controls-card {
  margin-bottom: var(--space-md);
}

.controls-grid {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: var(--space-md);
  align-items: end;
}

@media (max-width: 768px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
}

.control-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.control-field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.today-btn {
  height: 40px;
}

.agenda-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-md);
}

@media (max-width: 1024px) {
  .agenda-grid {
    grid-template-columns: 1fr;
  }
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-header-flex h3 {
  margin: 0;
  font-size: 1.1rem;
}

.action-buttons {
  display: flex;
  gap: var(--space-xs);
}

.action-buttons .danger:hover {
  color: var(--color-danger);
  background-color: var(--color-danger-light);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-icon {
  margin-bottom: var(--space-sm);
  opacity: 0.6;
}

.franjas-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.franja-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-background);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-primary);
}

.franja-hours {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.9rem;
}

.franja-duration {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.empty-agenda {
  padding: var(--space-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  color: var(--color-text-secondary);
}

.turno-form,
.agenda-modal-content {
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

.modal-desc {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.franjas-form-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: 350px;
  overflow-y: auto;
}

.franja-form-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 1.5fr auto;
  gap: var(--space-sm);
  align-items: end;
  padding: var(--space-sm);
  background-color: var(--color-background);
  border-radius: var(--radius-sm);
}

.franja-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.franja-col label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.franja-del {
  display: flex;
  align-items: center;
}

.add-franja-row {
  display: flex;
  justify-content: flex-start;
}
</style>
