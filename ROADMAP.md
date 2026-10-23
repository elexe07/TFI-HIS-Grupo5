# ROADMAP — Hospital Information System (HIS)

**Materia:** Programación 4 · **Trabajo final grupal** · **Fecha:** 2026-10-23 · **Estado:** planificación

Plan de trabajo armado a partir de la consigna (`docs/`) y de las guías de buenas prácticas (`buenas-practicas-y-arquitectura/`). El objetivo es cumplir **lo que pide la cátedra**, bien hecho y con la arquitectura que piden las guías, sin convertirlo en un sistema hospitalario real. Lo que quedó afuera a propósito está en la sección 10.

Convención de estado: `[ ]` pendiente · `[~]` en curso · `[x]` hecho.

---

## 1. Alcance

Seis módulos con las responsabilidades textuales de la consigna. Roles: **Administrador, Médico, Enfermero, Recepcionista, Paciente**.

| #   | Módulo                             | Qué tiene que hacer (mínimo para aprobar)                                                                                                                         |
| --- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | IAM (Identidad y Accesos)          | Login con JWT, usuarios con un rol, permisos por rol (RBAC), protección de endpoints por permiso.                                                                 |
| 2   | Admisión y Turnos                  | Alta y búsqueda de pacientes, agenda semanal por médico, reservar y cancelar turnos, triaje de guardia con cola ordenada por nivel.                               |
| 3   | HCE (Historia Clínica Electrónica) | Una historia por paciente. Evoluciones **inmutables**, alergias, antecedentes familiares, prescripciones y estudios. Consulta de la historia completa.            |
| 4   | Atención y Enfermería              | Signos vitales, indicaciones generadas desde las prescripciones, administración de medicación, notas de enfermería.                                               |
| 5   | Recursos y Camas                   | Mapa de camas con estados (libre, ocupada, en limpieza, bloqueada), internar y dar de alta, inventario básico de insumos con descuento al administrar medicación. |
| 6   | Facturación y Administración       | Cargos automáticos a partir de eventos (consulta, medicación, día-cama), validación de cobertura simulada, dos reportes (facturación por período y ocupación).    |

**Fuera de alcance** (sección 10): integración real con obras sociales, firma digital, app móvil, interoperabilidad HL7/FHIR, facturación legal, auditoría de lecturas, alertas clínicas automáticas, traslados entre camas, observabilidad avanzada.

---

## 2. Principios que aplicamos (de las guías)

1. **Arquitectura Explícita** (Hexagonal + Onion + Clean): tres bloques, UI → Núcleo ← Infraestructura. Las dependencias apuntan siempre al dominio.
2. **Package by Component**: cada módulo es una carpeta con `domain / application / infrastructure / api`. Un módulo solo importa de otro lo que está en su carpeta `public/`.
3. **Puertos y adaptadores**: los repositorios son interfaces en el dominio; Prisma vive solo en `infrastructure`.
4. **Clean Code**: nombres que revelan intención, funciones chicas de una sola cosa, sin flags booleanos, sin números mágicos, excepciones en vez de códigos de error, Ley de Demeter.
5. **TDD** en dominio y casos de uso (rojo → verde → refactor). "Refactorizar sin pruebas es cambiar cosas y rezar".
6. **Regla del Boy Scout**: cada PR deja el código un poco mejor. Nada de "después lo arreglo" (Ley de LeBlanc).
7. **ADRs** para las decisiones importantes, una decisión por archivo. Si una discusión se repite, falta un ADR.
8. **C4** nivel 1 y 2 y un **DFD** nivel 0 como documentación visual.
9. **GitHub Flow + CI**: `main` protegida, ramas cortas, PR con revisión y pipeline verde.
10. **Fitness function**: un test automático de arquitectura que rompe el build si alguien viola las reglas de dependencia.

---

## 3. Decisiones (ADRs de la Fase 0)

