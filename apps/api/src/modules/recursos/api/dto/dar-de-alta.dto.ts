import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class DarDeAltaDto {
  @ApiPropertyOptional({ description: 'Fecha y hora de egreso ISO8601 (opcional, por defecto ahora)' })
  @IsOptional()
  @IsISO8601({}, { message: 'egresoEn debe tener formato ISO 8601' })
  egresoEn?: string;
}
