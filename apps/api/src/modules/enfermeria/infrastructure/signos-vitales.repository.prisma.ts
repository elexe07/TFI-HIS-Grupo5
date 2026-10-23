import { Injectable } from '@nestjs/common';
import type { Prisma, SignosVitales as FilaSignosVitales } from '@prisma/client';
import { PrismaService } from '../../../building-blocks/infrastructure/prisma/prisma.service';
import { SignosVitales } from '../domain/signos-vitales';
import type {
  FiltrosSignosVitales,
  SignosVitalesRepository,
} from '../domain/signos-vitales.repository';

@Injectable()
export class SignosVitalesRepositoryPrisma implements SignosVitalesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(signosVitales: SignosVitales): Promise<void> {
    await this.prisma.signosVitales.create({
      data: {
        id: signosVitales.id,
        pacienteId: signosVitales.pacienteId,
        internacionId: signosVitales.internacionId,
        temperatura: signosVitales.temperatura,
        presionSistolica: signosVitales.presionSistolica,
        presionDiastolica: signosVitales.presionDiastolica,
        frecuenciaCardiaca: signosVitales.frecuenciaCardiaca,
        saturacionO2: signosVitales.saturacionO2,
        registradoEn: signosVitales.registradoEn,
        registradoPor: signosVitales.registradoPor,
      },
    });
  }

  async listar(filtros: FiltrosSignosVitales): Promise<SignosVitales[]> {
    const where: Prisma.SignosVitalesWhereInput = {};

    if (filtros.pacienteId) {
      where.pacienteId = filtros.pacienteId;
    }
    if (filtros.internacionId) {
      where.internacionId = filtros.internacionId;
    }

    const filas = await this.prisma.signosVitales.findMany({
      where,
      orderBy: { registradoEn: 'desc' },
    });

    return filas.map(aDominio);
  }
}

function aDominio(fila: FilaSignosVitales): SignosVitales {
  return SignosVitales.reconstituir(fila.id, {
    pacienteId: fila.pacienteId,
    internacionId: fila.internacionId,
    temperatura: fila.temperatura !== null ? Number(fila.temperatura) : null,
    presionSistolica: fila.presionSistolica,
    presionDiastolica: fila.presionDiastolica,
    frecuenciaCardiaca: fila.frecuenciaCardiaca,
    saturacionO2: fila.saturacionO2,
    registradoEn: fila.registradoEn,
    registradoPor: fila.registradoPor,
  });
}

