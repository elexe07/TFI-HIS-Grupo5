<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useHceStore } from '@/stores/hce'
import { useAdmisionStore } from '@/stores/admision'
import { Card, Select, Table, Badge, type TableColumn } from '@/components/ui'
import type { SeveridadAlergia, AlergiaDTO, EstudioDTO, PrescripcionDTO } from '@/types/api'

const hceStore = useHceStore()
const admisionStore = useAdmisionStore()

const pacienteId = ref('')
const activeTab = ref<'resumen' | 'alergias' | 'estudios' | 'prescripciones' | 'timeline'>('resumen')

const alergiasColumns: TableColumn<AlergiaDTO>[] = [
  { key: 'sustancia', label: 'Sustancia' },
  { key: 'severidad', label: 'Gravedad', width: '120px' },
  { key: 'registradoEn', label: 'Registrada', width: '140px', format: (v) => v ? new Date(v as string).toLocaleDateString('es-AR') : '-' },
]

const estudiosColumns: TableColumn<EstudioDTO>[] = [
  { key: 'tipo', label: 'Tipo', width: '140px' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'fecha', label: 'Fecha', width: '140px', format: (v) => v ? new Date(v as string).toLocaleDateString('es-AR') : '-' },
  { key: 'resultado', label: 'Resultado' },
]

const prescripcionesColumns: TableColumn<PrescripcionDTO>[] = [
  { key: 'medicamento', label: 'Medicamento' },
  { key: 'dosis', label: 'Dosis', width: '100px' },
  { key: 'frecuenciaHoras', label: 'Frecuencia (hrs)', width: '140px' },
  { key: 'duracionDias', label: 'Duración (días)', width: '120px' },
  { key: 'estado', label: 'Estado', width: '120px' },
  { key: 'createdAt', label: 'Creada', width: '120px', format: (v) => v ? new Date(v as string).toLocaleDateString('es-AR') : '-' },
]

async function cargarHistoria() {
  if (!pacienteId.value) return
  await hceStore.cargarHistoria(pacienteId.value)
}

watch(() => admisionStore.pacienteSeleccionado, (paciente) => {
  if (paciente) {
    pacienteId.value = paciente.id
    cargarHistoria()
  }
})

onMounted(() => {
  if (admisionStore.pacienteSeleccionado) {
    pacienteId.value = admisionStore.pacienteSeleccionado.id
    cargarHistoria()
  }
})

function getGravedadVariant(gravedad: SeveridadAlergia): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<SeveridadAlergia, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    LEVE: 'info',
    MODERADA: 'warning',
    GRAVE: 'danger',
  }
  return variants[gravedad] ?? 'info'
}

function getEstadoPrescripcionVariant(estado: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    ACTIVA: 'success',
    SUSPENDIDA: 'warning',
    FINALIZADA: 'info',
  }
  return variants[estado] ?? 'info'
}

const timelineEventos = computed(() => {
  const historia = hceStore.historiaActual
  if (!historia) return []

  const eventos: any[] = []

  // Apertura de HCE (basado en createdAt de la historia)
  eventos.push({
    id: 'apertura',
    type: 'hce',
    title: 'Historia Clínica Creada',
    time: new Date(historia.createdAt).toLocaleString('es-AR'),
    description: `ID: ${historia.id.slice(-8)}`,
  })

  // Alergias
  historia.alergias?.forEach((a, i) => {
    eventos.push({
      id: `alergia-${i}`,
      type: 'alergia',
      title: `Alergia: ${a.sustancia}`,
      time: new Date(a.registradoEn).toLocaleDateString('es-AR'),
      description: `Severidad: ${a.severidad}`,
    })
  })

  // Estudios
  historia.estudios?.forEach((e, i) => {
    eventos.push({
      id: `estudio-${i}`,
      type: 'estudio',
      title: `Estudio: ${e.descripcion}`,
      time: new Date(e.fecha).toLocaleDateString('es-AR'),
      description: `Tipo: ${e.tipo} - Resultado: ${e.resultado || 'Pendiente'}`,
    })
  })

  // Prescripciones
  historia.prescripciones?.forEach((p, i) => {
    eventos.push({
      id: `prescripcion-${i}`,
      type: 'prescripcion',
      title: `Prescripción: ${p.medicamento}`,
      time: new Date(p.createdAt).toLocaleDateString('es-AR'),
      description: `${p.dosis} - Cada ${p.frecuenciaHoras}hrs x ${p.duracionDias} días - Estado: ${p.estado}`,
    })
  })

  // Evoluciones
  historia.evoluciones?.forEach((e, i) => {
    eventos.push({
      id: `evolucion-${i}`,
      type: 'evolucion',
      title: 'Evolución Clínica',
      time: new Date(e.registradoEn).toLocaleString('es-AR'),
      description: `${e.motivo} - ${e.diagnostico}`,
    })
  })

  return eventos.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
})
</script>

