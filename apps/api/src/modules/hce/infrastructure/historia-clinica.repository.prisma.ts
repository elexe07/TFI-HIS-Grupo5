import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { generarId } from '../../../building-blocks/domain';
import { PrismaService } from '../../../building-blocks/infrastructure/prisma/prisma.service';
import {
  Alergia,
  AntecedenteFamiliar,
  Evolucion,
  Estudio,
  Prescripcion,
  type SeveridadAlergia,
  type TipoEstudio,
  type EstadoPrescripcion,
} from '../domain/entidades';
import { HistoriaClinica } from '../domain/historia-clinica';
import type { HistoriaClinicaRepository } from '../domain/historia-clinica.repository';

const CON_DETALLES = {
  alergias: true,
  antecedentes: true,
  evoluciones: { orderBy: { registradoEn: 'desc' as const } },
  prescripciones: true,
  estudios: true,
} as const;

type FilaHistoria = Prisma.HistoriaClinicaGetPayload<{ include: typeof CON_DETALLES }>;

@Injectable()
export class HistoriaClinicaRepositoryPrisma implements HistoriaClinicaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(historia: HistoriaClinica): Promise<void> {
    // Upsert de la historia raíz
    await this.prisma.historiaClinica.upsert({
      where: { pacienteId: historia.pacienteId },
      create: {
        id: historia.id,
        pacienteId: historia.pacienteId,
        origenEventoId: historia.origenEventoId ?? generarId(),
        createdAt: historia.creadoEn,
      },
      update: {},
    });

    // Sincronizar / guardar detalles (inmutables y nuevas entidades)
    // 1. Alergias
    for (const a of historia.alergias) {
      await this.prisma.alergia.upsert({
        where: { id: a.id },
        create: {
          id: a.id,
          historiaId: historia.id,
          sustancia: a.sustancia,
          severidad: a.severidad,
          registradoEn: a.registradoEn,
          registradoPor: a.registradoPor,
        },
        update: {},
      });
    }

    // 2. Antecedentes (inmutables)
    for (const ant of historia.antecedentes) {
      await this.prisma.antecedenteFamiliar.upsert({
        where: { id: ant.id },
        create: {
          id: ant.id,
          historiaId: historia.id,
          parentesco: ant.parentesco,
          condicion: ant.condicion,
          registradoEn: ant.registradoEn,
          registradoPor: ant.registradoPor,
        },
        update: {},
      });
    }

    // 3. Evoluciones (inmutables: sólo create)
    for (const evo of historia.evoluciones) {
      await this.prisma.evolucion.upsert({
        where: { id: evo.id },
        create: {
          id: evo.id,
          historiaId: historia.id,
          medicoId: evo.medicoId,
          motivo: evo.motivo,
          diagnostico: evo.diagnostico,
          tratamiento: evo.tratamiento,
          registradoEn: evo.registradoEn,
          turnoId: evo.turnoId,
          internacionId: evo.internacionId,
        },
        update: {},
      });
    }

    // 4. Prescripciones
    for (const p of historia.prescripciones) {
      await this.prisma.prescripcion.upsert({
        where: { id: p.id },
        create: {
          id: p.id,
          historiaId: historia.id,
          medicoId: p.medicoId,
          medicamento: p.medicamento,
          dosis: p.dosis,
          frecuenciaHoras: p.frecuenciaHoras,
          duracionDias: p.duracionDias,
          estado: p.estado,
          createdAt: p.creadoEn,
          evolucionId: p.evolucionId,
        },
        update: {
          estado: p.estado,
        },
      });
    }

    // 5. Estudios
    for (const est of historia.estudios) {
      await this.prisma.estudio.upsert({
        where: { id: est.id },
        create: {
          id: est.id,
          historiaId: historia.id,
          tipo: est.tipo,
          descripcion: est.descripcion,
          fecha: est.fecha,
          registradoPor: est.registradoPor,
          resultado: est.resultado,
          createdAt: est.creadoEn,
        },
        update: {
          resultado: est.resultado,
        },
      });
    }
  }

  async buscarPorId(id: string): Promise<HistoriaClinica | null> {
    const fila = await this.prisma.historiaClinica.findUnique({
      where: { id },
      include: CON_DETALLES,
    });
    return fila ? aDominio(fila) : null;
  }

  async buscarPorPacienteId(pacienteId: string): Promise<HistoriaClinica | null> {
    const fila = await this.prisma.historiaClinica.findUnique({
      where: { pacienteId },
      include: CON_DETALLES,
    });
    return fila ? aDominio(fila) : null;
  }

  async buscarPorOrigenEventoId(origenEventoId: string): Promise<HistoriaClinica | null> {
    const fila = await this.prisma.historiaClinica.findUnique({
      where: { origenEventoId },
      include: CON_DETALLES,
    });
    return fila ? aDominio(fila) : null;
  }
}

function aDominio(fila: FilaHistoria): HistoriaClinica {
  return HistoriaClinica.reconstituir(
    fila.id,
    fila.pacienteId,
    fila.createdAt,
    fila.origenEventoId ?? undefined,
    fila.alergias.map((a) =>
      Alergia.reconstituir(a.id, a.sustancia, a.severidad as SeveridadAlergia, a.registradoEn, a.registradoPor),
    ),
    fila.antecedentes.map((ant) =>
      AntecedenteFamiliar.reconstituir(ant.id, ant.parentesco, ant.condicion, ant.registradoEn, ant.registradoPor),
    ),
    fila.evoluciones.map((e) =>
      Evolucion.reconstituir(
        e.id,
        e.medicoId,
        e.motivo,
        e.diagnostico,
        e.registradoEn,
        e.tratamiento ?? undefined,
        e.turnoId ?? undefined,
        e.internacionId ?? undefined,
      ),
    ),
    fila.prescripciones.map((p) =>
      Prescripcion.reconstituir(
        p.id,
        p.medicoId,
        p.medicamento,
        p.dosis,
        p.frecuenciaHoras,
        p.duracionDias,
        p.estado as EstadoPrescripcion,
        p.createdAt,
        p.evolucionId ?? undefined,
      ),
    ),
    fila.estudios.map((est) =>
      Estudio.reconstituir(
        est.id,
        est.tipo as TipoEstudio,
        est.descripcion,
        est.fecha,
        est.registradoPor,
        est.createdAt,
        est.resultado ?? undefined,
      ),
    ),
  );
}

