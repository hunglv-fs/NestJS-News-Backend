import { IsArray, IsNotEmpty, IsUUID, IsString } from 'class-validator';

export class UpdateRolePermissionsDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsNotEmpty()
  permissionIds!: string[];
}
