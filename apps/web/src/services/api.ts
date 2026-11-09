/**
 * Cliente API con Axios - Configuración centralizada
 * Maneja autenticación, interceptores, errores y estados de carga
 */
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ErrorApi, LoginResponse, UsuarioAutenticado } from '@/types/api';

// ============================================================================
// CONFIGURACIÓN BASE
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly codigo: string | undefined,
    public readonly mensaje: string,
    public readonly datos?: unknown,
  ) {
    super(mensaje);
    this.name = 'HttpError';
  }
}

function extraerError(error: unknown): HttpError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorApi>;
    const status = axiosError.response?.status ?? 0;
    const body = axiosError.response?.data;
    const codigo = body?.codigo;
    const mensaje = body?.mensaje ?? body?.message ?? axiosError.message ?? 'Error desconocido';
    return new HttpError(
      status,
      codigo,
      Array.isArray(mensaje) ? mensaje.join(', ') : mensaje,
      body,
    );
  }
  if (error instanceof Error) {
    return new HttpError(0, undefined, error.message);
  }
  return new HttpError(0, undefined, 'Error desconocido');
}

// ============================================================================
// INSTANCIA AXIOS
// ============================================================================

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// INTERCEPTORES
// ============================================================================

// Request: agregar token JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('his_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response: manejo centralizado de errores
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const httpError = extraerError(error);

    // 401: Token inválido o expirado → limpiar y redirigir a login
    if (httpError.status === 401) {
      localStorage.removeItem('his_token');
      localStorage.removeItem('his_usuario');
      // Solo redirigir si no estamos ya en login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(httpError);
  },
);

// ============================================================================
// HELPERS DE TIPADO
// ============================================================================

async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.get<T>(url, config);
  return response.data;
}

async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.post<T>(url, data, config);
  return response.data;
}

async function patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.patch<T>(url, data, config);
  return response.data;
}

async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.delete<T>(url, config);
  return response.data;
}

// ============================================================================
// ENDPOINTS POR MÓDULO
// ============================================================================

// --- AUTENTICACIÓN (IAM) ---
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    post<LoginResponse>('/auth/login', credentials),

  me: () => get<UsuarioAutenticado>('/auth/me'),

  // Usuarios (solo ADMIN)
  listarUsuarios: () => get<UsuarioAutenticado[]>('/usuarios'),
  crearUsuario: (data: { email: string; password: string; nombre: string; rolId: string }) =>
    post<UsuarioAutenticado>('/usuarios', data),
  asignarRol: (id: string, rolId: string) =>
    patch<UsuarioAutenticado>(`/usuarios/${id}/rol`, { rolId }),
};

