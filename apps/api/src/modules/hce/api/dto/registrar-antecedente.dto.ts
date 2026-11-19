import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegistrarAntecedenteDto {
  @ApiPropertyOptional({ description: 'ID de historia (opcional/ignorado)' })
  @IsString()
  @IsOptional()
  historiaId?: string;

  @ApiProperty({ description: 'Parentesco (ej: Padre, Madre)' })
  @IsString()
  @IsNotEmpty()
  parentesco!: string;

  @ApiProperty({ description: 'Condición médica' })
  @IsString()
  @IsNotEmpty()
  condicion!: string;
}
