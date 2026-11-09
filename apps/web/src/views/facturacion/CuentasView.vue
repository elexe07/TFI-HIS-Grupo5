<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFacturacionStore } from '@/stores/facturacion';
import { useAdmisionStore } from '@/stores/admision';
import { useToastStore } from '@/stores/toast';
import { Button, Input, Card, Table, Select, Modal, Badge } from '@/components/ui';
import type { TableColumn } from '@/components/ui/Table.types';
import type { CuentaDTO, EstadoCuenta, TipoCuenta, ConceptoCargo } from '@/types/api';

const facturacionStore = useFacturacionStore();
const admisionStore = useAdmisionStore();
const toastStore = useToastStore();

const searchDocumento = ref('');
const estadoFiltro = ref('');
const tipoFiltro = ref('');
const showDetalleModal = ref(false);
const cuentaSeleccionada = ref<CuentaDTO | null>(null);

const columns: TableColumn<CuentaDTO>[] = [
  { key: 'id', label: 'ID', width: '80px', format: (value) => (value as string).slice(-8) },
  {
    key: 'fecha',
    label: 'Fecha',
    width: '120px',
    format: (value) => (value ? new Date(value as string).toLocaleDateString('es-AR') : '-'),
  },
  {
    key: 'pacienteId',
    label: 'Paciente',
    format: (_value, row) => {
      const c = row as CuentaDTO;
      const p = c.paciente || admisionStore.pacientes.find((pac) => pac.id === c.pacienteId);
      return p ? `${p.apellido}, ${p.nombre}` : (c.pacienteId ? c.pacienteId.slice(-6) : '-');
    },
  },
  { key: 'tipo', label: 'Tipo', width: '120px' },
  { key: 'estado', label: 'Estado', width: '120px' },
  { key: 'coberturaValidada', label: 'Cobertura', width: '100px' },
  {
    key: 'porcentajeCobertura',
    label: '% Cob.',
    width: '80px',
    format: (value) => (value !== null ? `${value}%` : '-'),
  },
  {
    key: 'total',
    label: 'Total',
    width: '120px',
    format: (value, row) => {
      const c = row as any;
      const monto = typeof value === 'number' && !isNaN(value) ? value : (c?.totalBruto ?? c?.totalAPagar ?? 0);
      return facturacionStore.formatearMonto(monto);
    },
  },
  { key: 'actions', label: 'Acciones', width: '100px' },
];

const cargosColumns: TableColumn[] = [
  { key: 'concepto', label: 'Concepto', width: '150px' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'cantidad', label: 'Cant.', width: '70px' },
  { key: 'montoUnitario', label: 'Unitario', width: '120px' },
  { key: 'montoTotal', label: 'Total', width: '120px' },
  {
    key: 'origenEventoId',
    label: 'Origen',
    width: '100px',
    format: (v) => (v as string).slice(-8),
  },
];

const estadosOptions = [
  { value: '', label: 'Todos' },
  { value: 'ABIERTA', label: 'Abierta' },
  { value: 'CERRADA', label: 'Cerrada' },
];

const tiposOptions = [
  { value: '', label: 'Todos' },
  { value: 'CONSULTA', label: 'Consulta' },
  { value: 'INTERNACION', label: 'Internación' },
];

const cuentasFiltradas = computed(() => {
  return facturacionStore.cuentas.filter((cuenta) => {
    const p = cuenta.paciente || admisionStore.pacientes.find((pac) => pac.id === cuenta.pacienteId);
    if (searchDocumento.value) {
      if (
        !p ||
        (!`${p.tipoDocumento} ${p.numeroDocumento}`.includes(searchDocumento.value) &&
          !p.nombre.toLowerCase().includes(searchDocumento.value.toLowerCase()) &&
          !p.apellido.toLowerCase().includes(searchDocumento.value.toLowerCase()))
      ) {
        return false;
      }
    }
    if (estadoFiltro.value && cuenta.estado !== estadoFiltro.value) return false;
    if (tipoFiltro.value && cuenta.tipo !== tipoFiltro.value) return false;
    return true;
  });
});

