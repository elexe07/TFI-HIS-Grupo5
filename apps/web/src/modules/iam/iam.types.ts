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
  | 'cobertura:validar'
  | 'reportes:leer'
  | 'iam:usuarios:leer'
  | 'iam:usuarios:crear'
  | 'iam:roles:asignar';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioAutenticado;
}

export interface UsuarioDTO {
  id: string;
  email: string;
  nombre: string;
  rolId: string;
  rolNombre: string;
  activo: boolean;
  createdAt: string;
}

export interface CrearUsuarioRequest {
  email: string;
  password: string;
  nombre: string;
  rolId: string;
}

export interface AsignarRolRequest {
  rolId: string;
}

export interface RolDTO {
  id: string;
  nombre: string;
  permisos: Permiso[];
}
