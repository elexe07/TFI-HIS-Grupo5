<!--
  Vista: MiPortalView.vue
  Módulo: Portal del paciente
  Funcionalidad (solo lectura):
    - Datos de la ficha del paciente logueado.
    - Mis turnos: próximos primero, con médico y estado.
    - Mi facturación: cuentas propias y detalle de cargos con los totales que calcula el backend.
-->
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePortalStore } from '@/modules/portal/portal.store';
import { useToastStore } from '@/shared/stores/toast';
import { Card, Table, Badge, Modal, Button, type TableColumn } from '@/shared/components/ui';
import type { EstadoTurno, TurnoDTO } from '@/modules/admision/admision.types';
import type {
  ConceptoCargo,
  EstadoCuenta,
  TipoCuenta,
} from '@/modules/facturacion/facturacion.types';
import type { CargoDeCuenta, CuentaDelPaciente } from '@/modules/portal/portal.types';

type Variante = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const portalStore = usePortalStore();
const toastStore = useToastStore();

const formatearMonto = (monto: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(monto);
const formatearFecha = (iso: string) => new Date(iso).toLocaleDateString('es-AR');
const formatearFechaHora = (iso: string) =>
  new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const ESTADO_TURNO: Record<EstadoTurno, { label: string; variante: Variante }> = {
  RESERVADO: { label: 'Reservado', variante: 'primary' },
  CONFIRMADO: { label: 'Confirmado', variante: 'primary' },
  EN_SALA_ESPERA: { label: 'En sala de espera', variante: 'warning' },
  ATENDIDO: { label: 'Atendido', variante: 'success' },
  CANCELADO: { label: 'Cancelado', variante: 'neutral' },
};
const ESTADO_CUENTA: Record<EstadoCuenta, { label: string; variante: Variante }> = {
  ABIERTA: { label: 'Abierta', variante: 'warning' },
  CERRADA: { label: 'Cerrada', variante: 'success' },
};
const TIPO_CUENTA: Record<TipoCuenta, string> = {
  CONSULTA: 'Consulta',
  INTERNACION: 'Internación',
};
const CONCEPTO: Record<ConceptoCargo, string> = {
  CONSULTA: 'Consulta',
  MEDICACION: 'Medicación',
  DIA_CAMA: 'Día cama',
};

const columnasTurnos: TableColumn<TurnoDTO>[] = [
  {
    key: 'inicio',
    label: 'Fecha y hora',
    width: '170px',
    format: (v) => formatearFechaHora(v as string),
  },
  {
    key: 'medicoId',
    label: 'Médico',
    format: (v) => {
      const m = portalStore.medicoDe(v as string);
      return m ? `${m.apellido}, ${m.nombre} (${m.especialidad})` : '—';
    },
  },
  { key: 'motivoConsulta', label: 'Motivo', format: (v) => (v as string | null) || '—' },
  { key: 'estado', label: 'Estado', width: '150px' },
];

const columnasCuentas: TableColumn<CuentaDelPaciente>[] = [
  { key: 'createdAt', label: 'Fecha', width: '110px', format: (v) => formatearFecha(v as string) },
  { key: 'tipo', label: 'Tipo', width: '120px', format: (v) => TIPO_CUENTA[v as TipoCuenta] },
  { key: 'estado', label: 'Estado', width: '110px' },
  {
    key: 'porcentajeCobertura',
    label: '% Cobertura',
    width: '110px',
    format: (v) => (v === null ? 'Sin cobertura' : `${v}%`),
  },
  {
    key: 'totalAPagar',
    label: 'Total a pagar',
    width: '140px',
    format: (v) => formatearMonto(v as number),
  },
  { key: 'acciones', label: '', width: '120px' },
];

const columnasCargos: TableColumn<CargoDeCuenta>[] = [
  { key: 'createdAt', label: 'Fecha', width: '110px', format: (v) => formatearFecha(v as string) },
  {
    key: 'concepto',
    label: 'Concepto',
    width: '120px',
    format: (v) => CONCEPTO[v as ConceptoCargo],
  },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'cantidad', label: 'Cant.', width: '70px' },
  {
    key: 'montoUnitario',
    label: 'Unitario',
    width: '120px',
    format: (v) => formatearMonto(v as number),
  },
  { key: 'montoTotal', label: 'Total', width: '120px', format: (v) => formatearMonto(v as number) },
];

const mostrarDetalle = ref(false);
const cuentaDetalle = ref<CuentaDelPaciente | null>(null);

async function verDetalle(cuentaId: string) {
  try {
    cuentaDetalle.value = await portalStore.detalleCuenta(cuentaId);
    mostrarDetalle.value = true;
  } catch (err) {
    toastStore.error('Error', err instanceof Error ? err.message : 'No se pudo cargar la cuenta');
  }
}

onMounted(() => {
  portalStore.cargar();
});
</script>

