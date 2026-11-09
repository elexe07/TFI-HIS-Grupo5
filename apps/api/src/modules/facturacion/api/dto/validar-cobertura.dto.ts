import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class ValidarCoberturaDto {
  @ApiProperty({ description: 'ID del paciente', example: 'd3b07384-d113-4a11-b011-884279fc7341' })
  @IsUUID()
  pacienteId!: string;

  @ApiProperty({
    description: 'Código de la obra social (ej: OSDE, PAMI, PARTICULAR)',
    example: 'OSDE',
  })
  @IsString()
  @IsNotEmpty()
  codigoObraSocial!: string;

  @ApiProperty({ description: 'Número de carnet o afiliado', example: '123456789' })
  @IsString()
  @IsNotEmpty()
  numeroAfiliado!: string;

  @ApiPropertyOptional({
    description: 'ID de la cuenta a la que aplicar la cobertura si es aprobada',
  })
  @IsOptional()
  @IsUUID()
  cuentaId?: string;
}
