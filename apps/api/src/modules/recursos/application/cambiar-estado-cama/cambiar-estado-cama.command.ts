import type { EstadoCama } from '../../domain';

export class CambiarEstadoCamaCommand {
  readonly camaId: string;
  readonly nuevoEstado: EstadoCama;

  constructor(props: { camaId: string; nuevoEstado: EstadoCama }) {
    this.camaId = props.camaId;
    this.nuevoEstado = props.nuevoEstado;
  }
}
