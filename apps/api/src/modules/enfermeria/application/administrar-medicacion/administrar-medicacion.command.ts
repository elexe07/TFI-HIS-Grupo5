export class AdministrarMedicacionCommand {
  constructor(
    readonly indicacionId: string,
    readonly administradaPor: string,
  ) {}
}

