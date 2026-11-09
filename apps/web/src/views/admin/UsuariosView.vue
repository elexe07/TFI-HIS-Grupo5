<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { Button, Input, Card, Table, Badge, Select } from '@/components/ui';
import type { TableColumn } from '@/components/ui/Table.types';

const authStore = useAuthStore();
const toastStore = useToastStore();

const searchTerm = ref('');
const rolFiltro = ref('');

const columns: TableColumn[] = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'email', label: 'Email', width: '200px' },
  { key: 'nombre', label: 'Nombre Completo' },
  { key: 'rol', label: 'Rol', width: '140px' },
  { key: 'permisos', label: 'Permisos', width: '300px' },
];

const rolesOptions = [
  { value: '', label: 'Todos' },
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'MEDICO', label: 'Médico' },
  { value: 'ENFERMERO', label: 'Enfermero' },
  { value: 'RECEPCIONISTA', label: 'Recepcionista' },
  { value: 'PACIENTE', label: 'Paciente' },
];

const usuariosFiltrados = computed(() => {
  return authStore.usuariosSistema.filter((u) => {
    if (
      searchTerm.value &&
      !u.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) &&
      !u.email.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
      return false;
    if (rolFiltro.value && u.rol !== rolFiltro.value) return false;
    return true;
  });
});

async function cargarUsuarios() {
  try {
    await authStore.cargarUsuariosSistema();
  } catch (err) {
    toastStore.error('Error', 'No se pudieron cargar los usuarios');
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

function getRolVariant(rol: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const variants: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    ADMINISTRADOR: 'danger',
    MEDICO: 'primary',
    ENFERMERO: 'success',
    RECEPCIONISTA: 'warning',
    PACIENTE: 'info',
  };
  return variants[rol] ?? 'primary';
}

function limpiarFiltros() {
  searchTerm.value = '';
  rolFiltro.value = '';
  cargarUsuarios();
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
        <p class="view-subtitle">Visualización de usuarios y roles del sistema</p>
      </div>
    </div>

    <Card class="search-card">
      <div class="search-form">
        <Input v-model="searchTerm" label="Buscar" placeholder="Nombre o email..." size="sm" />
        <Select v-model="rolFiltro" label="Rol" :options="rolesOptions" size="sm" />
        <Button variant="ghost" @click="limpiarFiltros"> Limpiar </Button>
      </div>
    </Card>

    <Card>
      <Table
        :columns="columns"
        :rows="usuariosFiltrados"
        rowKey="id"
        :hoverable="true"
        :striped="true"
        emptyText="No se encontraron usuarios con los filtros aplicados."
      >
        <template #cell-rol="{ value }">
          <Badge :variant="getRolVariant(value as string)" size="sm">{{
            getRolLabel(value as string)
          }}</Badge>
        </template>
        <template #cell-permisos="{ value }">
          <span class="text-muted text-xs">{{
            (value as string[])?.join(', ') || 'Sin permisos'
          }}</span>
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

.search-form {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
  align-items: flex-end;
}

.text-muted {
  color: var(--color-text-muted);
}

.text-xs {
  font-size: 0.75rem;
}
</style>