<template>
  <div class="historia-clinica-view">
    <div class="view-header">
      <div>
        <h2>Historia Clínica</h2>
        <p class="view-subtitle">Visión integral de la historia clínica del paciente</p>
      </div>
    </div>

    <Card class="context-card">
      <div class="context-field">
        <label>Paciente</label>
        <Select
          v-model="pacienteId"
          :options="admisionStore.pacientes.map(p => ({ value: p.id, label: `${p.apellido}, ${p.nombre} (${p.tipoDocumento} ${p.numeroDocumento})` }))"
          placeholder="Seleccionar paciente"
        />
      </div>
    </Card>

    <div v-if="pacienteId" class="hce-content">
      <!-- Tabs de navegación -->
      <div class="tabs-container">
        <div class="tabs" role="tablist">
          <button
            role="tab"
            :class="['tab', { active: activeTab === 'resumen' }]"
            @click="activeTab = 'resumen'"
            :aria-selected="activeTab === 'resumen'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Resumen
          </button>
          <button
            role="tab"
            :class="['tab', { active: activeTab === 'alergias' }]"
            @click="activeTab = 'alergias'"
            :aria-selected="activeTab === 'alergias'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Alergias
            <span v-if="hceStore.historiaActual?.alergias?.length" class="tab-badge">{{ hceStore.historiaActual.alergias.length }}</span>
          </button>
          <button
            role="tab"
            :class="['tab', { active: activeTab === 'estudios' }]"
            @click="activeTab = 'estudios'"
            :aria-selected="activeTab === 'estudios'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Estudios
            <span v-if="hceStore.historiaActual?.estudios?.length" class="tab-badge">{{ hceStore.historiaActual.estudios.length }}</span>
          </button>
          <button
            role="tab"
            :class="['tab', { active: activeTab === 'prescripciones' }]"
            @click="activeTab = 'prescripciones'"
            :aria-selected="activeTab === 'prescripciones'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><line x1="7" y1="19" x2="7" y2="12"></line><line x1="17" y1="19" x2="17" y2="12"></line><line x1="7" y1="12" x2="17" y2="12"></line></svg>
            Prescripciones
            <span v-if="hceStore.historiaActual?.prescripciones?.length" class="tab-badge">{{ hceStore.historiaActual.prescripciones.length }}</span>
          </button>
          <button
            role="tab"
            :class="['tab', { active: activeTab === 'timeline' }]"
            @click="activeTab = 'timeline'"
            :aria-selected="activeTab === 'timeline'"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="3" x2="12" y2="21"></line><circle cx="12" cy="12" r="3"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
            Línea de Tiempo
          </button>
        </div>
        <div class="tabs-indicator" :style="{ left: activeTab === 'resumen' ? '0%' : activeTab === 'alergias' ? '20%' : activeTab === 'estudios' ? '40%' : activeTab === 'prescripciones' ? '60%' : '80%' }"></div>
      </div>

      <!-- Contenido de tabs -->
      <div class="tab-panels">
        <!-- Resumen -->
        <div role="tabpanel" class="tab-panel" v-show="activeTab === 'resumen'">
          <div v-if="hceStore.historiaActual" class="resumen-grid">
            <Card class="info-card">
              <h3>Datos Generales</h3>
              <dl class="info-list">
                <div><dt>ID Historia</dt><dd>{{ hceStore.historiaActual.id }}</dd></div>
                <div><dt>Paciente ID</dt><dd>{{ hceStore.historiaActual.pacienteId }}</dd></div>
                <div><dt>Creada</dt><dd>{{ new Date(hceStore.historiaActual.createdAt).toLocaleDateString('es-AR') }}</dd></div>
              </dl>
            </Card>

            <Card class="info-card">
              <h3>Antecedentes Familiares</h3>
              <div class="antecedentes-text">
                <template v-if="hceStore.historiaActual.antecedentes.length > 0">
                  <div v-for="ant in hceStore.historiaActual.antecedentes" :key="ant.id" class="antecedente-item">
                    <strong>{{ ant.parentesco }}:</strong> {{ ant.condicion }} <em>({{ new Date(ant.registradoEn).toLocaleDateString('es-AR') }})</em>
                  </div>
                </template>
                <span v-else class="text-muted">Sin antecedentes registrados</span>
              </div>
            </Card>

            <Card class="info-card" v-if="hceStore.evoluciones.length > 0">
              <h3>Última Evolución</h3>
              <div class="evolucion-preview">
                <div class="evolucion-meta">
                  <span>{{ hceStore.evoluciones[0]?.registradoEn ? new Date(hceStore.evoluciones[0].registradoEn).toLocaleString('es-AR') : '-' }}</span>
                  <span>por Dr. {{ hceStore.evoluciones[0]?.medicoNombre ?? 'Desconocido' }}</span>
                </div>
                <p class="evolucion-texto">{{ hceStore.evoluciones[0]?.motivo }} - {{ hceStore.evoluciones[0]?.diagnostico }}</p>
              </div>
            </Card>

            <Card class="info-card">
              <h3>Estadísticas Rápidas</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-value">{{ hceStore.historiaActual?.alergias?.length ?? 0 }}</span>
                  <span class="stat-label">Alergias</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ hceStore.historiaActual?.estudios?.length ?? 0 }}</span>
                  <span class="stat-label">Estudios</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ hceStore.historiaActual?.prescripciones?.length ?? 0 }}</span>
                  <span class="stat-label">Prescripciones</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ hceStore.evoluciones?.length ?? 0 }}</span>
                  <span class="stat-label">Evoluciones</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <!-- Alergias -->
        <div role="tabpanel" class="tab-panel" v-show="activeTab === 'alergias'">
          <div v-if="hceStore.historiaActual">
            <div class="panel-header">
              <h3>Alergias Registradas</h3>
            </div>
            <Table
              :columns="alergiasColumns"
              :rows="hceStore.historiaActual.alergias || []"
              rowKey="id"
              :hoverable="true"
              :striped="true"
              emptyText="No hay alergias registradas para este paciente."
            >
              <template #cell-severidad="{ value }">
                <Badge :variant="getGravedadVariant(value as SeveridadAlergia)" size="sm">{{ value }}</Badge>
              </template>
            </Table>
          </div>
        </div>

        <!-- Estudios -->
        <div role="tabpanel" class="tab-panel" v-show="activeTab === 'estudios'">
          <div v-if="hceStore.historiaActual">
            <div class="panel-header">
              <h3>Estudios Solicitados</h3>
            </div>
            <Table
              :columns="estudiosColumns"
              :rows="hceStore.historiaActual.estudios || []"
              rowKey="id"
              :hoverable="true"
              :striped="true"
              emptyText="No hay estudios solicitados para este paciente."
            >
              <template #cell-tipo="{ value }">
                <Badge variant="info" size="sm">{{ value }}</Badge>
              </template>
            </Table>
          </div>
        </div>

        <!-- Prescripciones -->
        <div role="tabpanel" class="tab-panel" v-show="activeTab === 'prescripciones'">
          <div v-if="hceStore.historiaActual">
            <div class="panel-header">
              <h3>Prescripciones</h3>
            </div>
            <Table
              :columns="prescripcionesColumns"
              :rows="hceStore.historiaActual.prescripciones || []"
              rowKey="id"
              :hoverable="true"
              :striped="true"
              emptyText="No hay prescripciones registradas para este paciente."
            >
              <template #cell-estado="{ value }">
                <Badge :variant="getEstadoPrescripcionVariant(value as string)" size="sm">{{ value }}</Badge>
              </template>
              <template #cell-frecuenciaHoras="{ value }">
                {{ value }} hrs
              </template>
              <template #cell-duracionDias="{ value }">
                {{ value }} días
              </template>
            </Table>
          </div>
        </div>

        <!-- Línea de Tiempo -->
        <div role="tabpanel" class="tab-panel" v-show="activeTab === 'timeline'">
          <div v-if="hceStore.historiaActual" class="timeline">
            <div v-for="evento in timelineEventos" :key="evento.id" class="timeline-item">
              <div class="timeline-marker" :class="evento.type"></div>
              <div class="timeline-content">
                <div class="timeline-header">
                  <span class="timeline-title">{{ evento.title }}</span>
                  <span class="timeline-time">{{ evento.time }}</span>
                </div>
                <div class="timeline-body">{{ evento.description }}</div>
              </div>
            </div>
            <div v-if="timelineEventos.length === 0" class="empty-timeline">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="3" x2="12" y2="21"></line><circle cx="12" cy="12" r="3"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
              <p>No hay eventos en la línea de tiempo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
        <line x1="7" y1="19" x2="7" y2="12"></line>
        <line x1="17" y1="19" x2="17" y2="12"></line>
        <line x1="7" y1="12" x2="17" y2="12"></line>
      </svg>
      <h3>Seleccione un Paciente</h3>
      <p class="text-muted">Elija un paciente para ver su historia clínica completa.</p>
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