| ADR     | Decisión                   | Recomendación por defecto                                                                                            |
| ------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| ADR-001 | Stack backend              | **TypeScript + NestJS** (Node 24). NestJS ya trae módulos, inyección de dependencias y guards.                       |
| ADR-002 | Estilo arquitectónico      | **Monolito modular**, un módulo por carpeta, eventos en memoria entre módulos.                                       |
| ADR-003 | Base de datos y ORM        | **PostgreSQL + Prisma**. Un schema de Postgres por módulo, sin FKs entre schemas.                                    |
| ADR-004 | Comunicación entre módulos | Eventos en memoria con `@nestjs/event-emitter`.                                                                      |
| ADR-005 | Autenticación              | JWT propio emitido por IAM, un rol por usuario, permisos como claims.                                                |
| ADR-006 | Frontend                   | **React + TypeScript (Vite)** con pantallas mínimas por módulo. Si la cátedra no evalúa UI, solo Swagger. Confirmar. |
| ADR-007 | Branching y CI             | **GitHub Flow + GitHub Actions**.                                                                                    |
| ADR-008 | Inmutabilidad de la HCE    | Append-only: las evoluciones no se editan ni borran; el repositorio no expone `update` ni `delete`.                  |

Se cierran en una reunión de 45 minutos. Si nadie tiene una preferencia fuerte, se adopta la recomendación.

---

## 4. Arquitectura

### 4.1 C4 nivel 1 y 2

```
[Recepcionista] [Médico] [Enfermero] [Administrador] [Paciente]
                            |
                   +--------v--------+        +------------------+
                   |  Web (React)    | -----> |  API (NestJS)    |
                   +-----------------+  HTTP  |  6 módulos       |
                                              +--------+---------+
                                                       |
                                              +--------v---------+
                                              |  PostgreSQL      |
                                              |  1 schema/módulo |
                                              +------------------+
          Sistemas externos: Obra social (simulada con un adaptador fake)
```

### 4.2 Anatomía de un módulo

```
apps/api/src/modules/<modulo>/
├── domain/            entidades, value objects, enums, errores, puertos (interfaces + token de inyección)
├── application/       casos de uso (un archivo por caso de uso + su .spec.ts), handlers de eventos
├── infrastructure/    repositorios Prisma, adaptadores externos, binding token → implementación
├── api/               controllers y DTOs (class-validator)
├── public/            eventos de integración y contratos que otros módulos pueden importar
└── <modulo>.module.ts
```

Repositorio:

```
/
├── ROADMAP.md · MODELO-DE-DATOS.md · README.md
├── docs/  (adr/, c4/, dfd/, consigna/)
├── apps/api   (NestJS)   ·   apps/web (React)
├── apps/api/prisma/schema.prisma
├── apps/api/.dependency-cruiser.cjs
├── docker-compose.yml  (Postgres)
└── .github/workflows/ci.yml
```

### 4.3 Reglas de dependencia (verificadas por dependency-cruiser)

| Regla                                                                                            | Falla si…                          |
| ------------------------------------------------------------------------------------------------ | ---------------------------------- |
| `domain/` no importa de `application`, `infrastructure`, `api` ni de `@nestjs/*` ni `@prisma/*`. | el dominio conoce el framework     |
| `application/` no importa de `infrastructure` ni `api`.                                          | un caso de uso usa Prisma directo  |
| Un módulo solo importa de otro lo que está en `public/`.                                         | Facturación lee la tabla de turnos |
| `building-blocks/` no importa de ningún módulo.                                                  | el shared kernel conoce el negocio |

### 4.4 Eventos entre módulos

| Evento                   | Lo publica | Lo consume                                                     |
| ------------------------ | ---------- | -------------------------------------------------------------- |
| `PacienteRegistrado`     | Admisión   | HCE: abre la historia clínica                                  |
| `EvolucionRegistrada`    | HCE        | Facturación: cargo por consulta                                |
| `PrescripcionCreada`     | HCE        | Enfermería: genera las indicaciones                            |
| `MedicacionAdministrada` | Enfermería | Recursos: descuenta insumo · Facturación: cargo por medicación |
| `PacienteInternado`      | Recursos   | Facturación: abre cuenta de internación                        |
| `PacienteDadoDeAlta`     | Recursos   | Facturación: cargo por días de cama y cierra la cuenta         |

Cada consumidor guarda el `eventoId` que lo originó para no duplicar si el evento se repite.

---

## 5. Fases

Pensado para unas 10 semanas. Ajustar a las fechas de la cátedra en la primera reunión. Después de la Fase 2, cada integrante avanza con su módulo en paralelo.

