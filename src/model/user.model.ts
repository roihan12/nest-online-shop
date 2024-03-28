export class RegisterUserRequest {
  full_name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export class LoginUserRequest {
  email: string;
  password: string;
}

export enum user_role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  OWNER = 'OWNER',
}

export enum status_type {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class UserResponse {
  id: string;
  username: string;
  role: user_role;
  full_name: string;
  email: string;
  photo?: string | null;
  verified?: boolean | null;
  status?: status_type | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}
