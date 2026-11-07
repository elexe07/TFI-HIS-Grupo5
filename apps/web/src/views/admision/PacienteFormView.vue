<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useAdmisionStore } from '@/stores/admision';
import { useToastStore } from '@/stores/toast';
import { useRouter, useRoute } from 'vue-router';
import { Card, Button, Input, Select } from '@/components/ui';
import type { CrearPacienteRequest } from '@/types/api';

const admisionStore = useAdmisionStore();
const toastStore = useToastStore();
const router = useRouter();
const route = useRoute();

const isEditing = computed(() => !!route.params.id);
const pacienteId = computed(() => route.params.id as string);

const form = ref<CrearPacienteRequest>({
  tipoDocumento: 'DNI',
  numeroDocumento: '',
  nombre: '',
  apellido: '',
  fechaNacimiento: '',
  sexo: 'M',
  telefono: '',
  email: '',
  obraSocialCodigo: '',
  numeroAfiliado: '',
});

const docTypes = [
  { value: 'DNI', label: 'DNI' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
  { value: 'OTRO', label: 'Otro' },
];

const sexoOptions = [
  { value: 'F', label: 'Femenino' },
  { value: 'M', label: 'Masculino' },
  { value: 'X', label: 'Otro' },
];

async function cargarPaciente() {
  if (isEditing.value && pacienteId.value) {
    try {
      const paciente = await admisionStore.obtenerPaciente(pacienteId.value);
      if (paciente) {
        form.value = {
          tipoDocumento: paciente.tipoDocumento,
          numeroDocumento: paciente.numeroDocumento,
          nombre: paciente.nombre,
          apellido: paciente.apellido,
          fechaNacimiento: paciente.fechaNacimiento?.split('T')[0] ?? '',
          sexo: paciente.sexo,
          telefono: paciente.telefono ?? '',
          email: paciente.email ?? '',
          obraSocialCodigo: paciente.obraSocialCodigo ?? '',
          numeroAfiliado: paciente.numeroAfiliado ?? '',
        };
      }
    } catch (err) {
      toastStore.error('Error', 'No se pudo cargar el paciente');
      await router.push({ name: 'admision.pacientes' });
    }
  }
}

async function handleSave() {
  if (
    !form.value.numeroDocumento.trim() ||
    !form.value.nombre.trim() ||
    !form.value.apellido.trim() ||
    !form.value.fechaNacimiento
  ) {
    toastStore.error('Campos requeridos', 'Complete todos los campos obligatorios');
    return;
  }

  try {
    if (isEditing.value) {
      await admisionStore.actualizarPaciente(pacienteId.value, form.value);
      toastStore.success('Paciente actualizado', `${form.value.nombre} ${form.value.apellido}`);
    } else {
      await admisionStore.crearPaciente(form.value);
      toastStore.success('Paciente creado', `${form.value.nombre} ${form.value.apellido}`);
    }
    await router.push({ name: 'admision.pacientes' });
  } catch (err) {
    toastStore.apiError(err, isEditing.value ? 'Error al actualizar' : 'Error al crear paciente');
  }
}

function volver() {
  router.push({ name: 'admision.pacientes' });
}

onMounted(() => {
  cargarPaciente();
});
</script>

<template>
  <div class="paciente-form-view">
    <div class="view-header">
      <div class="header-actions">
        <Button variant="secondary" @click="volver">
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
        <h2>{{ isEditing ? 'Editar Paciente' : 'Nuevo Paciente' }}</h2>
        <p class="view-subtitle">
          {{
            isEditing
              ? 'Modifique los datos del paciente'
              : 'Registre un nuevo paciente en el sistema'
          }}
        </p>
      </div>
    </div>

    <form @submit.prevent="handleSave" class="form-grid">
      <Card>
        <template #header>
          <h3>Datos del Paciente</h3>
        </template>

        <div class="form-row">
          <Select
            v-model="form.tipoDocumento"
            label="Tipo de Documento"
            :options="docTypes"
            required
          />
          <Input
            v-model="form.numeroDocumento"
            label="Número de Documento"
            placeholder="12345678"
            required
            type="text"
          />
        </div>

        <div class="form-row">
          <Input v-model="form.nombre" label="Nombre(s)" placeholder="Juan Carlos" required />
          <Input v-model="form.apellido" label="Apellido(s)" placeholder="Pérez" required />
        </div>

        <div class="form-row">
          <Input v-model="form.fechaNacimiento" label="Fecha de Nacimiento" type="date" required />
          <Select v-model="form.sexo" label="Sexo" :options="sexoOptions" required />
        </div>

        <div class="form-row">
          <Input
            v-model="form.telefono"
            label="Teléfono"
            placeholder="+54 11 1234-5678"
            type="tel"
          />
          <Input v-model="form.email" label="Email" placeholder="juan@email.com" type="email" />
        </div>
      </Card>

      <Card>
        <template #header>
          <h3>Cobertura Médica</h3>
        </template>

        <div class="form-row">
          <Input
            v-model="form.obraSocialCodigo"
            label="Código Obra Social"
            placeholder="OSDE, PAMI, etc."
          />
          <Input v-model="form.numeroAfiliado" label="Número de Afiliado" placeholder="123456789" />
        </div>
      </Card>

      <div class="form-actions">
        <Button variant="secondary" type="button" @click="volver">Cancelar</Button>
        <Button variant="primary" type="submit" :loading="admisionStore.cargando">
          {{ isEditing ? 'Actualizar' : 'Crear' }} Paciente
        </Button>
      </div>
    </form>
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

.form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}
</style>
