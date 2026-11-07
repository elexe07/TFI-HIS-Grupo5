<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useFacturacionStore } from '@/stores/facturacion'
import { useToastStore } from '@/stores/toast'
import { useRouter, useRoute } from 'vue-router'
import { Card, Button, Badge, Table, Modal } from '@/components/ui'
import type { TableColumn } from '@/components/ui/Table.types'
import type { CuentaDTO, EstadoCuenta } from '@/types/api'

const facturacionStore = useFacturacionStore()
const toastStore = useToastStore()
const router = useRouter()
const route = useRoute()

const cuentaId = computed(() => route.params.id as string)
const cuenta = ref<CuentaDTO | null>(null)
const cargando = ref(false)
const showModalPago = ref(false)
const pagoForm = ref({ monto: 0, metodoPago: 'EFECTIVO', observaciones: '' })

const columns: TableColumn[] = [
  { key: 'tipo', label: 'Tipo', width: '120px' },
  { key: 'descripcion', label: 'Descripción', width: '300px' },
  { key: 'cantidad', label: 'Cant.', width: '70px' },
  { key: 'precioUnitario', label: 'Precio Unit.', width: '120px', format: (v) => `$${Number(v).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` },
  { key: 'subtotal', label: 'Subtotal', width: '120px', format: (v) => `$${Number(v).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` },
]

const pagosColumns: TableColumn[] = [
  { key: 'fecha', label: 'Fecha', width: '160px', format: (v) => new Date(v as string).toLocaleString('es-AR') },
  { key: 'metodoPago', label: 'Método', width: '160px' },
  { key: 'monto', label: 'Monto', width: '140px' },
  { key: 'observaciones', label: 'Observaciones', width: '300px' },
]

const metodosPago = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TARJETA_DEBITO', label: 'Tarjeta de Débito' },
  { value: 'TARJETA_CREDITO', label: 'Tarjeta de Crédito' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'OTRO', label: 'Otro' },
]

async function cargarCuenta() {
  cargando.value = true
  try {
    const data = await facturacionStore.obtenerCuenta(cuentaId.value)
    cuenta.value = data
  } catch (err) {
    toastStore.error('Error', 'No se pudo cargar la cuenta')
    await router.push({ name: 'facturacion.cuentas' })
  } finally {
    cargando.value = false
  }
}

function getEstadoVariant(estado: EstadoCuenta): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<EstadoCuenta, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    ABIERTA: 'primary',
    CERRADA: 'success',
  }
  return variants[estado] ?? 'info'
}

function getEstadoLabel(estado: EstadoCuenta): string {
  const labels: Record<EstadoCuenta, string> = {
    ABIERTA: 'Abierta',
    CERRADA: 'Cerrada',
  }
  return labels[estado] ?? estado
}

function getTipoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    CONSULTA: 'Consulta Médica',
    ESTUDIO: 'Estudio',
    INTERNACION: 'Internación',
    MEDICAMENTO: 'Medicamento',
    INSUMO: 'Insumo',
    PROCEDIMIENTO: 'Procedimiento',
    OTRO: 'Otro',
  }
  return labels[tipo] ?? tipo
}

function getTipoBadgeVariant(tipo: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    CONSULTA: 'primary',
    ESTUDIO: 'info',
    INTERNACION: 'warning',
    MEDICAMENTO: 'success',
    INSUMO: 'success',
    PROCEDIMIENTO: 'danger',
    OTRO: 'primary',
  }
  return variants[tipo] ?? 'primary'
}

function getMetodoPagoLabel(metodo: string): string {
  const labels: Record<string, string> = {
    EFECTIVO: 'Efectivo',
    TARJETA_DEBITO: 'Tarjeta Débito',
    TARJETA_CREDITO: 'Tarjeta Crédito',
    TRANSFERENCIA: 'Transferencia',
    CHEQUE: 'Cheque',
    OTRO: 'Otro',
  }
  return labels[metodo] ?? metodo
}

async function registrarPago() {
  if (!pagoForm.value.monto || pagoForm.value.monto <= 0) {
    toastStore.error('Monto inválido', 'Ingrese un monto mayor a cero')
    return
  }

  try {
    await facturacionStore.registrarPago(cuentaId.value, {
      monto: pagoForm.value.monto,
      metodoPago: pagoForm.value.metodoPago,
      observaciones: pagoForm.value.observaciones,
    })
    toastStore.success('Pago registrado', `Se registró pago de $${pagoForm.value.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`)
    showModalPago.value = false
    pagoForm.value = { monto: 0, metodoPago: 'EFECTIVO', observaciones: '' }
    await cargarCuenta()
  } catch (err) {
    // Error manejado en store
  }
}

function volver() {
  router.push({ name: 'facturacion.cuentas' })
}

function imprimirCuenta() {
  // TODO: implementar impresión
  toastStore.info('Próximamente', 'Función de impresión en desarrollo')
}

onMounted(() => {
  cargarCuenta()
})

watch(() => route.params.id, () => {
  cargarCuenta()
})
</script>

