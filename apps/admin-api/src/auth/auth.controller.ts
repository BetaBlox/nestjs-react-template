import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Res,
  ParseIntPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '@/auth/auth.service';
import { AuthDto } from '@/auth/dto/auth.dto';
import { RefreshTokenGuard } from '@/common/guards/refreshToken.guard';
import { UsersService } from '@/users/users.service';
import { AccessTokenGuard } from '@/common/guards/accessToken.guard';
import { Logger } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('login')
  async signin(@Body() data: AuthDto) {
    this.logger.log(`Admin login attempt for email: ${data.email}`);
    return this.authService.signIn(data);
  }

  @Get('logout')
  logout(@Req() req: Request) {
    const userId = req.user && req.user['sub'];

    if (userId) {
      this.logger.log(`Admin logout for userId: ${userId}`);
      this.authService.logout(userId);
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: Request) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    this.logger.log(`Refreshing tokens for admin userId: ${userId}`);
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  async getProfile(@Req() req: Request) {
    this.logger.log(`Fetching admin profile for userId: ${req.user['sub']}`);
    const user = await this.userService.findAdminByEmail(req.user['email']);
    const { password, refreshToken, ...data } = user;
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Post('impersonate')
  async impersonate(
    @Body('userId', ParseIntPipe) userId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const adminUserId = req.user['sub'];
    this.logger.log(`Admin ${adminUserId} is impersonating user ${userId}`);

    const { token, redirectUrl } =
      await this.authService.createImpersonationToken(adminUserId, userId);

    // Instead of setting cookies, we'll return the redirect URL with the token
    return res.json({ redirectUrl });
  }
}
