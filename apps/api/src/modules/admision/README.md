# Módulo Admisión y Turnos

**Responsable:** ______ · **Revisor:** ______ · **Fase:** 3

## Qué pide la consigna

Registro de pacientes, gestión de agenda médica, reserva/cancelación de turnos y triaje de guardia.

## Casos de uso (ROADMAP §6)

| ID     | Caso de uso               | Tests mínimos                                         |
| ------ | ------------------------- | ----------------------------------------------------- |
| ADM-01 | Registrar paciente        | documento duplicado falla; emite `PacienteRegistrado` |
| ADM-02 | Buscar paciente           | por documento o apellido                              |
| ADM-03 | Definir agenda del médico | franjas del mismo día no se solapan                   |
| ADM-04 | Reservar turno            | fuera de agenda falla; franja ocupada falla           |
| ADM-05 | Cancelar turno            | solo si está reservado                                |
| ADM-06 | Registrar triaje          | nivel obligatorio                                     |
| ADM-07 | Cola de guardia           | ordenada por nivel y luego llegada                    |

## Dominio

- `Paciente` (agregado), `Documento` (VO: tipo + número), `Cobertura` (VO: obra social + afiliado).
- `Agenda` (franjas semanales por médico), `Turno` con estados `RESERVADO → ATENDIDO` / `RESERVADO → CANCELADO`.
- `Triaje` con `NivelTriaje` ordenado: ROJO, NARANJA, AMARILLO, VERDE, AZUL.

## Eventos

| Publica                                                              | Lo consume                   |
| -------------------------------------------------------------------- | ---------------------------- |
| `admision.paciente-registrado` (`PacienteRegistrado { pacienteId }`) | HCE abre la historia clínica |

## Tablas (MODELO-DE-DATOS §2.2)

`admision.pacientes`, `admision.medicos`, `admision.agendas`, `admision.turnos`, `admision.triajes`.
El índice único parcial de turnos (médico + inicio, solo RESERVADO) ya está en la migración inicial.

## Endpoints sugeridos

`POST/GET /api/pacientes` · `GET /api/pacientes?documento=&apellido=` · `POST /api/medicos/:id/agenda` · `POST /api/turnos` · `DELETE /api/turnos/:id` · `POST /api/triajes` · `GET /api/guardia/cola`

## Permisos que usa (coordinar con IAM)

`pacientes:registrar`, `pacientes:leer`, `agenda:definir`, `turnos:reservar`, `turnos:cancelar`, `triaje:registrar`, `guardia:leer`
