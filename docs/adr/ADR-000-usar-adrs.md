# ADR-000: Registrar decisiones de arquitectura con ADRs

- **Estado:** Aceptado
- **Fecha:** 2026-10-23
- **Decisores:** equipo

## Contexto

En un equipo de seis personas las decisiones técnicas se olvidan, se vuelven a discutir ("Día de la Marmota") o quedan en la cabeza de una sola persona. Las guías de la materia piden documentar el "por qué" de la arquitectura.

## Decisión

Toda decisión con impacto en la estructura del sistema, el stack o el proceso se registra en `docs/adr/ADR-nnn-titulo.md` con la plantilla del `README.md` de esta carpeta. Un ADR trata una sola decisión. Se escribe cuando se decide, no después.

## Alternativas consideradas

| Opción                      | Pros                       | Contras                                       |
| --------------------------- | -------------------------- | --------------------------------------------- |
| Wiki o documento compartido | fácil de editar            | se desactualiza, no se versiona con el código |
| Comentarios en el código    | cerca de la implementación | no explican alternativas ni contexto          |
| No documentar               | cero esfuerzo              | discusiones repetidas, pérdida de contexto    |

## Consecuencias

- Las discusiones cerradas no se reabren salvo con un ADR nuevo.
- Cuesta unos minutos por decisión. Si una discusión dura más de 45 minutos, se corta y se adopta la recomendación por defecto del roadmap.
