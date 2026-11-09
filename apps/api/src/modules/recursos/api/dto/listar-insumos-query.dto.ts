import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ListarInsumosQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar solo los insumos con stock por debajo o igual al mínimo',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  @IsBoolean()
  bajoMinimo?: boolean;
}
