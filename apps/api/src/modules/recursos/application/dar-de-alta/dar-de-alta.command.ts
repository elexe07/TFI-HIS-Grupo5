export class DarDeAltaCommand {
  readonly internacionId: string;
  readonly egresoEn?: Date;

  constructor(props: { internacionId: string; egresoEn?: Date }) {
    this.internacionId = props.internacionId;
    this.egresoEn = props.egresoEn;
  }
}
