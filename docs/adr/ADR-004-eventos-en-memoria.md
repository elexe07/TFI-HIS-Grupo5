# ADR-004: Comunicación entre módulos por eventos en memoria

- **Estado:** Propuesto
- **Fecha:** 2026-10-23
- **Decisores:**

## Contexto

Facturación necesita enterarse de consultas, medicaciones e internaciones; Enfermería de prescripciones; HCE de pacientes nuevos. Hacerlo con llamadas directas acoplaría los módulos y violaría el aislamiento del ADR-002.

## Decisión

Los agregados registran **eventos de dominio**; el caso de uso los publica a través del puerto `EventBus` después de persistir. La implementación usa `@nestjs/event-emitter` (en memoria, mismo proceso). Los consumidores se suscriben con `@OnEvent('<modulo>.<evento>')` en su capa `application` e importan la clase del evento desde el `public/` del módulo emisor. Cada consumidor guarda el `eventoId` que lo originó para ser idempotente.

## Alternativas consideradas

| Opción                          | Pros                                    | Contras                                                         |
| ------------------------------- | --------------------------------------- | --------------------------------------------------------------- |
| Eventos en memoria              | cero infraestructura, simple de testear | si el proceso cae entre guardar y publicar, el evento se pierde |
| Llamadas directas entre módulos | obvio                                   | acoplamiento; Facturación conocería a todos                     |
| Cola externa (RabbitMQ)         | durable, desacoplado                    | infraestructura extra; sobreingeniería para el alcance          |

## Consecuencias

- Mapa de eventos en `ROADMAP.md §4.4`; cada módulo documenta los suyos en su README.
- La pérdida de eventos ante una caída se acepta como limitación conocida del trabajo. Un _outbox_ transaccional queda documentado como extensión futura.
