import type { ObraSocial } from '../obra-social';

export const OBRA_SOCIAL_REPOSITORY = Symbol('OBRA_SOCIAL_REPOSITORY');

export interface ObraSocialRepository {
  buscarPorCodigo(codigo: string): Promise<ObraSocial | null>;
  guardar(obraSocial: ObraSocial): Promise<void>;
  listarTodas(): Promise<ObraSocial[]>;
}

