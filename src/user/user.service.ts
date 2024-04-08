import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  buildUserResponse,
} from '../model/user.model';
import { UserValidation } from './user.validation';
import * as bcrypt from 'bcrypt';
import { TypedEventEmitter } from '../event-emitter/typed-event-emitter.class';
import { UploadService } from 'src/upload/upload.service';
@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private readonly eventEmitter: TypedEventEmitter,
    private uploadService: UploadService,
  ) {}

  async getProfile(userId: string): Promise<UserResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    return buildUserResponse(user);
  }

  async updateUser(
    userId: string,
    request: UpdateUserRequest,
    file: Express.Multer.File,
  ): Promise<UserResponse> {
    this.logger.debug(
      `UserService.updateUser(${JSON.stringify(userId)} ${JSON.stringify(request)})`,
    );

    const updateRequest: UpdateUserRequest = this.validationService.validate(
      UserValidation.UPDATE,
      request,
    );
    const user = await this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    if (file) {
      const imageUrl = await this.uploadService.uploadImageProfileToS3(file);
      if (imageUrl) {
        updateRequest.file = imageUrl;
      }
      await this.uploadService.deleteFromS3(user.photo);
    }

    if (updateRequest.full_name) {
      user.full_name = updateRequest.full_name;
    }

    if (updateRequest.username) {
      const totalUserWithSameUsername = await this.prismaService.user.count({
        where: {
          username: updateRequest.username,
        },
      });
      if (totalUserWithSameUsername != 0) {
        throw new HttpException('Username already exists', 409);
      }
      user.username = updateRequest.username;
    }

    if (updateRequest.password) {
      user.password = await bcrypt.hash(updateRequest.password, 10);
    }

    const updatedUser = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        full_name: updateRequest.full_name,
        password: updateRequest.password,
        username: updateRequest.username,
        photo: updateRequest.file,
        role: updateRequest.role,
      },
    });

    return buildUserResponse(updatedUser);
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.prismaService.user.delete({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }
  }

  async createUser(request: CreateUserRequest): Promise<UserResponse> {
    this.logger.debug(`UserService.createUser(${JSON.stringify(request)})`);

    const createUserRequest: CreateUserRequest =
      this.validationService.validate(UserValidation.CREATE, request);

    const totalUserWithSameEmail = await this.prismaService.user.count({
      where: {
        email: createUserRequest.email,
      },
    });

    this.logger.debug(
      `UserService.createUser(${JSON.stringify(totalUserWithSameEmail)})`,
    );
    if (totalUserWithSameEmail != 0) {
      throw new HttpException('Email already exists', 409);
    }

    const totalUserWithSameUsername = await this.prismaService.user.count({
      where: {
        username: createUserRequest.username,
      },
    });

    if (totalUserWithSameUsername != 0) {
      throw new HttpException('Username already exists', 409);
    }

    createUserRequest.password = await bcrypt.hash(
      createUserRequest.password,
      10,
    );

    const user = await this.prismaService.user.create({
      data: {
        email: createUserRequest.email,
        password: createUserRequest.password,
        full_name: createUserRequest.full_name,
        username: createUserRequest.username,
        role: createUserRequest.role,
        verified: true,
      },
    });

    this.eventEmitter.emit('user.welcome', {
      name: user.full_name,
      email: user.email,
    });

    return buildUserResponse(user);
  }
}
