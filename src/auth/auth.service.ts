import {
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  LoginUserRequest,
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
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from 'src/model/jwt.model';

@Injectable()
export class AuthService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
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

  async login(request: LoginUserRequest): Promise<UserResponse> {
    this.logger.info(`AuthService.login(${JSON.stringify(request)})`);
    const loginUserRequest: LoginUserRequest = this.validationService.validate(
      AuthValidation.LOGIN,
      request,
    );

    const user = await this.prismaService.user.findUnique({
      where: {
        email: loginUserRequest.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email or password is invalid');
    }

    if (user.verified !== true) {
      throw new HttpException('Please verify your email', 401);
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserRequest.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Email or password is invalid', 401);
    }

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role as user_role,
    );

    await this.updatedRefreshTokenHash(user.id, tokens.refresh_token);

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
      ...tokens,
    };
  }

  async logout(userId: string): Promise<boolean> {
    await this.prismaService.user.updateMany({
      where: {
        id: userId,
        refresh_token: {
          not: null,
        },
      },
      data: {
        refresh_token: null,
      },
    });
    return true;
  }
  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.refresh_token) {
      throw new ForbiddenException('Access Denied');
    }
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refresh_token,
    );

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role as user_role,
    );
    await this.updatedRefreshTokenHash(user.id, tokens.refresh_token);
    return tokens;
  }

  async updatedRefreshTokenHash(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        refresh_token: hashedRefreshToken,
      },
    });
  }
  async getTokens(
    userId: string,
    email: string,
    role: user_role,
  ): Promise<Tokens> {
    const [aT, rT] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId,
          email,
          role,
        },
        {
          secret: this.config.get<string>('ACCESSTOKENSECRET'),
          expiresIn: 60 * 15,
        },
      ),
      this.jwtService.signAsync(
        {
          userId,
          email,
          role,
        },
        {
          secret: this.config.get<string>('REFRESHTOKENSECRET'),
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);

    return {
      access_token: aT,
      refresh_token: rT,
    };
  }
}
