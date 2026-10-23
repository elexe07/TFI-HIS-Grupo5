import type { DomainEvent } from '../domain/domain-event';

/**
 * Puerto de salida para publicar eventos. Las interfaces de TypeScript no existen en
 * runtime, por eso cada puerto tiene un token (Symbol) para la inyección de dependencias:
 *
 *   constructor(@Inject(EVENT_BUS) private readonly bus: EventBus) {}
 */
export const EVENT_BUS = Symbol('EVENT_BUS');

export interface EventBus {
  publicar(eventos: readonly DomainEvent[]): Promise<void>;
}
