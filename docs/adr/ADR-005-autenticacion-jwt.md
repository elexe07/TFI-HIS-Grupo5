# ADR-005: Autenticación con JWT propio y un rol por usuario

- **Estado:** Propuesto
- **Fecha:** 2026-10-23
- **Decisores:**

## Contexto

La consigna pide autenticación y RBAC con cinco roles. Hay que elegir cómo se emiten y validan las credenciales y cómo los demás módulos protegen sus endpoints.

## Decisión

El módulo IAM emite **JWT firmados con `JWT_SECRET`** (duración `JWT_EXPIRES_IN`, por defecto 8 h) con `sub`, `rol` y `permisos` como claims. Cada usuario tiene **un** rol; cada rol tiene permisos con formato `modulo:accion`. IAM expone en `public/` el decorador `@RequierePermiso('hce:leer')` y un guard global. Los otros módulos no saben nada de tokens.

## Alternativas consideradas

| Opción               | Pros                                         | Contras                                                     |
| -------------------- | -------------------------------------------- | ----------------------------------------------------------- |
| JWT propio           | simple, didáctico, sin dependencias externas | sin revocación antes de expirar (aceptable con 8 h)         |
| Keycloak / Auth0     | completo                                     | infraestructura y configuración que no aportan a la materia |
| Sesiones en servidor | revocables                                   | estado en la API, menos natural para una SPA                |

## Consecuencias

- Sin refresh tokens: al expirar, el usuario vuelve a loguearse.
- Passwords con **bcryptjs** (bcrypt en JS puro: no compila nada en Windows/Mac/Linux, costo 10). Nunca en texto plano ni en logs.
- Tokens con `@nestjs/jwt` 11 (la 12 es solo ESM y Jest no la carga). Sin passport: el guard verifica el token directo.
- La matriz rol × permiso vive en `docs/iam-permisos.md` y se carga por seed.
