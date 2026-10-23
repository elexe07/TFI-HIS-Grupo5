# ADR-006: Frontend React + Vite con pantallas mínimas por módulo

- **Estado:** Propuesto
- **Fecha:** 2026-10-23
- **Decisores:**

## Contexto

No está confirmado si la cátedra evalúa la interfaz. El Core se puede demostrar por Swagger, pero una UI mínima hace la demo más clara.

## Decisión

SPA en **React 18 + Vite + TypeScript** en `apps/web`, con una o dos pantallas por módulo priorizadas por el flujo demo. La UI es un adaptador primario: no contiene reglas de negocio y consume la API por HTTP. Si la cátedra confirma que la UI no se evalúa, se reduce a lo necesario para la demo.

## Alternativas consideradas

| Opción       | Pros                                       | Contras                                     |
| ------------ | ------------------------------------------ | ------------------------------------------- |
| React + Vite | mismo lenguaje que la API, arranque rápido | hay que construir las pantallas             |
| Solo Swagger | cero esfuerzo                              | demo menos clara para un público no técnico |
| Angular      | estructura fuerte                          | más pesado para pantallas mínimas           |

## Consecuencias

- `vite.config.ts` hace proxy de `/api` y `/docs` a la API en desarrollo.
- Cada módulo agrega su carpeta `apps/web/src/modules/<modulo>/` y registra sus rutas en `App.tsx`.
- **Pendiente:** confirmar con la cátedra.
