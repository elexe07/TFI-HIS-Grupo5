# Módulo Atención y Enfermería

**Responsable:** Implementado · **Fase:** 5 · **Estado:** Completado [x]

## Qué pide la consigna

Control de signos vitales, administración de medicación prescrita, ejecución de indicaciones médicas y notas de enfermería.

## Casos de uso (ROADMAP §6)

| ID     | Caso de uso                                            | Implementación                                                              | Tests                                      |
| ------ | ------------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------ |
| ENF-01 | Generar indicaciones (por evento `PrescripcionCreada`) | cantidad = (24 / frecuencia) × duración; idempotente                        | Unitario en application + E2E + Handler    |
| ENF-02 | Registrar signos vitales                               | rangos biológicos (Temp 30–45 °C, SpO₂ 50–100%, TA, FC); inmutable         | Unitario en domain + application + E2E     |
| ENF-03 | Administrar medicación                                 | requiere indicación pendiente; no se repite; emite `MedicacionAdministrada` | Unitario en domain + application + E2E     |
| ENF-04 | Omitir indicación                                      | motivo obligatorio; pasa a estado `OMITIDA`                                 | Unitario en domain + application + E2E     |
| ENF-05 | Registrar nota de enfermería                           | texto obligatorio; inmutable                                                | Unitario en domain + application + E2E     |
| ENF-06 | Indicaciones del día                                   | filtro por internación, paciente y fecha                                    | Unitario en application + E2E              |

## Dominio

- `Indicacion`: agregado con ciclo de vida `PENDIENTE → EJECUTADA` / `PENDIENTE → OMITIDA`.
- `SignosVitales`: entidad inmutable con validación de rangos biológicos y valores fisiológicos.
- `AdministracionDeMedicacion`: entidad inmutable que registra la dosis administrada.
- `NotaDeEnfermeria`: entidad inmutable para notas de evolución de cuidados.

## Eventos

| Consume                                         | Publica                                                                                                                                              |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
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

## UI Frontend (React)

- Ruta: `/enfermeria` en `apps/web`.
- Funcionalidades: consulta y ejecución de indicaciones del día (administrar y omitir), registro y visualización de signos vitales con alertas, carga de notas de enfermería.