| Fase          | Semanas | Entregable visible                                                                            |
| ------------- | ------- | --------------------------------------------------------------------------------------------- |
| 0 Kickoff     | 1       | Repo, ADRs, C4 N1/N2, DFD N0, reparto de módulos                                              |
| 1 Esqueleto   | 1       | API levanta con Docker, un módulo de ejemplo de punta a punta, CI verde, test de arquitectura |
| 2 IAM         | 1       | Login, roles, permisos, endpoints protegidos                                                  |
| 3 Admisión    | 1.5     | Pacientes, agenda, turnos, triaje                                                             |
| 4 HCE         | 1.5     | Historia inmutable, evoluciones, prescripciones                                               |
| 5 Enfermería  | 1       | Indicaciones, signos vitales, administración                                                  |
| 6 Recursos    | 1       | Mapa de camas, internaciones, insumos                                                         |
| 7 Facturación | 1       | Cargos por eventos, cobertura fake, reportes                                                  |
| 8 Cierre      | 1       | Demo de punta a punta, documentación final, presentación                                      |

### Fase 0 — Kickoff

- [x] Repo en GitHub, `README.md`, `.gitignore`, `.editorconfig`. Mover los `.docx` a `docs/consigna/`.
- [~] Reunión de ADRs (45 min): cerrar ADR-001 a ADR-008 y escribirlos con la plantilla de la sección 11.
- [x] C4 nivel 1 y 2 en `docs/c4/` y DFD nivel 0 en `docs/dfd/` (Mermaid).
- [~] Proteger `main`: PR obligatorio, 1 aprobación, CI verde. Plantilla de PR.
- [ ] Reparto de módulos (sección 9) y tablero de issues con las fases 1 y 2 cargadas.

### Fase 1 — Esqueleto

- [x] Monorepo pnpm: `apps/api` NestJS con `strict: true`, ESLint + Prettier, `apps/web` Vite + React.
- [x] `building-blocks/`: `Entity`, `AggregateRoot`, `ValueObject`, `DomainError`, `EventBus` en memoria, `Clock` con token.
- [x] Módulo de ejemplo con un caso de uso `CrearSaludo` hecho con TDD. Define la convención de tokens de inyección para los puertos.
- [x] `docker-compose.yml` con Postgres; `schema.prisma` con un schema por módulo; migración inicial.
- [x] Test de integración de ejemplo contra Postgres (Testcontainers o el Postgres del compose en CI).
- [x] `.dependency-cruiser.cjs` con las reglas de 4.3. Romper una regla a propósito y verificar que el CI falla.
- [x] CI: install → lint + typecheck → unit tests → dependency-cruiser → integration tests → build.
- [x] Swagger con `@nestjs/swagger`. Filtro global de errores: error de dominio → 4xx, inesperado → 500.
- [x] README "cómo levantar en 5 minutos".

**Listo cuando:** alguien que no participó clona, levanta y ve Swagger siguiendo solo el README.

### Fase 2 — IAM

- [x] Dominio por TDD: `Usuario` (email único, password hasheado, un rol), `Rol` con permisos.
- [x] Casos de uso: registrar usuario, iniciar sesión, asignar rol, listar usuarios.
- [x] `@RequierePermiso(PERMISOS.HCE_LEER)` + guard global, exportados desde `iam/public/`.
- [x] Seed de los 5 roles con sus permisos y un administrador inicial por variable de entorno.
- [x] Matriz rol × permiso en `docs/iam-permisos.md`, cubierta por tests.
- [ ] Pantalla de login en la web y guardado del token (se hace junto con la primera pantalla real).

### Fase 3 — Admisión y Turnos

- [ ] Dominio por TDD: `Paciente`, `Agenda` (franjas semanales), `Turno` (estados: reservado, cancelado, atendido), `Triaje` (niveles rojo a azul).
- [ ] Casos de uso: registrar paciente, buscar paciente, definir agenda, reservar turno (sin solapar), cancelar turno, registrar triaje, ver cola de guardia.
- [ ] Publica `PacienteRegistrado`.
- [ ] Pantallas: alta/búsqueda de paciente, reservar turno, cola de guardia.

### Fase 4 — HCE

