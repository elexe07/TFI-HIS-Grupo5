export class RegistrarAntecedenteCommand {
  constructor(
    readonly pacienteId: string,
    readonly parentesco: string,
    readonly condicion: string,
    readonly registradoPor: string,
  ) {}
}
