import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { NivelTriaje } from '../../domain/tipos';

export class RegistrarTriajeDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  @IsNotEmpty()
  pacienteId!: string;

  @ApiProperty({
    enum: NivelTriaje,
    example: NivelTriaje.ROJO,
    description: 'Nivel obligatorio de gravedad',
  })
  @IsEnum(NivelTriaje)
  nivel!: NivelTriaje;

  @ApiProperty({ example: 'Disnea severa y dolor precordial opresivo' })
  @IsString()
  @IsNotEmpty()
  motivo!: string;
}
