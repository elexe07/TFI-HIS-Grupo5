/**
 * Rutas del módulo Enfermería: indicaciones, signos vitales y notas.
 */
import type { RouteRecordRaw } from 'vue-router';
import type { Permiso } from '@/modules/iam/iam.types';

export const enfermeriaRoutes: RouteRecordRaw[] = [
  {
    path: '/enfermeria',
    name: 'enfermeria',
    component: () => import('@/modules/enfermeria/views/EnfermeriaLayout.vue'),
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
        component: () => import('@/modules/enfermeria/views/IndicacionesView.vue'),
        meta: { title: 'Indicaciones' },
      },
      {
        path: 'signos-vitales',
        name: 'enfermeria.signos-vitales',
        component: () => import('@/modules/enfermeria/views/SignosVitalesView.vue'),
        meta: { permisos: ['enfermeria:signos:crear'] as Permiso[], title: 'Signos Vitales' },
      },
      {
        path: 'notas',
        name: 'enfermeria.notas',
        component: () => import('@/modules/enfermeria/views/NotasView.vue'),
        meta: { permisos: ['enfermeria:notas:crear'] as Permiso[], title: 'Notas de Enfermería' },
      },
    ],
  },
];
