import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

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
