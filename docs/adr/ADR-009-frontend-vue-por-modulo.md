# ADR-009: Frontend Vue 3 + Pinia organizado por módulo

- **Estado:** Propuesto
- **Fecha:** 2026-11-19
- **Decisores:**

## Contexto

ADR-006 proponía React, pero el front se terminó construyendo en **Vue 3 + Pinia + Vite** y está
completo: todas las funciones de los seis módulos tienen pantalla. Además, el código del front estaba
organizado por capa técnica (`views/`, `stores/`, un único `services/api.ts` y un único `types/api.ts`).
Para explicar un módulo había que saltar entre cuatro carpetas y dos archivos de más de 300 líneas.

## Decisión

- El frontend queda en **Vue 3 (Composition API) + Pinia + Vue Router + Axios**. Reemplaza a ADR-006.
- El código se organiza **por módulo** (package by feature), igual que el backend:
  `apps/web/src/modules/<modulo>/{views/, <modulo>.store.ts, <modulo>.api.ts, <modulo>.types.ts, <modulo>.routes.ts}`.
- Lo genérico va en `shared/` (componentes UI, cliente HTTP, toasts, tema) y **no importa nada de `modules/`**.
- El router solo junta las rutas de cada módulo y define los guards de login y permisos.
- Un módulo lee datos de otro solo a través del store de ese módulo, nunca llamando a su `*.api.ts`.

## Alternativas consideradas

| Opción                                  | Pros                                                 | Contras                                                       |
| --------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| Mantener la organización por capa       | cero trabajo                                         | un módulo queda repartido en 4 carpetas; archivos gigantes    |
| **Por módulo (elegida)**                | un integrante explica su módulo abriendo una carpeta | hay que respetar la regla de `shared/` → no conoce `modules/` |
| Migrar a React para cumplir con ADR-006 | coincide con lo propuesto                            | reescribir un front que ya funciona, sin beneficio para el TP |

## Consecuencias

- La estructura del front coincide con la del backend (`apps/api/src/modules/<modulo>`): el recorrido
  pantalla → store → api → controller → caso de uso se sigue con los mismos nombres de punta a punta.
- Ver `apps/web/README.md` (sección "Cómo explicar un módulo").
- ADR-006 pasa a estado `Reemplazado por ADR-009`.
