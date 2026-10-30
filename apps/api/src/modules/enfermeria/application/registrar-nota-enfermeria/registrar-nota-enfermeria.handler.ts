import { Inject, Injectable } from '@nestjs/common';
import {
  type CasoDeUso,
  CLOCK,
  type Clock,
} from '../../../../building-blocks/application';
import { NotaDeEnfermeria } from '../../domain/nota-enfermeria';
import {
  NOTA_ENFERMERIA_REPOSITORY,
  type NotaEnfermeriaRepository,
} from '../../domain/nota-enfermeria.repository';
import {
  mapearNotaADto,
  type NotaEnfermeriaDto,
} from '../dtos/nota-enfermeria.dto';
import { RegistrarNotaEnfermeriaCommand } from './registrar-nota-enfermeria.command';

@Injectable()
export class RegistrarNotaEnfermeriaHandler
  implements CasoDeUso<RegistrarNotaEnfermeriaCommand, NotaEnfermeriaDto>
{
  constructor(
    @Inject(NOTA_ENFERMERIA_REPOSITORY)
    private readonly repository: NotaEnfermeriaRepository,
    @Inject(CLOCK)
    private readonly reloj: Clock,
  ) {}

  async ejecutar(command: RegistrarNotaEnfermeriaCommand): Promise<NotaEnfermeriaDto> {
    const nota = NotaDeEnfermeria.crear({
      pacienteId: command.pacienteId,
      internacionId: command.internacionId,
      texto: command.texto,
      registradoEn: this.reloj.ahora(),
      registradoPor: command.registradoPor,
    });

    await this.repository.guardar(nota);

    return mapearNotaADto(nota);
  }
}

