import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { WebResponse } from '../model/web.model';
import { RegisterUserRequest, UserResponse } from '../model/user.model';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/')
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
}
