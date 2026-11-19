import type { Solicitante } from '../../../../building-blocks/application';

export class BuscarPacientesQuery {
  readonly documento?: string;
  readonly apellido?: string;

  constructor(
    filtros?: { documento?: string; apellido?: string },
    readonly solicitante?: Solicitante,
  ) {
    this.documento = filtros?.documento?.trim();
    this.apellido = filtros?.apellido?.trim();
  }
}
