/**
 * Rutas del módulo Facturación: cuentas, cobertura y reportes.
 */
import type { RouteRecordRaw } from 'vue-router';
import type { Permiso } from '@/modules/iam/iam.types';

export const facturacionRoutes: RouteRecordRaw[] = [
  {
    path: '/facturacion',
    name: 'facturacion',
    component: () => import('@/modules/facturacion/views/FacturacionLayout.vue'),
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
        component: () => import('@/modules/facturacion/views/CuentasView.vue'),
        meta: { title: 'Cuentas' },
      },
      {
        path: 'cuenta/:id',
        name: 'facturacion.cuenta.detalle',
        component: () => import('@/modules/facturacion/views/CuentaDetalleView.vue'),
        meta: { title: 'Detalle Cuenta' },
      },
      {
        path: 'cobertura',
        name: 'facturacion.cobertura',
        component: () => import('@/modules/facturacion/views/CoberturaView.vue'),
        meta: { permisos: ['cobertura:validar'] as Permiso[], title: 'Validar Cobertura' },
      },
      {
        path: 'reportes',
        name: 'facturacion.reportes',
        component: () => import('@/modules/facturacion/views/ReportesView.vue'),
        meta: { permisos: ['reportes:leer'] as Permiso[], title: 'Reportes' },
      },
    ],
  },
];
