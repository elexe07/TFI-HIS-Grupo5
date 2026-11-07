<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useThemeStore } from '@/stores/theme'
import { Badge } from '@/components/ui'
import type { NombreRol, Permiso } from '@/types/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toastStore = useToastStore()
const themeStore = useThemeStore()

const sidebarOpen = ref(false)
const showUserMenu = ref(false)
const showThemeMenu = ref(false)

// Referencias para click outside
const headerRef = ref<HTMLElement | null>(null)

function closeMenus(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (headerRef.value && !headerRef.value.contains(target)) {
    showUserMenu.value = false
    showThemeMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeMenus)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenus)
})

async function handleLogout() {
  await authStore.logout()
  toastStore.success('Sesión cerrada', 'Hasta luego')
  await router.push({ name: 'login' })
}

function getRolLabel(rol: NombreRol): string {
  const labels: Record<NombreRol, string> = {
    ADMINISTRADOR: 'Administrador',
    MEDICO: 'Médico',
    ENFERMERO: 'Enfermero',
    RECEPCIONISTA: 'Recepcionista',
    PACIENTE: 'Paciente',
  }
  return labels[rol] ?? rol
}

function getRolColor(rol: NombreRol): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const colors: Record<NombreRol, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    ADMINISTRADOR: 'danger',
    MEDICO: 'primary',
    ENFERMERO: 'success',
    RECEPCIONISTA: 'warning',
    PACIENTE: 'info',
  }
  return colors[rol] ?? 'primary'
}

