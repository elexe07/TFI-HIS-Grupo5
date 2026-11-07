/**
 * Tipos compartidos para la API del HIS
 * Basados en el esquema Prisma y los endpoints del backend
 */

// ============================================================================
// AUTENTICACIÓN Y USUARIOS (IAM)
// ============================================================================

export interface UsuarioAutenticado {
  id: string
  email: string
  nombre: string
  rol: NombreRol
  permisos: Permiso[]
}

export type NombreRol =
  | 'ADMINISTRADOR'
  | 'MEDICO'
  | 'ENFERMERO'
  | 'RECEPCIONISTA'
  | 'PACIENTE'

export type Permiso =
  | 'pacientes:registrar'
  | 'pacientes:leer'
  | 'agenda:definir'
  | 'turnos:reservar'
  | 'turnos:cancelar'
  | 'triaje:registrar'
  | 'guardia:leer'
  | 'hce:leer'
  | 'hce:escribir'
  | 'prescripciones:crear'
  | 'enfermeria:indicaciones:leer'
  | 'enfermeria:signos:leer'
  | 'enfermeria:signos:crear'
  | 'enfermeria:medicacion:administrar'
  | 'enfermeria:medicacion:omitir'
  | 'enfermeria:notas:leer'
  | 'enfermeria:notas:crear'
  | 'camas:leer'
  | 'camas:gestionar'
  | 'internaciones:gestionar'
  | 'insumos:gestionar'
  | 'facturacion:leer'
  | 'cobertura:validar'
  | 'reportes:leer'
  | 'iam:usuarios:leer'
  | 'iam:usuarios:crear'
  | 'iam:roles:asignar'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  usuario: UsuarioAutenticado
}

export interface UsuarioDTO {
  id: string
  email: string
  nombre: string
  rolId: string
  rolNombre: string
  activo: boolean
  createdAt: string
}

export interface CrearUsuarioRequest {
  email: string
  password: string
  nombre: string
  rolId: string
}

export interface AsignarRolRequest {
  rolId: string
}

export interface RolDTO {
  id: string
  nombre: string
  permisos: Permiso[]
}

// ============================================================================
// ADMISIÓN Y TURNOS
// ============================================================================

export type TipoDocumento = 'DNI' | 'PASAPORTE' | 'OTRO'
export type Sexo = 'F' | 'M' | 'X'
export type EstadoTurno = 'RESERVADO' | 'CONFIRMADO' | 'EN_SALA_ESPERA' | 'ATENDIDO' | 'CANCELADO'
export type NivelTriaje = 'ROJO' | 'NARANJA' | 'AMARILLO' | 'VERDE' | 'AZUL'
export type EstadoTriaje = 'EN_ESPERA' | 'ATENDIDO'

export interface PacienteDTO {
  id: string
  usuarioId: string | null
  tipoDocumento: TipoDocumento
  numeroDocumento: string
  nombre: string
  apellido: string
  fechaNacimiento: string
  sexo: Sexo
  telefono: string | null
  email: string | null
  obraSocialCodigo: string | null
  numeroAfiliado: string | null
  createdAt: string
  updatedAt: string
}

export interface CrearPacienteRequest {
  tipoDocumento: TipoDocumento
  numeroDocumento: string
  nombre: string
  apellido: string
  fechaNacimiento: string // YYYY-MM-DD
  sexo: Sexo
  telefono?: string
  email?: string
  obraSocialCodigo?: string
  numeroAfiliado?: string
}

export interface BuscarPacientesParams {
  documento?: string
  apellido?: string
}

export interface MedicoDTO {
  id: string
  usuarioId: string
  matricula: string
  nombre: string
  apellido: string
  especialidad: string
  createdAt: string
}

export interface FranjaAgendaDTO {
  id?: string
  diaSemana: number // 0-6 (Domingo-Sábado)
  horaInicio: string // HH:mm
  horaFin: string // HH:mm
  duracionTurnoMin: number
}

export interface AgendaDTO {
  id?: string
  medicoId: string
  diaSemana?: number // 0-6 (compatibilidad)
  horaInicio?: string // HH:mm
  horaFin?: string // HH:mm
  duracionTurnoMin?: number
  franjas?: FranjaAgendaDTO[]
  medico?: MedicoDTO
}

export interface DefinirAgendaRequest {
  franjas: {
    diaSemana: number
    horaInicio: string
    horaFin: string
    duracionTurnoMin: number
  }[]
}

export interface CrearAgendaRequest {
  medicoId: string
  diaSemana: number
  horaInicio: string
  horaFin: string
  duracionTurnoMin: number
}

export interface TurnoDTO {
  id: string
  pacienteId: string
  medicoId: string
  inicio: string
  fin: string
  estado: EstadoTurno
  motivoConsulta: string | null
  creadoPor: string
  createdAt: string
  updatedAt: string
  paciente?: PacienteDTO
  medico?: MedicoDTO
}

