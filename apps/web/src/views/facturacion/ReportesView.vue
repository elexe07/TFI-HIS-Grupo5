<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFacturacionStore } from '@/stores/facturacion';
import { useToastStore } from '@/stores/toast';
import { Card, Button, Input, Table, Badge } from '@/components/ui';
import type { TableColumn } from '@/components/ui/Table.types';
import type { ReporteFacturacionDTO, ReporteOcupacionDTO, ConceptoCargo } from '@/types/api';

const facturacionStore = useFacturacionStore();
const toastStore = useToastStore();

const reporteTipo = ref<'facturacion' | 'ocupacion'>('facturacion');
const fechaDesde = ref(
  new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
);
const fechaHasta = ref(new Date().toISOString().split('T')[0]);
const loading = ref(false);

const reporteFacturacionData = ref<ReporteFacturacionDTO | null>(null);
const reporteOcupacionData = ref<ReporteOcupacionDTO | null>(null);

const tiposReporte = [
  { value: 'facturacion', label: 'Facturación por Período' },
  { value: 'ocupacion', label: 'Ocupación de Camas' },
];

async function generarReporte() {
  loading.value = true;
  try {
    if (reporteTipo.value === 'facturacion') {
      await facturacionStore.generarReporteFacturacion(
        fechaDesde.value ?? '',
        fechaHasta.value ?? '',
      );
      reporteFacturacionData.value = facturacionStore.reporteFacturacion;
      toastStore.success('Reporte generado', 'Reporte de facturación cargado');
    } else {
      await facturacionStore.generarReporteOcupacion();
      reporteOcupacionData.value = facturacionStore.reporteOcupacion;
      toastStore.success('Reporte generado', 'Reporte de ocupación cargado');
    }
  } catch (err) {
    toastStore.error('Error', 'No se pudo generar el reporte');
  } finally {
    loading.value = false;
  }
}

function exportarCSV() {
  if (reporteTipo.value === 'facturacion' && reporteFacturacionData.value) {
    exportarFacturacionCSV();
  } else if (reporteTipo.value === 'ocupacion' && reporteOcupacionData.value) {
    exportarOcupacionCSV();
  } else {
    toastStore.warning('Sin datos', 'Genere un reporte primero');
  }
}

function exportarFacturacionCSV() {
  const data = reporteFacturacionData.value!;
  const rows: string[][] = [];

  // Header
  rows.push(['Concepto', 'Cantidad', 'Monto']);

  // Por concepto
  for (const [concepto, valores] of Object.entries(data.porConcepto)) {
    rows.push([
      getConceptoLabel(concepto as ConceptoCargo),
      valores.cantidad.toString(),
      facturacionStore.formatearMonto(valores.monto),
    ]);
  }

  // Total
  rows.push([
    'TOTAL',
    data.totalCargos.toString(),
    facturacionStore.formatearMonto(data.totalMonto),
  ]);

  // Por obra social
  rows.push([]);
  rows.push(['Obra Social', 'Cantidad', 'Monto']);
  for (const [obraSocial, valores] of Object.entries(data.porObraSocial)) {
    rows.push([
      obraSocial,
      valores.cantidad.toString(),
      facturacionStore.formatearMonto(valores.monto),
    ]);
  }

  downloadCSV(rows, `reporte-facturacion-${fechaDesde.value}-${fechaHasta.value}.csv`);
}

function exportarOcupacionCSV() {
  const data = reporteOcupacionData.value!;
  const rows: string[][] = [];

  rows.push(['Métrica', 'Valor']);
  rows.push(['Total Camas', data.totalCamas.toString()]);
  rows.push(['Ocupadas', data.ocupadas.toString()]);
  rows.push(['Libres', data.libres.toString()]);
  rows.push(['En Limpieza', data.enLimpieza.toString()]);
  rows.push(['Bloqueadas', data.bloqueadas.toString()]);
  rows.push(['% Ocupación', `${data.porcentajeOcupacion.toFixed(2)}%`]);
  rows.push([]);
  rows.push(['Sector', 'Total', 'Ocupadas', '% Ocupación']);
  for (const [sector, valores] of Object.entries(data.porSector)) {
    rows.push([
      sector,
      valores.total.toString(),
      valores.ocupadas.toString(),
      `${valores.porcentaje.toFixed(2)}%`,
    ]);
  }

  downloadCSV(rows, `reporte-ocupacion-${new Date().toISOString().split('T')[0]}.csv`);
}