// Tema
function getThemeIcon(mode: 'light' | 'dark' | 'system'): any {
  const icons = {
    light: { template: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` },
    dark: { template: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>` },
    system: { template: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><path d="M8 21h8"></path><path d="M12 17v4"></path></svg>` },
  }
  return icons[mode]
}

const navItems = computed(() => [
  { path: '/', label: 'Dashboard', icon: HomeIcon },
  { path: '/admision', label: 'Admisión', icon: UsersIcon, permisos: ['pacientes:leer'] as Permiso[] },
  { path: '/hce', label: 'Historia Clínica', icon: FileTextIcon, permisos: ['hce:leer'] as Permiso[] },
  { path: '/enfermeria', label: 'Enfermería', icon: HeartIcon, permisos: ['enfermeria:indicaciones:leer'] as Permiso[] },
  { path: '/recursos', label: 'Recursos', icon: BuildingIcon, permisos: ['camas:leer'] as Permiso[] },
  { path: '/facturacion', label: 'Facturación', icon: DollarSignIcon, permisos: ['facturacion:leer'] as Permiso[] },
  { path: '/admin', label: 'Admin', icon: SettingsIcon, permisos: ['iam:usuarios:leer'] as Permiso[] },
].filter(item => !item.permisos || authStore.tieneCualquierPermiso(item.permisos)))

function isActiveRoute(path: string): boolean {
  return route.path.startsWith(path) && path !== '/'
}

// Icon components
const HomeIcon = { template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>` }
const UsersIcon = { template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>` }
const FileTextIcon = { template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>` }
const HeartIcon = { template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>` }
const BuildingIcon = { template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path></svg>` }
const DollarSignIcon = { template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>` }
const SettingsIcon = { template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>` }
</script>

<template>
  <header ref="headerRef" class="app-header" :class="{ 'sidebar-open': sidebarOpen }">
    <div class="header-left">
      <button
        type="button"
        class="header-toggle"
        @click="sidebarOpen = !sidebarOpen"
        aria-label="Toggle sidebar"
        :aria-expanded="sidebarOpen"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <router-link to="/" class="header-brand" aria-label="HIS - Inicio">
        <svg class="brand-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span class="brand-text">HIS</span>
      </router-link>
    </div>

    <nav class="header-nav" aria-label="Navegación principal">
      <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-link" :class="{ active: isActiveRoute(item.path) }">
        <component :is="item.icon" class="nav-icon" />
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="header-right">
      <!-- Theme Toggle -->
      <div class="theme-menu">
        <button
          type="button"
          class="theme-toggle"
          @click="showThemeMenu = !showThemeMenu"
          :aria-expanded="showThemeMenu"
          aria-haspopup="true"
          aria-label="Cambiar tema"
        >
          <component :is="getThemeIcon(themeStore.mode)" class="theme-icon" />
        </button>

        <Transition name="theme-menu">
          <div v-if="showThemeMenu" class="theme-dropdown" role="menu">
            <button
              type="button"
              class="theme-option"
              :class="{ active: themeStore.mode === 'light' }"
              role="menuitem"
              @click="themeStore.setMode('light'); showThemeMenu = false"
            >
              <component :is="getThemeIcon('light')" class="dropdown-icon" />
              <span>Claro</span>
              <svg v-if="themeStore.mode === 'light'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="check-icon">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
            <button
              type="button"
              class="theme-option"
              :class="{ active: themeStore.mode === 'dark' }"
              role="menuitem"
              @click="themeStore.setMode('dark'); showThemeMenu = false"
            >
              <component :is="getThemeIcon('dark')" class="dropdown-icon" />
              <span>Oscuro</span>
              <svg v-if="themeStore.mode === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="check-icon">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
            <button
              type="button"
              class="theme-option"
              :class="{ active: themeStore.mode === 'system' }"
              role="menuitem"
              @click="themeStore.setMode('system'); showThemeMenu = false"
            >
              <component :is="getThemeIcon('system')" class="dropdown-icon" />
              <span>Sistema</span>
              <svg v-if="themeStore.mode === 'system'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="check-icon">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
          </div>
        </Transition>
      </div>

      <div class="user-menu">
        <button type="button" class="user-avatar" @click="showUserMenu = !showUserMenu" :aria-expanded="showUserMenu" aria-haspopup="true">
          <span class="avatar-text">{{ authStore.usuario?.nombre?.charAt(0).toUpperCase() ?? 'U' }}</span>
        </button>

        <Transition name="user-menu">
          <div v-if="showUserMenu" class="user-dropdown" role="menu">
            <div class="user-info">
              <div class="user-name">{{ authStore.usuario?.nombre }}</div>
              <div class="user-email">{{ authStore.usuario?.email }}</div>
              <Badge :variant="getRolColor(authStore.rol!)" size="sm" class="user-rol">
                {{ getRolLabel(authStore.rol!) }}
              </Badge>
            </div>
            <hr class="dropdown-divider" />
            <router-link to="/perfil" class="dropdown-item" role="menuitem" @click="showUserMenu = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dropdown-icon">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Mi Perfil
            </router-link>
            <button type="button" class="dropdown-item dropdown-item-danger" role="menuitem" @click="handleLogout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="dropdown-icon">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-lg);
  z-index: 100;
  gap: var(--space-lg);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.header-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  color: var(--color-text);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.header-toggle:hover {
  background-color: var(--color-bg);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  text-decoration: none;
  color: var(--color-text);
}

.brand-icon {
  color: var(--color-primary);
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex: 1;
  justify-content: center;
  max-width: 800px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.nav-link:hover {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.nav-link.active {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.nav-icon {
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.user-menu {
  position: relative;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background-color: var(--color-primary);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: transform var(--transition-fast);
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + var(--space-sm));
  right: 0;
  min-width: 220px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-sm);
  z-index: 200;
  animation: fadeIn var(--transition-fast);
}

.user-info {
  padding: var(--space-sm);
}

.user-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-text);
}

.user-email {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: var(--space-xs);
}

.user-rol {
  margin-top: var(--space-sm);
}

.dropdown-divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: var(--space-sm) 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  text-align: left;
  text-decoration: none;
  transition: background-color var(--transition-fast);
}

.dropdown-item:hover {
  background-color: var(--color-bg);
}

.dropdown-item-danger {
  color: var(--color-danger);
}

.dropdown-item-danger:hover {
  background-color: var(--color-danger-light);
}

.dropdown-icon {
  flex-shrink: 0;
}

/* Theme Menu */
.theme-menu {
  position: relative;
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.theme-toggle:hover {
  background-color: var(--color-bg);
  color: var(--color-primary);
}

.theme-icon {
  flex-shrink: 0;
}

.theme-dropdown {
  position: absolute;
  top: calc(100% + var(--space-sm));
  right: 0;
  min-width: 140px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-xs);
  z-index: 200;
  animation: fadeIn var(--transition-fast);
}

.theme-option {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  text-align: left;
  transition: background-color var(--transition-fast);
}

.theme-option:hover {
  background-color: var(--color-bg);
}

.theme-option.active {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

.check-icon {
  margin-left: auto;
  flex-shrink: 0;
  color: var(--color-primary);
}

.theme-menu-enter-active,
.theme-menu-leave-active {
  transition: all var(--transition-fast);
}

.theme-menu-enter-from,
.theme-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.user-menu-enter-active,
.user-menu-leave-active {
  transition: all var(--transition-fast);
}

.user-menu-enter-from,
.user-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 1024px) {
  .header-toggle {
    display: flex;
  }

  .header-nav {
    position: fixed;
    top: var(--header-height);
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-surface);
    flex-direction: column;
    align-items: stretch;
    padding: var(--space-lg);
    gap: var(--space-sm);
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
    z-index: 99;
    overflow-y: auto;
  }

  .header-nav.open {
    transform: translateX(0);
  }

  .sidebar-open .header-nav {
    transform: translateX(0);
  }
}
</style>