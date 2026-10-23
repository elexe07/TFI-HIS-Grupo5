import { ErrorDeValidacion, ValueObject } from '../../../building-blocks/domain';

export class EmailInvalido extends ErrorDeValidacion {
  constructor(motivo: string) {
    super(`Email inválido: ${motivo}`, 'EMAIL_INVALIDO');
  }
}

const FORMATO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Email normalizado (minúsculas, sin espacios). Dos emails iguales salvo mayúsculas son el mismo. */
export class Email extends ValueObject<{ valor: string }> {
  static readonly LONGITUD_MAXIMA = 254;

  private constructor(valor: string) {
    super({ valor });
  }

  static crear(valor: string): Email {
    const limpio = valor.trim().toLowerCase();
    if (limpio.length === 0) throw new EmailInvalido('no puede estar vacío');
    if (limpio.length > Email.LONGITUD_MAXIMA) throw new EmailInvalido('demasiado largo');
    if (!FORMATO.test(limpio)) throw new EmailInvalido('formato incorrecto');
    return new Email(limpio);
  }

  get valor(): string {
    return this.props.valor;
  }
}
