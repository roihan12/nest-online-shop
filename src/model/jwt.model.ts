import { user_role } from './user.model';

export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export type JwtPayload = {
  userId: string;
  email: string;
  role: user_role;
  sub: number;
};

export type JwtPayloadWithRefreshToken = JwtPayload & { refreshToken: string };
