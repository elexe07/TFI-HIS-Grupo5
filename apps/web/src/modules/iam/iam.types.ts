/**
 * Tipos del módulo IAM: usuario autenticado, roles y permisos (espejo de la API /auth y /usuarios).
 */
export interface UsuarioAutenticado {
  id: string;
  email: string;
  nombre: string;
  rol: NombreRol;
  permisos: Permiso[];
}

export type NombreRol = 'ADMINISTRADOR' | 'MEDICO' | 'ENFERMERO' | 'RECEPCIONISTA' | 'PACIENTE';

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
  | 'facturacion:gestionar'
  | 'cobertura:validar'
  | 'reportes:leer'
  | 'usuarios:gestionar';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioAutenticado;
}

/** Usuario tal como lo devuelve `GET /usuarios` (backend: application/usuario.dto.ts). Nunca trae el hash. */
export interface UsuarioDTO {
  id: string;
  email: string;
  nombre: string;
  rol: NombreRol;
  permisos: Permiso[];
  activo: boolean;
  creadoEn: string;
}

/** Body de `POST /usuarios`. El backend valida email, fortaleza de la contraseña y email único. */
export interface CrearUsuarioRequest {
  email: string;
  password: string;
  nombre: string;
  rol: NombreRol;
}
