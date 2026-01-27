import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { Role } from '../rbac/entities/role.entity';
import { UserRole } from '../rbac/entities/user-role.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Find register-user role
    const registerUserRole = await this.roleRepository.findOne({
      where: { name: 'register-user' },
    });

    if (!registerUserRole) {
      throw new NotFoundException('Register-user role not found');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(user);

    // Create user-role relationship
    const userRole = this.userRoleRepository.create({
      userId: savedUser.id,
      roleId: registerUserRole.id,
    });
    await this.userRoleRepository.save(userRole);

    const tokens = await this.generateTokens(savedUser.id, savedUser.email);
    await this.updateRefreshToken(savedUser.id, tokens.refreshToken);

    return {
      user: { id: savedUser.id, email: savedUser.email, name: savedUser.name },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: { id: user.id, email: user.email, name: user.name },
      ...tokens,
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: number) {
    await this.userRepository.update(userId, { refreshToken: null });
  }

  async adminLogin(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify admin role through userRoles junction table
    const hasAdminRole = user.userRoles?.some(userRole => userRole.role.name === 'admin');
    if (!hasAdminRole) {
      throw new UnauthorizedException('Access denied: Admin only');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: { id: user.id, email: user.email, name: user.name, roles: user.userRoles?.map(ur => ur.role.name) || [] },
      ...tokens,
    };
  }

  async adminRegister(adminRegisterDto: AdminRegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: adminRegisterDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Verify role exists and is not admin
    const role = await this.roleRepository.findOne({
      where: { id: adminRegisterDto.roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.name === 'admin') {
      throw new BadRequestException('Cannot create admin users via this endpoint');
    }

    const hashedPassword = await bcrypt.hash(adminRegisterDto.password, 10);
    const user = this.userRepository.create({
      email: adminRegisterDto.email,
      name: adminRegisterDto.name,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Create user-role relationship
    const userRole = this.userRoleRepository.create({
      userId: savedUser.id,
      roleId: adminRegisterDto.roleId,
    });
    await this.userRoleRepository.save(userRole);

    const { password, refreshToken, ...result } = savedUser;
    return result;
  }

  private async generateTokens(userId: number, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.secret'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(userId, { refreshToken: hashedRefreshToken });
  }
}