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

## Estructura

Todos los módulos tienen la misma forma (copiada de `modules/ejemplo/`):

```
admision/
├── domain/                     ← reglas de negocio + PUERTOS (*.repository.ts). Sin Nest/Prisma
│   ├── events/                   paciente-registrado.ts
│   ├── agenda.repository.ts
│   ├── agenda.ts
│   ├── cobertura.ts
│   ├── documento.ts
│   ├── errores.ts
│   ├── medico.repository.ts
│   ├── medico.ts
│   ├── paciente.repository.ts
│   ├── paciente.ts
│   ├── tipos.ts
│   ├── triaje.repository.ts
│   ├── triaje.ts
│   ├── turno.repository.ts
│   └── turno.ts
├── application/                ← casos de uso: una carpeta por caso (command/query + handler + spec)
│   ├── atender-triaje/
│   ├── buscar-paciente-por-id/
│   ├── buscar-pacientes/
│   ├── cancelar-turno/
│   ├── definir-agenda/
│   ├── listar-medicos/
│   ├── listar-turnos/
│   ├── obtener-agenda/
│   ├── obtener-cola-guardia/
│   ├── registrar-medico/
│   ├── registrar-paciente/
│   ├── registrar-triaje/
│   ├── reservar-turno/
│   └── agenda.dto.ts  medico.dto.ts  paciente.dto.ts  triaje.dto.ts  turno.dto.ts  mapeos dominio → DTO de respuesta
├── infrastructure/             ← adaptadores: implementan los puertos con Prisma (o simulados)
│   ├── agenda.repository.prisma.ts
│   ├── medico.repository.prisma.ts
│   ├── paciente.repository.prisma.ts
│   ├── triaje.repository.prisma.ts
│   └── turno.repository.prisma.ts
├── api/                        ← controllers HTTP + DTOs de entrada con class-validator
│   ├── guardia.controller.ts
│   ├── medicos.controller.ts
│   ├── pacientes.controller.ts
│   ├── triajes.controller.ts
│   ├── turnos.controller.ts
│   └── dto/                      7 DTOs de entrada
├── public/                     ← lo ÚNICO que otros módulos pueden importar (eventos, tipos)
│   └── index.ts
├── testing/                    ← repositorios en memoria y fakes para los tests
│   └── agenda.repository.en-memoria, index, medico.repository.en-memoria, paciente.repository.en-memoria, triaje.repository.en-memoria, turno.repository.en-memoria
└── admision.module.ts          ← enchufa todo: { provide: PUERTO, useClass: AdaptadorPrisma }
```

## Cómo explicarlo (de la pantalla a la base de datos)

Caso: **reservar un turno**.

```
[web] modules/admision/views/TurnosView.vue    form → admisionStore.reservarTurno(data)
  → modules/admision/admision.store.ts         reservarTurno(): loading, agrega el turno a la lista
    → modules/admision/admision.api.ts         admisionApi.reservarTurno() → POST /api/turnos
[api] api/turnos.controller.ts                 @RequierePermiso(TURNOS_RESERVAR), valida ReservarTurnoDto
  → application/reservar-turno/                ReservarTurnoHandler.ejecutar(command)
    → paciente.repository / medico.repository  ¿existen?  si no: PacienteNoEncontrado / MedicoNoEncontrado
    → domain/agenda.ts                         agenda.permiteTurno(inicio, fin)  si no: TurnoFueraDeAgenda
    → turno.repository.buscarSuperpuesto       si hay otro turno: FranjaOcupada
    → domain/turno.ts                          Turno.crear(...)   (la entidad nace válida)
    → turno.repository.guardar                 → infrastructure/turno.repository.prisma.ts → PostgreSQL
  ← TurnoDto
```

Otro caso para mostrar eventos: **registrar paciente** publica `admision.paciente-registrado` y HCE abre la
historia clínica sola (`hce/application/event-handlers/abrir-historia-al-registrar-paciente.handler.ts`).

Pantallas de este módulo: `apps/web/src/modules/admision/` (ver `apps/web/README.md`).
