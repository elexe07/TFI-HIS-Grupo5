import { Injectable } from '@nestjs/common';
import type { Medico as MedicoPrisma } from '@prisma/client';
import { PrismaService } from '../../../building-blocks/infrastructure/prisma/prisma.service';
import { Medico } from '../domain/medico';
import type { MedicoRepository } from '../domain/medico.repository';

@Injectable()
export class MedicoRepositoryPrisma implements MedicoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(medico: Medico): Promise<void> {
    const datos = {
      usuarioId: medico.usuarioId,
      matricula: medico.matricula,
      nombre: medico.nombre,
      apellido: medico.apellido,
      especialidad: medico.especialidad,
    };

    await this.prisma.medico.upsert({
      where: { id: medico.id },
      create: { id: medico.id, createdAt: medico.creadoEn, ...datos },
      update: datos,
    });
  }

  async buscarPorId(id: string): Promise<Medico | null> {
    const fila = await this.prisma.medico.findUnique({ where: { id } });
    return fila ? aDominio(fila) : null;
  }

  async buscarPorUsuarioId(usuarioId: string): Promise<Medico | null> {
    const fila = await this.prisma.medico.findUnique({ where: { usuarioId } });
    return fila ? aDominio(fila) : null;
  }

  async buscarPorMatricula(matricula: string): Promise<Medico | null> {
    const fila = await this.prisma.medico.findUnique({ where: { matricula } });
    return fila ? aDominio(fila) : null;
  }

  async listar(): Promise<Medico[]> {
    const filas = await this.prisma.medico.findMany({
      orderBy: { apellido: 'asc' },
    });
    return filas.map(aDominio);
  }
}

function aDominio(fila: MedicoPrisma): Medico {
  return Medico.reconstituir(fila.id, {
    usuarioId: fila.usuarioId,
    matricula: fila.matricula,
    nombre: fila.nombre,
    apellido: fila.apellido,
    especialidad: fila.especialidad,
    creadoEn: fila.createdAt,
  });
}

