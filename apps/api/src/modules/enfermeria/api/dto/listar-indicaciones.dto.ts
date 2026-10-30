import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class ListarIndicacionesDto {
  @ApiPropertyOptional({
    example: 'b0000000-0000-0000-0000-000000000001',
    description: 'Filtrar por ID de internación',
  })
  @IsOptional()
  @IsUUID()
  internacionId?: string;

  @ApiPropertyOptional({
    example: 'a0000000-0000-0000-0000-000000000001',
    description: 'Filtrar por ID de paciente',
  })
  @IsOptional()
  @IsUUID()
  pacienteId?: string;

  @ApiPropertyOptional({
    example: '2026-10-23',
    description: 'Filtrar por fecha específica (YYYY-MM-DD o ISO)',
  })
  @IsOptional()
  @IsDateString()
  fecha?: string;
}

