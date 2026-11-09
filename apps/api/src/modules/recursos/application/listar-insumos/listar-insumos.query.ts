export class ListarInsumosQuery {
  readonly bajoMinimo?: boolean;

  constructor(props?: { bajoMinimo?: boolean }) {
    this.bajoMinimo = props?.bajoMinimo;
  }
}
