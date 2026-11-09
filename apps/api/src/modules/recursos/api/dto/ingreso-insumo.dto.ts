import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class IngresoInsumoDto {
  @ApiProperty({ description: 'Cantidad a ingresar al stock', example: 10, minimum: 1 })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad a ingresar debe ser al menos 1' })
  cantidad!: number;
}
