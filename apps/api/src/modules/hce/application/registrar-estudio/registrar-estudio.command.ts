import type { TipoEstudio } from '../../domain/estudio';

export class RegistrarEstudioCommand {
  constructor(
    readonly pacienteId: string,
    readonly tipo: TipoEstudio,
    readonly descripcion: string,
    readonly fecha: Date,
    readonly registradoPor: string,
    readonly resultado?: string,
  ) {}
}
