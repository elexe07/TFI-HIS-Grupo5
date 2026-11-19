import { Entity, generarId } from '../../../building-blocks/domain';

export type TipoEstudio = 'LABORATORIO' | 'IMAGEN' | 'OTRO';

export class Estudio extends Entity {
  private constructor(
    id: string,
    readonly tipo: TipoEstudio,
    readonly descripcion: string,
    readonly fecha: Date,
    readonly registradoPor: string,
    readonly creadoEn: Date,
    readonly resultado?: string,
  ) {
    super(id);
  }

  static crear(
    tipo: TipoEstudio,
    descripcion: string,
    fecha: Date,
    registradoPor: string,
    creadoEn: Date,
    resultado?: string,
  ): Estudio {
    return new Estudio(
      generarId(),
      tipo,
      descripcion.trim(),
      fecha,
      registradoPor,
      creadoEn,
      resultado?.trim(),
    );
  }

  static reconstituir(
    id: string,
    tipo: TipoEstudio,
    descripcion: string,
    fecha: Date,
    registradoPor: string,
    creadoEn: Date,
    resultado?: string,
  ): Estudio {
    return new Estudio(id, tipo, descripcion, fecha, registradoPor, creadoEn, resultado);
  }
}
