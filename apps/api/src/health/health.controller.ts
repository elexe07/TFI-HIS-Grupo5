import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../building-blocks/infrastructure/prisma/prisma.service';
import { Publico } from '../modules/iam/public';

interface EstadoSalud {
  status: 'ok' | 'degraded';
  db: 'ok' | 'error';
  timestamp: string;
}

@ApiTags('health')
@Publico() // el monitoreo no tiene token
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Estado de la API y de la conexión a la base' })
  async estado(): Promise<EstadoSalud> {
    const db = await this.baseResponde();
    return { status: db === 'ok' ? 'ok' : 'degraded', db, timestamp: new Date().toISOString() };
  }

  private async baseResponde(): Promise<'ok' | 'error'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch {
      return 'error';
    }
  }
}
