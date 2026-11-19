# Módulo Facturación y Administración

**Responsable:** Ezequiel · **Revisor:** ______ · **Fase:** 7 (último: consume eventos de todos)

## Qué pide la consigna

Generación de cargos automáticos por atenciones, validación de cobertura con obras sociales/seguros y reportes administrativos.

## Casos de uso (ROADMAP §6)

| ID     | Caso de uso                                                          | Tests mínimos                                                 |
| ------ | -------------------------------------------------------------------- | ------------------------------------------------------------- |
| FAC-01 | Cargo por consulta (por evento)                                      | idempotente; usa la tarifa vigente                            |
| FAC-02 | Cargo por medicación (por evento)                                    | idempotente                                                   |
| FAC-03 | Cuenta de internación: abrir y cerrar con días de cama (por eventos) | días = alta − ingreso, mínimo 1                               |
| FAC-04 | Validar cobertura (fake)                                             | aprobada / rechazada según obra social                        |
| FAC-05 | Ver cuenta del paciente                                              | total = suma de cargos                                        |
| FAC-06 | Reporte de facturación por período                                   | cuadra con los cargos                                         |
| FAC-07 | Reporte de ocupación                                                 | por estado de cama (consulta el contrato público de Recursos) |

## Regla clave

Los cargos se crean **solo** desde eventos. Cada cargo guarda `origen_evento_id` (UNIQUE): si el mismo evento se procesa dos veces, el segundo intento no crea nada.

## Eventos que consume

| Evento                               | Acción                                                    |
| ------------------------------------ | --------------------------------------------------------- |
| `hce.evolucion-registrada`           | cuenta tipo CONSULTA (crea si no existe) + cargo CONSULTA |
| `enfermeria.medicacion-administrada` | cargo MEDICACION en la cuenta de la internación           |
| `recursos.paciente-internado`        | abre cuenta tipo INTERNACION                              |
| `recursos.paciente-dado-de-alta`     | cargo DIA_CAMA × días y cierra la cuenta                  |

Mientras los otros módulos no estén listos, probar los handlers con eventos falsos desde el test.

## Puerto externo

`ValidadorDeCobertura` (interfaz en `domain/`) con un adaptador `ValidadorDeCoberturaFake` en `infrastructure/` que aprueba o rechaza según el código de obra social. Documentar en un ADR que es simulado.

## Tablas (MODELO-DE-DATOS §2.6)

`facturacion.obras_sociales`, `facturacion.tarifas`, `facturacion.cuentas`, `facturacion.cargos`.

## Endpoints sugeridos

`GET /api/cuentas?pacienteId=` · `GET /api/cuentas/:id` · `POST /api/cobertura/validar` · `GET /api/reportes/facturacion?desde=&hasta=` · `GET /api/reportes/ocupacion`

## Permisos

`facturacion:leer`, `cobertura:validar`, `reportes:leer`

## Estructura

Todos los módulos tienen la misma forma (copiada de `modules/ejemplo/`):

```
facturacion/
├── domain/                     ← reglas de negocio + PUERTOS (*.repository.ts). Sin Nest/Prisma
│   ├── cargo.ts
│   ├── consultor-de-ocupacion.ts
│   ├── cuenta.repository.ts
│   ├── cuenta.ts
│   ├── enums.ts
│   ├── errores.ts
│   ├── obra-social.repository.ts
│   ├── obra-social.ts
│   ├── reporte-facturacion.repository.ts
│   ├── tarifa.repository.ts
│   ├── tarifa.ts
│   └── validador-de-cobertura.ts
├── application/                ← casos de uso: una carpeta por caso (command/query + handler + spec)
│   ├── cerrar-cuenta/
│   ├── consultar-cuenta/
│   ├── listar-cuentas-paciente/
│   ├── listar-obras-sociales/
│   ├── listar-tarifas/
│   ├── reportes/
│   ├── validar-cobertura/
│   └── event-handlers/           @OnEvent: abrir-cuenta-internacion, aplicar-cargo-consulta, aplicar-cargo-medicacion, cerrar-cuenta-internacion
├── infrastructure/             ← adaptadores: implementan los puertos con Prisma (o simulados)
│   ├── consultor-de-ocupacion.prisma.ts
│   ├── cuenta.repository.prisma.ts
│   ├── obra-social.repository.prisma.ts
│   ├── reporte-facturacion.repository.prisma.ts
│   ├── tarifa.repository.prisma.ts
│   └── validador-de-cobertura.simulado.ts
├── api/                        ← controllers HTTP + DTOs de entrada con class-validator
│   ├── cobertura.controller.ts
│   ├── cuentas.controller.ts
│   ├── obras-sociales.controller.ts
│   ├── reportes.controller.ts
│   └── dto/                      3 DTOs de entrada
├── public/                     ← lo ÚNICO que otros módulos pueden importar (eventos, tipos)
│   └── index.ts
├── testing/                    ← repositorios en memoria y fakes para los tests
│   └── consultor-de-ocupacion.falso, cuenta.repository.en-memoria, index, obra-social.repository.en-memoria, reporte-facturacion.repository.en-memoria, tarifa.repository.en-memoria, validador-de-cobertura.falso
└── facturacion.module.ts       ← enchufa todo: { provide: PUERTO, useClass: AdaptadorPrisma }
```

## Cómo explicarlo (de la pantalla a la base de datos)

Facturación casi no tiene "botones": **reacciona a eventos** de los otros módulos. Es el mejor módulo
para mostrar la comunicación por eventos.

Caso 1 (automático): **cobrar una consulta cuando el médico registra una evolución**.

```
hce publica 'hce.evolucion-registrada'
  → application/event-handlers/aplicar-cargo-consulta.handler.ts   @OnEvent(EVOLUCION_REGISTRADA)
    → cuenta.repository.existeCargoConOrigenEvento   idempotencia: si el evento ya se procesó, no cobra dos veces
    → busca (o abre) la cuenta del paciente          domain/cuenta.ts  Cuenta.abrir(...) con el % de su obra social
    → tarifa.repository.buscarPorConcepto(CONSULTA)  si no hay tarifa: TarifaNoEncontrada
    → domain/cargo.ts  Cargo.crear(...) + cuenta.agregarCargo(cargo)
    → cuenta.repository.guardar                      → infrastructure/cuenta.repository.prisma.ts
```

Caso 2 (pantalla): **ver el detalle de una cuenta**.

```
[web] modules/facturacion/views/CuentaDetalleView.vue  → facturacionStore.obtenerCuenta(id)
  → modules/facturacion/facturacion.api.ts             GET /api/cuentas/:id
[api] api/cuentas.controller.ts                        → application/consultar-cuenta/ConsultarCuentaHandler
  → cuenta.repository.buscarPorId                      → CuentaDetalleDto (cargos, total bruto, descuento por cobertura, total)
```

La validación de cobertura usa un puerto (`domain/validador-de-cobertura.ts`) con un adaptador **simulado**
(`infrastructure/validador-de-cobertura.simulado.ts`): para conectar una obra social real solo se cambia el
adaptador en `facturacion.module.ts`.

Pantallas de este módulo: `apps/web/src/modules/facturacion/` (ver `apps/web/README.md`).
