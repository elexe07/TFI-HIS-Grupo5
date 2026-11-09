<script setup lang="ts">
import { computed, withDefaults } from 'vue';
import { useRoute, RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { Permiso } from '@/types/api';

const route = useRoute();
const authStore = useAuthStore();

const props = withDefaults(
  defineProps<{
    title?: string;
  }>(),
  {
    title: 'Admisión y Turnos',
  },
);

const tabs = computed(() => [
  {
    path: '/admision',
    label: 'Pacientes',
    icon: UsersIcon,
    permisos: ['pacientes:leer'] as Permiso[],
  },
  {
    path: '/admision/agenda',
    label: 'Agenda Médica',
    icon: CalendarIcon,
    permisos: ['agenda:definir'] as Permiso[],
  },
  {
    path: '/admision/turnos',
    label: 'Turnos',
    icon: ClockIcon,
    permisos: ['turnos:reservar'] as Permiso[],
  },
  {
    path: '/admision/triaje',
    label: 'Triaje y Guardia',
    icon: AlertIcon,
    permisos: ['triaje:registrar', 'guardia:leer'] as Permiso[],
  },
]);

function isActiveTab(path: string): boolean {
  return route.path === path || (path !== '/admision' && route.path.startsWith(path));
}

// Icons
const UsersIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
};
const CalendarIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
};
const ClockIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
};
const AlertIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
};
</script>

<template>
  <div class="module-layout">
    <div class="module-header">
      <div>
        <h1 class="module-title">{{ props.title }}</h1>
        <p class="module-subtitle">Gestión de pacientes, agenda médica, turnos y triaje</p>
      </div>
      <div class="module-actions">
        <slot name="actions" />
      </div>
    </div>

    <nav class="module-tabs" aria-label="Navegación del módulo">
      <ul class="tabs-list" role="tablist">
        <li v-for="tab in tabs" :key="tab.path" role="presentation">
          <router-link
            v-if="authStore.tieneCualquierPermiso(tab.permisos)"
            :to="tab.path"
            class="tab-link"
            :class="{ active: isActiveTab(tab.path) }"
            role="tab"
            :aria-selected="isActiveTab(tab.path)"
          >
            <component :is="tab.icon" class="tab-icon" aria-hidden="true" />
            <span>{{ tab.label }}</span>
          </router-link>
        </li>
      </ul>
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
  height: 100%;
  min-height: calc(100vh - var(--header-height));
}

.module-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-xl);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface);
  flex-wrap: wrap;
}

.module-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
}

.module-subtitle {
  margin: var(--space-xs) 0 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.module-actions {
  display: flex;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.module-tabs {
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  padding: 0 var(--space-xl);
}

.tabs-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--space-xs);
  overflow-x: auto;
}

.tab-link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  border-bottom: 3px solid transparent;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.tab-link:hover {
  color: var(--color-primary);
  background-color: var(--color-surface);
}

.tab-link.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.tab-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: currentColor;
}

.module-content {
  flex: 1;
  padding: var(--space-xl);
  overflow: auto;
}
</style>
