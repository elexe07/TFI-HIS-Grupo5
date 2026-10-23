import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SALUDO_CREADO, type SaludoCreado } from '../../domain/events/saludo-creado';

/**
 * Ejemplo de consumidor de eventos. En un módulo real, el handler de OTRO módulo haría
 * `import { SALUDO_CREADO, SaludoCreado } from '../../ejemplo/public'` y reaccionaría acá
 * (por ejemplo Facturación creando un cargo). Guardar `evento.eventoId` evita duplicados.
 */
@Injectable()
export class RegistrarSaludoEnLogHandler {
  private readonly logger = new Logger(RegistrarSaludoEnLogHandler.name);

  @OnEvent(SALUDO_CREADO)
  manejar(evento: SaludoCreado): void {
    this.logger.log(`Se saludó a ${evento.destinatario} (evento ${evento.eventoId})`);
  }
}
