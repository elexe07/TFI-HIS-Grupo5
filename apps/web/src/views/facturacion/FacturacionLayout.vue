<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { Permiso } from '@/types/api';

const route = useRoute();
const authStore = useAuthStore();

defineProps<{
  title?: string;
}>();

const tabs = computed(() => [
  {
    path: '/facturacion',
    label: 'Cuentas',
    icon: FileTextIcon,
    permisos: ['facturacion:leer'] as Permiso[],
  },
  {
    path: '/facturacion/cobertura',
    label: 'Validar Cobertura',
    icon: ShieldIcon,
    permisos: ['cobertura:validar'] as Permiso[],
  },
  {
    path: '/facturacion/reportes',
    label: 'Reportes',
    icon: BarChartIcon,
    permisos: ['reportes:leer'] as Permiso[],
  },
]);

function isActiveTab(path: string): boolean {
  return route.path === path || (path !== '/facturacion' && route.path.startsWith(path));
}

// Icons
const FileTextIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
};
const ShieldIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
};
const BarChartIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
};
</script>

<template>
  <div class="module-layout">
    <div class="module-header">
      <div>
        <h1 class="module-title">{{ title || 'Facturación y Administración' }}</h1>
        <p class="module-subtitle">
          Gestión de cuentas, validación de cobertura y reportes administrativos
        </p>
      </div>
    </div>

    <nav class="module-tabs" aria-label="Submódulos de Facturación">
      <template v-for="tab in tabs" :key="tab.path">
        <router-link
          v-if="!tab.permisos || authStore.tieneCualquierPermiso(tab.permisos)"
          :to="tab.path"
          class="module-tab"
          :class="{ active: isActiveTab(tab.path) }"
        >
          <component :is="tab.icon" class="tab-icon" aria-hidden="true" />
          {{ tab.label }}
        </router-link>
      </template>
    </nav>

    <div class="module-content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.module-layout {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.module-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.module-title {
  margin: 0;
  font-size: 1.5rem;
}

.module-subtitle {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
}

.module-tabs {
  display: flex;
  gap: var(--space-xs);
  padding: var(--space-xs);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow-x: auto;
  flex-wrap: wrap;
}

.module-tab {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.module-tab:hover {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.module-tab.active {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.module-content {
  flex: 1;
  min-height: 0;
}
</style>
