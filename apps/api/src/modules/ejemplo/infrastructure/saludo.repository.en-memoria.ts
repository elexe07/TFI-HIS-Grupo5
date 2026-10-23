import { Injectable } from '@nestjs/common';
import type { Saludo } from '../domain/saludo';
import type { SaludoRepository } from '../domain/saludo.repository';

/**
 * Adaptador en memoria. Sirve para este módulo de ejemplo y como doble de test para
 * los handlers. En un módulo real el adaptador productivo usa PrismaService:
 *
 *   @Injectable()
 *   export class SaludoRepositoryPrisma implements SaludoRepository {
 *     constructor(private readonly prisma: PrismaService) {}
 *     async guardar(saludo: Saludo) {
 *       await this.prisma.saludo.create({ data: aFila(saludo) });   // mapper dominio → fila
 *     }
 *     async listar() {
 *       const filas = await this.prisma.saludo.findMany();
 *       return filas.map(aDominio);                                  // mapper fila → dominio
 *     }
 *   }
 */
@Injectable()
export class SaludoRepositoryEnMemoria implements SaludoRepository {
  private readonly items = new Map<string, Saludo>();

  guardar(saludo: Saludo): Promise<void> {
    this.items.set(saludo.id, saludo);
    return Promise.resolve();
  }

  listar(): Promise<Saludo[]> {
    return Promise.resolve([...this.items.values()]);
  }
}
