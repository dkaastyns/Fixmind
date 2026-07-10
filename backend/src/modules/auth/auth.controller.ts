import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/roles.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from '../users/dto/user.dto';
import { UpdateProfileDto, ChangePasswordDto } from './dto/profile.dto';
import { AuthService } from './services/auth.service';
import { UsersRepository } from '../users/repositories/users.repository';
import { UsersService } from '../users/services/users.service';
import { CloudinaryService } from '../cloudinary/services/cloudinary.service';
import { Throttle } from '@nestjs/throttler';

const REFRESH_COOKIE = 'fixmind_refresh';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly config: ConfigService,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
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

  @Throttle({ default: { limit: 10, ttl: 60000 } })
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

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const updated = await this.usersService.update(user.id, {
      fullName: dto.fullName,
      phone: dto.phone,
    });
    return {
      message: 'Profile updated successfully',
      data: updated,
    };
  }

  @Post('profile/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: AuthUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // 1. Upload to cloudinary
    const result = await this.cloudinaryService.uploadImage(file, 'fixmind/avatars');

    // 2. Update user database
    const updated = await this.usersService.update(user.id, {
      avatarUrl: result.secure_url,
    });

    return {
      message: 'Avatar updated successfully',
      data: updated,
    };
  }

  @Delete('profile/avatar')
  async deleteAvatar(@CurrentUser() user: AuthUser) {
    const updated = await this.usersService.update(user.id, {
      avatarUrl: null,
    });
    return {
      message: 'Avatar removed successfully',
      data: updated,
    };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    const dbUser = await this.usersRepository.findById(user.id);
    if (!dbUser) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(dto.oldPassword, dbUser.password_hash);
    if (!isValid) {
      throw new BadRequestException('Incorrect old password');
    }

    await this.usersService.update(user.id, {
      password: dto.newPassword,
    });

    return {
      message: 'Password changed successfully',
    };
  }

  private setRefreshCookie(res: Response, token: string) {
    const isProd = this.config.get('NODE_ENV') === 'production';

    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth',
    });
  }
}
