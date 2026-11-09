import { Injectable } from '@nestjs/common';
import type { Habitacion as FilaHabitacion } from '@prisma/client';
import { PrismaService } from '../../../building-blocks/infrastructure/prisma/prisma.service';
import { Habitacion, type HabitacionRepository } from '../domain';

@Injectable()
export class HabitacionRepositoryPrisma implements HabitacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(habitacion: Habitacion): Promise<void> {
    const datos = {
      sector: habitacion.sector,
      numero: habitacion.numero,
    };

    await this.prisma.habitacion.upsert({
      where: { id: habitacion.id },
      create: { id: habitacion.id, ...datos },
      update: datos,
    });
  }

  async buscarPorId(id: string): Promise<Habitacion | null> {
    const fila = await this.prisma.habitacion.findUnique({ where: { id } });
    return fila ? aDominio(fila) : null;
  }

  async listarTodas(): Promise<Habitacion[]> {
    const filas = await this.prisma.habitacion.findMany({
      orderBy: [{ sector: 'asc' }, { numero: 'asc' }],
    });
    return filas.map(aDominio);
  }
}

function aDominio(fila: FilaHabitacion): Habitacion {
  return Habitacion.reconstituir({
    id: fila.id,
    sector: fila.sector,
    numero: fila.numero,
  });
}
