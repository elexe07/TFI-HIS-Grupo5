export const ESTADOS_INDICACION = {
  PENDIENTE: 'PENDIENTE',
  EJECUTADA: 'EJECUTADA',
  OMITIDA: 'OMITIDA',
} as const;

export type EstadoIndicacion = (typeof ESTADOS_INDICACION)[keyof typeof ESTADOS_INDICACION];

