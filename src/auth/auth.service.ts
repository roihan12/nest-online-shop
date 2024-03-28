import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  RegisterUserRequest,
  UserResponse,
  status_type,
  user_role,
} from '../model/user.model';
import { Logger } from 'winston';
import { AuthValidation } from './auth.validation';
import * as bcrypt from 'bcrypt';

import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}
  async register(request: RegisterUserRequest): Promise<UserResponse> {
    this.logger.info(`Register new user ${JSON.stringify(request)}`);
    const registerRequest: RegisterUserRequest =
      this.validationService.validate(AuthValidation.REGISTER, request);

    const totalUserWithSameEmail = await this.prismaService.user.count({
      where: {
        email: registerRequest.email,
      },
    });

    if (totalUserWithSameEmail != 0) {
      throw new HttpException('Email already exists', 409);
    }

    const totalUserWithSameUsername = await this.prismaService.user.count({
      where: {
        username: registerRequest.username,
      },
    });

    if (totalUserWithSameUsername != 0) {
      throw new HttpException('Username already exists', 409);
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email: registerRequest.email,
        password: registerRequest.password,
        full_name: registerRequest.full_name,
        username: registerRequest.username,
      },
    });

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role as user_role,
      username: user.username,
      photo: user.photo,
      status: user.status as status_type,
      verified: user.verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
