# Frontend - HIS (Hospital Information System)

Frontend desarrollado en **Vue 3 + TypeScript + Vite** para el Sistema de Información Hospitalaria.

## 🚀 Tecnologías

- **Vue 3** (Composition API + `<script setup>`)
- **TypeScript** (strict mode)
- **Vite** (build tool + dev server)
- **Vue Router 4** (navegación con guards de autenticación y RBAC)
- **Pinia** (state management global + persistencia)
- **Axios** (cliente HTTP con interceptores JWT)
- **Zod** (validación de esquemas)
- **date-fns** (manipulación de fechas)

## 📁 Estructura del Proyecto

El front está organizado **por módulo** (package by feature), igual que el backend: todo lo de un módulo del HIS
vive en una sola carpeta, así se puede explicar abriendo solo esa carpeta.

```
apps/web/src/
├── main.ts                 # Arranca Vue + Pinia + Router
├── App.vue                 # Shell: header + sidebar + <RouterView>
├── router/index.ts         # Junta las rutas de cada módulo + guards (login y permisos)
├── layout/                 # AppHeader y AppSidebar (menú según permisos del usuario)
├── modules/                # ← un módulo por integrante, mismo nombre que en apps/api/src/modules
│   ├── iam/                # Login, usuarios, perfil
│   ├── admision/           # Pacientes, médicos, agenda, turnos, triaje
│   ├── hce/                # Historia clínica, evoluciones, prescripciones
│   ├── enfermeria/         # Indicaciones, signos vitales, notas
│   ├── recursos/           # Mapa de camas, internaciones, insumos
│   ├── facturacion/        # Cuentas, cobertura, reportes
│   └── dashboard/          # Pantalla de inicio (resume datos de varios módulos)
├── shared/                 # Lo genérico: NO conoce a ningún módulo
│   ├── components/ui/      # Button, Input, Select, Card, Table, Badge, Modal, Toast
│   ├── http/client.ts      # Axios: URL base, token JWT, manejo de errores, helpers get/post/patch/del
│   ├── stores/             # toast (notificaciones) y theme (claro/oscuro)
│   ├── composables/        # useApi, useApiList, useForm (estado loading/error/data genérico)
│   ├── types/api.ts        # Tipos genéricos de la API (ErrorApi, PaginatedResponse)
│   └── views/              # NotFoundView (404)
└── assets/styles/main.css  # Design system (variables CSS, utilidades)
```

### Anatomía de un módulo

Todos los módulos tienen los mismos archivos (ejemplo con `admision/`):

| Archivo              | Qué hace                                                                      |
| -------------------- | ----------------------------------------------------------------------------- |
| `views/*.vue`        | Pantallas. Solo presentación: leen del store y llaman a sus acciones.         |
| `admision.store.ts`  | Store Pinia: estado del módulo (listas, seleccionado, loading) y acciones.    |
| `admision.api.ts`    | Endpoints HTTP del módulo (`admisionApi.listarPacientes()` → `GET /api/...`). |
| `admision.types.ts`  | Tipos de lo que manda/recibe la API (espejo de los DTOs del backend).         |
| `admision.routes.ts` | Rutas del módulo con sus permisos (`meta.permisos`).                          |

> IAM además exporta `auth.store.ts` (token, usuario, permisos), que usan el router, el layout y las pantallas.

### Cómo explicar un módulo (de la pantalla a la base de datos)

El recorrido siempre es el mismo: **view → store → api → endpoint del backend → caso de uso**.
Ejemplo con el listado de pacientes de Admisión:

```
modules/admision/admision.routes.ts      /admision  (requiere permiso 'pacientes:leer')
  → views/PacientesView.vue              onMounted → buscar() → admisionStore.cargarPacientes({ documento, apellido })
    → admision.store.ts                  cargarPacientes(): loading = true, guarda el resultado en `pacientes`
      → admision.api.ts                  admisionApi.listarPacientes(params)
        → shared/http/client.ts          GET /api/pacientes?documento=...  (+ header Authorization: Bearer <token>)
          → backend: apps/api/src/modules/admision/api/pacientes.controller.ts   @Get()
            → application/buscar-pacientes/buscar-pacientes.handler.ts       (caso de uso)
              → domain/paciente.repository.ts → infrastructure/paciente.repository.prisma.ts → PostgreSQL
```

Para explicar cualquier otro módulo: abrir su `<modulo>.routes.ts` (qué pantallas hay y qué permiso piden),
elegir una view, seguir la acción del store hasta `<modulo>.api.ts` y de ahí al controller del mismo módulo en
`apps/api/src/modules/<modulo>/api/`.

### Reglas de dependencia

- `shared/` no importa nada de `modules/` (es genérico y reutilizable).
- Cada módulo usa su propio store/api. Si una pantalla necesita datos de otro módulo (ej. Enfermería necesita la
  lista de pacientes), usa el **store** de ese módulo, nunca su `*.api.ts` directo.
