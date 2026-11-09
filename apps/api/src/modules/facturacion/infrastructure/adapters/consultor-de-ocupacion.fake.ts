import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../building-blocks/infrastructure/prisma/prisma.service';
import type {
  ConsultorDeOcupacion,
  ResumenOcupacion,
} from '../../domain/ports/consultor-de-ocupacion';

@Injectable()
export class ConsultorDeOcupacionFake implements ConsultorDeOcupacion {
  constructor(private readonly prisma: PrismaService) {}

  async consultarOcupacion(): Promise<ResumenOcupacion> {
    try {
      const camas = await this.prisma.cama.findMany({ select: { estado: true } });
      if (camas.length > 0) {
        return this.procesarConteo(camas);
      }
    } catch {
      // Valor de contingencia si no hay conexión o datos
    }

    return {
      totalCamas: 20,
      ocupadas: 12,
      libres: 5,
      enLimpieza: 2,
      bloqueadas: 1,
      porcentajeOcupacion: 60,
    };
  }

  private procesarConteo(camas: { estado: string }[]): ResumenOcupacion {
    const conteo = { ocupadas: 0, libres: 0, enLimpieza: 0, bloqueadas: 0 };
    for (const c of camas) {
      if (c.estado === 'OCUPADA') conteo.ocupadas++;
      else if (c.estado === 'LIBRE') conteo.libres++;
      else if (c.estado === 'EN_LIMPIEZA') conteo.enLimpieza++;
      else if (c.estado === 'BLOQUEADA') conteo.bloqueadas++;
    }

    const totalCamas = camas.length;
    const porcentajeOcupacion =
      totalCamas > 0 ? Number(((conteo.ocupadas / totalCamas) * 100).toFixed(2)) : 0;

    return { totalCamas, ...conteo, porcentajeOcupacion };
  }
}
