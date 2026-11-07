<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFacturacionStore } from '@/stores/facturacion';
import { Button, Input, Card, Table, Modal, Badge } from '@/components/ui';
import type { TableColumn } from '@/components/ui/Table.types';
import type { ObraSocialDTO, ConceptoCargo } from '@/types/api';

const facturacionStore = useFacturacionStore();

const searchTerm = ref('');
const showModal = ref(false);
const editingObraSocial = ref<ObraSocialDTO | null>(null);

const columnsObrasSociales: TableColumn[] = [
  { key: 'codigo', label: 'Código', width: '100px' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'porcentajeCobertura', label: '% Cobertura', width: '120px', format: (v) => `${v}%` },
  { key: 'actions', label: 'Acciones', width: '120px' },
];

const columnsTarifas: TableColumn[] = [
  { key: 'concepto', label: 'Concepto', width: '150px' },
  {
    key: 'monto',
    label: 'Monto',
    width: '150px',
    format: (v) => facturacionStore.formatearMonto(v as number),
  },
];

const obrasSocialesFiltradas = computed(() => {
  return facturacionStore.obrasSociales.filter((os) => {
    if (
      searchTerm.value &&
      !os.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) &&
      !os.codigo.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
      return false;
    return true;
  });
});

async function cargarObrasSociales() {
  await facturacionStore.cargarObrasSociales();
}

async function cargarTarifas() {
  await facturacionStore.cargarTarifas();
}

function getConceptoLabel(concepto: ConceptoCargo): string {
  const labels: Record<ConceptoCargo, string> = {
    CONSULTA: 'Consulta Médica',
    MEDICACION: 'Medicación',
    DIA_CAMA: 'Día Cama',
  };
  return labels[concepto] ?? concepto;
}

function limpiarFiltros() {
  searchTerm.value = '';
}

onMounted(() => {
  cargarObrasSociales();
  cargarTarifas();
});
</script>

<template>
  <div class="cobertura-view">
    <div class="view-header">
      <div>
        <h2>Obras Sociales y Tarifas</h2>
        <p class="view-subtitle">Consulta de obras sociales registradas y tarifas de facturación</p>
      </div>
    </div>

    <Card class="search-card">
      <div class="search-form">
        <Input v-model="searchTerm" label="Buscar" placeholder="Nombre o código..." size="sm" />
        <Button variant="ghost" @click="limpiarFiltros"> Limpiar </Button>
      </div>
    </Card>

    <!-- Obras Sociales -->
    <Card class="mb-md">
      <template #header>
        <h3>Obras Sociales</h3>
      </template>
      <Table
        :columns="columnsObrasSociales"
        :rows="obrasSocialesFiltradas"
        rowKey="id"
        :hoverable="true"
        :striped="true"
        emptyText="No se encontraron obras sociales."
      >
        <template #cell-porcentajeCobertura="{ value }">
          <Badge variant="primary" size="sm">{{ value }}%</Badge>
        </template>
      </Table>
    </Card>

    <!-- Tarifas -->
    <Card>
      <template #header>
        <h3>Tarifas de Facturación</h3>
      </template>
      <Table
        :columns="columnsTarifas"
        :rows="facturacionStore.tarifas"
        rowKey="id"
        :hoverable="true"
        :striped="true"
        emptyText="No hay tarifas configuradas."
      >
        <template #cell-concepto="{ value }">
          <Badge variant="info" size="sm">{{ getConceptoLabel(value as ConceptoCargo) }}</Badge>
        </template>
      </Table>
    </Card>

    <!-- Modal Ver Obra Social (Solo lectura - informativo) -->
    <Modal
      v-model="showModal"
      :title="editingObraSocial ? 'Ver Obra Social' : ''"
      size="md"
      @close="showModal = false"
    >
      <div class="obra-social-form">
        <div class="form-grid">
          <div class="form-row">
            <Input
              v-model="editingObraSocial!.codigo"
              label="Código"
              placeholder="Código único"
              required
              disabled
            />
            <Input
              v-model="editingObraSocial!.nombre"
              label="Nombre"
              placeholder="Nombre de la obra social"
              required
              disabled
            />
          </div>
          <div class="form-row">
            <Input
              :value="editingObraSocial?.porcentajeCobertura ?? 0"
              label="% Cobertura"
              type="number"
              min="0"
              max="100"
              required
              disabled
            />
          </div>
        </div>
        <div class="form-actions">
          <Button variant="primary" @click="showModal = false">Cerrar</Button>
        </div>
        <div class="info-note">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span
            >La gestión de obras sociales se realiza desde el backend. Esta vista es solo de
            consulta.</span
          >
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

.mb-md {
  margin-bottom: var(--space-md);
}

.obra-social-form {
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

.info-note {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-md);
  background-color: var(--color-info-light);
  border: 1px solid var(--color-info);
  border-radius: var(--radius-md);
  color: var(--color-info);
  font-size: 0.8125rem;
  margin-top: var(--space-md);
}

.text-muted {
  color: var(--color-text-muted);
}
</style>
