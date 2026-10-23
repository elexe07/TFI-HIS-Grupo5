# HIS — Hospital Information System

Trabajo final de **Programación 4**. Monolito modular en TypeScript con seis módulos:
IAM · Admisión y Turnos · Historia Clínica Electrónica · Enfermería · Recursos y Camas · Facturación.

- Plan de trabajo: [`ROADMAP.md`](ROADMAP.md)
- Modelo de datos y DER: [`MODELO-DE-DATOS.md`](MODELO-DE-DATOS.md)
- Cómo contribuir (ramas, PRs, tests): [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Decisiones de arquitectura: [`docs/adr/`](docs/adr/) · Diagramas: [`docs/c4/`](docs/c4/), [`docs/dfd/`](docs/dfd/)

## Stack

| Capa    | Tecnología                                                     |
| ------- | -------------------------------------------------------------- |
| API     | Node 24 · TypeScript · NestJS 11 · Prisma 6 · PostgreSQL 16    |
| Web     | React 18 · Vite · TypeScript                                   |
| Calidad | Jest · ESLint · Prettier · dependency-cruiser · GitHub Actions |

## Levantar en 5 minutos

Requisitos: Node 24 (`nvm use`), pnpm 9 (`corepack enable`), Docker Desktop abierto.
El Postgres de Docker se publica en el puerto **5433** para no chocar con un PostgreSQL instalado en Windows; `.env.example` ya apunta ahí.

```bash
pnpm install                 # instala todo el monorepo y genera el cliente de Prisma
cp .env.example .env         # en Windows: copy .env.example .env
pnpm db:up                   # Postgres en Docker
pnpm db:migrate              # aplica migraciones (crea los schemas y tablas)
pnpm db:seed                 # roles y permisos, admin inicial, obras sociales, tarifas, camas, insumos
pnpm dev                     # API en http://localhost:3000/api · Swagger en http://localhost:3000/docs
```

Primer login (credenciales de `.env`, `ADMIN_EMAIL` / `ADMIN_PASSWORD`):

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json"   -d "{\"email\":\"admin@his.local\",\"password\":\"Admin1234!\"}"
```

El `token` de la respuesta va en `Authorization: Bearer <token>` (en Swagger: botón **Authorize**).
Toda la API exige token salvo `/api/health`, `/api/auth/login` y el módulo `ejemplo`.

En otra terminal, la web:

```bash
pnpm web dev                 # http://localhost:5173 (proxy a la API)
```

## Comandos útiles

| Comando                                        | Qué hace                                                         |
| ---------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm test`                                    | tests unitarios de todo el monorepo                              |
| `pnpm test:integration`                        | tests de integración y e2e de la API (necesita Postgres migrado) |
| `pnpm arch`                                    | reglas de arquitectura (dependency-cruiser)                      |
| `pnpm lint` · `pnpm typecheck` · `pnpm format` | calidad de código                                                |
| `pnpm api prisma:studio`                       | explorar la base en el navegador                                 |
| `pnpm api prisma:migrate --name <nombre>`      | nueva migración tras cambiar `schema.prisma`                     |

Todo lo que corre el CI (`.github/workflows/ci.yml`) se puede correr local con estos comandos.

## Estructura

```
apps/api/src/
├── building-blocks/      shared kernel: Entity, AggregateRoot, ValueObject, errores, EventBus, Clock, Prisma
├── modules/
│   ├── ejemplo/          módulo de referencia completo (leer su README y copiar la estructura)
│   ├── iam/  admision/  hce/  enfermeria/  recursos/  facturacion/   ← uno por integrante
├── health/               GET /api/health
├── app.module.ts         composición
└── main.ts               bootstrap, Swagger, validación, filtro de errores
apps/api/prisma/          schema.prisma (un schema de Postgres por módulo), migraciones, seed
apps/web/                 SPA React
docs/                     adr/, c4/, dfd/, consigna/
```

Cada módulo sigue la misma anatomía: `domain/ → application/ → infrastructure/ + api/`, con `public/`
como única superficie que otros módulos pueden importar. `pnpm arch` lo verifica.

## Autenticación y permisos (módulo IAM)

JWT propio (ADR-005). Cinco roles, un rol por usuario, permisos `modulo:accion` según
[`docs/iam-permisos.md`](docs/iam-permisos.md). Para proteger un endpoint en tu módulo:

```ts
import { PERMISOS, RequierePermiso, UsuarioActual, type UsuarioAutenticado } from '../../iam/public';

@RequierePermiso(PERMISOS.TURNOS_RESERVAR)
@Post()
reservar(@UsuarioActual() usuario: UsuarioAutenticado, @Body() dto: ReservarTurnoDto) { ... }
```

Sin token → `401 TOKEN_INVALIDO`. Con token pero sin el permiso → `403 PERMISO_FALTANTE`.
Endpoints: `POST /api/auth/login`, `GET /api/auth/me`, `GET|POST /api/usuarios`, `PATCH /api/usuarios/:id/rol`.

## Facturación — probar con curl

Todos los endpoints requieren `Authorization: Bearer <token>`. Primero obtener un token con el login de arriba y guardar el valor:

```bash
# En PowerShell, guardar el token en una variable:
$TOKEN = "eyJhbG..."
```

### Listar cuentas de un paciente

```bash
curl -X GET "http://localhost:3000/api/cuentas?pacienteId=<UUID_PACIENTE>" -H "Authorization: Bearer $TOKEN"
```

### Ver detalle de una cuenta (con cargos y total)

```bash
curl -X GET "http://localhost:3000/api/cuentas/<UUID_CUENTA>" -H "Authorization: Bearer $TOKEN"
```

### Validar cobertura de obra social

```bash
curl -X POST http://localhost:3000/api/cobertura/validar -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d "{\"pacienteId\":\"<UUID_PACIENTE>\",\"codigoObraSocial\":\"OSDE\",\"numeroAfiliado\":\"123456789\"}"
```

Respuestas posibles:
- `{ "aprobada": true, "porcentajeCobertura": 80 }` → OSDE cubre el 80%
- `{ "aprobada": true, "porcentajeCobertura": 100 }` → PAMI cubre el 100%
- `{ "aprobada": true, "porcentajeCobertura": 0 }` → PARTICULAR, sin cobertura
- `{ "aprobada": false, ... }` → afiliado rechazado

### Reporte de facturación por período

```bash
curl -X GET "http://localhost:3000/api/reportes/facturacion?desde=2026-10-01T00:00:00Z&hasta=2026-10-31T23:59:59Z" -H "Authorization: Bearer $TOKEN"
```

### Reporte de ocupación hospitalaria

```bash
curl -X GET http://localhost:3000/api/reportes/ocupacion -H "Authorization: Bearer $TOKEN"
```

> **Nota:** Los cargos se crean automáticamente al registrar evoluciones, administrar medicación, internar y dar de alta pacientes. No hay endpoint manual para crear cargos — todo llega por eventos internos.

## Equipo

| Módulo            | Responsable |
| ----------------- | ----------- |
| Base + IAM        | Facu        |
| Admisión y Turnos |             |
| HCE               |             |
| Enfermería        |             |
| Recursos y Camas  |             |
| Facturación       | Ezequías   |