function downloadCSV(rows: string[][], filename: string) {
  const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  toastStore.success('Exportado', 'Archivo CSV descargado');
}

function getConceptoLabel(concepto: ConceptoCargo): string {
  const labels: Record<ConceptoCargo, string> = {
    CONSULTA: 'Consulta Médica',
    MEDICACION: 'Medicación',
    DIA_CAMA: 'Día Cama',
  };
  return labels[concepto] ?? concepto;
}

function getOcupacionColumns(): TableColumn[] {
  return [
    { key: 'sector', label: 'Sector' },
    { key: 'total', label: 'Total Camas', width: '120px' },
    { key: 'ocupadas', label: 'Ocupadas', width: '120px' },
    {
      key: 'porcentaje',
      label: '% Ocupación',
      width: '120px',
      format: (v) => `${(v as number).toFixed(2)}%`,
    },
  ];
}

function getOcupacionRows() {
  if (!reporteOcupacionData.value) return [];
  return Object.entries(reporteOcupacionData.value.porSector).map(([sector, valores]) => ({
    sector,
    ...valores,
  }));
}

onMounted(() => {
  generarReporte();
});
</script>

<template>
  <div class="reportes-view">
    <div class="view-header">
      <div>
        <h2>Reportes de Facturación</h2>
        <p class="view-subtitle">Generación y exportación de reportes contables y de gestión</p>
      </div>
    </div>

    <Card class="reporte-config">
      <div class="config-grid">
        <div class="config-field">
          <label>Tipo de Reporte</label>
          <select v-model="reporteTipo" class="select-native" required>
            <option v-for="t in tiposReporte" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>

        <div class="config-field">
          <label>Fecha Desde</label>
          <Input v-model="fechaDesde" type="date" required />
        </div>

        <div class="config-field">
          <label>Fecha Hasta</label>
          <Input v-model="fechaHasta" type="date" required />
        </div>

        <div class="config-field">
          <label>&nbsp;</label>
          <Button variant="primary" @click="generarReporte" :loading="loading" class="generate-btn">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Generar Reporte
          </Button>
        </div>

        <div
          class="config-field"
          v-if="
            (reporteTipo === 'facturacion' && reporteFacturacionData) ||
            (reporteTipo === 'ocupacion' && reporteOcupacionData)
          "
        >
          <label>&nbsp;</label>
          <Button variant="secondary" @click="exportarCSV" class="export-btn">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Exportar CSV
          </Button>
        </div>
      </div>
    </Card>

    <!-- Reporte Facturación -->
    <Card v-if="reporteTipo === 'facturacion' && reporteFacturacionData">
      <template #header>
        <div class="reporte-header">
          <h3>Facturación por Período</h3>
          <div class="reporte-meta">
            <span>{{ fechaDesde }} - {{ fechaHasta }}</span>
            <span class="records-count"
              >{{ reporteFacturacionData.totalCargos }} cargos ·
              {{ facturacionStore.formatearMonto(reporteFacturacionData.totalMonto) }}</span
            >
          </div>
        </div>
      </template>

      <div class="reporte-resumen">
        <div class="resumen-card">
          <div class="resumen-label">Total Cargos</div>
          <div class="resumen-valor">{{ reporteFacturacionData.totalCargos }}</div>
        </div>
        <div class="resumen-card">
          <div class="resumen-label">Total Facturado</div>
          <div class="resumen-valor">
            {{ facturacionStore.formatearMonto(reporteFacturacionData.totalMonto) }}
          </div>
        </div>
      </div>

      <h4 class="subsection-title">Por Concepto</h4>
      <Table
        :columns="[
          {
            key: 'concepto',
            label: 'Concepto',
            format: (v) => getConceptoLabel(v as ConceptoCargo),
          },
          { key: 'cantidad', label: 'Cantidad', width: '120px' },
          {
            key: 'monto',
            label: 'Monto',
            width: '180px',
            format: (v) => facturacionStore.formatearMonto(v as number),
          },
        ]"
        :rows="
          Object.entries(reporteFacturacionData.porConcepto).map(([concepto, valores]) => ({
            concepto,
            ...valores,
          }))
        "
        rowKey="concepto"
        :hoverable="true"
        :striped="true"
        emptyText="Sin datos"
      />

      <h4 class="subsection-title">Por Obra Social</h4>
      <Table
        :columns="[
          { key: 'obraSocial', label: 'Obra Social' },
          { key: 'cantidad', label: 'Cantidad', width: '120px' },
          {
            key: 'monto',
            label: 'Monto',
            width: '180px',
            format: (v) => facturacionStore.formatearMonto(v as number),
          },
        ]"
        :rows="
          Object.entries(reporteFacturacionData.porObraSocial).map(([obraSocial, valores]) => ({
            obraSocial,
            ...valores,
          }))
        "
        rowKey="obraSocial"
        :hoverable="true"
        :striped="true"
        emptyText="Sin datos"
      />
    </Card>

    <!-- Reporte Ocupación -->
    <Card v-else-if="reporteTipo === 'ocupacion' && reporteOcupacionData">
      <template #header>
        <div class="reporte-header">
          <h3>Ocupación de Camas</h3>
          <div class="reporte-meta">
            <span class="records-count"
              >{{ reporteOcupacionData.ocupadas }} / {{ reporteOcupacionData.totalCamas }} camas ({{
                reporteOcupacionData.porcentajeOcupacion.toFixed(2)
              }}%)</span
            >
          </div>
        </div>
      </template>

      <div class="reporte-resumen">
        <div class="resumen-card ocupadas">
          <div class="resumen-label">Ocupadas</div>
          <div class="resumen-valor">{{ reporteOcupacionData.ocupadas }}</div>
        </div>
        <div class="resumen-card libres">
          <div class="resumen-label">Libres</div>
          <div class="resumen-valor">{{ reporteOcupacionData.libres }}</div>
        </div>
        <div class="resumen-card limpieza">
          <div class="resumen-label">En Limpieza</div>
          <div class="resumen-valor">{{ reporteOcupacionData.enLimpieza }}</div>
        </div>
        <div class="resumen-card bloqueadas">
          <div class="resumen-label">Bloqueadas</div>
          <div class="resumen-valor">{{ reporteOcupacionData.bloqueadas }}</div>
        </div>
        <div class="resumen-card porcentaje">
          <div class="resumen-label">% Ocupación</div>
          <div class="resumen-valor">
            {{ reporteOcupacionData.porcentajeOcupacion.toFixed(2) }}%
          </div>
        </div>
      </div>

      <h4 class="subsection-title">Por Sector</h4>
      <Table
        :columns="getOcupacionColumns()"
        :rows="getOcupacionRows()"
        rowKey="sector"
        :hoverable="true"
        :striped="true"
        emptyText="Sin datos"
      >
        <template #cell-porcentaje="{ value }">
          <Badge
            :variant="Number(value) > 80 ? 'danger' : Number(value) > 50 ? 'warning' : 'success'"
            size="sm"
            >{{ Number(value).toFixed(2) }}%</Badge
          >
        </template>
      </Table>
    </Card>

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
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
      <h3>Seleccione un Reporte</h3>
      <p class="text-muted">
        Configure los parámetros y presione "Generar Reporte" para ver los resultados.
      </p>
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

.reporte-config {
  margin-bottom: var(--space-md);
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
  align-items: end;
}

.config-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.config-field label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.select-native {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
}

.generate-btn,
.export-btn {
  height: 40px;
}

.reporte-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.reporte-header h3 {
  margin: 0;
  font-size: 1rem;
}

.reporte-meta {
  display: flex;
  gap: var(--space-md);
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.records-count {
  font-weight: 600;
  color: var(--color-primary);
}

.reporte-resumen {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-md);
  padding: var(--space-md);
  background-color: var(--color-bg);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
}

.resumen-card {
  text-align: center;
  padding: var(--space-md);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
}

.resumen-card.ocupadas {
  border-left: 4px solid var(--color-primary);
}
.resumen-card.libres {
  border-left: 4px solid var(--color-success);
}
.resumen-card.limpieza {
  border-left: 4px solid var(--color-warning);
}
.resumen-card.bloqueadas {
  border-left: 4px solid var(--color-danger);
}
.resumen-card.porcentaje {
  border-left: 4px solid var(--color-info);
}

.resumen-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-xs);
}

.resumen-valor {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.subsection-title {
  margin: var(--space-xl) 0 var(--space-md);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
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
