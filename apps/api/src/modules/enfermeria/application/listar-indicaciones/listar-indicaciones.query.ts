export class ListarIndicacionesQuery {
  constructor(
    readonly filtros?: {
      internacionId?: string;
      pacienteId?: string;
      fecha?: Date;
    },
  ) {}
}

