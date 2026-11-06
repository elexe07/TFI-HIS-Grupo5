import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class ReservarTurnoDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  @IsNotEmpty()
  pacienteId!: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @IsUUID()
  @IsNotEmpty()
  medicoId!: string;

  @ApiProperty({
    example: '2026-10-26T09:00:00Z',
    description: 'Fecha y hora de inicio en ISO 8601',
  })
  @IsDateString()
  inicio!: string;

  @ApiPropertyOptional({
    example: '2026-10-26T09:30:00Z',
    description: 'Fecha y hora de fin opcional (se calcula según agenda si no se pasa)',
  })
  @IsOptional()
  @IsDateString()
  fin?: string;

  @ApiPropertyOptional({ example: 'Consulta por dolor lumbar recurrente' })
  @IsOptional()
  @IsString()
  motivoConsulta?: string;
}
