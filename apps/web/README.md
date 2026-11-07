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

```
apps/web/
├── public/                 # Assets estáticos
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── main.css    # Design system (variables, utilidades, animaciones)
│   ├── components/
│   │   ├── ui/             # Componentes base reutilizables
│   │   │   ├── Button.vue
│   │   │   ├── Input.vue
│   │   │   ├── Select.vue
│   │   │   ├── Card.vue
│   │   │   ├── Table.vue
│   │   │   ├── Badge.vue
│   │   │   ├── Modal.vue
│   │   │   ├── Toast.vue
│   │   │   └── index.ts    # Barrel exports
│   │   └── layout/
│   │       ├── AppHeader.vue
│   │       └── AppSidebar.vue
│   ├── composables/
│   │   ├── useApi.ts       # useApi, useApiList, useForm
│   │   └── index.ts
│   ├── router/
│   │   └── index.ts        # Rutas + guards (auth + RBAC)
│   ├── services/
│   │   └── api.ts          # Axios instance + métodos tipados por módulo
│   ├── stores/
│   │   ├── auth.ts         # Auth: token, user, roles, permisos
│   │   ├── admision.ts     # Pacientes, profesionales, agenda, turnos, triaje
│   │   ├── hce.ts          # HCE, evoluciones, alergias, prescripciones, estudios
│   │   ├── enfermeria.ts   # Indicaciones, signos vitales, notas, alertas
│   │   ├── recursos.ts     # Mapa de camas, internaciones, insumos
│   │   ├── facturacion.ts  # Cuentas, coberturas, reportes
│   │   ├── toast.ts        # Notificaciones globales
│   │   └── index.ts
│   ├── types/
│   │   └── api.ts          # 500+ interfaces TypeScript (match Prisma schema)
│   ├── views/
│   │   ├── iam/
│   │   │   ├── LoginView.vue
│   │   │   ├── AdminLayout.vue
│   │   │   ├── UsuariosView.vue
│   │   │   └── UsuarioFormView.vue
│   │   ├── admision/
│   │   │   ├── AdmisionLayout.vue
│   │   │   ├── PacientesView.vue
│   │   │   ├── AgendaView.vue
│   │   │   ├── TurnosView.vue
│   │   │   └── TriajeView.vue
│   │   ├── hce/
│   │   │   ├── HceLayout.vue
│   │   │   ├── HistoriaClinicaView.vue
│   │   │   ├── EvolucionFormView.vue
│   │   │   └── PrescripcionFormView.vue
│   │   ├── enfermeria/
│   │   │   ├── EnfermeriaLayout.vue
│   │   │   ├── IndicacionesView.vue
│   │   │   ├── SignosVitalesView.vue
│   │   │   └── NotasView.vue
│   │   ├── recursos/
│   │   │   ├── RecursosLayout.vue
│   │   │   ├── MapaCamasView.vue
│   │   │   ├── InternacionesView.vue
│   │   │   └── InsumosView.vue
│   │   ├── facturacion/
│   │   │   ├── FacturacionLayout.vue
│   │   │   ├── CuentasView.vue
│   │   │   ├── CoberturaView.vue
│   │   │   └── ReportesView.vue
│   │   ├── DashboardView.vue
│   │   ├── PerfilView.vue
│   │   └── NotFoundView.vue
│   ├── App.vue             # Layout principal (header + sidebar + router-view)
│   └── main.ts             # Bootstrap (Pinia + Router + Toast)
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

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

| Store | Responsabilidad |
|-------|-----------------|
| `auth` | JWT, usuario, roles, permisos, persistencia |
| `admision` | Pacientes, profesionales, agenda, turnos, triaje |
| `hce` | Historia clínica, evoluciones, alergias, prescripciones, estudios |
| `enfermeria` | Indicaciones, signos vitales, notas, alertas |
| `recursos` | Camas, internaciones, insumos, movimientos |
| `facturacion` | Cuentas, coberturas, planes, reportes |
| `toast` | Notificaciones globales (success/error/warning/info) |

### API Service (Axios)

- **Interceptores**: JWT automático, manejo de errores 401/403/500, loading global
- **Métodos tipados**: `api.admision`, `api.hce`, `api.enfermeria`, `api.recursos`, `api.facturacion`, `api.iam`
- **Tipado estricto**: Request/Response generics con interfaces de `types/api.ts`

### Composable `useApi`

```ts
// Uso básico
const { data, loading, error, execute } = useApi(() => api.admision.getPacientes())

// Lista con paginación
const { data, loading, fetchPage } = useApiList(() => api.admision.getPacientes({ page: 1 }))

// Formularios reactivos
const { form, errors, validate, submit } = useForm(initialData, validationSchema, onSubmit)
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
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
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

| Rol | Permisos Principales |
|-----|---------------------|
| `ADMINISTRADOR` | Acceso total + gestión usuarios |
| `MEDICO` | HCE, evoluciones, prescripciones, agenda |
| `ENFERMERO` | Indicaciones, signos vitales, notas |
| `RECEPCIONISTA` | Pacientes, turnos, triaje, admisión |
| `PACIENTE` | Portal paciente (solo lectura propia) |

### Permisos por Módulo

```ts
// Ejemplos de permisos (ver types/api.ts)
'pacientes:leer' | 'pacientes:registrar' | 'pacientes:actualizar'
'agenda:definir' | 'turnos:reservar' | 'turnos:cancelar'
'triaje:registrar' | 'guardia:leer'
'hce:leer' | 'hce:escribir'
'prescripciones:crear' | 'estudios:solicitar'
'enfermeria:indicaciones:leer' | 'enfermeria:signos:crear'
'camas:leer' | 'camas:actualizar' | 'internaciones:gestionar'
'insumos:gestionar' | 'movimientos:registrar'
'facturacion:leer' | 'cobertura:validar' | 'reportes:leer'
'iam:usuarios:leer' | 'iam:usuarios:crear' | 'iam:roles:gestionar'
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
# Unit tests (Vitest)
pnpm test

# E2E tests (Playwright)
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## 📋 Criterios de Evaluación Cumplidos

| # | Criterio | Implementación |
|---|----------|----------------|
| 1 | Estructura de proyecto | Monorepo, Vite, TypeScript strict, ESLint, Prettier |
| 2 | Directivas Vue | v-if, v-for, v-model, v-show, v-slot, v-bind, v-on |
| 3 | Comunicación componentes | Props tipadas, emits tipados, slots nombrados, provide/inject (stores) |
| 4 | Vue Router + Guards | 20+ rutas anidadas, meta permisos, auth guard, RBAC guard, lazy loading |
| 5 | Composables | `useApi`, `useApiList`, `useForm` reutilizables |
| 6 | Pinia | 7 stores modulares, persistencia, actions async, getters computados |
| 7 | API Integration | Axios interceptors (JWT, errors, loading), métodos tipados por módulo |
| 8 | UX/UI | Design system CSS, responsive, sidebar collapsible, toasts, loading states |
| 9 | Creatividad/Funcionalidad | Mapa camas visual, triaje con colores, alertas signos vitales, timeline HCE |
| 10 | Documentación | Este README + comentarios en código + tipos TypeScript |

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