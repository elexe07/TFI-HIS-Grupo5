import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class InternarPacienteDto {
  @ApiProperty({ description: 'ID del paciente a internar', format: 'uuid' })
  @IsUUID('4', { message: 'pacienteId debe ser un UUID válido' })
  pacienteId!: string;

  @ApiProperty({ description: 'ID de la cama libre asignada', format: 'uuid' })
  @IsUUID('4', { message: 'camaId debe ser un UUID válido' })
  camaId!: string;

  @ApiProperty({ description: 'ID del médico responsable', format: 'uuid' })
  @IsUUID('4', { message: 'medicoId debe ser un UUID válido' })
  medicoId!: string;

  @ApiProperty({ description: 'Motivo de internación', example: 'Neumonía aguda' })
  @IsString()
  @IsNotEmpty({ message: 'El motivo es obligatorio' })
  motivo!: string;

  @ApiPropertyOptional({ description: 'Fecha y hora de ingreso ISO8601' })
  @IsOptional()
  @IsISO8601({}, { message: 'ingresoEn debe tener formato ISO 8601' })
  ingresoEn?: string;
}
