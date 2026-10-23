import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { type NombreRol, ROLES } from '../../domain/permisos';

/** Valida forma. Las reglas (email válido, password fuerte, email único) viven en el dominio. */
export class RegistrarUsuarioDto {
  @ApiProperty({ example: 'ana@his.local' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ example: 'Ana Pérez', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({ example: 'Clave1234', description: 'Mínimo 8 caracteres, con letra y número' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ enum: ROLES, example: 'MEDICO' })
  @IsIn(ROLES)
  rol!: NombreRol;
}
