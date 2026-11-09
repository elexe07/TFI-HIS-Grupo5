<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { Badge } from '@/components/ui';
import type { NombreRol, Permiso } from '@/types/api';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const collapsed = ref(false);
const mobileOpen = ref(false);
const expandedSections = ref<string[]>([]);

// Icons
const HomeIcon = {
  template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
};
const UsersIcon = {
  template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
};
const FileTextIcon = {
  template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
};
const HeartIcon = {
  template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
};
const BuildingIcon = {
  template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path></svg>`,
};
const DollarSignIcon = {
  template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
};
const SettingsIcon = {
  template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
};

interface NavItem {
  path: string;
  label: string;
  icon?: any;
  permisos?: Permiso[];
  children?: { path: string; label: string }[];
  badge?: {
    variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    text: string;
  };
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections = computed<NavSection[]>(() =>
  [
    {
      label: 'Principal',
      items: [{ path: '/', label: 'Dashboard', icon: HomeIcon, permisos: [] }],
    },
    {
      label: 'Módulos Clínicos',
      items: [
        {
          path: '/admision',
          label: 'Admisión y Turnos',
          icon: UsersIcon,
          permisos: ['pacientes:leer'] as Permiso[],
          children: [
            { path: '/admision', label: 'Pacientes' },
            { path: '/admision/agenda', label: 'Agenda Médica' },
            { path: '/admision/turnos', label: 'Turnos' },
            { path: '/admision/triaje', label: 'Triaje y Guardia' },
          ],
        },
        {
          path: '/hce',
          label: 'Historia Clínica',
          icon: FileTextIcon,
          permisos: ['hce:leer'] as Permiso[],
          children: [
            { path: '/hce/paciente/:pacienteId', label: 'Ver Historia' },
            { path: '/hce/paciente/:pacienteId/evolucion/nueva', label: 'Nueva Evolución' },
          ],
        },
        {
          path: '/enfermeria',
          label: 'Enfermería',
          icon: HeartIcon,
          permisos: ['enfermeria:indicaciones:leer'] as Permiso[],
          children: [
            { path: '/enfermeria', label: 'Indicaciones' },
            { path: '/enfermeria/signos-vitales', label: 'Signos Vitales' },
            { path: '/enfermeria/notas', label: 'Notas' },
          ],
        },
      ],
    },
    {
      label: 'Operaciones',
      items: [
        {
          path: '/recursos',
          label: 'Recursos y Camas',
          icon: BuildingIcon,
          permisos: ['camas:leer'] as Permiso[],
          children: [
            { path: '/recursos', label: 'Mapa de Camas' },
            { path: '/recursos/internaciones', label: 'Internaciones' },
            { path: '/recursos/insumos', label: 'Insumos' },
          ],
        },
        {
          path: '/facturacion',
          label: 'Facturación',
          icon: DollarSignIcon,
          permisos: ['facturacion:leer'] as Permiso[],
          children: [
            { path: '/facturacion', label: 'Cuentas' },
            { path: '/facturacion/cobertura', label: 'Validar Cobertura' },
            { path: '/facturacion/reportes', label: 'Reportes' },
          ],
        },
      ],
    },
    {
      label: 'Administración',
      items: [
        {
          path: '/admin',
          label: 'Usuarios y Roles',
          icon: SettingsIcon,
          permisos: ['iam:usuarios:leer'] as Permiso[],
          children: [{ path: '/admin/usuarios', label: 'Usuarios' }],
        },
      ],
    },
  ].filter((section) =>
    section.items.some(
      (item) => !item.permisos?.length || authStore.tieneCualquierPermiso(item.permisos),
    ),
  ),
);

// Auto-expandir sección activa
watch(
  () => route.path,
  (newPath) => {
    for (const section of navSections.value) {
      for (const item of section.items) {
        if (item.children?.some((c) => newPath.startsWith(c.path.replace(':pacienteId', '')))) {
          if (!expandedSections.value.includes(item.path)) {
            expandedSections.value.push(item.path);
          }
        }
      }
    }
  },
  { immediate: true },
);

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path.replace(':pacienteId', ''));
}

function isSectionActive(item: NavItem): boolean {
  return item.children?.some((child) => isActive(child.path)) ?? false;
}

function toggleSection(path: string) {
  const idx = expandedSections.value.indexOf(path);
  if (idx === -1) {
    expandedSections.value.push(path);
  } else {
    expandedSections.value.splice(idx, 1);
  }
}

function navigate(path: string) {
  router.push(path);
  mobileOpen.value = false;
}

function getRolLabel(rol: NombreRol): string {
  const labels: Record<NombreRol, string> = {
    ADMINISTRADOR: 'Administrador',
    MEDICO: 'Médico',
    ENFERMERO: 'Enfermero',
    RECEPCIONISTA: 'Recepcionista',
    PACIENTE: 'Paciente',
  };
  return labels[rol] ?? rol;
}

function getRolColor(
  rol: NombreRol,
): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  const colors: Record<
    NombreRol,
    'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  > = {
    ADMINISTRADOR: 'danger',
    MEDICO: 'primary',
    ENFERMERO: 'success',
    RECEPCIONISTA: 'warning',
    PACIENTE: 'info',
  };
  return colors[rol] ?? 'primary';
}
</script>

<template>
  <aside
    class="app-sidebar"
    :class="{ collapsed: collapsed, 'mobile-open': mobileOpen }"
    :aria-label="collapsed ? 'Menú principal colapsado' : 'Menú principal'"
  >
    <div class="sidebar-header">
      <div v-if="!collapsed" class="sidebar-brand">
        <router-link to="/" class="brand-link" aria-label="HIS - Inicio">
          <svg
            class="brand-icon"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span class="brand-text">HIS</span>
        </router-link>
      </div>

      <button
        type="button"
        class="sidebar-toggle"
        @click="collapsed = !collapsed"
        :aria-label="collapsed ? 'Expandir menú' : 'Colapsar menú'"
        :aria-expanded="!collapsed"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline v-if="collapsed" points="9 18 15 12 9 6"></polyline>
          <polyline v-else points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav" aria-label="Navegación">
      <div v-for="section in navSections" :key="section.label" class="sidebar-section">
        <div v-if="!collapsed" class="sidebar-section-title">
          {{ section.label }}
        </div>

        <ul class="sidebar-list" role="list">
          <li v-for="item in section.items" :key="item.path" class="sidebar-item">
            <router-link
              v-if="!item.children"
              :to="item.path"
              class="sidebar-link"
              :class="{ active: isActive(item.path) }"
              @click="navigate(item.path)"
            >
              <component :is="item.icon" class="sidebar-icon" aria-hidden="true" />
              <span v-if="!collapsed" class="sidebar-label">{{ item.label }}</span>
              <Badge v-if="!collapsed && item.badge" :variant="item.badge.variant" size="sm">{{
                item.badge.text
              }}</Badge>
            </router-link>

            <button
              v-else
              type="button"
              class="sidebar-link sidebar-link-parent"
              :class="{
                active: isSectionActive(item),
                expanded: expandedSections.includes(item.path),
              }"
              @click="toggleSection(item.path)"
              :aria-expanded="expandedSections.includes(item.path)"
            >
              <component :is="item.icon" class="sidebar-icon" aria-hidden="true" />
              <span v-if="!collapsed" class="sidebar-label">{{ item.label }}</span>
              <svg
                v-if="!collapsed"
                class="sidebar-chevron"
                :class="{ rotated: expandedSections.includes(item.path) }"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <Transition v-if="!collapsed && item.children" name="sidebar-submenu">
              <ul v-show="expandedSections.includes(item.path)" class="sidebar-sublist" role="list">
                <li v-for="child in item.children" :key="child.path" class="sidebar-subitem">
                  <router-link
                    :to="child.path"
                    class="sidebar-sublink"
                    :class="{ active: isActive(child.path) }"
                    @click="navigate(child.path)"
                  >
                    <span class="sidebar-sublabel">{{ child.label }}</span>
                  </router-link>
                </li>
              </ul>
            </Transition>
          </li>
        </ul>
      </div>
    </nav>

    <div v-if="!collapsed" class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar-small">
          {{ authStore.usuario?.nombre?.charAt(0).toUpperCase() ?? 'U' }}
        </div>
        <div class="user-details">
          <div class="user-name">{{ authStore.usuario?.nombre }}</div>
          <Badge :variant="getRolColor(authStore.rol!)" size="sm">{{
            getRolLabel(authStore.rol!)
          }}</Badge>
        </div>
      </div>
    </div>
  </aside>

  <!-- Overlay para móvil -->
  <Transition name="sidebar-overlay">
    <div
      v-if="mobileOpen"
      class="sidebar-overlay"
      @click="mobileOpen = false"
      aria-hidden="true"
    ></div>
  </Transition>
</template>

<style scoped>
.app-sidebar {
  position: fixed;
  top: var(--header-height);
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  z-index: 90;
  transition:
    width var(--transition-normal),
    transform var(--transition-normal);
  overflow: hidden;
}

.app-sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--space-md);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.sidebar-brand {
  flex: 1;
  overflow: hidden;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  text-decoration: none;
  color: var(--color-text);
}

.brand-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.brand-text {
  font-size: 1.125rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  background-color: var(--color-bg);
  color: var(--color-primary);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md) var(--space-sm);
}

.sidebar-section {
  margin-bottom: var(--space-lg);
}

.sidebar-section-title {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  padding: 0 var(--space-sm) var(--space-xs);
  margin-bottom: var(--space-xs);
}

.sidebar-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-item {
  margin-bottom: var(--space-xs);
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.sidebar-link:hover {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.sidebar-link.active {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.sidebar-link-parent {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
}

.sidebar-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: currentColor;
}

.sidebar-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-chevron {
  margin-left: auto;
  flex-shrink: 0;
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
}

.sidebar-chevron.rotated {
  transform: rotate(90deg);
}

.sidebar-sublist {
  list-style: none;
  padding: var(--space-xs) 0 0 calc(var(--space-md) + 20px + var(--space-md));
  margin: 0;
  border-left: 2px solid var(--color-border);
}

.sidebar-subitem {
  margin-bottom: var(--space-xs);
}

.sidebar-sublink {
  display: block;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.8125rem;
  transition: all var(--transition-fast);
}

.sidebar-sublink:hover {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.sidebar-sublink.active {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  font-weight: 500;
}

.sidebar-sublabel {
  display: block;
}

.sidebar-footer {
  padding: var(--space-md);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.user-avatar-small {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: var(--color-primary);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Mobile */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 80;
  display: none;
}

.mobile-open {
  transform: translateX(0) !important;
}

@media (max-width: 1024px) {
  .app-sidebar {
    transform: translateX(-100%);
    width: var(--sidebar-width) !important;
  }

  .app-sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: var(--shadow-lg);
  }

  .sidebar-overlay {
    display: block;
  }
}

/* Animations */
.sidebar-submenu-enter-active,
.sidebar-submenu-leave-active {
  transition: all var(--transition-fast);
  overflow: hidden;
}

.sidebar-submenu-enter-from,
.sidebar-submenu-leave-to {
  max-height: 0;
  opacity: 0;
}

.sidebar-submenu-enter-to,
.sidebar-submenu-leave-from {
  max-height: 500px;
  opacity: 1;
}

.sidebar-overlay-enter-active,
.sidebar-overlay-leave-active {
  transition: opacity var(--transition-fast);
}

.sidebar-overlay-enter-from,
.sidebar-overlay-leave-to {
  opacity: 0;
}
</style>