- Los tipos de un módulo pueden referenciar tipos de otro (ej. `InternacionDTO.paciente: PacienteDTO`), porque
  reflejan lo que devuelve el backend.

## 🛠️ Instalación y Desarrollo

```bash
# Desde la raíz del monorepo
cd apps/web

# Instalar dependencias
pnpm install

# Servidor de desarrollo (puerto 5173)
pnpm dev

# Build para producción
pnpm build

# Preview del build
pnpm preview

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## ⚙️ Configuración

### Variables de Entorno

Crear `.env.local` en `apps/web/`:

```env
# URL del backend API
VITE_API_URL=http://localhost:3000/api

# Puerto del dev server (opcional)
VITE_PORT=5173
```

### Proxy de Desarrollo (vite.config.ts)

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

## 🏗️ Arquitectura

### Estado Global (Pinia)

Cada store vive en su módulo (`modules/<modulo>/<modulo>.store.ts`; el de IAM es `auth.store.ts`). `toast` y `theme` están en `shared/stores/`.

| Store         | Responsabilidad                                                   |
| ------------- | ----------------------------------------------------------------- |
| `auth`        | JWT, usuario, roles, permisos, persistencia                       |
| `admision`    | Pacientes, profesionales, agenda, turnos, triaje                  |
| `hce`         | Historia clínica, evoluciones, alergias, prescripciones, estudios |
| `enfermeria`  | Indicaciones, signos vitales, notas, alertas                      |
| `recursos`    | Camas, internaciones, insumos, movimientos                        |
| `facturacion` | Cuentas, coberturas, planes, reportes                             |
| `toast`       | Notificaciones globales (success/error/warning/info)              |

### Cliente HTTP (Axios)

- **`shared/http/client.ts`**: instancia Axios con interceptores (agrega el JWT, ante 401 limpia sesión y va a `/login`) y helpers tipados `get/post/patch/del`.
- **`modules/<modulo>/<modulo>.api.ts`**: endpoints de cada módulo (`authApi`, `admisionApi`, `hceApi`, `enfermeriaApi`, `recursosApi`, `facturacionApi`).
- **Tipado estricto**: cada endpoint usa los tipos de `modules/<modulo>/<modulo>.types.ts`.

### Composables (`shared/composables/useApi.ts`)

Utilidades genéricas para llamadas async (estado `loading`/`error`/`data`). Hoy las pantallas usan los stores
de cada módulo para eso; los composables quedan disponibles para pantallas nuevas.

```ts
// Uso básico
const { data, loading, error, execute } = useApi(() => admisionApi.listarPacientes());

// Lista con paginación
const { data, loading, fetchPage } = useApiList(() => admisionApi.listarPacientes());

// Formularios reactivos
const { values, errors, validate, handleSubmit } = useForm({ nombre: '', apellido: '' });
```

### Router Guards

```ts
// Meta de ruta
meta: {
  requiresAuth: true,           // Requiere login
  permisos: ['pacientes:leer'], // Permisos requeridos
  permisosMode: 'all',          // 'all' = todos, 'any' = al menos uno
  layout: 'default',            // 'default' | 'auth' | 'empty'
  title: 'Pacientes'
}
```

Guards implementados:

1. **Auth**: Redirige a `/login` si no autenticado
2. **RBAC**: Verifica permisos contra `authStore.permisos`
3. **Título**: Actualiza `document.title`

## 🎨 Design System

### CSS Custom Properties (main.css)

```css
:root {
  /* Colores */
  --color-primary: #2563eb;
  --color-success: #16a34a;
  --color-warning: #f59e0b;
  --color-danger: #dc2626;
  --color-info: #0ea5e9;

  /* Espaciado */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;

  /* Bordes, sombras, transiciones... */
}
```

### Componentes UI Base

Todos los componentes siguen convención consistente:

```vue
<!-- Props tipadas con TypeScript -->
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}
</script>

<!-- Slots para flexibilidad -->
<template>
  <button class="btn" :class="variantClasses">
    <slot name="icon" />
    <slot />
  </button>
