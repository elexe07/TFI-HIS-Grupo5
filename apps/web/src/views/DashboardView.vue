<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useAdmisionStore } from '@/stores/admision';
import { useEnfermeriaStore } from '@/stores/enfermeria';
import { useRecursosStore } from '@/stores/recursos';
import { useFacturacionStore } from '@/stores/facturacion';
import { Card, Badge } from '@/components/ui';

const authStore = useAuthStore();
const admisionStore = useAdmisionStore();
const enfermeriaStore = useEnfermeriaStore();
const recursosStore = useRecursosStore();
const facturacionStore = useFacturacionStore();
const router = useRouter();

// Icons - declared before use
const UsersIcon = {
  template: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
};
const CalendarIcon = {
  template: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
};
const BedIcon = {
  template: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4"></path><path d="M2 8h18"></path><path d="M2 16h18"></path></svg>`,
};
const UserPlusIcon = {
  template: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></path><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>`,
};
const ClipboardIcon = {
  template: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
};
const DollarSignIcon = {
  template: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
};
const FilePlusIcon = {
  template: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>`,
};
const HeartIcon = {
  template: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
};
const ShieldIcon = {
  template: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
};

interface StatItem {
  label: string;
  value: number;
  icon: { template: string };
  color: string;
  path: string;
}

const stats = ref<StatItem[]>([
  {
    label: 'Pacientes Registrados',
    value: 0,
    icon: UsersIcon,
    color: 'primary',
    path: '/admision',
  },
  { label: 'Turnos Hoy', value: 0, icon: CalendarIcon, color: 'info', path: '/admision/turnos' },
  { label: 'Camas Ocupadas', value: 0, icon: BedIcon, color: 'warning', path: '/recursos' },
  {
    label: 'Internaciones Activas',
    value: 0,
    icon: UserPlusIcon,
    color: 'success',
    path: '/recursos/internaciones',
  },
  {
    label: 'Indicaciones Pendientes',
    value: 0,
    icon: ClipboardIcon,
    color: 'danger',
    path: '/enfermeria',
  },
  {
    label: 'Cuentas Abiertas',
    value: 0,
    icon: DollarSignIcon,
    color: 'primary',
    path: '/facturacion',
  },
]);

const quickActions = computed(() => {
  const actions: { label: string; icon: { template: string }; path: string }[] = [];
  if (authStore.tienePermiso('pacientes:registrar'))
    actions.push({
      label: 'Nuevo Paciente',
      icon: UserPlusIcon,
      path: '/admision/pacientes/nuevo',
    });
  if (authStore.tienePermiso('turnos:reservar'))
    actions.push({ label: 'Reservar Turno', icon: CalendarIcon, path: '/admision/turnos' });
  if (authStore.tienePermiso('hce:escribir'))
    actions.push({ label: 'Nueva Evolución', icon: FilePlusIcon, path: '/hce' });
  if (authStore.tienePermiso('enfermeria:signos:crear'))
    actions.push({
      label: 'Registrar Signos',
      icon: HeartIcon,
      path: '/enfermeria/signos-vitales',
    });
  if (authStore.tienePermiso('internaciones:gestionar'))
    actions.push({ label: 'Internar Paciente', icon: BedIcon, path: '/recursos/internaciones' });
  if (authStore.tienePermiso('cobertura:validar'))
    actions.push({ label: 'Validar Cobertura', icon: ShieldIcon, path: '/facturacion/cobertura' });
  return actions;
});

async function cargarDashboard() {
  try {
    await Promise.all([
      admisionStore.cargarPacientes(),
      admisionStore.cargarTurnos({ fechaDesde: new Date().toISOString().split('T')[0] }),
      recursosStore.cargarMapaCamas(),
      recursosStore.cargarInternaciones({ estado: 'ACTIVA' }),
      enfermeriaStore.setContexto(''),
      facturacionStore.cargarCuentas(),
    ]);

    if (stats.value[0]) stats.value[0].value = admisionStore.pacientes.length;
    if (stats.value[1]) stats.value[1].value = admisionStore.turnosHoy.length;
    if (stats.value[2]) stats.value[2].value = recursosStore.camasOcupadas.length;
    if (stats.value[3]) stats.value[3].value = recursosStore.internacionesActivas.length;
    if (stats.value[4]) stats.value[4].value = enfermeriaStore.indicacionesPendientes.length;
    if (stats.value[5]) stats.value[5].value = facturacionStore.cuentasAbiertas.length;
  } catch (err) {
    console.error('Error cargando dashboard:', err);
  }
}

