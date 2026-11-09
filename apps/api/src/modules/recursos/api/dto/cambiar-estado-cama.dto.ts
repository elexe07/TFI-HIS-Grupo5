import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EstadoCama } from '../../domain';

export class CambiarEstadoCamaDto {
  @ApiProperty({ enum: EstadoCama, example: EstadoCama.LIBRE })
  @IsEnum(EstadoCama, { message: 'El estado debe ser LIBRE, OCUPADA, EN_LIMPIEZA o BLOQUEADA' })
  estado!: EstadoCama;
}
