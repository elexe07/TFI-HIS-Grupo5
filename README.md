# HIS — Hospital Information System

Trabajo final integrador de **Programación y Metodologías de Desarrollo (Programación 4)**.  
Monolito modular en TypeScript con 6 módulos de negocio:
**IAM** · **Admisión y Turnos** · **Historia Clínica Electrónica (HCE)** · **Enfermería** · **Recursos y Camas** · **Facturación**.

- Plan de trabajo: [`ROADMAP.md`](ROADMAP.md)
- Modelo de datos y DER: [`MODELO-DE-DATOS.md`](MODELO-DE-DATOS.md)
- Guía de contribución: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Decisiones de arquitectura: [`docs/adr/`](docs/adr/) · Diagramas C4/DFD: [`docs/c4/`](docs/c4/), [`docs/dfd/`](docs/dfd/)

---

## 🛠️ Stack Tecnológico

| Capa                | Tecnologías                                                                           |
| :------------------ | :------------------------------------------------------------------------------------ |
| **Backend (API)**   | Node.js (>=20) · TypeScript · NestJS 11 · Prisma ORM 6 · PostgreSQL 16 (Multi-Schema) |
| **Frontend (Web)**  | Vue 3 (Composition API) · Pinia · Vite · Vue Router · TypeScript · Axios · Zod        |
| **Infraestructura** | Docker & Docker Compose (PostgreSQL 16)                                               |
| **Calidad & Tests** | Jest · ESLint · Prettier · dependency-cruiser · GitHub Actions CI                     |

---

## 🚀 Guía Rápida para Levantar el Proyecto (Back & Front)

### 1. Requisitos Previos

- **Node.js**: Versión `>= 20.x` (recomendado Node 20 o 24).
- **pnpm**: Versión `9.x` (`corepack enable && corepack prepare pnpm@latest --activate`).
- **Docker Desktop**: En ejecución (para el servicio de PostgreSQL).

---

### 2. Configurar Variables de Entorno

Crear el archivo `.env` en la raíz del proyecto copiando el archivo de ejemplo:

- **En Windows (PowerShell / CMD):**
  ```powershell
  copy .env.example .env
  ```
- **En Linux / macOS:**
  ```bash
  cp .env.example .env
  ```

> ℹ️ **Nota sobre Puertos:**  
> Por defecto en `.env`, PostgreSQL expone el puerto **`5433`** (`localhost:5433`) para evitar colisiones con instalaciones locales de PostgreSQL en Windows (que suelen usar el `5432`).

---

### 3. Instalar Dependencias

Desde la raíz del repositorio:

```bash
pnpm install
```

_(Instala todos los paquetes del monorepo y dispara automáticamente `prisma generate` para generar el cliente Prisma de la API)._

---

### 4. Levantar la Base de Datos y Sembrar Datos Iniciales

1. **Iniciar el contenedor de PostgreSQL:**

   ```bash
   pnpm db:up
   ```

2. **Aplicar las migraciones (creación de esquemas y tablas):**

   ```bash
   pnpm db:migrate
   ```

3. **Ejecutar el Seed con los datos iniciales:**
   ```bash
   pnpm db:seed
   ```
   _Esto inicializa roles, permisos, usuario Administrador, médicos con sus respectivas agendas, pacientes, obras sociales, tarifas, habitaciones, camas e insumos hospitalarios con stock._

---

### 5. Iniciar la API (Backend)

En una terminal en la raíz del proyecto:

```bash
pnpm dev
```

- **API Base URL**: [http://localhost:3000/api](http://localhost:3000/api)
- **Documentación Swagger / OpenAPI**: [http://localhost:3000/docs](http://localhost:3000/docs)
- **Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

### 6. Iniciar la Aplicación Web (Frontend)

En **otra terminal** parada en la raíz del proyecto:

```bash
pnpm web dev
```

- **Aplicación Web**: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Credenciales por Defecto (Seed)

| Rol                         | Email                    | Contraseña    |
| :-------------------------- | :----------------------- | :------------ |
| **Administrador**           | `admin@his.local`        | `Admin1234!`  |
| **Médico** (Clínica Médica) | `dr.garcia@his.local`    | `Medico1234!` |
| **Médica** (Pediatría)      | `dra.gomez@his.local`    | `Medico1234!` |
| **Médico** (Traumatología)  | `dr.fernandez@his.local` | `Medico1234!` |

_(Para probar roles como **Enfermero** o **Recepcionista**, se pueden crear nuevos usuarios o gestionar roles desde la administración del sistema con la cuenta de Administrador)._

---

## 🧰 Comandos Útiles

| Comando                        | Descripción                                                                       |
| :----------------------------- | :-------------------------------------------------------------------------------- |
| `pnpm dev`                     | Levanta el backend en modo desarrollo con auto-reload.                            |
| `pnpm web dev`                 | Levanta el frontend en modo desarrollo con Vite.                                  |
| `pnpm build`                   | Compila tanto API (`nest build`) como Web (`vue-tsc && vite build`).              |
| `pnpm test`                    | Ejecuta todos los tests unitarios del monorepo con Jest.                          |
| `pnpm test:integration`        | Ejecuta tests de integración de la API contra la base de datos PostgreSQL.        |
| `pnpm arch`                    | Valida reglas de aislamiento arquitectónico entre módulos con dependency-cruiser. |
| `pnpm lint` / `pnpm typecheck` | Chequeo estático de linter y validación de tipos TypeScript.                      |
| `pnpm format`                  | Formatea archivos con Prettier.                                                   |
| `pnpm api prisma:studio`       | Abre interfaz gráfica de Prisma para explorar la base de datos en el navegador.   |
| `pnpm api prisma:clean`        | Limpia los datos transaccionales de prueba preservando catálogos y configuración. |
| `pnpm db:down`                 | Detiene y remueve los contenedores de Docker.                                     |

---

## 🏛️ Estructura del Monorepo

```text
├── apps/
│   ├── api/                      # Backend NestJS (Monolito Modular)
│   │   ├── prisma/               # schema.prisma, migraciones, seed y utilitarios
│   │   └── src/
│   │       ├── building-blocks/  # Shared kernel (DDD base, Errores, EventBus, PrismaService)
│   │       └── modules/          # Módulos de dominio aislados
│   │           ├── iam/          # Identidad, Roles, Permisos y JWT
│   │           ├── admision/     # Pacientes, Agendas, Turnos y Triaje/Guardia
│   │           ├── hce/          # Historias Clínicas, Evoluciones, Antecedentes, Prescripciones
│   │           ├── enfermeria/   # Indicaciones, Administración, Signos Vitales, Notas
│   │           ├── recursos/     # Habitaciones, Camas, Insumos y Stock
│   │           └── facturacion/  # Cuentas, Cargos, Coberturas y Reportes
│   └── web/                      # Frontend SPA en Vue 3 + Pinia + Vite
│       └── src/
│           ├── components/       # Componentes UI reutilizables (Botones, Tablas, Modales, etc.)
│           ├── stores/           # Gestión de estado global con Pinia
│           ├── views/            # Vistas agrupadas por módulo de negocio
│           ├── router/           # Rutas y guards de navegación según permisos
│           └── services/         # Clientes HTTP hacia la API con Axios
├── docs/                         # Documentación técnica (ADRs, diagramas C4 y DFD)
└── docker-compose.yml            # Definición de infraestructura Docker (PostgreSQL 16)
```

---
