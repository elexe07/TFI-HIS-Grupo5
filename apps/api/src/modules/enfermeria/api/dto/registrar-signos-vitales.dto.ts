import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class RegistrarSignosVitalesDto {
  @ApiProperty({
    example: 'a0000000-0000-0000-0000-000000000001',
    description: 'ID del paciente',
  })
  @IsUUID()
  pacienteId!: string;

  @ApiPropertyOptional({
    example: 'b0000000-0000-0000-0000-000000000001',
    description: 'ID de la internación asociada (si aplica)',
  })
  @IsOptional()
  @IsUUID()
  internacionId?: string;

  @ApiPropertyOptional({
    example: 36.6,
    description: 'Temperatura corporal en °C (rango permitido: 30 a 45 °C)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(30)
  @Max(45)
  temperatura?: number;

  @ApiPropertyOptional({
    example: 120,
    description: 'Presión arterial sistólica en mmHg (rango: 1 a 300 mmHg)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(300)
  presionSistolica?: number;

  @ApiPropertyOptional({
    example: 80,
    description: 'Presión arterial diastólica en mmHg (rango: 1 a 200 mmHg)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  presionDiastolica?: number;

  @ApiPropertyOptional({
    example: 72,
    description: 'Frecuencia cardíaca en latidos por minuto (1 a 300 lpm)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(300)
  frecuenciaCardiaca?: number;

  @ApiPropertyOptional({
    example: 98,
    description: 'Saturación de oxígeno SpO₂ en porcentaje (50 a 100%)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(50)
  @Max(100)
  saturacionO2?: number;
}