- [ ] Dominio por TDD: `HistoriaClinica`, `Evolucion` (inmutable), `Alergia`, `AntecedenteFamiliar`, `Prescripcion`, `Estudio`.
- [ ] Repositorio sin `update` ni `delete` para evoluciones. Test de arquitectura o unitario que lo verifique.
- [ ] Casos de uso: abrir historia (por evento), registrar evolución, registrar alergia, registrar antecedente, crear prescripción (bloquea si hay alergia al medicamento), registrar estudio, consultar historia.
- [ ] Acceso: Médico y Enfermero leen cualquier historia; Paciente solo la propia.
- [ ] Publica `EvolucionRegistrada` y `PrescripcionCreada`.
- [ ] Pantallas: historia clínica como línea de tiempo, nueva evolución, nueva prescripción.

### Fase 5 — Enfermería

- [ ] Dominio por TDD: `Indicacion` (pendiente, ejecutada, omitida), `SignosVitales` con rangos válidos, `AdministracionDeMedicacion`, `NotaDeEnfermeria`.
- [ ] Handler de `PrescripcionCreada` → genera indicaciones según frecuencia y duración.
- [ ] Casos de uso: registrar signos vitales, administrar medicación (solo con indicación pendiente, una sola vez), omitir indicación con motivo, registrar nota, ver indicaciones del día.
- [ ] Publica `MedicacionAdministrada`.
- [ ] Pantalla: indicaciones del día por paciente y carga de signos vitales.

### Fase 6 — Recursos y Camas

- [ ] Dominio por TDD: `Cama` con máquina de estados (libre → ocupada → en limpieza → libre; libre ↔ bloqueada), `Internacion`, `Insumo` (stock no negativo).
- [ ] Casos de uso: internar paciente (asigna cama libre), dar de alta, cambiar estado de cama, ver mapa de camas, registrar ingreso de insumo, listar insumos bajo mínimo.
- [ ] Handler de `MedicacionAdministrada` → descuenta insumo.
- [ ] Publica `PacienteInternado` y `PacienteDadoDeAlta`.
- [ ] Pantalla: mapa de camas con colores por estado.

### Fase 7 — Facturación

- [ ] Dominio por TDD: `Cuenta` (una por consulta o internación), `Cargo` idempotente por evento, `Tarifa`.
- [ ] Handlers: `EvolucionRegistrada` → cargo consulta; `MedicacionAdministrada` → cargo medicación; `PacienteInternado` → abre cuenta; `PacienteDadoDeAlta` → cargo por días de cama y cierra cuenta.
- [ ] Validar cobertura con un adaptador fake (acepta o rechaza según la obra social) detrás de un puerto.
- [ ] Reportes: facturación por período y ocupación de camas.
- [ ] Pantalla: cuenta del paciente y los dos reportes.

### Fase 8 — Cierre

- [ ] Test end-to-end del flujo demo: registrar paciente → turno → evolución con prescripción → internar → administrar medicación → alta → cuenta cerrada → reporte.
- [ ] Pasada de Clean Code por módulo (funciones largas, duplicación, nombres) con tests en verde.
- [ ] Documentación final: README, ADRs, C4, DFD, matriz de permisos, Swagger exportado.
- [ ] Guion de presentación de 10 minutos y retrospectiva breve en `docs/retrospectiva.md`.

---

## 6. Backlog (un issue por fila)

