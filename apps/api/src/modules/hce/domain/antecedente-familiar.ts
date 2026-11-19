import { Entity, generarId } from '../../../building-blocks/domain';

export class AntecedenteFamiliar extends Entity {
  private constructor(
    id: string,
    readonly parentesco: string,
    readonly condicion: string,
    readonly registradoEn: Date,
    readonly registradoPor: string,
  ) {
    super(id);
  }

  static crear(
    parentesco: string,
    condicion: string,
    registradoEn: Date,
    registradoPor: string,
  ): AntecedenteFamiliar {
    return new AntecedenteFamiliar(
      generarId(),
      parentesco.trim(),
      condicion.trim(),
      registradoEn,
      registradoPor,
    );
  }

  static reconstituir(
    id: string,
    parentesco: string,
    condicion: string,
    registradoEn: Date,
    registradoPor: string,
  ): AntecedenteFamiliar {
    return new AntecedenteFamiliar(id, parentesco, condicion, registradoEn, registradoPor);
  }
}
