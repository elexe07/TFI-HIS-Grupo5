import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class IniciarSesionDto {
  @ApiProperty({ example: 'admin@his.local' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Admin1234!' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
