import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Administrator role', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}