import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class ListarFiltrosDto {
  @ApiPropertyOptional({
    example: 'a0000000-0000-0000-0000-000000000001',
    description: 'Filtrar por ID de paciente',
  })
  @IsOptional()
  @IsUUID()
  pacienteId?: string;

  @ApiPropertyOptional({
    example: 'b0000000-0000-0000-0000-000000000001',
    description: 'Filtrar por ID de internación',
  })
  @IsOptional()
  @IsUUID()
  internacionId?: string;
}

