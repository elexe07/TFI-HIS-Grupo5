/**
 * Ruta del portal del paciente: la única pantalla (además de Mi Perfil) que ve un PACIENTE.
 */
import type { RouteRecordRaw } from 'vue-router';

export const portalRoutes: RouteRecordRaw[] = [
  {
    path: '/mi-portal',
    name: 'portal',
    component: () => import('@/modules/portal/views/MiPortalView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'default',
      title: 'Mi portal',
    },
  },
];
