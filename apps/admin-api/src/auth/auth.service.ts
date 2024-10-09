import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from '@/auth/dto/auth.dto';
import { UsersService } from '@/users/users.service';
import { PrismaService } from '@/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async signIn(data: AuthDto) {
    // Check if user exists
    const user = await this.usersService.findAdminByEmail(data.email);
    if (!user) {
      this.logger.warn(
        `Failed login attempt for non-existent admin: ${data.email}`,
      );
      throw new BadRequestException('User does not exist');
    }

    const passwordMatches = bcrypt.compareSync(data.password, user.password);
    if (!passwordMatches) {
      this.logger.warn(`Failed login attempt for admin: ${data.email}`);
      throw new BadRequestException('Password is incorrect');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    this.logger.log(`Successful login for admin: ${data.email}`);
    return tokens;
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findAdminById(userId);
    if (!user || !user.refreshToken) {
      this.logger.warn(`Refresh token attempt failed for userId: ${userId}`);
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatches = bcrypt.compareSync(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      this.logger.warn(`Invalid refresh token for userId: ${userId}`);
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    this.logger.log(`Tokens refreshed for userId: ${userId}`);
    return tokens;
  }

  async logout(userId: number) {
    this.logger.log(`Logging out userId: ${userId}`);
    return this.usersService.updateRefreshToken(userId, null);
  }

  async createImpersonationToken(
    adminUserId: number,
    userId: number,
  ): Promise<{ token: string; redirectUrl: string }> {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    await this.prisma.impersonationToken.create({
      data: {
        token,
        adminUserId,
        targetUserId: userId,
        expiresAt,
      },
    });

    const redirectUrl = `${this.getAppUrl()}/impersonate?token=${token}`;
    this.logger.log(
      `Impersonation token created for admin ${adminUserId} to impersonate user ${userId}`,
    );
    return { token, redirectUrl };
  }

  hashData(data: string): string {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(data, salt);
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = this.hashData(refreshToken);
    await this.usersService.updateRefreshToken(userId, hashedRefreshToken);
  }

  async getTokens(userId: number, email: string) {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '10m',
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, email },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  getAppUrl(): string {
    const appUrl = this.configService.get<string>('APP_URL');
    if (!appUrl) {
      throw new Error('APP_URL is not set');
    }
    console.log('APP_URL:', appUrl);
    return appUrl;
  }
}
