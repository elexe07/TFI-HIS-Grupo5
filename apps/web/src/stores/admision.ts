/**
 * Store de Admisión (Pinia)
 * Pacientes, Médicos, Agendas, Turnos, Triaje, Cola de Guardia
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { admisionApi } from '@/services/api';
import type {
  PacienteDTO,
  CrearPacienteRequest,
  MedicoDTO,
  AgendaDTO,
  FranjaAgendaDTO,
  CrearAgendaRequest,
  TurnoDTO,
  ReservarTurnoRequest,
  RegistrarTriajeRequest,
  ColaGuardiaItem,
  EstadoTurno,
  NivelTriaje,
} from '@/types/api';

export const useAdmisionStore = defineStore('admision', () => {
  // --- STATE ---
  const pacientes = ref<PacienteDTO[]>([]);
  const medicos = ref<MedicoDTO[]>([]);
  const agendas = ref<AgendaDTO[]>([]);
  const agendaActual = ref<AgendaDTO | null>(null);
  const turnos = ref<TurnoDTO[]>([]);
  const colaGuardia = ref<ColaGuardiaItem[]>([]);
  const pacienteSeleccionado = ref<PacienteDTO | null>(null);

  const cargando = ref(false);
  const error = ref<string | null>(null);

  // --- HELPERS ---
  function enriquecerTurno(t: TurnoDTO): TurnoDTO {
    const p = pacientes.value.find((pac) => pac.id === t.pacienteId);
    const m = medicos.value.find((med) => med.id === t.medicoId);
    return {
      ...t,
      paciente: p ?? t.paciente,
      medico: m ?? t.medico,
    };
  }

  // --- GETTERS ---
  const pacientesOrdenados = computed(() =>
    [...pacientes.value].sort((a, b) =>
      `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`),
    ),
  );

  const medicosConAgenda = computed(() =>
    medicos.value.map((medico) => ({
      ...medico,
      agendas: agendas.value.filter((a) => a.medicoId === medico.id),
    })),
  );

  const turnosPorEstado = computed(
    () => (estado: EstadoTurno) => turnos.value.filter((t) => t.estado === estado),
  );

  const turnosHoy = computed(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    return turnos.value.filter((t) => {
      const inicio = new Date(t.inicio);
      return inicio >= hoy && inicio < manana;
    });
  });

  const colaGuardiaOrdenada = computed(() =>
    [...colaGuardia.value].sort((a, b) => {
      const ordenNivel: Record<NivelTriaje, number> = {
        ROJO: 0,
        NARANJA: 1,
        AMARILLO: 2,
        VERDE: 3,
        AZUL: 4,
      };
      const diff = ordenNivel[a.nivel] - ordenNivel[b.nivel];
      if (diff !== 0) return diff;
      return new Date(a.llegadaEn).getTime() - new Date(b.llegadaEn).getTime();
    }),
  );

  // --- ACTIONS ---
  async function cargarPacientes(params?: { documento?: string; apellido?: string }) {
    cargando.value = true;
    error.value = null;
    try {
      pacientes.value = await admisionApi.listarPacientes(params);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar pacientes';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function crearPaciente(data: CrearPacienteRequest) {
    cargando.value = true;
    error.value = null;
    try {
      const nuevo = await admisionApi.crearPaciente(data);
      pacientes.value.push(nuevo);
      return nuevo;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear paciente';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  function seleccionarPaciente(paciente: PacienteDTO | null) {
    pacienteSeleccionado.value = paciente;
  }

  async function cargarMedicos() {
    try {
      medicos.value = await admisionApi.listarMedicos();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar médicos';
      throw err;
    }
  }

  async function crearMedico(data: {
    usuarioId: string;
    matricula: string;
    nombre: string;
    apellido: string;
    especialidad: string;
  }) {
    cargando.value = true;
    error.value = null;
    try {
      const nuevo = await admisionApi.crearMedico(data);
      medicos.value.push(nuevo);
      return nuevo;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al registrar médico';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarAgendas(medicoId?: string) {
    try {
      if (medicoId) {
        const agenda = await admisionApi.obtenerAgendaMedico(medicoId);
        agendaActual.value = agenda;
        agendas.value = [agenda];
        return agenda;
      }
      agendas.value = await admisionApi.listarAgendas();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar agendas';
      throw err;
    }
  }

  async function cargarAgendaMedico(medicoId: string) {
    cargando.value = true;
    error.value = null;
    try {
      const data = await admisionApi.obtenerAgendaMedico(medicoId);
      agendaActual.value = data;
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar agenda del médico';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function definirAgenda(medicoId: string, franjas: FranjaAgendaDTO[]) {
    cargando.value = true;
    error.value = null;
    try {
      const data = await admisionApi.definirAgendaMedico(medicoId, {
        franjas: franjas.map((f) => ({
          diaSemana: f.diaSemana,
          horaInicio: f.horaInicio,
          horaFin: f.horaFin,
          duracionTurnoMin: f.duracionTurnoMin,
        })),
      });
      agendaActual.value = data;
      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al definir agenda';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function crearAgenda(data: CrearAgendaRequest) {
    cargando.value = true;
    error.value = null;
    try {
      const nueva = await admisionApi.crearAgenda(data);
      agendaActual.value = nueva;
      agendas.value.push(nueva);
      return nueva;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear agenda';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarTurnos(params?: {
    medicoId?: string;
    pacienteId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    desde?: string;
    hasta?: string;
  }) {
    cargando.value = true;
    error.value = null;
    try {
      const lista = await admisionApi.listarTurnos(params);
      turnos.value = lista.map(enriquecerTurno);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar turnos';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function reservarTurno(data: ReservarTurnoRequest) {
    cargando.value = true;
    error.value = null;
    try {
      const nuevo = await admisionApi.reservarTurno(data);
      const enriquecido = enriquecerTurno(nuevo);
      turnos.value.push(enriquecido);
      return enriquecido;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al reservar turno';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function cancelarTurno(id: string) {
    cargando.value = true;
    error.value = null;
    try {
      await admisionApi.cancelarTurno(id);
      turnos.value = turnos.value.filter((t) => t.id !== id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cancelar turno';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function obtenerPaciente(id: string) {
    cargando.value = true;
    error.value = null;
    try {
      const paciente = await admisionApi.obtenerPaciente(id);
      return paciente;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener paciente';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function actualizarPaciente(id: string, data: Partial<CrearPacienteRequest>) {
    cargando.value = true;
    error.value = null;
    try {
      // Backend no expone endpoint de modificación de paciente, se actualiza localmente en el cliente
      const idx = pacientes.value.findIndex((p) => p.id === id);
      if (idx !== -1) {
        const existing = pacientes.value[idx];
        pacientes.value[idx] = { ...existing, ...data } as PacienteDTO;
        return pacientes.value[idx];
      }
      throw new Error('Paciente no encontrado');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar paciente';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function registrarTriaje(data: RegistrarTriajeRequest) {
    cargando.value = true;
    error.value = null;
    try {
      const triaje = await admisionApi.registrarTriaje(data);
      await cargarColaGuardia();
      return triaje;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al registrar triaje';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarColaGuardia() {
    try {
      const raw = await admisionApi.obtenerColaGuardia();
      colaGuardia.value = raw.map((item, index) => {
        const p = pacientes.value.find((pac) => pac.id === item.pacienteId);
        return {
          ...item,
          posicion: index + 1,
          pacienteNombre: p?.nombre ?? item.pacienteNombre ?? '-',
          pacienteApellido: p?.apellido ?? item.pacienteApellido ?? '-',
          documento: p ? `${p.tipoDocumento} ${p.numeroDocumento}` : (item.documento ?? '-'),
        };
      });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar cola de guardia';
      throw err;
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    pacientes,
    medicos,
    agendas,
    agendaActual,
    turnos,
    colaGuardia,
    pacienteSeleccionado,
    cargando,
    error,
    // Getters
    pacientesOrdenados,
    medicosConAgenda,
    turnosPorEstado,
    turnosHoy,
    colaGuardiaOrdenada,
    // Actions
    cargarPacientes,
    crearPaciente,
    seleccionarPaciente,
    cargarMedicos,
    crearMedico,
    cargarAgendas,
    cargarAgendaMedico,
    definirAgenda,
    crearAgenda,
    cargarTurnos,
    reservarTurno,
    cancelarTurno,
    registrarTriaje,
    cargarColaGuardia,
    obtenerPaciente,
    actualizarPaciente,
    clearError,
  };
});
