import { Injectable } from '@nestjs/common';
import type { Internacion as FilaInternacion } from '@prisma/client';
import { PrismaService } from '../../../building-blocks/infrastructure/prisma/prisma.service';
import { EstadoInternacion, Internacion, type InternacionRepository } from '../domain';

@Injectable()
export class InternacionRepositoryPrisma implements InternacionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(internacion: Internacion): Promise<void> {
    const datos = {
      pacienteId: internacion.pacienteId,
      camaId: internacion.camaId,
      medicoId: internacion.medicoId,
      motivo: internacion.motivo,
      estado: internacion.estado,
      ingresoEn: internacion.ingresoEn,
      egresoEn: internacion.egresoEn,
    };

    await this.prisma.internacion.upsert({
      where: { id: internacion.id },
      create: {
        id: internacion.id,
        createdAt: internacion.createdAt,
        ...datos,
      },
      update: datos,
    });
  }

  async buscarPorId(id: string): Promise<Internacion | null> {
    const fila = await this.prisma.internacion.findUnique({ where: { id } });
    return fila ? aDominio(fila) : null;
  }

  async buscarActivaPorPacienteId(pacienteId: string): Promise<Internacion | null> {
    const fila = await this.prisma.internacion.findFirst({
      where: {
        pacienteId,
        estado: EstadoInternacion.ACTIVA,
      },
    });
    return fila ? aDominio(fila) : null;
  }

  async buscarActivaPorCamaId(camaId: string): Promise<Internacion | null> {
    const fila = await this.prisma.internacion.findFirst({
      where: {
        camaId,
        estado: EstadoInternacion.ACTIVA,
      },
    });
    return fila ? aDominio(fila) : null;
  }

  async buscarTodas(params?: { estado?: string }): Promise<Internacion[]> {
    const filas = await this.prisma.internacion.findMany({
      where: params?.estado ? { estado: params.estado as any } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return filas.map(aDominio);
  }
}

function aDominio(fila: FilaInternacion): Internacion {
  return Internacion.reconstituir({
    id: fila.id,
    pacienteId: fila.pacienteId,
    camaId: fila.camaId,
    medicoId: fila.medicoId,
    motivo: fila.motivo,
    estado: fila.estado as EstadoInternacion,
    ingresoEn: fila.ingresoEn,
    egresoEn: fila.egresoEn,
    createdAt: fila.createdAt,
    updatedAt: fila.updatedAt,
  });
}
