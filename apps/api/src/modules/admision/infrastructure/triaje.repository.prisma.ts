import { Injectable } from '@nestjs/common';
import type { Triaje as TriajePrisma } from '@prisma/client';
import { PrismaService } from '../../../building-blocks/infrastructure/prisma/prisma.service';
import { EstadoTriaje, NivelTriaje } from '../domain/tipos';
import { Triaje } from '../domain/triaje';
import type { TriajeRepository } from '../domain/triaje.repository';

@Injectable()
export class TriajeRepositoryPrisma implements TriajeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(triaje: Triaje): Promise<void> {
    const datos = {
      pacienteId: triaje.pacienteId,
      nivel: triaje.nivel,
      motivo: triaje.motivo,
      estado: triaje.estado,
      llegadaEn: triaje.llegadaEn,
      registradoPor: triaje.registradoPor,
    };

    await this.prisma.triaje.upsert({
      where: { id: triaje.id },
      create: { id: triaje.id, ...datos },
      update: datos,
    });
  }

  async buscarPorId(id: string): Promise<Triaje | null> {
    const fila = await this.prisma.triaje.findUnique({ where: { id } });
    return fila ? aDominio(fila) : null;
  }

  async obtenerColaGuardia(): Promise<Triaje[]> {
    const filas = await this.prisma.triaje.findMany({
      where: { estado: EstadoTriaje.EN_ESPERA },
      orderBy: [{ nivel: 'asc' }, { llegadaEn: 'asc' }],
    });

    const triajes = filas.map(aDominio);
    triajes.sort(Triaje.compararParaCola);
    return triajes;
  }
}

function aDominio(fila: TriajePrisma): Triaje {
  return Triaje.reconstituir(fila.id, {
    pacienteId: fila.pacienteId,
    nivel: fila.nivel as NivelTriaje,
    motivo: fila.motivo,
    estado: fila.estado as EstadoTriaje,
    llegadaEn: fila.llegadaEn,
    registradoPor: fila.registradoPor,
  });
}
