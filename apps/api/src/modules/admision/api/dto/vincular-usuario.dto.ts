import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class VincularUsuarioDto {
  @ApiProperty({
    example: 'c5e422ea-f16f-41e8-b27d-22028117dbc6',
    description: 'Usuario rol PACIENTE',
  })
  @IsUUID()
  usuarioId!: string;
}