<template>
  <div class="cuenta-detalle-view">
    <div v-if="cargando" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando cuenta...</p>
    </div>

    <div v-else-if="cuenta" class="cuenta-detalle">
      <div class="view-header">
        <div class="header-actions">
          <Button variant="secondary" @click="volver">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Volver
          </Button>
          <Button variant="ghost" @click="imprimirCuenta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Imprimir
          </Button>
        </div>
        <div>
          <h2>Cuenta N° {{ cuenta.numero }}</h2>
          <p class="view-subtitle">{{ cuenta.paciente?.apellido }}, {{ cuenta.paciente?.nombre }} - {{ new Date(cuenta.fecha).toLocaleDateString('es-AR') }}</p>
        </div>
      </div>

      <!-- Resumen de la cuenta -->
      <div class="resumen-grid">
        <div class="resumen-item">
          <div class="resumen-label">Estado</div>
          <div class="resumen-value">
            <Badge :variant="getEstadoVariant(cuenta.estado)">{{ getEstadoLabel(cuenta.estado) }}</Badge>
          </div>
        </div>
        <div class="resumen-item">
          <div class="resumen-label">Total</div>
          <div class="resumen-value resumen-total">${{ Number(cuenta.total).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</div>
        </div>
        <div class="resumen-item">
          <div class="resumen-label">Pagado</div>
          <div class="resumen-value resumen-pagado">${{ Number(cuenta.pagado).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</div>
        </div>
        <div class="resumen-item">
          <div class="resumen-label">Saldo</div>
          <div class="resumen-value resumen-saldo">${{ Number(cuenta.saldo).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</div>
        </div>
        <div class="resumen-item">
          <div class="resumen-label">Cobertura</div>
          <div class="resumen-value">{{ cuenta.cobertura?.nombre || 'Sin cobertura' }}</div>
        </div>
        <div class="resumen-item">
          <div class="resumen-label">% Cobertura</div>
          <div class="resumen-value">{{ cuenta.coberturaPorcentaje }}%</div>
        </div>
      </div>

      <!-- Detalles de la cuenta -->
      <Card>
        <template #header>
          <div class="card-header-flex">
            <h3>Detalles de la Cuenta</h3>
            <Button v-if="cuenta.estado === 'ABIERTA'" variant="primary" size="sm" @click="showModalPago = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Registrar Pago
            </Button>
          </div>
        </template>

        <Table
          :columns="columns"
          :rows="cuenta.detalles"
          :striped="true"
          :hoverable="true"
          emptyText="No hay ítems en esta cuenta"
        >
          <template #cell-tipo="{ value }">
            <Badge :variant="getTipoBadgeVariant(String(value))" size="sm">{{ getTipoLabel(String(value)) }}</Badge>
          </template>

          <template #cell-precioUnitario="{ value }">
            <span class="monto">${{ Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
          </template>

          <template #cell-subtotal="{ value }">
            <span class="monto">${{ Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
          </template>
        </Table>
      </Card>

      <!-- Pagos registrados -->
      <Card v-if="cuenta.pagos && cuenta.pagos.length > 0">
        <template #header>
          <h3>Pagos Registrados</h3>
        </template>
        <Table
          :columns="pagosColumns"
          :rows="cuenta.pagos"
          :striped="true"
          emptyText="No hay pagos registrados"
        >
          <template #cell-metodoPago="{ value }">
            <Badge variant="info" size="sm">{{ getMetodoPagoLabel(String(value)) }}</Badge>
          </template>
          <template #cell-monto="{ value }">
            <span class="monto">${{ Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
          </template>
        </Table>
      </Card>

      <Modal v-model="showModalPago" title="Registrar Pago" @close="showModalPago = false">
        <form @submit.prevent="registrarPago" class="pago-form">
          <div class="form-row">
            <div class="form-field">
              <label>Monto *</label>
              <input
                type="number"
                v-model.number="pagoForm.monto"
                step="0.01"
                min="0.01"
                :max="cuenta ? cuenta.saldo : undefined"
                placeholder="0.00"
                class="input-monto"
                required
              />
              <span class="form-hint" v-if="cuenta">Saldo disponible: ${{ Number(cuenta.saldo).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Método de Pago *</label>
              <select v-model="pagoForm.metodoPago" class="select-input" required>
                <option v-for="m in metodosPago" :key="m.value" :value="m.value">{{ m.label }}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>Observaciones</label>
              <textarea v-model="pagoForm.observaciones" rows="3" placeholder="Referencia, número de comprobante, etc." class="textarea-input"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <Button variant="secondary" type="button" @click="showModalPago = false">Cancelar</Button>
            <Button variant="primary" type="submit" :loading="facturacionStore.cargando">Registrar Pago</Button>
          </div>
        </form>
      </Modal>
    </div>

    <div v-else class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <h3>Cuenta no encontrada</h3>
      <p>La cuenta solicitada no existe o ha sido eliminada.</p>
      <Button variant="primary" @click="volver">Volver a la lista</Button>
    </div>
  </div>
</template>


<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl);
  color: var(--color-text-secondary);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
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

.header-actions {
  display: flex;
  gap: var(--space-sm);
}

.resumen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.resumen-item {
  padding: var(--space-md);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-align: center;
}

.resumen-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-xs);
}

.resumen-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
}

.resumen-total { color: var(--color-primary); }
.resumen-pagado { color: var(--color-success); }
.resumen-saldo { color: var(--color-danger); }

.card-header-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.monto {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
  font-weight: 500;
}

.pago-form {
  padding: var(--space-sm) 0;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-field label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.input-monto,
.select-input,
.textarea-input {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: 0.875rem;
  font-family: inherit;
}

.input-monto:focus,
.select-input:focus,
.textarea-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.empty-state {
  text-align: center;
  padding: var(--space-3xl);
  color: var(--color-text-muted);
}

.empty-state svg {
  margin-bottom: var(--space-md);
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 var(--space-sm);
  color: var(--color-text);
}

.empty-state p {
  margin: 0 0 var(--space-lg);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>