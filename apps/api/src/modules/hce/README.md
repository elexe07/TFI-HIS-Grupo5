# Módulo HCE — Historia Clínica Electrónica

**Responsable:** Facu / Equipo · **Revisor:** ______ · **Fase:** 4 · **Estado:** implementado (backend)

## Qué pide la consigna

Información médica centralizada e **inmutable** del paciente: ficha, alergias, antecedentes familiares, evoluciones médicas y visualización de estudios.

## Casos de uso (ROADMAP §6)

| ID     | Caso de uso                                      | Handler                       | Tests mínimos                                              |
| ------ | ------------------------------------------------ | ----------------------------- | ---------------------------------------------------------- |
| HCE-01 | Abrir historia (por evento `PacienteRegistrado`) | `AbrirHistoriaHandler`        | no duplica si llega dos veces                              |
| HCE-02 | Registrar evolución                              | `RegistrarEvolucionHandler`   | inmutable; emite `EvolucionRegistrada`                     |
| HCE-03 | Registrar alergia                                | `RegistrarAlergiaHandler`     | duplicada falla                                            |
| HCE-04 | Registrar antecedente familiar                   | `RegistrarAntecedenteHandler` | registra parentesco y condición                            |
| HCE-05 | Crear prescripción                               | `CrearPrescripcionHandler`    | alergia al medicamento bloquea; emite `PrescripcionCreada` |
| HCE-06 | Registrar estudio                                | `RegistrarEstudioHandler`     | tipo, fecha, descripción y resultado                       |
| HCE-07 | Consultar historia                               | `ConsultarHistoriaHandler`    | paciente solo ve la propia                                 |

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

## Estructura

Todos los módulos tienen la misma forma (copiada de `modules/ejemplo/`):

```
hce/
├── domain/                     ← reglas de negocio + PUERTOS (*.repository.ts). Sin Nest/Prisma
│   ├── events/                   evolucion-registrada.ts, prescripcion-creada.ts
│   ├── alergia.ts
│   ├── antecedente-familiar.ts
│   ├── errores.ts
│   ├── estudio.ts
│   ├── evolucion.ts
│   ├── historia-clinica.repository.ts
│   ├── historia-clinica.ts
│   └── prescripcion.ts
├── application/                ← casos de uso: una carpeta por caso (command/query + handler + spec)
│   ├── abrir-historia/
│   ├── consultar-historia/
│   ├── crear-prescripcion/
│   ├── registrar-alergia/
│   ├── registrar-antecedente/
│   ├── registrar-estudio/
│   ├── registrar-evolucion/
│   ├── event-handlers/           @OnEvent: abrir-historia-al-registrar-paciente
│   └── historia-clinica.dto.ts   mapeos dominio → DTO de respuesta
├── infrastructure/             ← adaptadores: implementan los puertos con Prisma (o simulados)
│   └── historia-clinica.repository.prisma.ts
├── api/                        ← controllers HTTP + DTOs de entrada con class-validator
│   ├── hce.controller.ts
│   └── dto/                      5 DTOs de entrada
├── public/                     ← lo ÚNICO que otros módulos pueden importar (eventos, tipos)
│   └── index.ts
├── testing/                    ← repositorios en memoria y fakes para los tests
│   └── historia-clinica.repository.en-memoria, index
└── hce.module.ts               ← enchufa todo: { provide: PUERTO, useClass: AdaptadorPrisma }
```

## Cómo explicarlo (de la pantalla a la base de datos)

Caso: **crear una prescripción** (muestra regla de negocio + evento hacia Enfermería).

```
[web] modules/hce/views/PrescripcionFormView.vue   submit → hceStore.crearPrescripcion(data)
  → modules/hce/hce.store.ts                        crearPrescripcion()
    → modules/hce/hce.api.ts                        POST /api/pacientes/:id/historia/prescripciones
[api] api/hce.controller.ts                         @RequierePermiso(PRESCRIPCIONES_CREAR), valida CrearPrescripcionDto
  → application/crear-prescripcion/                 CrearPrescripcionHandler.ejecutar(command)
    → historia-clinica.repository.buscarPorPacienteId
    → domain/historia-clinica.ts                    historia.crearPrescripcion(...)
        si el paciente es alérgico al medicamento → PacienteAlergicoAMedicamento (409)
        si no: crea la Prescripcion y registra el evento PrescripcionCreada
    → historia-clinica.repository.guardar           → infrastructure/historia-clinica.repository.prisma.ts
    → EventBus.publicar(historia.extraerEventos())
        → enfermeria/application/event-handlers/on-prescripcion-creada.handler.ts  (genera indicaciones)
  ← { id }
```

Regla para remarcar: la historia es **inmutable** (ADR-008). El puerto no tiene `update` ni `delete` y
`domain/inmutabilidad.spec.ts` lo verifica.

Pantallas de este módulo: `apps/web/src/modules/hce/` (ver `apps/web/README.md`).
