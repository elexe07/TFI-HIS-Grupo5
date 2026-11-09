<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useAdmisionStore } from '@/stores/admision';
import { useToastStore } from '@/stores/toast';
import { useRouter, useRoute } from 'vue-router';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import type { PacienteDTO } from '@/types/api';

const admisionStore = useAdmisionStore();
const toastStore = useToastStore();
const router = useRouter();
const route = useRoute();

const pacienteId = computed(() => route.params.id as string);
const paciente = ref<PacienteDTO | null>(null);
const cargando = ref(false);

async function cargarPaciente() {
  cargando.value = true;
  try {
    const data = await admisionStore.obtenerPaciente(pacienteId.value);
    paciente.value = data;
  } catch (err) {
    toastStore.error('Error', 'No se pudo cargar el paciente');
    await router.push({ name: 'admision.pacientes' });
  } finally {
    cargando.value = false;
  }
}

function editarPaciente() {
  router.push({ name: 'admision.paciente.editar', params: { id: pacienteId.value } });
}

function volver() {
  router.push({ name: 'admision.pacientes' });
}

function getDocVariant(tipo: string): 'primary' | 'success' | 'warning' | 'info' {
  const variants: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    DNI: 'primary',
    PASAPORTE: 'success',
    OTRO: 'warning',
  };
  return variants[tipo] ?? 'primary';
}

function getSexoLabel(sexo: string): string {
  const labels: Record<string, string> = { F: 'Femenino', M: 'Masculino', X: 'Otro' };
  return labels[sexo] ?? sexo;
}

onMounted(() => {
  cargarPaciente();
});

watch(
  () => route.params.id,
  () => {
    cargarPaciente();
  },
);
</script>

<template>
  <div class="paciente-detalle-view">
    <div v-if="cargando" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando paciente...</p>
    </div>

    <div v-else-if="paciente" class="paciente-detalle">
      <div class="view-header">
        <div class="header-actions">
          <Button variant="secondary" @click="volver">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Volver
          </Button>
          <Button variant="primary" @click="editarPaciente">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Editar
          </Button>
        </div>
        <div>
          <h2>{{ paciente.apellido }}, {{ paciente.nombre }}</h2>
          <p class="view-subtitle">{{ paciente.tipoDocumento }}: {{ paciente.numeroDocumento }}</p>
        </div>
      </div>

      <div class="detalle-grid">
        <Card>
          <template #header>
            <h3>Datos Personales</h3>
          </template>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Tipo de Documento</span>
              <span class="info-value"
                ><Badge :variant="getDocVariant(paciente.tipoDocumento)" size="sm">{{
                  paciente.tipoDocumento
                }}</Badge></span
              >
            </div>
            <div class="info-item">
              <span class="info-label">Número de Documento</span>
              <span class="info-value">{{ paciente.numeroDocumento }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Nombre completo</span>
              <span class="info-value">{{ paciente.apellido }}, {{ paciente.nombre }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Fecha de Nacimiento</span>
              <span class="info-value">{{
                new Date(paciente.fechaNacimiento).toLocaleDateString('es-AR')
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Sexo</span>
              <span class="info-value">{{ getSexoLabel(paciente.sexo) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Teléfono</span>
              <span class="info-value">{{ paciente.telefono || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">{{ paciente.email || '—' }}</span>
            </div>
          </div>
        </Card>

        <Card>
          <template #header>
            <h3>Cobertura Médica</h3>
          </template>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Obra Social</span>
              <span class="info-value">{{ paciente.obraSocialCodigo || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Número de Afiliado</span>
              <span class="info-value">{{ paciente.numeroAfiliado || '—' }}</span>
            </div>
          </div>
        </Card>

        <Card>
          <template #header>
            <h3>Accesos Rápidos</h3>
          </template>
          <div class="quick-actions">
            <router-link
              :to="{ name: 'hce.historia', params: { pacienteId: paciente.id } }"
              class="quick-action-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <span>Ver Historia Clínica</span>
            </router-link>
            <router-link
              :to="{ name: 'admision.turnos', query: { pacienteId: paciente.id } }"
              class="quick-action-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Gestionar Turnos</span>
            </router-link>
            <router-link
              :to="{ name: 'recursos.internaciones', query: { pacienteId: paciente.id } }"
              class="quick-action-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Ver Internaciones</span>
            </router-link>
            <router-link
              :to="{ name: 'facturacion.cuentas', query: { pacienteId: paciente.id } }"
              class="quick-action-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <span>Ver Cuentas</span>
            </router-link>
          </div>
        </Card>
      </div>
    </div>

    <div v-else class="empty-state">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <h3>Paciente no encontrado</h3>
      <p>El paciente solicitado no existe o ha sido eliminado.</p>
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
  to {
    transform: rotate(360deg);
  }
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

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--space-lg);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.info-value {
  font-size: 0.875rem;
  color: var(--color-text);
  word-break: break-word;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.quick-action-btn:hover {
  background-color: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateX(4px);
}

.quick-action-btn svg {
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.quick-action-btn:hover svg {
  color: var(--color-primary);
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
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
