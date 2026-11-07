<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useHceStore } from '@/stores/hce';
import { useAdmisionStore } from '@/stores/admision';
import { useToastStore } from '@/stores/toast';
import { Card, Button, Input, Select, Table, Badge, type TableColumn } from '@/components/ui';
import type { PrescripcionDTO, EstadoPrescripcion, CrearPrescripcionRequest } from '@/types/api';

const route = useRoute();
const hceStore = useHceStore();
const admisionStore = useAdmisionStore();
const toastStore = useToastStore();

const pacienteId = ref('');
const showForm = ref(false);

const form = ref<{
  medicamento: string;
  dosis: string;
  frecuenciaHoras: string;
  duracionDias: string;
}>({
  medicamento: '',
  dosis: '',
  frecuenciaHoras: '8',
  duracionDias: '7',
});

const columns: TableColumn<PrescripcionDTO>[] = [
  { key: 'medicamento', label: 'Medicamento' },
  { key: 'dosis', label: 'Dosis', width: '100px' },
  { key: 'frecuenciaHoras', label: 'Frecuencia (hrs)', width: '120px' },
  { key: 'duracionDias', label: 'Duración (días)', width: '120px' },
  { key: 'estado', label: 'Estado', width: '120px' },
  {
    key: 'createdAt',
    label: 'Creada',
    width: '140px',
    format: (v) => (v ? new Date(v as string).toLocaleDateString('es-AR') : '-'),
  },
];

async function cargarDatos() {
  if (!pacienteId.value) return;
  await hceStore.cargarHistoria(pacienteId.value);
}

async function guardarPrescripcion() {
  if (!form.value.medicamento.trim() || !form.value.dosis.trim()) {
    toastStore.error('Campos requeridos', 'Complete medicamento y dosis');
    return;
  }
  try {
    if (!pacienteId.value) {
      toastStore.error('Error', 'Seleccione un paciente primero');
      return;
    }
    if (!hceStore.historiaActual || hceStore.historiaActual.pacienteId !== pacienteId.value) {
      await hceStore.cargarHistoria(pacienteId.value);
    }
    const historia = hceStore.historiaActual;
    if (!historia) {
      toastStore.error('Error', 'No se pudo obtener la historia clínica del paciente');
      return;
    }
    const request: CrearPrescripcionRequest = {
      medicamento: form.value.medicamento.trim(),
      dosis: form.value.dosis.trim(),
      frecuenciaHoras: parseInt(form.value.frecuenciaHoras, 10) || 8,
      duracionDias: parseInt(form.value.duracionDias, 10) || 7,
    };
    await hceStore.crearPrescripcion(request);
    toastStore.success('Prescripción creada', 'Registrada correctamente');
    resetForm();
    cargarDatos();
  } catch (err) {
    toastStore.apiError(err, 'Error al crear prescripción');
  }
}

function resetForm() {
  form.value = {
    medicamento: '',
    dosis: '',
    frecuenciaHoras: '8',
    duracionDias: '7',
  };
  showForm.value = false;
}

function abrirFormulario() {
  form.value = {
    medicamento: '',
    dosis: '',
    frecuenciaHoras: '8',
    duracionDias: '7',
  };
  showForm.value = true;
}

watch(pacienteId, (nuevoId) => {
  if (nuevoId) {
    cargarDatos();
  }
});

watch(
  () => admisionStore.pacienteSeleccionado,
  (paciente) => {
    if (paciente) {
      pacienteId.value = paciente.id;
    }
  },
);

onMounted(async () => {
  if (admisionStore.pacientes.length === 0) {
    await admisionStore.cargarPacientes();
  }
  const idRuta = (route.params.pacienteId || route.query.pacienteId) as string | undefined;
  if (idRuta) {
    pacienteId.value = idRuta;
  } else if (admisionStore.pacienteSeleccionado) {
    pacienteId.value = admisionStore.pacienteSeleccionado.id;
  } else if (admisionStore.pacientes.length > 0 && admisionStore.pacientes[0]) {
    pacienteId.value = admisionStore.pacientes[0].id;
  }
  if (pacienteId.value) {
    cargarDatos();
  }
});

