export class RegistrarEvolucionCommand {
  constructor(
    readonly pacienteId: string,
    readonly medicoId: string,
    readonly motivo: string,
    readonly diagnostico: string,
    readonly tratamiento?: string,
    readonly turnoId?: string,
    readonly internacionId?: string,
  ) {}
}
