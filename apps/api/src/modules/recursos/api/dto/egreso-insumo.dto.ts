import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class EgresoInsumoDto {
  @ApiProperty({ description: 'Cantidad a descontar del stock', example: 5, minimum: 1 })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad a descontar debe ser al menos 1' })
  cantidad!: number;
}