function getEstadoVariant(
  estado: EstadoPrescripcion,
): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<
    EstadoPrescripcion,
    'primary' | 'success' | 'warning' | 'danger' | 'info'
  > = {
    ACTIVA: 'success',
    SUSPENDIDA: 'warning',
    FINALIZADA: 'info',
  };
  return variants[estado] ?? 'info';
}
</script>

<template>
  <div class="prescripcion-form-view">
    <div class="view-header">
      <div>
        <h2>Prescripciones Médicas</h2>
        <p class="view-subtitle">Gestión de prescripciones farmacológicas del paciente</p>
      </div>
      <Button variant="primary" @click="abrirFormulario" :disabled="!pacienteId" v-show="!showForm">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Nueva Prescripción
      </Button>
    </div>

    <Card class="context-card">
      <div class="context-field">
        <label>Paciente</label>
        <Select
          v-model="pacienteId"
          :options="
            admisionStore.pacientes.map((p) => ({
              value: p.id,
              label: `${p.apellido}, ${p.nombre} (${p.tipoDocumento} ${p.numeroDocumento})`,
            }))
          "
          placeholder="Seleccionar paciente"
        />
      </div>
    </Card>

    <div v-if="pacienteId">
      <!-- Formulario de prescripción -->
      <Card v-show="showForm" class="form-card">
        <template #header>
          <h3>Nueva Prescripción</h3>
        </template>

        <form @submit.prevent="guardarPrescripcion" class="prescripcion-form">
          <div class="form-row">
            <Input
              v-model="form.medicamento"
              label="Medicamento"
              placeholder="Ej. Amoxicilina 500mg"
              required
            />
            <Input
              v-model="form.dosis"
              label="Dosis"
              placeholder="Ej. 1 comprimido / 500 mg"
              required
            />
          </div>

          <div class="form-row">
            <Input
              v-model="form.frecuenciaHoras"
              label="Frecuencia (horas)"
              type="number"
              placeholder="8"
              required
            />
            <Input
              v-model="form.duracionDias"
              label="Duración (días)"
              type="number"
              placeholder="7"
              required
            />
          </div>

          <div class="form-actions">
            <Button variant="secondary" type="button" @click="resetForm">Cancelar</Button>
            <Button variant="primary" type="submit" :loading="hceStore.cargando">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Crear Prescripción
            </Button>
          </div>
        </form>
      </Card>

      <!-- Lista de prescripciones -->
      <Card>
        <template #header>
          <h3>Prescripciones Registradas</h3>
        </template>

        <Table
          :columns="columns"
          :rows="hceStore.prescripciones"
          rowKey="id"
          :hoverable="true"
          :striped="true"
          emptyText="No hay prescripciones registradas para este paciente."
        >
          <template #cell-estado="{ value }">
            <Badge :variant="getEstadoVariant(value as EstadoPrescripcion)" size="sm">{{
              value
            }}</Badge>
          </template>
          <template #cell-frecuenciaHoras="{ value }"> {{ value }} hrs </template>
          <template #cell-duracionDias="{ value }"> {{ value }} días </template>
        </Table>
      </Card>
    </div>

    <div v-else class="empty-state">
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        class="empty-icon"
      >
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
        <line x1="7" y1="19" x2="7" y2="12"></line>
        <line x1="17" y1="19" x2="17" y2="12"></line>
        <line x1="7" y1="12" x2="17" y2="12"></line>
      </svg>
      <h3>Seleccione un Paciente</h3>
      <p class="text-muted">Elija un paciente para gestionar sus prescripciones.</p>
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

.context-card {
  margin-bottom: var(--space-md);
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

.form-card {
  margin-bottom: var(--space-md);
}

.prescripcion-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
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
</style>
