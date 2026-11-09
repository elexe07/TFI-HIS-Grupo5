import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CLOCK, type Clock } from '../../../../building-blocks/application';
import { PrismaService } from '../../../../building-blocks/infrastructure/prisma/prisma.service';
import { PACIENTE_INTERNADO, type PacienteInternado } from '../../../recursos/public';
import { Cuenta } from '../../domain/cuenta';
import { TipoCuenta } from '../../domain/enums';
import { CUENTA_REPOSITORY, type CuentaRepository } from '../../domain/ports/cuenta.repository';
import {
  OBRA_SOCIAL_REPOSITORY,
  type ObraSocialRepository,
} from '../../domain/ports/obra-social.repository';

@Injectable()
export class AbrirCuentaInternacionHandler {
  private readonly logger = new Logger(AbrirCuentaInternacionHandler.name);

  constructor(
    @Inject(CUENTA_REPOSITORY)
    private readonly cuentaRepo: CuentaRepository,
    @Inject(OBRA_SOCIAL_REPOSITORY)
    private readonly obraSocialRepo: ObraSocialRepository,
    private readonly prisma: PrismaService,
    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  @OnEvent(PACIENTE_INTERNADO)
  async manejar(evento: PacienteInternado): Promise<void> {
    try {
      const { internacionId, pacienteId, ingresoEn } = evento;

      const cuentaExistente = await this.cuentaRepo.buscarPorTipoYReferencia(
        TipoCuenta.INTERNACION,
        internacionId,
      );

      if (cuentaExistente) {
        this.logger.debug(`La cuenta de internación para ${internacionId} ya existe`);
        return;
      }

      const ahora = this.clock.ahora();
      const fechaApertura = ingresoEn ? new Date(ingresoEn) : ahora;

      // Obtener obra social del paciente para aplicar cobertura automática
      let porcentajeCobertura: number | null = null;
      let coberturaValidada = false;

      const paciente = await this.prisma.paciente.findUnique({
        where: { id: pacienteId },
        select: { obraSocialCodigo: true },
      });

      if (paciente?.obraSocialCodigo) {
        const obraSocial = await this.obraSocialRepo.buscarPorCodigo(paciente.obraSocialCodigo);
        if (obraSocial && obraSocial.porcentajeCobertura > 0) {
          porcentajeCobertura = obraSocial.porcentajeCobertura;
          coberturaValidada = true;
        }
      }

      const cuenta = Cuenta.abrir({
        pacienteId,
        tipo: TipoCuenta.INTERNACION,
        referenciaId: internacionId,
        coberturaValidada,
        porcentajeCobertura,
        ahora: fechaApertura,
      });

      await this.cuentaRepo.guardar(cuenta);
      this.logger.log(
        `Cuenta de internación abierta para ${internacionId} (paciente ${pacienteId}, cobertura: ${porcentajeCobertura ?? 0}%)`,
      );
    } catch (error) {
      this.logger.error(
        `Error al abrir cuenta de internación para evento ${evento.eventoId}`,
        error,
      );
    }
  }
}
