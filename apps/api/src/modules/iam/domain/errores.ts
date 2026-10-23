import { Conflicto, NoAutorizado, NoEncontrado, Prohibido } from '../../../building-blocks/domain';

export class EmailYaRegistrado extends Conflicto {
  constructor(email: string) {
    super(`Ya existe un usuario con el email ${email}`, 'EMAIL_YA_REGISTRADO');
  }
}

/** Mismo error para email inexistente, password incorrecta o usuario inactivo: no damos pistas. */
export class CredencialesInvalidas extends NoAutorizado {
  constructor() {
    super('Email o contraseña incorrectos', 'CREDENCIALES_INVALIDAS');
  }
}

export class UltimoAdministrador extends Conflicto {
  constructor() {
    super('No se puede quitar el rol al último administrador activo', 'ULTIMO_ADMINISTRADOR');
  }
}

export class UsuarioNoEncontrado extends NoEncontrado {
  constructor(id: string) {
    super(`No existe el usuario ${id}`, 'USUARIO_NO_ENCONTRADO');
  }
}

export class RolNoEncontrado extends NoEncontrado {
  constructor(nombre: string) {
    super(`No existe el rol ${nombre}`, 'ROL_NO_ENCONTRADO');
  }
}

export class TokenInvalido extends NoAutorizado {
  constructor() {
    super('Token faltante, inválido o vencido', 'TOKEN_INVALIDO');
  }
}

export class PermisoFaltante extends Prohibido {
  constructor(permiso: string) {
    super(`Se requiere el permiso ${permiso}`, 'PERMISO_FALTANTE');
  }
}
