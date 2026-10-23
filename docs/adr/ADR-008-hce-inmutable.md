# ADR-008: Historia clínica append-only

- **Estado:** Propuesto
- **Fecha:** 2026-10-23
- **Decisores:**

## Contexto

La consigna dice que la historia clínica es "centralizada e inmutable". Hay que decidir cómo se garantiza en el código y en la base.

## Decisión

Las evoluciones, antecedentes familiares, signos vitales, administraciones de medicación y notas de enfermería son **append-only**: se insertan y nunca se modifican ni se borran. Se garantiza porque el puerto del repositorio **no expone** métodos `actualizar` ni `eliminar` para esas entidades, y un test lo verifica. Una corrección se expresa como una nueva entrada que referencia a la anterior.

## Alternativas consideradas

| Opción                            | Pros                                               | Contras                                                       |
| --------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| Append-only por diseño del puerto | simple, sin infraestructura, verificable con tests | un acceso directo a la base podría editar (fuera del alcance) |
| Event Sourcing                    | inmutabilidad total y auditoría completa           | complejidad alta para un trabajo final                        |
| Soft delete                       | reversible                                         | no es inmutabilidad: el dato se puede cambiar                 |

## Consecuencias

- `hce.evoluciones` y las demás tablas inmutables solo tienen `registrado_en`, sin `updated_at`.
- Un rol de base de datos sin `UPDATE/DELETE` sobre esas tablas queda como extensión futura.
