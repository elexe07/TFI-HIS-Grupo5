/**
 * Cliente HTTP mínimo con soporte de JWT en headers y verbos GET, POST, PATCH.
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

const STORAGE_KEY = 'his_auth_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignorar error de storage
  }
}

function obtenerHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
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
    return fetch(url, {
      method: 'GET',
      headers: obtenerHeaders(),
    }).then((r) => manejar<T>(r));
  },

  post<T>(url: string, body: unknown): Promise<T> {
    return fetch(url, {
      method: 'POST',
      headers: obtenerHeaders(),
      body: JSON.stringify(body),
    }).then((r) => manejar<T>(r));
  },

  patch<T>(url: string, body: unknown): Promise<T> {
    return fetch(url, {
      method: 'PATCH',
      headers: obtenerHeaders(),
      body: JSON.stringify(body),
    }).then((r) => manejar<T>(r));
  },
};
