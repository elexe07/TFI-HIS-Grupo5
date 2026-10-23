# Mapa de eventos entre módulos

Fuente de verdad de los contratos. Cuando agregues o cambies un evento, actualizá esta tabla y el `public/` de tu módulo.

Convención de nombre: `<modulo>.<evento-en-pasado-kebab-case>`.

| Nombre                               | Publica    | Payload                                                                                                       | Consume                                                    |
| ------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `admision.paciente-registrado`       | Admisión   | `{ pacienteId }`                                                                                              | HCE: abre historia clínica                                 |
| `hce.evolucion-registrada`           | HCE        | `{ evolucionId, pacienteId, medicoId, turnoId?, internacionId? }`                                             | Facturación: cargo CONSULTA                                |
| `hce.prescripcion-creada`            | HCE        | `{ prescripcionId, pacienteId, internacionId?, medicamento, dosis, frecuenciaHoras, duracionDias, inicioEn }` | Enfermería: genera indicaciones                            |
| `enfermeria.medicacion-administrada` | Enfermería | `{ administracionId, pacienteId, internacionId, medicamento }`                                                | Recursos: descuenta insumo · Facturación: cargo MEDICACION |
| `recursos.paciente-internado`        | Recursos   | `{ internacionId, pacienteId, camaId, ingresoEn }`                                                            | Facturación: abre cuenta INTERNACION                       |
| `recursos.paciente-dado-de-alta`     | Recursos   | `{ internacionId, pacienteId, ingresoEn, egresoEn }`                                                          | Facturación: cargo DIA_CAMA × días, cierra cuenta          |

Todo evento extiende `DomainEventBase` y por lo tanto trae `eventoId` y `ocurridoEn`. El consumidor guarda `eventoId` en `origen_evento_id` para no procesar dos veces.
