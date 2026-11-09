import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../building-blocks/infrastructure/prisma/prisma.service';
import { ConceptoCargo } from '../../domain/enums';
import type {
  ItemReporteFacturacion,
  ItemPorObraSocial,
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
        cuenta: {
          select: {
            pacienteId: true,
          },
        },
      },
    });

    // --- Por concepto ---
    const conceptos = [ConceptoCargo.CONSULTA, ConceptoCargo.MEDICACION, ConceptoCargo.DIA_CAMA];
    const mapa = new Map<ConceptoCargo, { cantidad: number; total: number }>();

    for (const c of conceptos) {
      mapa.set(c, { cantidad: 0, total: 0 });
    }

    // Collect unique pacienteIds to look up obra social
    const pacienteIds = [...new Set(cargos.map((c) => c.cuenta.pacienteId))];
    const pacientes = pacienteIds.length > 0
      ? await this.prisma.paciente.findMany({
          where: { id: { in: pacienteIds } },
          select: { id: true, obraSocialCodigo: true },
        })
      : [];
    const pacienteOSMap = new Map(pacientes.map((p) => [p.id, p.obraSocialCodigo]));

    // Look up obra social names
    const osCodigos = [...new Set(pacientes.map((p) => p.obraSocialCodigo).filter(Boolean))] as string[];
    const obrasSociales = osCodigos.length > 0
      ? await this.prisma.obraSocial.findMany({
          where: { codigo: { in: osCodigos } },
          select: { codigo: true, nombre: true },
        })
      : [];
    const osNombreMap = new Map(obrasSociales.map((os) => [os.codigo, os.nombre]));

    // --- Por obra social ---
    const mapaOS = new Map<string, { cantidad: number; monto: number }>();

    for (const cargo of cargos) {
      const conc = cargo.concepto as ConceptoCargo;
      const actual = mapa.get(conc) ?? { cantidad: 0, total: 0 };
      actual.cantidad += cargo.cantidad;
      actual.total += Number(cargo.montoTotal);
      mapa.set(conc, actual);

      const osCodigo = pacienteOSMap.get(cargo.cuenta.pacienteId);
      const osNombre = osCodigo ? (osNombreMap.get(osCodigo) ?? osCodigo) : 'Particular';
      const actualOS = mapaOS.get(osNombre) ?? { cantidad: 0, monto: 0 };
      actualOS.cantidad += cargo.cantidad;
      actualOS.monto += Number(cargo.montoTotal);
      mapaOS.set(osNombre, actualOS);
    }

    const items: ItemReporteFacturacion[] = conceptos.map((c) => ({
      concepto: c,
      cantidadTotal: mapa.get(c)!.cantidad,
      montoTotal: Number(mapa.get(c)!.total.toFixed(2)),
    }));

    const porObraSocial: ItemPorObraSocial[] = Array.from(mapaOS.entries()).map(
      ([obraSocial, valores]) => ({
        obraSocial,
        cantidad: valores.cantidad,
        monto: Number(valores.monto.toFixed(2)),
      }),
    );

    const granTotal = Number(items.reduce((acc, it) => acc + it.montoTotal, 0).toFixed(2));

    return {
      desde,
      hasta,
      items,
      porObraSocial,
      granTotal,
    };
  }
}
