<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useEnfermeriaStore } from '@/stores/enfermeria'
import { useAdmisionStore } from '@/stores/admision'
import { useToastStore } from '@/stores/toast'
import { Card, Button, Input, Badge, Select, Table, type TableColumn } from '@/components/ui'

const enfermeriaStore = useEnfermeriaStore()
const admisionStore = useAdmisionStore()
const toastStore = useToastStore()

const pacienteId = ref('')

const form = ref({
  temperatura: '',
  presionSistolica: '',
  presionDiastolica: '',
  frecuenciaCardiaca: '',
  saturacionO2: '',
})

const columns: TableColumn[] = [
  { key: 'registradoEn', label: 'Fecha y Hora', width: '180px', format: (value) => value ? new Date(value as string).toLocaleString('es-AR') : '-' },
  { key: 'temperatura', label: 'Temp. (°C)', width: '100px', format: (value) => value !== null ? `${value} °C` : '-' },
  { key: 'presionSistolica', label: 'PA (mmHg)', width: '130px', format: (_value, row) => row.presionSistolica && row.presionDiastolica ? `${row.presionSistolica}/${row.presionDiastolica}` : '-' },
  { key: 'frecuenciaCardiaca', label: 'FC (lpm)', width: '100px', format: (value) => value !== null ? `${value} lpm` : '-' },
  { key: 'saturacionO2', label: 'SpO₂ (%)', width: '100px', format: (value) => value !== null ? `${value}%` : '-' },
]

async function guardarSignos() {
  const data = {
    pacienteId: pacienteId.value,
    internacionId: undefined,
    temperatura: form.value.temperatura ? parseFloat(form.value.temperatura) : undefined,
    presionSistolica: form.value.presionSistolica ? parseInt(form.value.presionSistolica) : undefined,
    presionDiastolica: form.value.presionDiastolica ? parseInt(form.value.presionDiastolica) : undefined,
    frecuenciaCardiaca: form.value.frecuenciaCardiaca ? parseInt(form.value.frecuenciaCardiaca) : undefined,
    saturacionO2: form.value.saturacionO2 ? parseInt(form.value.saturacionO2) : undefined,
  }
  await enfermeriaStore.registrarSignosVitales(data)
  toastStore.success('Signos vitales guardados', 'Registrados correctamente')
  resetForm()
}

function resetForm() {
  form.value = {
    temperatura: '',
    presionSistolica: '',
    presionDiastolica: '',
    frecuenciaCardiaca: '',
    saturacionO2: '',
  }
}

function getUnidad(parametro: string): string {
  const unidades: Record<string, string> = {
    'Temperatura': '°C',
    'Presión Sistólica': 'mmHg',
    'Frecuencia Cardíaca': 'lpm',
    'SpO₂': '%',
  }
  return unidades[parametro] ?? ''
}

function getAlertaClass(alerta: any): 'danger' | 'warning' {
  if (alerta.mensaje.includes('Fiebre') || alerta.mensaje.includes('Taquicardia') || alerta.mensaje.includes('Hipertensión')) return 'danger'
  return 'warning'
}

watch(() => admisionStore.pacienteSeleccionado, (paciente) => {
  if (paciente) {
    pacienteId.value = paciente.id
    enfermeriaStore.setContexto(paciente.id)
    enfermeriaStore.cargarDatos()
  }
})

onMounted(() => {
  if (admisionStore.pacienteSeleccionado) {
    pacienteId.value = admisionStore.pacienteSeleccionado.id
    enfermeriaStore.setContexto(pacienteId.value)
    enfermeriaStore.cargarDatos()
  }
})
</script>

<template>
  <div class="signos-vitales-view">
    <div class="view-header">
      <div>
        <h2>Signos Vitales</h2>
        <p class="view-subtitle">Registro y monitoreo de signos vitales del paciente</p>
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

    <!-- Alertas -->
    <div v-if="enfermeriaStore.alertasSignosVitales.length" class="alertas-section">
      <h3>⚠️ Alertas Activas</h3>
      <div class="alertas-grid">
        <Card v-for="alerta in enfermeriaStore.alertasSignosVitales" :key="alerta.parametro" class="alerta-card" :class="`alerta-${getAlertaClass(alerta)}`" bordered>
          <div class="alerta-content">
            <div class="alerta-param">{{ alerta.parametro }}</div>
            <div class="alerta-valor">{{ alerta.valor }}{{ getUnidad(alerta.parametro) }}</div>
            <Badge :variant="getAlertaClass(alerta)">{{ alerta.mensaje }}</Badge>
          </div>
        </Card>
      </div>
    </div>

    <!-- Formulario de registro -->
    <Card class="form-card">
      <template #header>
        <h3>Registrar Signos Vitales</h3>
      </template>

      <form @submit.prevent="guardarSignos" class="signos-form">
        <div class="form-grid">
          <Input
            v-model="form.temperatura"
            label="Temperatura (°C)"
            type="number"
            :step="0.1"
            :min="30"
            :max="45"
            placeholder="36.6"
          />
          <Input
            v-model="form.presionSistolica"
            label="Presión Sistólica (mmHg)"
            type="number"
            min="1"
            max="300"
            placeholder="120"
          />
          <Input
            v-model="form.presionDiastolica"
            label="Presión Diastólica (mmHg)"
            type="number"
            min="1"
            max="200"
            placeholder="80"
          />
          <Input
            v-model="form.frecuenciaCardiaca"
            label="Frecuencia Cardíaca (lpm)"
            type="number"
            min="1"
            max="300"
            placeholder="72"
          />
          <Input
            v-model="form.saturacionO2"
            label="Saturación O₂ (%)"
            type="number"
            min="50"
            max="100"
            placeholder="98"
          />
        </div>

        <div class="form-actions">
          <Button variant="primary" type="submit" :loading="enfermeriaStore.cargando">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            Guardar Signos Vitales
          </Button>
        </div>
      </form>
    </Card>

    <!-- Historial -->
    <Card>
      <template #header>
        <h3>Historial de Signos Vitales</h3>
      </template>

      <Table
        :columns="columns"
        :rows="enfermeriaStore.signosVitales"
        rowKey="id"
        :hoverable="true"
        :striped="true"
        emptyText="No hay signos vitales registrados para este paciente."
      />
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

.alertas-section {
  margin-bottom: var(--space-md);
}

.alertas-section h3 {
  margin: 0 0 var(--space-md);
  font-size: 1rem;
  color: var(--color-warning);
}

.alertas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-md);
}

.alerta-card {
  text-align: center;
}

.alerta-danger {
  border-left: 4px solid var(--color-danger);
}

.alerta-warning {
  border-left: 4px solid var(--color-warning);
}

.alerta-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.alerta-param {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.alerta-valor {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
}

.form-card {
  margin-bottom: var(--space-md);
}

.signos-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}
</style>