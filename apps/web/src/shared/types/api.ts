/**
 * Tipos genéricos de la API, compartidos por todos los módulos.
 */
export interface ErrorApi {
  statusCode: number;
  codigo?: string;
  mensaje?: string;
  message?: string | string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
