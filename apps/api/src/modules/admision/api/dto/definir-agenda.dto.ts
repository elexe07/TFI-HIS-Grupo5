import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class FranjaAgendaItemDto {
  @ApiProperty({ example: 1, description: '0 domingo .. 6 sábado' })
  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana!: number;

  @ApiProperty({ example: '08:00', description: 'Formato HH:mm' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'horaInicio debe ser formato HH:mm' })
  horaInicio!: string;

  @ApiProperty({ example: '12:00', description: 'Formato HH:mm' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'horaFin debe ser formato HH:mm' })
  horaFin!: string;

  @ApiProperty({ example: 30, description: 'Duración de cada turno en minutos' })
  @IsInt()
  @Min(5)
  @Max(240)
  duracionTurnoMin!: number;
}

export class DefinirAgendaDto {
  @ApiProperty({ type: [FranjaAgendaItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FranjaAgendaItemDto)
  franjas!: FranjaAgendaItemDto[];
}
