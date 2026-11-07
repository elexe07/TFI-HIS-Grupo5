<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { Permiso } from '@/types/api'

const route = useRoute()
const authStore = useAuthStore()

defineProps<{
  title?: string
}>()

const tabs = computed(() => [
  { path: '/hce', label: 'Buscar Paciente', icon: SearchIcon, permisos: ['hce:leer'] as Permiso[] },
])

function isActiveTab(path: string): boolean {
  return route.path === path
}

// Icons
const SearchIcon = { template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>` }
</script>

<template>
  <div class="module-layout">
    <div class="module-header">
      <div>
        <h1 class="module-title">{{ title || 'Historia Clínica Electrónica' }}</h1>
        <p class="module-subtitle">Consulta y gestión de historias clínicas, evoluciones, prescripciones y estudios</p>
      </div>
    </div>

    <nav class="module-tabs" aria-label="Submódulos de HCE">
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