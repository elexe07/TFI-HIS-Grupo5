# Módulo Gestión de Recursos y Camas

**Responsable:** ______ · **Revisor:** ______ · **Fase:** 6

## Qué pide la consigna

Mapa de camas (ocupadas, libres, en limpieza, bloqueadas), asignación de pacientes a habitaciones y gestión básica de inventario.

## Casos de uso (ROADMAP §6)

| ID     | Caso de uso                   | Tests mínimos                                                                              |
| ------ | ----------------------------- | ------------------------------------------------------------------------------------------ |
| REC-01 | Internar paciente             | solo cama libre; un paciente no tiene dos internaciones activas; emite `PacienteInternado` |
| REC-02 | Dar de alta                   | cama pasa a EN_LIMPIEZA; emite `PacienteDadoDeAlta`                                        |
| REC-03 | Cambiar estado de cama        | transiciones inválidas fallan                                                              |
| REC-04 | Mapa de camas                 | conteo por estado                                                                          |
| REC-05 | Ingreso de insumo             | stock suma                                                                                 |
| REC-06 | Descontar insumo (por evento) | stock no negativo; idempotente                                                             |
| REC-07 | Insumos bajo mínimo           | —                                                                                          |

## Dominio: máquina de estados de `Cama`

```
LIBRE ──internar──▶ OCUPADA ──alta──▶ EN_LIMPIEZA ──limpia──▶ LIBRE
LIBRE ◀──desbloquear── BLOQUEADA ◀──bloquear── LIBRE
```

Cualquier otra transición lanza `TransicionDeCamaInvalida` (extiende `Conflicto` → HTTP 409). Cubrir la tabla completa de transiciones, válidas e inválidas, con `it.each`.

## Eventos

| Consume                                                                                                    | Publica                                                                                                  |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `enfermeria.medicacion-administrada` → descuenta `insumos.stock_actual` si `medicamento_asociado` coincide | `recursos.paciente-internado { internacionId, pacienteId, camaId, ingresoEn }` → Facturación, Enfermería |
|                                                                                                            | `recursos.paciente-dado-de-alta { internacionId, pacienteId, ingresoEn, egresoEn }` → Facturación        |

## Tablas (MODELO-DE-DATOS §2.5)

`recursos.habitaciones`, `recursos.camas`, `recursos.internaciones`, `recursos.insumos`.

## Endpoints sugeridos

`GET /api/camas/mapa` · `PATCH /api/camas/:id/estado` · `POST /api/internaciones` · `POST /api/internaciones/:id/alta` · `POST /api/insumos/:id/ingresos` · `GET /api/insumos?bajoMinimo=true`

## Permisos

`camas:leer`, `camas:gestionar`, `internaciones:gestionar`, `insumos:gestionar`

## Estructura

Todos los módulos tienen la misma forma (copiada de `modules/ejemplo/`):

```
recursos/
├── domain/                     ← reglas de negocio + PUERTOS (*.repository.ts). Sin Nest/Prisma
│   ├── events/                   paciente-dado-de-alta.ts, paciente-internado.ts
│   ├── cama.repository.ts
│   ├── cama.ts
│   ├── errores.ts
│   ├── eventos-procesados.repository.ts
│   ├── habitacion.repository.ts
│   ├── habitacion.ts
│   ├── index.ts
│   ├── insumo.repository.ts
│   ├── insumo.ts
│   ├── internacion.repository.ts
│   └── internacion.ts
├── application/                ← casos de uso: una carpeta por caso (command/query + handler + spec)
│   ├── cambiar-estado-cama/
│   ├── dar-de-alta/
│   ├── descontar-insumo-evento/
│   ├── internar-paciente/
│   ├── listar-insumos/
│   ├── listar-internaciones/
│   ├── obtener-mapa-camas/
│   ├── registrar-egreso-insumo/
│   ├── registrar-ingreso-insumo/
│   ├── event-handlers/           @OnEvent: descontar-insumo-al-administrar-medicacion
│   └── cama.dto.ts  insumo.dto.ts  internacion.dto.ts  mapeos dominio → DTO de respuesta
├── infrastructure/             ← adaptadores: implementan los puertos con Prisma (o simulados)
│   ├── cama.repository.prisma.ts
│   ├── eventos-procesados.repository.prisma.ts
│   ├── habitacion.repository.prisma.ts
│   ├── insumo.repository.prisma.ts
│   └── internacion.repository.prisma.ts
├── api/                        ← controllers HTTP + DTOs de entrada con class-validator
│   ├── camas.controller.ts
│   ├── insumos.controller.ts
│   ├── internaciones.controller.ts
│   └── dto/                      6 DTOs de entrada
├── public/                     ← lo ÚNICO que otros módulos pueden importar (eventos, tipos)
│   └── index.ts
├── testing/                    ← repositorios en memoria y fakes para los tests
│   └── cama.repository.en-memoria, eventos-procesados.repository.en-memoria, habitacion.repository.en-memoria, index, insumo.repository.en-memoria, internacion.repository.en-memoria
└── recursos.module.ts          ← enchufa todo: { provide: PUERTO, useClass: AdaptadorPrisma }
```

## Cómo explicarlo (de la pantalla a la base de datos)

Caso: **internar un paciente** (máquina de estados de la cama + evento hacia Facturación).

```
[web] modules/recursos/views/InternacionesView.vue  form → recursosStore.internarPaciente(data)
  → modules/recursos/recursos.store.ts              internarPaciente()
    → modules/recursos/recursos.api.ts              POST /api/internaciones
[api] api/internaciones.controller.ts               @RequierePermiso(INTERNACIONES_GESTIONAR), valida InternarPacienteDto
  → application/internar-paciente/                  InternarPacienteHandler.ejecutar(command)
    → cama.repository.buscarPorId                   si no existe: CamaNoEncontrada; si no está LIBRE: CamaNoLibre
    → internacion.repository.buscarActivaPorPacienteId   si ya está internado: PacienteYaInternado
    → domain/internacion.ts                         Internacion.crear(...) → registra PacienteInternado
    → domain/cama.ts                                cama.ocupar()   (LIBRE → OCUPADA)
    → guarda internación y cama                     → infrastructure/*.repository.prisma.ts
    → EventBus.publicar(...)  'recursos.paciente-internado'
        → facturacion/.../abrir-cuenta-internacion.handler.ts  (abre la cuenta del paciente)
  ← InternacionDto
```

Al dar de alta (`dar-de-alta/`) la cama pasa a EN_LIMPIEZA y se publica `recursos.paciente-dado-de-alta`,
que cierra la cuenta en Facturación.

Pantallas de este módulo: `apps/web/src/modules/recursos/` (ver `apps/web/README.md`).
