/**
 * Ruta de inicio (dashboard con resumen de todos los módulos).
 */
import type { RouteRecordRaw } from 'vue-router';

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/modules/dashboard/views/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'default',
      title: 'Dashboard',
    },
  },
];
