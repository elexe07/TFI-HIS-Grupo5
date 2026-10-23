# ADR-002: Monolito modular con Package by Component

- **Estado:** Propuesto
- **Fecha:** 2026-10-23
- **Decisores:**

## Contexto

La consigna define seis módulos con responsabilidades claras. Las guías recomiendan Package by Component sobre Package by Layer y advierten sobre la erosión arquitectónica. Seis personas trabajan en paralelo.

## Decisión

Un solo proceso (API NestJS) y una sola base de datos, organizados en **seis módulos independientes** bajo `src/modules/<modulo>/`, cada uno con `domain / application / infrastructure / api / public`. Un módulo solo puede importar de otro lo que está en `public/`. Las reglas se verifican con dependency-cruiser en CI.

## Alternativas consideradas

| Opción             | Pros                                                  | Contras                                                                                  |
| ------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Monolito modular   | simple de correr y testear, un deploy, límites claros | hay que disciplinar los límites (lo hace el CI)                                          |
| Microservicios     | aislamiento total                                     | seis repos, red, consistencia eventual, infraestructura: sobreingeniería para el alcance |
| Monolito por capas | familiar                                              | los módulos se mezclan en cada capa; erosión garantizada con seis personas               |

## Consecuencias

- Cada integrante es dueño de una carpeta; los conflictos de merge se reducen.
- Si algún día se extrae un módulo a un servicio, su carpeta ya es autocontenida.
- `building-blocks/` contiene solo lo genérico; nada de negocio.
