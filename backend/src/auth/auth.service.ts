import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private rolesService: RolesService,
  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role?.name, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRATION'),
    });

    await this.usersService.setCurrentRefreshToken(refreshToken, user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role?.name,
        email: user.email,
      }
    };
  }

  async register(createUserDto: any) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const userRole = await this.rolesService.findByName('user');

    // Handle firstName and lastName - extract from username if not provided
    const firstName = createUserDto.firstName || createUserDto.username?.split(' ')[0] || 'User';
    const lastName = createUserDto.lastName || createUserDto.username?.split(' ').slice(1).join(' ') || '';

    return this.usersService.create({
      ...createUserDto,
      firstName,
      lastName,
      password: hashedPassword,
      role: userRole,
    });
  }

  async logout(userId: string) {
    return this.usersService.removeRefreshToken(userId);
  }

  async refresh(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role?.name || user.role, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return {
      access_token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role?.name || user.role,
        email: user.email,
      }
    };
  }
}
