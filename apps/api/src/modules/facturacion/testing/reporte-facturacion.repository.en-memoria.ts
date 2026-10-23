import { ConceptoCargo } from '../domain/enums';
import type {
  ItemReporteFacturacion,
  ReporteFacturacionPeriodo,
  ReporteFacturacionRepository,
} from '../domain/ports/reporte-facturacion.repository';
import type { CuentaRepositoryEnMemoria } from './cuenta.repository.en-memoria';

interface RangoAcumulador {
  readonly desde: Date;
  readonly hasta: Date;
  readonly mapa: Map<ConceptoCargo, { cantidad: number; total: number }>;
}

export class ReporteFacturacionRepositoryEnMemoria implements ReporteFacturacionRepository {
  constructor(private readonly cuentaRepo?: CuentaRepositoryEnMemoria) {}

  async generarReporte(desde: Date, hasta: Date): Promise<ReporteFacturacionPeriodo> {
    const conceptos = [ConceptoCargo.CONSULTA, ConceptoCargo.MEDICACION, ConceptoCargo.DIA_CAMA];
    const mapa = new Map<ConceptoCargo, { cantidad: number; total: number }>();

    for (const c of conceptos) {
      mapa.set(c, { cantidad: 0, total: 0 });
    }

    if (this.cuentaRepo) {
      const cuentas = await this.cuentaRepo.listarTodas();
      const acumulador: RangoAcumulador = { desde, hasta, mapa };
      for (const cuenta of cuentas) {
        this.acumularCargos(cuenta.cargos, acumulador);
      }
    }

    const items: ItemReporteFacturacion[] = conceptos.map((c) => ({
      concepto: c,
      cantidadTotal: mapa.get(c)?.cantidad ?? 0,
      montoTotal: Number((mapa.get(c)?.total ?? 0).toFixed(2)),
    }));

    const granTotal = Number(items.reduce((acc, it) => acc + it.montoTotal, 0).toFixed(2));

    return { desde, hasta, items, granTotal };
  }

  private acumularCargos(
    cargos: readonly {
      createdAt: Date;
      concepto: ConceptoCargo;
      cantidad: number;
      montoTotal: number;
    }[],
    ctx: RangoAcumulador,
  ): void {
    for (const cargo of cargos) {
      if (cargo.createdAt >= ctx.desde && cargo.createdAt <= ctx.hasta) {
        const actual = ctx.mapa.get(cargo.concepto) ?? { cantidad: 0, total: 0 };
        actual.cantidad += cargo.cantidad;
        actual.total += cargo.montoTotal;
        ctx.mapa.set(cargo.concepto, actual);
      }
    }
  }
}
