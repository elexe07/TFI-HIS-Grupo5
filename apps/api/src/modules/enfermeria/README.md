# Módulo Atención y Enfermería

**Responsable:** ______ · **Revisor:** ______ · **Fase:** 5

## Qué pide la consigna

Control de signos vitales, administración de medicación prescrita, ejecución de indicaciones médicas y notas de enfermería.

## Casos de uso (ROADMAP §6)

| ID     | Caso de uso                                            | Tests mínimos                                                               |
| ------ | ------------------------------------------------------ | --------------------------------------------------------------------------- |
| ENF-01 | Generar indicaciones (por evento `PrescripcionCreada`) | cantidad = (24 / frecuencia) × duración; idempotente                        |
| ENF-02 | Registrar signos vitales                               | valores fuera de rango fallan                                               |
| ENF-03 | Administrar medicación                                 | requiere indicación pendiente; no se repite; emite `MedicacionAdministrada` |
| ENF-04 | Omitir indicación                                      | motivo obligatorio                                                          |
| ENF-05 | Registrar nota de enfermería                           | —                                                                           |
| ENF-06 | Indicaciones del día                                   | —                                                                           |

## Dominio

- `Indicacion` con estados `PENDIENTE → EJECUTADA` / `PENDIENTE → OMITIDA`.
- `SignosVitales` (VO con rangos: temperatura 30–45, SpO₂ 50–100).
- `AdministracionDeMedicacion`: una por indicación (unicidad en la tabla).

## Eventos

| Consume                                                                 | Publica                                                                                                                                    |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `hce.prescripcion-creada` → genera indicaciones                         | `enfermeria.medicacion-administrada { administracionId, pacienteId, internacionId, medicamento }` → Recursos (stock) y Facturación (cargo) |
| `recursos.paciente-internado` → (opcional) crea contexto de internación |                                                                                                                                            |

## Tablas (MODELO-DE-DATOS §2.4)

`enfermeria.indicaciones`, `enfermeria.signos_vitales`, `enfermeria.administraciones_medicacion`, `enfermeria.notas_enfermeria`.

## Endpoints sugeridos

`GET /api/internaciones/:id/indicaciones?dia=` · `POST /api/indicaciones/:id/administrar` · `POST /api/indicaciones/:id/omitir` · `POST /api/pacientes/:id/signos-vitales` · `POST /api/pacientes/:id/notas-enfermeria`

## Permisos

`enfermeria:registrar`, `enfermeria:leer`
