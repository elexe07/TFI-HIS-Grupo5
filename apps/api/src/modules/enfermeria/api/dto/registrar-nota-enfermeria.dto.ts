import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class RegistrarNotaEnfermeriaDto {
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

  @ApiProperty({
    example: 'Paciente lúcido, afebril, descansando en cama sin complicaciones.',
    description: 'Contenido de la nota de evolución de enfermería',
  })
  @IsString()
  @IsNotEmpty()
  texto!: string;
}