async function buscarCuentas() {
  await Promise.all([
    facturacionStore.cargarCuentas(),
    admisionStore.pacientes.length === 0 ? admisionStore.cargarPacientes() : Promise.resolve(),
  ]);
}

const cerrandoId = ref<string | null>(null);

async function handleCerrarCuenta(id: string) {
  if (!confirm('¿Confirma que desea cerrar esta cuenta? Una vez cerrada no se podrán registrar nuevos cargos.')) {
    return;
  }
  cerrandoId.value = id;
  try {
    await facturacionStore.cerrarCuenta(id);
    toastStore.success('Cuenta cerrada', 'La cuenta ha sido cerrada correctamente');
    if (cuentaSeleccionada.value?.id === id) {
      cuentaSeleccionada.value = { ...cuentaSeleccionada.value, estado: 'CERRADA' };
    }
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Error al cerrar cuenta';
    toastStore.error('Error', msg);
  } finally {
    cerrandoId.value = null;
  }
}

async function verDetalle(cuenta: CuentaDTO) {
  try {
    cuentaSeleccionada.value = await facturacionStore.obtenerCuenta(cuenta.id);
    showDetalleModal.value = true;
  } catch (err) {
    toastStore.error('Error', 'No se pudo cargar el detalle de la cuenta');
  }
}

function getEstadoVariant(
  estado: EstadoCuenta,
): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<EstadoCuenta, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    ABIERTA: 'info',
    CERRADA: 'success',
  };
  return variants[estado] ?? 'info';
}

function getTipoLabel(tipo: TipoCuenta): string {
  return tipo === 'CONSULTA' ? 'Consulta' : 'Internación';
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
  searchDocumento.value = '';
  estadoFiltro.value = '';
  tipoFiltro.value = '';
  buscarCuentas();
}

onMounted(() => {
  buscarCuentas();
});
</script>

