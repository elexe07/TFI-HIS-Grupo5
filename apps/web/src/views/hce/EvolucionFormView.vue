<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useHceStore } from '@/stores/hce';
import { useAdmisionStore } from '@/stores/admision';
import { useToastStore } from '@/stores/toast';
import { useRoute } from 'vue-router';
import { Card, Button, Input, Select, Table, type TableColumn } from '@/components/ui';

const hceStore = useHceStore();
const admisionStore = useAdmisionStore();
const toastStore = useToastStore();
const route = useRoute();

const pacienteId = ref('');
const showForm = ref(false);

const form = ref({
  motivo: '',
  diagnostico: '',
  tratamiento: '',
});

const columns: TableColumn[] = [
  {
    key: 'registradoEn',
    label: 'Fecha',
    width: '160px',
    format: (v) => (v ? new Date(v as string).toLocaleString('es-AR') : '-'),
  },
  { key: 'motivo', label: 'Motivo', width: '140px' },
  { key: 'diagnostico', label: 'Diagnóstico', width: '180px' },
  { key: 'actions', label: 'Acciones', width: '100px' },
];

async function cargarDatos() {
  if (!pacienteId.value) return;
  await hceStore.cargarHistoria(pacienteId.value);
}

async function guardarEvolucion() {
  if (!form.value.motivo.trim() || !form.value.diagnostico.trim()) {
    toastStore.error('Campos requeridos', 'Motivo y diagnóstico son obligatorios');
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
    await hceStore.crearEvolucion({
      motivo: form.value.motivo.trim(),
      diagnostico: form.value.diagnostico.trim(),
      tratamiento: form.value.tratamiento.trim() || undefined,
    });
    toastStore.success('Evolución guardada', 'Registrada correctamente');
    resetForm();
    cargarDatos();
  } catch (err) {
    toastStore.apiError(err, 'Error al guardar evolución');
  }
}

function resetForm() {
  form.value = {
    motivo: '',
    diagnostico: '',
    tratamiento: '',
  };
  showForm.value = false;
}

function abrirFormulario() {
  form.value = {
    motivo: '',
    diagnostico: '',
    tratamiento: '',
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
</script>

<template>
  <div class="evolucion-form-view">
    <div class="view-header">
      <div>
        <h2>Evoluciones Clínicas</h2>
        <p class="view-subtitle">Registro y consulta de evoluciones médicas</p>
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
        Nueva Evolución
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
      <!-- Formulario de evolución -->
      <Card v-show="showForm" class="form-card">
        <template #header>
          <h3>Nueva Evolución</h3>
        </template>

        <form @submit.prevent="guardarEvolucion" class="evolucion-form">
          <div class="form-row">
            <Input
              v-model="form.motivo"
              label="Motivo de la Consulta"
              placeholder="Motivo de la consulta..."
              required
            />
            <Input
              v-model="form.diagnostico"
              label="Diagnóstico"
              placeholder="Diagnóstico..."
              required
            />
          </div>

          <div class="form-field">
            <label class="label">Tratamiento / Plan</label>
            <textarea
              v-model="form.tratamiento"
              class="input textarea"
              rows="4"
              placeholder="Tratamiento indicado, plan de seguimiento, indicaciones..."
            ></textarea>
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
              Guardar Evolución
            </Button>
          </div>
        </form>
      </Card>

      <!-- Lista de evoluciones -->
      <Card>
        <template #header>
          <h3>Historial de Evoluciones</h3>
        </template>

        <Table
          :columns="columns"
          :rows="hceStore.evoluciones"
          rowKey="id"
          :hoverable="true"
          :striped="true"
          emptyText="No hay evoluciones registradas para este paciente."
        >
          <template #cell-motivo="{ value }">
            <div class="texto-preview" v-if="value">{{ value }}</div>
            <span v-else class="text-muted">-</span>
          </template>

          <template #cell-diagnostico="{ value }">
            <div class="texto-preview" v-if="value">{{ value }}</div>
            <span v-else class="text-muted">-</span>
          </template>
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
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
      </svg>
      <h3>Seleccione un Paciente</h3>
      <p class="text-muted">Elija un paciente para registrar o consultar evoluciones.</p>
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

.evolucion-form {
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

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text);
}

.input.textarea {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
}

.input.textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.texto-preview {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  line-height: 1.5;
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
