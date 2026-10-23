import type { NombreRol } from '../../domain/permisos';

export interface DatosDeRegistro {
  email: string;
  nombre: string;
  password: string;
  rol: NombreRol;
}

export class RegistrarUsuarioCommand implements DatosDeRegistro {
  readonly email: string;
  readonly nombre: string;
  readonly password: string;
  readonly rol: NombreRol;

  constructor(datos: DatosDeRegistro) {
    this.email = datos.email;
    this.nombre = datos.nombre;
    this.password = datos.password;
    this.rol = datos.rol;
  }
}
