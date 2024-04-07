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
  Render,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiCreateResponse,
  ApiSucessResponse,
  BadRequestResponse,
  InternalServerErrorResponse,
  UnauthorizedResponse,
  WebResponse,
} from '../model/web.model';
import {
  ForgotPasswordRequest,
  LoginUserRequest,
  RegisterUserRequest,
  ResetPasswordRequest,
  TokensResponse,
  UserResponse,
} from '../model/user.model';
import { AccessTokenGuard } from './guard/accessToken.guard';
import { RefreshTokenGuard } from './guard/refreshToken.guard';
import { GetCurrentUser } from './decorator/get-current-user.decorator';
import { GetCurrentUserId } from './decorator/get-current-user-id.decorator';
import { Public } from './decorator/public..decorator';
import { GoogleAuthGuard } from './guard/google.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(@Inject('AUTH_SERVICE') private authService: AuthService) {}
  @Public()
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request',
    type: BadRequestResponse,
  })
  @ApiCreateResponse(UserResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiBody({
    type: RegisterUserRequest,
    description: 'Request body to register user',
  })
  @ApiOperation({ summary: 'Register User' })
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
  @ApiOperation({ summary: 'Verify Email' })
  async verifyEmail(
    @Param('verificationCode') verificationCode: string,
  ): Promise<object> {
    const response = await this.authService.verifyEmail(verificationCode);
    return { name: response.full_name };
  }

  @Public()
  @Post('/forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request',
    type: BadRequestResponse,
  })
  @ApiOkResponse({
    description: 'Success response forgot password',
    type: WebResponse,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiBody({
    type: ForgotPasswordRequest,
    description: 'Request body for forgot password',
  })
  @ApiOperation({ summary: 'Forgot password' })
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
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request',
    type: BadRequestResponse,
  })
  @ApiSucessResponse(UserResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiBody({
    type: ForgotPasswordRequest,
    description: 'Request body for reset password',
  })
  @ApiOperation({ summary: 'Reset password' })
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
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request',
    type: BadRequestResponse,
  })
  @ApiSucessResponse(UserResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiBody({
    type: LoginUserRequest,
    description: 'Request body for login',
  })
  @ApiOperation({ summary: 'Login user' })
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
  @ApiOperation({ summary: 'Login with google' })
  @UseGuards(GoogleAuthGuard)
  async loginGoogle() {
    return {
      msg: 'Google auth',
    };
  }

  @Public()
  @Get('/google/redirect')
  @ApiOperation({ summary: 'Login with google redirect' })
  @UseGuards(GoogleAuthGuard)
  async googleRedirect(@Req() req): Promise<WebResponse<UserResponse>> {
    const response = await this.authService.loginGoogle(req.user);
    return {
      status: true,
      message: 'Login success',
      data: response,
    };
  }
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized',
    type: UnauthorizedResponse,
  })
  @ApiOkResponse({
    description: 'Success response logout',
    type: WebResponse,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiOperation({ summary: 'Logout' })
  async logout(@GetCurrentUserId() userId: string) {
    await this.authService.logout(userId);
    return {
      status: true,
      message: 'Logout success',
      data: null,
    };
  }
  @ApiBearerAuth()
  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request',
    type: BadRequestResponse,
  })
  @ApiSucessResponse(TokensResponse)
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Internal Server error',
    type: InternalServerErrorResponse,
  })
  @ApiOperation({ summary: 'Refresh token' })
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
  @ApiOperation({ summary: 'Get status google login' })
  async user(@Req() request) {
    if (request.user) {
      return { msg: 'Authenticated' };
    } else {
      return { msg: 'Not Authenticated' };
    }
  }
}
