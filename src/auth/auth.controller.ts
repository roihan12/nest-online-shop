import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  // Redirect,
  Render,
  Req,
  // Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { WebResponse } from '../model/web.model';
import {
  ForgotPasswordRequest,
  LoginUserRequest,
  RegisterUserRequest,
  ResetPasswordRequest,
  UserResponse,
} from '../model/user.model';
import { AccessTokenGuard } from './guard/accessToken.guard';
import { RefreshTokenGuard } from './guard/refreshToken.guard';
import { GetCurrentUser } from './decorator/get-current-user.decorator';
import { GetCurrentUserId } from './decorator/get-current-user-id.decorator';
import { Public } from './decorator/public..decorator';
import { GoogleAuthGuard } from './guard/google.guard';
// import { Request } from 'express';

@Controller('/auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private authService: AuthService) {}
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
  @Post('/forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() request: ForgotPasswordRequest,
  ): Promise<WebResponse<UserResponse>> {
    await this.authService.forgotPassword(request);
    return {
      status: true,
      message: 'Forgot password success',
      data: null,
    };
  }

  @Public()
  @Patch('/resetpassword/:resetToken')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('resetToken') resetToken: string,
    @Body() request: ResetPasswordRequest,
  ): Promise<WebResponse<UserResponse>> {
    const response = await this.authService.resetPassword(resetToken, request);
    return {
      status: true,
      message: 'Reset password success',
      data: response,
    };
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

  @Public()
  @Get('/google/login')
  @UseGuards(GoogleAuthGuard)
  async loginGoogle() {
    return {
      msg: 'Google auth',
    };
  }

  @Public()
  @Get('/google/redirect')
  @UseGuards(GoogleAuthGuard)
  // @Redirect('http://localhost:3000/api/v1/auth/status', 301)
  async googleRedirect(@Req() req): Promise<WebResponse<UserResponse>> {
    const response = await this.authService.loginGoogle(req.user);
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
  @Public()
  @Get('status')
  async user(@Req() request) {
    console.log(request.user);
    if (request.user) {
      return { msg: 'Authenticated' };
    } else {
      return { msg: 'Not Authenticated' };
    }
  }
}