export interface ReservarTurnoRequest {
  pacienteId: string
  medicoId: string
  inicio: string // ISO datetime
  fin?: string // ISO datetime (opcional, se calcula según agenda si no se pasa)
  motivoConsulta?: string
}

export interface TriajeDTO {
  id: string
  pacienteId: string
  nivel: NivelTriaje
  motivo: string
  estado: EstadoTriaje
  llegadaEn: string
  registradoPor: string
  paciente?: PacienteDTO
}

export interface RegistrarTriajeRequest {
  pacienteId: string
  nivel: NivelTriaje
  motivo: string
}

export interface ColaGuardiaItem {
  id: string
  pacienteId: string
  pacienteNombre?: string
  pacienteApellido?: string
  documento?: string
  nivel: NivelTriaje
  prioridad?: number
  motivo: string
  estado?: EstadoTriaje
  llegadaEn: string
  posicion?: number
  registradoPor?: string
}

// ============================================================================
// HCE - HISTORIA CLÍNICA ELECTRÓNICA
// ============================================================================

export type SeveridadAlergia = 'LEVE' | 'MODERADA' | 'GRAVE'
export type EstadoPrescripcion = 'ACTIVA' | 'SUSPENDIDA' | 'FINALIZADA'
export type TipoEstudio = 'LABORATORIO' | 'IMAGEN' | 'OTRO'

export interface HistoriaClinicaDTO {
  id: string
  pacienteId: string
  origenEventoId: string
  createdAt: string
  evoluciones: EvolucionDTO[]
  alergias: AlergiaDTO[]
  antecedentes: AntecedenteFamiliarDTO[]
  prescripciones: PrescripcionDTO[]
  estudios: EstudioDTO[]
}

export interface EvolucionDTO {
  id: string
  historiaId: string
  turnoId: string | null
  internacionId: string | null
  medicoId: string
  motivo: string
  diagnostico: string
  tratamiento: string | null
  registradoEn: string
  medicoNombre?: string
}

export interface CrearEvolucionRequest {
  historiaId: string
  turnoId?: string
  internacionId?: string
  motivo: string
  diagnostico: string
  tratamiento?: string
}

export interface AlergiaDTO {
  id: string
  historiaId: string
  sustancia: string
  severidad: SeveridadAlergia
  registradoEn: string
  registradoPor: string
}

export interface CrearAlergiaRequest {
  historiaId: string
  sustancia: string
  severidad: SeveridadAlergia
}

export interface AntecedenteFamiliarDTO {
  id: string
  historiaId: string
  parentesco: string
  condicion: string
  registradoEn: string
  registradoPor: string
}

export interface CrearAntecedenteRequest {
  historiaId: string
  parentesco: string
  condicion: string
}

export interface PrescripcionDTO {
  id: string
  historiaId: string
  evolucionId: string | null
  medicoId: string
  medicamento: string
  dosis: string
  frecuenciaHoras: number
  duracionDias: number
  estado: EstadoPrescripcion
  createdAt: string
  updatedAt: string
  medicoNombre?: string
}

export interface CrearPrescripcionRequest {
  historiaId: string
  evolucionId?: string
  medicamento: string
  dosis: string
  frecuenciaHoras: number
  duracionDias: number
}

export interface EstudioDTO {
  id: string
  historiaId: string
  tipo: TipoEstudio
  descripcion: string
  resultado: string | null
  fecha: string
  registradoPor: string
  createdAt: string
}

export interface CrearEstudioRequest {
  historiaId: string
  tipo: TipoEstudio
  descripcion: string
  resultado?: string
  fecha: string // YYYY-MM-DD
}

// ============================================================================
// ENFERMERÍA
// ============================================================================

export type EstadoIndicacion = 'PENDIENTE' | 'EJECUTADA' | 'OMITIDA'

export interface IndicacionDTO {
  id: string
  internacionId: string
  pacienteId: string
  prescripcionId: string
  descripcion: string
  programadaPara: string
  estado: EstadoIndicacion
  motivoOmision: string | null
  createdAt: string
  updatedAt: string
  prescripcion?: PrescripcionDTO
}

export interface GenerarIndicacionesRequest {
  prescripcionId: string
  pacienteId: string
  internacionId: string
  medicamento: string
  dosis: string
  frecuenciaHoras: number
  duracionDias: number
  inicioEn: string
}

export interface GenerarIndicacionesResponse {
  generadas: number
}

export interface SignosVitalesDTO {
  id: string
  pacienteId: string
  internacionId: string | null
  temperatura: number | null
  presionSistolica: number | null
  presionDiastolica: number | null
  frecuenciaCardiaca: number | null
  saturacionO2: number | null
  registradoEn: string
  registradoPor: string
}

export interface RegistrarSignosVitalesRequest {
  pacienteId: string
  internacionId?: string
  temperatura?: number
  presionSistolica?: number
  presionDiastolica?: number
  frecuenciaCardiaca?: number
  saturacionO2?: number
}

