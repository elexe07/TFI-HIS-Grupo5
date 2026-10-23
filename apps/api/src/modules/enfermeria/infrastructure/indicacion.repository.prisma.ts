import { Injectable } from '@nestjs/common';
import type { Indicacion as FilaIndicacion, Prisma } from '@prisma/client';
import { PrismaService } from '../../../building-blocks/infrastructure/prisma/prisma.service';
import { Indicacion } from '../domain/indicacion';
import type {
  FiltrosListarIndicaciones,
  IndicacionRepository,
} from '../domain/indicacion.repository';
import type { EstadoIndicacion } from '../domain/estado-indicacion';

@Injectable()
export class IndicacionRepositoryPrisma implements IndicacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(indicacion: Indicacion): Promise<void> {
    const datos = {
      internacionId: indicacion.internacionId,
      pacienteId: indicacion.pacienteId,
      prescripcionId: indicacion.prescripcionId,
      descripcion: indicacion.descripcion,
      programadaPara: indicacion.programadaPara,
      estado: indicacion.estado,
      motivoOmision: indicacion.motivoOmision,
      updatedAt: indicacion.updatedAt,
    };

    await this.prisma.indicacion.upsert({
      where: { id: indicacion.id },
      create: {
        id: indicacion.id,
        createdAt: indicacion.createdAt,
        ...datos,
      },
      update: datos,
    });
  }

  async guardarMuchas(indicaciones: Indicacion[]): Promise<void> {
    if (indicaciones.length === 0) return;

    await this.prisma.indicacion.createMany({
      data: indicaciones.map((ind) => ({
        id: ind.id,
        internacionId: ind.internacionId,
        pacienteId: ind.pacienteId,
        prescripcionId: ind.prescripcionId,
        descripcion: ind.descripcion,
        programadaPara: ind.programadaPara,
        estado: ind.estado,
        motivoOmision: ind.motivoOmision,
        createdAt: ind.createdAt,
        updatedAt: ind.updatedAt,
      })),
      skipDuplicates: true,
    });
  }

  async buscarPorId(id: string): Promise<Indicacion | null> {
    const fila = await this.prisma.indicacion.findUnique({
      where: { id },
    });
    return fila ? aDominio(fila) : null;
  }

  async buscarPorPrescripcionId(prescripcionId: string): Promise<Indicacion[]> {
    const filas = await this.prisma.indicacion.findMany({
      where: { prescripcionId },
      orderBy: { programadaPara: 'asc' },
    });
    return filas.map(aDominio);
  }

  async listar(filtros?: FiltrosListarIndicaciones): Promise<Indicacion[]> {
    const where: Prisma.IndicacionWhereInput = {};

    if (filtros?.internacionId) {
      where.internacionId = filtros.internacionId;
    }
    if (filtros?.pacienteId) {
      where.pacienteId = filtros.pacienteId;
    }
    if (filtros?.fecha) {
      const inicio = new Date(filtros.fecha);
      inicio.setUTCHours(0, 0, 0, 0);
      const fin = new Date(filtros.fecha);
      fin.setUTCHours(23, 59, 59, 999);

      where.programadaPara = {
        gte: inicio,
        lte: fin,
      };
    }

    const filas = await this.prisma.indicacion.findMany({
      where,
      orderBy: { programadaPara: 'asc' },
    });

    return filas.map(aDominio);
  }

  async existePorPrescripcionYFecha(prescripcionId: string, programadaPara: Date): Promise<boolean> {
    const count = await this.prisma.indicacion.count({
      where: {
        prescripcionId,
        programadaPara,
      },
    });
    return count > 0;
  }
}

function aDominio(fila: FilaIndicacion): Indicacion {
  return Indicacion.reconstituir(fila.id, {
    internacionId: fila.internacionId,
    pacienteId: fila.pacienteId,
    prescripcionId: fila.prescripcionId,
    descripcion: fila.descripcion,
    programadaPara: fila.programadaPara,
    estado: fila.estado as EstadoIndicacion,
    motivoOmision: fila.motivoOmision,
    createdAt: fila.createdAt,
    updatedAt: fila.updatedAt,
  });
}

