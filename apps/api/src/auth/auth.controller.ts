import { Body, Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '@/auth/auth.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { AuthDto } from '@/auth/dto/auth.dto';
import { AccessTokenGuard } from '@/common/guards/accessToken.guard';
import { RefreshTokenGuard } from '@/common/guards/refreshToken.guard';
import { UsersService } from '@/users/users.service';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import { ChangePasswordDto } from '@/auth/dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('login')
  signin(@Body() data: AuthDto) {
    return this.authService.signIn(data);
  }

  @Get('logout')
  logout(@Req() req: Request) {
    const userId = req.user && req.user['sub'];

    if (userId) {
      this.authService.logout(userId);
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: Request) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    const user = await this.userService.findByEmail(req.user['email']);
    const { password, refreshToken, ...data } = user;
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Post('profile')
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const { password, refreshToken, ...user } = await this.userService.update(
      req.user['sub'],
      updateUserDto,
    );
    return user;
  }

  @UseGuards(AccessTokenGuard)
  @Post('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const user = await this.userService.findByEmail(req.user['email']);
    await this.authService.changePassword(user.id, changePasswordDto.password);
  }

  @Post('exchange-impersonation-token')
  async exchangeImpersonationToken(@Body() body: { token: string }) {
    return this.authService.exchangeImpersonationToken(body.token);
  }
}
