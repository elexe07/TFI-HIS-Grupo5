<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAdmisionStore } from '@/stores/admision';
import { useToastStore } from '@/stores/toast';
import { Button, Input, Card, Table, Select, Modal, Badge } from '@/components/ui';
import type { TableColumn } from '@/components/ui/Table.types';
import type { NivelTriaje, RegistrarTriajeRequest, PacienteDTO } from '@/types/api';

const admisionStore = useAdmisionStore();
const toastStore = useToastStore();

const searchDocumento = ref('');
const showModal = ref(false);

const columnsCola: TableColumn[] = [
  { key: 'posicion', label: 'Pos.', width: '60px' },
  {
    key: 'llegadaEn',
    label: 'Llegada',
    width: '150px',
    format: (v): string =>
      v
        ? new Date(v as string).toLocaleString('es-AR', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
          })
        : '-',
  },
  {
    key: 'pacienteNombre',
    label: 'Paciente',
    format: (_v, row) => `${row.pacienteApellido}, ${row.pacienteNombre}`,
  },
  { key: 'documento', label: 'Documento', width: '140px', format: (v) => (v as string) || '-' },
  { key: 'nivel', label: 'Nivel Urgencia', width: '150px' },
  { key: 'motivo', label: 'Motivo', width: '250px' },
  { key: 'estado', label: 'Estado', width: '120px' },
  { key: 'actions', label: 'Acciones', width: '140px' },
];

const nivelesUrgenciaOptions = [
  { value: 'ROJO', label: '🔴 Rojo - Emergencia (Inmediata)' },
  { value: 'NARANJA', label: '🟠 Naranja - Urgente (10 min)' },
  { value: 'AMARILLO', label: '🟡 Amarillo - Semi-urgente (30 min)' },
  { value: 'VERDE', label: '🟢 Verde - No urgente (120 min)' },
  { value: 'AZUL', label: '🔵 Azul - Leve (240 min)' },
];

const formTriaje = ref<RegistrarTriajeRequest>({
  pacienteId: '',
  nivel: 'VERDE',
  motivo: '',
});

const colaFiltrada = computed(() => {
  return admisionStore.colaGuardia.filter((item) => {
    if (!searchDocumento.value.trim()) return true;
    const term = searchDocumento.value.trim().toLowerCase();
    const paciente = `${item.pacienteApellido} ${item.pacienteNombre}`.toLowerCase();
    const doc = (item.documento || '').toLowerCase();
    return paciente.includes(term) || doc.includes(term);
  });
});

async function cargarColaGuardia() {
  await admisionStore.cargarColaGuardia();
}

const atendiendoId = ref<string | null>(null);

async function handleAtender(row: any) {
  if (!confirm(`¿Confirmar atención de ${row.pacienteApellido}, ${row.pacienteNombre}?`)) return;
  atendiendoId.value = row.id;
  try {
    await admisionStore.atenderTriaje(row.id);
    toastStore.success(
      'Paciente atendido',
      'El paciente fue marcado como atendido y retirado de la cola',
    );
  } catch (err) {
    toastStore.error('Error', 'No se pudo registrar la atención');
  } finally {
    atendiendoId.value = null;
  }
}

async function handleTriajeSave() {
  if (!formTriaje.value.pacienteId || !formTriaje.value.motivo.trim()) {
    toastStore.error('Campos requeridos', 'Complete paciente y motivo');
    return;
  }
  try {
    await admisionStore.registrarTriaje(formTriaje.value);
    toastStore.success('Triaje registrado', 'El paciente ha sido agregado a la cola de guardia');
    showModal.value = false;
    formTriaje.value = { pacienteId: '', nivel: 'VERDE', motivo: '' };
    await cargarColaGuardia();
  } catch (err) {
    // Error manejado en store
  }
}

function abrirModalNuevo() {
  formTriaje.value = { pacienteId: '', nivel: 'VERDE', motivo: '' };
  showModal.value = true;
}

function getUrgenciaVariant(
  nivel: NivelTriaje,
): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<NivelTriaje, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    ROJO: 'danger',
    NARANJA: 'warning',
    AMARILLO: 'warning',
    VERDE: 'success',
    AZUL: 'info',
  };
  return variants[nivel] ?? 'info';
}

function limpiarFiltros() {
  searchDocumento.value = '';
}

onMounted(() => {
  if (admisionStore.pacientes.length === 0) {
    admisionStore.cargarPacientes({});
  }
  cargarColaGuardia();
});
</script>

