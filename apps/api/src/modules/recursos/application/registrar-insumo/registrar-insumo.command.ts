export class RegistrarInsumoCommand {
  readonly codigo: string;
  readonly nombre: string;
  readonly medicamentoAsociado?: string;
  readonly stockInicial: number;
  readonly stockMinimo: number;

  constructor(props: {
    codigo: string;
    nombre: string;
    medicamentoAsociado?: string;
    stockInicial: number;
    stockMinimo: number;
  }) {
    this.codigo = props.codigo;
    this.nombre = props.nombre;
    this.medicamentoAsociado = props.medicamentoAsociado;
    this.stockInicial = props.stockInicial;
    this.stockMinimo = props.stockMinimo;
  }
}
