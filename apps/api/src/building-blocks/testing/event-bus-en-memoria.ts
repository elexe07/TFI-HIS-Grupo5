import type { EventBus } from '../application/event-bus';
import type { DomainEvent } from '../domain/domain-event';

/** EventBus para tests: guarda lo publicado para poder hacer asserts. */
export class EventBusEnMemoria implements EventBus {
  readonly publicados: DomainEvent[] = [];

  publicar(eventos: readonly DomainEvent[]): Promise<void> {
    this.publicados.push(...eventos);
    return Promise.resolve();
  }

  nombres(): string[] {
    return this.publicados.map((e) => e.nombre);
  }
}
