import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Render,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { WebResponse } from '../model/web.model';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UserResponse,
} from '../model/user.model';
import { AccessTokenGuard } from './guard/accessToken.guard';
import { RefreshTokenGuard } from './guard/refreshToken.guard';
import { GetCurrentUser } from './decorator/get-current-user.decorator';
import { GetCurrentUserId } from './decorator/get-current-user-id.decorator';
import { Public } from './decorator/public..decorator';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() request: RegisterUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const response = await this.authService.register(request);
    return {
      status: true,
      message: 'Register success',
      data: response,
    };
  }

  @Public()
  @Get('/verifyemail/:verificationCode')
  @HttpCode(HttpStatus.OK)
  @Render('success-register')
  async verifyEmail(
    @Param('verificationCode') verificationCode: string,
  ): Promise<object> {
    const response = await this.authService.verifyEmail(verificationCode);
    return { name: response.full_name };
  }

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() request: LoginUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const response = await this.authService.login(request);
    return {
      status: true,
      message: 'Login success',
      data: response,
    };
  }

  @UseGuards(AccessTokenGuard)
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetCurrentUserId() userId: string) {
    await this.authService.logout(userId);
    return {
      status: true,
      message: 'Logout success',
      data: null,
    };
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ) {
    const response = await this.authService.refreshToken(userId, refreshToken);
    return {
      status: true,
      message: 'Refresh token success',
      data: response,
    };
  }
}
