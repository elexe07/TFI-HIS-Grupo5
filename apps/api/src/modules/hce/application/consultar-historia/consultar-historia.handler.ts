import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { PrismaService } from '../../../../building-blocks/infrastructure/prisma/prisma.service';
import { AccesoProhibidoHistoria } from '../../domain/errores';
import { HistoriaClinica } from '../../domain/historia-clinica';
import {
  HISTORIA_CLINICA_REPOSITORY,
  type HistoriaClinicaRepository,
} from '../../domain/historia-clinica.repository';
import type { HistoriaClinicaDto } from '../historia-clinica.dto';

export class ConsultarHistoriaQuery {
  constructor(
    readonly pacienteId: string,
    readonly usuarioActual: { id: string; rol: string; pacienteId?: string },
  ) {}
}

@Injectable()
export class ConsultarHistoriaHandler implements CasoDeUso<
  ConsultarHistoriaQuery,
  HistoriaClinicaDto
> {
  constructor(
    @Inject(HISTORIA_CLINICA_REPOSITORY)
    private readonly repo: HistoriaClinicaRepository,
    private readonly prisma: PrismaService,
  ) {}

  async ejecutar(query: ConsultarHistoriaQuery): Promise<HistoriaClinicaDto> {
    // Si es paciente, solo ve su propia historia (HCE-07)
    if (query.usuarioActual.rol === 'PACIENTE') {
      if (query.usuarioActual.pacienteId && query.usuarioActual.pacienteId !== query.pacienteId) {
        throw new AccesoProhibidoHistoria();
      }
    }

    let historia = await this.repo.buscarPorPacienteId(query.pacienteId);
    if (!historia) {
      historia = HistoriaClinica.abrir(query.pacienteId, new Date());
      await this.repo.guardar(historia);
    }

    const triajesPrisma = await this.prisma.triaje.findMany({
      where: { pacienteId: query.pacienteId },
      orderBy: { llegadaEn: 'desc' },
    });

    return {
      id: historia.id,
      pacienteId: historia.pacienteId,
      creadoEn: historia.creadoEn.toISOString(),
      createdAt: historia.creadoEn.toISOString(),
      alergias: historia.alergias.map((a) => ({
        id: a.id,
        sustancia: a.sustancia,
        severidad: a.severidad,
        registradoEn: a.registradoEn.toISOString(),
        registradoPor: a.registradoPor,
      })),
      antecedentes: historia.antecedentes.map((ant) => ({
        id: ant.id,
        parentesco: ant.parentesco,
        condicion: ant.condicion,
        registradoEn: ant.registradoEn.toISOString(),
        registradoPor: ant.registradoPor,
      })),
      evoluciones: historia.evoluciones.map((e) => ({
        id: e.id,
        medicoId: e.medicoId,
        motivo: e.motivo,
        diagnostico: e.diagnostico,
        tratamiento: e.tratamiento,
        registradoEn: e.registradoEn.toISOString(),
        turnoId: e.turnoId,
        internacionId: e.internacionId,
      })),
      prescripciones: historia.prescripciones.map((p) => ({
        id: p.id,
        medicoId: p.medicoId,
        medicamento: p.medicamento,
        dosis: p.dosis,
        frecuenciaHoras: p.frecuenciaHoras,
        duracionDias: p.duracionDias,
        estado: p.estado,
        creadoEn: p.creadoEn.toISOString(),
        createdAt: p.creadoEn.toISOString(),
        evolucionId: p.evolucionId,
      })),
      estudios: historia.estudios.map((est) => ({
        id: est.id,
        tipo: est.tipo,
        descripcion: est.descripcion,
        fecha: est.fecha.toISOString(),
        registradoPor: est.registradoPor,
        resultado: est.resultado,
        creadoEn: est.creadoEn.toISOString(),
        createdAt: est.creadoEn.toISOString(),
      })),
      triajes: triajesPrisma.map((t) => ({
        id: t.id,
        nivel: t.nivel,
        motivo: t.motivo,
        estado: t.estado,
        llegadaEn: t.llegadaEn.toISOString(),
      })),
    };
  }
}
