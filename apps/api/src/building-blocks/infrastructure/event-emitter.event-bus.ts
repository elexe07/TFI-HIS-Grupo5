import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { DomainEvent } from '../domain/domain-event';
import type { EventBus } from '../application/event-bus';

/**
 * Adaptador del EventBus sobre @nestjs/event-emitter (eventos en memoria, ADR-004).
 * Los consumidores se suscriben con `@OnEvent('<nombre del evento>')` en su capa application.
 */
@Injectable()
export class EventEmitterEventBus implements EventBus {
  private readonly logger = new Logger(EventEmitterEventBus.name);

  constructor(private readonly emitter: EventEmitter2) {}

  async publicar(eventos: readonly DomainEvent[]): Promise<void> {
    for (const evento of eventos) {
      this.logger.debug(`Publicando ${evento.nombre} (${evento.eventoId})`);
      await this.emitter.emitAsync(evento.nombre, evento);
    }
  }
}