| ID     | Caso de uso                                                          | Rol                          | Tests mínimos                                                                 |
| ------ | -------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------- |
| IAM-01 | Registrar usuario                                                    | Administrador                | email duplicado falla; password débil falla                                   |
| IAM-02 | Iniciar sesión                                                       | Todos                        | credenciales inválidas; el token trae rol y permisos                          |
| IAM-03 | Asignar rol                                                          | Administrador                | no se puede quitar el último administrador                                    |
| IAM-04 | Proteger endpoint por permiso                                        | Sistema                      | 401 sin token, 403 sin permiso                                                |
| IAM-05 | Listar usuarios                                                      | Administrador                | —                                                                             |
| ADM-01 | Registrar paciente                                                   | Recepcionista                | documento duplicado falla; emite `PacienteRegistrado`                         |
| ADM-02 | Buscar paciente                                                      | Recepcionista, Médico        | por documento o apellido                                                      |
| ADM-03 | Definir agenda del médico                                            | Administrador                | franjas del mismo día no se solapan                                           |
| ADM-04 | Reservar turno                                                       | Recepcionista, Paciente      | fuera de agenda falla; franja ocupada falla                                   |
| ADM-05 | Cancelar turno                                                       | Recepcionista, Paciente      | solo si está reservado                                                        |
| ADM-06 | Registrar triaje                                                     | Enfermero                    | nivel obligatorio                                                             |
| ADM-07 | Cola de guardia                                                      | Enfermero, Médico            | ordenada por nivel y luego llegada                                            |
| HCE-01 | Abrir historia (por evento)                                          | Sistema                      | no duplica si llega dos veces                                                 |
| HCE-02 | Registrar evolución                                                  | Médico                       | inmutable; emite `EvolucionRegistrada`                                        |
| HCE-03 | Registrar alergia                                                    | Médico, Enfermero            | duplicada falla                                                               |
| HCE-04 | Registrar antecedente familiar                                       | Médico                       | —                                                                             |
| HCE-05 | Crear prescripción                                                   | Médico                       | alergia al medicamento bloquea; emite `PrescripcionCreada`                    |
| HCE-06 | Registrar estudio                                                    | Médico                       | —                                                                             |
| HCE-07 | Consultar historia                                                   | Médico, Enfermero, Paciente  | paciente solo ve la propia                                                    |
| ENF-01 | Generar indicaciones (por evento)                                    | Sistema                      | cantidad según frecuencia × duración                                          |
| ENF-02 | Registrar signos vitales                                             | Enfermero                    | valores fuera de rango fallan                                                 |
| ENF-03 | Administrar medicación                                               | Enfermero                    | requiere indicación pendiente; no se repite; emite evento                     |
| ENF-04 | Omitir indicación                                                    | Enfermero                    | motivo obligatorio                                                            |
| ENF-05 | Registrar nota de enfermería                                         | Enfermero                    | —                                                                             |
| ENF-06 | Indicaciones del día                                                 | Enfermero                    | —                                                                             |
| REC-01 | Internar paciente                                                    | Médico, Recepcionista        | solo cama libre; un paciente no tiene dos internaciones activas; emite evento |
| REC-02 | Dar de alta                                                          | Médico                       | cama pasa a en limpieza; emite evento                                         |
| REC-03 | Cambiar estado de cama                                               | Enfermero, Administrador     | transiciones inválidas fallan                                                 |
| REC-04 | Mapa de camas                                                        | Todos los internos           | conteo por estado                                                             |
| REC-05 | Ingreso de insumo                                                    | Administrador                | stock suma                                                                    |
| REC-06 | Descontar insumo (por evento)                                        | Sistema                      | stock no negativo; idempotente                                                |
| REC-07 | Insumos bajo mínimo                                                  | Administrador                | —                                                                             |
| FAC-01 | Cargo por consulta (por evento)                                      | Sistema                      | idempotente; usa la tarifa vigente                                            |
| FAC-02 | Cargo por medicación (por evento)                                    | Sistema                      | idempotente                                                                   |
| FAC-03 | Cuenta de internación: abrir y cerrar con días de cama (por eventos) | Sistema                      | días = alta − ingreso, mínimo 1                                               |
| FAC-04 | Validar cobertura (fake)                                             | Recepcionista                | aprobada / rechazada según obra social                                        |
| FAC-05 | Ver cuenta del paciente                                              | Administrador, Recepcionista | total = suma de cargos                                                        |
| FAC-06 | Reporte de facturación por período                                   | Administrador                | cuadra con los cargos                                                         |
| FAC-07 | Reporte de ocupación                                                 | Administrador                | por estado de cama                                                            |

---

## 7. Cómo trabajamos

**Ramas y commits.** GitHub Flow: `main` protegida, una rama por issue (`feat/ADM-04-reservar-turno`), máximo 3 días de vida, squash merge. Commits en formato Conventional Commits: `feat(admision): reservar turno (ADM-04)`.

**Revisión de PR.** Se aprueba si:

1. Hace una sola cosa y cierra un issue.
2. Tiene tests nuevos que fallaban antes del cambio.
3. Las dependencias apuntan hacia adentro y no toca internals de otro módulo.
4. Los nombres se entienden sin comentarios; las funciones son cortas y hacen una cosa.
5. Dejó el código un poco mejor de lo que estaba.

