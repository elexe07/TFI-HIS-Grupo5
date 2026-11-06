import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Sexo, TipoDocumento } from '../../domain/tipos';

export class RegistrarPacienteDto {
  @ApiPropertyOptional({ example: 'b567a5b3-3a11-4475-b827-2c9389e7eb22' })
  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  @ApiProperty({ enum: TipoDocumento, example: TipoDocumento.DNI })
  @IsEnum(TipoDocumento)
  tipoDocumento!: TipoDocumento;

  @ApiProperty({ example: '38123456', maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  numeroDocumento!: string;

  @ApiProperty({ example: 'Lucía' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({ example: 'Fernández' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido!: string;

  @ApiProperty({ example: '1994-08-15', description: 'Fecha de nacimiento en formato YYYY-MM-DD' })
  @IsDateString()
  fechaNacimiento!: string;

  @ApiProperty({ enum: Sexo, example: Sexo.F })
  @IsEnum(Sexo)
  sexo!: Sexo;

  @ApiPropertyOptional({ example: '1144556677' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ example: 'lucia.fernandez@email.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    example: 'OSDE',
    description: 'Código de obra social (e.g. PARTICULAR, OSDE, PAMI)',
  })
  @IsOptional()
  @IsString()
  obraSocialCodigo?: string;

  @ApiPropertyOptional({ example: '012345678-01' })
  @IsOptional()
  @IsString()
  numeroAfiliado?: string;
}
