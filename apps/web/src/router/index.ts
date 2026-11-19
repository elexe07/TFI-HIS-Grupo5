/**
 * Router principal: junta las rutas de cada módulo (modules/<modulo>/<modulo>.routes.ts)
 * y define los guards globales de autenticación y permisos.
 */
import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalized,
  type NavigationGuardNext,
  type RouteRecordRaw,
} from 'vue-router';
import { useAuthStore } from '@/modules/iam/auth.store';
import { useToastStore } from '@/shared/stores/toast';
import type { Permiso } from '@/modules/iam/iam.types';
import { iamRoutes } from '@/modules/iam/iam.routes';
import { dashboardRoutes } from '@/modules/dashboard/dashboard.routes';
import { admisionRoutes } from '@/modules/admision/admision.routes';
import { hceRoutes } from '@/modules/hce/hce.routes';
import { enfermeriaRoutes } from '@/modules/enfermeria/enfermeria.routes';
import { recursosRoutes } from '@/modules/recursos/recursos.routes';
import { facturacionRoutes } from '@/modules/facturacion/facturacion.routes';

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
// RUTAS: cada módulo declara las suyas
// ============================================================================

const routes: RouteRecordRaw[] = [
  ...iamRoutes,
  ...dashboardRoutes,
  ...admisionRoutes,
  ...hceRoutes,
  ...enfermeriaRoutes,
  ...recursosRoutes,
  ...facturacionRoutes,

  // --- 404 (siempre al final) ---
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/shared/views/NotFoundView.vue'),
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
