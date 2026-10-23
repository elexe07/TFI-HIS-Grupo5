import { generarId, type Id } from './id';

/**
 * Evento de dominio: algo que pasó en el negocio, en pasado (`TurnoReservado`, `PacienteInternado`).
 * Los agregados los registran y el caso de uso los publica en el EventBus después de persistir.
 *
 * `nombre` es la clave con la que otros módulos se suscriben (`@OnEvent(nombre)`).
 * Convención: `<modulo>.<evento-en-kebab-case>`, por ejemplo `admision.paciente-registrado`.
 */
export interface DomainEvent {
  readonly eventoId: Id;
  readonly nombre: string;
  readonly ocurridoEn: Date;
}

export abstract class DomainEventBase implements DomainEvent {
  readonly eventoId: Id = generarId();
  abstract readonly nombre: string;

  protected constructor(readonly ocurridoEn: Date) {}
}
