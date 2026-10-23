# Módulo HCE — Historia Clínica Electrónica

**Responsable:** ______ · **Revisor:** ______ · **Fase:** 4

## Qué pide la consigna

Información médica centralizada e **inmutable** del paciente: ficha, alergias, antecedentes familiares, evoluciones médicas y visualización de estudios.

## Casos de uso (ROADMAP §6)

| ID     | Caso de uso                                      | Tests mínimos                                              |
| ------ | ------------------------------------------------ | ---------------------------------------------------------- |
| HCE-01 | Abrir historia (por evento `PacienteRegistrado`) | no duplica si llega dos veces                              |
| HCE-02 | Registrar evolución                              | inmutable; emite `EvolucionRegistrada`                     |
| HCE-03 | Registrar alergia                                | duplicada falla                                            |
| HCE-04 | Registrar antecedente familiar                   | —                                                          |
| HCE-05 | Crear prescripción                               | alergia al medicamento bloquea; emite `PrescripcionCreada` |
| HCE-06 | Registrar estudio                                | —                                                          |
| HCE-07 | Consultar historia                               | paciente solo ve la propia                                 |

## Regla clave: inmutabilidad (ADR-008)

- `Evolucion` y `AntecedenteFamiliar` no se editan ni se borran. El puerto `HistoriaClinicaRepository` **no tiene** métodos `actualizarEvolucion` ni `eliminar`.
- Un test unitario verifica que el repositorio en memoria y el de Prisma no exponen esos métodos (o un test de arquitectura por nombre de método).

## Eventos

| Consume                                        | Publica                                                                                                                           |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `admision.paciente-registrado` → abre historia | `hce.evolucion-registrada { evolucionId, pacienteId, turnoId?, internacionId?, medicoId }` → Facturación                          |
|                                                | `hce.prescripcion-creada { prescripcionId, pacienteId, internacionId?, medicamento, frecuenciaHoras, duracionDias }` → Enfermería |

## Tablas (MODELO-DE-DATOS §2.3)

`hce.historias_clinicas`, `hce.evoluciones`, `hce.alergias`, `hce.antecedentes_familiares`, `hce.prescripciones`, `hce.estudios`.

## Endpoints sugeridos

`GET /api/pacientes/:id/historia` · `POST /api/pacientes/:id/historia/evoluciones` · `.../alergias` · `.../antecedentes` · `.../prescripciones` · `.../estudios`

## Permisos

`hce:leer`, `hce:escribir`, `prescripciones:crear`
