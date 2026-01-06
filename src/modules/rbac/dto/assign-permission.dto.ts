import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignPermissionDto {
  @ApiProperty({ example: 'clyyy456' })
  @IsString()
  roleId!: string;

  @ApiProperty({ example: 'clzzz789' })
  @IsString()
  permissionId!: string;
}