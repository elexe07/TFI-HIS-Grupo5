import { Injectable } from '@nestjs/common';
import type { Paciente as PacientePrisma, Prisma } from '@prisma/client';
import { PrismaService } from '../../../building-blocks/infrastructure/prisma/prisma.service';
import { Cobertura } from '../domain/cobertura';
import { Documento } from '../domain/documento';
import { Paciente } from '../domain/paciente';
import type { FiltrosBuscarPaciente, PacienteRepository } from '../domain/paciente.repository';
import type { Sexo, TipoDocumento } from '../domain/tipos';

@Injectable()
export class PacienteRepositoryPrisma implements PacienteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(paciente: Paciente): Promise<void> {
    const datos = {
      usuarioId: paciente.usuarioId,
      tipoDocumento: paciente.documento.tipo,
      numeroDocumento: paciente.documento.numero,
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      fechaNacimiento: paciente.fechaNacimiento,
      sexo: paciente.sexo,
      telefono: paciente.telefono,
      email: paciente.email,
      obraSocialCodigo: paciente.cobertura.obraSocialCodigo,
      numeroAfiliado: paciente.cobertura.numeroAfiliado,
    };

    await this.prisma.paciente.upsert({
      where: { id: paciente.id },
      create: {
        id: paciente.id,
        createdAt: paciente.creadoEn,
        updatedAt: paciente.actualizadoEn,
        ...datos,
      },
      update: { ...datos, updatedAt: paciente.actualizadoEn },
    });
  }

  async buscarPorId(id: string): Promise<Paciente | null> {
    const fila = await this.prisma.paciente.findUnique({ where: { id } });
    return fila ? aDominio(fila) : null;
  }

  async buscarPorDocumento(tipo: TipoDocumento, numero: string): Promise<Paciente | null> {
    const fila = await this.prisma.paciente.findUnique({
      where: {
        tipoDocumento_numeroDocumento: {
          tipoDocumento: tipo,
          numeroDocumento: numero,
        },
      },
    });
    return fila ? aDominio(fila) : null;
  }

  async buscarPorUsuarioId(usuarioId: string): Promise<Paciente | null> {
    const fila = await this.prisma.paciente.findUnique({ where: { usuarioId } });
    return fila ? aDominio(fila) : null;
  }

  async buscar(filtros: FiltrosBuscarPaciente): Promise<Paciente[]> {
    const where: Prisma.PacienteWhereInput = {};
    if (filtros.documento) {
      where.numeroDocumento = { contains: filtros.documento, mode: 'insensitive' };
    }
    if (filtros.apellido) {
      where.apellido = { contains: filtros.apellido, mode: 'insensitive' };
    }

    const filas = await this.prisma.paciente.findMany({
      where,
      orderBy: { apellido: 'asc' },
    });
    return filas.map(aDominio);
  }
}

function aDominio(fila: PacientePrisma): Paciente {
  return Paciente.reconstituir(fila.id, {
    usuarioId: fila.usuarioId,
    documento: Documento.crear(fila.tipoDocumento as TipoDocumento, fila.numeroDocumento),
    nombre: fila.nombre,
    apellido: fila.apellido,
    fechaNacimiento: fila.fechaNacimiento,
    sexo: fila.sexo as Sexo,
    telefono: fila.telefono,
    email: fila.email,
    cobertura: Cobertura.crear(fila.obraSocialCodigo, fila.numeroAfiliado),
    creadoEn: fila.createdAt,
    actualizadoEn: fila.updatedAt,
  });
}