// --- ADMISIÓN ---
export const admisionApi = {
  // Pacientes
  listarPacientes: (params?: { documento?: string; apellido?: string }) =>
    get<import('@/types/api').PacienteDTO[]>('/pacientes', { params }),
  crearPaciente: (data: import('@/types/api').CrearPacienteRequest) =>
    post<import('@/types/api').PacienteDTO>('/pacientes', data),
  obtenerPaciente: (id: string) => get<import('@/types/api').PacienteDTO>(`/pacientes/${id}`),

  // Médicos
  listarMedicos: () => get<import('@/types/api').MedicoDTO[]>('/medicos'),
  crearMedico: (data: {
    usuarioId: string;
    matricula: string;
    nombre: string;
    apellido: string;
    especialidad: string;
  }) => post<import('@/types/api').MedicoDTO>('/medicos', data),

  // Agendas
  obtenerAgendaMedico: (medicoId: string) =>
    get<import('@/types/api').AgendaDTO>(`/medicos/${medicoId}/agenda`),
  definirAgendaMedico: (medicoId: string, data: import('@/types/api').DefinirAgendaRequest) =>
    post<import('@/types/api').AgendaDTO>(`/medicos/${medicoId}/agenda`, data),
  listarAgendas: async (medicoId?: string) => {
    if (!medicoId) return [];
    const res = await get<import('@/types/api').AgendaDTO>(`/medicos/${medicoId}/agenda`);
    return res ? [res] : [];
  },
  crearAgenda: async (data: import('@/types/api').CrearAgendaRequest) => {
    return post<import('@/types/api').AgendaDTO>(`/medicos/${data.medicoId}/agenda`, {
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
    return get<import('@/types/api').TurnoDTO[]>('/turnos', { params: queryParams });
  },
  reservarTurno: (data: import('@/types/api').ReservarTurnoRequest) =>
    post<import('@/types/api').TurnoDTO>('/turnos', data),
  cancelarTurno: (id: string) => del<void>(`/turnos/${id}`),
  obtenerTurno: (id: string) => get<import('@/types/api').TurnoDTO>(`/turnos/${id}`),

  // Triaje
  registrarTriaje: (data: import('@/types/api').RegistrarTriajeRequest) =>
    post<import('@/types/api').TriajeDTO>('/triajes', data),
  atenderTriaje: (id: string) =>
    patch<import('@/types/api').TriajeDTO>(`/triajes/${id}/atender`),
  obtenerColaGuardia: () => get<import('@/types/api').ColaGuardiaItem[]>('/guardia/cola'),
};

// --- HCE ---
export const hceApi = {
  obtenerHistoria: (pacienteId: string) =>
    get<import('@/types/api').HistoriaClinicaDTO>(`/pacientes/${pacienteId}/historia`),

  // Evoluciones
  crearEvolucion: (
    pacienteId: string,
    data: Partial<import('@/types/api').CrearEvolucionRequest>,
  ) =>
    post<import('@/types/api').EvolucionDTO>(`/pacientes/${pacienteId}/historia/evoluciones`, data),

  // Alergias
  crearAlergia: (pacienteId: string, data: Partial<import('@/types/api').CrearAlergiaRequest>) =>
    post<import('@/types/api').AlergiaDTO>(`/pacientes/${pacienteId}/historia/alergias`, data),

  // Antecedentes
  crearAntecedente: (
    pacienteId: string,
    data: Partial<import('@/types/api').CrearAntecedenteRequest>,
  ) =>
    post<import('@/types/api').AntecedenteFamiliarDTO>(
      `/pacientes/${pacienteId}/historia/antecedentes`,
      data,
    ),

  // Prescripciones
  crearPrescripcion: (
    pacienteId: string,
    data: Partial<import('@/types/api').CrearPrescripcionRequest>,
  ) =>
    post<import('@/types/api').PrescripcionDTO>(
      `/pacientes/${pacienteId}/historia/prescripciones`,
      data,
    ),

  // Estudios
  crearEstudio: (pacienteId: string, data: Partial<import('@/types/api').CrearEstudioRequest>) =>
    post<import('@/types/api').EstudioDTO>(`/pacientes/${pacienteId}/historia/estudios`, data),
};

// --- ENFERMERÍA ---
export const enfermeriaApi = {
  // Indicaciones
  listarIndicaciones: (params: {
    pacienteId: string;
    estado?: import('@/types/api').EstadoIndicacion;
  }) => get<import('@/types/api').IndicacionDTO[]>('/enfermeria/indicaciones', { params }),
  generarIndicaciones: (data: import('@/types/api').GenerarIndicacionesRequest) =>
    post<import('@/types/api').GenerarIndicacionesResponse>(
      '/enfermeria/indicaciones/generar',
      data,
    ),
  administrarIndicacion: (id: string) =>
    post<import('@/types/api').AdministracionMedicacionDTO>(
      `/enfermeria/indicaciones/${id}/administrar`,
    ),
  omitirIndicacion: (id: string, motivo: string) =>
    post<import('@/types/api').IndicacionDTO>(`/enfermeria/indicaciones/${id}/omitir`, { motivo }),

  // Signos vitales
  listarSignosVitales: (params: { pacienteId: string }) =>
    get<import('@/types/api').SignosVitalesDTO[]>('/enfermeria/signos-vitales', { params }),
  registrarSignosVitales: (data: import('@/types/api').RegistrarSignosVitalesRequest) =>
    post<import('@/types/api').SignosVitalesDTO>('/enfermeria/signos-vitales', data),

  // Notas
  listarNotas: (params: { pacienteId: string }) =>
    get<import('@/types/api').NotaEnfermeriaDTO[]>('/enfermeria/notas', { params }),
  crearNota: (data: import('@/types/api').RegistrarNotaEnfermeriaRequest) =>
    post<import('@/types/api').NotaEnfermeriaDTO>('/enfermeria/notas', data),
};

// --- RECURSOS ---
export const recursosApi = {
  // Mapa de camas
  obtenerMapaCamas: () => get<import('@/types/api').MapaCamasResponse>('/camas/mapa'),
  cambiarEstadoCama: (id: string, estado: import('@/types/api').EstadoCama) =>
    patch<import('@/types/api').CamaDTO>(`/camas/${id}/estado`, { estado }),

  // Internaciones
  listarInternaciones: (params?: { estado?: import('@/types/api').EstadoInternacion }) =>
    get<import('@/types/api').InternacionDTO[]>('/internaciones', { params }),
  internarPaciente: (data: import('@/types/api').InternarPacienteRequest) =>
    post<import('@/types/api').InternacionDTO>('/internaciones', data),
  darAlta: (internacionId: string) => post<void>(`/internaciones/${internacionId}/alta`),

  // Insumos
  listarInsumos: (params?: { bajoMinimo?: boolean }) =>
    get<import('@/types/api').InsumoDTO[]>('/insumos', { params }),
  ingresarInsumo: (id: string, cantidad: number) =>
    post<import('@/types/api').InsumoDTO>(`/insumos/${id}/ingresos`, { cantidad }),
  egresarInsumo: (id: string, cantidad: number) =>
    post<import('@/types/api').InsumoDTO>(`/insumos/${id}/egresos`, { cantidad }),
};

// --- FACTURACIÓN ---
export const facturacionApi = {
  // Cuentas
  listarCuentas: (params?: { pacienteId?: string }) =>
    get<import('@/types/api').CuentaDTO[]>('/cuentas', { params }),
  obtenerCuenta: (id: string) => get<import('@/types/api').CuentaDTO>(`/cuentas/${id}`),
  cerrarCuenta: (id: string) =>
    post<import('@/types/api').CuentaDTO>(`/cuentas/${id}/cerrar`),

  // Pagos
  registrarPago: (
    cuentaId: string,
    data: { monto: number; metodoPago: string; observaciones?: string },
  ) => post<import('@/types/api').PagoDTO>(`/cuentas/${cuentaId}/pagos`, data),

  // Cobertura
  validarCobertura: (data: import('@/types/api').ValidarCoberturaRequest) =>
    post<import('@/types/api').ValidarCoberturaResponse>('/cobertura/validar', data),

  // Reportes
  reporteFacturacion: (desde: string, hasta: string) =>
    get<import('@/types/api').ReporteFacturacionDTO>('/reportes/facturacion', {
      params: { desde, hasta },
    }),
  reporteOcupacion: () => get<import('@/types/api').ReporteOcupacionDTO>('/reportes/ocupacion'),

  // Tarifas y obras sociales (admin)
  listarObrasSociales: () => get<import('@/types/api').ObraSocialDTO[]>('/obras-sociales'),
  listarTarifas: () => get<import('@/types/api').TarifaDTO[]>('/tarifas'),
};

// ============================================================================
// EXPORTACIÓN DE LA INSTANCIA PARA USO DIRECTO SI SE NECESITA
// ============================================================================

export { api, HttpError, extraerError };
export default api;
