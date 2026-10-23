import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../building-blocks/infrastructure/prisma/prisma.service';
import type { NombreRol } from '../domain/permisos';
import type { Rol } from '../domain/rol';
import type { RolRepository } from '../domain/rol.repository';
import { aRol } from './usuario.repository.prisma';

@Injectable()
export class RolRepositoryPrisma implements RolRepository {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorNombre(nombre: NombreRol): Promise<Rol | null> {
    const fila = await this.prisma.rol.findUnique({
      where: { nombre },
      include: { permisos: { include: { permiso: true } } },
    });
    return fila ? aRol(fila) : null;
  }
}
