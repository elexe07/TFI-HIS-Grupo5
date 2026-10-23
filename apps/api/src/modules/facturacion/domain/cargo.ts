import { Entity, ErrorDeValidacion, generarId, type Id } from '../../../building-blocks/domain';
import type { ConceptoCargo } from './enums';

export interface PropsCargo {
  readonly cuentaId: Id;
  readonly concepto: ConceptoCargo;
  readonly descripcion: string;
  readonly cantidad: number;
  readonly montoUnitario: number;
  readonly origenEventoId: Id;
  readonly createdAt?: Date;
}

export class Cargo extends Entity<Id> {
  private constructor(
    id: Id,
    readonly cuentaId: Id,
    readonly concepto: ConceptoCargo,
    readonly descripcion: string,
    readonly cantidad: number,
    readonly montoUnitario: number,
    readonly montoTotal: number,
    readonly origenEventoId: Id,
    readonly createdAt: Date,
  ) {
    super(id);
  }

  static crear(props: PropsCargo, id?: Id): Cargo {
    if (!props.descripcion || props.descripcion.trim().length === 0) {
      throw new ErrorDeValidacion('La descripción del cargo no puede estar vacía');
    }
    if (props.cantidad <= 0 || !Number.isInteger(props.cantidad)) {
      throw new ErrorDeValidacion('La cantidad del cargo debe ser un entero mayor a 0');
    }
    if (props.montoUnitario < 0) {
      throw new ErrorDeValidacion('El monto unitario no puede ser negativo');
    }
    if (!props.origenEventoId) {
      throw new ErrorDeValidacion('El origen del evento es obligatorio para asegurar idempotencia');
    }

    const montoTotal = Number((props.cantidad * props.montoUnitario).toFixed(2));
    const cargoId = id ?? generarId();
    const createdAt = props.createdAt ?? new Date();

    return new Cargo(
      cargoId,
      props.cuentaId,
      props.concepto,
      props.descripcion.trim(),
      props.cantidad,
      props.montoUnitario,
      montoTotal,
      props.origenEventoId,
      createdAt,
    );
  }

  static rehidratar(
    id: Id,
    cuentaId: Id,
    concepto: ConceptoCargo,
    descripcion: string,
    cantidad: number,
    montoUnitario: number,
    montoTotal: number,
    origenEventoId: Id,
    createdAt: Date,
  ): Cargo {
    return new Cargo(
      id,
      cuentaId,
      concepto,
      descripcion,
      cantidad,
      montoUnitario,
      montoTotal,
      origenEventoId,
      createdAt,
    );
  }
}

