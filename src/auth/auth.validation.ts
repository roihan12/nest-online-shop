import { ZodType, z } from 'zod';

export class AuthValidation {
  static readonly REGISTER: ZodType = z
    .object({
      full_name: z.string().min(1).max(100),
      username: z.string().min(1).max(100),
      email: z.string().email(),
      password: z
        .string({ required_error: 'Password is required' })
        .min(8, { message: 'Password must be more than 8 characters' })
        .max(32, { message: 'Password must be less than 32 characters' }),
      confirmPassword: z.string({
        required_error: 'Please confirm your password',
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().email(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, { message: 'Password must be more than 8 characters' })
      .max(32, { message: 'Password must be less than 32 characters' }),
  });
}
