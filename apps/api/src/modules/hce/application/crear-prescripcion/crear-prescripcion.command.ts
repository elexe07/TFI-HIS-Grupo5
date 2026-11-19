export class CrearPrescripcionCommand {
  constructor(
    readonly pacienteId: string,
    readonly medicoId: string,
    readonly medicamento: string,
    readonly dosis: string,
    readonly frecuenciaHoras: number,
    readonly duracionDias: number,
    readonly evolucionId?: string,
    readonly internacionId?: string,
  ) {}
}
