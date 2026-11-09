import { Injectable } from '@nestjs/common';
import type { Cama as FilaCama } from '@prisma/client';
import { PrismaService } from '../../../building-blocks/infrastructure/prisma/prisma.service';
import { Cama, type CamaRepository, EstadoCama } from '../domain';

@Injectable()
export class CamaRepositoryPrisma implements CamaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(cama: Cama): Promise<void> {
    const datos = {
      habitacionId: cama.habitacionId,
      codigo: cama.codigo,
      estado: cama.estado,
    };

    await this.prisma.cama.upsert({
      where: { id: cama.id },
      create: { id: cama.id, ...datos },
      update: datos,
    });
  }

  async buscarPorId(id: string): Promise<Cama | null> {
    const fila = await this.prisma.cama.findUnique({ where: { id } });
    return fila ? aDominio(fila) : null;
  }

  async buscarPorCodigo(codigo: string): Promise<Cama | null> {
    const fila = await this.prisma.cama.findUnique({ where: { codigo } });
    return fila ? aDominio(fila) : null;
  }

  async listarTodas(): Promise<Cama[]> {
    const filas = await this.prisma.cama.findMany({
      orderBy: { codigo: 'asc' },
    });
    return filas.map(aDominio);
  }
}

function aDominio(fila: FilaCama): Cama {
  return Cama.reconstituir({
    id: fila.id,
    habitacionId: fila.habitacionId,
    codigo: fila.codigo,
    estado: fila.estado as EstadoCama,
    updatedAt: fila.updatedAt,
  });
}
