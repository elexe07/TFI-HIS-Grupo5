import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/** Valida forma. Las reglas (código único, medicamento no repetido) viven en el caso de uso. */
export class RegistrarInsumoDto {
  @ApiProperty({ example: 'IBU400', description: 'Se guarda en mayúsculas' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  codigo!: string;

  @ApiProperty({ example: 'Ibuprofeno 400 mg' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string;

  @ApiPropertyOptional({
    example: 'Ibuprofeno',
    description: 'Medicamento que descuenta este insumo al administrarse',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  medicamentoAsociado?: string;

  @ApiProperty({ example: 50, minimum: 0 })
  @IsInt({ message: 'El stock inicial debe ser un número entero' })
  @Min(0, { message: 'El stock inicial no puede ser negativo' })
  stockInicial!: number;

  @ApiProperty({ example: 10, minimum: 0 })
  @IsInt({ message: 'El stock mínimo debe ser un número entero' })
  @Min(0, { message: 'El stock mínimo no puede ser negativo' })
  stockMinimo!: number;
}
