import { DomainEventBase } from '../../../../building-blocks/domain';

export const SALUDO_CREADO = 'ejemplo.saludo-creado';

export class SaludoCreado extends DomainEventBase {
  readonly nombre = SALUDO_CREADO;

  constructor(
    readonly saludoId: string,
    readonly destinatario: string,
    ocurridoEn: Date,
  ) {
    super(ocurridoEn);
  }
}
