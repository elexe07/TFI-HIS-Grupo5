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
    path: '/recursos',
    label: 'Mapa de Camas',
    icon: BedIcon,
    permisos: ['camas:leer'] as Permiso[],
  },
  {
    path: '/recursos/internaciones',
    label: 'Internaciones',
    icon: UserPlusIcon,
    permisos: ['internaciones:gestionar'] as Permiso[],
  },
  {
    path: '/recursos/insumos',
    label: 'Insumos',
    icon: BoxIcon,
    permisos: ['insumos:gestionar'] as Permiso[],
  },
]);

function isActiveTab(path: string): boolean {
  return route.path === path || (path !== '/recursos' && route.path.startsWith(path));
}

// Icons
const BedIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4"></path><path d="M2 8h18"></path><path d="M2 16h18"></path></svg>`,
};
const UserPlusIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></path><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>`,
};
const BoxIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
};
</script>

<template>
  <div class="module-layout">
    <div class="module-header">
      <div>
        <h1 class="module-title">{{ title || 'Recursos y Camas' }}</h1>
        <p class="module-subtitle">
          Mapa de camas, gestión de internaciones e inventario de insumos
        </p>
      </div>
    </div>

    <nav class="module-tabs" aria-label="Submódulos de Recursos">
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
