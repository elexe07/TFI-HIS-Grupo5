/**
 * Cliente HTTP mínimo. Cuando IAM esté, acá se agrega el header Authorization.
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

async function manejar<T>(respuesta: Response): Promise<T> {
  if (respuesta.ok) return (await respuesta.json()) as T;
  const cuerpo = (await respuesta
    .json()
    .catch(() => ({ statusCode: respuesta.status }))) as ErrorApi;
  throw new HttpError(respuesta.status, cuerpo);
}

export const http = {
  get<T>(url: string): Promise<T> {
    return fetch(url).then((r) => manejar<T>(r));
  },
  post<T>(url: string, body: unknown): Promise<T> {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => manejar<T>(r));
  },
};
