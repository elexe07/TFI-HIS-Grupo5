export class AbrirHistoriaCommand {
  constructor(
    readonly pacienteId: string,
    readonly origenEventoId?: string,
  ) {}
}
