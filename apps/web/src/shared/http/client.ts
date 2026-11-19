/**
 * Cliente HTTP compartido (Axios): URL base, token JWT, manejo de errores y helpers tipados.
 * Cada módulo arma sus endpoints en `modules/<modulo>/<modulo>.api.ts` usando `get/post/patch/del`.
 */
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ErrorApi } from '@/shared/types/api';

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

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.get<T>(url, config);
  return response.data;
}

export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.post<T>(url, data, config);
  return response.data;
}

export async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.patch<T>(url, data, config);
  return response.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.delete<T>(url, config);
  return response.data;
}

export { api, HttpError, extraerError };
export default api;
