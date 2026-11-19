import { Entity, generarId } from '../../../building-blocks/domain';

export class Evolucion extends Entity {
  private constructor(
    id: string,
    readonly medicoId: string,
    readonly motivo: string,
    readonly diagnostico: string,
    readonly registradoEn: Date,
    readonly tratamiento?: string,
    readonly turnoId?: string,
    readonly internacionId?: string,
  ) {
    super(id);
  }

  static crear(
    medicoId: string,
    motivo: string,
    diagnostico: string,
    registradoEn: Date,
    tratamiento?: string,
    turnoId?: string,
    internacionId?: string,
  ): Evolucion {
    return new Evolucion(
      generarId(),
      medicoId,
      motivo.trim(),
      diagnostico.trim(),
      registradoEn,
      tratamiento?.trim(),
      turnoId,
      internacionId,
    );
  }

  static reconstituir(
    id: string,
    medicoId: string,
    motivo: string,
    diagnostico: string,
    registradoEn: Date,
    tratamiento?: string,
    turnoId?: string,
    internacionId?: string,
  ): Evolucion {
    return new Evolucion(
      id,
      medicoId,
      motivo,
      diagnostico,
      registradoEn,
      tratamiento,
      turnoId,
      internacionId,
    );
  }
}
