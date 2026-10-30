import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsPositive, IsString, IsUUID } from 'class-validator';

export class GenerarIndicacionesDto {
  @ApiProperty({ example: 'c0000000-0000-0000-0000-000000000001', description: 'ID de la prescripción' })
  @IsUUID()
  prescripcionId!: string;

  @ApiProperty({ example: 'a0000000-0000-0000-0000-000000000001', description: 'ID del paciente' })
  @IsUUID()
  pacienteId!: string;

  @ApiProperty({ example: 'b0000000-0000-0000-0000-000000000001', description: 'ID de la internación' })
  @IsUUID()
  internacionId!: string;

  @ApiProperty({ example: 'Amoxicilina', description: 'Nombre del medicamento' })
  @IsString()
  @IsNotEmpty()
  medicamento!: string;

  @ApiProperty({ example: '500 mg', description: 'Dosis prescripta' })
  @IsString()
  @IsNotEmpty()
  dosis!: string;

  @ApiProperty({ example: 8, description: 'Frecuencia en horas (> 0)' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  frecuenciaHoras!: number;

  @ApiProperty({ example: 3, description: 'Duración en días (> 0)' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  duracionDias!: number;

  @ApiProperty({ example: '2026-10-23T08:00:00Z', description: 'Fecha y hora de inicio de administración' })
  @IsDateString()
  inicioEn!: string;
}

