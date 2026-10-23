import { ObraSocial } from '../domain/obra-social';
import type { ObraSocialRepository } from '../domain/ports/obra-social.repository';

export class ObraSocialRepositoryEnMemoria implements ObraSocialRepository {
  private obras = new Map<string, ObraSocial>();

  constructor() {
    this.guardar(ObraSocial.crear('PARTICULAR', 'Particular (sin cobertura)', 0));
    this.guardar(ObraSocial.crear('OSDE', 'OSDE', 80));
    this.guardar(ObraSocial.crear('PAMI', 'PAMI', 100));
  }

  async buscarPorCodigo(codigo: string): Promise<ObraSocial | null> {
    const ob = this.obras.get(codigo.toUpperCase());
    return ob ? ObraSocial.rehidratar(ob.id, ob.codigo, ob.nombre, ob.porcentajeCobertura) : null;
  }

  async guardar(obraSocial: ObraSocial): Promise<void> {
    this.obras.set(
      obraSocial.codigo.toUpperCase(),
      ObraSocial.rehidratar(
        obraSocial.id,
        obraSocial.codigo,
        obraSocial.nombre,
        obraSocial.porcentajeCobertura,
      ),
    );
  }

  async listarTodas(): Promise<ObraSocial[]> {
    return Array.from(this.obras.values()).map((o) =>
      ObraSocial.rehidratar(o.id, o.codigo, o.nombre, o.porcentajeCobertura),
    );
  }
}

