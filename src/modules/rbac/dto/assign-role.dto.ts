import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  userId!: number;

  @ApiProperty({ example: 'clyyy456' })
  @IsString()
  roleId!: string;
}