import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class ConsultarCuentasDto {
  @ApiPropertyOptional({ description: 'ID del paciente para filtrar sus cuentas' })
  @IsOptional()
  @IsUUID()
  pacienteId?: string;
}

