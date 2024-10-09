import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { AuthDto } from '@/auth/dto/auth.dto';
import { UsersService } from '@/users/users.service';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<any> {
    // Check if user exists
    const userExists = await this.usersService.findByEmail(createUserDto.email);
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const hash = await this.hashData(createUserDto.password);
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hash,
    });
    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    return tokens;
  }

  async signIn(data: AuthDto) {
    const email = data.email.toLocaleLowerCase();
    // Check if user exists
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    const passwordMatches = bcrypt.compareSync(data.password, user.password);
    if (!passwordMatches) {
      throw new BadRequestException('Password is incorrect');
    }

    const tokens = await this.getTokens(user.id, email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatches = bcrypt.compareSync(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: number) {
    return this.usersService.updateRefreshToken(userId, null);
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

  async changePassword(userId: number, password: string): Promise<void> {
    const hash = this.hashData(password);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hash,
      },
    });
  }

  async exchangeImpersonationToken(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const impersonationToken = await this.prisma.impersonationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!impersonationToken || impersonationToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired impersonation token');
    }

    const payload = {
      sub: impersonationToken.user.id,
      email: impersonationToken.user.email,
      isImpersonated: true,
      impersonatedBy: impersonationToken.adminUserId,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '10m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7h',
    });

    await this.updateRefreshToken(impersonationToken.adminUserId, refreshToken);

    // Delete the used token
    await this.prisma.impersonationToken.delete({
      where: { id: impersonationToken.id },
    });

    return { accessToken, refreshToken };
  }
}
