import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class ListarTurnosDto {
  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsOptional()
  @IsUUID()
  pacienteId?: string;

  @ApiPropertyOptional({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @IsOptional()
  @IsUUID()
  medicoId?: string;

  @ApiPropertyOptional({ example: '2026-10-26T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  desde?: string;

  @ApiPropertyOptional({ example: '2026-10-26T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  hasta?: string;
}

