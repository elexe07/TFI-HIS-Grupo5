import { AggregateRoot, ErrorDeValidacion, generarId } from '../../../building-blocks/domain';
import type { Email } from './email';
import type { Rol } from './rol';

export class NombreDeUsuarioInvalido extends ErrorDeValidacion {
  constructor() {
    super('El nombre no puede estar vacío', 'NOMBRE_INVALIDO');
  }
}

export interface DatosDeUsuario {
  email: Email;
  nombre: string;
  passwordHash: string;
  rol: Rol;
  activo: boolean;
  creadoEn: Date;
}

/**
 * Raíz de agregado. Un usuario tiene exactamente un rol (ADR-005).
 * La contraseña entra ya hasheada: el agregado nunca ve texto plano.
 */
export class Usuario extends AggregateRoot {
  private constructor(
    id: string,
    private readonly datos: DatosDeUsuario,
  ) {
    super(id);
  }

  static crear(
    datos: Pick<DatosDeUsuario, 'email' | 'nombre' | 'passwordHash' | 'rol'>,
    ahora: Date,
  ): Usuario {
    const nombre = datos.nombre.trim();
    if (nombre.length === 0) throw new NombreDeUsuarioInvalido();
    return new Usuario(generarId(), { ...datos, nombre, activo: true, creadoEn: ahora });
  }

  static reconstituir(id: string, datos: DatosDeUsuario): Usuario {
    return new Usuario(id, datos);
  }

  get email(): Email {
    return this.datos.email;
  }
  get nombre(): string {
    return this.datos.nombre;
  }
  get passwordHash(): string {
    return this.datos.passwordHash;
  }
  get rol(): Rol {
    return this.datos.rol;
  }
  get activo(): boolean {
    return this.datos.activo;
  }
  get creadoEn(): Date {
    return this.datos.creadoEn;
  }

  get puedeIniciarSesion(): boolean {
    return this.datos.activo;
  }

  cambiarRol(rol: Rol): void {
    this.datos.rol = rol;
  }

  desactivar(): void {
    this.datos.activo = false;
  }
}
