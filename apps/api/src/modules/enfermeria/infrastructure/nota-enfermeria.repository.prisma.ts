import { Injectable } from '@nestjs/common';
import type { Prisma, NotaEnfermeria as FilaNota } from '@prisma/client';
import { PrismaService } from '../../../building-blocks/infrastructure/prisma/prisma.service';
import { NotaDeEnfermeria } from '../domain/nota-enfermeria';
import type {
  FiltrosNotasEnfermeria,
  NotaEnfermeriaRepository,
} from '../domain/nota-enfermeria.repository';

@Injectable()
export class NotaEnfermeriaRepositoryPrisma implements NotaEnfermeriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(nota: NotaDeEnfermeria): Promise<void> {
    await this.prisma.notaEnfermeria.create({
      data: {
        id: nota.id,
        pacienteId: nota.pacienteId,
        internacionId: nota.internacionId,
        texto: nota.texto,
        registradoEn: nota.registradoEn,
        registradoPor: nota.registradoPor,
      },
    });
  }

  async listar(filtros: FiltrosNotasEnfermeria): Promise<NotaDeEnfermeria[]> {
    const where: Prisma.NotaEnfermeriaWhereInput = {};

    if (filtros.pacienteId) {
      where.pacienteId = filtros.pacienteId;
    }
    if (filtros.internacionId) {
      where.internacionId = filtros.internacionId;
    }

    const filas = await this.prisma.notaEnfermeria.findMany({
      where,
      orderBy: { registradoEn: 'desc' },
    });

    return filas.map(aDominio);
  }
}

function aDominio(fila: FilaNota): NotaDeEnfermeria {
  return NotaDeEnfermeria.reconstituir(fila.id, {
    pacienteId: fila.pacienteId,
    internacionId: fila.internacionId,
    texto: fila.texto,
    registradoEn: fila.registradoEn,
    registradoPor: fila.registradoPor,
  });
}

