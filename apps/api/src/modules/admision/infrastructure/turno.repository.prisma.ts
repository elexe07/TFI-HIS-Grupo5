import { Injectable } from '@nestjs/common';
import type { Prisma, Turno as TurnoPrisma } from '@prisma/client';
import { PrismaService } from '../../../building-blocks/infrastructure/prisma/prisma.service';
import { EstadoTurno } from '../domain/tipos';
import { Turno } from '../domain/turno';
import type { FiltrosListarTurnos, TurnoRepository } from '../domain/turno.repository';

function armarFiltrosWhere(filtros?: FiltrosListarTurnos): Prisma.TurnoWhereInput {
  const where: Prisma.TurnoWhereInput = {};
  if (!filtros) return where;

  if (filtros.pacienteId) where.pacienteId = filtros.pacienteId;
  if (filtros.medicoId) where.medicoId = filtros.medicoId;

  if (filtros.desde || filtros.hasta) {
    const rango: Prisma.DateTimeFilter = {};
    if (filtros.desde) rango.gte = filtros.desde;
    if (filtros.hasta) rango.lte = filtros.hasta;
    where.inicio = rango;
  }
  return where;
}

@Injectable()
export class TurnoRepositoryPrisma implements TurnoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(turno: Turno): Promise<void> {
    const datos = {
      pacienteId: turno.pacienteId,
      medicoId: turno.medicoId,
      inicio: turno.inicio,
      fin: turno.fin,
      estado: turno.estado,
      motivoConsulta: turno.motivoConsulta,
      creadoPor: turno.creadoPor,
    };

    await this.prisma.turno.upsert({
      where: { id: turno.id },
      create: { id: turno.id, createdAt: turno.createdAt, updatedAt: turno.updatedAt, ...datos },
      update: { ...datos, updatedAt: turno.updatedAt },
    });
  }

  async buscarPorId(id: string): Promise<Turno | null> {
    const fila = await this.prisma.turno.findUnique({ where: { id } });
    return fila ? aDominio(fila) : null;
  }

  // eslint-disable-next-line max-params
  async buscarSuperpuesto(
    medicoId: string,
    inicio: Date,
    fin: Date,
    excluirTurnoId?: string,
  ): Promise<Turno | null> {
    const where: Prisma.TurnoWhereInput = {
      medicoId,
      estado: EstadoTurno.RESERVADO,
      inicio: { lt: fin },
      fin: { gt: inicio },
    };

    if (excluirTurnoId) {
      where.id = { not: excluirTurnoId };
    }

    const fila = await this.prisma.turno.findFirst({ where });
    return fila ? aDominio(fila) : null;
  }

  async listar(filtros?: FiltrosListarTurnos): Promise<Turno[]> {
    const where = armarFiltrosWhere(filtros);
    const filas = await this.prisma.turno.findMany({
      where,
      orderBy: { inicio: 'asc' },
    });

    return filas.map(aDominio);
  }
}

function aDominio(fila: TurnoPrisma): Turno {
  return Turno.reconstituir(fila.id, {
    pacienteId: fila.pacienteId,
    medicoId: fila.medicoId,
    inicio: fila.inicio,
    fin: fila.fin,
    estado: fila.estado as EstadoTurno,
    motivoConsulta: fila.motivoConsulta,
    creadoPor: fila.creadoPor,
    createdAt: fila.createdAt,
    updatedAt: fila.updatedAt,
  });
}
