export class OmitirIndicacionCommand {
  constructor(
    readonly indicacionId: string,
    readonly motivo: string,
    readonly omitidaPor: string,
  ) {}
}

