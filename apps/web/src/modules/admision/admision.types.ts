/**
 * Tipos del módulo Admisión: pacientes, médicos, agendas, turnos y triaje.
 */
export type TipoDocumento = 'DNI' | 'PASAPORTE' | 'OTRO';
export type Sexo = 'F' | 'M' | 'X';
export type EstadoTurno = 'RESERVADO' | 'CONFIRMADO' | 'EN_SALA_ESPERA' | 'ATENDIDO' | 'CANCELADO';
export type NivelTriaje = 'ROJO' | 'NARANJA' | 'AMARILLO' | 'VERDE' | 'AZUL';
export type EstadoTriaje = 'EN_ESPERA' | 'ATENDIDO';

export interface PacienteDTO {
  id: string;
  usuarioId: string | null;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  sexo: Sexo;
  telefono: string | null;
  email: string | null;
  obraSocialCodigo: string | null;
  numeroAfiliado: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrearPacienteRequest {
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string; // YYYY-MM-DD
  sexo: Sexo;
  telefono?: string;
  email?: string;
  obraSocialCodigo?: string;
  numeroAfiliado?: string;
  /** Usuario del portal (rol PACIENTE) al que queda vinculada la ficha. */
  usuarioId?: string;
}

export interface BuscarPacientesParams {
  documento?: string;
  apellido?: string;
}

export interface MedicoDTO {
  id: string;
  usuarioId: string;
  matricula: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  createdAt: string;
}

export interface FranjaAgendaDTO {
  id?: string;
  diaSemana: number; // 0-6 (Domingo-Sábado)
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  duracionTurnoMin: number;
}

export interface AgendaDTO {
  id?: string;
  medicoId: string;
  diaSemana?: number; // 0-6 (compatibilidad)
  horaInicio?: string; // HH:mm
  horaFin?: string; // HH:mm
  duracionTurnoMin?: number;
  franjas?: FranjaAgendaDTO[];
  medico?: MedicoDTO;
}

export interface DefinirAgendaRequest {
  franjas: {
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    duracionTurnoMin: number;
  }[];
}

export interface CrearAgendaRequest {
  medicoId: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  duracionTurnoMin: number;
}

export interface TurnoDTO {
  id: string;
  pacienteId: string;
  medicoId: string;
  inicio: string;
  fin: string;
  estado: EstadoTurno;
  motivoConsulta: string | null;
  creadoPor: string;
  createdAt: string;
  updatedAt: string;
  paciente?: PacienteDTO;
  medico?: MedicoDTO;
}

export interface ReservarTurnoRequest {
  pacienteId: string;
  medicoId: string;
  inicio: string; // ISO datetime
  fin?: string; // ISO datetime (opcional, se calcula según agenda si no se pasa)
  motivoConsulta?: string;
}

export interface TriajeDTO {
  id: string;
  pacienteId: string;
  nivel: NivelTriaje;
  motivo: string;
  estado: EstadoTriaje;
  llegadaEn: string;
  registradoPor: string;
  paciente?: PacienteDTO;
}

export interface RegistrarTriajeRequest {
  pacienteId: string;
  nivel: NivelTriaje;
  motivo: string;
}

export interface ColaGuardiaItem {
  id: string;
  pacienteId: string;
  pacienteNombre?: string;
  pacienteApellido?: string;
  documento?: string;
  nivel: NivelTriaje;
  prioridad?: number;
  motivo: string;
  estado?: EstadoTriaje;
  llegadaEn: string;
  posicion?: number;
  registradoPor?: string;
}
