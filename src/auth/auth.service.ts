import {
  ForgotPasswordRequest,
  GoogleUserRequest,
  ResetPasswordRequest,
} from './../model/user.model';
import {
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
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
import * as crypto from 'crypto';
import { ValidationService } from '../common/validation.service';
import { PrismaService } from '../common/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from 'src/model/jwt.model';
import { TypedEventEmitter } from '../event-emitter/typed-event-emitter.class';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private readonly eventEmitter: TypedEventEmitter,
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
    const verifyCode = crypto.randomBytes(32).toString('hex');
    const verificationCode = crypto
      .createHash('sha256')
      .update(verifyCode)
      .digest('hex');

    const user = await this.prismaService.user.create({
      data: {
        email: registerRequest.email,
        password: registerRequest.password,
        full_name: registerRequest.full_name,
        username: registerRequest.username,
        verification_code: verificationCode,
      },
    });
    const redirectUrl = `${this.config.get<string>('REDIRECT_URL')}/api/v1/auth/verifyemail/${verifyCode}`;

    this.eventEmitter.emit('user.welcome', {
      name: user.full_name,
      email: user.email,
    });

    this.eventEmitter.emit('user.verify-email', {
      name: user.full_name,
      email: user.email,
      link: redirectUrl,
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
  async verifyEmail(verifyCode: string): Promise<UserResponse> {
    const verificationCode = crypto
      .createHash('sha256')
      .update(verifyCode)
      .digest('hex');

    const user = await this.prismaService.user.update({
      where: {
        verification_code: verificationCode,
      },
      data: {
        verified: true,
        verification_code: null,
      },
    });

    if (!user) {
      throw new HttpException('Please register your email again', 404);
    }

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
      throw new UnauthorizedException('Please verify your email');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserRequest.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email or password is invalid');
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

  async loginGoogle(request: GoogleUserRequest): Promise<UserResponse> {
    this.logger.info(`AuthService.loginGoogle(${JSON.stringify(request)})`);

    const googleUserRequest: GoogleUserRequest =
      this.validationService.validate(AuthValidation.GOOGLE, request);

    if (!googleUserRequest.verified_email) {
      throw new UnauthorizedException('Google account not verified');
    }

    try {
      let user = await this.prismaService.user.findUnique({
        where: { email: googleUserRequest.email },
      });

      const tokens = await this.getTokens(
        user?.id,
        user?.email,
        user?.role as user_role,
      );

      if (!user) {
        user = await this.createUserFromGoogle(googleUserRequest);
      }

      await this.updatedRefreshTokenHash(user.id, tokens.refresh_token);

      return this.buildUserResponse(user, tokens);
    } catch (error) {
      throw new InternalServerErrorException('Failed to login with Google.');
    }
  }

  private async createUserFromGoogle(
    googleUserRequest: GoogleUserRequest,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(googleUserRequest.provider, 10);
    const newUser = await this.prismaService.user.create({
      data: {
        email: googleUserRequest.email,
        full_name: googleUserRequest.displayName,
        photo: googleUserRequest.picture,
        username: googleUserRequest.family_name,
        verified: true,
        password: hashedPassword,
        provider: googleUserRequest.provider,
      },
    });

    return newUser;
  }

  async findUserById(id: string): Promise<UserResponse> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      throw new HttpException('User not found', 404);
    }
    return this.buildUserResponse(user, null);
  }
  async findUserByEmail(email: string): Promise<UserResponse> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Please Login Again');
    }
    return this.buildUserResponse(user, null);
  }
  private async buildUserResponse(
    user: User,
    tokens: Tokens,
  ): Promise<UserResponse> {
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

  async forgotPassword(request: ForgotPasswordRequest): Promise<boolean> {
    const forgotPasswordRequest: ForgotPasswordRequest =
      this.validationService.validate(AuthValidation.FORGOT_PASSWORD, request);

    const user = await this.prismaService.user.findUnique({
      where: {
        email: forgotPasswordRequest.email,
      },
    });

    if (!user) {
      throw new HttpException('Please verify your email', 401);
    }

    if (!user.verified) {
      throw new HttpException('Please verify your email', 401);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        password_reset_token: passwordResetToken,
        password_reset_At: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const url = `${this.config.get<string>('REDIRECT_URL')}/api/v1/auth/resetpassword/${resetToken}`;

    this.eventEmitter.emit('user.reset-password', {
      name: user.full_name,
      email: user.email,
      link: url,
    });

    return true;
  }
  async resetPassword(
    resetToken: string,
    request: ResetPasswordRequest,
  ): Promise<UserResponse> {
    const resetPasswordRequest: ResetPasswordRequest =
      this.validationService.validate(AuthValidation.RESET_PASSWORD, request);
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await this.prismaService.user.findFirst({
      where: {
        password_reset_token: passwordResetToken,
        password_reset_At: {
          gt: new Date(), // Menggunakan operator `gt` untuk mencari nilai yang lebih besar dari waktu sekarang
        },
      },
    });
    if (!user) {
      throw new HttpException('Invalid token or token has expired', 403);
    }

    const hashedPassword = await bcrypt.hash(resetPasswordRequest.password, 10);
    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        password_reset_token: null,
        password_reset_At: null,
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