<template>
  <div class="cuentas-view">
    <div class="view-header">
      <div>
        <h2>Cuentas Corrientes</h2>
        <p class="view-subtitle">Consulta de cuentas de pacientes, cargos y totales</p>
      </div>
    </div>

    <Card class="search-card">
      <div class="search-form">
        <Input
          v-model="searchDocumento"
          label="Documento Paciente"
          placeholder="Número de documento"
          size="sm"
        />
        <Select v-model="estadoFiltro" label="Estado" :options="estadosOptions" size="sm" />
        <Select v-model="tipoFiltro" label="Tipo" :options="tiposOptions" size="sm" />
        <Button variant="secondary" @click="buscarCuentas" class="search-btn">
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
        :rows="cuentasFiltradas"
        rowKey="id"
        :hoverable="true"
        :striped="true"
        emptyText="No se encontraron cuentas con los filtros aplicados."
      >
        <template #cell-tipo="{ value }">
          <Badge variant="neutral" size="sm">{{ getTipoLabel(value as TipoCuenta) }}</Badge>
        </template>
        <template #cell-estado="{ value }">
          <Badge :variant="getEstadoVariant(value as EstadoCuenta)" size="sm">{{ value }}</Badge>
        </template>
        <template #cell-coberturaValidada="{ value }">
          <Badge :variant="value ? 'success' : 'warning'" size="sm">{{
            value ? 'Validada' : 'Pendiente'
          }}</Badge>
        </template>
        <template #cell-actions="{ row }">
          <div class="action-buttons">
            <Button size="sm" variant="ghost" @click="verDetalle(row as unknown as CuentaDTO)" title="Ver detalle">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </Button>
            <Button
              v-if="(row as any).estado === 'ABIERTA'"
              size="sm"
              variant="ghost"
              @click="handleCerrarCuenta((row as any).id)"
              :loading="cerrandoId === (row as any).id"
              title="Cerrar cuenta"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </Button>
          </div>
        </template>
      </Table>
    </Card>

    <!-- Modal Detalle Cuenta -->
    <Modal
      v-model:model-value="showDetalleModal"
      title="Detalle de Cuenta"
      size="xl"
      :closable="true"
      @close="
        showDetalleModal = false;
        cuentaSeleccionada = null;
      "
    >
      <div v-if="cuentaSeleccionada" class="cuenta-detalle">
        <div class="detalle-header">
          <div class="detalle-info">
            <h4>Cuenta #{{ cuentaSeleccionada.id.slice(-8) }}</h4>
            <p class="text-muted">
              {{ getTipoLabel(cuentaSeleccionada.tipo) }} ·
              {{ new Date(cuentaSeleccionada.createdAt).toLocaleDateString('es-AR') }}
            </p>
          </div>
          <div class="detalle-badges">
            <Badge :variant="getEstadoVariant(cuentaSeleccionada.estado)" size="md">{{
              cuentaSeleccionada.estado
            }}</Badge>
            <Badge
              :variant="cuentaSeleccionada.coberturaValidada ? 'success' : 'warning'"
              size="md"
              >{{
                cuentaSeleccionada.coberturaValidada ? 'Cobertura Validada' : 'Cobertura Pendiente'
              }}</Badge
            >
          </div>
        </div>

        <div v-if="cuentaSeleccionada.paciente" class="paciente-info">
          <h5>Paciente</h5>
          <p>
            {{ cuentaSeleccionada.paciente.apellido }}, {{ cuentaSeleccionada.paciente.nombre }} ({{
              cuentaSeleccionada.paciente.tipoDocumento
            }}
            {{ cuentaSeleccionada.paciente.numeroDocumento }})
          </p>
        </div>

        <Card class="cargos-table">
          <template #header>
            <h3>Cargos ({{ cuentaSeleccionada.cargos.length }})</h3>
          </template>
          <Table
            :columns="cargosColumns"
            :rows="cuentaSeleccionada.cargos"
            rowKey="id"
            :striped="true"
            emptyText="Esta cuenta no tiene cargos registrados."
          >
            <template #cell-concepto="{ value }">
              <Badge variant="info" size="sm">{{ getConceptoLabel(value as ConceptoCargo) }}</Badge>
            </template>
            <template #cell-montoUnitario="{ value }">
              {{ facturacionStore.formatearMonto(value as number) }}
            </template>
            <template #cell-montoTotal="{ value }">
              <strong>{{ facturacionStore.formatearMonto(value as number) }}</strong>
            </template>
          </Table>
        </Card>

        <div class="total-section">
          <div class="total-row">
            <span>Subtotal</span>
            <span>{{ facturacionStore.formatearMonto(cuentaSeleccionada.total) }}</span>
          </div>
          <div class="total-row">
            <span>Cobertura ({{ cuentaSeleccionada.porcentajeCobertura || 0 }}%)</span>
            <span>{{
              facturacionStore.formatearMonto(
                (cuentaSeleccionada.total * (cuentaSeleccionada.porcentajeCobertura || 0)) / 100,
              )
            }}</span>
          </div>
          <div class="total-row total-final">
            <span>Total a Cobrar</span>
            <span>{{
              facturacionStore.formatearMonto(
                cuentaSeleccionada.total -
                  (cuentaSeleccionada.total * (cuentaSeleccionada.porcentajeCobertura || 0)) / 100,
              )
            }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer-actions">
          <Button
            v-if="cuentaSeleccionada?.estado === 'ABIERTA'"
            variant="danger"
            @click="handleCerrarCuenta(cuentaSeleccionada.id)"
            :loading="cerrandoId === cuentaSeleccionada?.id"
          >
            Cerrar Cuenta
          </Button>
          <Button variant="secondary" @click="showDetalleModal = false; cuentaSeleccionada = null;">Volver</Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.action-buttons {
  display: flex;
  gap: var(--space-xs);
  align-items: center;
}

.modal-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  width: 100%;
}

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

.detalle-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.detalle-info h4 {
  margin: 0 0 var(--space-xs);
}

.detalle-badges {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.paciente-info {
  padding: var(--space-md);
  background-color: var(--color-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  margin-bottom: var(--space-lg);
}

.paciente-info h5 {
  margin: 0 0 var(--space-xs);
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.paciente-info p {
  margin: 0;
}

.cargos-table {
  margin-bottom: var(--space-lg);
}

.total-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-width: 300px;
  margin-left: auto;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  background-color: var(--color-bg);
  border-radius: var(--radius-sm);
}

.total-row.total-final {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 700;
  font-size: 1.125rem;
}

.text-muted {
  color: var(--color-text-muted);
}
</style>
