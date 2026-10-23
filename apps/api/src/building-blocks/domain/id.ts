import { randomUUID } from 'node:crypto';

export type Id = string;

/** Los ids se generan en la aplicación (no en la base) para que el dominio no dependa de Prisma. */
export const generarId = (): Id => randomUUID();
