import { Inject, Injectable } from '@nestjs/common';
import { type CasoDeUso, CLOCK, type Clock } from '../../../../building-blocks/application';
import type { AgendaMedico } from '../../domain/agenda';
import { AGENDA_REPOSITORY, type AgendaRepository } from '../../domain/agenda.repository';
import {
  FranjaOcupada,
  MedicoNoEncontrado,
  PacienteNoEncontrado,
  TurnoFueraDeAgenda,
} from '../../domain/errores';
import { MEDICO_REPOSITORY, type MedicoRepository } from '../../domain/medico.repository';
import { PACIENTE_REPOSITORY, type PacienteRepository } from '../../domain/paciente.repository';
import { Turno } from '../../domain/turno';
import { TURNO_REPOSITORY, type TurnoRepository } from '../../domain/turno.repository';
import { aTurnoDto, type TurnoDto } from '../turno.dto';
import type { ReservarTurnoCommand } from './reservar-turno.command';

const DURACION_POR_DEFECTO_MINUTOS = 30;

function calcularFinTurno(command: ReservarTurnoCommand, agenda: AgendaMedico): Date {
  if (command.fin) return command.fin;
  const diaTurno = command.inicio.getUTCDay();
  const franja = agenda.obtenerFranjas().find((f) => f.diaSemana === diaTurno);
  const duracion = franja ? franja.duracionTurnoMin : DURACION_POR_DEFECTO_MINUTOS;
  return new Date(command.inicio.getTime() + duracion * 60 * 1000);
}

/** ADM-04. Reservar turno: valida agenda del médico y ausencia de superposiciones. */
@Injectable()
export class ReservarTurnoHandler implements CasoDeUso<ReservarTurnoCommand, TurnoDto> {
  // eslint-disable-next-line max-params -- inyección de dependencias
  constructor(
    @Inject(TURNO_REPOSITORY) private readonly turnos: TurnoRepository,
    @Inject(AGENDA_REPOSITORY) private readonly agendas: AgendaRepository,
    @Inject(MEDICO_REPOSITORY) private readonly medicos: MedicoRepository,
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: PacienteRepository,
    @Inject(CLOCK) private readonly reloj: Clock,
  ) {}

  async ejecutar(command: ReservarTurnoCommand): Promise<TurnoDto> {
    const paciente = await this.pacientes.buscarPorId(command.pacienteId);
    if (!paciente) throw new PacienteNoEncontrado(command.pacienteId);

    const medico = await this.medicos.buscarPorId(command.medicoId);
    if (!medico) throw new MedicoNoEncontrado(command.medicoId);

    const agenda = await this.agendas.buscarPorMedicoId(command.medicoId);
    if (!agenda) throw new TurnoFueraDeAgenda();

    const fin = calcularFinTurno(command, agenda);

    if (!agenda.permiteTurno(command.inicio, fin, true)) {
      throw new TurnoFueraDeAgenda();
    }

    const ocupado = await this.turnos.buscarSuperpuesto(command.medicoId, command.inicio, fin);
    if (ocupado) throw new FranjaOcupada();

    const turno = Turno.crear(
      {
        pacienteId: command.pacienteId,
        medicoId: command.medicoId,
        inicio: command.inicio,
        fin,
        motivoConsulta: command.motivoConsulta,
        creadoPor: command.creadoPor,
      },
      this.reloj.ahora(),
    );

    await this.turnos.guardar(turno);
    return aTurnoDto(turno);
  }
}

