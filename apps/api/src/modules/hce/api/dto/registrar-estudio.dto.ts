import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { TipoEstudio } from '../../domain/estudio';

export class RegistrarEstudioDto {
  @ApiPropertyOptional({ description: 'ID de historia (opcional/ignorado)' })
  @IsString()
  @IsOptional()
  historiaId?: string;

  @ApiProperty({ description: 'Tipo de estudio', enum: ['LABORATORIO', 'IMAGEN', 'OTRO'] })
  @IsEnum(['LABORATORIO', 'IMAGEN', 'OTRO'])
  tipo!: TipoEstudio;

  @ApiProperty({ description: 'Descripción del estudio' })
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @ApiProperty({ description: 'Fecha de realización (ISO 8601)' })
  @IsString()
  @IsNotEmpty()
  fecha!: string;

  @ApiPropertyOptional({ description: 'Resultado del estudio' })
  @IsString()
  @IsOptional()
  resultado?: string;
}
