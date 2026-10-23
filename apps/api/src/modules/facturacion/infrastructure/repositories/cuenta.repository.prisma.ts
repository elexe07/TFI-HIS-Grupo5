import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../building-blocks/infrastructure/prisma/prisma.service';
import { Cargo } from '../../domain/cargo';
import { Cuenta } from '../../domain/cuenta';
import { ConceptoCargo, EstadoCuenta, TipoCuenta } from '../../domain/enums';
import type { CuentaRepository } from '../../domain/ports/cuenta.repository';

const CON_CARGOS = { cargos: { orderBy: { createdAt: 'asc' } } } as const;
type FilaCuentaConCargos = Prisma.CuentaGetPayload<{ include: typeof CON_CARGOS }>;

@Injectable()
export class CuentaRepositoryPrisma implements CuentaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorId(id: string): Promise<Cuenta | null> {
    const fila = await this.prisma.cuenta.findUnique({
      where: { id },
      include: CON_CARGOS,
    });
    return fila ? this.aDominio(fila) : null;
  }

  async buscarPorTipoYReferencia(tipo: TipoCuenta, referenciaId: string): Promise<Cuenta | null> {
    const fila = await this.prisma.cuenta.findUnique({
      where: {
        tipo_referenciaId: { tipo, referenciaId },
      },
      include: CON_CARGOS,
    });
    return fila ? this.aDominio(fila) : null;
  }

  async listarPorPaciente(pacienteId: string): Promise<Cuenta[]> {
    const filas = await this.prisma.cuenta.findMany({
      where: { pacienteId },
      include: CON_CARGOS,
      orderBy: { createdAt: 'desc' },
    });
    return filas.map((f) => this.aDominio(f));
  }

  async guardar(cuenta: Cuenta): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await this.guardarFilaCuenta(tx, cuenta);
      await this.guardarCargos(tx, cuenta);
    });
  }

  private async guardarFilaCuenta(tx: Prisma.TransactionClient, cuenta: Cuenta): Promise<void> {
    await tx.cuenta.upsert({
      where: { id: cuenta.id },
      create: {
        id: cuenta.id,
        pacienteId: cuenta.pacienteId,
        tipo: cuenta.tipo,
        referenciaId: cuenta.referenciaId,
        coberturaValidada: cuenta.coberturaValidada,
        porcentajeCobertura: cuenta.porcentajeCobertura,
        estado: cuenta.estado,
        createdAt: cuenta.createdAt,
        updatedAt: cuenta.updatedAt,
      },
      update: {
        coberturaValidada: cuenta.coberturaValidada,
        porcentajeCobertura: cuenta.porcentajeCobertura,
        estado: cuenta.estado,
        updatedAt: cuenta.updatedAt,
      },
    });
  }

  private async guardarCargos(tx: Prisma.TransactionClient, cuenta: Cuenta): Promise<void> {
    for (const cargo of cuenta.cargos) {
      await tx.cargo.upsert({
        where: { origenEventoId: cargo.origenEventoId },
        create: {
          id: cargo.id,
          cuentaId: cuenta.id,
          concepto: cargo.concepto,
          descripcion: cargo.descripcion,
          cantidad: cargo.cantidad,
          montoUnitario: cargo.montoUnitario,
          montoTotal: cargo.montoTotal,
          origenEventoId: cargo.origenEventoId,
          createdAt: cargo.createdAt,
        },
        update: {},
      });
    }
  }

  async existeCargoConOrigenEvento(origenEventoId: string): Promise<boolean> {
    const cargo = await this.prisma.cargo.findUnique({
      where: { origenEventoId },
      select: { id: true },
    });
    return cargo !== null;
  }

  private aDominio(fila: FilaCuentaConCargos): Cuenta {
    const cargos = fila.cargos.map((c) =>
      Cargo.rehidratar(
        c.id,
        c.cuentaId,
        c.concepto as ConceptoCargo,
        c.descripcion,
        c.cantidad,
        Number(c.montoUnitario),
        Number(c.montoTotal),
        c.origenEventoId,
        c.createdAt,
      ),
    );

    return Cuenta.rehidratar(
      fila.id,
      fila.pacienteId,
      fila.tipo as TipoCuenta,
      fila.referenciaId,
      fila.coberturaValidada,
      fila.porcentajeCobertura !== null ? Number(fila.porcentajeCobertura) : null,
      fila.estado as EstadoCuenta,
      fila.createdAt,
      fila.updatedAt,
      cargos,
    );
  }
}

