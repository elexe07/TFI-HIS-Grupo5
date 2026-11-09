import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { randomUUID } from 'node:crypto';
import { CLOCK, type Clock } from '../../../../building-blocks/application';
import { PrismaService } from '../../../../building-blocks/infrastructure/prisma/prisma.service';
import { MEDICACION_ADMINISTRADA, type MedicacionAdministrada } from '../../../enfermeria/public';
import { Cargo } from '../../domain/cargo';
import { Cuenta } from '../../domain/cuenta';
import { ConceptoCargo, EstadoCuenta, TipoCuenta } from '../../domain/enums';
import { TarifaNoEncontrada } from '../../domain/errores';
import { CUENTA_REPOSITORY, type CuentaRepository } from '../../domain/ports/cuenta.repository';
import { OBRA_SOCIAL_REPOSITORY, type ObraSocialRepository } from '../../domain/ports/obra-social.repository';
import { TARIFA_REPOSITORY, type TarifaRepository } from '../../domain/ports/tarifa.repository';

@Injectable()
export class AplicarCargoMedicacionHandler {
  private readonly logger = new Logger(AplicarCargoMedicacionHandler.name);

  constructor(
    @Inject(CUENTA_REPOSITORY)
    private readonly cuentaRepo: CuentaRepository,
    @Inject(TARIFA_REPOSITORY)
    private readonly tarifaRepo: TarifaRepository,
    @Inject(OBRA_SOCIAL_REPOSITORY)
    private readonly obraSocialRepo: ObraSocialRepository,
    private readonly prisma: PrismaService,
    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  @OnEvent(MEDICACION_ADMINISTRADA)
  async manejar(evento: MedicacionAdministrada): Promise<void> {
    const yaProcesado = await this.cuentaRepo.existeCargoConOrigenEvento(evento.eventoId);
    if (yaProcesado) {
      this.logger.debug(`Evento ${evento.eventoId} ya fue procesado anteriormente`);
      return;
    }

    const { pacienteId, internacionId, medicamento } = evento;
    const ahora = this.clock.ahora();

    const cuenta = await this.resolverCuenta(pacienteId, internacionId, ahora);

    const tarifaBase = await this.tarifaRepo.buscarPorConcepto(ConceptoCargo.MEDICACION);
    const montoBase = tarifaBase ? tarifaBase.monto : 2500;

    // 1. Determinar precio específico del medicamento / insumo
    const precioMedicamento = this.obtenerPrecioPorInsumo(medicamento, montoBase);

    const cargoMed = Cargo.crear({
      cuentaId: cuenta.id,
      concepto: ConceptoCargo.MEDICACION,
      descripcion: `Medicación: ${medicamento}`,
      cantidad: 1,
      montoUnitario: precioMedicamento,
      origenEventoId: evento.eventoId,
      createdAt: ahora,
    });
    cuenta.agregarCargo(cargoMed, ahora);

    // 2. Si es inyectable, agregar cargos por los insumos descartables consumidos
    const medLower = medicamento.toLowerCase();
    const esInyectable =
      medLower.includes('inyectable') ||
      medLower.includes('iny.') ||
      medLower.includes('inyeccion') ||
      medLower.includes('dexametasona');

    if (esInyectable) {
      const cargoJeringa = Cargo.crear({
        cuentaId: cuenta.id,
        concepto: ConceptoCargo.MEDICACION,
        descripcion: 'Insumo descartable: Jeringa 5 ml',
        cantidad: 1,
        montoUnitario: 800,
        origenEventoId: randomUUID(),
        createdAt: ahora,
      });
      cuenta.agregarCargo(cargoJeringa, ahora);

      const cargoGasa = Cargo.crear({
        cuentaId: cuenta.id,
        concepto: ConceptoCargo.MEDICACION,
        descripcion: 'Insumo descartable: Gasa estéril (antisepsia)',
        cantidad: 1,
        montoUnitario: 500,
        origenEventoId: randomUUID(),
        createdAt: ahora,
      });
      cuenta.agregarCargo(cargoGasa, ahora);
    }

    // 3. Si es curación, agregar cargo por las gasas utilizadas
    if (medLower.includes('curacion') || medLower.includes('curación') || medLower.includes('gasa')) {
      const cargoGasasCuracion = Cargo.crear({
        cuentaId: cuenta.id,
        concepto: ConceptoCargo.MEDICACION,
        descripcion: 'Insumo descartable: Gasas estériles para curación (x2)',
        cantidad: 2,
        montoUnitario: 500,
        origenEventoId: randomUUID(),
        createdAt: ahora,
      });
      cuenta.agregarCargo(cargoGasasCuracion, ahora);
    }

    await this.cuentaRepo.guardar(cuenta);

    this.logger.log(
      `Cargos de medicación e insumos (${medicamento}) aplicados a cuenta [${cuenta.tipo}] ${cuenta.id}`,
    );
  }

  private obtenerPrecioPorInsumo(nombre: string, precioBase: number): number {
    const n = nombre.toLowerCase();
    if (n.includes('dexametasona')) return 5800;
    if (n.includes('amoxicilina')) return 3500;
    if (n.includes('ibuprofeno')) return 2200;
    if (n.includes('paracetamol')) return 1800;
    if (n.includes('curacion') || n.includes('curación')) return 4200;
    return precioBase;
  }

  private async resolverCuenta(
    pacienteId: string,
    internacionId: string | undefined,
    ahora: Date,
  ): Promise<Cuenta> {
    // Verificar si realmente existe una internación para este paciente en la base de datos
    let internacionReal = null;
    if (internacionId) {
      try {
        internacionReal = await this.prisma.internacion.findUnique({
          where: { id: internacionId },
        });
      } catch {
        internacionReal = null;
      }
    }

    // Si el paciente ESTÁ internado efectivamente:
    if (internacionReal) {
      const cuentaInt = await this.cuentaRepo.buscarPorTipoYReferencia(
        TipoCuenta.INTERNACION,
        internacionReal.id,
      );
      if (cuentaInt) {
        return cuentaInt;
      }

      const cobertura = await this.obtenerCoberturaPaciente(pacienteId);
      return Cuenta.abrir({
        pacienteId,
        tipo: TipoCuenta.INTERNACION,
        referenciaId: internacionReal.id,
        coberturaValidada: cobertura.coberturaValidada,
        porcentajeCobertura: cobertura.porcentajeCobertura,
        ahora,
      });
    }

    // Si NO está internado: es atención ambulatoria/consulta/guardia -> TipoCuenta.CONSULTA
    const cuentasPaciente = await this.cuentaRepo.listarPorPaciente(pacienteId);
    const cuentaConsultaAbierta = cuentasPaciente.find(
      (c) => c.tipo === TipoCuenta.CONSULTA && c.estado === EstadoCuenta.ABIERTA,
    );
    if (cuentaConsultaAbierta) {
      return cuentaConsultaAbierta;
    }

    const cobertura = await this.obtenerCoberturaPaciente(pacienteId);
    return Cuenta.abrir({
      pacienteId,
      tipo: TipoCuenta.CONSULTA,
      referenciaId: pacienteId,
      coberturaValidada: cobertura.coberturaValidada,
      porcentajeCobertura: cobertura.porcentajeCobertura,
      ahora,
    });
  }

  private async obtenerCoberturaPaciente(
    pacienteId: string,
  ): Promise<{ coberturaValidada: boolean; porcentajeCobertura: number | null }> {
    try {
      const paciente = await this.prisma.paciente.findUnique({
        where: { id: pacienteId },
        select: { obraSocialCodigo: true },
      });

      if (paciente?.obraSocialCodigo) {
        const obraSocial = await this.obraSocialRepo.buscarPorCodigo(paciente.obraSocialCodigo);
        if (obraSocial && obraSocial.porcentajeCobertura > 0) {
          return {
            porcentajeCobertura: obraSocial.porcentajeCobertura,
            coberturaValidada: true,
          };
        }
      }
    } catch {
      // Cobertura por defecto
    }

    return { coberturaValidada: false, porcentajeCobertura: null };
  }
}
