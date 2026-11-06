import type { NivelTriaje } from '../../domain/tipos';

export interface RegistrarTriajeDatos {
  pacienteId: string;
  nivel: NivelTriaje;
  motivo: string;
  registradoPor: string;
}

export class RegistrarTriajeCommand {
  readonly pacienteId: string;
  readonly nivel: NivelTriaje;
  readonly motivo: string;
  readonly registradoPor: string;

  constructor(datos: RegistrarTriajeDatos) {
    this.pacienteId = datos.pacienteId;
    this.nivel = datos.nivel;
    this.motivo = datos.motivo;
    this.registradoPor = datos.registradoPor;
  }
}

