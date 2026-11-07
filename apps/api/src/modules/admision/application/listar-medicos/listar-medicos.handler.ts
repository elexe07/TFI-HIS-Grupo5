import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { MEDICO_REPOSITORY, type MedicoRepository } from '../../domain/medico.repository';
import { aMedicoDto, type MedicoDto } from '../medico.dto';

@Injectable()
export class ListarMedicosHandler implements CasoDeUso<void, MedicoDto[]> {
  constructor(@Inject(MEDICO_REPOSITORY) private readonly medicos: MedicoRepository) {}

  async ejecutar(): Promise<MedicoDto[]> {
    const lista = await this.medicos.listar();
    return lista.map(aMedicoDto);
  }
}
