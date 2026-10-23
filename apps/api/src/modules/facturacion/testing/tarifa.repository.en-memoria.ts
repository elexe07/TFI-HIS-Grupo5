import { ConceptoCargo } from '../domain/enums';
import type { TarifaRepository } from '../domain/ports/tarifa.repository';
import { Tarifa } from '../domain/tarifa';

export class TarifaRepositoryEnMemoria implements TarifaRepository {
  private tarifas = new Map<ConceptoCargo, Tarifa>();

  constructor() {
    // Tarifas predeterminadas (similares al seed)
    this.guardar(Tarifa.crear(ConceptoCargo.CONSULTA, 15000));
    this.guardar(Tarifa.crear(ConceptoCargo.MEDICACION, 5000));
    this.guardar(Tarifa.crear(ConceptoCargo.DIA_CAMA, 45000));
  }

  async buscarPorConcepto(concepto: ConceptoCargo): Promise<Tarifa | null> {
    const tarifa = this.tarifas.get(concepto);
    return tarifa ? Tarifa.rehidratar(tarifa.id, tarifa.concepto, tarifa.monto) : null;
  }

  async guardar(tarifa: Tarifa): Promise<void> {
    this.tarifas.set(tarifa.concepto, Tarifa.rehidratar(tarifa.id, tarifa.concepto, tarifa.monto));
  }

  async listarTodas(): Promise<Tarifa[]> {
    return Array.from(this.tarifas.values()).map((t) =>
      Tarifa.rehidratar(t.id, t.concepto, t.monto),
    );
  }
}

