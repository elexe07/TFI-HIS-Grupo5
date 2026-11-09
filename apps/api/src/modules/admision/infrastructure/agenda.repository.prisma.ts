import { Injectable } from '@nestjs/common';
import type { Agenda as AgendaPrisma } from '@prisma/client';
import { PrismaService } from '../../../building-blocks/infrastructure/prisma/prisma.service';
import { AgendaMedico, FranjaAgenda } from '../domain/agenda';
import type { AgendaRepository } from '../domain/agenda.repository';

function stringAHoraDate(horaStr: string): Date {
  const [h, m] = horaStr.split(':').map(Number);
  return new Date(Date.UTC(1970, 0, 1, h ?? 0, m ?? 0, 0, 0));
}

function horaDateAString(date: Date): string {
  const h = String(date.getUTCHours()).padStart(2, '0');
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

@Injectable()
export class AgendaRepositoryPrisma implements AgendaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(agenda: AgendaMedico): Promise<void> {
    const franjas = agenda.obtenerFranjas();

    await this.prisma.$transaction(async (tx) => {
      await tx.agenda.deleteMany({
        where: { medicoId: agenda.medicoId },
      });

      if (franjas.length > 0) {
        await tx.agenda.createMany({
          data: franjas.map((f) => ({
            id: f.id,
            medicoId: f.medicoId,
            diaSemana: f.diaSemana,
            horaInicio: stringAHoraDate(f.horaInicio),
            horaFin: stringAHoraDate(f.horaFin),
            duracionTurnoMin: f.duracionTurnoMin,
          })),
        });
      }
    });
  }

  async buscarPorMedicoId(medicoId: string): Promise<AgendaMedico | null> {
    const filas = await this.prisma.agenda.findMany({
      where: { medicoId },
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });

    if (filas.length === 0) return null;

    const franjas = filas.map(aFranjaDominio);
    return AgendaMedico.reconstituir(medicoId, franjas);
  }
}

function aFranjaDominio(fila: AgendaPrisma): FranjaAgenda {
  return new FranjaAgenda({
    id: fila.id,
    medicoId: fila.medicoId,
    diaSemana: fila.diaSemana,
    horaInicio: horaDateAString(fila.horaInicio),
    horaFin: horaDateAString(fila.horaFin),
    duracionTurnoMin: fila.duracionTurnoMin,
  });
}
