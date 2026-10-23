# ADR-003: PostgreSQL + Prisma, un schema por módulo, sin FKs entre módulos

- **Estado:** Propuesto
- **Fecha:** 2026-10-23
- **Decisores:**

## Contexto

Los datos del HIS son relacionales y la historia clínica exige integridad e inmutabilidad. El equipo trabaja en TypeScript y necesita migraciones versionadas.

## Decisión

**PostgreSQL 16** como única base, **Prisma 6** como ORM. Cada módulo tiene su **schema de Postgres** (`iam`, `admision`, `hce`, `enfermeria`, `recursos`, `facturacion`). **No hay claves foráneas entre schemas**: las referencias a otro módulo se guardan como `uuid` lógico y la consistencia la garantizan los eventos y los casos de uso. Las entidades de dominio no son los modelos de Prisma: cada repositorio mapea entre ambos.

## Alternativas consideradas

| Opción                            | Pros                                                   | Contras                                                  |
| --------------------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| Postgres + Prisma                 | tipado fuerte, migraciones declarativas, `multiSchema` | índices parciales y `CHECK` van en SQL manual            |
| Postgres + TypeORM                | entidades con decoradores                              | tienta a usar la entidad del ORM como entidad de dominio |
| MongoDB                           | flexible                                               | se pierde integridad referencial dentro de cada módulo   |
| Un solo schema con FKs entre todo | integridad total                                       | acopla los módulos en la base; imposible extraer uno     |

## Consecuencias

- Los repositorios tienen mappers `dominio ↔ fila`. Es más código pero el dominio queda libre de Prisma.
- Las restricciones que Prisma no expresa están documentadas en `MODELO-DE-DATOS.md §5` y viven en la migración.
- `email` de usuarios se guarda normalizado en minúsculas desde el dominio (no se usa `citext`).
