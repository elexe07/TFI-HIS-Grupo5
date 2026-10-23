import { ErrorDeValidacion, ValueObject } from '../../../building-blocks/domain';

export class PasswordDebil extends ErrorDeValidacion {
  constructor(motivo: string) {
    super(`Contraseña débil: ${motivo}`, 'PASSWORD_DEBIL');
  }
}

/**
 * Contraseña en texto plano, validada. Solo existe el tiempo que tarda en hashearse:
 * nunca se guarda ni se loguea. El hash lo hace un adaptador (PasswordHasher).
 */
export class Password extends ValueObject<{ valor: string }> {
  static readonly LONGITUD_MINIMA = 8;
  /** Límite de bcrypt: los bytes de más se ignoran silenciosamente. */
  static readonly LONGITUD_MAXIMA = 72;

  private constructor(valor: string) {
    super({ valor });
  }

  static crear(valor: string): Password {
    if (valor.length < Password.LONGITUD_MINIMA) {
      throw new PasswordDebil(`mínimo ${Password.LONGITUD_MINIMA} caracteres`);
    }
    if (valor.length > Password.LONGITUD_MAXIMA) {
      throw new PasswordDebil(`máximo ${Password.LONGITUD_MAXIMA} caracteres`);
    }
    if (!/[a-zA-Z]/.test(valor) || !/\d/.test(valor)) {
      throw new PasswordDebil('debe tener al menos una letra y un número');
    }
    return new Password(valor);
  }

  get valor(): string {
    return this.props.valor;
  }

  /** Evita que termine en un log por accidente (console.log, JSON.stringify). */
  toJSON(): string {
    return '[password]';
  }
}
