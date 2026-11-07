

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { Card } from '@/components/ui'
import { Badge } from '@/components/ui'

const authStore = useAuthStore()

function getRolColor(rol: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const colors: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    ADMINISTRADOR: 'danger',
    MEDICO: 'primary',
    ENFERMERO: 'success',
    RECEPCIONISTA: 'warning',
    PACIENTE: 'info',
  }
  return colors[rol] ?? 'primary'
}

function getRolLabel(rol: string): string {
  const labels: Record<string, string> = {
    ADMINISTRADOR: 'Administrador',
    MEDICO: 'Médico',
    ENFERMERO: 'Enfermero',
    RECEPCIONISTA: 'Recepcionista',
    PACIENTE: 'Paciente',
  }
  return labels[rol] ?? rol
}

function formatoPermiso(permiso: string): string {
  return permiso
    .split(':')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' / ')
}

function truncateToken(token: string | null): string {
  if (!token) return 'No disponible'
  if (token.length <= 20) return token
  return token.slice(0, 20) + '...'
}
</script>

<template>
  <div class="perfil-view">
    <div class="view-header">
      <h2>Mi Perfil</h2>
      <p class="view-subtitle">Información de tu cuenta y permisos</p>
    </div>

    <div class="perfil-grid">
      <Card class="perfil-card">
        <div class="perfil-avatar">
          {{ authStore.usuario?.nombre?.charAt(0).toUpperCase() ?? 'U' }}
        </div>
        <div class="perfil-info">
          <h3>{{ authStore.usuario?.nombre }}</h3>
          <p class="perfil-email">{{ authStore.usuario?.email }}</p>
          <Badge :variant="getRolColor(authStore.rol!)" size="lg">
            {{ getRolLabel(authStore.rol!) }}
          </Badge>
        </div>

        <div class="perfil-divider"></div>

        <div class="perfil-section">
          <h4>Permisos Asignados</h4>
          <div class="permisos-list">
            <Badge
              v-for="permiso in authStore.permisos"
              :key="permiso"
              variant="neutral"
              size="sm"
              class="permiso-badge"
            >
              {{ formatoPermiso(permiso) }}
            </Badge>
          </div>
        </div>
      </Card>

      <Card class="perfil-card">
        <h3>Información de Sesión</h3>
        <dl class="session-info">
          <div>
            <dt>ID de Usuario</dt>
            <dd>{{ authStore.usuario?.id }}</dd>
          </div>
          <div>
            <dt>Rol</dt>
            <dd>{{ getRolLabel(authStore.rol!) }}</dd>
          </div>
          <div>
            <dt>Token</dt>
            <dd class="token-display">{{ truncateToken(authStore.token) }}</dd>
          </div>
        </dl>
      </Card>
    </div>
  </div>
</template>



<style scoped>
.view-header {
  margin-bottom: var(--space-lg);
}

.view-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.view-subtitle {
  margin: var(--space-xs) 0 0;
  color: var(--color-text-secondary);
}

.perfil-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--space-lg);
}

.perfil-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.perfil-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 auto var(--space-md);
}

.perfil-info {
  text-align: center;
  margin-bottom: var(--space-md);
}

.perfil-info h3 {
  margin: 0 0 var(--space-xs);
  font-size: 1.25rem;
}

.perfil-email {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.perfil-divider {
  border-top: 1px solid var(--color-border);
  margin: var(--space-md) 0;
}

.perfil-section h4 {
  margin: 0 0 var(--space-md);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.permisos-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  justify-content: center;
}

.permiso-badge {
  font-size: 0.6875rem;
}

.session-info {
  display: grid;
  gap: var(--space-md);
}

.session-info div {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.session-info dt {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.session-info dd {
  margin: 0;
  font-family: monospace;
  font-size: 0.8125rem;
  color: var(--color-text);
  word-break: break-all;
}

.token-display {
  background-color: var(--color-bg);
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}
</style>