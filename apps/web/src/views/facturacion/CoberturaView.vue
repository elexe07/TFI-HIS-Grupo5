<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFacturacionStore } from '@/stores/facturacion';
import { useAdmisionStore } from '@/stores/admision';
import { useToastStore } from '@/stores/toast';
import { Button, Input, Card, Table, Modal, Badge, Select } from '@/components/ui';
import type { TableColumn } from '@/components/ui/Table.types';
import type { ConceptoCargo, ValidarCoberturaResponse } from '@/types/api';

const facturacionStore = useFacturacionStore();
const admisionStore = useAdmisionStore();
const toastStore = useToastStore();

const searchTerm = ref('');
const showValidarModal = ref(false);

// Form validar cobertura
const validarForm = ref({
  pacienteId: '',
  codigoObraSocial: '',
  numeroAfiliado: '',
  cuentaId: '',
});
const resultadoValidacion = ref<ValidarCoberturaResponse | null>(null);

const columnsObrasSociales: TableColumn[] = [
  { key: 'codigo', label: 'Código', width: '100px' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'porcentajeCobertura', label: '% Cobertura', width: '120px', format: (v) => `${v}%` },
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

async function cargarDatos() {
  await Promise.all([
    facturacionStore.cargarObrasSociales(),
    facturacionStore.cargarTarifas(),
    admisionStore.pacientes.length === 0 ? admisionStore.cargarPacientes() : Promise.resolve(),
    facturacionStore.cuentas.length === 0 ? facturacionStore.cargarCuentas() : Promise.resolve(),
  ]);
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

function abrirModalValidar() {
  resultadoValidacion.value = null;
  validarForm.value = {
    pacienteId: '',
    codigoObraSocial: facturacionStore.obrasSociales[0]?.codigo || '',
    numeroAfiliado: '',
    cuentaId: '',
  };
  showValidarModal.value = true;
}

function onPacienteChange(pacienteId: string | number | null) {
  const pId = pacienteId ? String(pacienteId) : '';
  validarForm.value.pacienteId = pId;
  const p = admisionStore.pacientes.find((pac) => pac.id === pId);
  if (p) {
    if (p.obraSocialCodigo) validarForm.value.codigoObraSocial = p.obraSocialCodigo;
    if (p.numeroAfiliado) validarForm.value.numeroAfiliado = p.numeroAfiliado;
  }
}

async function ejecutarValidacion() {
  if (!validarForm.value.pacienteId || !validarForm.value.codigoObraSocial || !validarForm.value.numeroAfiliado) {
    toastStore.error('Campos obligatorios', 'Complete paciente, obra social y número de afiliado');
    return;
  }
  try {
    const res = await facturacionStore.validarCobertura({
      pacienteId: validarForm.value.pacienteId,
      codigoObraSocial: validarForm.value.codigoObraSocial,
      numeroAfiliado: validarForm.value.numeroAfiliado,
      cuentaId: validarForm.value.cuentaId || undefined,
    });
    resultadoValidacion.value = res;
    if (res.aprobada) {
      toastStore.success('Cobertura Aprobada', `Cobertura del ${res.porcentajeCobertura}% aplicada.`);
      if (res.cuentaActualizada) {
        await facturacionStore.cargarCuentas();
      }
    } else {
      toastStore.warning('Cobertura Rechazada', res.motivoRechazo || 'Rechazado por la entidad');
    }
  } catch (err: any) {
    toastStore.error('Error de validación', err?.message || 'No se pudo validar cobertura');
  }
}

onMounted(() => {
  cargarDatos();
});
</script>

<template>
  <div class="cobertura-view">
    <div class="view-header">
      <div>
        <h2>Obras Sociales y Validación de Cobertura</h2>
        <p class="view-subtitle">Consulta convenios, tarifas y valida coberturas en línea</p>
      </div>
      <Button variant="primary" @click="abrirModalValidar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Validar Cobertura
      </Button>
    </div>

    <Card class="search-card">
      <div class="search-form">
        <Input v-model="searchTerm" label="Buscar Obra Social" placeholder="Nombre o código..." size="sm" />
        <Button variant="ghost" @click="limpiarFiltros"> Limpiar </Button>
      </div>
    </Card>

    <!-- Obras Sociales -->
    <Card class="mb-md">
      <template #header>
        <h3>Obras Sociales Convenidas</h3>
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
        <h3>Nomenclador de Tarifas Institucionales</h3>
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

    <!-- Modal Validar Cobertura -->
    <Modal
      v-model:model-value="showValidarModal"
      title="Validar Cobertura de Paciente"
      size="lg"
      :closable="true"
      @close="showValidarModal = false"
    >
      <div class="validar-form">
        <div class="form-grid">
          <div class="form-field">
            <label class="label">Paciente *</label>
            <Select
              :model-value="validarForm.pacienteId"
              @update:model-value="onPacienteChange($event)"
              :options="
                admisionStore.pacientes.map((p) => ({
                  value: p.id,
                  label: `${p.apellido}, ${p.nombre} (${p.tipoDocumento} ${p.numeroDocumento})`,
                }))
              "
              placeholder="Seleccionar paciente"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-field">
              <label class="label">Obra Social / Seguro *</label>
              <Select
                :model-value="validarForm.codigoObraSocial"
                @update:model-value="validarForm.codigoObraSocial = $event ? String($event) : ''"
                :options="
                  facturacionStore.obrasSociales.map((os) => ({
                    value: os.codigo,
                    label: `${os.nombre} (${os.codigo}) - ${os.porcentajeCobertura}%`,
                  }))
                "
                placeholder="Seleccionar obra social"
                required
              />
            </div>
            <div class="form-field">
              <label class="label">Número de Afiliado *</label>
              <Input
                v-model="validarForm.numeroAfiliado"
                placeholder="Ej: 123456789"
                required
              />
            </div>
          </div>

          <div class="form-field">
            <label class="label">Cuenta a Impactar (Opcional)</label>
            <Select
              :model-value="validarForm.cuentaId"
              @update:model-value="validarForm.cuentaId = $event ? String($event) : ''"
              :options="
                [
                  { value: '', label: 'Ninguna (solo consulta de credencial)' },
                  ...facturacionStore.cuentas
                    .filter((c) => !validarForm.pacienteId || c.pacienteId === validarForm.pacienteId)
                    .map((c) => ({
                      value: c.id,
                      label: `Cuenta #${c.id.slice(-6)} - ${c.tipo} (${c.estado})`,
                    })),
                ]
              "
              placeholder="Seleccionar cuenta para aplicar descuento"
            />
          </div>

          <!-- Resultado -->
          <div v-if="resultadoValidacion" class="resultado-box" :class="{ aprobada: resultadoValidacion.aprobada, rechazada: !resultadoValidacion.aprobada }">
            <div class="resultado-header">
              <strong>Estado:</strong>
              <Badge :variant="resultadoValidacion.aprobada ? 'success' : 'danger'" size="md">
                {{ resultadoValidacion.aprobada ? 'APROBADA' : 'RECHAZADA' }}
              </Badge>
            </div>
            <p v-if="resultadoValidacion.aprobada">
              Cobertura reconocida: <strong>{{ resultadoValidacion.porcentajeCobertura }}%</strong>
              <span v-if="resultadoValidacion.cuentaActualizada" class="ml-sm text-success">(Cuenta actualizada correctamente)</span>
            </p>
            <p v-else class="text-danger">
              Motivo: {{ resultadoValidacion.motivoRechazo || 'Credencial inactiva o datos no coinciden' }}
            </p>
          </div>
        </div>
      </div>

      <template #footer>
        <Button variant="secondary" @click="showValidarModal = false">Cerrar</Button>
        <Button
          variant="primary"
          @click="ejecutarValidacion"
          :loading="facturacionStore.cargando"
          :disabled="!validarForm.pacienteId || !validarForm.codigoObraSocial || !validarForm.numeroAfiliado"
        >
          Validar Credencial
        </Button>
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
