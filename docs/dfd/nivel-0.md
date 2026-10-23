# DFD — Nivel 0 (diagrama de contexto)

Cómo entra y sale la información del sistema, visto como un único proceso.

```mermaid
flowchart LR
    REC([Recepcionista])
    MED([Médico])
    ENF([Enfermero])
    ADM([Administrador])
    PAC([Paciente])
    OS([Obra social<br/>simulada])

    HIS((0<br/>HIS))

    REC -->|datos del paciente, turno a reservar/cancelar, cobertura a validar| HIS
    HIS -->|comprobante de turno, resultado de cobertura, cuenta del paciente| REC

    MED -->|evolución, prescripción, estudio, orden de internación/alta| HIS
    HIS -->|historia clínica, agenda del día, cola de guardia| MED

    ENF -->|triaje, signos vitales, administración de medicación, notas| HIS
    HIS -->|indicaciones pendientes, mapa de camas| ENF

    ADM -->|usuarios y roles, camas, insumos, tarifas| HIS
    HIS -->|reportes de facturación y ocupación, insumos bajo mínimo| ADM

    PAC -->|reserva/cancelación de turno| HIS
    HIS -->|turnos propios, historia propia| PAC

    HIS -->|afiliado a validar| OS
    OS -->|cobertura aprobada/rechazada| HIS
```

## Almacenes de datos (nivel 1 implícito)

Cada módulo tiene su almacén, que es su schema de Postgres. Los flujos entre módulos son los eventos de `ROADMAP.md §4.4`.

| Almacén               | Schema        | Dato sensible                                                                         |
| --------------------- | ------------- | ------------------------------------------------------------------------------------- |
| D1 Usuarios           | `iam`         | hash de password                                                                      |
| D2 Pacientes y turnos | `admision`    | datos personales                                                                      |
| D3 Historia clínica   | `hce`         | **datos de salud: acceso solo por permiso `hce:leer`; el paciente solo ve la propia** |
| D4 Enfermería         | `enfermeria`  | datos de salud                                                                        |
| D5 Camas e insumos    | `recursos`    | —                                                                                     |
| D6 Cuentas y cargos   | `facturacion` | datos económicos                                                                      |
