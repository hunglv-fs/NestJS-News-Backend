import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AssignRoleDto {
    @ApiProperty({
        example: 'staff-role-id',
        description: 'Role ID to assign to user'
    })
    @IsString()
    @IsNotEmpty()
    roleId!: string;
}
