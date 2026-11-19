/**
 * Endpoints del módulo IAM: login, usuario actual y gestión de usuarios (backend: modules/iam/api).
 */
import { get, post, patch } from '@/shared/http/client';
import type { UsuarioAutenticado, LoginResponse } from './iam.types';

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
