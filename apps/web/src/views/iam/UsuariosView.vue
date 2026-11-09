<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { Card, Button, Input, Table, Badge, type TableColumn } from '@/components/ui';
import type { UsuarioAutenticado, NombreRol } from '@/types/api';

const authStore = useAuthStore();
const toastStore = useToastStore();

const search = ref('');

const columns: TableColumn<UsuarioAutenticado>[] = [
  { key: 'id', label: 'ID', width: '80px', format: (v) => (v as string).slice(-8) },
  { key: 'nombre', label: 'Nombre' },
  { key: 'email', label: 'Email', width: '200px' },
  { key: 'rol', label: 'Rol', width: '140px' },
  { key: 'permisos', label: 'Permisos', width: '200px', format: (v) => (v as string[]).join(', ') },
];

const usuariosFiltrados = computed(() => {
  if (!search.value.trim()) return authStore.usuariosSistema;
  const s = search.value.toLowerCase();
  return authStore.usuariosSistema.filter(
    (u) =>
      u.nombre.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      u.rol.toLowerCase().includes(s),
  );
});

function getRolVariant(rol: NombreRol): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<NombreRol, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    ADMINISTRADOR: 'danger',
    MEDICO: 'primary',
    ENFERMERO: 'success',
    RECEPCIONISTA: 'warning',
    PACIENTE: 'info',
  };
  return variants[rol] ?? 'info';
}

async function cargarUsuarios() {
  try {
    await authStore.cargarUsuariosSistema();
  } catch (err) {
    toastStore.error('Error', 'No se pudieron cargar los usuarios');
  }
}

onMounted(() => {
  cargarUsuarios();
});
</script>

<template>
  <div class="usuarios-view">
    <div class="view-header">
      <div>
        <h2>Gestión de Usuarios</h2>
        <p class="view-subtitle">Listado de usuarios del sistema (solo lectura)</p>
      </div>
    </div>

    <Card class="search-card">
      <Input
        v-model="search"
        placeholder="Buscar por nombre, email o rol..."
        size="sm"
        class="search-input"
      >
        <template #prefix>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </template>
      </Input>
    </Card>

    <Card>
      <Table
        :columns="columns"
        :rows="usuariosFiltrados"
        rowKey="id"
        :hoverable="true"
        :striped="true"
        emptyText="No hay usuarios registrados."
      >
        <template #cell-rol="{ value }">
          <Badge :variant="getRolVariant(value as NombreRol)" size="sm">{{ value }}</Badge>
        </template>
        <template #cell-actions="{ row: _row }">
          <div class="action-buttons">
            <Button size="sm" variant="ghost" @click.stop="() => {}" title="Ver">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </Button>
          </div>
        </template>
      </Table>
    </Card>
  </div>
</template>

<style scoped>
.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
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

.search-card {
  margin-bottom: var(--space-md);
}

.search-input {
  width: 100%;
  max-width: 400px;
}

.action-buttons {
  display: flex;
  gap: var(--space-xs);
}

.text-muted {
  color: var(--color-text-muted);
}
</style>
