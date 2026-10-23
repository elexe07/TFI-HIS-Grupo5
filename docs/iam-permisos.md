# Matriz rol × permiso

Fuente de verdad en código: `apps/api/src/modules/iam/domain/permisos.ts` (constantes `PERMISOS` y `MATRIZ_PERMISOS`). El seed la carga en `iam.permisos` / `iam.roles_permisos` y el test `permisos.spec.ts` verifica que esta tabla y el código digan lo mismo: si cambiás una, cambiá la otra.

Para pedir un permiso nuevo: agregarlo a `PERMISOS`, a la matriz y a esta tabla en el mismo PR. Formato `modulo:accion`. En los controllers se usa así: `@RequierePermiso(PERMISOS.HCE_LEER)` (importado de `modules/iam/public`).

| Permiso                   | Administrador | Médico | Enfermero | Recepcionista | Paciente |
| ------------------------- | :-----------: | :----: | :-------: | :-----------: | :------: |
| `usuarios:gestionar`      |       ✔       |        |           |               |          |
| `pacientes:registrar`     |       ✔       |        |           |       ✔       |          |
| `pacientes:leer`          |       ✔       |   ✔    |     ✔     |       ✔       |  propio  |
| `agenda:definir`          |       ✔       |   ✔    |           |               |          |
| `turnos:reservar`         |       ✔       |        |           |       ✔       |  propio  |
| `turnos:cancelar`         |       ✔       |        |           |       ✔       |  propio  |
| `triaje:registrar`        |               |        |     ✔     |               |          |
| `guardia:leer`            |       ✔       |   ✔    |     ✔     |       ✔       |          |
| `hce:leer`                |               |   ✔    |     ✔     |               |  propia  |
| `hce:escribir`            |               |   ✔    |           |               |          |
| `prescripciones:crear`    |               |   ✔    |           |               |          |
| `enfermeria:registrar`    |               |        |     ✔     |               |          |
| `enfermeria:leer`         |               |   ✔    |     ✔     |               |          |
| `camas:leer`              |       ✔       |   ✔    |     ✔     |       ✔       |          |
| `camas:gestionar`         |       ✔       |        |     ✔     |               |          |
| `internaciones:gestionar` |       ✔       |   ✔    |           |       ✔       |          |
| `insumos:gestionar`       |       ✔       |        |           |               |          |
| `facturacion:leer`        |       ✔       |        |           |       ✔       |  propio  |
| `cobertura:validar`       |       ✔       |        |           |       ✔       |          |
| `reportes:leer`           |       ✔       |        |           |               |          |

"propio/propia" = el permiso existe pero el caso de uso además verifica que el recurso pertenezca al usuario logueado.