**Definition of Done.** Tests unitarios de dominio y aplicación en verde · test de integración si hay repositorio nuevo · dependency-cruiser en verde · lint sin errores · endpoint en Swagger · PR aprobado y mergeado con CI verde.

**Tests.** Tres niveles: unitarios de dominio y de casos de uso con repositorios en memoria (la mayoría), de integración para los repositorios Prisma, y un end-to-end del flujo demo. Jest. Nombres descriptivos: `it('debería fallar si la franja está ocupada')`.

**CI (GitHub Actions).** `pnpm install` → `lint` + `tsc --noEmit` → `test` → `depcruise --validate` → `test:integration` (con Postgres de servicio) → `build`. Objetivo: menos de 8 minutos.

**Reuniones.** Sync semanal de 30 minutos. Reunión de ADR solo cuando aparece una decisión nueva, 30 a 45 minutos.

---

## 8. Documentación a entregar

| Artefacto                                      | Dónde                   |
| ---------------------------------------------- | ----------------------- |
| ADR-001 a ADR-008 (más los que surjan)         | `docs/adr/`             |
| C4 nivel 1 (contexto) y nivel 2 (contenedores) | `docs/c4/`              |
| DFD nivel 0                                    | `docs/dfd/`             |
| DER y modelo de datos                          | `MODELO-DE-DATOS.md`    |
| Matriz rol × permiso                           | `docs/iam-permisos.md`  |
| Swagger exportado                              | `docs/api/openapi.json` |
| README con instrucciones de ejecución          | raíz                    |
| Este roadmap con el estado marcado             | raíz                    |

---

## 9. Reparto

Cada módulo tiene un responsable y un revisor habitual. Nadie revisa su propio módulo (Ley de Conway: la forma del equipo es la forma del software).

| Módulo                           | Responsable     | Revisor |
| -------------------------------- | --------------- | ------- |
| Esqueleto + CI + building-blocks |                 |         |
| IAM                              |                 |         |
| Admisión y Turnos                |                 |         |
| HCE                              |                 |         |
| Enfermería                       |                 |         |
| Recursos y Camas                 |                 |         |
| Facturación                      |                 |         |
| Frontend                         | rota por módulo |         |

Sugerencia según tamaño: con 3 personas, A = esqueleto + IAM + Facturación, B = Admisión + Recursos, C = HCE + Enfermería. Con 4, se separa Facturación. Con 5 o 6, un módulo por persona.

---

## 10. Fuera de alcance (ideas si sobra tiempo)

Se documentan para mostrar que se pensaron, pero **no son parte del compromiso de entrega**:

- Auditoría de lecturas de la historia clínica, adendas a evoluciones, hash de integridad.
- Refresh tokens con rotación, bloqueo por intentos fallidos.
- Traslados entre camas, historial de estados de cama, alertas clínicas automáticas por signos vitales.
- Outbox transaccional para eventos, cola externa, microservicios.
- Facturas con numeración legal, nomenclador historizado, integración real con obras sociales.
- C4 nivel 3 por módulo, DFD nivel 1, SonarCloud, DAST, deploy a staging, métricas y trazas.
- Portal de autogestión del paciente completo (solo queda ver su historia y sus turnos).

La versión extendida de este plan y del modelo de datos, con todo lo anterior, quedó en `_version-extendida/` como referencia. No se evalúa.

---

## 11. Plantillas

**ADR** (`docs/adr/ADR-nnn-titulo.md`)

```markdown
# ADR-nnn: <decisión en una frase>

- Estado: Propuesto | Aceptado | Reemplazado
- Fecha: AAAA-MM-DD

## Contexto

¿Qué problema obliga a decidir?

## Decisión

Qué se decide.

## Alternativas consideradas

| Opción | Pros | Contras |

## Consecuencias

Qué gana y qué pierde el proyecto con esto.
```

**Pull Request** (`.github/pull_request_template.md`)

```markdown
Closes #<issue>

## Qué hace

## Cómo probarlo

## Checklist

- [ ] Tests nuevos en verde (unitarios / integración)
- [ ] dependency-cruiser en verde
- [ ] No toco internals de otro módulo
- [ ] Swagger / ADR actualizados si corresponde
```