</template>
```

## 📱 Responsive Layout

- **Sidebar**: Colapsible (280px → 72px) con persistencia en localStorage
- **Mobile**: Drawer lateral con overlay (`< 1024px`)
- **Header**: Responsive con menú hamburguesa
- **Grids**: `auto-fit` / `minmax()` para tablas y formularios

## 🔐 RBAC (Role-Based Access Control)

### Roles del Sistema

| Rol             | Permisos Principales                     |
| --------------- | ---------------------------------------- |
| `ADMINISTRADOR` | Acceso total + gestión usuarios          |
| `MEDICO`        | HCE, evoluciones, prescripciones, agenda |
| `ENFERMERO`     | Indicaciones, signos vitales, notas      |
| `RECEPCIONISTA` | Pacientes, turnos, triaje, admisión      |
| `PACIENTE`      | Portal paciente (solo lectura propia)    |

### Permisos por Módulo

```ts
// Ejemplos de permisos (ver modules/iam/iam.types.ts)
'pacientes:leer' | 'pacientes:registrar' | 'pacientes:actualizar';
'agenda:definir' | 'turnos:reservar' | 'turnos:cancelar';
'triaje:registrar' | 'guardia:leer';
'hce:leer' | 'hce:escribir';
'prescripciones:crear' | 'estudios:solicitar';
'enfermeria:indicaciones:leer' | 'enfermeria:signos:crear';
'camas:leer' | 'camas:actualizar' | 'internaciones:gestionar';
'insumos:gestionar' | 'movimientos:registrar';
'facturacion:leer' | 'cobertura:validar' | 'reportes:leer';
('usuarios:gestionar');
```

## 📦 Módulos Funcionales

### 1. Admisión (`/admision`)

- **Pacientes**: CRUD + búsqueda por documento/apellido
- **Agenda Médica**: Horarios por profesional + vista de disponibilidad
- **Turnos**: Búsqueda avanzada + cambio de estados (PENDIENTE→CONFIRMADO→EN_ATENCION→FINALIZADO)
- **Triaje**: Clasificación por urgencia (ROJO→NARANJA→AMARILLO→VERDE→AZUL) + resumen por nivel

### 2. HCE (`/hce`)

- **Historia Clínica**: Vista unificada con tabs (Resumen, Alergias, Estudios, Prescripciones, Timeline)
- **Evoluciones**: Formulario rico + historial cronológico
- **Prescripciones**: CRUD + gestión de estados (ACTIVA/SUSPENDIDA/FINALIZADA)

### 3. Enfermería (`/enfermeria`)

- **Indicaciones**: Generación desde prescripción + administración/omisión con motivos
- **Signos Vitales**: Formulario validado + historial tabular + alertas automáticas
- **Notas**: Registro libre + timeline por paciente

### 4. Recursos (`/recursos`)

- **Mapa de Camas**: Grid visual por sector con estados codificados por color
- **Internaciones**: Ingreso/alta/traslado + asignación de cama
- **Insumos**: Stock con umbrales (normal/bajo/crítico/agotado) + movimientos entrada/salida

### 5. Facturación (`/facturacion`)

- **Cuentas**: Ciclo de vida (ABIERTA→CERRADA→FACTURADA→COBRADA)
- **Coberturas**: Obras sociales/prepagas + planes con copagos y autorizaciones
- **Reportes**: 4 tipos exportables a CSV (facturación, cobertura, deuda, vencimientos)

### 6. Administración (`/admin`)

- **Usuarios**: CRUD + roles + reset password + activación/desactivación

## 🧪 Testing

```bash
# El front no tiene tests automatizados todavía; se verifica con:
pnpm web typecheck   # vue-tsc
pnpm web lint
pnpm web build

# Los tests (unitarios + e2e) están en el backend, con Jest:
pnpm test
```

## 📋 Criterios de Evaluación Cumplidos

| #   | Criterio                  | Implementación                                                              |
| --- | ------------------------- | --------------------------------------------------------------------------- |
| 1   | Estructura de proyecto    | Monorepo, Vite, TypeScript strict, ESLint, Prettier                         |
| 2   | Directivas Vue            | v-if, v-for, v-model, v-show, v-slot, v-bind, v-on                          |
| 3   | Comunicación componentes  | Props tipadas, emits tipados, slots nombrados, provide/inject (stores)      |
| 4   | Vue Router + Guards       | 20+ rutas anidadas, meta permisos, auth guard, RBAC guard, lazy loading     |
| 5   | Composables               | `useApi`, `useApiList`, `useForm` reutilizables                             |
| 6   | Pinia                     | 7 stores modulares, persistencia, actions async, getters computados         |
| 7   | API Integration           | Axios interceptors (JWT, errors, loading), métodos tipados por módulo       |
| 8   | UX/UI                     | Design system CSS, responsive, sidebar collapsible, toasts, loading states  |
| 9   | Creatividad/Funcionalidad | Mapa camas visual, triaje con colores, alertas signos vitales, timeline HCE |
| 10  | Documentación             | Este README + comentarios en código + tipos TypeScript                      |

## 🚀 Deploy

```bash
# Build producción
pnpm build

# Output en apps/web/dist/
# Servir con nginx, Apache, o cualquier static host
```

### Nginx Config (ejemplo)

```nginx
server {
  listen 80;
  root /var/www/his-web/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

## 🤝 Contribución

1. Fork del repo
2. Branch: `feature/nueva-funcionalidad` o `fix/descripcion-error`
3. Commits convencionales en español:
   - `feat: agregar filtro por fecha en reportes`
   - `fix: corregir validación de CUIT en coberturas`
4. PR con descripción y screenshots si aplica

## 📄 Licencia

Proyecto académico - TFI Programación y Metodologías - Grupo 5
