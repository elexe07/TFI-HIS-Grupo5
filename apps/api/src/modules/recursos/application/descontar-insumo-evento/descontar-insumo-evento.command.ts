export class DescontarInsumoPorEventoCommand {
  readonly eventoId: string;
  readonly medicamento: string;
  readonly cantidad: number;

  constructor(props: {
    eventoId: string;
    medicamento: string;
    cantidad?: number;
  }) {
    this.eventoId = props.eventoId;
    this.medicamento = props.medicamento;
    this.cantidad = props.cantidad ?? 1;
  }
}
