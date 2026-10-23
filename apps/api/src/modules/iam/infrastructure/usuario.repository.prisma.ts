import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../building-blocks/infrastructure/prisma/prisma.service';
import { Email } from '../domain/email';
import type { NombreRol, Permiso } from '../domain/permisos';
import { Rol } from '../domain/rol';
import { Usuario } from '../domain/usuario';
import type { UsuarioRepository } from '../domain/usuario.repository';

const CON_ROL = { rol: { include: { permisos: { include: { permiso: true } } } } } as const;
type FilaUsuario = Prisma.UsuarioGetPayload<{ include: typeof CON_ROL }>;

/** Adaptador Prisma del puerto UsuarioRepository (tablas iam.usuarios / iam.roles). */
@Injectable()
export class UsuarioRepositoryPrisma implements UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(usuario: Usuario): Promise<void> {
    const datos = {
      email: usuario.email.valor,
      nombre: usuario.nombre,
      passwordHash: usuario.passwordHash,
      rolId: usuario.rol.id,
      activo: usuario.activo,
    };
    await this.prisma.usuario.upsert({
      where: { id: usuario.id },
      create: { id: usuario.id, createdAt: usuario.creadoEn, ...datos },
      update: datos,
    });
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const fila = await this.prisma.usuario.findUnique({ where: { id }, include: CON_ROL });
    return fila ? aDominio(fila) : null;
  }

  async buscarPorEmail(email: Email): Promise<Usuario | null> {
    const fila = await this.prisma.usuario.findUnique({
      where: { email: email.valor },
      include: CON_ROL,
    });
    return fila ? aDominio(fila) : null;
  }

  async listar(): Promise<Usuario[]> {
    const filas = await this.prisma.usuario.findMany({
      include: CON_ROL,
      orderBy: { createdAt: 'asc' },
    });
    return filas.map(aDominio);
  }

  contarActivosConRol(rol: NombreRol): Promise<number> {
    return this.prisma.usuario.count({ where: { activo: true, rol: { nombre: rol } } });
  }
}

export function aRol(fila: FilaUsuario['rol']): Rol {
  return Rol.reconstituir(
    fila.id,
    fila.nombre as NombreRol,
    fila.permisos.map((rp) => rp.permiso.codigo as Permiso),
  );
}

function aDominio(fila: FilaUsuario): Usuario {
  return Usuario.reconstituir(fila.id, {
    email: Email.crear(fila.email),
    nombre: fila.nombre,
    passwordHash: fila.passwordHash,
    rol: aRol(fila.rol),
    activo: fila.activo,
    creadoEn: fila.createdAt,
  });
}
