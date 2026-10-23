import { Injectable } from '@nestjs/common';
import type { Tarifa as TarifaPrisma } from '@prisma/client';
import { PrismaService } from '../../../../building-blocks/infrastructure/prisma/prisma.service';
import type { ConceptoCargo } from '../../domain/enums';
import type { TarifaRepository } from '../../domain/ports/tarifa.repository';
import { Tarifa } from '../../domain/tarifa';

@Injectable()
export class TarifaRepositoryPrisma implements TarifaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorConcepto(concepto: ConceptoCargo): Promise<Tarifa | null> {
    const fila = await this.prisma.tarifa.findUnique({
      where: { concepto },
    });
    return fila ? this.aDominio(fila) : null;
  }

  async guardar(tarifa: Tarifa): Promise<void> {
    await this.prisma.tarifa.upsert({
      where: { concepto: tarifa.concepto },
      create: {
        id: tarifa.id,
        concepto: tarifa.concepto,
        monto: tarifa.monto,
      },
      update: {
        monto: tarifa.monto,
      },
    });
  }

  async listarTodas(): Promise<Tarifa[]> {
    const filas = await this.prisma.tarifa.findMany();
    return filas.map((f) => this.aDominio(f));
  }

  private aDominio(fila: TarifaPrisma): Tarifa {
    return Tarifa.rehidratar(fila.id, fila.concepto as ConceptoCargo, Number(fila.monto));
  }
}

