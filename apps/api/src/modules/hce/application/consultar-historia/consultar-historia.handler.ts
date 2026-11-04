import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { AccesoProhibidoHistoria, HistoriaClinicaNoEncontrada } from '../../domain/errores';
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
export class ConsultarHistoriaHandler implements CasoDeUso<ConsultarHistoriaQuery, HistoriaClinicaDto> {
  constructor(
    @Inject(HISTORIA_CLINICA_REPOSITORY)
    private readonly repo: HistoriaClinicaRepository,
  ) {}

  async ejecutar(query: ConsultarHistoriaQuery): Promise<HistoriaClinicaDto> {
    // Si es paciente, solo ve su propia historia (HCE-07)
    if (query.usuarioActual.rol === 'PACIENTE') {
      if (query.usuarioActual.pacienteId && query.usuarioActual.pacienteId !== query.pacienteId) {
        throw new AccesoProhibidoHistoria();
      }
    }

    const historia = await this.repo.buscarPorPacienteId(query.pacienteId);
    if (!historia) {
      throw new HistoriaClinicaNoEncontrada(`para el paciente ${query.pacienteId}`);
    }

    return {
      id: historia.id,
      pacienteId: historia.pacienteId,
      creadoEn: historia.creadoEn.toISOString(),
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
      })),
    };
  }
}

