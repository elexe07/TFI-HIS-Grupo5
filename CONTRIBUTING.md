# Cómo trabajamos

Resumen operativo del `ROADMAP.md` §7. Si algo acá contradice al roadmap, gana el roadmap.

## Flujo

1. Tomá un issue del tablero (máximo 2 "en curso" por persona).
2. Rama desde `main`: `feat/ADM-04-reservar-turno`, `fix/HCE-07-403-paciente`, `docs/adr-009-...`.
3. **Test primero** (rojo), código mínimo (verde), refactor. Commits chicos con Conventional Commits:
   `feat(admision): reservar turno (ADM-04)`.
4. Antes del PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm arch` en verde.
5. PR con la plantilla, enlazado al issue. Una aprobación de otro integrante (nunca el dueño del módulo revisa su propio módulo) + CI verde. Squash merge.
6. Ramas de máximo 3 días. Si no cierra, partí el trabajo.

## Dónde va cada cosa

| Quiero…                                   | Va en…                                                                        |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| una regla de negocio                      | `domain/` (entidad, VO o servicio de dominio) con su `.spec.ts`               |
| un caso de uso                            | `application/<caso>/` command + handler + spec (repo en memoria)              |
| hablar con Postgres o un servicio externo | `infrastructure/`, implementando un puerto de `domain/`                       |
| un endpoint                               | `api/` controller + DTO con class-validator; cero lógica                      |
| algo que otro módulo necesita             | `public/` (eventos y contratos)                                               |
| una decisión técnica                      | `docs/adr/ADR-nnn-titulo.md`                                                  |
| una tabla nueva                           | `MODELO-DE-DATOS.md` + `schema.prisma` + `pnpm api prisma:migrate --name ...` |

## Reglas que el CI hace cumplir

- `domain/` no importa NestJS ni Prisma.
- `application/` no importa `infrastructure/` ni `api/`.
- Un módulo solo importa de otro lo que está en `public/`.
- Sin `any`. Funciones de hasta 40 líneas y 3 parámetros (warning).
- Prettier y ESLint sin errores.

## Checklist de revisión

1. ¿Hace una sola cosa y cierra el issue?
2. ¿Los tests fallaban antes del cambio?
3. ¿Las reglas de negocio están en el dominio y no en el controller ni en el repositorio?
4. ¿Los nombres se entienden sin comentarios? ¿Hay flags booleanos o números mágicos?
5. ¿Quedó el código un poco mejor de lo que estaba?

## Convenciones de nombres

- Dominio en español (`Turno`, `Cama`, `reservar()`), técnico en inglés (`Repository`, `Handler`, `Dto`).
- Eventos en pasado y con prefijo de módulo: `admision.paciente-registrado`.
- Errores de dominio como clases: `FranjaOcupada extends Conflicto`.
- Tests: `describe('Cama')` + `it('debería pasar a EN_LIMPIEZA al dar de alta')`.
