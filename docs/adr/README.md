# Registros de decisiones de arquitectura (ADR)

Una decisión por archivo. Numeración correlativa. Nunca se borra un ADR: si cambia la decisión, se escribe uno nuevo que lo reemplaza y el viejo pasa a estado `Reemplazado por ADR-nnn`.

| #                                        | Decisión                                          | Estado    |
| ---------------------------------------- | ------------------------------------------------- | --------- |
| [ADR-000](ADR-000-usar-adrs.md)          | Registrar decisiones con ADRs                     | Aceptado  |
| [ADR-001](ADR-001-stack-backend.md)      | TypeScript + NestJS como stack backend            | Propuesto |
| [ADR-002](ADR-002-monolito-modular.md)   | Monolito modular con Package by Component         | Propuesto |
| [ADR-003](ADR-003-postgres-prisma.md)    | PostgreSQL + Prisma, un schema por módulo         | Propuesto |
| [ADR-004](ADR-004-eventos-en-memoria.md) | Comunicación entre módulos por eventos en memoria | Propuesto |
| [ADR-005](ADR-005-autenticacion-jwt.md)  | Autenticación con JWT propio y un rol por usuario | Propuesto |
| [ADR-006](ADR-006-frontend-react.md)     | Frontend React + Vite                             | Propuesto |
| [ADR-007](ADR-007-github-flow-ci.md)     | GitHub Flow + GitHub Actions                      | Propuesto |
| [ADR-008](ADR-008-hce-inmutable.md)      | Historia clínica append-only                      | Propuesto |

Los ADR-001 a 008 quedan en `Propuesto` hasta la reunión de kickoff. Para aceptarlos: cambiar el estado, poner la fecha y los nombres de quienes decidieron.

## Plantilla

```markdown
# ADR-nnn: <decisión en una frase>

- **Estado:** Propuesto | Aceptado | Reemplazado por ADR-mmm
- **Fecha:** AAAA-MM-DD
- **Decisores:** <nombres>

## Contexto

¿Qué problema obliga a decidir?

## Decisión

Qué se decide.

## Alternativas consideradas

| Opción | Pros | Contras |
| ------ | ---- | ------- |

## Consecuencias

Qué gana y qué pierde el proyecto con esto.
```
