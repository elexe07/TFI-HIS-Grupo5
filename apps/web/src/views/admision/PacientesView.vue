<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAdmisionStore } from '@/stores/admision';
import { useToastStore } from '@/stores/toast';
import { Button, Input, Card, Table, Badge } from '@/components/ui';
import type { TableColumn } from '@/components/ui/Table.types';
import type { PacienteDTO } from '@/types/api';

const admisionStore = useAdmisionStore();
const toastStore = useToastStore();
const router = useRouter();

const searchDocumento = ref('');
const searchApellido = ref('');

const columns: TableColumn<PacienteDTO>[] = [
  { key: 'tipoDocumento', label: 'Tipo Doc.', width: '100px' },
  { key: 'numeroDocumento', label: 'Documento', sortable: true },
  { key: 'apellido', label: 'Apellido', sortable: true },
  { key: 'nombre', label: 'Nombre', sortable: true },
  {
    key: 'fechaNacimiento',
    label: 'F. Nac.',
    width: '120px',
    format: (v) => (v ? new Date(v as string).toLocaleDateString('es-AR') : '-'),
  },
  { key: 'sexo', label: 'Sexo', width: '80px' },
  {
    key: 'obraSocialCodigo',
    label: 'Obra Social',
    width: '140px',
    format: (v): string => (v as string) || '-',
  },
  { key: 'actions', label: 'Acciones', width: '140px' },
];

async function buscar() {
  await admisionStore.cargarPacientes({
    documento: searchDocumento.value || undefined,
    apellido: searchApellido.value || undefined,
  });
}

function editarPaciente(paciente: PacienteDTO) {
  router.push({ name: 'admision.paciente.editar', params: { id: paciente.id } });
}

function nuevoPaciente() {
  router.push({ name: 'admision.paciente.nuevo' });
}

async function eliminarPaciente(_id: string) {
  if (!confirm('¿Está seguro de eliminar este paciente?')) return;
  toastStore.info(
    'Función no implementada',
    'Eliminar paciente requiere endpoint DELETE en backend',
  );
}

function getDocVariant(tipo: string): 'primary' | 'success' | 'warning' | 'info' {
  const variants: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    DNI: 'primary',
    PASAPORTE: 'success',
    OTRO: 'warning',
  };
  return variants[tipo] ?? 'primary';
}

function limpiarFiltros() {
  searchDocumento.value = '';
  searchApellido.value = '';
  buscar();
}

onMounted(() => {
  buscar();
});
</script>

<template>
  <div class="pacientes-view">
    <div class="view-header">
      <div>
        <h2>Pacientes</h2>
        <p class="view-subtitle">Registro y búsqueda de pacientes</p>
      </div>
      <Button variant="primary" @click="nuevoPaciente">
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
        Nuevo Paciente
      </Button>
    </div>

    <Card class="search-card">
      <div class="search-form">
        <Input
          v-model="searchDocumento"
          label="Documento"
          placeholder="Número de documento"
          size="sm"
        />
        <Input v-model="searchApellido" label="Apellido" placeholder="Apellido" size="sm" />
        <Button variant="secondary" @click="buscar" class="search-btn">
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
          Buscar
        </Button>
        <Button variant="ghost" @click="limpiarFiltros"> Limpiar </Button>
      </div>
    </Card>

    <Card>
      <Table
        :columns="columns"
        :rows="admisionStore.pacientes"
        rowKey="id"
        :hoverable="true"
        :striped="true"
        rowClickable
        emptyText="No se encontraron pacientes"
      >
        <template #cell-tipoDocumento="{ value }">
          <Badge :variant="getDocVariant(value as string)" size="sm">{{ value }}</Badge>
        </template>
        <template #cell-actions="{ row }">
          <div class="action-buttons">
            <Button
              size="sm"
              variant="ghost"
              @click="editarPaciente(row as unknown as PacienteDTO)"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              class="danger"
              @click="eliminarPaciente((row as unknown as PacienteDTO).id)"
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
        </template>
      </Table>
    </Card>
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

.search-btn {
  height: 40px;
}

.action-buttons {
  display: flex;
  gap: var(--space-xs);
}

.action-buttons .danger:hover {
  color: var(--color-danger);
  background-color: var(--color-danger-light);
}
</style>
