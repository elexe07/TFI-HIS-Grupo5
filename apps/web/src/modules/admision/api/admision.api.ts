import { HttpError, type ErrorApi } from '../../../api/http';

export function obtenerToken(): string | null {
  return localStorage.getItem('his_token');
}

export function guardarToken(token: string): void {
  localStorage.setItem('his_token', token);
}

export function eliminarToken(): void {
  localStorage.removeItem('his_token');
}

async function peticion<T>(url: string, opciones: RequestInit = {}): Promise<T> {
  const token = obtenerToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((opciones.headers as Record<string, string>) || {}),
  };

  const res = await fetch(url, { ...opciones, headers });
  if (res.ok) {
    if (res.status === 204) return {} as T;
    return (await res.json()) as T;
  }

  const cuerpo = (await res.json().catch(() => ({ statusCode: res.status }))) as ErrorApi;
  throw new HttpError(res.status, cuerpo);
}

export interface PacienteItem {
  id: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  sexo: string;
  telefono: string | null;
  email: string | null;
  obraSocialCodigo: string | null;
  numeroAfiliado: string | null;
}

export interface MedicoItem {
  id: string;
  matricula: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  nombreCompleto: string;
}

export interface TurnoItem {
  id: string;
  pacienteId: string;
  medicoId: string;
  inicio: string;
  fin: string;
  estado: 'RESERVADO' | 'CANCELADO' | 'ATENDIDO';
  motivoConsulta: string | null;
}

export interface TriajeItem {
  id: string;
  pacienteId: string;
  nivel: 'ROJO' | 'NARANJA' | 'AMARILLO' | 'VERDE' | 'AZUL';
  prioridad: number;
  motivo: string;
  estado: 'EN_ESPERA' | 'ATENDIDO';
  llegadaEn: string;
}

export const admisionApi = {
  // Pacientes
  buscarPacientes(filtros?: { documento?: string; apellido?: string }): Promise<PacienteItem[]> {
    const params = new URLSearchParams();
    if (filtros?.documento) params.set('documento', filtros.documento);
    if (filtros?.apellido) params.set('apellido', filtros.apellido);
    const qs = params.toString();
    return peticion<PacienteItem[]>(`/api/pacientes${qs ? `?${qs}` : ''}`);
  },

  registrarPaciente(datos: {
    tipoDocumento: string;
    numeroDocumento: string;
    nombre: string;
    apellido: string;
    fechaNacimiento: string;
    sexo: string;
    telefono?: string;
    email?: string;
    obraSocialCodigo?: string;
    numeroAfiliado?: string;
  }): Promise<PacienteItem> {
    return peticion<PacienteItem>('/api/pacientes', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  },

  // Médicos
  listarMedicos(): Promise<MedicoItem[]> {
    return peticion<MedicoItem[]>('/api/medicos');
  },

  obtenerAgenda(
    medicoId: string,
  ): Promise<{
    medicoId: string;
    franjas: Array<{
      diaSemana: number;
      horaInicio: string;
      horaFin: string;
      duracionTurnoMin: number;
    }>;
  }> {
    return peticion(`/api/medicos/${medicoId}/agenda`);
  },

  // Turnos
  listarTurnos(filtros?: { pacienteId?: string; medicoId?: string }): Promise<TurnoItem[]> {
    const params = new URLSearchParams();
    if (filtros?.pacienteId) params.set('pacienteId', filtros.pacienteId);
    if (filtros?.medicoId) params.set('medicoId', filtros.medicoId);
    const qs = params.toString();
    return peticion<TurnoItem[]>(`/api/turnos${qs ? `?${qs}` : ''}`);
  },

  reservarTurno(datos: {
    pacienteId: string;
    medicoId: string;
    inicio: string;
    motivoConsulta?: string;
  }): Promise<TurnoItem> {
    return peticion<TurnoItem>('/api/turnos', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  },

  cancelarTurno(turnoId: string): Promise<TurnoItem> {
    return peticion<TurnoItem>(`/api/turnos/${turnoId}`, {
      method: 'DELETE',
    });
  },

  // Guardia y Triaje
  obtenerColaGuardia(): Promise<TriajeItem[]> {
    return peticion<TriajeItem[]>('/api/guardia/cola');
  },

  registrarTriaje(datos: {
    pacienteId: string;
    nivel: string;
    motivo: string;
  }): Promise<TriajeItem> {
    return peticion<TriajeItem>('/api/triajes', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  },

  // Auth helper para desarrollo
  iniciarSesion(email = 'admin@his.local', password = 'Admin1234!'): Promise<{ token: string }> {
    return peticion<{ token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }).then((res) => {
      guardarToken(res.token);
      return res;
    });
  },
};
