<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useEnfermeriaStore } from '@/stores/enfermeria';
import { useAdmisionStore } from '@/stores/admision';
import { useToastStore } from '@/stores/toast';
import { useAuthStore } from '@/stores/auth';
import { Card, Button, Select } from '@/components/ui';

const enfermeriaStore = useEnfermeriaStore();
const admisionStore = useAdmisionStore();
const authStore = useAuthStore();
const toastStore = useToastStore();

const pacienteId = ref('');
const notaTexto = ref('');

function obtenerNombreUsuario(userId: string) {
  if (authStore.usuario?.id === userId) {
    return authStore.usuario.nombre;
  }
  const u = authStore.usuariosSistema.find((user) => user.id === userId);
  return u ? u.nombre : userId;
}

function cambiarPaciente(val: string | number | null) {
  const id = val ? String(val) : '';
  pacienteId.value = id;
  if (id) {
    enfermeriaStore.setContexto(id);
    enfermeriaStore.cargarDatos();
  }
}

async function guardarNota() {
  if (!notaTexto.value.trim() || !pacienteId.value) return;
  try {
    await enfermeriaStore.crearNota({
      pacienteId: pacienteId.value,
      internacionId: undefined,
      texto: notaTexto.value.trim(),
    });
    toastStore.success('Nota guardada', 'Nota de enfermería registrada');
    notaTexto.value = '';
  } catch (err: any) {
    toastStore.error('Error', err?.message || 'Error al guardar la nota');
  }
}

watch(
  () => admisionStore.pacienteSeleccionado,
  (paciente) => {
    if (paciente) {
      pacienteId.value = paciente.id;
      enfermeriaStore.setContexto(paciente.id);
      enfermeriaStore.cargarDatos();
    }
  },
);

onMounted(async () => {
  if (
    authStore.usuariosSistema.length === 0 &&
    (authStore.esAdmin || authStore.tienePermiso('iam:usuarios:leer'))
  ) {
    authStore.cargarUsuariosSistema().catch(() => {});
  }
  if (admisionStore.pacientes.length === 0) {
    await admisionStore.cargarPacientes();
  }
  if (admisionStore.pacienteSeleccionado) {
    pacienteId.value = admisionStore.pacienteSeleccionado.id;
    enfermeriaStore.setContexto(pacienteId.value);
    enfermeriaStore.cargarDatos();
  }
});
</script>

<template>
  <div class="notas-view">
    <div class="view-header">
      <div>
        <h2>Notas de Enfermería</h2>
        <p class="view-subtitle">Registro de evolución y observaciones de enfermería</p>
      </div>
    </div>

    <Card class="context-card">
      <div class="context-field">
        <label>Paciente</label>
        <Select
          :model-value="pacienteId"
          @update:model-value="cambiarPaciente"
          :options="
            admisionStore.pacientes.map((p) => ({
              value: p.id,
              label: `${p.apellido}, ${p.nombre} (${p.tipoDocumento} ${p.numeroDocumento})`,
            }))
          "
          placeholder="Seleccionar paciente"
        />
      </div>
    </Card>

    <!-- Nueva nota -->
    <Card class="form-card">
      <template #header>
        <h3>Nueva Nota de Enfermería</h3>
      </template>

      <form @submit.prevent="guardarNota" class="nota-form">
        <div class="form-field">
          <label class="label">Texto de la nota</label>
          <textarea
            v-model="notaTexto"
            class="textarea-input"
            rows="4"
            placeholder="Detallar evolución, cuidados aplicados, respuesta del paciente, observaciones..."
            required
          ></textarea>
        </div>

        <div class="form-actions">
          <Button
            variant="primary"
            type="submit"
            :loading="enfermeriaStore.cargando"
            :disabled="!notaTexto.trim()"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Guardar Nota
          </Button>
        </div>
      </form>
    </Card>

    <!-- Historial de notas -->
    <Card>
      <template #header>
        <h3>Historial de Notas</h3>
      </template>

      <div v-if="enfermeriaStore.notas.length === 0" class="empty-state">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          class="empty-icon"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
        <p>No hay notas registradas para este paciente.</p>
        <p class="text-muted">Seleccione un paciente y agregue la primera nota.</p>
      </div>

      <div v-else class="notas-list">
        <div v-for="nota in enfermeriaStore.notas" :key="nota.id" class="nota-item">
          <div class="nota-header">
            <div class="nota-meta">
              <span class="nota-fecha">{{
                new Date(nota.registradoEn).toLocaleString('es-AR', {
                  hour12: false,
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}</span>
              <span class="nota-usuario">por {{ obtenerNombreUsuario(nota.registradoPor) }}</span>
            </div>
          </div>
          <div class="nota-texto">{{ nota.texto }}</div>
        </div>
      </div>
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

.context-card {
  margin-bottom: var(--space-md);
}

.context-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.context-field label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-card {
  margin-bottom: var(--space-md);
}

.nota-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-field .label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.textarea-input {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--color-text);
  background-color: var(--color-surface);
  resize: vertical;
  box-sizing: border-box;
}

.textarea-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2xl);
  text-align: center;
  color: var(--color-text-muted);
}

.empty-icon {
  margin-bottom: var(--space-md);
  opacity: 0.5;
}

.empty-state p {
  margin: var(--space-xs) 0;
}

.notas-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.nota-item {
  padding: var(--space-md);
  background-color: var(--color-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  transition: box-shadow var(--transition-fast);
}

.nota-item:hover {
  box-shadow: var(--shadow-sm);
}

.nota-header {
  margin-bottom: var(--space-sm);
}

.nota-meta {
  display: flex;
  gap: var(--space-md);
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.nota-texto {
  line-height: 1.6;
  color: var(--color-text);
  white-space: pre-wrap;
}
</style>