<template>
  <div class="portal-view">
    <div class="view-header">
      <h2>Mi portal</h2>
      <p class="view-subtitle">Tus turnos y tu facturación</p>
    </div>

    <Card v-if="portalStore.sinFichaVinculada" class="aviso">
      <p>
        Tu usuario todavía no está vinculado a una ficha de paciente. Pedile a recepción que lo
        vincule.
      </p>
    </Card>

    <Card v-else-if="portalStore.error" class="aviso aviso-error">
      <p>{{ portalStore.error }}</p>
    </Card>

    <template v-else-if="portalStore.paciente">
      <Card class="ficha">
        <div class="ficha-avatar">{{ portalStore.paciente.nombre.charAt(0).toUpperCase() }}</div>
        <div>
          <h3>{{ portalStore.paciente.apellido }}, {{ portalStore.paciente.nombre }}</h3>
          <p class="text-muted">
            {{ portalStore.paciente.tipoDocumento }} {{ portalStore.paciente.numeroDocumento }} ·
            <template v-if="portalStore.paciente.obraSocialCodigo">
              {{ portalStore.paciente.obraSocialCodigo }}
              <span v-if="portalStore.paciente.numeroAfiliado">
                (afiliado {{ portalStore.paciente.numeroAfiliado }})
              </span>
            </template>
            <template v-else>Particular (sin obra social)</template>
          </p>
        </div>
      </Card>

      <Card class="seccion">
        <template #header>
          <h3>Mis turnos</h3>
        </template>
        <Table
          :columns="columnasTurnos"
          :rows="portalStore.turnosOrdenados"
          rowKey="id"
          :striped="true"
          emptyText="Todavía no tenés turnos. Cuando recepción te reserve uno, lo vas a ver acá."
        >
          <template #cell-estado="{ value }">
            <Badge :variant="ESTADO_TURNO[value as EstadoTurno]?.variante ?? 'neutral'" size="sm">
              {{ ESTADO_TURNO[value as EstadoTurno]?.label ?? value }}
            </Badge>
          </template>
        </Table>
      </Card>

      <Card class="seccion">
        <template #header>
          <h3>Mi facturación</h3>
        </template>
        <Table
          :columns="columnasCuentas"
          :rows="portalStore.cuentasOrdenadas"
          rowKey="id"
          :striped="true"
          emptyText="No tenés cuentas registradas."
        >
          <template #cell-estado="{ value }">
            <Badge :variant="ESTADO_CUENTA[value as EstadoCuenta].variante" size="sm">
              {{ ESTADO_CUENTA[value as EstadoCuenta].label }}
            </Badge>
          </template>
          <template #cell-acciones="{ row }">
            <Button size="sm" variant="ghost" @click="verDetalle(String(row.id))">
              Ver detalle
            </Button>
          </template>
        </Table>
      </Card>
    </template>

    <p v-else-if="portalStore.cargando" class="text-muted">Cargando tus datos…</p>

    <Modal
      v-model:modelValue="mostrarDetalle"
      title="Detalle de la cuenta"
      size="lg"
      :closable="true"
    >
      <div v-if="cuentaDetalle" class="detalle">
        <p class="text-muted">
          {{ TIPO_CUENTA[cuentaDetalle.tipo] }} · {{ formatearFecha(cuentaDetalle.createdAt) }} ·
          {{ ESTADO_CUENTA[cuentaDetalle.estado].label }}
        </p>
        <Table
          :columns="columnasCargos"
          :rows="cuentaDetalle.cargos"
          rowKey="id"
          :striped="true"
          emptyText="Esta cuenta no tiene cargos."
        />
        <dl class="totales">
          <div>
            <dt>Total bruto</dt>
            <dd>{{ formatearMonto(cuentaDetalle.totalBruto) }}</dd>
          </div>
          <div>
            <dt>Descuento por cobertura ({{ cuentaDetalle.porcentajeCobertura ?? 0 }}%)</dt>
            <dd>− {{ formatearMonto(cuentaDetalle.totalDescuento) }}</dd>
          </div>
          <div class="total-final">
            <dt>Total a pagar</dt>
            <dd>{{ formatearMonto(cuentaDetalle.totalAPagar) }}</dd>
          </div>
        </dl>
      </div>
      <template #footer>
        <Button variant="secondary" @click="mostrarDetalle = false">Cerrar</Button>
      </template>
    </Modal>
  </div>
</template>

<style scoped>
.view-header {
  margin-bottom: var(--space-md);
}

.view-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.view-subtitle {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
}

.aviso p {
  margin: 0;
}

.aviso-error p {
  color: var(--color-danger);
}

.ficha {
  margin-bottom: var(--space-md);
}

.ficha :deep(.card-body) {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.ficha h3 {
  margin: 0;
  font-size: 1.125rem;
}

.ficha p {
  margin: var(--space-xs) 0 0;
}

.ficha-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.seccion {
  margin-bottom: var(--space-md);
}

.seccion h3 {
  margin: 0;
  font-size: 1rem;
}

.text-muted {
  color: var(--color-text-muted);
}

.detalle {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.detalle > p {
  margin: 0;
}

.totales {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  align-self: flex-end;
  min-width: 280px;
}

.totales > div {
  display: flex;
  justify-content: space-between;
  gap: var(--space-lg);
}

.totales dt {
  color: var(--color-text-secondary);
}

.totales dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.total-final {
  padding-top: var(--space-xs);
  border-top: 1px solid var(--color-border);
  font-weight: 600;
}

.total-final dt {
  color: var(--color-text);
}
</style>
