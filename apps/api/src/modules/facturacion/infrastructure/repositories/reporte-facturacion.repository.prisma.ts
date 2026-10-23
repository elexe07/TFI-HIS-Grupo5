import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../building-blocks/infrastructure/prisma/prisma.service';
import { ConceptoCargo } from '../../domain/enums';
import type {
  ItemReporteFacturacion,
  ReporteFacturacionPeriodo,
  ReporteFacturacionRepository,
} from '../../domain/ports/reporte-facturacion.repository';

@Injectable()
export class ReporteFacturacionRepositoryPrisma implements ReporteFacturacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async generarReporte(desde: Date, hasta: Date): Promise<ReporteFacturacionPeriodo> {
    const cargos = await this.prisma.cargo.findMany({
      where: {
        createdAt: {
          gte: desde,
          lte: hasta,
        },
      },
      select: {
        concepto: true,
        cantidad: true,
        montoTotal: true,
      },
    });

    const conceptos = [ConceptoCargo.CONSULTA, ConceptoCargo.MEDICACION, ConceptoCargo.DIA_CAMA];
    const mapa = new Map<ConceptoCargo, { cantidad: number; total: number }>();

    for (const c of conceptos) {
      mapa.set(c, { cantidad: 0, total: 0 });
    }

    for (const cargo of cargos) {
      const conc = cargo.concepto as ConceptoCargo;
      const actual = mapa.get(conc) ?? { cantidad: 0, total: 0 };
      actual.cantidad += cargo.cantidad;
      actual.total += Number(cargo.montoTotal);
      mapa.set(conc, actual);
    }

    const items: ItemReporteFacturacion[] = conceptos.map((c) => ({
      concepto: c,
      cantidadTotal: mapa.get(c)!.cantidad,
      montoTotal: Number(mapa.get(c)!.total.toFixed(2)),
    }));

    const granTotal = Number(items.reduce((acc, it) => acc + it.montoTotal, 0).toFixed(2));

    return {
      desde,
      hasta,
      items,
      granTotal,
    };
  }
}

