/**
 * Rutas del módulo Recursos: mapa de camas, internaciones e insumos.
 */
import type { RouteRecordRaw } from 'vue-router';
import type { Permiso } from '@/modules/iam/iam.types';

export const recursosRoutes: RouteRecordRaw[] = [
  {
    path: '/recursos',
    name: 'recursos',
    component: () => import('@/modules/recursos/views/RecursosLayout.vue'),
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
        component: () => import('@/modules/recursos/views/MapaCamasView.vue'),
        meta: { title: 'Mapa de Camas' },
      },
      {
        path: 'internaciones',
        name: 'recursos.internaciones',
        component: () => import('@/modules/recursos/views/InternacionesView.vue'),
        meta: { permisos: ['internaciones:gestionar'] as Permiso[], title: 'Internaciones' },
      },
      {
        path: 'insumos',
        name: 'recursos.insumos',
        component: () => import('@/modules/recursos/views/InsumosView.vue'),
        meta: { permisos: ['insumos:gestionar'] as Permiso[], title: 'Insumos' },
      },
    ],
  },
];
