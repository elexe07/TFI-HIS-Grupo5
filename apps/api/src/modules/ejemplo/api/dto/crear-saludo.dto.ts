import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * DTO de entrada HTTP. Valida forma (tipos, presencia). Las reglas de negocio van en el dominio.
 */
export class CrearSaludoDto {
  @ApiProperty({ example: 'Ana', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  destinatario!: string;
}
