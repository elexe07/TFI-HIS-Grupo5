import { Injectable } from '@nestjs/common';
import type { AdministracionMedicacion as FilaAdministracion } from '@prisma/client';
import { PrismaService } from '../../../building-blocks/infrastructure/prisma/prisma.service';
import { AdministracionDeMedicacion } from '../domain/administracion-medicacion';
import type { AdministracionMedicacionRepository } from '../domain/administracion-medicacion.repository';

@Injectable()
export class AdministracionMedicacionRepositoryPrisma
  implements AdministracionMedicacionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async guardar(administracion: AdministracionDeMedicacion): Promise<void> {
    await this.prisma.administracionMedicacion.create({
      data: {
        id: administracion.id,
        indicacionId: administracion.indicacionId,
        pacienteId: administracion.pacienteId,
        medicamento: administracion.medicamento,
        administradaEn: administracion.administradaEn,
        administradaPor: administracion.administradaPor,
      },
    });
  }

  async buscarPorIndicacionId(indicacionId: string): Promise<AdministracionDeMedicacion | null> {
    const fila = await this.prisma.administracionMedicacion.findUnique({
      where: { indicacionId },
    });
    return fila ? aDominio(fila) : null;
  }

  async listarPorPaciente(pacienteId: string): Promise<AdministracionDeMedicacion[]> {
    const filas = await this.prisma.administracionMedicacion.findMany({
      where: { pacienteId },
      orderBy: { administradaEn: 'asc' },
    });
    return filas.map(aDominio);
  }
}

function aDominio(fila: FilaAdministracion): AdministracionDeMedicacion {
  return AdministracionDeMedicacion.reconstituir(fila.id, {
    indicacionId: fila.indicacionId,
    pacienteId: fila.pacienteId,
    medicamento: fila.medicamento,
    administradaEn: fila.administradaEn,
    administradaPor: fila.administradaPor,
  });
}

