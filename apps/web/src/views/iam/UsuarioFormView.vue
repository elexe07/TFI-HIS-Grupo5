<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { Card, Button, Input, Table, Badge, type TableColumn } from '@/components/ui';
import type { UsuarioAutenticado, NombreRol } from '@/types/api';

const authStore = useAuthStore();
const toastStore = useToastStore();

const search = ref('');
const showForm = ref(false);
const editingUsuario = ref<UsuarioAutenticado | null>(null);

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

function abrirFormularioNuevo() {
  editingUsuario.value = null;
  showForm.value = true;
}

function editarUsuario(usuario: UsuarioAutenticado) {
  editingUsuario.value = usuario;
  showForm.value = true;
}

function volverAlListado() {
  showForm.value = false;
  editingUsuario.value = null;
}

onMounted(() => {
  cargarUsuarios();
});
</script>

<template>
  <div class="usuario-form-view">
    <div class="view-header">
      <div>
        <h2>Gestión de Usuarios</h2>
        <p class="view-subtitle">Listado de usuarios del sistema (solo lectura)</p>
      </div>
      <Button variant="primary" @click="abrirFormularioNuevo" v-show="!showForm">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Nuevo Usuario
      </Button>
    </div>

    <div v-if="!showForm" class="list-view">
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
          <template #cell-actions="{ row }">
            <div class="action-buttons">
              <Button
                size="sm"
                variant="ghost"
                @click.stop="editarUsuario(row as unknown as UsuarioAutenticado)"
                title="Ver/Editar"
              >
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

    <div v-else class="form-view">
      <div class="view-header">
        <div class="header-actions">
          <Button variant="secondary" @click="volverAlListado">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Volver
          </Button>
        </div>
        <div>
          <h2>{{ editingUsuario ? 'Ver Usuario' : 'Nuevo Usuario' }}</h2>
          <p class="view-subtitle">
            {{
              editingUsuario
                ? 'Detalles del usuario (solo lectura)'
                : 'La creación de usuarios requiere endpoint de API no disponible'
            }}
          </p>
        </div>
      </div>

      <Card>
        <template #header>
          <h3>Datos del Usuario</h3>
        </template>

        <div v-if="editingUsuario" class="form-grid">
          <div class="form-row">
            <div class="form-field">
              <label class="label">ID</label>
              <input class="input" :value="editingUsuario.id" readonly />
            </div>
            <div class="form-field">
              <label class="label">Nombre</label>
              <input class="input" :value="editingUsuario.nombre" readonly />
            </div>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label class="label">Email</label>
              <input class="input" :value="editingUsuario.email" readonly type="email" />
            </div>
            <div class="form-field">
              <label class="label">Rol</label>
              <Badge :variant="getRolVariant(editingUsuario.rol)" size="md">{{
                editingUsuario.rol
              }}</Badge>
            </div>
          </div>
          <div class="form-field">
            <label class="label">Permisos</label>
            <div class="permisos-list">
              <span v-for="p in editingUsuario.permisos" :key="p" class="permiso-tag">{{ p }}</span>
              <span v-if="!editingUsuario.permisos.length" class="text-muted"
                >Sin permisos asignados</span
              >
            </div>
          </div>
        </div>

        <div v-else class="empty-form">
          <p>
            La funcionalidad de crear usuarios requiere un endpoint POST /api/usuarios en el
            backend.
          </p>
          <p class="text-muted">
            Actualmente el store solo expone listado de usuarios (GET /api/usuarios).
          </p>
        </div>
      </Card>

      <div class="form-actions">
        <Button variant="secondary" @click="volverAlListado">Volver al listado</Button>
      </div>
    </div>
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

.header-actions {
  flex-shrink: 0;
}

.search-card {
  margin-bottom: var(--space-md);
}

.search-input {
  width: 100%;
  max-width: 400px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.input {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.875rem;
}

.permisos-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.permiso-tag {
  font-size: 0.7rem;
  padding: 2px 8px;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 9999px;
}

.empty-form {
  padding: var(--space-xl);
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-form p:first-child {
  margin-bottom: var(--space-sm);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.action-buttons {
  display: flex;
  gap: var(--space-xs);
}

.text-muted {
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
