# ADR-007: GitHub Flow + GitHub Actions

- **Estado:** Propuesto
- **Fecha:** 2026-10-23
- **Decisores:**

## Contexto

Seis personas integrando código en paralelo durante unas diez semanas, con un solo entorno (local) y sin despliegues a producción. Las guías piden una estrategia de branching explícita e integración continua.

## Decisión

**GitHub Flow**: `main` siempre funcional y protegida; una rama corta por issue; PR con una aprobación y CI verde; squash merge. **GitHub Actions** corre en cada PR: formato, lint, typecheck, tests unitarios, reglas de arquitectura, migraciones, tests de integración y build (`.github/workflows/ci.yml`).

## Alternativas consideradas

| Opción      | Pros                         | Contras                                                           |
| ----------- | ---------------------------- | ----------------------------------------------------------------- |
| GitHub Flow | simple, se aprende en un día | sin ramas de release (no las necesitamos)                         |
| Trunk-Based | integración muy frecuente    | exige feature toggles y una disciplina que el equipo aún no tiene |
| Git Flow    | muy ordenado                 | develop/release/hotfix son sobrecarga sin entornos múltiples      |

## Consecuencias

- Ramas de hasta 3 días; trabajo más largo se parte en PRs.
- Nadie pushea a `main` directo.
- El pipeline debe tardar menos de 8 minutos; si crece, se paralelizan jobs.
