import type { Solicitante } from '../../../../building-blocks/application';

export class BuscarPacientePorIdQuery {
  constructor(
    readonly id: string,
    readonly solicitante?: Solicitante,
  ) {}
}
