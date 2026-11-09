export class DescontarInsumoPorEventoCommand {
  readonly eventoId: string;
  readonly medicamento?: string;
  readonly codigo?: string;
  readonly cantidad: number;

  constructor(props: {
    eventoId: string;
    medicamento?: string;
    codigo?: string;
    cantidad?: number;
  }) {
    this.eventoId = props.eventoId;
    this.medicamento = props.medicamento;
    this.codigo = props.codigo;
    this.cantidad = props.cantidad ?? 1;
  }
}
