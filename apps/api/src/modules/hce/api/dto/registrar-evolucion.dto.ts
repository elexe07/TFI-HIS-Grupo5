import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class RegistrarEvolucionDto {
  @ApiPropertyOptional({ description: 'ID de historia (opcional/ignorado)' })
  @IsString()
  @IsOptional()
  historiaId?: string;

  @ApiProperty({ description: 'Motivo de consulta' })
  @IsString()
  @IsNotEmpty()
  motivo!: string;

  @ApiProperty({ description: 'Diagnóstico' })
  @IsString()
  @IsNotEmpty()
  diagnostico!: string;

  @ApiPropertyOptional({ description: 'Tratamiento indicado' })
  @IsString()
  @IsOptional()
  tratamiento?: string;

  @ApiPropertyOptional({ description: 'ID del turno asociado' })
  @IsUUID()
  @IsOptional()
  turnoId?: string;

  @ApiPropertyOptional({ description: 'ID de internación asociada' })
  @IsUUID()
  @IsOptional()
  internacionId?: string;
}
