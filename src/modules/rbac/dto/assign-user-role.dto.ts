import { IsArray, IsNotEmpty, IsUUID, IsString, IsEmail } from 'class-validator';

export class AssignUserRoleDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsNotEmpty()
  roleIds!: string[];
}
