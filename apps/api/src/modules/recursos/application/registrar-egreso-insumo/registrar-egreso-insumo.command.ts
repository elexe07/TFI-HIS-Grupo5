export class RegistrarEgresoInsumoCommand {
  readonly insumoId: string;
  readonly cantidad: number;

  constructor(props: { insumoId: string; cantidad: number }) {
    this.insumoId = props.insumoId;
    this.cantidad = props.cantidad;
  }
}
