import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { SeveridadAlergia } from '../../domain/alergia';

export class RegistrarAlergiaDto {
  @ApiPropertyOptional({ description: 'ID de historia (opcional/ignorado)' })
  @IsString()
  @IsOptional()
  historiaId?: string;

  @ApiProperty({ description: 'Sustancia o medicamento alérgeno' })
  @IsString()
  @IsNotEmpty()
  sustancia!: string;

  @ApiProperty({ description: 'Severidad', enum: ['LEVE', 'MODERADA', 'GRAVE'] })
  @IsEnum(['LEVE', 'MODERADA', 'GRAVE'])
  severidad!: SeveridadAlergia;
}
