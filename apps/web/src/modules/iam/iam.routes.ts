/**
 * Rutas del módulo IAM: login, administración de usuarios y perfil propio.
 */
import type { RouteRecordRaw } from 'vue-router';
import type { Permiso } from './iam.types';

export const iamRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/iam/views/LoginView.vue'),
    meta: {
      requiresAuth: false,
      layout: 'auth',
      title: 'Iniciar Sesión',
    },
  },

  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/modules/iam/views/AdminLayout.vue'),
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
        component: () => import('@/modules/iam/views/UsuariosView.vue'),
        meta: { title: 'Usuarios' },
      },
    ],
  },

  {
    path: '/perfil',
    name: 'perfil',
    component: () => import('@/modules/iam/views/PerfilView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'default',
      title: 'Mi Perfil',
    },
  },
];
