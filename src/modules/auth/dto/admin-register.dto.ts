import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class AdminRegisterDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'password123', minLength: 6 })
    @IsString()
    @MinLength(6)
    password!: string;

    @ApiProperty({ example: 'John Doe', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        example: 'staff-role-id',
        description: 'Role ID to assign (cannot be admin role)'
    })
    @IsString()
    @IsNotEmpty()
    roleId!: string;
}
