<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useAuthStore } from '@/modules/iam/auth.store';
import { useAdmisionStore } from '@/modules/admision/admision.store';
import { useToastStore } from '@/shared/stores/toast';
import {
  Card,
  Button,
  Input,
  Select,
  Table,
  Badge,
  Modal,
  type TableColumn,
} from '@/shared/components/ui';
import type { CrearUsuarioRequest, NombreRol, UsuarioDTO } from '@/modules/iam/iam.types';

const authStore = useAuthStore();
const admisionStore = useAdmisionStore();
const toastStore = useToastStore();

const search = ref('');

const columns: TableColumn<UsuarioDTO>[] = [
  { key: 'id', label: 'ID', width: '80px', format: (v) => (v as string).slice(-8) },
  { key: 'nombre', label: 'Nombre' },
  { key: 'email', label: 'Email', width: '200px' },
  { key: 'rol', label: 'Rol', width: '140px' },
];

const ROLES: { value: NombreRol; label: string }[] = [
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'MEDICO', label: 'Médico' },
  { value: 'ENFERMERO', label: 'Enfermero' },
  { value: 'RECEPCIONISTA', label: 'Recepcionista' },
  { value: 'PACIENTE', label: 'Paciente' },
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
  } catch {
    toastStore.error('Error', 'No se pudieron cargar los usuarios');
  }
}

// --- Nuevo usuario ---
// El front solo exige que no falten campos. Las reglas (email válido, contraseña fuerte,
// email único) las valida el dominio en el backend y acá mostramos su mensaje tal cual.

const formularioVacio = (): CrearUsuarioRequest => ({
  nombre: '',
  email: '',
  password: '',
  rol: 'MEDICO',
});

const mostrarFormulario = ref(false);
const nuevoUsuario = ref<CrearUsuarioRequest>(formularioVacio());
const guardando = ref(false);
const errorFormulario = ref<string | null>(null);

// Un usuario PACIENTE tiene que quedar vinculado a su ficha de Admisión: así el portal sabe
// qué turnos y cuentas mostrarle. Solo se ofrecen fichas que todavía no tienen usuario.
const pacienteId = ref('');
const esPaciente = computed(() => nuevoUsuario.value.rol === 'PACIENTE');
const fichasSinUsuario = computed(() =>
  admisionStore.pacientes
    .filter((p) => !p.usuarioId)
    .map((p) => ({
      value: p.id,
      label: `${p.apellido}, ${p.nombre} (${p.tipoDocumento} ${p.numeroDocumento})`,
    })),
);
/** Si el usuario se creó pero el vínculo falló, el reintento solo vincula (no lo crea de nuevo). */
const usuarioSinVincular = ref<string | null>(null);

const formularioCompleto = computed(() => {
  const { nombre, email, password } = nuevoUsuario.value;
  const datosCompletos = nombre.trim() !== '' && email.trim() !== '' && password !== '';
  return datosCompletos && (!esPaciente.value || pacienteId.value !== '');
});

function abrirFormulario() {
  nuevoUsuario.value = formularioVacio();
  pacienteId.value = '';
  usuarioSinVincular.value = null;
  errorFormulario.value = null;
  mostrarFormulario.value = true;
  admisionStore.cargarPacientes().catch(() => {
    errorFormulario.value = 'No se pudieron cargar las fichas de pacientes';
  });
}

async function crearUsuario() {
  guardando.value = true;
  errorFormulario.value = null;
  try {
    let usuarioId = usuarioSinVincular.value;
    if (!usuarioId) {
      const creado = await authStore.crearUsuario({
        ...nuevoUsuario.value,
        nombre: nuevoUsuario.value.nombre.trim(),
        email: nuevoUsuario.value.email.trim(),
      });
      usuarioId = creado.id;
    }
    if (esPaciente.value) {
      usuarioSinVincular.value = usuarioId;
      await admisionStore.vincularUsuario(pacienteId.value, usuarioId);
      usuarioSinVincular.value = null;
    }
    toastStore.success(
      'Usuario creado',
      `${nuevoUsuario.value.nombre} (${nuevoUsuario.value.rol})`,
    );
    mostrarFormulario.value = false;
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : 'No se pudo crear el usuario';
    errorFormulario.value = usuarioSinVincular.value
      ? `El usuario se creó, pero no se pudo vincular a la ficha: ${mensaje}`
      : mensaje;
  } finally {
    guardando.value = false;
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
        <p class="view-subtitle">Usuarios del sistema y su rol</p>
      </div>
      <Button variant="primary" @click="abrirFormulario">+ Nuevo usuario</Button>
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
      </Table>
    </Card>
    <Modal v-model:modelValue="mostrarFormulario" title="Nuevo usuario" size="md" :closable="true">
      <form class="form-usuario" @submit.prevent="crearUsuario">
        <Input v-model="nuevoUsuario.nombre" label="Nombre y apellido" required :maxLength="100" />
        <Input
          v-model="nuevoUsuario.email"
          label="Email"
          type="email"
          placeholder="nombre@his.local"
          autocomplete="off"
          required
        />
        <Input
          v-model="nuevoUsuario.password"
          label="Contraseña"
          type="password"
          hint="Mínimo 8 caracteres, con al menos una letra y un número"
          autocomplete="new-password"
          required
        />
        <Select
          :model-value="nuevoUsuario.rol"
          @update:model-value="nuevoUsuario.rol = $event as NombreRol"
          label="Rol"
          :options="ROLES"
          :disabled="usuarioSinVincular !== null"
          required
        />
        <Select
          v-if="esPaciente"
          :model-value="pacienteId"
          @update:model-value="pacienteId = String($event ?? '')"
          label="Ficha de paciente"
          placeholder="Seleccionar paciente"
          :options="fichasSinUsuario"
          hint="Solo aparecen pacientes de Admisión que todavía no tienen usuario"
          required
        />
        <p v-if="errorFormulario" class="form-error" role="alert">{{ errorFormulario }}</p>
      </form>
      <template #footer>
        <Button variant="secondary" @click="mostrarFormulario = false">Cancelar</Button>
        <Button
          variant="primary"
          :loading="guardando"
          :disabled="!formularioCompleto"
          @click="crearUsuario"
          >{{ usuarioSinVincular ? 'Reintentar vínculo' : 'Crear usuario' }}</Button
        >
      </template>
    </Modal>
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

.form-usuario {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-error {
  margin: 0;
  color: var(--color-danger);
  font-size: 0.875rem;
}

.text-muted {
  color: var(--color-text-muted);
}
</style>
