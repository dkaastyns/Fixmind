import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/roles.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from '../users/dto/user.dto';
import { AuthService } from './services/auth.service';
import { UsersRepository } from '../users/repositories/users.repository';

const REFRESH_COOKIE = 'fixmind_refresh';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.register(dto);
    const result = await this.authService.login(dto.email, dto.password, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    this.setRefreshCookie(res, result.refreshToken);

    return {
      message: 'Registration successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      },
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto.email, dto.password, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    this.setRefreshCookie(res, result.refreshToken);

    return {
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      },
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token =
      req.cookies?.[REFRESH_COOKIE] ??
      (req.body as { refreshToken?: string })?.refreshToken;

    if (!token) {
      throw new ForbiddenException('Refresh token missing');
    }

    const result = await this.authService.refresh(token);
    this.setRefreshCookie(res, result.refreshToken);

    return {
      message: 'Token refreshed',
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
      },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      await this.authService.logout(token);
    }

    res.clearCookie(REFRESH_COOKIE);
    return { message: 'Logged out', data: { loggedOut: true } };
  }

  @Get('me')
  async me(@CurrentUser() user: AuthUser) {
    const row = await this.usersRepository.findById(user.id);
    if (!row) {
      throw new ForbiddenException('User not found');
    }

    return {
      message: 'Profile retrieved',
      data: this.authService.toPublicUser(row),
    };
  }

  private setRefreshCookie(res: Response, token: string) {
    const isProd = this.config.get('NODE_ENV') === 'production';

    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });
  }
}
