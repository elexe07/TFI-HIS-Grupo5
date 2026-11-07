import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AbrirHistoriaCommand, AbrirHistoriaHandler } from '../abrir-historia/abrir-historia.handler';

interface PacienteRegistradoPayload {
  eventoId: string;
  pacienteId: string;
}

@Injectable()
export class AbrirHistoriaAlRegistrarPacienteHandler {
  constructor(private readonly abrirHistoria: AbrirHistoriaHandler) {}

  @OnEvent('admision.paciente-registrado', { async: true })
  async manejar(payload: PacienteRegistradoPayload): Promise<void> {
    await this.abrirHistoria.ejecutar(
      new AbrirHistoriaCommand(payload.pacienteId, payload.eventoId),
    );
  }
}

