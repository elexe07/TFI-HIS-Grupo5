import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OmitirIndicacionDto {
  @ApiProperty({
    example: 'Paciente en ayunas por procedimiento quirúrgico',
    description: 'Motivo por el cual se omite la administración programada',
  })
  @IsString()
  @IsNotEmpty()
  motivo!: string;
}

