import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Tokens } from './jwt.model';
export enum user_role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  OWNER = 'OWNER',
}

export enum status_type {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}
export class RegisterUserRequest {
  @ApiProperty({
    example: 'John Doe',
    required: true,
  })
  full_name: string;

  @ApiProperty({
    example: 'JohnDoe',
    required: true,
  })
  username: string;

  @ApiProperty({
    example: 'jhondoe@my.com',
    required: true,
  })
  email: string;

  @ApiProperty({
    example: 'password',
    required: true,
  })
  password: string;

  @ApiProperty({
    example: 'password',
    required: true,
  })
  confirmPassword?: string;
}

export class CreateUserRequest {
  @ApiProperty({
    example: 'John Doe',
    required: true,
  })
  full_name: string;

  @ApiProperty({
    example: 'JohnDoe',
    required: true,
  })
  username: string;

  @ApiProperty({
    example: 'jhondoe@my.com',
    required: true,
  })
  email: string;

  @ApiProperty({ enum: ['ADMIN', 'OWNER', 'USER'], required: true })
  role: user_role;

  @ApiProperty({
    example: 'password',
    required: true,
  })
  password: string;

  @ApiProperty({
    example: 'password',
    required: true,
  })
  confirmPassword?: string;
}

export class UpdateUserRequest {
  @ApiProperty({
    example: 'John Doe',
    required: false,
  })
  full_name?: string;

  @ApiProperty({
    example: 'JohnDoe',
    required: false,
  })
  username?: string;

  @ApiProperty({
    example: 'password',
    required: false,
  })
  password?: string;

  @ApiProperty({ enum: ['ADMIN', 'USER'], required: false })
  role?: user_role;

  @ApiProperty({
    example: 'password',
    required: false,
  })
  confirmPassword?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  file?: any;
}
export class UpdateUserByOwnerRequest {
  @ApiProperty({
    example: 'John Doe',
    required: false,
  })
  full_name?: string;

  @ApiProperty({
    example: 'JohnDoe',
    required: false,
  })
  username?: string;

  @ApiProperty({
    example: 'password',
    required: false,
  })
  password?: string;

  @ApiProperty({ enum: ['ADMIN', 'USER'], required: false })
  role?: user_role;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'], required: false })
  status?: status_type;

  @ApiProperty({
    example: 'password',
    required: false,
  })
  confirmPassword?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  file?: any;
}

export class GoogleUserRequest {
  displayName: string;
  family_name: string;
  email: string;
  verified_email: boolean;
  picture: string;
  provider: string;
}

export class LoginUserRequest {
  @ApiProperty({
    example: 'jhondoe@my.com',
    required: true,
  })
  email: string;

  @ApiProperty({
    example: 'password',
    required: true,
  })
  password: string;
}
export class ForgotPasswordRequest {
  @ApiProperty({
    example: 'jhondoe@my.com',
    required: true,
  })
  email: string;
}

export class ResetPasswordRequest {
  @ApiProperty({
    example: 'password',
    required: true,
  })
  password: string;
  @ApiProperty({
    example: 'password',
    required: true,
  })
  confirmPassword: string;
}

export class UserResponse {
  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  id: string;
  @ApiProperty({
    example: 'johndoe',
  })
  username: string;
  @ApiProperty({
    example: '0d4f147c-eb4c-4f81-9e60-0bd0381a12e3',
  })
  @ApiProperty({
    example: 'USER',
  })
  role: user_role;
  @ApiProperty({
    example: 'John Doe',
    required: true,
  })
  full_name: string;
  @ApiProperty({
    example: 'johndoe@gmail.com',
  })
  email: string;
  @ApiProperty({
    example:
      'https://artlogic-res.cloudinary.com/w_1400,h_1400,c_/image/10/flowers-cork-street-50-years-2020-14-of-17-.jpg',
  })
  photo?: string | null;
  @ApiProperty({
    example: true,
  })
  verified?: boolean | null;
  @ApiProperty({
    example: 'ACTIVE',
  })
  status?: status_type | null;
  @ApiProperty({
    example: '2021-09-01T00:00:00.000Z',
  })
  created_at?: Date | null;
  @ApiProperty({
    example: '2021-09-01T00:00:00.000Z',
  })
  updated_at?: Date | null;
}

export class TokensResponse {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  access_token: string;
  @ApiProperty({
    example:
      'eyJFADrrikdzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_DDFDeed',
  })
  refresh_token: string;
}

export function buildUserResponse(user: User, tokens?: Tokens): UserResponse {
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
