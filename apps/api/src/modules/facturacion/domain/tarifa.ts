import { Entity, ErrorDeValidacion, generarId, type Id } from '../../../building-blocks/domain';
import type { ConceptoCargo } from './enums';

export class Tarifa extends Entity<Id> {
  private constructor(
    id: Id,
    readonly concepto: ConceptoCargo,
    readonly monto: number,
  ) {
    super(id);
  }

  static crear(concepto: ConceptoCargo, monto: number, id?: Id): Tarifa {
    if (monto < 0) {
      throw new ErrorDeValidacion('El monto de la tarifa no puede ser negativo');
    }
    return new Tarifa(id ?? generarId(), concepto, Number(monto.toFixed(2)));
  }

  static rehidratar(id: Id, concepto: ConceptoCargo, monto: number): Tarifa {
    return new Tarifa(id, concepto, monto);
  }
}

