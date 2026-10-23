/**
 * Catálogo de roles y permisos del sistema. Es la fuente de verdad: el seed lo carga en la base
 * y el test `permisos.spec.ts` verifica que coincida con `docs/iam-permisos.md`.
 *
 * Formato de permiso: `modulo:accion`. Cuando otro módulo necesita un permiso nuevo,
 * lo agrega acá, en la matriz y en la tabla del doc (el test obliga a mantenerlos en sincronía).
 *
 * Este archivo no depende de nada: lo importa también `prisma/seed.ts`.
 */
export const ROLES = ['ADMINISTRADOR', 'MEDICO', 'ENFERMERO', 'RECEPCIONISTA', 'PACIENTE'] as const;
export type NombreRol = (typeof ROLES)[number];

export const PERMISOS = {
  USUARIOS_GESTIONAR: 'usuarios:gestionar',
  PACIENTES_REGISTRAR: 'pacientes:registrar',
  PACIENTES_LEER: 'pacientes:leer',
  AGENDA_DEFINIR: 'agenda:definir',
  TURNOS_RESERVAR: 'turnos:reservar',
  TURNOS_CANCELAR: 'turnos:cancelar',
  TRIAJE_REGISTRAR: 'triaje:registrar',
  GUARDIA_LEER: 'guardia:leer',
  HCE_LEER: 'hce:leer',
  HCE_ESCRIBIR: 'hce:escribir',
  PRESCRIPCIONES_CREAR: 'prescripciones:crear',
  ENFERMERIA_REGISTRAR: 'enfermeria:registrar',
  ENFERMERIA_LEER: 'enfermeria:leer',
  CAMAS_LEER: 'camas:leer',
  CAMAS_GESTIONAR: 'camas:gestionar',
  INTERNACIONES_GESTIONAR: 'internaciones:gestionar',
  INSUMOS_GESTIONAR: 'insumos:gestionar',
  FACTURACION_LEER: 'facturacion:leer',
  COBERTURA_VALIDAR: 'cobertura:validar',
  REPORTES_LEER: 'reportes:leer',
} as const;

export type Permiso = (typeof PERMISOS)[keyof typeof PERMISOS];

const P = PERMISOS;

/** Matriz rol × permiso. "propio" en el doc significa que además el caso de uso filtra por dueño. */
export const MATRIZ_PERMISOS: Readonly<Record<NombreRol, readonly Permiso[]>> = {
  ADMINISTRADOR: [
    P.USUARIOS_GESTIONAR,
    P.PACIENTES_REGISTRAR,
    P.PACIENTES_LEER,
    P.AGENDA_DEFINIR,
    P.TURNOS_RESERVAR,
    P.TURNOS_CANCELAR,
    P.GUARDIA_LEER,
    P.CAMAS_LEER,
    P.CAMAS_GESTIONAR,
    P.INTERNACIONES_GESTIONAR,
    P.INSUMOS_GESTIONAR,
    P.FACTURACION_LEER,
    P.COBERTURA_VALIDAR,
    P.REPORTES_LEER,
  ],
  MEDICO: [
    P.PACIENTES_LEER,
    P.AGENDA_DEFINIR,
    P.GUARDIA_LEER,
    P.HCE_LEER,
    P.HCE_ESCRIBIR,
    P.PRESCRIPCIONES_CREAR,
    P.ENFERMERIA_LEER,
    P.CAMAS_LEER,
    P.INTERNACIONES_GESTIONAR,
  ],
  ENFERMERO: [
    P.PACIENTES_LEER,
    P.TRIAJE_REGISTRAR,
    P.GUARDIA_LEER,
    P.HCE_LEER,
    P.ENFERMERIA_REGISTRAR,
    P.ENFERMERIA_LEER,
    P.CAMAS_LEER,
    P.CAMAS_GESTIONAR,
  ],
  RECEPCIONISTA: [
    P.PACIENTES_REGISTRAR,
    P.PACIENTES_LEER,
    P.TURNOS_RESERVAR,
    P.TURNOS_CANCELAR,
    P.GUARDIA_LEER,
    P.CAMAS_LEER,
    P.INTERNACIONES_GESTIONAR,
    P.FACTURACION_LEER,
    P.COBERTURA_VALIDAR,
  ],
  PACIENTE: [
    P.PACIENTES_LEER,
    P.TURNOS_RESERVAR,
    P.TURNOS_CANCELAR,
    P.HCE_LEER,
    P.FACTURACION_LEER,
  ],
};

export const esNombreRol = (valor: unknown): valor is NombreRol =>
  ROLES.includes(valor as NombreRol);
