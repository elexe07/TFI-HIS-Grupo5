import { Injectable } from '@nestjs/common';
import type { Insumo as FilaInsumo } from '@prisma/client';
import { PrismaService } from '../../../building-blocks/infrastructure/prisma/prisma.service';
import { type FiltroInsumos, Insumo, type InsumoRepository } from '../domain';

@Injectable()
export class InsumoRepositoryPrisma implements InsumoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(insumo: Insumo): Promise<void> {
    const datos = {
      codigo: insumo.codigo,
      nombre: insumo.nombre,
      medicamentoAsociado: insumo.medicamentoAsociado,
      stockActual: insumo.stockActual,
      stockMinimo: insumo.stockMinimo,
    };

    await this.prisma.insumo.upsert({
      where: { id: insumo.id },
      create: { id: insumo.id, ...datos },
      update: datos,
    });
  }

  async buscarPorId(id: string): Promise<Insumo | null> {
    const fila = await this.prisma.insumo.findUnique({ where: { id } });
    return fila ? aDominio(fila) : null;
  }

  async buscarPorCodigo(codigo: string): Promise<Insumo | null> {
    const fila = await this.prisma.insumo.findUnique({ where: { codigo } });
    return fila ? aDominio(fila) : null;
  }

  async buscarPorMedicamentoAsociado(medicamento: string): Promise<Insumo | null> {
    const medLimpio = medicamento.trim().toLowerCase();
    const filas = await this.prisma.insumo.findMany();
    const coincidencia = filas.find((f) => {
      if (!f.medicamentoAsociado) return false;
      const asociado = f.medicamentoAsociado.trim().toLowerCase();
      return (
        medLimpio === asociado ||
        medLimpio.startsWith(asociado) ||
        asociado.startsWith(medLimpio)
      );
    });
    return coincidencia ? aDominio(coincidencia) : null;
  }

  async listar(filtro?: FiltroInsumos): Promise<Insumo[]> {
    const filas = await this.prisma.insumo.findMany({
      orderBy: { nombre: 'asc' },
    });

    const dominio = filas.map(aDominio);
    if (filtro?.bajoMinimo) {
      return dominio.filter((i) => i.estaBajoMinimo());
    }
    return dominio;
  }
}

function aDominio(fila: FilaInsumo): Insumo {
  return Insumo.reconstituir({
    id: fila.id,
    codigo: fila.codigo,
    nombre: fila.nombre,
    medicamentoAsociado: fila.medicamentoAsociado,
    stockActual: fila.stockActual,
    stockMinimo: fila.stockMinimo,
    updatedAt: fila.updatedAt,
  });
}
