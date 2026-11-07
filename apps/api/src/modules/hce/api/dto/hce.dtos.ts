import { IsEnum, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { SeveridadAlergia, TipoEstudio } from '../../domain/entidades';

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

export class CrearPrescripcionDto {
  @ApiPropertyOptional({ description: 'ID de historia (opcional/ignorado)' })
  @IsString()
  @IsOptional()
  historiaId?: string;

  @ApiProperty({ description: 'Nombre del medicamento' })
  @IsString()
  @IsNotEmpty()
  medicamento!: string;

  @ApiProperty({ description: 'Dosis (ej. 500 mg)' })
  @IsString()
  @IsNotEmpty()
  dosis!: string;

  @ApiProperty({ description: 'Frecuencia en horas (ej. 8)' })
  @IsPositive()
  frecuenciaHoras!: number;

  @ApiProperty({ description: 'Duración en días (ej. 7)' })
  @IsPositive()
  duracionDias!: number;

  @ApiPropertyOptional({ description: 'ID de evolución que la originó' })
  @IsUUID()
  @IsOptional()
  evolucionId?: string;

  @ApiPropertyOptional({ description: 'ID de internación' })
  @IsUUID()
  @IsOptional()
  internacionId?: string;
}

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

