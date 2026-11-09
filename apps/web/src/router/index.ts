/**
 * Router principal con guards de navegación
 * Vue Router 4 + TypeScript
 */
import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type NavigationGuardNext,
} from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import type { Permiso } from '@/types/api';

// ============================================================================
// TIPOS PARA META DE RUTAS
// ============================================================================

// Extender RouteMeta para TypeScript
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    permisos?: Permiso[];
    permisosMode?: 'any' | 'all'; // 'any' = al menos uno, 'all' = todos
    title?: string;
    layout?: 'default' | 'auth' | 'empty';
  }
}

// ============================================================================
// RUTAS
// ============================================================================

import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // --- AUTENTICACIÓN ---
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/iam/LoginView.vue'),
    meta: {
      requiresAuth: false,
      layout: 'auth',
      title: 'Iniciar Sesión',
    },
  },

  // --- DASHBOARD / INICIO ---
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'default',
      title: 'Dashboard',
    },
  },

  // --- ADMISIÓN ---
  {
    path: '/admision',
    name: 'admision',
    component: () => import('@/views/admision/AdmisionLayout.vue'),
    meta: {
      requiresAuth: true,
      permisos: ['pacientes:leer'] as Permiso[],
      layout: 'default',
      title: 'Admisión',
    },
    children: [
      {
        path: '',
        name: 'admision.pacientes',
        component: () => import('@/views/admision/PacientesView.vue'),
        meta: { title: 'Pacientes' },
      },
      {
        path: 'pacientes/nuevo',
        name: 'admision.paciente.nuevo',
        component: () => import('@/views/admision/PacienteFormView.vue'),
        meta: { permisos: ['pacientes:registrar'] as Permiso[], title: 'Nuevo Paciente' },
      },
      {
        path: 'pacientes/:id/editar',
        name: 'admision.paciente.editar',
        component: () => import('@/views/admision/PacienteFormView.vue'),
        meta: { permisos: ['pacientes:registrar'] as Permiso[], title: 'Editar Paciente' },
      },
      {
        path: 'pacientes/:id',
        name: 'admision.paciente.detalle',
        component: () => import('@/views/admision/PacienteDetalleView.vue'),
        meta: { title: 'Detalle Paciente' },
      },
      {
        path: 'agenda',
        name: 'admision.agenda',
        component: () => import('@/views/admision/AgendaView.vue'),
        meta: { permisos: ['agenda:definir'] as Permiso[], title: 'Agenda Médica' },
      },
      {
        path: 'turnos',
        name: 'admision.turnos',
        component: () => import('@/views/admision/TurnosView.vue'),
        meta: { permisos: ['turnos:reservar'] as Permiso[], title: 'Turnos' },
      },
      {
        path: 'triaje',
        name: 'admision.triaje',
        component: () => import('@/views/admision/TriajeView.vue'),
        meta: {
          permisos: ['triaje:registrar', 'guardia:leer'] as Permiso[],
          permisosMode: 'any',
          title: 'Triaje y Guardia',
        },
      },
    ],
  },

  // --- HCE ---
  {
    path: '/hce',
    name: 'hce',
    component: () => import('@/views/hce/HceLayout.vue'),
    meta: {
      requiresAuth: true,
      permisos: ['hce:leer'] as Permiso[],
      layout: 'default',
      title: 'Historia Clínica',
    },
    children: [
      {
        path: '',
        name: 'hce.inicio',
        component: () => import('@/views/hce/HistoriaClinicaView.vue'),
        meta: { title: 'Historia Clínica' },
      },
      {
        path: 'evoluciones',
        name: 'hce.evoluciones',
        component: () => import('@/views/hce/EvolucionFormView.vue'),
        meta: { permisos: ['hce:escribir'] as Permiso[], title: 'Evoluciones' },
      },
      {
        path: 'prescripciones',
        name: 'hce.prescripciones',
        component: () => import('@/views/hce/PrescripcionFormView.vue'),
        meta: { permisos: ['prescripciones:crear'] as Permiso[], title: 'Prescripciones' },
      },
      {
        path: 'paciente/:pacienteId',
        name: 'hce.historia',
        component: () => import('@/views/hce/HistoriaClinicaView.vue'),
        meta: { title: 'Historia Clínica' },
      },
      {
        path: 'paciente/:pacienteId/evolucion/nueva',
        name: 'hce.evolucion.nueva',
        component: () => import('@/views/hce/EvolucionFormView.vue'),
        meta: { permisos: ['hce:escribir'] as Permiso[], title: 'Nueva Evolución' },
      },
      {
        path: 'paciente/:pacienteId/prescripcion/nueva',
        name: 'hce.prescripcion.nueva',
        component: () => import('@/views/hce/PrescripcionFormView.vue'),
        meta: { permisos: ['prescripciones:crear'] as Permiso[], title: 'Nueva Prescripción' },
      },
    ],
  },

  // --- ENFERMERÍA ---
  {
    path: '/enfermeria',
    name: 'enfermeria',
    component: () => import('@/views/enfermeria/EnfermeriaLayout.vue'),
    meta: {
      requiresAuth: true,
      permisos: ['enfermeria:indicaciones:leer'] as Permiso[],
      layout: 'default',
      title: 'Enfermería',
    },
    children: [
      {
        path: '',
        name: 'enfermeria.indicaciones',
        component: () => import('@/views/enfermeria/IndicacionesView.vue'),
        meta: { title: 'Indicaciones' },
      },
      {
        path: 'signos-vitales',
        name: 'enfermeria.signos-vitales',
        component: () => import('@/views/enfermeria/SignosVitalesView.vue'),
        meta: { permisos: ['enfermeria:signos:crear'] as Permiso[], title: 'Signos Vitales' },
      },
      {
        path: 'notas',
        name: 'enfermeria.notas',
        component: () => import('@/views/enfermeria/NotasView.vue'),
        meta: { permisos: ['enfermeria:notas:crear'] as Permiso[], title: 'Notas de Enfermería' },
      },
    ],
  },

  // --- RECURSOS ---
  {
    path: '/recursos',
    name: 'recursos',
    component: () => import('@/views/recursos/RecursosLayout.vue'),
    meta: {
      requiresAuth: true,
      permisos: ['camas:leer'] as Permiso[],
      layout: 'default',
      title: 'Recursos y Camas',
    },
    children: [
      {
        path: '',
        name: 'recursos.mapa-camas',
        component: () => import('@/views/recursos/MapaCamasView.vue'),
        meta: { title: 'Mapa de Camas' },
      },
      {
        path: 'internaciones',
        name: 'recursos.internaciones',
        component: () => import('@/views/recursos/InternacionesView.vue'),
        meta: { permisos: ['internaciones:gestionar'] as Permiso[], title: 'Internaciones' },
      },
      {
        path: 'insumos',
        name: 'recursos.insumos',
        component: () => import('@/views/recursos/InsumosView.vue'),
        meta: { permisos: ['insumos:gestionar'] as Permiso[], title: 'Insumos' },
      },
    ],
  },

  // --- FACTURACIÓN ---
  {
    path: '/facturacion',
    name: 'facturacion',
    component: () => import('@/views/facturacion/FacturacionLayout.vue'),
    meta: {
      requiresAuth: true,
      permisos: ['facturacion:leer'] as Permiso[],
      layout: 'default',
      title: 'Facturación',
    },
    children: [
      {
        path: '',
        name: 'facturacion.cuentas',
        component: () => import('@/views/facturacion/CuentasView.vue'),
        meta: { title: 'Cuentas' },
      },
      {
        path: 'cuenta/:id',
        name: 'facturacion.cuenta.detalle',
        component: () => import('@/views/facturacion/CuentaDetalleView.vue'),
        meta: { title: 'Detalle Cuenta' },
      },
      {
        path: 'cobertura',
        name: 'facturacion.cobertura',
        component: () => import('@/views/facturacion/CoberturaView.vue'),
        meta: { permisos: ['cobertura:validar'] as Permiso[], title: 'Validar Cobertura' },
      },
      {
        path: 'reportes',
        name: 'facturacion.reportes',
        component: () => import('@/views/facturacion/ReportesView.vue'),
        meta: { permisos: ['reportes:leer'] as Permiso[], title: 'Reportes' },
      },
    ],
  },

  // --- ADMINISTRACIÓN (IAM) ---
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/iam/AdminLayout.vue'),
    meta: {
      requiresAuth: true,
      permisos: ['iam:usuarios:leer'] as Permiso[],
      layout: 'default',
      title: 'Administración',
    },
    children: [
      {
        path: 'usuarios',
        name: 'admin.usuarios',
        component: () => import('@/views/iam/UsuariosView.vue'),
        meta: { title: 'Usuarios' },
      },
      {
        path: 'usuarios/nuevo',
        name: 'admin.usuario.nuevo',
        component: () => import('@/views/iam/UsuarioFormView.vue'),
        meta: { permisos: ['iam:usuarios:crear'] as Permiso[], title: 'Nuevo Usuario' },
      },
    ],
  },

  // --- PERFIL ---
  {
    path: '/perfil',
    name: 'perfil',
    component: () => import('@/views/PerfilView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'default',
      title: 'Mi Perfil',
    },
  },

  // --- 404 ---
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      layout: 'empty',
      title: 'Página no encontrada',
    },
  },
];

