/**
 * Rutas del módulo HCE: historia clínica, evoluciones y prescripciones.
 */
import type { RouteRecordRaw } from 'vue-router';
import type { Permiso } from '@/modules/iam/iam.types';

export const hceRoutes: RouteRecordRaw[] = [
  {
    path: '/hce',
    name: 'hce',
    component: () => import('@/modules/hce/views/HceLayout.vue'),
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
        component: () => import('@/modules/hce/views/HistoriaClinicaView.vue'),
        meta: { title: 'Historia Clínica' },
      },
      {
        path: 'evoluciones',
        name: 'hce.evoluciones',
        component: () => import('@/modules/hce/views/EvolucionFormView.vue'),
        meta: { permisos: ['hce:escribir'] as Permiso[], title: 'Evoluciones' },
      },
      {
        path: 'prescripciones',
        name: 'hce.prescripciones',
        component: () => import('@/modules/hce/views/PrescripcionFormView.vue'),
        meta: { permisos: ['prescripciones:crear'] as Permiso[], title: 'Prescripciones' },
      },
      {
        path: 'paciente/:pacienteId',
        name: 'hce.historia',
        component: () => import('@/modules/hce/views/HistoriaClinicaView.vue'),
        meta: { title: 'Historia Clínica' },
      },
      {
        path: 'paciente/:pacienteId/evolucion/nueva',
        name: 'hce.evolucion.nueva',
        component: () => import('@/modules/hce/views/EvolucionFormView.vue'),
        meta: { permisos: ['hce:escribir'] as Permiso[], title: 'Nueva Evolución' },
      },
      {
        path: 'paciente/:pacienteId/prescripcion/nueva',
        name: 'hce.prescripcion.nueva',
        component: () => import('@/modules/hce/views/PrescripcionFormView.vue'),
        meta: { permisos: ['prescripciones:crear'] as Permiso[], title: 'Nueva Prescripción' },
      },
    ],
  },
];
