import { Injectable } from '@nestjs/common';
import type { ObraSocial as ObraSocialPrisma } from '@prisma/client';
import { PrismaService } from '../../../../building-blocks/infrastructure/prisma/prisma.service';
import { ObraSocial } from '../../domain/obra-social';
import type { ObraSocialRepository } from '../../domain/ports/obra-social.repository';

@Injectable()
export class ObraSocialRepositoryPrisma implements ObraSocialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorCodigo(codigo: string): Promise<ObraSocial | null> {
    const fila = await this.prisma.obraSocial.findUnique({
      where: { codigo: codigo.toUpperCase() },
    });
    return fila ? this.aDominio(fila) : null;
  }

  async guardar(obraSocial: ObraSocial): Promise<void> {
    await this.prisma.obraSocial.upsert({
      where: { codigo: obraSocial.codigo },
      create: {
        id: obraSocial.id,
        codigo: obraSocial.codigo,
        nombre: obraSocial.nombre,
        porcentajeCobertura: obraSocial.porcentajeCobertura,
      },
      update: {
        nombre: obraSocial.nombre,
        porcentajeCobertura: obraSocial.porcentajeCobertura,
      },
    });
  }

  async listarTodas(): Promise<ObraSocial[]> {
    const filas = await this.prisma.obraSocial.findMany({
      orderBy: { nombre: 'asc' },
    });
    return filas.map((f) => this.aDominio(f));
  }

  private aDominio(fila: ObraSocialPrisma): ObraSocial {
    return ObraSocial.rehidratar(
      fila.id,
      fila.codigo,
      fila.nombre,
      Number(fila.porcentajeCobertura),
    );
  }
}

