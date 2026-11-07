import { Inject, Injectable } from '@nestjs/common';
import {
  type CasoDeUso,
  CLOCK,
  type Clock,
  EVENT_BUS,
  type EventBus,
} from '../../../../building-blocks/application';
import { Cobertura } from '../../domain/cobertura';
import { Documento } from '../../domain/documento';
import { PacienteYaExiste } from '../../domain/errores';
import { Paciente } from '../../domain/paciente';
import { PACIENTE_REPOSITORY, type PacienteRepository } from '../../domain/paciente.repository';
import { aPacienteDto, type PacienteDto } from '../paciente.dto';
import type { RegistrarPacienteCommand } from './registrar-paciente.command';

/** ADM-01. Registra un nuevo paciente y emite PacienteRegistrado. */
@Injectable()
export class RegistrarPacienteHandler implements CasoDeUso<RegistrarPacienteCommand, PacienteDto> {
  constructor(
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: PacienteRepository,
    @Inject(EVENT_BUS) private readonly bus: EventBus,
    @Inject(CLOCK) private readonly reloj: Clock,
  ) {}

  async ejecutar(command: RegistrarPacienteCommand): Promise<PacienteDto> {
    const documento = Documento.crear(command.tipoDocumento, command.numeroDocumento);

    const existente = await this.pacientes.buscarPorDocumento(documento.tipo, documento.numero);
    if (existente) {
      throw new PacienteYaExiste(documento.toString());
    }

    const cobertura = Cobertura.crear(command.obraSocialCodigo, command.numeroAfiliado);

    const paciente = Paciente.crear(
      {
        usuarioId: command.usuarioId,
        documento,
        nombre: command.nombre,
        apellido: command.apellido,
        fechaNacimiento: command.fechaNacimiento,
        sexo: command.sexo,
        telefono: command.telefono,
        email: command.email,
        cobertura,
      },
      this.reloj.ahora(),
    );

    await this.pacientes.guardar(paciente);
    await this.bus.publicar(paciente.extraerEventos());

    return aPacienteDto(paciente);
  }
}

