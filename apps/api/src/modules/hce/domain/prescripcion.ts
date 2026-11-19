import { Entity, generarId } from '../../../building-blocks/domain';

export type EstadoPrescripcion = 'ACTIVA' | 'SUSPENDIDA' | 'FINALIZADA';

export class Prescripcion extends Entity {
  private constructor(
    id: string,
    readonly medicoId: string,
    readonly medicamento: string,
    readonly dosis: string,
    readonly frecuenciaHoras: number,
    readonly duracionDias: number,
    readonly estado: EstadoPrescripcion,
    readonly creadoEn: Date,
    readonly evolucionId?: string,
  ) {
    super(id);
  }

  static crear(
    medicoId: string,
    medicamento: string,
    dosis: string,
    frecuenciaHoras: number,
    duracionDias: number,
    creadoEn: Date,
    evolucionId?: string,
  ): Prescripcion {
    return new Prescripcion(
      generarId(),
      medicoId,
      medicamento.trim(),
      dosis.trim(),
      frecuenciaHoras,
      duracionDias,
      'ACTIVA',
      creadoEn,
      evolucionId,
    );
  }

  static reconstituir(
    id: string,
    medicoId: string,
    medicamento: string,
    dosis: string,
    frecuenciaHoras: number,
    duracionDias: number,
    estado: EstadoPrescripcion,
    creadoEn: Date,
    evolucionId?: string,
  ): Prescripcion {
    return new Prescripcion(
      id,
      medicoId,
      medicamento,
      dosis,
      frecuenciaHoras,
      duracionDias,
      estado,
      creadoEn,
      evolucionId,
    );
  }
}
