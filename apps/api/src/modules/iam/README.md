# Módulo IAM — Identidad y Accesos

**Responsable:** Facu · **Revisor:** ______ · **Fase:** 2 · **Estado:** implementado (backend). Falta la pantalla de login en la web.

## Qué pide la consigna

Autenticación de usuarios, gestión de roles (Administrador, Médico, Enfermero, Recepcionista, Paciente) y permisos (RBAC).

## Cómo lo usan los demás módulos

```ts
import {
  PERMISOS,
  RequierePermiso,
  UsuarioActual,
  type UsuarioAutenticado,
} from '../../iam/public';

@ApiBearerAuth()
@Controller('turnos')
export class TurnosController {
  @RequierePermiso(PERMISOS.TURNOS_RESERVAR)
  @Post()
  reservar(@UsuarioActual() usuario: UsuarioAutenticado, @Body() dto: ReservarTurnoDto) {
    // usuario = { id, email, nombre, rol, permisos }
  }
}
```

- El guard es **global**: todo endpoint exige `Authorization: Bearer <token>` salvo que tenga `@Publico()`.
- `@RequierePermiso(...)` se puede poner en el método o en toda la clase (el método pisa a la clase).
- Sin token → `401 TOKEN_INVALIDO`. Con token sin el permiso → `403 PERMISO_FALTANTE`.
- "propio" en la matriz (ej. un paciente ve _su_ HCE) lo verifica el caso de uso de cada módulo con `usuario.id`.
- Permiso nuevo: agregarlo a `domain/permisos.ts` (catálogo + matriz) y a `docs/iam-permisos.md`. El test `permisos.spec.ts` falla si no coinciden.
- Tests e2e de otros módulos: `loguear(app, email, password)` en `test/e2e/app-de-prueba.ts`. Tests unitarios de controllers: `TokensFalsos` en `iam/testing`.

## Casos de uso

| ID     | Caso de uso                   | Handler                   | Tests                                                                            |
| ------ | ----------------------------- | ------------------------- | -------------------------------------------------------------------------------- |
| IAM-01 | Registrar usuario             | `RegistrarUsuarioHandler` | email duplicado (aun con mayúsculas), password débil, rol inexistente            |
| IAM-02 | Iniciar sesión                | `IniciarSesionHandler`    | credenciales inválidas (mismo error siempre), inactivo, token con rol y permisos |
| IAM-03 | Asignar rol                   | `AsignarRolHandler`       | no se puede degradar al último administrador activo                              |
| IAM-04 | Proteger endpoint por permiso | `PermisosGuard`           | público pasa, 401 sin token, 403 sin permiso, permiso de clase vs método         |
| IAM-05 | Listar usuarios               | `ListarUsuariosHandler`   | e2e                                                                              |

## Estructura

```
iam/
├── domain/
│   ├── permisos.ts            ROLES, PERMISOS, MATRIZ_PERMISOS (fuente de verdad; la usa el seed)
│   ├── email.ts  password.ts  objetos de valor (Password nunca se serializa)
│   ├── rol.ts  usuario.ts     entidades; Usuario es la raíz de agregado
│   ├── errores.ts             EmailYaRegistrado, CredencialesInvalidas, UltimoAdministrador, TokenInvalido, PermisoFaltante…
│   ├── password-hasher.ts     PUERTO PasswordHasher
│   └── *.repository.ts        PUERTOS UsuarioRepository, RolRepository
├── application/
│   ├── ports/tokens.ts        PUERTO Tokens (emitir / verificar) + UsuarioAutenticado
│   ├── registrar-usuario/  iniciar-sesion/  asignar-rol/  listar-usuarios/
│   └── usuario.dto.ts         mapeos a DTO (sin hash)
├── infrastructure/
│   ├── usuario.repository.prisma.ts  rol.repository.prisma.ts
│   ├── bcrypt.password-hasher.ts     (bcryptjs, costo 10)
│   └── jwt.tokens.ts                 (@nestjs/jwt; secreto y duración de .env)
├── api/
│   ├── auth.controller.ts     POST /auth/login (público) · GET /auth/me
│   ├── usuarios.controller.ts POST/GET /usuarios · PATCH /usuarios/:id/rol  (usuarios:gestionar)
│   ├── guards/permisos.guard.ts      guard global (APP_GUARD)
│   └── decorators/            @Publico() @RequierePermiso() @UsuarioActual()
├── public/index.ts            lo único importable desde otros módulos
├── testing/                   repos en memoria, PasswordHasherFalso, TokensFalsos
└── iam.module.ts
```

## Tablas (MODELO-DE-DATOS §2.1)

`iam.usuarios`, `iam.roles`, `iam.permisos`, `iam.roles_permisos`. Un usuario tiene **un** rol.
El seed (`prisma/seed.ts`) carga roles, permisos, la matriz y el administrador de `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
Volver a correr el seed reaplica la matriz y la contraseña del admin.

## Decisiones

- JWT propio, 8 h, sin refresh (ADR-005). Claims: `sub`, `email`, `nombre`, `rol`, `permisos`.
- Los errores del guard son errores de dominio, así el body de 401/403 tiene el mismo formato que el resto.
- `@nestjs/jwt` se queda en la 11: la 12 es solo ESM y Jest (CommonJS) no la carga.
- Sin passport: una dependencia menos y el guard queda legible en 50 líneas.

## Fuera de alcance (ROADMAP §10)

Refresh tokens, recuperación de contraseña, 2FA, bloqueo por intentos, auditoría de logins, más de un rol por usuario.

## Eventos

No publica ni consume eventos en el alcance actual.
