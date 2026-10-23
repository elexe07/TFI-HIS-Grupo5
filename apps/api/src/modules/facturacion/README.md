# Módulo Facturación y Administración

**Responsable:** ______ · **Revisor:** ______ · **Fase:** 7 (último: consume eventos de todos)

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
