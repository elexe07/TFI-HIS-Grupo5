/**
 * Endpoints del módulo IAM: login, usuario actual y gestión de usuarios (backend: modules/iam/api).
 */
import { get, post, patch } from '@/shared/http/client';
import type {
  CrearUsuarioRequest,
  LoginResponse,
  NombreRol,
  UsuarioAutenticado,
  UsuarioDTO,
} from './iam.types';

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    post<LoginResponse>('/auth/login', credentials),

  me: () => get<UsuarioAutenticado>('/auth/me'),

  // Usuarios (requiere usuarios:gestionar → solo ADMINISTRADOR)
  listarUsuarios: () => get<UsuarioDTO[]>('/usuarios'),
  crearUsuario: (data: CrearUsuarioRequest) => post<UsuarioDTO>('/usuarios', data),
  asignarRol: (id: string, rol: NombreRol) => patch<UsuarioDTO>(`/usuarios/${id}/rol`, { rol }),
};
