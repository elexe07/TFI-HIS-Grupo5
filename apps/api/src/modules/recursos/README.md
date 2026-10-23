# Módulo Gestión de Recursos y Camas

**Responsable:** ______ · **Revisor:** ______ · **Fase:** 6

## Qué pide la consigna

Mapa de camas (ocupadas, libres, en limpieza, bloqueadas), asignación de pacientes a habitaciones y gestión básica de inventario.

## Casos de uso (ROADMAP §6)

| ID     | Caso de uso                   | Tests mínimos                                                                              |
| ------ | ----------------------------- | ------------------------------------------------------------------------------------------ |
| REC-01 | Internar paciente             | solo cama libre; un paciente no tiene dos internaciones activas; emite `PacienteInternado` |
| REC-02 | Dar de alta                   | cama pasa a EN_LIMPIEZA; emite `PacienteDadoDeAlta`                                        |
| REC-03 | Cambiar estado de cama        | transiciones inválidas fallan                                                              |
| REC-04 | Mapa de camas                 | conteo por estado                                                                          |
| REC-05 | Ingreso de insumo             | stock suma                                                                                 |
| REC-06 | Descontar insumo (por evento) | stock no negativo; idempotente                                                             |
| REC-07 | Insumos bajo mínimo           | —                                                                                          |

## Dominio: máquina de estados de `Cama`

```
LIBRE ──internar──▶ OCUPADA ──alta──▶ EN_LIMPIEZA ──limpia──▶ LIBRE
LIBRE ◀──desbloquear── BLOQUEADA ◀──bloquear── LIBRE
```

Cualquier otra transición lanza `TransicionDeCamaInvalida` (extiende `Conflicto` → HTTP 409). Cubrir la tabla completa de transiciones, válidas e inválidas, con `it.each`.

## Eventos

| Consume                                                                                                    | Publica                                                                                                  |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `enfermeria.medicacion-administrada` → descuenta `insumos.stock_actual` si `medicamento_asociado` coincide | `recursos.paciente-internado { internacionId, pacienteId, camaId, ingresoEn }` → Facturación, Enfermería |
|                                                                                                            | `recursos.paciente-dado-de-alta { internacionId, pacienteId, ingresoEn, egresoEn }` → Facturación        |

## Tablas (MODELO-DE-DATOS §2.5)

`recursos.habitaciones`, `recursos.camas`, `recursos.internaciones`, `recursos.insumos`.

## Endpoints sugeridos

`GET /api/camas/mapa` · `PATCH /api/camas/:id/estado` · `POST /api/internaciones` · `POST /api/internaciones/:id/alta` · `POST /api/insumos/:id/ingresos` · `GET /api/insumos?bajoMinimo=true`

## Permisos

`camas:leer`, `camas:gestionar`, `internaciones:gestionar`, `insumos:gestionar`
