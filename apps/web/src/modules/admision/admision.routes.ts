/**
 * Rutas del módulo Admisión: pacientes, agenda, turnos y triaje.
 */
import type { RouteRecordRaw } from 'vue-router';
import type { Permiso } from '@/modules/iam/iam.types';

export const admisionRoutes: RouteRecordRaw[] = [
  {
    path: '/admision',
    name: 'admision',
    component: () => import('@/modules/admision/views/AdmisionLayout.vue'),
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
        component: () => import('@/modules/admision/views/PacientesView.vue'),
        meta: { title: 'Pacientes' },
      },
      {
        path: 'pacientes/nuevo',
        name: 'admision.paciente.nuevo',
        component: () => import('@/modules/admision/views/PacienteFormView.vue'),
        meta: { permisos: ['pacientes:registrar'] as Permiso[], title: 'Nuevo Paciente' },
      },
      {
        path: 'pacientes/:id/editar',
        name: 'admision.paciente.editar',
        component: () => import('@/modules/admision/views/PacienteFormView.vue'),
        meta: { permisos: ['pacientes:registrar'] as Permiso[], title: 'Editar Paciente' },
      },
      {
        path: 'pacientes/:id',
        name: 'admision.paciente.detalle',
        component: () => import('@/modules/admision/views/PacienteDetalleView.vue'),
        meta: { title: 'Detalle Paciente' },
      },
      {
        path: 'agenda',
        name: 'admision.agenda',
        component: () => import('@/modules/admision/views/AgendaView.vue'),
        meta: { permisos: ['agenda:definir'] as Permiso[], title: 'Agenda Médica' },
      },
      {
        path: 'turnos',
        name: 'admision.turnos',
        component: () => import('@/modules/admision/views/TurnosView.vue'),
        meta: { permisos: ['turnos:reservar'] as Permiso[], title: 'Turnos' },
      },
      {
        path: 'triaje',
        name: 'admision.triaje',
        component: () => import('@/modules/admision/views/TriajeView.vue'),
        meta: {
          permisos: ['triaje:registrar', 'guardia:leer'] as Permiso[],
          permisosMode: 'any',
          title: 'Triaje y Guardia',
        },
      },
    ],
  },
];
