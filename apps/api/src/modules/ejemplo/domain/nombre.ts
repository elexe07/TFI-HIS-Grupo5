import { ErrorDeValidacion, ValueObject } from '../../../building-blocks/domain';

export class NombreInvalido extends ErrorDeValidacion {
  constructor(motivo: string) {
    super(`Nombre inválido: ${motivo}`, 'NOMBRE_INVALIDO');
  }
}

/** Objeto de valor: valida una vez al crearse y después es imposible tener uno inválido. */
export class Nombre extends ValueObject<{ valor: string }> {
  static readonly LONGITUD_MAXIMA = 50;

  private constructor(valor: string) {
    super({ valor });
  }

  static crear(valor: string): Nombre {
    const limpio = valor.trim();
    if (limpio.length === 0) throw new NombreInvalido('no puede estar vacío');
    if (limpio.length > Nombre.LONGITUD_MAXIMA) {
      throw new NombreInvalido(`supera los ${Nombre.LONGITUD_MAXIMA} caracteres`);
    }
    return new Nombre(limpio);
  }

  get valor(): string {
    return this.props.valor;
  }
}
