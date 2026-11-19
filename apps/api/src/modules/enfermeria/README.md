# Módulo Atención y Enfermería

**Responsable:** Implementado · **Fase:** 5 · **Estado:** Completado [x]

## Qué pide la consigna

Control de signos vitales, administración de medicación prescrita, ejecución de indicaciones médicas y notas de enfermería.

## Casos de uso (ROADMAP §6)

| ID     | Caso de uso                                            | Implementación                                                              | Tests                                   |
| ------ | ------------------------------------------------------ | --------------------------------------------------------------------------- | --------------------------------------- |
| ENF-01 | Generar indicaciones (por evento `PrescripcionCreada`) | cantidad = (24 / frecuencia) × duración; idempotente                        | Unitario en application + E2E + Handler |
| ENF-02 | Registrar signos vitales                               | rangos biológicos (Temp 30–45 °C, SpO₂ 50–100%, TA, FC); inmutable          | Unitario en domain + application + E2E  |
| ENF-03 | Administrar medicación                                 | requiere indicación pendiente; no se repite; emite `MedicacionAdministrada` | Unitario en domain + application + E2E  |
| ENF-04 | Omitir indicación                                      | motivo obligatorio; pasa a estado `OMITIDA`                                 | Unitario en domain + application + E2E  |
| ENF-05 | Registrar nota de enfermería                           | texto obligatorio; inmutable                                                | Unitario en domain + application + E2E  |
| ENF-06 | Indicaciones del día                                   | filtro por internación, paciente y fecha                                    | Unitario en application + E2E           |

## Dominio

- `Indicacion`: agregado con ciclo de vida `PENDIENTE → EJECUTADA` / `PENDIENTE → OMITIDA`.
- `SignosVitales`: entidad inmutable con validación de rangos biológicos y valores fisiológicos.
- `AdministracionDeMedicacion`: entidad inmutable que registra la dosis administrada.
- `NotaDeEnfermeria`: entidad inmutable para notas de evolución de cuidados.

## Eventos

| Consume                                         | Publica                                                                                                                                                   |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hce.prescripcion-creada` → genera indicaciones | `enfermeria.medicacion-administrada { administracionId, indicacionId, pacienteId, internacionId, medicamento, administradaPor }` → Recursos y Facturación |

## Tablas (MODELO-DE-DATOS §2.4)

`enfermeria.indicaciones`, `enfermeria.signos_vitales`, `enfermeria.administraciones_medicacion`, `enfermeria.notas_enfermeria`.

## Endpoints HTTP

- `GET /api/enfermeria/indicaciones?internacionId=&pacienteId=&fecha=` (`enfermeria:leer`)
- `POST /api/enfermeria/indicaciones/:id/administrar` (`enfermeria:registrar`)
- `POST /api/enfermeria/indicaciones/:id/omitir` (`enfermeria:registrar`)
- `POST /api/enfermeria/signos-vitales` (`enfermeria:registrar`)
- `GET /api/enfermeria/signos-vitales?pacienteId=&internacionId=` (`enfermeria:leer`)
- `POST /api/enfermeria/notas` (`enfermeria:registrar`)
- `GET /api/enfermeria/notas?pacienteId=&internacionId=` (`enfermeria:leer`)
- `POST /api/enfermeria/indicaciones/generar` (`enfermeria:registrar`)

## UI Frontend (Vue)

- Ruta: `/enfermeria` en `apps/web` (código en `apps/web/src/modules/enfermeria/`).
- Funcionalidades: consulta y ejecución de indicaciones del día (administrar y omitir), registro y visualización de signos vitales con alertas, carga de notas de enfermería.

## Estructura

Todos los módulos tienen la misma forma (copiada de `modules/ejemplo/`):

```
enfermeria/
├── domain/                     ← reglas de negocio + PUERTOS (*.repository.ts). Sin Nest/Prisma
│   ├── events/                   medicacion-administrada.ts
│   ├── administracion-medicacion.repository.ts
│   ├── administracion-medicacion.ts
│   ├── errores.ts
│   ├── estado-indicacion.ts
│   ├── indicacion.repository.ts
│   ├── indicacion.ts
│   ├── nota-enfermeria.repository.ts
│   ├── nota-enfermeria.ts
│   ├── signos-vitales.repository.ts
│   └── signos-vitales.ts
├── application/                ← casos de uso: una carpeta por caso (command/query + handler + spec)
│   ├── administrar-medicacion/
│   ├── generar-indicaciones/
│   ├── listar-indicaciones/
│   ├── listar-notas-enfermeria/
│   ├── listar-signos-vitales/
│   ├── omitir-indicacion/
│   ├── registrar-nota-enfermeria/
│   ├── registrar-signos-vitales/
│   ├── event-handlers/           @OnEvent: on-prescripcion-creada
│   └── administracion-medicacion.dto.ts  indicacion.dto.ts  nota-enfermeria.dto.ts  signos-vitales.dto.ts  mapeos dominio → DTO de respuesta
├── infrastructure/             ← adaptadores: implementan los puertos con Prisma (o simulados)
│   ├── administracion-medicacion.repository.prisma.ts
│   ├── indicacion.repository.prisma.ts
│   ├── nota-enfermeria.repository.prisma.ts
│   └── signos-vitales.repository.prisma.ts
├── api/                        ← controllers HTTP + DTOs de entrada con class-validator
│   ├── enfermeria.controller.ts
│   └── dto/                      6 DTOs de entrada
├── public/                     ← lo ÚNICO que otros módulos pueden importar (eventos, tipos)
│   └── index.ts
├── testing/                    ← repositorios en memoria y fakes para los tests
│   └── administracion-medicacion.repository.en-memoria, index, indicacion.repository.en-memoria, nota-enfermeria.repository.en-memoria, signos-vitales.repository.en-memoria
└── enfermeria.module.ts        ← enchufa todo: { provide: PUERTO, useClass: AdaptadorPrisma }
```

## Cómo explicarlo (de la pantalla a la base de datos)

Caso: **administrar una medicación** (un evento lo escuchan dos módulos).

```
[web] modules/enfermeria/views/IndicacionesView.vue  botón "Administrar" → enfermeriaStore.administrarIndicacion(id)
  → modules/enfermeria/enfermeria.store.ts           administrarIndicacion()
    → modules/enfermeria/enfermeria.api.ts           POST /api/enfermeria/indicaciones/:id/administrar
[api] api/enfermeria.controller.ts                   @RequierePermiso(ENFERMERIA_REGISTRAR)
  → application/administrar-medicacion/              AdministrarMedicacionHandler.ejecutar(command)
    → indicacion.repository.buscarPorId              si no existe: IndicacionNoEncontrada
    → administracion-medicacion.repository           si ya se administró: MedicacionYaAdministrada
    → domain/indicacion.ts                           indicacion.administrar(...) → registra MedicacionAdministrada
    → guarda indicación, administración y una nota de enfermería automática
    → EventBus.publicar(...)  'enfermeria.medicacion-administrada'
        → facturacion/.../aplicar-cargo-medicacion.handler.ts          (cobra la medicación)
        → recursos/.../descontar-insumo-al-administrar-medicacion.handler.ts  (descuenta stock)
  ← AdministracionMedicacionDto
```

Las indicaciones se generan solas cuando HCE publica `hce.prescripcion-creada`
(`application/event-handlers/on-prescripcion-creada.handler.ts`).

Pantallas de este módulo: `apps/web/src/modules/enfermeria/` (ver `apps/web/README.md`).
