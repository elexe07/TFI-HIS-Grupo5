/**
 * Endpoints del módulo Admisión: pacientes, médicos, agendas, turnos y triaje (backend: modules/admision/api).
 */
import { get, post, patch, del } from '@/shared/http/client';
import type {
  PacienteDTO,
  CrearPacienteRequest,
  MedicoDTO,
  AgendaDTO,
  DefinirAgendaRequest,
  CrearAgendaRequest,
  TurnoDTO,
  ReservarTurnoRequest,
  TriajeDTO,
  RegistrarTriajeRequest,
  ColaGuardiaItem,
} from './admision.types';

export const admisionApi = {
  // Pacientes
  listarPacientes: (params?: { documento?: string; apellido?: string }) =>
    get<PacienteDTO[]>('/pacientes', { params }),
  crearPaciente: (data: CrearPacienteRequest) => post<PacienteDTO>('/pacientes', data),
  obtenerPaciente: (id: string) => get<PacienteDTO>(`/pacientes/${id}`),
  /** Vincula la ficha con el usuario (rol PACIENTE) con el que el paciente entra a su portal. */
  vincularUsuario: (pacienteId: string, usuarioId: string) =>
    patch<PacienteDTO>(`/pacientes/${pacienteId}/usuario`, { usuarioId }),

  // Médicos
  listarMedicos: () => get<MedicoDTO[]>('/medicos'),
  crearMedico: (data: {
    usuarioId: string;
    matricula: string;
    nombre: string;
    apellido: string;
    especialidad: string;
  }) => post<MedicoDTO>('/medicos', data),

  // Agendas
  obtenerAgendaMedico: (medicoId: string) => get<AgendaDTO>(`/medicos/${medicoId}/agenda`),
  definirAgendaMedico: (medicoId: string, data: DefinirAgendaRequest) =>
    post<AgendaDTO>(`/medicos/${medicoId}/agenda`, data),
  listarAgendas: async (medicoId?: string) => {
    if (!medicoId) return [];
    const res = await get<AgendaDTO>(`/medicos/${medicoId}/agenda`);
    return res ? [res] : [];
  },
  crearAgenda: async (data: CrearAgendaRequest) => {
    return post<AgendaDTO>(`/medicos/${data.medicoId}/agenda`, {
      franjas: [
        {
          diaSemana: data.diaSemana,
          horaInicio: data.horaInicio,
          horaFin: data.horaFin,
          duracionTurnoMin: data.duracionTurnoMin,
        },
      ],
    });
  },

  // Turnos
  listarTurnos: (params?: {
    medicoId?: string;
    pacienteId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    desde?: string;
    hasta?: string;
  }) => {
    const queryParams: Record<string, string> = {};
    if (params?.medicoId) queryParams.medicoId = params.medicoId;
    if (params?.pacienteId) queryParams.pacienteId = params.pacienteId;
    if (params?.desde) {
      queryParams.desde = params.desde;
    } else if (params?.fechaDesde) {
      queryParams.desde = params.fechaDesde.includes('T')
        ? params.fechaDesde
        : `${params.fechaDesde}T00:00:00.000Z`;
    }
    if (params?.hasta) {
      queryParams.hasta = params.hasta;
    } else if (params?.fechaHasta) {
      queryParams.hasta = params.fechaHasta.includes('T')
        ? params.fechaHasta
        : `${params.fechaHasta}T23:59:59.999Z`;
    }
    return get<TurnoDTO[]>('/turnos', { params: queryParams });
  },
  reservarTurno: (data: ReservarTurnoRequest) => post<TurnoDTO>('/turnos', data),
  cancelarTurno: (id: string) => del<void>(`/turnos/${id}`),
  obtenerTurno: (id: string) => get<TurnoDTO>(`/turnos/${id}`),

  // Triaje
  registrarTriaje: (data: RegistrarTriajeRequest) => post<TriajeDTO>('/triajes', data),
  atenderTriaje: (id: string) => patch<TriajeDTO>(`/triajes/${id}/atender`),
  obtenerColaGuardia: () => get<ColaGuardiaItem[]>('/guardia/cola'),
};
