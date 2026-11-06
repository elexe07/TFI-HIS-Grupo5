export class BuscarPacientesQuery {
  readonly documento?: string;
  readonly apellido?: string;

  constructor(filtros?: { documento?: string; apellido?: string }) {
    this.documento = filtros?.documento?.trim();
    this.apellido = filtros?.apellido?.trim();
  }
}