// ============================================================================
// CREAR ROUTER
// ============================================================================

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

// ============================================================================
// GUARDS DE NAVEGACIÓN
// ============================================================================

router.beforeEach(
  async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const authStore = useAuthStore();
    const toastStore = useToastStore();

    // Inicializar auth si no está hecho
    if (!authStore.usuario && authStore.token) {
      await authStore.initAuth();
    }

    const requiresAuth = to.meta.requiresAuth ?? true;
    const requiredPermisos = (to.meta.permisos ?? []) as Permiso[];
    const permisosMode = to.meta.permisosMode ?? 'all';

    // 1. Verificar autenticación
    if (requiresAuth && !authStore.isAuthenticated) {
      toastStore.warning('Debe iniciar sesión para acceder a esta página');
      return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    // 2. Si ya está autenticado e intenta ir a login, redirigir a dashboard
    if (to.name === 'login' && authStore.isAuthenticated) {
      return next({ name: 'dashboard' });
    }

    // 3. Verificar permisos
    if (requiresAuth && requiredPermisos.length > 0) {
      if (authStore.esAdmin) {
        if (to.meta.title) {
          document.title = `${to.meta.title} - HIS`;
        }
        return next();
      }

      const tienePermiso =
        permisosMode === 'any'
          ? authStore.tieneCualquierPermiso(requiredPermisos)
          : authStore.tieneTodosLosPermisos(requiredPermisos);

      if (!tienePermiso) {
        toastStore.error(
          'No tiene permisos para acceder a esta página',
          'Permisos requeridos: ' + requiredPermisos.join(', '),
        );
        return next({ name: 'dashboard' });
      }
    }

    // 4. Actualizar título del documento
    if (to.meta.title) {
      document.title = `${to.meta.title} - HIS`;
    }

    next();
  },
);

// Guard después de cada navegación (para analytics, etc.)
router.afterEach((to) => {
  // Aquí se podría agregar tracking de páginas, etc.
  console.log(`[Router] Navegado a: ${String(to.name)}`, to.params);
});

export default router;
