import { Entity, ErrorDeValidacion, generarId, type Id } from '../../../building-blocks/domain';

export class ObraSocial extends Entity<Id> {
  private constructor(
    id: Id,
    readonly codigo: string,
    readonly nombre: string,
    readonly porcentajeCobertura: number,
  ) {
    super(id);
  }

  static crear(codigo: string, nombre: string, porcentajeCobertura: number, id?: Id): ObraSocial {
    if (!codigo || codigo.trim().length === 0) {
      throw new ErrorDeValidacion('El código de obra social es obligatorio');
    }
    if (!nombre || nombre.trim().length === 0) {
      throw new ErrorDeValidacion('El nombre de la obra social es obligatorio');
    }
    if (porcentajeCobertura < 0 || porcentajeCobertura > 100) {
      throw new ErrorDeValidacion('El porcentaje de cobertura debe estar entre 0 y 100');
    }

    return new ObraSocial(
      id ?? generarId(),
      codigo.trim().toUpperCase(),
      nombre.trim(),
      Number(porcentajeCobertura.toFixed(2)),
    );
  }

  static rehidratar(
    id: Id,
    codigo: string,
    nombre: string,
    porcentajeCobertura: number,
  ): ObraSocial {
    return new ObraSocial(id, codigo, nombre, porcentajeCobertura);
  }
}

