import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty } from 'class-validator';

export class RangoFechasDto {
  @ApiProperty({
    description: 'Fecha desde en formato ISO (ej: 2026-10-01T00:00:00Z)',
    example: '2026-10-01T00:00:00Z',
  })
  @IsISO8601()
  @IsNotEmpty()
  desde!: string;

  @ApiProperty({
    description: 'Fecha hasta en formato ISO (ej: 2026-10-31T23:59:59Z)',
    example: '2026-10-31T23:59:59Z',
  })
  @IsISO8601()
  @IsNotEmpty()
  hasta!: string;
}
