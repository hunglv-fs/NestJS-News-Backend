import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { Permissions } from '../rbac/decorators/permissions.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @Permissions('users:create')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Permissions('users:read')
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Permissions('users:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Permissions('users:update')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/role')
  @Permissions('roles:assign')
  @ApiOperation({ summary: 'Assign role to user (Admin only)' })
  assignRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignRoleDto: AssignRoleDto
  ) {
    return this.userService.assignRole(id, assignRoleDto.roleId);
  }

  @Delete(':id')
  @Permissions('users:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}