.tabs-container {
  position: relative;
  margin-bottom: var(--space-md);
  border-bottom: 2px solid var(--color-border);
}

.tabs {
  display: flex;
  gap: var(--space-xs);
  overflow-x: auto;
  padding-bottom: 2px;
}

.tab {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: none;
  border: none;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
  position: relative;
  z-index: 1;
}

.tab:hover {
  color: var(--color-text);
  background-color: var(--color-bg);
}

.tab.active {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.tab-badge {
  background-color: var(--color-primary);
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 9999px;
  min-width: 18px;
  text-align: center;
}

.tab.active .tab-badge {
  background-color: white;
  color: var(--color-primary);
}

.tabs-indicator {
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 20%;
  height: 2px;
  background-color: var(--color-primary);
  transition: left var(--transition-normal);
  z-index: 0;
}

.tab-panels {
  position: relative;
}

.tab-panel {
  display: none;
  animation: fadeIn 0.2s ease;
}

.tab-panel:first-child {
  display: block;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
}

.resumen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--space-md);
}

.info-card {
  background-color: var(--color-surface);
}

.info-card h3 {
  margin: 0 0 var(--space-md);
  font-size: 1rem;
  color: var(--color-text);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}

.info-list {
  display: grid;
  gap: var(--space-sm);
}

