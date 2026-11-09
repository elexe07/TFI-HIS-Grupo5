<script setup lang="ts">
import { computed, withDefaults } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { Permiso } from '@/types/api';

const route = useRoute();
const authStore = useAuthStore();

const props = withDefaults(
  defineProps<{
    title?: string;
  }>(),
  {
    title: 'Atención y Enfermería',
  },
);

// Icons - declared before use
const ClipboardIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
};
const HeartIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
};
const FileTextIcon = {
  template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
};

const tabs = computed(() => [
  {
    path: '/enfermeria',
    label: 'Indicaciones',
    icon: ClipboardIcon,
    permisos: ['enfermeria:indicaciones:leer'] as Permiso[],
  },
  {
    path: '/enfermeria/signos-vitales',
    label: 'Signos Vitales',
    icon: HeartIcon,
    permisos: ['enfermeria:signos:crear'] as Permiso[],
  },
  {
    path: '/enfermeria/notas',
    label: 'Notas',
    icon: FileTextIcon,
    permisos: ['enfermeria:notas:crear'] as Permiso[],
  },
]);

function isActiveTab(path: string): boolean {
  return route.path === path || (path !== '/enfermeria' && route.path.startsWith(path));
}
</script>

<template>
  <div class="module-layout">
    <div class="module-header">
      <div>
        <h1 class="module-title">{{ props.title }}</h1>
        <p class="module-subtitle">
          Control de indicaciones, signos vitales, administración de medicación y notas
        </p>
      </div>
    </div>

    <nav class="module-tabs" aria-label="Submódulos de Enfermería">
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
