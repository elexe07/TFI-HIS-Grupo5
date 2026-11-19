export class ConsultarHistoriaQuery {
  constructor(
    readonly pacienteId: string,
    readonly usuarioActual: { id: string; rol: string; pacienteId?: string },
  ) {}
}