.info-list div {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.info-list dt {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-list dd {
  margin: 0;
  color: var(--color-text);
}

.antecedentes-text {
  line-height: 1.6;
  color: var(--color-text);
  white-space: pre-wrap;
}

.antecedente-item {
  padding: var(--space-xs) 0;
  border-bottom: 1px solid var(--color-border);
}

.antecedente-item:last-child {
  border-bottom: none;
}

.evolucion-preview {
  padding: var(--space-sm);
  background-color: var(--color-bg);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.evolucion-meta {
  display: flex;
  gap: var(--space-md);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
}

.evolucion-texto {
  margin: 0;
  line-height: 1.6;
  color: var(--color-text);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  text-align: center;
}

.stat-item {
  padding: var(--space-md);
  background-color: var(--color-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.timeline {
  position: relative;
  padding-left: var(--space-lg);
}

.timeline::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--color-border);
}

.timeline-item {
  position: relative;
  padding-bottom: var(--space-xl);
  display: flex;
  gap: var(--space-md);
}

.timeline-marker {
  position: absolute;
  left: -24px;
  top: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid var(--color-surface);
  z-index: 1;
  flex-shrink: 0;
}

.timeline-marker.hce { background-color: var(--color-primary); }
.timeline-marker.alergia { background-color: var(--color-warning); }
.timeline-marker.estudio { background-color: var(--color-info); }
.timeline-marker.prescripcion { background-color: var(--color-success); }
.timeline-marker.evolucion { background-color: var(--color-secondary); }

.timeline-content {
  flex: 1;
  padding: var(--space-md);
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.timeline-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-xs);
}

.timeline-title {
  font-weight: 600;
  color: var(--color-text);
}

.timeline-time {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.timeline-body {
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: var(--space-xs);
}

.empty-timeline {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-muted);
}

.empty-timeline p {
  margin: var(--space-sm) 0 0;
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