import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../building-blocks/infrastructure/prisma/prisma.service';
import type { EventosProcesadosRepository } from '../domain';
import { generarId } from '../../../building-blocks/domain';

@Injectable()
export class EventosProcesadosRepositoryPrisma
  implements EventosProcesadosRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async haSidoProcesado(eventoId: string): Promise<boolean> {
    const registro = await this.prisma.eventoProcesado.findUnique({
      where: { origenEventoId: eventoId },
    });
    return registro !== null;
  }

  async registrarProcesado(eventoId: string): Promise<void> {
    await this.prisma.eventoProcesado.upsert({
      where: { origenEventoId: eventoId },
      create: {
        id: generarId(),
        origenEventoId: eventoId,
      },
      update: {},
    });
  }
}
