import { Entity, generarId } from '../../../building-blocks/domain';

export type SeveridadAlergia = 'LEVE' | 'MODERADA' | 'GRAVE';

export class Alergia extends Entity {
  private constructor(
    id: string,
    readonly sustancia: string,
    readonly severidad: SeveridadAlergia,
    readonly registradoEn: Date,
    readonly registradoPor: string,
  ) {
    super(id);
  }

  static crear(
    sustancia: string,
    severidad: SeveridadAlergia,
    registradoEn: Date,
    registradoPor: string,
  ): Alergia {
    return new Alergia(generarId(), sustancia.trim(), severidad, registradoEn, registradoPor);
  }

  static reconstituir(
    id: string,
    sustancia: string,
    severidad: SeveridadAlergia,
    registradoEn: Date,
    registradoPor: string,
  ): Alergia {
    return new Alergia(id, sustancia, severidad, registradoEn, registradoPor);
  }
}
