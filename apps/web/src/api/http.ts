/**
 * Cliente HTTP mínimo con soporte para JWT en Authorization header.
 */
export interface ErrorApi {
  statusCode: number;
  codigo?: string;
  mensaje?: string;
  message?: string | string[];
}

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly cuerpo: ErrorApi,
  ) {
    super(
      cuerpo.mensaje ??
        (Array.isArray(cuerpo.message) ? cuerpo.message.join(', ') : cuerpo.message) ??
        'Error',
    );
  }
}

function obtenerHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('his_token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function manejar<T>(respuesta: Response): Promise<T> {
  if (respuesta.ok) return (await respuesta.json()) as T;
  const cuerpo = (await respuesta
    .json()
    .catch(() => ({ statusCode: respuesta.status }))) as ErrorApi;
  throw new HttpError(respuesta.status, cuerpo);
}

export const http = {
  get<T>(url: string): Promise<T> {
    return fetch(url, { headers: obtenerHeaders() }).then((r) => manejar<T>(r));
  },
  post<T>(url: string, body?: unknown): Promise<T> {
    return fetch(url, {
      method: 'POST',
      headers: obtenerHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then((r) => manejar<T>(r));
  },
  setToken(token: string | null) {
    if (token) {
      localStorage.setItem('his_token', token);
    } else {
      localStorage.removeItem('his_token');
    }
  },
  getToken(): string | null {
    return localStorage.getItem('his_token');
  },
};
