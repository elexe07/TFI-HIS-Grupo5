import type { SeveridadAlergia } from '../../domain/alergia';

export class RegistrarAlergiaCommand {
  constructor(
    readonly pacienteId: string,
    readonly sustancia: string,
    readonly severidad: SeveridadAlergia,
    readonly registradoPor: string,
  ) {}
}