export interface AdministracionMedicacionDTO {
  id: string
  indicacionId: string
  pacienteId: string
  medicamento: string
  administradaEn: string
  administradaPor: string
}

export interface NotaEnfermeriaDTO {
  id: string
  pacienteId: string
  internacionId: string | null
  texto: string
  registradoEn: string
  registradoPor: string
}

export interface RegistrarNotaEnfermeriaRequest {
  pacienteId: string
  internacionId?: string
  texto: string
}

export interface OmitirIndicacionRequest {
  motivo: string
}

// ============================================================================
// RECURSOS Y CAMAS
// ============================================================================

export type EstadoCama = 'LIBRE' | 'OCUPADA' | 'EN_LIMPIEZA' | 'BLOQUEADA'
export type EstadoInternacion = 'ACTIVA' | 'ALTA'

export interface HabitacionDTO {
  id: string
  sector: string
  numero: string
  camas: CamaDTO[]
}

export interface CamaDTO {
  id: string
  habitacionId: string
  codigo: string
  estado: EstadoCama
  updatedAt: string
  habitacion?: HabitacionDTO
  internacionActiva?: InternacionDTO | null
}

export interface MapaCamasResponse {
  habitaciones: HabitacionDTO[]
  resumen: {
    total: number
    libres: number
    ocupadas: number
    enLimpieza: number
    bloqueadas: number
  }
}

export interface CambiarEstadoCamaRequest {
  estado: EstadoCama
}

export interface InternacionDTO {
  id: string
  pacienteId: string
  camaId: string
  medicoId: string
  motivo: string
  estado: EstadoInternacion
  ingresoEn: string
  egresoEn: string | null
  createdAt: string
  updatedAt: string
  paciente?: PacienteDTO
  cama?: CamaDTO
  medico?: MedicoDTO
}

export interface InternarPacienteRequest {
  pacienteId: string
  camaId: string
  medicoId: string
  motivo: string
}

export interface AltaInternacionRequest {
  internacionId: string
}

export interface InsumoDTO {
  id: string
  codigo: string
  nombre: string
  medicamentoAsociado: string | null
  stockActual: number
  stockMinimo: number
  updatedAt: string
}

export interface IngresoInsumoRequest {
  cantidad: number
}

// ============================================================================
// FACTURACIÓN
// ============================================================================

export type ConceptoCargo = 'CONSULTA' | 'MEDICACION' | 'DIA_CAMA'
export type TipoCuenta = 'CONSULTA' | 'INTERNACION'
export type EstadoCuenta = 'ABIERTA' | 'CERRADA'

export interface ObraSocialDTO {
  id: string
  codigo: string
  nombre: string
  porcentajeCobertura: number
}

export interface TarifaDTO {
  id: string
  concepto: ConceptoCargo
  monto: number
}

export interface CuentaDTO {
  id: string
  numero: string
  pacienteId: string
  tipo: TipoCuenta
  referenciaId: string
  coberturaValidada: boolean
  porcentajeCobertura: number | null
  estado: EstadoCuenta
  createdAt: string
  updatedAt: string
  fecha: string
  cargos: CargoDTO[]
  detalles: CargoDTO[]
  pagos: PagoDTO[]
  total: number
  pagado: number
  saldo: number
  cobertura?: ObraSocialDTO
  coberturaPorcentaje: number
  paciente?: PacienteDTO
}

export interface PagoDTO {
  id: string
  cuentaId: string
  fecha: string
  metodoPago: string
  monto: number
  observaciones: string | null
  createdAt: string
}

export interface CargoDTO {
  id: string
  cuentaId: string
  concepto: ConceptoCargo
  descripcion: string
  cantidad: number
  montoUnitario: number
  montoTotal: number
  origenEventoId: string
  createdAt: string
}

export interface ValidarCoberturaRequest {
  pacienteId: string
  codigoObraSocial: string
  numeroAfiliado: string
}

export interface ValidarCoberturaResponse {
  aprobada: boolean
  porcentajeCobertura: number
  mensaje?: string
}

export interface ReporteFacturacionDTO {
  desde: string
  hasta: string
  totalCargos: number
  totalMonto: number
  porConcepto: Record<ConceptoCargo, { cantidad: number; monto: number }>
  porObraSocial: Record<string, { cantidad: number; monto: number }>
}

export interface ReporteOcupacionDTO {
  totalCamas: number
  ocupadas: number
  libres: number
  enLimpieza: number
  bloqueadas: number
  porcentajeOcupacion: number
  porSector: Record<string, { total: number; ocupadas: number; porcentaje: number }>
}

// ============================================================================
// ERRORES Y RESPUESTAS GENÉRICAS
// ============================================================================

export interface ErrorApi {
  statusCode: number
  codigo?: string
  mensaje?: string
  message?: string | string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}