<template>
  <div class="triaje-view">
    <div class="view-header">
      <div>
        <h2>Triaje y Guardia</h2>
        <p class="view-subtitle">
          Registro de pacientes y visualización de cola de guardia por nivel de urgencia
        </p>
      </div>
      <Button
        variant="primary"
        @click="abrirModalNuevo"
        :disabled="admisionStore.pacientes.length === 0"
      >
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
        Nuevo Triaje
      </Button>
    </div>

    <Card class="search-card">
      <div class="search-form">
        <Input
          v-model="searchDocumento"
          label="Buscar Paciente"
          placeholder="Nombre, apellido o documento..."
          size="sm"
        />
        <Button variant="ghost" @click="limpiarFiltros"> Limpiar </Button>
      </div>
    </Card>

    <!-- Resumen por nivel de urgencia -->
    <div class="urgencia-summary">
      <div
        v-for="nivel in ['ROJO', 'NARANJA', 'AMARILLO', 'VERDE', 'AZUL']"
        :key="nivel"
        class="urgencia-stat"
        :class="`urgencia-${nivel.toLowerCase()}`"
      >
        <div class="urgencia-label">{{ nivel }}</div>
        <div class="urgencia-count">
          {{ admisionStore.colaGuardia.filter((t) => t.nivel === nivel).length }}
        </div>
      </div>
    </div>

    <Card>
      <Table
        :columns="columnsCola"
        :rows="colaFiltrada"
        rowKey="id"
        :hoverable="true"
        :striped="true"
        emptyText="No hay pacientes en la cola de guardia."
      >
        <template #cell-nivel="{ value }">
          <Badge
            :variant="getUrgenciaVariant(value as NivelTriaje)"
            size="md"
            class="urgencia-badge"
            >{{ value }}</Badge
          >
        </template>
        <template #cell-motivo="{ value }">
          <span class="motivo-text">{{ value }}</span>
        </template>
        <template #cell-actions="{ row }">
          <Button
            size="sm"
            variant="primary"
            :loading="atendiendoId === row.id"
            @click.stop="handleAtender(row)"
            title="Llamar y atender paciente"
          >
            Atender
          </Button>
        </template>
      </Table>
    </Card>

    <!-- Modal Nuevo Triaje -->
    <Modal v-model="showModal" title="Nuevo Triaje" size="md" @close="showModal = false">
      <div class="triaje-form">
        <div class="form-grid">
          <div class="form-row">
            <Select
              v-model="formTriaje.pacienteId"
              label="Paciente"
              :options="
                (admisionStore.pacientes as PacienteDTO[]).map((p) => ({
                  value: p.id,
                  label: `${p.apellido}, ${p.nombre} (${p.tipoDocumento} ${p.numeroDocumento})`,
                }))
              "
              placeholder="Seleccionar paciente"
              required
            />
            <Select
              v-model="formTriaje.nivel"
              label="Nivel de Urgencia"
              :options="nivelesUrgenciaOptions"
              required
            />
          </div>
          <div class="form-row">
            <Input
              v-model="formTriaje.motivo"
              label="Motivo de Consulta"
              placeholder="Motivo principal de la consulta"
              required
            />
          </div>
        </div>
        <div class="form-actions">
          <Button variant="ghost" @click="showModal = false">Cancelar</Button>
          <Button variant="primary" @click="handleTriajeSave">Registrar Triaje</Button>
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

.urgencia-summary {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

@media (max-width: 1024px) {
  .urgencia-summary {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .urgencia-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}

.urgencia-stat {
  padding: var(--space-md);
  border-radius: var(--radius-md);
  text-align: center;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
}

.urgencia-stat.urgencia-rojo {
  border-left: 4px solid var(--color-danger);
  background-color: var(--color-danger-light);
}

.urgencia-stat.urgencia-naranja {
  border-left: 4px solid var(--color-warning);
  background-color: var(--color-warning-light);
}

.urgencia-stat.urgencia-amarillo {
  border-left: 4px solid var(--color-warning);
  background-color: var(--color-warning-light);
}

.urgencia-stat.urgencia-verde {
  border-left: 4px solid var(--color-success);
  background-color: var(--color-success-light);
}

.urgencia-stat.urgencia-azul {
  border-left: 4px solid var(--color-info);
  background-color: var(--color-info-light);
}

.urgencia-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
}

.urgencia-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.urgencia-badge {
  font-weight: 600;
}

.motivo-text {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}

.triaje-form {
  padding: var(--space-sm) 0;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
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

.text-muted {
  color: var(--color-text-muted);
}
</style>
