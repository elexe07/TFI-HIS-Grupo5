export class RegistrarSignosVitalesCommand {
  constructor(
    readonly pacienteId: string,
    readonly registradoPor: string,
    readonly props: {
      internacionId?: string | null;
      temperatura?: number | null;
      presionSistolica?: number | null;
      presionDiastolica?: number | null;
      frecuenciaCardiaca?: number | null;
      saturacionO2?: number | null;
    },
  ) {}
}

