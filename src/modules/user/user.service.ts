import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from '../rbac/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(user);
    const { password, refreshToken, ...result } = savedUser;
    return result;
  }

  async findAll() {
    const users = await this.userRepository.find({
      select: ['id', 'email', 'name', 'createdAt', 'updatedAt'],
    });
    return users;
  }

  async findOne(id: number) {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'createdAt', 'updatedAt'],
    });
  }

  async findOneByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.userRepository.delete(id);
  }

  async assignRole(userId: number, roleId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify role exists
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Prevent assigning admin role
    if (role.name === 'admin') {
      throw new BadRequestException('Cannot assign admin role');
    }

    await this.userRepository.update(userId, { roleId });
    return this.findOne(userId);
  }
}