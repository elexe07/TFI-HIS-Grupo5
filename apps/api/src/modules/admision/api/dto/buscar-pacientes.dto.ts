import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class BuscarPacientesDto {
  @ApiPropertyOptional({ example: '38123456', description: 'Búsqueda por número de documento' })
  @IsOptional()
  @IsString()
  documento?: string;

  @ApiPropertyOptional({ example: 'Fernández', description: 'Búsqueda por apellido' })
  @IsOptional()
  @IsString()
  apellido?: string;
}
