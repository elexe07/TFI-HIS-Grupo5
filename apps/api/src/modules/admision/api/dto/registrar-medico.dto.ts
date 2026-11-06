import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class RegistrarMedicoDto {
  @ApiProperty({ example: 'b567a5b3-3a11-4475-b827-2c9389e7eb22' })
  @IsUUID()
  usuarioId!: string;

  @ApiProperty({ example: 'MN-94812', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  matricula!: string;

  @ApiProperty({ example: 'Gabriel' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({ example: 'Batistuta' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido!: string;

  @ApiProperty({ example: 'Traumatología' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  especialidad!: string;
}

