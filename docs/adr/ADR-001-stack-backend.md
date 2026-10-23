# ADR-001: TypeScript + NestJS como stack backend

- **Estado:** Propuesto
- **Fecha:** 2026-10-23
- **Decisores:**

## Contexto

El equipo necesita un lenguaje y framework que todos manejen y que facilite la arquitectura que piden las guías: módulos aislados, inyección de dependencias para puertos y adaptadores, y tests fáciles de escribir.

## Decisión

Backend en **TypeScript** (`strict: true`) sobre **NestJS 11** con Node 24. NestJS provee módulos, inyección de dependencias, guards, pipes de validación y un emisor de eventos, que mapean uno a uno con Package by Component y puertos/adaptadores.

## Alternativas consideradas

| Opción                              | Pros                                                         | Contras                                   |
| ----------------------------------- | ------------------------------------------------------------ | ----------------------------------------- |
| TypeScript + NestJS                 | módulos y DI nativos, Swagger integrado, mucha documentación | curva inicial de decoradores              |
| TypeScript + Express/Fastify a mano | mínimo y flexible                                            | hay que inventar módulos, DI y validación |
| .NET (ASP.NET Core)                 | muy buen soporte para esta arquitectura                      | el grupo no lo domina                     |
| Java (Spring Boot)                  | ídem                                                         | ídem, más verboso                         |

## Consecuencias

- Las interfaces de TypeScript no existen en runtime: cada puerto tiene un token `Symbol` para inyección (convención en `building-blocks`).
- Un solo lenguaje para API y web permite compartir tipos.
- Los decoradores de NestJS se usan en `application`, `infrastructure` y `api`, nunca en `domain` (lo verifica `pnpm arch`).
