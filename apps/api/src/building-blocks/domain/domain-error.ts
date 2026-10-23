/**
 * Errores de dominio. Se lanzan como excepciones (no códigos de error) y el
 * DomainErrorFilter los traduce a HTTP: VALIDACION → 400, NO_ENCONTRADO → 404,
 * CONFLICTO → 409, NO_AUTORIZADO → 401, PROHIBIDO → 403.
 *
 * Cada módulo define sus propios errores extendiendo estas clases:
 *   export class FranjaOcupada extends Conflicto {
 *     constructor() { super('La franja ya tiene un turno reservado', 'FRANJA_OCUPADA'); }
 *   }
 */
export type TipoDeError =
  'VALIDACION' | 'NO_ENCONTRADO' | 'CONFLICTO' | 'NO_AUTORIZADO' | 'PROHIBIDO';

export abstract class DomainError extends Error {
  abstract readonly tipo: TipoDeError;

  protected constructor(
    mensaje: string,
    readonly codigo: string,
  ) {
    super(mensaje);
    this.name = new.target.name;
  }
}

export class ErrorDeValidacion extends DomainError {
  readonly tipo = 'VALIDACION' as const;

  constructor(mensaje: string, codigo = 'VALIDACION') {
    super(mensaje, codigo);
  }
}

export class NoEncontrado extends DomainError {
  readonly tipo = 'NO_ENCONTRADO' as const;

  constructor(mensaje: string, codigo = 'NO_ENCONTRADO') {
    super(mensaje, codigo);
  }
}

export class Conflicto extends DomainError {
  readonly tipo = 'CONFLICTO' as const;

  constructor(mensaje: string, codigo = 'CONFLICTO') {
    super(mensaje, codigo);
  }
}

export class NoAutorizado extends DomainError {
  readonly tipo = 'NO_AUTORIZADO' as const;

  constructor(mensaje = 'No autenticado', codigo = 'NO_AUTORIZADO') {
    super(mensaje, codigo);
  }
}

export class Prohibido extends DomainError {
  readonly tipo = 'PROHIBIDO' as const;

  constructor(mensaje = 'No tiene permiso para esta acción', codigo = 'PROHIBIDO') {
    super(mensaje, codigo);
  }
}
