import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { type NombreRol, ROLES } from '../../domain/permisos';

export class AsignarRolDto {
  @ApiProperty({ enum: ROLES, example: 'ENFERMERO' })
  @IsIn(ROLES)
  rol!: NombreRol;
}