function getRolLabel(rol: string): string {
  const labels: Record<string, string> = {
    ADMINISTRADOR: 'Administrador',
    MEDICO: 'Médico',
    ENFERMERO: 'Enfermero',
    RECEPCIONISTA: 'Recepcionista',
    PACIENTE: 'Paciente',
  };
  return labels[rol] ?? rol;
}

function navigate(path: string) {
  router.push(path);
}

onMounted(() => {
  cargarDashboard();
});
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p>Bienvenido, {{ authStore.nombreCompleto }} · {{ getRolLabel(authStore.rol!) }}</p>
    </div>

    <div class="stats-grid">
      <Card
        v-for="stat in stats"
        :key="stat.label"
        class="stat-card"
        hoverable
        @click="navigate(stat.path)"
      >
        <div class="stat-icon" :class="`stat-icon-${stat.color}`">
          <component :is="stat.icon" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </Card>
    </div>

    <!-- Accesos rápidos por rol -->
    <div v-if="quickActions.length" class="quick-actions">
      <h2>Accesos Rápidos</h2>
      <div class="actions-grid">
        <Card
          v-for="action in quickActions"
          :key="action.label"
          class="action-card"
          hoverable
          @click="navigate(action.path)"
        >
          <component :is="action.icon" class="action-icon" />
          <div class="action-label">{{ action.label }}</div>
        </Card>
      </div>
    </div>

    <!-- Alertas de enfermería si es enfermero -->
    <div
      v-if="authStore.esEnfermero && enfermeriaStore.alertasSignosVitales.length"
      class="alerts-section"
    >
      <h2>⚠️ Alertas de Signos Vitales</h2>
      <div class="alerts-list">
        <Card
          v-for="alerta in enfermeriaStore.alertasSignosVitales"
          :key="alerta.parametro"
          class="alert-card"
          bordered
        >
          <div class="alert-content">
            <div class="alert-param">{{ alerta.parametro }}</div>
            <div class="alert-value">{{ alerta.valor }}</div>
            <Badge
              :variant="
                alerta.mensaje.includes('Fiebre') ||
                alerta.mensaje.includes('Taquicardia') ||
                alerta.mensaje.includes('Hipertensión')
                  ? 'danger'
                  : 'warning'
              "
            >
              {{ alerta.mensaje }}
            </Badge>
          </div>
        </Card>
      </div>
    </div>

    <!-- Insumos bajos si es admin -->
    <div v-if="authStore.esAdmin && recursosStore.insumosBajoMinimo.length" class="alerts-section">
      <h2>📦 Insumos Bajo Mínimo</h2>
      <div class="alerts-list">
        <Card
          v-for="insumo in recursosStore.insumosBajoMinimo.slice(0, 5)"
          :key="insumo.id"
          class="alert-card"
          bordered
        >
          <div class="alert-content">
            <div class="alert-param">{{ insumo.nombre }}</div>
            <div class="alert-value">
              Stock: {{ insumo.stockActual }} / Mín: {{ insumo.stockMinimo }}
            </div>
            <Badge variant="warning">Reponer</Badge>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.dashboard-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.dashboard-header h1 {
  margin: 0;
  font-size: 2rem;
}

.dashboard-header p {
  margin: 0;
  color: var(--color-text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-md);
}

.stat-card {
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  color: white;
}

.stat-icon-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
}
.stat-icon-success {
  background: linear-gradient(135deg, var(--color-success), #047857);
}
.stat-icon-warning {
  background: linear-gradient(135deg, var(--color-warning), #b45309);
}
.stat-icon-danger {
  background: linear-gradient(135deg, var(--color-danger), #b91c1c);
}
.stat-icon-info {
  background: linear-gradient(135deg, var(--color-info), #0e7490);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.quick-actions h2 {
  margin: 0;
  font-size: 1.25rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--space-md);
}

.action-card {
  cursor: pointer;
  text-align: center;
  padding: var(--space-lg) var(--space-md);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-icon {
  width: 40px;
  height: 40px;
  margin: 0 auto var(--space-sm);
  color: var(--color-primary);
}

.action-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.alerts-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.alerts-section h2 {
  margin: 0;
  font-size: 1.25rem;
}

.alerts-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-md);
}

.alert-card {
  border-left: 4px solid var(--color-warning);
}

.alert-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.alert-param {
  font-weight: 600;
  color: var(--color-text);
}

.alert-value {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}
</style>
