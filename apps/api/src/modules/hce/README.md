# Módulo HCE — Historia Clínica Electrónica

**Responsable:** Facu / Equipo · **Revisor:** ______ · **Fase:** 4 · **Estado:** implementado (backend)

## Qué pide la consigna

Información médica centralizada e **inmutable** del paciente: ficha, alergias, antecedentes familiares, evoluciones médicas y visualización de estudios.

## Casos de uso (ROADMAP §6)

| ID     | Caso de uso                                      | Handler                         | Tests mínimos                                              |
| ------ | ------------------------------------------------ | ------------------------------- | ---------------------------------------------------------- |
| HCE-01 | Abrir historia (por evento `PacienteRegistrado`) | `AbrirHistoriaHandler`          | no duplica si llega dos veces                              |
| HCE-02 | Registrar evolución                              | `RegistrarEvolucionHandler`     | inmutable; emite `EvolucionRegistrada`                     |
| HCE-03 | Registrar alergia                                | `RegistrarAlergiaHandler`       | duplicada falla                                            |
| HCE-04 | Registrar antecedente familiar                   | `RegistrarAntecedenteHandler`   | registra parentesco y condición                            |
| HCE-05 | Crear prescripción                               | `CrearPrescripcionHandler`      | alergia al medicamento bloquea; emite `PrescripcionCreada` |
| HCE-06 | Registrar estudio                                | `RegistrarEstudioHandler`       | tipo, fecha, descripción y resultado                       |
| HCE-07 | Consultar historia                               | `ConsultarHistoriaHandler`      | paciente solo ve la propia                                 |

## Regla clave: inmutabilidad (ADR-008)

- `Evolucion` y `AntecedenteFamiliar` no se editan ni se borran. El puerto `HistoriaClinicaRepository` **no tiene** métodos `actualizarEvolucion`, `eliminar`, `update` ni `delete`.
- El test `inmutabilidad.spec.ts` verifica por reflexión que el repositorio en memoria y el de Prisma no exponen esos métodos.

## Eventos

| Consume                                        | Publica                                                                                                                           |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `admision.paciente-registrado` → abre historia | `hce.evolucion-registrada { evolucionId, pacienteId, turnoId?, internacionId?, medicoId }` → Facturación                          |
|                                                | `hce.prescripcion-creada { prescripcionId, pacienteId, internacionId?, medicamento, frecuenciaHoras, duracionDias }` → Enfermería |

## Tablas (MODELO-DE-DATOS §2.3)

`hce.historias_clinicas`, `hce.evoluciones`, `hce.alergias`, `hce.antecedentes_familiares`, `hce.prescripciones`, `hce.estudios`.

## Endpoints

- `GET /api/pacientes/:id/historia` (Requiere `hce:leer`)
- `POST /api/pacientes/:id/historia/evoluciones` (Requiere `hce:escribir`)
- `POST /api/pacientes/:id/historia/alergias` (Requiere `hce:escribir`)
- `POST /api/pacientes/:id/historia/antecedentes` (Requiere `hce:escribir`)
- `POST /api/pacientes/:id/historia/prescripciones` (Requiere `prescripciones:crear`)
- `POST /api/pacientes/:id/historia/estudios` (Requiere `hce:escribir`)
