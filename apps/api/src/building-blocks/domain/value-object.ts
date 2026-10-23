/**
 * Objeto de valor: no tiene identidad, es inmutable y se compara por sus atributos.
 * Ejemplos: Nombre, Documento, Dosis, Monto.
 *
 * Convención: constructor privado + método estático `crear(...)` que valida y lanza
 * ErrorDeValidacion si los datos no cumplen las reglas.
 */
export abstract class ValueObject<TProps extends Record<string, unknown>> {
  protected readonly props: Readonly<TProps>;

  protected constructor(props: TProps) {
    this.props = Object.freeze({ ...props });
  }

  equals(otro?: ValueObject<TProps>): boolean {
    if (otro === undefined || otro === null) return false;
    return JSON.stringify(this.props) === JSON.stringify(otro.props);
  }
}
